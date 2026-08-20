# Painel da API do Escavador — Achados

| Campo | Valor |
|---|---|
| Versão | 1.2 |
| Data | 2026-08-20 |
| Estado | ✅ Levantado |
| Fonte | Painel autenticado `api.escavador.com`, lido diretamente pelo navegador controlado na máquina do usuário |
| Custo do levantamento | **R$ 0,00** — nenhuma chamada à API foi feita |

> Este documento fecha **seis das sete pendências** de `mapeamento-escavador.md` §15 sem gastar um centavo de crédito.

---

## 1. Por que isto importa

Até aqui, tudo que o projeto sabia sobre custo, plano e cobertura da API do Escavador era inferência a partir de documentação pública. O painel autenticado é a única fonte real desses números, e ele agora foi lido.

O achado com mais consequência: **a cota de teste não cobra R$ 3,00 em todas as rotas.** O suporte informou isso por escrito, mas o painel mostra preços diferenciados — de R$ 0,05 a R$ 3,00. Isso muda o planejamento do orçamento inteiro.

## 2. Situação da conta

| Item | Estado em 2026-08-20 |
|---|---|
| Saldo | **R$ 50,00** (bônus lançado em 13/08/2026 15:38) · **válido até 23/08/2026**, exibido no painel |
| Consumido | **R$ 0,00** · **0 requisições** |
| Plano contratado | **"Sem contrato ativo"** |
| Organização | 67.046.370 IZABEL OLIVEIRA RODRIGUES |
| Usuários na organização | **1** — Dênis Júnior Oliveira Rodrigues, Administrador, conta principal |
| Tokens de acesso | **1** — `Testes_Claude`, criado 20/08/2026, expira 23/08/2027, **nunca utilizado** |
| URL de callback cadastrada | **Nenhuma** |
| Token de validação de callback | **Não gerado** |
| Monitoramentos ativos (V1 e V2) | **Nenhum** |
| Certificados digitais da OAB | **Nenhum** |
| Faturas | Nenhuma |

**A expiração do bônus está no painel**, na barra lateral, logo abaixo do saldo: *"R$ 50,00 — Válido até 23/08/2026"*. Confirma a conta de 13/08 + 10 dias.

## 3. Pendências de §15 resolvidas

| # | Pendência | Situação agora |
|---|---|---|
| 1 | Tabela de preços por rota | ✅ **Resolvida** — transcrita nas §5 e §6 abaixo |
| 2 | Quais rotas são gratuitas | ✅ **Resolvida — e existem sim.** As rotas de **status** do ciclo assíncrono são **Gratuito**. Ver §5-A |
| 3 | Jurisprudência e legislação estão ativas? | ✅ **Resolvida — sim.** Ambas aparecem como categorias de serviço da V1, com preço |
| 5 | Existe ambiente de homologação? | ⚠️ **Parcial** — não há sandbox, mas há **Playground** no painel, que executa com token real (logo, custa crédito) |
| 6 | O plano cobre V1, V2 ou ambas? | ✅ **Resolvida — ambas.** Ver §4 |
| 7 | Uma URL de callback por conta é suficiente? | ✅ **Resolvida** — o campo está **vazio**. Não há integração existente para quebrar |
| 4 | Formato real dos erros 402 e 429 | 🔴 **Continua aberta** — só se observa gastando |

Resta também sem resposta no painel: **limite de requisições por minuto** — não é exibido em lugar nenhum.

## 4. R-15 está encerrado — V1 e V2 estão ambas disponíveis

O risco mais grave do mapeamento era o plano não cobrir a V1, o que deixaria o escritório **sem monitoramento de diário oficial** — e diário oficial é onde nasce o prazo.

A tela *Serviços e Preços* lista as duas versões, com preço aplicado à organização:

- **API V1 — 34 serviços em 10 categorias**, incluindo `DIÁRIOS OFICIAIS`, `MONITORAMENTO DE DIÁRIOS OFICIAIS`, `JURISPRUDÊNCIAS` e `LEGISLAÇÃO`
- **API V2 — 20 serviços em 4 categorias**

Uma ressalva de precisão: o painel diz **"Sem contrato ativo"**. Ou seja, não existe um "plano" que inclua ou exclua a V1 — existe um catálogo de serviços com preço, e nada está bloqueado. A conclusão prática é a mesma (a V1 está acessível), mas a formulação correta é "não há restrição de plano", não "o plano cobre".

## 5. Preços — API V2 (20 serviços)

Transcrição literal da tela em 2026-08-20. O `*` aparece no painel **sem nota de rodapé** explicando o que significa — isso é uma pergunta para o suporte.

### Atualização das informações dos processos

| Serviço | Preço |
|---|---|
| Atualizar o resumo de um Processo por IA | R$ 0,08 |
| Atualização do processo no tribunal | R$ 3,00 * |
| Atualização do processo no tribunal baixando apenas alguns documentos específicos dos autos | R$ 0,75 |
| Atualização do processo no tribunal baixando os autos | R$ 1,50 * |
| Atualização do processo no tribunal baixando os documentos públicos | R$ 0,20 * |

### Consulta de processos de envolvidos

| Serviço | Preço |
|---|---|
| Processos do advogado por OAB | R$ 3,00 até 200 itens · + R$ 3,00 a cada 200 |
| Processos do envolvido | R$ 3,00 até 200 itens · + R$ 3,00 a cada 200 |
| Resumo do advogado por OAB | R$ 3,00 |
| Resumo do envolvido | R$ 3,00 |

### Consulta de processos pela numeração

| Serviço | Preço |
|---|---|
| Capa do processo | R$ 3,00 * |
| **Envolvidos do processo** | **R$ 0,05** |
| Movimentações do processo | R$ 3,00 * |
| **Resumo de um Processo por IA** (se já existir) | **R$ 0,05** |

### Monitoramentos — custo recorrente mensal

| Serviço | Preço |
|---|---|
| Monitoramento de Processo — atualização diária | R$ 3,00 / mês |
| Monitoramento de Processo — atualização semanal | R$ 3,00 / mês |
| Monitoramento de Processo — atualização mensal | R$ 3,00 / mês |
| Monitoramento de Processo Diário com Documentos Públicos | R$ 2,30 / mês |
| Monitoramento de Processo Semanal com Documentos Públicos | R$ 0,55 / mês |
| Monitoramento de Processo Mensal com Documentos Públicos | R$ 0,18 / mês |
| Monitoramento de novos processos | R$ 3,00 / mês até 200 itens · + R$ 3,00 a cada 200 |

> Curiosidade que merece confirmação: o monitoramento **com** documentos públicos é mais barato que o **sem**. Pode ser erro de cadastro do painel, pode ser política de preço. Perguntar antes de desenhar em cima disso.

## 5-A. Conferência pelo Playground — e as rotas gratuitas

O Playground do painel exibe o custo de cada serviço antes de executar. Os nove serviços que ele oferece foram percorridos **sem executar nenhuma consulta**, e o custo de cada um foi comparado com a tela *Serviços e Preços*:

| Serviço no Playground | Playground | Tela de Preços | Confere? |
|---|---|---|---|
| Processos do envolvido | R$ 3,00 até 200 itens · + R$ 3,00 a cada 200 | idem | ✅ |
| Capa do processo | R$ 3,00 | R$ 3,00 * | ✅ |
| Movimentações do processo | R$ 3,00 | R$ 3,00 * | ✅ |
| Processos do advogado por OAB | R$ 3,00 até 200 itens · + R$ 3,00 a cada 200 | idem | ✅ |
| Atualização do processo no tribunal | R$ 3,00 | R$ 3,00 * | ✅ |
| **Status da atualização de processo** | **Gratuito** | **não consta** | 🆕 |
| Atualizar o resumo de um Processo por IA | R$ 0,08 | R$ 0,08 | ✅ |
| **Status da solicitação do resumo por IA** | **Gratuito** | **não consta** | 🆕 |
| Resumo de um Processo por IA | R$ 0,05 | R$ 0,05 | ✅ |

**Nove de nove batem** onde as duas fontes se sobrepõem. A tela de preços é confiável.

### As duas rotas gratuitas mudam duas conclusões

**1. Existem rotas gratuitas, mesmo na cota de teste.** As duas são de **status** — a consulta que pergunta "o pedido assíncrono já terminou?". Isso derruba a afirmação da versão 1.0 de que nenhuma rota é gratuita, e barateia o Bloco C do orçamento: `status-atualizacao` custa **R$ 0,00**.

**2. A tela de preços lista só o que é cobrado.** Ausência dali **não significa indisponível** — pode significar gratuito. Consequência para o modelo de custo do MCP: cada rota precisa ser classificada como *cobrada*, *gratuita* ou *desconhecida*, e "desconhecida" é a única que exige medição.

### E reforça a Leitura B da §7

Se o bônus impusesse R$ 3,00 fixos em tudo, como o suporte informou, as rotas de status apareceriam como R$ 3,00 — e não aparecem. A presença simultânea de **Gratuito**, **R$ 0,05**, **R$ 0,08** e **R$ 3,00** indica preço real por rota, não valor único de teste. A confirmação continua sendo do suporte, mas a evidência pende para a Leitura B.

### O que o Playground ainda ensinou

- Ele cobre **9 dos 20 serviços da V2** — não serve para explorar a API inteira
- **`Envolvidos do processo` (R$ 0,05) não está lá** — a chamada A1 do orçamento terá de ser feita fora do Playground
- Ele exibe o custo **antes** de executar. É a forma mais barata de conferir preço de qualquer rota que ele cubra: **zero**
- O token do Playground é criado com o interruptor `?playground=1`; um token comum não é aceito ali

## 6. Preços — API V1 (34 serviços)

Praticamente tudo a R$ 3,00, com duas exceções destacadas.

| Categoria | Serviço | Preço |
|---|---|---|
| Busca | Busca por Termo | R$ 3,00 |
| Diários Oficiais | Página do Diário Oficial | R$ 3,00 |
| Diários Oficiais | PDF da página do Diário Oficial | R$ 3,00 |
| Instituições | Detalhes da Instituição | R$ 3,00 |
| Instituições | Pessoas de uma Instituição | R$ 3,00 |
| Instituições | Processos de uma Instituição | R$ 3,00 |
| Jurisprudências | Busca por Jurisprudências | R$ 3,00 |
| Jurisprudências | Documento de Jurisprudência | R$ 3,00 |
| Jurisprudências | PDF de uma jurisprudência | R$ 3,00 |
| Legislação | Busca por Legislação | R$ 3,00 |
| Legislação | Documento de Legislação | R$ 3,00 |
| Legislação | Fragmentos do texto de uma Legislação | R$ 3,00 |
| **Monitoramento de Diários Oficiais** | **Monitoramento em Diários Oficiais** | **R$ 3,00 / mês até 200 itens · + R$ 0,05 a cada 200** |
| Monitoramento no tribunal | CPF/CNPJ — atualização diária | R$ 3,00 / mês |
| Monitoramento no tribunal | CPF/CNPJ — atualização semanal | R$ 3,00 / mês |
| Monitoramento no tribunal | Processo — atualização diária | R$ 3,00 / mês |
| Monitoramento no tribunal | Processo — atualização semanal | R$ 3,00 / mês |
| Monitoramento no tribunal | Nome — atualização diária | R$ 3,00 / mês |
| Monitoramento no tribunal | Nome — atualização semanal | R$ 3,00 / mês |
| Movimentações | Movimentação do Processo no Diário Oficial | R$ 3,00 |
| Pessoas | Detalhes da Pessoa | R$ 3,00 |
| Pessoas | Processos de uma Pessoa | R$ 3,00 |
| Processos | Autos de um Processo | R$ 3,00 |
| Processos | **Autos de um Processo — Documentos específicos** | **R$ 0,75** |
| Processos | Busca de processos dos Diários Oficiais por OAB | R$ 3,00 |
| Processos | Busca de processos em Diários Oficiais por número | R$ 3,00 |
| Processos | Envolvidos de um Processo (Diários Oficiais) | R$ 3,00 |
| Processos | Movimentações de um Processo (Diários Oficiais) | R$ 3,00 |
| Processos | Processo no Diário Oficial | R$ 3,00 |
| Processos | Processo no site do tribunal (assíncrono) | R$ 3,00 |
| Processos | Processo no site do tribunal com documentos públicos (assíncrono) | R$ 3,00 |
| Processos | Processos no site do tribunal por CPF/CNPJ (assíncrono) | R$ 3,00 |
| Processos | Processos no site do tribunal por OAB (assíncrono) | R$ 3,00 |
| Processos | Processos no site do tribunal por nome do envolvido (assíncrono) | R$ 3,00 |

## 7. A leitura dos preços — e o que ainda não sabemos

Nenhum serviço custa **mais** de R$ 3,00, e vários custam bem menos. Duas leituras possíveis, e elas levam a planos diferentes:

**Leitura A — R$ 3,00 é teto da cota de teste.** O valor real de cada rota está limitado por cima em R$ 3,00 enquanto o bônus durar, e os preços abaixo disso são os de catálogo. Sob esta leitura, a tabela **não** serve para orçar o plano pago.

**Leitura B — é a tabela de preços real da organização.** Sob esta leitura, ela serve para orçar tudo.

Não dá para distinguir as duas com certeza sem perguntar ao suporte. **A evidência do Playground (§5-A) pende para a Leitura B:** rotas gratuitas e de R$ 0,05 convivem com as de R$ 3,00, o que não aconteceria sob um valor único de teste.

O que **vale sob qualquer leitura**, e é o achado operacional do dia:

> **O teto de "16 requisições" é o pior caso, não um limite fixo.** R$ 50,00 compram 16 chamadas se todas custarem R$ 3,00 — ou **1.000 chamadas** de `Envolvidos do processo` a R$ 0,05.

## 7-A. "R$ 3,00 até 200 itens" — cobrança por bloco de resultado

Quatro serviços não cobram por **requisição**, e sim por **volume de resultado**, em blocos de 200:

> `Processos do envolvido` · `Processos do advogado por OAB` · `Monitoramento de novos processos` (V2) · `Monitoramento em Diários Oficiais` (V1)

A regra é: **R$ 3,00 cobrem os primeiros 200 itens; cada bloco de 200 adicionais custa mais R$ 3,00.**

| Processos que o envolvido tem | Blocos | Custo |
|---|---|---|
| 1 a 200 | 1 | R$ 3,00 |
| 201 a 400 | 2 | R$ 6,00 |
| 401 a 600 | 3 | R$ 9,00 |
| 1.000 | 5 | R$ 15,00 |

**O problema é que o custo não é conhecido antes da chamada.** Ninguém sabe quantos processos um CPF tem até perguntar — e é justamente por isso que se pergunta. Um cliente pessoa física comum cabe no primeiro bloco; uma empresa litigante, um banco ou um órgão público, não. A consulta mais natural do agente — *"quais são os processos deste cliente?"* — é a de custo mais imprevisível da API.

Registrado como **R-25**. O tratamento tem três partes, e vale como requisito do MCP:

1. **Nunca paginar em laço automático.** Cada avanço de página pode ser mais R$ 3,00. A ferramenta busca **um bloco** e devolve o que veio, informando que há mais
2. **Contar antes de listar, quando o volume for suspeito.** `Resumo do envolvido` (R$ 3,00) devolve a *quantidade* de processos sem trazer a lista. Para um envolvido grande, contar primeiro evita gastar às cegas
3. **Teto por chamada e por papel** — um número máximo de blocos que a ferramenta aceita sem aprovação humana. Acima dele, a IA propõe e o humano aprova (Regra 2)

Vale a distinção: nos **monitoramentos**, a mesma regra de blocos é **mensal e recorrente** — 200 itens monitorados por R$ 3,00/mês, e assim por diante. Ali o custo por bloco não é um susto único, é assinatura.

## 8. O painel substitui chamadas do orçamento

Quatro telas entregam de graça o que o orçamento planejava comprar:

| Tela | O que entrega | Chamada que dispensa |
|---|---|---|
| **Serviços e Preços** | Catálogo completo com preço, V1 e V2 | A3 (`/v1/origens`), A4 (jurisprudência) |
| **Monitoramentos** | Monitoramentos ativos por versão | Parte de A2 (`/v2/monitoramentos/processos`) |
| **Uso dos Créditos** | Saldo, total consumido, nº de requisições, **custo médio por requisição** | Parte de A1 (`/v1/quantidade-creditos`) |
| **Histórico das Requisições** | Toda chamada HTTP, com filtro por token | Instrumentação própria de auditoria |

**Consequência de desenho:** o custo real de cada chamada pode ser lido *depois*, no painel, em vez de inferido do cabeçalho `Creditos-Utilizados`. A primeira chamada real do projeto vira, de graça, uma **chamada de calibragem de preço** — basta conferir *Uso dos Créditos* logo depois dela.

## 9. Achados que mudam o desenho da arquitetura

### 9.1 O token do Escavador **não tem escopo** — o mesmo problema do Trello

> ⚠️ **Correção de 2026-08-20, mesma data.** A versão 1.0 deste documento afirmou que o token do Escavador carrega permissões. **Está errado.** A afirmação foi inferida da mensagem do Playground (*"Crie um token com permissão de Playground"*), sem que a tela de criação pudesse ser lida. Com o print da tela `/tokens/criar` em mãos, o formulário completo é:

| Campo | Opções |
|---|---|
| **Nome** | texto livre (ex.: "Integração ERP") |
| **Data de expiração** | data; o painel recomenda **até 1 ano** |
| **"Este token também pode ser utilizado no Playground?"** | Não · Sim |

**É só isso. Não há seleção de escopo, de rota, de versão da API nem de operação.** O único interruptor de permissão que existe é o do Playground — e ele controla o acesso pela interface do painel, não pela API.

O aviso da tela: *"Após criar, copie e armazene com segurança, pois ele será exibido uma única vez."*

**Consequência, e ela é grave:** um token do Escavador vazado dá acesso a **toda a superfície da API** da organização — incluindo as rotas caras (que queimam saldo) e as rotas de certificado digital e senha de advogado (**R-12**). É exatamente o R-16 do Trello, repetido no Escavador. Registrado como **R-24**.

Isso reforça a **Regra 1** do projeto até o limite: como nenhuma das duas APIs de destino oferece segunda barreira, **o privilégio existe única e exclusivamente no código do servidor MCP**. Não há rede de segurança embaixo.

O que o painel ainda oferece de útil, e que sustenta D-51:

- **um token por aplicação** — não dá privilégio menor, mas dá **atribuição** (o *Histórico das Requisições* filtra por token) e **revogação isolada** (derrubar um não derruba os outros)
- **data de expiração** — rotação de credencial vira coisa que o próprio painel cobra
- **Playground: "Não"** em todo token de produção — reduz a superfície de uso de um token vazado

### 9.2 O callback tem token próprio de validação

A tela *Callbacks* tem três partes: **URL de callback**, **Token do Escavador** (*"Use esse token para validar os callbacks recebidos no header `Authorization`"*) e **Histórico de callbacks**, com evento, URL, **tentativas**, status, data/hora e *payload* (corpo da mensagem enviada).

Três consequências:

1. A validação do callback é por **segredo compartilhado no cabeçalho**, não por assinatura HMAC como no Trello. O chassi do MCP precisa suportar os dois modelos
2. Há **retentativa** — o campo "tentativas" prova isso. O receptor precisa ser **idempotente** (receber a mesma mensagem duas vezes sem duplicar efeito)
3. O histórico com payload é ferramenta de depuração **gratuita**. Dá para validar o ciclo do webhook olhando o painel, sem instrumentar nada

**Cadastrar a URL e gerar o token de callback não custa crédito.** Isso pode e deve ser feito **antes** de qualquer chamada paga.

### 9.3 Identidade individual no Escavador exige contrato

A tela *Organização e Usuários* mostra 1 usuário e o aviso: *"Vários usuários por conta exigem contrato ativo."* Gestão multiusuário e funções são recurso comercial.

Relação com **R-11**: no Escavador, a identidade individual da equipe **não é obtenível hoje**. Isso reforça o desenho já adotado — a identidade que importa é a do nosso lado (n8n + MCP), e o token do Escavador é credencial de **aplicação**, não de pessoa. O painel só precisa saber *qual aplicação* chamou, e para isso um token por aplicação basta.

### 9.4 Recarga não é autosserviço

A tela *Comprar Créditos* não vende: *"entre em contato com nosso time comercial para avaliarmos sua necessidade e liberar o link de compra."*

**Isso é risco de prazo, não de dinheiro.** Recarregar depende de atendimento humano — pode levar dias. Se o crédito acabar no meio de uma etapa de desenvolvimento, o projeto para até o comercial responder. Registrado como **R-22**.

### 9.5 Alerta de saldo nativo

*Uso dos Créditos* tem **"Alerta de saldo — receba aviso por e-mail quando seu saldo ficar abaixo do limite definido"**. É um disjuntor externo, de graça, que complementa o nosso. Configurar assim que houver saldo pago.

### 9.6 Certificados digitais são opcionais e estão vazios

A tela *Certificados Digitais* está vazia. O R-12 (a API armazena certificado, senha e semente de 2FA do advogado) permanece **gravíssimo em tese**, mas **inerte na prática**: nada foi registrado, e o desenho (D-30) mantém essas rotas fora de todo perfil. Continua assim.

## 10. O que perguntar ao suporte — custo zero

Na mesma mensagem do pedido de prorrogação:

1. **Prorrogação do bônus** — o teste foi liberado antes de a arquitetura estar pronta para exercitar webhook
2. ~~Confirmação da data de expiração~~ — ✅ resolvido: o painel exibe "Válido até 23/08/2026"
3. **O que significa o `*` nos preços da V2?**
4. **A tabela de Serviços e Preços é a de catálogo, ou está limitada a R$ 3,00 por causa do bônus?** (§7)
5. **Por que o monitoramento com documentos públicos é mais barato que o sem?**
6. **Qual o limite de requisições por minuto?** Não aparece no painel
7. **Existe ambiente de homologação sem cobrança?** O Playground usa token real

## 11. Fontes

Todas lidas em 2026-08-20 no painel autenticado, via navegador controlado na máquina do usuário:

`/painel` · `/servicos` (V1 e V2) · `/creditos` · `/historico-creditos` · `/faturas` · `/requisicoes` · `/monitoramentos` · `/callbacks` · `/tokens` · `/organizacao` · `/certificados` · `/playground` (os 9 serviços percorridos, **sem executar nenhuma consulta**)

`/tokens/criar` foi lida em seguida, pelo print enviado pelo usuário — a página está bloqueada para esta sessão por ser criação de credencial. Não lida: `/changelogs`.
