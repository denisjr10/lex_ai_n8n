-- ==========================================================================
-- 012 — A idempotencia de callback passa a ser por escritorio
--
-- Fecha o achado 13 da revisao externa de 28/08: "indice unico de callback sem
-- inquilino_id".
--
-- A migracao 009 compos as chaves das outras tabelas por inquilino e passou por
-- esta. A 010 ligou politica por linha em `evento_callback`. As duas juntas
-- deixaram uma combinacao que so faz mal quando o segundo escritorio chegar —
-- e que, quando fizer, fara em silencio.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- ⚠️ POR QUE ISTO E PIOR DO QUE UM INDICE MAL DIMENSIONADO
--
-- `evento_callback_chave_unica (fornecedor, chave_evento)` e GLOBAL. A chave e
-- o resumo do conteudo, entao dois escritorios que monitoram o MESMO processo
-- — coisa banal: dois escritorios em polos opostos da mesma acao — recebem
-- entregas com conteudo identico e produzem a mesma `chave_evento`.
--
-- Com a politica por linha ligada, o segundo INSERT colide com uma linha que a
-- conexao NAO CONSEGUE ENXERGAR. O resultado nao e uma mensagem util: e um
-- `ON CONFLICT DO UPDATE` que tenta alterar linha invisivel e falha por
-- politica, ou um `DO NOTHING` que conclui "ja processei" sobre um evento que
-- aquele escritorio nunca recebeu.
--
-- O segundo caso e o perigoso. Ele nao levanta erro nenhum: **a publicacao
-- simplesmente nao entra na base do segundo escritorio**, e ninguem descobre
-- ate faltar um prazo.
--
-- Hoje ha um inquilino so e nada disso acontece. E exatamente por isso que se
-- conserta agora: o defeito e inerte, o conserto e barato, e o dia em que ele
-- deixar de ser inerte e o dia da migracao de um cliente novo, que ja tem
-- problemas suficientes.
-- ---------------------------------------------------------------------------
DROP INDEX evento_callback_chave_unica;

CREATE UNIQUE INDEX evento_callback_chave_unica
  ON evento_callback (inquilino_id, fornecedor, chave_evento);

COMMENT ON INDEX evento_callback_chave_unica IS
  'Idempotencia POR ESCRITORIO. A chave e resumo de conteudo, e dois escritorios no mesmo processo produzem a mesma chave — sem o inquilino, o segundo perderia a entrega em silencio (achado 13 da revisao de 28/08).';
