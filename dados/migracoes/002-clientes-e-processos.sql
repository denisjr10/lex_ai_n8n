-- ==========================================================================
-- 002 — Clientes, canais e processos
--
-- Segunda parte da Spec §9.1. Aqui mora o dado que o LGPD considera pessoal e
-- que o segredo de justica considera restrito — e por isso duas colunas deste
-- arquivo valem mais que o resto: `vinculo_canal_cliente.verificado_em` e
-- `processo.sigiloso`.
-- ==========================================================================

CREATE TABLE cliente (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id  uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  nome          text NOT NULL,
  tipo          text NOT NULL CHECK (tipo IN ('fisica', 'juridica')),
  -- CPF ou CNPJ. Guardado porque a identificacao do cliente no atendimento
  -- depende dele; nunca aparece em log nem em auditoria (Spec §9.4, regra 3).
  documento     text,
  status        text NOT NULL DEFAULT 'ativo'
                  CHECK (status IN ('ativo', 'inativo', 'encerrado')),
  criado_em     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT cliente_documento_por_inquilino UNIQUE (inquilino_id, documento)
);

CREATE INDEX cliente_por_inquilino ON cliente (inquilino_id);

-- ---------------------------------------------------------------------------
-- vinculo_canal_cliente — qual numero de WhatsApp e de qual cliente
--
-- O ponto sensivel do atendimento ao cliente (E4): responder dado de processo
-- para quem escreveu de um numero exige saber DE QUEM e o numero. E saber por
-- verificacao registrada, com data e com autor — nao por suposicao de que
-- quem escreve e quem diz ser.
--
-- `verificado_em` NULO significa vinculo NAO verificado, e o chassi trata
-- vinculo nao verificado como inexistente. Negar por padrao (Regra 5).
-- ---------------------------------------------------------------------------
CREATE TABLE vinculo_canal_cliente (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id   uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  cliente_id     uuid NOT NULL REFERENCES cliente(id) ON DELETE RESTRICT,
  canal          text NOT NULL CHECK (canal IN ('telegram', 'whatsapp', 'email')),
  identificador  text NOT NULL,
  verificado_em  timestamptz,
  verificado_por uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  revogado_em    timestamptz,

  -- Verificacao sem autor nao e verificacao: e um campo preenchido.
  CONSTRAINT vinculo_verificado_tem_autor CHECK (
    (verificado_em IS NULL) = (verificado_por IS NULL)
  )
);

-- Mesma logica da identidade_externa: um numero, um cliente, enquanto vigente.
CREATE UNIQUE INDEX vinculo_canal_um_por_identificador
  ON vinculo_canal_cliente (canal, identificador)
  WHERE revogado_em IS NULL;

CREATE INDEX vinculo_por_cliente ON vinculo_canal_cliente (cliente_id);

-- ---------------------------------------------------------------------------
-- processo — o numero CNJ, de quem e, quem responde por ele
-- ---------------------------------------------------------------------------
CREATE TABLE processo (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id              uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  numero_cnj                text NOT NULL,
  cliente_id                uuid REFERENCES cliente(id) ON DELETE RESTRICT,
  advogado_responsavel_id   uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  area                      text,
  status                    text NOT NULL DEFAULT 'ativo'
                              CHECK (status IN ('ativo', 'suspenso', 'arquivado', 'encerrado')),

  -- ⚠️ A coluna mais importante deste arquivo.
  --
  -- Processo em segredo de justica nao se consulta pelas ferramentas comuns,
  -- nao alimenta agente e nao vai para canal de cliente. Ja mudou o alvo da
  -- captura uma vez (D-96), e os scripts recusam alvo sigiloso em codigo.
  --
  -- O default e `true`: um processo cadastrado sem que ninguem tenha dito se e
  -- sigiloso e tratado como sigiloso ate que alguem diga o contrario. E o
  -- inverso do comodo, e e o unico default seguro (Regra 5, falha fecha).
  sigiloso                  boolean NOT NULL DEFAULT true,

  criado_em                 timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT processo_cnj_por_inquilino UNIQUE (inquilino_id, numero_cnj),

  -- Formato do CNJ conferido pelo banco. O digito verificador em si e conferido
  -- na aplicacao (aritmetica ISO 7064, ja implementada na captura) — aqui fica
  -- so a forma, que e o que impede lixo evidente de entrar.
  CONSTRAINT processo_cnj_bem_formado CHECK (
    numero_cnj ~ '^[0-9]{7}-[0-9]{2}\.[0-9]{4}\.[0-9]\.[0-9]{2}\.[0-9]{4}$'
  )
);

CREATE INDEX processo_por_responsavel ON processo (advogado_responsavel_id)
  WHERE status = 'ativo';
CREATE INDEX processo_por_cliente ON processo (cliente_id);

COMMENT ON COLUMN processo.sigiloso IS
  'Default true de proposito: sem informacao, trata-se como sigiloso. Falha fecha (Regra 5).';
