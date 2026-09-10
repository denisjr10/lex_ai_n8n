-- ==========================================================================
-- 016 — Quem conferiu a origem do callback
--
-- `origem_valida` dizia SE a origem conferiu, e nunca dizia QUEM conferiu. Até
-- 10/09 a resposta era sempre a mesma e estava só na cabeca de quem escreveu o
-- codigo: um no do n8n (D-241 vizinha; item 2.6 da revisao de 09/09).
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- ⚠️ O PROBLEMA, E ELE NAO E DE ESQUEMA
--
-- A Spec §8.1 lista "Validar a origem" como a ETAPA 1 do receptor, com "falha
-- fecha" escrito ao lado. O receptor de verdade nao valida nada: ele RECEBE um
-- booleano ja decidido por um no do n8n chamado "Conferir e carimbar", e
-- acredita.
--
-- Duas consequencias, e a segunda e pior que a primeira:
--
--   1. O veredito trafega pelo historico de execucao do n8n — do qual 98,5%
--      dos registros ja sumiram, medido em 02/09. A prova da conferencia e
--      mais efemera que o fato conferido.
--
--   2. Quem chama `gravarEntrega` DECIDE se a origem era valida. E o mesmo
--      formato do problema que a D-237 tratou no chassi: o objeto de decisao
--      chega pronto de fora, e quem chama define a propria autorizacao.
--
-- A correcao definitiva e o endpoint proprio (marco 8), em que o receptor
-- recebe a requisicao HTTP e confere o segredo ele mesmo. Enquanto isso nao
-- existe, o servico passa a reconferir a partir dos cabecalhos carimbados — e
-- esta coluna registra qual dos dois caminhos decidiu cada linha.
-- ---------------------------------------------------------------------------

ALTER TABLE evento_callback ADD COLUMN origem_conferida_por text;

-- As linhas que ja estao na tabela vieram todas do carimbo do n8n. Escrever
-- 'servico' nelas seria mais limpo e seria falso.
UPDATE evento_callback SET origem_conferida_por = 'n8n' WHERE origem_conferida_por IS NULL;

ALTER TABLE evento_callback ALTER COLUMN origem_conferida_por SET NOT NULL;

ALTER TABLE evento_callback
  ADD CONSTRAINT evento_callback_origem_conferida_por_check
  CHECK (origem_conferida_por IN ('servico', 'n8n', 'ninguem'));

COMMENT ON COLUMN evento_callback.origem_conferida_por IS
  'Quem produziu o veredito de origem_valida: servico (o receptor conferiu o segredo nos cabecalhos), n8n (veredito recebido pronto, arranjo provisorio ate o marco 8) ou ninguem (nao havia como conferir — e nesse caso origem_valida e falso, por Regra 5).';

-- Entrega que ninguem conseguiu conferir e fila de investigacao: ou falta
-- configuracao, ou os cabecalhos nao chegaram, ou alguem esta batendo na porta
-- por um caminho que nao carimba nada. Indice parcial porque o caso normal
-- deixa de ser esse assim que o segredo estiver configurado.
CREATE INDEX evento_callback_sem_conferencia
  ON evento_callback (recebido_em DESC)
  WHERE origem_conferida_por = 'ninguem';
