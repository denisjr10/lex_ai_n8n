# Painel da API do Escavador — Achados

| Campo | Valor |
|---|---|
| Versão | 1.0 |
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
| Saldo | **R$ 50,00** (bônus lançado em 13/08/2026 15:38) |
| Consumido | **R$ 0,00** · **0 requisições** |
| Plano contratado | **"Sem contrato ativo"** |
| Usuários na organização | **1** — Dênis Júnior Oliveira Rodrigues, Administrador, conta principal |
| Tokens de acesso | **1** — `Testes_Claude`, criado 20/08/2026, expira 23/08/2027, **nunca utilizado** |
| URL de callback cadastrada | **Nenhuma** |
| Token de validação de callback | **Não gerado** |
| Monitoramentos ativos (V1 e V2) | **Nenhum** |
| Certificados digitais da OAB | **Nenhum** |
| Faturas | Nenhuma |

**O painel não exibe data de expiração do bônus.** Os 10 dias (23/08/2026) existem apenas na palavra do suporte, não na interface. Vale pedir confirmação por escrito junto com o pedido de prorrogação.

## 3. Pendências de §15 resolvidas

| # | Pendência | Situação agora |
|---|---|---|
| 1 | Tabela de preços por rota | ✅ **Resolvida** — transcrita nas §5 e §6 abaixo |
| 2 | Quais rotas são gratuitas | ✅ **Resolvida, e a resposta é "nenhuma"** — todo serviço listado tem preço. O que existe são rotas **baratas** (R$ 0,05) |
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

Não dá para distinguir as duas sem perguntar ao suporte — e essa pergunta é gratuita. **Ela entra na mesma mensagem do pedido de prorrogação.**

O que **vale sob qualquer leitura**, e é o achado operacional do dia:

> **O teto de "16 requisições" é o pior caso, não um limite fixo.** R$ 50,00 compram 16 chamadas se todas custarem R$ 3,00 — ou **1.000 chamadas** de `Envolvidos do processo` a R$ 0,05.

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

### 9.1 Tokens do Escavador têm permissão — ao contrário do Trello

A tela *Playground* recusa o token existente com a mensagem: *"Crie um token com permissão de Playground para começar."* Ou seja, **o token do Escavador carrega permissões escolhidas na criação**, e a tela *Histórico das Requisições* permite **filtrar por token**.

Isso é o oposto do R-16 do Trello (token único que enxerga a conta inteira, sem escopo). No Escavador dá para:

- emitir **um token por aplicação** — n8n, MCP de leitura, MCP de monitoramento
- **atribuir a chamada ao token** que a fez, no painel, sem instrumentação nossa
- **revogar um token** sem derrubar os demais

🔴 **Pendente:** a lista completa de permissões disponíveis não foi lida — a página `/tokens/criar` foi bloqueada pelo modo de segurança desta sessão, por ser criação de credencial. **O usuário precisa abrir essa tela e informar quais opções existem.** É o que falta para desenhar a matriz de tokens.

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
2. **Confirmação da data de expiração por escrito** — o painel não a exibe
3. **O que significa o `*` nos preços da V2?**
4. **A tabela de Serviços e Preços é a de catálogo, ou está limitada a R$ 3,00 por causa do bônus?** (§7)
5. **Por que o monitoramento com documentos públicos é mais barato que o sem?**
6. **Qual o limite de requisições por minuto?** Não aparece no painel
7. **Existe ambiente de homologação sem cobrança?** O Playground usa token real

## 11. Fontes

Todas lidas em 2026-08-20 no painel autenticado, via navegador controlado na máquina do usuário:

`/painel` · `/servicos` (V1 e V2) · `/creditos` · `/historico-creditos` · `/faturas` · `/requisicoes` · `/monitoramentos` · `/callbacks` · `/tokens` · `/organizacao` · `/certificados` · `/playground`

Não lidas: `/tokens/criar` (bloqueada por ser criação de credencial) e `/changelogs`.
