#!/usr/bin/env node
/**
 * n8n.mjs — cliente mínimo da API do n8n, para inspeção e publicação de fluxos
 * ---------------------------------------------------------------------------
 * Lê a chave de demo/n8n.local (ignorado pelo Git) e nunca a imprime.
 *
 * ⚠️ A chave NÃO tem escopo (R-38): fora do plano Enterprise ela alcança toda a
 * instância. Este cliente, por isso, é deliberadamente estreito — só faz o que
 * a demo precisa, e as operações destrutivas simplesmente não existem aqui.
 *
 * Uso:
 *   node demo/n8n.mjs verificar          # quem sou eu, o que existe na instância
 *   node demo/n8n.mjs listar             # workflows (id, nome, ativo)
 *   node demo/n8n.mjs execucoes [limite] # últimas execuções, para acompanhamento
 *   node demo/n8n.mjs ver <id>           # um workflow, em JSON
 *   node demo/n8n.mjs execucao <id> <arquivo>  # o conteudo de uma execucao, para arquivo
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

function decodificar(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xFE) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) return buf.subarray(3).toString('utf8');
  return buf.toString('utf8');
}

const cfgPath = path.join(AQUI, 'n8n.json');
if (!fs.existsSync(cfgPath)) { console.error('falta demo/n8n.json com { "baseUrl": "..." }'); process.exit(1); }
const { baseUrl } = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const chavePath = path.join(AQUI, 'n8n.local');
if (!fs.existsSync(chavePath)) {
  console.error('falta demo/n8n.local — grave com:  node guardar-segredo.mjs demo/n8n.local');
  process.exit(1);
}
const chave = decodificar(fs.readFileSync(chavePath)).replace(/\s+/g, '');

const base = baseUrl.replace(/\/+$/, '') + '/api/v1';

async function api(caminho, opcoes = {}) {
  const url = base + caminho;
  const r = await fetch(url, {
    ...opcoes,
    headers: { 'X-N8N-API-KEY': chave, 'Accept': 'application/json', ...(opcoes.headers || {}) },
    signal: AbortSignal.timeout(30_000),
  });
  const texto = await r.text();
  let corpo; try { corpo = JSON.parse(texto); } catch { corpo = texto; }
  if (!r.ok) {
    const err = new Error(`HTTP ${r.status} em ${caminho}`);
    err.status = r.status; err.corpo = corpo;
    throw err;
  }
  return corpo;
}

const [comando, arg] = process.argv.slice(2);

try {
  if (comando === 'verificar') {
    console.log(`\nInstância: ${baseUrl}`);
    const wf = await api('/workflows?limit=250');
    const ativos = (wf.data || []).filter(w => w.active);
    console.log(`  conexão   : ok`);
    console.log(`  workflows : ${(wf.data || []).length} (${ativos.length} ativos)`);
    try {
      const pj = await api('/projects');
      console.log(`  projetos  : ${(pj.data || []).length}`);
    } catch (e) { console.log(`  projetos  : indisponível (${e.status}) — recurso de plano pago`); }
    try {
      const cr = await api('/credentials/schema/telegramApi');
      console.log(`  credenciais: leitura de esquema ok`);
    } catch (e) { console.log(`  credenciais: esquema indisponível (${e.status})`); }
    console.log('');
  }

  else if (comando === 'listar') {
    const wf = await api('/workflows?limit=250');
    const lista = wf.data || [];
    if (!lista.length) { console.log('\nnenhum workflow na instância\n'); }
    else {
      console.log(`\n${lista.length} workflow(s):\n`);
      for (const w of lista) {
        console.log(`  ${w.active ? '●' : '○'} ${w.id}  ${w.name}`);
      }
      console.log('\n  ● ativo   ○ inativo\n');
    }
  }

  else if (comando === 'execucoes') {
    const limite = Number(arg) || 20;
    const ex = await api(`/executions?limit=${limite}&includeData=false`);
    const lista = ex.data || [];
    if (!lista.length) { console.log('\nnenhuma execução registrada\n'); }
    else {
      console.log(`\n${lista.length} execução(ões) mais recentes:\n`);
      for (const e of lista) {
        const st = e.status || (e.finished ? 'success' : 'running');
        console.log(`  ${st === 'error' ? '✗' : st === 'success' ? '✓' : '…'} ${e.id}  ${e.workflowData?.name || e.workflowId}  ${e.startedAt || ''}  ${st}`);
      }
      console.log('');
    }
  }

  else if (comando === 'ver') {
    if (!arg) { console.error('informe o id do workflow'); process.exit(1); }
    console.log(JSON.stringify(await api(`/workflows/${arg}`), null, 2));
  }

  // Ler o CONTEÚDO de uma execução — não o fluxo, o que passou por ele.
  // Faltava, e a falta apareceu na hora de conferir o que o Escavador
  // entregou no callback: `ver` pede workflow e devolvia 404 para um id de
  // execução, o que parece erro de permissão e é só comando errado.
  //
  // ⚠️ A saída traz o payload inteiro, com dado de processo e de pessoa.
  // Por isso ela vai para arquivo, não para a tela: despejar isso no terminal
  // é o mesmo descuido do token, com LGPD junto.
  else if (comando === 'execucao') {
    if (!arg) { console.error('informe o id da execução (veja em: node demo/n8n.mjs execucoes)'); process.exit(1); }
    const destino = process.argv[4];
    const dados = await api(`/executions/${arg}?includeData=true`);
    const texto = JSON.stringify(dados, null, 2);

    if (!destino) {
      console.error('\n  informe também o arquivo de saída:');
      console.error(`    node demo/n8n.mjs execucao ${arg} <arquivo.json>`);
      console.error('\n  o conteúdo tem dado de processo e de pessoa — não vai para a tela.\n');
      process.exit(1);
    }
    fs.writeFileSync(destino, texto + '\n');
    console.log(`\n  execução ${arg} · ${dados.status ?? '?'} · iniciada ${dados.startedAt ?? '?'}`);
    console.log(`  gravado em ${destino} (${texto.length} caracteres)`);
    console.log('  confira se o destino está no .gitignore antes de qualquer commit.\n');
  }

  else {
    console.log('comandos: verificar · listar · execucoes [limite] · ver <id> · execucao <id> <arquivo>');
  }
} catch (e) {
  console.error(`\nfalhou: ${e.message}`);
  if (e.corpo) console.error(`  resposta: ${JSON.stringify(e.corpo).slice(0, 400)}`);
  if (e.status === 401) console.error('  401 = chave inválida ou expirada. Gere outra em Settings → n8n API');
  console.error('');
  process.exit(1);
}
