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

const emSegredo = instantaneo.processos.filter((p) => p.segredo_justica).length;
console.log(`instantâneo : ${instantaneo.origem} · ${instantaneo.processos.length} processo(s)`
  + (emSegredo ? ` · ${emSegredo} em segredo de justiça` : ''));
if (bruto.nomes_reais) console.log(`\x1b[33m              NOMES REAIS — este fluxo levará dado de cliente ao provedor de IA (D-97)\x1b[0m`);
console.log(`              ficha limitada a ${MOVS_NA_FICHA} movimentações por processo`);
console.log(`lista       : ${path.basename(listaPath)} · ${lista.colaboradores.length} colaborador(es)`);

// ===========================================================================
// O PORTEIRO — a Regra 1 em código
// ===========================================================================
// Este nó decide QUEM pode e O QUE pode, ANTES de qualquer chamada ao modelo.
// Não é instrução de prompt: é verificação. Convencer a IA por conversa não
// contorna nada, porque quem decide não é ela.
const CODIGO_PORTEIRO = `
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
const soDigitos = (t) => String(t).replace(/\D/g, '');
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

// --- ramo do clique nos botões --------------------------------------------
if (cb) {
  const [acao] = String(cb.data || '').split(':');

  // barreira 2: só advogado aprova envio ao cliente (Regra 2 + D-06).
  // A recusa segue pelo MESMO caminho do clique legítimo — assim o botão
  // recebe resposta e a tentativa fica registrada na trilha.
  const efetiva = (acao === 'aprovar' && !base.podeAprovar) ? 'negado' : acao;

  return { json: { ...base, rota: 'aprovacao', acao: efetiva, acaoPedida: acao,
    callbackId: cb.id, messageId: msg.message_id,
    textoOriginal: (msg.text || msg.caption || '') }};
}

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

// --- ramo da mensagem de texto --------------------------------------------
const texto = String((msg && msg.text) || '').trim();

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

// Barreira 4: segredo de justiça. É verificação em código, não instrução ao
// modelo — o conteúdo nem chega a ser montado, então não há o que convencer.
if (alvo.segredo) {
  memoria.ultimoProcesso[String(de.id)] = alvo.id;
  return { json: { ...base, rota: 'negado', texto: [
    '🔒 <b>Processo em segredo de justiça</b>',
    '',
    '<code>' + alvo.numero + '</code> — ' + (alvo.classe || '').toLowerCase(),
    '',
    'Não exibo andamento nem redijo mensagem sobre processo em segredo. ' +
    'Consulte diretamente o sistema do tribunal, com a sua identificação.',
    '',
    '<i>Esta recusa é verificada em código, antes de qualquer consulta. ' +
    'Não é uma orientação dada à inteligência artificial.</i>'
  ].join('\\n') }};
}

memoria.ultimoProcesso[String(de.id)] = alvo.id;

const querRedigir = /redi[jg]|retorno|mensagem|escrev|comunic|avis/i.test(texto);

return { json: { ...base, rota: querRedigir ? 'redigir' : 'consulta',
  processoId: alvo.id, processoNumero: alvo.numero, pergunta: texto }};
`.trim();

// ===========================================================================
// O instantâneo, servido como contexto ao modelo
// ===========================================================================
const CODIGO_CONTEXTO = `
const INSTANTANEO = ${JSON.stringify(instantaneo)};

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

const ehEnsaio = INSTANTANEO.origem === 'ensaio-ficticio';

// O aviso de topo diz ao colaborador o que ele está vendo. Sempre começa com
// ⚠️ — o nó de aprovação reconhece o bloco por esse marcador.
const avisoTopo = ehEnsaio
  ? '⚠️ <b>DADOS FICTÍCIOS — demonstração</b>'
  : INSTANTANEO.nomes_reais
  ? '⚠️ <b>DADOS REAIS DE CLIENTE — demonstração</b>'
  : '⚠️ <b>Demonstração — dados reais do escritório, nomes anonimizados</b>';

return { json: { ...$json, ficha, aviso_origem: INSTANTANEO.aviso,
  ehEnsaio, avisoTopo } };
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

// A nota de uso de IA (Recomendação nº 001/2024 do CFOAB, D-92) NÃO é pedida ao
// modelo: ela é acrescentada pelo fluxo, em itálico, como nota de rodapé. Texto
// obrigatório não se delega a quem pode variar a redação — e o itálico distingue
// a nota da mensagem ao cliente, que é o que ele de fato deve ler.
const NOTA_IA = 'Esta mensagem foi preparada com apoio de inteligência artificial e revisada por um advogado do escritório.';

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

const cred = { openai: credCfg.openAiApi, telegram: credCfg.telegramApi };

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
          outputKey: 'direto' }
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
      inlineKeyboard: { rows: [ { row: { buttons: [
        { text: '✅ Aprovar e enviar', additionalFields: { callback_data: 'aprovar' } },
        { text: '✏️ Editar',          additionalFields: { callback_data: 'editar' } },
        { text: '❌ Descartar',       additionalFields: { callback_data: 'descartar' } }
      ] } } ] },
      additionalFields: { parse_mode: 'HTML', appendAttribution: false } }, [960, 300],
    { credentials: { telegramApi: cred.telegram } }),

  no('Registrar decisão', 'n8n-nodes-base.code', 2,
    { mode: 'runOnceForEachItem', jsCode: `
const j = $json;
const quando = new Date().toISOString().replace('T',' ').slice(0,16) + ' UTC';
const rotulo = {
  aprovar:   '✅ APROVADO E ENVIADO',
  editar:    '✏️ EM EDIÇÃO',
  descartar: '❌ DESCARTADO',
  negado:    '⛔ ENVIO NÃO AUTORIZADO'
}[j.acao] || '—';

// A trilha: quem decidiu, o quê e quando. Na demo vai para o log da execução;
// no produto, vai para a auditoria (§7 do modelo de identidade).
const trilha = { acao: j.acao, acaoPedida: j.acaoPedida, por: j.nome, papel: j.papel, userId: j.userId, quando };

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
const corpo = (iCabecalho >= 0 ? blocos.slice(iCabecalho + 1) : blocos.slice(temAviso ? 1 : 0))
  .map(b => b.trim() === NOTA ? '<i>' + esc(b.trim()) + '</i>' : esc(b))
  .join('\\n\\n');

const assinatura = j.acao === 'negado'
  ? 'tentativa de ' + j.nome + ' (' + j.papel + ') — só advogado aprova envio ao cliente'
  : 'por ' + j.nome + ' · ' + quando;

// corpo JÁ vem escapado bloco a bloco acima — escapar de novo aqui viraria
// &lt;i&gt; na tela. Só assinatura e aviso precisam de escape neste ponto.
const texto = aviso + '<b>' + rotulo + '</b>\\n<i>' + esc(assinatura) + '</i>\\n\\n' + corpo;

return { json: { ...j, trilha, textoFinal: texto,
  aviso: j.acao === 'aprovar'
    ? 'Na demonstração completa, este clique dispara o envio ao cliente no WhatsApp.'
    : null } };
`.trim() }, [460, 500]),

  no('Confirmar clique', 'n8n-nodes-base.telegram', 1.2,
    { resource: 'callback', operation: 'answerQuery',
      queryId: '={{ $json.callbackId }}',
      additionalFields: { text: '={{ ({aprovar:"Aprovado", editar:"Marcado para edição", descartar:"Descartado", negado:"Somente advogado aprova envio ao cliente"})[$json.acao] }}' } },
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
];

const connections = {
  'Telegram Trigger':                 { main: [[{ node: 'Porteiro (verificação em código)', type: 'main', index: 0 }]] },
  'Porteiro (verificação em código)': { main: [[{ node: 'Rota', type: 'main', index: 0 }]] },
  'Rota': { main: [
      [{ node: 'Ficha do processo', type: 'main', index: 0 }],
      [{ node: 'Ficha do processo (redação)', type: 'main', index: 0 }],
      [{ node: 'Registrar decisão', type: 'main', index: 0 }],
      [{ node: 'Responder sem consultar', type: 'main', index: 0 }],
  ] },
  'Ficha do processo':           { main: [[{ node: 'Responder ao colaborador', type: 'main', index: 0 }]] },
  'Ficha do processo (redação)': { main: [[{ node: 'Redigir mensagem ao cliente', type: 'main', index: 0 }]] },
  'Modelo — consulta': { ai_languageModel: [[{ node: 'Responder ao colaborador', type: 'ai_languageModel', index: 0 }]] },
  'Modelo — redação':  { ai_languageModel: [[{ node: 'Redigir mensagem ao cliente', type: 'ai_languageModel', index: 0 }]] },
  'Responder ao colaborador':    { main: [[{ node: 'Enviar resposta', type: 'main', index: 0 }]] },
  'Redigir mensagem ao cliente': { main: [[{ node: 'Propor envio (aguarda aprovação)', type: 'main', index: 0 }]] },
  'Registrar decisão': { main: [[{ node: 'Confirmar clique', type: 'main', index: 0 }]] },
  'Confirmar clique':  { main: [[{ node: 'Atualizar mensagem', type: 'main', index: 0 }]] },
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
