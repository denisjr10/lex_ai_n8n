#!/usr/bin/env node
/**
 * NOTA: no modo runOnceForEachItem o Code node do n8n exige UM objeto —
 * `return { json: {...} }`. Devolver `[{ json: ... }]` (a forma do modo
 * "all items") falha com "Code doesn't return a single object".
 *
 * montar-fluxo-a.mjs — gera o workflow da Demo A (colaborador no Telegram)
 * ---------------------------------------------------------------------------
 * O fluxo é GERADO, não escrito à mão. Assim:
 *   - o instantâneo entra embutido e sempre atualizado (basta regerar)
 *   - a lista de permissão vem de arquivo, não de edição manual no n8n
 *   - o mesmo comando reconstrói tudo depois da captura real
 *
 * Uso:
 *   node demo/montar-fluxo-a.mjs              # escreve o JSON em demo/workflows/
 *   node demo/montar-fluxo-a.mjs --publicar   # escreve e envia para o n8n
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const publicar = process.argv.includes('--publicar');
// Ativar e o que liga o fluxo de verdade: o gatilho passa a receber eventos do
// mundo. Fica separado de publicar, e explicito, porque publicar e reversivel e
// ativar nao e — a partir dai o fluxo responde a quem mandar mensagem.
const ativar = process.argv.includes('--ativar');

const NOME = '[LEX-DEMO] A · Colaborador (Telegram)';

// --- dados embutidos -------------------------------------------------------
// Quantas movimentações vão para a ficha que o modelo lê. O limite existe por
// razão dura, não por estética: um dos processos reais tem 400 entradas, e a
// janela de contexto do modelo não comporta isso — nem faria sentido pagar por
// reler o processo inteiro a cada pergunta (Regra 6: custo é requisito).
// O total verdadeiro continua na ficha, em número, para o modelo não afirmar
// que aquelas são todas as movimentações que existem.
const MOVS_NA_FICHA = 20;

// Dado real, quando existe, tem precedência sobre o ensaio fictício.
const caminhoReal = path.join(AQUI, 'instantaneo', 'processos.json');
const caminhoEnsaio = path.join(AQUI, 'instantaneo', 'ensaio.json');
const usarReal = fs.existsSync(caminhoReal) && !process.argv.includes('--ensaio');
const bruto = JSON.parse(fs.readFileSync(usarReal ? caminhoReal : caminhoEnsaio, 'utf8'));

// Falhar fechado na fronteira do contrato (`CONTRATO-DO-INSTANTANEO.md` §6).
//
// O contrato manda o consumidor RECUSAR versão que não conhece, em vez de exibir
// campo errado com confiança (Regra 5). A conferência acontece AQUI, na geração,
// e não dentro do n8n: o instantâneo é embutido no workflow no momento em que ele
// é montado, então o fluxo publicado nunca vê um segundo instantâneo. Conferir na
// geração pega o erro antes de ele virar workflow; conferir no fluxo pegaria
// tarde, e num lugar onde a falha aparece como resposta estranha ao cliente.
const VERSOES_ACEITAS = [2];
if (!VERSOES_ACEITAS.includes(bruto.versao_do_contrato)) {
  console.error(`
  ${path.basename(usarReal ? caminhoReal : caminhoEnsaio)} está na versão ${JSON.stringify(bruto.versao_do_contrato)}, e este montador entende ${VERSOES_ACEITAS.join(', ')}.
  Um instantâneo de versão desconhecida não é montado — campo errado exibido com confiança é pior que erro.
  Regere com:  node captura/anonimizar.mjs --autos    (ou --exemplos)
`);
  process.exit(1);
}

const instantaneo = {
  ...bruto,
  processos: bruto.processos.map((p) => ({
    ...p,
    movimentacoes: (p.movimentacoes || []).slice(0, MOVS_NA_FICHA),
    quantidade_movimentacoes: p.quantidade_movimentacoes ?? (p.movimentacoes || []).length,
  })),
};

const listaPath = fs.existsSync(path.join(AQUI, 'listas', 'colaboradores.json'))
  ? path.join(AQUI, 'listas', 'colaboradores.json')
  : path.join(AQUI, 'listas', 'colaboradores.exemplo.json');
const lista = JSON.parse(fs.readFileSync(listaPath, 'utf8'));

// --- para onde vai a mensagem aprovada -------------------------------------
// A MESMA lista que a Demo B usa para decidir o escopo do cliente. Ela é a
// única fonte do vínculo processo → cliente, e por isso o destinatário nunca
// sai da conversa do colaborador nem da redação do modelo: sai da lista.
// Ninguém escolhe para quem enviar digitando um número no Telegram.
const clientesPath = fs.existsSync(path.join(AQUI, 'listas', 'clientes.json'))
  ? path.join(AQUI, 'listas', 'clientes.json')
  : path.join(AQUI, 'listas', 'clientes.exemplo.json');
const listaClientes = JSON.parse(fs.readFileSync(clientesPath, 'utf8'));

const DESTINOS = {};
for (const c of listaClientes.clientes || []) {
  for (const id of c.processos || []) {
    if (DESTINOS[id]) {
      console.error(`\n  ${path.basename(clientesPath)}: o processo ${id} aparece em dois clientes`);
      console.error(`  (${DESTINOS[id].nome} e ${c.nome}). Não escolho por você — corrija a lista.\n`);
      process.exit(1);
    }
    const numero = String(c.whatsapp || '').replace(/\D/g, '');
    // Número de faz-de-conta é pior que número ausente. Ausente cai no caminho
    // honesto "APROVADO, MAS SEM DESTINATÁRIO"; um 5500000000000 é ACEITO pela
    // Uazapi e nunca chega — a tela diria "ENTREGUE" sobre entrega nenhuma, que
    // é exatamente a mentira que a D-101 mandou tirar daqui. Falha fecha: o
    // gerador para, e ninguém publica um fluxo que promete o que não cumpre.
    const digitosRepetidos = /^(\d)\1+$/.test(numero.slice(2));
    if (numero.length < 12 || numero.length > 13 || digitosRepetidos) {
      console.error(`\n  ${path.basename(clientesPath)}: o número de ${c.nome} não serve como destino.`);
      console.error(`  Recebido: ${numero || '(vazio)'} — esperado 12 ou 13 dígitos com código do país,`);
      console.error(`  e um número real. Preencha ou remova o cliente; não publico envio para o vazio.\n`);
      process.exit(1);
    }
    DESTINOS[id] = { numero, nome: c.nome };
  }
}

const emSegredo = instantaneo.processos.filter((p) => p.segredo_justica).length;
console.log(`instantâneo : ${instantaneo.origem} · ${instantaneo.processos.length} processo(s)`
  + (emSegredo ? ` · ${emSegredo} em segredo de justiça` : ''));
if (bruto.nomes_reais) console.log(`\x1b[33m              NOMES REAIS — este fluxo levará dado de cliente ao provedor de IA (D-97)\x1b[0m`);
console.log(`              ficha limitada a ${MOVS_NA_FICHA} movimentações por processo`);
console.log(`lista       : ${path.basename(listaPath)} · ${lista.colaboradores.length} colaborador(es)`);
console.log(`destinos    : ${path.basename(clientesPath)} · ${Object.keys(DESTINOS).length} processo(s) com cliente vinculado`);

// A nota de uso de IA (Recomendação nº 001/2024 do CFOAB, D-92) NÃO é pedida ao
// modelo: ela é acrescentada pelo fluxo, em itálico, como nota de rodapé. Texto
// obrigatório não se delega a quem pode variar a redação — e o itálico distingue
// a nota da mensagem ao cliente, que é o que ele de fato deve ler.
const NOTA_IA = 'Esta mensagem foi preparada com apoio de inteligência artificial e revisada por um advogado do escritório.';

// O aviso de topo diz ao colaborador o que ele está vendo. Vive aqui, e não em
// cada nó, porque três nós precisam do MESMO texto — e sempre começa com ⚠️,
// que é o marcador pelo qual a aprovação reconhece o bloco ao remontar.
const AVISO_TOPO = instantaneo.origem === 'ensaio-ficticio'
  ? '⚠️ <b>DADOS FICTÍCIOS — demonstração</b>'
  : bruto.nomes_reais
  ? '⚠️ <b>DADOS REAIS DE CLIENTE — demonstração</b>'
  : '⚠️ <b>Demonstração — dados reais do escritório, nomes anonimizados</b>';

// O que o CLIENTE vê no WhatsApp. Outro canal, outra marcação: lá não existe
// HTML, o itálico é _assim_. Mesmos textos da Demo B, de propósito — quem
// receber a mensagem aprovada não deve perceber que veio por outro caminho.
const AVISO_TOPO_WA = instantaneo.origem === 'ensaio-ficticio'
  ? '⚠️ DEMONSTRAÇÃO — dados fictícios'
  : '⚠️ DEMONSTRAÇÃO — atendimento automatizado do escritório';
const NOTA_IA_WA = '_' + NOTA_IA + '_';

// ===========================================================================
// O PORTEIRO — a Regra 1 em código
// ===========================================================================
// Este nó decide QUEM pode e O QUE pode, ANTES de qualquer chamada ao modelo.
// Não é instrução de prompt: é verificação. Convencer a IA por conversa não
// contorna nada, porque quem decide não é ela.
const CODIGO_PORTEIRO = `
const AVISO_TOPO = ${JSON.stringify(AVISO_TOPO)};
const NOTA_IA = ${JSON.stringify(NOTA_IA)};
const COLABORADORES = ${JSON.stringify(lista.colaboradores, null, 2)};
const PROCESSOS = ${JSON.stringify(instantaneo.processos.map(p => ({
  id: p.id,
  numero: p.numero_cnj,
  titulo: p.titulo,
  classe: p.classe,
  segredo: p.segredo_justica === true,
  // Nomes das partes, para casar "o processo do Fulano" — que é como um
  // colaborador realmente pergunta. Ninguém decora número CNJ.
  partes: [...new Set((p.envolvidos || []).map(e => e.nome).filter(Boolean))],
})))};
// ⚠️ A BARRA INVERTIDA PRECISA SER DOBRADA AQUI, e por muito tempo não era.
// Esta linha vive DENTRO de uma template string: a barra é consumida pelo
// JavaScript de fora, não pelo de dentro. Escrita simples, ela sumia, e a classe
// "não-dígito" virava a letra maiúscula sozinha — o workflow apagava a letra em
// vez de apagar a pontuação.
//
// O SINTOMA ERA O CONTRÁRIO DO QUE PARECE. Com o defeito, CNJ digitado COM
// pontuação continuava funcionando, por acaso: o número pontuado é substring
// literal da frase, então a busca achava assim mesmo. Quem quebrava era o
// número digitado SEM pontuação — o da pessoa que copia do PJe e cola no
// celular — porque aí a comparação dependia mesmo da normalização.
// Defeito que só aparece no caminho menos testado é o que sobrevive mais tempo.
//
// A linha de baixo já estava certa desde sempre, com a barra dobrada, o que
// torna este um erro de distração e não de entendimento.
// Regressão em testar-fluxo-a.mjs, com memoriaNova() isolando cada caso.
const soDigitos = (t) => String(t).replace(/\\D/g, '');
const semAcento = (t) => String(t).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toUpperCase();

const e = $json;
const cb = e.callback_query;
const msg = cb ? cb.message : e.message;
const de  = cb ? cb.from    : (e.message && e.message.from);

if (!de) {
  return { json: { rota: 'ignorar', motivo: 'evento sem remetente' } };
}

const chatId = msg && msg.chat ? msg.chat.id : de.id;
const autorizado = COLABORADORES.find(c => String(c.telegram_user_id) === String(de.id));

// --- barreira 1: quem ------------------------------------------------------
if (!autorizado) {
  return { json: {
    rota: 'negado',
    chatId,
    userId: de.id,
    texto: [
      'Acesso não autorizado.',
      '',
      'Este assistente atende apenas pessoas cadastradas pelo escritório.',
      '',
      'Se você deveria ter acesso, informe este número ao responsável:',
      '<code>' + de.id + '</code>'
    ].join('\\n')
  }};
}

const base = {
  chatId,
  userId: de.id,
  nome: autorizado.nome,
  papel: autorizado.papel,
  podeAprovar: autorizado.pode_aprovar_envio_ao_cliente === true,
  origemDados: ${JSON.stringify(instantaneo.origem)}
};

// --- memória curta, por pessoa ---------------------------------------------
// Guarda apenas o último processo que cada colaborador consultou, para que
// "esse processo" tenha a que se referir. Nada de conteúdo de conversa: com um
// processo só, dá na mesma; com seis, é a diferença entre funcionar e não.
// Vive no armazenamento estático do workflow — só persiste em execução de
// produção (fluxo ativo), não em teste manual dentro do editor.
// O try existe porque memória é conveniência, não segurança: se o
// armazenamento estático não estiver disponível, o assistente deve ficar sem
// memória — nunca deixar de responder.
let memoria;
try { memoria = $getWorkflowStaticData('global'); } catch (erro) { memoria = {}; }
if (!memoria || typeof memoria !== 'object') memoria = {};
if (!memoria.ultimoProcesso) memoria.ultimoProcesso = {};

// --- ramo do clique nos botões --------------------------------------------
if (cb) {
  // O botão carrega consigo o processo e quem redigiu: 'aprovar|AUTOS-05|123'.
  // Isso não é detalhe de implementação — é correção de um perigo real. Se o
  // processo viesse da memória, e a pessoa consultasse OUTRO processo entre
  // receber a proposta e clicar em aprovar, a mensagem sairia para o cliente
  // errado. O botão precisa saber do que ele trata.
  const [acao, procDoBotao, autorDoBotao] = String(cb.data || '').split('|');

  // barreira 2: só advogado aprova envio ao cliente (Regra 2 + D-06).
  // A tentativa segue pelo MESMO caminho do clique legítimo — assim o botão
  // recebe resposta e a tentativa fica registrada na trilha. Mas ela não morre
  // ali: quem não pode aprovar ENCAMINHA para quem pode.
  const efetiva = (acao === 'aprovar' && !base.podeAprovar) ? 'encaminhado' : acao;

  return { json: { ...base, rota: 'aprovacao', acao: efetiva, acaoPedida: acao,
    callbackId: cb.id, messageId: msg.message_id,
    processoId: procDoBotao || memoria.ultimoProcesso[String(de.id)] || null,
    // Quem redigiu, quando não é quem está decidindo. Preenchido só nos botões
    // de uma proposta encaminhada — é por aqui que o desfecho volta para ele.
    autorChatId: autorDoBotao && String(autorDoBotao) !== String(de.id) ? autorDoBotao : null,
    textoOriginal: (msg.text || msg.caption || '') }};
}


// --- ramo da mensagem de texto --------------------------------------------
const texto = String((msg && msg.text) || '').trim();

// --- edição pendente: o que o botão ✏️ Editar deixou em aberto -------------
// Sem isto o botão Editar era um beco: marcava a mensagem e não levava a lugar
// nenhum. Agora a próxima mensagem daquela pessoa É o texto corrigido, e volta
// como nova proposta — com os mesmos três botões, porque texto editado por
// humano continua precisando de aprovação de advogado (Regra 2).
if (!memoria.edicaoPendente) memoria.edicaoPendente = {};
const pendente = memoria.edicaoPendente[String(de.id)];
if (pendente && texto) {
  delete memoria.edicaoPendente[String(de.id)];

  if (/^(cancelar|cancela|deixa|esquece|para|\\/cancelar)\\b/i.test(texto)) {
    return { json: { ...base, rota: 'negado',
      texto: 'Edição cancelada. Nada foi enviado ao cliente.' }};
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return { json: { ...base, rota: 'reproposta',
    processoId: pendente.processoId,
    processoNumero: pendente.processoNumero,
    textoProposta: [
      AVISO_TOPO,
      '',
      '<b>Proposta de mensagem ao cliente</b>',
      '<i>Texto reescrito por ' + esc(base.nome) + '. Nada foi enviado — continua faltando aprovação de advogado.</i>',
      '',
      esc(texto),
      '',
      '<i>' + NOTA_IA + '</i>'
    ].join('\\n') }};
}

// Saudação e comandos não são pergunta sobre processo. Sem esta porta, um "oi"
// caía na busca de processo e, havendo um só, era respondido com o resumo
// inteiro — o assistente respondendo o que ninguém perguntou.
const ehSaudacao = /^(\\/start|\\/ajuda|\\/menu|oi+|ol[áa]|opa|e a[íi]|al[oô]|hey|hell?o|bom dia|boa tarde|boa noite|tudo bem|tudo bom|ajuda|menu|come[çc]ar)[\\s!.,?]*$/i.test(texto);

if (!texto || ehSaudacao) {
  // Com um processo dava para listar tudo. Com oito, uma lista de oito números
  // CNJ e' parede de texto que ninguem le. Mostra-se o que se usa: o nome da
  // parte, que e' como o colaborador de fato se refere ao processo.
  const linhas = PROCESSOS.map(p => {
    const parte = (p.partes[0] || p.titulo.split(' × ')[0] || '').split(' ').slice(0, 2).join(' ');
    return '· ' + (p.segredo ? '🔒 ' : '') + '<b>' + parte + '</b> — ' + (p.classe || p.titulo).toLowerCase();
  });
  return { json: { ...base, rota: 'negado', texto: [
    'Olá, ' + base.nome.split(' ')[0] + '.',
    '',
    'Posso consultar o andamento de um processo e redigir um retorno ao cliente.',
    '',
    '<b>' + PROCESSOS.length + ' processo(s) nesta demonstração:</b>',
    linhas.join('\\n'),
    '',
    'Pergunte pelo nome da parte ou pelo número. Experimente:',
    '· <i>Como está o processo ' + (PROCESSOS.find(p => !p.segredo) || PROCESSOS[0]).partes[0] + '?</i>',
    '· <i>Redige um retorno para o cliente sobre esse processo</i>'
  ].join('\\n') }};
}

// barreira 3: abrangência — só os processos do instantâneo existem.
// Casa pelo número CNJ (com ou sem pontuação) ou pelo apelido interno.
const digitos = soDigitos(texto);
const alvoTexto = semAcento(texto);
const lembrado = memoria.ultimoProcesso[String(de.id)];

// Por número, por apelido interno, ou por nome de parte — nesta ordem.
const porNumero = PROCESSOS.find(p =>
  (digitos.length >= 15 && digitos.indexOf(soDigitos(p.numero)) !== -1) ||
  alvoTexto.indexOf(semAcento(p.id)) !== -1);

// Nome de parte: casa por sobrenome ou nome completo, nunca por pedaço curto.
// "Ana" sozinha nao decide nada quando ha oito processos.
const porNome = porNumero ? [] : PROCESSOS.filter(p => p.partes.some(nome =>
  semAcento(nome).split(' ').filter(t => t.length >= 4)
    .some(t => alvoTexto.indexOf(t) !== -1)));

// Ambiguidade nao se resolve no chute: pergunta-se.
if (!porNumero && porNome.length > 1) {
  return { json: { ...base, rota: 'negado', texto: [
    'Encontrei mais de um processo com esse nome. Qual deles?',
    '',
    porNome.map(p => '· ' + (p.segredo ? '🔒 ' : '') + '<code>' + p.numero + '</code> — ' + (p.classe || p.titulo).toLowerCase()).join('\\n')
  ].join('\\n') }};
}

const alvo = porNumero || porNome[0] || PROCESSOS.find(p => p.id === lembrado)
  || (PROCESSOS.length === 1 ? PROCESSOS[0] : null);

if (!alvo) {
  return { json: { ...base, rota: 'negado', texto:
    'Não identifiquei a qual processo você se refere.\\n\\n' +
    'Diga o nome de uma das partes ou o número do processo. ' +
    'Mande <i>oi</i> para ver a lista.' }};
}

const querRedigir = /redi[jg]|retorno|mensagem|escrev|comunic|avis/i.test(texto);

// Barreira 4: segredo de justiça. É verificação em código, não instrução ao
// modelo — o conteúdo nem chega a ser montado, então não há o que convencer.
//
// O processo sigiloso FICA na memória, e isso é deliberado. Se ele fosse
// esquecido, o "esse processo" seguinte escorregaria para outro caso sem que
// nada denunciasse a troca: o colaborador pediria mensagem sobre o processo A
// e receberia uma sobre o B, bem escrita e plausível. Recusar faz barulho;
// escolher sozinho é silencioso, e é o erro que a aprovação humana não pega.
if (alvo.segredo) {
  memoria.ultimoProcesso[String(de.id)] = alvo.id;
  return { json: { ...base, rota: 'negado', texto: [
    '🔒 <b>Processo em segredo de justiça</b>',
    '',
    '<code>' + alvo.numero + '</code> — ' + (alvo.classe || '').toLowerCase(),
    '',
    querRedigir
      ? 'Não redijo mensagem ao cliente sobre processo em segredo. Se você quis dizer outro processo, diga o nome da parte ou o número — não escolho por você.'
      : 'Não exibo andamento nem redijo mensagem sobre processo em segredo. Consulte diretamente o sistema do tribunal, com a sua identificação.',
    '',
    '<i>Esta recusa é verificada em código, antes de qualquer consulta. ' +
    'Não é uma orientação dada à inteligência artificial.</i>'
  ].join('\\n') }};
}

memoria.ultimoProcesso[String(de.id)] = alvo.id;

return { json: { ...base, rota: querRedigir ? 'redigir' : 'consulta',
  processoId: alvo.id, processoNumero: alvo.numero, pergunta: texto }};
`.trim();

// ===========================================================================
// O instantâneo, servido como contexto ao modelo
// ===========================================================================
const CODIGO_CONTEXTO = `
const INSTANTANEO = ${JSON.stringify(instantaneo)};
const AVISO_TOPO = ${JSON.stringify(AVISO_TOPO)};

const p = INSTANTANEO.processos.find(x => x.id === $json.processoId);
if (!p) return { json: { ...$json, erro: 'processo não encontrado no instantâneo' } };

// Agrupa participações da mesma pessoa — ela aparece uma vez por grau
const porNome = new Map();
for (const e of p.envolvidos) {
  const atual = porNome.get(e.nome) || { nome: e.nome, papeis: [], advogados: [] };
  if (e.papel && !atual.papeis.includes(e.papel)) atual.papeis.push(e.papel);
  for (const a of e.advogados) if (!atual.advogados.some(x => x.nome === a.nome)) atual.advogados.push(a);
  porNome.set(e.nome, atual);
}

const partes = [...porNome.values()]
  .map(e => '- ' + e.nome + ' (' + e.papeis.join(', ') + ')' +
       (e.advogados.length ? ' — advogado(s): ' + e.advogados.map(a => a.nome).join(', ') : ''))
  .join('\\n');

const movs = p.movimentacoes
  .map(m => '- ' + m.data + ' · ' + m.tipo + ' · ' + m.conteudo)
  .join('\\n');

// Campo vazio vira "-" e ocupa espaço sem ensinar nada — e ainda convida o
// modelo a comentar a ausência. Os autos em PDF não trazem área nem situação.
const semVazios = (linhas) => linhas.filter(l => !/: -$/.test(l));

const ficha = semVazios([
  'PROCESSO ' + p.numero_cnj,
  'Título: ' + p.titulo,
  'Tribunal: ' + (p.tribunal.nome || '-') + ' (' + (p.tribunal.sigla || '-') + '), ' + (p.tribunal.grau || '-'),
  'Órgão julgador: ' + (p.orgao_julgador || '-'),
  'Classe: ' + (p.classe || '-'),
  'Assunto: ' + (p.assunto || '-'),
  'Área: ' + (p.area || '-'),
  'Situação: ' + (p.situacao || '-'),
  'Valor da causa: ' + (p.valor_causa ? p.valor_causa.valor_formatado : 'não informado'),
  'Início: ' + (p.data_inicio || '-'),
  'Última movimentação: ' + (p.data_ultima_movimentacao || '-'),
  'Total de movimentações no processo: ' + (p.quantidade_movimentacoes ?? '-'),
  '',
  'PARTES E ADVOGADOS',
  partes,
  '',
  // O modelo precisa saber que está vendo um RECORTE. Sem esta linha ele
  // afirma "o processo teve 20 movimentações", e a afirmação é falsa.
  'MOVIMENTAÇÕES MAIS RECENTES — ' + p.movimentacoes.length + ' de ' +
    (p.quantidade_movimentacoes ?? p.movimentacoes.length) +
    ' (recorte; as mais antigas não estão aqui)',
  movs
]).join('\\n');

return { json: { ...$json, ficha, aviso_origem: INSTANTANEO.aviso,
  ehEnsaio: INSTANTANEO.origem === 'ensaio-ficticio',
  avisoTopo: AVISO_TOPO } };
`.trim();

// ===========================================================================
// Instruções ao modelo — o que ele PODE fazer com o que o código já liberou
// ===========================================================================
const SISTEMA_CONSULTA = `Você é assistente de um escritório de advocacia, falando com um COLABORADOR interno.

REGRAS ABSOLUTAS:
- Responda EXCLUSIVAMENTE com base na ficha do processo fornecida. Nunca complete com conhecimento próprio.
- Se a ficha não contém a informação, diga "isso não consta dos dados que tenho" — jamais suponha.
- NUNCA calcule, estime ou mencione prazo processual. Não há dados de prazo aqui, e errar prazo é o pior desfecho possível. Se perguntarem, diga que prazo deve ser conferido no sistema do tribunal.
- Não dê opinião jurídica nem prognóstico de resultado.

FORMA:
- Português do Brasil, direto, sem juridiquês desnecessário.
- Use HTML simples do Telegram: <b>negrito</b>, <i>itálico</i>, <code>código</code>. Nunca use Markdown.
- Comece com uma linha de resumo, depois os detalhes.
- No máximo 12 linhas.`;

const SISTEMA_REDACAO = `Você redige, para um COLABORADOR do escritório, uma mensagem que será enviada AO CLIENTE por WhatsApp — mas somente depois que um advogado aprovar.

REGRAS ABSOLUTAS:
- Baseie-se EXCLUSIVAMENTE na ficha fornecida.
- NUNCA mencione, calcule ou insinue prazo.
- NUNCA prometa resultado, não crie urgência, não use linguagem de venda (Provimento 205/2021 da OAB: comunicação informativa e sóbria).
- Não use jargão jurídico: o cliente é leigo. "O processo foi arquivado" e não "houve baixa definitiva dos autos".

FORMA:
- Escreva APENAS o texto da mensagem ao cliente. Sem saudação ao colaborador, sem comentários seus, sem aspas em volta.
- Comece por "Olá!" e trate o cliente por você.
- No máximo 6 linhas, tom cordial e calmo.
- NÃO escreva nota de rodapé, aviso de uso de inteligência artificial nem assinatura. O fluxo acrescenta isso automaticamente.`;

// ===========================================================================
// Montagem do grafo
// ===========================================================================
// ===========================================================================
// Credenciais — SEMPRE por id, nunca só por nome
// ===========================================================================
// A API do n8n ignora o nome quando o id não vem junto: ela resolve para alguma
// credencial daquele tipo, à escolha dela. Publicar sem id repontou este fluxo
// para credenciais pessoais do usuário que não têm nada a ver com a demo.
const credPath = fs.existsSync(path.join(AQUI, 'credenciais.json'))
  ? path.join(AQUI, 'credenciais.json') : null;

if (!credPath) {
  console.error('\n  FALTA demo/credenciais.json — sem os ids, o n8n vincula a credencial errada.');
  console.error('  Copie demo/credenciais.exemplo.json e preencha com os ids da sua instância.\n');
  process.exit(1);
}
const credCfg = JSON.parse(fs.readFileSync(credPath, 'utf8'));

for (const [tipo, c] of Object.entries(credCfg)) {
  if (tipo.startsWith('_')) continue;
  if (!c.id || String(c.id).startsWith('cole-')) {
    console.error(`\n  credenciais.json: o id de ${tipo} não foi preenchido.\n`);
    process.exit(1);
  }
}
console.log(`credenciais : ${credCfg.telegramApi.name} · ${credCfg.openAiApi.name}`);

const cred = { openai: credCfg.openAiApi, telegram: credCfg.telegramApi,
               uazapi: credCfg.httpHeaderAuth || null };

// A credencial da Uazapi pode não existir: a instância gratuita dura 1 hora, e
// o fluxo A funciona sem ela — só não fecha o ciclo até o cliente. Gerar sem
// ela é normal; publicar sem ela deixa o botão Aprovar registrando a decisão e
// avisando que não há para onde enviar, em vez de fingir que enviou.
if (!cred.uazapi || !cred.uazapi.id) {
  console.log('\x1b[33mUazapi      : sem credencial — o ciclo para na aprovação, não chega ao cliente\x1b[0m');
  console.log('              crie a instância e rode: node demo/uazapi.mjs credencial');
} else {
  console.log(`Uazapi      : ${cred.uazapi.name} · aprovar envia ao cliente de verdade`);
}

/** Os tres botoes da proposta. O callback carrega 'acao|processo|autor':
 *  o processo, para que aprovar nunca use o processo errado se a pessoa
 *  consultou outro no meio do caminho; o autor, para que o desfecho volte
 *  para quem redigiu quando quem decide e outra pessoa. */
const BOTOES = (proc, autor) => ({ rows: [ { row: { buttons: [
  { text: '✅ Aprovar e enviar', additionalFields: { callback_data: `=aprovar|{{ ${proc} }}|{{ ${autor} }}` } },
  { text: '✏️ Editar',          additionalFields: { callback_data: `=editar|{{ ${proc} }}|{{ ${autor} }}` } },
  { text: '❌ Descartar',       additionalFields: { callback_data: `=descartar|{{ ${proc} }}|{{ ${autor} }}` } }
] } } ] });

function no(nome, tipo, versao, params, pos, extra = {}) {
  return { parameters: params, id: undefined, name: nome, type: tipo, typeVersion: versao, position: pos, ...extra };
}

const nodes = [
  no('Telegram Trigger', 'n8n-nodes-base.telegramTrigger', 1.1,
    { updates: ['message', 'callback_query'], additionalFields: {} }, [-220, 300],
    { credentials: { telegramApi: cred.telegram }, webhookId: 'lex-demo-a-colaborador' }),

  no('Porteiro (verificação em código)', 'n8n-nodes-base.code', 2,
    { mode: 'runOnceForEachItem', jsCode: CODIGO_PORTEIRO }, [0, 300]),

  no('Rota', 'n8n-nodes-base.switch', 3,
    { rules: { values: [
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' }, leftValue: '={{ $json.rota }}', rightValue: 'consulta' }] },
          outputKey: 'consulta' },
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' }, leftValue: '={{ $json.rota }}', rightValue: 'redigir' }] },
          outputKey: 'redigir' },
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' }, leftValue: '={{ $json.rota }}', rightValue: 'aprovacao' }] },
          outputKey: 'aprovacao' },
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'contains' }, leftValue: '={{ $json.rota }}', rightValue: 'negad' }] },
          outputKey: 'direto' },
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' }, leftValue: '={{ $json.rota }}', rightValue: 'reproposta' }] },
          outputKey: 'reproposta' }
      ] }, options: { fallbackOutput: 'none' } }, [220, 300]),

  no('Ficha do processo', 'n8n-nodes-base.code', 2,
    { mode: 'runOnceForEachItem', jsCode: CODIGO_CONTEXTO }, [460, 100]),

  no('Ficha do processo (redação)', 'n8n-nodes-base.code', 2,
    { mode: 'runOnceForEachItem', jsCode: CODIGO_CONTEXTO }, [460, 300]),

  no('Modelo — consulta', '@n8n/n8n-nodes-langchain.lmChatOpenAi', 1,
    { model: 'gpt-4o-mini', options: { temperature: 0.2 } }, [700, 260],
    { credentials: { openAiApi: cred.openai } }),

  no('Modelo — redação', '@n8n/n8n-nodes-langchain.lmChatOpenAi', 1,
    { model: 'gpt-4o-mini', options: { temperature: 0.4 } }, [700, 460],
    { credentials: { openAiApi: cred.openai } }),

  no('Responder ao colaborador', '@n8n/n8n-nodes-langchain.chainLlm', 1.4,
    { promptType: 'define',
      text: '={{ $json.ficha }}\n\nPERGUNTA DO COLABORADOR: {{ $json.pergunta }}',
      messages: { messageValues: [{ message: SISTEMA_CONSULTA }] } }, [700, 100]),

  no('Redigir mensagem ao cliente', '@n8n/n8n-nodes-langchain.chainLlm', 1.4,
    { promptType: 'define',
      text: '={{ $json.ficha }}\n\nO colaborador pediu: {{ $json.pergunta }}',
      messages: { messageValues: [{ message: SISTEMA_REDACAO }] } }, [700, 300]),

  no('Enviar resposta', 'n8n-nodes-base.telegram', 1.2,
    { chatId: "={{ $('Porteiro (verificação em código)').item.json.chatId }}",
      text: "={{ $('Ficha do processo').item.json.avisoTopo + '\\n\\n' + $json.text }}",
      additionalFields: { parse_mode: 'HTML', appendAttribution: false } }, [960, 100],
    { credentials: { telegramApi: cred.telegram } }),

  no('Propor envio (aguarda aprovação)', 'n8n-nodes-base.telegram', 1.2,
    { chatId: "={{ $('Porteiro (verificação em código)').item.json.chatId }}",
      text: "={{ $('Ficha do processo (redação)').item.json.avisoTopo + '\\n\\n' + '<b>Proposta de mensagem ao cliente</b>\\n<i>Nada foi enviado. Nada sai sem aprovação de advogado.</i>\\n\\n' + $json.text.trim() + '\\n\\n<i>" + NOTA_IA + "</i>' }}",
      // ATENÇÃO: replyMarkup e inlineKeyboard são parâmetros de TOPO do nó.
      // Dentro de additionalFields eles são simplesmente ignorados — a mensagem
      // chega sem botão nenhum, e sem erro que denuncie o problema.
      replyMarkup: 'inlineKeyboard',
      inlineKeyboard: BOTOES("$('Ficha do processo (redação)').item.json.processoId", "$('Ficha do processo (redação)').item.json.userId"),
      additionalFields: { parse_mode: 'HTML', appendAttribution: false } }, [960, 300],
    { credentials: { telegramApi: cred.telegram } }),

  no('Registrar decisão', 'n8n-nodes-base.code', 2,
    { mode: 'runOnceForEachItem', jsCode: `
// Quem pode aprovar. Na demonstração é um só — e é justamente por isso que a
// escolha "para qual advogado encaminhar" pode ser a mais simples possível: o
// primeiro da lista. Em produção isso vira o advogado responsável pelo
// processo, e a lista de processos passa a dizer quem responde por cada um.
const ADVOGADOS = ${JSON.stringify(
  lista.colaboradores.filter(c => c.pode_aprovar_envio_ao_cliente === true)
    .map(c => ({ id: c.telegram_user_id, nome: c.nome })), null, 2)};

const j = $json;
const quando = new Date().toISOString().replace('T',' ').slice(0,16) + ' UTC';
const ROTULOS = {
  // Repare que não diz "E ENVIADO". Este rótulo é escrito no momento em que o
  // botão é clicado — antes da chamada à Uazapi. Afirmar aqui que a mensagem
  // saiu seria uma mentira sempre que o envio falhasse, e a tela continuaria
  // dizendo que o cliente foi avisado quando ele não foi.
  aprovar:     '✅ APROVADO',
  editar:      '✏️ AGUARDANDO O TEXTO CORRIGIDO',
  descartar:   '❌ DESCARTADO',
  encaminhado: '📨 ENVIADO PARA APROVAÇÃO',
  negado:      '⛔ ENVIO NÃO AUTORIZADO'
};

// Para qual advogado vai o que o estagiário não pode aprovar. O primeiro da
// lista, e só. Se não houver advogado nenhum cadastrado, não há para onde
// encaminhar — e aí a recusa volta a ser recusa seca, que é o comportamento
// correto: falha fecha (Regra 5).
const advogado = ADVOGADOS.find(a => String(a.id) !== String(j.userId)) || null;
const encaminhar = j.acao === 'encaminhado' && Boolean(advogado);
const acaoReal = j.acao === 'encaminhado' && !advogado ? 'negado' : j.acao;
const rotulo = ROTULOS[acaoReal] || '—';


// Editar abre um estado: a PRÓXIMA mensagem desta pessoa é o texto corrigido.
// O Porteiro é quem fecha o estado, e devolve a proposta reescrita com os
// mesmos três botões — texto editado por humano continua sem aprovação.
if (j.acao === 'editar') {
  let mem;
  try { mem = $getWorkflowStaticData('global'); } catch (erro) { mem = {}; }
  if (!mem.edicaoPendente) mem.edicaoPendente = {};
  mem.edicaoPendente[String(j.userId)] = {
    processoId: j.processoId || null,
    processoNumero: j.processoNumero || null,
    quando
  };
}

// A trilha: quem decidiu, o quê e quando. Na demo vai para o log da execução;
// no produto, vai para a auditoria (§7 do modelo de identidade).
const trilha = { acao: acaoReal, acaoPedida: j.acaoPedida, por: j.nome, papel: j.papel, userId: j.userId, quando,
  encaminhadoPara: encaminhar ? advogado.nome : null };

// ATENÇÃO: o Telegram devolve msg.text em TEXTO PURO — as marcações HTML que
// enviamos não voltam (elas viajam à parte, em "entities"). Procurar <b>…</b>
// aqui nunca casa, e o resultado é a mensagem reenviada idêntica: sem cabeçalho
// de decisão, sem formatação, e sem botões (editMessageText os remove).
// Por isso reconstruímos a mensagem por blocos, e reaplicamos o HTML nós mesmos.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const blocos = String(j.textoOriginal || '').split('\\n\\n');
// O aviso de topo sempre começa com ⚠️. Procurar pelo texto exato quebraria a
// cada mudança de redação, e o sintoma seria a mensagem remontada errada.
const temAviso = blocos[0] && blocos[0].indexOf('⚠️') === 0;
const iCabecalho = blocos.findIndex(b => b.indexOf('Proposta de mensagem ao cliente') === 0);

const aviso = temAviso ? esc(blocos[0]) + '\\n\\n' : '';

// A nota de uso de IA é NOTA, não mensagem: volta em itálico, para o cliente
// distinguir o que é o retorno do escritório do que é rodapé obrigatório.
const NOTA = ${JSON.stringify(NOTA_IA)};
const blocosCorpo = (iCabecalho >= 0 ? blocos.slice(iCabecalho + 1) : blocos.slice(temAviso ? 1 : 0));
const corpo = blocosCorpo
  .map(b => b.trim() === NOTA ? '<i>' + esc(b.trim()) + '</i>' : esc(b))
  .join('\\n\\n');

const assinatura = acaoReal === 'negado'
  ? 'tentativa de ' + j.nome + ' (' + j.papel + ') — só advogado aprova envio ao cliente'
  : acaoReal === 'encaminhado'
  ? 'redigido por ' + j.nome + ' (' + j.papel + ') · enviado a ' + advogado.nome + ' · ' + quando
  : acaoReal === 'editar'
  ? j.nome + ' vai reescrever · ' + quando
  : 'por ' + j.nome + ' · ' + quando;

// corpo JÁ vem escapado bloco a bloco acima — escapar de novo aqui viraria
// &lt;i&gt; na tela. Só assinatura e aviso precisam de escape neste ponto.
const instrucao = acaoReal === 'editar'
  ? '\\n\\n<i>Mande agora a mensagem como ela deve ficar. Escreva <b>cancelar</b> para desistir.</i>'
  : acaoReal === 'encaminhado'
  ? '\\n\\n<i>Você não aprova envio ao cliente, mas o trabalho não se perdeu: a proposta foi para ' + esc(advogado.nome) + '. Você recebe o desfecho aqui.</i>'
  : '';
// A MESMA mensagem é reescrita conforme os fatos mudam: aprovada, depois
// entregue — ou aprovada e não entregue. Por isso montar(), e não um texto só.
const montar = (rot, rodape) =>
  aviso + '<b>' + rot + '</b>\\n<i>' + esc(assinatura) + '</i>\\n\\n' + corpo + (rodape || instrucao);
const texto = montar(rotulo);

// --- para quem vai, se for ------------------------------------------------
// O destinatário sai da lista, casado pelo processo. Não sai da conversa, nem
// da redação do modelo, nem de um número digitado por alguém. É a mesma ideia
// da Regra 1 aplicada ao caminho de VOLTA: o poder de escolher para quem o
// escritório fala não pode morar dentro de um texto.
const DESTINOS = ${JSON.stringify(DESTINOS, null, 2)};
const destino = j.processoId ? DESTINOS[j.processoId] || null : null;

// Só aprovar envia. E j.acao só vale 'aprovar' se quem clicou podia aprovar —
// o Porteiro já rebaixou para 'negado' quem não podia (Regra 2).
const enviarAoCliente = acaoReal === 'aprovar' && Boolean(destino && destino.numero);

const AVISO_WA = ${JSON.stringify(AVISO_TOPO_WA)};
const NOTA_WA = ${JSON.stringify(NOTA_IA_WA)};

// A mensagem ao cliente é o corpo aprovado, e SÓ ele: sem o cabeçalho de
// proposta, sem a assinatura de quem aprovou, sem HTML (o WhatsApp não lê).
// A nota de IA é reposta em itálico do WhatsApp, no lugar dela.
const textoAoCliente = enviarAoCliente
  ? [AVISO_WA, '', blocosCorpo.filter(b => b.trim() !== NOTA).join('\\n\\n').trim(), '', NOTA_WA].join('\\n')
  : null;

// Número mascarado para a confirmação. O colaborador precisa ver PARA QUEM
// foi, não precisa ver o número inteiro numa tela que pode estar sendo
// projetada — e numa demonstração ela está.
const mascarado = destino && destino.numero
  ? '•••• ' + destino.numero.slice(-4)
  : null;

// --- três estados da MESMA mensagem, na ordem em que os fatos acontecem ----
// textoFinal      é escrito ao clicar          — "aprovado", ainda enviando
// textoFinalEnviado  depois que a Uazapi aceitou — "aprovado e entregue"
// textoFinalFalhou   se a Uazapi recusou        — "aprovado e NÃO entregue"
//
// Antes existia um rótulo só, escrito no clique, dizendo "APROVADO E ENVIADO".
// Se a Uazapi falhasse, a tela continuava afirmando que o cliente tinha sido
// avisado. Numa demonstração isso é constrangedor; num escritório, é o
// advogado achando que o cliente foi informado quando não foi.
const textoFinal = !enviarAoCliente && acaoReal === 'aprovar'
  ? montar('⚠️ APROVADO, MAS SEM DESTINATÁRIO',
      '\\n\\n<i>Nenhum cliente está vinculado a este processo na lista do escritório. Nada saiu daqui.</i>')
  : enviarAoCliente
  ? montar('✅ APROVADO', '\\n\\n<i>Enviando ao cliente…</i>')
  : texto;

const textoFinalEnviado = enviarAoCliente
  ? montar('📤 APROVADO E ENTREGUE',
      '\\n\\n<i>Entregue a ' + esc(destino.nome) + ' · ' + mascarado + ' · ' + quando + '</i>')
  : null;

const textoFinalFalhou = enviarAoCliente
  ? montar('❌ APROVADO, MAS NÃO ENTREGUE',
      '\\n\\n<i>A aprovação está registrada, e a mensagem NÃO chegou ao cliente — o WhatsApp recusou o envio. ' +
      'Ninguém foi avisado no lugar dele. Tente de novo, ou avise o cliente por outro caminho.</i>')
  : null;

// A proposta que sobe para o advogado. Ela chega COM os três botões, e os
// botões carregam o processo e quem redigiu — é assim que a decisão volta para
// a pessoa certa, sem que ninguém aprove no lugar de ninguém.
const textoEncaminhado = encaminhar
  ? aviso + '<b>📨 PROPOSTA AGUARDANDO SUA APROVAÇÃO</b>\\n<i>' +
      esc('redigida por ' + j.nome + ' (' + j.papel + ') · ' + quando) + '</i>\\n\\n' +
      corpo + '\\n\\n<i>Nada foi enviado ao cliente. A decisão é sua.</i>'
  : null;

// O desfecho volta para quem redigiu — sem isso, encaminhar seria só um jeito
// mais elegante de a mensagem sumir. Só existe quando quem decidiu NÃO é quem
// redigiu; aprovar a própria redação não precisa de aviso a si mesmo.
const avisoAoAutor = !j.autorChatId ? null
  : acaoReal === 'aprovar' && enviarAoCliente
  ? '✅ <b>Sua proposta foi aprovada e enviada ao cliente</b>\\n<i>por ' + esc(j.nome) + ' · ' + quando + '</i>'
  : acaoReal === 'aprovar'
  ? '⚠️ <b>Sua proposta foi aprovada, mas não foi enviada</b>\\n<i>Nenhum cliente está vinculado a este processo na lista do escritório.</i>'
  : acaoReal === 'descartar'
  ? '❌ <b>Sua proposta foi descartada</b>\\n<i>por ' + esc(j.nome) + ' · ' + quando + '</i>'
  : acaoReal === 'editar'
  ? '✏️ <b>' + esc(j.nome) + ' está reescrevendo a sua proposta</b>'
  : null;

const desfecho = encaminhar ? 'encaminhar'
  : acaoReal !== 'aprovar' ? 'nada'
  : enviarAoCliente ? 'enviar' : 'sem-destino';

return { json: { ...j, trilha,
  textoFinal, textoFinalEnviado, textoFinalFalhou,
  acao: acaoReal, enviarAoCliente, textoAoCliente, desfecho,
  textoEncaminhado, avisoAoAutor,
  advogadoChatId: encaminhar ? advogado.id : null,
  advogadoNome: advogado ? advogado.nome : null,
  clienteNumero: enviarAoCliente ? destino.numero : null,
  clienteNome: destino ? destino.nome : null } };
`.trim() }, [460, 500]),

  no('Confirmar clique', 'n8n-nodes-base.telegram', 1.2,
    { resource: 'callback', operation: 'answerQuery',
      queryId: '={{ $json.callbackId }}',
      additionalFields: { text: '={{ ({aprovar:"Aprovado", editar:"Marcado para edição", descartar:"Descartado", encaminhado:"Enviado ao advogado para aprovação", negado:"Somente advogado aprova envio ao cliente"})[$json.acao] }}' } },
    [700, 620], { credentials: { telegramApi: cred.telegram } }),

  no('Atualizar mensagem', 'n8n-nodes-base.telegram', 1.2,
    { resource: 'message', operation: 'editMessageText',
      chatId: "={{ $('Porteiro (verificação em código)').item.json.chatId }}",
      messageId: "={{ $('Registrar decisão').item.json.messageId }}",
      text: "={{ $('Registrar decisão').item.json.textoFinal }}",
      additionalFields: { parse_mode: 'HTML' } }, [960, 620],
    { credentials: { telegramApi: cred.telegram } }),

  no('Responder sem consultar', 'n8n-nodes-base.telegram', 1.2,
    { chatId: '={{ $json.chatId }}', text: '={{ $json.texto }}',
      additionalFields: { parse_mode: 'HTML', appendAttribution: false } }, [460, 760],
    { credentials: { telegramApi: cred.telegram } }),

  // O texto reescrito à mão volta com os MESMOS três botões. Editar não é
  // atalho para enviar: quem reescreve pode não ser quem aprova (Regra 2).
  no('Repropor texto editado', 'n8n-nodes-base.telegram', 1.2,
    { chatId: '={{ $json.chatId }}', text: '={{ $json.textoProposta }}',
      replyMarkup: 'inlineKeyboard',
      inlineKeyboard: BOTOES('$json.processoId', '$json.userId'),
      additionalFields: { parse_mode: 'HTML', appendAttribution: false } }, [460, 940],
    { credentials: { telegramApi: cred.telegram } }),

  // --- o fio até o cliente -------------------------------------------------
  // Este IF é a única porta entre "o advogado clicou" e "a mensagem saiu".
  // Ele lê uma decisão já tomada em código (enviarAoCliente), não um texto.
  // Três desfechos, não dois: enviar, avisar que não havia para quem enviar, e
  // não fazer nada (editar, descartar, negado). O terceiro é o mais comum, e
  // por isso é o padrão: fallbackOutput 'none' — sem regra que case, para.
  no('Desfecho da aprovação', 'n8n-nodes-base.switch', 3,
    { rules: { values: [
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' },
            leftValue: "={{ $('Registrar decisão').item.json.desfecho }}", rightValue: 'enviar' }] },
          outputKey: 'enviar' },
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' },
            leftValue: "={{ $('Registrar decisão').item.json.desfecho }}", rightValue: 'sem-destino' }] },
          outputKey: 'sem-destino' },
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' },
            leftValue: "={{ $('Registrar decisão').item.json.desfecho }}", rightValue: 'encaminhar' }] },
          outputKey: 'encaminhar' },
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' },
            leftValue: "={{ $('Registrar decisão').item.json.desfecho }}", rightValue: 'nada' }] },
          outputKey: 'nada' },
      ] }, options: { fallbackOutput: 'none' } }, [1220, 620]),

  no('Enviar ao cliente (WhatsApp)', 'n8n-nodes-base.httpRequest', 4.2,
    { method: 'POST',
      url: 'https://free.uazapi.com/send/text',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      specifyBody: 'json',
      // O token vai por credencial, nunca no corpo do fluxo — este JSON é
      // versionado. O número vem do nó de decisão, não da expressão.
      jsonBody: `=${'{{'} JSON.stringify({ number: $('Registrar decisão').item.json.clienteNumero, text: $('Registrar decisão').item.json.textoAoCliente, linkPreview: false, delay: 1200 }) ${'}}'}`,
      options: {} }, [1460, 540],
    { // Uma falha de rede não pode virar "o cliente não foi avisado". Três
      // tentativas espaçadas cobrem a instabilidade comum; o que passar disso
      // é problema real, e problema real tem que aparecer — por isso a saída
      // de erro, e não `continueRegularOutput`, que engoliria a falha e
      // seguiria para o nó que diz "entregue".
      retryOnFail: true, maxTries: 3, waitBetweenTries: 2000,
      onError: 'continueErrorOutput',
      ...(cred.uazapi ? { credentials: { httpHeaderAuth: cred.uazapi } } : {}) }),

  // A MESMA mensagem é reescrita, agora que o envio aconteceu de fato. Não é
  // mensagem nova: o colaborador vê o rótulo mudar de "APROVADO · enviando…"
  // para "APROVADO E ENTREGUE", no lugar onde ele clicou.
  no('Marcar como entregue', 'n8n-nodes-base.telegram', 1.2,
    { resource: 'message', operation: 'editMessageText',
      chatId: "={{ $('Registrar decisão').item.json.chatId }}",
      messageId: "={{ $('Registrar decisão').item.json.messageId }}",
      text: "={{ $('Registrar decisão').item.json.textoFinalEnviado }}",
      additionalFields: { parse_mode: 'HTML' } }, [1700, 460],
    { credentials: { telegramApi: cred.telegram } }),

  // E o caminho que faltava: o envio falhou. Ninguém foi avisado, e a tela tem
  // que dizer isso. Silêncio aqui é pior do que erro — o advogado sairia
  // achando que o cliente foi informado.
  no('Marcar falha no envio', 'n8n-nodes-base.telegram', 1.2,
    { resource: 'message', operation: 'editMessageText',
      chatId: "={{ $('Registrar decisão').item.json.chatId }}",
      messageId: "={{ $('Registrar decisão').item.json.messageId }}",
      text: "={{ $('Registrar decisão').item.json.textoFinalFalhou }}",
      additionalFields: { parse_mode: 'HTML' } }, [1700, 620],
    { credentials: { telegramApi: cred.telegram } }),

  // --- o que o estagiário não pode aprovar sobe para quem pode -------------
  // Sem este nó, a recusa era um beco: a redação morria ali e o estagiário
  // tinha que chamar o advogado pelo braço. A proposta chega ao advogado COM
  // os três botões, e os botões carregam o processo e quem redigiu — quem
  // aprova é ele, com a identidade dele. Ninguém aprova no lugar de ninguém.
  no('Encaminhar ao advogado', 'n8n-nodes-base.telegram', 1.2,
    { chatId: "={{ $('Registrar decisão').item.json.advogadoChatId }}",
      text: "={{ $('Registrar decisão').item.json.textoEncaminhado }}",
      replyMarkup: 'inlineKeyboard',
      inlineKeyboard: BOTOES("$('Registrar decisão').item.json.processoId",
                             "$('Registrar decisão').item.json.userId"),
      additionalFields: { parse_mode: 'HTML', appendAttribution: false } }, [1460, 860],
    { credentials: { telegramApi: cred.telegram } }),

  // O desfecho volta para quem redigiu. Encaminhar sem devolver resposta seria
  // só um jeito mais elegante de a mensagem sumir.
  no('Tem quem avisar?', 'n8n-nodes-base.filter', 2.2,
    { conditions: { options: { caseSensitive: true, version: 2, typeValidation: 'loose' },
        combinator: 'and',
        conditions: [{ id: 'tem',
          operator: { type: 'string', operation: 'notEmpty', singleValue: true },
          leftValue: "={{ $('Registrar decisão').item.json.avisoAoAutor }}",
          rightValue: '' }] },
      options: {} }, [1700, 700]),

  no('Avisar quem redigiu', 'n8n-nodes-base.telegram', 1.2,
    { chatId: "={{ $('Registrar decisão').item.json.autorChatId }}",
      text: "={{ $('Registrar decisão').item.json.avisoAoAutor }}",
      additionalFields: { parse_mode: 'HTML', appendAttribution: false } }, [1940, 700],
    { credentials: { telegramApi: cred.telegram } }),

];

const connections = {
  'Telegram Trigger':                 { main: [[{ node: 'Porteiro (verificação em código)', type: 'main', index: 0 }]] },
  'Porteiro (verificação em código)': { main: [[{ node: 'Rota', type: 'main', index: 0 }]] },
  'Rota': { main: [
      [{ node: 'Ficha do processo', type: 'main', index: 0 }],
      [{ node: 'Ficha do processo (redação)', type: 'main', index: 0 }],
      [{ node: 'Registrar decisão', type: 'main', index: 0 }],
      [{ node: 'Responder sem consultar', type: 'main', index: 0 }],
      [{ node: 'Repropor texto editado', type: 'main', index: 0 }],
  ] },
  'Ficha do processo':           { main: [[{ node: 'Responder ao colaborador', type: 'main', index: 0 }]] },
  'Ficha do processo (redação)': { main: [[{ node: 'Redigir mensagem ao cliente', type: 'main', index: 0 }]] },
  'Modelo — consulta': { ai_languageModel: [[{ node: 'Responder ao colaborador', type: 'ai_languageModel', index: 0 }]] },
  'Modelo — redação':  { ai_languageModel: [[{ node: 'Redigir mensagem ao cliente', type: 'ai_languageModel', index: 0 }]] },
  'Responder ao colaborador':    { main: [[{ node: 'Enviar resposta', type: 'main', index: 0 }]] },
  'Redigir mensagem ao cliente': { main: [[{ node: 'Propor envio (aguarda aprovação)', type: 'main', index: 0 }]] },
  'Registrar decisão': { main: [[{ node: 'Confirmar clique', type: 'main', index: 0 }]] },
  'Confirmar clique':  { main: [[{ node: 'Atualizar mensagem', type: 'main', index: 0 }]] },
  // A mensagem no Telegram é atualizada ANTES do envio: quem clicou vê na hora
  // que a decisão foi registrada, e a confirmação de envio chega logo atrás.
  'Atualizar mensagem': { main: [[{ node: 'Desfecho da aprovação', type: 'main', index: 0 }]] },
  'Desfecho da aprovação': { main: [
      [{ node: 'Enviar ao cliente (WhatsApp)', type: 'main', index: 0 }],
      // 'sem-destino' — a própria mensagem já foi reescrita com o aviso de que
      // nada saiu; só falta avisar quem redigiu, se não foi quem decidiu.
      [{ node: 'Tem quem avisar?', type: 'main', index: 0 }],
      [{ node: 'Encaminhar ao advogado', type: 'main', index: 0 }],
      // 'nada' — editar, descartar, negado. Nada sai daqui para o cliente, mas
      // quem redigiu ainda pode precisar saber o que houve.
      [{ node: 'Tem quem avisar?', type: 'main', index: 0 }],
  ] },
  // Duas saídas: a primeira é sucesso, a segunda é a saída de erro do nó. Quem
  // redigiu só é avisado pelo caminho de sucesso — dizer a ele que a mensagem
  // foi entregue quando ela não foi seria repetir o defeito num terceiro lugar.
  'Enviar ao cliente (WhatsApp)': { main: [
      [{ node: 'Marcar como entregue', type: 'main', index: 0 }],
      [{ node: 'Marcar falha no envio', type: 'main', index: 0 }],
  ] },
  'Marcar como entregue': { main: [[{ node: 'Tem quem avisar?', type: 'main', index: 0 }]] },
  'Tem quem avisar?':     { main: [[{ node: 'Avisar quem redigiu', type: 'main', index: 0 }]] },
};

const workflow = {
  name: NOME,
  nodes: nodes.map(({ id, ...n }) => n),
  connections,
  settings: { executionOrder: 'v1' },
};

// ===========================================================================
// Saída
// ===========================================================================
const dir = path.join(AQUI, 'workflows');
fs.mkdirSync(dir, { recursive: true });
const saida = path.join(dir, 'A-colaborador-telegram.json');
fs.writeFileSync(saida, JSON.stringify(workflow, null, 2) + '\n');
console.log(`\nworkflow escrito : demo/workflows/A-colaborador-telegram.json`);
console.log(`  nós            : ${nodes.length}`);
console.log(`  ativo          : não (ativação é decisão do usuário)`);

if (!publicar) {
  console.log(`\nPara enviar ao n8n:  node demo/montar-fluxo-a.mjs --publicar\n`);
  process.exit(0);
}

// --- publicação ------------------------------------------------------------
const { baseUrl } = JSON.parse(fs.readFileSync(path.join(AQUI, 'n8n.json'), 'utf8'));
const chave = fs.readFileSync(path.join(AQUI, 'n8n.local'), 'utf8').trim();
const base = baseUrl.replace(/\/+$/, '') + '/api/v1';
const cab = { 'X-N8N-API-KEY': chave, 'Content-Type': 'application/json', 'Accept': 'application/json' };

const existentes = await (await fetch(`${base}/workflows?limit=250`, { headers: cab })).json();
const jaExiste = (existentes.data || []).find(w => w.name === NOME);

const r = await fetch(jaExiste ? `${base}/workflows/${jaExiste.id}` : `${base}/workflows`, {
  method: jaExiste ? 'PUT' : 'POST', headers: cab, body: JSON.stringify(workflow),
});
const corpo = await r.json();

if (!r.ok) {
  console.error(`\nfalhou (HTTP ${r.status}): ${JSON.stringify(corpo).slice(0, 600)}\n`);
  process.exit(1);
}
console.log(`\n${jaExiste ? 'atualizado' : 'criado'} no n8n · id ${corpo.id}`);
console.log(`  ${baseUrl.replace(/\/+$/, '')}/workflow/${corpo.id}\n`);

if (ativar) {
  const a = await fetch(`${base}/workflows/${corpo.id}/activate`, { method: 'POST', headers: cab });
  if (!a.ok) {
    console.error(`  nao consegui ativar (HTTP ${a.status}): ${(await a.text()).slice(0, 300)}`);
    console.error('  ative pelo painel do n8n, no botao do canto superior direito.\n');
    process.exit(1);
  }
  console.log('  ATIVADO — o gatilho ja esta recebendo eventos.\n');
} else {
  console.log('  inativo. Para ligar:  node demo/montar-fluxo-a.mjs --publicar --ativar\n');
}
