/**
 * resumo.ts — o que PODE entrar em `parametros_resumidos`
 * ---------------------------------------------------------------------------
 * Spec §9.4, regra 3: **a auditoria prova o que aconteceu; não é cópia do
 * acervo.** Número de processo inteiro, teor de peça e dado pessoal não entram.
 *
 * A razão é a mesma que torna a auditoria valiosa, invertida. A tabela é
 * append-only por gatilho e por permissão — nem UPDATE, nem DELETE, nem
 * TRUNCATE, e o gatilho vale até para o dono do banco. Isso é exatamente o que
 * se quer de uma prova. E é exatamente o que NÃO se quer de um vazamento:
 *
 *   > **Dado pessoal que entra aqui não sai nunca mais.**
 *
 * Não há apagamento seletivo, não há correção, e um pedido de eliminação sob a
 * LGPD encontra uma tabela desenhada para recusá-lo. A imutabilidade que
 * protege a prova protegeria o vazamento com o mesmo empenho.
 *
 * Por isso a barreira fica ANTES da escrita, e é a única posição em que ela
 * pode ficar. Depois do INSERT não existe conserto — existe incidente.
 *
 * ⚠️ ESTA FUNÇÃO NÃO É UM ANONIMIZADOR. Ela não limpa, não mascara e não
 * corta: ela **recusa**, e a recusa bloqueia a operação inteira, porque
 * `registrar` que lança é chamada que não acontece (D-77). É de propósito.
 * Limpar em silêncio ensinaria a próxima pessoa que dá para mandar qualquer
 * coisa que "o resumo cuida disso" — e um dia a expressão regular não pegaria,
 * e o dado entraria na tabela que não esquece.
 */

/**
 * Número CNJ, com ou sem pontuação. 20 dígitos é a forma canônica.
 *
 * Não uso `cnjValido` do domínio de propósito: aqui o dígito verificador não
 * importa. CNJ malformado continua sendo número de processo, e o que se está
 * impedindo é a presença do dado, não a sua correção.
 */
const PARECE_CNJ = /\b\d{7}-?\d{2}\.?\d{4}\.?\d\.?\d{2}\.?\d{4}\b|\b\d{20}\b/;

/** CPF com pontuação, e CNPJ. Sem pontuação, 11 dígitos soltos são ambíguos. */
const PARECE_CPF_OU_CNPJ = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/;

/** OAB, no formato que o projeto usa nos documentos. */
const PARECE_OAB = /\bOAB[\s/]*[A-Z]{2}[\s-]*\d{3,6}\b/i;

const PROIBIDOS: readonly (readonly [RegExp, string])[] = [
  [PARECE_CNJ, 'número de processo'],
  [PARECE_CPF_OU_CNPJ, 'CPF ou CNPJ'],
  [PARECE_OAB, 'inscrição na OAB'],
];

/**
 * Teto de tamanho. Não é sobre disco: é sobre PROPÓSITO.
 *
 * Resumo comprido deixou de ser resumo. O campo existe para dizer "qual etapa
 * recusou e com que código" — e nada que precise de 2 KB para ser dito cabe
 * nessa descrição. O teto é a barreira contra o dia em que alguém despejar o
 * corpo de uma resposta do fornecedor aqui "só para investigar".
 */
const TETO_DE_CARACTERES = 2_000;

export class ResumoRecusado extends Error {
  constructor(motivo: string) {
    super(
      `auditoria: o resumo foi recusado — ${motivo}. ` +
        `A tabela de auditoria é append-only e não tem apagamento seletivo: ` +
        `o que entra aqui não sai nunca mais (Spec §9.4, regra 3).`,
    );
    this.name = 'ResumoRecusado';
  }
}

/**
 * Confere o objeto que vai para `parametros_resumidos` e devolve o JSON.
 *
 * A varredura é sobre o TEXTO SERIALIZADO INTEIRO, e não campo a campo. Campo
 * a campo se enganaria com o dado aninhado três níveis abaixo, dentro de um
 * array, num objeto que ninguém lembrava que existia — que é exatamente onde
 * ele costuma estar.
 */
export function serializarResumo(resumo: Readonly<Record<string, unknown>>): string {
  let texto: string;
  try {
    texto = JSON.stringify(resumo);
  } catch {
    // Referência circular, BigInt, ou outra coisa que não vira JSON. Falha
    // fecha: sem resumo serializável, não há registro, e sem registro não há
    // operação.
    throw new ResumoRecusado('o conteúdo não pôde ser convertido em JSON');
  }

  if (texto === undefined) throw new ResumoRecusado('o conteúdo virou `undefined` ao serializar');

  if (texto.length > TETO_DE_CARACTERES) {
    throw new ResumoRecusado(
      `tem ${texto.length} caracteres e o teto é ${TETO_DE_CARACTERES} — ` +
        `resumo comprido deixou de ser resumo`,
    );
  }

  for (const [padrao, oque] of PROIBIDOS) {
    // A MENSAGEM NÃO REPETE O QUE ENCONTROU. Dizer "achei o CNJ 0000132-06…"
    // escreveria o dado no log do servidor, que é onde ele também não deve
    // estar. Diz-se o TIPO, e quem investiga vai à origem.
    if (padrao.test(texto)) throw new ResumoRecusado(`contém o que parece ser ${oque}`);
  }

  return texto;
}
