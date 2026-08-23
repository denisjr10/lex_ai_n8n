#!/usr/bin/env node
/**
 * anonimizar.mjs — transforma respostas cruas do Escavador no instantaneo da demo
 * ---------------------------------------------------------------------------
 * Nao gasta credito. Le arquivo, escreve arquivo.
 *
 * Faz duas coisas ao mesmo tempo, e as duas importam:
 *
 *   1. REDUZ — a resposta da API tem centenas de campos aninhados; a demo
 *      precisa de umas duas dezenas. O instantaneo e o contrato de dados dos
 *      fluxos do n8n, e esta documentado em demo/CONTRATO-DO-INSTANTANEO.md
 *
 *   2. ANONIMIZA — nome de parte, nome de advogado, CPF, CNPJ, OAB, e-mail,
 *      telefone e o proprio numero CNJ saem substituidos. Dado de cliente nao
 *      entra no historico do Git (D-48, D-95, §9 das diretrizes)
 *
 * A substituicao e DETERMINISTICA: o mesmo nome vira sempre o mesmo pseudonimo,
 * na mesma execucao e em execucoes futuras. Sem isso, "Maria" viraria pessoas
 * diferentes na capa e na movimentacao, e o texto perderia sentido.
 *
 * Uso:
 *   node captura/anonimizar.mjs --exemplos    # usa os exemplos oficiais → ensaio.json
 *   node captura/anonimizar.mjs               # usa as respostas capturadas → processos.json
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const DIR_INSTANTANEO = path.join(RAIZ, 'demo', 'instantaneo');

const usarExemplos = process.argv.includes('--exemplos');

// ===========================================================================
// Pseudonimos — deliberadamente comuns, para nao parecerem dados reais
// ===========================================================================

const NOMES_PF = [
  'Ana Beatriz Nogueira', 'Carlos Eduardo Rangel', 'Helena Vasconcelos Pires',
  'Rafael Monteiro Alencar', 'Luiza Ferraz Bittencourt', 'Tiago Queiroz Amorim',
  'Beatriz Sampaio Coutinho', 'Marcelo Andrade Peixoto', 'Clara Rezende Fontoura',
  'Gustavo Teixeira Mourão', 'Isabela Prado Cavalcanti', 'Bruno Siqueira Lacerda',
];
const NOMES_PJ = [
  'Comercial Aurora Ltda.', 'Transportadora Vale Claro S.A.', 'Construtora Pedra Alta Ltda.',
  'Distribuidora Norte Sul Ltda.', 'Agropecuária Campo Verde S.A.',
];

/** Hash estavel → indice. Mesmo nome, mesmo pseudonimo, hoje e daqui a um mes. */
function indiceEstavel(texto, tamanho) {
  const h = crypto.createHash('sha256').update(texto.toLowerCase().trim()).digest();
  return h.readUInt32BE(0) % tamanho;
}

/** Cofre de substituicoes. Vive so na memoria desta execucao — o mapa entre
 *  nome real e pseudonimo NUNCA e gravado. Sem mapa, nao ha reidentificacao. */
class Cofre {
  constructor() { this.porNome = new Map(); this.usados = new Set(); }

  pseudonimo(nomeReal, tipoPessoa) {
    if (!nomeReal || typeof nomeReal !== 'string') return nomeReal;
    const chave = nomeReal.toLowerCase().trim();
    if (this.porNome.has(chave)) return this.porNome.get(chave);

    const lista = tipoPessoa === 'JURIDICA' ? NOMES_PJ : NOMES_PF;
    let i = indiceEstavel(nomeReal, lista.length);
    let escolhido = lista[i];
    // colisao: anda na lista ate achar um livre
    let voltas = 0;
    while (this.usados.has(escolhido) && voltas < lista.length) {
      i = (i + 1) % lista.length; escolhido = lista[i]; voltas++;
    }
    if (this.usados.has(escolhido)) escolhido = `${lista[i]} (${this.usados.size})`;

    this.usados.add(escolhido);
    this.porNome.set(chave, escolhido);
    return escolhido;
  }

  /** Nomes reais em ordem decrescente de tamanho — para trocar "Maria da Silva"
   *  antes de "Maria", e nao deixar sobra reconhecivel no texto livre. */
  paresParaTextoLivre() {
    return [...this.porNome.entries()].sort((a, b) => b[0].length - a[0].length);
  }
}

// ===========================================================================
// Redacao de padroes — o que sobra no texto livre
// ===========================================================================

const PADROES = [
  [/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF]'],
  [/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '[CNPJ]'],
  [/\bOAB\s*\/?\s*[A-Z]{2}\s*n?º?\s*[\d.]+\b/gi, '[OAB]'],
  [/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, '[EMAIL]'],
  [/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g, '[TELEFONE]'],
  [/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g, '[CNJ]'],
];

function limparTexto(txt, cofre) {
  if (typeof txt !== 'string') return txt;
  let s = txt;
  for (const [real, falso] of cofre.paresParaTextoLivre()) {
    s = s.replace(new RegExp(real.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), falso);
  }
  for (const [re, marca] of PADROES) s = s.replace(re, marca);
  return s;
}

/** CNJ pseudonimo: preserva tribunal e ano (nao identificam sozinhos) e troca
 *  a sequencia, recalculando o digito verificador para o numero seguir valido. */
function cnjPseudonimo(cnj) {
  const m = String(cnj || '').match(/^(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})$/);
  if (!m) return '0000000-00.0000.0.00.0000';
  const [, seq, , ano, j, tr, origem] = m;
  const nova = String(indiceEstavel(seq + ano, 9_000_000) + 1_000_000).padStart(7, '0');
  const base = BigInt(nova + ano + j + tr + origem);
  const dv = String(98n - ((base * 100n) % 97n)).padStart(2, '0');
  return `${nova}-${dv}.${ano}.${j}.${tr}.${origem}`;
}

// ===========================================================================
// Transformacao: resposta da API → instantaneo
// ===========================================================================

/** ATENCAO: existem DUAS formas de envolvido na V2, e elas nao sao iguais.
 *
 *   a) aninhado em `capa.fontes[].envolvidos[]`
 *      → tipo, polo e advogados ficam no proprio objeto
 *
 *   b) devolvido por `GET .../envolvidos`
 *      → tipo, polo e advogados ficam dentro de `participacoes_processo[]`,
 *        porque a mesma pessoa pode participar em varios polos e fontes
 *
 * Tratar as duas como uma so produz papel e polo nulos — foi o que aconteceu na
 * primeira versao, e o instantaneo de ensaio revelou antes de custar dinheiro.
 */
function montarEnvolvido(e, cofre) {
  const part = (e.participacoes_processo || [])[0] || null;
  const advogados = part ? (part.advogados || []) : (e.advogados || []);

  return {
    nome: cofre.pseudonimo(e.nome, e.tipo_pessoa),
    papel: (part?.tipo_normalizado ?? e.tipo_normalizado) || (part?.tipo ?? e.tipo) || null,
    polo: (part?.polo ?? e.polo) || null,
    tipo_pessoa: e.tipo_pessoa || null,
    // Entrada sem nome existe nos dados reais e nao serve para nada na demo
    advogados: advogados
      .filter(a => a && typeof a.nome === 'string' && a.nome.trim())
      .map(a => ({
        nome: cofre.pseudonimo(a.nome, a.tipo_pessoa),
        oab: (a.oabs || []).length ? `${a.oabs[0].uf} [OAB]` : null,
      })),
  };
}

/** Nomes de advogado tambem vivem em dois lugares. Registrar todos no cofre
 *  antes de limpar texto livre, senao um nome nao conhecido escapa na redacao. */
function registrarNomes(e, cofre) {
  cofre.pseudonimo(e.nome, e.tipo_pessoa);
  const listas = [e.advogados || [], ...(e.participacoes_processo || []).map(p => p.advogados || [])];
  for (const l of listas) for (const a of l) cofre.pseudonimo(a.nome, a.tipo_pessoa);
}

function transformar({ capa, envolvidos, movimentacoes }, apelido, coerente = true) {
  const cofre = new Cofre();

  const doEndpoint = envolvidos?.items || [];
  const daCapa = (capa.fontes || []).flatMap(f => f.envolvidos || []);

  // Qual lista usar? A do endpoint e mais completa (traz participacao por polo
  // e por fonte). Mas nos exemplos oficiais as duas vem de PROCESSOS DIFERENTES,
  // e misturar produziria um processo de mentira incoerente — partes que nao
  // batem com o titulo. No ensaio, portanto, vale a da capa.
  const listaEnvolvidos = (coerente && doEndpoint.length) ? doEndpoint : daCapa;

  // 1º passo: registrar TODOS os nomes no cofre, antes de tocar em texto livre.
  // Se o texto for limpo antes, um nome ainda nao conhecido escapa.
  for (const e of [...doEndpoint, ...daCapa]) registrarNomes(e, cofre);
  cofre.pseudonimo(capa.titulo_polo_ativo, 'FISICA');
  cofre.pseudonimo(capa.titulo_polo_passivo, 'FISICA');

  const fonte = (capa.fontes || [])[0] || {};
  const c = fonte.capa || {};

  return {
    id: apelido,
    numero_cnj: cnjPseudonimo(capa.numero_cnj),
    titulo: `${cofre.pseudonimo(capa.titulo_polo_ativo, 'FISICA')} × ${cofre.pseudonimo(capa.titulo_polo_passivo, 'FISICA')}`,
    polo_ativo: cofre.pseudonimo(capa.titulo_polo_ativo, 'FISICA'),
    polo_passivo: cofre.pseudonimo(capa.titulo_polo_passivo, 'FISICA'),
    tribunal: {
      sigla: fonte.sigla || capa.unidade_origem?.tribunal_sigla || null,
      nome: fonte.nome || null,
      grau: fonte.grau_formatado || null,
      sistema: fonte.sistema || null,
    },
    orgao_julgador: c.orgao_julgador || capa.unidade_origem?.nome || null,
    classe: c.classe || null,
    assunto: c.assunto_principal_normalizado?.nome || c.assunto || null,
    area: c.area || null,
    situacao: c.situacao || fonte.status_predito || null,
    segredo_justica: fonte.segredo_justica ?? false,
    valor_causa: c.valor_causa ?? null,
    data_inicio: capa.data_inicio || null,
    data_ultima_movimentacao: capa.data_ultima_movimentacao || null,
    quantidade_movimentacoes: capa.quantidade_movimentacoes ?? null,
    envolvidos: listaEnvolvidos.map(e => montarEnvolvido(e, cofre)),
    movimentacoes: (movimentacoes?.items || []).map(m => ({
      id: m.id,
      data: m.data,
      tipo: m.tipo,
      conteudo: limparTexto(m.conteudo, cofre),
      fonte: m.fonte?.sigla || null,
    })),
  };
}

// ===========================================================================
// Execucao
// ===========================================================================

function lerExemplos() {
  const dir = path.join(AQUI, 'exemplos-oficiais');
  const j = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));
  return [{ apelido: 'ENSAIO-1', dados: { capa: j('capa.json'), envolvidos: j('envolvidos.json'), movimentacoes: j('movimentacoes.json') } }];
}

function lerCapturadas() {
  const dir = path.join(AQUI, 'respostas-brutas');
  if (!fs.existsSync(dir)) return [];
  const porId = {};
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (d.resposta.status !== 200) continue;
    const nome = { A1: 'envolvidos', B1: 'capa', B2: 'movimentacoes' }[d.id];
    if (nome) porId[nome] = JSON.parse(d.resposta.corpo);
  }
  if (!porId.capa) return [];
  return [{ apelido: 'P1', dados: porId }];
}

const entradas = usarExemplos ? lerExemplos() : lerCapturadas();

if (!entradas.length) {
  console.log('\nNao ha respostas capturadas com sucesso ainda.');
  console.log('Para gerar o instantaneo de ensaio a partir dos exemplos oficiais:');
  console.log('  node captura/anonimizar.mjs --exemplos\n');
  process.exit(1);
}

const instantaneo = {
  versao_do_contrato: 1,
  origem: usarExemplos ? 'ensaio-ficticio' : 'escavador-v2',
  aviso: usarExemplos
    ? 'DADOS FICTICIOS. Derivados dos exemplos da documentacao publica do Escavador, nao de processo real. O formato e exato; o conteudo nao existe.'
    : 'Dados reais de processo, ANONIMIZADOS. Nomes substituidos por pseudonimos estaveis; CPF, CNPJ, OAB e numero CNJ redigidos.',
  // Nos exemplos oficiais, capa e envolvidos vem de processos diferentes.
  // Na captura real vem do mesmo — por isso o endpoint pode ser usado.
  processos: entradas.map(e => transformar(e.dados, e.apelido, !usarExemplos)),
};

fs.mkdirSync(DIR_INSTANTANEO, { recursive: true });
const saida = path.join(DIR_INSTANTANEO, usarExemplos ? 'ensaio.json' : 'processos.json');
fs.writeFileSync(saida, JSON.stringify(instantaneo, null, 2) + '\n');

console.log(`\ninstantaneo escrito em ${path.relative(RAIZ, saida)}`);
console.log(`  origem      : ${instantaneo.origem}`);
console.log(`  processos   : ${instantaneo.processos.length}`);
for (const p of instantaneo.processos) {
  console.log(`  ${p.id}: ${p.envolvidos.length} envolvidos, ${p.movimentacoes.length} movimentacoes`);
}
if (!usarExemplos) {
  console.log('\n\x1b[33mREVISE ANTES DE COMMITAR.\x1b[0m Redacao automatica erra: leia o conteudo');
  console.log('das movimentacoes procurando nome, endereco ou numero que tenha escapado.\n');
}
