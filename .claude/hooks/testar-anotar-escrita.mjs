#!/usr/bin/env node
// ==========================================================================
// testar-anotar-escrita.mjs — o detector de escrita pelo terminal tem testes
//
// Por que existe: a marca "!bash-escreveu" e o que separa "esta sessao pode
// ter escrito pelo terminal" de "esta sessao so leu". Se ela ligar sempre, o
// fechar-ciclo volta a culpar a sessao errada — que e o defeito que o
// anotar-escrita.mjs existe para consertar.
//
// O caso que motivou o teste: "2>/dev/null" e "2>&1" aparecem em quase todo
// comando. Se contassem como escrita, a marca estaria sempre ligada.
//
// A regra vem IMPORTADA do proprio hook, nunca copiada — copia de regra em
// teste testa a copia, e envelhece sozinha.
//
// Uso:  node .claude/hooks/testar-anotar-escrita.mjs
// ==========================================================================

import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { BASH_ESCREVE } from './anotar-escrita.mjs'

const AQUI = dirname(fileURLToPath(import.meta.url))
const casos = []
const conferir = (esperado, obtido, rotulo) => casos.push([esperado === obtido, esperado, obtido, rotulo])

// --- 1. O detector de comando que escreve ---------------------------------
const comandos = [
  [true, 'cat > docs/novo.md'],
  [true, 'sed -i s/a/b/ arquivo.md'],
  [true, 'rm -f .claude/x'],
  [true, 'echo oi >> registro.txt'],
  [true, 'mkdir -p services/novo'],
  [true, 'Set-Content -Path a.txt -Value x'],
  [true, 'cd x && cp a.md b.md'],
  [false, 'npm install'],
  [false, 'npm run verificar'],
  [false, 'git status --porcelain'],
  [false, 'git log -5 --oneline'],
  [false, 'grep -rn algo docs/'],
  [false, 'ls -d .claude 2>/dev/null'],
  [false, 'node --check x.mjs 2>&1'],
  [false, 'jq --version 2>$null'],
  [false, 'cat docs/00-estado-atual.md | head -40'],
]
for (const [esperado, cmd] of comandos) {
  conferir(esperado, BASH_ESCREVE.test(cmd), `comando: ${cmd}`)
}

// --- 2. A anotacao de verdade, num projeto descartavel --------------------
const caixa = mkdtempSync(join(tmpdir(), 'anotar-escrita-'))
try {
  mkdirSync(join(caixa, '.claude', 'hooks'), { recursive: true })
  const hook = join(caixa, '.claude', 'hooks', 'anotar-escrita.mjs')
  copyFileSync(join(AQUI, 'anotar-escrita.mjs'), hook)

  const anotar = entrada =>
    execFileSync('node', [hook], { cwd: caixa, input: JSON.stringify(entrada), encoding: 'utf8' })

  anotar({ session_id: 's', tool_name: 'Edit', tool_input: { file_path: join(caixa, 'docs/09-spec.md') } })
  anotar({ session_id: 's', tool_name: 'Write', tool_input: { file_path: join(caixa, 'services/a/src/b.ts') } })
  anotar({ session_id: 's', tool_name: 'Bash', tool_input: { command: 'cat > docs/novo.md' } })
  anotar({ session_id: 's', tool_name: 'Bash', tool_input: { command: 'git status' } })
  anotar({ session_id: 's', tool_name: 'Read', tool_input: { file_path: join(caixa, 'docs/09-spec.md') } })
  anotar({ session_id: 's', tool_name: 'Write', tool_input: { file_path: join(tmpdir(), 'fora-do-projeto.txt') } })

  const linhas = readFileSync(join(caixa, '.claude', '.sessoes', 's.escritas.txt'), 'utf8')
    .split('\n').filter(Boolean)

  conferir(true, linhas.includes('docs/09-spec.md'), 'anota caminho de Edit')
  conferir(true, linhas.includes('services/a/src/b.ts'), 'anota caminho de Write')
  conferir(true, linhas.includes('!bash-escreveu'), 'anota marca de terminal que escreve')
  conferir(1, linhas.filter(l => l === '!bash-escreveu').length, 'git status nao vira marca')
  conferir(false, linhas.some(l => l.includes('fora-do-projeto')), 'arquivo fora do projeto e ignorado')
  conferir(3, linhas.length, 'Read nao anota nada')
} finally {
  rmSync(caixa, { recursive: true, force: true })
}

// --- resultado ------------------------------------------------------------
console.log('\nDetector de escrita da sessao\n')
let falhas = 0
for (const [passou, esperado, obtido, rotulo] of casos) {
  if (!passou) falhas++
  console.log(`  ${passou ? '  ok  ' : ' FALHA'}  ${rotulo}${passou ? '' : `   (esperava ${esperado}, veio ${obtido})`}`)
}
console.log(falhas ? `\n${falhas} de ${casos.length} falharam.\n` : `\n${casos.length} de ${casos.length} corretos.\n`)
process.exitCode = falhas ? 1 : 0
