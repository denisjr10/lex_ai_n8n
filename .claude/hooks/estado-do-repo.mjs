#!/usr/bin/env node
// Hook de SessionStart — injeta no contexto o estado real do repositório.
//
// Por que existe: este projeto é tocado por várias sessões do Claude Code em
// paralelo. Uma sessão que começa (ou que acaba de compactar o contexto) pode
// carregar uma versão dos documentos de dias atrás e editar em cima dela.
// Já aconteceu: em 25/08 uma sessão tinha o orçamento de 21/08 em memória
// enquanto o disco estava em 24/08.
//
// O que ele faz: lê o estado do git e o cabeçalho de docs/00-estado-atual.md,
// que é a memória viva do projeto, e entrega isso pronto no início da sessão.
// Só leitura local, sem rede — não faz fetch, não escreve nada.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const git = (...args) => {
  try {
    return execFileSync('git', ['-C', raiz, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const linhas = []
const add = (t = '') => linhas.push(t)

// --- Git ---------------------------------------------------------------
const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
const commits = git('log', '-6', '--format=%h  %cr  %s')
const sujo = git('status', '--short')
const naoEnviado = git('log', '--oneline', '@{u}..HEAD')

add('## Estado do repositório na abertura desta sessão')
add()
add('> Gerado pelo hook `.claude/hooks/estado-do-repo.mjs`. Este projeto é')
add('> trabalhado por várias sessões em paralelo — o disco pode estar à frente')
add('> do que você tem em contexto. **Leia um arquivo antes de editá-lo.**')
add()
add(`**Branch:** ${branch || '(desconhecida)'}`)
add()

if (commits) {
  add('**Últimos commits:**')
  add('```')
  add(commits)
  add('```')
}

if (naoEnviado) {
  add('⚠️ **Commits locais ainda não enviados ao origin:**')
  add('```')
  add(naoEnviado)
  add('```')
}

if (sujo) {
  add('⚠️ **Alterações não commitadas** — podem ser de outra sessão trabalhando agora:')
  add('```')
  add(sujo)
  add('```')
} else {
  add('Árvore de trabalho limpa.')
}

// --- Documento de estado ----------------------------------------------
// docs/00-estado-atual.md abre com uma tabela de status. É o que o CLAUDE.md
// manda ler primeiro; aqui ele chega sozinho.
try {
  const doc = readFileSync(join(raiz, 'docs', '00-estado-atual.md'), 'utf8').replace(/\r/g, '')
  const cabecalho = doc.split('\n').slice(0, 40)
  const fim = cabecalho.findIndex((l, i) => i > 3 && l.startsWith('> Documento vivo'))
  const trecho = (fim > 0 ? cabecalho.slice(0, fim) : cabecalho.slice(0, 16)).join('\n').trim()

  add()
  add('**Cabeçalho de `docs/00-estado-atual.md`** (a memória do projeto):')
  add()
  add(trecho)
  add()
  add('Leia o documento inteiro antes de trabalhar — este é só o cabeçalho.')
} catch {
  add()
  add('⚠️ Não foi possível ler `docs/00-estado-atual.md`.')
}

const saida = {
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: linhas.join('\n'),
  },
}

process.stdout.write(JSON.stringify(saida))
