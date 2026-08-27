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
 * Preenchido no MARCO 2 (Spec §15). O marco 1 entrega o esqueleto e o banco.
 */
export {}
