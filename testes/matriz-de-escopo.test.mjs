/**
 * A matriz de escopo — o critério de aceite do marco 2
 * ---------------------------------------------------------------------------
 * Spec §14.1: *"Toda combinação papel × ferramenta × abrangência, esperando
 * permitido ou negado. **É a prova de que a Regra 1 vale. Sem ela, o privilégio
 * é intenção, não fato.**"*
 *
 * Cada linha da tabela abaixo é uma afirmação sobre quem pode o quê. O teste
 * roda a chamada inteira pelo chassi e confere duas coisas:
 *
 *   1. o veredito — permitido ou negado
 *   2. **se a execução foi alcançada** — porque recusa que gasta é recusa que
 *      falhou pela metade (RF-07)
 *
 * D-78: a matriz é critério de aceite da fundação, e a CI nunca chama a API real.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { executarChamada, ehErro } from '@lex/mcp-core';
import { MENSAGEM_INDISTINGUIVEL } from '@lex/dominio';
import { montar, chamada, CNJ_DA_CARTEIRA, CNJ_DE_FORA, AGORA } from './ajuda.mjs';

const APROVACAO_A3B = {
  aprovacao_id: 'apr_1',
  faixa: 'A3b',
  aprovador_id: 'usr_014',
  papel_do_aprovador: 'advogado',
  status: 'aprovada',
  expira_em: '2026-08-27T16:00:00.000Z',
  resumo_do_conteudo: '',
};

/**
 * A matriz.
 *
 * `escopos` é o que o Policy Gate concedeu; `perfil` é o que a sessão enxerga;
 * `esperado` é permitido ou o código de erro que deve sair.
 */
const MATRIZ = [
  // --- leitura de processo, as três abrangências --------------------------
  {
    caso: 'advogado com :any consulta processo de fora da carteira',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escavador:processo:read:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DE_FORA },
    esperado: 'permitido',
  },
  {
    caso: 'colaborador com :carteira consulta processo DA carteira',
    perfil: 'colaborador',
    papel: 'estagiario',
    escopos: ['escavador:processo:read:carteira'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA },
    esperado: 'permitido',
  },
  {
    caso: 'colaborador com :carteira consulta processo de FORA da carteira',
    perfil: 'colaborador',
    papel: 'estagiario',
    escopos: ['escavador:processo:read:carteira'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DE_FORA },
    esperado: 'nao_autorizado',
  },
  {
    caso: 'cliente com :own consulta o proprio processo',
    perfil: 'cliente',
    papel: 'cliente',
    escopos: ['escavador:processo:read:own'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA },
    esperado: 'permitido',
  },
  {
    caso: 'cliente com :own consulta processo alheio',
    perfil: 'cliente',
    papel: 'cliente',
    escopos: ['escavador:processo:read:own'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DE_FORA },
    esperado: 'nao_autorizado',
  },

  // --- escopo ausente e escopo do recurso errado ---------------------------
  {
    caso: 'sem escopo nenhum',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: [],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA },
    esperado: 'nao_autorizado',
  },
  {
    caso: 'escopo de OUTRO recurso nao serve',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escavador:movimentacao:read:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA },
    esperado: 'nao_autorizado',
  },
  {
    caso: 'escopo de OUTRO sistema nao serve',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['trello:processo:read:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA },
    esperado: 'nao_autorizado',
  },
  {
    caso: 'write NAO implica read',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escavador:processo:write:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA },
    esperado: 'nao_autorizado',
  },
  {
    caso: 'curinga nao existe — "escavador:*" e so um escopo ilegivel',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escavador:*', 'escavador:processo:*:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA },
    esperado: 'nao_autorizado',
  },
  {
    caso: 'escopo sem abrangencia escrita vale como :own — carteira alheia recusa',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escavador:processo:read'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DE_FORA },
    esperado: 'nao_autorizado',
  },
  {
    caso: 'duas concessoes: vale a mais ampla',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escavador:processo:read:own', 'escavador:processo:read:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DE_FORA },
    esperado: 'permitido',
  },

  // --- perfil de exposicao -------------------------------------------------
  {
    caso: 'cliente nao enxerga ferramenta fora do perfil, mesmo com escopo',
    perfil: 'cliente',
    papel: 'cliente',
    escopos: ['escavador:monitoramento:write:any'],
    ferramenta: 'criar_monitoramento',
    parametros: { termo: 'MARIA DE TESTE' },
    esperado: 'nao_encontrado',
  },
  {
    caso: 'colaborador nao enxerga peticionar, mesmo com escopo',
    perfil: 'colaborador',
    papel: 'advogado',
    escopos: ['escritorio:peticao:write:any'],
    ferramenta: 'peticionar',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'texto da peticao' },
    esperado: 'nao_encontrado',
  },
  {
    caso: 'perfil inexistente nao concede nada',
    perfil: 'perfil_que_nao_existe',
    papel: 'advogado',
    escopos: ['escavador:processo:read:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA },
    esperado: 'nao_encontrado',
  },

  // --- ferramenta sem sujeito ----------------------------------------------
  {
    caso: 'ferramenta sem sujeito passa sob :any',
    perfil: 'colaborador',
    papel: 'estagiario',
    escopos: ['escavador:origem:read:any'],
    ferramenta: 'listar_diarios',
    parametros: {},
    esperado: 'permitido',
  },
  {
    caso: 'ferramenta SEM sujeito e RECUSADA sob :carteira — nao ha o que conferir',
    perfil: 'colaborador',
    papel: 'estagiario',
    escopos: ['escavador:origem:read:carteira'],
    ferramenta: 'listar_diarios',
    parametros: {},
    esperado: 'nao_autorizado',
  },

  // --- faixas de aprovacao -------------------------------------------------
  {
    caso: 'A2 (escrita interna) sai sem aprovacao',
    perfil: 'colaborador',
    papel: 'estagiario',
    escopos: ['escavador:monitoramento:write:any'],
    ferramenta: 'criar_monitoramento',
    parametros: { termo: 'MARIA DE TESTE' },
    esperado: 'permitido',
  },
  {
    caso: 'A3 (efeito externo) SEM aprovacao nao sai',
    perfil: 'colaborador',
    papel: 'estagiario',
    escopos: ['escritorio:mensagem:write:carteira'],
    ferramenta: 'enviar_ao_cliente',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'ola' },
    esperado: 'precisa_aprovacao',
  },
  {
    caso: 'A4 (efeito juridico) SEM aprovacao nao sai',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escritorio:peticao:write:any'],
    ferramenta: 'peticionar',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'peticao' },
    esperado: 'precisa_aprovacao',
  },
  {
    caso: 'A4 com aprovacao de ESTAGIARIO nao sai',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escritorio:peticao:write:any'],
    ferramenta: 'peticionar',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA, corpo: 'peticao' },
    aprovacaoDe: 'estagiario',
    esperado: 'precisa_aprovacao',
  },

  // --- validacao de entrada ------------------------------------------------
  {
    caso: 'CNJ com digito verificador errado nao chega ao fornecedor',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escavador:processo:read:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: '6090045-99.2025.8.03.0001' },
    esperado: 'parametro_invalido',
  },
  {
    caso: 'parametro que ninguem declarou e recusado, nao ignorado',
    perfil: 'advogado',
    papel: 'advogado',
    escopos: ['escavador:processo:read:any'],
    ferramenta: 'consultar_processo',
    parametros: { numero_cnj: CNJ_DA_CARTEIRA, token: 'seja-o-que-for' },
    esperado: 'parametro_invalido',
  },
];

// ---------------------------------------------------------------------------

for (const linha of MATRIZ) {
  test(`matriz de escopo · ${linha.caso}`, async () => {
    const { cfg, sessao: s, fornecedor } = montar({
      papel: linha.papel,
      perfil: linha.perfil,
      escopos: linha.escopos,
    });

    const extra = {};
    if (linha.esperado === 'permitido' || linha.aprovacaoDe) {
      // Para as faixas que exigem aprovacao, o resumo tem de bater com o
      // conteudo — aprova-se o conteudo final, nunca a intencao.
      const resumo = `${linha.ferramenta}:${JSON.stringify(linha.parametros)}`;
      extra.aprovacao = {
        ...APROVACAO_A3B,
        faixa: linha.ferramenta === 'peticionar' ? 'A4' : 'A3b',
        papel_do_aprovador: linha.aprovacaoDe ?? 'advogado',
        resumo_do_conteudo: resumo,
      };
    }

    const trilha = { etapas: [], executou: false };
    const r = await executarChamada(cfg, chamada(linha.ferramenta, linha.parametros, s, extra), trilha);

    if (linha.esperado === 'permitido') {
      assert.equal(ehErro(r), false, `esperava permitido, veio ${JSON.stringify(r)}`);
      assert.equal(trilha.executou, true, 'permitido tem de alcançar a execução');
      assert.equal(fornecedor.estado.chamadas, 1);
    } else {
      assert.equal(ehErro(r), true, 'esperava recusa');
      assert.equal(r.erro.codigo, linha.esperado);

      // ⚠️ A METADE QUE MAIS IMPORTA: recusa NÃO gasta.
      assert.equal(trilha.executou, false, 'recusa não pode alcançar a execução');
      assert.equal(
        fornecedor.estado.chamadas,
        0,
        'recusa não pode chamar o fornecedor — RF-07 tem duas metades',
      );
    }
  });
}

// ---------------------------------------------------------------------------
// A propriedade que impede o sistema de virar oráculo de existência
// ---------------------------------------------------------------------------

test('recusa por privilégio é indistinguível de ausência de resultado', async () => {
  const semEscopo = montar({ escopos: [], perfil: 'advogado', papel: 'advogado' });
  const foraDoPerfil = montar({
    escopos: ['escavador:monitoramento:write:any'],
    perfil: 'cliente',
    papel: 'cliente',
  });

  const a = await executarChamada(
    semEscopo.cfg,
    chamada('consultar_processo', { numero_cnj: CNJ_DA_CARTEIRA }, semEscopo.sessao),
  );
  const b = await executarChamada(
    foraDoPerfil.cfg,
    chamada('criar_monitoramento', { termo: 'MARIA' }, foraDoPerfil.sessao),
  );

  assert.equal(a.erro.codigo, 'nao_autorizado');
  assert.equal(b.erro.codigo, 'nao_encontrado');

  // Códigos diferentes, para a auditoria. Mensagem IDÊNTICA, para quem está
  // do lado de fora. Se alguém "melhorar" um dos textos, este teste quebra —
  // e é para quebrar.
  assert.equal(a.erro.mensagem_agente, b.erro.mensagem_agente);
  assert.equal(a.erro.mensagem_agente, MENSAGEM_INDISTINGUIVEL);
});

test('toda recusa deixa rastro na auditoria, com a etapa que recusou', async () => {
  const { cfg, sessao: s, auditoria } = montar({
    escopos: ['escavador:processo:read:carteira'],
    perfil: 'advogado',
    papel: 'advogado',
  });

  await executarChamada(cfg, chamada('consultar_processo', { numero_cnj: CNJ_DE_FORA }, s));

  assert.equal(auditoria.eventos.length, 1);
  const e = auditoria.eventos[0];
  assert.equal(e.resultado, 'negado');
  assert.equal(e.codigo_do_erro, 'nao_autorizado');
  assert.equal(e.etapa, 'abrangencia');
  assert.equal(e.requisicao_id, 'req_teste');
  assert.equal(e.momento, AGORA.toISOString());
});
