/**
 * O receptor de callbacks — as decisões que não dependem do banco
 * ---------------------------------------------------------------------------
 * Chave de idempotência, tradução de envolvido e leitura da publicação.
 *
 * Cada caso aqui foi tirado de uma medição, não de imaginação. Onde há número —
 * 48 advogados sem `advogado_de`, sete processos com o mesmo teor — ele veio das
 * 30 entregas reais de 27/08 a 02/09 (`docs/15-contrato-da-aparicao.md`).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  chaveDoEvento,
  semEnvelope,
  resumoDoTeor,
  lerPublicacaoDoDiario,
  normalizarEnvolvidoDoDiario,
  traduzirTipo,
} from '@lex/receptor-callbacks';

/** Um evento de diário com a forma real, sem dado de pessoa de verdade. */
function eventoDeDiario(ajustes = {}) {
  const { movimentacao = {}, diario = {}, ...resto } = ajustes;
  return {
    event: 'diario_movimentacao_nova',
    uuid: 'entrega-0001',
    monitoramento: { id: 2813617, tipo: 'TERMO', api: 'SIM', desativado: 'NAO' },
    movimentacao: {
      id: 1718477492,
      conteudo: 'Intimação da parte para manifestar-se no prazo legal.',
      tipo: 'Intimação',
      pagina: 1154,
      link_pdf: 'https://exemplo.invalido/diario.pdf',
      processo: { id: 274289153, numero_novo: '0000000-00.0000.0.00.0000', is_cnj: 1 },
      envolvidos: [
        { nome: 'Fulano de Tal', envolvido_tipo: 'Polo Ativo', oab: null, advogado_de: null },
        { nome: 'Beltrana de Qual', envolvido_tipo: 'Polo Passivo', oab: null, advogado_de: null },
        { nome: 'Advogada Sicrana', envolvido_tipo: 'Advogado', oab: 'AP-0000', advogado_de: null },
      ],
      diario: {
        id: 99,
        data_publicacao: '2026-08-28',
        data_disponibilizacao: '2026-08-28',
        origem: { sigla: 'DJAP', estado: 'AP', nome: 'Diário de Justiça do Estado do Amapá' },
        ...diario,
      },
      ...movimentacao,
    },
    ...resto,
  };
}

// ---------------------------------------------------------------------------
// A chave de idempotência — D-116
// ---------------------------------------------------------------------------

test('o `uuid` NÃO entra na chave — ele identifica a entrega, não o fato', () => {
  // Medido em 26/08: a mesma solicitação chegou três vezes com três `uuid`
  // diferentes, e duas delas tinham corpo idêntico byte a byte. Deduplicar por
  // `uuid` teria deixado as três passarem.
  const a = eventoDeDiario({ uuid: 'entrega-0001' });
  const b = eventoDeDiario({ uuid: 'entrega-0002' });
  assert.notEqual(a.uuid, b.uuid);
  assert.equal(chaveDoEvento(a), chaveDoEvento(b), 'reentrega do mesmo fato tem de dar a mesma chave');
});

test('mudou o conteúdo, mudou a chave', () => {
  const a = eventoDeDiario();
  const b = eventoDeDiario({ movimentacao: { conteudo: 'Outro teor completamente diferente.' } });
  assert.notEqual(chaveDoEvento(a), chaveDoEvento(b));
});

test('a ordem das chaves do objeto não muda a chave', () => {
  // `JSON.stringify` preserva ordem de inserção, e ela pode variar entre duas
  // entregas do mesmo fato. Chave sensível à ordem produziria chaves diferentes
  // para fatos iguais — que é o defeito que este arquivo existe para não ter.
  const a = { event: 'x', monitoramento: { id: 1, tipo: 'TERMO' }, uuid: 'u1' };
  const b = { uuid: 'u2', monitoramento: { tipo: 'TERMO', id: 1 }, event: 'x' };
  assert.equal(chaveDoEvento(a), chaveDoEvento(b));
});

test('`semEnvelope` tira o uuid e não tira mais nada', () => {
  const limpo = semEnvelope(eventoDeDiario());
  assert.equal('uuid' in limpo, false);
  assert.equal('event' in limpo, true);
  assert.equal('movimentacao' in limpo, true);
  assert.equal('monitoramento' in limpo, true);
});

test('o resumo do teor é estável e distingue textos', () => {
  assert.equal(resumoDoTeor('abc'), resumoDoTeor('abc'));
  assert.notEqual(resumoDoTeor('abc'), resumoDoTeor('abd'));
});

// ---------------------------------------------------------------------------
// Tradução de envolvido — D-180
// ---------------------------------------------------------------------------

test('cada fonte tem o seu vocabulário, e o eixo é a FONTE', () => {
  // Três fontes, três jeitos de dizer a mesma coisa. A D-132 concluiu que não
  // havia tabela a construir — o que vale DENTRO da V2, entre ramos da Justiça.
  assert.equal(traduzirTipo('escavador_diario', 'Polo Ativo'), 'ativo');
  assert.equal(traduzirTipo('escavador_diario', 'Polo Passivo'), 'passivo');
  assert.equal(traduzirTipo('escavador_v2', 'Autor'), 'ativo');
  assert.equal(traduzirTipo('escavador_v2', 'Réu'), 'passivo');
  assert.equal(traduzirTipo('autos_pdf', 'RECLAMANTE'), 'ativo');
  assert.equal(traduzirTipo('autos_pdf', 'RECLAMADO'), 'passivo');
});

test('maiúscula, acento e espaço sobrando não mudam a tradução', () => {
  // A mesma fonte já escreveu `AUTOR` e `Autor` no mesmo dia, medido no Bloco E.
  for (const t of ['REU', 'Réu', ' réu ', 'RÉU']) {
    assert.equal(traduzirTipo('escavador_v2', t), 'passivo', t);
  }
  assert.equal(traduzirTipo('escavador_diario', 'POLO   ATIVO'), 'ativo');
});

test('o que não se sabe traduzir vira null, nunca um chute', () => {
  // `null` significa "não sei", que é revisável. Um palpite significaria
  // "ativo" com a mesma cara de um acerto — e confundir polo ativo com passivo
  // troca quem tem de responder ao prazo.
  assert.equal(traduzirTipo('escavador_diario', 'Terceiro Interessado'), null);
  assert.equal(traduzirTipo('escavador_diario', ''), null);
  assert.equal(traduzirTipo('escavador_diario', null), null);
  assert.equal(traduzirTipo('escavador_diario', undefined), null);
});

test('advogado é PAPEL, e não tem polo — o diário não diz de quem ele é', () => {
  const a = normalizarEnvolvidoDoDiario({ nome: 'Advogada Sicrana', envolvido_tipo: 'Advogado', oab: 'AP-0000' });
  assert.equal(a.papel, 'advogado');
  assert.equal(a.tipo_normalizado, null, 'advogado não é polo ativo nem passivo');
  assert.equal(a.numero_oab, 'AP-0000');
  // E o cru fica guardado: é a evidência que permite corrigir a tradução depois
  // sem reprocessar o acervo.
  assert.equal(a.tipo_na_fonte, 'Advogado');
});

test('parte é PAPEL parte, com polo traduzido e cru lado a lado', () => {
  const p = normalizarEnvolvidoDoDiario({ nome: 'Fulano', envolvido_tipo: 'Polo Ativo', oab: null });
  assert.equal(p.papel, 'parte');
  assert.equal(p.tipo_normalizado, 'ativo');
  assert.equal(p.tipo_na_fonte, 'Polo Ativo');
  assert.equal(p.numero_oab, null);
});

test('envolvido sem nome não identifica ninguém, e é descartado', () => {
  assert.equal(normalizarEnvolvidoDoDiario({ nome: '', envolvido_tipo: 'Polo Ativo' }), null);
  assert.equal(normalizarEnvolvidoDoDiario({ envolvido_tipo: 'Polo Ativo' }), null);
  assert.equal(normalizarEnvolvidoDoDiario({ nome: '   ' }), null);
});

// ---------------------------------------------------------------------------
// Leitura da publicação
// ---------------------------------------------------------------------------

test('lê a publicação inteira de um evento de diário', () => {
  const p = lerPublicacaoDoDiario(eventoDeDiario());
  assert.equal(p.origem_diario, 'DJAP');
  assert.equal(p.data_publicacao, '2026-08-28');
  assert.equal(p.data_disponibilizacao, '2026-08-28');
  assert.equal(p.id_externo, '1718477492');
  assert.equal(p.tipo, 'Intimação');
  assert.equal(p.pagina, 1154);
  assert.equal(p.envolvidos.length, 3);
});

test('🔴 `data_disponibilizacao` ausente NÃO cai para `data_publicacao`', () => {
  // Nas 30 amostras as duas vieram iguais — dois tribunais, cinco dias. Isso é
  // coincidência de amostra, não contrato: no processo civil os conceitos se
  // separam por um dia útil, que é a margem que decide se um prazo foi
  // cumprido. Derivar uma da outra erraria justamente aí (D-179, R-56).
  const p = lerPublicacaoDoDiario(eventoDeDiario({ diario: { data_disponibilizacao: null } }));
  assert.equal(p.data_publicacao, '2026-08-28');
  assert.equal(p.data_disponibilizacao, null, 'null significa "a fonte não disse"');
});

test('sem data de publicação ou sem teor, a publicação é RECUSADA', () => {
  // Publicação sem data não conta prazo, e sem teor não diz nada. Gravar uma
  // linha assim criaria registro que parece cobertura e não é.
  assert.equal(lerPublicacaoDoDiario(eventoDeDiario({ diario: { data_publicacao: null } })), null);
  assert.equal(lerPublicacaoDoDiario(eventoDeDiario({ movimentacao: { conteudo: '' } })), null);
});

test('evento que não é de diário não vira publicação', () => {
  assert.equal(lerPublicacaoDoDiario({ event: 'atualizacao_processo_concluida', atualizacao: {} }), null);
  assert.equal(lerPublicacaoDoDiario({ teste: true }), null);
  assert.equal(lerPublicacaoDoDiario({ event: 'diario_movimentacao_nova' }), null);
});

test('o id externo é `movimentacao.id`, e nunca o uuid da entrega', () => {
  const p = lerPublicacaoDoDiario(eventoDeDiario({ uuid: 'nada-a-ver' }));
  assert.equal(p.id_externo, '1718477492');
  assert.notEqual(p.id_externo, 'nada-a-ver');
});

test('🔴 teor idêntico em processos diferentes produz publicações diferentes', () => {
  // O caso que derrubou `publicacao_hash_unico` (migração 013): sete processos
  // DIFERENTES trouxeram a mesma intimação padrão de 123 caracteres, e a
  // restrição antiga guardou uma e descartou seis — em silêncio.
  const a = lerPublicacaoDoDiario(eventoDeDiario({ movimentacao: { id: 1, processo: { id: 10, numero_novo: '1' } } }));
  const b = lerPublicacaoDoDiario(eventoDeDiario({ movimentacao: { id: 2, processo: { id: 20, numero_novo: '2' } } }));

  assert.equal(resumoDoTeor(a.teor), resumoDoTeor(b.teor), 'o teor é o mesmo, e isso é normal');
  assert.notEqual(a.id_externo, b.id_externo, 'e mesmo assim são publicações distintas');
});
