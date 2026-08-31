/**
 * A ferramenta declara; o chassi decide
 * ---------------------------------------------------------------------------
 * Spec §4.1. Esta é a ideia central do projeto inteiro, e cabe numa frase.
 *
 * Uma ferramenta MCP **não chama o Policy Gate, não lê token, não mede custo,
 * não escreve auditoria e não decide se pode**. Ela declara o que é, e o chassi
 * faz o resto.
 *
 * O motivo é de segurança, não de elegância: se cada ferramenta aplicasse o
 * próprio controle, a fronteira de segurança do projeto passaria a depender da
 * disciplina de quem escreve ferramenta. Bastaria uma esquecer uma linha.
 *
 * Com o chassi no caminho obrigatório, **é impossível escrever uma ferramenta
 * que não seja verificada** — não existe caminho alternativo até a API, porque
 * a ferramenta não recebe nada com que construir um.
 */

import type { Faixa } from '@lex/dominio';
import { A3A_DISPONIVEL, ehFaixa, lerEscopo, type Escopo } from '@lex/dominio';
import { conferirEsquema, type Esquema, type Lido } from './esquema.js';

/**
 * Os sujeitos que esta chamada toca — o que será conferido contra a sessão.
 *
 * Devolver listas vazias significa "esta chamada não trata de sujeito nenhum".
 * O chassi trata isso com rigor: sob abrangência `own` ou `carteira`, uma
 * chamada sem sujeito **é recusada**, porque não há o que conferir. Ver
 * `etapas/abrangencia.ts`.
 */
export interface Sujeitos {
  readonly processos?: readonly string[];
  readonly documentos?: readonly string[];
}

/**
 * O contexto entregue à ferramenta na execução.
 *
 * ⚠️ NÃO CONTÉM CREDENCIAL, e não vai conter. Ele carrega **clientes já
 * autenticados** — a ferramenta pede `ctx.escavador.processoPorCnj(...)` e
 * nunca vê o token que tornou aquilo possível.
 *
 * No marco 2 ele só carrega correlação. Os clientes entram no marco 6, quando
 * houver SDK; o registro de custo, no marco 4.
 */
export interface Contexto {
  readonly requisicao_id: string;
  readonly inquilino_id: string;
  /** Instante único da chamada inteira. Ver a nota em `sessaoVigente`. */
  readonly agora: Date;
}

export interface DeclaracaoDeFerramenta<E extends Esquema, R> {
  readonly nome: string;
  readonly descricao: string;
  readonly faixa: Faixa;
  /** Exigência de privilégio, na forma `sistema:recurso:acao` — sem abrangência. */
  readonly escopo: string;
  readonly entrada: E;
  /**
   * Quais sujeitos a chamada toca, derivados dos parâmetros já validados.
   *
   * Ausente significa que a ferramenta não trata de sujeito específico — e o
   * chassi só aceita isso sob abrangência `any`.
   */
  readonly sujeito?: (p: Lido<E>) => Sujeitos;
  /** Chave no catálogo de preços. Marco 4. */
  readonly custo?: { readonly rota: string };
  /** Tipo de dado, que define a validade do cache. Marco 5. */
  readonly cache?: string;
  readonly executar: (p: Lido<E>, ctx: Contexto) => Promise<R>;
}

export interface Ferramenta<E extends Esquema = Esquema, R = unknown>
  extends DeclaracaoDeFerramenta<E, R> {
  /** O escopo já lido, para o chassi não reprocessar texto a cada chamada. */
  readonly escopoLido: Escopo;
}

/**
 * Registra uma ferramenta, recusando declaração malformada **na carga**.
 *
 * Falhar aqui é falhar cedo e alto: o servidor não sobe. É de propósito —
 * ferramenta com escopo ilegível seria uma ferramenta que o chassi não
 * consegue verificar, e uma ferramenta que o chassi não consegue verificar não
 * pode existir (Regra 1). Melhor não subir do que subir com um buraco.
 */
export function definirFerramenta<E extends Esquema, R>(
  d: DeclaracaoDeFerramenta<E, R>,
): Ferramenta<E, R> {
  const problemas: string[] = [];

  if (!d.nome || !/^[a-z][a-z0-9_]*$/.test(d.nome)) {
    problemas.push(`nome "${d.nome}" inválido — use minúsculas, dígitos e sublinhado`);
  }
  if (!d.descricao || d.descricao.trim().length < 10) {
    problemas.push('descrição ausente ou curta demais — é o que o agente lê para escolher a ferramenta');
  }
  if (!ehFaixa(d.faixa)) {
    // `A3` puro cai aqui desde a D-142, e a mensagem precisa ensinar a escolher
    // em vez de só reprovar: quem escreveu a ferramenta antes da divisão não
    // tem como adivinhar que ela existe.
    const dica = String(d.faixa) === 'A3'
      ? '. A faixa A3 se dividiu (D-142): use A3a para comunicação por gabarito pré-aprovado, ou A3b para texto livre. Na dúvida, A3b — é a que espera um humano'
      : '';
    problemas.push(`faixa "${String(d.faixa)}" desconhecida${dica}`);
  }

  // A3a promete que a mensagem saiu de um gabarito aprovado, versionado e
  // vigente, com lacunas preenchidas só por campo verificado (PRD §6.2.2,
  // RF-42 a RF-45). Nada disso existe ainda — não há catálogo, nem tabela
  // `gabarito`, nem como reconstruir o texto exato que saiu.
  //
  // Aceitar a declaração agora seria a pior combinação possível: uma faixa que
  // DISPENSA aprovação, apoiada numa garantia que ninguém verifica. Melhor não
  // subir do que subir com um buraco (D-140).
  if (d.faixa === 'A3a' && !A3A_DISPONIVEL) {
    problemas.push(
      'faixa A3a ainda não pode ser declarada: ela dispensa aprovação porque um gabarito aprovado a substitui, '
      + 'e o catálogo de gabaritos não existe (RF-42 a RF-45). Enquanto não existir, comunicação externa é A3b',
    );
  }

  const escopoLido = lerEscopo(d.escopo);
  if (!escopoLido) {
    problemas.push(`escopo "${d.escopo}" não segue a convenção sistema:recurso:acao`);
  } else if (escopoLido.abrangencia !== undefined) {
    // A ferramenta declara DE QUE privilégio precisa; QUAIS sujeitos ela pode
    // tocar é propriedade da concessão, que vem da sessão. Deixar a ferramenta
    // declarar abrangência inverteria isso — o objeto verificado passaria a
    // opinar sobre o próprio limite.
    problemas.push(
      `escopo "${d.escopo}" traz abrangência. Abrangência é da concessão (sessão), nunca da exigência (ferramenta)`,
    );
  }

  problemas.push(...conferirEsquema(d.entrada));

  if (problemas.length) {
    throw new Error(
      `Ferramenta "${d.nome}" recusada na carga:\n  - ${problemas.join('\n  - ')}`,
    );
  }

  return { ...d, escopoLido: escopoLido as Escopo };
}

/**
 * Perfil de exposição — quais ferramentas esta sessão sequer enxerga.
 *
 * O mesmo servidor mostra conjuntos diferentes conforme quem está do outro
 * lado: o agente do cliente não vê as ferramentas que gastam crédito.
 *
 * É defesa em profundidade, e não substituto do escopo. Perfil esconde;
 * escopo recusa. Quem só escondesse dependeria de o agente não adivinhar o
 * nome da ferramenta — e adivinhar nome é exatamente o que um modelo de
 * linguagem faz bem.
 */
export interface Perfil {
  readonly nome: string;
  readonly ferramentas: readonly string[];
}

export function montarPerfis(perfis: readonly Perfil[]): ReadonlyMap<string, ReadonlySet<string>> {
  const mapa = new Map<string, ReadonlySet<string>>();
  for (const p of perfis) mapa.set(p.nome, new Set(p.ferramentas));
  return mapa;
}
