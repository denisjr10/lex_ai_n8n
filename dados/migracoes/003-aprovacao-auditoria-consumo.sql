-- ==========================================================================
-- 003 — Aprovacao, auditoria e consumo
--
-- Este arquivo e a Regra 2 ("a IA propoe, o humano dispoe") e a §9.4 regra 1
-- (auditoria append-only) virando esquema.
--
-- A imposicao do append-only e por PERMISSAO no banco, e nao por disciplina da
-- aplicacao — mas a permissao so vem na migracao 007, depois que o papel da
-- aplicacao existir. Aqui ficam a tabela e o gatilho que impedem alteracao
-- MESMO PARA O DONO do banco, que a permissao sozinha nao alcanca.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- aprovacao — a proposta que espera um humano
--
-- `papel_exigido` e o que separa "alguem aprovou" de "um advogado aprovou".
-- Ato com efeito juridico ou de prazo exige advogado identificado (Regra 2), e
-- isso e coluna, nao convencao.
-- ---------------------------------------------------------------------------
CREATE TABLE aprovacao (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id        uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,

  -- Faixas de autorizacao do modelo de identidade (doc 04): A1 leitura,
  -- A2 escrita interna, A3 efeito externo, A4 efeito juridico ou de prazo.
  faixa               text NOT NULL CHECK (faixa IN ('A1', 'A2', 'A3', 'A4')),

  acao_proposta       text NOT NULL,
  conteudo_proposto   jsonb NOT NULL,
  conteudo_final      jsonb,
  solicitante         text NOT NULL,
  aprovador_id        uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  papel_exigido       text NOT NULL
                        CHECK (papel_exigido IN ('socio', 'advogado', 'estagiario',
                                                 'secretaria', 'financeiro', 'ti')),
  status              text NOT NULL DEFAULT 'pendente'
                        CHECK (status IN ('pendente', 'aprovada', 'recusada', 'expirada')),
  criada_em           timestamptz NOT NULL DEFAULT now(),
  expira_em           timestamptz NOT NULL,
  decidida_em         timestamptz,
  justificativa       text,

  CONSTRAINT aprovacao_decidida_tem_autor CHECK (
    status IN ('pendente', 'expirada') OR (aprovador_id IS NOT NULL AND decidida_em IS NOT NULL)
  ),

  -- Faixa A4 exige advogado ou socio. Nao ha combinacao valida de A4 com
  -- estagiario, secretaria, financeiro ou TI — e o banco recusa a tentativa.
  CONSTRAINT aprovacao_a4_exige_advogado CHECK (
    faixa <> 'A4' OR papel_exigido IN ('socio', 'advogado')
  )
);

CREATE INDEX aprovacao_pendentes ON aprovacao (expira_em)
  WHERE status = 'pendente';

-- ---------------------------------------------------------------------------
-- evento_auditoria — a prova
--
-- APPEND-ONLY. Nao aceita UPDATE nem DELETE, e a recusa e do banco.
--
-- Duas camadas, de proposito:
--   1. Um gatilho que levanta excecao em UPDATE e DELETE — vale ate para o
--      dono do banco, que permissao nenhuma restringe
--   2. A revogacao de UPDATE/DELETE para o papel da aplicacao, na migracao 007
--
-- Uma camada so seria suficiente contra descuido. Duas sao necessarias porque
-- o valor da auditoria e ser inalteravel POR QUEM TEM ACESSO — se o unico
-- obstaculo e uma permissao que o administrador pode conceder a si mesmo, a
-- prova vale o quanto a confianca no administrador vale, e nao mais.
-- ---------------------------------------------------------------------------
CREATE TABLE evento_auditoria (
  id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  inquilino_id          uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  momento               timestamptz NOT NULL DEFAULT now(),

  -- Nasce no canal e atravessa n8n, Policy Gate, MCP, SDK e callback (D-75).
  -- E por ele que uma operacao inteira se reconstroi depois.
  requisicao_id         uuid NOT NULL,

  usuario_id            uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  papel                 text,
  canal                 text,
  sessao_id             uuid REFERENCES sessao(id) ON DELETE RESTRICT,
  acao                  text NOT NULL,
  recurso               text,

  -- RESUMIDOS. A auditoria prova o que aconteceu; nao e copia do acervo
  -- (Spec §9.4, regra 3). Numero de processo inteiro, teor de peca e dado
  -- pessoal nao entram aqui.
  parametros_resumidos  jsonb NOT NULL DEFAULT '{}'::jsonb,

  resultado             text NOT NULL
                          CHECK (resultado IN ('permitido', 'negado', 'erro', 'expirado')),
  custo_centavos        integer NOT NULL DEFAULT 0 CHECK (custo_centavos >= 0),
  aprovacao_id          uuid REFERENCES aprovacao(id) ON DELETE RESTRICT,
  origem_ip             inet
);

CREATE INDEX evento_auditoria_por_requisicao ON evento_auditoria (requisicao_id);
CREATE INDEX evento_auditoria_por_momento    ON evento_auditoria (momento DESC);
CREATE INDEX evento_auditoria_por_usuario    ON evento_auditoria (usuario_id, momento DESC);
-- A consulta que a gerencia faz: o que foi NEGADO, e para quem.
CREATE INDEX evento_auditoria_negados        ON evento_auditoria (momento DESC)
  WHERE resultado = 'negado';

CREATE OR REPLACE FUNCTION auditoria_e_imutavel() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION
    'evento_auditoria e append-only: % recusado. A prova do que aconteceu nao se edita (Spec §9.4, regra 1).',
    TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE TRIGGER evento_auditoria_sem_update
  BEFORE UPDATE ON evento_auditoria
  FOR EACH ROW EXECUTE FUNCTION auditoria_e_imutavel();

CREATE TRIGGER evento_auditoria_sem_delete
  BEFORE DELETE ON evento_auditoria
  FOR EACH ROW EXECUTE FUNCTION auditoria_e_imutavel();

-- TRUNCATE nao dispara gatilho FOR EACH ROW. Sem esta linha, uma tabela
-- "imutavel" se esvazia inteira com um comando.
CREATE TRIGGER evento_auditoria_sem_truncate
  BEFORE TRUNCATE ON evento_auditoria
  FOR EACH STATEMENT EXECUTE FUNCTION auditoria_e_imutavel();

COMMENT ON TABLE evento_auditoria IS
  'Append-only imposto por gatilho (vale para o dono) e por permissao (migracao 007). Nem UPDATE, nem DELETE, nem TRUNCATE.';

-- ---------------------------------------------------------------------------
-- consumo — quanto custou, de quem foi o custo, e se o cache evitou
--
-- Todo consumo aponta para um evento de auditoria. Custo sem prova do ato que
-- o gerou e numero sem historia — e a conversa com o escritorio sobre a conta
-- do Escavador vai precisar da historia.
-- ---------------------------------------------------------------------------
CREATE TABLE consumo (
  id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  evento_auditoria_id   bigint NOT NULL REFERENCES evento_auditoria(id) ON DELETE RESTRICT,
  inquilino_id          uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  fornecedor            text NOT NULL CHECK (fornecedor IN ('escavador', 'trello', 'ia', 'interno')),
  operacao              text NOT NULL,
  custo_centavos        integer NOT NULL CHECK (custo_centavos >= 0),
  usuario_id            uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  cliente_id            uuid REFERENCES cliente(id) ON DELETE RESTRICT,
  processo_id           uuid REFERENCES processo(id) ON DELETE RESTRICT,

  -- Quando true, `custo_centavos` e ZERO e o campo abaixo guarda o que TERIA
  -- custado. E assim que se responde "quanto o cache economizou este mes".
  cache_hit             boolean NOT NULL DEFAULT false,
  custo_evitado_centavos integer NOT NULL DEFAULT 0 CHECK (custo_evitado_centavos >= 0),

  momento               timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT consumo_cache_nao_cobra CHECK (
    NOT cache_hit OR custo_centavos = 0
  )
);

CREATE INDEX consumo_por_momento     ON consumo (momento DESC);
CREATE INDEX consumo_por_fornecedor  ON consumo (fornecedor, momento DESC);
CREATE INDEX consumo_por_processo    ON consumo (processo_id) WHERE processo_id IS NOT NULL;
