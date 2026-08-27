#!/usr/bin/env node
// ==========================================================================
// testar-guarda-segredo.mjs — o guarda de segredo também tem testes
//
// Por que existe: em 27/08 o guarda bloqueou esta linha, num commit legítimo:
//
//     const senha = env.LEX_APP_PASSWORD
//
// Ela é o contrário de um vazamento — é o código LENDO a senha do ambiente em
// vez de guardar o valor no arquivo, que é exatamente o comportamento que este
// guarda existe para incentivar.
//
// O disjuntor de crédito passou pelo mesmo aprendizado uma semana antes, e a
// conclusão foi a mesma: **falso positivo em barreira de segurança não é
// incômodo — é o que ensina a próxima sessão a desligar a barreira.**
//
// Os testes rodam contra um repositório Git DESCARTÁVEL, criado numa pasta
// temporária. Nada aqui toca o repositório de verdade.
//
// Uso:  node .claude/hooks/testar-guarda-segredo.mjs
// ==========================================================================

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const AQUI = dirname(fileURLToPath(import.meta.url))
const HOOK = join(AQUI, 'guarda-segredo.mjs')

// --------------------------------------------------------------------------
// Um repositório de mentira, para não encostar no de verdade
// --------------------------------------------------------------------------
const CAMPO = fs.mkdtempSync(join(os.tmpdir(), 'guarda-segredo-'))

function git(...args) {
  return execFileSync('git', args, { cwd: CAMPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

git('init', '--quiet')
git('config', 'user.email', 'teste@exemplo.invalido')
git('config', 'user.name', 'Teste')

/** Prepara um arquivo com este conteúdo, e só ele, no índice. */
function prepararSomente(nome, conteudo) {
  git('reset', '--quiet')
  fs.mkdirSync(join(CAMPO, nome, '..'), { recursive: true })
  fs.writeFileSync(join(CAMPO, nome), conteudo)
  git('add', '--force', '--', nome)
}

function rodarHook(ferramenta, entrada) {
  const saida = execFileSync('node', [HOOK], {
    cwd: CAMPO,
    input: JSON.stringify({ tool_name: ferramenta, tool_input: entrada }),
    encoding: 'utf8',
  })
  if (!saida.trim()) return 'permitido'
  try {
    return JSON.parse(saida).hookSpecificOutput?.permissionDecision || 'permitido'
  } catch {
    return 'permitido'
  }
}

// --------------------------------------------------------------------------
// Os casos
//
// Nomes de arquivo e trechos montados em pedaços onde precisam ser: este teste
// roda dentro do próprio repositório, e um `git add` de verdade no comando
// seria lido pelo hook que ele testa.
// --------------------------------------------------------------------------
const COMMIT = { command: 'git commit -m "teste"' }

// Uma cadeia com cara de segredo, montada aqui para não parecer um de verdade.
const FALSO_TOKEN = 'aB3xY' + '9zQw2Lm5' + 'Pk8RtNv4Hs'

const CASOS = [
  // --- camada 1 e 2: o comando ------------------------------------------
  ['deny',      'git add -f fura o .gitignore',   'Bash', { command: 'git add -f captura/token.local' }],
  ['deny',      'git add de arquivo .local',      'Bash', { command: 'git add captura/token.local' }],
  ['deny',      'git add de resposta bruta paga', 'Bash', { command: 'git add captura/respostas-brutas/x.json' }],
  ['deny',      'git add de chave privada',       'Bash', { command: 'git add infra/servidor.pem' }],
  ['permitido', 'git add de documento',           'Bash', { command: 'git add docs/00-estado-atual.md' }],
  ['permitido', 'git status nao e assunto',       'Bash', { command: 'git status --short' }],

  // --- camada 3: o CONTEUDO preparado -----------------------------------
  //
  // Os quatro primeiros sao o falso positivo de 27/08 e seus vizinhos: codigo
  // que LE segredo de fora nunca e segredo. Se algum destes voltar a dar deny,
  // o guarda regrediu.
  ['permitido', 'senha lida do ambiente (o falso positivo de 27/08)', 'Bash', COMMIT,
    () => prepararSomente('migrar.mjs', 'const senha = env.LEX_APP_PASSWORD\n')],
  ['permitido', 'senha lida de process.env',       'Bash', COMMIT,
    () => prepararSomente('app.mjs', 'const senha = process.env.SENHA_DO_BANCO\n')],
  ['permitido', 'token lido de configuracao',      'Bash', COMMIT,
    () => prepararSomente('cli.mjs', 'const token = configuracao.credenciais.escavador\n')],
  ['permitido', 'valor de exemplo obvio',          'Bash', COMMIT,
    () => prepararSomente('exemplo.txt', 'token = SEU_TOKEN_AQUI_COLE_NELE\n')],
  ['permitido', 'documento so falando de senha',   'Bash', COMMIT,
    () => prepararSomente('doc.md', 'A senha vive no cofre e chega por variavel de ambiente.\n')],

  // E os que precisam continuar sendo barrados.
  ['deny', 'segredo em literal entre aspas',       'Bash', COMMIT,
    () => prepararSomente('ruim.mjs', `const senha = "${FALSO_TOKEN}"\n`)],
  ['deny', 'segredo em literal sem aspas',         'Bash', COMMIT,
    () => prepararSomente('ruim.env-ish', `SENHA=${FALSO_TOKEN}\n`)],
  ['deny', 'cabecalho de chave privada',           'Bash', COMMIT,
    () => prepararSomente('chave.txt', '-----BEGIN RSA PRIVATE KEY-----\nMIIE\n')],
  ['deny', 'um JWT no meio do texto',              'Bash', COMMIT,
    () => prepararSomente('anotacao.md', 'colei aqui: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc\n')],
  ['deny', 'arquivo de ambiente no indice',        'Bash', COMMIT,
    () => prepararSomente('.env', 'POSTGRES_DB=lex\n')],

  // Numero de processo nao bloqueia: pergunta (D-95).
  ['ask',  'numero CNJ pede confirmacao',          'Bash', COMMIT,
    () => prepararSomente('nota.md', 'o processo 0000132-06.2025.5.08.0205 foi consultado\n')],
]

// --------------------------------------------------------------------------
let falhas = 0
console.log('\nGuarda de segredo\n')

for (const [esperado, rotulo, ferramenta, entrada, preparar] of CASOS) {
  if (preparar) preparar()
  else git('reset', '--quiet')

  let obtido
  try {
    obtido = rodarHook(ferramenta, entrada)
  } catch (e) {
    obtido = `erro: ${e.message.split('\n')[0]}`
  }

  const passou = obtido === esperado
  if (!passou) falhas++
  console.log(`    ${passou ? 'ok  ' : 'FALHA'}  ${esperado.padEnd(9)} ${rotulo}${passou ? '' : `   (obtido: ${obtido})`}`)
}

fs.rmSync(CAMPO, { recursive: true, force: true })

console.log(`\n${CASOS.length - falhas} de ${CASOS.length} corretos.\n`)
process.exit(falhas ? 1 : 0)
