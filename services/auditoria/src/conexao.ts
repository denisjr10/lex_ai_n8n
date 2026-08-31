/**
 * conexao.ts — o acesso ao banco, com o papel certo
 * ---------------------------------------------------------------------------
 * ⚠️ ESTE SERVIÇO CONECTA COMO `lex_app`, NUNCA COMO O DONO DO BANCO.
 *
 * A migração 007 revoga UPDATE, DELETE e TRUNCATE de `lex_app` em
 * `evento_auditoria` e `consumo`, e concede só SELECT e INSERT. Essa revogação
 * é **uma das duas camadas** que tornam a auditoria append-only — a outra é o
 * gatilho da migração 003.
 *
 * Conectar como `lex_dono` não quebraria nenhum teste: o gatilho continuaria
 * recusando UPDATE e DELETE, e tudo pareceria certo. Mas o desenho de duas
 * camadas teria virado uma, em silêncio, e a segunda camada existe justamente
 * porque a primeira é um objeto do banco que quem tem DDL pode remover. Um
 * `DROP TRIGGER` acidental numa migração futura deixaria a tabela mutável, e
 * ninguém descobriria até precisar da prova.
 *
 * Por isso o papel é conferido na abertura, e conectar com o papel errado é
 * erro de partida — não um aviso.
 *
 * SEGREDO. A senha vem do ambiente e **nunca** é registrada, nem inteira, nem
 * em pedaço, nem com o comprimento. `pg` não a imprime; o que este arquivo
 * precisa garantir é não imprimi-la também, inclusive dentro de mensagem de
 * erro — daí a montagem campo a campo em vez de uma URL de conexão, que
 * carrega a senha no meio do texto e vaza em qualquer log que imprima a URL.
 */

import { Pool, type PoolClient } from 'pg';

/** O papel que este serviço tem de usar. Não é configurável de propósito. */
export const PAPEL_ESPERADO = 'lex_app';

export interface OpcoesDeConexao {
  readonly host: string;
  readonly porta: number;
  readonly banco: string;
  readonly usuario: string;
  readonly senha: string;
  /** Teto por consulta. Auditoria que pendura é auditoria indisponível. */
  readonly prazoMs?: number;
}

export class ConfiguracaoAusente extends Error {
  constructor(variavel: string) {
    super(
      `auditoria: a variável de ambiente ${variavel} não está definida. ` +
        `Sem banco não há registro, e sem registro nada pode prosseguir (D-77).`,
    );
    this.name = 'ConfiguracaoAusente';
  }
}

/**
 * Lê a configuração do ambiente. **A SENHA NÃO TEM PADRÃO.**
 *
 * Host e porta têm, porque errá-los produz falha imediata e barulhenta.
 *
 * O usuário também tem, e o padrão é o próprio `PAPEL_ESPERADO`: o papel deste
 * serviço é uma decisão de segurança, não de configuração. Deixá-lo ajustável
 * por variável de ambiente convidaria exatamente o desvio que `conferirPapel`
 * existe para impedir — alguém apontando para `lex_dono` numa madrugada de
 * incidente porque "assim funciona". Aceitar o valor e depois conferi-lo é
 * mais honesto do que fingir que não existe.
 *
 * A senha não tem padrão, e é a única sem. Um padrão ali produziria a falha
 * silenciosa que este arquivo inteiro existe para evitar: subir com credencial
 * de desenvolvimento contra um banco de verdade e parecer que deu certo.
 */
export function lerAmbiente(env: NodeJS.ProcessEnv = process.env): OpcoesDeConexao {
  const exigir = (nome: string): string => {
    const v = env[nome];
    if (!v) throw new ConfiguracaoAusente(nome);
    return v;
  };

  return {
    host: env['LEX_BANCO_HOST'] ?? '127.0.0.1',
    porta: Number(env['LEX_BANCO_PORTA'] ?? env['POSTGRES_PORT'] ?? 5433),
    banco: env['LEX_BANCO_NOME'] ?? env['POSTGRES_DB'] ?? 'lex',
    usuario: env['LEX_APP_USER'] ?? PAPEL_ESPERADO,
    senha: exigir('LEX_APP_PASSWORD'),
    prazoMs: Number(env['LEX_BANCO_PRAZO_MS'] ?? 5_000),
  };
}

export interface Conexao {
  /** Executa uma consulta. Lança em qualquer falha — falha fecha. */
  consultar<L extends Record<string, unknown>>(
    sql: string,
    valores?: readonly unknown[],
  ): Promise<L[]>;
  /** Executa dentro de uma transação, com COMMIT ou ROLLBACK. */
  emTransacao<T>(corpo: (c: PoolClient) => Promise<T>): Promise<T>;
  encerrar(): Promise<void>;
}

export function abrirConexao(opcoes: OpcoesDeConexao): Conexao {
  const pool = new Pool({
    host: opcoes.host,
    port: opcoes.porta,
    database: opcoes.banco,
    user: opcoes.usuario,
    password: opcoes.senha,
    // Prazos curtos DE PROPÓSITO. Um pool que espera indefinidamente por uma
    // conexão transforma "auditoria fora do ar" em "a plataforma travou", e o
    // segundo é pior: o primeiro recusa e avisa, o segundo pendura sem dizer
    // nada. A D-77 quer bloqueio COM resposta.
    connectionTimeoutMillis: opcoes.prazoMs ?? 5_000,
    statement_timeout: opcoes.prazoMs ?? 5_000,
    query_timeout: opcoes.prazoMs ?? 5_000,
    max: 10,
  });

  // Um erro num cliente ocioso derruba o processo se ninguém escutar. Escutar
  // e não fazer nada é o certo aqui: o pool descarta o cliente sozinho, e a
  // próxima consulta abre outro — ou falha, e falhar é o comportamento que
  // queremos.
  pool.on('error', () => {});

  return {
    async consultar<L extends Record<string, unknown>>(sql: string, valores: readonly unknown[] = []) {
      const r = await pool.query(sql, valores as unknown[]);
      return r.rows as L[];
    },

    async emTransacao<T>(corpo: (c: PoolClient) => Promise<T>): Promise<T> {
      const cliente = await pool.connect();
      try {
        await cliente.query('BEGIN');
        const resultado = await corpo(cliente);
        await cliente.query('COMMIT');
        return resultado;
      } catch (e) {
        // ROLLBACK pode falhar junto (conexão caiu no meio). O erro que
        // interessa é o original, não o do rollback — por isso ele é engolido
        // aqui e o `throw e` abaixo é o que sai.
        try {
          await cliente.query('ROLLBACK');
        } catch {
          /* a conexão já se foi; o servidor desfaz sozinho */
        }
        throw e;
      } finally {
        cliente.release();
      }
    },

    async encerrar() {
      await pool.end();
    },
  };
}

/**
 * Confere que a conexão está com o papel certo. Chamar na partida do serviço.
 *
 * `current_user` e não `session_user`: é o papel EFETIVO, o que o PostgreSQL
 * usa para decidir permissão. Um `SET ROLE` mudaria um e não o outro, e o que
 * importa aqui é qual deles o banco vai consultar na hora de recusar o UPDATE.
 */
export async function conferirPapel(c: Conexao): Promise<void> {
  const linhas = await c.consultar<{ papel: string }>('SELECT current_user AS papel');
  const papel = linhas[0]?.papel;
  if (papel !== PAPEL_ESPERADO) {
    throw new Error(
      `auditoria: conectada como "${papel ?? '(desconhecido)'}" e o esperado é "${PAPEL_ESPERADO}". ` +
        `O append-only depende da revogação de UPDATE/DELETE desse papel (migração 007); ` +
        `com outro papel resta só o gatilho, e o desenho de duas camadas vira uma sem avisar.`,
    );
  }
}
