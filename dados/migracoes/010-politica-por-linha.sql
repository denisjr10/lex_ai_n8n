-- ==========================================================================
-- 010 — Politica por linha: a consulta que esquece o filtro nao vaza
--
-- A migracao 009 impediu ESCRITA inconsistente entre escritorios. Esta impede
-- LEITURA. As duas sao necessarias, e nenhuma substitui a outra: a conferencia
-- de chave estrangeira roda como dona da tabela e passa por cima de politica
-- por linha, entao a 009 continua sendo a unica coisa entre um bug e um vinculo
-- apontando para o cliente de outro escritorio.
--
-- O QUE MUDA NA PRATICA. Ate aqui, `SELECT * FROM cliente WHERE nome = 'X'`
-- atravessava todos os escritorios, e a unica coisa que impedia isso era a
-- disciplina de escrever `WHERE inquilino_id` em toda consulta. Regra que
-- depende de alguem lembrar nao e barreira — e a Regra 1 do projeto diz
-- exatamente isso sobre privilegio.
--
-- Agora a conexao DECLARA em que escritorio esta trabalhando, e o banco
-- devolve so aquilo. Esquecer o filtro deixa de ser um vazamento e passa a ser
-- um resultado menor.
--
-- ---------------------------------------------------------------------------
-- POR QUE ISTO FUNCIONA AQUI, E NAO FUNCIONARIA EM MUITOS PROJETOS
--
-- Politica por linha NAO se aplica ao dono da tabela nem a superusuario. Se os
-- servicos conectassem como `lex_dono`, tudo abaixo seria decorativo. A
-- migracao 007 ja separou os dois papeis por outro motivo — deixar a auditoria
-- imutavel — e o efeito colateral e que a pre-condicao dificil do isolamento
-- ja estava satisfeita. `lex_dono` segue enxergando tudo, que e o que
-- migracao, conferencia e relatorio administrativo precisam.
--
-- ---------------------------------------------------------------------------
-- FALHA FECHADA, E O PRECO DELA
--
-- `current_setting('lex.inquilino_id', true)` devolve NULL quando ninguem
-- definiu a variavel. `inquilino_id = NULL` vale NULL, e linha que nao da TRUE
-- nao aparece. Ou seja: conexao que nao diz de quem esta tratando NAO VE NADA.
--
-- Isso e o comportamento certo — e cobra um preco que precisa estar escrito:
-- o servico que esquecer de declarar o inquilino nao recebe erro, recebe
-- VAZIO. Banco vazio e um sintoma confuso, e a defesa contra ele nao mora
-- aqui: mora em `services/auditoria/src/conexao.ts`, onde acesso a dado de
-- inquilino so acontece por uma funcao que exige o inquilino como argumento.
--
-- O NULLIF existe porque `''::uuid` lanca excecao, e string vazia e o que uma
-- variavel "definida mas em branco" produz.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- A funcao que le o escritorio corrente
--
-- Uma funcao, e nao a expressao repetida em 17 politicas: expressao repetida
-- dezessete vezes e dezessete lugares para corrigir quando a regra mudar, e
-- dezesseis deles serao esquecidos.
--
-- STABLE, e nao IMMUTABLE: o valor muda entre transacoes. Declarar IMMUTABLE
-- deixaria o planejador guardar o resultado de um inquilino e reaproveitar em
-- outro, que e precisamente o vazamento que esta migracao existe para impedir.
-- ---------------------------------------------------------------------------
CREATE FUNCTION inquilino_corrente() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('lex.inquilino_id', true), '')::uuid
$$;

COMMENT ON FUNCTION inquilino_corrente() IS
  'O escritorio declarado pela conexao. NULO quando ninguem declarou — e nulo nao enxerga linha nenhuma.';

-- ---------------------------------------------------------------------------
-- As politicas
--
-- `USING` filtra o que a consulta ENXERGA; `WITH CHECK` decide o que ela pode
-- ESCREVER. Os dois com a mesma condicao: um servico nao le fora do seu
-- escritorio e nao grava linha carimbada com o de outro.
--
-- Sem `FORCE ROW LEVEL SECURITY` de proposito. Forcar aplicaria a politica
-- tambem ao dono da tabela, e o dono e quem roda as migracoes — a proxima
-- migracao que precisasse tocar dado existente falharia, e falharia de um jeito
-- dificil de ler (zero linhas afetadas, nenhum erro).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  -- As tabelas com `inquilino_id`. `inquilino` fica de fora: ela E o
  -- escritorio, e filtrar a lista de escritorios pelo escritorio corrente
  -- impediria o proprio login de encontrar a linha.
  --
  -- Ficam de fora tambem, por nao terem `inquilino_id`:
  --   identidade_externa e reserva_orcamento — penduradas num pai unico, entao
  --     o escritorio delas E o do pai, e nao ha o que divergir
  --   catalogo_preco e custo_observado — o preco de uma rota do Escavador e o
  --     mesmo para todo mundo. Sao dado do FORNECEDOR, nao do cliente
  alvos text[] := ARRAY[
    'usuario', 'sessao', 'cliente', 'vinculo_canal_cliente', 'processo',
    'aprovacao', 'evento_auditoria', 'consumo', 'orcamento', 'assinatura',
    'tarefa_assincrona', 'evento_callback', 'cache_entrada',
    'item_vigiado', 'publicacao', 'movimentacao', 'alerta'
  ];
BEGIN
  FOREACH t IN ARRAY alvos LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY %1$I_do_inquilino ON %1$I
        FOR ALL
        USING (inquilino_id = inquilino_corrente())
        WITH CHECK (inquilino_id = inquilino_corrente())
    $f$, t);
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- O comentario da migracao 005, agora que ele pode dizer a verdade
--
-- Ele afirmava que a chave primaria composta tornava impossivel ler a entrada
-- de outro inquilino por esquecimento de WHERE. Era falso, e a migracao 008
-- corrigiu o texto para dizer o que a chave de fato faz. A partir daqui a
-- garantia existe — so que ela vem da politica, nao da chave.
-- ---------------------------------------------------------------------------
COMMENT ON TABLE cache_entrada IS
  'Chave primaria composta impede COLISAO entre inquilinos; quem impede LEITURA cruzada e a politica por linha desta migracao. Conexao sem inquilino declarado nao enxerga nada.';
