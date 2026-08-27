/**
 * @lex/policy-gate — quem pode o quê, agora
 * ---------------------------------------------------------------------------
 * Responde uma pergunta só, e responde bem: "esta pessoa, neste canal, pode
 * fazer isto — e com que limites?". Emite a sessão que o servidor MCP valida.
 *
 * Duas decisões de desenho, ambas na Spec §5:
 *
 *   * a sessão é token assinado de VIDA CURTA, validado offline pelo servidor,
 *     com lista de revogação consultada a cada chamada (D-69). Validar offline
 *     é rápido; a janela entre revogar e expirar é o preço, e por isso a sessão
 *     dura minutos
 *   * faixa A4 — ato com efeito jurídico ou de prazo — RECONSULTA o Policy
 *     Gate. Para o que não se desfaz, a janela não vale a velocidade
 *
 * Falha fecha (Regra 5): Policy Gate indisponível BLOQUEIA, nunca libera.
 * Preenchido no MARCO 9 (Spec §15).
 */
export {}
