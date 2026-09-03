/**
 * gravar.ts — a entrega vira linha, antes de virar qualquer outra coisa
 * ---------------------------------------------------------------------------
 * Fecha a D-181. Até 02/09 o receptor no n8n tinha dois nós — webhook e um
 * `Code` que confere o token e carimba — e **não gravava em lugar nenhum**. O
 * evento vivia só no histórico de execução do n8n, que é exatamente onde a
 * RNF-08 diz que ele não pode viver: *"fluxo é efêmero, prova não é."*
 *
 * E "efêmero" não era retórica. Medido em 02/09 na instância: ids de execução
 * de 492 a 11.740, e **173 sobreviventes**. Sumiram 11.076 — 98,5%.
 *
 * ---------------------------------------------------------------------------
 * DUAS GRAVAÇÕES, E A ORDEM ENTRE ELAS É A PROPRIEDADE
 *
 *   1. `evento_callback` — **o fato de a entrega ter chegado.** Sempre.
 *   2. `publicacao`      — **o que a entrega afirma.** Só se a origem conferir.
 *
 * A separação existe porque as duas coisas têm valor de verdade diferente. Que
 * uma requisição chegou é fato nosso, observado por nós, e vale registrar mesmo
 * quando ela é hostil. O que ela **diz** é afirmação de terceiro, e conteúdo
 * externo é hostil (Regra 4).
 *
 * ⚠️ ENTREGA COM ORIGEM INVÁLIDA É GRAVADA, E NÃO VIRA PUBLICAÇÃO.
 *
 * Gravar: porque entrega não autenticada é **sinal de segurança**, e apagar
 * sinal de segurança por ele ser inválido é apagar a evidência de que alguém
 * está batendo na porta. `origem_valida = false` é a coluna que conta essa
 * história.
 *
 * Não virar publicação: porque a base de vigilância alimenta alerta de prazo, e
 * quem controla o que entra ali controla o que o escritório acredita ser
 * verdade sobre os processos dele. Aceitar afirmação de origem não conferida é
 * deixar um desconhecido escrever no acervo — e ninguém precisaria invadir
 * nada: bastaria descobrir a URL do webhook.
 */

import type { Auditoria } from '@lex/mcp-core';
import { exigirUuid, type Conexao } from '@lex/auditoria';

import { chaveDoEvento, resumoDoTeor } from './chave.js';
import { normalizarEnvolvidoDoDiario, type EnvolvidoNormalizado } from './envolvido.js';

export type Fornecedor = 'escavador' | 'trello';

export interface EntregaDeCallback {
  readonly inquilino_id: string;
  readonly fornecedor: Fornecedor;
  /** O corpo cru, como chegou. */
  readonly corpo: Readonly<Record<string, unknown>>;
  /** O token conferiu? Vem do nó que carimba, não daqui. */
  readonly origem_valida: boolean;
  /** ISO 8601. Quando o receptor recebeu — não quando nós processamos. */
  readonly recebido_em: string;
  /**
   * Onde o corpo inteiro está guardado. **Referência, nunca o corpo.**
   *
   * O payload traz nome de parte, número de processo e o teor da publicação. A
   * coluna guarda um caminho; o conteúdo fica fora do banco relacional, em
   * lugar que se possa expurgar sem mexer na trilha — o que é requisito de
   * LGPD, não conveniência de armazenamento.
   */
  readonly payload_ref?: string | null;
}

/**
 * O resultado é PLANO, e não uma união de estados. A primeira versão era união
 * — `gravado | repetido | recusado` —, e ela mentia.
 *
 * "O evento já estava na base" e "a publicação entrou agora" são fatos
 * INDEPENDENTES: no recolhimento de 02/09, nove publicações foram recuperadas a
 * partir de eventos que já estavam gravados havia minutos. A união obrigava a
 * escolher um rótulo, o código escolheu `gravado`, e o relatório disse "9
 * eventos novos" sobre nove eventos que não tinham nada de novos.
 *
 * Um tipo que força a escolher entre dois fatos verdadeiros produz relatório
 * falso — e relatório de recolhimento é o que alguém vai ler para decidir se
 * precisa investigar.
 */
export interface ResultadoDaGravacao {
  readonly evento_id: string;
  /** A ENTREGA era inédita. */
  readonly evento_novo: boolean;
  /** Quantas vezes este mesmo conteúdo já chegou, contando esta. */
  readonly tentativas: number;
  /** Se falso, nada do conteúdo entrou na base — só o registro da tentativa. */
  readonly origem_valida: boolean;
  /** A publicação que ESTA chamada gravou. `null` quando não gravou nenhuma. */
  readonly publicacao_id: string | null;
  readonly envolvidos: number;
}

const INSERIR_EVENTO = `
  INSERT INTO evento_callback
    (inquilino_id, fornecedor, chave_evento, tipo, recebido_em, origem_valida, payload_ref, estado)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ON CONFLICT (inquilino_id, fornecedor, chave_evento)
    DO UPDATE SET tentativas = evento_callback.tentativas + 1
  RETURNING id, tentativas, (xmax = 0) AS inserido
`;

// `ON CONFLICT DO NOTHING` SEM alvo, de propósito.
//
// Hoje a única unicidade de `publicacao` é `(inquilino_id, fonte, id_externo)`,
// então nomear o alvo funcionaria. Mas o dia em que alguém acrescentar outra
// restrição, a forma sem alvo continua correta e a com alvo passa a abortar a
// transação inteira — e a transação abortada leva junto o evento e os
// envolvidos, que não têm culpa nenhuma.
//
// (Havia uma segunda restrição, `UNIQUE (inquilino_id, hash)` sobre o teor. Ela
// descartava publicação legítima em silêncio: sete processos DIFERENTES
// trouxeram a mesma intimação padrão de 123 caracteres, e seis sumiram. Caiu na
// migração 013.)
const INSERIR_PUBLICACAO = `
  INSERT INTO publicacao
    (inquilino_id, fonte, origem_diario, data_publicacao, data_disponibilizacao,
     numero_cnj, teor, hash, id_externo, tipo, pagina, link_fonte,
     recebida_em, evento_callback_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  ON CONFLICT DO NOTHING
  RETURNING id
`;

const INSERIR_ENVOLVIDO = `
  INSERT INTO publicacao_envolvido
    (inquilino_id, publicacao_id, nome, papel, tipo_na_fonte, tipo_normalizado, numero_oab)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
`;

/** O que se consegue ler de um evento `diario_movimentacao_nova`. */
interface PublicacaoLida {
  readonly origem_diario: string | null;
  readonly data_publicacao: string;
  readonly data_disponibilizacao: string | null;
  readonly numero_cnj: string | null;
  readonly teor: string;
  readonly id_externo: string | null;
  readonly tipo: string | null;
  readonly pagina: number | null;
  readonly link_fonte: string | null;
  readonly envolvidos: readonly EnvolvidoNormalizado[];
}

function texto(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}
function inteiro(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Lê a publicação de dentro do evento. Devolve `null` quando o evento não é de
 * diário, ou quando falta o que a torna útil.
 *
 * **`data_publicacao` e `teor` são obrigatórios, e a ausência recusa a linha.**
 * Publicação sem data não conta prazo, e publicação sem teor não diz nada —
 * gravar uma linha assim seria criar registro que parece cobertura e não é. É
 * melhor recusar e aparecer no relatório do que gravar e sumir da vista.
 */
export function lerPublicacaoDoDiario(corpo: Readonly<Record<string, unknown>>): PublicacaoLida | null {
  if (corpo['event'] !== 'diario_movimentacao_nova') return null;

  const mov = corpo['movimentacao'] as Record<string, unknown> | undefined;
  if (!mov || typeof mov !== 'object') return null;

  const diario = (mov['diario'] ?? {}) as Record<string, unknown>;
  const origem = (diario['origem'] ?? {}) as Record<string, unknown>;
  const processo = (mov['processo'] ?? {}) as Record<string, unknown>;

  const teor = texto(mov['conteudo']);
  const dataPub = texto(diario['data_publicacao']);
  if (!teor || !dataPub) return null;

  const envolvidosCrus = Array.isArray(mov['envolvidos']) ? (mov['envolvidos'] as unknown[]) : [];
  const envolvidos = envolvidosCrus
    .map((e) => normalizarEnvolvidoDoDiario(e as Record<string, unknown>))
    .filter((e): e is EnvolvidoNormalizado => e !== null);

  const id = inteiro(mov['id']);

  return {
    origem_diario: texto(origem['sigla']),
    data_publicacao: dataPub,
    // NÃO cai para `data_publicacao` quando ausente. `null` significa "a fonte
    // não disse", e derivar uma da outra é exatamente o erro de um dia útil que
    // a D-179 registra.
    data_disponibilizacao: texto(diario['data_disponibilizacao']),
    numero_cnj: texto(processo['numero_novo']),
    teor,
    id_externo: id === null ? null : String(id),
    tipo: texto(mov['tipo']),
    pagina: inteiro(mov['pagina']),
    link_fonte: texto(mov['link_pdf']) ?? texto(mov['link']),
    envolvidos,
  };
}

export async function gravarEntrega(
  c: Conexao,
  auditoria: Auditoria,
  entrega: EntregaDeCallback,
): Promise<ResultadoDaGravacao> {
  const inq = exigirUuid('inquilino_id', entrega.inquilino_id);
  const chave = chaveDoEvento(entrega.corpo);
  const tipo = texto(entrega.corpo['event']) ?? 'desconhecido';

  const resultado = await c.noInquilino(inq, async (cliente) => {
    const ev = await cliente.query(INSERIR_EVENTO, [
      inq,
      entrega.fornecedor,
      chave,
      tipo,
      entrega.recebido_em,
      entrega.origem_valida,
      entrega.payload_ref ?? null,
      entrega.origem_valida ? 'recebido' : 'ignorado',
    ]);

    const linha = ev.rows[0] as { id: string; tentativas: number; inserido: boolean } | undefined;
    if (!linha) throw new Error('receptor: o INSERT do evento não devolveu linha');

    // ⚠️ ENTREGA REPETIDA **NAO** SAI DAQUI SEM TENTAR A PUBLICACAO.
    //
    // A versao de 02/09 devolvia `repetido` neste ponto, e o efeito so apareceu
    // quando uma restricao errada do esquema descartou nove publicacoes (ver a
    // migracao 013). Corrigido o esquema, o recolhimento foi rodado de novo — e
    // nao recuperou nada, porque os eventos ja estavam gravados e o codigo
    // parava aqui.
    //
    // A licao e sobre o que "ja processei" significa. O evento estar na tabela
    // prova que a ENTREGA chegou, e nao que tudo o que ela carregava virou
    // linha. Uma falha no meio do caminho — restricao errada, indisponibilidade,
    // defeito nosso — deixa o evento gravado e o conteudo nao. Se a repeticao
    // desiste na porta, o unico conserto e apagar registro para reprocessar, e
    // registro de recepcao nao se apaga.
    //
    // Entao a gravacao da publicacao e idempotente por conta propria (pelo
    // `id_externo`) e roda sempre. Repetir e barato; perder nao e.
    const base = (publicacao_id: string | null, envolvidos: number): ResultadoDaGravacao => ({
      evento_id: linha.id,
      evento_novo: linha.inserido,
      tentativas: Number(linha.tentativas),
      origem_valida: entrega.origem_valida,
      publicacao_id,
      envolvidos,
    });

    if (!entrega.origem_valida) {
      return base(null, 0);
    }

    const pub = lerPublicacaoDoDiario(entrega.corpo);
    if (!pub) {
      return base(null, 0);
    }

    const r = await cliente.query(INSERIR_PUBLICACAO, [
      inq,
      'escavador_diario',
      pub.origem_diario,
      pub.data_publicacao,
      pub.data_disponibilizacao,
      pub.numero_cnj,
      pub.teor,
      resumoDoTeor(pub.teor),
      pub.id_externo,
      pub.tipo,
      pub.pagina,
      pub.link_fonte,
      entrega.recebido_em,
      linha.id,
    ]);

    const publicacaoId = (r.rows[0] as { id: string } | undefined)?.id ?? null;

    // Sem linha: a publicação já estava na base, pelo `id_externo`. Acontece
    // quando o mesmo fato chega com envelope diferente — e agora também quando
    // o recolhimento roda de novo, que é o caso normal e não uma anomalia.
    if (!publicacaoId) return base(null, 0);

    for (const e of pub.envolvidos) {
      await cliente.query(INSERIR_ENVOLVIDO, [
        inq,
        publicacaoId,
        e.nome,
        e.papel,
        e.tipo_na_fonte,
        e.tipo_normalizado,
        e.numero_oab,
      ]);
    }

    return base(publicacaoId, pub.envolvidos.length);
  });

  // A AUDITORIA VEM DEPOIS, e aqui a ordem é o contrário da do chassi.
  //
  // No chassi o registro precede o ato, porque o ato tem efeito externo — gasta
  // crédito, manda mensagem — e agir sem conseguir registrar é agir sem prova.
  // Aqui o "ato" já aconteceu antes de nós: o fornecedor entregou. O que se
  // registra é a nossa recepção, e ela não tem como preceder a si mesma.
  //
  // Se a auditoria falhar, a exceção sobe e a entrega é reportada como não
  // processada — o que faz o recolhimento tentar de novo, e a idempotência por
  // conteúdo garante que a segunda tentativa não duplica nada.
  await auditoria.registrar({
    requisicao_id: crypto.randomUUID(),
    inquilino_id: inq,
    // Callback não tem usuário nem sessão: chegou de fora, sem ninguém logado.
    // Vazio vira NULL na gravação, e NULL aqui é a verdade — inventar um
    // usuário de sistema faria a trilha atribuir a alguém um ato de ninguém.
    usuario_id: '',
    papel: 'sistema',
    canal: 'callback',
    sessao_id: '',
    acao: `callback:${entrega.fornecedor}:${tipo}`,
    resultado: resultado.origem_valida ? 'permitido' : 'negado',
    etapa: resultado.publicacao_id ? 'publicacao_gravada' : 'evento_registrado',
    momento: entrega.recebido_em,
  });

  return resultado;
}
