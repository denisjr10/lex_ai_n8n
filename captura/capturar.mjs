#!/usr/bin/env node
/**
 * capturar.mjs — captura unica das respostas da API do Escavador
 * ---------------------------------------------------------------------------
 * Este script gasta dinheiro de verdade. Leia LEIA-ME.md antes de rodar.
 *
 * Regras do projeto que ele existe para CUMPRIR (CLAUDE.md, orcamento §4):
 *   Regra 4 — uma chamada, um objetivo registrado
 *   Regra 5 — nunca repetir uma chamada ja feita
 *   Regra 6 — nada de laco, lote ou varredura
 *   Regra 8 — so chama o que esta no orcamento aprovado
 *
 * Travas, em ordem de acionamento:
 *   1. Sem --executar, nao chama nada. So mostra o que faria
 *   2. Teto absoluto de chamadas autorizadas. Passou, recusa
 *   3. Registro de execucao: chamada ja feita nunca se repete
 *   4. Digito verificador do CNJ conferido antes de gastar
 *   5. Uma chamada por vez, em serie. Sem paralelismo
 *   6. Erro em qualquer chamada aborta o restante da fila
 *   7. Sem nova tentativa automatica. Erro e resultado, nao acidente
 *
 * Uso:
 *   node captura/capturar.mjs                 # ensaio: mostra o plano, nao gasta
 *   node captura/capturar.mjs --executar      # gasta de verdade
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

// ===========================================================================
// ORCAMENTO AUTORIZADO — 21/08/2026
// Alterar qualquer coisa aqui exige novo aval do usuario (Regra 8).
// ===========================================================================
const AUTORIZACAO = {
  data: '2026-08-24',                // alvo trocado; ver D-96
  processoAutorizado: 'P1',          // TJAP, saude publica. P2 e P3 NAO estao autorizados
  tetoDeChamadas: 3,
  blocos: 'A e B',
};

/** As tres chamadas autorizadas, na ordem em que devem ocorrer.
 *  A ordem importa: A1 e a mais barata da tabela (R$ 0,05) e serve de
 *  calibragem — se ela falhar, as duas caras nao chegam a acontecer. */
const FILA = [
  {
    id: 'A1',
    rota: '/api/v2/processos/numero_cnj/{numero}/envolvidos',
    query: { limit: 20 },            // a API so aceita 20, 50 ou 100
    precoCatalogo: 'R$ 0,05',
    objetivo: 'Autenticacao na V2, envelope, paginacao, modelo do envolvido ' +
              'e — de graca — se o debito segue a tabela ou e fixo em R$ 3,00',
  },
  {
    id: 'B1',
    rota: '/api/v2/processos/numero_cnj/{numero}',
    query: {},
    precoCatalogo: 'R$ 3,00',
    objetivo: 'Modelo do processo: campos, tipos, o que vem nulo na pratica',
  },
  {
    id: 'B2',
    rota: '/api/v2/processos/numero_cnj/{numero}/movimentacoes',
    query: { limit: 20, ordem: 'desc' },
    precoCatalogo: 'R$ 3,00',
    objetivo: 'Modelo da movimentacao — a peca que dispara prazo',
  },
];

const BASE = 'https://api.escavador.com';
const ARQ_PROCESSOS = path.join(AQUI, 'processos.local.json');
const ARQ_REGISTRO  = path.join(AQUI, 'registro-de-execucao.local.json');
const DIR_BRUTAS    = path.join(AQUI, 'respostas-brutas');

// ===========================================================================
// Utilidades
// ===========================================================================

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', ver2: '\x1b[31m', cin: '\x1b[90m' };
const ok   = (m) => console.log(`${cor.ver}  OK  ${cor.off} ${m}`);
const aviso= (m) => console.log(`${cor.ama} AVISO${cor.off} ${m}`);
const erro = (m) => console.log(`${cor.ver2} ERRO ${cor.off} ${m}`);
const info = (m) => console.log(`${cor.cin}      ${m}${cor.off}`);

function morrer(msg) {
  erro(msg);
  console.log('\nNada foi gasto. Corrija e rode de novo.\n');
  process.exit(1);
}

/** Digito verificador do CNJ — Resolucao CNJ 65/2008, ISO 7064 MOD 97-10.
 *  Aritmetica local. Nao toca a rede. Custo zero. */
function cnjValido(cnj) {
  const m = cnj.match(/^(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})$/);
  if (!m) return false;
  const [, seq, dv, ano, j, tr, origem] = m;
  const base = BigInt(seq + ano + j + tr + origem);
  return String(98n - ((base * 100n) % 97n)).padStart(2, '0') === dv;
}

function lerJson(arquivo, seFaltar) {
  if (!fs.existsSync(arquivo)) return seFaltar;
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

/** Le o token de arquivo, tolerando a codificacao que o Windows produzir.
 *  O `>` do PowerShell 5 grava UTF-16LE; o do PowerShell 7, UTF-8 sem BOM;
 *  o Bloco de Notas costuma deixar BOM. Ler errado gera um 401 — e um 401
 *  gasta tempo, pode gastar credito, e parece problema de token valido.
 *  O token nunca e impresso, nem inteiro nem em pedaco util. */
function decodificar(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xFE) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xFE && buf[1] === 0xFF) return buf.subarray(2).swap16().toString('utf16le');
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) return buf.subarray(3).toString('utf8');
  return buf.toString('utf8');
}

function lerToken() {
  const doAmbiente = process.env.ESCAVADOR_TOKEN;
  if (doAmbiente && doAmbiente.trim()) return { token: doAmbiente.trim(), origem: 'ESCAVADOR_TOKEN' };

  const arq = path.join(AQUI, 'token.local');
  if (!fs.existsSync(arq)) return { token: null };

  const t = decodificar(fs.readFileSync(arq)).replace(/\s+/g, '');
  if (!t) return { token: null };

  // Um PAT so tem caracteres de Base64URL e pontos. Qualquer outra coisa e
  // sinal de codificacao errada ou de conteudo colado por engano.
  if (!/^[A-Za-z0-9._-]+$/.test(t)) {
    return { token: null, sujo: true, origem: 'captura/token.local' };
  }
  return { token: t, origem: 'captura/token.local' };
}

// ===========================================================================
// Preparacao — tudo que pode dar errado, da errado ANTES de gastar
// ===========================================================================

const executar = process.argv.includes('--executar');

console.log(`\n${cor.neg}Captura das respostas do Escavador${cor.off}`);
console.log(`${cor.cin}Blocos ${AUTORIZACAO.blocos} · autorizados em ${AUTORIZACAO.data} · teto de ${AUTORIZACAO.tetoDeChamadas} chamadas${cor.off}\n`);

// -- processo -----------------------------------------------------------
const cfg = lerJson(ARQ_PROCESSOS, null);
if (!cfg) morrer(`nao encontrei ${path.relative(RAIZ, ARQ_PROCESSOS)}`);

const processo = (cfg.processos || []).find(p => p.apelido === AUTORIZACAO.processoAutorizado);
if (!processo) morrer(`o processo ${AUTORIZACAO.processoAutorizado} nao esta em processos.local.json`);

if (!cnjValido(processo.numero_cnj)) {
  morrer(`o CNJ do ${processo.apelido} tem digito verificador invalido. ` +
         `Chamar assim gastaria credito para receber 404`);
}
// Trava 8: processo em segredo de justica nao se consulta por aqui.
// Vira regra em codigo, e nao nota de rodape, porque o custo do engano e alto
// nos dois sentidos: credito gasto para receber pouco, e dado que nao devia
// circular circulando. Foi assim que o alvo mudou (D-96).
//
// A TRAVA EXIGE `false` EXPLICITO, e nao "diferente de true".
//
// Ate 31/08 ela recusava so quando o campo era exatamente `true`. Campo
// ausente, campo escrito errado, campo em texto ("nao", "N", "publico") e erro
// de leitura passavam todos como se o processo fosse publico — ou seja, tres
// formas de NAO SABER viravam uma resposta afirmativa. E o unico caso em que a
// trava importa e justamente aquele em que a informacao falhou.
//
// Isso e o oposto da Regra 5. Nao saber e motivo para parar, nao para seguir.
// O custo de parar por engano e um comando repetido depois de conferir uma
// linha de JSON. O custo de seguir por engano e credito gasto para trazer dado
// sob segredo para dentro do repositorio.
if (processo.segredo_justica !== false) {
  const comoVeio = processo.segredo_justica === undefined
    ? 'o campo nao existe no cadastro'
    : `o campo veio como ${JSON.stringify(processo.segredo_justica)}`;
  morrer(`nao da para afirmar que o ${processo.apelido} esta FORA de segredo de justica: ${comoVeio}.\n` +
         `       Segredo de justica falha FECHADO (Regra 5): so segue com "segredo_justica": false, escrito.\n` +
         `       Confira a capa do processo e corrija processos.local.json, ou peca aval explicito ao usuario`);
}
ok(`processo ${processo.apelido} (${processo.tribunal}) · digito verificador confere · sem segredo de justica`);

const naoAutorizados = (cfg.processos || []).filter(p => p.apelido !== AUTORIZACAO.processoAutorizado);
if (naoAutorizados.length) {
  info(`fora desta autorizacao: ${naoAutorizados.map(p => `${p.apelido} (${p.tribunal})`).join(', ')}`);
}

// -- registro de execucao ------------------------------------------------
const registro = lerJson(ARQ_REGISTRO, { chamadas: [] });
const jaFeitas = new Set(registro.chamadas.map(c => `${c.id}:${c.cnj}`));

/** O teto e de DINHEIRO, nao de tentativas. Um 401 ou 403 e recusa na porta —
 *  a API nem chegou a consultar o processo, e nada foi debitado. Foi o que
 *  aconteceu em 23/08: saldo bloqueado, R$ 0,00 gastos. Contar aquilo contra o
 *  teto travava a captura inteira sem que um centavo tivesse saido.
 *  Na duvida conta: so nao conta com prova de que foi de graca. */
const naoCobrada = (c) => c.http === 401 || c.http === 403 || c.creditosUtilizados === 0;
const cobradas = registro.chamadas.filter(c => !naoCobrada(c));
const gratuitas = registro.chamadas.length - cobradas.length;

if (cobradas.length >= AUTORIZACAO.tetoDeChamadas) {
  morrer(`o teto de ${AUTORIZACAO.tetoDeChamadas} chamadas autorizadas ja foi atingido ` +
         `(${cobradas.length} cobradas). Ampliar exige novo aval`);
}
ok(`registro de execucao: ${cobradas.length} de ${AUTORIZACAO.tetoDeChamadas} chamadas cobradas`);
if (gratuitas) info(`${gratuitas} tentativa(s) recusadas na porta (401/403) — nao contam, nada foi debitado`);

// -- fila efetiva --------------------------------------------------------
const pendentes = FILA.filter(c => !jaFeitas.has(`${c.id}:${processo.numero_cnj}`));
const repetidas = FILA.length - pendentes.length;
if (repetidas) aviso(`${repetidas} chamada(s) ja foram feitas antes e serao puladas (Regra 5)`);

if (!pendentes.length) {
  ok('nada a fazer — todas as chamadas autorizadas ja foram executadas');
  console.log(`\nAs respostas estao em ${path.relative(RAIZ, DIR_BRUTAS)}. Releia dali.\n`);
  process.exit(0);
}

if (cobradas.length + pendentes.length > AUTORIZACAO.tetoDeChamadas) {
  morrer(`executar as ${pendentes.length} pendentes passaria do teto de ${AUTORIZACAO.tetoDeChamadas}`);
}

// -- token ---------------------------------------------------------------
const { token, origem, sujo } = lerToken();
if (sujo) {
  aviso('o arquivo de token tem caracteres que um token nao tem');
  info('causa mais comum no Windows: o arquivo foi gravado em UTF-16 e lido como texto comum');
  info('regrave com:  node -e "require(\'fs\').writeFileSync(\'captura/token.local\',\'COLE_AQUI\')"');
} else if (!token) {
  aviso('token nao encontrado — o ensaio segue, a execucao nao');
  info('forneca por variavel de ambiente ESCAVADOR_TOKEN, ou em captura/token.local');
  info('captura/token.local e ignorado pelo Git. Nunca cole o token em chat nem em commit');
} else {
  ok(`token carregado de ${origem} (${token.length} caracteres, nao exibido)`);
}

// ===========================================================================
// Plano
// ===========================================================================

console.log(`\n${cor.neg}Plano de execucao${cor.off}\n`);
for (const c of pendentes) {
  const qs = new URLSearchParams(c.query).toString();
  console.log(`  ${cor.neg}${c.id}${cor.off}  GET ${c.rota.replace('{numero}', processo.numero_cnj)}${qs ? '?' + qs : ''}`);
  console.log(`      preco de catalogo: ${c.precoCatalogo}`);
  console.log(`      objetivo: ${c.objetivo}\n`);
}

if (!executar) {
  console.log(`${cor.ama}ENSAIO — nada foi chamado e nada foi gasto.${cor.off}`);
  console.log(`Para gastar de verdade:  ${cor.neg}node captura/capturar.mjs --executar${cor.off}\n`);
  process.exit(0);
}

if (!token) morrer('sem token, nao ha execucao');

// ===========================================================================
// Execucao — uma chamada por vez, sem tentativa nova, abortando ao primeiro erro
// ===========================================================================

fs.mkdirSync(DIR_BRUTAS, { recursive: true });

const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
let gastoTotalCentavos = 0;

for (const [indice, c] of pendentes.entries()) {
  const url = new URL(BASE + c.rota.replace('{numero}', processo.numero_cnj));
  for (const [k, v] of Object.entries(c.query)) url.searchParams.set(k, v);

  console.log(`\n${cor.neg}[${indice + 1}/${pendentes.length}] ${c.id}${cor.off} — chamando...`);

  let resposta, corpo;
  try {
    resposta = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'lex-ai-n8n/captura (validacao de contrato)',
      },
      signal: AbortSignal.timeout(60_000),
    });
    corpo = await resposta.text();
  } catch (e) {
    erro(`falha de rede em ${c.id}: ${e.message}`);
    aviso('fila abortada. Pode ter havido cobranca — confira Uso dos Creditos no painel');
    break;
  }

  // Cabecalhos inteiros: e neles que vem o custo real (Creditos-Utilizados)
  const cabecalhos = Object.fromEntries(resposta.headers.entries());
  const creditos = cabecalhos['creditos-utilizados'] ?? null;
  if (creditos !== null) {
    gastoTotalCentavos += Number(creditos) || 0;
    ok(`HTTP ${resposta.status} · Creditos-Utilizados: ${creditos} centavos`);
  } else {
    ok(`HTTP ${resposta.status} · cabecalho Creditos-Utilizados ausente`);
  }

  // Grava SEMPRE — inclusive erro. Resposta de erro tambem e aprendizado (Bloco D)
  const arq = path.join(DIR_BRUTAS, `${carimbo}__${c.id}__${resposta.status}.json`);
  fs.writeFileSync(arq, JSON.stringify({
    id: c.id,
    objetivo: c.objetivo,
    requisicao: { metodo: 'GET', url: url.toString() },   // sem token
    resposta: { status: resposta.status, cabecalhos, corpo },
    momento: new Date().toISOString(),
  }, null, 2) + '\n');
  info(`bruta salva em ${path.relative(RAIZ, arq)}`);

  registro.chamadas.push({
    id: c.id,
    cnj: processo.numero_cnj,
    rota: c.rota,
    http: resposta.status,
    creditosUtilizados: creditos,
    precoCatalogo: c.precoCatalogo,
    arquivo: path.relative(RAIZ, arq),
    momento: new Date().toISOString(),
  });
  fs.writeFileSync(ARQ_REGISTRO, JSON.stringify(registro, null, 2) + '\n');

  if (!resposta.ok) {
    erro(`${c.id} respondeu ${resposta.status} — fila abortada de proposito`);
    aviso('sem nova tentativa automatica: erro e resultado, nao acidente (Bloco D)');
    break;
  }

  // Respiro entre chamadas. Nao e laco: a fila tem no maximo 3 itens
  if (indice < pendentes.length - 1) await new Promise(r => setTimeout(r, 1500));
}

// ===========================================================================
// Fechamento
// ===========================================================================

console.log(`\n${cor.neg}Resumo${cor.off}`);
console.log(`  chamadas gastas no total : ${registro.chamadas.length} de ${AUTORIZACAO.tetoDeChamadas}`);
console.log(`  custo somado nesta rodada: ${gastoTotalCentavos} centavos (R$ ${(gastoTotalCentavos / 100).toFixed(2)})`);
console.log(`  registro                 : ${path.relative(RAIZ, ARQ_REGISTRO)}`);

console.log(`\n${cor.neg}Agora, sem gastar mais nada:${cor.off}`);
console.log('  1. Abra "Uso dos Creditos" no painel e confira o debito real');
console.log('     A1 debitou 5 centavos? vale a tabela por rota.  300? o debito e fixo (§1-C)');
console.log('  2. Transcreva o registro para a §5 de docs/06-orcamento-de-chamadas-escavador.md');
console.log('  3. So depois disso, anonimize as brutas para gerar o instantaneo da demo\n');
