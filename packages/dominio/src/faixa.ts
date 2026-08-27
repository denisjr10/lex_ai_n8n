/**
 * Faixa de autorização — quanto dano a ação pode causar
 * ---------------------------------------------------------------------------
 * Vem de `04-modelo-de-identidade-e-autorizacao.md` §5.1. É a escala que
 * decide se uma ação sai sozinha ou espera um humano.
 *
 *   A0  leitura interna .............. automático
 *   A1  leitura externa PAGA ......... automático dentro da quota
 *   A2  escrita interna .............. automático, reversível, registrado
 *   A3  comunicação externa .......... aprovação obrigatória
 *   A4  efeito jurídico ou de prazo .. aprovação obrigatória, SEM EXCEÇÃO
 *
 * A distinção que sustenta a Regra 2 está entre A2 e A3: o que é reversível
 * dentro de casa sai sozinho; o que sai de casa, não. E A4 é a faixa onde a
 * plataforma nunca decide — nem quando o agente tem certeza, nem quando o
 * prazo está apertado, nem quando o advogado pediu para "deixar automático".
 */

export const FAIXAS = ['A0', 'A1', 'A2', 'A3', 'A4'] as const;

export type Faixa = (typeof FAIXAS)[number];

/** Faixas que exigem aprovação humana registrada antes de executar. */
export function exigeAprovacao(faixa: Faixa): boolean {
  return faixa === 'A3' || faixa === 'A4';
}

/**
 * Faixas em que a aprovação precisa ser de advogado ou sócio, **nominalmente**.
 *
 * Hoje só A4. A3 também exige advogado pela tabela de §5.1, mas por decisão de
 * rito — e rito é configuração do escritório (Parte II). A4 é diferente: é
 * trava de projeto. Sem identidade individual, A4 não se libera (R-11).
 */
export function exigeAdvogadoNominal(faixa: Faixa): boolean {
  return faixa === 'A4';
}

/**
 * Faixas que gastam dinheiro de fornecedor externo.
 *
 * Só A1 por enquanto. Serve ao motor de custo (marco 4): faixa que não gasta
 * não passa por reserva de orçamento, e não faz sentido degradar para cache
 * uma operação que não custa nada.
 */
export function gastaCredito(faixa: Faixa): boolean {
  return faixa === 'A1';
}

export function ehFaixa(valor: unknown): valor is Faixa {
  return typeof valor === 'string' && (FAIXAS as readonly string[]).includes(valor);
}
