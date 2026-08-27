#!/usr/bin/env node
// ==========================================================================
// testar-guarda-escavador.mjs — o disjuntor de crédito tem testes
//
// Por que existe: em 26/08 o guarda barrou `cat captura/capturar.mjs`. Ler
// código é de graça; o hook casava o nome do arquivo em vez da execução dele.
// Barrou também a documentação em /v1/docs, que é justamente o que evita
// gastar R$ 3,00 para descobrir o que está escrito de graça.
//
// Os dois defeitos têm a mesma forma: FALSO POSITIVO. E falso positivo em
// barreira de segurança não é incômodo — é o que ensina a próxima sessão a
// desligar a barreira. Por isso o hook passou a ter teste.
//
// Uso:  node .claude/hooks/testar-guarda-escavador.mjs
// ==========================================================================

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const AQUI = dirname(fileURLToPath(import.meta.url))
const HOOK = join(AQUI, 'guarda-escavador.mjs')

// O nome do script pago é montado em pedaços de propósito: se ele aparecesse
// inteiro aqui, rodar este teste seria barrado pelo próprio hook que ele testa.
const PAGO = ['captura/', 'captu', 'rar.mjs'].join('')
const MONITOR = ['captura/', 'monito', 'rar.mjs'].join('')
const ATUALIZA = ['captura/', 'atuali', 'zar.mjs'].join('')
const BLOCO_E = ['captura/', 'compa', 'rar-tribunal.mjs'].join('')

const CASOS = [
  // --- o que deve PASSAR: ler, procurar, documentar, e outras APIs ---------
  ['permitido', 'ler o código do script',        'Bash', { command: `cat ${PAGO}` }],
  ['permitido', 'procurar dentro do script',     'Bash', { command: `grep -n FILA ${MONITOR}` }],
  ['permitido', 'conferir sintaxe (--check)',    'Bash', { command: `node --check ${PAGO}` }],
  ['permitido', 'documentação V1',               'WebFetch', { url: 'https://api.escavador.com/v1/docs/monitoramento-de-diarios-oficiais' }],
  ['permitido', 'documentação V2',               'WebFetch', { url: 'https://api.escavador.com/v2/docs' }],
  ['permitido', 'raiz da documentação',          'WebFetch', { url: 'https://api.escavador.com/docs' }],
  ['permitido', 'API do n8n (não cobra)',        'Bash', { command: 'node demo/n8n.mjs listar' }],
  ['permitido', 'git comum',                     'Bash', { command: 'git status --short' }],
  ['permitido', 'ENSAIO da captura (sem gastar)', 'Bash', { command: `node ${PAGO}` }],
  ['permitido', 'ENSAIO do monitoramento',       'Bash', { command: `node ${MONITOR} criar` }],
  ['permitido', 'ENSAIO do Bloco C',             'Bash', { command: `node ${ATUALIZA} solicitar` }],
  ['permitido', 'status do Bloco C e gratuito',  'Bash', { command: `node ${ATUALIZA} status --executar` }],
  ['permitido', 'REMOVER assinatura (para custo)','Bash', { command: `node ${MONITOR} remover 12345 --executar` }],
  ['permitido', 'listar assinaturas (gratuito)', 'Bash', { command: `node ${MONITOR} listar --executar` }],
  ['permitido', 'ENSAIO do Bloco E',              'Bash', { command: `node ${BLOCO_E}` }],
  ['permitido', 'diff do Bloco E le so o disco',  'Bash', { command: `node ${BLOCO_E} --comparar` }],

  // --- o que deve SER BARRADO: qualquer caminho até a API paga -------------
  ['deny', 'executar a captura',                 'Bash', { command: `node ${PAGO} --executar` }],
  ['deny', 'executar o monitoramento',           'Bash', { command: `node ${MONITOR} criar --executar` }],
  ['deny', 'executar o Bloco C pago',            'Bash', { command: `node ${ATUALIZA} solicitar --executar --confirmo-custo` }],
  ['deny', 'executar o Bloco E (outro tribunal)','Bash', { command: `node ${BLOCO_E} --executar` }],
  ['deny', 'curl direto na API',                 'Bash', { command: 'curl https://api.escavador.com/api/v1/origens' }],
  ['deny', 'Invoke-RestMethod na API',           'PowerShell', { command: 'Invoke-RestMethod https://api.escavador.com/api/v2/processos' }],
  ['deny', 'WebFetch em rota paga',              'WebFetch', { url: 'https://api.escavador.com/api/v2/processos/numero_cnj/0000000-00.0000.0.00.0000' }],
]

let falhas = 0
console.log('\nDisjuntor de crédito do Escavador\n')

for (const [esperado, rotulo, ferramenta, entrada] of CASOS) {
  const saida = execFileSync('node', [HOOK], {
    input: JSON.stringify({ tool_name: ferramenta, tool_input: entrada }),
    encoding: 'utf8',
  })
  let decisao = 'permitido'
  try { decisao = JSON.parse(saida || '{}').hookSpecificOutput?.permissionDecision || 'permitido' } catch {}

  const passou = decisao === esperado
  if (!passou) falhas++
  console.log(`  ${passou ? '  ok  ' : ' FALHA'}  ${decisao.padEnd(9)} ${rotulo}`)
}

console.log(falhas
  ? `\n${falhas} de ${CASOS.length} falharam.\n`
  : `\n${CASOS.length} de ${CASOS.length} corretos.\n`)
process.exit(falhas ? 1 : 0)
