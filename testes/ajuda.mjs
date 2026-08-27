/**
 * ajuda.mjs — o cenário compartilhado pelos testes do chassi
 * ---------------------------------------------------------------------------
 * Ferramentas de mentira, sessões de mentira, e um cliente HTTP de mentira que
 * conta quantas vezes foi chamado.
 *
 * O CONTADOR É O PONTO. A propriedade que o marco 2 precisa provar não é só
 * "recusou": é **"recusou sem gastar"**. RF-07 tem duas metades — não vazar e
 * não pagar —, e a segunda só se verifica olhando se a execução foi alcançada.
 * Um teste que só conferisse o código de erro passaria mesmo se o chassi
 * recusasse DEPOIS de chamar a API.
 */

import {
  definirFerramenta,
  montarPerfis,
  auditoriaEmMemoria,
  cnj,
  texto,
  umDe,
} from '@lex/mcp-core';

// ---------------------------------------------------------------------------
// O "fornecedor": conta chamadas, e nada mais
// ---------------------------------------------------------------------------
export function criarFornecedor() {
  const estado = { chamadas: 0 };
  return {
    estado,
    async buscar(o) {
      estado.chamadas += 1;
      return { veio_de: 'fornecedor', ...o };
    },
  };
}

export const CNJ_DA_CARTEIRA = '6090045-13.2025.8.03.0001';
export const CNJ_DE_FORA = '0000132-06.2025.5.08.0205';

// ---------------------------------------------------------------------------
// As ferramentas
// ---------------------------------------------------------------------------
export function criarFerramentas(fornecedor) {
  const consultarProcesso = definirFerramenta({
    nome: 'consultar_processo',
    descricao: 'Consulta a capa de um processo pelo numero CNJ.',
    faixa: 'A1',
    escopo: 'escavador:processo:read',
    entrada: { numero_cnj: cnj(), formato: umDe(['resumo', 'completo'], { obrigatorio: false }) },
    sujeito: (p) => ({ processos: [p.numero_cnj] }),
    custo: { rota: 'v2.processo.capa' },
    cache: 'estado_processo',
    executar: (p) => fornecedor.buscar({ rota: 'capa', cnj: p.numero_cnj }),
  });

  const listarDiarios = definirFerramenta({
    nome: 'listar_diarios',
    descricao: 'Lista os diarios oficiais disponiveis. Nao trata de sujeito nenhum.',
    faixa: 'A0',
    escopo: 'escavador:origem:read',
    entrada: {},
    // Sem `sujeito`: de proposito. So funciona sob abrangencia `any`.
    executar: () => fornecedor.buscar({ rota: 'origens' }),
  });

  const criarMonitoramento = definirFerramenta({
    nome: 'criar_monitoramento',
    descricao: 'Cria uma vigilancia em diario oficial. Gera custo recorrente.',
    faixa: 'A2',
    escopo: 'escavador:monitoramento:write',
    entrada: { termo: texto({ maximo: 120 }) },
    executar: (p) => fornecedor.buscar({ rota: 'monitoramento', termo: p.termo }),
  });

  const enviarAoCliente = definirFerramenta({
    nome: 'enviar_ao_cliente',
    descricao: 'Envia uma mensagem ao cliente pelo WhatsApp. Efeito externo.',
    faixa: 'A3',
    escopo: 'escritorio:mensagem:write',
    entrada: { numero_cnj: cnj(), corpo: texto({ maximo: 900 }) },
    sujeito: (p) => ({ processos: [p.numero_cnj] }),
    executar: (p) => fornecedor.buscar({ rota: 'mensagem', cnj: p.numero_cnj }),
  });

  const peticionar = definirFerramenta({
    nome: 'peticionar',
    descricao: 'Protocola peticao no tribunal. Efeito juridico e de prazo.',
    faixa: 'A4',
    escopo: 'escritorio:peticao:write',
    entrada: { numero_cnj: cnj(), corpo: texto({ maximo: 900 }) },
    sujeito: (p) => ({ processos: [p.numero_cnj] }),
    executar: (p) => fornecedor.buscar({ rota: 'peticao', cnj: p.numero_cnj }),
  });

  const lista = [consultarProcesso, listarDiarios, criarMonitoramento, enviarAoCliente, peticionar];
  return new Map(lista.map((f) => [f.nome, f]));
}

// ---------------------------------------------------------------------------
// Os perfis de exposicao
// ---------------------------------------------------------------------------
export const PERFIS = montarPerfis([
  { nome: 'cliente', ferramentas: ['consultar_processo'] },
  {
    nome: 'colaborador',
    ferramentas: ['consultar_processo', 'listar_diarios', 'criar_monitoramento', 'enviar_ao_cliente'],
  },
  {
    nome: 'advogado',
    ferramentas: [
      'consultar_processo',
      'listar_diarios',
      'criar_monitoramento',
      'enviar_ao_cliente',
      'peticionar',
    ],
  },
]);

// ---------------------------------------------------------------------------
// Sessoes
// ---------------------------------------------------------------------------
export const AGORA = new Date('2026-08-27T12:00:00.000Z');

export function sessao(ajustes = {}) {
  return {
    sessao_id: 'ses_teste',
    inquilino_id: 'esc_001',
    usuario_id: 'usr_014',
    papel: 'advogado',
    canal: 'telegram',
    perfil: 'advogado',
    escopos: [],
    sujeitos_autorizados: { processos: [CNJ_DA_CARTEIRA], documentos: [] },
    emitida_em: '2026-08-27T11:55:00.000Z',
    expira_em: '2026-08-27T12:10:00.000Z',
    ...ajustes,
  };
}

export function montar(ajustesDaSessao = {}) {
  const fornecedor = criarFornecedor();
  const auditoria = auditoriaEmMemoria();
  return {
    fornecedor,
    auditoria,
    cfg: { ferramentas: criarFerramentas(fornecedor), perfis: PERFIS, auditoria },
    sessao: sessao(ajustesDaSessao),
  };
}

export function chamada(ferramenta, parametros, s, extra = {}) {
  return {
    ferramenta,
    parametros,
    sessao: s,
    requisicao_id: 'req_teste',
    agora: AGORA,
    ...extra,
  };
}
