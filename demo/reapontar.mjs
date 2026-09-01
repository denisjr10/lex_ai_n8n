#!/usr/bin/env node
/**
 * reapontar.mjs — a instância da Uazapi morreu; põe a demo de pé de novo
 * ---------------------------------------------------------------------------
 * POR QUE ISTO EXISTE
 *
 * A instância gratuita da Uazapi vive UMA HORA. Toda vez que ela expira, a demo
 * inteira precisa ser reapontada, e a sequência é sempre a mesma:
 *
 *   1. conferir que o token novo responde
 *   2. gravar o token como credencial no n8n
 *   3. reapontar o webhook da Uazapi para o fluxo B
 *   4. republicar e reativar os dois fluxos, que passam a citar a credencial nova
 *
 * Feita à mão, essa sequência já foi executada três vezes em um dia, e o passo
 * que mais escapa é o 4: sem ele os fluxos continuam apontando para a credencial
 * ANTIGA, e o sintoma é o pior possível — tudo parece publicado, e o envio falha
 * só na hora em que alguém está olhando.
 *
 * O momento em que isto mais vai importar é a apresentação ao escritório: se a
 * instância cair no meio, o caminho de volta precisa ser um comando, não uma
 * lista de quatro que alguém tenta lembrar com a sala esperando.
 *
 * O TOKEN NÃO PASSA POR AQUI. Ele é lido de `demo/uazapi.local`, gravado por
 * `guardar-segredo.mjs`, e nunca é impresso — nem em erro (D-114, R-51).
 *
 * Uso:
 *   node guardar-segredo.mjs demo/uazapi.local    # cola o token da instância
 *   node demo/reapontar.mjs                       # o resto
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.dirname(AQUI);

const passos = [
  ['confere a instância', ['demo/uazapi.mjs', 'status']],
  ['grava a credencial no n8n', ['demo/uazapi.mjs', 'credencial']],
  ['reaponta o webhook da Uazapi', ['demo/uazapi.mjs', 'webhook']],
  ['republica e ativa o fluxo B', ['demo/montar-fluxo-b.mjs', '--publicar', '--ativar']],
  ['republica e ativa o fluxo A', ['demo/montar-fluxo-a.mjs', '--publicar', '--ativar']],
];

// Falha fecha (Regra 5). Parar no primeiro erro é o que evita o estado pela
// metade — credencial nova e fluxos velhos é pior que nada feito, porque
// parece pronto.
if (!fs.existsSync(path.join(AQUI, 'uazapi.local'))) {
  console.error(`
  demo/uazapi.local não existe — não há token de instância para usar.

  Crie a instância e cole o token (o token NÃO deve ser colado no chat nem
  fotografado; ele vai direto para o arquivo, que o .gitignore cobre):

    node guardar-segredo.mjs demo/uazapi.local
`);
  process.exit(1);
}

console.log('\n\x1b[1mReapontando a demo para a instância atual\x1b[0m');

for (const [rotulo, args] of passos) {
  console.log(`\n\x1b[1m→ ${rotulo}\x1b[0m`);
  const r = spawnSync(process.execPath, args, { cwd: RAIZ, stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\n  \x1b[31mPAROU\x1b[0m em "${rotulo}".`);
    console.error('  Nada do que vem depois foi feito — a demo está no estado anterior,');
    console.error('  e não num meio-termo que parece pronto.\n');
    if (args[1] === 'status') {
      console.error('  Se o erro foi 401, a instância expirou ou o token está velho.');
      console.error('  Crie outra e regrave:  node guardar-segredo.mjs demo/uazapi.local\n');
    }
    process.exit(1);
  }
}

console.log(`
\x1b[32mA demo está de pé.\x1b[0m

  Fluxo A (Telegram) e fluxo B (WhatsApp) republicados e ativos, os dois
  citando a credencial da instância atual.

  Lembre que a instância gratuita vive uma hora. Quando cair, rode de novo:
    node guardar-segredo.mjs demo/uazapi.local
    node demo/reapontar.mjs
`);
