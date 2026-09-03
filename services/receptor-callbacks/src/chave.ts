/**
 * chave.ts — a identidade de um evento que chega mais de uma vez
 * ---------------------------------------------------------------------------
 * Duas perguntas diferentes, duas chaves diferentes. Confundi-las é o defeito
 * que a D-116 registrou depois de medi-lo.
 *
 *   `chave_evento`  — "esta ENTREGA já foi processada?"
 *   `id_externo`    — "esta PUBLICAÇÃO já está na base?"
 *
 * ⚠️ O QUE **NÃO** É CHAVE: o `uuid` do envelope.
 *
 * Medido em 26/08: a mesma solicitação chegou três vezes, com três `uuid`
 * diferentes — o `uuid` identifica a TENTATIVA DE ENTREGA, não o fato. Duas
 * daquelas entregas tinham corpo idêntico byte a byte. Deduplicar por `uuid`
 * teria deixado as três passarem.
 *
 * E confirmado outra vez em 02/09, pelo avesso: as 30 aparições trouxeram 30
 * `uuid` distintos para 30 publicações distintas — o que **não prova nada**,
 * porque nenhuma foi reentregue na janela. Amostra que não contém o caso
 * problemático não absolve o campo.
 */

import { createHash } from 'node:crypto';

/**
 * Campos que pertencem ao ENVELOPE, não ao fato. Saem antes do resumo.
 *
 * A lista é curta de propósito. Cada nome aqui é uma afirmação de que aquele
 * campo muda entre duas entregas do mesmo fato — e afirmação dessas se sustenta
 * em medição, não em intuição. `uuid` está aqui porque foi medido variando
 * (D-116). Nada mais entra sem a mesma prova.
 */
const ENVELOPE = new Set(['uuid']);

/**
 * Serializa de forma **estável**: chaves ordenadas, em profundidade.
 *
 * `JSON.stringify` preserva a ordem de inserção do objeto, e essa ordem pode
 * mudar entre duas entregas do mesmo conteúdo sem que nada de fato tenha
 * mudado. Um resumo sensível à ordem produziria chaves diferentes para fatos
 * iguais — que é exatamente o defeito que este arquivo existe para não ter.
 */
function estavel(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(estavel);
  const o = v as Record<string, unknown>;
  const saida: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) saida[k] = estavel(o[k]);
  return saida;
}

/** Remove o envelope de entrega. Só no nível de cima — o envelope é raso. */
export function semEnvelope(corpo: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const saida: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(corpo)) if (!ENVELOPE.has(k)) saida[k] = v;
  return saida;
}

/**
 * A chave de idempotência da entrega: SHA-256 do conteúdo sem o envelope.
 *
 * Devolve texto, e a unicidade é imposta pelo BANCO — `evento_callback_chave_unica`.
 * Não por um `if` que consulta antes de inserir: duas entregas simultâneas
 * passariam pelo `if` as duas, e a corrida só aparece em produção, no dia em
 * que o fornecedor reenviar em paralelo.
 */
export function chaveDoEvento(corpo: Readonly<Record<string, unknown>>): string {
  return createHash('sha256').update(JSON.stringify(estavel(semEnvelope(corpo)))).digest('hex');
}

/** Resumo de um texto qualquer — o `hash` de `publicacao`, sobre o teor. */
export function resumoDoTeor(teor: string): string {
  return createHash('sha256').update(teor).digest('hex');
}
