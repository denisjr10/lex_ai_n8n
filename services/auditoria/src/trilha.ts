/**
 * trilha.ts — reconstruir uma operação inteira pelo `requisicao_id`
 * ---------------------------------------------------------------------------
 * Este arquivo é o critério de aceite do marco 3. A tabela existir e aceitar
 * INSERT não prova nada: o que se promete ao escritório é **conseguir contar,
 * meses depois, o que aconteceu numa operação e por quê**. Se a leitura não
 * remonta a história, a escrita foi só consumo de disco.
 *
 * O `requisicao_id` nasce no canal e atravessa n8n, Policy Gate, MCP, SDK e
 * callback (D-75). É por ele que a costura acontece.
 *
 * ⚠️ **A CONSULTA EXIGE `inquilino_id`, E NÃO É ZELO EXCESSIVO.**
 *
 * `WHERE requisicao_id = $1` sozinho atravessa inquilinos. É o mesmo defeito
 * que a revisão de 28/08 encontrou no comentário da migração 005, que afirmava
 * que a chave primária composta tornava impossível ler a entrada de outro
 * inquilino: chave composta impede **colisão**, não **leitura**.
 *
 * O `requisicao_id` é um uuid, então a colisão entre inquilinos é
 * improbabilíssima — e "improbabilíssima" é uma propriedade estatística, não
 * uma barreira. A Regra 5 manda negar por padrão, e negar por padrão aqui
 * significa que quem consulta declara em nome de qual escritório consulta.
 * Torná-lo parâmetro obrigatório é o que impede a assinatura desta função de
 * um dia ser chamada sem ele.
 */

import { exigirUuid } from './identificador.js';
import type { Conexao } from './conexao.js';

export interface EventoDaTrilha {
  readonly id: string;
  readonly momento: string;
  readonly usuario_id: string | null;
  readonly papel: string | null;
  readonly canal: string | null;
  readonly sessao_id: string | null;
  readonly acao: string;
  readonly resultado: 'permitido' | 'negado' | 'erro' | 'expirado';
  readonly etapa: string | null;
  readonly codigo_do_erro: string | null;
  readonly aprovacao_id: string | null;
  readonly custo_centavos: number;
}

export interface ConsumoDaTrilha {
  readonly evento_auditoria_id: string;
  readonly fornecedor: string;
  readonly operacao: string;
  readonly custo_centavos: number;
  readonly cache_hit: boolean;
  readonly custo_evitado_centavos: number;
}

export interface Trilha {
  readonly requisicao_id: string;
  readonly eventos: readonly EventoDaTrilha[];
  readonly consumo: readonly ConsumoDaTrilha[];
  /** Soma do que a operação custou de fato. */
  readonly custo_total_centavos: number;
  /** Soma do que ela teria custado sem cache. */
  readonly custo_evitado_centavos: number;
}

const LER_EVENTOS = `
  SELECT id, momento, usuario_id, papel, canal, sessao_id, acao, resultado,
         parametros_resumidos ->> 'etapa'          AS etapa,
         parametros_resumidos ->> 'codigo_do_erro' AS codigo_do_erro,
         aprovacao_id, custo_centavos
    FROM evento_auditoria
   WHERE requisicao_id = $1
     AND inquilino_id  = $2
   ORDER BY id
`;

// O `inquilino_id` aparece nas DUAS pontas de propósito: no `consumo` e no
// `evento_auditoria` do JOIN. Filtrar só de um lado bastaria se as duas
// colunas jamais divergissem — e é justamente essa suposição que o achado 5 da
// revisão diz que o esquema ainda não garante.
const LER_CONSUMO = `
  SELECT c.evento_auditoria_id, c.fornecedor, c.operacao, c.custo_centavos,
         c.cache_hit, c.custo_evitado_centavos
    FROM consumo c
    JOIN evento_auditoria e ON e.id = c.evento_auditoria_id
   WHERE e.requisicao_id = $1
     AND e.inquilino_id  = $2
     AND c.inquilino_id  = $2
   ORDER BY c.id
`;

export async function reconstruir(
  c: Conexao,
  requisicao_id: string,
  inquilino_id: string,
): Promise<Trilha> {
  const req = exigirUuid('requisicao_id', requisicao_id);
  const inq = exigirUuid('inquilino_id', inquilino_id);

  const eventosCrus = await c.consultar<Record<string, unknown>>(LER_EVENTOS, [req, inq]);
  const consumoCru = await c.consultar<Record<string, unknown>>(LER_CONSUMO, [req, inq]);

  // `bigint` e `numeric` chegam do `pg` como texto, de propósito: o driver não
  // arrisca perder precisão convertendo para `number`. Os ids ficam texto —
  // ninguém faz aritmética com eles. Os centavos viram número, porque são
  // somados logo abaixo e cabem folgadamente num inteiro seguro.
  const eventos: EventoDaTrilha[] = eventosCrus.map((l) => ({
    id: String(l['id']),
    momento: (l['momento'] as Date).toISOString(),
    usuario_id: (l['usuario_id'] as string | null) ?? null,
    papel: (l['papel'] as string | null) ?? null,
    canal: (l['canal'] as string | null) ?? null,
    sessao_id: (l['sessao_id'] as string | null) ?? null,
    acao: String(l['acao']),
    resultado: l['resultado'] as EventoDaTrilha['resultado'],
    etapa: (l['etapa'] as string | null) ?? null,
    codigo_do_erro: (l['codigo_do_erro'] as string | null) ?? null,
    aprovacao_id: (l['aprovacao_id'] as string | null) ?? null,
    custo_centavos: Number(l['custo_centavos']),
  }));

  const consumo: ConsumoDaTrilha[] = consumoCru.map((l) => ({
    evento_auditoria_id: String(l['evento_auditoria_id']),
    fornecedor: String(l['fornecedor']),
    operacao: String(l['operacao']),
    custo_centavos: Number(l['custo_centavos']),
    cache_hit: Boolean(l['cache_hit']),
    custo_evitado_centavos: Number(l['custo_evitado_centavos']),
  }));

  return {
    requisicao_id: req,
    eventos,
    consumo,
    custo_total_centavos: consumo.reduce((s, x) => s + x.custo_centavos, 0),
    custo_evitado_centavos: consumo.reduce((s, x) => s + x.custo_evitado_centavos, 0),
  };
}

/**
 * A consulta que a gerência faz: o que foi **negado**, e para quem.
 *
 * Tem índice próprio desde a migração 003 (`evento_auditoria_negados`), o que
 * diz algo sobre a expectativa de uso: recusa não é exceção rara a ser
 * garimpada num log — é relatório.
 *
 * E ganha peso novo com a D-146. O escritório decidiu que o advogado enxerga a
 * base inteira, e o controle que se removeu foi substituído por **registro**:
 * acesso fora da própria carteira vira relatório mensal. Quem lê esse relatório
 * lê daqui.
 */
export async function negados(
  c: Conexao,
  inquilino_id: string,
  desde: Date,
  ate: Date,
): Promise<readonly EventoDaTrilha[]> {
  const inq = exigirUuid('inquilino_id', inquilino_id);
  const linhas = await c.consultar<Record<string, unknown>>(
    `SELECT id, momento, usuario_id, papel, canal, sessao_id, acao, resultado,
            parametros_resumidos ->> 'etapa'          AS etapa,
            parametros_resumidos ->> 'codigo_do_erro' AS codigo_do_erro,
            aprovacao_id, custo_centavos
       FROM evento_auditoria
      WHERE inquilino_id = $1
        AND resultado    = 'negado'
        AND momento     >= $2
        AND momento      < $3
      ORDER BY momento DESC`,
    [inq, desde.toISOString(), ate.toISOString()],
  );

  return linhas.map((l) => ({
    id: String(l['id']),
    momento: (l['momento'] as Date).toISOString(),
    usuario_id: (l['usuario_id'] as string | null) ?? null,
    papel: (l['papel'] as string | null) ?? null,
    canal: (l['canal'] as string | null) ?? null,
    sessao_id: (l['sessao_id'] as string | null) ?? null,
    acao: String(l['acao']),
    resultado: l['resultado'] as EventoDaTrilha['resultado'],
    etapa: (l['etapa'] as string | null) ?? null,
    codigo_do_erro: (l['codigo_do_erro'] as string | null) ?? null,
    aprovacao_id: (l['aprovacao_id'] as string | null) ?? null,
    custo_centavos: Number(l['custo_centavos']),
  }));
}
