-- ==========================================================================
-- 014 — Isolamento de `identidade_externa` e `reserva_orcamento`
--
-- As duas ultimas tabelas de dado de cliente que ficavam FORA da politica por
-- linha entram nela. A migracao 010 as deixou de fora com um argumento que
-- parecia bom e nao era (D-239).
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- ⚠️ O ARGUMENTO QUE CAIU, E POR QUE ELE ENGANA
--
-- A migracao 010 escreveu, ao listar quem ficava de fora:
--
--   "identidade_externa e reserva_orcamento — penduradas num pai unico, entao
--    o escritorio delas E o do pai, e nao ha o que divergir"
--
-- A primeira metade e verdadeira e a conclusao nao segue dela. "Nao ha o que
-- divergir" e uma afirmacao sobre INTEGRIDADE: a linha nao pode apontar para o
-- escritorio errado, porque o pai define qual e. Certo.
--
-- So que politica por linha nao existe para garantir integridade. Ela existe
-- para garantir CONFIDENCIALIDADE — que uma consulta nao ENXERGUE linha de
-- outro escritorio. E para nao enxergar, a consulta precisa do `JOIN` com o
-- pai. Um `SELECT * FROM identidade_externa WHERE identificador_externo = $1`
-- sem `JOIN` devolve a linha de qualquer inquilino, hoje, sem erro nenhum.
--
-- A confusao entre as duas coisas nao e obvia, e e exatamente por isso que ela
-- vai se repetir na proxima tabela pendurada num pai unico. Fica escrita aqui.
--
-- Custo de fazer agora: nenhum codigo de producao consulta estas duas tabelas
-- — so as provas de regra. Custo de fazer depois: toda consulta ja escrita.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. identidade_externa ganha o escritorio
-- ---------------------------------------------------------------------------

ALTER TABLE identidade_externa ADD COLUMN inquilino_id uuid;

-- Preenche a partir do pai. E o mesmo valor que o `JOIN` daria — a diferenca e
-- que agora ele esta na linha, e a politica alcanca.
UPDATE identidade_externa i
   SET inquilino_id = u.inquilino_id
  FROM usuario u
 WHERE u.id = i.usuario_id;

ALTER TABLE identidade_externa ALTER COLUMN inquilino_id SET NOT NULL;

ALTER TABLE identidade_externa
  ADD CONSTRAINT identidade_externa_inquilino_id_fkey
  FOREIGN KEY (inquilino_id) REFERENCES inquilino(id) ON DELETE RESTRICT;

-- A referencia COMPOSTA, no padrao da migracao 009: a identidade so pode
-- apontar para um usuario do MESMO escritorio. Sem ela, `inquilino_id` seria
-- um campo que alguem preenche — com ela, e um campo que o banco confere.
ALTER TABLE identidade_externa
  ADD CONSTRAINT identidade_externa_usuario_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, usuario_id) REFERENCES usuario (inquilino_id, id);

ALTER TABLE identidade_externa
  ADD CONSTRAINT identidade_externa_inquilino_id_key UNIQUE (inquilino_id, id);

CREATE INDEX identidade_externa_por_inquilino ON identidade_externa (inquilino_id);

-- ---------------------------------------------------------------------------
-- 🔴 O INDICE QUE **NAO** VIRA COMPOSTO, E ISSO E O PONTO DELE
--
-- `identidade_externa_uma_por_provedor` e UNIQUE (provedor,
-- identificador_externo) WHERE revogada_em IS NULL, e continua **global** —
-- deliberadamente fora do escopo do inquilino.
--
-- Torna-lo composto seria o movimento automatico desta migracao, e destruiria
-- a Regra Inegociavel 7. Com `UNIQUE (inquilino_id, provedor,
-- identificador_externo)`, o MESMO numero de WhatsApp poderia ser cadastrado
-- como pessoa diferente em dois escritorios, em silencio — que e precisamente
-- a conta compartilhada que a tabela existe para tornar impossivel (R-11).
--
-- O escopo do isolamento e a LEITURA; o escopo da unicidade da identidade e o
-- sistema inteiro. Sao perguntas diferentes e as respostas nao coincidem.
-- ---------------------------------------------------------------------------

COMMENT ON INDEX identidade_externa_uma_por_provedor IS
  'Regra 7 / R-11: conta compartilhada nao passa em silencio. GLOBAL de proposito — a unicidade da identidade vale no sistema inteiro, nao por escritorio (D-239, migracao 014).';

-- ---------------------------------------------------------------------------
-- 2. reserva_orcamento ganha o escritorio
-- ---------------------------------------------------------------------------

-- O par precisa ser referenciavel, e `orcamento` ainda nao tinha o UNIQUE que
-- a migracao 009 deu as outras tabelas.
ALTER TABLE orcamento
  ADD CONSTRAINT orcamento_inquilino_id_key UNIQUE (inquilino_id, id);

ALTER TABLE reserva_orcamento ADD COLUMN inquilino_id uuid;

UPDATE reserva_orcamento r
   SET inquilino_id = o.inquilino_id
  FROM orcamento o
 WHERE o.id = r.orcamento_id;

ALTER TABLE reserva_orcamento ALTER COLUMN inquilino_id SET NOT NULL;

ALTER TABLE reserva_orcamento
  ADD CONSTRAINT reserva_orcamento_inquilino_id_fkey
  FOREIGN KEY (inquilino_id) REFERENCES inquilino(id) ON DELETE RESTRICT;

ALTER TABLE reserva_orcamento
  ADD CONSTRAINT reserva_orcamento_orcamento_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, orcamento_id) REFERENCES orcamento (inquilino_id, id);

CREATE INDEX reserva_orcamento_por_inquilino ON reserva_orcamento (inquilino_id);

-- ---------------------------------------------------------------------------
-- 3. As politicas, iguais as da migracao 010
--
-- Sem `FORCE ROW LEVEL SECURITY`, pelo mesmo motivo escrito la: forcar
-- aplicaria a politica ao dono, que e quem roda as migracoes, e a proxima
-- migracao que tocasse dado existente falharia em silencio — zero linhas
-- afetadas, nenhum erro.
-- ---------------------------------------------------------------------------

ALTER TABLE identidade_externa ENABLE ROW LEVEL SECURITY;
CREATE POLICY identidade_externa_do_inquilino ON identidade_externa
  FOR ALL
  USING (inquilino_id = inquilino_corrente())
  WITH CHECK (inquilino_id = inquilino_corrente());

ALTER TABLE reserva_orcamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY reserva_orcamento_do_inquilino ON reserva_orcamento
  FOR ALL
  USING (inquilino_id = inquilino_corrente())
  WITH CHECK (inquilino_id = inquilino_corrente());

-- ---------------------------------------------------------------------------
-- 4. A PORTA UNICA DO LOGIN
--
-- Isolar `identidade_externa` cria um problema real, e ele precisa de resposta
-- explicita: o login acontece ANTES de o escritorio ser conhecido. Chega um id
-- de Telegram e a pergunta e "de quem e isto, e de que escritorio?". Com a
-- politica ligada, uma conexao sem `lex.inquilino_id` declarado nao enxerga
-- linha nenhuma — e nao ha o que declarar ainda.
--
-- A saida NAO e deixar a tabela aberta. E abrir uma porta unica, nomeada, com
-- assinatura estreita e auditavel:
--
--   * `SECURITY DEFINER` — roda como o dono da tabela, para quem a politica nao
--     se aplica (a migracao 010 nao usa FORCE). E o unico caminho global.
--   * Devolve **so os dois identificadores** necessarios para o passo seguinte:
--     qual escritorio declarar, e qual usuario. Nao devolve nome, papel, nem
--     nada que sirva para outra coisa. Uma porta larga demais deixaria de ser
--     porta.
--   * `search_path` fixo — sem isso, quem controlasse o `search_path` da sessao
--     poderia fazer a funcao chamar outra tabela com o mesmo nome, e ela
--     rodaria com privilegio de dono.
--   * Revogada de PUBLIC. No PostgreSQL, funcao nova nasce executavel por
--     todos; numa funcao `SECURITY DEFINER` isso e a diferenca entre uma porta
--     e um buraco.
--
-- Filtra usuario inativo de proposito: identificador de pessoa desligada
-- devolve vazio, indistinguivel de identificador desconhecido. Quem foi
-- desligado nao descobre que o cadastro dele ainda existe.
-- ---------------------------------------------------------------------------

CREATE FUNCTION identidade_para_login(
  p_provedor              text,
  p_identificador_externo text
)
RETURNS TABLE (inquilino_id uuid, usuario_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT i.inquilino_id, i.usuario_id
    FROM identidade_externa i
    JOIN usuario u ON u.id = i.usuario_id
   WHERE i.provedor = p_provedor
     AND i.identificador_externo = p_identificador_externo
     AND i.revogada_em IS NULL
     AND u.status = 'ativo'
$$;

REVOKE ALL ON FUNCTION identidade_para_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identidade_para_login(text, text) TO lex_app;

COMMENT ON FUNCTION identidade_para_login(text, text) IS
  'A UNICA leitura global de identidade_externa (D-239). Devolve so inquilino_id e usuario_id, para a conexao poder declarar lex.inquilino_id e seguir sob a politica. Identidade revogada ou usuario inativo devolvem vazio, indistinguivel de desconhecido.';

-- ---------------------------------------------------------------------------
-- 5. O comentario da 010, agora que ele pode dizer a verdade
-- ---------------------------------------------------------------------------

COMMENT ON TABLE identidade_externa IS
  'Sob politica por linha desde a migracao 014. O caminho global existe em UMA funcao — identidade_para_login —, nomeada e auditavel, em vez de na tabela inteira. O indice de unicidade continua GLOBAL: a Regra 7 vale no sistema, nao por escritorio.';

COMMENT ON TABLE reserva_orcamento IS
  'Sob politica por linha desde a migracao 014. Antes dependia do JOIN com orcamento para nao vazar entre escritorios, e JOIN esquecido nao da erro.';
