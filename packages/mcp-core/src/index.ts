/**
 * @lex/mcp-core — o chassi
 * ---------------------------------------------------------------------------
 * A seção central da Spec (§4), e o único lugar do projeto onde a Regra 1 deixa
 * de ser princípio e vira código: "o agente de IA nunca é a fronteira de
 * segurança; privilégio se aplica como escopo verificado em código".
 *
 * A ideia toda cabe numa frase: A FERRAMENTA DECLARA, O CHASSI DECIDE.
 *
 * ⚠️ R-26: um defeito aqui atinge os dois servidores, todos os papéis e todos
 * os inquilinos. É o maior raio de dano do projeto, e por isso a matriz de
 * escopo é critério de aceite da fundação (D-78) — ela vive em
 * `testes/matriz-de-escopo.test.mjs` e roda em `npm test`.
 *
 * Regra de dependência: NÃO importa nada de mcp-servers/. Chassi que conhece o
 * servidor específico deixou de ser chassi.
 *
 * MARCO 2 entrega as etapas 2 a 8 e os envelopes. Marcos 3, 4, 5 e 6 preenchem
 * auditoria, custo, cache e execução com SDK.
 */

export * from './esquema.js';
export * from './ferramenta.js';
export * from './etapas.js';
export * from './traduzir-erro.js';
export * from './chassi.js';
