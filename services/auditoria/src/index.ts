/**
 * @lex/auditoria — a prova
 * ---------------------------------------------------------------------------
 * Escrita append-only e consulta da trilha. Duas propriedades, e nenhuma é
 * negociável:
 *
 *   1. SÍNCRONA AO ATO. Não há fila, não há "grava depois". E AUDITORIA
 *      INDISPONÍVEL BLOQUEIA A OPERAÇÃO (D-77) — falha fecha também aqui. Um
 *      sistema que age sem conseguir registrar o ato é um sistema sem prova
 *   2. IMUTÁVEL. Não aceita alteração nem remoção, e a recusa é do banco: um
 *      gatilho que vale até para o dono, mais a ausência de UPDATE e DELETE nas
 *      permissões do papel da aplicação (migrações 003 e 007)
 *
 * E não vive no histórico de execução do n8n (RNF-08): fluxo é efêmero, prova
 * não é.
 *
 * ---------------------------------------------------------------------------
 * MARCO 3 — o que existe aqui, e em que ordem ler
 *
 *   `conexao.ts`       o acesso ao banco, conectado como `lex_app` e não como
 *                      o dono — porque metade do append-only é a permissão
 *   `identificador.ts` a costura entre `string` no domínio e `uuid` no banco
 *   `resumo.ts`        o que PODE entrar em `parametros_resumidos`, e por que
 *                      a barreira só funciona antes do INSERT
 *   `auditoria-postgres.ts`  a escrita, sem `try/catch` de propósito
 *   `trilha.ts`        a leitura — reconstruir a operação pelo `requisicao_id`
 */

export {
  abrirConexao,
  conferirPapel,
  lerAmbiente,
  ConfiguracaoAusente,
  PAPEL_ESPERADO,
  type Conexao,
  type OpcoesDeConexao,
} from './conexao.js';

export {
  ehUuid,
  exigirUuid,
  uuidOpcional,
  IdentificadorInvalido,
} from './identificador.js';

export { serializarResumo, ResumoRecusado } from './resumo.js';

export {
  criarAuditoriaPostgres,
  type AuditoriaPostgres,
  type ConsumoRegistrado,
} from './auditoria-postgres.js';

export {
  negados,
  reconstruir,
  type ConsumoDaTrilha,
  type EventoDaTrilha,
  type Trilha,
} from './trilha.js';
