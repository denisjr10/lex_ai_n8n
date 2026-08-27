/**
 * @lex/mcp-core — o chassi
 * ---------------------------------------------------------------------------
 * A seção central da Spec (§4), e o único lugar do projeto onde a Regra 1 deixa
 * de ser princípio e vira código: "o agente de IA nunca é a fronteira de
 * segurança; privilégio se aplica como escopo verificado em código".
 *
 * A ideia toda cabe numa frase: A FERRAMENTA DECLARA, O CHASSI DECIDE. Uma
 * ferramenta diz de que escopo precisa, quanto custa e por quanto tempo pode
 * ser cacheada. Quem verifica, cobra, limita, registra e nega é o chassi — e
 * nenhuma ferramenta consegue pular a fila, porque não há caminho por fora.
 *
 * As onze etapas de toda chamada estão na Spec §4.2.
 *
 * ⚠️ R-26: um defeito aqui atinge os dois servidores, todos os papéis e todos
 * os inquilinos. É o maior raio de dano do projeto, e por isso a matriz de
 * escopo é critério de aceite da fundação (D-78).
 *
 * Regra de dependência: NÃO importa nada de mcp-servers/. Chassi que conhece o
 * servidor específico deixou de ser chassi.
 *
 * Preenchido nos MARCOS 2 a 5 (Spec §15).
 */
export {}
