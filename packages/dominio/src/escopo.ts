/**
 * Escopo — o privilégio, escrito de forma que o código consiga conferir
 * ---------------------------------------------------------------------------
 * Convenção fixada em D-24:
 *
 *     <sistema>:<recurso>:<acao>[:<abrangencia>]
 *
 * Exemplos: `escavador:processo:read:carteira` · `trello:card:write`
 *
 * DUAS COISAS QUE ESTE ARQUIVO NÃO FAZ, E A AUSÊNCIA É A DECISÃO:
 *
 * 1. **Não existe curinga.** Nada de `escavador:*` nem de `*:read`. Um curinga
 *    concede o que ainda não foi escrito — inclusive a ferramenta perigosa que
 *    alguém vai acrescentar daqui a seis meses. Lista explícita, sempre
 *    (Regra 5).
 *
 * 2. **Não existe hierarquia entre ações.** `write` NÃO implica `read`. Parece
 *    conveniente e é armadilha: quem pode escrever num sistema nem sempre deve
 *    poder ler tudo dele, e a implicação silenciosa esconde exatamente essa
 *    diferença. Quem precisa das duas coisas recebe os dois escopos.
 */

export const ACOES = ['read', 'write', 'delete'] as const;
export type Acao = (typeof ACOES)[number];

/**
 * Abrangência — de QUAIS sujeitos esta concessão trata.
 *
 * É a metade que protege o sigilo. O escopo diz "pode consultar processo"; a
 * abrangência diz "quais processos".
 */
export const ABRANGENCIAS = ['own', 'carteira', 'any'] as const;
export type Abrangencia = (typeof ABRANGENCIAS)[number];

/** Ordem de amplitude. Usada para escolher entre duas concessões que servem. */
const AMPLITUDE: Record<Abrangencia, number> = { own: 0, carteira: 1, any: 2 };

export interface Escopo {
  readonly sistema: string;
  readonly recurso: string;
  readonly acao: Acao;
  /** Ausente na exigência da ferramenta; presente na concessão da sessão. */
  readonly abrangencia?: Abrangencia;
}

const PEDACO = /^[a-z][a-z0-9_]*$/;

/**
 * Lê um escopo de texto. Devolve `null` em vez de lançar exceção.
 *
 * Escopo malformado numa sessão significa concessão que ninguém consegue
 * conferir — e o chassi trata isso como concessão inexistente, não como erro
 * de programa. Exceção aqui subiria pela pilha e poderia ser engolida por um
 * `catch` distraído lá em cima; `null` obriga quem chama a decidir.
 */
export function lerEscopo(texto: string): Escopo | null {
  if (typeof texto !== 'string') return null;
  const partes = texto.split(':');
  if (partes.length < 3 || partes.length > 4) return null;

  const [sistema, recurso, acao, abrangencia] = partes;
  if (!sistema || !PEDACO.test(sistema)) return null;
  if (!recurso || !PEDACO.test(recurso)) return null;
  if (!acao || !(ACOES as readonly string[]).includes(acao)) return null;

  if (abrangencia === undefined) {
    return { sistema, recurso, acao: acao as Acao };
  }
  if (!(ABRANGENCIAS as readonly string[]).includes(abrangencia)) return null;
  return { sistema, recurso, acao: acao as Acao, abrangencia: abrangencia as Abrangencia };
}

export function escreverEscopo(e: Escopo): string {
  const base = `${e.sistema}:${e.recurso}:${e.acao}`;
  return e.abrangencia ? `${base}:${e.abrangencia}` : base;
}

/**
 * A concessão serve para a exigência?
 *
 * Só e exatamente quando sistema, recurso e ação são **iguais**. A abrangência
 * da concessão não entra nesta pergunta: ela responde a próxima, que é "sobre
 * quais sujeitos" — e essa é conferida na etapa de abrangência, contra dados
 * que o agente não controla.
 */
export function concessaoAtende(concessao: Escopo, exigencia: Escopo): boolean {
  return (
    concessao.sistema === exigencia.sistema &&
    concessao.recurso === exigencia.recurso &&
    concessao.acao === exigencia.acao
  );
}

/**
 * Entre as concessões que atendem, qual abrangência vale.
 *
 * Vale a **mais ampla** — e isso não é afrouxar nada: se a sessão traz
 * `:own` e `:any` para o mesmo recurso, a pessoa de fato recebeu `any`, e
 * fingir o contrário seria negar privilégio que o Policy Gate concedeu.
 *
 * Concessão sem abrangência escrita é tratada como `own`, a mais estreita.
 * É o caso que mais aparece por engano — alguém escreve
 * `escavador:processo:read` achando que concedeu tudo — e o padrão seguro é
 * conceder o mínimo, não o máximo (Regra 5).
 *
 * Devolve `null` quando nenhuma concessão atende.
 */
export function abrangenciaConcedida(
  concessoes: readonly Escopo[],
  exigencia: Escopo,
): Abrangencia | null {
  let melhor: Abrangencia | null = null;
  for (const c of concessoes) {
    if (!concessaoAtende(c, exigencia)) continue;
    const desta = c.abrangencia ?? 'own';
    if (melhor === null || AMPLITUDE[desta] > AMPLITUDE[melhor]) melhor = desta;
  }
  return melhor;
}

/** Lê uma lista de escopos, descartando em silêncio os que não se leem. */
export function lerEscopos(textos: readonly string[]): Escopo[] {
  const saida: Escopo[] = [];
  for (const t of textos) {
    const e = lerEscopo(t);
    if (e) saida.push(e);
  }
  return saida;
}
