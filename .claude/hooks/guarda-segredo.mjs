#!/usr/bin/env node
// ==========================================================================
// guarda-segredo.mjs — barreira contra segredo e dado de cliente no Git
//
// Evento: PreToolUse | Ferramentas: Bash, PowerShell
//
// Por que existe: o .gitignore protege contra o esquecimento, nao contra o
// "git add -f" nem contra um arquivo novo com nome fora dos padroes. E
// segredo commitado e praticamente indesfazivel — o historico guarda tudo.
// R-12: a API do Escavador armazena certificado digital e senha de advogado.
//
// O que faz, em tres camadas:
//   1. bloqueia "git add -f" (a unica forma de furar o .gitignore)
//   2. bloqueia "git add" de caminho proibido, mesmo que o .gitignore falhe
//   3. no "git commit", varre o que esta preparado (staged) atras de
//      segredo no conteudo e de arquivo proibido no indice
// ==========================================================================

import { execFileSync } from 'node:child_process'

// --- Caminhos que nunca entram no historico -------------------------------
const CAMINHOS_PROIBIDOS = [
  { re: /(^|\/)[^/]*\.local(\.|$|\/)/i, razao: 'arquivo *.local (segredo ou dado real de cliente)' },
  { re: /^captura\/(autos|autos-texto|respostas-brutas)\//i, razao: 'autos em PDF ou resposta bruta paga da API' },
  { re: /^demo\/instantaneo\/processos\.json$/i, razao: 'instantaneo com processos reais' },
  { re: /^demo\/listas\/(colaboradores|clientes)\.json$/i, razao: 'lista real de colaboradores ou clientes' },
  { re: /^demo\/credenciais\.json$/i, razao: 'IDs de credencial da instancia n8n' },
  { re: /\.(pem|key|pfx|p12|crt|cer|jks|keystore)$/i, razao: 'chave ou certificado criptografico (R-12)' },
  { re: /(^|\/)\.env($|\.)/i, razao: 'arquivo de ambiente com segredo' },
  { re: /\.credentials\.json$/i, razao: 'credencial exportada do n8n' },
]

// --- Segredo no conteudo: bloqueia ----------------------------------------
const SEGREDOS = [
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, nome: 'uma chave privada' },
  { re: /\bBearer\s+[A-Za-z0-9._\-]{20,}/, nome: 'um token Bearer' },
  { re: /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\./, nome: 'um JWT' },
  { re: /\bsk-[A-Za-z0-9]{20,}/, nome: 'uma chave de API estilo sk-' },
  {
    re: /\b(token|senha|password|api[_-]?key|apikey|secret|authorization)\b\s*[:=]\s*(["'`]?)([A-Za-z0-9._$\-\/+]{16,})/i,
    nome: 'um segredo atribuido a uma variavel',
    grupoAspas: 2,
    grupoValor: 3,
  },
]

// Valores que sao claramente exemplo, nao segredo de verdade.
const EH_EXEMPLO = /^(seu|sua|meu|exemplo|example|placeholder|cole|troque|substitua|xxx+|000+|aaa+|\.\.\.|process\.env|COLOQUE)/i

// Valores que sao REFERENCIA a outro lugar, e nao o segredo em si.
//
// Este padrao nasceu de um falso positivo em 27/08: a linha
//
//     const senha = env.LEX_APP_PASSWORD
//
// foi bloqueada como "segredo atribuido a variavel". Ela e o contrario disso —
// e o codigo LENDO a senha do ambiente em vez de guardar o valor no arquivo,
// que e exatamente o que este guarda quer que aconteca.
//
// A distincao que resolve: segredo de verdade e um LITERAL entre aspas. Sem
// aspas e com forma de caminho de identificador (`algo.OUTRO_ALGO`), o que
// esta ali e o nome de onde o valor mora, nao o valor.
//
// Falso positivo em barreira de seguranca nao e incomodo: e o que ensina a
// proxima sessao a desligar a barreira. Foi a licao do disjuntor de credito,
// e vale igual aqui.
const EH_REFERENCIA = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+$/

// --- Dado de cliente: pergunta antes, nao bloqueia -------------------------
const NUMERO_CNJ = /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/

function responder(decisao, motivo) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decisao,
      permissionDecisionReason: motivo,
    },
  }))
  process.exit(0)
}

async function lerEntrada() {
  const pedacos = []
  for await (const p of process.stdin) pedacos.push(p)
  try {
    return JSON.parse(Buffer.concat(pedacos).toString('utf8') || '{}')
  } catch {
    return {}
  }
}

function git(...args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  } catch {
    return ''
  }
}

// Pega os caminhos passados a "git add", ignorando as opcoes.
function caminhosDoAdd(comando) {
  const m = comando.match(/git\s+add\b([^&|;]*)/i)
  if (!m) return []
  return m[1]
    .split(/\s+/)
    .map(t => t.replace(/^["']|["']$/g, '').trim())
    .filter(t => t && !t.startsWith('-'))
    .map(t => t.replace(/\\/g, '/'))
}

function proibido(caminho) {
  return CAMINHOS_PROIBIDOS.find(p => p.re.test(caminho))
}

const entrada = await lerEntrada()
const ferramenta = entrada.tool_name || ''
if (ferramenta !== 'Bash' && ferramenta !== 'PowerShell') process.exit(0)

const comando = String((entrada.tool_input || {}).command || '')
if (!/\bgit\b/.test(comando)) process.exit(0)

// --- Camada 1: git add -f -------------------------------------------------
if (/git\s+add\b[^&|;]*(?:\s-\w*f|\s--force)\b/i.test(comando)) {
  responder('deny',
    'BLOQUEADO pelo guarda de segredo.\n' +
    '"git add -f" ignora o .gitignore a forca — e o .gitignore deste projeto e ' +
    'a unica coisa que separa token, certificado de advogado e autos de cliente ' +
    'do historico do Git.\n\n' +
    'O que fazer: adicione o arquivo sem -f. Se o .gitignore o esta barrando, ' +
    'isso e o sistema funcionando: confirme com o usuario se o arquivo realmente ' +
    'deve ser versionado e, se sim, ajuste o .gitignore explicitamente primeiro.')
}

// --- Camada 2: git add de caminho proibido --------------------------------
if (/git\s+add\b/i.test(comando)) {
  for (const caminho of caminhosDoAdd(comando)) {
    const achado = proibido(caminho)
    if (achado) {
      responder('deny',
        'BLOQUEADO pelo guarda de segredo.\n' +
        `O caminho "${caminho}" e ${achado.razao}. Isso nunca entra no ` +
        'repositorio (ver cabecalho do .gitignore e R-12 em 01-diretrizes-gerais.md).\n\n' +
        'O que fazer: prepare so os arquivos que podem ser versionados, nomeando-os um a um.')
    }
  }
}

// --- Camada 3: varredura do que esta preparado, no commit -----------------
if (/git\s+(?:-c\s+\S+\s+)?commit\b/i.test(comando)) {
  const arquivos = git('diff', '--cached', '--name-only').split('\n').map(s => s.trim()).filter(Boolean)

  for (const arquivo of arquivos) {
    const achado = proibido(arquivo)
    if (achado) {
      responder('deny',
        'BLOQUEADO pelo guarda de segredo.\n' +
        `O arquivo "${arquivo}" esta preparado para commit e e ${achado.razao}.\n\n` +
        `O que fazer: retire-o do indice com "git restore --staged ${arquivo}" e ` +
        'confira por que o .gitignore nao o pegou — provavelmente falta um padrao la.')
    }
  }

  const diff = git('diff', '--cached', '-U0')
  const texto = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).join('\n')

  for (const s of SEGREDOS) {
    const m = texto.match(s.re)
    if (!m) continue
    const valor = s.grupoValor ? m[s.grupoValor] : m[0]
    const aspas = s.grupoAspas ? m[s.grupoAspas] : ''
    if (s.grupoValor && EH_EXEMPLO.test(valor)) continue
    if (s.grupoValor && !aspas && EH_REFERENCIA.test(valor)) continue
    responder('deny',
      'BLOQUEADO pelo guarda de segredo.\n' +
      `As linhas adicionadas neste commit contem o que parece ser ${s.nome}.\n` +
      `Trecho: ${m[0].slice(0, 60)}\n\n` +
      'O que fazer: tire o segredo do arquivo, guarde-o via guardar-segredo.mjs ' +
      '(que grava fora do Git) e refaca o commit. Se for um exemplo falso, use um ' +
      'valor obviamente ficticio, como SEU_TOKEN_AQUI.')
  }

  const cnj = texto.match(NUMERO_CNJ)
  if (cnj) {
    responder('ask',
      'ATENCAO do guarda de segredo (D-95).\n' +
      `As linhas adicionadas contem um numero de processo no formato CNJ: ${cnj[0]}.\n` +
      'Numero CNJ e publico em regra, mas a lista de processos do escritorio e ' +
      'informacao sobre a carteira do cliente.\n\n' +
      'Confirme se este numero e ficticio (ensaio da demo — pode ser versionado) ' +
      'ou real (nao pode).')
  }
}

process.exit(0)
