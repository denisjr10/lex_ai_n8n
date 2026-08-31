/**
 * As etapas de controle — cada uma devolve uma decisão, nenhuma lança
 * ---------------------------------------------------------------------------
 * Spec §4.2. O chassi é um `pipeline` (sequência de etapas por onde toda
 * chamada passa, sempre na mesma ordem).
 *
 * A ORDEM IMPORTA, E É UMA PROPRIEDADE DE SEGURANÇA:
 *
 *   **Negar é sempre mais barato que permitir.** As etapas deste arquivo — da
 *   sessão até a aprovação — não custam um centavo. Uma tentativa indevida é
 *   recusada sem tocar na API, o que é requisito de custo (Regra 6) e de
 *   sigilo (RF-07) ao mesmo tempo: recusar sem chamar também não revela que o
 *   processo existe.
 *
 * Marco 2 implementa as etapas 2 a 8. As etapas 9 (custo), 10 (cache) e 11
 * (execução) entram nos marcos 4, 5 e 6, e o `chassi.ts` já deixa a costura.
 */

import {
  abrangenciaConcedida,
  exigeAdvogadoNominal,
  exigePapelDeAdvogado,
  exigeAprovacao,
  lerEscopos,
  naoAutorizado,
  naoEncontrado,
  negar,
  PERMITIDO,
  podeAprovarA4,
  precisaAprovacao,
  sessaoVigente,
  sujeitoAutorizado,
  sessaoInvalida,
  type Abrangencia,
  type Decisao,
  type Faixa,
  type Papel,
  type Sessao,
} from '@lex/dominio';

import type { Sujeitos } from './ferramenta.js';

// ---------------------------------------------------------------------------
// Etapa 2 — Sessão
// ---------------------------------------------------------------------------

/**
 * A lista de revogação, consultada a cada chamada (D-69).
 *
 * É uma leitura local barata. Ela é o que torna a validação offline aceitável:
 * a sessão dura minutos, mas revogação explícita tem efeito imediato.
 *
 * Interface, e não implementação, porque no marco 9 ela vira consulta ao banco
 * e aqui não deve mudar nada.
 */
export interface ListaDeRevogacao {
  revogada(sessao_id: string): boolean;
}

export const NADA_REVOGADO: ListaDeRevogacao = { revogada: () => false };

export function etapaSessao(
  sessao: Sessao,
  agora: Date,
  revogacao: ListaDeRevogacao,
): Decisao {
  if (!sessaoVigente(sessao, agora)) {
    return negar(sessaoInvalida('expirada ou com datas inválidas'));
  }
  if (revogacao.revogada(sessao.sessao_id)) {
    return negar(sessaoInvalida('revogada'));
  }
  return PERMITIDO;
}

// ---------------------------------------------------------------------------
// Etapa 4 — Perfil
// ---------------------------------------------------------------------------

/**
 * A ferramenta está no perfil de exposição desta sessão?
 *
 * ⚠️ Recusa com `nao_encontrado`, e não com `nao_autorizado`.
 *
 * Os dois já devolvem a mesma mensagem ao agente (ver `MENSAGEM_INDISTINGUIVEL`
 * em `dominio/erro.ts`), então a escolha aqui é sobre o que fica registrado na
 * auditoria — e "ferramenta fora do perfil" é informação diferente de "sem
 * privilégio". Quem lê a trilha depois precisa distinguir uma coisa da outra;
 * quem está do lado de fora, não.
 */
export function etapaPerfil(
  nomeDaFerramenta: string,
  perfilDaSessao: string,
  perfis: ReadonlyMap<string, ReadonlySet<string>>,
): Decisao {
  const expostas = perfis.get(perfilDaSessao);
  if (!expostas) {
    // Perfil que não existe não concede nada. Falha fecha.
    return negar(naoEncontrado());
  }
  if (!expostas.has(nomeDaFerramenta)) {
    return negar(naoEncontrado());
  }
  return PERMITIDO;
}

// ---------------------------------------------------------------------------
// Etapa 5 — Escopo
// ---------------------------------------------------------------------------

export interface ResultadoDeEscopo {
  readonly decisao: Decisao;
  /** Só quando permitido: a abrangência que a concessão trouxe. */
  readonly abrangencia?: Abrangencia;
}

/**
 * A sessão tem direito a esta categoria de operação?
 *
 * Devolve também a **abrangência concedida**, porque a etapa seguinte precisa
 * dela — e recalculá-la ali significaria percorrer os escopos duas vezes com
 * duas regras que poderiam divergir com o tempo.
 */
export function etapaEscopo(
  exigencia: { sistema: string; recurso: string; acao: 'read' | 'write' | 'delete' },
  escoposDaSessao: readonly string[],
): ResultadoDeEscopo {
  const concessoes = lerEscopos(escoposDaSessao);
  const abrangencia = abrangenciaConcedida(concessoes, exigencia);
  if (abrangencia === null) {
    return { decisao: negar(naoAutorizado()) };
  }
  return { decisao: PERMITIDO, abrangencia };
}

// ---------------------------------------------------------------------------
// Etapa 6 — Abrangência
// ---------------------------------------------------------------------------

/**
 * Esta sessão tem direito a ESTE processo, a ESTA pessoa?
 *
 * É a etapa que protege o sigilo, e a que resiste a injeção de prompt:
 * `sujeitos_autorizados` vem da sessão, nunca da mensagem.
 *
 * TRÊS DECISÕES DE DESENHO, TODAS NA MESMA DIREÇÃO:
 *
 * 1. **`any` não confere sujeito.** Continua sujeito a orçamento e a registro,
 *    mas não a lista.
 *
 * 2. **`own` e `carteira` conferem igual, aqui.** A diferença entre as duas
 *    está em QUEM monta a lista — o Policy Gate resolve a carteira do usuário
 *    contra o cadastro do escritório e entrega o resultado na sessão. Para o
 *    chassi, as duas são "o sujeito precisa constar". Uma delas ser mais ampla
 *    é consequência da lista ser maior, não de a regra ser mais frouxa.
 *
 * 3. **Chamada sem sujeito, sob `own` ou `carteira`, é RECUSADA.** Não há o que
 *    conferir, e "nada a conferir" não pode virar "tudo liberado". É o caso que
 *    aparece quando alguém escreve uma ferramenta nova e esquece o `sujeito` —
 *    e o resultado tem de ser a ferramenta não funcionar, nunca funcionar
 *    demais.
 */
export function etapaAbrangencia(
  abrangencia: Abrangencia,
  sujeitos: Sujeitos | undefined,
  sessao: Sessao,
): Decisao {
  if (abrangencia === 'any') return PERMITIDO;

  const processos = sujeitos?.processos ?? [];
  const documentos = sujeitos?.documentos ?? [];

  if (processos.length === 0 && documentos.length === 0) {
    return negar(naoAutorizado());
  }

  for (const p of processos) {
    if (!sujeitoAutorizado(sessao.sujeitos_autorizados, 'processos', p)) {
      return negar(naoAutorizado());
    }
  }
  for (const d of documentos) {
    if (!sujeitoAutorizado(sessao.sujeitos_autorizados, 'documentos', d)) {
      return negar(naoAutorizado());
    }
  }
  return PERMITIDO;
}

// ---------------------------------------------------------------------------
// Etapa 8 — Faixa e aprovação
// ---------------------------------------------------------------------------

/**
 * Uma aprovação já registrada e vigente, entregue ao chassi pela camada de cima.
 *
 * O chassi **não busca** aprovação: ele confere a que recebeu. Buscar seria
 * dar ao servidor MCP o poder de decidir que uma aprovação serve — e a Regra 2
 * diz que quem dispõe é o humano, o que só é verdade se o registro da decisão
 * humana vier de fora, já feito.
 */
export interface AprovacaoApresentada {
  readonly aprovacao_id: string;
  readonly faixa: string;
  readonly aprovador_id: string;
  readonly papel_do_aprovador: Papel;
  readonly status: string;
  /** ISO 8601. */
  readonly expira_em: string;
  /** Resumo do conteúdo aprovado — aprova-se o conteúdo final, não a intenção. */
  readonly resumo_do_conteudo: string;
}

/**
 * A ação pode sair, ou espera um humano?
 *
 * `resumoDoConteudo` é o resumo do que a chamada vai de fato fazer. Ele é
 * comparado com o que foi aprovado, e a comparação existe por causa da regra 1
 * de `04` §5.3: **aprova-se o conteúdo final, não a intenção.** Sem essa
 * conferência, uma aprovação dada para um texto valeria para outro — e o
 * advogado teria assinado algo que não leu.
 */
export function etapaAprovacao(
  faixa: Faixa,
  resumoDoConteudo: string,
  aprovacao: AprovacaoApresentada | undefined,
  agora: Date,
): Decisao {
  if (!exigeAprovacao(faixa)) return PERMITIDO;

  const quem = exigeAdvogadoNominal(faixa)
    ? 'advogado ou sócio, identificado nominalmente'
    : 'advogado';

  if (!aprovacao) return negar(precisaAprovacao(faixa, quem));
  if (aprovacao.status !== 'aprovada') return negar(precisaAprovacao(faixa, quem));
  if (aprovacao.faixa !== faixa) return negar(precisaAprovacao(faixa, quem));

  const expira = Date.parse(aprovacao.expira_em);
  if (Number.isNaN(expira) || agora.getTime() >= expira) {
    return negar(precisaAprovacao(faixa, quem));
  }

  // QUEM APROVOU PRECISA PODER APROVAR.
  //
  // Isto vale para A3b e para A4, e até 31/08 valia só para A4 — ou seja, uma
  // aprovação de comunicação externa assinada por estagiário passava. A tabela
  // de §5.1 e o PRD §6.2 sempre disseram "advogado"; o código tratava a
  // exigência como rito adiado para a Parte II. Mas enquanto uma exigência está
  // adiada, o comportamento em vigor é o permissivo — e negar por padrão é a
  // Regra 5. Afrouxar depois é decisão registrada; afrouxar por omissão não é
  // decisão nenhuma.
  if (exigePapelDeAdvogado(faixa) && !podeAprovarA4(aprovacao.papel_do_aprovador)) {
    return negar(precisaAprovacao(faixa, quem));
  }

  // A4 vai além do papel: exige a identidade individual registrada no ato.
  // Trava de projeto, não de rito — sem identidade individual, A4 não se
  // libera (R-11, e regra 4 de `04` §5.3).
  if (exigeAdvogadoNominal(faixa) && !aprovacao.aprovador_id.trim()) {
    return negar(precisaAprovacao(faixa, quem));
  }

  if (aprovacao.resumo_do_conteudo !== resumoDoConteudo) {
    return negar(precisaAprovacao(faixa, quem));
  }

  return PERMITIDO;
}
