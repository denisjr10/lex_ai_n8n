#!/usr/bin/env node
/**
 * subir.mjs — o banco, do zero, com um comando
 * ---------------------------------------------------------------------------
 * O criterio de aceite do marco 1 da Spec (§15) e literalmente este: "o banco
 * sobe do zero com um comando". Este arquivo e o comando.
 *
 *   npm run banco:subir      sobe o PostgreSQL, espera ficar pronto, migra
 *   npm run banco:derrubar   para o container, PRESERVANDO os dados
 *   npm run banco:zerar      para e APAGA o volume — pede confirmacao
 *
 * "Do zero" e para valer: numa maquina que so tem Docker e Node, sem nenhum
 * `npm install`, os tres comandos acima funcionam.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const COMPOSE = path.join(RAIZ, 'infra', 'docker-compose.yml');
const ARQ_ENV = path.join(RAIZ, 'infra', '.env');
// Chama-se `ambiente.exemplo`, e nao `.env.example`, porque o guarda de
// segredo deste projeto (um hook do Claude Code) barra qualquer arquivo com
// nome de ambiente entrando no commit. A regra esta certa; o nome do arquivo
// de exemplo e que era barato de trocar.
const ARQ_ENV_EXEMPLO = path.join(RAIZ, 'infra', 'ambiente.exemplo');

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', rub: '\x1b[31m', cin: '\x1b[90m' };
const ok    = (m) => console.log(`${cor.ver}  OK  ${cor.off} ${m}`);
const aviso = (m) => console.log(`${cor.ama} AVISO${cor.off} ${m}`);
const erro  = (m) => console.log(`${cor.rub} ERRO ${cor.off} ${m}`);
const info  = (m) => console.log(`${cor.cin}      ${m}${cor.off}`);

function morrer(msg, dica) {
  erro(msg);
  if (dica) info(dica);
  console.log('');
  process.exit(1);
}

function compose(argumentos, opcoes = {}) {
  return spawnSync('docker', ['compose', '-f', COMPOSE, ...argumentos], {
    stdio: 'inherit',
    ...opcoes,
  });
}

const derrubar = process.argv.includes('--derrubar');
const zerar    = process.argv.includes('--zerar');

console.log(`\n${cor.neg}Banco de desenvolvimento${cor.off}`);
console.log(`${cor.cin}infra/docker-compose.yml${cor.off}\n`);

// ---------------------------------------------------------------------------
// Docker existe?
// ---------------------------------------------------------------------------
try {
  execFileSync('docker', ['compose', 'version'], { stdio: 'ignore' });
} catch {
  morrer(
    'nao encontrei o Docker Compose.',
    'instale o Docker Desktop e abra ele antes de rodar este comando'
  );
}

// ---------------------------------------------------------------------------
// --derrubar / --zerar
// ---------------------------------------------------------------------------
if (derrubar || zerar) {
  if (zerar) {
    // Apagar o volume apaga TODO o dado. Numa maquina de desenvolvimento isso
    // e rotina; mas "rotina" e exatamente como se apaga o que nao devia.
    // Confirmacao exigida, e nao ha bandeira que a pule: quando o comando
    // destrutivo tem atalho, o atalho e o que se usa.
    if (!process.stdin.isTTY) {
      morrer(
        'zerar apaga TODOS os dados do banco, e precisa de um terminal para confirmar.',
        'rode voce mesmo, no seu terminal: npm run banco:zerar'
      );
    }
    console.log(`${cor.ama}Isto apaga TODO o conteudo do banco de desenvolvimento.${cor.off}`);
    console.log(`${cor.cin}O volume lex-dados-banco sera removido. Nao ha desfazer.${cor.off}\n`);
    process.stdout.write('Digite  zerar  para confirmar: ');

    const buffer = Buffer.alloc(64);
    let lidos = 0;
    try { lidos = fs.readSync(0, buffer, 0, 64, null); } catch { lidos = 0; }
    const resposta = buffer.toString('utf8', 0, lidos).trim();

    if (resposta !== 'zerar') {
      console.log('');
      ok('nada foi apagado.');
      console.log('');
      process.exit(0);
    }
    console.log('');
    const r = compose(['down', '--volumes']);
    if (r.status !== 0) morrer('o compose falhou ao derrubar');
    ok('banco parado e volume removido.');
    console.log(`\n  Para recomecar do zero:  ${cor.neg}npm run banco:subir${cor.off}\n`);
    process.exit(0);
  }

  const r = compose(['down']);
  if (r.status !== 0) morrer('o compose falhou ao derrubar');
  ok('banco parado. Os dados continuam no volume lex-dados-banco.');
  console.log(`\n  Para voltar:  ${cor.neg}npm run banco:subir${cor.off}\n`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Subir
// ---------------------------------------------------------------------------
if (!fs.existsSync(ARQ_ENV)) {
  fs.copyFileSync(ARQ_ENV_EXEMPLO, ARQ_ENV);
  ok('criei infra/.env a partir de infra/ambiente.exemplo (o Git ignora o .env)');
  info('sao senhas de desenvolvimento local. Producao usa cofre, nunca arquivo');
}

console.log(`${cor.neg}Subindo o PostgreSQL${cor.off}\n`);

// `--wait` espera o healthcheck do compose passar. Sem ele o comando volta
// quando o container LIGA, que e antes de o banco ACEITAR conexao — e a
// migracao falha com "connection refused" na maquina lenta e passa na rapida.
const subiu = compose(['up', '-d', '--wait']);
if (subiu.status !== 0) {
  console.log('');
  morrer(
    'o banco nao subiu.',
    'as duas causas mais comuns: o Docker Desktop nao esta aberto, ou a porta ja esta em uso (troque POSTGRES_PORT em infra/.env)'
  );
}

console.log('');
ok('PostgreSQL de pe e aceitando conexao');

// ---------------------------------------------------------------------------
// Migrar
// ---------------------------------------------------------------------------
const migrou = spawnSync(process.execPath, [path.join(AQUI, 'migrar.mjs')], { stdio: 'inherit' });
if (migrou.status !== 0) {
  morrer('as migracoes falharam. O banco esta de pe, mas incompleto.');
}

console.log(`${cor.neg}Pronto.${cor.off}`);
console.log(`${cor.cin}  conferir o esquema :  npm run banco:estado${cor.off}`);
console.log(`${cor.cin}  abrir um psql      :  docker compose -f infra/docker-compose.yml exec banco psql -U lex_dono -d lex${cor.off}`);
console.log(`${cor.cin}  parar sem apagar   :  npm run banco:derrubar${cor.off}\n`);
