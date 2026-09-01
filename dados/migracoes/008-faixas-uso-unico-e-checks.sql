-- ==========================================================================
-- 008 — A faixa que se dividiu, a aprovacao que se gasta, e tres CHECKs
--       que diziam menos do que pareciam
--
-- Quatro correcoes independentes, todas nascidas da revisao externa de 28-31/08
-- e da D-156. A primeira e a mais urgente, e e uma REGRESSAO NOSSA.
--
-- 1. A FAIXA A3 NAO EXISTE MAIS, E O BANCO NAO SOUBE (D-142, D-156)
--
--    Em 31/08 a faixa A3 se dividiu em A3a e A3b no codigo. A tabela
--    `aprovacao` continuou com CHECK (faixa IN ('A1','A2','A3','A4')) — ou
--    seja, hoje ela RECUSA uma aprovacao A3b e ACEITA uma A3, que e a faixa
--    que o codigo nao conhece mais.
--
--    Nenhum teste pegou porque ninguem ainda escreve nessa tabela: o chassi
--    recebe a aprovacao pronta, e quem vai grava-la e o Policy Gate (marco 9).
--    O defeito estava adormecido esperando o primeiro codigo que a usasse — e
--    e exatamente assim que duas copias da mesma regra envelhecem em direcoes
--    diferentes sem ninguem notar.
--
-- 2. APROVACAO SE GASTA UMA VEZ (achado 4 da revisao)
--
--    `usado_em` e `sessao_id`. A mesma aprovacao servia duas vezes, e o caso
--    real nao e o atacante: e a retentativa. A camada de cima repete a chamada
--    por timeout de rede, apresenta a mesma aprovacao, e sai uma segunda
--    mensagem ao cliente com a assinatura de um advogado que autorizou uma.
--
-- 3. CHECK QUE PASSA COM NULL NAO E CHECK
--
--    `classificacao <> 'gratuita' OR preco_centavos = 0` parece dizer que rota
--    gratuita custa zero. Em SQL, `NULL = 0` vale NULL, e CHECK aceita NULL
--    como "nao violado". Entao uma rota gratuita SEM PRECO passava — e o
--    motor de custo (marco 4) leria ausencia de preco como se fosse zero
--    confirmado, que e a diferenca entre "medi e da zero" e "nao sei".
--
-- 4. sujeitos_autorizados NASCIA COM A FORMA ERRADA
--
--    O banco criava `'[]'` (lista); o TypeScript espera
--    `{processos: [], documentos: []}`. As duas formas significam "nenhum
--    sujeito", entao nada quebrou ainda — mas na primeira leitura tipada a
--    lista viraria objeto sem `processos`, e `sujeitos.processos` seria
--    undefined. Undefined em verificacao de abrangencia e o caminho classico
--    de transformar negar-por-padrao em permitir-por-engano.
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- 1. As faixas
-- ---------------------------------------------------------------------------
ALTER TABLE aprovacao DROP CONSTRAINT IF EXISTS aprovacao_faixa_check;

ALTER TABLE aprovacao ADD CONSTRAINT aprovacao_faixa_check
  CHECK (faixa IN ('A1', 'A2', 'A3a', 'A3b', 'A4'));

-- A3b e A4 exigem advogado ou socio (D-156). A regra ja existia para A4; a
-- divisao da A3 e que tornou possivel escreve-la para comunicacao externa sem
-- alcancar o envio por gabarito, que nao passa por aprovacao mensagem a
-- mensagem. Nao ha combinacao valida de A3b ou A4 com estagiario, secretaria,
-- financeiro ou TI — e o banco recusa a tentativa.
ALTER TABLE aprovacao DROP CONSTRAINT IF EXISTS aprovacao_a4_exige_advogado;

ALTER TABLE aprovacao ADD CONSTRAINT aprovacao_externa_exige_advogado
  CHECK (faixa NOT IN ('A3b', 'A4') OR papel_exigido IN ('socio', 'advogado'));

COMMENT ON COLUMN aprovacao.faixa IS
  'A3 virou A3a (gabarito pre-aprovado, sai sozinha) e A3b (texto livre, aprovacao mensagem a mensagem) na D-142.';

-- ---------------------------------------------------------------------------
-- 2. Uso unico e vinculo a sessao
--
-- `usado_em` NULO significa "ainda inteira". Quem gasta faz
--   UPDATE aprovacao SET usado_em = now()
--    WHERE id = $1 AND inquilino_id = $2 AND usado_em IS NULL
-- e olha quantas linhas mudou: uma, era a primeira vez; zero, ja tinham
-- gastado. A atomicidade e do UPDATE, nao de um `if` na aplicacao — dois
-- pedidos simultaneos passariam pelo `if` os dois.
-- ---------------------------------------------------------------------------
ALTER TABLE aprovacao ADD COLUMN usado_em timestamptz;

-- A sessao em que a aprovacao nasceu. O advogado aprova dentro de um contexto
-- — aquela pergunta, daquele cliente, naquele atendimento — e a autorizacao
-- nao deveria sobreviver a ele.
ALTER TABLE aprovacao ADD COLUMN sessao_id uuid REFERENCES sessao(id) ON DELETE RESTRICT;

-- So aprovacao APROVADA pode ter sido usada. Usar uma recusada, uma pendente
-- ou uma expirada e estado impossivel, e estado impossivel que o banco aceita
-- e estado que um dia aparece.
ALTER TABLE aprovacao ADD CONSTRAINT aprovacao_usada_foi_aprovada
  CHECK (usado_em IS NULL OR status = 'aprovada');

CREATE INDEX aprovacao_inteiras ON aprovacao (inquilino_id, id)
  WHERE usado_em IS NULL AND status = 'aprovada';

COMMENT ON COLUMN aprovacao.usado_em IS
  'NULO = ainda inteira. Gastar e UPDATE ... WHERE usado_em IS NULL, e a atomicidade e do banco.';

-- ---------------------------------------------------------------------------
-- 3. O CHECK da rota gratuita
--
-- `preco_centavos IS NOT NULL AND preco_centavos = 0`, e nao so `= 0`. A
-- primeira metade e a que faltava, e e ela que transforma "nao sei" em recusa.
-- ---------------------------------------------------------------------------
ALTER TABLE catalogo_preco DROP CONSTRAINT IF EXISTS catalogo_gratuita_custa_zero;

ALTER TABLE catalogo_preco ADD CONSTRAINT catalogo_gratuita_custa_zero
  CHECK (classificacao <> 'gratuita' OR (preco_centavos IS NOT NULL AND preco_centavos = 0));

-- ---------------------------------------------------------------------------
-- 4. A forma de sujeitos_autorizados
--
-- Muda o DEFAULT e converte o que ja existe. A conversao e segura porque a
-- unica forma gravada ate aqui e a lista vazia: nao ha sessao em producao, e
-- lista vazia e objeto vazio significam a mesma coisa — NENHUM sujeito, nunca
-- "todos" (essa e a razao de abrangencia `any` ser um valor proprio).
-- ---------------------------------------------------------------------------
UPDATE sessao
   SET sujeitos_autorizados = '{"processos": [], "documentos": []}'::jsonb
 WHERE jsonb_typeof(sujeitos_autorizados) <> 'object';

ALTER TABLE sessao ALTER COLUMN sujeitos_autorizados
  SET DEFAULT '{"processos": [], "documentos": []}'::jsonb;

-- A forma passa a ser imposta, e nao apenas esperada. Sem isto o default
-- conserta o caso comum e deixa passar o INSERT que traz a forma antiga.
ALTER TABLE sessao ADD CONSTRAINT sessao_sujeitos_tem_forma
  CHECK (
    jsonb_typeof(sujeitos_autorizados) = 'object'
    AND jsonb_typeof(sujeitos_autorizados -> 'processos') = 'array'
    AND jsonb_typeof(sujeitos_autorizados -> 'documentos') = 'array'
  );

COMMENT ON COLUMN sessao.sujeitos_autorizados IS
  'Objeto com processos e documentos. Listas vazias significam NENHUM, nunca todos — abrangencia `any` e um valor proprio.';

-- ---------------------------------------------------------------------------
-- 5. Um comentario que prometia o que nao entregava
--
-- O comentario de `cache_entrada` afirmava que a chave primaria composta torna
-- IMPOSSIVEL ler a entrada de outro inquilino por esquecimento de WHERE. E
-- falso: `SELECT * FROM cache_entrada WHERE chave = 'x'` atravessa inquilinos
-- sem dificuldade. Chave composta impede COLISAO — duas entradas de mesma
-- chave em escritorios diferentes convivem —, nao LEITURA.
--
-- O desenho estava certo; o comentario e que mentia. E comentario que mente e
-- pior que comentario ausente, porque a proxima pessoa confia nele e nao
-- escreve o filtro. Quem impede a leitura e a politica por linha (migracao
-- 010), nao a chave.
-- ---------------------------------------------------------------------------
COMMENT ON TABLE cache_entrada IS
  'Chave primaria composta impede COLISAO entre inquilinos, nao leitura cruzada: consulta sem WHERE inquilino_id atravessa. Quem impede a leitura e a politica por linha da migracao 010.';
