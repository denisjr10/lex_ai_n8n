-- ==========================================================================
-- 001 — Inquilino, identidade e sessao
--
-- Implementa a primeira parte da Spec §9.1 (governanca) e a tabela `inquilino`
-- de §9.2. Vem primeiro porque quase toda tabela do sistema aponta para uma
-- destas: o inquilino, para isolar dado entre escritorios; o usuario, para
-- responder "quem fez".
--
-- REGRAS DO PROJETO QUE ESTE ARQUIVO REALIZA EM CODIGO:
--   Regra 7 — nada de conta compartilhada (a restricao unica em
--             identidade_externa, mais abaixo, e o que a torna impossivel)
--   Regra 1 — o privilegio e dado verificado, nao instrucao: escopo e
--             abrangencia moram na sessao, em coluna, nao em prompt
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- inquilino — multi-inquilino desde o inicio (§7.2 de 01-diretrizes)
--
-- Hoje ha um escritorio so. A coluna existe assim mesmo porque acrescentar
-- isolamento depois significa reescrever toda consulta do sistema, e a chance
-- de esquecer uma e alta demais para o tipo de dado envolvido.
-- ---------------------------------------------------------------------------
CREATE TABLE inquilino (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           text NOT NULL,
  status         text NOT NULL DEFAULT 'ativo'
                   CHECK (status IN ('ativo', 'suspenso', 'encerrado')),
  configuracao   jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_em      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE inquilino IS
  'Escritorio cliente da plataforma. Toda tabela com dado de cliente aponta para aqui (Spec §9.4, regra 4).';

-- ---------------------------------------------------------------------------
-- usuario — a pessoa, com papel e, quando advogado, OAB
-- ---------------------------------------------------------------------------
CREATE TABLE usuario (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id    uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  nome            text NOT NULL,
  email           text NOT NULL,
  papel           text NOT NULL
                    CHECK (papel IN ('socio', 'advogado', 'estagiario',
                                     'secretaria', 'financeiro', 'ti', 'cliente')),
  -- Obrigatorio para advogado e socio, proibido para os demais: e a OAB que
  -- sustenta a Regra 2 (ato com efeito juridico exige advogado identificado).
  numero_oab      text,
  areas           text[] NOT NULL DEFAULT '{}',
  status          text NOT NULL DEFAULT 'ativo'
                    CHECK (status IN ('ativo', 'afastado', 'desligado')),
  mfa_habilitado  boolean NOT NULL DEFAULT false,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  desligado_em    timestamptz,

  CONSTRAINT usuario_email_por_inquilino UNIQUE (inquilino_id, email),

  -- A regra que impede um estagiario de assinar peticao por descuido de
  -- cadastro. Vive no banco, e nao na tela, porque tela se contorna.
  CONSTRAINT usuario_oab_conforme_papel CHECK (
    (papel IN ('socio', 'advogado') AND numero_oab IS NOT NULL)
    OR
    (papel NOT IN ('socio', 'advogado') AND numero_oab IS NULL)
  ),

  CONSTRAINT usuario_desligado_tem_data CHECK (
    (status = 'desligado') = (desligado_em IS NOT NULL)
  )
);

CREATE INDEX usuario_por_inquilino ON usuario (inquilino_id) WHERE status = 'ativo';

-- ---------------------------------------------------------------------------
-- identidade_externa — o Telegram, o WhatsApp, o e-mail que apontam para a pessoa
--
-- ESTA E A TABELA DA REGRA 7. A restricao unica logo abaixo e o motivo de ela
-- existir separada de `usuario`: enquanto um identificador externo so puder
-- pertencer a um usuario por provedor, uma conta compartilhada nao entra no
-- sistema em silencio — ela colide, e a colisao e visivel.
--
-- Sem isso, "o WhatsApp da secretaria" vira o canal por onde qualquer pessoa
-- do escritorio age com o privilegio de quem estiver cadastrado ali (R-11).
-- ---------------------------------------------------------------------------
CREATE TABLE identidade_externa (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id             uuid NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
  provedor               text NOT NULL
                           CHECK (provedor IN ('telegram', 'whatsapp', 'email', 'trello', 'painel')),
  identificador_externo  text NOT NULL,
  verificada_em          timestamptz,
  revogada_em            timestamptz
);

-- Um identificador, um dono — enquanto vigente. A revogacao libera o
-- identificador para outra pessoa (troca de telefone acontece), mas duas
-- vigentes ao mesmo tempo, nunca.
CREATE UNIQUE INDEX identidade_externa_uma_por_provedor
  ON identidade_externa (provedor, identificador_externo)
  WHERE revogada_em IS NULL;

CREATE INDEX identidade_externa_por_usuario ON identidade_externa (usuario_id);

COMMENT ON INDEX identidade_externa_uma_por_provedor IS
  'Regra 7 / R-11: conta compartilhada nao passa em silencio. Duas pessoas no mesmo numero colidem aqui.';

-- ---------------------------------------------------------------------------
-- sessao — o que a pessoa pode, agora, neste canal
--
-- Emitida pelo Policy Gate e validada offline pelo servidor MCP (D-69). Os
-- escopos ficam em coluna, nao em texto livre: e a diferenca entre privilegio
-- verificavel e privilegio combinado por escrito com um modelo de linguagem.
-- ---------------------------------------------------------------------------
CREATE TABLE sessao (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id            uuid NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
  inquilino_id          uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  canal                 text NOT NULL
                          CHECK (canal IN ('telegram', 'whatsapp', 'email', 'painel', 'n8n')),
  perfil                text NOT NULL,
  escopos               text[] NOT NULL DEFAULT '{}',
  -- Abrangencia: de QUAIS sujeitos esta sessao pode tratar. Vazio significa
  -- "nenhum", nunca "todos" — negar por padrao tambem aqui (Regra 5).
  sujeitos_autorizados  jsonb NOT NULL DEFAULT '[]'::jsonb,
  emitida_em            timestamptz NOT NULL DEFAULT now(),
  expira_em             timestamptz NOT NULL,
  revogada_em           timestamptz,

  CONSTRAINT sessao_expira_depois_de_emitida CHECK (expira_em > emitida_em)
);

-- A lista de revogacao e consultada a cada chamada (D-69). Precisa ser barata.
CREATE INDEX sessao_vigentes ON sessao (expira_em)
  WHERE revogada_em IS NULL;

CREATE INDEX sessao_por_usuario ON sessao (usuario_id, emitida_em DESC);
