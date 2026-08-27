/**
 * O chassi — a sequência fixa por onde toda chamada passa
 * ---------------------------------------------------------------------------
 * Spec §4.2. Aqui a Regra 1 deixa de ser princípio e vira código.
 *
 * A PROPRIEDADE QUE ESTE ARQUIVO PRECISA TER, ACIMA DE QUALQUER OUTRA:
 *
 *   **Não existe caminho alternativo até a execução.** `executar` da ferramenta
 *   só é chamado no fim desta função, depois de todas as etapas. A ferramenta
 *   não recebe nada com que construir um atalho — nem credencial, nem cliente
 *   HTTP, nem a sessão.
 *
 * A ORDEM É FIXA e mora só aqui. Ferramenta não reordena, não pula, não
 * acrescenta. Se ela pudesse, a fronteira de segurança voltaria a depender da
 * disciplina de quem escreve ferramenta — que é exatamente o que o chassi
 * existe para não depender.
 *
 * ETAPAS DO MARCO 2 (2 a 8, mais o envelope). As etapas 9 (custo), 10 (cache)
 * e 11 (execução com SDK) entram nos marcos 4, 5 e 6, e as costuras estão
 * marcadas com «marco N» abaixo. A auditoria (marco 3) é incondicional e
 * envolve tudo: sucesso, recusa e erro geram registro.
 */

import {
  ehErro,
  erroInterno,
  responder,
  responderErro,
  type Decisao,
  type Envelope,
  type ErroInterno,
  type Sessao,
} from '@lex/dominio';

import {
  etapaAbrangencia,
  etapaAprovacao,
  etapaEscopo,
  etapaPerfil,
  etapaSessao,
  NADA_REVOGADO,
  type AprovacaoApresentada,
  type ListaDeRevogacao,
} from './etapas.js';

import { validar, type Esquema } from './esquema.js';
import type { Contexto, Ferramenta } from './ferramenta.js';

/**
 * O que a auditoria recebe de toda chamada — sucesso, recusa ou erro.
 *
 * ⚠️ **Auditoria indisponível BLOQUEIA a operação** (D-77). Falha fecha também
 * aqui: um sistema que age sem conseguir registrar o ato é um sistema sem
 * prova. Por isso `registrar` pode lançar, e o chassi trata o lançamento como
 * recusa — em vez de seguir e "tentar gravar depois".
 */
export interface Auditoria {
  registrar(evento: EventoDeAuditoria): void;
}

export interface EventoDeAuditoria {
  readonly requisicao_id: string;
  readonly inquilino_id: string;
  readonly usuario_id: string;
  readonly papel: string;
  readonly canal: string;
  readonly sessao_id: string;
  readonly acao: string;
  readonly resultado: 'permitido' | 'negado' | 'erro';
  readonly codigo_do_erro?: string;
  /** Etapa que recusou. É o que torna a trilha legível meses depois. */
  readonly etapa?: string;
  readonly momento: string;
}

/** Auditoria de memória, para teste. Em produção entra a do marco 3. */
export function auditoriaEmMemoria(): Auditoria & { eventos: EventoDeAuditoria[] } {
  const eventos: EventoDeAuditoria[] = [];
  return { eventos, registrar: (e) => void eventos.push(e) };
}

export interface Chamada {
  readonly ferramenta: string;
  readonly parametros: Readonly<Record<string, unknown>>;
  readonly sessao: Sessao;
  readonly requisicao_id: string;
  readonly agora: Date;
  readonly aprovacao?: AprovacaoApresentada;
}

export interface ConfiguracaoDoChassi {
  readonly ferramentas: ReadonlyMap<string, Ferramenta<Esquema, unknown>>;
  readonly perfis: ReadonlyMap<string, ReadonlySet<string>>;
  readonly auditoria: Auditoria;
  readonly revogacao?: ListaDeRevogacao;
}

/**
 * Um observador do que aconteceu em cada etapa, para teste e para o marco 3.
 *
 * Existe porque a propriedade mais importante do chassi — *"recusa não gasta"* —
 * só é testável se der para saber ONDE a recusa ocorreu e se a execução foi
 * alcançada. Sem isto, um teste de recusa passaria mesmo se o chassi recusasse
 * depois de chamar a API.
 */
export interface Trilha {
  etapas: string[];
  executou: boolean;
}

export async function executarChamada(
  cfg: ConfiguracaoDoChassi,
  chamada: Chamada,
  trilha: Trilha = { etapas: [], executou: false },
): Promise<Envelope<unknown>> {
  const { sessao, requisicao_id, agora } = chamada;
  const revogacao = cfg.revogacao ?? NADA_REVOGADO;

  /** Fecha a chamada: registra na auditoria e devolve o envelope. */
  const encerrar = (etapa: string, erro: ErroInterno): Envelope<unknown> => {
    try {
      cfg.auditoria.registrar({
        requisicao_id,
        inquilino_id: sessao.inquilino_id,
        usuario_id: sessao.usuario_id,
        papel: sessao.papel,
        canal: sessao.canal,
        sessao_id: sessao.sessao_id,
        acao: chamada.ferramenta,
        resultado: erro.codigo === 'erro_interno' ? 'erro' : 'negado',
        codigo_do_erro: erro.codigo,
        etapa,
        momento: agora.toISOString(),
      });
    } catch {
      // Auditoria caiu. NÃO devolvemos o resultado assim mesmo: um ato sem
      // registro é um ato sem prova, e a Regra 5 diz que governança
      // indisponível bloqueia em vez de liberar (D-77).
      return responderErro(
        erroInterno('a auditoria está indisponível e nenhuma operação pode prosseguir sem registro'),
        requisicao_id,
      );
    }
    return responderErro(erro, requisicao_id);
  };

  const passo = (nome: string, d: Decisao): Envelope<unknown> | null => {
    trilha.etapas.push(nome);
    return d.permitido ? null : encerrar(nome, d.erro);
  };

  // -- Etapa 2: sessão ------------------------------------------------------
  {
    const parar = passo('sessao', etapaSessao(sessao, agora, revogacao));
    if (parar) return parar;
  }

  // -- Etapa 3: inquilino e credencial --------------------------------------
  // A resolução de credencial é do marco 6 (quando houver SDK). O que já vale
  // agora é a trava: sessão sem inquilino nunca vira chamada anônima.
  {
    trilha.etapas.push('inquilino');
    if (!sessao.inquilino_id.trim()) {
      return encerrar('inquilino', erroInterno('sessão sem inquilino'));
    }
  }

  // -- Etapa 4: perfil ------------------------------------------------------
  {
    const parar = passo(
      'perfil',
      etapaPerfil(chamada.ferramenta, sessao.perfil, cfg.perfis),
    );
    if (parar) return parar;
  }

  const ferramenta = cfg.ferramentas.get(chamada.ferramenta);
  if (!ferramenta) {
    // O perfil expõe uma ferramenta que não está registrada: erro de
    // configuração do servidor, não do agente.
    return encerrar('registro', erroInterno('ferramenta exposta no perfil, mas não registrada'));
  }

  // -- Etapa 5: escopo ------------------------------------------------------
  const escopo = etapaEscopo(ferramenta.escopoLido, sessao.escopos);
  {
    const parar = passo('escopo', escopo.decisao);
    if (parar) return parar;
  }
  const abrangencia = escopo.abrangencia;
  if (!abrangencia) {
    return encerrar('escopo', erroInterno('escopo permitido sem abrangência resolvida'));
  }

  // -- Etapa 7 ANTES da 6, e a inversão é deliberada ------------------------
  //
  // A Spec numera abrangência como 6 e validação como 7. A ordem real precisa
  // ser a inversa por uma razão concreta: a abrangência confere o CNJ contra a
  // sessão, e comparar um CNJ ainda não normalizado daria falso negativo —
  // "0000132-06.2025.5.08.0205" e "00001320620255080205" são o mesmo processo
  // e não são a mesma cadeia de caracteres.
  //
  // Trocar a ordem não afrouxa nada: validar entrada não custa crédito nem
  // revela existência de processo. As duas continuam antes de qualquer gasto.
  const validacao = validar(ferramenta.entrada, chamada.parametros);
  trilha.etapas.push('entrada');
  if (!validacao.ok) return encerrar('entrada', validacao.erro);
  const parametros = validacao.valor;

  // -- Etapa 6: abrangência -------------------------------------------------
  {
    const sujeitos = ferramenta.sujeito ? ferramenta.sujeito(parametros) : undefined;
    const parar = passo('abrangencia', etapaAbrangencia(abrangencia, sujeitos, sessao));
    if (parar) return parar;
  }

  // -- Etapa 8: faixa e aprovação -------------------------------------------
  {
    const resumo = `${ferramenta.nome}:${JSON.stringify(parametros)}`;
    const parar = passo(
      'aprovacao',
      etapaAprovacao(ferramenta.faixa, resumo, chamada.aprovacao, agora),
    );
    if (parar) return parar;
  }

  // -- Etapa 9: custo  «marco 4» --------------------------------------------
  // -- Etapa 10: cache «marco 5» --------------------------------------------

  // -- Etapa 11: execução ---------------------------------------------------
  const ctx: Contexto = {
    requisicao_id,
    inquilino_id: sessao.inquilino_id,
    agora,
  };

  let dados: unknown;
  try {
    trilha.executou = true;
    dados = await ferramenta.executar(parametros, ctx);
  } catch (e) {
    const detalhe = e instanceof Error ? e.message : 'falha desconhecida';
    return encerrar('execucao', erroInterno(detalhe));
  }

  // -- Auditoria do sucesso, incondicional ----------------------------------
  try {
    cfg.auditoria.registrar({
      requisicao_id,
      inquilino_id: sessao.inquilino_id,
      usuario_id: sessao.usuario_id,
      papel: sessao.papel,
      canal: sessao.canal,
      sessao_id: sessao.sessao_id,
      acao: ferramenta.nome,
      resultado: 'permitido',
      etapa: 'execucao',
      momento: agora.toISOString(),
    });
  } catch {
    return responderErro(
      erroInterno('a auditoria está indisponível e a operação não pode ser confirmada'),
      requisicao_id,
    );
  }

  return responder(dados, { origem: 'api', requisicao_id });
}

export { ehErro };
