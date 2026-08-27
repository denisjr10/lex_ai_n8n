-- ==========================================================================
-- 005 — Tarefa assincrona, evento de callback e cache
--
-- Este arquivo carrega a licao mais cara da captura, e ela nao custou dinheiro:
-- custou uma regra da Spec.
--
-- A Spec dizia, na §8.3, que o identificador do evento entregue pelo fornecedor
-- serve de chave de idempotencia. A medicao de 26/08 desmentiu:
--
--   * a MESMA solicitacao (55413945) chegou TRES vezes, com TRES `uuid`
--     diferentes — o `uuid` identifica a TENTATIVA DE ENTREGA, nao o evento
--   * duas dessas entregas tinham corpo byte a byte identico
--   * e a mesma `atualizacao.id` concluiu DUAS vezes, com `concluido_em`
--     diferente. Chave por `id` sozinha descartaria a segunda — que e a que vale
--
-- Dai a coluna `chave_evento` ser um RESUMO DO CONTEUDO com o envelope de
-- entrega removido antes (D-116, D-117). Nao e detalhe de implementacao: sem
-- isso, cada reentrega vira prazo duplicado e aviso duplicado ao advogado, e
-- alerta duplicado e como o escritorio aprende a ignorar alerta (R-43).
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- tarefa_assincrona — o pedido que ainda nao voltou
--
-- Liga "eu pedi uma atualizacao" ao callback que chega horas depois. Sem esta
-- tabela, o evento que volta e um dado orfao: nao se sabe quem pediu, nem por
-- que, nem se ainda interessa.
-- ---------------------------------------------------------------------------
CREATE TABLE tarefa_assincrona (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id           uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  fornecedor             text NOT NULL CHECK (fornecedor IN ('escavador', 'trello')),
  tipo                   text NOT NULL,
  identificador_externo  text NOT NULL,
  requisicao_id          uuid NOT NULL,
  solicitada_por         uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  processo_id            uuid REFERENCES processo(id) ON DELETE RESTRICT,
  estado                 text NOT NULL DEFAULT 'pendente'
                           CHECK (estado IN ('pendente', 'concluida', 'erro', 'expirada')),
  solicitada_em          timestamptz NOT NULL DEFAULT now(),
  concluida_em           timestamptz,
  resultado_ref          text,

  CONSTRAINT tarefa_externa_unica UNIQUE (fornecedor, tipo, identificador_externo)
);

-- O detector de silencio (§8.4) le daqui: tarefa pendente ha tempo demais e
-- callback que nunca chegou, e callback que nunca chega e prazo que ninguem viu.
CREATE INDEX tarefa_pendentes ON tarefa_assincrona (solicitada_em)
  WHERE estado = 'pendente';

CREATE INDEX tarefa_por_requisicao ON tarefa_assincrona (requisicao_id);

-- ---------------------------------------------------------------------------
-- evento_callback — o que chegou, uma vez so
-- ---------------------------------------------------------------------------
CREATE TABLE evento_callback (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id        uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  fornecedor          text NOT NULL CHECK (fornecedor IN ('escavador', 'trello')),

  -- ⚠️ Resumo do CONTEUDO, com o envelope de entrega removido antes. NUNCA o
  -- identificador que o fornecedor mandou — ele muda a cada reentrega (D-116).
  chave_evento        text NOT NULL,

  tipo                text NOT NULL,
  recebido_em         timestamptz NOT NULL DEFAULT now(),

  -- Falso quando a assinatura ou o segredo compartilhado nao conferiu. O
  -- evento e GRAVADO assim mesmo: entrega invalida e sinal de seguranca, e
  -- apagar sinal de seguranca por ele ser invalido e apagar a evidencia.
  origem_valida       boolean NOT NULL,

  -- Quantas vezes o mesmo conteudo chegou. Em 26/08 foram tres para o mesmo
  -- evento — a coluna existe para que a frequencia real apareca em producao,
  -- em vez de virar surpresa (R-43).
  tentativas          integer NOT NULL DEFAULT 1 CHECK (tentativas >= 1),

  payload_ref         text,
  tarefa_id           uuid REFERENCES tarefa_assincrona(id) ON DELETE RESTRICT,
  processado_em       timestamptz,
  estado              text NOT NULL DEFAULT 'recebido'
                        CHECK (estado IN ('recebido', 'processado', 'ignorado', 'erro'))
);

-- A UNICIDADE E A IDEMPOTENCIA. Imposta pelo banco, e nao por um `if` na
-- aplicacao: duas entregas simultaneas do mesmo conteudo passariam pelo `if`
-- as duas, e so o indice unico impede as duas de virarem fato.
CREATE UNIQUE INDEX evento_callback_chave_unica
  ON evento_callback (fornecedor, chave_evento);

CREATE INDEX evento_callback_nao_processados ON evento_callback (recebido_em)
  WHERE estado = 'recebido';
CREATE INDEX evento_callback_suspeitos ON evento_callback (recebido_em DESC)
  WHERE NOT origem_valida;

COMMENT ON COLUMN evento_callback.chave_evento IS
  'Resumo do conteudo sem o envelope de entrega (D-116, D-117). O uuid do Escavador identifica a TENTATIVA, nao o evento.';

-- ---------------------------------------------------------------------------
-- cache_entrada — o dado que ja se pagou uma vez
-- ---------------------------------------------------------------------------
CREATE TABLE cache_entrada (
  chave                   text NOT NULL,
  inquilino_id            uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  tipo_dado               text NOT NULL,
  conteudo                jsonb NOT NULL,
  obtido_em               timestamptz NOT NULL DEFAULT now(),
  expira_em               timestamptz NOT NULL,

  -- Quanto custou o dado que esta aqui. E o que responde "quanto o cache
  -- economizou este mes" — a pergunta que justifica o mecanismo inteiro.
  custo_origem_centavos   integer NOT NULL DEFAULT 0 CHECK (custo_origem_centavos >= 0),

  -- Cache NEGATIVO: "nao encontrado" tambem se guarda, por uma hora (D-74).
  -- Sem isso, um agente que erra o numero paga de novo, e de novo, pela mesma
  -- resposta vazia.
  negativo                boolean NOT NULL DEFAULT false,

  PRIMARY KEY (inquilino_id, chave)
);

CREATE INDEX cache_expirados ON cache_entrada (expira_em);

-- O isolamento entre inquilinos e a chave primaria composta, e nao um filtro
-- na consulta: e impossivel ler a entrada de outro inquilino por esquecimento
-- de um WHERE, porque a chave sozinha nao localiza nada.
COMMENT ON TABLE cache_entrada IS
  'Isolamento por inquilino esta na chave primaria, nao no WHERE — esquecer o filtro nao vaza, nao encontra.';
