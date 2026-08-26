#!/usr/bin/env node
// ==========================================================================
// testar-fechar-ciclo.mjs — o cobrador do estado tem testes
//
// Por que existe: em 26/08 descobriu-se que o fechar-ciclo so enxergava o que
// estava POR COMMITAR. Uma sessao que commitava antes de parar deixava a
// arvore limpa, e o hook saia calado — justamente nas sessoes mais
// produtivas, que sao as que commitam. O 00-estado-atual.md envelhecia
// exatamente onde mais importava.
//
// Como testa: monta um repositorio Git descartavel, com uma copia dos hooks,
// e encena as situacoes. Nao depende de commit nenhum deste projeto, entao
// nao apodrece com o tempo.
//
// Uso:  node .claude/hooks/testar-fechar-ciclo.mjs
// ==========================================================================

import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const AQUI = dirname(fileURLToPath(import.meta.url))
const caixa = mkdtempSync(join(tmpdir(), 'fechar-ciclo-'))

const git = (...args) =>
  execFileSync('git', args, { cwd: caixa, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()

function escrever(caminho, texto) {
  const destino = join(caixa, caminho)
  mkdirSync(dirname(destino), { recursive: true })
  writeFileSync(destino, texto)
}

/** Encena uma parada de sessao e devolve o veredito do hook. */
function rodar(foto) {
  mkdirSync(join(caixa, '.claude', '.sessoes'), { recursive: true })
  writeFileSync(join(caixa, '.claude', '.sessoes', 'sessao.json'), JSON.stringify(foto))
  const saida = execFileSync('node', [join(caixa, '.claude', 'hooks', 'fechar-ciclo.mjs')], {
    cwd: caixa,
    input: JSON.stringify({ session_id: 'sessao' }),
    encoding: 'utf8',
  })
  try {
    const j = JSON.parse(saida || '{}')
    return j.decision || (j.systemMessage ? 'aviso' : 'calado')
  } catch {
    return 'calado'
  }
}

const sujo = () => git('status', '--porcelain').split('\n').filter(Boolean)

try {
  // --- monta o repositorio de mentira --------------------------------------
  git('init', '-q')
  git('config', 'user.email', 'teste@exemplo')
  git('config', 'user.name', 'Teste')
  mkdirSync(join(caixa, '.claude', 'hooks'), { recursive: true })
  copyFileSync(join(AQUI, 'fechar-ciclo.mjs'), join(caixa, '.claude', 'hooks', 'fechar-ciclo.mjs'))
  escrever('.gitignore', '.claude/.sessoes/\n')
  escrever('docs/00-estado-atual.md', '# Estado\n')
  escrever('README.md', 'inicio\n')
  git('add', '-A'); git('commit', '-qm', 'inicio')
  const raiz = git('rev-parse', 'HEAD')

  const casos = []
  const conferir = (esperado, rotulo, obtido) => casos.push([esperado === obtido, esperado, obtido, rotulo])

  // 1. Nada aconteceu.
  conferir('calado', 'sessao que nao mexeu em nada',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz }))

  // 2. Mexeu e nao commitou, sem tocar o estado. O caso que ja funcionava.
  escrever('docs/09-spec-tecnica.md', 'mudou\n')
  conferir('block', 'alterou doc, nao commitou, estado intacto',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz }))

  // 3. Mesma coisa, mas com o estado atualizado junto: so falta registrar.
  escrever('docs/00-estado-atual.md', '# Estado\nnovidade\n')
  conferir('aviso', 'alterou doc E estado, falta commit',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz }))

  // 4. O BURACO: commitou tudo, inclusive o estado. Ciclo fechado, sai calado.
  git('add', '-A'); git('commit', '-qm', 'com estado')
  conferir('calado', 'commitou trabalho E estado — ciclo fechado',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz }))

  // 5. O BURACO DE VERDADE: commitou trabalho relevante SEM tocar o estado.
  //    Antes da correcao de 26/08 isto saia calado, porque a arvore fica limpa.
  const antesDoDescuido = git('rev-parse', 'HEAD')
  escrever('captura/algo.mjs', 'trabalho relevante\n')
  git('add', '-A'); git('commit', '-qm', 'sem estado')
  conferir('block', 'commitou trabalho relevante sem tocar o estado',
    rodar({ pendenciasNoInicio: [], commitNoInicio: antesDoDescuido }))

  // 6. Sujeira que ja existia antes da sessao nao e problema desta sessao.
  escrever('docs/rascunho.md', 'de outra sessao\n')
  conferir('calado', 'sujeira herdada de outra sessao',
    rodar({ pendenciasNoInicio: sujo(), commitNoInicio: git('rev-parse', 'HEAD') }))

  // 7. Arquivo irrelevante nao incomoda ninguem.
  escrever('qualquer/coisa.txt', 'irrelevante\n')
  conferir('calado', 'arquivo fora das pastas de memoria',
    rodar({ pendenciasNoInicio: sujo().filter(l => !l.includes('coisa.txt')), commitNoInicio: git('rev-parse', 'HEAD') }))

  // 8. Laco infinito nunca: com stop_hook_active ele sai calado sempre.
  mkdirSync(join(caixa, '.claude', '.sessoes'), { recursive: true })
  writeFileSync(join(caixa, '.claude', '.sessoes', 'sessao.json'),
    JSON.stringify({ pendenciasNoInicio: [], commitNoInicio: raiz }))
  const reentrada = execFileSync('node', [join(caixa, '.claude', 'hooks', 'fechar-ciclo.mjs')], {
    cwd: caixa, input: JSON.stringify({ session_id: 'sessao', stop_hook_active: true }), encoding: 'utf8',
  })
  conferir('calado', 'stop_hook_active — nunca entra em laco', reentrada.trim() ? 'algo' : 'calado')

  // --- resultado ------------------------------------------------------------
  console.log('\nCobrador do estado do projeto\n')
  let falhas = 0
  for (const [passou, esperado, obtido, rotulo] of casos) {
    if (!passou) falhas++
    console.log(`  ${passou ? '  ok  ' : ' FALHA'}  ${obtido.padEnd(7)} ${rotulo}${passou ? '' : `   (esperava ${esperado})`}`)
  }
  console.log(falhas ? `\n${falhas} de ${casos.length} falharam.\n` : `\n${casos.length} de ${casos.length} corretos.\n`)
  process.exitCode = falhas ? 1 : 0
} finally {
  rmSync(caixa, { recursive: true, force: true })
}
