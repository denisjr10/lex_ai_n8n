#!/usr/bin/env node
/**
 * conferir-auditoria.mjs — o marco 3 provado contra o banco de pé
 * ---------------------------------------------------------------------------
 * O critério de aceite do marco 3 não é "a tabela aceita INSERT". É:
 *
 *   > **Recusa e sucesso geram registro reconstruível pelo `requisicao_id`.**
 *
 * Então este arquivo não testa a auditoria isolada: ele roda o CHASSI DE
 * VERDADE, com a auditoria de PostgreSQL no lugar da de memória, e depois
 * pergunta ao banco o que aconteceu. Se a história não voltar inteira, o marco
 * não fechou.
 *
 * E prova as duas coisas que só existem contra um banco real:
 *   · o append-only recusa alteração PARA O PAPEL DA APLICAÇÃO (migração 007)
 *   · auditoria fora do ar BLOQUEIA a chamada e NÃO chama o fornecedor (D-77)
 *
 * ⚠️ ESTE SCRIPT DEIXA RESÍDUO, E NÃO HÁ COMO NÃO DEIXAR.
 *
 * O `conferir-regras.mjs` desfaz tudo com ROLLBACK. Aqui isso é impossível por
 * construção: o que se está provando é uma tabela que não aceita remoção. Um
 * teste de append-only que conseguisse limpar a si mesmo teria acabado de
 * refutar o que veio testar. As linhas ficam, sob um inquilino de teste
 * declarado, e `npm run banco:zerar` recria o banco do zero quando incomodar.
 *
 * Uso:  npm run banco:auditoria
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const ARQ_ENV = path.join(RAIZ, 'infra', '.env');

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', rub: '\x1b[31m', cin: '\x1b[90m' };

// A senha do banco de desenvolvimento vem do infra/.env, que o Git ignora.
if (fs.existsSync(ARQ_ENV)) {
  for (const linha of fs.readFileSync(ARQ_ENV, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { abrirConexao, conferirPapel, lerAmbiente, criarAuditoriaPostgres, reconstruir, negados } =
  await import('@lex/auditoria');
const { definirFerramenta, executarChamada, montarPerfis, cnj } = await import('@lex/mcp-core');

let certos = 0;
let errados = 0;
const ok = (t) => { certos++; console.log(`  ${cor.ver}ok${cor.off}   ${t}`); };
const falha = (t, d) => { errados++; console.log(`  ${cor.rub}FALHA${cor.off} ${t}`); if (d) console.log(`         ${cor.cin}${d}${cor.off}`); };
const secao = (t) => console.log(`\n${cor.neg}${t}${cor.off}`);

// ---------------------------------------------------------------------------
// O cenário. Identificadores de verdade, porque o banco exige uuid.
// ---------------------------------------------------------------------------
const INQUILINO = '99999999-9999-4999-8999-999999999999';
const USUARIO = randomUUID();
const SESSAO = randomUUID();
const REQ_RECUSA = randomUUID();
const REQ_SUCESSO = randomUUID();
const CNJ = '6090045-13.2025.8.03.0001';

let conexao;
let chamadasAoFornecedor = 0;

function montarFerramentas() {
  const consultar = definirFerramenta({
    nome: 'consultar_processo',
    descricao: 'Consulta a capa de um processo pelo numero CNJ.',
    faixa: 'A1',
    escopo: 'escavador:processo:read',
    entrada: { numero_cnj: cnj() },
    sujeito: (p) => ({ processos: [p.numero_cnj] }),
    executar: async () => { chamadasAoFornecedor += 1; return { capa: 'veio do fornecedor' }; },
  });
  return new Map([[consultar.nome, consultar]]);
}

const PERFIS = montarPerfis([{ nome: 'advogado', ferramentas: ['consultar_processo'] }]);

function sessao(escopos) {
  return {
    sessao_id: SESSAO,
    inquilino_id: INQUILINO,
    usuario_id: USUARIO,
    papel: 'advogado',
    canal: 'telegram',
    perfil: 'advogado',
    escopos,
    sujeitos_autorizados: { processos: [CNJ], documentos: [] },
    emitida_em: new Date(Date.now() - 60_000).toISOString(),
    expira_em: new Date(Date.now() + 600_000).toISOString(),
  };
}

try {
  // -------------------------------------------------------------------------
  secao('1. A conexão, e o papel que ela precisa ter');
  // -------------------------------------------------------------------------
  conexao = abrirConexao(lerAmbiente());

  try {
    await conferirPapel(conexao);
    ok('conectada como lex_app — o append-only tem as duas camadas');
  } catch (e) {
    falha('a conexão não está com o papel lex_app', e.message);
    throw e;
  }

  // O inquilino de teste precisa existir para as chaves estrangeiras fecharem.
  await conexao.consultar(
    `INSERT INTO inquilino (id, nome) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
    [INQUILINO, 'Escritorio de Teste — conferir-auditoria'],
  );
  // `numero_oab` NAO e opcional aqui: a migracao 001 tem uma restricao que
  // exige inscricao para os papeis `socio` e `advogado`, e proibe para os
  // demais. E a Regra 2 no esquema — advogado sem OAB nao e advogado, e nao
  // teria como assinar um ato de faixa A4.
  await conexao.consultar(
    `INSERT INTO usuario (id, inquilino_id, nome, email, papel, numero_oab)
     VALUES ($1, $2, $3, $4, 'advogado', $5) ON CONFLICT (id) DO NOTHING`,
    [USUARIO, INQUILINO, 'Advogada de Teste', `teste-${USUARIO}@exemplo.invalido`, 'AP-000000'],
  );
  // A SESSAO PRECISA EXISTIR NO BANCO ANTES DE QUALQUER REGISTRO.
  //
  // `evento_auditoria.sessao_id` tem chave estrangeira para `sessao`. Isso
  // significa que uma sessao que so existe como objeto em memoria — emitida
  // pelo Policy Gate e nunca persistida — torna TODA chamada dela
  // irregistravel, e portanto (D-77) impossivel. O acoplamento e de proposito:
  // trilha que aponta para uma sessao que ninguem consegue descrever nao
  // reconstroi nada. Mas e uma exigencia que o Policy Gate do marco 9 precisa
  // cumprir, e que nao estava escrita em lugar nenhum ate agora.
  await conexao.consultar(
    `INSERT INTO sessao (id, usuario_id, inquilino_id, canal, perfil, escopos,
                         sujeitos_autorizados, emitida_em, expira_em)
     VALUES ($1, $2, $3, 'telegram', 'advogado', $4, $5::jsonb, now() - interval '1 minute',
             now() + interval '10 minutes')
     ON CONFLICT (id) DO NOTHING`,
    [SESSAO, USUARIO, INQUILINO, ['escavador:processo:read:any'],
     JSON.stringify({ processos: [CNJ], documentos: [] })],
  );
  ok('cenário criado — lex_app pode INSERT, que é o que ele precisa poder');

  const auditoria = criarAuditoriaPostgres(conexao);

  // -------------------------------------------------------------------------
  secao('2. Uma RECUSA atravessa o chassi e vira registro');
  // -------------------------------------------------------------------------
  {
    const cfg = { ferramentas: montarFerramentas(), perfis: PERFIS, auditoria };
    const trilha = { etapas: [], executou: false };
    // Sessão SEM escopo nenhum: recusa na etapa `escopo`.
    const r = await executarChamada(cfg, {
      ferramenta: 'consultar_processo',
      parametros: { numero_cnj: CNJ },
      sessao: sessao([]),
      requisicao_id: REQ_RECUSA,
      agora: new Date(),
    }, trilha);

    if (r.erro?.codigo === 'nao_autorizado') ok('a chamada sem escopo foi recusada');
    else falha('a chamada sem escopo NÃO foi recusada', JSON.stringify(r).slice(0, 200));

    if (trilha.executou === false && chamadasAoFornecedor === 0) {
      ok('a recusa não chegou ao fornecedor — recusa não gasta (RF-07)');
    } else {
      falha('a recusa alcançou a execução', `executou=${trilha.executou} chamadas=${chamadasAoFornecedor}`);
    }
  }

  // -------------------------------------------------------------------------
  secao('3. Um SUCESSO atravessa o chassi e vira registro');
  // -------------------------------------------------------------------------
  {
    const cfg = { ferramentas: montarFerramentas(), perfis: PERFIS, auditoria };
    const r = await executarChamada(cfg, {
      ferramenta: 'consultar_processo',
      parametros: { numero_cnj: CNJ },
      sessao: sessao(['escavador:processo:read:any']),
      requisicao_id: REQ_SUCESSO,
      agora: new Date(),
    });
    if (!r.erro) ok('a chamada com escopo foi permitida');
    else falha('a chamada com escopo foi recusada', JSON.stringify(r.erro));
  }

  // -------------------------------------------------------------------------
  secao('4. A operação se reconstrói pelo requisicao_id — o critério de aceite');
  // -------------------------------------------------------------------------
  {
    const t = await reconstruir(conexao, REQ_RECUSA, INQUILINO);
    const e = t.eventos[0];
    if (t.eventos.length === 1) ok('a recusa deixou exatamente um evento');
    else falha(`a recusa deixou ${t.eventos.length} eventos`, 'esperado 1');

    if (e?.resultado === 'negado') ok('o evento diz "negado"');
    else falha('o evento não diz "negado"', String(e?.resultado));

    if (e?.etapa === 'escopo') ok('o evento diz QUAL etapa recusou — "escopo"');
    else falha('o evento não diz a etapa', String(e?.etapa));

    if (e?.codigo_do_erro === 'nao_autorizado') ok('o evento guarda o código interno do erro');
    else falha('o evento não guarda o código', String(e?.codigo_do_erro));

    if (e?.usuario_id === USUARIO && e?.papel === 'advogado' && e?.canal === 'telegram') {
      ok('o evento diz quem, com que papel e por qual canal');
    } else {
      falha('o evento não identifica quem agiu', JSON.stringify(e));
    }
  }

  {
    const t = await reconstruir(conexao, REQ_SUCESSO, INQUILINO);
    if (t.eventos.length === 1 && t.eventos[0]?.resultado === 'permitido') {
      ok('o sucesso deixou um evento "permitido"');
    } else {
      falha('o sucesso não reconstruiu', JSON.stringify(t.eventos).slice(0, 200));
    }
  }

  {
    // A propriedade que dá sentido ao `requisicao_id`: uma operação não
    // enxerga a outra.
    const t = await reconstruir(conexao, REQ_RECUSA, INQUILINO);
    const misturou = t.eventos.some((e) => e.resultado === 'permitido');
    if (!misturou) ok('as duas operações não se misturam');
    else falha('a trilha misturou operações diferentes');
  }

  {
    // O isolamento por inquilino: o mesmo requisicao_id, outro escritório.
    const outro = '88888888-8888-4888-8888-888888888888';
    const t = await reconstruir(conexao, REQ_RECUSA, outro);
    if (t.eventos.length === 0) ok('a trilha de outro inquilino vem vazia — o filtro é real');
    else falha('a consulta atravessou inquilinos', `${t.eventos.length} eventos`);
  }

  // -------------------------------------------------------------------------
  secao('5. O registro NÃO se altera — nem para o papel da aplicação');
  // -------------------------------------------------------------------------
  for (const [oque, sql] of [
    ['UPDATE', `UPDATE evento_auditoria SET resultado = 'permitido' WHERE requisicao_id = $1`],
    ['DELETE', `DELETE FROM evento_auditoria WHERE requisicao_id = $1`],
  ]) {
    try {
      await conexao.consultar(sql, [REQ_RECUSA]);
      falha(`${oque} em evento_auditoria PASSOU`, 'a auditoria não é imutável');
    } catch (e) {
      ok(`${oque} recusado — ${String(e.message).split('\n')[0].slice(0, 90)}`);
    }
  }

  // -------------------------------------------------------------------------
  secao('6. O resumo recusa dado pessoal ANTES do INSERT');
  // -------------------------------------------------------------------------
  {
    // Chega direto na auditoria, sem passar pelo chassi: é o que aconteceria
    // se alguém acrescentasse os parâmetros da chamada ao evento.
    try {
      await auditoria.registrar({
        requisicao_id: randomUUID(),
        inquilino_id: INQUILINO,
        usuario_id: USUARIO,
        papel: 'advogado',
        canal: 'telegram',
        sessao_id: SESSAO,
        acao: 'consultar_processo',
        resultado: 'permitido',
        etapa: `capa do processo ${CNJ}`,
        momento: new Date().toISOString(),
      });
      falha('o número de processo entrou na auditoria', 'a tabela não esquece');
    } catch (e) {
      ok(`resumo com CNJ recusado — ${String(e.message).slice(0, 80)}`);
    }
  }

  {
    try {
      await auditoria.registrar({
        requisicao_id: 'req_teste',
        inquilino_id: INQUILINO,
        usuario_id: USUARIO,
        papel: 'advogado',
        canal: 'telegram',
        sessao_id: SESSAO,
        acao: 'consultar_processo',
        resultado: 'permitido',
        momento: new Date().toISOString(),
      });
      falha('um requisicao_id que não é uuid foi aceito');
    } catch (e) {
      if (/requisicao_id/.test(e.message)) ok('identificador torto é recusado NOMEANDO o campo');
      else falha('recusou, mas sem dizer qual campo', e.message.slice(0, 120));
    }
  }

  // -------------------------------------------------------------------------
  secao('7. O consumo e o ato ficam na mesma transação');
  // -------------------------------------------------------------------------
  {
    const req = randomUUID();
    await auditoria.registrarComConsumo(
      {
        requisicao_id: req,
        inquilino_id: INQUILINO,
        usuario_id: USUARIO,
        papel: 'advogado',
        canal: 'telegram',
        sessao_id: SESSAO,
        acao: 'consultar_processo',
        resultado: 'permitido',
        etapa: 'execucao',
        momento: new Date().toISOString(),
      },
      { fornecedor: 'escavador', operacao: 'v2.processo.capa', custo_centavos: 295 },
    );
    const t = await reconstruir(conexao, req, INQUILINO);
    if (t.custo_total_centavos === 295) ok('o custo de R$ 2,95 voltou junto com o ato que o gerou');
    else falha('o custo não voltou', String(t.custo_total_centavos));

    if (t.consumo[0]?.evento_auditoria_id === t.eventos[0]?.id) {
      ok('o consumo aponta para o evento — custo sem prova é impossível');
    } else {
      falha('o consumo não aponta para o evento');
    }
  }

  {
    // Cache que cobra é contradição, e as duas camadas recusam.
    try {
      await auditoria.registrarComConsumo(
        {
          requisicao_id: randomUUID(), inquilino_id: INQUILINO, usuario_id: USUARIO,
          papel: 'advogado', canal: 'telegram', sessao_id: SESSAO,
          acao: 'consultar_processo', resultado: 'permitido', momento: new Date().toISOString(),
        },
        { fornecedor: 'escavador', operacao: 'v2.processo.capa', custo_centavos: 295, cache_hit: true },
      );
      falha('cache_hit cobrando passou');
    } catch {
      ok('cache_hit com custo é recusado — resposta de cache não custou');
    }
  }

  // -------------------------------------------------------------------------
  secao('8. Auditoria fora do ar BLOQUEIA — e não chama o fornecedor (D-77)');
  // -------------------------------------------------------------------------
  {
    // Uma conexão de verdade, apontando para uma porta onde não há banco. Não
    // é um dublê que lança: é a falha que de fato acontece às três da manhã.
    const morta = abrirConexao({ ...lerAmbiente(), porta: 59999, prazoMs: 1500 });
    const cfg = {
      ferramentas: montarFerramentas(),
      perfis: PERFIS,
      auditoria: criarAuditoriaPostgres(morta),
    };
    const antes = chamadasAoFornecedor;
    const trilha = { etapas: [], executou: false };

    const r = await executarChamada(cfg, {
      ferramenta: 'consultar_processo',
      parametros: { numero_cnj: CNJ },
      sessao: sessao(['escavador:processo:read:any']),
      requisicao_id: randomUUID(),
      agora: new Date(),
    }, trilha);

    if (r.erro?.codigo === 'erro_interno' && /auditoria/i.test(r.erro.mensagem_agente)) {
      ok('a chamada foi bloqueada, e a mensagem diz que foi a auditoria');
    } else {
      falha('a chamada não foi bloqueada pela auditoria', JSON.stringify(r).slice(0, 200));
    }

    if (chamadasAoFornecedor === antes && trilha.executou === false) {
      ok('O FORNECEDOR NÃO FOI CHAMADO — registrar antes de agir é o que garante isso');
    } else {
      falha('o fornecedor foi chamado mesmo sem conseguir registrar',
        `chamadas=${chamadasAoFornecedor - antes} executou=${trilha.executou}`);
    }

    await morta.encerrar().catch(() => {});
  }

  // -------------------------------------------------------------------------
  secao('9. O relatório de negados responde à pergunta da gerência');
  // -------------------------------------------------------------------------
  {
    const desde = new Date(Date.now() - 3_600_000);
    const ate = new Date(Date.now() + 3_600_000);
    const lista = await negados(conexao, INQUILINO, desde, ate);
    if (lista.length >= 1 && lista.every((e) => e.resultado === 'negado')) {
      ok(`${lista.length} recusa(s) na janela, e só recusas`);
    } else {
      falha('o relatório de negados não voltou como esperado', `${lista.length} linhas`);
    }
  }
} catch (e) {
  falha('erro fatal', e?.message ?? String(e));
} finally {
  if (conexao) await conexao.encerrar().catch(() => {});
}

console.log(`\n${cor.neg}${certos} de ${certos + errados} corretos${cor.off}`);
if (errados > 0) {
  console.log(`${cor.rub}O marco 3 NÃO fechou.${cor.off}`);
  process.exit(1);
}
console.log(
  `${cor.ama}Resíduo:${cor.off} as linhas gravadas ficam no banco — a tabela recusa remoção,\n` +
  `que é exatamente o que este script acabou de provar. ${cor.cin}npm run banco:zerar${cor.off} recomeça.`,
);
