#!/usr/bin/env node
/**
 * testar-fluxo-a.mjs — roda a lógica do fluxo A sem tocar no n8n nem na OpenAI
 * ---------------------------------------------------------------------------
 * Existe porque três defeitos chegaram até o usuário antes de mim, e os três
 * eram testáveis aqui: Code node devolvendo array, teclado no nível errado, e
 * uma expressão regular procurando HTML num texto que o Telegram devolve puro.
 *
 * Não substitui o teste no Telegram — não cobre credencial, webhook nem modelo.
 * Cobre o que é nosso: as barreiras do porteiro e a montagem das mensagens.
 *
 *   node demo/testar-fluxo-a.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const wf = JSON.parse(fs.readFileSync(path.join(AQUI, 'workflows', 'A-colaborador-telegram.json'), 'utf8'));

const codigo = (nome) => {
  const n = wf.nodes.find((x) => x.name === nome);
  if (!n) throw new Error(`nó não encontrado: ${nome}`);
  return n.parameters.jsCode;
};
// O Porteiro guarda o último processo no armazenamento estático do workflow.
// Aqui isso vira um objeto comum — cada `memoriaNova()` simula uma instância
// recém-criada, sem lembrança nenhuma.
let MEMORIA = {};
const memoriaNova = () => { MEMORIA = {}; };
const rodar = (js, $json) => new Function('$json', '$getWorkflowStaticData', js)($json, () => MEMORIA);

const lista = JSON.parse(fs.readFileSync(
  fs.existsSync(path.join(AQUI, 'listas', 'colaboradores.json'))
    ? path.join(AQUI, 'listas', 'colaboradores.json')
    : path.join(AQUI, 'listas', 'colaboradores.exemplo.json'), 'utf8'));

const instantaneo = JSON.parse(fs.readFileSync(path.join(AQUI, 'instantaneo', 'ensaio.json'), 'utf8'));

const ADVOGADO   = lista.colaboradores.find(c => c.pode_aprovar_envio_ao_cliente) || {};
const SEM_PODER  = lista.colaboradores.find(c => !c.pode_aprovar_envio_ao_cliente) || {};
const NUMERO     = instantaneo.processos[0].numero_cnj;
const APELIDO    = instantaneo.processos[0].id;

let falhas = 0;
function checar(rotulo, condicao, detalhe = '') {
  const ok = Boolean(condicao);
  if (!ok) falhas++;
  console.log(`  ${ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${rotulo}${detalhe && !ok ? `\n      ${detalhe}` : ''}`);
}

const msg = (userId, texto) => ({ message: { message_id: 1, chat: { id: userId }, from: { id: userId }, text: texto } });
const clique = (userId, data, textoDaMensagem) => ({
  callback_query: { id: 'cb1', data, from: { id: userId },
    message: { message_id: 42, chat: { id: userId }, text: textoDaMensagem } },
});

// A mensagem como o TELEGRAM a devolve: texto puro, sem as marcações HTML.
// Reproduzir isso fielmente é o ponto do teste — foi aqui que o defeito morava.
const PROPOSTA_COMO_O_TELEGRAM_DEVOLVE = [
  '⚠️ DADOS FICTÍCIOS — demonstração',
  '',
  'Proposta de mensagem ao cliente',
  'Nada foi enviado. Nada sai sem aprovação de advogado.',
  '',
  'Olá! Informamos que o processo referente à sua demanda foi concluído e encontra-se arquivado.',
  '',
  'Esta mensagem foi preparada com apoio de inteligência artificial e revisada por um advogado do escritório.',
].join('\n');

const NOTA_IA = 'Esta mensagem foi preparada com apoio de inteligência artificial e revisada por um advogado do escritório.';

// ===========================================================================
console.log('\n\x1b[1mPorteiro — as três barreiras\x1b[0m');
const P = codigo('Porteiro (verificação em código)');

const desconhecido = rodar(P, msg(999999999, 'oi')).json;
checar('desconhecido é recusado', desconhecido.rota === 'negado');
checar('recusa devolve o próprio user_id', String(desconhecido.texto).includes('999999999'));
checar('recusa não vaza nome de colaborador', !String(desconhecido.texto).includes(ADVOGADO.nome || '@@'));

const boasVindas = rodar(P, msg(ADVOGADO.telegram_user_id, '/start')).json;
checar('autorizado recebe boas-vindas', boasVindas.rota === 'negado' && String(boasVindas.texto).includes('Olá'));
checar('boas-vindas mostram o NÚMERO do processo, não o apelido interno',
  String(boasVindas.texto).includes(NUMERO), `texto: ${String(boasVindas.texto).slice(0, 120)}`);

for (const [rotulo, pergunta] of [
  ['pelo número com pontuação', `Como está o processo ${NUMERO}?`],
  ['pelo número sem pontuação', `Como está o processo ${NUMERO.replace(/\D/g, '')}?`],
  ['pelo apelido interno', `Como está o processo ${APELIDO}?`],
]) {
  const r = rodar(P, msg(ADVOGADO.telegram_user_id, pergunta)).json;
  checar(`consulta reconhecida ${rotulo}`, r.rota === 'consulta' && r.processoId === APELIDO, `rota=${r.rota}`);
}

const red = rodar(P, msg(ADVOGADO.telegram_user_id, 'Redige um retorno para o cliente sobre esse processo')).json;
checar('pedido de redação vai para a rota certa', red.rota === 'redigir');

// ---------------------------------------------------------------------------
console.log('\n\x1b[1mSaudação — abrir conversa sem /start\x1b[0m');
for (const saudacao of ['oi', 'Oi!', 'olá', 'Bom dia', 'boa noite', 'e aí', 'ajuda', '/start']) {
  memoriaNova();
  const r = rodar(P, msg(ADVOGADO.telegram_user_id, saudacao)).json;
  const ok = r.rota === 'negado' && String(r.texto).includes('Olá');
  checar(`"${saudacao}" abre com boas-vindas, não com resumo`, ok,
    `rota=${r.rota} · ${String(r.texto || '').slice(0, 80)}`);
}
const pergunta = rodar(P, msg(ADVOGADO.telegram_user_id, `Como está o processo ${NUMERO}?`)).json;
checar('mensagem de conteúdo NÃO é confundida com saudação', pergunta.rota === 'consulta');

// ---------------------------------------------------------------------------
console.log('\n\x1b[1mMemória curta — "esse processo" tem a que se referir\x1b[0m');
memoriaNova();
rodar(P, msg(ADVOGADO.telegram_user_id, `Como está o processo ${NUMERO}?`));
checar('o processo consultado fica guardado', MEMORIA.ultimoProcesso[String(ADVOGADO.telegram_user_id)] === APELIDO);
const seguimento = rodar(P, msg(ADVOGADO.telegram_user_id, 'Redige um retorno para o cliente sobre esse processo')).json;
checar('o seguimento recupera o processo da memória', seguimento.processoId === APELIDO);
checar('a memória é por pessoa, não do fluxo inteiro',
  MEMORIA.ultimoProcesso[String(999999999)] === undefined);
checar('saudação não apaga a memória',
  MEMORIA.ultimoProcesso[String(ADVOGADO.telegram_user_id)] === APELIDO);

// Memória é conveniência, não segurança: sem armazenamento, responde assim mesmo.
const semMemoria = new Function('$json', '$getWorkflowStaticData',
  codigo('Porteiro (verificação em código)'))(
    msg(ADVOGADO.telegram_user_id, `Como está o processo ${NUMERO}?`),
    () => { throw new Error('armazenamento indisponível'); }).json;
checar('sem armazenamento estático, ainda responde', semMemoria.rota === 'consulta');
memoriaNova();

// ===========================================================================
console.log('\n\x1b[1mFicha — o que o modelo recebe\x1b[0m');
const F = codigo('Ficha do processo');
const ficha = rodar(F, rodar(P, msg(ADVOGADO.telegram_user_id, `e o ${NUMERO}?`)).json).json;
checar('ficha inclui o número do processo', String(ficha.ficha).includes(NUMERO));
checar('ficha marca origem de ensaio', ficha.ehEnsaio === true);
checar('ficha não contém CPF', !/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(ficha.ficha));
checar('ficha agrupa papéis da mesma pessoa', /\(.*,.*\)/.test(ficha.ficha));

// ===========================================================================
console.log('\n\x1b[1mAprovação — o coração da demonstração\x1b[0m');
const R = codigo('Registrar decisão');

const aprov = rodar(R, rodar(P, clique(ADVOGADO.telegram_user_id, 'aprovar', PROPOSTA_COMO_O_TELEGRAM_DEVOLVE)).json).json;
checar('advogado aprova', aprov.acao === 'aprovar');
checar('mensagem final ganha o cabeçalho de aprovação', aprov.textoFinal.includes('✅ APROVADO E ENVIADO'),
  `recebido: ${JSON.stringify(aprov.textoFinal.slice(0, 100))}`);
checar('cabeçalho da proposta sai da mensagem', !aprov.textoFinal.includes('Nada foi enviado'));
checar('corpo da mensagem ao cliente é preservado', aprov.textoFinal.includes('encontra-se arquivado'));
checar('aviso de dados fictícios é preservado', aprov.textoFinal.includes('DADOS FICTÍCIOS'));
checar('assinatura nomeia quem aprovou', aprov.textoFinal.includes(ADVOGADO.nome));
checar('formatação HTML é reaplicada', /<b>.*<\/b>/.test(aprov.textoFinal));
checar('nota de uso de IA volta em itálico', aprov.textoFinal.includes(`<i>${NOTA_IA}</i>`),
  `trecho final: ${JSON.stringify(aprov.textoFinal.slice(-160))}`);
checar('corpo não é escapado duas vezes', !aprov.textoFinal.includes('&lt;'));

if (!SEM_PODER.telegram_user_id) {
  console.log('  \x1b[33m—\x1b[0m 3 verificações puladas: não há colaborador sem poder de aprovar com id real');
  console.log('      (preencha a vaga de estagiário em demo/listas/colaboradores.json)');
} else {
  const neg = rodar(R, rodar(P, clique(SEM_PODER.telegram_user_id, 'aprovar', PROPOSTA_COMO_O_TELEGRAM_DEVOLVE)).json).json;
  checar('quem não pode aprovar é barrado', neg.acao === 'negado');
  checar('a tentativa fica na trilha', neg.trilha.acaoPedida === 'aprovar' && neg.trilha.acao === 'negado');
  checar('mensagem mostra recusa', neg.textoFinal.includes('⛔ ENVIO NÃO AUTORIZADO'));
}

const desc = rodar(R, rodar(P, clique(ADVOGADO.telegram_user_id, 'descartar', PROPOSTA_COMO_O_TELEGRAM_DEVOLVE)).json).json;
checar('descarte é registrado', desc.textoFinal.includes('❌ DESCARTADO'));

// ===========================================================================
console.log('\n\x1b[1mEstrutura do fluxo\x1b[0m');
const proposta = wf.nodes.find(n => n.name === 'Propor envio (aguarda aprovação)');
checar('teclado está no nível de topo do nó', proposta.parameters.replyMarkup === 'inlineKeyboard');
checar('teclado NÃO está dentro de additionalFields', !('reply_markup' in (proposta.parameters.additionalFields || {})));
checar('três botões definidos', proposta.parameters.inlineKeyboard.rows[0].row.buttons.length === 3);
checar('parse_mode HTML na proposta', proposta.parameters.additionalFields.parse_mode === 'HTML');

checar('a proposta acrescenta a nota de IA em itálico, sem depender do modelo',
  proposta.parameters.text.includes(`<i>${NOTA_IA}</i>`));
const sistemaRedacao = wf.nodes.find(n => n.name === 'Redigir mensagem ao cliente')
  .parameters.messages.messageValues[0].message;
checar('o modelo é instruído a NÃO escrever a nota', !sistemaRedacao.includes(NOTA_IA));

const editar = wf.nodes.find(n => n.name === 'Atualizar mensagem');
checar('parse_mode HTML na atualização', editar.parameters.additionalFields.parse_mode === 'HTML');

for (const n of wf.nodes.filter(x => x.credentials)) {
  for (const [tipo, c] of Object.entries(n.credentials)) {
    checar(`credencial de ${n.name} tem id`, Boolean(c.id), `${tipo} sem id — o n8n escolheria outra`);
  }
}
checar('nenhum nó nasce ativo', wf.active !== true);

// ===========================================================================
console.log(falhas === 0
  ? '\n\x1b[32mtudo passou\x1b[0m — pode publicar\n'
  : `\n\x1b[31m${falhas} falha(s)\x1b[0m — NÃO publique\n`);
process.exit(falhas === 0 ? 0 : 1);
