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
 *   node captura/anonimizar.mjs --autos       # usa os autos em PDF importados → processos.json
 *   node captura/anonimizar.mjs               # usa as respostas capturadas → processos.json
 *
 *   node captura/anonimizar.mjs --autos --nomes-reais
 *      Mantem os nomes verdadeiros. Existe porque o escritorio pode querer se
 *      reconhecer na demonstracao — e essa e uma decisao DELE, informada, nao
 *      nossa. Exige --eu-sei-o-que-estou-fazendo junto, e a saida continua
 *      fora do Git. Ver D-97.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const DIR_INSTANTANEO = path.join(RAIZ, 'demo', 'instantaneo');

const usarExemplos = process.argv.includes('--exemplos');
const usarAutos = process.argv.includes('--autos');

// Nomes reais: interruptor deliberadamente duro de acionar por engano.
// Nao vale para os exemplos (que sao ficticios) nem seria util ali.
const nomesReais = process.argv.includes('--nomes-reais');
if (nomesReais && !process.argv.includes('--eu-sei-o-que-estou-fazendo')) {
  console.error(`
  --nomes-reais mantem nome de cliente, de advogado e de parte no instantaneo.
  Esse conteudo passa a ir para o provedor de IA a cada pergunta.

  So faz sentido com o aval informado do escritorio (D-97). Se e o caso:
    node captura/anonimizar.mjs --autos --nomes-reais --eu-sei-o-que-estou-fazendo
`);
  process.exit(1);
}
if (nomesReais && usarExemplos) {
  console.error('\n  --nomes-reais nao se aplica aos exemplos: eles ja sao ficticios.\n');
  process.exit(1);
}

// ===========================================================================
// Pseudonimos — deliberadamente comuns, para nao parecerem dados reais
// ===========================================================================

// As listas sao COMBINADAS, nao escritas a mao. Com uma duzia de nomes fixos,
// oito processos ja esgotavam o estoque e o anonimizador comecava a emitir
// "Rafael Monteiro Alencar (12)" — que denuncia a maquinaria e atrapalha a
// demonstracao. Combinando prenome e sobrenome sobram centenas de opcoes.
const PRENOMES = [
  'Ana Beatriz', 'Carlos Eduardo', 'Helena', 'Rafael', 'Luiza', 'Tiago',
  'Beatriz', 'Marcelo', 'Clara', 'Gustavo', 'Isabela', 'Bruno',
  'Fernanda', 'Ricardo', 'Camila', 'Eduardo', 'Patricia', 'Leandro',
  'Juliana', 'Vinicius', 'Mariana', 'Rodrigo', 'Larissa', 'Felipe',
];
const SOBRENOMES = [
  'Nogueira', 'Rangel', 'Vasconcelos Pires', 'Monteiro Alencar', 'Ferraz Bittencourt',
  'Queiroz Amorim', 'Sampaio Coutinho', 'Andrade Peixoto', 'Rezende Fontoura',
  'Teixeira Mourao', 'Prado Cavalcanti', 'Siqueira Lacerda', 'Barbosa Vilela',
  'Guimaraes Tavares', 'Machado Bastos', 'Correia Bandeira', 'Furtado Rocha',
  'Lemos Aragao', 'Pontes Vieira', 'Salgado Braga',
];
const NOMES_PF = PRENOMES.flatMap(p => SOBRENOMES.map(s => `${p} ${s}`));

const RAMOS = [
  'Comercial', 'Transportadora', 'Construtora', 'Distribuidora', 'Agropecuaria',
  'Industria', 'Servicos', 'Logistica', 'Engenharia', 'Alimentos',
];
const MARCAS = [
  'Aurora', 'Vale Claro', 'Pedra Alta', 'Norte Sul', 'Campo Verde',
  'Bela Vista', 'Rio Branco', 'Serra Azul', 'Ponta Nova', 'Alvorada',
  'Boa Esperanca', 'Monte Belo',
];
const SUFIXOS = ['Ltda.', 'S.A.', 'EIRELI'];

// Ente publico merece pool proprio. Trocar "Secretaria de Estado da Saude" por
// "Logistica Monte Belo EIRELI" nao vaza nada, mas destroi o sentido do caso:
// acao contra o poder publico deixa de parecer acao contra o poder publico, e
// a advogada nao reconhece mais o proprio processo.
const ORGAOS = [
  'Municipio de', 'Estado de', 'Secretaria Estadual de Saude de',
  'Secretaria Municipal de Educacao de', 'Fazenda Publica de',
  'Instituto de Previdencia de', 'Autarquia de Transito de',
];
const LUGARES = [
  'Santa Luzia', 'Vale Claro', 'Porto Belo', 'Serra Nova', 'Boa Vista do Norte',
  'Campo Alegre', 'Rio Verde', 'Vila Formosa', 'Monte Cristo', 'Alto Bonito',
];
const NOMES_PUB = ORGAOS.flatMap(o => LUGARES.map(l => `${o} ${l}`));
const MARCAS_ENTE_PUBLICO = /\b(MUNIC[ÍI]PIO|ESTADO D[OE]|UNI[ÃA]O|SECRETARIA|MINIST[ÉE]RIO|PREFEITURA|FAZENDA P[ÚU]BLICA|INSS|AUTARQUIA|DEFENSORIA|PROCURADORIA|C[ÂA]MARA MUNICIPAL|ASSEMBLEIA|TRIBUNAL|INSTITUTO DE PREVID[ÊE]NCIA|DETRAN|IBAMA|ANVISA|IPHAN)\b/i;
const NOMES_PJ = RAMOS.flatMap(r => MARCAS.flatMap(m => SUFIXOS.map(x => `${r} ${m} ${x}`)));

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
    // Com --nomes-reais o cofre vira passagem livre. CPF, CNPJ, OAB, e-mail e
    // telefone continuam saindo: eles nao ajudam ninguem a se reconhecer.
    if (nomesReais) return nomeReal;
    const chave = nomeReal.toLowerCase().trim();
    if (this.porNome.has(chave)) return this.porNome.get(chave);

    const lista = MARCAS_ENTE_PUBLICO.test(nomeReal) ? NOMES_PUB
      : tipoPessoa === 'JURIDICA' ? NOMES_PJ
      : NOMES_PF;
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
    // Trocar so o nome COMPLETO nao basta. No PJe o texto livre e formado por
    // titulos de documento, e la o nome aparece picado: "LAUDO MEDICO FULANO",
    // "Procuracao_Fulano__assinado". Por isso cada pedaco do nome real tambem
    // entra na lista, apontando para o pedaco correspondente do pseudonimo.
    const PREPOSICOES = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du', 'van', 'von']);
    const pares = [];
    for (const [real, falso] of this.porNome) {
      pares.push([real, falso]);
      const pedacosReais = String(real).split(/[\s._+-]+/)
        .filter((t) => t.length >= 4 && !PREPOSICOES.has(t.toLowerCase()));
      const pedacosFalsos = String(falso).split(/\s+/).filter((t) => t.length >= 3);
      pedacosReais.forEach((t, i) => {
        pares.push([t, pedacosFalsos[Math.min(i, pedacosFalsos.length - 1)] || falso]);
      });
    }
    return pares.sort((a, b) => b[0].length - a[0].length);
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
  // As bordas importam: sem elas, "2608060909026940000" (numero de documento
  // do PJe) era lido como telefone e virava "[TELEFONE]" no meio do numero.
  // Exigir separador: sem ele, "2026-0001873766" (nome de arquivo do PJe)
  // virava telefone. Telefone escrito de verdade sempre tem hifen ou espaco.
  [/(?<!\d)(?:\(\d{2}\)\s?|\d{2}\s)?9?\d{4}[-\s]\d{4}(?!\d)/g, '[TELEFONE]'],
  [/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g, '[CNJ]'],
  // Endereco de sistema do tribunal nao acrescenta nada a ficha e ainda pode
  // levar a identificacao do processo real
  [/https?:\/\/\S+/g, '[LINK]'],
];

function limparTexto(txt, cofre) {
  if (typeof txt !== 'string') return txt;
  let s = txt;
  for (const [real, falso] of cofre.paresParaTextoLivre()) {
    // As bordas evitam o estrago classico: trocar "Ana" dentro de "Analise".
    // Nao servem \b aqui: nome colado a sublinhado ou a acento precisa casar.
    const escapado = real.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`(?<!\\p{L})${escapado}(?!\\p{L})`, 'giu'), falso);
  }
  for (const [re, marca] of PADROES) s = s.replace(re, marca);
  return s;
}

/** CNJ pseudonimo: preserva tribunal e ano (nao identificam sozinhos) e troca
 *  a sequencia, recalculando o digito verificador para o numero seguir valido. */
function cnjPseudonimo(cnj) {
  // Com nomes reais o numero tambem tem de ser o real, senao o escritorio nao
  // consegue casar o que ve na tela com o processo que tem em maos.
  if (nomesReais) return cnj;
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

/** O cofre e UM SO para toda a rodada, de proposito. Um cofre por processo faz
 *  duas coisas ruins ao mesmo tempo: a mesma pessoa real ganha pseudonimos
 *  diferentes em processos diferentes, e pessoas diferentes acabam recebendo o
 *  mesmo nome falso — porque cada cofre so evita colisao dentro de si. Nos dois
 *  casos a carteira do escritorio deixa de fazer sentido na demo. */
function transformar({ capa, envolvidos, movimentacoes }, apelido, coerente = true, cofre = new Cofre()) {

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
    // `?? true`, e a troca do `false` por `true` aqui é a Regra 5 inteira.
    //
    // Antes: campo ausente, `null` vindo do importador que não achou o rótulo,
    // ou fonte que simplesmente não informa — tudo virava `false`, e o
    // instantâneo AFIRMAVA que o processo é público. Os fluxos da demo leem
    // exatamente este campo para decidir se mostram ou recusam, então uma
    // ausência de informação viraria exibição de dado sob segredo.
    //
    // Agora não saber fecha. O preço é o inverso, e é o preço certo: um
    // processo público pode aparecer marcado como sigiloso e ser recusado sem
    // motivo. Isso se percebe na hora — alguém pergunta por que não apareceu —
    // e se conserta corrigindo a origem. O erro contrário não se percebe: dado
    // sigiloso exibido não avisa ninguém de que foi exibido.
    segredo_justica: fonte.segredo_justica ?? true,
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

/** Autos em PDF convertidos por importar-autos.mjs. Ja vem na forma da API,
 *  de proposito: assim existe UM lugar que anonimiza, e nao dois. */
function lerAutos() {
  const dir = path.join(AQUI, 'autos-texto');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.local.json')).sort()
    .map(f => {
      const dados = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      return { apelido: dados._origem_apelido || f.replace('.local.json', ''), dados };
    });
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

const entradas = usarExemplos ? lerExemplos() : usarAutos ? lerAutos() : lerCapturadas();

if (!entradas.length) {
  console.log('\nNao ha respostas capturadas com sucesso ainda.');
  console.log('Para gerar o instantaneo de ensaio a partir dos exemplos oficiais:');
  console.log('  node captura/anonimizar.mjs --exemplos\n');
  process.exit(1);
}

/** A versao do contrato que ESTE gerador produz — `demo/CONTRATO-DO-INSTANTANEO.md` §6.
 *
 *  Ficou em 1 por engano de 24/08 ate 31/08, e o engano estava nas duas linhas
 *  logo abaixo: `origem: 'autos-fornecidos'` e `nomes_reais` SAO as novidades da
 *  versao 2. O gerador produzia a forma nova carimbada com o numero velho.
 *
 *  Numero de versao que ninguem confere e campo preenchido, nao contrato — por
 *  isso os montadores da demo agora recusam versao que nao conhecem (Regra 5).
 *  Ao subir este numero, anote a mudanca na tabela do §6 do contrato E acrescente
 *  o novo numero a VERSOES_ACEITAS dos dois montadores, senao a demo para. */
const VERSAO_DO_CONTRATO = 2;

const instantaneo = {
  versao_do_contrato: VERSAO_DO_CONTRATO,
  origem: usarExemplos ? 'ensaio-ficticio' : usarAutos ? 'autos-fornecidos' : 'escavador-v2',
  nomes_reais: nomesReais,
  aviso: usarExemplos
    ? 'DADOS FICTICIOS. Derivados dos exemplos da documentacao publica do Escavador, nao de processo real. O formato e exato; o conteudo nao existe.'
    : usarAutos
    ? 'Dados reais, extraidos dos autos em PDF fornecidos pelo escritorio e ANONIMIZADOS. Linha do tempo vinda da tabela Documentos do PJe, nao da API.'
    : 'Dados reais de processo, ANONIMIZADOS. Nomes substituidos por pseudonimos estaveis; CPF, CNPJ, OAB e numero CNJ redigidos.',
  // Nos exemplos oficiais, capa e envolvidos vem de processos diferentes.
  // Na captura real vem do mesmo — por isso o endpoint pode ser usado.
  // Um cofre para todos: ver a nota em transformar()
  processos: (() => { const cofre = new Cofre();
    return entradas.map(e => transformar(e.dados, e.apelido, !usarExemplos, cofre)); })(),
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
