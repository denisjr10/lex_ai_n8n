-- ==========================================================================
-- 013 — Teor repetido NAO e duplicata
--
-- Remove `publicacao_hash_unico`, que descartava publicacao legitima em
-- silencio. O defeito foi desenhado no papel na migracao 006 e so apareceu em
-- 02/09, na primeira vez que dado real entrou na tabela.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- ⚠️ O QUE ACONTECEU, MEDIDO
--
-- 30 publicacoes reais de diario entraram. Sairam 21. A restricao
-- `UNIQUE (inquilino_id, hash)` — hash do teor — engoliu nove, assim:
--
--   7 ocorrencias do MESMO texto de 123 caracteres, em SETE PROCESSOS
--     DIFERENTES, em quatro datas. Texto curto de intimacao padrao, do tipo
--     que o tribunal publica identico para todo mundo.
--     => guardou UMA e descartou SEIS intimacoes de SEIS casos distintos
--
--   2 ocorrencias do mesmo teor no mesmo processo, em 31/08 e 01/09
--   3 ocorrencias do mesmo teor no mesmo processo, em 31/08, 01/09 e 02/09
--     => republicacao em edicoes seguintes, que e coisa que tribunal faz
--
-- O primeiro caso e o grave, e a gravidade e a do pior cenario do projeto:
-- **seis intimacoes sumiram sem erro nenhum**. `ON CONFLICT DO NOTHING` nao
-- levanta excecao — a linha simplesmente nao entra, o contador nao acusa, e o
-- prazo daqueles seis processos nunca chega a existir na base.
--
-- A suposicao errada era plausivel no papel: "duas publicacoes com o mesmo
-- texto sao a mesma publicacao". Contra o dado real ela e falsa duas vezes.
-- Tribunal publica formula padrao identica para processos diferentes, e
-- republica o mesmo ato em edicoes seguintes.
-- ---------------------------------------------------------------------------
ALTER TABLE publicacao DROP CONSTRAINT publicacao_hash_unico;

-- ---------------------------------------------------------------------------
-- O `hash` continua, e continua util — deixa de ser RESTRICAO e vira PERGUNTA.
--
-- Ele responde "este teor ja esta na base, viesse de onde viesse?", que e o que
-- serve para reconciliar publicacao vinda da API com a mesma vinda de um PDF
-- importado. So que essa e uma pergunta a se fazer, com resposta a se avaliar —
-- nunca uma porta que se fecha sozinha.
--
-- A diferenca pratica: como INDICE, teor repetido aparece numa consulta e
-- alguem decide. Como RESTRICAO, ele desaparecia e ninguem ficava sabendo.
-- ---------------------------------------------------------------------------
CREATE INDEX publicacao_por_hash ON publicacao (inquilino_id, hash);

COMMENT ON COLUMN publicacao.hash IS
  'Resumo do teor. NAO e unico, e ja foi: em 30 publicacoes reais, sete processos DIFERENTES trouxeram o mesmo texto de intimacao padrao, e a restricao antiga descartou seis em silencio (migracao 013). Serve para PERGUNTAR se um teor ja existe, nunca para impedir que ele entre.';

-- ---------------------------------------------------------------------------
-- Quem impede duplicata de verdade e o `id_externo`, da migracao 011
--
--   `publicacao_id_externo_unico (inquilino_id, fonte, id_externo)`
--
-- `movimentacao.id` do Escavador foi distinto nas 30 amostras, inclusive nas
-- nove que o hash confundiu — porque sao publicacoes distintas mesmo, e o
-- fornecedor sabe disso melhor do que o nosso resumo de texto.
--
-- Publicacao sem `id_externo` (a importada de PDF, por exemplo) fica sem
-- barreira automatica. E o certo: ali nao ha identidade do fornecedor para
-- confiar, e inventar uma a partir do texto e o erro que esta migracao desfaz.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- A mesma suposicao esta em `movimentacao`, e cai pelo mesmo motivo
--
-- `movimentacao_hash_unico (inquilino_id, hash)`, da migracao 006. Nenhuma
-- linha real entrou nessa tabela ainda, entao nao ha perda a lamentar — mas o
-- defeito e identico, e andamento de processo tem MUITO mais texto padronizado
-- que publicacao de diario ("Conclusos para despacho", "Certifico que...").
--
-- Corrigir agora, enquanto esta vazia, e mais barato que descobrir depois.
-- ---------------------------------------------------------------------------
ALTER TABLE movimentacao DROP CONSTRAINT movimentacao_hash_unico;
CREATE INDEX movimentacao_por_hash ON movimentacao (inquilino_id, hash);

COMMENT ON COLUMN movimentacao.hash IS
  'Resumo do teor. NAO e unico, pelo mesmo motivo de publicacao.hash (migracao 013): andamento padronizado se repete entre processos.';
