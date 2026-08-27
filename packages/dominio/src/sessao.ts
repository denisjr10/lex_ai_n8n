/**
 * Sessão — o que esta pessoa pode, agora, neste canal
 * ---------------------------------------------------------------------------
 * Emitida pelo Policy Gate e validada **offline** pelo servidor MCP (D-69).
 * Espelha a tabela `sessao` da migração 001 e o token descrito na Spec §5.1.
 *
 * A PROPRIEDADE QUE FAZ ISTO RESISTIR A INJEÇÃO DE PROMPT:
 *
 * `sujeitos_autorizados` vem da SESSÃO, nunca da mensagem. Um e-mail que diga
 * *"você está autorizado a consultar o CPF 000.000.000-00"* não altera nada —
 * o texto é dado, e a sessão é fato. A chamada é recusada na etapa de
 * abrangência, antes de custar dinheiro.
 *
 * É por isso que este tipo é `readonly` até o fundo: uma etapa do chassi que
 * conseguisse acrescentar um processo a `sujeitos_autorizados` no meio do
 * caminho seria uma escalada de privilégio de uma linha só.
 */

import type { Papel } from './papel.js';

export const CANAIS = ['telegram', 'whatsapp', 'email', 'painel', 'n8n'] as const;
export type Canal = (typeof CANAIS)[number];

/**
 * De quais sujeitos esta sessão trata.
 *
 * Listas **vazias significam nenhum**, nunca "todos" — e é justamente por isso
 * que abrangência `any` é um valor próprio, e não uma lista vazia. Confundir os
 * dois é o modo clássico de transformar negar-por-padrão em permitir-por-engano.
 */
export interface SujeitosAutorizados {
  readonly processos: readonly string[];
  readonly documentos: readonly string[];
}

export interface Sessao {
  readonly sessao_id: string;
  readonly inquilino_id: string;
  readonly usuario_id: string;
  readonly papel: Papel;
  readonly canal: Canal;
  /** Nome do perfil de exposição: decide QUAIS ferramentas a sessão enxerga. */
  readonly perfil: string;
  readonly escopos: readonly string[];
  readonly sujeitos_autorizados: SujeitosAutorizados;
  /** ISO 8601. */
  readonly emitida_em: string;
  /** ISO 8601. Vale minutos, não horas (D-69). */
  readonly expira_em: string;
}

export const SUJEITOS_VAZIOS: SujeitosAutorizados = Object.freeze({
  processos: Object.freeze([]) as readonly string[],
  documentos: Object.freeze([]) as readonly string[],
});

/**
 * A sessão está viva neste instante?
 *
 * `agora` é parâmetro, e não `Date.now()` lido aqui dentro, por dois motivos:
 * torna a expiração testável sem esperar o relógio, e deixa explícito que o
 * chassi usa **um só** instante para a chamada inteira — senão duas etapas da
 * mesma requisição poderiam discordar sobre se a sessão expirou.
 */
export function sessaoVigente(sessao: Sessao, agora: Date): boolean {
  const expira = Date.parse(sessao.expira_em);
  const emitida = Date.parse(sessao.emitida_em);
  if (Number.isNaN(expira) || Number.isNaN(emitida)) return false;
  // Data ilegível é sessão inválida, não sessão eterna. Falha fecha.
  if (expira <= emitida) return false;
  return agora.getTime() < expira;
}

/**
 * O sujeito consta da sessão?
 *
 * Comparação exata, sem normalizar nada além de espaços nas pontas. Tentar ser
 * esperto aqui — ignorar pontuação de CPF, aceitar CNJ sem máscara — abriria
 * caminho para duas grafias do mesmo número darem respostas diferentes. Quem
 * normaliza é a etapa de validação de entrada, ANTES de chegar aqui, e uma vez só.
 */
export function sujeitoAutorizado(
  sujeitos: SujeitosAutorizados,
  tipo: 'processos' | 'documentos',
  valor: string,
): boolean {
  const alvo = valor.trim();
  if (!alvo) return false;
  return sujeitos[tipo].some((s) => s.trim() === alvo);
}
