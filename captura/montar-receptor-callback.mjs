#!/usr/bin/env node
/**
 * montar-receptor-callback.mjs — o endereço público que recebe os callbacks
 * ---------------------------------------------------------------------------
 * POR QUE ESTE ARQUIVO EXISTE
 *
 * O Bloco C do orçamento valida o ciclo assíncrono do Escavador: nós pedimos
 * algo, a API responde "aceitei", e o resultado chega depois — por webhook.
 * Sem um endereço público que receba esse webhook, o Bloco C não acontece.
 *
 * A instância n8n do projeto já é pública. Este script cria nela um fluxo
 * mínimo cuja única função é receber, conferir e guardar. Ele não decide nada,
 * não chama a API de volta e não fala com ninguém.
 *
 * ISTO NÃO É O RECEPTOR DE PRODUÇÃO. O de produção está especificado na §8 da
 * Spec (fila, idempotência por event_id, reprocessamento). Este aqui é o
 * mínimo honesto para responder uma pergunta de contrato: o que o Escavador
 * manda, exatamente, e com quais cabeçalhos.
 *
 * DUAS REGRAS DO PROJETO APARECEM AQUI
 *
 *   Regra 4 — conteúdo externo é hostil. O corpo do callback é registrado,
 *     nunca interpretado, e jamais alimenta um agente com poder de ação
 *   Regra 5 — negar por padrão. Sem o token de validação do Escavador
 *     configurado, este script se recusa a publicar
 *
 * Uso:
 *   node captura/montar-receptor-callback.mjs              # escreve o JSON
 *   node captura/montar-receptor-callback.mjs --publicar   # envia ao n8n
 *   node captura/montar-receptor-callback.mjs --publicar --ativar
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

const publicar = process.argv.includes('--publicar');
const ativar = process.argv.includes('--ativar');
const semValidacao = process.argv.includes('--sem-validacao');

const NOME = '[LEX] Receptor de callback do Escavador';
const CAMINHO = 'escavador-callback';
const SAIDA = path.join(AQUI, 'receptor-callback.local.json');

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', rub: '\x1b[31m', cin: '\x1b[90m' };
const ok = (m) => console.log(`${cor.ver}  OK  ${cor.off} ${m}`);
const aviso = (m) => console.log(`${cor.ama} AVISO${cor.off} ${m}`);
const info = (m) => console.log(`${cor.cin}      ${m}${cor.off}`);
function morrer(m) {
  console.log(`${cor.rub} ERRO ${cor.off} ${m}\n`);
  process.exit(1);
}

// --------------------------------------------------------------------------
// O token de validação do callback
//
// O painel do Escavador gera um token e manda usá-lo para conferir o cabeçalho
// Authorization dos callbacks recebidos (achados §9.2). É segredo compartilhado,
// não assinatura — então ele nunca entra no repositório.
// --------------------------------------------------------------------------
function decodificar(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xFE) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) return buf.subarray(3).toString('utf8');
  return buf.toString('utf8');
}

const arqToken = path.join(AQUI, 'callback-token.local');
let tokenEsperado = null;
if (fs.existsSync(arqToken)) {
  tokenEsperado = decodificar(fs.readFileSync(arqToken)).replace(/\s+/g, '') || null;
}

// A frase de aviso virou trava.
//
// A mensagem logo abaixo sempre disse "só para ver o JSON, nunca para publicar
// em endereço público" — e isso era uma FRASE, não um impedimento. Nada barrava
// `--sem-validacao --publicar`, e o resultado seria um receptor no ar aceitando
// entrega de qualquer origem, sem conferir o token do Escavador. O caminho
// perigoso não pode depender de alguém ter lido o parágrafo certo.
if (semValidacao && publicar) {
  console.log(`\n${cor.neg}Receptor de callback do Escavador${cor.off}\n`);
  morrer(
    '--sem-validacao nao combina com --publicar.\n\n' +
    '      Sem validacao o receptor aceita QUALQUER entrega, de qualquer origem.\n' +
    '      Isso serve para inspecionar o JSON gerado; nunca para deixar no ar.\n\n' +
    '      Para ver o fluxo sem publicar:  --sem-validacao\n' +
    '      Para publicar de verdade:       grave o token e rode sem a bandeira'
  );
}

if (!tokenEsperado && !semValidacao) {
  console.log(`\n${cor.neg}Receptor de callback do Escavador${cor.off}\n`);
  morrer(
    'falta o token de validação do callback.\n\n' +
    '      Ele é gerado no painel, em api.escavador.com/callbacks, na mesma tela\n' +
    '      em que se cadastra a URL. Gerar não custa crédito.\n\n' +
    '      Grave com:  node guardar-segredo.mjs captura/callback-token.local\n\n' +
    '      Para montar mesmo sem validação (só para ver o JSON, nunca para\n' +
    '      publicar em endereço público): --sem-validacao'
  );
}

// --------------------------------------------------------------------------
// O fluxo
// --------------------------------------------------------------------------

/** O porteiro. Roda depois do ACK, de propósito: a documentação do Escavador
 *  pede resposta 2xx rápida e processamento assíncrono, e webhook que demora
 *  vira webhook reentregue. Conferir antes de responder inverteria isso.
 *
 *  Ele não bloqueia nada — só carimba o veredito. Quem bloqueia, na produção,
 *  é a fila da §8 da Spec. Aqui o objetivo é registrar o que chegou. */
const porteiro = `
// Conteúdo externo é hostil (Regra 4). Este nó LÊ e CARIMBA. Não interpreta,
// não navega em link recebido, não chama a API de volta.
const esperado = ${JSON.stringify(tokenEsperado)};

const item = $input.first();
const cabecalhos = item.json.headers || {};
const corpo = item.json.body ?? {};

// O Escavador manda o token no cabeçalho Authorization (achados §9.2).
// Aceita tanto o valor cru quanto o formato "Bearer <token>".
const bruto = String(cabecalhos.authorization || cabecalhos.Authorization || '');
const recebido = bruto.replace(/^Bearer\\s+/i, '').trim();

let veredito = 'sem_validacao';
if (esperado) {
  // Comparação que não encurta no primeiro caractere diferente. O tempo de
  // resposta não deve revelar por onde as duas strings divergem — é o mesmo
  // motivo de timingSafeEqual, escrito sem depender de 'crypto' estar
  // disponível dentro do nó Code.
  let diferenca = recebido.length ^ esperado.length;
  for (let i = 0; i < recebido.length; i++) {
    diferenca |= recebido.charCodeAt(i) ^ esperado.charCodeAt(i % esperado.length);
  }
  veredito = diferenca === 0 ? 'autentico' : 'RECUSADO';
}

// O event_id é a chave de idempotência que a própria documentação recomenda.
// Aqui só o registramos; deduplicar é trabalho da fila de produção.
const evento = corpo.event || corpo.evento || null;

return [{
  json: {
    recebido_em: new Date().toISOString(),
    veredito,
    evento,
    tinha_authorization: Boolean(bruto),
    cabecalhos,
    corpo,
  },
}];
`.trim();

const fluxo = {
  name: NOME,
  nodes: [
    {
      parameters: {
        httpMethod: 'POST',
        path: CAMINHO,
        // ACK imediato. A documentação do Escavador é explícita: responder 2xx
        // rápido e processar depois, senão o evento é reentregue.
        responseMode: 'onReceived',
        options: {},
      },
      name: 'Callback do Escavador',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [-220, 300],
      webhookId: CAMINHO,
    },
    {
      parameters: { jsCode: porteiro },
      name: 'Conferir e carimbar',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [40, 300],
    },
  ],
  connections: {
    'Callback do Escavador': { main: [[{ node: 'Conferir e carimbar', type: 'main', index: 0 }]] },
  },
  settings: { executionOrder: 'v1' },
};

fs.writeFileSync(SAIDA, JSON.stringify(fluxo, null, 2) + '\n');

console.log(`\n${cor.neg}Receptor de callback do Escavador${cor.off}\n`);
ok(`fluxo escrito em ${path.relative(RAIZ, SAIDA)}`);
if (tokenEsperado) ok(`validação ligada (token de ${tokenEsperado.length} caracteres, não exibido)`);
else aviso('validação DESLIGADA — só use assim para inspecionar o JSON');

if (!publicar) {
  console.log(`\n${cor.ama}Nada foi enviado ao n8n.${cor.off}`);
  console.log(`Para publicar:  ${cor.neg}node captura/montar-receptor-callback.mjs --publicar --ativar${cor.off}\n`);
  process.exit(0);
}

// --------------------------------------------------------------------------
// Publicação
// --------------------------------------------------------------------------
const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'demo', 'n8n.json'), 'utf8'));
const chaveArq = path.join(RAIZ, 'demo', 'n8n.local');
if (!fs.existsSync(chaveArq)) morrer('falta demo/n8n.local com a chave da API do n8n');
const chave = decodificar(fs.readFileSync(chaveArq)).replace(/\s+/g, '');
const base = cfg.baseUrl.replace(/\/+$/, '');

async function api(caminho, opcoes = {}) {
  const r = await fetch(base + '/api/v1' + caminho, {
    ...opcoes,
    headers: {
      'X-N8N-API-KEY': chave,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(opcoes.headers || {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  const texto = await r.text();
  let corpo; try { corpo = JSON.parse(texto); } catch { corpo = texto; }
  if (!r.ok) {
    const e = new Error(`HTTP ${r.status} em ${caminho}`);
    e.status = r.status; e.corpo = corpo; throw e;
  }
  return corpo;
}

try {
  const existentes = await api('/workflows?limit=250');
  const antigo = (existentes.data || []).find((w) => w.name === NOME);

  let id;
  if (antigo) {
    // O n8n rejeita campos que ele mesmo devolve. Manda só o que se edita.
    await api(`/workflows/${antigo.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: fluxo.name, nodes: fluxo.nodes,
        connections: fluxo.connections, settings: fluxo.settings,
      }),
    });
    id = antigo.id;
    ok(`fluxo atualizado (${id})`);
  } else {
    const criado = await api('/workflows', { method: 'POST', body: JSON.stringify(fluxo) });
    id = criado.id;
    ok(`fluxo criado (${id})`);
  }

  if (ativar) {
    await api(`/workflows/${id}/activate`, { method: 'POST' });
    ok('fluxo ATIVO — o endereço já responde');
  } else {
    aviso('fluxo publicado mas INATIVO. Sem --ativar, o endereço não responde');
  }

  // O endereço do EDITOR não é necessariamente o endereço em que os webhooks
  // atendem. O n8n publica webhook no host de WEBHOOK_URL, e nesta instância
  // ele é outro domínio. Imprimir o host do editor manda cadastrar uma URL que
  // pode responder hoje e parar de responder quando o editor for fechado ao
  // público — e o sintoma seria a vigilância silenciar sem avisar (R-02).
  const baseWebhook = (cfg.webhookBaseUrl || '').replace(/\/+$/, '');
  const url = `${(baseWebhook || base)}/webhook/${CAMINHO}`;

  console.log(`\n${cor.neg}A URL de callback${cor.off}\n`);
  console.log(`  ${cor.neg}${url}${cor.off}\n`);

  if (!baseWebhook) {
    aviso('demo/n8n.json não declara "webhookBaseUrl" — usei o host do editor, que pode não ser o certo');
    info('confira em "Production URL" dentro do nó Webhook no n8n e grave o host lá');
  } else if (baseWebhook !== base) {
    info(`webhook atende em ${baseWebhook}, e o editor fica em ${base} — é esperado nesta instância`);
  }

  info('cadastre-a no painel: api.escavador.com/callbacks — cadastrar não custa crédito');
  console.log('');
  info('confira antes de cadastrar (grátis — chama o seu n8n, não a API do Escavador):');
  console.log(`      curl -X POST ${url} -H "Content-Type: application/json" -d "{}"`);
  info('deve responder {"message":"Workflow was started"}. Um 404 significa que o');
  info('fluxo não está ativo, ou que você copiou a "Test URL" (/webhook-test/),');
  info('que só vive enquanto o botão "Listen for test event" está apertado.');
  console.log('');
} catch (e) {
  console.error(`\n${cor.rub} ERRO ${cor.off} ${e.message}`);
  if (e.corpo) console.error(`      resposta: ${JSON.stringify(e.corpo).slice(0, 400)}`);
  if (e.status === 401) console.error('      401 = chave do n8n inválida ou expirada');
  console.error('');
  process.exit(1);
}
