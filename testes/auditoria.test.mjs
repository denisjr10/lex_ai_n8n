/**
 * As barreiras da auditoria que não dependem do banco
 * ---------------------------------------------------------------------------
 * Identificador e resumo. As duas coisas que decidem se uma linha PODE ser
 * escrita, antes de qualquer conexão existir.
 *
 * A prova de que o banco de fato grava, recusa alteração e reconstrói a
 * operação está em `npm run banco:auditoria` — ela precisa de PostgreSQL de pé,
 * e não faz sentido fingir que passou quando o banco está fora do ar.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ehUuid,
  exigirUuid,
  uuidOpcional,
  IdentificadorInvalido,
  serializarResumo,
  ResumoRecusado,
} from '@lex/auditoria';

const UUID = '11111111-1111-1111-1111-111111111111';

// ---------------------------------------------------------------------------
// Identificador — a costura entre `string` no domínio e `uuid` no banco
// ---------------------------------------------------------------------------

test('o identificador do chassi de teste NÃO serve para o banco, e é isso que a barreira existe para dizer', () => {
  // `usr_014`, `ses_teste` e `req_teste` são os identificadores que os testes
  // do chassi usam. Eles passam pelo domínio inteiro, que os declara `string`,
  // e morrem aqui — que é o lugar certo de morrer: com o nome do campo junto.
  for (const [campo, valor] of [
    ['usuario_id', 'usr_014'],
    ['sessao_id', 'ses_teste'],
    ['requisicao_id', 'req_teste'],
    ['inquilino_id', 'esc_001'],
  ]) {
    assert.throws(
      () => exigirUuid(campo, valor),
      (e) => e instanceof IdentificadorInvalido && e.campo === campo,
      `${campo} deveria ser recusado`,
    );
  }
});

test('a mensagem nomeia o campo e mostra o valor — sem isso ninguém acha a origem', () => {
  try {
    exigirUuid('usuario_id', 'usr_014');
    assert.fail('deveria ter lançado');
  } catch (e) {
    assert.match(e.message, /usuario_id/);
    assert.match(e.message, /usr_014/);
    // E explica a consequência, porque a consequência não é óbvia: um
    // identificador torto não degrada o registro, ele para a plataforma.
    assert.match(e.message, /D-77/);
  }
});

test('uuid de qualquer versão passa — recusar aqui o que a coluna aceita seria inventar regra', () => {
  const v1 = 'a0eebc99-9c0b-11d1-8dd2-08002b30309d';
  const v4 = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
  const v7 = '018f6e2a-7c3b-7000-8000-1a2b3c4d5e6f';
  const nil = '00000000-0000-0000-0000-000000000000';
  for (const u of [v1, v4, v7, nil]) assert.equal(ehUuid(u), true, u);
  assert.equal(ehUuid('3F2504E0-4F89-41D3-9A0C-0305E82C3301'), true, 'maiúsculas valem');
});

test('quase-uuid não passa: sobra, falta, caractere fora do hexadecimal', () => {
  for (const quase of [
    '3f2504e0-4f89-41d3-9a0c-0305e82c330',       // um dígito a menos
    '3f2504e0-4f89-41d3-9a0c-0305e82c33011',     // um a mais
    '3f2504e0-4f89-41d3-9a0c-0305e82c330g',      // "g" não é hexadecimal
    '3f2504e04f8941d39a0c0305e82c3301',          // sem hífen
    ' 3f2504e0-4f89-41d3-9a0c-0305e82c3301',     // espaço à frente
    '3f2504e0-4f89-41d3-9a0c-0305e82c3301\n',    // quebra de linha no fim
  ]) {
    assert.equal(ehUuid(quase), false, quase);
  }
});

test('opcional aceita ausência e continua recusando lixo', () => {
  assert.equal(uuidOpcional('aprovacao_id', undefined), null);
  assert.equal(uuidOpcional('aprovacao_id', null), null);
  assert.equal(uuidOpcional('aprovacao_id', ''), null);
  assert.equal(uuidOpcional('aprovacao_id', UUID), UUID);
  assert.throws(() => uuidOpcional('aprovacao_id', 'apr_1'), IdentificadorInvalido);
});

test('nada que não seja texto passa por identificador', () => {
  for (const v of [0, 1, true, false, [], {}, () => {}]) {
    assert.throws(() => exigirUuid('inquilino_id', v), IdentificadorInvalido);
  }
});

// ---------------------------------------------------------------------------
// Resumo — o que a tabela que não esquece pode receber
// ---------------------------------------------------------------------------

test('o resumo normal do chassi passa', () => {
  const texto = serializarResumo({ etapa: 'escopo', codigo_do_erro: 'nao_autorizado' });
  assert.equal(JSON.parse(texto).etapa, 'escopo');
});

test('número de processo é RECUSADO, com ou sem pontuação', () => {
  // O CNJ de teste do chassi, nas duas formas. A pontuada é a que aparece em
  // parâmetro de ferramenta; a de 20 dígitos é a que sai da normalização.
  for (const cnj of ['6090045-13.2025.8.03.0001', '60900451320258030001']) {
    assert.throws(
      () => serializarResumo({ etapa: 'abrangencia', numero_cnj: cnj }),
      (e) => e instanceof ResumoRecusado && /processo/.test(e.message),
      cnj,
    );
  }
});

test('o CNJ é pego mesmo aninhado fundo — é onde ele costuma estar', () => {
  assert.throws(
    () =>
      serializarResumo({
        etapa: 'entrada',
        contexto: { tentativas: [{ pedido: { numero_cnj: '0000132-06.2025.5.08.0205' } }] },
      }),
    ResumoRecusado,
  );
});

test('dígito verificador errado não salva o CNJ: o que se impede é a presença do dado', () => {
  // `cnjValido` recusaria este número; aqui isso é irrelevante. CNJ malformado
  // continua sendo número de processo de alguém.
  assert.throws(() => serializarResumo({ numero_cnj: '6090045-99.2025.8.03.0001' }), ResumoRecusado);
});

test('CPF, CNPJ e OAB também são recusados', () => {
  assert.throws(() => serializarResumo({ x: '123.456.789-09' }), /CPF ou CNPJ/);
  assert.throws(() => serializarResumo({ x: '12.345.678/0001-95' }), /CPF ou CNPJ/);
  assert.throws(() => serializarResumo({ x: 'OAB/AP 1234' }), /OAB/);
});

test('a mensagem de recusa NÃO repete o dado que encontrou', () => {
  try {
    serializarResumo({ numero_cnj: '6090045-13.2025.8.03.0001' });
    assert.fail('deveria ter lançado');
  } catch (e) {
    // Repetir o achado escreveria o dado no log do servidor, que é outro lugar
    // onde ele não deve estar. Diz-se o tipo; quem investiga vai à origem.
    assert.ok(!e.message.includes('6090045'), 'a mensagem vazou o número');
    assert.match(e.message, /número de processo/);
  }
});

test('resumo comprido demais é recusado — resumo comprido deixou de ser resumo', () => {
  assert.throws(() => serializarResumo({ corpo: 'a'.repeat(2100) }), /teto|caracteres/);
});

test('o que não vira JSON é recusado, e não vira registro vazio', () => {
  const circular = { etapa: 'escopo' };
  circular.eu = circular;
  assert.throws(() => serializarResumo(circular), ResumoRecusado);
  assert.throws(() => serializarResumo({ n: 1n }), ResumoRecusado);
});

test('resumo vazio é válido — nem toda etapa tem o que dizer', () => {
  assert.equal(serializarResumo({}), '{}');
});
