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
// Em 04/09 vieram tres consertos, e cada um tem caso aqui:
//   - a lista de pastas relevantes virou lista de EXCLUSAO (services/, dados/,
//     testes/ nasceram invisiveis com a lista antiga: 13 de 24 arquivos);
//   - fotografia ausente parou de significar "sai calado" (falha abrindo);
//   - a autoria passou a vir do que a sessao PROVADAMENTE escreveu, e nao da
//     diferenca no disco — que atribuia a esta sessao o trabalho de outra.
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

/** Encena uma parada de sessao e devolve o veredito do hook.
 *
 *  `foto`     — o que o estado-do-repo.mjs teria gravado no inicio, ou null
 *               para encenar uma sessao sem fotografia nenhuma.
 *  `escritas` — as linhas que o anotar-escrita.mjs teria acumulado: caminhos
 *               de arquivo, e "!bash-escreveu" para o terminal.
 */
function rodar(foto, escritas = null, extra = {}) {
  const pasta = join(caixa, '.claude', '.sessoes')
  mkdirSync(pasta, { recursive: true })
  rmSync(join(pasta, 'sessao.json'), { force: true })
  rmSync(join(pasta, 'sessao.escritas.txt'), { force: true })
  if (foto !== null) writeFileSync(join(pasta, 'sessao.json'), typeof foto === 'string' ? foto : JSON.stringify(foto))
  if (escritas !== null) writeFileSync(join(pasta, 'sessao.escritas.txt'), escritas.join('\n') + '\n')

  const saida = execFileSync('node', [join(caixa, '.claude', 'hooks', 'fechar-ciclo.mjs')], {
    cwd: caixa,
    input: JSON.stringify({ session_id: 'sessao', ...extra }),
    encoding: 'utf8',
  })
  try {
    const j = JSON.parse(saida || '{}')
    return j.decision || (j.systemMessage ? 'aviso' : 'calado')
  } catch {
    return 'calado'
  }
}

/** Igual ao rodar, mas devolve o texto do bloqueio — para conferir a ressalva. */
function textoDe(foto, escritas) {
  const pasta = join(caixa, '.claude', '.sessoes')
  mkdirSync(pasta, { recursive: true })
  rmSync(join(pasta, 'sessao.escritas.txt'), { force: true })
  writeFileSync(join(pasta, 'sessao.json'), JSON.stringify(foto))
  if (escritas) writeFileSync(join(pasta, 'sessao.escritas.txt'), escritas.join('\n') + '\n')
  const saida = execFileSync('node', [join(caixa, '.claude', 'hooks', 'fechar-ciclo.mjs')], {
    cwd: caixa, input: JSON.stringify({ session_id: 'sessao' }), encoding: 'utf8',
  })
  try { const j = JSON.parse(saida || '{}'); return j.reason || j.systemMessage || '' } catch { return '' }
}

const sujo = () => git('status', '--porcelain').split('\n').filter(Boolean)
const HEAD = () => git('rev-parse', 'HEAD')

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
  const raiz = HEAD()

  const casos = []
  const conferir = (esperado, rotulo, obtido) => casos.push([esperado === obtido, esperado, obtido, rotulo])

  // ======================================================================
  // O que ja funcionava, e precisa continuar funcionando
  // ======================================================================

  // 1. Nada aconteceu.
  conferir('calado', 'sessao que nao mexeu em nada',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz }, []))

  // 2. Mexeu e nao commitou, sem tocar o estado.
  escrever('docs/09-spec-tecnica.md', 'mudou\n')
  conferir('block', 'alterou doc, nao commitou, estado intacto',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz }, ['docs/09-spec-tecnica.md']))

  // 3. Mesma coisa, mas com o estado atualizado junto: so falta registrar.
  escrever('docs/00-estado-atual.md', '# Estado\nnovidade\n')
  conferir('aviso', 'alterou doc E estado, falta commit',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz },
      ['docs/09-spec-tecnica.md', 'docs/00-estado-atual.md']))

  // 4. Commitou tudo, inclusive o estado. Ciclo fechado, sai calado.
  git('add', '-A'); git('commit', '-qm', 'com estado')
  conferir('calado', 'commitou trabalho E estado — ciclo fechado',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz },
      ['docs/09-spec-tecnica.md', 'docs/00-estado-atual.md']))

  // 5. Commitou trabalho relevante SEM tocar o estado. Antes de 26/08 isto
  //    saia calado, porque a arvore fica limpa.
  const antesDoDescuido = HEAD()
  escrever('captura/algo.mjs', 'trabalho relevante\n')
  git('add', '-A'); git('commit', '-qm', 'sem estado')
  conferir('block', 'commitou trabalho relevante sem tocar o estado',
    rodar({ pendenciasNoInicio: [], commitNoInicio: antesDoDescuido }, ['captura/algo.mjs']))

  // 6. Sujeira que ja existia antes da sessao nao e problema desta sessao.
  escrever('docs/rascunho.md', 'de outra sessao\n')
  conferir('calado', 'sujeira herdada de antes da sessao',
    rodar({ pendenciasNoInicio: sujo(), commitNoInicio: HEAD() }, []))

  // 7. Laco infinito nunca: com stop_hook_active ele sai calado sempre.
  conferir('calado', 'stop_hook_active — nunca entra em laco',
    rodar({ pendenciasNoInicio: [], commitNoInicio: raiz },
      ['docs/09-spec-tecnica.md'], { stop_hook_active: true }))

  // ======================================================================
  // Item 1 — a lista de pastas virou lista de exclusao
  // ======================================================================

  // 8. O FURO DE 04/09: pasta de codigo que a lista antiga nao conhecia.
  escrever('services/receptor-callbacks/src/gravar.ts', 'codigo\n')
  conferir('block', 'services/ — pasta que a lista antiga nao enxergava',
    rodar({ pendenciasNoInicio: sujo().filter(l => !l.includes('gravar.ts')), commitNoInicio: HEAD() },
      ['services/receptor-callbacks/src/gravar.ts']))

  // 9. Idem para dados/ e testes/.
  escrever('dados/migracoes/014-nova.sql', 'sql\n')
  escrever('testes/auditoria.test.mjs', 'teste\n')
  conferir('block', 'dados/ e testes/ tambem contam',
    rodar({ pendenciasNoInicio: sujo().filter(l => !/014-nova|auditoria\.test/.test(l)), commitNoInicio: HEAD() },
      ['dados/migracoes/014-nova.sql', 'testes/auditoria.test.mjs']))

  // 10. Mas o descartavel continua descartavel.
  escrever('node_modules/pacote/index.js', 'lixo\n')
  escrever('dist/saida.js', 'lixo\n')
  escrever('depuracao.log', 'lixo\n')
  conferir('calado', 'node_modules, dist e .log nao sao trabalho',
    rodar({ pendenciasNoInicio: sujo().filter(l => !/node_modules|dist|\.log/.test(l)), commitNoInicio: HEAD() },
      ['node_modules/pacote/index.js', 'dist/saida.js', 'depuracao.log']))

  // ======================================================================
  // Item 2 — fotografia ausente parou de significar "sai calado"
  // ======================================================================

  // 11. Sem fotografia, mas com escrita anotada: cobra assim mesmo.
  //     Antes de 04/09 isto saia calado — falha ABRINDO, contra a Regra 5.
  escrever('docs/13-nova-nota.md', 'trabalho sem foto\n')
  conferir('block', 'sem fotografia, mas a sessao escreveu — cobra',
    rodar(null, ['docs/13-nova-nota.md']))

  // 12. Sem fotografia e sem escrita: nao ha o que cobrar de verdade.
  conferir('calado', 'sem fotografia e sem escrita — nada a cobrar',
    rodar(null, null))

  // 13. Fotografia corrompida com a arvore suja: avisa em vez de calar.
  conferir('aviso', 'fotografia ilegivel — avisa que nao deu para verificar',
    rodar('{ isto nao e json', []))

  // ======================================================================
  // Item 3 — a autoria vem do que a sessao escreveu, nao do disco
  // ======================================================================

  // 14. O DEFEITO DE 02/09: outra sessao alterou arquivos enquanto esta so lia.
  //     A sessao de leitura nao pode ser cobrada por trabalho alheio.
  escrever('docs/01-diretrizes-gerais.md', 'alterado por OUTRA sessao\n')
  const fotoAntesDoAlheio = sujo().filter(l => !l.includes('01-diretrizes'))
  conferir('calado', 'sessao que so leu nao paga por trabalho de outra sessao',
    rodar({ pendenciasNoInicio: fotoAntesDoAlheio, commitNoInicio: HEAD() }, []))

  // 15. Mas se a sessao rodou terminal capaz de escrever, a autoria fica
  //     incerta — e incerteza cobra, porque falha fecha.
  conferir('block', 'terminal que escreve deixa a autoria incerta — cobra',
    rodar({ pendenciasNoInicio: fotoAntesDoAlheio, commitNoInicio: HEAD() }, ['!bash-escreveu']))

  // 16. E o texto precisa dizer que a autoria nao esta provada.
  conferir(true, 'o bloqueio incerto avisa que a autoria nao esta provada',
    textoDe({ pendenciasNoInicio: fotoAntesDoAlheio, commitNoInicio: HEAD() }, ['!bash-escreveu'])
      .includes('autoria destes arquivos NAO esta provada'))

  // 17. Autoria provada nao carrega ressalva nenhuma.
  conferir(false, 'o bloqueio provado nao tem ressalva de autoria',
    textoDe({ pendenciasNoInicio: fotoAntesDoAlheio, commitNoInicio: HEAD() }, ['docs/01-diretrizes-gerais.md'])
      .includes('NAO esta provada'))

  // --- resultado ------------------------------------------------------------
  console.log('\nCobrador do estado do projeto\n')
  let falhas = 0
  for (const [passou, esperado, obtido, rotulo] of casos) {
    if (!passou) falhas++
    console.log(`  ${passou ? '  ok  ' : ' FALHA'}  ${String(obtido).padEnd(7)} ${rotulo}${passou ? '' : `   (esperava ${esperado})`}`)
  }
  console.log(falhas ? `\n${falhas} de ${casos.length} falharam.\n` : `\n${casos.length} de ${casos.length} corretos.\n`)
  process.exitCode = falhas ? 1 : 0
} finally {
  rmSync(caixa, { recursive: true, force: true })
}
