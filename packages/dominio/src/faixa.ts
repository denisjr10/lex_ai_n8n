/**
 * Faixa de autorização — quanto dano a ação pode causar
 * ---------------------------------------------------------------------------
 * Vem de `04-modelo-de-identidade-e-autorizacao.md` §5.1, atualizada pela
 * **D-142**. É a escala que decide se uma ação sai sozinha ou espera um humano.
 *
 *   A0   leitura interna ................. automático
 *   A1   leitura externa PAGA ............ automático dentro da quota
 *   A2   escrita interna ................. automático, reversível, registrado
 *   A3a  comunicação externa por GABARITO  automático — o advogado aprovou antes
 *   A3b  comunicação externa em TEXTO NOVO aprovação mensagem a mensagem
 *   A4   efeito jurídico ou de prazo ..... aprovação nominal, SEM EXCEÇÃO
 *
 * A distinção que sustenta a Regra 2 está entre A2 e A3: o que é reversível
 * dentro de casa sai sozinho; o que sai de casa, não. E A4 é a faixa onde a
 * plataforma nunca decide — nem quando o agente tem certeza, nem quando o prazo
 * está apertado, nem quando o advogado pediu para "deixar automático".
 *
 * POR QUE A3 VIROU DUAS (D-142). O escritório objetou, com razão, que exigir
 * aprovação de toda mensagem anula o ganho de eficiência. A resposta não foi
 * afrouxar a Regra 2: foi separar dois casos que estavam no mesmo balde. Em
 * A3a o advogado aprova o **gabarito** — texto fixo cujas lacunas só podem ser
 * preenchidas por campo verificado da base interna — e as mensagens iguais
 * àquela saem sozinhas. Ele continua aprovando o texto exato que sai; só aprova
 * uma vez, para todos os casos iguais. Aprovar mil vezes o mesmo parágrafo não
 * é controle, é ritual. Em A3b, texto novo sobre situação imprevista, continua
 * valendo aprovação mensagem a mensagem — e é exatamente aí que mora o risco.
 *
 * ⚠️ **`A3` puro não existe mais nesta lista, e a ausência é a trava.** Se
 * continuasse valendo, toda ferramenta escrita antes da D-142 seguiria passando
 * sem que ninguém decidisse de que lado ela cai — e o lado default seria o
 * antigo, que é o mais permissivo dos dois em metade dos casos. Declaração que
 * não escolhe é recusada na carga, e quem escreve a ferramenta é obrigado a
 * dizer se aquilo é gabarito ou prosa.
 */

export const FAIXAS = ['A0', 'A1', 'A2', 'A3a', 'A3b', 'A4'] as const;

export type Faixa = (typeof FAIXAS)[number];

/**
 * Faixas que exigem aprovação humana registrada **antes de cada execução**.
 *
 * A3a não está aqui, e não por descuido: a aprovação dela já aconteceu, uma vez,
 * quando o advogado aprovou o gabarito. O que a substitui em tempo de execução
 * é a conferência de que a mensagem realmente saiu de um gabarito vigente com
 * lacunas preenchidas por campo verificado — e essa conferência é do marco de
 * aprovação, não desta função. Enquanto ela não existir, `A3A_DISPONIVEL`
 * mantém a faixa fora de circulação.
 */
export function exigeAprovacao(faixa: Faixa): boolean {
  return faixa === 'A3b' || faixa === 'A4';
}

/**
 * Faixas em que quem aprova precisa **ter papel de advogado ou sócio**.
 *
 * A3b entrou aqui em 31/08, e antes disso o código deixava um estagiário
 * aprovar comunicação externa. A tabela de §5.1 e o PRD §6.2 sempre disseram
 * "advogado"; o código dizia que era decisão de rito, adiada para a Parte II.
 * Adiar uma exigência não é neutro: enquanto ela está adiada, o comportamento
 * em vigor é o permissivo, e a Regra 5 manda o contrário. Se o escritório
 * quiser afrouxar depois, afrouxa por decisão registrada — que é o caminho que
 * a Parte II existe para oferecer.
 */
export function exigePapelDeAdvogado(faixa: Faixa): boolean {
  return faixa === 'A3b' || faixa === 'A4';
}

/**
 * Faixas em que a aprovação precisa ser de advogado ou sócio, **nominalmente**.
 *
 * Só A4, e é diferente de `exigePapelDeAdvogado`: aqui não basta que quem
 * aprovou tenha o papel — a identidade individual precisa estar registrada no
 * ato, com nome. É trava de projeto, não de rito (R-11, D-25).
 */
export function exigeAdvogadoNominal(faixa: Faixa): boolean {
  return faixa === 'A4';
}

/**
 * A faixa A3a já pode ser declarada por uma ferramenta?
 *
 * **Não, e isto é uma trava de carga, no espírito da D-140.** A3a promete que a
 * mensagem saiu de um gabarito aprovado, versionado e vigente, com lacunas
 * preenchidas só por campo verificado (PRD §6.2.2, RF-42 a RF-45). Nada disso
 * existe ainda: não há catálogo de gabaritos, não há tabela `gabarito` nem
 * `envio_por_gabarito`, e não há como reconstruir o texto exato que saiu.
 *
 * Aceitar a declaração agora criaria a pior combinação possível — uma faixa que
 * dispensa aprovação apoiada numa garantia que ninguém verifica. Seria o mesmo
 * que um número de versão que ninguém confere: campo preenchido, não contrato.
 *
 * Vira `true` no marco que trouxer o catálogo, junto com a conferência de
 * verdade. Até lá, comunicação externa é A3b e espera um humano.
 */
export const A3A_DISPONIVEL = false;

/**
 * Faixas que gastam dinheiro de fornecedor externo.
 *
 * Só A1 por enquanto. Serve ao motor de custo (marco 4): faixa que não gasta
 * não passa por reserva de orçamento, e não faz sentido degradar para cache uma
 * operação que não custa nada.
 */
export function gastaCredito(faixa: Faixa): boolean {
  return faixa === 'A1';
}

export function ehFaixa(valor: unknown): valor is Faixa {
  return typeof valor === 'string' && (FAIXAS as readonly string[]).includes(valor);
}
