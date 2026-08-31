/**
 * O chassi — as propriedades que não são a matriz de escopo
 * ---------------------------------------------------------------------------
 * Sessão, tradução de erro, envelope, recusa na carga e a trava de auditoria.
 * Spec §14.1, na parte que o marco 2 alcança.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  definirFerramenta,
  executarChamada,
  traduzirErro,
  texto,
  cnj,
  ehErro,
} from '@lex/mcp-core';
import {
  abrangenciaConcedida,
  cnjValido,
  lerEscopo,
  normalizarCnj,
  podeRepetir,
  responder,
  sessaoVigente,
} from '@lex/dominio';

import { montar, chamada, CNJ_DA_CARTEIRA, AGORA } from './ajuda.mjs';

// ---------------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------------

test('sessão expirada não passa', async () => {
  const { cfg, sessao: s, fornecedor } = montar({
    escopos: ['escavador:processo:read:any'],
    expira_em: '2026-08-27T11:59:00.000Z', // um minuto antes de AGORA
  });
  const r = await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, s));
  assert.equal(r.erro.codigo, 'sessao_invalida');
  assert.equal(fornecedor.estado.chamadas, 0);
});

test('sessão revogada não passa, mesmo dentro da validade', async () => {
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const cfg = { ...base.cfg, revogacao: { revogada: (id) => id === 'ses_teste' } };
  const r = await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, base.sessao));
  assert.equal(r.erro.codigo, 'sessao_invalida');
  assert.equal(base.fornecedor.estado.chamadas, 0);
});

test('data ilegível é sessão inválida, não sessão eterna', () => {
  const boa = {
    emitida_em: '2026-08-27T11:55:00.000Z',
    expira_em: '2026-08-27T12:10:00.000Z',
  };
  assert.equal(sessaoVigente(boa, AGORA), true);
  assert.equal(sessaoVigente({ ...boa, expira_em: 'qualquer coisa' }, AGORA), false);
  assert.equal(sessaoVigente({ ...boa, emitida_em: '' }, AGORA), false);
  // Expira antes de ser emitida: incoerente, logo inválida.
  assert.equal(
    sessaoVigente({ emitida_em: '2026-08-27T12:10:00.000Z', expira_em: '2026-08-27T11:55:00.000Z' }, AGORA),
    false,
  );
});

// ---------------------------------------------------------------------------
// Tradução de erro — Spec §10
// ---------------------------------------------------------------------------

test('402 sem saldo NUNCA é repetível', () => {
  const e = traduzirErro('escavador', { status: 402 });
  assert.equal(e.codigo, 'saldo_esgotado');
  assert.equal(e.repetivel, false);
  assert.equal(podeRepetir(e), false);
  assert.equal(e.acao_sugerida, 'escalar_humano');
});

test('401 e 403 nunca repetem — insistir com credencial inválida não muda nada', () => {
  for (const status of [401, 403]) {
    const e = traduzirErro('escavador', { status });
    assert.equal(e.codigo, 'credencial_invalida');
    assert.equal(e.repetivel, false);
  }
});

test('429 repete; 5xx repete e sugere cache', () => {
  const vazao = traduzirErro('trello', { status: 429 });
  assert.equal(vazao.codigo, 'vazao_excedida');
  assert.equal(vazao.repetivel, true);
  assert.equal(vazao.acao_sugerida, 'tentar_novamente');

  const fora = traduzirErro('escavador', { status: 503 });
  assert.equal(fora.codigo, 'fornecedor_indisponivel');
  assert.equal(fora.repetivel, true);
  assert.equal(fora.acao_sugerida, 'usar_cache');
});

test('422 aponta o campo e manda corrigir, sem repetir', () => {
  const e = traduzirErro('escavador', { status: 422, campo: 'enviar_callback' });
  assert.equal(e.codigo, 'parametro_invalido');
  assert.equal(e.campo, 'enviar_callback');
  assert.equal(e.repetivel, false);
  assert.equal(e.acao_sugerida, 'corrigir_parametro');
});

test('404 do Trello não vira palpite sobre existência', () => {
  const trello = traduzirErro('trello', { status: 404 });
  const escavador = traduzirErro('escavador', { status: 404 });
  assert.equal(trello.codigo, 'nao_encontrado');
  // Mesmo tratamento nos dois: o Trello não distingue "não existe" de "não
  // enxerga", e o chassi não tenta adivinhar.
  assert.deepEqual(trello, escavador);
});

test('status imprevisto não vira "provavelmente dá certo se repetir"', () => {
  const e = traduzirErro('escavador', { status: 418 });
  assert.equal(e.codigo, 'erro_interno');
  assert.equal(e.repetivel, false);
});

test('a mensagem crua do fornecedor nunca chega ao agente', () => {
  const e = traduzirErro('escavador', {
    status: 402,
    mensagem: 'Saldo bloqueado para a conta 12345, contate o financeiro',
  });
  assert.ok(!e.mensagem_agente.includes('12345'));
  assert.ok(!e.mensagem_agente.includes('bloqueado para a conta'));
});

// ---------------------------------------------------------------------------
// Envelope — Spec §4.3
// ---------------------------------------------------------------------------

test('resposta traz origem, idade e custo — sempre, e nunca ausentes', async () => {
  const { cfg, sessao: s } = montar({ escopos: ['escavador:processo:read:any'] });
  const r = await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, s));

  assert.equal(ehErro(r), false);
  for (const campo of ['origem', 'idade_segundos', 'custo_centavos', 'ha_mais', 'requisicao_id']) {
    assert.ok(campo in r.meta, `meta.${campo} é obrigatório`);
    assert.notEqual(r.meta[campo], undefined, `meta.${campo} não pode ser undefined`);
  }
  assert.equal(r.meta.requisicao_id, 'req_teste');
  assert.deepEqual(r.avisos, []);
});

test('ha_mais nasce falso e proximo_cursor nasce nulo — o padrão que não engana', () => {
  const r = responder({ x: 1 }, { origem: 'cache', requisicao_id: 'req_1' });
  assert.equal(r.meta.ha_mais, false);
  assert.equal(r.meta.proximo_cursor, null);
  assert.equal(r.meta.idade_segundos, 0);
  assert.equal(r.meta.custo_centavos, 0);
});

// ---------------------------------------------------------------------------
// Recusa na carga — Spec §4.5
// ---------------------------------------------------------------------------

test('ferramenta com campo de credencial é recusada na carga', () => {
  for (const nome of ['token', 'api_key', 'senha', 'authorization', 'chave']) {
    assert.throws(
      () =>
        definirFerramenta({
          nome: 'ferramenta_ruim',
          descricao: 'Uma ferramenta que tenta receber credencial.',
          faixa: 'A1',
          escopo: 'escavador:processo:read',
          entrada: { [nome]: texto() },
          executar: async () => ({}),
        }),
      /credencial/i,
      `o campo "${nome}" deveria ser recusado`,
    );
  }
});

test('ferramenta não declara abrangência — abrangência é da concessão', () => {
  assert.throws(
    () =>
      definirFerramenta({
        nome: 'ferramenta_atrevida',
        descricao: 'Tenta declarar a propria abrangencia.',
        faixa: 'A1',
        escopo: 'escavador:processo:read:any',
        entrada: { numero_cnj: cnj() },
        executar: async () => ({}),
      }),
    /abrang/i,
  );
});

test('escopo ilegível derruba a ferramenta na carga, não na chamada', () => {
  assert.throws(
    () =>
      definirFerramenta({
        nome: 'ferramenta_torta',
        descricao: 'Escopo que nao segue a convencao.',
        faixa: 'A1',
        escopo: 'escavador:processo',
        entrada: {},
        executar: async () => ({}),
      }),
    /convenção|convencao/i,
  );
});

// ---------------------------------------------------------------------------
// Auditoria indisponível bloqueia — D-77
// ---------------------------------------------------------------------------

test('auditoria indisponível bloqueia a operação, mesmo quando ela seria permitida', async () => {
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const cfg = {
    ...base.cfg,
    auditoria: {
      registrar() {
        throw new Error('banco de auditoria fora do ar');
      },
    },
  };

  const r = await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, base.sessao));

  assert.equal(ehErro(r), true);
  assert.equal(r.erro.codigo, 'erro_interno');
  assert.match(r.erro.mensagem_agente, /auditoria/i);

  // A METADE QUE FALTAVA, E ERA A QUE IMPORTAVA (D-141).
  //
  // Conferir só o envelope deixava passar o defeito que existia de verdade: o
  // chassi chamava o fornecedor, gastava o crédito, e SÓ ENTÃO descobria que
  // não conseguiria registrar. O teste ficava verde porque a resposta era, de
  // fato, um erro de auditoria — mas o dinheiro já tinha saído.
  //
  // A D-141 diz: toda recusa exige o contador em zero. Esta linha é essa regra.
  assert.equal(base.fornecedor.estado.chamadas, 0,
    'a auditoria caiu e o fornecedor foi chamado assim mesmo — "falha fecha" que fecha depois do fato não fecha nada');
});

test('auditoria que rejeita PROMESSA bloqueia igual — a gravação real é assíncrona', async () => {
  // A armadilha que este teste existe para pegar: se `registrar` for declarado
  // `void` e o chassi não aguardar, uma auditoria assíncrona que falha rejeita
  // SOZINHA, longe do try/catch. O teste acima continuaria verde, a operação
  // seguiria em frente, e a trava da D-77 teria deixado de existir sem que
  // nenhuma linha vermelha aparecesse. O marco 3 grava em PostgreSQL — ou seja,
  // é exatamente este o caso que vai para produção.
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const cfg = {
    ...base.cfg,
    auditoria: {
      registrar: async () => { throw new Error('timeout gravando no PostgreSQL'); },
    },
  };

  const r = await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, base.sessao));

  assert.equal(ehErro(r), true);
  assert.equal(r.erro.codigo, 'erro_interno');
  assert.match(r.erro.mensagem_agente, /auditoria/i);
  assert.equal(base.fornecedor.estado.chamadas, 0,
    'auditoria assíncrona falhou e o fornecedor foi chamado — o chassi não está aguardando a gravação');
});

test('o registro da autorização acontece ANTES da execução, não depois', async () => {
  // Prova de ordem, e não só de resultado: a auditoria observa o contador de
  // chamadas ao fornecedor no instante em que é chamada. Se ela vir o contador
  // já em 1, é porque a execução veio primeiro.
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const vistos = [];
  const cfg = {
    ...base.cfg,
    auditoria: {
      registrar(e) {
        vistos.push({ etapa: e.etapa, chamadasNoFornecedorAteAgora: base.fornecedor.estado.chamadas });
      },
    },
  };

  const r = await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, base.sessao));

  assert.equal(ehErro(r), false);
  const autorizacao = vistos.find((v) => v.etapa === 'execucao');
  assert.ok(autorizacao, 'a autorização não gerou registro nenhum');
  assert.equal(autorizacao.chamadasNoFornecedorAteAgora, 0,
    'quando a auditoria foi chamada o fornecedor já tinha sido acionado — a ordem está invertida');
  assert.equal(base.fornecedor.estado.chamadas, 1, 'a chamada permitida deveria ter executado');
});

test('erro do fornecedor não vaza detalhe interno para o agente', async () => {
  // Conteúdo externo é hostil nos dois sentidos (Regra 4): o que volta do
  // fornecedor também não é para ser repassado cru a quem lê conteúdo externo.
  // O detalhe vai para a trilha, que é de quem investiga.
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const cfg = {
    ...base.cfg,
    ferramentas: new Map([...base.cfg.ferramentas].map(([nome, f]) => [nome, {
      ...f,
      executar: async () => { throw new Error('ECONNREFUSED 10.0.3.7:5432 senha=hunter2'); },
    }])),
  };

  const trilha = { etapas: [], executou: false };
  const r = await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, base.sessao), trilha);

  assert.equal(ehErro(r), true);
  assert.doesNotMatch(r.erro.mensagem_agente, /ECONNREFUSED|10\.0\.3\.7|hunter2/,
    'o erro cru do fornecedor chegou ao agente');
  assert.match(trilha.detalheDaFalha, /ECONNREFUSED/, 'o detalhe deveria ter ficado na trilha');
});

// ---------------------------------------------------------------------------
// Faixas A3a e A3b — D-142
// ---------------------------------------------------------------------------

const APROVACAO_BASE = {
  aprovacao_id: 'apr_1',
  faixa: 'A3b',
  aprovador_id: 'usr_014',
  papel_do_aprovador: 'advogado',
  status: 'aprovada',
  expira_em: '2026-08-27T16:00:00.000Z',
};

/** Aprovação para a chamada exata — aprova-se o conteúdo final, não a intenção. */
function aprovacaoPara(ferramenta, parametros, ajustes = {}) {
  return {
    ...APROVACAO_BASE,
    ...ajustes,
    resumo_do_conteudo: `${ferramenta}:${JSON.stringify(parametros)}`,
  };
}

test('estagiário NÃO aprova comunicação externa, mesmo com a aprovação em ordem', async () => {
  // Este era o furo: até 31/08 o chassi conferia o papel do aprovador só em A4.
  // Uma aprovação A3 assinada por estagiário passava com `permitido: true` — e
  // A3 é justamente a faixa do que sai do escritório e chega ao cliente.
  const base = montar({ escopos: ['escritorio:mensagem:write:carteira'] });
  const parametros = { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Bom dia! Seu processo teve andamento.' };

  const r = await executarChamada(base.cfg, {
    ...chamada('enviar_ao_cliente', parametros, base.sessao),
    aprovacao: aprovacaoPara('enviar_ao_cliente', parametros, { papel_do_aprovador: 'estagiario' }),
  });

  assert.equal(ehErro(r), true, 'estagiário aprovou envio ao cliente e a mensagem saiu');
  assert.equal(base.fornecedor.estado.chamadas, 0);
});

test('advogado aprova a mesma chamada, e ela sai', async () => {
  // O contraponto obrigatório: uma trava que nega tudo não prova nada.
  const base = montar({ escopos: ['escritorio:mensagem:write:carteira'] });
  const parametros = { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Bom dia! Seu processo teve andamento.' };

  const r = await executarChamada(base.cfg, {
    ...chamada('enviar_ao_cliente', parametros, base.sessao),
    aprovacao: aprovacaoPara('enviar_ao_cliente', parametros),
  });

  assert.equal(ehErro(r), false);
  assert.equal(base.fornecedor.estado.chamadas, 1);
});

test('a faixa A3 pura deixou de existir, e a recusa ensina a escolher', () => {
  // Ferramenta escrita antes da D-142 não pode simplesmente continuar valendo:
  // ninguém teria decidido de que lado ela cai, e o lado herdado seria o mais
  // permissivo em metade dos casos.
  assert.throws(
    () => definirFerramenta({
      nome: 'avisar_cliente',
      descricao: 'Manda um aviso ao cliente pelo WhatsApp',
      faixa: 'A3',
      escopo: 'escritorio:mensagem:write',
      entrada: {},
      executar: async () => ({}),
    }),
    /A3a.*A3b|A3b.*A3a/s,
  );
});

test('A3a não pode ser declarada enquanto o catálogo de gabaritos não existir', () => {
  // A3a DISPENSA aprovação porque um gabarito aprovado antes a substitui. Sem
  // catálogo, seria uma faixa que libera apoiada numa garantia que ninguém
  // verifica — melhor não subir do que subir com um buraco (D-140).
  assert.throws(
    () => definirFerramenta({
      nome: 'avisar_movimentacao',
      descricao: 'Avisa o cliente de uma movimentação, por gabarito',
      faixa: 'A3a',
      escopo: 'escritorio:mensagem:write',
      entrada: {},
      executar: async () => ({}),
    }),
    /gabarito/i,
  );
});

// ---------------------------------------------------------------------------
// Domínio
// ---------------------------------------------------------------------------

test('CNJ: dígito verificador confere, e a normalização é idempotente', () => {
  assert.equal(cnjValido(CNJ_DA_CARTEIRA), true);
  assert.equal(cnjValido('6090045-99.2025.8.03.0001'), false);
  assert.equal(cnjValido('não é cnj'), false);

  const so = CNJ_DA_CARTEIRA.replace(/\D/g, '');
  assert.equal(normalizarCnj(so), CNJ_DA_CARTEIRA);
  assert.equal(normalizarCnj(CNJ_DA_CARTEIRA), CNJ_DA_CARTEIRA);
  assert.equal(normalizarCnj(normalizarCnj(so)), CNJ_DA_CARTEIRA);
  assert.equal(normalizarCnj('123'), null);
});

test('escopo: curinga não é escopo, e ação desconhecida não é escopo', () => {
  assert.equal(lerEscopo('escavador:*'), null);
  assert.equal(lerEscopo('escavador:processo:*'), null);
  assert.equal(lerEscopo('escavador:processo:listar'), null);
  assert.equal(lerEscopo('escavador:processo:read:tudo'), null);
  assert.equal(lerEscopo('escavador:processo:read:own:demais'), null);

  const e = lerEscopo('escavador:processo:read:carteira');
  assert.deepEqual(e, {
    sistema: 'escavador',
    recurso: 'processo',
    acao: 'read',
    abrangencia: 'carteira',
  });
});

test('escopo: entre concessões vale a mais ampla; sem abrangência vale own', () => {
  const exigencia = { sistema: 'escavador', recurso: 'processo', acao: 'read' };
  const ler = (t) => t.map(lerEscopo).filter(Boolean);

  assert.equal(abrangenciaConcedida(ler(['escavador:processo:read']), exigencia), 'own');
  assert.equal(
    abrangenciaConcedida(ler(['escavador:processo:read:own', 'escavador:processo:read:carteira']), exigencia),
    'carteira',
  );
  assert.equal(
    abrangenciaConcedida(ler(['escavador:processo:read:carteira', 'escavador:processo:read:any']), exigencia),
    'any',
  );
  assert.equal(abrangenciaConcedida(ler(['escavador:movimentacao:read:any']), exigencia), null);
});
