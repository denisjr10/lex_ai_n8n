/**
 * @lex/dominio — os tipos que todos os outros pacotes compartilham
 * ---------------------------------------------------------------------------
 * Usuário, papel, sessão, escopo, faixa de autorização, envelope de resposta e
 * envelope de erro. Nada aqui toca rede nem banco: são as PALAVRAS do sistema,
 * e por isso ficam num lugar só.
 *
 * Regra de dependência (Spec §3): este pacote não importa nenhum outro. Se ele
 * precisar de algo de fora, é sinal de que aquilo não era domínio.
 *
 * Escrito no MARCO 2.
 */

export * from './papel.js';
export * from './faixa.js';
export * from './escopo.js';
export * from './sessao.js';
export * from './erro.js';
export * from './envelope.js';
export * from './decisao.js';
export * from './cnj.js';
