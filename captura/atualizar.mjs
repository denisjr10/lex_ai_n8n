#!/usr/bin/env node
/**
 * atualizar.mjs — Bloco C: assincronia e callback (API V2 do Escavador)
 * ---------------------------------------------------------------------------
 * ⚠️ A OPERAÇÃO `solicitar` GASTA DINHEIRO. A operação `status` é gratuita.
 *
 * Por que este script existe separado do capturar.mjs: o capturar.mjs tem uma
 * FILA fixa de GETs e um teto de 3 chamadas, tudo travado na autorização de
 * 24/08. O Bloco C é POST, tem corpo, e é a única parte do orçamento que
 * exercita o ciclo assíncrono — meter isso na fila do outro script obrigaria a
 * mexer nas travas que protegem os Blocos A e B, que já foram executados.
 *
 * O QUE ESTE SCRIPT VALIDA (orçamento §"Bloco C")
 *
 *   C1  `solicitar`  POST .../solicitar-atualizacao   PAGA
 *       Formato do aceite assíncrono. É a chamada que dispara o callback e,
 *       portanto, a única prova de ponta a ponta de que o receptor no n8n
 *       (`callback.criativeia.com.br/webhook/escavador-callback`) atende.
 *
 *   C2  `status`     GET  .../status-atualizacao      GRATUITA
 *       Máquina de estados da atualização. Pode ser repetida à vontade.
 *
 *   C4 foi RETIRADO do orçamento em 26/08, por decisão do usuário: ele criaria
 *   um monitoramento V2 por processo — exatamente a rota que a D-62 rejeitou
 *   em favor da vigilância em diário oficial. Gastar R$ 3,00 e assinar custo
 *   recorrente para validar o contrato de algo que não vamos usar é pagar duas
 *   vezes pela mesma resposta.
 *
 * CONTRATO DO CORPO — metade lida na documentação, metade aprendida no 422
 *   1. Os campos são form-data de texto e valem `1`, não booleanos JSON.
 *      Lido na documentação oficial em 26/08, de graça
 *   2. `documentos_publicos` e `autos` são mutuamente exclusivos, e a API
 *      decide pela PRESENÇA da chave, não pelo valor: mandar os dois zerados
 *      é pedir os dois, e volta 422. Aprendido gastando uma tentativa em
 *      26/08 — a documentação não dizia
 *
 *   O padrão, agora com três casos: nesta API, campo ausente e campo com
 *   valor falso NÃO são a mesma coisa.
 *
 * TRAVAS
 *   1. Sem --executar, não chama nada
 *   2. Dígito verificador do CNJ conferido antes de gastar
 *   3. Processo em segredo de justiça não se consulta por aqui
 *   4. `solicitar` já feita para este processo nunca se repete (Regra 5)
 *   5. `solicitar` exige --confirmo-custo, escrito à mão
 *   6. Sem laço, sem lote, sem nova tentativa automática
 *
 * Uso:
 *   node captura/atualizar.mjs status --executar              # GRÁTIS
 *   node captura/atualizar.mjs solicitar                      # ensaio
 *   node captura/atualizar.mjs solicitar --executar --confirmo-custo
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const BASE = 'https://api.escavador.com';

const ARQ_PROCESSOS = path.join(AQUI, 'processos.local.json');
const ARQ_REGISTRO  = path.join(AQUI, 'registro-de-execucao.local.json');
const DIR_BRUTAS    = path.join(AQUI, 'respostas-brutas');

// O mesmo alvo dos Blocos A e B. Trocar exige novo aval (Regra 8).
const PROCESSO_AUTORIZADO = 'P1';

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', rub: '\x1b[31m', cin: '\x1b[90m' };
const ok    = (m) => console.log(`${cor.ver}  OK  ${cor.off} ${m}`);
const aviso = (m) => console.log(`${cor.ama} AVISO${cor.off} ${m}`);
const info  = (m) => console.log(`${cor.cin}      ${m}${cor.off}`);
function morrer(m) { console.log(`${cor.rub} ERRO ${cor.off} ${m}\n\nNada foi gasto.\n`); process.exit(1); }

// ---------------------------------------------------------------------------
// Catálogo. `paga` é o campo que decide se há trava.
// ---------------------------------------------------------------------------
const OPERACOES = {
  solicitar: {
    id: 'C1',
    metodo: 'POST',
    rota: '/api/v2/processos/numero_cnj/{numero}/solicitar-atualizacao',
    paga: true,
    precoCatalogo: 'R$ 3,00 (teste)',
    objetivo: 'Formato do aceite assíncrono e disparo real do callback — ' +
              'a única prova de ponta a ponta de que o receptor no n8n atende',
  },
  status: {
    id: 'C2',
    metodo: 'GET',
    rota: '/api/v2/processos/numero_cnj/{numero}/status-atualizacao',
    paga: false,
    precoCatalogo: 'gratuita',
    objetivo: 'Máquina de estados da atualização — quais estados existem e ' +
              'como se distingue "terminou" de "terminou sem novidade"',
  },
};

const [comando] = process.argv.slice(2);
const executar = process.argv.includes('--executar');
const confirmaCusto = process.argv.includes('--confirmo-custo');

if (!comando || !OPERACOES[comando]) {
  console.log(`\n${cor.neg}Bloco C — assincronia e callback${cor.off}\n`);
  for (const [nome, o] of Object.entries(OPERACOES)) {
    console.log(`  ${cor.neg}${nome.padEnd(10)}${cor.off} ${o.paga ? `${cor.ama}PAGA${cor.off}  ` : `${cor.ver}grátis${cor.off}`}  ${o.metodo} ${o.rota}`);
  }
  console.log('');
  process.exit(comando ? 1 : 0);
}

const op = OPERACOES[comando];

console.log(`\n${cor.neg}Bloco C — ${comando} (${op.id})${cor.off}`);
console.log(`${cor.cin}${op.metodo} ${op.rota} · ${op.precoCatalogo}${cor.off}\n`);

// ---------------------------------------------------------------------------
// Alvo — as mesmas conferências do capturar.mjs, pelas mesmas razões
// ---------------------------------------------------------------------------
function cnjValido(cnj) {
  const m = String(cnj).match(/^(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})$/);
  if (!m) return false;
  const [, seq, dv, ano, j, tr, origem] = m;
  const base = BigInt(seq + ano + j + tr + origem);
  return String(98n - ((base * 100n) % 97n)).padStart(2, '0') === dv;
}

if (!fs.existsSync(ARQ_PROCESSOS)) morrer(`não encontrei ${path.relative(RAIZ, ARQ_PROCESSOS)}`);
const cfg = JSON.parse(fs.readFileSync(ARQ_PROCESSOS, 'utf8'));
const processo = (cfg.processos || []).find((p) => p.apelido === PROCESSO_AUTORIZADO);
if (!processo) morrer(`o processo ${PROCESSO_AUTORIZADO} não está em processos.local.json`);

if (!cnjValido(processo.numero_cnj)) {
  morrer('o CNJ do alvo tem dígito verificador inválido. Chamar assim gastaria crédito para receber 404');
}
if (processo.segredo_justica === true) {
  morrer(`o ${processo.apelido} está marcado como SEGREDO DE JUSTIÇA — não se consulta por aqui`);
}
ok(`processo ${processo.apelido} (${processo.tribunal}) · dígito verificador confere · sem segredo de justiça`);

// ---------------------------------------------------------------------------
// Regra 5 — chamada paga já feita nunca se repete
// ---------------------------------------------------------------------------
const registro = fs.existsSync(ARQ_REGISTRO)
  ? JSON.parse(fs.readFileSync(ARQ_REGISTRO, 'utf8'))
  : { chamadas: [] };

if (op.paga) {
  const jaFeita = registro.chamadas.some(
    (c) => c.id === op.id && c.cnj === processo.numero_cnj && c.http >= 200 && c.http < 300
  );
  if (jaFeita) {
    morrer(
      `a chamada ${op.id} já foi feita para este processo e teve sucesso.\n` +
      '      Regra 5 do orçamento: nunca repita uma chamada já feita.\n' +
      `      A resposta está em ${path.relative(RAIZ, DIR_BRUTAS)} — releia dali.`
    );
  }
}

// ---------------------------------------------------------------------------
// Corpo do C1
//
// `enviar_callback: 1` é o ponto inteiro do Bloco C: sem ele a API responde o
// aceite e nunca bate no n8n, e o receptor continua sem prova de que funciona.
//
// `documentos_publicos` e `autos` são OMITIDOS, não zerados.
//
// A primeira versão mandava `documentos_publicos: 0, autos: 0`, achando que
// zero significava "não quero nenhum dos dois". A API respondeu 422:
// "Não é possível solicitar atualização de documentos públicos e autos ao
// mesmo tempo." Ou seja: ela decide pela PRESENÇA da chave, não pelo valor.
// Mandar os dois zerados é pedir os dois.
//
// É a terceira vez nesta semana que o contrato real difere do que o
// mapeamento supunha — depois de `origens_ids` obrigatório e de `1`/`0` em vez
// de booleanos. Vale como padrão: nesta API, campo ausente e campo com valor
// falso não são a mesma coisa.
// ---------------------------------------------------------------------------
let corpoEnvio = null;
if (comando === 'solicitar') {
  corpoEnvio = { enviar_callback: 1 };
}

// ---------------------------------------------------------------------------
// Plano
// ---------------------------------------------------------------------------
const rota = op.rota.replace('{numero}', processo.numero_cnj);
const url = BASE + rota;

console.log(`\n${cor.neg}Plano${cor.off}\n`);
console.log(`  ${op.metodo} ${BASE}${op.rota.replace('{numero}', '<CNJ do P1, omitido>')}`);
console.log(`  objetivo: ${op.objetivo}`);
if (corpoEnvio) console.log(`  corpo   : ${JSON.stringify(corpoEnvio)}`);
console.log('');

if (op.paga) {
  aviso('esta operação DEBITA da cota de teste (catálogo: R$ 3,00)');
  info('não é assinatura: cobra uma vez, não renova');
  console.log('');
}

if (comando === 'solicitar') {
  const arqToken = path.join(AQUI, 'callback-token.local');
  if (fs.existsSync(arqToken)) {
    ok('token de callback presente — o receptor no n8n vai conseguir conferir a entrega');
  } else {
    aviso('não achei captura/callback-token.local');
    info('a chamada funciona assim mesmo, mas o receptor no n8n vai recusar a entrega');
    info('e o Bloco C perde justamente a metade que ele existe para provar');
  }
  console.log('');
}

if (!executar) {
  console.log(`${cor.ama}ENSAIO — nada foi chamado e nada foi gasto.${cor.off}`);
  console.log(`Para valer: acrescente ${cor.neg}--executar${cor.off}${op.paga ? ` ${cor.neg}--confirmo-custo${cor.off}` : ''}\n`);
  process.exit(0);
}

if (op.paga && !confirmaCusto) {
  morrer('esta chamada debita crédito. Confirme por escrito:  --confirmo-custo');
}

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------
function decodificar(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xFE) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) return buf.subarray(3).toString('utf8');
  return buf.toString('utf8');
}
function lerToken() {
  if (process.env.ESCAVADOR_TOKEN?.trim()) return process.env.ESCAVADOR_TOKEN.trim();
  const arq = path.join(AQUI, 'token.local');
  if (!fs.existsSync(arq)) return null;
  const t = decodificar(fs.readFileSync(arq)).replace(/\s+/g, '');
  return /^[A-Za-z0-9._-]+$/.test(t) ? t : null;
}

const token = lerToken();
if (!token) morrer('sem token válido em captura/token.local nem em ESCAVADOR_TOKEN');
ok(`token carregado (${token.length} caracteres, não exibido)`);

// ---------------------------------------------------------------------------
// Execução — uma chamada, sem laço, sem nova tentativa
// ---------------------------------------------------------------------------
fs.mkdirSync(DIR_BRUTAS, { recursive: true });

let resposta, corpo;
try {
  resposta = await fetch(url, {
    method: op.metodo,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...(corpoEnvio ? { 'Content-Type': 'application/json' } : {}),
      'User-Agent': 'lex-ai-n8n/atualizar (validacao de contrato)',
    },
    ...(corpoEnvio ? { body: JSON.stringify(corpoEnvio) } : {}),
    signal: AbortSignal.timeout(60_000),
  });
  corpo = await resposta.text();
} catch (e) {
  aviso(`falha de rede: ${e.message}`);
  aviso('pode ter havido cobrança — confira "Uso dos Créditos" no painel antes de repetir');
  process.exit(1);
}

const cabecalhos = Object.fromEntries(resposta.headers.entries());
const creditos = cabecalhos['creditos-utilizados'] ?? null;

console.log('');
ok(`HTTP ${resposta.status} · Creditos-Utilizados: ${creditos ?? 'ausente'}`);

const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
const arq = path.join(DIR_BRUTAS, `${carimbo}__${op.id}-${comando}__${resposta.status}.json`);
fs.writeFileSync(arq, JSON.stringify({
  id: op.id,
  objetivo: op.objetivo,
  requisicao: { metodo: op.metodo, url, corpo: corpoEnvio },
  resposta: { status: resposta.status, cabecalhos, corpo },
  momento: new Date().toISOString(),
}, null, 2) + '\n');
info(`bruta salva em ${path.relative(RAIZ, arq)}`);

registro.chamadas.push({
  id: op.id,
  cnj: processo.numero_cnj,
  rota: op.rota,
  http: resposta.status,
  creditosUtilizados: creditos,
  precoCatalogo: op.precoCatalogo,
  arquivo: path.relative(RAIZ, arq),
  momento: new Date().toISOString(),
});
fs.writeFileSync(ARQ_REGISTRO, JSON.stringify(registro, null, 2) + '\n');

if (!resposta.ok) {
  console.log('');
  aviso(`a API recusou: ${String(corpo).slice(0, 300)}`);
  if (resposta.status === 403) info('403 nesta API significa saldo bloqueado, não permissão (§5.1 do orçamento)');
  if (resposta.status === 422) info('422 é parâmetro inválido — releia a documentação antes de repetir, repetir custa de novo');
  console.log('');
  process.exit(1);
}

let dados = null;
try { dados = JSON.parse(corpo); } catch { /* corpo não-JSON: já está salvo */ }

if (comando === 'solicitar') {
  console.log('');
  ok('solicitação aceita');
  const id = dados?.id ?? dados?.resposta?.id ?? null;
  if (id != null) info(`id da solicitação: ${id}`);
  console.log('');
  console.log(`${cor.neg}Agora o relógio corre do lado do Escavador. Sem gastar mais nada:${cor.off}`);
  console.log('  1. Acompanhe:  node captura/atualizar.mjs status --executar   (gratuito, repita à vontade)');
  console.log('  2. Abra as execuções do receptor no n8n e veja se a entrega chegou');
  console.log('  3. Confira o histórico em api.escavador.com/callbacks — evento, tentativas e payload');
  console.log('');
  info('se o status virar concluído e o n8n não registrar execução, o problema é a URL ou o token,');
  info('e essa é justamente a resposta que o Bloco C existe para dar');
}

if (comando === 'status') {
  console.log('');

  // O status NÃO fica na raiz: ele vem dentro de `ultima_verificacao`, e esse
  // campo é `null` enquanto nunca se pediu nada. A primeira versão procurava
  // na raiz e dizia "não trouxe um campo status óbvio" mesmo com o estado ali,
  // um nível abaixo — leitura ruim que parece falha da API.
  const v = dados?.ultima_verificacao ?? null;

  if (!v) {
    info('nenhuma atualização foi solicitada para este processo.');
    info(`o Escavador verificou por conta própria ${dados?.tempo_desde_ultima_verificacao ?? 'em data não informada'}`);
    info('"null" aqui não é erro: é "nada pedido"');
  } else {
    ok(`estado: ${cor.neg}${v.status}${cor.off}   (solicitação ${v.id})`);
    info(`pedida em  : ${v.criado_em ?? '—'}`);
    info(`concluída  : ${v.concluido_em ?? 'ainda não'}`);
    info(`callback   : ${v.enviar_callback}`);
    if (v.motivo_erro) aviso(`motivo do erro: ${v.motivo_erro}`);

    console.log('');
    if (v.status === 'PENDENTE') {
      info('PENDENTE significa que o Escavador ainda está no tribunal.');
      info('O callback só dispara na CONCLUSÃO — enquanto está pendente, o n8n');
      info('não recebe nada, e isso é o comportamento correto, não uma falha.');
      info('Repita este comando daqui a pouco; ele é gratuito.');
    } else if (v.concluido_em) {
      info('concluída — a entrega no n8n já deveria ter acontecido.');
      info('Se não apareceu execução no fluxo do receptor, o problema é a URL');
      info('ou o token, e essa é a resposta que o Bloco C existe para dar.');
    }
  }

  console.log('');
  console.log('  Transcreva os estados observados para a §5 de docs/06-orcamento-de-chamadas-escavador.md.');
  console.log('  A máquina de estados é o que o chassi vai precisar para saber quando parar de esperar.');
}

console.log('');
