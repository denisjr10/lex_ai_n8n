/**
 * Número CNJ — formato e dígito verificador
 * ---------------------------------------------------------------------------
 * Resolução CNJ 65/2008, ISO 7064 MOD 97-10. Aritmética local: não toca a rede
 * e não custa nada.
 *
 * POR QUE ISTO É CONTROLE DE CUSTO, E NÃO SÓ VALIDAÇÃO
 *
 * Um CNJ com dígito errado devolve 404 da API — e **404 custa o mesmo que 200**
 * (§0.2 do orçamento). Conferir aqui é o passo mais barato do chassi que evita
 * o gasto mais bobo: pagar R$ 2,95 para descobrir que alguém digitou errado.
 *
 * Esta mesma aritmética já vive nos scripts de captura. A duplicação é
 * consciente: `captura/` roda sem depender de nada compilado, e obrigá-la a
 * importar deste pacote acrescentaria uma etapa de build a um script cuja
 * virtude é rodar direto.
 */

const FORMATO = /^(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})$/;

export function formatoCnjValido(valor: string): boolean {
  return FORMATO.test(valor);
}

/**
 * Formato **e** dígito verificador.
 *
 * Devolve `false` para qualquer coisa que não sirva, sem lançar: um CNJ
 * inválido é entrada de usuário errada, não defeito de programa.
 */
export function cnjValido(valor: string): boolean {
  if (typeof valor !== 'string') return false;
  const m = FORMATO.exec(valor);
  if (!m) return false;

  const [, sequencial, digito, ano, justica, tribunal, origem] = m;
  if (!sequencial || !digito || !ano || !justica || !tribunal || !origem) return false;

  const base = BigInt(sequencial + ano + justica + tribunal + origem);
  const esperado = String(98n - ((base * 100n) % 97n)).padStart(2, '0');
  return esperado === digito;
}

/**
 * Normaliza para a forma canônica com máscara.
 *
 * Aceita o número só com dígitos (20 deles) e devolve com pontuação. Devolve
 * `null` se não der para normalizar.
 *
 * A normalização acontece **uma vez**, na validação de entrada, e nunca depois:
 * a comparação contra `sujeitos_autorizados` é exata de propósito, e duas
 * grafias do mesmo número dando respostas diferentes é exatamente o defeito
 * que normalizar cedo — e só uma vez — evita.
 */
export function normalizarCnj(valor: string): string | null {
  if (typeof valor !== 'string') return null;
  const limpo = valor.trim();
  if (formatoCnjValido(limpo)) return cnjValido(limpo) ? limpo : null;

  const so = limpo.replace(/\D/g, '');
  if (so.length !== 20) return null;
  const mascarado =
    `${so.slice(0, 7)}-${so.slice(7, 9)}.${so.slice(9, 13)}.` +
    `${so.slice(13, 14)}.${so.slice(14, 16)}.${so.slice(16, 20)}`;
  return cnjValido(mascarado) ? mascarado : null;
}
