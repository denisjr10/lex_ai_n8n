#!/usr/bin/env node
/**
 * uazapi.mjs — cliente da Uazapi para a Demo B (cliente no WhatsApp)
 * ---------------------------------------------------------------------------
 * A instância gratuita da Uazapi dura UMA HORA e depois some. Isso muda o modo
 * de trabalhar: nada de construir com o relógio correndo. Este script existe
 * para que, quando a instância nascer, os passos que dependem dela sejam três
 * comandos curtos — criar, parear, apontar o webhook.
 *
 * Dois segredos, com papéis diferentes:
 *   demo/uazapi-admin.local  → token de ADMIN. Cria instâncias. Não envia nada
 *   demo/uazapi.local        → token da INSTÂNCIA. Envia e recebe mensagens
 *
 * Nenhum dos dois entra no repositório, e nenhum é impresso na tela.
 *
 * Uso:
 *   node demo/uazapi.mjs criar <nome>     # cria a instância (gasta o token admin)
 *   node demo/uazapi.mjs parear [tel]     # devolve o QR code / código de pareamento
 *   node demo/uazapi.mjs status           # conectado? quanto falta para expirar?
 *   node demo/uazapi.mjs webhook          # aponta o webhook para o n8n
 *   node demo/uazapi.mjs credencial       # grava o token da instância no n8n
 *   node demo/uazapi.mjs enviar <tel> <texto>   # teste de envio
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://free.uazapi.com';

// O mesmo tratamento de codificação do resto do projeto: o `>` do PowerShell 5
// grava UTF-16, e um token lido como texto comum vira lixo — com sintoma de
// "401 token inválido", que manda procurar no lugar errado.
function decodificar(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xFE) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) return buf.subarray(3).toString('utf8');
  return buf.toString('utf8');
}

function segredo(arquivo, comoGravar) {
  const p = path.join(AQUI, arquivo);
  if (!fs.existsSync(p)) {
    console.error(`\n  falta demo/${arquivo}\n  grave com:  node guardar-segredo.mjs demo/${arquivo}`);
    if (comoGravar) console.error(`  ${comoGravar}`);
    console.error('');
    process.exit(1);
  }
  return decodificar(fs.readFileSync(p)).replace(/\s+/g, '');
}

async function api(caminho, { metodo = 'GET', corpo, cabecalhos = {} } = {}) {
  const r = await fetch(BASE + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...cabecalhos },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(45_000),
  });
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { j = txt; }
  if (!r.ok) {
    const e = new Error(`HTTP ${r.status} em ${caminho}`);
    e.status = r.status; e.corpo = j;
    throw e;
  }
  return j;
}

const comAdmin = () => ({ admintoken: segredo('uazapi-admin.local') });
const comInstancia = () => ({ token: segredo('uazapi.local', 'o token da instância vem da saída de "criar"') });

const [comando, ...args] = process.argv.slice(2);

try {
  if (comando === 'criar') {
    const nome = args[0] || 'lex-demo-b';
    const r = await api('/instance/create', { metodo: 'POST', corpo: { name: nome }, cabecalhos: comAdmin() });
    console.log(`\ninstância criada: ${r.name || nome}`);
    console.log(`  ${r.info || 'atenção: a instância gratuita expira em 1 hora'}`);
    console.log(`
  O TOKEN DA INSTÂNCIA foi devolvido pela API e NÃO será impresso aqui.
  Grave-o agora, no seu terminal:

    node guardar-segredo.mjs demo/uazapi.local

  Ele aparece no painel da Uazapi, na instância recém-criada.
`);
    // Deliberadamente não imprimimos r.token: o que aparece na tela acaba
    // colado em chat, e o token da instância envia mensagem em nome do número.
  }

  else if (comando === 'parear') {
    const corpo = args[0] ? { phone: String(args[0]).replace(/\D/g, '') } : {};
    const r = await api('/instance/connect', { metodo: 'POST', corpo, cabecalhos: comInstancia() });
    const inst = r.instance || r;
    if (inst.paircode || r.paircode) console.log(`\ncódigo de pareamento: ${inst.paircode || r.paircode}\n`);
    if (inst.qrcode || r.qrcode) {
      const arq = path.join(AQUI, 'qrcode.local.txt');
      fs.writeFileSync(arq, String(inst.qrcode || r.qrcode));
      console.log(`\nQR code gravado em demo/qrcode.local.txt (é uma imagem em base64).`);
      console.log(`Abra no navegador colando o conteúdo na barra de endereço.\n`);
    }
    console.log(`status: ${inst.status || r.status || '(não informado)'}\n`);
  }

  else if (comando === 'status') {
    const r = await api('/instance/status', { cabecalhos: comInstancia() });
    const i = r.instance || r;
    console.log(`\ninstância : ${i.name || '(sem nome)'}`);
    console.log(`  status  : ${i.status || '?'}`);
    console.log(`  conectado: ${r.connected ?? i.connected ?? '?'}`);
    if (i.profileName || i.owner) console.log(`  número  : ${i.owner || i.profileName}`);
    console.log('');
  }

  else if (comando === 'webhook') {
    const cfg = JSON.parse(fs.readFileSync(path.join(AQUI, 'n8n.json'), 'utf8'));
    const url = cfg.baseUrl.replace(/\/+$/, '') + '/webhook/lex-demo-b-cliente';
    const r = await api('/webhook', {
      metodo: 'POST',
      corpo: {
        enabled: true,
        url,
        events: ['messages'],
        // fromMeYes: o que o próprio número envia não volta como pergunta.
        // isGroupYes: grupo não é atendimento individual, e a Regra 7 (nada de
        // conta compartilhada) vale igual do lado do cliente.
        excludeMessages: ['wasSentByApi', 'fromMeYes', 'isGroupYes'],
      },
      cabecalhos: comInstancia(),
    });
    console.log(`\nwebhook apontado para ${url}`);
    console.log(`  eventos: messages · sem eco de mensagens próprias, sem grupos\n`);
    if (r && r.error) console.log(JSON.stringify(r, null, 2));
  }

  else if (comando === 'credencial') {
    // O token da instância NÃO pode ser embutido no JSON do workflow: esse
    // arquivo é versionado. Vira credencial do n8n, e o fluxo referencia o id.
    const token = segredo('uazapi.local');
    const { baseUrl } = JSON.parse(fs.readFileSync(path.join(AQUI, 'n8n.json'), 'utf8'));
    const chave = decodificar(fs.readFileSync(path.join(AQUI, 'n8n.local'))).replace(/\s+/g, '');
    const base = baseUrl.replace(/\/+$/, '') + '/api/v1';
    const cab = { 'X-N8N-API-KEY': chave, 'Content-Type': 'application/json', Accept: 'application/json' };

    const NOME_CRED = '[LEX-DEMO] Uazapi (instância)';
    const r = await fetch(`${base}/credentials`, {
      method: 'POST', headers: cab,
      body: JSON.stringify({ name: NOME_CRED, type: 'httpHeaderAuth', data: { name: 'token', value: token } }),
    });
    const corpo = await r.json();
    if (!r.ok) {
      console.error(`\nfalhou (HTTP ${r.status}): ${JSON.stringify(corpo).slice(0, 400)}\n`);
      process.exit(1);
    }

    const arqCred = path.join(AQUI, 'credenciais.json');
    const cred = JSON.parse(fs.readFileSync(arqCred, 'utf8'));
    cred.httpHeaderAuth = { id: corpo.id, name: NOME_CRED };
    fs.writeFileSync(arqCred, JSON.stringify(cred, null, 2) + '\n');

    console.log(`\ncredencial criada no n8n · id ${corpo.id}`);
    console.log(`  registrada em demo/credenciais.json`);
    console.log(`  o token não foi impresso e não está no workflow\n`);
    console.log(`  Agora: node demo/montar-fluxo-b.mjs --publicar\n`);
  }

  else if (comando === 'enviar') {
    const [tel, ...resto] = args;
    if (!tel || !resto.length) { console.error('uso: node demo/uazapi.mjs enviar <telefone> <texto>'); process.exit(1); }
    const r = await api('/send/text', {
      metodo: 'POST',
      corpo: { number: String(tel).replace(/\D/g, ''), text: resto.join(' ') },
      cabecalhos: comInstancia(),
    });
    console.log(`\nenviado · id ${r.id || r.messageid || '(sem id)'}\n`);
  }

  else {
    console.log(`
comandos:
  criar <nome>          cria a instância gratuita (1 hora de vida)
  parear [telefone]     QR code ou código de pareamento
  status                conectado?
  webhook               aponta o webhook para o n8n
  credencial            grava o token da instância como credencial do n8n
  enviar <tel> <texto>  teste de envio
`);
  }
} catch (e) {
  console.error(`\nfalhou: ${e.message}`);
  if (e.corpo) console.error(`  resposta: ${JSON.stringify(e.corpo).slice(0, 400)}`);
  if (e.status === 401) console.error('  401 = token errado, ou a instância já expirou (elas duram 1 hora)');
  console.error('');
  process.exit(1);
}
