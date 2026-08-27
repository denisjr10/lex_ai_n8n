#!/usr/bin/env node
/**
 * migrar.mjs — aplica as migracoes de dados/migracoes, na ordem, uma vez so
 * ---------------------------------------------------------------------------
 * POR QUE NAO USA UMA BIBLIOTECA DE MIGRACAO
 *
 * Porque nao ha nada aqui que uma biblioteca resolva melhor: sao arquivos .sql
 * numerados, aplicados em ordem, registrados numa tabela. E porque este
 * projeto vai ser operado por quem nao e programador de carreira — cada
 * dependencia a menos e uma coisa a menos que pode quebrar num sabado.
 *
 * Nao precisa de `npm install`: fala com o banco pelo `psql` que ja existe
 * dentro do container do PostgreSQL.
 *
 * O QUE ELE GARANTE
 *
 *   1. Ordem  — 001, 002, 003... alfabetica, que com o zero a esquerda e a
 *               numerica. Arquivo novo entra no fim, nunca no meio
 *   2. Uma vez — o que ja foi aplicado nao roda de novo
 *   3. Tudo ou nada — cada arquivo roda dentro de UMA transacao. Erro na
 *               linha 80 desfaz as 79 anteriores. Banco pela metade nao existe
 *   4. Historia imutavel — grava o resumo (hash) de cada arquivo aplicado. Se
 *               um arquivo ja aplicado for editado depois, o migrador RECUSA
 *               de bater. Editar migracao aplicada e como editar o passado: o
 *               seu banco e o do colega deixam de ser o mesmo banco, e nada avisa
 *
 * Uso:
 *   node ferramentas/banco/migrar.mjs             aplica o que falta
 *   node ferramentas/banco/migrar.mjs --estado    mostra o que ja foi aplicado
 *   node ferramentas/banco/migrar.mjs --conferir  so confere; nao altera nada
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const DIR_MIGRACOES = path.join(RAIZ, 'dados', 'migracoes');
const COMPOSE = path.join(RAIZ, 'infra', 'docker-compose.yml');
const ARQ_ENV = path.join(RAIZ, 'infra', '.env');

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

// ---------------------------------------------------------------------------
// Configuracao — infra/.env se existir, com os mesmos padroes do compose
// ---------------------------------------------------------------------------
function lerEnv() {
  const valores = {
    POSTGRES_DB: 'lex',
    POSTGRES_USER: 'lex_dono',
    LEX_APP_PASSWORD: 'desenvolvimento-local-app',
  };
  if (fs.existsSync(ARQ_ENV)) {
    for (const linha of fs.readFileSync(ARQ_ENV, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) valores[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  // Variavel de ambiente de verdade vence o arquivo — e assim que a
  // implantacao injeta credencial sem tocar em arquivo nenhum.
  for (const chave of Object.keys(valores)) {
    if (process.env[chave]) valores[chave] = process.env[chave];
  }
  return valores;
}

const env = lerEnv();

// ---------------------------------------------------------------------------
// Conversa com o banco, via psql dentro do container
// ---------------------------------------------------------------------------
/** Toda conversa com o banco tem PRAZO.
 *
 *  Sem isto, `docker compose exec` fica esperando o daemon do Docker
 *  indefinidamente quando o Docker Desktop nao esta de pe — e o migrador
 *  simplesmente para, sem mensagem, sem erro, sem fim. Comando que trava calado
 *  e pior que comando que falha: quem roda nao sabe se deve esperar mais um
 *  minuto ou uma hora. */
function psql(argumentos, entrada = undefined, prazoMs = 120_000) {
  try {
    return execFileSync('docker', [
      'compose', '-f', COMPOSE, 'exec', '-T',
      // Sem isto, cada `docker compose exec` reclama que .env nao tem as
      // variaveis e polui a saida com avisos que nao sao problema nenhum.
      'banco',
      'psql',
      '-U', env.POSTGRES_USER,
      '-d', env.POSTGRES_DB,
      '-v', 'ON_ERROR_STOP=1',
      '--no-psqlrc',
      ...argumentos,
    ], {
      input: entrada,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
      timeout: prazoMs,
      killSignal: 'SIGKILL',
    });
  } catch (e) {
    const detalhe = [e.stderr, e.stdout].filter(Boolean).join('\n').trim();
    const falha = new Error(detalhe || e.message);
    falha.psql = true;
    // ETIMEDOUT aqui quase sempre significa "o daemon do Docker nao respondeu",
    // e nao "a consulta demorou". Vale distinguir: a dica muda por completo.
    falha.expirou = e.code === 'ETIMEDOUT' || e.signal === 'SIGKILL';
    throw falha;
  }
}

function consultar(sql) {
  // -tA: sem cabecalho, sem alinhamento. Saida para programa, nao para gente.
  return psql(['-tA', '-c', sql]).trim();
}

/** Sonda curta: 25 segundos. Se o banco esta de pe, ele responde num piscar;
 *  se nao esta, esperar dois minutos nao muda o resultado. */
function sondarBanco() {
  try {
    psql(['-tA', '-c', 'SELECT 1'], undefined, 25_000);
    return { ok: true };
  } catch (e) {
    return { ok: false, expirou: Boolean(e.expirou), detalhe: String(e.message).split('\n')[0] };
  }
}

// ---------------------------------------------------------------------------
// Preparacao
// ---------------------------------------------------------------------------
const soConferir = process.argv.includes('--conferir');
const soEstado   = process.argv.includes('--estado');

console.log(`\n${cor.neg}Migracoes do banco${cor.off}`);
console.log(`${cor.cin}${path.relative(RAIZ, DIR_MIGRACOES)} · banco "${env.POSTGRES_DB}" como "${env.POSTGRES_USER}"${cor.off}\n`);

if (!fs.existsSync(DIR_MIGRACOES)) morrer(`nao encontrei ${path.relative(RAIZ, DIR_MIGRACOES)}`);

const arquivos = fs.readdirSync(DIR_MIGRACOES)
  .filter(f => f.endsWith('.sql'))
  .sort();

if (!arquivos.length) morrer('nenhum arquivo .sql em dados/migracoes');

// Numeracao repetida faria a ordem depender do resto do nome, que ninguem le.
const numeros = new Map();
for (const f of arquivos) {
  const n = f.slice(0, 3);
  if (!/^\d{3}$/.test(n)) morrer(`"${f}" nao comeca com tres digitos`, 'o padrao e NNN-nome.sql, para que a ordem seja obvia');
  if (numeros.has(n)) morrer(`numero ${n} repetido: "${numeros.get(n)}" e "${f}"`, 'duas migracoes com o mesmo numero nao tem ordem definida');
  numeros.set(n, f);
}

const resumo = (f) => crypto
  .createHash('sha256')
  .update(fs.readFileSync(path.join(DIR_MIGRACOES, f)))
  .digest('hex')
  .slice(0, 16);

const sonda = sondarBanco();
if (!sonda.ok) {
  if (sonda.expirou) {
    erro('o Docker nao respondeu em 25 segundos.');
    info('quase sempre e o Docker Desktop fechado, ou ainda terminando de iniciar.');
    info('abra o Docker Desktop, espere ele dizer "Engine running", e rode de novo.');
    console.log('');
    process.exit(1);
  }
  morrer(
    'o banco nao respondeu.',
    'suba antes com:  npm run banco:subir   (ele chama este migrador no fim)'
  );
}
ok('banco respondendo');

// ---------------------------------------------------------------------------
// Tabela de controle
// ---------------------------------------------------------------------------
psql(['-q', '-c', `
  CREATE TABLE IF NOT EXISTS migracao_aplicada (
    arquivo     text PRIMARY KEY,
    resumo      text NOT NULL,
    aplicada_em timestamptz NOT NULL DEFAULT now(),
    duracao_ms  integer
  )
`]);

const linhas = consultar(`SELECT arquivo || '|' || resumo || '|' || aplicada_em FROM migracao_aplicada ORDER BY arquivo`);
const aplicadas = new Map();
for (const l of linhas ? linhas.split('\n') : []) {
  const [arquivo, res, quando] = l.split('|');
  aplicadas.set(arquivo, { resumo: res, quando });
}

// ---------------------------------------------------------------------------
// Trava: migracao ja aplicada nao muda
// ---------------------------------------------------------------------------
const alteradas = [];
for (const f of arquivos) {
  const antes = aplicadas.get(f);
  if (antes && antes.resumo !== resumo(f)) alteradas.push(f);
}

if (alteradas.length) {
  erro(`${alteradas.length} migracao(oes) ja aplicada(s) foram EDITADAS depois:`);
  for (const f of alteradas) info(`- ${f}`);
  console.log('');
  info('O banco desta maquina ja rodou a versao antiga; o de quem clonar hoje');
  info('roda a nova. Os dois passam a ser bancos diferentes, e nada avisa.');
  info('');
  info('O que fazer: desfaca a edicao e escreva uma migracao NOVA com a mudanca.');
  info('Se este banco e descartavel (desenvolvimento), zere e recomece:');
  info(`  ${cor.neg}npm run banco:zerar${cor.off}`);
  console.log('');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// --estado
// ---------------------------------------------------------------------------
if (soEstado) {
  console.log(`${cor.neg}Estado${cor.off}\n`);
  for (const f of arquivos) {
    const a = aplicadas.get(f);
    if (a) console.log(`  ${cor.ver}aplicada${cor.off}  ${f}  ${cor.cin}${a.quando.slice(0, 19)}${cor.off}`);
    else    console.log(`  ${cor.ama}pendente${cor.off}  ${f}`);
  }
  // Migracao no banco que nao existe mais no disco: alguem apagou um arquivo
  // ja aplicado. Nao e fatal, mas e sempre um erro de alguem.
  for (const [f] of aplicadas) {
    if (!arquivos.includes(f)) console.log(`  ${cor.rub}sumiu   ${cor.off}  ${f}  ${cor.cin}aplicada no banco, ausente do disco${cor.off}`);
  }
  console.log('');
  process.exit(0);
}

const pendentes = arquivos.filter(f => !aplicadas.has(f));

if (soConferir) {
  ok(`${aplicadas.size} aplicada(s), nenhuma alterada depois`);
  if (pendentes.length) {
    aviso(`${pendentes.length} pendente(s): ${pendentes.join(', ')}`);
    console.log('');
    process.exit(1);
  }
  ok('o banco esta na versao do repositorio');
  console.log('');
  process.exit(0);
}

if (!pendentes.length) {
  ok(`nada a aplicar — ${aplicadas.size} migracao(oes) ja no banco`);
  console.log('');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Aplicacao — uma transacao por arquivo
// ---------------------------------------------------------------------------
console.log(`${cor.neg}Aplicando ${pendentes.length} migracao(oes)${cor.off}\n`);

for (const f of pendentes) {
  const conteudo = fs.readFileSync(path.join(DIR_MIGRACOES, f), 'utf8');
  const inicio = Date.now();
  process.stdout.write(`  ${f} ... `);

  try {
    // BEGIN/COMMIT explicitos em volta do arquivo inteiro: tudo ou nada.
    // O INSERT de controle vai DENTRO da mesma transacao, senao um erro entre
    // aplicar e registrar deixaria a migracao aplicada e nao registrada — que
    // e o estado que faz a proxima execucao aplicar duas vezes.
    psql(['-q', '-f', '-'],
      'BEGIN;\n' +
      conteudo + '\n' +
      `INSERT INTO migracao_aplicada (arquivo, resumo) VALUES ('${f}', '${resumo(f)}');\n` +
      'COMMIT;\n'
    );
  } catch (e) {
    console.log(`${cor.rub}falhou${cor.off}`);
    console.log('');
    erro(`${f} nao foi aplicada. A transacao foi desfeita — o banco esta como estava.`);
    console.log('');
    console.log(String(e.message).split('\n').map(l => `      ${l}`).join('\n'));
    console.log('');
    info('As migracoes seguintes nao foram tentadas.');
    console.log('');
    process.exit(1);
  }

  const ms = Date.now() - inicio;
  psql(['-q', '-c', `UPDATE migracao_aplicada SET duracao_ms = ${ms} WHERE arquivo = '${f}'`]);
  console.log(`${cor.ver}ok${cor.off} ${cor.cin}(${ms} ms)${cor.off}`);
}

// ---------------------------------------------------------------------------
// Senha do papel da aplicacao
//
// Fora do .sql de proposito: senha em arquivo versionado e segredo em arquivo
// versionado. Aqui ela vem do ambiente e nunca e impressa.
// ---------------------------------------------------------------------------
const temPapelApp = consultar(`SELECT count(*) FROM pg_roles WHERE rolname = 'lex_app'`) === '1';
if (temPapelApp) {
  const senha = env.LEX_APP_PASSWORD;

  // A senha vai pela ENTRADA PADRAO, nunca por argumento de comando.
  //
  // Argumento de comando aparece na lista de processos da maquina inteira:
  // qualquer usuario que rode um `ps` no momento certo le a senha. Aqui e um
  // banco de desenvolvimento e a senha e obvia de proposito, entao o dano seria
  // nenhum — mas este arquivo e o molde do que a implantacao vai fazer com a
  // senha DE VERDADE, e molde errado se copia.
  //
  // A cerca de dolar ($senha$) delimita o texto sem precisar escapar nada.
  const CERCA = '$senha_do_app$';
  if (senha.includes(CERCA)) {
    morrer(
      'a senha contem a sequencia usada para delimita-la no SQL.',
      'troque LEX_APP_PASSWORD por um valor que nao contenha "$senha_do_app$"'
    );
  }

  psql(['-q', '-f', '-'],
    `DO $migrador$\nBEGIN\n` +
    `  EXECUTE format('ALTER ROLE lex_app PASSWORD %L', ${CERCA}${senha}${CERCA});\n` +
    `END;\n$migrador$;\n`
  );

  ok(`senha do papel lex_app definida (${senha.length} caracteres, nao exibida)`);
  if (senha === 'desenvolvimento-local-app') {
    aviso('a senha e o padrao de desenvolvimento. Em producao, defina LEX_APP_PASSWORD.');
  }
}

console.log('');
ok(`${pendentes.length} migracao(oes) aplicada(s). O banco esta na versao do repositorio.`);
console.log(`\n${cor.neg}Conferir a qualquer momento:${cor.off}  npm run banco:estado\n`);
