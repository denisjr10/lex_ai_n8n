-- ==========================================================================
-- 015 — Registro de truncagem no evento de callback
--
-- Conteudo externo e hostil (Regra 4), e ate agora ele entrava sem teto: teor
-- sem limite, nome de envolvido sem limite, quantidade de envolvidos sem
-- limite, e a funcao que estabiliza o JSON para a chave de idempotencia era
-- recursiva sem limite de profundidade (D-241).
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- ⚠️ POR QUE UMA COLUNA NOVA, E NAO UM ESTADO NOVO
--
-- A recomendacao da revisao era gravar o evento com `estado = 'truncado'`. Isso
-- nao funciona, e o motivo importa mais que o detalhe.
--
-- `estado` e o CICLO DE VIDA do evento: 'recebido' -> 'processado', com
-- 'ignorado' e 'erro' nas pontas. Quem procura trabalho a fazer consulta o
-- indice `evento_callback_nao_processados`, que e WHERE estado = 'recebido'.
--
-- Um evento marcado 'truncado' sairia desse indice e **nunca seria
-- processado**. O remedio contra o descarte em silencio viraria uma forma nova
-- de descarte em silencio — com nome melhor, e igualmente invisivel. Seria
-- repetir, pela outra ponta, o defeito que a migracao 013 consertou.
--
-- Truncagem nao e um estado do ciclo de vida: e um FATO SOBRE O CONTEUDO. Vive
-- em coluna propria, e o evento segue 'recebido' e segue sendo processado.
-- ---------------------------------------------------------------------------

ALTER TABLE evento_callback ADD COLUMN truncagem jsonb;

-- ---------------------------------------------------------------------------
-- Por que jsonb, e nao um booleano
--
-- Um booleano diz que algo foi cortado e obriga quem for investigar a abrir o
-- payload cru para descobrir o que. O objeto diz O QUE estourou e POR QUANTO —
-- `{"teor_bytes": 250000, "envolvidos": 431}` —, que e a diferenca entre um
-- alerta acionavel e um alerta que gera trabalho manual.
--
-- E o numero medido serve para calibrar o teto depois. Teto escolhido no papel
-- que nunca se compara com a realidade e chute com aparencia de decisao.
-- ---------------------------------------------------------------------------

COMMENT ON COLUMN evento_callback.truncagem IS
  'NULO quando nada foi cortado. Objeto com o que estourou e o valor medido quando foi: teor_bytes, nome_caracteres, envolvidos, profundidade. O evento segue no ciclo normal — truncagem e fato sobre o conteudo, nao estado de processamento (D-241).';

-- Quem estourou teto e a fila de investigacao: entrega grande demais pode ser
-- fonte mudando de formato, pode ser defeito nosso de leitura, e pode ser
-- alguem sondando o limite. Indice parcial porque o caso normal e NULO.
CREATE INDEX evento_callback_truncados
  ON evento_callback (recebido_em DESC)
  WHERE truncagem IS NOT NULL;
