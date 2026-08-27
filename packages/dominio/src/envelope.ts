/**
 * Envelope — a forma única que toda ferramenta devolve
 * ---------------------------------------------------------------------------
 * Spec §4.3 e §4.4. O agente aprende uma forma, não quinze.
 *
 * `origem`, `idade_segundos` e `custo_centavos` são **obrigatórios em toda
 * resposta**. Não são telemetria: são o que permite ao agente cumprir RF-03 —
 * toda afirmação factual aponta a fonte e a idade do dado. Resposta sem esses
 * campos é defeito, não estilo, e por isso eles não são opcionais no tipo.
 */

import type { ErroInterno } from './erro.js';

export const ORIGENS = ['api', 'cache', 'base_interna', 'interno'] as const;
export type Origem = (typeof ORIGENS)[number];

export interface MetaResposta {
  readonly origem: Origem;
  /** Zero quando o dado acabou de ser buscado. Nunca ausente. */
  readonly idade_segundos: number;
  /** Zero em cache e em operação interna. Nunca ausente. */
  readonly custo_centavos: number;
  /**
   * Há mais resultados do que os devolvidos?
   *
   * Cumpre D-57: havendo mais, a ferramenta **informa** em vez de buscar. Cada
   * bloco a mais custa dinheiro (R-25), e a decisão de gastar é de quem pede.
   */
  readonly ha_mais: boolean;
  readonly proximo_cursor: string | null;
  readonly requisicao_id: string;
}

export interface Resposta<T> {
  readonly dados: T;
  readonly meta: MetaResposta;
  readonly avisos: readonly string[];
}

export interface RespostaDeErro {
  readonly erro: ErroInterno;
}

export type Envelope<T> = Resposta<T> | RespostaDeErro;

export function ehErro<T>(e: Envelope<T>): e is RespostaDeErro {
  return 'erro' in e;
}

export interface OpcoesDeResposta {
  readonly origem: Origem;
  readonly requisicao_id: string;
  readonly idade_segundos?: number;
  readonly custo_centavos?: number;
  readonly ha_mais?: boolean;
  readonly proximo_cursor?: string | null;
  readonly avisos?: readonly string[];
}

/**
 * Monta uma resposta de sucesso.
 *
 * Os padrões são os conservadores: idade zero, custo zero, sem mais páginas.
 * Um padrão errado aqui vira mentira no envelope — o agente afirmaria ao
 * advogado que o dado é fresco quando não é —, então os campos que o chassi
 * sabe preencher, ele preenche explicitamente, e os que não sabe ficam no
 * valor que não engana ninguém.
 */
export function responder<T>(dados: T, opcoes: OpcoesDeResposta): Resposta<T> {
  return {
    dados,
    meta: {
      origem: opcoes.origem,
      idade_segundos: opcoes.idade_segundos ?? 0,
      custo_centavos: opcoes.custo_centavos ?? 0,
      ha_mais: opcoes.ha_mais ?? false,
      proximo_cursor: opcoes.proximo_cursor ?? null,
      requisicao_id: opcoes.requisicao_id,
    },
    avisos: opcoes.avisos ?? [],
  };
}

export function responderErro(erro: ErroInterno, requisicao_id: string): RespostaDeErro {
  return { erro: { ...erro, requisicao_id } };
}

/**
 * O aviso que acompanha dado servido do cache.
 *
 * Existe como função, e não como texto solto no meio do chassi, porque ele é
 * parte do contrato com o agente: é assim que o agente sabe que pode oferecer
 * uma consulta nova ao usuário em vez de afirmar como se fosse de agora.
 */
export function avisoDeCache(idadeSegundos: number): string {
  const minutos = Math.round(idadeSegundos / 60);
  const quanto =
    minutos < 1 ? 'menos de um minuto' : minutos === 1 ? '1 minuto' : `${minutos} minutos`;
  return `Dado servido do cache, com ${quanto}. Para forçar consulta nova, peça atualização.`;
}
