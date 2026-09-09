#!/usr/bin/env node
// ==========================================================================
// contar.mjs — os números do projeto, contados em vez de escritos à mão
//
// POR QUE ESTE ARQUIVO EXISTE
//
// A revisão de 09/09 encontrou o mesmo defeito em dezessete lugares: um número
// contável guardado à mão em quatro ou cinco documentos, divergindo. A pilha de
// decisões chegou a ter CINCO contagens diferentes, todas datadas do mesmo dia
// (215, 225, 222, 182 e 187 — o disco tinha 231). O cabeçalho do
// 00-estado-atual.md dizia "10 migrações, 45 provas, 92 testes" com 13, 46 e
// 109 no disco, e a própria decomposição não somava. O README dizia 7 e 44.
//
// Corrigir número a número resolve hoje e não resolve em outubro. A causa não é
// desatenção: é que o número mora em vários lugares e ninguém confere se eles
// concordam. Este script move a contagem para UM lugar — o disco — e gera
// `docs/numeros.md` a partir dele. Documento que precise do número aponta para
// lá; nenhum documento o copia.
//
// USO
//   node ferramentas/contar.mjs              mostra a contagem na tela
//   node ferramentas/contar.mjs --json       devolve JSON (para outro programa)
//   node ferramentas/contar.mjs --escrever   regrava docs/numeros.md
//   node ferramentas/contar.mjs --conferir   compara e sai com erro se divergir
//
//   --sem-testes   não roda a suíte (mais rápido; o hook de fim de sessão usa)
//   --com-banco    roda também as provas que exigem PostgreSQL de pé
//
// O QUE ELE NÃO FAZ, DE PROPÓSITO
//
// Ele não estima nada. O que exige banco no ar (provas de regra e de auditoria)
// só é contado com `--com-banco`; sem isso o campo fica NULO e sai como "—" no
// documento. Número que não foi medido não vira número escrito: essa é
// exatamente a doença que este arquivo existe para curar.
// ==========================================================================

import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DOC_NUMEROS = join(RAIZ, 'docs', 'numeros.md')

const argumentos = new Set(process.argv.slice(2))
const querJson = argumentos.has('--json')
const querEscrever = argumentos.has('--escrever')
const querConferir = argumentos.has('--conferir')
const semTestes = argumentos.has('--sem-testes')
const comBanco = argumentos.has('--com-banco')

// --------------------------------------------------------------------------
// Auxiliares
// --------------------------------------------------------------------------

const ler = caminho => {
  try {
    return readFileSync(join(RAIZ, caminho), 'utf8').replace(/\r/g, '')
  } catch {
    return null
  }
}

const listar = (pasta, filtro) => {
  try {
    return readdirSync(join(RAIZ, pasta)).filter(filtro).sort()
  } catch {
    return []
  }
}

/** Roda um comando e devolve a saída, ou `null` se ele falhar.
 *
 *  Devolver `null` em vez de lançar é deliberado: se a suíte não roda porque o
 *  build está velho, o certo é dizer "não medi" e seguir — não é abortar a
 *  contagem inteira nem, pior, gravar um número de antes.
 */
function rodar(comando, args, prazoMs = 120_000) {
  try {
    return execFileSync(comando, args, {
      cwd: RAIZ,
      encoding: 'utf8',
      timeout: prazoMs,
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (e) {
    // Um comando que falha ainda pode ter impresso o que interessa antes de
    // sair — `node --test` sai com código 1 quando há teste falhando, e o
    // sumário "# pass N / # fail N" está lá do mesmo jeito.
    const saida = String(e?.stdout ?? '')
    return saida || null
  }
}

// --------------------------------------------------------------------------
// Contagens que saem de arquivo
// --------------------------------------------------------------------------

function contarMigracoes() {
  return listar('dados/migracoes', a => a.endsWith('.sql')).length
}

/** Tabelas criadas pelas migrações, sem contar a de controle do migrador. */
function contarTabelas() {
  const nomes = new Set()
  for (const arquivo of listar('dados/migracoes', a => a.endsWith('.sql'))) {
    const sql = ler(`dados/migracoes/${arquivo}`) ?? ''
    for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi)) {
      nomes.add(m[1].toLowerCase())
    }
  }
  return { total: nomes.size, nomes: [...nomes].sort() }
}

/** Tabelas cobertas pela política por linha (row level security).
 *
 *  Conta `CREATE POLICY` em todas as migrações, e não só a lista da 010: a
 *  migração 011 criou a `publicacao_envolvido` DEPOIS da 010 e teve de
 *  declarar a política dela por conta própria. Contar só a 010 esconderia
 *  exatamente esse caso — que é o que precisa ser vigiado quando nasce uma
 *  tabela nova.
 */
function contarPoliticas() {
  const alvos = new Set()
  for (const arquivo of listar('dados/migracoes', a => a.endsWith('.sql'))) {
    const sql = ler(`dados/migracoes/${arquivo}`) ?? ''
    for (const m of sql.matchAll(/create\s+policy\s+\S+\s+on\s+([a-z_%0-9$I]+)/gi)) {
      alvos.add(m[1].toLowerCase())
    }
    // A migração 010 cria as políticas dentro de um laço, com o nome da tabela
    // vindo de um vetor. O `CREATE POLICY %1$I` de lá não nomeia tabela
    // nenhuma, então as tabelas vêm do vetor `alvos`.
    const vetor = sql.match(/alvos\s+text\[\]\s*:=\s*ARRAY\[([\s\S]*?)\]/i)
    if (vetor) {
      for (const m of vetor[1].matchAll(/'([a-z_][a-z0-9_]*)'/gi)) alvos.add(m[1].toLowerCase())
    }
  }
  alvos.delete('%1$i')
  return alvos.size
}

/** Documentos escritos em `docs/`.
 *
 *  O `numeros.md` fica de fora porque é gerado por este próprio script — se
 *  entrasse, cada gravação mudaria o número que ela mesma acabou de escrever, e
 *  o `--conferir` acusaria divergência para sempre.
 */
function contarDocumentos() {
  return listar('docs', a => a.endsWith('.md') && a !== 'numeros.md').length
}

/** Os pacotes do monorepo, separando os implementados dos que são casca.
 *
 *  "Casca" é um pacote cujo `src/index.ts` só tem comentário e `export {}` —
 *  o marcador que este projeto usa para um marco ainda não construído. Contar
 *  os dois juntos é o que faz o README dizer "9 pacotes" sem dizer que 5 deles
 *  ainda não têm uma linha executável.
 */
function contarPacotes() {
  const raizTs = ler('tsconfig.json') ?? '{}'
  const caminhos = [...raizTs.matchAll(/"path"\s*:\s*"\.\/([^"]+)"/g)].map(m => m[1])
  let implementados = 0
  const casca = []
  for (const p of caminhos) {
    const fonte = ler(`${p}/src/index.ts`)
    if (fonte === null) continue
    const util = fonte
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'))
      .join('')
    if (util === 'export{}' || util === 'export {}') casca.push(p)
    else implementados++
  }
  return { total: caminhos.length, implementados, casca: casca.length, nomes_casca: casca }
}

/** Decisões da §13, por estado.
 *
 *  A convenção declarada prevê três estados; a tabela usa sete. As linhas cujo
 *  estado não bate com nenhum padrão conhecido vão para `sem_estado_reconhecido`
 *  — e esse campo é o mais útil de todos: enquanto ele não for zero, qualquer
 *  contagem por estado está incompleta, inclusive esta.
 */
function contarDecisoes() {
  const doc = ler('docs/01-diretrizes-gerais.md')
  if (!doc) return null

  const linhas = doc.split('\n')
  const inicio = linhas.findIndex(l => /^##\s+13\./.test(l))
  const fim = linhas.findIndex((l, i) => i > inicio && /^##\s+14\./.test(l))
  if (inicio < 0) return null
  const secao = linhas.slice(inicio, fim > 0 ? fim : undefined)

  // O estado é lido no COMEÇO da última célula, nunca em qualquer posição dela.
  //
  // A diferença não é cosmética. A célula da D-207 abre com "❌ **RECUSADA**" e,
  // trinta palavras adiante, cita a palavra "proposta" no meio de uma frase.
  // Procurando em qualquer posição, ela era contada como 🟡 Proposta — e o erro
  // aparecia como uma decisão recusada de volta na fila de aval. Ancorar no
  // início funciona porque a tabela inteira segue o mesmo formato: marcador,
  // rótulo em negrito, comentário depois.
  const ESTADOS = [
    ['derrubada_ou_recusada', /^(derrubada|recusada)\b/i],
    ['revisada', /^revisada\b/i],
    ['feita', /^feita\b/i],
    ['resolvida', /^resolvida\b/i],
    ['confirmada', /^confirmada\b/i],
    ['em_aberto', /^em\s+aberto\b/i],
    ['proposta', /^proposta\b/i],
  ]

  // Tira marcador, negrito, riscado e espaço da frente, deixando o rótulo nu.
  const rotuloDe = celula =>
    celula
      .replace(/~~/g, '')
      .replace(/\*/g, '')
      .replace(/^[^\p{L}]*/u, '')
      .trim()

  const ids = new Set()
  const duplicados = []
  const porEstado = Object.fromEntries(ESTADOS.map(([nome]) => [nome, 0]))
  let semEstado = 0
  const semEstadoIds = []

  for (const linha of secao) {
    const m = linha.match(/^\|\s*\**\s*(D-\d{1,3})\b/)
    if (!m) continue
    const id = 'D-' + Number(m[1].slice(2))
    if (ids.has(id)) duplicados.push(id)
    ids.add(id)

    // O estado é a última célula da linha da tabela.
    const celulas = linha.split('|').map(c => c.trim()).filter(Boolean)
    const estado = rotuloDe(celulas[celulas.length - 1] ?? '')
    const achado = ESTADOS.find(([, re]) => re.test(estado))
    if (achado) porEstado[achado[0]]++
    else { semEstado++; semEstadoIds.push(id) }
  }

  // Buraco de numeração: D-01 até o maior id, quais faltam.
  const numeros = [...ids].map(i => Number(i.slice(2))).sort((a, b) => a - b)
  const maior = numeros[numeros.length - 1] ?? 0
  const faltando = []
  for (let n = 1; n <= maior; n++) if (!ids.has('D-' + n)) faltando.push('D-' + n)

  return {
    total: ids.size,
    maior_id: maior,
    por_estado: porEstado,
    sem_estado_reconhecido: semEstado,
    ids_sem_estado: semEstadoIds,
    duplicados,
    faltando,
  }
}

/** Riscos da §15: total, maior id e buracos. */
function contarRiscos() {
  const doc = ler('docs/01-diretrizes-gerais.md')
  if (!doc) return null
  const linhas = doc.split('\n')
  const inicio = linhas.findIndex(l => /^##\s+15\./.test(l))
  const fim = linhas.findIndex((l, i) => i > inicio && /^##\s+16\./.test(l))
  if (inicio < 0) return null

  const ids = new Set()
  const duplicados = []
  for (const linha of linhas.slice(inicio, fim > 0 ? fim : undefined)) {
    const m = linha.match(/^\|\s*~*\**\s*(R-\d{1,3})\b/)
    if (!m) continue
    const id = 'R-' + Number(m[1].slice(2))
    if (ids.has(id)) duplicados.push(id)
    ids.add(id)
  }
  const numeros = [...ids].map(i => Number(i.slice(2))).sort((a, b) => a - b)
  const maior = numeros[numeros.length - 1] ?? 0
  const faltando = []
  for (let n = 1; n <= maior; n++) if (!ids.has('R-' + n)) faltando.push('R-' + n)
  return { total: ids.size, maior_id: maior, duplicados, faltando }
}

/** Requisitos do PRD: identificadores distintos, não linhas de tabela. */
function contarRequisitos() {
  const prd = ler('docs/08-prd.md')
  if (!prd) return null
  const rf = new Set([...prd.matchAll(/\bRF-(\d{1,3})\b/g)].map(m => Number(m[1])))
  const rnf = new Set([...prd.matchAll(/\bRNF-(\d{1,3})\b/g)].map(m => Number(m[1])))
  return { rf: rf.size, rnf: rnf.size }
}

/** Linhas de código, por linguagem.
 *
 *  Conta o que está versionado E o que ainda não foi commitado mas entraria no
 *  Git (`--others --exclude-standard` traz os arquivos novos e respeita o
 *  `.gitignore`). Um `git ls-files` puro contaria só o que já está rastreado —
 *  e aí um arquivo novo só apareceria na contagem DEPOIS do commit, deixando o
 *  `numeros.md` sempre um commit atrasado a cada arquivo criado.
 *
 *  Não é hipótese: aconteceu neste mesmo arquivo. Ele foi criado, o documento
 *  foi gerado sem contá-lo, e o `fechar-ciclo.mjs` bloqueou a sessão logo
 *  depois do commit acusando 549 linhas de diferença — que era o tamanho do
 *  próprio contador. A barreira funcionou; o que ela pegou foi um defeito dela.
 */
function contarLinhas() {
  const saida = rodar('git', ['ls-files', '--cached', '--others', '--exclude-standard'], 20_000)
  if (!saida) return null
  const conta = { ts: 0, sql: 0, mjs: 0 }
  for (const arquivo of saida.split('\n').filter(Boolean)) {
    const alvo =
      arquivo.endsWith('.ts') && !arquivo.endsWith('.d.ts') ? 'ts'
      : arquivo.endsWith('.sql') ? 'sql'
      : arquivo.endsWith('.mjs') ? 'mjs'
      : null
    if (!alvo) continue
    const conteudo = ler(arquivo)
    if (conteudo !== null) conta[alvo] += conteudo.split('\n').length
  }
  return conta
}

// --------------------------------------------------------------------------
// Contagens que precisam executar alguma coisa
// --------------------------------------------------------------------------

/** Testes: sai do sumário do próprio `node --test`, nunca de contagem de texto.
 *
 *  Tentei contar as chamadas `test(` por leitura e deu 87 contra 109 reais —
 *  subtestes e testes declarados dentro de laço não aparecem. Número contado
 *  errado é pior do que número ausente, porque parece medido.
 */
function contarTestes() {
  if (semTestes) return null
  const saida = rodar('node', ['--test', 'testes/**/*.test.mjs'], 180_000)
  if (!saida) return null
  const passou = saida.match(/^#\s*pass\s+(\d+)/m)
  const falhou = saida.match(/^#\s*fail\s+(\d+)/m)
  if (!passou) return null
  return { passando: Number(passou[1]), falhando: falhou ? Number(falhou[1]) : 0 }
}

/** Provas que exigem PostgreSQL de pé. Sem `--com-banco`, ficam nulas. */
function contarProvasComBanco() {
  if (!comBanco) return { regra: null, auditoria: null }
  const extrair = saida => {
    if (!saida) return null
    // As duas ferramentas fecham com uma linha do tipo "46 de 46".
    const todas = [...saida.matchAll(/(\d+)\s*de\s*(\d+)/g)]
    const ultima = todas[todas.length - 1]
    return ultima ? { passando: Number(ultima[1]), total: Number(ultima[2]) } : null
  }
  return {
    regra: extrair(rodar('node', ['ferramentas/banco/conferir-regras.mjs'], 180_000)),
    auditoria: extrair(rodar('node', ['ferramentas/banco/conferir-auditoria.mjs'], 180_000)),
  }
}

// --------------------------------------------------------------------------
// Montagem
// --------------------------------------------------------------------------

const tabelas = contarTabelas()
const numeros = {
  migracoes: contarMigracoes(),
  tabelas: tabelas.total,
  tabelas_com_politica_por_linha: contarPoliticas(),
  documentos: contarDocumentos(),
  pacotes: contarPacotes(),
  testes: contarTestes(),
  provas: contarProvasComBanco(),
  decisoes: contarDecisoes(),
  riscos: contarRiscos(),
  requisitos: contarRequisitos(),
  linhas: contarLinhas(),
}

// --------------------------------------------------------------------------
// Saída
// --------------------------------------------------------------------------

const ou = (v, vazio = '—') => (v === null || v === undefined ? vazio : v)

function montarDocumento(n) {
  const d = n.decisoes
  const l = []
  l.push('# Números do projeto')
  l.push('')
  l.push('| Campo | Valor |')
  l.push('|---|---|')
  l.push('| Origem | **Gerado por `ferramentas/contar.mjs`** — não edite à mão |')
  l.push('| Como refazer | `node ferramentas/contar.mjs --escrever` |')
  l.push('| Como conferir | `node ferramentas/contar.mjs --conferir` (o `fechar-ciclo.mjs` e a CI rodam sozinhos) |')
  l.push('')
  l.push('> **Este arquivo é a sede única dos números contáveis do projeto.**')
  l.push('> Documento que precise de um número aponta para cá; nenhum documento o copia.')
  l.push('> A regra nasceu da revisão de 09/09, que achou cinco contagens diferentes da')
  l.push('> pilha de decisões — todas datadas do mesmo dia, nenhuma igual ao disco.')
  l.push('>')
  l.push('> Campo com `—` é campo **não medido**, não campo zerado. Provas de banco')
  l.push('> exigem `--com-banco` (PostgreSQL de pé); testes exigem o build em dia.')
  l.push('')
  l.push('## Código e banco')
  l.push('')
  l.push('| O quê | Quanto |')
  l.push('|---|---|')
  l.push(`| Migrações SQL | **${n.migracoes}** |`)
  l.push(`| Tabelas criadas | **${n.tabelas}** |`)
  l.push(`| Tabelas com política por linha | **${n.tabelas_com_politica_por_linha}** de ${n.tabelas} |`)
  l.push(`| Pacotes do monorepo | **${n.pacotes.total}** — ${n.pacotes.implementados} implementados, ${n.pacotes.casca} ainda casca |`)
  l.push(`| Testes passando | **${ou(n.testes && n.testes.passando)}**${n.testes && n.testes.falhando ? ` · ⚠️ ${n.testes.falhando} falhando` : ''} |`)
  l.push(`| Provas de regra (exige banco) | **${ou(n.provas.regra && `${n.provas.regra.passando} de ${n.provas.regra.total}`)}** |`)
  l.push(`| Provas de auditoria (exige banco) | **${ou(n.provas.auditoria && `${n.provas.auditoria.passando} de ${n.provas.auditoria.total}`)}** |`)
  if (n.linhas) {
    l.push(`| Linhas versionadas | TypeScript ${n.linhas.ts} · SQL ${n.linhas.sql} · Node ${n.linhas.mjs} |`)
  }
  if (n.pacotes.casca > 0) {
    l.push('')
    l.push(`**Pacotes ainda sem uma linha executável:** ${n.pacotes.nomes_casca.map(p => `\`${p}\``).join(' · ')}.`)
  }
  l.push('')
  l.push('## Documentação')
  l.push('')
  l.push('| O quê | Quanto |')
  l.push('|---|---|')
  l.push(`| Documentos escritos em \`docs/\` | **${n.documentos}** — sem contar este, que é gerado |`)
  if (n.requisitos) {
    l.push(`| Requisitos funcionais (RF) | **${n.requisitos.rf}** |`)
    l.push(`| Requisitos não funcionais (RNF) | **${n.requisitos.rnf}** |`)
  }
  if (n.riscos) {
    l.push(`| Riscos registrados (§15) | **${n.riscos.total}** — o maior é R-${n.riscos.maior_id} |`)
  }
  l.push('')
  if (d) {
    l.push('## Decisões (§13 de `01-diretrizes-gerais.md`)')
    l.push('')
    l.push(`**${d.total} linhas**, e o maior identificador é D-${d.maior_id}.`)
    l.push('')
    l.push('| Estado | Quantas |')
    l.push('|---|---|')
    const rotulos = {
      proposta: '🟡 Proposta',
      confirmada: '✅ Confirmada',
      resolvida: '✅ Resolvida',
      em_aberto: '🔴 Em aberto',
      derrubada_ou_recusada: '❌ Derrubada / Recusada',
      revisada: '🔄 Revisada',
      feita: '✅ Feita',
    }
    let soma = 0
    for (const [chave, rotulo] of Object.entries(rotulos)) {
      const v = d.por_estado[chave] ?? 0
      soma += v
      if (v > 0) l.push(`| ${rotulo} | **${v}** |`)
    }
    if (d.sem_estado_reconhecido > 0) {
      l.push(`| ⚠️ Sem estado reconhecido | **${d.sem_estado_reconhecido}** |`)
      soma += d.sem_estado_reconhecido
    }
    l.push(`| **Total** | **${soma}** |`)
    l.push('')
    if (d.sem_estado_reconhecido > 0) {
      l.push(`⚠️ **${d.sem_estado_reconhecido} linha(s) com estado fora da convenção:** ${d.ids_sem_estado.join(', ')}.`)
      l.push('Enquanto esse número não for zero, nenhuma contagem por estado está completa — inclusive esta.')
      l.push('')
    }
    if (d.duplicados.length) {
      l.push(`🔴 **Identificador repetido:** ${d.duplicados.join(', ')}.`)
      l.push('')
    }
    if (d.faltando.length) {
      l.push(`⚠️ **Buraco na numeração:** ${d.faltando.join(', ')}.`)
      l.push('')
    }
  }
  if (n.riscos && (n.riscos.duplicados.length || n.riscos.faltando.length)) {
    l.push('## Alertas nos riscos')
    l.push('')
    if (n.riscos.duplicados.length) l.push(`🔴 **Identificador repetido:** ${n.riscos.duplicados.join(', ')}.`)
    if (n.riscos.faltando.length) l.push(`⚠️ **Buraco na numeração:** ${n.riscos.faltando.join(', ')}.`)
    l.push('')
  }
  return l.join('\n') + '\n'
}

function mostrarNaTela(n) {
  const d = n.decisoes
  const p = (rotulo, valor) => console.log(`  ${rotulo.padEnd(34)} ${valor}`)
  console.log('\nNúmeros do projeto — contados do disco\n')
  p('migrações', n.migracoes)
  p('tabelas', n.tabelas)
  p('tabelas com política por linha', `${n.tabelas_com_politica_por_linha} de ${n.tabelas}`)
  p('pacotes', `${n.pacotes.total} (${n.pacotes.implementados} implementados, ${n.pacotes.casca} casca)`)
  p('testes passando', ou(n.testes && n.testes.passando, '— (use sem --sem-testes)'))
  p('provas de regra', ou(n.provas.regra && `${n.provas.regra.passando} de ${n.provas.regra.total}`, '— (use --com-banco)'))
  p('provas de auditoria', ou(n.provas.auditoria && `${n.provas.auditoria.passando} de ${n.provas.auditoria.total}`, '— (use --com-banco)'))
  p('documentos', n.documentos)
  if (n.requisitos) p('requisitos', `RF ${n.requisitos.rf} · RNF ${n.requisitos.rnf}`)
  if (n.riscos) p('riscos', `${n.riscos.total} (maior: R-${n.riscos.maior_id})`)
  if (d) {
    p('decisões', `${d.total} (maior: D-${d.maior_id})`)
    for (const [k, v] of Object.entries(d.por_estado)) if (v) p(`  ${k}`, v)
    if (d.sem_estado_reconhecido) p('  ⚠️ sem estado reconhecido', `${d.sem_estado_reconhecido} — ${d.ids_sem_estado.join(', ')}`)
    if (d.duplicados.length) p('  🔴 repetidos', d.duplicados.join(', '))
    if (d.faltando.length) p('  ⚠️ buracos', d.faltando.join(', '))
  }
  if (n.linhas) p('linhas versionadas', `TS ${n.linhas.ts} · SQL ${n.linhas.sql} · Node ${n.linhas.mjs}`)
  console.log('')
}

if (querJson) {
  console.log(JSON.stringify(numeros, null, 2))
} else if (querEscrever) {
  writeFileSync(DOC_NUMEROS, montarDocumento(numeros), 'utf8')
  console.log('docs/numeros.md regravado.')
  mostrarNaTela(numeros)
} else if (querConferir) {
  const novo = montarDocumento(numeros)
  const atual = existsSync(DOC_NUMEROS) ? readFileSync(DOC_NUMEROS, 'utf8').replace(/\r/g, '') : null

  if (atual === null) {
    console.error('docs/numeros.md não existe. Rode: node ferramentas/contar.mjs --escrever')
    process.exit(1)
  }

  // Compara linha a linha, e ignora a linha em que QUALQUER UM DOS DOIS LADOS
  // esteja com `—`, que é como este arquivo escreve "não medido".
  //
  // Os dois lados, e não só um. O lado gerado cobre o caso óbvio: rodar com
  // `--sem-testes` não pode acusar divergência contra um documento gerado com
  // os testes medidos. O lado gravado cobre o inverso, que é menos óbvio e
  // igualmente real: quem regravar o arquivo numa máquina sem Docker deixa as
  // provas de banco como `—`, e a execução seguinte — com banco de pé — mediria
  // "46 de 46" contra um travessão e apontaria uma divergência que não existe.
  //
  // Nos dois casos o certo é a mesma coisa: onde não houve medição, não há
  // afirmação a conferir. O que garante as provas de banco não é esta
  // comparação, é o `npm run verificar` — que falha por si só quando elas falham.
  const linhasNovas = novo.split('\n')
  const linhasAtuais = atual.split('\n')
  const divergentes = []
  const total = Math.max(linhasNovas.length, linhasAtuais.length)
  for (let i = 0; i < total; i++) {
    const a = linhasNovas[i] ?? ''
    const b = linhasAtuais[i] ?? ''
    if (a === b) continue
    if (a.includes('—') || b.includes('—')) continue
    divergentes.push({ linha: i + 1, gerado: a.trim(), gravado: b.trim() })
  }

  if (divergentes.length === 0) {
    console.log('docs/numeros.md está em dia.')
    process.exit(0)
  }

  console.error('docs/numeros.md está DESATUALIZADO. O disco mudou e o documento não:\n')
  for (const dif of divergentes.slice(0, 12)) {
    console.error(`  linha ${dif.linha}`)
    console.error(`    gravado: ${dif.gravado || '(vazio)'}`)
    console.error(`    disco:   ${dif.gerado || '(vazio)'}`)
  }
  if (divergentes.length > 12) console.error(`  ...e mais ${divergentes.length - 12} linha(s)`)
  console.error('\nCorrija com: node ferramentas/contar.mjs --escrever')
  process.exit(1)
} else {
  mostrarNaTela(numeros)
}
