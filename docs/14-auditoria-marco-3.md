# Marco 3 — A auditoria: a prova que não se edita

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Data | 2026-08-31 |
| Estado | 🟢 **Entregue e verificado** — 23 de 23 provas contra um PostgreSQL de pé, mais 81 testes de unidade |
| Fase | 3 — construção |
| Marco | **3 de 10** (Spec `09-spec-tecnica.md` §15) |
| Critério de aceite | *"Recusa e sucesso geram registro reconstruível pelo `requisicao_id`"* |
| Herda de | `09-spec-tecnica.md` §9.4 · `01-diretrizes-gerais.md` (D-77) · migrações 003 e 007 |

> **O que este marco entrega.** O lugar onde a **Regra 5** — *"negar por padrão, e falha fecha"* — deixa de valer só para privilégio e passa a valer para a própria capacidade de registrar. A partir daqui, **a plataforma que não consegue escrever a prova não age**.

---

## 1. O critério de aceite não era "a tabela aceita INSERT"

A tabela existe desde a migração 003, e o marco 1 já provou que ela recusa alteração. O que faltava é o que se promete ao escritório:

> **Conseguir contar, meses depois, o que aconteceu numa operação e por quê.**

Se a leitura não remonta a história, a escrita foi consumo de disco. Por isso a verificação (`npm run banco:auditoria`) **não testa a auditoria isolada**: ela roda o chassi de verdade, com a auditoria de PostgreSQL no lugar da de memória, e depois pergunta ao banco o que aconteceu.

```
1. A conexão, e o papel que ela precisa ter               2 provas
2. Uma RECUSA atravessa o chassi e vira registro          2
3. Um SUCESSO atravessa o chassi e vira registro          1
4. A operação se reconstrói pelo requisicao_id            8
5. O registro NÃO se altera, nem para o papel da app      2
6. O resumo recusa dado pessoal ANTES do INSERT           2
7. O consumo e o ato ficam na mesma transação             3
8. Auditoria fora do ar BLOQUEIA, e não chama fornecedor  2
9. O relatório de negados                                 1
                                                         ──
                                                         23 de 23
```

---

## 2. As decisões que carregam peso

### 2.1 O serviço conecta como `lex_app`, nunca como o dono do banco

O *append-only* tem **duas camadas**, e isso é do desenho da migração 003:

1. um gatilho que recusa `UPDATE`, `DELETE` e `TRUNCATE` — e vale **até para o dono**;
2. a revogação dessas permissões para o papel da aplicação, na migração 007.

Conectar como `lex_dono` **não quebraria teste nenhum**. O gatilho continuaria recusando, tudo pareceria certo, e o desenho de duas camadas teria virado uma em silêncio.

A segunda camada existe justamente porque a primeira é um objeto do banco que quem tem DDL pode remover. Um `DROP TRIGGER` acidental numa migração futura deixaria a tabela mutável, e ninguém descobriria **até precisar da prova** — que é o pior momento possível para descobrir.

Por isso `conferirPapel()` é chamado na partida e conectar com o papel errado é **erro de partida**, não aviso.

### 2.2 O resumo **recusa** dado pessoal, e recusa em vez de limpar

A tabela é imutável por gatilho e por permissão. Isso é exatamente o que se quer de uma prova — e exatamente o que **não** se quer de um vazamento:

> **Dado pessoal que entra aqui não sai nunca mais.**

Não há apagamento seletivo, não há correção, e um pedido de eliminação sob a LGPD encontra uma tabela desenhada para recusá-lo. A imutabilidade que protege a prova protegeria o vazamento com o mesmo empenho.

Daí duas escolhas:

**A barreira fica antes do INSERT**, que é a única posição em que ela pode ficar. Depois não existe conserto — existe incidente.

**E ela recusa; não limpa.** Mascarar em silêncio ensinaria a próxima pessoa que dá para mandar qualquer coisa porque "o resumo cuida disso" — e um dia a expressão regular não pegaria. Como `registrar` que lança é chamada que não acontece, tentar gravar um CNJ no resumo **bloqueia a operação**. É severo de propósito.

O que passa é vocabulário nosso: `etapa` e `codigo_do_erro`, de lista fechada. Os parâmetros da chamada não entram, e o motivo é que `numero_cnj` é um parâmetro.

> A mensagem de recusa **não repete o que encontrou**. Dizer *"achei o CNJ 0000132-06…"* escreveria o dado no log do servidor, que é outro lugar onde ele não deve estar.

### 2.3 `aprovacao_id` entra no evento — achado 4 da revisão de 28/08

A coluna existia na migração 003 desde o marco 1, e o chassi não a preenchia.

A pergunta que se faz depois de um ato de faixa A4 dar errado não é *"houve aprovação?"* — é **"de quem foi a assinatura?"**. Sem o campo, a trilha responde a primeira e não a segunda.

A Regra 2 exige advogado **identificado**. Identificar na hora de decidir e esquecer na hora de registrar cumpre a metade da regra que não serve para nada.

Vale também na recusa: uma aprovação de estagiário para faixa A4 é negada — e o registro guarda **qual** aprovação foi apresentada, que é o que permite investigar depois quem tentou assinar o que não podia.

### 2.4 A consulta de trilha exige `inquilino_id`

`WHERE requisicao_id = $1` sozinho **atravessa inquilinos**.

É o mesmo defeito que a revisão encontrou no comentário da migração 005, que afirmava que a chave primária composta tornava impossível ler a entrada de outro inquilino: chave composta impede **colisão**, não **leitura**.

O `requisicao_id` é um `uuid`, então a colisão é improbabilíssima — e "improbabilíssima" é uma propriedade estatística, não uma barreira. Tornar o inquilino parâmetro obrigatório é o que impede a assinatura desta função de um dia ser chamada sem ele.

### 2.5 Não existe `try/catch` em volta do INSERT

A tentação é óbvia: engolir a falha, devolver `void`, deixar a operação seguir e tentar de novo depois. **Seria a linha mais destrutiva do projeto.**

O chassi confia que `registrar` que retorna significa *registro gravado* — é sobre essa promessa que ele decide chamar o fornecedor. Um `catch` ali transformaria "auditoria indisponível" em "auditoria silenciosamente ausente", e a plataforma passaria a agir sem prova exatamente nos momentos em que a prova mais importa: aqueles em que a infraestrutura está ruim.

Toda exceção sobe. Quem decide o que fazer com ela é o chassi, e a decisão dele já está escrita: bloquear.

---

## 3. O que a integração com o banco revelou, e a documentação não dizia

### 3.1 🔴 A sessão precisa existir no banco antes de qualquer registro

`evento_auditoria.sessao_id` tem chave estrangeira para `sessao`. A primeira execução da prova falhou aí, e a falha é informativa:

> Uma sessão que só existe como objeto em memória — emitida pelo Policy Gate e nunca persistida — torna **toda chamada dela irregistrável**, e portanto (D-77) **impossível**.

O acoplamento está certo: trilha que aponta para uma sessão que ninguém consegue descrever não reconstrói nada. Mas é uma **exigência que o Policy Gate do marco 9 precisa cumprir**, e que não estava escrita em lugar nenhum até agora. Virou R-50.

O efeito em cascata é o mais desagradável: o sintoma não é "a auditoria falhou", é **"a plataforma inteira parou"** — porque falha fecha. Correto, e difícil de diagnosticar sem saber disto.

### 3.2 O identificador do domínio é `string`; o do banco é `uuid`

O domínio declara `usuario_id: string`, e faz bem — ele descreve o ato, não o armazenamento. A coluna é `uuid NOT NULL`, três delas com chave estrangeira.

Um identificador malformado **não degrada o registro: ele para a plataforma**. Isso está certo, é a Regra 5 funcionando. Mas o diagnóstico não pode ser `invalid input syntax for type uuid: "usr_014"` vindo do PostgreSQL às três da manhã — quem for acordado precisa ler **qual campo** veio torto.

Daí a conferência antes do INSERT, que nomeia o campo. **Ela não substitui a do banco**: a coluna continua `uuid`, a chave estrangeira continua garantindo que o `usuario_id` aponta para uma pessoa que existe — coisa que nenhuma expressão regular sabe.

---

## 4. A prova deixa resíduo, e não há como não deixar

O `conferir-regras.mjs` do marco 1 desfaz tudo com `ROLLBACK`. Aqui isso é **impossível por construção**:

> Um teste de *append-only* que conseguisse limpar a si mesmo teria acabado de refutar o que veio testar.

As linhas ficam, sob um inquilino de teste declarado. `npm run banco:zerar` recria o banco quando incomodar.

---

## 5. A primeira dependência de produção do monorepo

Até aqui o projeto tinha **uma** dependência, e de desenvolvimento: o TypeScript. As ferramentas de banco falam com o PostgreSQL por `docker compose exec psql`, sem biblioteca.

Isso serve para ferramenta e **não serve para serviço**: um processo por gravação de auditoria é inviável quando toda chamada gera pelo menos uma. Entra o `pg` (8.16.3), que é o cliente padrão do PostgreSQL em Node.

Prazos curtos de propósito (5 s). Um pool que espera indefinidamente transforma *"auditoria fora do ar"* em *"a plataforma travou"* — e o segundo é pior: o primeiro recusa e avisa, o segundo pendura sem dizer nada. **A D-77 quer bloqueio com resposta.**

---

## 6. O que o marco 3 **não** fez

| Não fez | Por quê |
|---|---|
| Medir custo | Marco 4. A tabela `consumo` já grava, e na mesma transação do ato — falta quem calcule o número |
| Preencher `recurso` | O chassi ainda não o distingue da ação (marco 6) |
| Isolar inquilinos por política de linha | Achado 5 da revisão. A consulta de trilha já filtra; o esquema ainda não obriga |
| Persistir a sessão | Marco 9, junto do Policy Gate que emite. Este marco descobriu que é obrigatório (R-50) |

---

## 7. Decisões que este marco propõe

| # | Decisão |
|---|---|
| **D-157** | O serviço de auditoria conecta como `lex_app`, nunca como o dono — metade do *append-only* é a permissão |
| **D-158** | O resumo **recusa** dado pessoal antes do INSERT, e recusa em vez de limpar |
| **D-159** | `aprovacao_id` entra no evento de auditoria, no sucesso e na recusa |
| **D-160** | A consulta de trilha exige `inquilino_id` — `requisicao_id` sozinho atravessa inquilinos |
| **D-161** | `pg` entra como primeira dependência de produção; ferramenta fala por `psql`, serviço não |
| **D-162** | A prova do *append-only* deixa resíduo permanente, e isso é a propriedade, não um defeito do teste |

---

## 8. Próximo passo

**Marco 4** — motor de custo: estimativa, reserva e reconciliação. A costura está marcada no `chassi.ts` como etapa 9, a tabela `consumo` já grava junto do ato, e a tabela de orçamento já recusa estouro desde a migração 004.

Não consome crédito e não depende do escritório.
