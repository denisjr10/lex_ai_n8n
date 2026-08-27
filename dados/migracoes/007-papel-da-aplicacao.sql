-- ==========================================================================
-- 007 — O papel da aplicacao, e o privilegio que ele NAO tem
--
-- Esta migracao e a Regra 1 aplicada ao banco: "privilegio se aplica como
-- escopo verificado em codigo, jamais por instrucao". Aqui o codigo e o
-- catalogo de permissoes do PostgreSQL, que nenhum prompt convence.
--
-- O desenho tem duas partes, e a segunda e a que importa:
--
--   1. `lex_dono` (o dono do banco, dono das migracoes) cria e altera esquema
--   2. `lex_app` (o papel dos servicos) usa o esquema, e recebe permissao
--      POR TABELA e POR VERBO — nunca por atacado
--
-- O default e SELECT e INSERT. UPDATE e DELETE sao concedidos um a um, com o
-- nome da tabela escrito. Negar por padrao (Regra 5) tambem aqui: uma tabela
-- criada numa migracao futura nasce sem poder ser alterada nem apagada pela
-- aplicacao, e quem precisar disso vai ter de escrever a linha e explicar por que.
--
-- E o efeito colateral pretendido: `evento_auditoria` simplesmente nunca
-- aparece na lista, e por isso nunca se altera. Combinado com o gatilho da
-- migracao 003, a auditoria e imutavel para a aplicacao E para o dono.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- O papel
--
-- Sem senha aqui de proposito: senha em arquivo versionado e segredo em
-- arquivo versionado, e o Git nao esquece. A senha e definida logo depois pelo
-- migrador, a partir de variavel de ambiente. Ate la o papel existe e nao
-- consegue conectar — que e o estado seguro.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lex_app') THEN
    CREATE ROLE lex_app LOGIN;
  END IF;
END;
$$;

COMMENT ON ROLE lex_app IS
  'Papel dos servicos. Le e insere; altera e apaga so onde foi concedido nome a nome. Nunca toca auditoria.';

-- O nome do banco vem do ambiente (infra/.env), entao nao pode ser escrito
-- literal aqui: quem trocar POSTGRES_DB teria a migracao falhando sem motivo
-- aparente.
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO lex_app', current_database());
END;
$$;

GRANT USAGE ON SCHEMA public TO lex_app;

-- ---------------------------------------------------------------------------
-- O padrao: ler e inserir. Nada mais.
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA public TO lex_app;
GRANT USAGE, SELECT   ON ALL SEQUENCES IN SCHEMA public TO lex_app;

-- Vale tambem para o que ainda nao existe. Tabela de migracao futura nasce
-- legivel e inserivel, e mais nada — sem que ninguem precise lembrar.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT ON TABLES TO lex_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO lex_app;

-- ---------------------------------------------------------------------------
-- As excecoes, uma a uma, com o motivo escrito ao lado
-- ---------------------------------------------------------------------------

-- Cadastro muda: pessoa e desligada, cliente encerra, processo arquiva.
GRANT UPDATE ON usuario, cliente, processo, inquilino TO lex_app;

-- Identidade e vinculo se REVOGAM (marcando data), nunca se apagam: a
-- revogacao e o registro de que aquele numero ja pertenceu a alguem.
GRANT UPDATE ON identidade_externa, vinculo_canal_cliente TO lex_app;

-- Sessao e revogada antes de expirar (D-69, lista de revogacao).
GRANT UPDATE ON sessao TO lex_app;

-- Aprovacao caminha de pendente a decidida. E o coracao da Regra 2.
GRANT UPDATE ON aprovacao TO lex_app;

-- Motor de custo: reserva, reconciliacao e disjuntor sao alteracoes de estado.
GRANT UPDATE ON orcamento, reserva_orcamento, custo_observado, catalogo_preco TO lex_app;

-- Assinatura muda de estado e conta aparicoes no ciclo (R-40).
GRANT UPDATE ON assinatura TO lex_app;

-- Assincronia: a tarefa conclui, o evento e marcado como processado, e o
-- contador de reentregas sobe a cada chegada repetida (R-43).
GRANT UPDATE ON tarefa_assincrona, evento_callback TO lex_app;

-- Cache e a UNICA coisa que a aplicacao pode apagar. Descartar dado em cache
-- nao perde nada: no pior caso, paga-se de novo pelo que ja se pagou uma vez.
GRANT UPDATE, DELETE ON cache_entrada TO lex_app;

-- Vigilancia: alerta e lido, escalado e resolvido; item vigiado e desativado.
-- Note que nao ha DELETE: publicacao e movimentacao NAO se apagam. Elas sao a
-- base de leitura do cliente e a origem dos alertas — apagar uma e apagar a
-- justificativa de um aviso que ja foi dado.
GRANT UPDATE ON item_vigiado, alerta TO lex_app;

-- ---------------------------------------------------------------------------
-- E a confirmacao explicita do que NAO foi concedido
--
-- REVOKE redundante e de proposito: ele documenta a intencao e protege contra
-- um GRANT ... ON ALL TABLES que alguem venha a escrever distraidamente numa
-- migracao futura. Nao custa nada, e diz em voz alta o que o silencio diria baixo.
-- ---------------------------------------------------------------------------
REVOKE UPDATE, DELETE, TRUNCATE ON evento_auditoria FROM lex_app;
REVOKE UPDATE, DELETE, TRUNCATE ON consumo          FROM lex_app;
REVOKE DELETE, TRUNCATE          ON publicacao      FROM lex_app;
REVOKE DELETE, TRUNCATE          ON movimentacao    FROM lex_app;
REVOKE DELETE                    ON ALL TABLES IN SCHEMA public FROM lex_app;

-- O DELETE do cache foi revogado pela linha acima, junto com todos os outros.
-- Reconcedido aqui, sozinho, para que a excecao fique visivel em vez de
-- depender da ordem em que as linhas aparecem.
GRANT DELETE ON cache_entrada TO lex_app;
