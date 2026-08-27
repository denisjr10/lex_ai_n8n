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
 * Preenchido no MARCO 3 (Spec §15).
 */
export {}
