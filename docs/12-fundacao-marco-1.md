# Marco 1 — A fundação: monorepo, esquema e migrações

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Data | 2026-08-27 |
| Estado | 🟢 **Entregue e verificado** — as 7 migrações aplicaram, e as 25 provas de regra passam. Ver §1.1 |
| Fase | 3 — construção |
| Marco | **1 de 10** (Spec `09-spec-tecnica.md` §15) |
| Critério de aceite | *"O banco sobe do zero com um comando"* |
| Herda de | `09-spec-tecnica.md` §3 (organização), §9 (esquema de dados), §15 (sequência) |

> **O que este documento é.** O registro do que o marco 1 entregou, das escolhas que ele tomou e do que ele deliberadamente **não** fez. A Spec diz o que construir; este documento diz o que foi construído e por quê assim.

---

## 1. O critério de aceite, e como se confere

O marco 1 termina quando **o banco sobe do zero com um comando**. Numa máquina que tenha apenas Docker e Node — sem `npm install`, sem PostgreSQL instalado, sem configuração manual:

```bash
npm run banco:subir
```

Esse comando faz quatro coisas, em ordem:

1. Cria `infra/.env` a partir de `infra/ambiente.exemplo`, se ainda não existir
2. Sobe o PostgreSQL e **espera ele aceitar conexão** — não apenas ligar
3. Aplica as migrações pendentes, uma transação por arquivo
4. Define a senha do papel da aplicação, a partir do ambiente

Os comandos vizinhos:

| Comando | O que faz |
|---|---|
| `npm run banco:estado` | Mostra o que já foi aplicado e o que falta |
| `npm run banco:derrubar` | Para o banco, **preservando** os dados |
| `npm run banco:zerar` | Para e **apaga** o volume — exige confirmação digitada |
| `npm run verificar` | Confere se o banco está na versão do repositório, e checa os tipos |

### 1.1 O critério foi verificado — 27/08, 05:08

As 7 migrações aplicaram contra um PostgreSQL 16 de verdade, do zero:

```
001-inquilino-e-identidade.sql        ok (894 ms)
002-clientes-e-processos.sql          ok (1351 ms)
003-aprovacao-auditoria-consumo.sql   ok (874 ms)
004-custo-e-orcamento.sql             ok (924 ms)
005-assincronia-e-cache.sql           ok (869 ms)
006-vigilancia.sql                    ok (869 ms)
007-papel-da-aplicacao.sql            ok (935 ms)
```

**23 tabelas** no banco — as 22 do esquema mais a de controle das migrações.

### 1.2 Mas "as migrações rodaram" não é a prova que interessa

Rodar sem erro só diz que o SQL está bem escrito. O que este marco afirma é bem mais forte: que o banco **recusa** o que as regras do projeto proíbem. Isso é uma afirmação testável, e agora é testada:

```bash
npm run banco:conferir
```

`ferramentas/banco/conferir-regras.mjs` **tenta fazer cada coisa proibida** e falha se alguma passar. Cada caso monta o cenário, tenta o proibido e termina em `ROLLBACK` — nenhum resíduo fica no banco.

**25 de 25 corretos**, em 27/08:

| Tenta | Resultado |
|---|---|
| Dois usuários no mesmo número de WhatsApp | 🚫 recusado (Regra 7 / R-11) |
| Reaproveitar um número **já revogado** | ✅ aceito — troca de telefone acontece |
| Faixa A4 exigindo apenas estagiário | 🚫 recusado (Regra 2) |
| Estagiário cadastrado **com** OAB | 🚫 recusado |
| Advogado cadastrado **sem** OAB | 🚫 recusado |
| `UPDATE` num evento de auditoria | 🚫 recusado |
| `DELETE` num evento de auditoria | 🚫 recusado |
| `TRUNCATE` na auditoria | 🚫 recusado (D-128) |
| Gastar além do limite do orçamento | 🚫 recusado (Regra 6) |
| Reservar **exatamente** até o limite | ✅ aceito — teto é teto, não parede antes do teto |
| Gravar o mesmo evento de callback duas vezes | 🚫 recusado (D-116 / R-43) |
| A mesma publicação chegando por dois caminhos | 🚫 recusado |
| CNJ malformado entrando como processo | 🚫 recusado |
| Verificar vínculo de canal sem dizer quem verificou | 🚫 recusado |
| Desativar vigilância sem dizer quem desativou | 🚫 recusado (R-14) |
| Alerta sem publicação nem movimentação de origem | 🚫 recusado |

E as permissões do papel da aplicação, conferidas uma a uma com `has_table_privilege`: pode `SELECT` e `INSERT` em `evento_auditoria`, **não** pode `UPDATE` nem `DELETE`; não pode `UPDATE` em `consumo`; não pode `DELETE` em `publicacao` nem em `movimentacao`; **pode** `DELETE` em `cache_entrada`, que é a única exceção de todo o esquema.

> **Os dois casos que devem PASSAR são tão importantes quanto os que devem falhar.** Uma barreira que também barra o caminho legítimo é uma barreira que alguém vai desligar. Reservar exatamente até o teto tem de funcionar; reaproveitar um número revogado tem de funcionar.

### 1.3 A trava da história imutável, também provada

Acrescentei uma linha de comentário a uma migração já aplicada e rodei o migrador:

```
ERRO  1 migracao(oes) ja aplicada(s) foram EDITADAS depois:
      - 003-aprovacao-auditoria-consumo.sql
```

Recusou, com a saída escrita junto. O arquivo foi restaurado em seguida.

---

## 2. A diferença entre "ligar" e "aceitar conexão"

Parece detalhe e não é. `docker compose up -d` devolve o controle assim que o container **liga**, o que acontece alguns segundos antes de o PostgreSQL **aceitar conexão**. A migração disparada logo em seguida falha com *"connection refused"*.

E falha de um jeito específico: **na máquina lenta, não na rápida.** O comando funciona para quem escreveu e quebra para quem clonou. É o tipo de defeito que gera meia hora de investigação para uma causa que não estava no código.

A correção é o `healthcheck` no compose mais o `--wait` no `up`. Duas linhas, e o problema deixa de existir.

---

## 3. As migrações

### 3.1 Por que arquivos `.sql` numerados, e não uma biblioteca

Não há nada aqui que uma biblioteca de migração resolva melhor: são arquivos SQL aplicados em ordem e registrados numa tabela. E há um motivo a mais, específico deste projeto: **quem opera não é programador de carreira**. Cada dependência a menos é uma coisa a menos que pode quebrar num sábado, e um `.sql` se lê sem saber a biblioteca.

O migrador conversa com o banco pelo `psql` que já existe **dentro do container**. Consequência prática: não precisa de `npm install` para funcionar.

### 3.2 As quatro garantias

| Garantia | Como |
|---|---|
| **Ordem** | `001`, `002`, `003`… ordem alfabética, que com o zero à esquerda é a numérica. Arquivo novo entra no fim, nunca no meio. Número repetido é recusado |
| **Uma vez só** | O que já foi aplicado não roda de novo |
| **Tudo ou nada** | Cada arquivo roda dentro de **uma transação**. Erro na linha 80 desfaz as 79 anteriores. O registro na tabela de controle vai **dentro** da mesma transação — senão uma falha entre aplicar e registrar deixaria a migração aplicada e não registrada, que é o estado que faz a próxima execução aplicar duas vezes |
| **História imutável** | Grava o resumo (*hash* — impressão digital do conteúdo) de cada arquivo aplicado. Se um arquivo já aplicado for **editado depois**, o migrador recusa de rodar |

A quarta merece explicação, porque é a menos óbvia e a mais útil.

**Editar uma migração já aplicada é editar o passado.** O seu banco rodou a versão antiga; o de quem clonar o repositório hoje roda a nova. Os dois passam a ser bancos diferentes com o mesmo número de versão, e **nada avisa** — até o dia em que uma consulta funciona numa máquina e falha na outra. O migrador transforma isso num erro imediato, com a saída escrita junto: desfaça a edição e escreva uma migração nova.

### 3.3 O que cada arquivo contém

| Arquivo | Conteúdo | Realiza |
|---|---|---|
| `001-inquilino-e-identidade.sql` | `inquilino`, `usuario`, `identidade_externa`, `sessao` | **Regra 7** — o índice único em `identidade_externa` é o que impede conta compartilhada de passar em silêncio |
| `002-clientes-e-processos.sql` | `cliente`, `vinculo_canal_cliente`, `processo` | Segredo de justiça com *default* seguro; vínculo de canal só vale verificado |
| `003-aprovacao-auditoria-consumo.sql` | `aprovacao`, `evento_auditoria`, `consumo` | **Regra 2** e a auditoria *append-only* |
| `004-custo-e-orcamento.sql` | `catalogo_preco`, `custo_observado`, `orcamento`, `reserva_orcamento`, `assinatura` | **Regra 6** — custo é requisito funcional |
| `005-assincronia-e-cache.sql` | `tarefa_assincrona`, `evento_callback`, `cache_entrada` | Idempotência por conteúdo (D-116, D-117) |
| `006-vigilancia.sql` | `item_vigiado`, `publicacao`, `movimentacao`, `alerta` | D-63 — o cliente lê da base interna, não da API paga |
| `007-papel-da-aplicacao.sql` | O papel `lex_app` e suas permissões | **Regra 1** e **Regra 5** aplicadas ao banco |

---

## 4. As seis regras que viraram esquema

O trabalho mais importante deste marco não foi criar tabelas — foi **transformar regra escrita em restrição do banco**. Regra em documento depende de alguém lembrar; restrição no banco recusa a transação.

### 4.1 Regra 7 — nada de conta compartilhada

```sql
CREATE UNIQUE INDEX identidade_externa_uma_por_provedor
  ON identidade_externa (provedor, identificador_externo)
  WHERE revogada_em IS NULL;
```

Enquanto um identificador externo só puder pertencer a **um** usuário por provedor, uma conta compartilhada não entra em silêncio: ela **colide**, e a colisão é visível. Sem isso, "o WhatsApp da secretaria" vira o canal por onde qualquer pessoa age com o privilégio de quem estiver cadastrado ali (R-11).

O `WHERE revogada_em IS NULL` existe porque troca de telefone acontece. O identificador pode mudar de dono; duas pessoas vigentes ao mesmo tempo, nunca.

### 4.2 Regra 2 — ato jurídico exige advogado

Duas restrições, e nenhuma delas é validação de tela:

```sql
CONSTRAINT usuario_oab_conforme_papel      -- advogado tem OAB; os demais, não
CONSTRAINT aprovacao_a4_exige_advogado     -- faixa A4 só com papel advogado ou sócio
```

Não existe combinação válida de faixa A4 com estagiário, secretária, financeiro ou TI. A tentativa é recusada pelo banco.

### 4.3 A auditoria é imutável — em duas camadas, de propósito

**Camada 1: gatilho.** `evento_auditoria` tem gatilhos que levantam exceção em `UPDATE`, `DELETE` **e `TRUNCATE`**.

> O `TRUNCATE` merece nota. Ele **não dispara** gatilho por linha. Sem uma cláusula própria, uma tabela "imutável" se esvazia inteira com um comando — e o gatilho que existia daria a impressão de proteção que não havia.

**Camada 2: permissão.** O papel da aplicação simplesmente nunca recebe `UPDATE` nem `DELETE` nessa tabela.

Por que duas? Uma camada bastaria contra descuido. Duas são necessárias porque o valor da auditoria é ser inalterável **por quem tem acesso** — e permissão é algo que um administrador concede a si mesmo. O gatilho vale até para o dono do banco.

### 4.4 Regra 5 — negar por padrão, no lugar mais silencioso

Três exemplos, e o terceiro é o mais interessante:

```sql
sigiloso boolean NOT NULL DEFAULT true      -- processo sem informação é tratado como sigiloso
sujeitos_autorizados jsonb DEFAULT '[]'     -- vazio é "nenhum", nunca "todos"
```

E o terceiro, na migração 007: o papel da aplicação recebe **`SELECT` e `INSERT`** por padrão. `UPDATE` e `DELETE` são concedidos **tabela a tabela, com o nome escrito e o motivo ao lado**. Vale inclusive para o futuro:

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT ON TABLES TO lex_app;
```

Uma tabela criada numa migração daqui a seis meses nasce legível e inserível, e **nada mais**. Quem precisar de mais vai ter de escrever a linha — e escrever a linha é o momento em que alguém pensa se deveria.

### 4.5 Regra 6 — o teto é do banco, não da aplicação

```sql
CONSTRAINT orcamento_nao_estoura CHECK (
  consumido_centavos + reservado_centavos <= limite_centavos
)
```

Código que erra a conta encontra uma **recusa**, e não um saldo negativo. É o invariante do motor de custo, guardado no lugar onde não depende de o motor estar correto.

E a coluna `reservado_centavos` é o que faz a reserva existir: sem ela, duas chamadas simultâneas olhariam o mesmo `consumido` e ambas se achariam dentro do teto.

### 4.6 Idempotência por conteúdo — a regra que a medição inverteu

`evento_callback.chave_evento` é um **resumo do conteúdo com o envelope de entrega removido antes**, e não o identificador que o fornecedor manda. A Spec dizia o contrário até 26/08, e a medição desmentiu: a mesma solicitação chegou três vezes com três `uuid` diferentes.

A unicidade é **índice único no banco**, não um `if` na aplicação. Duas entregas simultâneas do mesmo conteúdo passariam pelo `if` as duas.

---

## 5. Três ausências deliberadas no esquema

Coisas que **não** existem, e a ausência é a decisão:

**Não existe `alerta.prazo_calculado`.** A plataforma sinaliza **indício** de prazo; quem conta prazo é advogado (RF-11, D-64). Uma coluna com data calculada seria lida como se fosse a data — e o dia em que ela estivesse errada seria o dia do dano.

**Não existe `alerta.lido` booleano.** Existem `lido_por` e `lido_em`, porque RF-13 exige confirmação **nominal**: saber que "alguém leu" não permite escalar para quem não leu.

**Não existe `DELETE` para `publicacao` e `movimentacao`.** Elas são a base de leitura do cliente e a origem dos alertas. Apagar uma é apagar a justificativa de um aviso que já foi dado. O único `DELETE` concedido em todo o esquema é o de `cache_entrada` — descartar cache não perde nada: no pior caso, paga-se de novo pelo que já se pagou uma vez.

---

## 6. O monorepo

Nove pacotes, a estrutura da Spec §3, com `package.json` e `tsconfig.json` cada um, ligados por referências de projeto do TypeScript.

Cada `src/index.ts` está **vazio de código e cheio de contrato**: o que aquele pacote é, qual regra ele sustenta, o que ele não pode importar, e em qual marco ele será preenchido. É deliberado — um esqueleto que não diz para que serve vira nove pastas que ninguém sabe se pode apagar.

As referências de projeto impõem a **regra de dependência de mão única** (Spec §3, regra 1): `mcp-core` não referencia `mcp-servers/`, e a tentativa de importar dali passa a ser um erro de compilação, não uma questão de disciplina.

---

## 7. O catálogo de preços

`dados/precos-escavador.json` nasce preenchido com o que a captura mediu, e não com o que o fornecedor disse. Cada rota carrega `lido_em` e `fonte`, e `fonte: medicao` vale mais que `fonte: suporte` — três vezes uma fonte oficial do Escavador contradisse o sistema (R-44).

A entrada mais importante do arquivo é a de `POST /api/v1/monitoramentos`:

> A **chamada** é gratuita; a **assinatura** não. Criar debitou zero no cabeçalho de crédito e mesmo assim gerou cobrança mensal. Custo que não passa pelo caminho do custo por chamada é invisível — e invisível, no pré-pago, é indefinido (D-32, R-13).

---

## 8. O que o marco 1 **não** fez

| Não fez | Por quê |
|---|---|
| Nenhuma lógica de aplicação | É o marco 2 em diante. Esqueleto que já vem com código é esqueleto que ninguém revisa |
| Nenhum `npm install` | O marco 1 não precisa de dependência nenhuma para cumprir o critério de aceite. TypeScript entra quando houver TypeScript a compilar |
| Nenhum dado de exemplo | Semear o banco com dado inventado dá a impressão de que algo funciona. Nada funciona ainda |
| Nada da Parte II | Matriz definitiva de escopos, modelagem do Trello e rito de escalada dependem do escritório |

---

## 9. Decisões que este marco propõe

| # | Decisão |
|---|---|
| **D-126** | Migrações são arquivos `.sql` numerados com migrador próprio, sem biblioteca e sem dependência de `npm` |
| **D-127** | Migração aplicada é imutável; o migrador guarda o resumo do arquivo e recusa de rodar se um arquivo já aplicado for editado |
| **D-128** | A auditoria é protegida em duas camadas — gatilho e permissão — porque permissão é algo que o administrador concede a si mesmo |
| **D-129** | O papel da aplicação recebe `SELECT` e `INSERT` por padrão; `UPDATE` e `DELETE` são concedidos tabela a tabela, com motivo escrito, inclusive para tabelas futuras |
| **D-130** | `processo.sigiloso` tem *default* `true`: processo sem informação é tratado como sigiloso |

---

## 10. Próximo passo

**Marco 2** — `dominio` e `mcp-core` sem rede: sessão, escopo, abrangência, erro e envelope. Termina quando a matriz de escopo passa inteira.

Não consome crédito do Escavador e não depende do escritório.
