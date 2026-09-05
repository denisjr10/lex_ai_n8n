#!/usr/bin/env node
// ==========================================================================
// anotar-escrita.mjs — anota o que ESTA sessao escreveu de fato
//
// Evento: PostToolUse | Ferramentas: Write, Edit, NotebookEdit, Bash, PowerShell
//
// Por que existe: ate 04/09 o fechar-ciclo.mjs adivinhava a autoria comparando
// o `git status` do fim com a fotografia do inicio, e atribuia a esta sessao
// TUDO que tivesse mudado no meio. Num projeto tocado por varias sessoes em
// paralelo — o proprio estado-do-repo.mjs avisa disso no topo de cada sessao —
// essa premissa e falsa.
//
// Aconteceu em 02/09: uma sessao que so LEU arquivos foi barrada e cobrada por
// alteracoes em 01-diretrizes-gerais.md e 14-auditoria-marco-3.md, feitas por
// outra sessao segundos antes. As duas saidas que sobram para a sessao inocente
// sao ruins: inventar uma atualizacao de estado sobre trabalho alheio, ou
// aprender a ignorar o hook. A segunda e a que acontece — e e assim que uma
// barreira morre. Mesma licao ja anotada no guarda-segredo.mjs.
//
// O conserto: parar de adivinhar. O Claude Code sabe quais arquivos foram
// escritos, e este hook anota cada um deles enquanto acontecem.
//
// Formato: um caminho por linha, em modo append (acrescentar ao fim, sem reler
// o arquivo). Append e o que sobrevive a duas ferramentas rodando ao mesmo
// tempo — ler-modificar-gravar um JSON perderia anotacoes na corrida.
// ==========================================================================

import { appendFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, relative, isAbsolute } from 'node:path'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PASTA_SESSOES = join(RAIZ, '.claude', '.sessoes')

// Comando de terminal que pode CRIAR ou ALTERAR arquivo do projeto.
//
// Nao inclui npm, git nem gerenciador de pacote: o que eles escrevem e efeito
// colateral de instalar ou trocar de branch, nao trabalho a ser documentado.
//
// Inclui o redirecionamento (">"), que e como uma sessao em modo automatico
// escreve arquivo pelo terminal — mas NAO o descarte de saida. "2>/dev/null" e
// "2>&1" aparecem em quase todo comando; se contassem como escrita, a marca
// estaria sempre ligada e nao distinguiria mais nada.
export const BASH_ESCREVE = new RegExp(
  '(' +
    '>>?\\s*(?!\\/dev\\/null|\\$null|&\\d|nul\\b)[^\\s|&;]' +   // redirecionamento util
    '|(^|[\\s;|&(])(tee|sed\\s+-i|mv|cp|rm|touch|mkdir)\\b' +   // utilitarios do shell
    '|Set-Content|Out-File|Add-Content|New-Item|Remove-Item|Move-Item|Copy-Item' +
  ')',
  'i',
)

// As unicas ferramentas cujo `file_path` significa escrita.
const FERRAMENTAS_QUE_ESCREVEM = new Set(['Write', 'Edit', 'NotebookEdit'])

// Marcador gravado quando a sessao roda um comando de terminal que escreve.
// Sem o caminho — o terminal nao diz quais arquivos foram tocados — mas o
// fechar-ciclo precisa saber que a possibilidade existiu.
const MARCA_BASH = '!bash-escreveu'

async function lerEntrada() {
  const pedacos = []
  for await (const p of process.stdin) pedacos.push(p)
  try {
    return JSON.parse(Buffer.concat(pedacos).toString('utf8') || '{}')
  } catch {
    return {}
  }
}

/** Caminho relativo a raiz do projeto, com barra normal. Fora do projeto: null. */
function dentroDoProjeto(caminho) {
  if (!caminho) return null
  const absoluto = isAbsolute(caminho) ? caminho : join(RAIZ, caminho)
  const rel = relative(RAIZ, absoluto).replace(/\\/g, '/')
  if (!rel || rel.startsWith('../')) return null
  return rel
}

function anotar(sessao, linha) {
  mkdirSync(PASTA_SESSOES, { recursive: true })
  appendFileSync(join(PASTA_SESSOES, `${sessao}.escritas.txt`), linha + '\n')
}

// Roda o hook so quando o arquivo e EXECUTADO. Importado — pelo arquivo de
// teste, que confere a regra sem copia-la — ele nao le a entrada nem grava
// nada. Copia de regra em teste testa a copia, nao a regra.
const execucaoDireta = process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (execucaoDireta) {
  const entrada = await lerEntrada()
  const sessao = String(entrada.session_id || 'sem-id').replace(/[^A-Za-z0-9_-]/g, '')
  const ferramenta = entrada.tool_name || ''
  const alvo = entrada.tool_input || {}

  try {
    if (ferramenta === 'Bash' || ferramenta === 'PowerShell') {
      if (BASH_ESCREVE.test(String(alvo.command || ''))) anotar(sessao, MARCA_BASH)
    } else if (FERRAMENTAS_QUE_ESCREVEM.has(ferramenta)) {
      // Lista fechada, e nao "toda ferramenta com file_path". Read tambem tem
      // file_path, e leitura nao e escrita: anota-la faria uma sessao de
      // revisao parecer uma sessao de trabalho — exatamente o falso positivo
      // que este hook existe para matar.
      const caminho = dentroDoProjeto(alvo.file_path || alvo.notebook_path)
      if (caminho) anotar(sessao, caminho)
    }
  } catch {
    // Anotar e melhor-esforco. Se falhar, o fechar-ciclo apenas fica com menos
    // certeza sobre a autoria — e ele ja sabe tratar o caso incerto.
  }

  process.exit(0)
}
