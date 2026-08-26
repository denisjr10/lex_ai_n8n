#!/usr/bin/env node
// ==========================================================================
// guarda-escavador.mjs — disjuntor de credito da API do Escavador
//
// Evento: PreToolUse | Ferramentas: Bash, PowerShell, WebFetch
//
// Por que existe: a cota de teste tem R$ 50,00 e 16 requisicoes, a R$ 3,00
// cada, sem rota gratuita. A Regra 8 do CLAUDE.md diz que nenhuma chamada
// acontece fora do orcamento aprovado — mas regra em prompt depende de o
// agente lembrar. Este hook transforma a regra em barreira: o programa
// bloqueia antes de o comando rodar.
//
// Falha fecha: qualquer duvida, nega e manda perguntar ao usuario.
// ==========================================================================

const ORCAMENTO = 'docs/06-orcamento-de-chamadas-escavador.md'

// Comando que so LE arquivos locais nao gasta nada. Estes sao os sinais de
// que o comando quer falar com a rede ou executar um script.
const INVOCADORES = /\b(curl|wget|Invoke-RestMethod|Invoke-WebRequest|node|npx|npm|pnpm|yarn|python|python3|py|deno|bun|http|https)\b/i

const MENCIONA_ESCAVADOR = /escavador\.com/i

// Bloqueia EXECUTAR o script, nao MENCIONAR o script. A primeira versao casava
// o nome puro, e com isso barrava `cat captura/capturar.mjs` — ler codigo e de
// graca, e um hook que barra leitura ensina a contornar o hook.
//
// O lookahead exclui `--check`, que so confere sintaxe e nao roda uma linha.
// Falso positivo em hook de seguranca nao e detalhe: hook que barra o trabalho
// legitimo e hook que a proxima sessao aprende a desligar.
const SCRIPT_QUE_COBRA = /\b(node|npx|bun|deno)\b(?![^|;&]*--check\b)[^|;&]*\b(capturar|monitorar)\.mjs/i

function negar(motivo) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: motivo,
    },
  }))
  process.exit(0)
}

async function lerEntrada() {
  const pedacos = []
  for await (const p of process.stdin) pedacos.push(p)
  try { return JSON.parse(Buffer.concat(pedacos).toString('utf8') || '{}') }
  catch { return {} }
}

const entrada = await lerEntrada()
const ferramenta = entrada.tool_name || ''
const alvo = entrada.tool_input || {}

// --- Bash / PowerShell ----------------------------------------------------
if (ferramenta === 'Bash' || ferramenta === 'PowerShell') {
  const comando = String(alvo.command || '')

  // Os dois scripts pagos so chamam a rede com --executar. Sem a bandeira eles
  // imprimem o plano e saem. Barrar o ensaio seria barrar exatamente a etapa
  // que existe para NAO gastar — e empurrar quem trabalha direto para a
  // chamada real, que e o oposto do que este hook quer.
  const ehEnsaio = !/--executar\b/.test(comando)

  if (SCRIPT_QUE_COBRA.test(comando) && !ehEnsaio) {
    negar(
      'BLOQUEADO pelo disjuntor de credito (Regra 8 do CLAUDE.md).\n' +
      'Este comando executa captura/capturar.mjs, que chama a API do Escavador ' +
      'e debita R$ 3,00 do saldo de teste (R$ 50,00 / 16 requisicoes).\n\n' +
      'O que fazer: NAO tente contornar. Releia as respostas ja capturadas em ' +
      'captura/respostas-brutas/ (Regra 5 do orcamento: nunca repita uma chamada ' +
      `ja feita). Se a chamada for mesmo necessaria, confira ${ORCAMENTO} e peca ` +
      'aval explicito ao usuario, na hora, antes de rodar.'
    )
  }

  if (MENCIONA_ESCAVADOR.test(comando) && INVOCADORES.test(comando)) {
    negar(
      'BLOQUEADO pelo disjuntor de credito (Regra 8 do CLAUDE.md).\n' +
      'Este comando parece fazer uma chamada de rede ao Escavador. Cada ' +
      'requisicao debita R$ 3,00 do saldo de teste, sem rota gratuita, e o ' +
      'saldo nao se recarrega sozinho.\n\n' +
      'O que fazer: pare e pergunte ao usuario. Antes disso, verifique se a ' +
      'resposta ja nao esta em docs/mapeamento-escavador.md, no OpenAPI ou em ' +
      'captura/respostas-brutas/ (Regra 3 do orcamento: nao gaste chamada para ' +
      'descobrir o que a documentacao ja responde).\n' +
      `Se for necessaria mesmo, ela precisa constar de ${ORCAMENTO}.`
    )
  }
}

// --- WebFetch -------------------------------------------------------------
// Ler documentacao publica e de graca. Bater na API e que cobra.
if (ferramenta === 'WebFetch') {
  const url = String(alvo.url || '')
  let host = '', caminho = ''
  try { const u = new URL(url.startsWith('http') ? url : `https://${url}`); host = u.hostname; caminho = u.pathname }
  catch { host = url }

  const ehApi = /(^|\.)api\.escavador\.com$/i.test(host)
  const ehRotaDeApi = /escavador\.com/i.test(host) && /^\/api\/v[12]\b/i.test(caminho)
  // A documentacao V1 e V2 mora em /v1/docs e /v2/docs, nao so em /docs. A
  // primeira versao so liberava a raiz e barrava justamente a pagina que
  // responde de graca o que a chamada paga responderia por R$ 3,00.
  const ehDocumentacao = /(^|\/)docs?(\/|$|#)/i.test(caminho)

  if ((ehApi && !ehDocumentacao) || ehRotaDeApi) {
    negar(
      'BLOQUEADO pelo disjuntor de credito (Regra 8 do CLAUDE.md).\n' +
      `Esta URL bate na API paga do Escavador (${host}${caminho}) — R$ 3,00 por ` +
      'requisicao, saldo de teste sem recarga.\n\n' +
      'O que fazer: se voce quer ler DOCUMENTACAO, use docs.escavador.com ou o ' +
      'OpenAPI, que sao de graca. Se voce quer DADO da API, pare e peca aval ' +
      'explicito ao usuario.'
    )
  }
}

process.exit(0)
