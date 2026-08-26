#!/usr/bin/env node
/**
 * guardar-segredo.mjs — grava um segredo em arquivo local, com segurança
 * ---------------------------------------------------------------------------
 * Por que existe uma ferramenta para algo tão simples:
 *
 *   1. O `>` do PowerShell 5 grava UTF-16. Um token gravado assim e lido como
 *      texto comum vira lixo — e o erro aparece como "401 token inválido", que
 *      manda você procurar no lugar errado. Já aconteceu neste projeto
 *   2. Passar o segredo como argumento de comando o deixa no histórico do
 *      terminal, em texto puro, para sempre
 *   3. Aqui o valor é digitado sem aparecer na tela, e nunca é impresso
 *
 * Uso — rode no SEU terminal, não peça para o assistente rodar:
 *
 *   node guardar-segredo.mjs demo/n8n.local
 *
 * Ele pergunta o valor, esconde o que você digita, grava em UTF-8 sem BOM e
 * confirma só o comprimento.
 */

import fs from 'node:fs';
import path from 'node:path';

const destino = process.argv[2];

if (!destino) {
  console.log(`
Uso:  node guardar-segredo.mjs <caminho-do-arquivo>

Exemplos:
  node guardar-segredo.mjs demo/n8n.local        chave de API do n8n
  node guardar-segredo.mjs demo/telegram.local   token do bot do Telegram
  node guardar-segredo.mjs demo/ia.local         chave do provedor de IA
  node guardar-segredo.mjs captura/token.local   token do Escavador
`);
  process.exit(1);
}

// Trava: só grava onde o Git ignora. Um segredo em arquivo versionado é o
// tipo de erro que não se desfaz — o histórico guarda mesmo depois de apagar.
const { execSync } = await import('node:child_process');
let ignorado = false;
try {
  execSync(`git check-ignore -q "${destino}"`, { stdio: 'ignore' });
  ignorado = true;
} catch { /* check-ignore sai com 1 quando NAO esta ignorado */ }

if (!ignorado) {
  console.error(`\n  RECUSADO: "${destino}" não está no .gitignore.`);
  console.error('  Segredo em arquivo versionado vai para o histórico e não sai mais de lá.');
  console.error('  Acrescente o caminho ao .gitignore e rode de novo.\n');
  process.exit(1);
}

if (!process.stdin.isTTY) {
  console.error('\n  Este comando precisa de um terminal de verdade.');
  console.error('  Rode você mesmo, no seu PowerShell — não pelo assistente.\n');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Leitura sem eco na tela
//
// A PRIMEIRA VERSÃO FALHOU, E FALHOU DA PIOR MANEIRA: ela usava `readline` e
// silenciava `process.stdout.write` por remendo. No PowerShell do Windows isso
// não segurou — o token colado apareceu na tela inteiro, e o script ainda
// imprimiu, confiante, "o valor não foi exibido em momento nenhum". Ferramenta
// de segredo que erra calada é pior que nenhuma: ela faz a pessoa relaxar.
//
// Agora o eco é desligado onde ele de fato mora — no terminal, via modo cru
// (raw mode: o terminal para de imprimir o que é digitado e entrega tecla a
// tecla ao programa). E, se o modo cru não estiver disponível, o script
// RECUSA em vez de tentar. Falha fecha, igual ao resto do projeto.
// ---------------------------------------------------------------------------
if (typeof process.stdin.setRawMode !== 'function') {
  console.error('\n  RECUSADO: este terminal não permite desligar o eco da digitação.');
  console.error('  Sem isso o segredo apareceria na tela — foi exatamente o que');
  console.error('  aconteceu em 26/08, e custou uma chave de API.');
  console.error('\n  Alternativa segura: grave o arquivo direto, sem passar por aqui —');
  console.error(`  abra ${destino} num editor de texto, cole o valor, salve em UTF-8.\n`);
  process.exit(1);
}

console.log(`\nGravando em: ${destino}`);
console.log('Cole o valor e tecle Enter. Nada aparecerá na tela — é assim mesmo.\n');
process.stdout.write('valor: ');

const valor = await new Promise((resolve, reject) => {
  const entrada = process.stdin;
  let acumulado = '';

  entrada.setRawMode(true);
  entrada.resume();
  entrada.setEncoding('utf8');

  const encerrar = (fn, arg) => {
    entrada.setRawMode(false);
    entrada.pause();
    entrada.removeListener('data', aoReceber);
    fn(arg);
  };

  function aoReceber(pedaco) {
    for (const ch of pedaco) {
      if (ch === '\r' || ch === '\n') return encerrar(resolve, acumulado);
      if (ch === '\u0003') {                      // Ctrl+C
        process.stdout.write('\n');
        return encerrar(reject, new Error('cancelado'));
      }
      if (ch === '\u0008' || ch === '\u007f') {  // Backspace / Delete
        acumulado = acumulado.slice(0, -1);
        continue;
      }
      if (ch < ' ') continue;                     // outros controles: ignora
      acumulado += ch;
    }
    // Nada é escrito na tela. Nem asterisco: o comprimento de um token
    // também é informação, e não há motivo para exibi-lo enquanto se digita.
  }

  entrada.on('data', aoReceber);
});
console.log('');

const limpo = String(valor).replace(/\s+/g, '');

if (!limpo) {
  console.error('  Nada foi digitado. Nada foi gravado.\n');
  process.exit(1);
}

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, limpo, { encoding: 'utf8' });          // sem BOM, sem quebra de linha

// Conferência: relê do disco e valida, sem exibir
const relido = fs.readFileSync(destino, 'utf8');
const soCaracteresDeToken = /^[A-Za-z0-9._\-:~+/=]+$/.test(relido);

console.log(`  gravado    : ${destino}`);
console.log(`  comprimento: ${relido.length} caracteres`);
console.log(`  codificação: UTF-8 sem BOM`);
console.log(`  formato    : ${soCaracteresDeToken ? 'ok — só caracteres de token' : 'ATENÇÃO: há caracteres incomuns; confira se colou a coisa certa'}`);
console.log(`  no Git     : ignorado ✓`);
console.log('\n  O valor não foi exibido em momento nenhum, e não está no histórico do terminal.\n');
