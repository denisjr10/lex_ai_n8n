/**
 * auditoria-postgres.ts — a implementação que grava a prova
 * ---------------------------------------------------------------------------
 * Marco 3. Substitui `auditoriaEmMemoria` do chassi por escrita real, e mantém
 * as duas propriedades que o esqueleto deste serviço prometia desde o começo:
 *
 *   1. SÍNCRONA AO ATO — não há fila, não há "grava depois". Se a gravação
 *      falha, `registrar` lança, e o chassi recusa a chamada (D-77)
 *   2. IMUTÁVEL — imposto pelo banco, não por este arquivo
 *
 * ⚠️ **NÃO EXISTE `try/catch` EM VOLTA DO INSERT AQUI, E ISSO É O DESENHO.**
 *
 * A tentação é óbvia: engolir a falha, devolver `void`, deixar a operação
 * seguir e tentar de novo depois. Seria a linha mais destrutiva do projeto.
 *
 * O chassi confia que `registrar` que retorna significa **registro gravado** —
 * é sobre essa promessa que ele decide chamar o fornecedor. Um `catch` aqui
 * transformaria "auditoria indisponível" em "auditoria silenciosamente
 * ausente", e a plataforma passaria a agir sem prova exatamente nos momentos em
 * que a prova mais importa, que são aqueles em que a infraestrutura está ruim.
 *
 * Toda exceção sobe. Quem decide o que fazer com ela é o chassi, e a decisão
 * dele já está escrita: bloquear.
 */

import type { Auditoria, EventoDeAuditoria } from '@lex/mcp-core';

import { exigirUuid, uuidOpcional } from './identificador.js';
import { serializarResumo } from './resumo.js';
import type { Conexao } from './conexao.js';

const INSERIR_EVENTO = `
  INSERT INTO evento_auditoria
    (inquilino_id, momento, requisicao_id, usuario_id, papel, canal, sessao_id,
     acao, recurso, parametros_resumidos, resultado, custo_centavos, aprovacao_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13)
  RETURNING id
`;

const INSERIR_CONSUMO = `
  INSERT INTO consumo
    (evento_auditoria_id, inquilino_id, fornecedor, operacao, custo_centavos,
     usuario_id, cliente_id, processo_id, cache_hit, custo_evitado_centavos, momento)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
`;

/** O que o marco 4 vai medir, e que este arquivo já sabe guardar. */
export interface ConsumoRegistrado {
  readonly fornecedor: 'escavador' | 'trello' | 'ia' | 'interno';
  readonly operacao: string;
  readonly custo_centavos: number;
  readonly cliente_id?: string | null;
  readonly processo_id?: string | null;
  readonly cache_hit?: boolean;
  readonly custo_evitado_centavos?: number;
}

export interface AuditoriaPostgres extends Auditoria {
  registrar(evento: EventoDeAuditoria): Promise<void>;
  /** Igual a `registrar`, e devolve o id da linha — o marco 4 vai precisar dele. */
  registrarEDevolverId(evento: EventoDeAuditoria): Promise<string>;
  /**
   * Grava o ato e o que ele custou **na mesma transação**.
   *
   * Juntos ou nenhum, e a razão não é elegância transacional: `consumo` tem
   * chave estrangeira obrigatória para `evento_auditoria`, então custo sem
   * prova do ato que o gerou já é impossível por construção. O que a transação
   * impede é o contrário — prova gravada e custo perdido —, que produziria uma
   * fatura do Escavador que o nosso próprio registro não explica. E a conversa
   * com o escritório sobre essa fatura vai precisar da explicação.
   */
  registrarComConsumo(evento: EventoDeAuditoria, consumo: ConsumoRegistrado): Promise<string>;
}

export function criarAuditoriaPostgres(c: Conexao): AuditoriaPostgres {
  /** Traduz o evento do domínio nos valores das colunas. Lança se algo não serve. */
  function valores(evento: EventoDeAuditoria): unknown[] {
    const momento = new Date(evento.momento);
    if (Number.isNaN(momento.getTime())) {
      throw new Error(
        `auditoria: o campo "momento" precisa ser uma data ISO 8601 e veio ` +
          `${JSON.stringify(evento.momento)}. Registro com data ilegível não reconstrói ` +
          `nada — e esta tabela não aceita correção depois.`,
      );
    }

    // O QUE ENTRA EM `parametros_resumidos` É SÓ VOCABULÁRIO NOSSO.
    //
    // `etapa` e `codigo_do_erro` são palavras que o chassi escolheu de uma lista
    // fechada — `sessao`, `escopo`, `abrangencia`, `nao_autorizado`. Nenhuma
    // veio do cliente, do fornecedor ou do agente.
    //
    // OS PARÂMETROS DA CHAMADA NÃO ENTRAM, e o motivo é que `numero_cnj` é um
    // parâmetro: despejá-los aqui copiaria o número do processo para dentro da
    // tabela que não esquece (Spec §9.4, regra 3). `EventoDeAuditoria` nem os
    // carrega — e `serializarResumo` fica no caminho para o dia em que alguém
    // resolver acrescentá-los.
    const resumo: Record<string, unknown> = {};
    if (evento.etapa !== undefined) resumo['etapa'] = evento.etapa;
    if (evento.codigo_do_erro !== undefined) resumo['codigo_do_erro'] = evento.codigo_do_erro;

    return [
      exigirUuid('inquilino_id', evento.inquilino_id),
      momento.toISOString(),
      exigirUuid('requisicao_id', evento.requisicao_id),
      uuidOpcional('usuario_id', evento.usuario_id),
      evento.papel,
      evento.canal,
      uuidOpcional('sessao_id', evento.sessao_id),
      evento.acao,
      null, // `recurso` — o chassi ainda não o distingue da ação (marco 6)
      serializarResumo(resumo),
      evento.resultado,
      0, // `custo_centavos` do evento — o motor de custo é o marco 4
      uuidOpcional('aprovacao_id', evento.aprovacao_id),
    ];
  }

  async function registrarEDevolverId(evento: EventoDeAuditoria): Promise<string> {
    const linhas = await c.consultar<{ id: string }>(INSERIR_EVENTO, valores(evento));
    const id = linhas[0]?.id;
    if (id === undefined) {
      // `INSERT ... RETURNING` sem linha não deveria acontecer. Se acontecer,
      // falha fecha: não dá para afirmar que gravou.
      throw new Error('auditoria: o INSERT não devolveu id — não dá para afirmar que gravou');
    }
    return String(id);
  }

  return {
    async registrar(evento) {
      await registrarEDevolverId(evento);
    },

    registrarEDevolverId,

    async registrarComConsumo(evento, consumo) {
      const cache = consumo.cache_hit ?? false;
      if (cache && consumo.custo_centavos !== 0) {
        // O banco também recusa isto (`consumo_cache_nao_cobra`). A conferência
        // daqui existe pela mensagem: a do PostgreSQL diz o nome da restrição,
        // e esta diz o que a restrição significa.
        throw new Error(
          `auditoria: cache_hit com custo_centavos=${consumo.custo_centavos}. ` +
            `Resposta servida do cache não custou — o que ela TERIA custado vai em ` +
            `custo_evitado_centavos, que é como se responde "quanto o cache economizou".`,
        );
      }

      return c.emTransacao(async (cliente) => {
        const ev = await cliente.query(INSERIR_EVENTO, valores(evento));
        const eventoId: unknown = ev.rows[0]?.id;
        if (eventoId === undefined) {
          throw new Error('auditoria: o INSERT do evento não devolveu id');
        }

        await cliente.query(INSERIR_CONSUMO, [
          eventoId,
          exigirUuid('inquilino_id', evento.inquilino_id),
          consumo.fornecedor,
          consumo.operacao,
          consumo.custo_centavos,
          uuidOpcional('usuario_id', evento.usuario_id),
          uuidOpcional('cliente_id', consumo.cliente_id ?? null),
          uuidOpcional('processo_id', consumo.processo_id ?? null),
          cache,
          consumo.custo_evitado_centavos ?? 0,
          new Date(evento.momento).toISOString(),
        ]);

        return String(eventoId);
      });
    },
  };
}
