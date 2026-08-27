/**
 * @lex/sdk-escavador — a API do Escavador, tipada, inteira
 * ---------------------------------------------------------------------------
 * Cobertura de V1 e V2. As duas, e não uma: elas são complementares, e a V1 é
 * dona dos diários oficiais, que é onde o prazo nasce.
 *
 * ESTE PACOTE NÃO DECIDE PRIVILÉGIO. Ele sabe falar com a API; quem decide se
 * pode é o chassi (Spec §3, regra 2). Misturar os dois é o caminho mais curto
 * para um privilégio que vaza.
 *
 * Duas coisas que a captura já mediu, e que este SDK vai ter de tratar:
 *
 *   1. Os envelopes de paginação de V1 e V2 são DIFERENTES (D-125). A V1
 *      devolve `items` + `links` + `paginator`, com `total`; a V2 pagina por
 *      cursor e não informa total. Só a V1 permite saber quantos itens existem
 *      antes de paginar — que é o que o motor de custo precisa para reservar
 *      pelo pior caso em vez de pela média
 *   2. O custo varia por rota e só se conhece DEPOIS, no cabeçalho
 *      `Creditos-Utilizados` (D-108). O SDK devolve o custo medido junto com o
 *      dado; quem reconcilia é o chassi
 *
 * Construído sobre GRAVAÇÕES, e a CI nunca chama a API real (D-78).
 * Preenchido no MARCO 6 (Spec §15).
 */
export {}
