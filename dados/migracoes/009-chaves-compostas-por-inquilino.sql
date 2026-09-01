-- ==========================================================================
-- 009 — Chaves compostas: o banco deixa de aceitar referencia entre escritorios
--
-- O PROBLEMA, EM UMA FRASE: `vinculo_canal_cliente.cliente_id REFERENCES
-- cliente(id)` garante que aquele cliente EXISTE, nao que ele seja do mesmo
-- escritorio do vinculo. Trinta referencias tinham essa forma, e todas
-- aceitavam uma linha do escritorio A apontando para uma linha do escritorio B.
--
-- Hoje isso nao acontece porque ha um inquilino so. Continuar assim seria
-- apostar que nenhum erro de codigo vai cruzar os dois — e a aposta so precisa
-- ser perdida uma vez para virar dado de um cliente aparecendo na tela de
-- outro escritorio. A Regra 1 diz que privilegio se aplica em codigo
-- verificado; aqui o codigo e o catalogo do PostgreSQL, que nenhum bug de
-- aplicacao convence.
--
-- A FORMA: cada tabela referenciada ganha UNIQUE (inquilino_id, id), e cada
-- referencia passa a apontar para o PAR. A partir daqui, gravar uma linha cujo
-- pai e de outro escritorio nao e um bug com consequencia — e um INSERT que
-- falha.
--
-- COLUNA OPCIONAL CONTINUA OPCIONAL. `removido_por`, `lido_por` e
-- `desativado_por` podem ser nulos, e com MATCH SIMPLE (o padrao) uma chave
-- composta com qualquer parte nula nao e conferida. E o comportamento certo:
-- "ninguem removeu ainda" nao deve exigir um usuario que nao existe.
--
-- ESTA MIGRACAO NAO IMPEDE LEITURA CRUZADA. Ela impede ESCRITA inconsistente.
-- Quem impede leitura e a politica por linha, na 010 — e as duas sao
-- necessarias, porque a conferencia de chave estrangeira roda como dona da
-- tabela e passa por cima de politica por linha.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- 1. O alvo das referencias: o par (inquilino_id, id)
--
-- `id` continua sendo a chave primaria — nada muda para quem ja consulta por
-- id. O UNIQUE novo existe para que o par possa ser referenciado.
-- ---------------------------------------------------------------------------
ALTER TABLE aprovacao ADD CONSTRAINT aprovacao_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE assinatura ADD CONSTRAINT assinatura_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE cliente ADD CONSTRAINT cliente_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE evento_auditoria ADD CONSTRAINT evento_auditoria_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE evento_callback ADD CONSTRAINT evento_callback_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE movimentacao ADD CONSTRAINT movimentacao_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE processo ADD CONSTRAINT processo_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE publicacao ADD CONSTRAINT publicacao_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE sessao ADD CONSTRAINT sessao_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE tarefa_assincrona ADD CONSTRAINT tarefa_assincrona_inquilino_id_key UNIQUE (inquilino_id, id);
ALTER TABLE usuario ADD CONSTRAINT usuario_inquilino_id_key UNIQUE (inquilino_id, id);

-- ---------------------------------------------------------------------------
-- 2. As referencias, uma a uma
--
-- Geradas a partir do catalogo do proprio banco, e nao escritas a mao: sao
-- trinta, todas com a mesma forma, e uma lista escrita a mao com trinta itens
-- iguais e uma lista com um erro de digitacao em algum lugar.
-- ---------------------------------------------------------------------------

-- alerta
ALTER TABLE alerta DROP CONSTRAINT alerta_lido_por_fkey;
ALTER TABLE alerta ADD CONSTRAINT alerta_lido_por_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, lido_por) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE alerta DROP CONSTRAINT alerta_movimentacao_id_fkey;
ALTER TABLE alerta ADD CONSTRAINT alerta_movimentacao_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, movimentacao_id) REFERENCES movimentacao (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE alerta DROP CONSTRAINT alerta_processo_id_fkey;
ALTER TABLE alerta ADD CONSTRAINT alerta_processo_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, processo_id) REFERENCES processo (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE alerta DROP CONSTRAINT alerta_publicacao_id_fkey;
ALTER TABLE alerta ADD CONSTRAINT alerta_publicacao_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, publicacao_id) REFERENCES publicacao (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- aprovacao
ALTER TABLE aprovacao DROP CONSTRAINT aprovacao_aprovador_id_fkey;
ALTER TABLE aprovacao ADD CONSTRAINT aprovacao_aprovador_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, aprovador_id) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE aprovacao DROP CONSTRAINT aprovacao_sessao_id_fkey;
ALTER TABLE aprovacao ADD CONSTRAINT aprovacao_sessao_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, sessao_id) REFERENCES sessao (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- assinatura
ALTER TABLE assinatura DROP CONSTRAINT assinatura_criado_por_fkey;
ALTER TABLE assinatura ADD CONSTRAINT assinatura_criado_por_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, criado_por) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE assinatura DROP CONSTRAINT assinatura_removido_por_fkey;
ALTER TABLE assinatura ADD CONSTRAINT assinatura_removido_por_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, removido_por) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- consumo
ALTER TABLE consumo DROP CONSTRAINT consumo_cliente_id_fkey;
ALTER TABLE consumo ADD CONSTRAINT consumo_cliente_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, cliente_id) REFERENCES cliente (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE consumo DROP CONSTRAINT consumo_evento_auditoria_id_fkey;
ALTER TABLE consumo ADD CONSTRAINT consumo_evento_auditoria_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, evento_auditoria_id) REFERENCES evento_auditoria (inquilino_id, id)
  ON DELETE RESTRICT;
ALTER TABLE consumo DROP CONSTRAINT consumo_processo_id_fkey;
ALTER TABLE consumo ADD CONSTRAINT consumo_processo_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, processo_id) REFERENCES processo (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE consumo DROP CONSTRAINT consumo_usuario_id_fkey;
ALTER TABLE consumo ADD CONSTRAINT consumo_usuario_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, usuario_id) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- evento_auditoria
ALTER TABLE evento_auditoria DROP CONSTRAINT evento_auditoria_aprovacao_id_fkey;
ALTER TABLE evento_auditoria ADD CONSTRAINT evento_auditoria_aprovacao_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, aprovacao_id) REFERENCES aprovacao (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE evento_auditoria DROP CONSTRAINT evento_auditoria_sessao_id_fkey;
ALTER TABLE evento_auditoria ADD CONSTRAINT evento_auditoria_sessao_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, sessao_id) REFERENCES sessao (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE evento_auditoria DROP CONSTRAINT evento_auditoria_usuario_id_fkey;
ALTER TABLE evento_auditoria ADD CONSTRAINT evento_auditoria_usuario_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, usuario_id) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- evento_callback
ALTER TABLE evento_callback DROP CONSTRAINT evento_callback_tarefa_id_fkey;
ALTER TABLE evento_callback ADD CONSTRAINT evento_callback_tarefa_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, tarefa_id) REFERENCES tarefa_assincrona (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- item_vigiado
ALTER TABLE item_vigiado DROP CONSTRAINT item_vigiado_assinatura_id_fkey;
ALTER TABLE item_vigiado ADD CONSTRAINT item_vigiado_assinatura_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, assinatura_id) REFERENCES assinatura (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE item_vigiado DROP CONSTRAINT item_vigiado_criado_por_fkey;
ALTER TABLE item_vigiado ADD CONSTRAINT item_vigiado_criado_por_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, criado_por) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE item_vigiado DROP CONSTRAINT item_vigiado_desativado_por_fkey;
ALTER TABLE item_vigiado ADD CONSTRAINT item_vigiado_desativado_por_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, desativado_por) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE item_vigiado DROP CONSTRAINT item_vigiado_usuario_id_fkey;
ALTER TABLE item_vigiado ADD CONSTRAINT item_vigiado_usuario_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, usuario_id) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- movimentacao
ALTER TABLE movimentacao DROP CONSTRAINT movimentacao_evento_callback_id_fkey;
ALTER TABLE movimentacao ADD CONSTRAINT movimentacao_evento_callback_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, evento_callback_id) REFERENCES evento_callback (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE movimentacao DROP CONSTRAINT movimentacao_processo_id_fkey;
ALTER TABLE movimentacao ADD CONSTRAINT movimentacao_processo_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, processo_id) REFERENCES processo (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- processo
ALTER TABLE processo DROP CONSTRAINT processo_advogado_responsavel_id_fkey;
ALTER TABLE processo ADD CONSTRAINT processo_advogado_responsavel_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, advogado_responsavel_id) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE processo DROP CONSTRAINT processo_cliente_id_fkey;
ALTER TABLE processo ADD CONSTRAINT processo_cliente_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, cliente_id) REFERENCES cliente (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- publicacao
ALTER TABLE publicacao DROP CONSTRAINT publicacao_evento_callback_id_fkey;
ALTER TABLE publicacao ADD CONSTRAINT publicacao_evento_callback_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, evento_callback_id) REFERENCES evento_callback (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- sessao
ALTER TABLE sessao DROP CONSTRAINT sessao_usuario_id_fkey;
ALTER TABLE sessao ADD CONSTRAINT sessao_usuario_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, usuario_id) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;

-- tarefa_assincrona
ALTER TABLE tarefa_assincrona DROP CONSTRAINT tarefa_assincrona_processo_id_fkey;
ALTER TABLE tarefa_assincrona ADD CONSTRAINT tarefa_assincrona_processo_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, processo_id) REFERENCES processo (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
ALTER TABLE tarefa_assincrona DROP CONSTRAINT tarefa_assincrona_solicitada_por_fkey;
ALTER TABLE tarefa_assincrona ADD CONSTRAINT tarefa_assincrona_solicitada_por_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, solicitada_por) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido

-- vinculo_canal_cliente
ALTER TABLE vinculo_canal_cliente DROP CONSTRAINT vinculo_canal_cliente_cliente_id_fkey;
ALTER TABLE vinculo_canal_cliente ADD CONSTRAINT vinculo_canal_cliente_cliente_id_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, cliente_id) REFERENCES cliente (inquilino_id, id)
  ON DELETE RESTRICT;
ALTER TABLE vinculo_canal_cliente DROP CONSTRAINT vinculo_canal_cliente_verificado_por_fkey;
ALTER TABLE vinculo_canal_cliente ADD CONSTRAINT vinculo_canal_cliente_verificado_por_do_mesmo_inquilino
  FOREIGN KEY (inquilino_id, verificado_por) REFERENCES usuario (inquilino_id, id)
  ON DELETE RESTRICT;   -- opcional: nulo nao e conferido
