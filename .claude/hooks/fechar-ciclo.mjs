#!/usr/bin/env node
// ==========================================================================
// fechar-ciclo.mjs — lembrete de atualizar o estado, commitar e enviar
//
// Evento: Stop (quando o agente termina de responder)
//
// Por que existe: o CLAUDE.md manda, "ao terminar trabalho relevante",
// atualizar docs/00-estado-atual.md, fazer commit em portugues e enviar para
// a branch de trabalho. Os documentos sao a memoria do projeto: trabalho
// feito e nao registrado se perde na proxima sessao.
//
// Como evita ser chato:
//   - so olha o que ESTA sessao mexeu, comparando com a fotografia tirada
//     por contexto-de-sessao.mjs no inicio;
//   - so se importa com as pastas que sao a memoria do projeto;
//   - se ja estiver em um ciclo de bloqueio (stop_hook_active), sai calado,
//     para nunca entrar em laco infinito.
// ==========================================================================

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

// Em true, o hook devolve o lembrete ao agente e o obriga a fechar o ciclo.
// Em false, apenas mostra um aviso ao usuario e nao interrompe nada.
const BLOQUEAR = true

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PASTA_SESSOES = join(RAIZ, '.claude', '.sessoes')
const DOC_ESTADO = 'docs/00-estado-atual.md'

// Mudanca nestas pastas conta como "trabalho relevante".
const RELEVANTE = /^(docs\/|demo\/|captura\/|\.claude\/|CLAUDE\.md|README\.md)/i

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  } catch {
    return ''
  }
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

// Transforma " M docs/00-estado-atual.md" em "docs/00-estado-atual.md".
function caminhoDe(linha) {
  const bruto = linha.slice(3).trim().replace(/^"|"$/g, '')
  const seta = bruto.split(' -> ')
  return (seta[seta.length - 1] || bruto).replace(/\\/g, '/')
}

const entrada = await lerEntrada()

// Ja estamos dentro de um ciclo provocado por este hook: nao insista.
if (entrada.stop_hook_active) process.exit(0)

const agora = git('status', '--porcelain').split('\n').filter(Boolean)
if (agora.length === 0) process.exit(0)

// Sem fotografia do inicio nao da para saber o que e desta sessao. Fica quieto.
let antes = null
try {
  const sessao = String(entrada.session_id || 'sem-id').replace(/[^A-Za-z0-9_-]/g, '')
  antes = new Set(JSON.parse(readFileSync(join(PASTA_SESSOES, `${sessao}.json`), 'utf8')).pendenciasNoInicio)
} catch {
  process.exit(0)
}

const novidades = agora.filter(l => !antes.has(l)).map(caminhoDe).filter(c => RELEVANTE.test(c))
if (novidades.length === 0) process.exit(0)

const caminhosAgora = agora.map(caminhoDe)
const estadoMexido = caminhosAgora.some(c => c.toLowerCase() === DOC_ESTADO)
const lista = novidades.slice(0, 12).map(c => `  - ${c}`).join('\n')
const resto = novidades.length > 12 ? `\n  ...e mais ${novidades.length - 12}` : ''

// Caso 1: o estado ja foi atualizado, so falta registrar. Aviso leve.
if (estadoMexido) {
  process.stdout.write(JSON.stringify({
    systemMessage:
      'Lembrete do fechar-ciclo: docs/00-estado-atual.md ja foi atualizado, mas ' +
      'o trabalho ainda nao foi registrado. Falta commit descritivo em portugues ' +
      'e push para claude/law-firm-ai-automation-6pwaug.',
  }))
  process.exit(0)
}

// Caso 2: mexeu na memoria do projeto e nao atualizou o estado.
const motivo =
  'CICLO ABERTO — o hook fechar-ciclo.mjs interrompeu a parada.\n\n' +
  'Esta sessao alterou arquivos que sao a memoria do projeto, mas ' +
  `${DOC_ESTADO} nao foi atualizado:\n${lista}${resto}\n\n` +
  'O CLAUDE.md diz: "Ao terminar trabalho relevante — atualize docs/00-estado-atual.md, ' +
  'faca commit descritivo em portugues e envie para a branch de trabalho." A conversa ' +
  'nao sobrevive a sessao; o documento sim.\n\n' +
  'Feche o ciclo agora:\n' +
  `  1. atualize ${DOC_ESTADO} (data, fase, o que mudou, proximo passo)\n` +
  '  2. registre em 01-diretrizes-gerais.md as decisoes (D-nn) e riscos (R-nn) novos\n' +
  '  3. commit em portugues e push para claude/law-firm-ai-automation-6pwaug\n\n' +
  'Se a mudanca for mesmo irrelevante (rascunho, teste descartavel), diga isso ao ' +
  'usuario em uma frase e pare — nao ha nada a registrar.'

if (BLOQUEAR) {
  process.stdout.write(JSON.stringify({ decision: 'block', reason: motivo }))
} else {
  process.stdout.write(JSON.stringify({ systemMessage: motivo }))
}
