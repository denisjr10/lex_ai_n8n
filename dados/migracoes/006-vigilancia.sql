-- ==========================================================================
-- 006 — Base interna de vigilancia
--
-- Implementa D-63 e a Spec §9.3. E a metade do produto que gera valor mesmo
-- com todos os agentes desligados: o alerta de prazo nao depende de nenhuma IA
-- estar no ar, e a leitura do cliente sai daqui, nao da API paga.
--
-- A escolha que sustenta isso: a publicacao chega uma vez, pelo callback, e
-- fica. Consultar de novo custaria dinheiro toda vez; consultar daqui custa
-- zero e responde mais rapido.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- item_vigiado — o que esta sendo observado, e por conta de qual assinatura
--
-- `desativado_por` e `desativado_em` existem por causa de R-14: desligar
-- vigilancia e a operacao de maior potencial de dano SILENCIOSO do projeto.
-- Nada quebra, nada alerta — o sistema so para de ver, e ninguem percebe ate
-- perder um prazo. Quem desligou e quando fica registrado, sempre.
-- ---------------------------------------------------------------------------
CREATE TABLE item_vigiado (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id    uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  tipo            text NOT NULL CHECK (tipo IN ('oab', 'nome', 'documento', 'processo')),
  valor           text NOT NULL,
  assinatura_id   uuid REFERENCES assinatura(id) ON DELETE RESTRICT,
  usuario_id      uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  criado_por      uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  ativo           boolean NOT NULL DEFAULT true,
  desativado_em   timestamptz,
  desativado_por  uuid REFERENCES usuario(id) ON DELETE RESTRICT,

  CONSTRAINT item_vigiado_desativado_tem_autor CHECK (
    ativo OR (desativado_em IS NOT NULL AND desativado_por IS NOT NULL)
  )
);

CREATE UNIQUE INDEX item_vigiado_um_ativo_por_valor
  ON item_vigiado (inquilino_id, tipo, valor)
  WHERE ativo;

COMMENT ON COLUMN item_vigiado.desativado_por IS
  'R-14: desligar vigilancia nao quebra nada e nao alerta ninguem. Por isso o autor fica gravado.';

-- ---------------------------------------------------------------------------
-- publicacao — o que saiu no diario oficial
--
-- `hash` unico porque a MESMA publicacao chega por dois caminhos: o
-- monitoramento por OAB e o monitoramento do processo. Sem deduplicacao, o
-- advogado recebe o mesmo alerta duas vezes — e alerta repetido e como se
-- ensina alguem a ignorar alertas. O ruido destroi a confianca de que o
-- produto depende.
-- ---------------------------------------------------------------------------
CREATE TABLE publicacao (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id         uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  fonte                text NOT NULL,
  origem_diario        text,
  data_publicacao      date NOT NULL,
  numero_cnj           text,
  teor                 text NOT NULL,
  itens_vigiados       uuid[] NOT NULL DEFAULT '{}',
  hash                 text NOT NULL,
  recebida_em          timestamptz NOT NULL DEFAULT now(),
  evento_callback_id   uuid REFERENCES evento_callback(id) ON DELETE RESTRICT,

  CONSTRAINT publicacao_hash_unico UNIQUE (inquilino_id, hash)
);

CREATE INDEX publicacao_por_data ON publicacao (data_publicacao DESC);
CREATE INDEX publicacao_por_cnj  ON publicacao (numero_cnj) WHERE numero_cnj IS NOT NULL;

-- ---------------------------------------------------------------------------
-- movimentacao — o andamento do processo
-- ---------------------------------------------------------------------------
CREATE TABLE movimentacao (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id         uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  numero_cnj           text NOT NULL,
  processo_id          uuid REFERENCES processo(id) ON DELETE RESTRICT,
  data                 date NOT NULL,
  teor                 text NOT NULL,
  fonte                text NOT NULL,
  hash                 text NOT NULL,
  recebida_em          timestamptz NOT NULL DEFAULT now(),
  evento_callback_id   uuid REFERENCES evento_callback(id) ON DELETE RESTRICT,

  CONSTRAINT movimentacao_hash_unico UNIQUE (inquilino_id, hash)
);

CREATE INDEX movimentacao_por_processo ON movimentacao (processo_id, data DESC);
CREATE INDEX movimentacao_por_cnj      ON movimentacao (numero_cnj, data DESC);

-- ---------------------------------------------------------------------------
-- alerta — o aviso que precisa chegar, e que precisa ser lido
--
-- DUAS AUSENCIAS DELIBERADAS NESTA TABELA:
--
-- 1. Nao existe coluna `prazo_calculado`, e nao vai existir. A plataforma
--    sinaliza INDICIO de prazo; quem conta prazo e advogado (RF-11, D-64).
--    Uma coluna com uma data calculada seria lida como se fosse a data — e o
--    dia em que ela estivesse errada seria o dia do dano.
--
-- 2. Nao existe `lido` booleano. Existem `lido_por` e `lido_em`, porque RF-13
--    exige confirmacao de leitura NOMINAL: saber que "alguem leu" nao permite
--    escalar para quem nao leu.
-- ---------------------------------------------------------------------------
CREATE TABLE alerta (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id       uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  tipo               text NOT NULL,
  prioridade         text NOT NULL DEFAULT 'normal'
                       CHECK (prioridade IN ('baixa', 'normal', 'alta', 'critica')),
  publicacao_id      uuid REFERENCES publicacao(id) ON DELETE RESTRICT,
  movimentacao_id    uuid REFERENCES movimentacao(id) ON DELETE RESTRICT,
  processo_id        uuid REFERENCES processo(id) ON DELETE RESTRICT,

  -- Sinalizador, nao data. Ver a observacao 1 acima.
  indicio_de_prazo   boolean NOT NULL DEFAULT false,

  criado_em          timestamptz NOT NULL DEFAULT now(),
  enviado_em         timestamptz,
  destinatarios      uuid[] NOT NULL DEFAULT '{}',
  lido_por           uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  lido_em            timestamptz,
  escalado_em        timestamptz,
  resolvido_em       timestamptz,

  -- Alerta sem origem nenhuma e alerta que ninguem consegue conferir.
  CONSTRAINT alerta_tem_origem CHECK (
    publicacao_id IS NOT NULL OR movimentacao_id IS NOT NULL
  ),
  CONSTRAINT alerta_lido_tem_autor CHECK (
    (lido_em IS NULL) = (lido_por IS NULL)
  )
);

-- A consulta do rito de escalada (RF-13): enviado, nao lido, e ha quanto tempo.
-- O relogio (o prazo N) e configuracao do escritorio — pergunta 12, Parte II.
CREATE INDEX alerta_nao_lidos ON alerta (enviado_em)
  WHERE lido_em IS NULL AND resolvido_em IS NULL;

CREATE INDEX alerta_com_indicio ON alerta (criado_em DESC)
  WHERE indicio_de_prazo;

COMMENT ON TABLE alerta IS
  'Sem coluna de prazo calculado, de proposito (RF-11, D-64): a plataforma sinaliza indicio; quem conta prazo e advogado.';
