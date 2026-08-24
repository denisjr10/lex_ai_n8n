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
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const publicar = process.argv.includes('--publicar');
// Ativar e o que liga o fluxo de verdade: o gatilho passa a receber eventos do
// mundo. Fica separado de publicar, e explicito, porque publicar e reversivel e
// ativar nao e — a partir dai o fluxo responde a quem mandar mensagem.
const ativar = process.argv.includes('--ativar');

const NOME = '[LEX-DEMO] B · Cliente (WhatsApp)';
const CAMINHO_WEBHOOK = 'lex-demo-b-cliente';
const MOVS_NA_FICHA = 12;   // o cliente quer o essencial, não o extrato

// --- dados -----------------------------------------------------------------
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

const NOTA_IA = 'Esta mensagem foi preparada com apoio de inteligência artificial e revisada por um advogado do escritório.';
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
const PROCESSOS = ${JSON.stringify(instantaneo.processos.map(p => ({
  id: p.id, numero: p.numero_cnj, titulo: p.titulo, classe: p.classe,
  segredo: p.segredo_justica === true,
})))};

const soDigitos = (t) => String(t || '').replace(/\\D/g, '');

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
const cliente = CLIENTES.find(c => soDigitos(c.whatsapp) === numero);
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

// --- pedido de atendimento humano -------------------------------------------
if (/falar com (uma pessoa|algu[ée]m|advogad|humano|atendente)|atendimento humano|pessoa de verdade/i.test(texto)) {
  return { json: { ...base, rota: 'direto', texto:
    'Combinado. Vou avisar o escritório e alguém entra em contato com você.\\n\\n' +
    'Nesta demonstração o aviso não é enviado de verdade — no sistema completo, ele abre um chamado para a equipe.' }};
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
  return { json: { ...base, rota: 'direto', texto: [
    'Sobre prazo eu não informo — essa é uma orientação que só um advogado do escritório pode dar, olhando o processo.',
    '',
    'Vou avisar a equipe do seu contato. Se for urgente, ligue para o escritório.'
  ].join('\\n') }};
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
- Baseie-se EXCLUSIVAMENTE na ficha fornecida. Se a informação não está lá, diga que vai verificar com o escritório.
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

const cred = { openai: credCfg.openAiApi, uazapi: credCfg.httpHeaderAuth || null };

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
}, pos, cred.uazapi ? { credentials: { httpHeaderAuth: cred.uazapi } } : {});

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
];

const connections = {
  'Webhook da Uazapi': { main: [[{ node: 'Porteiro do cliente (verificação em código)', type: 'main', index: 0 }]] },
  'Porteiro do cliente (verificação em código)': { main: [[{ node: 'Rota', type: 'main', index: 0 }]] },
  'Rota': { main: [
    [{ node: 'Ficha do cliente', type: 'main', index: 0 }],
    [{ node: 'Responder sem consultar', type: 'main', index: 0 }],
  ] },
  'Ficha do cliente': { main: [[{ node: 'Responder ao cliente', type: 'main', index: 0 }]] },
  'Modelo — cliente': { ai_languageModel: [[{ node: 'Responder ao cliente', type: 'ai_languageModel', index: 0 }]] },
  'Responder ao cliente': { main: [[{ node: 'Enviar ao cliente', type: 'main', index: 0 }]] },
};

const workflow = { name: NOME, nodes, connections, settings: { executionOrder: 'v1' } };

const dir = path.join(AQUI, 'workflows');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'B-cliente-whatsapp.json'), JSON.stringify(workflow, null, 2) + '\n');
console.log(`\nworkflow escrito : demo/workflows/B-cliente-whatsapp.json`);
console.log(`  nós            : ${nodes.length}`);
console.log(`  webhook        : /webhook/${CAMINHO_WEBHOOK}`);

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
