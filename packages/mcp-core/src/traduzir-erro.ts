/**
 * Tradução de erro de fornecedor para erro interno acionável — Spec §10
 * ---------------------------------------------------------------------------
 * A tradução é única, e é o que permite ao agente reagir igual a problemas
 * equivalentes de sistemas diferentes.
 *
 * DOIS CASOS QUE COSTUMAM SER TRATADOS ERRADO, E QUE ESTE ARQUIVO TRATA
 * EXPLICITAMENTE:
 *
 * **402 do Escavador — sem saldo — nunca é transitório.** Repetir não resolve.
 * Marcá-lo como repetível transforma um saldo esgotado num laço de tentativas
 * que enche o histórico e, dependendo da rota, gasta. É a interseção exata
 * entre a Regra 5 (falha fecha) e a Regra 6 (custo é requisito).
 *
 * **404 do Trello é ambíguo de propósito** — pode significar "não existe" ou
 * "seu token não enxerga". O Trello não distingue, e **o chassi não tenta
 * adivinhar**. Adivinhar aqui seria construir um oráculo de existência de
 * objetos, exatamente o que §10.3 das diretrizes proíbe.
 */

import {
  naoEncontrado,
  parametroInvalido,
  type CodigoDeErro,
  type ErroInterno,
} from '@lex/dominio';

export type Fornecedor = 'escavador' | 'trello';

export interface RespostaDeFornecedor {
  readonly status: number;
  /** Mensagem crua do fornecedor, quando houver. Nunca vai para o agente. */
  readonly mensagem?: string;
  /** Campo apontado pelo fornecedor num erro de validação. */
  readonly campo?: string;
}

function erro(
  codigo: CodigoDeErro,
  mensagem_agente: string,
  acao_sugerida: ErroInterno['acao_sugerida'],
  repetivel: boolean,
): ErroInterno {
  return { codigo, mensagem_agente, acao_sugerida, repetivel };
}

/**
 * Traduz. Nunca lança, e nunca repassa a mensagem crua do fornecedor.
 *
 * A mensagem crua fica de fora por dois motivos: ela varia sem aviso (o painel
 * do Escavador já rotulou três erros distintos com o mesmo texto genérico —
 * R-44), e ela pode conter detalhe de conta ou de acervo que não deve chegar a
 * quem perguntou.
 */
/**
 * O corpo da resposta está dizendo que o problema é DINHEIRO?
 *
 * ⚠️ POR QUE ISTO PRECISA EXISTIR, E POR QUE OLHA A MENSAGEM
 *
 * O Escavador **não usa 402 para saldo**. Ele devolve **403** com o corpo
 * `{"error":"Seu saldo está bloqueado. Faça uma recarga para voltar a utilizar
 * a API."}` — foi assim em 23/08 e de novo depois de a cota expirar, e está
 * gravado em `captura/respostas-brutas/`.
 *
 * Até 09/09 este arquivo mandava todo 403 para `credencial_invalida`, com a
 * mensagem *"a plataforma não conseguiu se autenticar"*. O ramo do 402, que
 * está escrito e correto, nunca era acionado. O efeito prático não é cosmético:
 * o humano chamado às três da manhã lê "não conseguiu se autenticar" e vai
 * rotacionar token — quando o que resolve é recarregar. É o mesmo engano que o
 * `CLAUDE.md` cometia ao mandar ler 403 como problema de rede.
 *
 * A **R-44** e a **D-120** dizem exatamente o que fazer: declaração do
 * fornecedor é indício, o diagnóstico sai do corpo bruto. Um 403 SEM mensagem
 * continua sendo credencial — sem corpo não há o que ler, e chutar seria
 * repetir o defeito na direção oposta.
 */
const CORPO_DIZ_SALDO = /\bsaldo\b|\brecarga\b|\bcr[ée]ditos?\s+(esgotad|insuficient)/i;

export function traduzirErro(
  fornecedor: Fornecedor,
  resposta: RespostaDeFornecedor,
): ErroInterno {
  const { status } = resposta;

  // 402 é o código certo para "sem saldo", e algum fornecedor há de usá-lo.
  // O 403 com corpo falando de saldo cai aqui junto — ver CORPO_DIZ_SALDO.
  if (status === 402 || (status === 403 && CORPO_DIZ_SALDO.test(resposta.mensagem ?? ''))) {
    return erro(
      'saldo_esgotado',
      'O saldo da conta no sistema de origem acabou. Consultas pagas estão indisponíveis.',
      'escalar_humano',
      false, // ⚠️ NUNCA. Ver o cabeçalho deste arquivo.
    );
  }

  if (status === 401 || status === 403) {
    return erro(
      'credencial_invalida',
      'A plataforma não conseguiu se autenticar no sistema de origem.',
      'escalar_humano',
      false, // NUNCA repete: repetir com credencial inválida não muda nada.
    );
  }

  if (status === 404) {
    // Vale para os dois fornecedores, e no Trello vale de propósito: não
    // distinguir "não existe" de "não enxerga" é a decisão, não a limitação.
    return naoEncontrado();
  }

  if (status === 422 || status === 400) {
    return parametroInvalido(
      resposta.campo ?? 'entrada',
      'o sistema de origem recusou os parâmetros desta consulta',
    );
  }

  if (status === 429) {
    return erro(
      'vazao_excedida',
      'O sistema de origem está limitando as requisições. Tente de novo em instantes.',
      'tentar_novamente',
      true, // Repete, com recuo exponencial e variação aleatória (Spec §11).
    );
  }

  // O Trello devolve 400 com mensagem própria quando a consulta é pesada
  // demais para o token. Sem a mensagem, cai em `parametro_invalido` acima —
  // que também manda corrigir o parâmetro, então o pior caso é uma dica
  // menos precisa, e não uma ação errada.
  if (fornecedor === 'trello' && status === 413) {
    return erro(
      'consulta_pesada',
      'A consulta pediu dados demais de uma vez. Peça menos por vez.',
      'corrigir_parametro',
      true,
    );
  }

  if (status >= 500) {
    return erro(
      'fornecedor_indisponivel',
      'O sistema de origem está indisponível no momento. Há dados de cache, se servirem.',
      'usar_cache',
      true, // Repete, com teto.
    );
  }

  // Status que ninguém previu não vira "provavelmente dá certo se repetir".
  // Falha fecha também aqui.
  return erro(
    'erro_interno',
    'O sistema de origem respondeu de forma inesperada.',
    'escalar_humano',
    false,
  );
}
