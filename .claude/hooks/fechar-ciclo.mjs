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
//   - cobra pelo que esta sessao PROVADAMENTE escreveu, anotado pelo
//     anotar-escrita.mjs enquanto acontecia — nao pelo que apareceu no disco;
//   - dispensa o que e descartavel por natureza (build, log, node_modules);
//   - se ja estiver em um ciclo de bloqueio (stop_hook_active), sai calado,
//     para nunca entrar em laco infinito.
// ==========================================================================

import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

// Em true, o hook devolve o lembrete ao agente e o obriga a fechar o ciclo.
// Em false, apenas mostra um aviso ao usuario e nao interrompe nada.
const BLOQUEAR = true

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PASTA_SESSOES = join(RAIZ, '.claude', '.sessoes')
const DOC_ESTADO = 'docs/00-estado-atual.md'

/** O que NAO conta como trabalho a documentar.
 *
 *  Ate 04/09 aqui havia o contrario: uma lista das pastas que contavam —
 *  docs/, demo/, captura/, .claude/. Ela foi escrita em 25/08, quando o
 *  projeto ainda era so documentos, e nunca foi atualizada. Quando o codigo
 *  chegou, services/, dados/, testes/ e ferramentas/ nasceram invisiveis:
 *  medido em 04/09, o hook nao enxergava 13 dos 24 arquivos dos ultimos dez
 *  commits. Uma sessao inteira construindo o receptor de callbacks parava em
 *  silencio.
 *
 *  A logica esta invertida de proposito. Com lista de inclusao, cada pasta
 *  nova nasce cega e alguem precisa lembrar de cadastra-la — e ninguem
 *  lembrou por dez dias. Com lista de exclusao, a pasta nova ja nasce coberta,
 *  e o esquecimento passa a errar para o lado seguro.
 */
const IRRELEVANTE = [
  /^\.claude\/\.sessoes\//i,                  // fotografias e anotacoes de sessao
  /(^|\/)node_modules\//i,
  /(^|\/)(dist|build|out|coverage|\.next|\.turbo)\//i,
  /(^|\/)(tmp|temp)\//i,
  /\.log$/i,
  /(^|\/)\.DS_Store$/i,
  /(^|\/)Thumbs\.db$/i,
  /\.local(\.|$|\/)/i,                        // fora do Git de qualquer forma
]

const relevante = caminho => !IRRELEVANTE.some(re => re.test(caminho))

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  } catch {
    return ''
  }
}

/** `git status --porcelain` SEM trim, e por um motivo especifico.
 *
 *  O formato e "XY caminho", com X e Y ocupando uma coluna cada. Arquivo
 *  apenas modificado sai como " M caminho" — com espaco na primeira coluna.
 *  Um .trim() na saida inteira come esse espaco na PRIMEIRA linha, e ai o
 *  slice(3) de caminhoDe() corta um caractere a mais: " M docs/00-estado.md"
 *  virava "ocs/00-estado.md".
 *
 *  O efeito pratico era um falso positivo: se o 00-estado-atual.md fosse a
 *  primeira linha do status, o hook nao o reconhecia e bloqueava a parada
 *  mesmo com o documento devidamente atualizado. Defeito encontrado em 26/08.
 */
function statusPorcelain() {
  try {
    return execFileSync('git', ['status', '--porcelain'], {
      cwd: RAIZ, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    }).split('\n').filter(Boolean)
  } catch {
    return []
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

function responder(objeto) {
  process.stdout.write(JSON.stringify(objeto))
  process.exit(0)
}

/** Os numeros do projeto batem com o disco?
 *
 *  Devolve o texto do aviso quando `docs/numeros.md` esta velho, ou `null`.
 *
 *  POR QUE ESTA CONFERENCIA EXISTE. A revisao de 09/09 achou o mesmo defeito em
 *  dezessete lugares: numero contavel guardado a mao em varios documentos,
 *  divergindo. A pilha de decisoes chegou a ter CINCO contagens diferentes,
 *  todas datadas do mesmo dia. O `contar.mjs` moveu a contagem para o disco; a
 *  conferencia aqui e o que impede o documento gerado de envelhecer de novo.
 *
 *  POR QUE ELE COBRA MESMO DE QUEM NAO CAUSOU. O resto deste hook toma o
 *  cuidado de nao cobrar uma sessao por trabalho alheio — inventar estado sobre
 *  o que outra sessao fez e pior que nao registrar nada. Aqui a preocupacao nao
 *  se aplica: nao ha nada a inventar. A correcao e um comando so, mecanico, e
 *  vale igual venha de onde vier a mudanca.
 *
 *  POR QUE ELE FALHA ABERTO. Se o proprio `contar.mjs` sumir ou quebrar, o hook
 *  avisa e deixa passar, em vez de travar toda parada de sessao ate alguem
 *  consertar o contador. E uma excecao consciente a Regra 5: o que esta em jogo
 *  aqui e a frescura de um numero, nao dinheiro nem privilegio, e uma barreira
 *  que trava o trabalho por defeito proprio e uma barreira que vai ser
 *  desligada.
 */
function conferirNumeros() {
  if (!existsSync(join(RAIZ, 'ferramentas', 'contar.mjs'))) return null
  try {
    execFileSync('node', ['ferramentas/contar.mjs', '--conferir', '--sem-testes'], {
      cwd: RAIZ, encoding: 'utf8', timeout: 20_000, stdio: ['ignore', 'pipe', 'pipe'],
    })
    return null
  } catch (e) {
    // Codigo 1 e o contador dizendo "divergiu", e a explicacao vem no stderr.
    // Qualquer outra falha (node ausente, prazo estourado) nao acusa nada.
    if (e?.status !== 1) return null
    const detalhe = String(e?.stderr ?? '').trim()
    return (
      'OS NUMEROS DO PROJETO NAO BATEM COM O DISCO.\n\n' +
      detalhe +
      '\n\nIsto e conferido aqui porque o defeito mais repetido deste projeto e ' +
      'numero escrito a mao que envelhece: em 09/09 a pilha de decisoes tinha ' +
      'cinco contagens diferentes, todas do mesmo dia, e nenhuma igual ao disco.\n\n' +
      'A correcao e mecanica e nao depende de saber o que mudou:\n' +
      '  node ferramentas/contar.mjs --escrever\n\n' +
      'Se a mudanca no disco foi de outra sessao, regravar mesmo assim esta ' +
      'certo — o arquivo e gerado, nao ha estado alheio a inventar.'
    )
  }
}

const entrada = await lerEntrada()

// Ja estamos dentro de um ciclo provocado por este hook: nao insista.
if (entrada.stop_hook_active) process.exit(0)

const avisoNumeros = conferirNumeros()

const sessao = String(entrada.session_id || 'sem-id').replace(/[^A-Za-z0-9_-]/g, '')
const agora = statusPorcelain()

// --- Fotografia do inicio da sessao ---------------------------------------
// Ate 04/09, fotografia ausente fazia o hook sair calado. Isso e falha ABRINDO,
// o oposto da Regra 5 do projeto ("negar por padrao, e falha fecha"): bastava a
// foto sumir para a cobranca desaparecer junto.
//
// Agora ausencia e ilegibilidade sao coisas diferentes:
//   - ausente: a sessao nao comecou pelo SessionStart. Nao ha o que comparar,
//     mas as anotacoes de escrita abaixo continuam valendo — e sao a fonte
//     principal. Se a sessao escreveu, ele cobra mesmo sem foto.
//   - ilegivel: o arquivo existe e esta corrompido. Ai nao da para afirmar
//     nada, e o hook avisa em vez de calar.
let pendenciasNoInicio = null
let commitNoInicio = null
let fotoIlegivel = false
const caminhoFoto = join(PASTA_SESSOES, `${sessao}.json`)
if (existsSync(caminhoFoto)) {
  try {
    const foto = JSON.parse(readFileSync(caminhoFoto, 'utf8'))
    pendenciasNoInicio = new Set(foto.pendenciasNoInicio || [])
    commitNoInicio = foto.commitNoInicio || null
  } catch {
    fotoIlegivel = true
  }
}

// --- O que esta sessao ESCREVEU, anotado enquanto acontecia ----------------
// Fonte de verdade da autoria. Ver anotar-escrita.mjs.
let escritos = new Set()
let bashEscreveu = false
const caminhoEscritas = join(PASTA_SESSOES, `${sessao}.escritas.txt`)
if (existsSync(caminhoEscritas)) {
  try {
    for (const linha of readFileSync(caminhoEscritas, 'utf8').split('\n')) {
      const l = linha.trim()
      if (!l) continue
      if (l === '!bash-escreveu') bashEscreveu = true
      else escritos.add(l)
    }
  } catch {
    fotoIlegivel = true
  }
}

// --- O que mudou no disco -------------------------------------------------
const porCommitar = pendenciasNoInicio
  ? agora.filter(l => !pendenciasNoInicio.has(l)).map(caminhoDe)
  : []

// O commit em que a sessao comecou. Sem ele, o hook so enxerga o que esta por
// commitar — e uma sessao que commita antes de parar passa batida, com a
// arvore limpa e o estado desatualizado. Aconteceu em 26/08.
let jaCommitado = []
if (commitNoInicio) {
  const saida = git('diff', '--name-only', `${commitNoInicio}..HEAD`)
  jaCommitado = saida ? saida.split('\n').filter(Boolean).map(c => c.replace(/\\/g, '/')) : []
}

const mexidos = [...new Set([...porCommitar, ...jaCommitado, ...escritos])]

// --- Autoria: o que e meu, o que e de outra sessao ------------------------
// Ate 04/09 o hook atribuia a esta sessao TUDO que mudasse entre o inicio e o
// fim. Em 02/09 isso barrou uma sessao que so LEU arquivos, cobrando-a por
// alteracoes que outra sessao fizera segundos antes. A sessao inocente fica
// com duas saidas ruins: inventar uma atualizacao sobre trabalho alheio, ou
// aprender a ignorar o hook. A segunda e a que acontece — e e assim que uma
// barreira morre.
const certos = mexidos.filter(c => escritos.has(c) && relevante(c))
const incertos = mexidos.filter(c => !escritos.has(c) && relevante(c))

// Foto corrompida com a arvore suja: nao da para afirmar nada. Avisa.
if (fotoIlegivel && agora.length > 0) {
  responder({
    systemMessage:
      'O fechar-ciclo nao conseguiu verificar esta sessao: o registro em ' +
      `.claude/.sessoes/${sessao} esta ilegivel. Ha alteracoes na arvore de ` +
      `trabalho — confira a mao se ${DOC_ESTADO} precisa ser atualizado.`,
  })
}

/** Sai calado — a menos que os numeros estejam velhos, que e cobranca propria. */
function sairSalvoNumeros() {
  if (!avisoNumeros) process.exit(0)
  responder(BLOQUEAR
    ? { decision: 'block', reason: avisoNumeros }
    : { systemMessage: avisoNumeros })
}

// Nada provado como meu. Ou nao houve trabalho, ou foi de outra sessao.
if (certos.length === 0) {
  // Sem nada incerto, ou sem terminal que escreva: nao foi esta sessao.
  if (incertos.length === 0 || !bashEscreveu) sairSalvoNumeros()
}

const incerto = certos.length === 0
const novidades = incerto ? incertos : certos

// O estado conta como atualizado se foi tocado de qualquer forma.
const estadoMexido = mexidos.some(c => c.toLowerCase() === DOC_ESTADO)

// Nada por commitar e o estado ja registrado: o ciclo fechou. Sai calado.
if (agora.length === 0 && estadoMexido) sairSalvoNumeros()

const lista = novidades.slice(0, 12).map(c => `  - ${c}`).join('\n')
const resto = novidades.length > 12 ? `\n  ...e mais ${novidades.length - 12}` : ''

// Caso 1: o estado ja foi atualizado, so falta registrar. Aviso leve.
if (estadoMexido) {
  responder({
    systemMessage:
      'Lembrete do fechar-ciclo: docs/00-estado-atual.md ja foi atualizado, mas ' +
      'o trabalho ainda nao foi registrado. Falta commit descritivo em portugues ' +
      'e push para claude/law-firm-ai-automation-6pwaug.' +
      (avisoNumeros ? `\n\n${avisoNumeros}` : ''),
  })
}

// Caso 2: mexeu na memoria do projeto e nao atualizou o estado.
const ressalva = incerto
  ? '\n\nATENCAO — a autoria destes arquivos NAO esta provada. Esta sessao rodou ' +
    'comando de terminal capaz de escrever, mas nenhum destes arquivos foi ' +
    'escrito pelas ferramentas de edicao. Pode ser trabalho de outra sessao ' +
    'rodando em paralelo. Confira antes de documentar: se nao foi voce, diga ' +
    'isso ao usuario em uma frase e pare — nao invente estado sobre trabalho alheio.'
  : ''

const motivo =
  'CICLO ABERTO — o hook fechar-ciclo.mjs interrompeu a parada.\n\n' +
  'Esta sessao alterou arquivos que sao a memoria do projeto, mas ' +
  `${DOC_ESTADO} nao foi atualizado:\n${lista}${resto}` + ressalva + '\n\n' +
  'O CLAUDE.md diz: "Ao terminar trabalho relevante — atualize docs/00-estado-atual.md, ' +
  'faca commit descritivo em portugues e envie para a branch de trabalho." A conversa ' +
  'nao sobrevive a sessao; o documento sim.\n\n' +
  'Feche o ciclo agora:\n' +
  `  1. atualize ${DOC_ESTADO} (data, fase, o que mudou, proximo passo)\n` +
  '  2. registre em 01-diretrizes-gerais.md as decisoes (D-nn) e riscos (R-nn) novos\n' +
  '  3. commit em portugues e push para claude/law-firm-ai-automation-6pwaug\n\n' +
  'Se a mudanca for mesmo irrelevante (rascunho, teste descartavel), diga isso ao ' +
  'usuario em uma frase e pare — nao ha nada a registrar.'

const textoFinal = motivo + (avisoNumeros ? `\n\n---\n\n${avisoNumeros}` : '')

responder(BLOQUEAR ? { decision: 'block', reason: textoFinal } : { systemMessage: textoFinal })
