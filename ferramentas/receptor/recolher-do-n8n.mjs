#!/usr/bin/env node
/**
 * recolher-do-n8n.mjs — resgata as entregas de callback antes que o n8n as apague
 * ---------------------------------------------------------------------------
 * ⚠️ ESTE SCRIPT EXISTE POR CAUSA DE UMA MEDIÇÃO, E ELA É FEIA.
 *
 * A instância do n8n descarta execuções. Medido em 02/09/2026:
 *
 *     ids de execução de 492 a 11.740   →   11.249 no intervalo
 *     sobreviventes                     →          173
 *     taxa de sobrevivência             →         1,5%
 *
 * O que sobra parece ser o que alguém anotou com joinha no histórico. As 30
 * aparições de diário — o contrato mais importante do projeto, e o único que
 * não pode ser recomprado, porque a cota expirou em 01/09 — estão na fila para
 * sumir junto.
 *
 * ---------------------------------------------------------------------------
 * POR QUE UM RECOLHEDOR, E NÃO O RECEPTOR GRAVANDO DIRETO
 *
 * O certo é o receptor persistir na hora, e a D-181 diz isso. Mas há um fato de
 * topologia no caminho: **o n8n roda em `auto.criativeia.com.br` e o PostgreSQL
 * roda em `127.0.0.1` na máquina do desenvolvedor.** O nó do n8n não tem como
 * alcançar este banco, e não há endpoint público da plataforma — ele é o
 * marco 7.
 *
 * Então este script é a ponte, e é honesto sobre ser uma ponte:
 *
 *   · resgata o que já chegou, que é urgente e não espera arquitetura;
 *   · é idempotente por conteúdo, então rodar de novo não duplica nada;
 *   · continua servindo depois, como rede — mesmo quando o receptor gravar
 *     direto, alguma entrega vai falhar, e é bom ter de onde repescar.
 *
 * O que ele NÃO é: solução definitiva. Enquanto for o único caminho, uma
 * entrega que chegue e seja podada antes do próximo recolhimento **some**.
 *
 * ---------------------------------------------------------------------------
 * LGPD — o payload não vai para o repositório
 *
 * Cada entrega traz nome de parte, número de processo e o teor da publicação. O
 * corpo inteiro é gravado em `captura/respostas-brutas/callbacks/`, que o Git
 * ignora, e o banco guarda só o CAMINHO em `payload_ref`. Assim o expurgo de um
 * pedido de eliminação apaga o conteúdo sem mexer na trilha, que é append-only
 * e não aceitaria o apagamento.
 *
 * ---------------------------------------------------------------------------
 * Uso — pelos atalhos do npm, que funcionam igual em qualquer terminal:
 *
 *   npm run receptor:conferir    # lê e não grava nada
 *   npm run receptor:recolher    # grava
 *
 * ⚠️ POR QUE OS ATALHOS, E NÃO A VARIÁVEL DE AMBIENTE NA FRENTE DO COMANDO.
 *
 * A instrução original era `LEX_INQUILINO_ID=... node ...`, que é sintaxe de
 * **bash**. No PowerShell isso não existe: ele lê o texto inteiro como nome de
 * programa e responde "não é reconhecido como cmdlet". Custou uma tentativa
 * frustrada de quem foi rodar.
 *
 * A lição não é "documentar as duas sintaxes" — é não depender de nenhuma. A
 * máquina de trabalho é Windows, e comando que só funciona no shell de quem o
 * escreveu não é comando, é pegadinha. O `npm run` é o mesmo texto em bash, em
 * PowerShell e no cmd.
 *
 * De onde vem o inquilino, em ordem:
 *   1. `--inquilino <uuid>` na linha de comando
 *   2. `LEX_INQUILINO_ID` no ambiente
 *   3. `LEX_INQUILINO_ID` em `infra/.env`, que o Git ignora — o normal
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const ARQ_ENV = path.join(RAIZ, 'infra', '.env');
const DESTINO_PAYLOAD = path.join(RAIZ, 'captura', 'respostas-brutas', 'callbacks');

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', rub: '\x1b[31m', cin: '\x1b[90m' };
const ok = (t) => console.log(`  ${cor.ver}ok${cor.off}   ${t}`);
const aviso = (t) => console.log(`  ${cor.ama}!${cor.off}    ${t}`);
const erro = (t) => console.log(`  ${cor.rub}ERRO${cor.off} ${t}`);
const secao = (t) => console.log(`\n${cor.neg}${t}${cor.off}`);

const args = process.argv.slice(2);
const GRAVAR = args.includes('--gravar');
const WORKFLOW = 'OymAtbNYI1pjfWkA';

if (!GRAVAR && !args.includes('--conferir')) {
  console.error(
    '\n  informe --conferir (nao grava) ou --gravar\n\n' +
    '  Mais simples:  npm run receptor:conferir   ou   npm run receptor:recolher\n',
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Ambiente e chaves
// ---------------------------------------------------------------------------
if (fs.existsSync(ARQ_ENV)) {
  for (const linha of fs.readFileSync(ARQ_ENV, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function decodificar(buf) {
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return buf.subarray(3).toString('utf8');
  return buf.toString('utf8');
}

const { baseUrl } = JSON.parse(fs.readFileSync(path.join(RAIZ, 'demo', 'n8n.json'), 'utf8'));
const chaveN8n = decodificar(fs.readFileSync(path.join(RAIZ, 'demo', 'n8n.local'))).replace(/\s+/g, '');
const apiBase = baseUrl.replace(/\/+$/, '') + '/api/v1';

async function n8n(caminho) {
  const r = await fetch(apiBase + caminho, {
    headers: { 'X-N8N-API-KEY': chaveN8n, Accept: 'application/json' },
    signal: AbortSignal.timeout(60_000),
  });
  const t = await r.text();
  let c;
  try { c = JSON.parse(t); } catch { c = t; }
  if (!r.ok) throw Object.assign(new Error(`n8n HTTP ${r.status}`), { corpo: c });
  return c;
}

// ---------------------------------------------------------------------------
// O inquilino de destino.
//
// PARÂMETRO, e sem valor padrão de propósito: gravar publicação no escritório
// errado é o tipo de engano que a política por linha não pega, porque a linha
// fica coerente — só está no lugar errado.
// ---------------------------------------------------------------------------
const posInquilino = args.indexOf('--inquilino');
const INQUILINO =
  (posInquilino >= 0 ? args[posInquilino + 1] : undefined) ?? process.env['LEX_INQUILINO_ID'];
if (GRAVAR && !INQUILINO) {
  console.error(
    '\n  Falta dizer DE QUAL ESCRITORIO sao estas publicacoes.\n\n' +
    '  Nao ha padrao a assumir de proposito: gravar no escritorio errado produz\n' +
    '  linha coerente no lugar errado, e nenhuma politica de banco detecta isso.\n\n' +
    '  O jeito normal - grave uma vez em infra/.env (que o Git ignora):\n' +
    '      LEX_INQUILINO_ID=<uuid>\n' +
    '  e depois e so:  npm run receptor:recolher\n\n' +
    '  Ou, avulso:\n' +
    '      node ferramentas/receptor/recolher-do-n8n.mjs --gravar --inquilino <uuid>\n',
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
secao('1. Lendo as execuções do receptor no n8n');
// ---------------------------------------------------------------------------
let cursor = null;
const execucoes = [];
do {
  const p = await n8n(
    `/executions?workflowId=${WORKFLOW}&limit=100&includeData=false` +
      (cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''),
  );
  execucoes.push(...(p.data ?? []));
  cursor = p.nextCursor ?? null;
} while (cursor);
execucoes.sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)));
ok(`${execucoes.length} execução(ões) no histórico`);

const ids = execucoes.map((e) => Number(e.id)).filter(Number.isFinite);
if (ids.length) {
  const faixa = Math.max(...ids) - Math.min(...ids) + 1;
  aviso(
    `ids de ${Math.min(...ids)} a ${Math.max(...ids)} nesta lista — ` +
      `a instância já descartou execuções (ver o cabeçalho deste arquivo)`,
  );
  void faixa;
}

// ---------------------------------------------------------------------------
secao('2. Extraindo o carimbo de cada entrega');
// ---------------------------------------------------------------------------
const entregas = [];
for (const e of execucoes) {
  let dados;
  try {
    dados = await n8n(`/executions/${e.id}?includeData=true`);
  } catch (err) {
    erro(`execução ${e.id}: ${err.message}`);
    continue;
  }
  const carimbo =
    dados?.data?.resultData?.runData?.['Conferir e carimbar']?.[0]?.data?.main?.[0]?.[0]?.json ?? null;
  if (!carimbo) {
    aviso(`execução ${e.id}: sem carimbo — ignorada`);
    continue;
  }
  entregas.push({
    execucao_id: String(e.id),
    recebido_em: carimbo.recebido_em ?? e.startedAt,
    origem_valida: carimbo.veredito === 'autentico',
    corpo: carimbo.corpo ?? {},
  });
}
ok(`${entregas.length} entrega(s) com carimbo`);

const porVeredito = entregas.reduce((a, e) => {
  const k = e.origem_valida ? 'autentico' : 'não conferida';
  a[k] = (a[k] ?? 0) + 1;
  return a;
}, {});
ok(`veredito: ${JSON.stringify(porVeredito)}`);

const porTipo = entregas.reduce((a, e) => {
  const k = e.corpo?.event ?? '(sem event)';
  a[k] = (a[k] ?? 0) + 1;
  return a;
}, {});
for (const [k, n] of Object.entries(porTipo)) ok(`${n}x  ${k}`);

if (!GRAVAR) {
  console.log(
    `\n${cor.ama}Modo --conferir: nada foi gravado.${cor.off}\n` +
      `  Para gravar:  ${cor.cin}npm run receptor:recolher${cor.off}\n`,
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
secao('3. Gravando');
// ---------------------------------------------------------------------------
const { abrirConexao, conferirPapel, lerAmbiente, criarAuditoriaPostgres } = await import('@lex/auditoria');
const { gravarEntrega } = await import('@lex/receptor-callbacks');

const conexao = abrirConexao(lerAmbiente());
let saida = 0;
try {
  await conferirPapel(conexao);
  ok('conectada como lex_app');

  fs.mkdirSync(DESTINO_PAYLOAD, { recursive: true });
  const auditoria = criarAuditoriaPostgres(conexao);

  // Contadores SEPARADOS para fatos separados: uma entrega pode ser repetida E
  // ter gravado publicacao agora, e foi exatamente o que aconteceu com nove
  // delas em 02/09.
  const conta = {
    eventos_novos: 0, eventos_repetidos: 0, sem_origem: 0,
    publicacoes: 0, envolvidos: 0, falhou: 0,
  };

  for (const e of entregas) {
    // O payload vai para arquivo ANTES da gravação. Se o banco falhar, o corpo
    // já está salvo — e é ele que não se recupera depois que o n8n podar.
    const arq = path.join(DESTINO_PAYLOAD, `${e.execucao_id}.json`);
    fs.writeFileSync(arq, JSON.stringify(e.corpo, null, 2) + '\n');
    const ref = path.relative(RAIZ, arq).replace(/\\/g, '/');

    try {
      const r = await gravarEntrega(conexao, auditoria, {
        inquilino_id: INQUILINO,
        fornecedor: 'escavador',
        corpo: e.corpo,
        origem_valida: e.origem_valida,
        recebido_em: new Date(e.recebido_em).toISOString(),
        payload_ref: ref,
      });
      if (r.evento_novo) conta.eventos_novos += 1; else conta.eventos_repetidos += 1;
      if (!r.origem_valida) conta.sem_origem += 1;
      if (r.publicacao_id) {
        conta.publicacoes += 1;
        conta.envolvidos += r.envolvidos;
      }
    } catch (err) {
      conta.falhou += 1;
      erro(`execução ${e.execucao_id}: ${err.message}`);
    }
  }

  console.log('');
  ok(`${conta.eventos_novos} entrega(s) inédita(s)`);
  ok(`${conta.eventos_repetidos} já estavam na base — a idempotência por conteúdo funcionou`);
  ok(`${conta.sem_origem} com origem não conferida: registradas, sem virar publicação`);
  ok(`${conta.publicacoes} publicação(ões) gravada(s) AGORA, com ${conta.envolvidos} envolvido(s)`);
  // As duas contagens sao independentes de proposito: publicacao gravada a
  // partir de entrega repetida e recuperacao, nao anomalia.
  if (conta.publicacoes && !conta.eventos_novos) {
    aviso('publicações recuperadas de entregas que já estavam registradas');
  }
  if (conta.falhou) {
    erro(`${conta.falhou} falharam`);
    saida = 1;
  }

  console.log(
    `\n  ${cor.cin}payloads em ${path.relative(RAIZ, DESTINO_PAYLOAD).replace(/\\/g, '/')}/ (o Git ignora)${cor.off}`,
  );
} catch (e) {
  erro(e.message);
  saida = 1;
} finally {
  await conexao.encerrar().catch(() => {});
}

console.log('');
process.exit(saida);
