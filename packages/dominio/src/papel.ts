/**
 * Papel — quem é a pessoa dentro do escritório
 * ---------------------------------------------------------------------------
 * A lista é fechada. Papel novo entra aqui e no banco (migração 001), nos dois
 * lugares, de propósito: um papel que existe só no código passaria pelo
 * `CHECK` do banco como erro de digitação, e um que existe só no banco nunca
 * seria concedido.
 */

export const PAPEIS = [
  'socio',
  'advogado',
  'estagiario',
  'secretaria',
  'financeiro',
  'ti',
  'cliente',
] as const;

export type Papel = (typeof PAPEIS)[number];

/**
 * Quem pode praticar ato com efeito jurídico ou de prazo.
 *
 * É a Regra 2 reduzida a uma função. Ela aparece em dois lugares — aqui e no
 * `CHECK aprovacao_a4_exige_advogado` do banco — e essa duplicação é
 * intencional: o banco recusa a linha, e o chassi recusa antes de tentar
 * gravá-la, com mensagem que faz sentido para quem está do outro lado.
 */
export function podeAprovarA4(papel: Papel): boolean {
  return papel === 'advogado' || papel === 'socio';
}

/** Advogado e sócio têm OAB; ninguém mais tem. Espelha o `CHECK` da migração 001. */
export function exigeOab(papel: Papel): boolean {
  return papel === 'advogado' || papel === 'socio';
}

export function ehPapel(valor: unknown): valor is Papel {
  return typeof valor === 'string' && (PAPEIS as readonly string[]).includes(valor);
}
