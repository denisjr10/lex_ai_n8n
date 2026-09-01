#!/usr/bin/env node
/**
 * montar-fluxo-b.mjs — gera o workflow da Demo B (cliente no WhatsApp)
 * ---------------------------------------------------------------------------
 * A CENA QUE ESTE FLUXO EXISTE PARA MOSTRAR
 *
 * A mesma pergunta — "como está meu processo?" — feita por duas pessoas devolve
 * coisas diferentes, e não porque a IA foi instruída a ser discreta: porque o
 * escopo de cada cliente é lido de uma lista, em código, antes de o modelo ser
 * chamado. Um número fora da lista não recebe negativa sobre "aquele processo";
 * recebe uma recusa que não confirma nem desmente que ele exista.
 *
 * É a Regra 1 do projeto na sua forma mais visível: o agente nunca é a
 * fronteira de segurança.
 *
 * DIFERENÇAS DELIBERADAS EM RELAÇÃO À DEMO A
 *
 *   - o cliente NÃO tem ações. Só leitura. Nenhum botão, nenhuma aprovação
 *   - o escopo vem da lista, nunca da pergunta (Regra 4: conteúdo externo é
 *     hostil — a mensagem do cliente não escolhe o que ele pode ver)
 *   - prazo é recusado por regra, não por falta de dado
 *
 * Uso:
 *   node demo/montar-fluxo-b.mjs              # escreve o JSON
 *   node demo/montar-fluxo-b.mjs --publicar   # escreve e envia para o n8n
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const publicar = process.argv.includes('--publicar');
// Ativar e o que liga o fluxo de verdade: o gatilho passa a receber eventos do
// mundo. Fica separado de publicar, e explicito, porque publicar e reversivel e
// ativar nao e — a partir dai o fluxo responde a quem mandar mensagem.
const ativar = process.argv.includes('--ativar');

const NOME = '[LEX-DEMO] B · Cliente (WhatsApp)';

// ===========================================================================
// AUTENTICAÇÃO DO WEBHOOK
// ===========================================================================
// O gatilho deste fluxo é a única porta aberta da demonstração para a internet,
// e o corpo que chega por ela traz o número de quem escreveu. Sem porta
// trancada, quem descobrisse a URL mandaria um corpo com o número de um cliente
// cadastrado e receberia de volta a ficha do processo dele — o Porteiro faz a
// coisa certa com um dado que já veio mentindo.
//
// O SEGREDO VIAJA NO CAMINHO, E NÃO NUM CABEÇALHO, porque a configuração de
// webhook da Uazapi aceita `url`, `events` e `enabled`, e nada mais: não há
// onde declarar cabeçalho. Segredo em URL é pior que segredo em cabeçalho — ele
// aparece em log de servidor e em histórico de proxy — mas é o que o remetente
// consegue enviar, e é incomparavelmente melhor que porta sem tranca. É o mesmo
// desenho dos "incoming webhooks" do Slack, e pela mesma razão.
//
// Ele NÃO fica no repositório: sai de `demo/webhook-b.local`, que o .gitignore
// cobre pelo padrão `*.local`, e é gravado por `guardar-segredo.mjs`.
//
// O SEGREDO É GERADO SOZINHO NA PRIMEIRA EXECUÇÃO, e isso é deliberado.
//
// A alternativa — exigir que alguém rode `guardar-segredo.mjs` antes — tem duas
// falhas. A primeira é que o caminho sem tranca continuaria existindo como
// padrão, e o padrão é o que acontece quando ninguém está prestando atenção. A
// segunda é que numa cópia limpa do repositório o arquivo não existe, e a demo
// teria de escolher entre quebrar ou publicar sem autenticação.
//
// Gerando aqui, o estado inseguro deixa de ser alcançável por esquecimento.
// Não é segredo digitado por pessoa: é aleatório, nunca impresso, e vive só em
// `demo/webhook-b.local`, que o .gitignore cobre pelo padrão `*.local`.
const SEGREDO_PATH = path.join(AQUI, 'webhook-b.local');
if (!fs.existsSync(SEGREDO_PATH)) {
  fs.writeFileSync(SEGREDO_PATH, crypto.randomBytes(18).toString('base64url'), 'utf8');
  console.log(`segredo     : ${path.basename(SEGREDO_PATH)} criado agora (fora do Git)`);
}
const segredoWebhook = fs.readFileSync(SEGREDO_PATH, 'utf8').trim();

if (segredoWebhook && segredoWebhook.length < 16) {
  console.error(`\n  o segredo em ${path.basename(SEGREDO_PATH)} tem ${segredoWebhook.length} caracteres.`);
  console.error('  Um caminho de webhook adivinhável não é autenticação. Use 24 ou mais.\n');
  process.exit(1);
}

const CAMINHO_WEBHOOK = segredoWebhook
  ? `lex-demo-b-cliente-${segredoWebhook}`
  : 'lex-demo-b-cliente';

if (ativar && !segredoWebhook) {
  console.error(`
  RECUSADO: --ativar sem segredo de webhook.

  Ativar é o que abre a porta para a internet. Sem segredo no caminho, qualquer
  pessoa que descubra a URL manda um corpo com o número de um cliente cadastrado
  e recebe a ficha do processo dele.

  Para criar o segredo (rode você, no seu terminal — não peça ao assistente):

    node -e "console.log(require('crypto').randomBytes(18).toString('base64url'))"
    node guardar-segredo.mjs demo/webhook-b.local

  Depois:  node demo/montar-fluxo-b.mjs --publicar --ativar
           node demo/uazapi.mjs webhook      (reaponta a Uazapi para o caminho novo)
`);
  process.exit(1);
}
const MOVS_NA_FICHA = 12;   // o cliente quer o essencial, não o extrato

// --- dados -----------------------------------------------------------------
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

const listaPath = fs.existsSync(path.join(AQUI, 'listas', 'clientes.json'))
  ? path.join(AQUI, 'listas', 'clientes.json')
  : path.join(AQUI, 'listas', 'clientes.exemplo.json');
const lista = JSON.parse(fs.readFileSync(listaPath, 'utf8'));

// Trava: cliente apontando para processo que não existe no instantâneo é erro
// de configuração, e o sintoma seria o assistente dizendo "não encontrei" a um
// cliente legítimo. Melhor falhar aqui, na geração.
const idsConhecidos = new Set(instantaneo.processos.map((p) => p.id));
for (const c of lista.clientes) {
  for (const id of c.processos || []) {
    if (!idsConhecidos.has(id)) {
      console.error(`\n  ${path.basename(listaPath)}: o cliente ${c.nome} aponta para "${id}", que não existe no instantâneo.`);
      console.error(`  Processos disponíveis: ${[...idsConhecidos].join(', ')}\n`);
      process.exit(1);
    }
  }
}

// --- quem atende quando o robô não atende ----------------------------------
// A Demo B recusa três coisas por regra: prazo, prognóstico e o pedido direto
// de falar com gente. Até aqui a recusa era um beco — o cliente ficava sabendo
// que ninguém ia responder ali, e mais nada. Agora ela CHAMA UMA PESSOA.
//
// O destinatário é advogado, e não qualquer colaborador, porque as três
// perguntas que disparam o chamado são justamente as que só advogado responde
// (Regra 2). Estagiário recebendo "vou ganhar a causa?" não resolve nada — só
// move o beco de lugar.
const colabPath = fs.existsSync(path.join(AQUI, 'listas', 'colaboradores.json'))
  ? path.join(AQUI, 'listas', 'colaboradores.json')
  : path.join(AQUI, 'listas', 'colaboradores.exemplo.json');
const listaColab = JSON.parse(fs.readFileSync(colabPath, 'utf8'));
const ADVOGADOS = (listaColab.colaboradores || [])
  .filter((c) => c.papel === 'advogado' && c.telegram_user_id)
  .map((c) => ({ id: c.telegram_user_id, nome: c.nome }));

// Falha fecha (Regra 5). Sem advogado na lista não há a quem chamar — e um
// fluxo que diz ao cliente "já avisei o escritório" sem ter avisado ninguém é
// exatamente a promessa vazia que a D-102 proibiu. Melhor não publicar.
if (!ADVOGADOS.length) {
  console.error(`\n  ${path.basename(colabPath)}: nenhum colaborador com papel "advogado" e telegram_user_id.`);
  console.error(`  O chamado ao escritório não teria destinatário, e o cliente ouviria uma promessa vazia.`);
  console.error(`  Cadastre ao menos um advogado antes de publicar.\n`);
  process.exit(1);
}

// No WhatsApp o itálico é _assim_. A nota é rodapé, e o itálico a separa da
// mensagem em si — mesmo tratamento que ela recebe no Telegram (D-92).
//
// ⚠️ ESTA FRASE É FALSA NESTE FLUXO, E ISSO É DELIBERADO (D-155).
//
// Na Demo A ela é fato: o texto para no Telegram e só sai depois que alguém com
// papel de advogado clica. Aqui não para em ninguém — o modelo escreve e a
// Uazapi envia. A frase fica assim mesmo porque a demonstração existe para
// mostrar ao escritório COMO SERÁ o atendimento em produção, e em produção o
// texto passa por aprovação. A maquete tem de mostrar o rodapé da casa pronta.
//
// O que torna isso aceitável não é a intenção — é o contexto, e ele é
// verificável: a única destinatária cadastrada é a pessoa que conduz a demo, e
// toda resposta sai com o AVISO_TOPO de DEMONSTRAÇÃO logo acima desta nota.
// Ninguém é levado a acreditar em revisão que não houve.
//
// O RISCO REAL NÃO É A DEMO, É O ESQUECIMENTO. O dia em que o aviso de
// demonstração sair e esta frase ficar, o escritório passa a afirmar a cliente
// de verdade que um advogado leu um texto que nenhum advogado leu — declaração
// falsa em canal regido pelo Provimento 205/2021 da OAB. Por isso as duas
// coisas estão AMARRADAS por teste em `testar-fluxo-b.mjs`: enquanto esta nota
// afirmar revisão, o fluxo é obrigado a carregar o aviso de demonstração. Some
// um, o outro tem de sair junto — ou o teste reprova.
//
// A frase só se torna verdadeira quando existir nó de aprovação nesta rota.
// Pela D-142, texto livre é A3b, e A3b exige aprovação mensagem a mensagem.
const NOTA_IA = '_Esta mensagem foi preparada com apoio de inteligência artificial e revisada por um advogado do escritório._';
const AVISO_TOPO = instantaneo.origem === 'ensaio-ficticio'
  ? '⚠️ DEMONSTRAÇÃO — dados fictícios'
  : '⚠️ DEMONSTRAÇÃO — atendimento automatizado do escritório';

console.log(`instantâneo : ${instantaneo.origem} · ${instantaneo.processos.length} processo(s)`);
console.log(`lista       : ${path.basename(listaPath)} · ${lista.clientes.length} cliente(s)`);
for (const c of lista.clientes) {
  console.log(`              ${c.nome} → ${(c.processos || []).join(', ')}`);
}

// ===========================================================================
// O PORTEIRO DO CLIENTE
// ===========================================================================
// Repare no que ele NÃO faz: ele não pergunta ao modelo de quem é o número,
// nem deixa a mensagem escolher o processo. O escopo sai da lista. A pergunta
// do cliente só decide o que responder DENTRO do que ele já podia ver.
const CODIGO_PORTEIRO = `
const CLIENTES = ${JSON.stringify(lista.clientes, null, 2)};
// O chamado ao colaborador também leva o aviso de demonstração. Quem recebe no
// Telegram precisa saber, sem pensar, se aquilo é ensaio ou cliente de verdade.
const AVISO_TOPO = ${JSON.stringify(AVISO_TOPO)};
const PROCESSOS = ${JSON.stringify(instantaneo.processos.map(p => ({
  id: p.id, numero: p.numero_cnj, titulo: p.titulo, classe: p.classe,
  segredo: p.segredo_justica === true,
})))};

const soDigitos = (t) => String(t || '').replace(/\\D/g, '');

/** Celular brasileiro tem DUAS formas, e o WhatsApp guarda a do cadastro
 *  original: 55 + DDD + 9 digitos (com o nono) ou 55 + DDD + 8 (sem).
 *  Quem cadastra o cliente digita a que conhece; o telefone reporta a que tem.
 *  Comparar sem normalizar recusa cliente legitimo — e a recusa parece um
 *  problema de seguranca funcionando, o que e o pior tipo de defeito.
 *  Aconteceu na primeira conexao: numero cadastrado com o nono, WhatsApp
 *  registrado sem ele. */
function formasDoNumero(bruto) {
  const n = soDigitos(bruto);
  const formas = [n];
  const m = n.match(/^55(\\d{2})(\\d{8,9})\$/);
  if (m) {
    const [, ddd, resto] = m;
    if (resto.length === 9 && resto[0] === '9') formas.push('55' + ddd + resto.slice(1));
    if (resto.length === 8) formas.push('55' + ddd + '9' + resto);
  }
  return formas;
}
const mesmoNumero = (a, b) => {
  const fa = formasDoNumero(a), fb = formasDoNumero(b);
  return fa.some(x => fb.indexOf(x) !== -1);
};

// O corpo do webhook da Uazapi e { event, instance, data }, e o formato de
// "data" varia por evento. Aceitar as formas plausíveis custa três linhas e
// evita que uma mudança de versão derrube a demonstração na frente do cliente.
const corpo = $json.body || $json;
const d = corpo.data || corpo.message || corpo;
const m = d.message || d;

const texto = String(m.text || m.body || m.conversation || '').trim();
const fromMe = m.fromMe === true || m.key && m.key.fromMe === true;
const isGroup = m.isGroup === true || String(m.chatid || '').indexOf('@g.us') !== -1;

// Eco da própria instância, grupo e mensagem sem texto não são atendimento.
if (fromMe || isGroup || !texto) {
  return { json: { rota: 'ignorar', motivo: fromMe ? 'mensagem propria' : isGroup ? 'grupo' : 'sem texto' } };
}

const numero = soDigitos(m.sender_pn || m.sender || m.chatid || m.from);
if (!numero) {
  return { json: { rota: 'ignorar', motivo: 'evento sem remetente' } };
}

// --- barreira 1: quem -------------------------------------------------------
// A recusa é deliberadamente sem informação. Dizer "este processo não é seu"
// já confirma que o processo existe, e para quem pesca isso basta.
const cliente = CLIENTES.find(c => mesmoNumero(c.whatsapp, numero));
if (!cliente) {
  return { json: { rota: 'direto', numero, texto: [
    'Olá! Este é o atendimento automatizado do escritório.',
    '',
    'Não localizei um cadastro para este número. Se você é cliente, fale com o escritório pelo canal de sempre para atualizarmos seu contato.',
    '',
    'Não presto informações sobre processos a números não cadastrados.'
  ].join('\\n') }};
}

// --- barreira 2: escopo -----------------------------------------------------
// O QUE ELE PODE VER SAI DAQUI. A mensagem dele não entra nesta decisão.
const meus = PROCESSOS.filter(p => (cliente.processos || []).indexOf(p.id) !== -1);
if (!meus.length) {
  return { json: { rota: 'direto', numero, texto:
    'Olá, ' + cliente.nome.split(' ')[0] + '! No momento não há processo vinculado ao seu cadastro. Fale com o escritório para conferirmos.' }};
}

const base = { rota: 'consulta', numero, nome: cliente.nome };

// --- saudação ---------------------------------------------------------------
const ehSaudacao = /^(oi+|ol[áa]|opa|e a[íi]|bom dia|boa tarde|boa noite|tudo bem|tudo bom|ajuda|menu|come[çc]ar)[\\s!.,?]*$/i.test(texto);
if (ehSaudacao) {
  return { json: { ...base, rota: 'direto', texto: [
    'Olá, ' + cliente.nome.split(' ')[0] + '! Aqui é o atendimento automatizado do escritório.',
    '',
    'Posso informar como está o andamento do seu processo.',
    meus.length > 1 ? '' : '',
    'É só perguntar, por exemplo: "como está meu processo?"',
    '',
    'Para falar com uma pessoa do escritório, é só dizer.'
  ].filter(Boolean).join('\\n') }};
}

// --- o chamado ao escritório ------------------------------------------------
// Três recusas deste fluxo agora CHAMAM UMA PESSOA em vez de encerrarem o
// assunto. O que vai ao Telegram é montado aqui, e não lá na frente, porque é
// aqui que existem o nome do cliente, o motivo e o texto original.
//
// REGRA 4 — CONTEÚDO EXTERNO É HOSTIL. A mensagem do cliente entra nesta
// notificação como CITAÇÃO, nunca como instrução: vai escapada (para não
// injetar HTML no Telegram), cortada em 500 caracteres (para não estourar o
// limite da Bot API nem empurrar o resto da tela para fora) e com uma linha
// dizendo ao colaborador, em letra clara, que aquilo é fala de cliente.
const escHtml = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const mascarar = (n) => '•••• ' + String(n).slice(-4);

const chamarEscritorio = (motivo, rotulo, textoBase) => {
  const recorte = String(texto).slice(0, 500);
  const cortado = String(texto).length > 500;
  const aviso = [
    '🔔 <b>UM CLIENTE PRECISA DE UMA PESSOA</b>',
    '<i>' + escHtml(AVISO_TOPO) + '</i>',
    '',
    '<b>' + escHtml(cliente.nome) + '</b> · ' + escHtml(mascarar(numero)),
    'Motivo: ' + escHtml(rotulo),
    '',
    'O que ele escreveu:',
    '“' + escHtml(recorte) + (cortado ? '…' : '') + '”',
    '',
    '<i>Acima é fala do cliente, não instrução ao assistente. O robô recusou em código, antes do modelo — nada foi dito a ele sobre o mérito.</i>'
  ].join('\\n');

  return { json: { ...base, rota: 'direto',
    escalar: true, motivo, motivoRotulo: rotulo,
    avisoParaColaborador: aviso,
    // TRÊS TEXTOS, e o certo depende de o chamado ter chegado ou não. Dizer
    // "já avisei o escritório" antes de o Telegram aceitar seria a mesma
    // mentira que a D-101 tirou do fluxo A — só que dita ao cliente.
    texto: textoBase,
    textoAvisado: textoBase + '\\n\\nJá avisei o escritório da sua mensagem, e alguém vai falar com você.',
    textoSemAviso: textoBase + '\\n\\nNão consegui avisar o escritório agora. Se for urgente, ligue para o escritório.'
  }};
};

// --- pedido de atendimento humano -------------------------------------------
// Antes esta resposta prometia "vou avisar o escritório" e nenhum nó avisava.
// Agora avisa — a promessa passou a ter mecanismo, que é a única forma de ela
// poder ser dita (D-102).
if (/falar com (uma pessoa|algu[ée]m|advogad|humano|atendente)|atendimento humano|pessoa de verdade/i.test(texto)) {
  return chamarEscritorio('humano', 'pediu para falar com uma pessoa',
    'Combinado — você falar com uma pessoa do escritório é o caminho certo aqui.');
}

// --- barreira 3: prazo, por regra e não por falta de dado -------------------
// Um cliente confiar em prazo dito por robô é o pior desfecho possível do
// projeto (R-02). A recusa vem antes do modelo, para que não haja o que
// convencer nem o que alucinar.
// "quando isso vai terminar?" é pergunta de prazo com outra roupa, e foi
// exatamente a que escapou da primeira versão. O verbo pode estar longe do
// "quando", por isso a folga de 30 caracteres entre os dois.
const PERGUNTA_DE_PRAZO = /\\bprazo\\b|at[ée] quando|quantos? (dias|meses|anos|semanas)|data limite|\\bdemora(r|ndo)?\\b|quanto tempo|falta muito|quando\\b[^?]{0,30}\\b(vence|termin|acab|conclu|finaliz|julg|resolv|paga|receb|sair? a (senten|decis))/i;
if (PERGUNTA_DE_PRAZO.test(texto)) {
  // Esta linha já disse "vou avisar a equipe do seu contato" sem que nó nenhum
  // avisasse; a correção da revisão do Codex tirou a promessa. Agora ela volta
  // — na ordem certa: primeiro o mecanismo, depois a frase.
  return chamarEscritorio('prazo', 'perguntou sobre prazo',
    'Sobre prazo eu não informo — essa é uma orientação que só um advogado do escritório pode dar, olhando o processo.');
}

// --- barreira 3.1: prognóstico ----------------------------------------------
// "Eu vou ganhar?" é a pergunta que mais interessa ao cliente e a que menos
// pode ser respondida por robô. Errar para mais cria expectativa que vira
// reclamação no CEJUSC e na OAB; errar para menos faz o cliente desistir de
// direito que ele tinha. E não existe resposta "prudente" automática: até um
// "as chances parecem boas" é opinião jurídica dada por quem não pode dar.
//
// Vale a mesma lógica do prazo (R-02): a recusa vem ANTES do modelo, para que
// não haja o que convencer nem o que alucinar. O modelo bom recusaria; o
// problema é que só se descobre qual modelo se tem depois que ele respondeu.
const PERGUNTA_DE_PROGNOSTICO = /\\bchances?\\b|\\bprobabilidade\\b|(\\bvou\\b|\\bvamos\\b|\\bd[áa] pra\\b|\\btem como\\b|\\b[ée] poss[íi]vel\\b|\\bconsigo\\b)[^?]{0,40}\\b(ganhar|vencer|perder)\\b|\\b(ganhar|perder|vencer) (a|essa|esta|minha|nossa) (causa|a[çc][ãa]o|demanda)\\b|\\bvale a pena (recorrer|entrar|processar|continuar|insistir)\\b|\\bo juiz vai\\b|\\bsenten[çc]a vai ser\\b|\\bcausa ganha\\b|\\bt[ée]nho raz[ãa]o\\b/i;
if (PERGUNTA_DE_PROGNOSTICO.test(texto)) {
  return chamarEscritorio('prognostico', 'perguntou sobre chance de êxito',
    'Sobre a chance de ganhar eu não opino — avaliar isso é trabalho de advogado, olhando o caso inteiro. Não seria honesto eu arriscar um palpite.');
}

// --- barreira 3.5: processo que nao e dele, citado por numero ---------------
// O Porteiro ja garantia que o ESCOPO nao muda. Faltava a resposta: o modelo,
// recebendo a ficha do processo do cliente e uma pergunta sobre outro numero,
// improvisou "nao tenho informacoes sobre o processo X, vou verificar com o
// escritorio e retorno". Nao vazou nada — mas prometeu ao cliente um retorno
// sobre processo alheio, que o escritorio nunca poderia dar.
// A recusa passa a ser em codigo, e nao confirma nem desmente que o processo
// exista: diz apenas que este canal so trata do processo dele.
const cnjCitado = (texto.match(/\\d{7}-?\\d{2}\\.?\\d{4}\\.?\\d\\.?\\d{2}\\.?\\d{4}/g) || [])[0];
// Vale tambem para numero digitado sem pontuacao: 20 digitos seguidos sao um
// CNJ, com ou sem os pontos que ninguem digita no celular.
const digitosDoTexto = soDigitos(texto);
const cnjSemPontos = digitosDoTexto.length >= 20 ? digitosDoTexto : null;

if (cnjCitado || cnjSemPontos) {
  const ehDele = meus.some(p => {
    const n = soDigitos(p.numero);
    return (cnjCitado && soDigitos(cnjCitado) === n) || (cnjSemPontos && cnjSemPontos.indexOf(n) !== -1);
  });
  if (!ehDele) {
    return { json: { ...base, rota: 'direto', texto: [
      'Por aqui eu trato apenas do processo vinculado ao seu cadastro.',
      '',
      'Sobre qualquer outro processo, fale diretamente com o escritório.'
    ].join('\\n') }};
  }
}

// --- escolha do processo, DENTRO do que já é dele ---------------------------
let alvo = meus[0];
if (meus.length > 1) {
  const digitos = soDigitos(texto);
  const porNumero = meus.find(p => digitos.length >= 15 && digitos.indexOf(soDigitos(p.numero)) !== -1);
  if (porNumero) alvo = porNumero;
  else {
    return { json: { ...base, rota: 'direto', texto: [
      'Você tem ' + meus.length + ' processos conosco. Sobre qual deles é a sua pergunta?',
      '',
      meus.map(p => '· ' + (p.classe || p.titulo).toLowerCase()).join('\\n')
    ].join('\\n') }};
  }
}

// --- barreira 4: segredo de justiça -----------------------------------------
// Vale mesmo para a própria parte: o canal do WhatsApp não identifica ninguém
// com o rigor que o segredo exige. Número de telefone não é identidade.
if (alvo.segredo) {
  return { json: { ...base, rota: 'direto', texto: [
    'Seu processo corre em segredo de justiça, e por isso não trago informações dele por aqui.',
    '',
    'Fale diretamente com o escritório — é a forma segura de tratar deste caso.'
  ].join('\\n') }};
}

return { json: { ...base, processoId: alvo.id, processoNumero: alvo.numero, pergunta: texto } };
`.trim();

// ===========================================================================
// A ficha do cliente — menor que a do colaborador, de propósito
// ===========================================================================
const CODIGO_FICHA = `
const INSTANTANEO = ${JSON.stringify(instantaneo)};

const p = INSTANTANEO.processos.find(x => x.id === $json.processoId);
if (!p) return { json: { ...$json, erro: 'processo fora do instantâneo' } };

// O cliente não precisa da lista de advogados do outro polo, nem do apelido
// interno, nem do órgão julgador em sigla. Menos campo, menos chance de o
// modelo dizer algo que o escritório não diria.
const movs = p.movimentacoes
  .map(m => '- ' + m.data + ': ' + m.conteudo)
  .join('\\n');

const ficha = [
  'PROCESSO ' + p.numero_cnj,
  'Tipo de ação: ' + (p.classe || '-'),
  'Assunto: ' + (p.assunto || '-'),
  'Vara: ' + (p.orgao_julgador || '-'),
  'Situação: ' + (p.situacao || 'em andamento'),
  'Início: ' + (p.data_inicio || '-'),
  'Movimentação mais recente: ' + (p.data_ultima_movimentacao || '-'),
  '',
  'ANDAMENTOS RECENTES (' + p.movimentacoes.length + ' de ' + (p.quantidade_movimentacoes ?? p.movimentacoes.length) + ')',
  movs
].filter(l => !/: -$/.test(l)).join('\\n');

return { json: { ...$json, ficha } };
`.trim();

const SISTEMA_CLIENTE = `Você é o atendimento automatizado de um escritório de advocacia, falando DIRETAMENTE COM O CLIENTE por WhatsApp.

REGRAS ABSOLUTAS:
- Baseie-se EXCLUSIVAMENTE na ficha fornecida. Se a informação não está lá, diga que ela não aparece no que você tem e que o escritório pode responder. NUNCA prometa que alguém vai verificar, apurar, checar ou retornar: você não abre chamado nem cria tarefa, e uma promessa dessas deixa o cliente esperando por algo que ninguém vai fazer.
- NUNCA fale de prazo, data limite ou tempo de duração. Nem estime. Se o assunto aparecer, diga que só um advogado do escritório orienta sobre isso.
- NUNCA opine sobre chance de êxito, nem prometa resultado, nem crie urgência (Provimento 205/2021 da OAB: comunicação informativa e sóbria).
- NUNCA cite outro processo, outra pessoa ou qualquer coisa fora desta ficha.
- Não use jargão jurídico. O cliente é leigo: "o juiz pediu um documento", não "houve despacho determinando juntada".

FORMA:
- Português do Brasil, cordial e calmo, como uma pessoa do escritório escreveria no WhatsApp.
- No máximo 8 linhas. Sem títulos, sem listas longas, sem markdown — WhatsApp não formata bem.
- Comece respondendo à pergunta, não com saudação longa.
- Não escreva assinatura nem aviso de uso de inteligência artificial: o sistema acrescenta.`;

// ===========================================================================
// Credenciais
// ===========================================================================
const credPath = path.join(AQUI, 'credenciais.json');
if (!fs.existsSync(credPath)) {
  console.error('\n  falta demo/credenciais.json\n');
  process.exit(1);
}
const credCfg = JSON.parse(fs.readFileSync(credPath, 'utf8'));

// A instância da Uazapi ainda pode não existir — ela dura 1 hora, e o fluxo é
// construído ANTES, justamente para não gastar esse relógio. Sem a credencial
// dá para gerar e testar; publicar, não.
const temUazapi = Boolean(credCfg.httpHeaderAuth && credCfg.httpHeaderAuth.id);
if (!temUazapi && publicar) {
  console.error(`
  falta a credencial da Uazapi no n8n.

  A instância gratuita dura 1 hora, então esta é a ordem:
    1. node demo/uazapi.mjs criar lex-demo-b
    2. node guardar-segredo.mjs demo/uazapi.local
    3. node demo/uazapi.mjs credencial
    4. node demo/montar-fluxo-b.mjs --publicar
`);
  process.exit(1);
}
if (!temUazapi) console.log('credencial Uazapi: [33mainda não existe[0m — dá para gerar e testar, não para publicar');

if (temUazapi) console.log(`credenciais : ${credCfg.httpHeaderAuth.name} · ${credCfg.openAiApi.name}`);
console.log(`chamado     : ${credCfg.telegramApi.name} → ${ADVOGADOS[0].nome} (advogado) quando o robô não pode responder`);

// O Telegram entrou nas dependencias da Demo B quando a recusa passou a
// chamar uma pessoa. Sem ele, o chamado nao tem por onde sair — e um fluxo
// que promete aviso sem poder avisar e a promessa vazia da D-102 de volta.
if (!credCfg.telegramApi || !credCfg.telegramApi.id) {
  console.error(`
  credenciais.json nao tem a credencial do Telegram.`);
  console.error(`  A Demo B agora chama um advogado quando nao pode responder, e isso passa pelo Telegram.`);
  console.error(`  Rode:  node demo/montar-fluxo-a.mjs --capturar-credenciais
`);
  process.exit(1);
}
const cred = { openai: credCfg.openAiApi, uazapi: credCfg.httpHeaderAuth || null, telegram: credCfg.telegramApi };

function no(nome, tipo, versao, params, pos, extra = {}) {
  return { parameters: params, name: nome, type: tipo, typeVersion: versao, position: pos, ...extra };
}

/** Envio pela Uazapi. O token vai por credencial, nunca no corpo do fluxo —
 *  este JSON é versionado. */
const envio = (nome, expressaoTexto, pos) => no(nome, 'n8n-nodes-base.httpRequest', 4.2, {
  method: 'POST',
  url: 'https://free.uazapi.com/send/text',
  authentication: 'genericCredentialType',
  genericAuthType: 'httpHeaderAuth',
  sendBody: true,
  specifyBody: 'json',
  jsonBody: expressaoTexto,
  options: {},
}, pos, {
  // Aqui a falha é menos grave que no fluxo A — ninguém fica achando que o
  // cliente foi avisado; o cliente simplesmente não recebe resposta e repete a
  // pergunta. Ainda assim, instabilidade de rede não deveria custar uma
  // resposta ao cliente, e três tentativas resolvem a maioria delas.
  retryOnFail: true, maxTries: 3, waitBetweenTries: 2000,
  ...(cred.uazapi ? { credentials: { httpHeaderAuth: cred.uazapi } } : {}),
});

const CORPO_ENVIO = (numero, texto) =>
  `=${'{{'} JSON.stringify({ number: ${numero}, text: ${texto}, linkPreview: false, delay: 1200 }) ${'}}'}`;

const nodes = [
  no('Webhook da Uazapi', 'n8n-nodes-base.webhook', 2,
    { httpMethod: 'POST', path: CAMINHO_WEBHOOK, responseMode: 'onReceived', options: {} },
    [-220, 300], { webhookId: CAMINHO_WEBHOOK }),

  no('Porteiro do cliente (verificação em código)', 'n8n-nodes-base.code', 2,
    { mode: 'runOnceForEachItem', jsCode: CODIGO_PORTEIRO }, [0, 300]),

  no('Rota', 'n8n-nodes-base.switch', 3,
    { rules: { values: [
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' }, leftValue: '={{ $json.rota }}', rightValue: 'consulta' }] },
          outputKey: 'consulta' },
        { conditions: { options: { caseSensitive: true, version: 2 }, combinator: 'and', conditions: [
          { operator: { type: 'string', operation: 'equals' }, leftValue: '={{ $json.rota }}', rightValue: 'direto' }] },
          outputKey: 'direto' },
      ] }, options: { fallbackOutput: 'none' } }, [220, 300]),

  no('Ficha do cliente', 'n8n-nodes-base.code', 2,
    { mode: 'runOnceForEachItem', jsCode: CODIGO_FICHA }, [460, 200]),

  no('Modelo — cliente', '@n8n/n8n-nodes-langchain.lmChatOpenAi', 1,
    { model: 'gpt-4o-mini', options: { temperature: 0.3 } }, [700, 380],
    { credentials: { openAiApi: cred.openai } }),

  no('Responder ao cliente', '@n8n/n8n-nodes-langchain.chainLlm', 1.4,
    { promptType: 'define',
      text: '={{ $json.ficha }}\n\nPERGUNTA DO CLIENTE: {{ $json.pergunta }}',
      messages: { messageValues: [{ message: SISTEMA_CLIENTE }] } }, [700, 200]),

  // O aviso de demonstração e a nota de uso de IA são acrescentados AQUI, pelo
  // fluxo. Texto obrigatório não se delega a quem pode variar a redação (D-92).
  envio('Enviar ao cliente',
    CORPO_ENVIO(
      `$('Porteiro do cliente (verificação em código)').item.json.numero`,
      `${JSON.stringify(AVISO_TOPO)} + '\\n\\n' + $json.text.trim() + '\\n\\n' + ${JSON.stringify(NOTA_IA)}`),
    [960, 200]),

  envio('Responder sem consultar',
    CORPO_ENVIO(`$json.numero`, `${JSON.stringify(AVISO_TOPO)} + '\\n\\n' + $json.texto`),
    [460, 460]),

  // --- o chamado ao escritório ---------------------------------------------
  // A recusa deixa de ser um beco. Repare na ORDEM: chama a pessoa PRIMEIRO e
  // só depois responde ao cliente, e a resposta muda conforme o chamado tenha
  // chegado ou não. É a lição da D-101 aplicada ao outro lado do balcão — lá
  // era a tela do colaborador dizendo "enviado" antes do envio; aqui seria o
  // cliente ouvindo "já avisei" antes do aviso.
  no('Precisa de gente?', 'n8n-nodes-base.if', 2.2,
    { conditions: { options: { caseSensitive: true, version: 2, typeValidation: 'loose' },
      combinator: 'and', conditions: [
        { operator: { type: 'boolean', operation: 'true', singleValue: true },
          leftValue: '={{ $json.escalar }}', rightValue: '' }] },
      options: {} }, [460, 620]),

  no('Chamar colaborador (Telegram)', 'n8n-nodes-base.telegram', 1.2,
    { chatId: String(ADVOGADOS[0].id),
      text: '={{ $json.avisoParaColaborador }}',
      additionalFields: { parse_mode: 'HTML', appendAttribution: false } }, [700, 620],
    { retryOnFail: true, maxTries: 3, waitBetweenTries: 2000,
      // Saída de erro, e não `continueRegularOutput`: engolir a falha faria o
      // cliente ouvir "já avisei o escritório" quando ninguém foi avisado.
      onError: 'continueErrorOutput',
      credentials: { telegramApi: cred.telegram } }),

  envio('Responder — o escritório foi avisado',
    CORPO_ENVIO(`$('Porteiro do cliente (verificação em código)').item.json.numero`,
      `${JSON.stringify(AVISO_TOPO)} + '\\n\\n' + $('Porteiro do cliente (verificação em código)').item.json.textoAvisado`),
    [960, 540]),

  envio('Responder — não consegui avisar',
    CORPO_ENVIO(`$('Porteiro do cliente (verificação em código)').item.json.numero`,
      `${JSON.stringify(AVISO_TOPO)} + '\\n\\n' + $('Porteiro do cliente (verificação em código)').item.json.textoSemAviso`),
    [960, 700]),
];

const connections = {
  'Webhook da Uazapi': { main: [[{ node: 'Porteiro do cliente (verificação em código)', type: 'main', index: 0 }]] },
  'Porteiro do cliente (verificação em código)': { main: [[{ node: 'Rota', type: 'main', index: 0 }]] },
  'Rota': { main: [
    [{ node: 'Ficha do cliente', type: 'main', index: 0 }],
    [{ node: 'Precisa de gente?', type: 'main', index: 0 }],
  ] },
  'Precisa de gente?': { main: [
    [{ node: 'Chamar colaborador (Telegram)', type: 'main', index: 0 }],   // escalar
    [{ node: 'Responder sem consultar', type: 'main', index: 0 }],         // recusa comum
  ] },
  'Chamar colaborador (Telegram)': { main: [
    [{ node: 'Responder — o escritório foi avisado', type: 'main', index: 0 }],
    [{ node: 'Responder — não consegui avisar', type: 'main', index: 0 }],  // saída de erro
  ] },
  'Ficha do cliente': { main: [[{ node: 'Responder ao cliente', type: 'main', index: 0 }]] },
  'Modelo — cliente': { ai_languageModel: [[{ node: 'Responder ao cliente', type: 'ai_languageModel', index: 0 }]] },
  'Responder ao cliente': { main: [[{ node: 'Enviar ao cliente', type: 'main', index: 0 }]] },
};

const workflow = { name: NOME, nodes, connections, settings: { executionOrder: 'v1' } };

// O QUE VAI PARA O DISCO NÃO É O QUE VAI PARA O n8n, e a diferença é o segredo.
//
// Este JSON é versionado (D-15), então o segredo do webhook não pode estar
// nele — seria o mesmo erro que o fluxo já evita com o token da Uazapi, que vai
// por credencial e nunca no corpo. A cópia em disco leva um marcador no lugar;
// o segredo de verdade só existe no que é enviado ao n8n e no arquivo `.local`.
//
// A substituição é sobre o JSON serializado, e não só sobre o campo do caminho,
// porque o n8n repete o caminho no `webhookId`. Trocar um e esquecer o outro
// vazaria do mesmo jeito, e a versão que sobra é sempre a que ninguém olhou.
const MARCADOR = 'SEGREDO-FORA-DO-GIT';
const serializado = JSON.stringify(workflow, null, 2);
const paraDisco = segredoWebhook
  ? serializado.split(segredoWebhook).join(MARCADOR)
  : serializado;

if (segredoWebhook && paraDisco.includes(segredoWebhook)) {
  console.error('\n  o segredo do webhook sobreviveu à limpeza do JSON. Nada foi escrito.\n');
  process.exit(1);
}

const dir = path.join(AQUI, 'workflows');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'B-cliente-whatsapp.json'), paraDisco + '\n');
console.log(`\nworkflow escrito : demo/workflows/B-cliente-whatsapp.json`);
console.log(`  nós            : ${nodes.length}`);
console.log(`  webhook        : /webhook/${segredoWebhook ? `lex-demo-b-cliente-${MARCADOR}` : CAMINHO_WEBHOOK}`);
if (segredoWebhook) {
  console.log(`  autenticação   : segredo de ${segredoWebhook.length} caracteres no caminho, fora do Git`);
} else {
  console.log(`  autenticação   : ⚠️ NENHUMA — veja demo/webhook-b.local em LEIA-ME.md`);
}

if (!publicar) {
  console.log(`\nPara enviar ao n8n:  node demo/montar-fluxo-b.mjs --publicar\n`);
  process.exit(0);
}

const { baseUrl } = JSON.parse(fs.readFileSync(path.join(AQUI, 'n8n.json'), 'utf8'));
const chave = fs.readFileSync(path.join(AQUI, 'n8n.local'), 'utf8').trim();
const base = baseUrl.replace(/\/+$/, '') + '/api/v1';
const cab = { 'X-N8N-API-KEY': chave, 'Content-Type': 'application/json', Accept: 'application/json' };

const existentes = await (await fetch(`${base}/workflows?limit=250`, { headers: cab })).json();
const jaExiste = (existentes.data || []).find((w) => w.name === NOME);

const r = await fetch(jaExiste ? `${base}/workflows/${jaExiste.id}` : `${base}/workflows`, {
  method: jaExiste ? 'PUT' : 'POST', headers: cab, body: JSON.stringify(workflow),
});
const corpoResp = await r.json();
if (!r.ok) {
  console.error(`\nfalhou (HTTP ${r.status}): ${JSON.stringify(corpoResp).slice(0, 600)}\n`);
  process.exit(1);
}
console.log(`\n${jaExiste ? 'atualizado' : 'criado'} no n8n · id ${corpoResp.id}`);
console.log(`  ${baseUrl.replace(/\/+$/, '')}/workflow/${corpoResp.id}\n`);

if (ativar) {
  const a = await fetch(`${base}/workflows/${corpoResp.id}/activate`, { method: 'POST', headers: cab });
  if (!a.ok) {
    console.error(`  nao consegui ativar (HTTP ${a.status}): ${(await a.text()).slice(0, 300)}`);
    console.error('  ative pelo painel do n8n, no botao do canto superior direito.\n');
    process.exit(1);
  }
  console.log('  ATIVADO — o gatilho ja esta recebendo eventos.\n');
} else {
  console.log('  inativo. Para ligar:  node demo/montar-fluxo-b.mjs --publicar --ativar\n');
}
