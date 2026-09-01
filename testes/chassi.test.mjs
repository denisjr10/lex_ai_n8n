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

test('sessão emitida no futuro não vale ainda — a janela tem dois lados', () => {
  // Só o lado de cima era conferido. Bastava `emitida_em` adiantado e
  // `expira_em` mais adiantado ainda para ter uma sessão válida hoje, amanhã e
  // no mês que vem. Em produção quem emite é o banco com now(), então o caso
  // não nasce sozinho: nasce de relógio errado, de fuso aplicado duas vezes,
  // ou de sessão forjada por quem consiga montar o objeto.
  const futura = {
    emitida_em: '2026-08-27T13:00:00.000Z',  // uma hora depois de AGORA
    expira_em: '2026-09-27T13:00:00.000Z',
  };
  assert.equal(sessaoVigente(futura, AGORA), false);
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
function aprovacaoPara(ferramenta, parametros, sessao, ajustes = {}) {
  return {
    ...APROVACAO_BASE,
    inquilino_id: sessao.inquilino_id,
    sessao_id: sessao.sessao_id,
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
    aprovacao: aprovacaoPara('enviar_ao_cliente', parametros, base.sessao, { papel_do_aprovador: 'estagiario' }),
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
    aprovacao: aprovacaoPara('enviar_ao_cliente', parametros, base.sessao),
  });

  assert.equal(ehErro(r), false);
  assert.equal(base.fornecedor.estado.chamadas, 1);
});

// ---------------------------------------------------------------------------
// A aprovação vale UMA vez, neste escritório, nesta conversa
// ---------------------------------------------------------------------------

test('a mesma aprovação não serve duas vezes', async () => {
  // O caso real não é o atacante: é a retentativa. A camada de cima repete a
  // chamada por timeout de rede, apresenta a mesma aprovação, e sai uma segunda
  // mensagem ao cliente com a assinatura de um advogado que autorizou uma.
  const base = montar({ escopos: ['escritorio:mensagem:write:carteira'] });
  const parametros = { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Bom dia! Seu processo teve andamento.' };
  const aprovacao = aprovacaoPara('enviar_ao_cliente', parametros, base.sessao);

  const primeira = await executarChamada(base.cfg, {
    ...chamada('enviar_ao_cliente', parametros, base.sessao), aprovacao,
  });
  assert.equal(ehErro(primeira), false, 'a primeira deveria passar');
  assert.equal(base.fornecedor.estado.chamadas, 1);

  const segunda = await executarChamada(base.cfg, {
    ...chamada('enviar_ao_cliente', parametros, base.sessao), aprovacao,
  });
  assert.equal(ehErro(segunda), true, 'a aprovação foi aceita duas vezes');
  assert.equal(base.fornecedor.estado.chamadas, 1,
    'a segunda chamada executou — a mensagem saiu duas vezes com uma assinatura só');
});

test('aprovação de outro escritório não vale nesta sessão', async () => {
  const base = montar({ escopos: ['escritorio:mensagem:write:carteira'] });
  const parametros = { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Bom dia!' };

  const r = await executarChamada(base.cfg, {
    ...chamada('enviar_ao_cliente', parametros, base.sessao),
    aprovacao: aprovacaoPara('enviar_ao_cliente', parametros, base.sessao, {
      inquilino_id: 'inq_de_outro_escritorio',
    }),
  });

  assert.equal(ehErro(r), true);
  assert.equal(base.fornecedor.estado.chamadas, 0);
});

test('aprovação de outra sessão não atravessa a conversa', async () => {
  // O advogado aprova dentro de um contexto — aquela pergunta, daquele cliente,
  // naquele atendimento. A autorização não deveria sobreviver a ele.
  const base = montar({ escopos: ['escritorio:mensagem:write:carteira'] });
  const parametros = { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Bom dia!' };

  const r = await executarChamada(base.cfg, {
    ...chamada('enviar_ao_cliente', parametros, base.sessao),
    aprovacao: aprovacaoPara('enviar_ao_cliente', parametros, base.sessao, {
      sessao_id: 'ses_de_ontem',
    }),
  });

  assert.equal(ehErro(r), true);
  assert.equal(base.fornecedor.estado.chamadas, 0);
});

test('sem registro de aprovações, faixa que exige aprovação não sai', async () => {
  // Enquanto o marco 9 não existir, `aprovacoes` é opcional na configuração —
  // e opcional NÃO pode significar liberado. Quem montar o chassi sem ele fica
  // com as faixas A3b e A4 travadas, que é o estado seguro.
  const base = montar({ escopos: ['escritorio:mensagem:write:carteira'] });
  const cfg = { ...base.cfg, aprovacoes: undefined };
  const parametros = { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Bom dia!' };

  const r = await executarChamada(cfg, {
    ...chamada('enviar_ao_cliente', parametros, base.sessao),
    aprovacao: aprovacaoPara('enviar_ao_cliente', parametros, base.sessao),
  });

  assert.equal(ehErro(r), true);
  assert.equal(base.fornecedor.estado.chamadas, 0);
});

test('registro de aprovações indisponível bloqueia — não saber fecha', async () => {
  const base = montar({ escopos: ['escritorio:mensagem:write:carteira'] });
  const cfg = {
    ...base.cfg,
    aprovacoes: { consumir: async () => { throw new Error('banco fora do ar'); } },
  };
  const parametros = { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Bom dia!' };

  const r = await executarChamada(cfg, {
    ...chamada('enviar_ao_cliente', parametros, base.sessao),
    aprovacao: aprovacaoPara('enviar_ao_cliente', parametros, base.sessao),
  });

  assert.equal(ehErro(r), true);
  assert.equal(base.fornecedor.estado.chamadas, 0,
    'sem saber se a aprovação estava inteira, a mensagem saiu assim mesmo');
});

test('faixa que NÃO exige aprovação não gasta aprovação nenhuma', async () => {
  // A1 não passa pelo registro. Se passasse, uma consulta teria o poder de
  // queimar uma autorização que ninguém pediu para usar.
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const r = await executarChamada(base.cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, base.sessao));
  assert.equal(ehErro(r), false);
  assert.equal(base.aprovacoes.gastas.size, 0);
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
// Validação de entrada — o que Number() aceita e não devia
// ---------------------------------------------------------------------------

test('texto vazio, false e lista vazia NÃO viram o inteiro zero', async () => {
  // `Number('')`, `Number(false)` e `Number([])` valem 0, e os três passavam
  // por Number.isInteger. Chegavam à ferramenta como um zero que ninguém
  // escreveu — um limite, uma página, uma quantidade, silenciosamente zero.
  // `null` fica FORA desta lista de propósito: o validador trata null e
  // undefined como "campo ausente", e para um campo opcional ausente é uma
  // resposta legítima. Em campo obrigatório, null é recusado — o caso logo
  // abaixo prova isso.
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  for (const valor of ['', false, [], {}]) {
    const r = await executarChamada(
      base.cfg,
      chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA, limite: valor }, base.sessao),
    );
    assert.equal(ehErro(r), true, `${JSON.stringify(valor)} foi aceito como inteiro`);
    assert.equal(r.erro.codigo, 'parametro_invalido');
  }
});

test('null em campo OBRIGATÓRIO é recusado', async () => {
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const r = await executarChamada(base.cfg, chamada('consultar_processo', { numero_cnj: null }, base.sessao));
  assert.equal(ehErro(r), true);
  assert.equal(base.fornecedor.estado.chamadas, 0);
});

test('texto numérico continua valendo — rigor sem propósito recusa "12"', async () => {
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const r = await executarChamada(
    base.cfg,
    chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA, limite: '12' }, base.sessao),
  );
  assert.equal(ehErro(r), false);
});

test('parametros null vira recusa com envelope, não exceção crua', async () => {
  // O tipo diz Record, mas o valor vem da rede, e `null` é JSON válido.
  // Object.keys(null) lança — e lançar sai por uma porta que não passa pela
  // tradução de erro, devolvendo exceção onde deveria haver envelope.
  const base = montar({ escopos: ['escavador:processo:read:any'] });
  const r = await executarChamada(base.cfg, chamada('consultar_processo', null, base.sessao));
  assert.equal(ehErro(r), true);
  assert.equal(r.erro.codigo, 'parametro_invalido');
  assert.equal(base.fornecedor.estado.chamadas, 0);
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

// ---------------------------------------------------------------------------
// A assinatura entra na trilha — Regra 2, e achado 4 da revisão de 28/08
// ---------------------------------------------------------------------------

test('a auditoria guarda QUAL aprovação autorizou o ato', async () => {
  const { cfg, sessao: s, auditoria } = montar({ escopos: ['escritorio:peticao:write:any'] });

  const aprovacao = {
    aprovacao_id: 'apr_0001',
    faixa: 'A4',
    aprovador_id: 'usr_advogada',
    papel_do_aprovador: 'advogado',
    status: 'aprovada',
    expira_em: '2026-08-27T12:05:00.000Z',
    inquilino_id: s.inquilino_id,
    sessao_id: s.sessao_id,
    resumo_do_conteudo: `peticionar:${JSON.stringify({ numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Excelentíssimo.' })}`,
  };

  const r = await executarChamada(
    cfg,
    chamada('peticionar', { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Excelentíssimo.' }, s, { aprovacao }),
  );

  assert.equal(ehErro(r), false, 'a chamada aprovada deveria passar');

  // A pergunta que se faz depois de um ato A4 dar errado não é "houve
  // aprovação?" — é "de quem foi a assinatura?". Sem este campo, a trilha
  // responde a primeira e não a segunda, e a Regra 2 exige advogado
  // IDENTIFICADO. Identificar na hora de decidir e esquecer na hora de
  // registrar cumpre a metade da regra que não serve para nada.
  const evento = auditoria.eventos.at(-1);
  assert.equal(evento.resultado, 'permitido');
  assert.equal(evento.aprovacao_id, 'apr_0001');
});

test('a recusa de um ato aprovado também guarda a aprovação apresentada', async () => {
  // Aprovação de estagiário para faixa A4: recusada. O registro precisa dizer
  // QUAL aprovação foi apresentada — é o que permite investigar depois quem
  // tentou assinar o que não podia.
  const { cfg, sessao: s, auditoria, fornecedor } = montar({ escopos: ['escritorio:peticao:write:any'] });

  const r = await executarChamada(
    cfg,
    chamada('peticionar', { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Excelentíssimo.' }, s, {
      aprovacao: {
        aprovacao_id: 'apr_0002',
        faixa: 'A4',
        aprovador_id: 'usr_estagiario',
        papel_do_aprovador: 'estagiario',
        status: 'aprovada',
        expira_em: '2026-08-27T12:05:00.000Z',
        resumo_do_conteudo: `peticionar:${JSON.stringify({ numero_cnj: CNJ_DA_CARTEIRA, corpo: 'Excelentíssimo.' })}`,
      },
    }),
  );

  assert.equal(ehErro(r), true);
  assert.equal(fornecedor.estado.chamadas, 0, 'recusa não gasta');

  const evento = auditoria.eventos.at(-1);
  assert.equal(evento.resultado, 'negado');
  assert.equal(evento.etapa, 'aprovacao');
  assert.equal(evento.aprovacao_id, 'apr_0002');
});

test('sem aprovação apresentada, o campo simplesmente não existe no evento', async () => {
  const { cfg, sessao: s, auditoria } = montar({ escopos: ['escavador:processo:read:any'] });
  await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, s));

  // `undefined` e não `null`: `exactOptionalPropertyTypes` está ligado, e o
  // banco distingue "não houve aprovação" de "houve e não sei qual".
  assert.equal('aprovacao_id' in auditoria.eventos.at(-1), false);
});
