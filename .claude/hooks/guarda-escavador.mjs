#!/usr/bin/env node
// ==========================================================================
// guarda-escavador.mjs — disjuntor de credito da API do Escavador
//
// Evento: PreToolUse | Ferramentas: Bash, PowerShell, WebFetch
//
// Por que existe: a cota de teste tem R$ 50,00, sem recarga contratada e com
// validade ate 01/09/2026. A Regra 8 do CLAUDE.md diz que nenhuma chamada
// acontece fora do orcamento aprovado — mas regra em prompt depende de o
// agente lembrar. Este hook transforma a regra em barreira: o programa
// bloqueia antes de o comando rodar.
//
// A COTA E DE DINHEIRO, E SO. Duas "regras" que este hook repetiu por dias
// nao existem, e a medicao as derrubou:
//   - a tarifa plana de R$ 3,00 (D-108): o debito varia por rota — R$ 0,05,
//     R$ 2,95 e R$ 0,00 foram medidos no mesmo dia
//   - o teto de 16 requisicoes (D-119): eram R$ 50 / R$ 3, uma conta NOSSA
//     sobre uma tarifa que nao existe. 18 requisicoes sairam com saldo intacto
// Isso nao afrouxa nada: rota gratuita se confirma pelo cabeçalho
// Creditos-Utilizados medido, nunca por suposicao, e chamada fora do
// orcamento continua exigindo aval do usuario na hora.
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
//
// A lista de scripts precisa crescer junto com a captura. `atualizar.mjs`
// nasceu depois deste hook, e por um momento existiu um script que debita
// R$ 3,00 e passava por fora do disjuntor. Barreira que nao conhece o script
// novo e barreira que da falsa seguranca, que e pior que barreira nenhuma.
// `comparar-tribunal.mjs` (Bloco E) entrou aqui no mesmo commit em que nasceu,
// justamente para nao repetir aquele intervalo.
const SCRIPT_QUE_COBRA = /\b(node|npx|bun|deno)\b(?![^|;&]*--check\b)[^|;&]*\b(capturar|monitorar|atualizar|comparar-tribunal)\.mjs/i

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

  // Os scripts pagos so chamam a rede com --executar. Sem a bandeira eles
  // imprimem o plano e saem. Barrar o ensaio seria barrar exatamente a etapa
  // que existe para NAO gastar — e empurrar quem trabalha direto para a
  // chamada real, que e o oposto do que este hook quer.
  const ehEnsaio = !/--executar\b/.test(comando)

  // `--executar` NAO e sinonimo de "gasta". Os dois scripts com subcomando tem
  // operacoes gratuitas que tambem precisam de --executar para valer: conferir
  // o inventario de assinaturas (`listar`), acompanhar uma atualizacao
  // (`status`) e, sobretudo, REMOVER um monitoramento — a operacao que existe
  // para PARAR a cobranca mensal. Barrar `remover` seria o hook de custo
  // impedindo a unica acao que reduz custo.
  //
  // A lista e explicita, nunca por exclusao: subcomando desconhecido cai no
  // bloqueio. Falha fecha.
  const OPERACAO_GRATUITA = /\b(monitorar|atualizar)\.mjs\s+(origens|listar|aparicoes|remover|status)\b/i

  if (SCRIPT_QUE_COBRA.test(comando) && !ehEnsaio && !OPERACAO_GRATUITA.test(comando)) {
    negar(
      'BLOQUEADO pelo disjuntor de credito (Regra 8 do CLAUDE.md).\n' +
      'Este comando executa um dos scripts que chamam a API do Escavador ' +
      'e pode debitar credito do saldo de teste (R$ 50,00, sem recarga, ' +
      'validade 01/09/2026). Quanto ele debita depende da rota: ja se mediu ' +
      'de R$ 0,00 a R$ 3,00 na mesma cota.\n\n' +
      'O que fazer: NAO tente contornar. Releia as respostas ja capturadas em ' +
      'captura/respostas-brutas/ (Regra 5 do orcamento: nunca repita uma chamada ' +
      `ja feita). Se a chamada for mesmo necessaria, confira ${ORCAMENTO} e peca ` +
      'aval explicito ao usuario, na hora, antes de rodar.'
    )
  }

  if (MENCIONA_ESCAVADOR.test(comando) && INVOCADORES.test(comando)) {
    negar(
      'BLOQUEADO pelo disjuntor de credito (Regra 8 do CLAUDE.md).\n' +
      'Este comando parece fazer uma chamada de rede ao Escavador. O debito ' +
      'varia por rota e so se conhece DEPOIS, pelo cabecalho ' +
      'Creditos-Utilizados — e o saldo nao se recarrega sozinho.\n\n' +
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
      `Esta URL bate na API do Escavador (${host}${caminho}), que cobra por ` +
      'rota, com saldo de teste sem recarga.\n\n' +
      'O que fazer: se voce quer ler DOCUMENTACAO, use docs.escavador.com ou o ' +
      'OpenAPI, que sao de graca. Se voce quer DADO da API, pare e peca aval ' +
      'explicito ao usuario.'
    )
  }
}

process.exit(0)
