#!/usr/bin/env node
/**
 * monitorar.mjs — vigilância em diário oficial (API V1 do Escavador)
 * ---------------------------------------------------------------------------
 * ⚠️ ALGUMAS OPERAÇÕES DAQUI GASTAM DINHEIRO, E UMA DELAS GASTA TODO MÊS.
 *
 * Este script existe para exercitar a D-62 — vigiar o diário oficial por termo
 * (a OAB ou o nome do advogado) em vez de processo a processo. É a decisão que
 * troca R$ 600,00/mês por R$ 3,00/mês, e é onde nasce o prazo.
 *
 * O QUE A DOCUMENTAÇÃO OFICIAL CORRIGIU NO NOSSO MAPEAMENTO (lida em 26/08)
 *
 *   1. `origens_ids` é OBRIGATÓRIO quando tipo = termo. O mapeamento dizia
 *      "opcional". Sem ele a chamada volta 422 — e 422 custa o mesmo que 200
 *   2. `POST /monitoramentos` aparece como "Grátis" na documentação, embora o
 *      painel cobre a assinatura mensal. Ver a nota em §1 do LEIA-ME
 *   3. `POST /monitoramentos/testcallback` aparece como "PAGA". O mapeamento
 *      dizia 🆓. Não é rota de teste barata — custa como qualquer outra
 *   4. `variacoes` aceita no máximo 3
 *   5. `limite_aparicoes` tem padrão DOCUMENTADO de 200/mês, mas a criação de
 *      26/08 voltou com 1000. O padrão real depende da conta, então não se
 *      supõe: lê-se da resposta. Ao atingir o limite, o monitoramento PARA de
 *      capturar até o mês seguinte, sem erro e sem aviso (R-40)
 *
 * TRAVAS
 *   1. Sem --executar, não chama nada
 *   2. Operações gratuitas e pagas são comandos separados, e as pagas avisam
 *   3. Criar monitoramento exige --confirmo-custo-recorrente, escrito à mão
 *   4. Toda chamada vai para o registro de execução, igual ao capturar.mjs
 *
 * Uso:
 *   node captura/monitorar.mjs origens --executar          # GRÁTIS
 *   node captura/monitorar.mjs listar --executar           # GRÁTIS
 *   node captura/monitorar.mjs criar                       # ensaio
 *   node captura/monitorar.mjs criar --executar --confirmo-custo-recorrente
 *   node captura/monitorar.mjs aparicoes <id> --executar   # GRÁTIS
 *   node captura/monitorar.mjs remover <id> --executar     # GRÁTIS, e obrigatório
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const BASE = 'https://api.escavador.com';

const ARQ_ALVO     = path.join(AQUI, 'monitoramento.local.json');
const ARQ_REGISTRO = path.join(AQUI, 'registro-de-execucao.local.json');
const DIR_BRUTAS   = path.join(AQUI, 'respostas-brutas');

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', rub: '\x1b[31m', cin: '\x1b[90m' };
const ok    = (m) => console.log(`${cor.ver}  OK  ${cor.off} ${m}`);
const aviso = (m) => console.log(`${cor.ama} AVISO${cor.off} ${m}`);
const info  = (m) => console.log(`${cor.cin}      ${m}${cor.off}`);
function morrer(m) { console.log(`${cor.rub} ERRO ${cor.off} ${m}\n\nNada foi gasto.\n`); process.exit(1); }

// ---------------------------------------------------------------------------
// Catálogo de operações. O campo `paga` é o que decide se há trava.
// ---------------------------------------------------------------------------
const OPERACOES = {
  origens:   { metodo: 'GET',    rota: '/api/v1/origens',                     paga: false, objetivo: 'IDs dos diários por estado — obrigatórios para criar monitoramento por termo. E, de graça, responde se a V1 aceita o mesmo token da V2' },
  listar:    { metodo: 'GET',    rota: '/api/v1/monitoramentos',              paga: false, objetivo: 'Monitoramentos ativos — confere que nada ficou esquecido cobrando' },
  criar:     { metodo: 'POST',   rota: '/api/v1/monitoramentos',              paga: true,  objetivo: 'Contrato de criação da vigilância em diário oficial por termo (D-62)' },
  aparicoes: { metodo: 'GET',    rota: '/api/v1/monitoramentos/{id}/aparicoes', paga: false, objetivo: 'Formato da aparição — a peça que dispara prazo' },
  remover:   { metodo: 'DELETE', rota: '/api/v1/monitoramentos/{id}',         paga: false, objetivo: 'Encerrar a assinatura antes da renovação mensal' },
};

const [comando, ...resto] = process.argv.slice(2);
const executar = process.argv.includes('--executar');
const confirmaRecorrente = process.argv.includes('--confirmo-custo-recorrente');
const idArg = resto.find((a) => /^\d+$/.test(a));

if (!comando || !OPERACOES[comando]) {
  console.log(`\n${cor.neg}Vigilância em diário oficial${cor.off}\n`);
  for (const [nome, o] of Object.entries(OPERACOES)) {
    console.log(`  ${cor.neg}${nome.padEnd(10)}${cor.off} ${o.paga ? `${cor.ama}PAGA${cor.off}` : `${cor.ver}grátis${cor.off}`}  ${o.metodo} ${o.rota}`);
  }
  console.log('');
  process.exit(comando ? 1 : 0);
}

const op = OPERACOES[comando];

console.log(`\n${cor.neg}Vigilância em diário oficial — ${comando}${cor.off}`);
console.log(`${cor.cin}${op.metodo} ${op.rota} · ${op.paga ? 'PAGA — R$ 3,00 na cota de teste' : 'gratuita'}${cor.off}\n`);

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

// ---------------------------------------------------------------------------
// Monta o corpo de `criar` a partir do alvo local
// ---------------------------------------------------------------------------
let corpoEnvio = null;

if (comando === 'criar') {
  if (!fs.existsSync(ARQ_ALVO)) {
    morrer(
      `falta ${path.relative(RAIZ, ARQ_ALVO)}.\n\n` +
      '      É o arquivo que diz QUEM vigiar. Fica fora do Git, como o número\n' +
      '      de processo (D-95): nome e OAB de advogado são dado de pessoa.\n\n' +
      '      Modelo:\n' +
      '      {\n' +
      '        "termo": "NOME COMPLETO DA ADVOGADA",\n' +
      '        "oab": "3899/AP",\n' +
      '        "variacoes": ["ate 3 grafias alternativas"],\n' +
      '        "origens_ids": [12, 34],\n' +
      '        "limite_aparicoes": null\n' +
      '      }\n\n' +
      '      Os origens_ids saem de:  node captura/monitorar.mjs origens --executar'
    );
  }

  const alvo = JSON.parse(fs.readFileSync(ARQ_ALVO, 'utf8'));

  if (!alvo.termo || !String(alvo.termo).trim()) {
    morrer('o alvo não tem "termo". Sem termo não há o que vigiar');
  }
  // A documentação é explícita: origens_ids é obrigatório quando tipo = termo.
  // O mapeamento dizia "opcional" — seguir o mapeamento custaria R$ 3,00 por
  // um 422. Esta trava é a lição virando código.
  if (!Array.isArray(alvo.origens_ids) || !alvo.origens_ids.length) {
    morrer(
      'o alvo não tem "origens_ids", e a API exige quando tipo = termo.\n' +
      '      Rode primeiro:  node captura/monitorar.mjs origens --executar  (grátis)'
    );
  }
  if (Array.isArray(alvo.variacoes) && alvo.variacoes.length > 3) {
    morrer(`"variacoes" tem ${alvo.variacoes.length} itens; a API aceita no máximo 3`);
  }

  corpoEnvio = { tipo: 'termo', termo: String(alvo.termo).trim(), origens_ids: alvo.origens_ids };
  if (alvo.variacoes?.length) corpoEnvio.variacoes = alvo.variacoes;
  if (alvo.termos_auxiliares?.length) corpoEnvio.termos_auxiliares = alvo.termos_auxiliares;
  if (alvo.limite_aparicoes != null) corpoEnvio.limite_aparicoes = alvo.limite_aparicoes;

  ok(`alvo: termo com ${corpoEnvio.termo.length} caracteres (não exibido — dado de pessoa)`);
  ok(`diários vigiados: ${corpoEnvio.origens_ids.length}`);
  info(`variações: ${corpoEnvio.variacoes?.length ?? 0} · auxiliares: ${corpoEnvio.termos_auxiliares?.length ?? 0}`);
  info(`limite de aparições: ${corpoEnvio.limite_aparicoes ?? 'o que a API decidir — medido em 26/08: 1000/mês, não os 200 da documentação'}`);
}

if ((comando === 'aparicoes' || comando === 'remover') && !idArg) {
  morrer(`o comando "${comando}" precisa do id do monitoramento`);
}

// ---------------------------------------------------------------------------
// Regra 5 do orçamento — chamada já feita nunca se repete
//
// Esta trava faltava, e a falta apareceu em 26/08: a vigilância foi criada às
// 15:09 com sucesso, e às 17:43 uma segunda tentativa foi disparada porque
// ninguém — nem o script, nem o assistente — leu o registro que estava no
// disco. A API salvou o dia com um 422 "Você já monitora este termo", mas
// salvar o dia não é trabalho da API: se ela tivesse aceitado, seriam duas
// assinaturas mensais correndo, e a segunda sem dono e sem alarme (R-41).
//
// A memória de que algo foi feito precisa morar onde a próxima sessão vai
// olhar, e ser conferida por código — não por lembrança.
// ---------------------------------------------------------------------------
if (comando === 'criar' && fs.existsSync(ARQ_REGISTRO)) {
  const anterior = JSON.parse(fs.readFileSync(ARQ_REGISTRO, 'utf8'));
  const jaCriado = (anterior.chamadas || []).find(
    (c) => c.id === 'V1-criar' && c.http >= 200 && c.http < 300
  );
  if (jaCriado) {
    morrer(
      'já existe um monitoramento criado com sucesso por este script.\n' +
      `      Foi em ${jaCriado.momento?.slice(0, 19).replace('T', ' ')} — ver ${jaCriado.arquivo}\n\n` +
      '      Criar de novo seria uma SEGUNDA assinatura mensal, cobrando em\n' +
      '      paralelo. Confira o inventário antes, de graça:\n' +
      '        node captura/monitorar.mjs listar --executar\n\n' +
      '      Se for mesmo caso de criar outra (outro advogado, outro termo),\n' +
      '      isso é decisão do usuário — peça na hora, e registre a assinatura\n' +
      '      nova na tabela de docs/00-estado-atual.md.'
    );
  }
}

// ---------------------------------------------------------------------------
// Ensaio, e a trava do custo recorrente
// ---------------------------------------------------------------------------
const rota = op.rota.replace('{id}', idArg ?? '');
const url = BASE + rota;

console.log(`\n${cor.neg}Plano${cor.off}\n`);
console.log(`  ${op.metodo} ${url}`);
console.log(`  objetivo: ${op.objetivo}`);
if (corpoEnvio) console.log(`  corpo   : tipo=termo · ${corpoEnvio.origens_ids.length} origens · termo omitido do log`);
console.log('');

if (op.paga) {
  aviso('esta operação DEBITA R$ 3,00 da cota de teste');
  if (comando === 'criar') {
    aviso('e cria ASSINATURA MENSAL: cobra de novo a cada renovação enquanto estiver ativa');
    info('remova antes de completar um mês:  node captura/monitorar.mjs remover <id> --executar');
  }
  console.log('');
}

if (!executar) {
  console.log(`${cor.ama}ENSAIO — nada foi chamado e nada foi gasto.${cor.off}`);
  console.log(`Para valer: acrescente ${cor.neg}--executar${cor.off}${op.paga && comando === 'criar' ? ` ${cor.neg}--confirmo-custo-recorrente${cor.off}` : ''}\n`);
  process.exit(0);
}

if (comando === 'criar' && !confirmaRecorrente) {
  morrer(
    'criar monitoramento gera cobrança que se repete todo mês.\n' +
    '      Confirme por escrito:  --confirmo-custo-recorrente'
  );
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
      'User-Agent': 'lex-ai-n8n/monitorar (validacao de contrato)',
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
const arq = path.join(DIR_BRUTAS, `${carimbo}__V1-${comando}__${resposta.status}.json`);
fs.writeFileSync(arq, JSON.stringify({
  id: `V1-${comando}`,
  objetivo: op.objetivo,
  requisicao: { metodo: op.metodo, url, corpo: corpoEnvio ? { ...corpoEnvio, termo: '[OMITIDO]' } : null },
  resposta: { status: resposta.status, cabecalhos, corpo },
  momento: new Date().toISOString(),
}, null, 2) + '\n');
info(`bruta salva em ${path.relative(RAIZ, arq)}`);

const registro = fs.existsSync(ARQ_REGISTRO)
  ? JSON.parse(fs.readFileSync(ARQ_REGISTRO, 'utf8'))
  : { chamadas: [] };
registro.chamadas.push({
  id: `V1-${comando}`,
  rota,
  http: resposta.status,
  creditosUtilizados: creditos,
  precoCatalogo: op.paga ? 'R$ 3,00 (teste)' : 'gratuita',
  arquivo: path.relative(RAIZ, arq),
  momento: new Date().toISOString(),
});
fs.writeFileSync(ARQ_REGISTRO, JSON.stringify(registro, null, 2) + '\n');

// ---------------------------------------------------------------------------
// Leitura do resultado — o mínimo, sem despejar dado de pessoa no terminal
// ---------------------------------------------------------------------------
let dados = null;
try { dados = JSON.parse(corpo); } catch { /* corpo não-JSON: já está salvo */ }

if (!resposta.ok) {
  console.log('');
  aviso(`a API recusou: ${String(corpo).slice(0, 300)}`);
  if (resposta.status === 403) info('403 nesta API significa saldo bloqueado, não permissão (§5.1 do orçamento)');
  if (resposta.status === 422) info('422 é parâmetro inválido — releia a documentação antes de repetir, repetir custa de novo');
  console.log('');
  process.exit(1);
}

if (comando === 'origens' && Array.isArray(dados)) {
  console.log(`\n${cor.neg}Diários disponíveis, por estado${cor.off}\n`);
  for (const estado of dados) {
    const ds = estado.diarios || [];
    if (!ds.length) continue;
    console.log(`  ${cor.neg}${estado.nome}${cor.off} (${ds.length})`);
    for (const d of ds) console.log(`      ${String(d.id).padStart(5)}  ${d.sigla || ''} — ${d.nome}`);
  }
  console.log(`\n  Escolha os ids e grave em ${path.relative(RAIZ, ARQ_ALVO)}.\n`);
}

if (comando === 'criar' && dados?.monitoramento) {
  const m = dados.monitoramento;
  console.log('');
  ok(`monitoramento criado — ${cor.neg}id ${m.id}${cor.off}`);
  info(`diários monitorados: ${m.numero_diarios_monitorados} de ${m.numero_diarios_disponiveis}`);
  info(`limite de aparições: ${m.limite_aparicoes ?? 'não informado'} — anote, é o teto que cega em silêncio (R-40)`);
  // A data-limite precisa sobreviver a esta sessão. A conversa some; o
  // documento fica. Por isso a linha sai pronta para colar, em vez de sair
  // como conselho — conselho no terminal ninguém copia.
  const hoje = new Date().toISOString().slice(0, 10);
  const limite = new Date(Date.now() + 27 * 864e5).toISOString().slice(0, 10);

  console.log('');
  aviso(`ISTO COBRA TODO MÊS. Remova antes de ${cor.neg}${limite}${cor.off}`);
  info(`node captura/monitorar.mjs remover ${m.id} --executar`);
  console.log('');
  console.log(`${cor.neg}Cole esta linha na tabela "Assinaturas do Escavador" de docs/00-estado-atual.md:${cor.off}\n`);
  console.log(`| vigilância em diário (OAB) | ${m.id} | ${hoje} | **${limite}** | teste | ativa |`);
  console.log('');
  info('sem isso, a próxima sessão não sabe que existe uma assinatura correndo (R-13)');
}

if (comando === 'listar' && dados?.items) {
  console.log(`\n${cor.neg}Monitoramentos ativos: ${dados.items.length}${cor.off}\n`);
  for (const m of dados.items) {
    console.log(`  id ${String(m.id).padStart(6)}  ${m.tipo}  aparições: ${m.qtd_aparicoes ?? 0}  desativado: ${m.desativado}`);
  }
  if (dados.items.length) console.log(`\n  ${cor.ama}cada um destes é cobrança mensal enquanto existir.${cor.off}`);
}

if (comando === 'remover') {
  console.log('');
  ok('monitoramento removido — a assinatura não renova no próximo ciclo');
}

console.log(`\n${cor.neg}Agora, sem gastar mais nada:${cor.off}`);
console.log('  1. Transcreva o resultado para a §5 de docs/06-orcamento-de-chamadas-escavador.md');
console.log('  2. Confira "Uso dos Créditos" no painel e compare com o registro\n');
