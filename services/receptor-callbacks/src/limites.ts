/**
 * limites.ts — os tetos que o conteúdo externo não atravessa
 * ---------------------------------------------------------------------------
 * A Regra Inegociável 4 diz que conteúdo externo é hostil. Até 10/09 ele era
 * tratado como bem-comportado: `teor` entrava sem teto, nome de envolvido
 * também, a lista de envolvidos era percorrida inteira, e a função que
 * estabiliza o JSON para a chave de idempotência era recursiva **sem limite de
 * profundidade** — um objeto aninhado o suficiente derrubava a pilha antes de
 * o evento ser gravado (D-241).
 *
 * ---------------------------------------------------------------------------
 * A REGRA QUE GOVERNA ESTE ARQUIVO: ESTOURAR NÃO DESCARTA
 *
 * Nada aqui recusa uma entrega. O que estoura é **cortado e registrado**, e o
 * evento segue o ciclo normal.
 *
 * O motivo está escrito na migração 013, que consertou o defeito oposto: uma
 * restrição de unicidade sobre o teor descartou **seis intimações de seis
 * processos diferentes**, em silêncio, sem erro nenhum. Descartar conteúdo
 * externo porque ele é grande demais seria o mesmo defeito com outra causa — e
 * o material aqui é publicação de diário oficial, que alimenta alerta de prazo.
 *
 * Perder é o pior desfecho possível. Cortar e avisar é o segundo pior, e a
 * distância entre os dois é toda a diferença.
 */

/**
 * Os tetos, e a origem de cada número.
 *
 * ⚠️ São **primeiras aproximações**, não constantes sagradas. O valor medido de
 * cada estouro fica em `evento_callback.truncagem`, exatamente para que estes
 * números possam ser calibrados contra a realidade em vez de defendidos.
 */
export const LIMITES = {
  /**
   * 200 KB de teor.
   *
   * A maior publicação real medida na captura de agosto tem alguns milhares de
   * caracteres; sentença longa com ementa chega a dezenas de milhares. 200 KB é
   * uma ordem de grandeza acima do pior caso observado — folgado de propósito,
   * porque um teto apertado corta conteúdo legítimo e é o tipo de defeito que
   * só aparece no caso raro e importante.
   */
  teor_bytes: 200 * 1024,

  /**
   * 300 caracteres de nome.
   *
   * Nome de parte com qualificação completa — "ESPÓLIO DE FULANO DE TAL,
   * REPRESENTADO POR..." — passa de 100 com folga. 300 acomoda isso e recusa o
   * campo que virou depósito de texto.
   */
  nome_caracteres: 300,

  /**
   * 200 envolvidos por publicação.
   *
   * Ação coletiva tem muitos polos, e o número existe para conter a lista
   * absurda, não a lista grande. Estourar aqui é sinal de que vale olhar: ou a
   * fonte mudou de formato, ou é um caso que merece tratamento próprio.
   */
  envolvidos: 200,

  /**
   * 32 níveis de aninhamento.
   *
   * Este é o único teto que também é defesa contra travamento, e não só contra
   * volume: a estabilização do JSON é recursiva, e sem teto um objeto aninhado
   * de propósito derruba a pilha **antes** de o evento chegar ao banco. Com o
   * teto, a recursão não passa de 32 quadros.
   *
   * O payload real do Escavador não passa de 6 níveis.
   */
  profundidade: 32,
} as const;

/** O que estourou, e por quanto. Vira `evento_callback.truncagem`. */
export interface Truncagem {
  /** Tamanho original do teor, em bytes, quando ele passou do teto. */
  readonly teor_bytes?: number;
  /** Comprimento do nome mais longo que foi cortado. */
  readonly nome_caracteres?: number;
  /** Quantidade original de envolvidos, quando passou do teto. */
  readonly envolvidos?: number;
  /** Presente quando o aninhamento passou de `LIMITES.profundidade`. */
  readonly profundidade?: number;
}

const codificador = new TextEncoder();

/** Tamanho de um texto em bytes UTF-8 — que é o que o teto mede. */
export function bytesDe(texto: string): number {
  return codificador.encode(texto).length;
}

/**
 * Corta um texto no teto de **bytes**, sem partir um caractere ao meio.
 *
 * Percorre por *code point* em vez de fatiar o buffer: fatiar bytes cortaria um
 * caractere multibyte no meio e produziria o caractere de substituição — um
 * defeito que só apareceria em nome com acento, que aqui é a maioria deles.
 */
export function cortarPorBytes(texto: string, tetoEmBytes: number): string {
  if (bytesDe(texto) <= tetoEmBytes) return texto;

  let bytes = 0;
  let saida = '';
  for (const caractere of texto) {
    const tamanho = codificador.encode(caractere).length;
    if (bytes + tamanho > tetoEmBytes) break;
    bytes += tamanho;
    saida += caractere;
  }
  return saida;
}

/** Corta um texto no teto de caracteres. */
export function cortarPorCaracteres(texto: string, teto: number): string {
  return [...texto].length <= teto ? texto : [...texto].slice(0, teto).join('');
}

/** Junta as partes numa `Truncagem`, ou devolve `null` quando nada estourou. */
export function montarTruncagem(partes: Truncagem): Truncagem | null {
  return Object.keys(partes).length === 0 ? null : partes;
}
