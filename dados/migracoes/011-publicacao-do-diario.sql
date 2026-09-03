-- ==========================================================================
-- 011 — A publicacao de diario oficial, como ela de fato chega
--
-- A tabela `publicacao` foi desenhada na migracao 006 a partir do OpenAPI,
-- antes de qualquer entrega real. Em 02/09 mediu-se o contrato em 30 entregas
-- de callback (docs/15-contrato-da-aparicao.md), e tres coisas apareceram que
-- o desenho no papel nao tinha como prever.
--
-- Esta migracao acrescenta o que faltou. Ela NAO reescreve o que existia:
-- `hash`, `teor` e `data_publicacao` continuam como estavam.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- 1. `id_externo` — a chave natural da publicacao (D-178)
--
-- O `uuid` que vem no envelope da entrega identifica A ENTREGA, nao a
-- publicacao: o Bloco C ja tinha medido que ele nao serve como chave de
-- idempotencia (06-orcamento... §5.6). Quem identifica a publicacao do lado do
-- fornecedor e `movimentacao.id`.
--
-- O `hash` do conteudo continua existindo e nao e redundante: ele pega o caso
-- em que o MESMO texto chega por outra fonte, sem id externo nenhum — por
-- exemplo de um PDF importado. Sao duas perguntas diferentes:
--   · id_externo: "esta publicacao ja chegou deste fornecedor?"
--   · hash      : "este teor ja esta na base, viesse de onde viesse?"
-- ---------------------------------------------------------------------------
ALTER TABLE publicacao ADD COLUMN id_externo text;

CREATE UNIQUE INDEX publicacao_id_externo_unico
  ON publicacao (inquilino_id, fonte, id_externo)
  WHERE id_externo IS NOT NULL;

COMMENT ON COLUMN publicacao.id_externo IS
  'Identidade da publicacao no fornecedor (movimentacao.id no Escavador). NUNCA o uuid da entrega, que muda a cada reentrega (D-116, D-178).';

-- ---------------------------------------------------------------------------
-- 2. `data_disponibilizacao` — separada da publicacao, DE PROPOSITO (D-179)
--
-- ⚠️ ESTA COLUNA EXISTE POR CAUSA DE UM PERIGO, NAO DE UM REQUISITO.
--
-- Nas 30 entregas medidas, `data_disponibilizacao` e `data_publicacao` vieram
-- SEMPRE IGUAIS. Seria natural concluir que uma coluna basta.
--
-- Seria errado. A igualdade e observacao sobre DOIS tribunais em CINCO dias,
-- nao contrato. No processo civil os conceitos se separam: publica-se no dia
-- util seguinte ao da disponibilizacao, e o prazo comeca do dia util seguinte
-- ao da publicacao. Tribunal que separe os dois produz evento em que os campos
-- diferem.
--
-- Guardar uma so, ou derivar uma da outra, erraria por UM DIA UTIL — que e
-- exatamente a margem que decide se um prazo foi cumprido, e o PRD chama a
-- perda de prazo de pior cenario possivel do projeto.
--
-- Fica NULL quando a fonte nao informa. NULL aqui significa "a fonte nao
-- disse", nunca "e igual a publicacao" — e nenhum calculo deve preencher a
-- lacuna por conta propria.
-- ---------------------------------------------------------------------------
ALTER TABLE publicacao ADD COLUMN data_disponibilizacao date;

COMMENT ON COLUMN publicacao.data_disponibilizacao IS
  'Data de disponibilizacao no diario. DISTINTA de data_publicacao mesmo quando as duas coincidem (D-179, R-56). NULL = a fonte nao informou; nunca "igual a publicacao".';

-- ---------------------------------------------------------------------------
-- 3. Onde a publicacao esta, para quem for conferir na fonte
--
-- Nao e enfeite: toda decisao de prazo que a plataforma sugerir vai ser
-- revisada por gente, e quem revisa precisa chegar ao caderno oficial sem
-- depender de a nossa copia estar certa.
-- ---------------------------------------------------------------------------
ALTER TABLE publicacao ADD COLUMN tipo text;
ALTER TABLE publicacao ADD COLUMN pagina integer;
ALTER TABLE publicacao ADD COLUMN link_fonte text;

COMMENT ON COLUMN publicacao.tipo IS
  'Como a fonte classificou o ato. VOCABULARIO ABERTO: nas 30 amostras vieram "Intimacao" (26) e duas classes processuais ("PROCEDIMENTO COMUM CIVEL"), misturando tipo de ato com classe de processo. Nao usar em CHECK nem em regra de negocio sem normalizar antes (D-180).';

-- ---------------------------------------------------------------------------
-- 4. `publicacao_envolvido` — quem aparece na publicacao
--
-- Existe por causa da D-145: o alerta de indicio de prazo vai para colaborador
-- E advogado, e so o "Ciente" de um advogado encerra a escalada. Para rotear o
-- alerta e preciso saber QUAL advogado esta na publicacao — e a OAB chegou
-- preenchida em 52 ocorrencias das 30 entregas.
--
-- ⚠️ `tipo_normalizado` e coluna SEPARADA de `tipo_na_fonte`, e essa separacao
-- e a D-180 virando esquema.
--
-- Ha TRES vocabularios para o mesmo conceito, um por fonte:
--   importador de PDF          RECLAMANTE / RECLAMADO       (D-135)
--   API V2 /envolvidos         Autor / Reu / null           (D-132)
--   callback de diario         Polo Ativo / Polo Passivo / Advogado
--
-- A D-132 concluiu, do Bloco E, que "nao ha tabela de traducao a construir".
-- Aquilo vale DENTRO da V2, entre ramos da Justica. Entre FONTES e falso — e o
-- eixo da traducao e a fonte, nao o tribunal.
--
-- Guardar so o normalizado perderia a evidencia do que a fonte disse, que e o
-- que permite corrigir a traducao depois sem reprocessar tudo. Guardar so o
-- cru empurraria a traducao para dentro de cada consulta.
--
-- E `papel` e coluna a parte porque o diario classifica ADVOGADO como um tipo
-- de envolvido (48 das 100 ocorrencias), enquanto a V2 separa parte de
-- advogado. Achatar os dois num campo so perderia a distincao.
-- ---------------------------------------------------------------------------
CREATE TABLE publicacao_envolvido (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquilino_id        uuid NOT NULL REFERENCES inquilino(id) ON DELETE RESTRICT,
  publicacao_id       uuid NOT NULL,

  nome                text NOT NULL,

  -- 'parte' ou 'advogado'. Fechado, porque esta distincao existe em todas as
  -- fontes conhecidas e nao depende do vocabulario de nenhuma.
  papel               text NOT NULL CHECK (papel IN ('parte', 'advogado')),

  -- O que a FONTE escreveu, sem traducao. Evidencia.
  tipo_na_fonte       text,

  -- O que a traducao concluiu. NULL quando nao se sabe traduzir — e NULL aqui
  -- significa "nao sei", que e informacao, e nao "nenhum dos dois".
  tipo_normalizado    text CHECK (tipo_normalizado IN ('ativo', 'passivo', 'terceiro')),

  numero_oab          text,

  CONSTRAINT publicacao_envolvido_da_publicacao_do_mesmo_inquilino
    FOREIGN KEY (inquilino_id, publicacao_id) REFERENCES publicacao (inquilino_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX publicacao_envolvido_por_publicacao ON publicacao_envolvido (publicacao_id);
CREATE INDEX publicacao_envolvido_por_oab ON publicacao_envolvido (inquilino_id, numero_oab)
  WHERE numero_oab IS NOT NULL;

COMMENT ON TABLE publicacao_envolvido IS
  'Partes e advogados de uma publicacao. Guarda o tipo CRU da fonte e o NORMALIZADO lado a lado: sao tres vocabularios, um por fonte (D-180).';

-- ---------------------------------------------------------------------------
-- 5. Permissoes — o mesmo desenho de sempre (migracao 007)
--
-- lex_app le e insere. NAO altera e NAO apaga: publicacao recebida e fato
-- ocorrido, e fato ocorrido nao se edita. Correcao vira nova linha.
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT ON publicacao_envolvido TO lex_app;
REVOKE UPDATE, DELETE, TRUNCATE ON publicacao_envolvido FROM lex_app;

-- Politica por linha, no padrao EXATO da migracao 010.
--
-- Sem `FORCE ROW LEVEL SECURITY`, e isso e deliberado la e aqui: forcar
-- aplicaria a politica tambem ao dono da tabela, que e quem roda as migracoes —
-- e a proxima migracao que precisasse tocar dado existente falharia do pior
-- jeito, com zero linhas afetadas e nenhum erro.
--
-- `inquilino_corrente()` em vez de `current_setting` cru: a funcao da migracao
-- 010 converte string vazia em NULO, e nulo nao enxerga linha nenhuma. Escrever
-- a expressao a mao aqui reintroduziria a diferenca que ela existe para apagar.
ALTER TABLE publicacao_envolvido ENABLE ROW LEVEL SECURITY;

CREATE POLICY publicacao_envolvido_do_inquilino ON publicacao_envolvido
  FOR ALL
  USING (inquilino_id = inquilino_corrente())
  WITH CHECK (inquilino_id = inquilino_corrente());
