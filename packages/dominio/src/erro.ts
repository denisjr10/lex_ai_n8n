/**
 * Taxonomia de erros — Spec §10
 * ---------------------------------------------------------------------------
 * O chassi traduz erro de fornecedor para erro interno acionável. A tradução é
 * única, e é o que permite ao agente reagir igual a problemas equivalentes de
 * sistemas diferentes.
 *
 * `acao_sugerida` é o campo que faz diferença na prática: diz ao agente o que
 * fazer a seguir, em vez de devolver um código HTTP e esperar que ele adivinhe.
 */

export const CODIGOS_DE_ERRO = [
  'credencial_invalida',
  'saldo_esgotado',
  'nao_encontrado',
  'parametro_invalido',
  'vazao_excedida',
  'consulta_pesada',
  'fornecedor_indisponivel',
  'nao_autorizado',
  'orcamento_esgotado',
  'sessao_invalida',
  'precisa_aprovacao',
  'erro_interno',
] as const;

export type CodigoDeErro = (typeof CODIGOS_DE_ERRO)[number];

export const ACOES_SUGERIDAS = [
  'tentar_novamente',
  'usar_cache',
  'pedir_aprovacao',
  'escalar_humano',
  'corrigir_parametro',
  'desistir',
] as const;

export type AcaoSugerida = (typeof ACOES_SUGERIDAS)[number];

export interface ErroInterno {
  readonly codigo: CodigoDeErro;
  /** O que o agente lê. Nunca revela razão técnica de negativa de privilégio. */
  readonly mensagem_agente: string;
  readonly acao_sugerida: AcaoSugerida;
  readonly repetivel: boolean;
  /** Preenchido pelo chassi na saída. */
  readonly requisicao_id?: string;
  /** Só para `parametro_invalido`: qual campo. */
  readonly campo?: string;
}

/**
 * ⚠️ A MENSAGEM QUE PRECISA SER IDÊNTICA A OUTRA
 *
 * Recusa por escopo (`nao_autorizado`) e ausência de resultado
 * (`nao_encontrado`) devolvem **exatamente este texto**, byte a byte.
 *
 * Não é descuido nem preguiça de redação: se a mensagem de "você não tem
 * permissão" fosse distinguível da de "não existe", qualquer pessoa com acesso
 * ao canal poderia varrer números de processo e descobrir quais existem no
 * acervo do escritório — o sistema viraria um oráculo de existência de
 * processos, que é o que `04` §4.4 e §10.3 das diretrizes proíbem.
 *
 * Há um teste que compara os dois textos. Se alguém "melhorar" um deles, ele
 * quebra — e é para quebrar.
 */
export const MENSAGEM_INDISTINGUIVEL =
  'Não há resultado disponível para esta consulta nesta sessão.';

/** Constrói `nao_autorizado`. Note a mensagem: é a compartilhada, de propósito. */
export function naoAutorizado(): ErroInterno {
  return {
    codigo: 'nao_autorizado',
    mensagem_agente: MENSAGEM_INDISTINGUIVEL,
    acao_sugerida: 'escalar_humano',
    repetivel: false,
  };
}

/** Constrói `nao_encontrado`. Mesma mensagem, ação diferente. */
export function naoEncontrado(): ErroInterno {
  return {
    codigo: 'nao_encontrado',
    mensagem_agente: MENSAGEM_INDISTINGUIVEL,
    acao_sugerida: 'desistir',
    repetivel: false,
  };
}

/**
 * Sessão inválida, expirada ou revogada.
 *
 * Aqui a mensagem PODE ser específica, e a diferença em relação ao caso acima
 * merece registro: dizer "sua sessão expirou" não revela nada sobre o acervo —
 * revela algo sobre quem pergunta, que já sabe quem é. Esconder isso só faria
 * a pessoa achar que o sistema quebrou.
 */
export function sessaoInvalida(motivo: string): ErroInterno {
  return {
    codigo: 'sessao_invalida',
    mensagem_agente: `Sessão não utilizável: ${motivo}. Autentique-se novamente.`,
    acao_sugerida: 'escalar_humano',
    repetivel: false,
  };
}

export function parametroInvalido(campo: string, detalhe: string): ErroInterno {
  return {
    codigo: 'parametro_invalido',
    mensagem_agente: `O parâmetro "${campo}" não serve: ${detalhe}.`,
    acao_sugerida: 'corrigir_parametro',
    repetivel: false,
    campo,
  };
}

export function precisaAprovacao(faixa: string, quem: string): ErroInterno {
  return {
    codigo: 'precisa_aprovacao',
    mensagem_agente:
      `Esta ação é da faixa ${faixa} e precisa de aprovação de ${quem} antes de ser executada. ` +
      'Proponha o conteúdo final e aguarde a decisão.',
    acao_sugerida: 'pedir_aprovacao',
    repetivel: false,
  };
}

export function erroInterno(detalhe: string): ErroInterno {
  return {
    codigo: 'erro_interno',
    mensagem_agente: `A plataforma falhou ao processar esta chamada: ${detalhe}.`,
    acao_sugerida: 'escalar_humano',
    repetivel: false,
  };
}

/**
 * Um erro é seguro de repetir automaticamente?
 *
 * ⚠️ O caso que motivou esta função existir separada: **402 do Escavador — sem
 * saldo — NUNCA é transitório.** Repetir não resolve, e cada tentativa queima
 * uma linha do histórico e, dependendo da rota, dinheiro. É a interseção exata
 * entre a Regra 5 (falha fecha) e a Regra 6 (custo é requisito).
 */
export function podeRepetir(erro: ErroInterno): boolean {
  return erro.repetivel;
}
