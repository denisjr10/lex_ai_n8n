#!/usr/bin/env node
/**
 * comparar-tribunal.mjs — Bloco E: a mesma pergunta, em outro ramo da Justica
 * ---------------------------------------------------------------------------
 * Este script gasta dinheiro de verdade. Leia LEIA-ME.md antes de rodar.
 *
 * POR QUE ELE EXISTE
 *
 * Toda a captura ate aqui olhou UM processo, de UM tribunal: o P1, civel, do
 * TJAP. O modelo de dados do servidor MCP vai ser desenhado em cima do que
 * aquelas respostas mostraram — e nao ha nenhuma prova de que o formato se
 * repete fora dali. "Polo ativo" e "polo passivo" no civel sao "reclamante" e
 * "reclamado" no trabalhista. O grau, o sistema, a unidade de origem e a
 * propria capa podem vir com outra forma.
 *
 * Descobrir isso agora custa R$ 3,05. Descobrir depois custa reescrever o
 * modelo com o MCP ja construido em cima dele.
 *
 * O alvo e o P4 — reclamacao trabalhista no TRT da 8a Regiao. Nao e so "outro
 * tribunal": e outro RAMO da Justica, que e o teste forte. Escolhido entre os
 * 8 processos dos autos porque e o unico fora do TJAP que nao esta em segredo
 * de justica (o outro candidato, TJPB, e vara de familia com menor de idade).
 *
 * POR QUE NAO E O SCRIPT DOS BLOCOS A E B
 *
 * Aquele tem teto proprio de 3 chamadas, ja atingido, e uma autorizacao
 * congelada em 24/08 que diz "so o P1". Alterar teto e alvo de um artefato
 * auditado para caber uma autorizacao nova e apagar a auditoria. Bloco novo,
 * script novo — foi o que se fez no Bloco C.
 *
 * As travas sao as mesmas, na mesma ordem:
 *   1. Sem --executar, nao chama nada. So mostra o plano
 *   2. Teto absoluto de chamadas E de gasto. Passou, recusa
 *   3. Chamada ja feita para o mesmo CNJ nunca se repete (Regra 5)
 *   4. Digito verificador do CNJ conferido antes de gastar
 *   5. Segredo de justica recusa, mesmo com --executar
 *   6. Uma chamada por vez, em serie. Sem paralelismo
 *   7. Erro aborta o restante da fila. Sem nova tentativa automatica
 *
 * Uso:
 *   node captura/comparar-tribunal.mjs                # ensaio, nao gasta
 *   node captura/comparar-tribunal.mjs --executar     # gasta ~R$ 3,05
 *   node captura/comparar-tribunal.mjs --comparar     # de graca, le do disco
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

// ===========================================================================
// ORCAMENTO AUTORIZADO — Bloco E, 27/08/2026
// Autorizado pelo usuario no chat, na hora, como a Regra 8 exige.
// Alterar qualquer coisa aqui exige novo aval.
// ===========================================================================
const AUTORIZACAO = {
  data: '2026-08-27',
  bloco: 'E',
  processoAutorizado: 'P4',        // TRT8, trabalhista. Os demais NAO estao autorizados
  tetoDeChamadas: 2,
  tetoDeGastoCentavos: 400,        // ~R$ 4,00: R$ 3,05 previstos, com folga de erro de tabela
};

/** As duas chamadas, na ordem. E1 vem primeiro de proposito: custa R$ 0,05 e
 *  serve de calibragem. Se a autenticacao ou o CNJ estiverem errados, o erro
 *  aparece por cinco centavos, e a chamada de R$ 3,00 nao chega a sair. */
const FILA = [
  {
    id: 'E1',
    rota: '/api/v2/processos/numero_cnj/{numero}/envolvidos',
    query: { limit: 20 },
    precoCatalogo: 'R$ 0,05',
    objetivo: 'Como o trabalhista nomeia as partes — RECLAMANTE/RECLAMADO contra ' +
              'AUTOR/REU — e se o modelo do envolvido e o mesmo do civel',
  },
  {
    id: 'E2',
    rota: '/api/v2/processos/numero_cnj/{numero}',
    query: {},
    precoCatalogo: 'R$ 3,00',
    objetivo: 'A capa fora do TJAP: fontes, graus, sistema (PJe), unidade de origem, ' +
              'valor da causa, e quais campos vem nulos em outro ramo',
  },
];

const BASE = 'https://api.escavador.com';
const ARQ_PROCESSOS = path.join(AQUI, 'processos.local.json');
const ARQ_REGISTRO  = path.join(AQUI, 'registro-de-execucao.local.json');
const DIR_BRUTAS    = path.join(AQUI, 'respostas-brutas');

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', ver2: '\x1b[31m', cin: '\x1b[90m' };
const ok    = (m) => console.log(`${cor.ver}  OK  ${cor.off} ${m}`);
const aviso = (m) => console.log(`${cor.ama} AVISO${cor.off} ${m}`);
const erro  = (m) => console.log(`${cor.ver2} ERRO ${cor.off} ${m}`);
const info  = (m) => console.log(`${cor.cin}      ${m}${cor.off}`);

function morrer(msg) {
  erro(msg);
  console.log('\nNada foi gasto. Corrija e rode de novo.\n');
  process.exit(1);
}

/** Digito verificador do CNJ — Resolucao CNJ 65/2008, ISO 7064 MOD 97-10.
 *  Aritmetica local, custo zero. */
function cnjValido(cnj) {
  const m = String(cnj).match(/^(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})$/);
  if (!m) return false;
  const [, seq, dv, ano, j, tr, origem] = m;
  const base = BigInt(seq + ano + j + tr + origem);
  return String(98n - ((base * 100n) % 97n)).padStart(2, '0') === dv;
}

function lerJson(arquivo, seFaltar) {
  if (!fs.existsSync(arquivo)) return seFaltar;
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

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
  if (!/^[A-Za-z0-9._-]+$/.test(t)) return { token: null, sujo: true, origem: 'captura/token.local' };
  return { token: t, origem: 'captura/token.local' };
}

// ===========================================================================
// Modo --comparar: de graca, so le o que ja esta no disco
// ===========================================================================

/** Achata um objeto em caminhos de campo. O que interessa nao e o VALOR (dado
 *  de cliente, que nao sai daqui), e sim o CONJUNTO DE CAMPOS e o tipo de cada
 *  um. Comparar dois conjuntos de caminhos responde a pergunta do bloco sem
 *  imprimir uma linha de dado pessoal. */
function caminhos(valor, prefixo = '', saida = new Map()) {
  if (valor === null) { saida.set(prefixo, 'null'); return saida; }
  if (Array.isArray(valor)) {
    saida.set(prefixo, `array[${valor.length}]`);
    if (valor.length) caminhos(valor[0], `${prefixo}[]`, saida);
    return saida;
  }
  if (typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) caminhos(v, prefixo ? `${prefixo}.${k}` : k, saida);
    return saida;
  }
  saida.set(prefixo, typeof valor);
  return saida;
}

function corpoDe(arquivo) {
  const d = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  const bruto = d?.resposta?.corpo;
  if (typeof bruto !== 'string') return bruto ?? null;
  try { return JSON.parse(bruto); } catch { return null; }
}

/** Acha a resposta de sucesso mais recente de um id. */
function ultimaResposta(id) {
  if (!fs.existsSync(DIR_BRUTAS)) return null;
  const alvos = fs.readdirSync(DIR_BRUTAS)
    .filter(f => f.includes(`__${id}__`) && /__2\d\d\.json$/.test(f))
    .sort();
  if (!alvos.length) return null;
  return path.join(DIR_BRUTAS, alvos[alvos.length - 1]);
}

function comparar() {
  console.log(`\n${cor.neg}Comparacao de formato entre ramos da Justica${cor.off}`);
  console.log(`${cor.cin}Leitura de arquivo. Nao toca a rede, nao gasta nada.${cor.off}\n`);

  const pares = [
    { titulo: 'envolvidos',      civel: 'A1', trabalhista: 'E1' },
    { titulo: 'capa do processo', civel: 'B1', trabalhista: 'E2' },
  ];

  let algumFaltou = false;
  for (const par of pares) {
    const arqCivel = ultimaResposta(par.civel);
    const arqTrab  = ultimaResposta(par.trabalhista);
    console.log(`${cor.neg}${par.titulo}${cor.off}  (${par.civel} civel × ${par.trabalhista} trabalhista)`);

    if (!arqCivel || !arqTrab) {
      algumFaltou = true;
      info(`falta a resposta de ${!arqCivel ? par.civel : par.trabalhista} — a captura ainda nao rodou`);
      console.log('');
      continue;
    }

    const a = caminhos(corpoDe(arqCivel));
    const b = caminhos(corpoDe(arqTrab));

    const comuns    = [...a.keys()].filter(k => b.has(k));
    const soCivel   = [...a.keys()].filter(k => !b.has(k));
    const soTrab    = [...b.keys()].filter(k => !a.has(k));
    const tipoMudou = comuns.filter(k => a.get(k) !== b.get(k));

    ok(`${a.size} campos no civel, ${b.size} no trabalhista, ${comuns.length} em comum`);
    if (soCivel.length) { aviso(`${soCivel.length} campo(s) so no civel:`);      for (const k of soCivel.slice(0, 25)) info(`- ${k}`); }
    if (soTrab.length)  { aviso(`${soTrab.length} campo(s) so no trabalhista:`); for (const k of soTrab.slice(0, 25)) info(`+ ${k}`); }
    if (tipoMudou.length) {
      aviso(`${tipoMudou.length} campo(s) presentes nos dois, com tipo diferente:`);
      for (const k of tipoMudou.slice(0, 25)) info(`~ ${k}: ${a.get(k)} -> ${b.get(k)}`);
    }
    if (!soCivel.length && !soTrab.length && !tipoMudou.length) info('nenhuma diferenca de forma — o modelo aguenta os dois ramos');
    console.log('');
  }

  if (algumFaltou) {
    console.log(`${cor.ama}Comparacao incompleta${cor.off} — falta capturar o lado trabalhista.\n`);
  } else {
    console.log('Diferenca de campo e requisito do modelo de dados: o MCP tem de');
    console.log('devolver os dois no mesmo envelope. Transcreva para docs/mapeamento-escavador.md.\n');
  }
  process.exit(0);
}

if (process.argv.includes('--comparar')) comparar();

// ===========================================================================
// Preparacao — tudo que pode dar errado, da errado ANTES de gastar
// ===========================================================================

const executar = process.argv.includes('--executar');

console.log(`\n${cor.neg}Bloco ${AUTORIZACAO.bloco} — variacao de formato entre ramos da Justica${cor.off}`);
console.log(`${cor.cin}Autorizado em ${AUTORIZACAO.data} · teto de ${AUTORIZACAO.tetoDeChamadas} chamadas e R$ ${(AUTORIZACAO.tetoDeGastoCentavos / 100).toFixed(2)}${cor.off}\n`);

const cfg = lerJson(ARQ_PROCESSOS, null);
if (!cfg) morrer(`nao encontrei ${path.relative(RAIZ, ARQ_PROCESSOS)}`);

const processo = (cfg.processos || []).find(p => p.apelido === AUTORIZACAO.processoAutorizado);
if (!processo) {
  morrer(`o processo ${AUTORIZACAO.processoAutorizado} nao esta em processos.local.json. ` +
         `Ele e o alvo desta autorizacao — sem ele, nao ha o que chamar`);
}
if (!cnjValido(processo.numero_cnj)) {
  morrer(`o CNJ do ${processo.apelido} tem digito verificador invalido. ` +
         `Chamar assim gastaria credito para receber 404`);
}
if (processo.segredo_justica === true) {
  morrer(`o ${processo.apelido} esta marcado como SEGREDO DE JUSTICA. ` +
         `Nao se consulta por aqui, nem com --executar`);
}
ok(`processo ${processo.apelido} (${processo.tribunal} · ${processo.ramo ?? 'ramo nao anotado'}) · digito confere · sem segredo`);

const outros = (cfg.processos || []).filter(p => p.apelido !== AUTORIZACAO.processoAutorizado);
if (outros.length) info(`fora desta autorizacao: ${outros.map(p => `${p.apelido} (${p.tribunal})`).join(', ')}`);

// -- registro de execucao ------------------------------------------------
// O registro e COMPARTILHADO com os demais scripts de captura: e o livro-caixa
// unico do projeto. O teto DESTE bloco, porem, conta so o que este bloco
// gastou — senao um bloco novo herdaria o consumo dos anteriores e nasceria
// travado sem ter gasto um centavo.
const registro = lerJson(ARQ_REGISTRO, { chamadas: [] });
const jaFeitas = new Set(registro.chamadas.map(c => `${c.id}:${c.cnj}`));

const idsDoBloco = new Set(FILA.map(c => c.id));
const naoCobrada = (c) => c.http === 401 || c.http === 403 || Number(c.creditosUtilizados) === 0;
const doBloco = registro.chamadas.filter(c => idsDoBloco.has(c.id));
const cobradas = doBloco.filter(c => !naoCobrada(c));
const gastoAnterior = doBloco.reduce((s, c) => s + (Number(c.creditosUtilizados) || 0), 0);

if (cobradas.length >= AUTORIZACAO.tetoDeChamadas) {
  morrer(`o teto de ${AUTORIZACAO.tetoDeChamadas} chamadas do Bloco ${AUTORIZACAO.bloco} ja foi atingido. Ampliar exige novo aval`);
}
if (gastoAnterior >= AUTORIZACAO.tetoDeGastoCentavos) {
  morrer(`o teto de gasto do Bloco ${AUTORIZACAO.bloco} ja foi atingido (${gastoAnterior} centavos)`);
}
ok(`Bloco ${AUTORIZACAO.bloco}: ${cobradas.length} de ${AUTORIZACAO.tetoDeChamadas} chamadas cobradas, ${gastoAnterior} centavos gastos`);

const pendentes = FILA.filter(c => !jaFeitas.has(`${c.id}:${processo.numero_cnj}`));
const repetidas = FILA.length - pendentes.length;
if (repetidas) aviso(`${repetidas} chamada(s) ja foram feitas para este CNJ e serao puladas (Regra 5)`);

if (!pendentes.length) {
  ok('nada a fazer — as duas chamadas deste bloco ja foram executadas');
  console.log(`\nPara ver o resultado sem gastar:  ${cor.neg}node captura/comparar-tribunal.mjs --comparar${cor.off}\n`);
  process.exit(0);
}

// -- token ---------------------------------------------------------------
const { token, origem, sujo } = lerToken();
if (sujo) {
  aviso('o arquivo de token tem caracteres que um token nao tem');
  info('causa mais comum no Windows: gravado em UTF-16 e lido como texto comum');
  info('regrave com:  node guardar-segredo.mjs captura/token.local');
} else if (!token) {
  aviso('token nao encontrado — o ensaio segue, a execucao nao');
} else {
  ok(`token carregado de ${origem} (${token.length} caracteres, nao exibido)`);
}

// ===========================================================================
// Plano
// ===========================================================================

console.log(`\n${cor.neg}Plano${cor.off}\n`);
for (const c of pendentes) {
  const qs = new URLSearchParams(c.query).toString();
  console.log(`  ${cor.neg}${c.id}${cor.off}  GET ${c.rota.replace('{numero}', processo.numero_cnj)}${qs ? '?' + qs : ''}`);
  console.log(`      preco de catalogo: ${c.precoCatalogo}`);
  console.log(`      objetivo: ${c.objetivo}\n`);
}

if (!executar) {
  console.log(`${cor.ama}ENSAIO — nada foi chamado e nada foi gasto.${cor.off}`);
  console.log(`Para gastar de verdade, acrescente ${cor.neg}--executar${cor.off}\n`);
  process.exit(0);
}

if (!token) morrer('sem token, nao ha execucao');

// ===========================================================================
// Execucao — uma por vez, sem tentativa nova, abortando ao primeiro erro
// ===========================================================================

fs.mkdirSync(DIR_BRUTAS, { recursive: true });

const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
let gastoCentavos = 0;

for (const [indice, c] of pendentes.entries()) {
  // Trava de gasto DENTRO do laco: se E1 vier muito mais cara que a tabela
  // diz, E2 nao sai. A tabela de precos deste projeto foi desmentida pela
  // medicao (D-108) — confiar nela para autorizar a proxima chamada seria
  // repetir o erro que gerou a regra.
  if (gastoAnterior + gastoCentavos >= AUTORIZACAO.tetoDeGastoCentavos) {
    aviso(`teto de gasto do bloco atingido (${gastoAnterior + gastoCentavos} centavos) — fila interrompida`);
    break;
  }

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

  const cabecalhos = Object.fromEntries(resposta.headers.entries());
  const creditos = cabecalhos['creditos-utilizados'] ?? null;
  if (creditos !== null) {
    gastoCentavos += Number(creditos) || 0;
    ok(`HTTP ${resposta.status} · Creditos-Utilizados: ${creditos} centavos`);
  } else {
    ok(`HTTP ${resposta.status} · cabecalho Creditos-Utilizados ausente`);
  }

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
    aviso('sem nova tentativa automatica: erro e resultado, nao acidente');
    break;
  }

  if (indice < pendentes.length - 1) await new Promise(r => setTimeout(r, 1500));
}

// ===========================================================================
// Fechamento
// ===========================================================================

console.log(`\n${cor.neg}Fechamento${cor.off}`);
info(`gasto medido nesta execucao: ${gastoCentavos} centavos (R$ ${(gastoCentavos / 100).toFixed(2)})`);
console.log(`\n${cor.neg}Agora, sem gastar mais nada:${cor.off}`);
console.log(`  1. ${cor.neg}node captura/comparar-tribunal.mjs --comparar${cor.off}  — o diff de formato, de graca`);
console.log('  2. Transcreva o custo medido para a §5 de docs/06-orcamento-de-chamadas-escavador.md');
console.log('  3. Confira "Uso dos Creditos" no painel e compare com o registro\n');
