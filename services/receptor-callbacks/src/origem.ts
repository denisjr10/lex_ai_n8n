/**
 * origem.ts — o receptor confere o segredo, em vez de acreditar em quem chama
 * ---------------------------------------------------------------------------
 * A Spec §8.1 lista **"Validar a origem"** como a etapa 1 do receptor, com
 * *"falha fecha"* escrito ao lado. Até 10/09 o receptor não validava nada:
 * recebia um booleano já decidido por um nó do n8n e acreditava.
 *
 * O problema não é desconfiança do n8n. São dois, e o segundo é o grave:
 *
 * 1. O veredito trafegava pelo **histórico de execução do n8n**, do qual 98,5%
 *    dos registros já sumiram (medido em 02/09). A prova da conferência era
 *    mais efêmera que o fato conferido.
 * 2. **Quem chama decidia se a origem era válida** — o mesmo formato do
 *    problema que a D-237 tratou no chassi: o objeto de decisão chega pronto de
 *    fora, e quem chama define a própria autorização.
 *
 * A correção definitiva é o endpoint próprio (marco 8), em que o receptor
 * recebe a requisição HTTP e confere o segredo antes de qualquer outra coisa.
 * Este arquivo é o que dá para fazer antes disso: reconferir a partir dos
 * cabeçalhos que o nó carimba, para que o veredito de fora deixe de ser a
 * única barreira.
 */

import { timingSafeEqual } from 'node:crypto';

/** De onde saiu o veredito de origem gravado no evento. */
export type ConferidaPor =
  /** O receptor conferiu o segredo nos cabeçalhos. */
  | 'servico'
  /** Veredito recebido pronto de quem chamou. Provisório, até o marco 8. */
  | 'n8n'
  /** Não havia como conferir — e nesse caso a origem **não** é válida. */
  | 'ninguem';

export interface Conferencia {
  readonly origem_valida: boolean;
  readonly conferida_por: ConferidaPor;
  /**
   * O veredito de quem chamou discordou do nosso?
   *
   * Divergência é **sinal de segurança**, não ruído de integração: ou o segredo
   * girou e alguém não avisou, ou o nó está com regra diferente da nossa, ou
   * uma entrega passou por um caminho que não deveria existir. Nos três casos
   * alguém precisa olhar.
   */
  readonly divergiu: boolean;
}

/**
 * O segredo do callback deste fornecedor, lido do ambiente.
 *
 * **Sem padrão, de propósito.** Um valor de reserva aqui produziria exatamente
 * a falha silenciosa que a Regra 5 proíbe: o receptor subiria conferindo contra
 * um segredo que não é o do fornecedor, recusaria tudo, e pareceria estar
 * funcionando — ou, pior, aceitaria tudo.
 *
 * Ausente significa **não sei conferir**, e não sei conferir fecha.
 */
export function segredoDoCallback(
  fornecedor: string,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const chave = `LEX_CALLBACK_SEGREDO_${fornecedor.toUpperCase()}`;
  const valor = env[chave];
  return valor && valor.length > 0 ? valor : null;
}

/**
 * Lê o token do cabeçalho `Authorization`.
 *
 * O Escavador manda o token cru; aceita-se também `Bearer <token>`, porque a
 * documentação dele não é explícita e o formato mudou uma vez sem aviso.
 *
 * Os nomes de cabeçalho são conferidos sem distinguir caixa: HTTP não
 * distingue, e o que chega aqui já passou por um nó do n8n que pode ter
 * normalizado de um jeito ou de outro.
 */
function tokenDoCabecalho(cabecalhos: Readonly<Record<string, unknown>>): string | null {
  for (const [nome, valor] of Object.entries(cabecalhos)) {
    if (nome.toLowerCase() !== 'authorization') continue;
    if (typeof valor !== 'string') continue;
    const limpo = valor.replace(/^Bearer\s+/i, '').trim();
    return limpo.length > 0 ? limpo : null;
  }
  return null;
}

/**
 * Compara dois segredos em tempo constante.
 *
 * `timingSafeEqual` exige buffers do mesmo tamanho e lança quando não são —
 * então o tamanho é conferido antes, e **tamanho diferente já é recusa**. Isso
 * revela o comprimento do segredo esperado a quem medir com muito cuidado, o
 * que é um preço conhecido e pequeno perto de comparar com `===`, que vaza o
 * prefixo correto caractere a caractere.
 */
function iguaisEmTempoConstante(a: string, b: string): boolean {
  const A = Buffer.from(a, 'utf8');
  const B = Buffer.from(b, 'utf8');
  if (A.length !== B.length) return false;
  return timingSafeEqual(A, B);
}

/**
 * Confere a origem da entrega, e diz quem decidiu.
 *
 * ⚠️ **A ordem de precedência é a propriedade deste arquivo:** quando o serviço
 * consegue conferir, o veredito dele vale — inclusive quando ele **contradiz**
 * quem chamou. O veredito de fora nunca promove uma entrega que nós recusamos,
 * e nunca é a única barreira.
 *
 * Quando o serviço **não** consegue conferir — sem segredo configurado, sem
 * cabeçalho, sem `Authorization` —, a resposta é `origem_valida: false` com
 * `conferida_por: 'ninguem'`. Falha fecha (Regra 5).
 *
 * Note o que isso **não** faz: não descarta a entrega. O evento é gravado de
 * todo modo, porque entrega não autenticada é sinal de segurança e apagar sinal
 * de segurança por ele ser inválido é apagar a evidência de que alguém está
 * batendo na porta. O que a recusa impede é a entrega virar **publicação**.
 */
export function conferirOrigem(
  cabecalhos: Readonly<Record<string, unknown>> | undefined,
  segredo: string | null,
  vereditoDeQuemChamou?: boolean,
): Conferencia {
  if (segredo === null || cabecalhos === undefined) {
    return { origem_valida: false, conferida_por: 'ninguem', divergiu: false };
  }

  const token = tokenDoCabecalho(cabecalhos);
  if (token === null) {
    // Cabeçalhos chegaram e não trazem `Authorization`. Isso é conferência
    // feita, com resultado negativo — diferente de não ter como conferir.
    return {
      origem_valida: false,
      conferida_por: 'servico',
      divergiu: vereditoDeQuemChamou === true,
    };
  }

  const valida = iguaisEmTempoConstante(token, segredo);
  return {
    origem_valida: valida,
    conferida_por: 'servico',
    divergiu: vereditoDeQuemChamou !== undefined && vereditoDeQuemChamou !== valida,
  };
}
