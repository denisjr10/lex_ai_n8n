/**
 * @lex/receptor-callbacks — o que chega de fora, e chega mais de uma vez
 * ---------------------------------------------------------------------------
 * Recebe evento de Escavador e Trello, valida a origem, deduplica e alimenta a
 * base interna de vigilância. É o caminho pelo qual o produto entrega o que ele
 * tem de mais valioso: o alerta de prazo (E2).
 *
 * A LIÇÃO QUE ESTE SERVIÇO EXISTE PARA NÃO ESQUECER (medida em 26/08):
 *
 *   O identificador que o fornecedor manda no evento NÃO serve de chave de
 *   idempotência. A mesma solicitação chegou três vezes, com três `uuid`
 *   diferentes — o `uuid` identifica a TENTATIVA DE ENTREGA. Duas dessas
 *   entregas tinham corpo idêntico byte a byte. E a mesma atualização concluiu
 *   duas vezes, com horários diferentes, sendo a SEGUNDA a que valia.
 *
 *   A chave é o resumo do CONTEÚDO, com o envelope de entrega removido antes
 *   (D-116, D-117), e a unicidade é imposta pelo BANCO, não por um `if`: duas
 *   entregas simultâneas passariam pelo `if` as duas.
 *
 * Regra 4: conteúdo externo é hostil. O que chega aqui nunca alimenta
 * diretamente um agente com poder de ação.
 *
 * O receptor já foi validado nos DOIS caminhos em 26/08 — recusou entrega sem
 * autenticação e aceitou a legítima (D-118). Preenchido no MARCO 8 (Spec §15).
 */
// ---------------------------------------------------------------------------
// MARCO 8, adiantado em 02/09 pela D-181
//
// O receptor no n8n nao gravava: dois nos, webhook e carimbo, e o evento vivia
// so no historico de execucao. Medido na instancia: ids de 492 a 11.740 e 173
// sobreviventes — 98,5% descartados. "Efemero" nao era retorica.
//
//   `chave.ts`      duas chaves para duas perguntas; o `uuid` nao e nenhuma
//   `envolvido.ts`  a tabela de traducao que a D-132 disse nao existir
//   `gravar.ts`     a entrega vira linha, e a origem invalida vira sinal
// ---------------------------------------------------------------------------

export { chaveDoEvento, resumoDoTeor, semEnvelope } from './chave.js';
export {
  normalizarEnvolvidoDoDiario,
  traduzirTipo,
  ADVOGADO_DE_NAO_VEM_PREENCHIDO,
  type EnvolvidoNormalizado,
  type Fonte,
  type PapelDoEnvolvido,
  type TipoNormalizado,
} from './envolvido.js';
export {
  gravarEntrega,
  lerPublicacaoDoDiario,
  type EntregaDeCallback,
  type Fornecedor,
  type ResultadoDaGravacao,
} from './gravar.js';

