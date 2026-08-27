-- ==========================================================================
-- 004 — Catalogo de precos, orcamento, reserva e assinatura
--
-- A Regra 6 ("custo e requisito funcional") virando esquema. E a resposta em
-- banco para o que a captura mediu na marra durante uma semana:
--
--   * o preco varia por rota, e a tabela do fornecedor mentiu (D-108) —
--     por isso `catalogo_preco` guarda `lido_em` e `fonte`, e existe uma
--     tabela separada, `custo_observado`, para o preco MEDIDO
--   * a cota e de dinheiro, nao de requisicoes (D-119) — por isso todo teto
--     aqui e em centavos, e nao ha coluna de "numero de chamadas"
--   * assinatura cobra sem aparecer no cabecalho de credito (D-32, R-13) —
--     por isso `assinatura` e tabela, e nao uma linha de consumo
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- catalogo_preco — o que o fornecedor DIZ que cobra
--
-- Espelho do arquivo versionado `dados/precos-escavador.json` (Spec §6.1).
-- Preco e dado, nunca literal no codigo: quando o fornecedor muda a tabela,
-- muda-se um arquivo, nao um `if`.
--
-- `classificacao` tem tres valores, e o terceiro e o que importa:
--   cobrada      — mediu-se, e cobra
--   gratuita     — mediu-se, e nao cobra (cabecalho Creditos-Utilizados: 0)
--   desconhecida — ninguem mediu ainda. O chassi trata como CARA (Regra 5)
-- ---------------------------------------------------------------------------
CREATE TABLE catalogo_preco (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor          text NOT NULL CHECK (fornecedor IN ('escavador', 'trello', 'ia')),
  rota                text NOT NULL,
  classificacao       text NOT NULL
                        CHECK (classificacao IN ('cobrada', 'gratuita', 'desconhecida')),
  preco_centavos      integer CHECK (preco_centavos >= 0),
  -- 'chamada' | 'bloco_200' | 'mes' — a unidade muda a conta da reserva.
  unidade             text NOT NULL DEFAULT 'chamada',
  adicional_centavos  integer CHECK (adicional_centavos >= 0),
  lido_em             date NOT NULL,
  fonte               text NOT NULL,

  CONSTRAINT catalogo_rota_por_fornecedor UNIQUE (fornecedor, rota, lido_em),

  -- Rota classificada como cobrada sem preco e uma linha que nao ajuda ninguem.
  CONSTRAINT catalogo_cobrada_tem_preco CHECK (
    classificacao <> 'cobrada' OR preco_centavos IS NOT NULL
  ),
  CONSTRAINT catalogo_gratuita_custa_zero CHECK (
    classificacao <> 'gratuita' OR preco_centavos = 0
  )
);

COMMENT ON COLUMN catalogo_preco.fonte IS
  'De onde veio o numero: painel, suporte, OpenAPI, medicao. Declaracao do fornecedor e indicio, nunca fonte (R-44).';

-- ---------------------------------------------------------------------------
-- custo_observado — o que o fornecedor DE FATO cobrou
--
-- A tabela que existe porque o suporte do Escavador afirmou tarifa plana de
-- R$ 3,00 e a medicao devolveu R$ 0,05, R$ 2,95 e R$ 0,00 no mesmo dia. A
-- estimativa do motor de custo usa esta media movel, e nao o catalogo (D-33).
-- ---------------------------------------------------------------------------
CREATE TABLE custo_observado (
  fornecedor              text NOT NULL CHECK (fornecedor IN ('escavador', 'trello', 'ia')),
  rota                    text NOT NULL,
  media_movel_centavos    numeric(10,2) NOT NULL DEFAULT 0,
  maximo_centavos         integer NOT NULL DEFAULT 0,
  amostras                integer NOT NULL DEFAULT 0 CHECK (amostras >= 0),
  atualizado_em           timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (fornecedor, rota)
);

COMMENT ON COLUMN custo_observado.maximo_centavos IS
  'A reserva usa o MAXIMO, nao a media: reservar pela media subestima justamente quando a chamada e cara (D-72).';

-- ---------------------------------------------------------------------------
-- orcamento — o teto, e quanto dele ja esta comprometido
-- ---------------------------------------------------------------------------
CREATE TABLE orcamento (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id          uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  -- 'inquilino' | 'usuario' | 'processo' | 'fornecedor'
  escopo                text NOT NULL
                          CHECK (escopo IN ('inquilino', 'usuario', 'processo', 'fornecedor')),
  referencia            text NOT NULL,
  -- 'AAAA-MM' para mensal, 'total' para a cota fechada que nao renova
  periodo               text NOT NULL,
  limite_centavos       integer NOT NULL CHECK (limite_centavos >= 0),
  consumido_centavos    integer NOT NULL DEFAULT 0 CHECK (consumido_centavos >= 0),

  -- Sem esta coluna a reserva de §6.2 nao existe: duas chamadas simultaneas
  -- olhariam o mesmo `consumido` e ambas se achariam dentro do teto.
  reservado_centavos    integer NOT NULL DEFAULT 0 CHECK (reservado_centavos >= 0),

  estado                text NOT NULL DEFAULT 'aberto'
                          CHECK (estado IN ('aberto', 'alerta', 'esgotado', 'disjuntor')),
  atualizado_em         timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT orcamento_unico UNIQUE (inquilino_id, escopo, referencia, periodo),

  -- O invariante do motor de custo. Se ele for violado, foi gasto dinheiro que
  -- ninguem autorizou — e o banco recusa a transacao que tentar.
  CONSTRAINT orcamento_nao_estoura CHECK (
    consumido_centavos + reservado_centavos <= limite_centavos
  )
);

COMMENT ON CONSTRAINT orcamento_nao_estoura ON orcamento IS
  'O teto e do banco, nao da aplicacao. Codigo que erra a conta encontra uma recusa, nao um saldo negativo.';

-- ---------------------------------------------------------------------------
-- reserva_orcamento — reserva antes, reconciliacao depois
-- ---------------------------------------------------------------------------
CREATE TABLE reserva_orcamento (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisicao_id        uuid NOT NULL,
  orcamento_id         uuid NOT NULL REFERENCES orcamento(id) ON DELETE RESTRICT,
  rota                 text NOT NULL,
  estimado_centavos    integer NOT NULL CHECK (estimado_centavos >= 0),
  real_centavos        integer CHECK (real_centavos >= 0),
  estado               text NOT NULL DEFAULT 'reservada'
                         CHECK (estado IN ('reservada', 'reconciliada', 'liberada', 'orfa')),
  criada_em            timestamptz NOT NULL DEFAULT now(),
  reconciliada_em      timestamptz,

  CONSTRAINT reserva_reconciliada_tem_real CHECK (
    estado <> 'reconciliada' OR (real_centavos IS NOT NULL AND reconciliada_em IS NOT NULL)
  )
);

-- Reserva presa e dinheiro bloqueado sem chamada correspondente. O varredor
-- periodico procura por aqui.
CREATE INDEX reserva_pendentes ON reserva_orcamento (criada_em)
  WHERE estado = 'reservada';

CREATE INDEX reserva_por_requisicao ON reserva_orcamento (requisicao_id);

-- ---------------------------------------------------------------------------
-- assinatura — o custo que cobra sozinho, todo mes, sem ninguem chamar nada
--
-- Criar um monitoramento no Escavador debitou ZERO no cabecalho de credito, e
-- mesmo assim gerou uma cobranca mensal (D-32). Custo recorrente que nao passa
-- pelo caminho do custo por chamada e invisivel — e invisivel, no pre-pago,
-- significa indefinido (R-13).
--
-- As tres ultimas colunas tratam R-40, a "cegueira por cota": atingida a
-- franquia mensal de aparicoes, o monitoramento PARA DE CAPTURAR sem emitir
-- erro. A assinatura segue ativa, paga e saudavel no inventario, e o escritorio
-- simplesmente deixa de ver publicacao. E o quarto modo de falha silenciosa da
-- vigilancia, e o unico que so se detecta contando.
-- ---------------------------------------------------------------------------
CREATE TABLE assinatura (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id            uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  fornecedor              text NOT NULL CHECK (fornecedor IN ('escavador', 'trello')),
  tipo                    text NOT NULL,
  identificador_externo   text NOT NULL,
  alvo                    text NOT NULL,
  frequencia              text NOT NULL DEFAULT 'mensal'
                            CHECK (frequencia IN ('mensal', 'anual')),
  custo_mensal_centavos   integer NOT NULL DEFAULT 0 CHECK (custo_mensal_centavos >= 0),
  criado_por              uuid REFERENCES usuario(id) ON DELETE RESTRICT,
  criado_em               timestamptz NOT NULL DEFAULT now(),
  estado                  text NOT NULL DEFAULT 'ativa'
                            CHECK (estado IN ('ativa', 'removida', 'suspensa')),
  removido_em             timestamptz,
  removido_por            uuid REFERENCES usuario(id) ON DELETE RESTRICT,

  -- 'teste' | 'producao'. Assinatura de teste tem data para morrer, e o
  -- inventario precisa saber distinguir uma da outra sem consultar ninguem.
  ambiente                text NOT NULL DEFAULT 'producao'
                            CHECK (ambiente IN ('teste', 'producao')),
  proxima_renovacao       date,

  -- ⚠️ R-40 — lidas da RESPOSTA da criacao, nunca supostas. A documentacao do
  -- Escavador diz 200/mes; a criacao real devolveu 1000. O chassi le o teto
  -- que veio, e alarma a 70% dele (D-107).
  franquia_mensal         integer CHECK (franquia_mensal IS NULL OR franquia_mensal > 0),
  aparicoes_no_ciclo      integer NOT NULL DEFAULT 0 CHECK (aparicoes_no_ciclo >= 0),
  ciclo_reiniciado_em     date,

  CONSTRAINT assinatura_externa_unica UNIQUE (fornecedor, identificador_externo),

  CONSTRAINT assinatura_removida_tem_data CHECK (
    (estado = 'removida') = (removido_em IS NOT NULL)
  )
);

-- O inventario que R-41 pede: o que esta cobrando agora, e por quanto.
CREATE INDEX assinatura_ativas ON assinatura (fornecedor, proxima_renovacao)
  WHERE estado = 'ativa';

COMMENT ON COLUMN assinatura.franquia_mensal IS
  'Lida da resposta do fornecedor (D-107). Documentacao dizia 200; a medicao devolveu 1000. Supor aqui e cegar depois.';
