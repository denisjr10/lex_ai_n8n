/**
 * envolvido.ts — a tabela de tradução que a D-132 disse não existir
 * ---------------------------------------------------------------------------
 * O Bloco E mediu, em 27/08, que `tipo_normalizado` é vocabulário fechado e
 * **idêntico entre ramos da Justiça** — `Autor`, `Réu`, `null`, iguais no cível
 * do TJAP e no trabalhista do TRT-8. A conclusão registrada foi: *"não há
 * tabela de tradução a construir"*.
 *
 * Aquilo continua verdadeiro. E o alcance estava errado.
 *
 * Em 02/09, as 30 aparições de diário mostraram um terceiro vocabulário, que
 * não passa por `tipo_normalizado` nenhum — o campo sequer existe no evento de
 * callback:
 *
 * | Fonte                     | Campo              | Valores                              |
 * |---------------------------|--------------------|--------------------------------------|
 * | Importador de autos (PDF) | —                  | `RECLAMANTE` · `RECLAMADO`  (D-135)  |
 * | API V2 `/envolvidos`      | `tipo_normalizado` | `Autor` · `Réu` · `null`    (D-132)  |
 * | Callback de diário        | `envolvido_tipo`   | `Polo Ativo` · `Polo Passivo` · `Advogado` |
 *
 * > **O eixo da tradução é a FONTE, não o tribunal.** É por isso que a D-132
 * > não estava errada e mesmo assim levava a construir a coisa errada: ela
 * > respondia "o TRT fala diferente do TJ?" — e a pergunta que importava era
 * > "o diário fala diferente da API?".
 *
 * ---------------------------------------------------------------------------
 * DUAS DECISÕES QUE PARECEM DETALHE E NÃO SÃO
 *
 * **1. O tipo cru é guardado junto do traduzido.** Guardar só o normalizado
 * apagaria a evidência do que a fonte disse, e é a evidência que permite
 * corrigir a tradução depois sem reprocessar o acervo — quando aparecer o
 * quarto vocabulário, e ele vai aparecer.
 *
 * **2. O que não se sabe traduzir vira `null`, nunca um chute.** `null` aqui
 * significa *"não sei"*, que é informação verdadeira e revisável. Um palpite
 * silencioso significaria *"ativo"* com a mesma cara de um acerto — e num
 * sistema que decide prazo, confundir polo ativo com passivo troca quem tem de
 * responder.
 */

export type TipoNormalizado = 'ativo' | 'passivo' | 'terceiro';
export type PapelDoEnvolvido = 'parte' | 'advogado';

export interface EnvolvidoNormalizado {
  readonly nome: string;
  readonly papel: PapelDoEnvolvido;
  /** O que a fonte escreveu, sem tradução. Evidência. */
  readonly tipo_na_fonte: string | null;
  /** O que a tradução concluiu. `null` = não se sabe traduzir. */
  readonly tipo_normalizado: TipoNormalizado | null;
  readonly numero_oab: string | null;
}

/**
 * As três fontes conhecidas. Acrescentar uma quarta é acrescentar uma linha
 * aqui — e não sair espalhando `if` pelo código que consome.
 */
export type Fonte = 'escavador_diario' | 'escavador_v2' | 'autos_pdf';

/**
 * A tradução, por fonte. Chaves em minúsculas e sem acento, normalizadas na
 * entrada — porque a mesma fonte já escreveu `AUTOR` e `Autor` no mesmo dia
 * (medido no Bloco E, no campo `tipo` cru).
 */
const TRADUCAO: Record<Fonte, Record<string, TipoNormalizado>> = {
  escavador_diario: {
    'polo ativo': 'ativo',
    'polo passivo': 'passivo',
    // `Advogado` NÃO entra aqui de propósito: advogado não é polo. Ele vira
    // `papel: 'advogado'` com `tipo_normalizado: null`, e o `null` é honesto —
    // o diário não diz de qual polo o advogado é. O campo `advogado_de`
    // existiria para isso e veio VAZIO nas 48 ocorrências (ver §Armadilha).
  },
  escavador_v2: {
    autor: 'ativo',
    reu: 'passivo',
    reclamante: 'ativo',
    reclamado: 'passivo',
    terceiro: 'terceiro',
  },
  autos_pdf: {
    reclamante: 'ativo',
    reclamado: 'passivo',
    autor: 'ativo',
    reu: 'passivo',
  },
};

/** Minúsculas, sem acento, sem espaço sobrando. */
function normalizar(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // marcas de acento, ja separadas pelo NFD
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function traduzirTipo(fonte: Fonte, tipoCru: string | null | undefined): TipoNormalizado | null {
  if (!tipoCru) return null;
  return TRADUCAO[fonte][normalizar(tipoCru)] ?? null;
}

/**
 * ⚠️ ARMADILHA MEDIDA: `advogado_de` vem VAZIO.
 *
 * O evento de diário tem um campo `envolvidos[].advogado_de`, cujo nome promete
 * exatamente o que a frente de prazo precisa — de qual parte cada advogado é
 * procurador. Nas 30 entregas, ele veio nulo nas **48** ocorrências de
 * advogado. Sem exceção.
 *
 * Código escrito contra esse campo passa em qualquer teste que alguém monte à
 * mão e falha contra o dado real, em silêncio — porque "advogado sem parte
 * conhecida" não estoura, só devolve nada. Esta constante existe para que a
 * próxima pessoa encontre a medição antes de encontrar o campo.
 */
export const ADVOGADO_DE_NAO_VEM_PREENCHIDO = true;

/** Um envolvido como o callback do diário o entrega. */
export interface EnvolvidoDoDiario {
  readonly nome?: unknown;
  readonly envolvido_tipo?: unknown;
  readonly oab?: unknown;
}

export function normalizarEnvolvidoDoDiario(e: EnvolvidoDoDiario): EnvolvidoNormalizado | null {
  const nome = typeof e.nome === 'string' ? e.nome.trim() : '';
  if (!nome) return null; // envolvido sem nome não identifica ninguém

  const tipoCru = typeof e.envolvido_tipo === 'string' ? e.envolvido_tipo : null;
  const ehAdvogado = tipoCru !== null && normalizar(tipoCru) === 'advogado';

  return {
    nome,
    papel: ehAdvogado ? 'advogado' : 'parte',
    tipo_na_fonte: tipoCru,
    tipo_normalizado: traduzirTipo('escavador_diario', tipoCru),
    numero_oab: typeof e.oab === 'string' && e.oab.trim() ? e.oab.trim() : null,
  };
}
