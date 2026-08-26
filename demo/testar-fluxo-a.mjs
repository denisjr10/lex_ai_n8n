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

// O teste le o MESMO instantaneo que o gerador embutiu — o real quando existe.
// Testar contra o ensaio enquanto o fluxo publicado usa dado real e testar
// outro programa.
const caminhoReal = path.join(AQUI, 'instantaneo', 'processos.json');
const instantaneo = JSON.parse(fs.readFileSync(
  fs.existsSync(caminhoReal) ? caminhoReal : path.join(AQUI, 'instantaneo', 'ensaio.json'), 'utf8'));

const ADVOGADO   = lista.colaboradores.find(c => c.pode_aprovar_envio_ao_cliente) || {};
const SEM_PODER  = lista.colaboradores.find(c => !c.pode_aprovar_envio_ao_cliente) || {};
// As consultas de teste usam um processo SEM segredo: o de segredo tem barreira
// propria, testada a parte.
const ABERTO     = instantaneo.processos.find(p => !p.segredo_justica) || instantaneo.processos[0];
const SIGILOSO   = instantaneo.processos.find(p => p.segredo_justica) || null;
const NUMERO     = ABERTO.numero_cnj;
const APELIDO    = ABERTO.id;
const PARTE      = (ABERTO.envolvidos.find(e => e.nome) || {}).nome || '';

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
checar('boas-vindas não vazam o apelido interno',
  !String(boasVindas.texto).includes(APELIDO), `texto: ${String(boasVindas.texto).slice(0, 160)}`);
checar('boas-vindas anunciam quantos processos existem',
  String(boasVindas.texto).includes(String(instantaneo.processos.length)));

for (const [rotulo, pergunta] of [
  ['pelo número com pontuação', `Como está o processo ${NUMERO}?`],
  ['pelo número sem pontuação', `Como está o processo ${NUMERO.replace(/\D/g, '')}?`],
  ['pelo apelido interno', `Como está o processo ${APELIDO}?`],
  ['pelo nome da parte', `Como está o processo do ${PARTE}?`],
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
checar('ficha não contém CPF', !/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(ficha.ficha));

// O aviso de topo tem de dizer a verdade sobre a origem — é ele que impede o
// escritório de tomar decisão sobre processo que não existe.
checar('aviso de topo combina com a origem do instantâneo',
  instantaneo.origem === 'ensaio-ficticio'
    ? ficha.ehEnsaio === true && /FICTÍCIOS/.test(ficha.avisoTopo)
    : ficha.ehEnsaio === false && /dados reais/i.test(ficha.avisoTopo),
  `origem=${instantaneo.origem} · aviso=${ficha.avisoTopo}`);
checar('aviso de topo começa com ⚠️, o marcador que a aprovação procura',
  String(ficha.avisoTopo).indexOf('⚠️') === 0);

// O corte existe para caber na janela do modelo. Mas o total verdadeiro tem de
// aparecer, ou o modelo afirma que aquelas são todas as movimentações que há.
const linhaMovs = String(ficha.ficha).split('\n').find((l) => l.startsWith('MOVIMENTAÇÕES MAIS RECENTES'));
checar('ficha avisa que as movimentações são um recorte', Boolean(linhaMovs));
checar('ficha traz o total verdadeiro de movimentações',
  Boolean(linhaMovs) && linhaMovs.includes(String(ABERTO.quantidade_movimentacoes)),
  `linha: ${linhaMovs}`);

const embutido = JSON.parse(codigo('Ficha do processo').match(/const INSTANTANEO = ([\s\S]*?);\n/)[1]);
const maiorEmbutido = Math.max(...embutido.processos.map((p) => p.movimentacoes.length));
checar('o fluxo publicado embute no máximo 20 movimentações por processo',
  maiorEmbutido <= 20, `maior embutido: ${maiorEmbutido}`);

// ---------------------------------------------------------------------------
console.log('\n\x1b[1mSegredo de justiça — a barreira que nasceu dos autos reais\x1b[0m');
if (!SIGILOSO) {
  console.log('  \x1b[33m—\x1b[0m 4 verificações puladas: não há processo em segredo neste instantâneo');
} else {
  memoriaNova();
  const sig = rodar(P, msg(ADVOGADO.telegram_user_id, `Como está o processo ${SIGILOSO.numero_cnj}?`)).json;
  checar('processo em segredo não chega ao modelo', sig.rota === 'negado', `rota=${sig.rota}`);
  checar('a recusa diz o motivo', /segredo de justi/i.test(String(sig.texto)));
  checar('a recusa não revela as partes',
    !SIGILOSO.envolvidos.some((e) => e.nome && String(sig.texto).includes(e.nome)));
  const pedirRedacao = rodar(P, msg(ADVOGADO.telegram_user_id, 'Redige um retorno para o cliente sobre esse processo')).json;
  checar('nem redigir mensagem sobre ele', pedirRedacao.rota === 'negado', `rota=${pedirRedacao.rota}`);

  // A memória NÃO pode esquecer o sigiloso: esquecer faria o "esse processo"
  // seguinte escorregar para outro caso, calado.
  checar('o processo em segredo continua sendo o "esse processo" corrente',
    MEMORIA.ultimoProcesso[String(ADVOGADO.telegram_user_id)] === SIGILOSO.id);
  checar('a recusa de redação diz como sair do beco',
    /diga o nome da parte ou o n[úu]mero/i.test(String(pedirRedacao.texto)));
  checar('a recusa de redação não promete escolher outro processo',
    /n[ãa]o escolho por voc[êe]/i.test(String(pedirRedacao.texto)));

  // E nomear outro processo tem de funcionar imediatamente depois da recusa.
  const saida = rodar(P, msg(ADVOGADO.telegram_user_id, `Redige um retorno sobre o processo ${NUMERO}`)).json;
  checar('nomear outro processo sai da recusa na hora',
    saida.rota === 'redigir' && saida.processoId === APELIDO, `rota=${saida.rota}`);
  memoriaNova();
}

// ===========================================================================
console.log('\n\x1b[1mAprovação — o coração da demonstração\x1b[0m');
const R = codigo('Registrar decisão');

const aprov = rodar(R, rodar(P, clique(ADVOGADO.telegram_user_id, 'aprovar', PROPOSTA_COMO_O_TELEGRAM_DEVOLVE)).json).json;
checar('advogado aprova', aprov.acao === 'aprovar');
checar('mensagem final ganha o cabeçalho de aprovação', aprov.textoFinal.includes('APROVADO'),
  `recebido: ${JSON.stringify(aprov.textoFinal.slice(0, 100))}`);
// O defeito que o Codex encontrou: o rótulo escrito NO CLIQUE afirmava um
// envio que ainda não tinha acontecido.
checar('o rótulo do clique não afirma entrega que ainda não houve',
  !/ENTREGUE|E ENVIADO/.test(aprov.textoFinal), aprov.textoFinal.slice(0, 120));
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
  checar('quem não pode aprovar não aprova', neg.acao === 'encaminhado', `acao=${neg.acao}`);
  checar('a tentativa fica na trilha', neg.trilha.acaoPedida === 'aprovar' && neg.trilha.acao === 'encaminhado');
  checar('e não vira recusa seca: sobe para o advogado',
    neg.textoFinal.includes('📨 ENVIADO PARA APROVAÇÃO'), neg.textoFinal.slice(0, 120));
}

const desc = rodar(R, rodar(P, clique(ADVOGADO.telegram_user_id, 'descartar', PROPOSTA_COMO_O_TELEGRAM_DEVOLVE)).json).json;
checar('descarte é registrado', desc.textoFinal.includes('❌ DESCARTADO'));

// ---------------------------------------------------------------------------
console.log('\n\x1b[1mEditar — o botão que era um beco\x1b[0m');
memoriaNova();
rodar(P, msg(ADVOGADO.telegram_user_id, `Como está o processo ${NUMERO}?`));
const edi = rodar(R, rodar(P, clique(ADVOGADO.telegram_user_id, 'editar', PROPOSTA_COMO_O_TELEGRAM_DEVOLVE)).json).json;
checar('editar pede o texto corrigido', /Mande agora a mensagem/i.test(edi.textoFinal));
checar('editar deixa claro que nada foi enviado', !edi.textoFinal.includes('APROVADO'));
checar('editar abre estado de edição na memória',
  Boolean(MEMORIA.edicaoPendente && MEMORIA.edicaoPendente[String(ADVOGADO.telegram_user_id)]));
checar('o estado de edição sabe de qual processo se trata',
  MEMORIA.edicaoPendente[String(ADVOGADO.telegram_user_id)].processoId === APELIDO);

const TEXTO_NOVO = 'Olá! Informo que houve nova decisão no seu processo. Estou à disposição.';
const rep = rodar(P, msg(ADVOGADO.telegram_user_id, TEXTO_NOVO)).json;
checar('a mensagem seguinte vira nova proposta', rep.rota === 'reproposta', `rota=${rep.rota}`);
checar('a proposta reescrita traz o texto do humano', rep.textoProposta.includes(TEXTO_NOVO));
checar('a proposta reescrita diz quem reescreveu', rep.textoProposta.includes(ADVOGADO.nome));
checar('a proposta reescrita insiste que nada foi enviado', /Nada foi enviado/i.test(rep.textoProposta));
checar('a nota de IA continua na reescrita', rep.textoProposta.includes(`<i>${NOTA_IA}</i>`));
checar('a proposta reescrita começa pelo aviso de topo', rep.textoProposta.indexOf('⚠️') === 0);
checar('o estado de edição se fecha depois de usado',
  !MEMORIA.edicaoPendente[String(ADVOGADO.telegram_user_id)]);

// Editar é reversível — e não pode virar armadilha que engole a conversa.
rodar(R, rodar(P, clique(ADVOGADO.telegram_user_id, 'editar', PROPOSTA_COMO_O_TELEGRAM_DEVOLVE)).json);
const canc = rodar(P, msg(ADVOGADO.telegram_user_id, 'cancelar')).json;
checar('"cancelar" sai da edição', canc.rota === 'negado' && /Edição cancelada/i.test(canc.texto));
checar('cancelar não deixa estado pendente para trás',
  !MEMORIA.edicaoPendente[String(ADVOGADO.telegram_user_id)]);

const reproporta = wf.nodes.find((n) => n.name === 'Repropor texto editado');
checar('o texto reescrito volta COM os três botões',
  reproporta.parameters.replyMarkup === 'inlineKeyboard'
  && reproporta.parameters.inlineKeyboard.rows[0].row.buttons.length === 3);
memoriaNova();

// ===========================================================================
// O fio que liga a Demo A à Demo B. Aqui mora o único ponto do sistema em que
// um clique produz uma mensagem para fora do escritório — e por isso é o ponto
// que mais precisa de teste automático.
console.log('\n\x1b[1mAprovar → enviar ao cliente\x1b[0m');

const clientes = JSON.parse(fs.readFileSync(
  fs.existsSync(path.join(AQUI, 'listas', 'clientes.json'))
    ? path.join(AQUI, 'listas', 'clientes.json')
    : path.join(AQUI, 'listas', 'clientes.exemplo.json'), 'utf8'));

const COM_CLIENTE = (clientes.clientes || []).find(c => (c.processos || []).length);
const ID_COM_CLIENTE = COM_CLIENTE ? COM_CLIENTE.processos[0] : null;
const PROC_COM_CLIENTE = ID_COM_CLIENTE
  ? instantaneo.processos.find(p => p.id === ID_COM_CLIENTE) : null;
const PROC_SEM_CLIENTE = instantaneo.processos.find(
  p => !p.segredo_justica && p.id !== ID_COM_CLIENTE);

/** Clica num botão como o Telegram o devolve: 'acao|processo|autor'. */
function decidir(userId, acao, processo, autor = userId) {
  memoriaNova();
  const dados = `${acao}|${processo.id}|${autor}`;
  return rodar(R, rodar(P, clique(userId, dados, PROPOSTA_COMO_O_TELEGRAM_DEVOLVE)).json).json;
}

if (!PROC_COM_CLIENTE) {
  console.log('  \x1b[33m—\x1b[0m verificações puladas: nenhum cliente vinculado em demo/listas/clientes.json');
} else {
  const env = decidir(ADVOGADO.telegram_user_id, 'aprovar', PROC_COM_CLIENTE);
  checar('aprovar processo com cliente vinculado manda enviar',
    env.desfecho === 'enviar' && env.enviarAoCliente === true, `desfecho=${env.desfecho}`);
  checar('o número do destinatário vem da lista, não da conversa',
    env.clienteNumero === String(COM_CLIENTE.whatsapp).replace(/\D/g, ''), `numero=${env.clienteNumero}`);
  checar('a mensagem ao cliente leva o corpo aprovado',
    env.textoAoCliente.includes('encontra-se arquivado'));
  checar('a mensagem ao cliente NÃO leva o cabeçalho de proposta',
    !/Proposta de mensagem ao cliente|Nada foi enviado/i.test(env.textoAoCliente));
  checar('a mensagem ao cliente NÃO leva a assinatura de quem aprovou',
    !env.textoAoCliente.includes(ADVOGADO.nome));
  checar('a mensagem ao cliente não tem HTML — o WhatsApp não lê',
    !/<\/?[a-z]+>/i.test(env.textoAoCliente), JSON.stringify(env.textoAoCliente.slice(0, 120)));
  checar('a nota de IA vai em itálico do WhatsApp',
    env.textoAoCliente.includes(`_${NOTA_IA}_`),
    `final: ${JSON.stringify(env.textoAoCliente.slice(-140))}`);
  checar('a mensagem ao cliente abre com o aviso de demonstração',
    env.textoAoCliente.indexOf('⚠️') === 0);
  checar('o rótulo do clique diz que está enviando, não que enviou',
    /Enviando ao cliente/i.test(env.textoFinal) && !/ENTREGUE/.test(env.textoFinal),
    env.textoFinal.slice(0, 160));
  checar('só o texto pós-envio afirma a entrega',
    env.textoFinalEnviado.includes('APROVADO E ENTREGUE'), env.textoFinalEnviado.slice(0, 120));
  checar('o texto pós-envio mascara o número',
    /•••• \d{4}/.test(env.textoFinalEnviado) && !env.textoFinalEnviado.includes(env.clienteNumero));
  checar('existe um texto para o caso de o envio falhar',
    /NÃO ENTREGUE/.test(env.textoFinalFalhou) && /Ninguém foi avisado/i.test(env.textoFinalFalhou),
    String(env.textoFinalFalhou).slice(0, 160));

  // Os três desfechos que NÃO podem enviar nada.
  for (const acao of ['editar', 'descartar']) {
    const d = decidir(ADVOGADO.telegram_user_id, acao, PROC_COM_CLIENTE);
    checar(`"${acao}" não envia nada ao cliente`,
      d.desfecho === 'nada' && d.enviarAoCliente === false && d.textoAoCliente === null,
      `desfecho=${d.desfecho}`);
  }
  if (SEM_PODER.telegram_user_id) {
    const n = decidir(SEM_PODER.telegram_user_id, 'aprovar', PROC_COM_CLIENTE);
    checar('quem não pode aprovar não consegue fazer sair mensagem',
      n.enviarAoCliente === false && n.textoAoCliente === null && n.clienteNumero === null,
      `desfecho=${n.desfecho}`);
  }
}

if (PROC_SEM_CLIENTE) {
  const s = decidir(ADVOGADO.telegram_user_id, 'aprovar', PROC_SEM_CLIENTE);
  checar('processo sem cliente vinculado não inventa destinatário',
    s.desfecho === 'sem-destino' && s.clienteNumero === null, `desfecho=${s.desfecho}`);
  checar('e o colaborador é avisado de que NÃO saiu',
    /SEM DESTINATÁRIO/.test(String(s.textoFinal)) && /Nada saiu/i.test(String(s.textoFinal)),
    String(s.textoFinal).slice(0, 160));
  checar('sem destinatário não existe texto de entrega',
    s.textoFinalEnviado === null && s.textoFinalFalhou === null);
}
memoriaNova();

// ===========================================================================
// O beco que a recusa criava: o estagiário era barrado e o trabalho morria ali.
console.log('\n\x1b[1mEncaminhar ao advogado — a recusa que não é beco\x1b[0m');

if (!SEM_PODER.telegram_user_id || !PROC_COM_CLIENTE) {
  console.log('  \x1b[33m—\x1b[0m verificações puladas: faltam estagiário ou cliente vinculado');
} else {
  const enc = decidir(SEM_PODER.telegram_user_id, 'aprovar', PROC_COM_CLIENTE);
  checar('o clique do estagiário vira encaminhamento, não recusa',
    enc.desfecho === 'encaminhar' && enc.acao === 'encaminhado', `desfecho=${enc.desfecho}`);
  checar('nada sai para o cliente nesse momento',
    enc.enviarAoCliente === false && enc.textoAoCliente === null);
  checar('o encaminhamento vai para o advogado da lista',
    String(enc.advogadoChatId) === String(ADVOGADO.telegram_user_id), `para=${enc.advogadoChatId}`);
  checar('a proposta encaminhada leva o corpo redigido',
    enc.textoEncaminhado.includes('encontra-se arquivado'));
  checar('a proposta encaminhada diz quem redigiu',
    enc.textoEncaminhado.includes(SEM_PODER.nome));
  checar('a proposta encaminhada insiste que nada foi enviado',
    /Nada foi enviado ao cliente/i.test(enc.textoEncaminhado));
  checar('o estagiário é avisado de para quem foi',
    enc.textoFinal.includes(ADVOGADO.nome) && /não se perdeu/i.test(enc.textoFinal));
  checar('a trilha registra o encaminhamento',
    enc.trilha.encaminhadoPara === ADVOGADO.nome && enc.trilha.acaoPedida === 'aprovar');

  // E agora o advogado decide sobre a proposta encaminhada. O botão carrega o
  // processo e o autor — é assim que a decisão chega ao cliente certo e o
  // desfecho volta para quem redigiu.
  const ap = decidir(ADVOGADO.telegram_user_id, 'aprovar', PROC_COM_CLIENTE, SEM_PODER.telegram_user_id);
  checar('o advogado aprova o que foi encaminhado, e aí sim sai',
    ap.desfecho === 'enviar' && ap.enviarAoCliente === true, `desfecho=${ap.desfecho}`);
  checar('quem aprovou é o advogado, não quem redigiu',
    ap.trilha.por === ADVOGADO.nome && ap.trilha.acao === 'aprovar');
  checar('quem redigiu recebe o desfecho',
    String(ap.autorChatId) === String(SEM_PODER.telegram_user_id)
    && /aprovada e enviada/i.test(String(ap.avisoAoAutor)), String(ap.avisoAoAutor));

  const de = decidir(ADVOGADO.telegram_user_id, 'descartar', PROC_COM_CLIENTE, SEM_PODER.telegram_user_id);
  checar('descarte também volta para quem redigiu',
    /descartada/i.test(String(de.avisoAoAutor)), String(de.avisoAoAutor));
  checar('descarte não envia nada', de.enviarAoCliente === false);

  // Aprovar a própria redação não gera aviso a si mesmo.
  const so = decidir(ADVOGADO.telegram_user_id, 'aprovar', PROC_COM_CLIENTE);
  checar('quem aprova a própria redação não recebe aviso redundante',
    so.autorChatId === null && so.avisoAoAutor === null);

  // O estagiário não pode aprovar nem o que já subiu — o botão dele encaminha
  // de novo, nunca envia. Poder emprestado não existe.
  const outra = decidir(SEM_PODER.telegram_user_id, 'aprovar', PROC_COM_CLIENTE, ADVOGADO.telegram_user_id);
  checar('o estagiário nunca consegue enviar, nem com botão de proposta alheia',
    outra.enviarAoCliente === false && outra.desfecho === 'encaminhar', `desfecho=${outra.desfecho}`);
}
memoriaNova();

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
const envio = wf.nodes.find(n => n.name === 'Enviar ao cliente (WhatsApp)');
checar('o nó de envio existe', Boolean(envio));
checar('o token da Uazapi não está no JSON versionado',
  !JSON.stringify(wf).match(/[Tt]oken"\s*:\s*"[A-Za-z0-9]{20,}/),
  'um segredo dentro do workflow vazaria no Git');
checar('o envio usa credencial, não cabeçalho escrito à mão',
  envio.parameters.authentication === 'genericCredentialType'
  && envio.parameters.genericAuthType === 'httpHeaderAuth');
checar('o destinatário vem do nó de decisão, não de expressão livre',
  envio.parameters.jsonBody.includes("$('Registrar decisão').item.json.clienteNumero"));
const desfechoNo = wf.nodes.find(n => n.name === 'Desfecho da aprovação');
checar('sem regra que case, o fluxo para em vez de seguir',
  desfechoNo.parameters.options.fallbackOutput === 'none');

// O botão precisa carregar o processo: se dependesse da memória, consultar
// outro processo entre receber a proposta e clicar em aprovar mandaria a
// mensagem para o cliente errado.
for (const nome of ['Propor envio (aguarda aprovação)', 'Repropor texto editado', 'Encaminhar ao advogado']) {
  const n = wf.nodes.find(x => x.name === nome);
  const dados = n.parameters.inlineKeyboard.rows[0].row.buttons.map(b => b.additionalFields.callback_data);
  checar(`botões de "${nome}" carregam processo e autor`,
    dados.length === 3 && dados.every(d => d.startsWith('=') && d.split('|').length === 3),
    JSON.stringify(dados[0]));
}
const encNo = wf.nodes.find(n => n.name === 'Encaminhar ao advogado');
checar('o encaminhamento vai para o advogado, não para quem clicou',
  encNo.parameters.chatId.includes('advogadoChatId'));
const filtro = wf.nodes.find(n => n.name === 'Tem quem avisar?');
checar('o aviso a quem redigiu só sai se houver o que dizer',
  filtro.parameters.conditions.conditions[0].operator.operation === 'notEmpty');

// --- chamada externa: repetição controlada e saída de erro ----------------
// Achado de revisão externa: nenhuma chamada externa tinha retentativa nem
// caminho de falha, e a interface afirmava o envio antes de ele acontecer.
checar('o envio tenta de novo antes de desistir',
  envio.retryOnFail === true && envio.maxTries >= 2, JSON.stringify({r: envio.retryOnFail, m: envio.maxTries}));
checar('o envio tem saída de erro, em vez de engolir a falha',
  envio.onError === 'continueErrorOutput', String(envio.onError));
const saidas = wf.connections['Enviar ao cliente (WhatsApp)'].main;
checar('a saída de erro leva a um nó que conta a verdade',
  saidas.length === 2 && saidas[1][0].node === 'Marcar falha no envio',
  JSON.stringify(saidas.map(x => x.map(y => y.node))));
checar('quem redigiu só é avisado pelo caminho de sucesso',
  saidas[0][0].node === 'Marcar como entregue'
  && !JSON.stringify(wf.connections['Marcar falha no envio'] || {}).includes('Tem quem avisar'));
checar('a mensagem entregue é a MESMA, reescrita — não uma nova',
  wf.nodes.find(n => n.name === 'Marcar como entregue').parameters.operation === 'editMessageText');

checar('nenhum nó nasce ativo', wf.active !== true);

// ===========================================================================
console.log(falhas === 0
  ? '\n\x1b[32mtudo passou\x1b[0m — pode publicar\n'
  : `\n\x1b[31m${falhas} falha(s)\x1b[0m — NÃO publique\n`);
process.exit(falhas === 0 ? 0 : 1);
