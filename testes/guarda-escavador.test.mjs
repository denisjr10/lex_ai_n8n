/**
 * O disjuntor de crédito — a Regra 8 como barreira, não como lembrete
 * ---------------------------------------------------------------------------
 * `guarda-escavador.mjs` roda como hook `PreToolUse`: recebe o comando pelo
 * stdin em JSON e devolve `deny` quando o comando pode debitar crédito.
 *
 * O hook nunca tinha teste, e foi assim que o furo do encadeamento sobreviveu:
 * as expressões eram avaliadas contra o comando INTEIRO, então uma operação
 * gratuita no começo liberava a paga do outro lado do `&&`.
 *
 * Cada caso abaixo é um comando de verdade, julgado pelo hook de verdade.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOOK = path.join(RAIZ, '.claude', 'hooks', 'guarda-escavador.mjs');

/** Roda o hook como ele roda de verdade e diz se ele barrou. */
function julgar(command, tool_name = 'Bash') {
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name, tool_input: { command } }),
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, `o hook saiu com ${r.status}: ${r.stderr}`);
  const saida = r.stdout.trim();
  if (!saida) return { negou: false, motivo: '' };
  const j = JSON.parse(saida);
  const d = j.hookSpecificOutput?.permissionDecision;
  return { negou: d === 'deny', motivo: j.hookSpecificOutput?.permissionDecisionReason || '' };
}

// ---------------------------------------------------------------------------
// O furo do encadeamento — o motivo deste arquivo existir
// ---------------------------------------------------------------------------

test('operação gratuita encadeada com uma paga NÃO libera a paga', () => {
  // Este é o comando exato que passava antes: `listar` é gratuito e casava com
  // OPERACAO_GRATUITA, e como o teste era sobre o texto todo, o `capturar`
  // do outro lado do && entrava de carona.
  const r = julgar('node captura/monitorar.mjs listar --executar && node captura/capturar.mjs --executar');
  assert.equal(r.negou, true, 'o segmento pago passou de carona no gratuito');
  assert.match(r.motivo, /disjuntor/i);
});

test('a ordem não importa: o pago antes do gratuito também é barrado', () => {
  const r = julgar('node captura/capturar.mjs --executar && node captura/monitorar.mjs listar --executar');
  assert.equal(r.negou, true);
});

test('os outros separadores de comando valem igual', () => {
  for (const sep of [';', '||', '|', '\n', '&']) {
    const cmd = `node captura/monitorar.mjs listar --executar ${sep} node captura/capturar.mjs --executar`;
    assert.equal(julgar(cmd).negou, true, `separador ${JSON.stringify(sep)} deixou passar`);
  }
});

test('substituição de comando também é comando', () => {
  const r = julgar('echo "$(node captura/capturar.mjs --executar)"');
  assert.equal(r.negou, true, '$(...) executa de verdade e passou');
});

test('continuação de linha não separa o script da sua bandeira', () => {
  // A armadilha que a própria correção poderia criar: quebrar em '\n' sem
  // juntar as continuações deixaria `capturar.mjs` órfão do seu --executar, e
  // o segmento pareceria um ensaio inofensivo. Seria um furo nascido do
  // conserto do outro.
  const r = julgar('node captura/capturar.mjs \\\n  --executar');
  assert.equal(r.negou, true, 'a barra invertida no fim da linha virou um furo');
});

// ---------------------------------------------------------------------------
// O que precisa continuar passando — hook que barra trabalho legítimo
// é hook que a próxima sessão desliga
// ---------------------------------------------------------------------------

test('ensaio sem --executar passa: é a etapa que existe para NÃO gastar', () => {
  assert.equal(julgar('node captura/capturar.mjs').negou, false);
});

test('ler o código do script é de graça', () => {
  assert.equal(julgar('cat captura/capturar.mjs').negou, false);
  assert.equal(julgar('node --check captura/capturar.mjs').negou, false);
});

test('remover monitoramento passa — é a operação que REDUZ custo', () => {
  assert.equal(julgar('node captura/monitorar.mjs remover 2813617 --executar').negou, false);
});

test('as demais operações gratuitas continuam passando, sozinhas', () => {
  for (const op of ['listar', 'origens', 'aparicoes', 'status']) {
    assert.equal(julgar(`node captura/monitorar.mjs ${op} --executar`).negou, false, `${op} foi barrado`);
  }
});

test('subcomando desconhecido cai no bloqueio — falha fecha', () => {
  assert.equal(julgar('node captura/monitorar.mjs inventado --executar').negou, true);
});

// ---------------------------------------------------------------------------
// A segunda barreira: chamada de rede direta
// ---------------------------------------------------------------------------

test('curl na API do Escavador é barrado, mesmo escondido depois de um &&', () => {
  assert.equal(julgar('ls && curl https://api.escavador.com/api/v2/processos/x').negou, true);
});

test('mencionar o Escavador sem invocar nada não é barrado', () => {
  assert.equal(julgar('grep -rn escavador.com docs/').negou, false);
});
