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
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
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

// --- Fotografia da árvore de trabalho ----------------------------------
// O hook fechar-ciclo.mjs (evento Stop) precisa distinguir o que ESTA sessão
// alterou do que já estava pendente antes dela começar. Como o projeto é
// tocado por várias sessões em paralelo, a foto é guardada por session_id.
try {
  const pedacos = []
  if (!process.stdin.isTTY) for await (const p of process.stdin) pedacos.push(p)
  const entrada = JSON.parse(Buffer.concat(pedacos).toString('utf8') || '{}')
  const sessao = String(entrada.session_id || 'sem-id').replace(/[^A-Za-z0-9_-]/g, '')
  mkdirSync(join(raiz, '.claude', '.sessoes'), { recursive: true })
  writeFileSync(
    join(raiz, '.claude', '.sessoes', `${sessao}.json`),
    JSON.stringify({ pendenciasNoInicio: git('status', '--porcelain').split('\n').filter(Boolean) }),
  )
} catch {
  // Fotografar é um luxo. Se falhar, a sessão segue normalmente e o
  // fechar-ciclo apenas fica calado.
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

// --- Orçamento do Escavador -------------------------------------------
// Regra 8 do CLAUDE.md. Fica no topo do contexto porque é a única coisa
// deste projeto cujo erro custa dinheiro e não se desfaz.
add('**Orçamento do Escavador — leia antes de qualquer chamada à API:**')
add('cota de teste de R$ 50,00, **R$ 3,00 por requisição** (qualquer rota, não')
add('existe rota gratuita), teto de 16 requisições, painel exibindo validade até')
add('01/09/2026, sem recarga contratada. Toda chamada precisa constar de')
add('`docs/06-orcamento-de-chamadas-escavador.md`. O hook `guarda-escavador.mjs`')
add('bloqueia em código as que não constam — se ele barrar, pare e pergunte ao')
add('usuário em vez de contornar.')
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
