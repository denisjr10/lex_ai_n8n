/**
 * Decisão — permitir ou negar, como VALOR e não como exceção
 * ---------------------------------------------------------------------------
 * Toda etapa de controle do chassi devolve uma `Decisao`. Nenhuma delas lança.
 *
 * POR QUE ISSO IMPORTA MAIS DO QUE PARECE
 *
 * Exceção é um canal que pode ser fechado sem querer. Basta um
 * `try { ... } catch { /* segue o jogo *\/ }` em qualquer camada acima para
 * que uma recusa de privilégio vire silêncio — e silêncio, num sistema que
 * nega por padrão, é indistinguível de permissão. O defeito não apareceria em
 * teste nenhum: a chamada funcionaria.
 *
 * Valor não some. Quem chama precisa olhar `permitido`, e o compilador cobra:
 * o campo `erro` só existe no ramo negado, então não há como usar o resultado
 * sem antes decidir o que fazer com a recusa.
 *
 * É a Regra 1 na forma de tipo — o privilégio deixa de depender da disciplina
 * de quem escreve o `catch`.
 */

import type { ErroInterno } from './erro.js';

export type Decisao =
  | { readonly permitido: true }
  | { readonly permitido: false; readonly erro: ErroInterno };

export const PERMITIDO: Decisao = Object.freeze({ permitido: true as const });

export function negar(erro: ErroInterno): Decisao {
  return { permitido: false, erro };
}

/**
 * Roda as etapas na ordem e para na primeira recusa.
 *
 * Duas propriedades, e as duas são de segurança:
 *
 * 1. **Curto-circuito.** A primeira negativa encerra. As etapas seguintes não
 *    rodam — e é por isso que uma recusa de escopo não chega a custar crédito.
 * 2. **Ordem fixa.** As etapas chegam numa lista, e a lista é montada num lugar
 *    só. Não há como uma ferramenta reordenar a própria verificação.
 */
export function primeiraRecusa(etapas: readonly (() => Decisao)[]): Decisao {
  for (const etapa of etapas) {
    const d = etapa();
    if (!d.permitido) return d;
  }
  return PERMITIDO;
}
