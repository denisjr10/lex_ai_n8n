#!/usr/bin/env node
/**
 * conferir-regras.mjs — as regras do projeto, provadas contra o banco de pé
 * ---------------------------------------------------------------------------
 * O documento diz que o banco impede conta compartilhada, que a auditoria é
 * imutável e que o orçamento não estoura. **Documento não prova nada.** Este
 * arquivo tenta fazer cada uma dessas coisas proibidas, e falha se alguma
 * delas passar.
 *
 * É o critério de aceite do marco 1 na parte que importa: não é "as migrações
 * rodaram sem erro" — é "as restrições recusam o que deveriam recusar".
 *
 * Cada teste cria o que precisa, tenta o proibido e desfaz tudo: nenhum
 * resíduo fica no banco.
 *
 * Uso:  npm run banco:conferir
 */

import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const COMPOSE = path.join(RAIZ, 'infra', 'docker-compose.yml');
const ARQ_ENV = path.join(RAIZ, 'infra', '.env');

const cor = { off: '\x1b[0m', neg: '\x1b[1m', ver: '\x1b[32m', ama: '\x1b[33m', rub: '\x1b[31m', cin: '\x1b[90m' };

function lerEnv() {
  const v = { POSTGRES_DB: 'lex', POSTGRES_USER: 'lex_dono' };
  if (fs.existsSync(ARQ_ENV)) {
    for (const linha of fs.readFileSync(ARQ_ENV, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) v[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  for (const k of Object.keys(v)) if (process.env[k]) v[k] = process.env[k];
  return v;
}
const env = lerEnv();

/** Roda SQL e devolve { ok, saida }. Nunca lança: a falha é o resultado. */
function sql(texto, prazoMs = 60_000) {
  try {
    const saida = execFileSync('docker', [
      'compose', '-f', COMPOSE, 'exec', '-T', 'banco',
      'psql', '-U', env.POSTGRES_USER, '-d', env.POSTGRES_DB,
      '-v', 'ON_ERROR_STOP=1', '--no-psqlrc', '-tA', '-f', '-',
    ], { input: texto, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: prazoMs });
    return { ok: true, saida: saida.trim() };
  } catch (e) {
    const detalhe = [e.stderr, e.stdout].filter(Boolean).join('\n').trim();
    return { ok: false, saida: detalhe || e.message };
  }
}

// ---------------------------------------------------------------------------
// Cenário: um inquilino e as pessoas de que os testes precisam.
//
// Tudo dentro de uma transação que termina em ROLLBACK — o banco fica
// exatamente como estava. Por isso cada caso é um bloco de SQL completo, e não
// uma sequência de chamadas: o ROLLBACK precisa alcançar tudo.
// ---------------------------------------------------------------------------
const CENARIO = `
BEGIN;
INSERT INTO inquilino (id, nome) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Escritorio de Teste');
INSERT INTO usuario (id, inquilino_id, nome, email, papel, numero_oab) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Advogada de Teste', 'adv@teste.invalido', 'advogado', 'AP-0001');
INSERT INTO usuario (id, inquilino_id, nome, email, papel) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   'Estagiario de Teste', 'est@teste.invalido', 'estagiario');

-- O SEGUNDO ESCRITORIO. Sem ele nao ha como provar isolamento: um cenario com
-- um inquilino so consegue afirmar que o sistema funciona, nunca que ele
-- separa. As chaves compostas da migracao 009 existem para o caso de dois.
INSERT INTO inquilino (id, nome) VALUES
  ('99999999-9999-9999-9999-999999999999', 'Escritorio Vizinho');
INSERT INTO usuario (id, inquilino_id, nome, email, papel, numero_oab) VALUES
  ('88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999',
   'Advogado Vizinho', 'adv@vizinho.invalido', 'advogado', 'AP-0002');
INSERT INTO cliente (id, inquilino_id, nome, tipo) VALUES
  ('77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999',
   'Cliente do Vizinho', 'fisica');
`;
const FIM = '\nROLLBACK;\n';

/** Deve FALHAR: o banco tem de recusar. */
function deveRecusar(rotulo, corpo, regra) {
  return { tipo: 'recusar', rotulo, regra, sql: CENARIO + corpo + FIM };
}
/** Deve PASSAR: o caminho legítimo não pode ficar barrado por engano. */
function devePassar(rotulo, corpo, regra) {
  return { tipo: 'passar', rotulo, regra, sql: CENARIO + corpo + FIM };
}

const CASOS = [
  // ---- Regra 7: nada de conta compartilhada -------------------------------
  deveRecusar(
    'dois usuarios no MESMO numero de WhatsApp',
    `INSERT INTO identidade_externa (usuario_id, provedor, identificador_externo) VALUES
       ('22222222-2222-2222-2222-222222222222', 'whatsapp', '+5596999990000'),
       ('33333333-3333-3333-3333-333333333333', 'whatsapp', '+5596999990000');`,
    'Regra 7 / R-11'
  ),
  devePassar(
    'reaproveitar um numero JA REVOGADO',
    `INSERT INTO identidade_externa (usuario_id, provedor, identificador_externo, revogada_em) VALUES
       ('22222222-2222-2222-2222-222222222222', 'whatsapp', '+5596999990000', now());
     INSERT INTO identidade_externa (usuario_id, provedor, identificador_externo) VALUES
       ('33333333-3333-3333-3333-333333333333', 'whatsapp', '+5596999990000');`,
    'troca de telefone acontece'
  ),

  // ---- Regra 2: ato juridico exige advogado -------------------------------
  deveRecusar(
    'faixa A4 exigindo apenas estagiario',
    `INSERT INTO aprovacao (inquilino_id, faixa, acao_proposta, conteudo_proposto,
                            solicitante, papel_exigido, expira_em)
     VALUES ('11111111-1111-1111-1111-111111111111', 'A4', 'peticionar', '{}',
             'agente', 'estagiario', now() + interval '1 day');`,
    'Regra 2'
  ),
  deveRecusar(
    'estagiario cadastrado COM numero de OAB',
    `INSERT INTO usuario (inquilino_id, nome, email, papel, numero_oab)
     VALUES ('11111111-1111-1111-1111-111111111111', 'X', 'x@teste.invalido',
             'estagiario', 'AP-9999');`,
    'Regra 2'
  ),
  deveRecusar(
    'advogado cadastrado SEM numero de OAB',
    `INSERT INTO usuario (inquilino_id, nome, email, papel)
     VALUES ('11111111-1111-1111-1111-111111111111', 'Y', 'y@teste.invalido', 'advogado');`,
    'Regra 2'
  ),

  // ---- Auditoria imutavel -------------------------------------------------
  deveRecusar(
    'ALTERAR um evento de auditoria',
    `INSERT INTO evento_auditoria (inquilino_id, requisicao_id, acao, resultado)
     VALUES ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'consultar', 'permitido');
     UPDATE evento_auditoria SET resultado = 'negado';`,
    'Spec §9.4 regra 1'
  ),
  deveRecusar(
    'APAGAR um evento de auditoria',
    `INSERT INTO evento_auditoria (inquilino_id, requisicao_id, acao, resultado)
     VALUES ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'consultar', 'permitido');
     DELETE FROM evento_auditoria;`,
    'Spec §9.4 regra 1'
  ),
  deveRecusar(
    'ESVAZIAR a auditoria com TRUNCATE',
    `TRUNCATE evento_auditoria CASCADE;`,
    'D-128 — TRUNCATE nao dispara gatilho por linha'
  ),

  // ---- Regra 6: o teto e do banco -----------------------------------------
  deveRecusar(
    'gastar alem do limite do orcamento',
    `INSERT INTO orcamento (inquilino_id, escopo, referencia, periodo, limite_centavos,
                            consumido_centavos, reservado_centavos)
     VALUES ('11111111-1111-1111-1111-111111111111', 'inquilino', 'teste', '2026-08',
             5000, 4900, 200);`,
    'Regra 6 / D-72'
  ),
  devePassar(
    'reservar exatamente ate o limite',
    `INSERT INTO orcamento (inquilino_id, escopo, referencia, periodo, limite_centavos,
                            consumido_centavos, reservado_centavos)
     VALUES ('11111111-1111-1111-1111-111111111111', 'inquilino', 'teste', '2026-08',
             5000, 4700, 300);`,
    'o teto e teto, nao parede antes do teto'
  ),

  // ---- Idempotencia por conteudo ------------------------------------------
  deveRecusar(
    'gravar o MESMO evento de callback duas vezes',
    `INSERT INTO evento_callback (inquilino_id, fornecedor, chave_evento, tipo, origem_valida) VALUES
       ('11111111-1111-1111-1111-111111111111', 'escavador', 'resumo-abc', 'atualizacao', true),
       ('11111111-1111-1111-1111-111111111111', 'escavador', 'resumo-abc', 'atualizacao', true);`,
    'D-116 / R-43'
  ),
  // ⚠️ ESTE PAR DE CASOS SUBSTITUI UM CASO SO, QUE ESTAVA ERRADO.
  //
  // Ate 02/09 havia aqui uma prova de que "a MESMA publicacao chegando por dois
  // caminhos" era recusada — pelo `hash` do teor. A intencao era certa: ruido
  // destroi a confianca no alerta. O MECANISMO e que era falso.
  //
  // Na primeira vez que dado real entrou na tabela, 30 publicacoes viraram 21.
  // Sete PROCESSOS DIFERENTES trouxeram a mesma intimacao padrao de 123
  // caracteres, e a restricao de hash guardou uma e descartou SEIS — sem erro,
  // sem contador, sem nada. Seis intimacoes de seis casos que nunca chegariam a
  // existir na base (migracao 013).
  //
  // O caso antigo passava. Ele provava exatamente o comportamento que perdia
  // prazo, e a prova verde dava confianca nisso. Faltava o caso de baixo, que e
  // o que teria mostrado o defeito no dia em que foi escrito.
  deveRecusar(
    'a MESMA publicacao chegando duas vezes do MESMO fornecedor',
    `INSERT INTO publicacao (inquilino_id, fonte, data_publicacao, teor, hash, id_externo) VALUES
       ('11111111-1111-1111-1111-111111111111', 'escavador_diario', '2026-08-27', 'intimacao', 'h1', '1718477492'),
       ('11111111-1111-1111-1111-111111111111', 'escavador_diario', '2026-08-27', 'intimacao', 'h2', '1718477492');`,
    'D-178 — a identidade e o id do fornecedor, nao o resumo do texto'
  ),
  devePassar(
    'DUAS publicacoes diferentes com o MESMO teor',
    `INSERT INTO publicacao (inquilino_id, fonte, data_publicacao, teor, hash, id_externo) VALUES
       ('11111111-1111-1111-1111-111111111111', 'escavador_diario', '2026-08-28', 'intimacao padrao', 'h1', '1718477492'),
       ('11111111-1111-1111-1111-111111111111', 'escavador_diario', '2026-08-28', 'intimacao padrao', 'h1', '1718476647');`,
    'migracao 013 — tribunal publica formula identica para processos diferentes'
  ),

  // ---- Regra 5: negar por padrao ------------------------------------------
  deveRecusar(
    'CNJ malformado entrando como processo',
    `INSERT INTO processo (inquilino_id, numero_cnj)
     VALUES ('11111111-1111-1111-1111-111111111111', '123-nao-e-cnj');`,
    'Regra 5'
  ),

  // ---- Coerencia de registro ----------------------------------------------
  deveRecusar(
    'verificar um vinculo de canal SEM dizer quem verificou',
    `INSERT INTO cliente (id, inquilino_id, nome, tipo)
     VALUES ('44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','C','fisica');
     INSERT INTO vinculo_canal_cliente (inquilino_id, cliente_id, canal, identificador, verificado_em)
     VALUES ('11111111-1111-1111-1111-111111111111','44444444-4444-4444-4444-444444444444',
             'whatsapp','+5596000000000', now());`,
    'verificacao sem autor nao e verificacao'
  ),
  deveRecusar(
    'desativar vigilancia SEM dizer quem desativou',
    `INSERT INTO item_vigiado (inquilino_id, tipo, valor, ativo, desativado_em)
     VALUES ('11111111-1111-1111-1111-111111111111', 'oab', 'AP-0001', false, now());`,
    'R-14 — dano silencioso'
  ),
  deveRecusar(
    'alerta sem publicacao nem movimentacao de origem',
    `INSERT INTO alerta (inquilino_id, tipo)
     VALUES ('11111111-1111-1111-1111-111111111111', 'prazo');`,
    'alerta sem origem ninguem confere'
  ),

  // ---- 008: a faixa que se dividiu (D-142, D-156) -------------------------
  deveRecusar(
    'aprovacao na faixa A3, que deixou de existir',
    `INSERT INTO aprovacao (inquilino_id, faixa, acao_proposta, conteudo_proposto,
                            solicitante, papel_exigido, expira_em)
     VALUES ('11111111-1111-1111-1111-111111111111', 'A3', 'enviar_ao_cliente', '{}',
             'agente', 'advogado', now() + interval '1 day');`,
    'D-142 — A3 virou A3a e A3b'
  ),
  devePassar(
    'aprovacao A3b assinada por advogado',
    `INSERT INTO aprovacao (inquilino_id, faixa, acao_proposta, conteudo_proposto,
                            solicitante, papel_exigido, expira_em)
     VALUES ('11111111-1111-1111-1111-111111111111', 'A3b', 'enviar_ao_cliente', '{}',
             'agente', 'advogado', now() + interval '1 day');`,
    'o caminho legitimo nao pode ficar barrado'
  ),
  deveRecusar(
    'comunicacao externa em texto livre exigindo apenas estagiario',
    `INSERT INTO aprovacao (inquilino_id, faixa, acao_proposta, conteudo_proposto,
                            solicitante, papel_exigido, expira_em)
     VALUES ('11111111-1111-1111-1111-111111111111', 'A3b', 'enviar_ao_cliente', '{}',
             'agente', 'estagiario', now() + interval '1 day');`,
    'D-156 — A3b exige advogado'
  ),
  devePassar(
    'envio por gabarito pre-aprovado nao exige advogado na hora',
    `INSERT INTO aprovacao (inquilino_id, faixa, acao_proposta, conteudo_proposto,
                            solicitante, papel_exigido, expira_em)
     VALUES ('11111111-1111-1111-1111-111111111111', 'A3a', 'avisar_movimentacao', '{}',
             'agente', 'estagiario', now() + interval '1 day');`,
    'D-142 — em A3a o advogado aprovou o gabarito antes'
  ),

  // ---- 008: aprovacao se gasta uma vez ------------------------------------
  deveRecusar(
    'marcar como usada uma aprovacao que nao foi aprovada',
    `INSERT INTO aprovacao (id, inquilino_id, faixa, acao_proposta, conteudo_proposto,
                            solicitante, papel_exigido, expira_em, status, usado_em)
     VALUES ('44444444-4444-4444-4444-444444444444',
             '11111111-1111-1111-1111-111111111111', 'A3b', 'enviar_ao_cliente', '{}',
             'agente', 'advogado', now() + interval '1 day', 'pendente', now());`,
    'estado impossivel que o banco aceita e estado que um dia aparece'
  ),

  // ---- 008: CHECK que passava com NULL ------------------------------------
  deveRecusar(
    'rota classificada como gratuita SEM preco medido',
    `INSERT INTO catalogo_preco (fornecedor, rota, classificacao, lido_em, fonte)
     VALUES ('escavador', 'v1.origens', 'gratuita', current_date, 'medicao');`,
    'D-108 — gratuito se confirma pela medicao, nunca por suposicao'
  ),
  devePassar(
    'rota gratuita COM zero medido e escrito',
    `INSERT INTO catalogo_preco (fornecedor, rota, classificacao, preco_centavos, lido_em, fonte)
     VALUES ('escavador', 'v1.origens', 'gratuita', 0, current_date, 'medicao');`,
    'o zero medido e um fato, e entra'
  ),

  // ---- 008: a forma de sujeitos_autorizados -------------------------------
  deveRecusar(
    'sessao com sujeitos_autorizados na forma antiga de lista',
    `INSERT INTO sessao (usuario_id, inquilino_id, canal, perfil, sujeitos_autorizados, expira_em)
     VALUES ('22222222-2222-2222-2222-222222222222',
             '11111111-1111-1111-1111-111111111111', 'painel', 'advogado',
             '[]'::jsonb, now() + interval '15 minutes');`,
    'lista viraria objeto sem `processos`, e undefined em abrangencia libera'
  ),
  devePassar(
    'sessao usando o DEFAULT da coluna',
    `INSERT INTO sessao (usuario_id, inquilino_id, canal, perfil, expira_em)
     VALUES ('22222222-2222-2222-2222-222222222222',
             '11111111-1111-1111-1111-111111111111', 'painel', 'advogado',
             now() + interval '15 minutes');`,
    'o default nasce na forma certa'
  ),


  // ---- 009: o banco recusa referencia entre escritorios -------------------
  deveRecusar(
    'sessao do escritorio A para um usuario do escritorio B',
    `INSERT INTO sessao (usuario_id, inquilino_id, canal, perfil, expira_em)
     VALUES ('88888888-8888-8888-8888-888888888888',
             '11111111-1111-1111-1111-111111111111', 'painel', 'advogado',
             now() + interval '15 minutes');`,
    'chave composta — a sessao de um escritorio nao autentica gente de outro'
  ),
  deveRecusar(
    'vinculo de WhatsApp do escritorio A para um cliente do escritorio B',
    `INSERT INTO vinculo_canal_cliente (inquilino_id, cliente_id, canal, identificador)
     VALUES ('11111111-1111-1111-1111-111111111111',
             '77777777-7777-7777-7777-777777777777', 'whatsapp', '+5596999990000');`,
    'era a porta para responder dado de cliente alheio a um numero cadastrado'
  ),
  deveRecusar(
    'processo do escritorio A sob responsabilidade de advogado do escritorio B',
    `INSERT INTO processo (inquilino_id, numero_cnj, advogado_responsavel_id)
     VALUES ('11111111-1111-1111-1111-111111111111', '0000132-06.2025.5.08.0205',
             '88888888-8888-8888-8888-888888888888');`,
    'responsabilidade processual nao atravessa escritorio'
  ),
  deveRecusar(
    'aprovacao do escritorio A assinada por advogado do escritorio B',
    `INSERT INTO aprovacao (inquilino_id, faixa, acao_proposta, conteudo_proposto,
                            solicitante, papel_exigido, expira_em, status,
                            aprovador_id, decidida_em)
     VALUES ('11111111-1111-1111-1111-111111111111', 'A3b', 'enviar_ao_cliente', '{}',
             'agente', 'advogado', now() + interval '1 day', 'aprovada',
             '88888888-8888-8888-8888-888888888888', now());`,
    'Regra 2 — a assinatura tem de ser de quem responde por aquele escritorio'
  ),
  devePassar(
    'cada escritorio referenciando o proprio pessoal',
    `INSERT INTO sessao (usuario_id, inquilino_id, canal, perfil, expira_em)
     VALUES ('22222222-2222-2222-2222-222222222222',
             '11111111-1111-1111-1111-111111111111', 'painel', 'advogado',
             now() + interval '15 minutes');
     INSERT INTO sessao (usuario_id, inquilino_id, canal, perfil, expira_em)
     VALUES ('88888888-8888-8888-8888-888888888888',
             '99999999-9999-9999-9999-999999999999', 'painel', 'advogado',
             now() + interval '15 minutes');`,
    'dois escritorios convivem — isolar nao pode virar travar'
  ),
  devePassar(
    'coluna opcional continua aceitando nulo',
    `INSERT INTO item_vigiado (inquilino_id, tipo, valor)
     VALUES ('11111111-1111-1111-1111-111111111111', 'oab', 'AP-0001');`,
    'MATCH SIMPLE — "ninguem criou ainda" nao exige um usuario que nao existe'
  ),


  // ---- 010: politica por linha -------------------------------------------
  //
  // Estas provas trocam de papel com SET LOCAL ROLE. Sem isso elas nao
  // provariam nada: o conferidor conecta como `lex_dono`, que E o dono das
  // tabelas, e politica por linha NAO se aplica ao dono. Rodar a prova com o
  // papel errado daria verde num banco sem politica nenhuma.
  //
  // Sao `devePassar` com RAISE dentro: o sucesso e o bloco NAO levantar. Um
  // SELECT que devolve zero linhas nao e erro, entao "nao enxergou" precisa
  // virar afirmacao explicita para poder falhar.
  devePassar(
    'escritorio A nao enxerga cliente do escritorio B',
    `SET LOCAL ROLE lex_app;
     SELECT set_config('lex.inquilino_id', '11111111-1111-1111-1111-111111111111', true);
     DO $$ DECLARE n int; BEGIN
       SELECT count(*) INTO n FROM cliente;
       IF n <> 0 THEN RAISE EXCEPTION 'enxergou % cliente(s) que nao sao deste escritorio', n; END IF;
     END $$;`,
    'a consulta que esquece o filtro deixa de vazar'
  ),
  devePassar(
    'escritorio B enxerga o proprio cliente — isolar nao pode virar cegar',
    `SET LOCAL ROLE lex_app;
     SELECT set_config('lex.inquilino_id', '99999999-9999-9999-9999-999999999999', true);
     DO $$ DECLARE n int; BEGIN
       SELECT count(*) INTO n FROM cliente;
       IF n <> 1 THEN RAISE EXCEPTION 'deveria ver 1 cliente proprio, viu %', n; END IF;
     END $$;`,
    'a metade que impede a trava de virar defeito'
  ),
  devePassar(
    'conexao SEM escritorio declarado nao enxerga nada',
    `SET LOCAL ROLE lex_app;
     DO $$ DECLARE n int; BEGIN
       SELECT count(*) INTO n FROM usuario;
       IF n <> 0 THEN RAISE EXCEPTION 'sem inquilino declarado, enxergou % usuario(s)', n; END IF;
     END $$;`,
    'falha fechada: quem nao diz de quem trata nao ve ninguem'
  ),
  deveRecusar(
    'gravar linha carimbada com o escritorio de outro',
    `SET LOCAL ROLE lex_app;
     SELECT set_config('lex.inquilino_id', '11111111-1111-1111-1111-111111111111', true);
     INSERT INTO cliente (inquilino_id, nome, tipo)
     VALUES ('99999999-9999-9999-9999-999999999999', 'Infiltrado', 'fisica');`,
    'WITH CHECK — nao se le fora do escritorio, e nao se escreve nele'
  ),
  devePassar(
    'gravar no proprio escritorio segue funcionando',
    `SET LOCAL ROLE lex_app;
     SELECT set_config('lex.inquilino_id', '11111111-1111-1111-1111-111111111111', true);
     INSERT INTO cliente (inquilino_id, nome, tipo)
     VALUES ('11111111-1111-1111-1111-111111111111', 'Cliente Legitimo', 'fisica');`,
    'o caminho de todo dia nao pode ficar barrado'
  ),

];

// ---------------------------------------------------------------------------
console.log(`\n${cor.neg}As regras do projeto, contra o banco de pe${cor.off}`);
console.log(`${cor.cin}cada caso tenta o proibido e desfaz tudo (ROLLBACK)${cor.off}\n`);

const vivo = sql('SELECT 1');
if (!vivo.ok) {
  console.log(`${cor.rub} ERRO ${cor.off} o banco nao respondeu.`);
  console.log(`${cor.cin}      suba com:  npm run banco:subir${cor.off}\n`);
  process.exit(1);
}

let falhas = 0;
for (const caso of CASOS) {
  const r = sql(caso.sql);
  const passou = caso.tipo === 'recusar' ? !r.ok : r.ok;
  if (!passou) falhas++;

  const marca = passou ? `${cor.ver}ok   ${cor.off}` : `${cor.rub}FALHA${cor.off}`;
  const verbo = caso.tipo === 'recusar' ? 'recusa' : 'aceita';
  console.log(`    ${marca}  ${verbo.padEnd(7)} ${caso.rotulo}`);
  console.log(`${cor.cin}             ${caso.regra}${cor.off}`);
  if (!passou) {
    const linha = r.saida.split('\n').find(l => /ERRO|ERROR|erro/i.test(l)) || r.saida.split('\n')[0] || '(sem detalhe)';
    console.log(`${cor.rub}             ${linha.slice(0, 160)}${cor.off}`);
  }
}

// ---------------------------------------------------------------------------
// A permissão do papel da aplicação — o que ele NÃO pode
// ---------------------------------------------------------------------------
console.log(`\n${cor.neg}Permissoes do papel da aplicacao${cor.off}\n`);

const PERMISSOES = [
  ['evento_auditoria', 'SELECT', true],
  ['evento_auditoria', 'INSERT', true],
  ['evento_auditoria', 'UPDATE', false],
  ['evento_auditoria', 'DELETE', false],
  ['consumo',          'UPDATE', false],
  ['publicacao',       'DELETE', false],
  ['movimentacao',     'DELETE', false],
  ['cache_entrada',    'DELETE', true],
  ['aprovacao',        'UPDATE', true],
];

for (const [tabela, verbo, esperado] of PERMISSOES) {
  const r = sql(`SELECT has_table_privilege('lex_app', '${tabela}', '${verbo}');`);
  const tem = r.ok && r.saida === 't';
  const passou = tem === esperado;
  if (!passou) falhas++;
  const marca = passou ? `${cor.ver}ok   ${cor.off}` : `${cor.rub}FALHA${cor.off}`;
  console.log(`    ${marca}  ${esperado ? 'pode  ' : 'NAO pode'} ${verbo.padEnd(6)} em ${tabela}`);
}

console.log(`\n${CASOS.length + PERMISSOES.length - falhas} de ${CASOS.length + PERMISSOES.length} corretos.\n`);
process.exit(falhas ? 1 : 0);
