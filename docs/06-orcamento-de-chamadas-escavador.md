# Orçamento de Chamadas — API do Escavador

| Campo | Valor |
|---|---|
| Versão | 3.0 — **Vigilância criada (id `2813617`) e C2 confirmada gratuita. C1 voltou 422 por erro de corpo nosso, já corrigido** |
| Data | 2026-08-26 |
| Estado | ✅ **Em execução.** A, B, vigilância e C2 feitos. **Falta só o C1** (R$ 3,00), com o corpo corrigido |
| Saldo | **R$ 47,00** de R$ 50,00 — ⚠️ **a confirmar no painel**, por causa dos dois 422 sem cabeçalho de custo |
| Liberado em | **13/08/2026** |
| **Expira em** | ✅ **01/09/2026** — lido na barra lateral do painel em 25/08. **6 dias a partir de hoje** |
| Gastas até agora | **9 chamadas · R$ 3,00 medidos** — A1 R$ 0,05 · B1 R$ 2,95 · B2, origens, V1-criar e C2 R$ 0,00 · **dois 422 sem cabeçalho de custo, a conferir no painel** |

> Documento de controle. **Toda** chamada à API do Escavador passa por aqui — antes, para ser autorizada; depois, para registrar o que ensinou.

## 0. Autorização vigente — 26/08/2026

> **Ampliada em 26/08.** O usuário autorizou, no chat: executar os Blocos A e B,
> exercitar o Bloco C e criar **um monitoramento em diário oficial por OAB**.
> É o aval explícito na hora que a Regra 8 exige, e fica registrado aqui antes
> de qualquer execução.

| Item | Situação |
|---|---|
| **Blocos A e B** | ✅ **Autorizados** — 3 chamadas (A1 `envolvidos`, B1 `capa`, B2 `movimentações`) · **R$ 9,00** |
| **Bloco C** | ✅ **Autorizado em 26/08, reduzido em 26/08** — C1 `solicitar-atualizacao` (R$ 3,00) e C2 `status` (gratuita). **C4 RETIRADO** por decisão do usuário — D-110 |
| **Vigilância por OAB** | ✅ **CRIADA em 26/08 às 15:09 — id `2813617`.** Assinatura mensal ativa. 🔴 **Remover até 22/09** — `node captura/monitorar.mjs remover 2813617 --executar` |
| Bloco D | 🟡 Não autorizado. Parte dele já foi respondida de graça pelo 403 de 23/08 (§5.1) |
| **Teto desta autorização** | **R$ 15,00** em 5 chamadas pagas, de R$ 50,00 — eram R$ 18,00 antes de C4 sair |
| Processos disponíveis | **8**, extraídos dos autos em PDF fornecidos pelo escritório — ver §0.1 |
| Alcance | ✅ As 3 chamadas valem **só para o P1 (TJAP, saúde pública)**. Os demais ficam guardados, e ampliar exige novo aval |
| 🔄 Alvo trocado | **24/08:** o P1 anterior (TJPB, alimentos) está em **segredo de justiça**. Substituído — ver §0.1 |
| Token | ✅ **Fornecido e funcional** — a API autenticou; a recusa veio da cobrança, não da identidade |
| ✅ Saldo | **Liberado em 25/08 às 10:22**, a pedido do usuário. Painel: **"Válido até 01/09/2026"** — ver §5.2 |

### 0.1 Os processos — e por que o alvo mudou em 24/08

Até 23/08 havia dois números CNJ, fornecidos pelo usuário e conferidos sem custo pelo dígito verificador (Resolução CNJ 65/2008, validação aritmética local). Em 24/08 o escritório entregou os **autos completos de 6 processos em PDF**, e a leitura deles (custo zero — ver `demo/CONTRATO-DO-INSTANTANEO.md`) revelou **8 processos** e um fato que muda a autorização:

> 🔴 **Os dois processos autorizados até então estão em SEGREDO DE JUSTIÇA.** O P1 anterior (TJPB) é cumprimento de sentença de alimentos, vara de família, com parte identificada apenas por iniciais nos próprios autos — menor de idade.

Isso é impeditivo por dois motivos independentes:

1. **Risco de crédito.** Processo em segredo pode devolver resposta vazia ou restrita. R$ 3,00 gastos para receber pouco, sem que a Regra 4 (uma chamada, um objetivo registrado) se cumpra
2. **Risco de dado.** É o pior conteúdo possível para circular numa demonstração e num provedor de IA externo

**Novo alvo autorizado pelo usuário em 24/08 (D-96):**

| # | Tribunal | Ano | Segredo | Por que serve |
|---|---|---|---|---|
| **P1** | **TJAP** — Justiça Estadual do Amapá | 2025 | ❌ Não | Saúde pública, processo **ativo**, 44 entradas de linha do tempo nos autos. Formato atual, movimentação recente |
| P2 | TJPB | 2026 | 🔒 **Sim** | **Não autorizado** |
| P3 | TJAP | 2020 | 🔒 **Sim** | **Não autorizado** |

A trava virou código: `captura/capturar.mjs` **recusa executar** se o processo autorizado estiver marcado com segredo de justiça. Nota de rodapé não impede engano; código impede.

**Perda em relação ao plano anterior:** os dois tribunais diferentes (TJPB e TJAP) eram sorte útil para testar variação de formato. Com o novo alvo, ficamos só no TJAP. Fica registrado como folga a recuperar se houver recarga — mas **a variação entre tribunais já está parcialmente coberta de graça** pelos autos em PDF, que trouxeram TJAP, TJPB e TRT-8.

**Os números em si não entram no repositório** (D-95). Ficam em arquivo local ignorado pelo Git, lido pelo script de captura.

### 0.2 Correção de rota — `limit=5` não existe

O OpenAPI V2 foi lido em 23/08 (documentação pública, **custo zero**) e desmentiu um detalhe deste orçamento: o parâmetro `limit` de `envolvidos` e de `movimentacoes` **só aceita 20, 50 ou 100**. As chamadas A1 e B2 pediam `limit=5`.

Não é detalhe de estilo: valor fora do conjunto arrisca um **422**, e um 422 custa o mesmo que um 200. Corrigido para **20** — o menor aceito, que também é o padrão da API. `movimentacoes` ganhou ainda `ordem=desc`, para que as movimentações mais recentes venham primeiro, que é o que a demo precisa mostrar.

**Lição para o registro:** ler o OpenAPI antes de executar custou zero e evitou até duas chamadas perdidas — R$ 6,00 no pior caso. É a Regra 3 do orçamento funcionando.

**Os números em si não entram no repositório** (D-95). Eles ficam em arquivo local ignorado pelo Git, lido pelo script de captura. Número de processo é público em regra, mas *a lista de processos deste escritório* é informação sobre a carteira do cliente, e §9 das diretrizes mantém dado de cliente fora do histórico.

### 0.3 A documentação oficial da V1 corrigiu o mapeamento — 26/08, custo zero

Antes de gastar na vigilância por OAB, a documentação em `api.escavador.com/v1/docs` foi lida inteira. Ela **contradiz o nosso mapeamento em cinco pontos**, e dois deles custariam dinheiro:

| # | O mapeamento dizia | A documentação diz | Consequência |
|---|---|---|---|
| 1 | `origens_ids` **opcional** | **Obrigatório** quando `tipo = termo` | 🔴 **422 pago.** Um erro de parâmetro custa os mesmos R$ 3,00 de um acerto |
| 2 | `POST /monitoramentos/testcallback` **🆓** | **"Paga"** | 🔴 **R$ 3,00 inesperados.** Não é a rota barata de teste que supúnhamos |
| 3 | `POST /monitoramentos` **💰 recorrente** | **"Grátis"** no rótulo da rota | ⚠️ Contradiz o suporte (*"cobra na criação"*). Ver §0.4 |
| 4 | `variacoes` sem limite | **Máximo 3** | Trava de validação, não de custo |
| 5 | `limite_aparicoes` sem menção | Padrão **200/mês**, e **para de capturar** ao atingir | 🔴 **Risco de prazo**, não de dinheiro: vigilância que parou é publicação que ninguém viu (R-02) |

E a mesma leitura expôs **uma desatualização entre os nossos próprios documentos** — o que é um achado de processo, não de API:

| Item | §6 **deste** documento dizia | O que já era sabido |
|---|---|---|
| Limite de requisições | 🔴 *"Não aparece no painel. Perguntar ao suporte"* | **500/min**, registrado em `mapeamento-escavador.md` §2.2 **desde o mapeamento**, confirmado na documentação *e* no SDK (`DEFAULT_RATE_LIMIT = 500`) |
| Ambiente de homologação | ⚠️ *"Perguntar ao suporte"* | Encerrado em `07-painel-escavador-achados.md` §10 em 25/08: não há sandbox, e a pergunta foi rebaixada de propósito |

> **A lição não é sobre o Escavador, é sobre nós.** Duas perguntas seguiam marcadas como abertas neste documento depois de terem sido respondidas em outro. Numa sessão apressada, elas viram mensagem ao suporte — ou pior, chamada paga. **A §6 abaixo foi corrigida**, e o padrão a manter é: pendência se encerra em todos os documentos que a citam, não só naquele em que foi resolvida.

> **É a Regra 3 do orçamento pagando de novo.** Ler documentação custou zero e evitou pelo menos duas chamadas perdidas — R$ 6,00 — além de um monitoramento mudo por limite de aparições. O mapeamento foi escrito a partir do OpenAPI; a página de documentação é mais completa que ele.

### 0.4 O que ainda não fecha: "Grátis" na rota, cobrado na assinatura

O rótulo da rota `POST /api/v1/monitoramentos` diz **"Grátis"**. O painel lista *Monitoramento em Diários Oficiais* a **R$ 3,00 até 200 itens**. O suporte disse, por escrito, que **cobra na criação e a cada renovação**.

A leitura que concilia os três: **a requisição HTTP não debita por si**, mas registrar o monitoramento **abre uma assinatura**, e é a assinatura que cobra — a primeira vez no ato, depois a cada mês.

**Como este orçamento trata:** pelo pior caso, **R$ 3,00 na criação**. Se o débito não aparecer em *Uso dos Créditos*, ganhamos R$ 3,00 e um achado — e aí sim vale perguntar ao suporte, porque a diferença entre "grátis" e "assinatura" muda o modelo de custo de E2 inteiro.

### 0.5 Ordem de execução, e o que trava o quê

| Passo | O que é | Custo | Depende de |
|---|---|---|---|
| 1 | **Blocos A e B** — `captura/capturar.mjs --executar` | R$ 9,00 | Nada. Pode rodar agora |
| 2 | `GET /api/v1/origens` — `monitorar.mjs origens` | **R$ 0,00** | Nada. **Responde de graça se a V1 aceita o mesmo token** |
| 3 | Publicar o receptor no n8n | R$ 0,00 | Token de validação do callback |
| 4 | Cadastrar a URL no painel | R$ 0,00 | Passo 3. **Só o usuário faz** — é o painel autenticado dele |
| 5 | **Vigilância por OAB** — `monitorar.mjs criar` | R$ 3,00/mês | Passos 2 e 4 |
| 6 | **Bloco C** — C1 e C2 | R$ 3,00 | Passo 4 |

> **O passo 2 é o melhor negócio do orçamento inteiro:** gratuito, obrigatório para o passo 5, e encerra sozinho a última pergunta de autenticação em aberto — *a V1 aceita este mesmo token?* (§Bloco A). Era a pergunta que valia gastar R$ 3,00 "junto com uma chamada útil da V1". Não vale mais: ela sai de graça.

---

## 1. O que mudou com a cota de teste

O suporte do Escavador Business liberou saldo de teste mediante CNPJ. As condições informadas por escrito:

- **R$ 50,00** de saldo, válido por **10 dias**
- **Até 16 requisições**
- **R$ 3,00 por requisição — para qualquer rota, durante o período de teste**

Três consequências que mudam o planejamento:

**1. ~~Não existe rota gratuita agora.~~** ⚠️ **Corrigido em 20/08 pela conferência no Playground:** as rotas de **status** do ciclo assíncrono são **Gratuito**, mesmo durante a cota de teste. Ver `07-painel-escavador-achados.md` §5-A.

**2. A cota de teste não revela a tabela de preços.** Como o custo é fixo em R$ 3,00, o cabeçalho `Creditos-Utilizados` durante o teste não mede o preço real de cada rota. A pendência 1 de `mapeamento-escavador.md` §15 **continua aberta** e só se resolve no painel autenticado. Não gaste chamada tentando descobrir preço.

**3. 16 chamadas é pouco para 83 operações mapeadas.** O objetivo do teste não é cobrir a API — é validar **contrato**: autenticação funciona, o plano cobre V1 e V2, o formato dos dados é o que o mapeamento previu, e o webhook chega. Cobertura vem depois, com plano pago.

## 1-A. Prazo — **válido até 01/09/2026**

O saldo foi liberado em **13/08** com validade de 10 dias, o que o faria expirar em 23/08. **Em 21/08 o suporte concedeu mais 10 dias**, por escrito, reconhecendo que o teste começou antes de a arquitetura estar pronta para exercitar callback.

> *"Normalmente o saldo de teste não é renovável. Mas, como você ainda não utilizou os créditos e precisa validar justamente a parte de callback agora que a arquitetura está avançando, vou abrir uma exceção e estender o período por mais 10 dias."* — suporte Escavador B2B, 21/08/2026

⚠️ **A prorrogação não chegou a valer sozinha.** Em 23/08 a API recusou a primeira chamada com `403 — "Seu saldo está bloqueado"` (§5.1, R-37). Foi preciso apontar o bloqueio ao suporte em 25/08, e aí sim ele liberou — **com validade até 01/09/2026**, conforme o painel (§5.2). O que segue nesta seção passou a valer de fato.

**A data efetiva é a da barra lateral do painel** ("Válido até") — não a da conversa. Promessa em atendimento não é estado de sistema, e essa é a lição que o R-37 registra.

O que a prorrogação muda:

- **O Bloco C volta ao plano.** Validar o ciclo de callback era justamente o que não cabia no prazo antigo, e é a razão declarada da exceção. Deixar de exercitá-lo agora seria desperdiçar a cortesia
- **A pressa deixa de comandar a ordem.** A execução pode esperar os marcos 1 a 5 da fundação (§15 da Spec), de modo que a chamada real valide o chassi de verdade, e não um script avulso
- **A contrapartida está combinada:** o suporte pediu retorno sobre como foram os testes. É barato, é justo, e mantém o canal aberto para a recarga, que não é autosserviço (R-22)

### Ordem de execução sob prazo curto

| Prioridade | Bloco | Depende de | Cabe em 3 dias? |
|---|---|---|---|
| 1 | **A** — autenticação e cobertura do plano | Só do token | ✅ Sim, agora |
| 2 | **B** — estrutura de dados | Token + um número de processo do escritório | ✅ Sim, agora |
| 3 | **D** — formato dos erros | Só do token | ✅ Sim, é rápido |
| 4 | **C** — assincronia e webhook | URL pública de callback cadastrada no painel | ⚠️ Só com prorrogação, ou com túnel local montado a tempo |

Se a prorrogação não vier, as 4 chamadas do Bloco C e as 2 de reserva devem ser realocadas antes de 23/08 — provavelmente para ampliar o Bloco B (mais um processo, de outro tribunal, para ver o quanto o formato varia entre tribunais). Variação entre tribunais é uma incógnita real do modelo de dados e vale crédito.

## 1-B. O que a leitura do painel mudou — revisão 2.0

Em 2026-08-20 o painel autenticado foi lido inteiro, **sem gastar crédito**. Os achados estão em `07-painel-escavador-achados.md`. Três deles reescrevem este orçamento:

**1. Nem toda requisição custa R$ 3,00.** A tela *Serviços e Preços* mostra preços de **R$ 0,05 a R$ 3,00**. `Envolvidos do processo` custa **R$ 0,05** — sessenta vezes menos que o assumido. O teto de "16 requisições" é o pior caso, não um limite.

**2. Quatro chamadas do orçamento viraram desnecessárias.** O painel entrega de graça o que elas comprariam: catálogo de serviços (dispensa A3 e A4), monitoramentos ativos (dispensa parte de A2), saldo e consumo (dispensa parte de A1).

**3. O Bloco C está destravado do lado do Escavador.** Não há URL de callback cadastrada — nada a quebrar — e cadastrá-la, junto com o token de validação, **não custa crédito**. O que falta para o Bloco C é só a URL pública (túnel na máquina local), não permissão nem dinheiro.

> **A consequência maior:** dinheiro deixou de ser o gargalo. Com preços reais, R$ 50,00 cobrem o programa de testes inteiro com folga larga. **O gargalo é o prazo** — 23/08/2026 — e a dependência de um número de processo real do escritório.

### A chamada nº 1 é, de graça, a calibragem de preço

`Envolvidos do processo` (R$ 0,05) responde quatro perguntas de uma vez, pelo menor preço da tabela:

1. O token autentica na V2?
2. Qual o envelope e a paginação da V2?
3. Como o envolvido é identificado? (bloqueia `sujeitos_autorizados`, R-06)
4. **O preço cobrado foi R$ 0,05 ou R$ 3,00?** — basta abrir *Uso dos Créditos* depois. Isso resolve a dúvida da §7 dos achados (a tabela é catálogo real ou está limitada pelo bônus?) sem custo adicional

Ela **depende do número CNJ do processo**. Enquanto ele não chega, a recomendação é **não gastar nada**: qualquer chamada que não precise de CNJ custa R$ 3,00 e ensina menos.

## 1-C. ~~✅ Resolvido em 25/08~~ — ⚠️ **SUPERADO PELA MEDIÇÃO EM 26/08**

> 🔴 **Leia a §5.3 antes desta seção.** O que segue é o que o suporte informou por escrito em 25/08, e o que este orçamento assumiu por um dia. A execução de 26/08 mediu os débitos reais e **desmentiu a tarifa plana**: A1 custou R$ 0,05, B1 custou R$ 2,95 e B2 custou R$ 0,00. O débito segue o catálogo por rota.
>
> A seção fica preservada de propósito. O registro de que a fonte oficial informou uma coisa e o sistema fez outra é, ele mesmo, um dado sobre a confiabilidade da fonte — e é a segunda vez (a primeira foi o R-37, a prorrogação prometida que não existia na conta). Virou **D-108: o custo real vem da medição, não da declaração**.

### O que o suporte informou — 25/08

> *"Durante o período de teste, toda requisição paga custa R$ 3,00, independentemente do valor exibido na tabela do pré-pago. As rotas gratuitas continuam sem consumo. Quando o período de teste acabar, a conta volta para os valores normais de cada rota."* — suporte Escavador B2B, 25/08/2026

**As duas leituras estavam certas sobre objetos diferentes:** a tabela do painel é o catálogo real do pré-pago, e o débito durante o bônus é fixo. Consequências para este orçamento:

1. **O teto de 16 requisições volta a valer** — mas conta só as **pagas**. Rotas gratuitas não consomem cota nem saldo
2. **A calibragem de preço morreu no teste.** D-55 previa medir o preço real de cada rota conferindo *Uso dos Créditos*; durante o bônus toda chamada paga marca R$ 3,00. A medição fica para o pré-pago — e, de todo modo, o catálogo já está transcrito
3. **Escolher a variante barata de uma rota não economiza nada agora.** `documentos_publicos` a R$ 0,20 custa os mesmos R$ 3,00 durante o teste. A escolha volta a importar no pré-pago
4. **O total revisado sobe de ~R$ 15,23 para R$ 21,00** — ver §3

O registro histórico da contradição, que levou à pergunta:

| Fonte | O que diz |
|---|---|
| Liberação da cota (13/08) | **R$ 3,00 por requisição, para qualquer rota**, durante o teste |
| Suporte por escrito (14/08) | *"Não, após o período de teste a tabela retorna aos valores do pré pago. **Cada rota possui uma cobrança**."* |
| Painel e Playground (20/08) | Preços diferenciados por rota — **R$ 0,00**, R$ 0,05, R$ 0,08, R$ 0,20, R$ 0,75 e R$ 3,00 |

A leitura foi confirmada: **a tabela exibida é o catálogo pré-pago** (por isso tem preços diferenciados), e **o débito durante a cota de teste é de R$ 3,00 fixos por requisição paga**.

A postura de orçar pelo pior caso, adotada enquanto a resposta não vinha, era a certa — e o pior caso se confirmou. É a Regra 8 funcionando: na dúvida, orçar caro e não gastar.

> ✅ **Destravado no mesmo dia.** O usuário apontou o bloqueio ao suporte às 10:16 de 25/08 e a resposta veio às 10:22: *"Liberado novamente"*. O painel passou a exibir **"Válido até 01/09/2026"**. Ver §5.2.

## 2. Princípio de alocação

Cada uma das 16 chamadas precisa responder uma pergunta que **a documentação não responde** e que **bloqueia decisão de arquitetura**. Se a resposta está no OpenAPI, no SDK oficial ou no mapeamento, não é chamada — é leitura.

Ordem de prioridade:

1. **O plano cobre o que precisamos?** (R-15 — se V1 não estiver no plano, o escritório fica sem diário oficial, que é o gatilho de prazo)
2. **O formato dos dados é o que o mapeamento previu?** (define o modelo de dados do MCP)
3. **O ciclo assíncrono e o webhook funcionam ponta a ponta?** (define o chassi)
4. **Como são os erros?** (calibra o disjuntor)

## 3. Orçamento proposto

**14 chamadas alocadas, 2 de reserva.** Nenhuma é executada sem aval.

> ⚠️ **Os blocos abaixo foram revistos na versão 2.0.** Os valores são os do painel; onde há `*`, o painel exibe um asterisco sem nota de rodapé (§10 dos achados).

### Bloco A — Autenticação · 1 chamada · **R$ 3,00**

Era de 4 chamadas e R$ 12,00. O painel respondeu A3 (catálogo e diário oficial), A4 (jurisprudência ativa) e a maior parte de A1 e A2 de graça.

| # | Chamada | Preço | O que responde |
|---|---|---|---|
| A1 | `GET /api/v2/processos/numero_cnj/{cnj}/envolvidos?limit=20` | **R$ 3,00** (catálogo: R$ 0,05) | Autenticação na V2 · envelope e paginação · modelo do envolvido |

> A calibragem saiu do nome do bloco: com R$ 3,00 fixos no teste, não há preço a medir (§1-C). Continua valendo conferir *Uso dos Créditos* depois da chamada — mas para confirmar o débito fixo, não para descobrir o preço da rota.

**Chamadas removidas do Bloco A:**

| Removida | Por quê |
|---|---|
| ~~`GET /api/v1/quantidade-creditos`~~ | Saldo, consumo e custo médio estão em *Uso dos Créditos* |
| ~~`GET /api/v2/monitoramentos/processos`~~ | A tela *Monitoramentos* mostra V1 e V2, e ambas estão vazias |
| ~~`GET /api/v1/origens`~~ | R-15 encerrado pelo painel: a V1 está disponível, com diário oficial |
| ~~`GET /api/v1/jurisprudencias/busca`~~ | Jurisprudência e Legislação aparecem como categorias com preço → estão ativas |

Fica pendente uma única pergunta de autenticação que o painel não responde: **a V1 aceita este mesmo token?** Ela só importa quando o MCP for usar a V1 (diário oficial). Vale gastar R$ 3,00 nela **junto** com uma chamada útil da V1 — não isolada.

### Bloco B — Estrutura de dados · 3 chamadas · **R$ 9,00**

Todas sobre **o mesmo processo real do escritório** usado em A1, para que as respostas se conversem. B3 saiu do bloco porque virou a chamada A1.

| # | Chamada | Preço | O que responde |
|---|---|---|---|
| B1 | `GET /api/v2/processos/numero_cnj/{cnj}` (Capa do processo) | R$ 3,00 * | Modelo do processo: campos, tipos, o que vem nulo na prática |
| B2 | `GET /api/v2/processos/numero_cnj/{cnj}/movimentacoes?limit=20&ordem=desc` | R$ 3,00 * | Modelo da movimentação — é a peça que dispara prazo |
| B4 | `GET /api/v2/envolvido/processos?cpf_cnpj={cnpj}&limit=5` | R$ 3,00 (até 200 itens) | Caminho "todos os processos deste cliente" — a consulta mais comum do agente |

> ~~Bônus barato: `Resumo de um Processo por IA` custa R$ 0,05.~~ **Não durante o teste** — custaria os mesmos R$ 3,00. Fica como candidato natural para a primeira semana do plano pré-pago.

### Bloco C — Assincronia e webhook · 2 chamadas · **R$ 3,00**

**Passo zero, gratuito e a fazer já:** cadastrar a URL de callback e gerar o token de validação em `api.escavador.com/callbacks`. O campo está vazio — não há integração do escritório a quebrar (pendência 7 encerrada). Isso não consome crédito e é pré-requisito de C1.

C3 saiu: a tela *Callbacks* já mostra o histórico de entregas — evento, URL, tentativas, status e payload — de graça.

**C4 saiu em 26/08, por decisão do usuário (D-110).** Ele validaria o contrato de `POST /api/v2/monitoramentos/processos` — monitoramento **por processo**, que é exatamente a rota que a **D-62 rejeitou** em favor da vigilância em diário oficial por termo. Gastar R$ 3,00 e assinar custo recorrente para conhecer o contrato de algo que o projeto decidiu não usar é pagar duas vezes pela mesma resposta: a vigilância por OAB, já autorizada, exercita o mesmo ciclo (criar → cobrar → renovar → remover) na rota que **vai** para produção.

**Como rodar** — `captura/atualizar.mjs`, script próprio, separado do `capturar.mjs` porque aquele tem fila fixa de GETs e teto travado na autorização dos Blocos A e B:

```
node captura/atualizar.mjs solicitar                          # ensaio, não gasta
node captura/atualizar.mjs solicitar --executar --confirmo-custo   # C1, R$ 3,00
node captura/atualizar.mjs status --executar                  # C2, gratuita, repita à vontade
```

| # | Chamada | Preço | O que responde |
|---|---|---|---|
| C1 | `POST .../solicitar-atualizacao` — corpo `{enviar_callback: 1, documentos_publicos: 0, autos: 0}` | R$ 3,00 | Formato do aceite assíncrono **e disparo real do callback** — a única prova de ponta a ponta de que o receptor no n8n atende. Configuração mínima de propósito |
| C2 | `GET .../status-atualizacao` | **Gratuito** | Máquina de estados da atualização. O Playground confirma: custo zero. **Não consome cota** e pode ser repetida à vontade |
| ~~C4~~ | ~~`POST /api/v2/monitoramentos/processos`~~ | ~~R$ 3,00~~ | **RETIRADO em 26/08 (D-110)** — valida a rota que a D-62 rejeitou |

> ⚠️ **O aprendizado do C4 sobrevive à retirada dele** (§11.2 dos achados): monitoramento cobra **na criação** e **de novo a cada renovação mensal**, enquanto estiver ativo. Removido antes da renovação, não há cobrança no ciclo seguinte. Isso vale igual para a vigilância por OAB, que ficou no lugar do C4.
>
> **Ação obrigatória:** anotar a data de criação e **remover o monitoramento antes de completar um mês**. Esquecer é cobrança nova — e, no pré-pago, recorrência indefinida (R-13).
>
> ✅ **O callback recebido não consome crédito nem cota** — confirmado pelo suporte em 25/08. O custo é do monitoramento, não do volume de eventos.

### Bloco D — Erros · 2 chamadas · R$ 6,00

| # | Chamada | O que responde |
|---|---|---|
| D1 | `GET /api/v2/processos/numero_cnj/0000000-00.0000.0.00.0000` | Formato do erro para CNJ inválido/inexistente |
| D2 | Qualquer rota com token propositalmente inválido | Formato do 401. **Provavelmente não consome cota** — rejeição antes do processamento. A confirmar em A1, comparando o saldo |

### Total revisado

Recalculado em 25/08 pela regra confirmada: **R$ 3,00 por requisição paga; rotas gratuitas não consomem saldo nem cota.**

| Bloco | Pagas | Gratuitas | Custo |
|---|---|---|---|
| A — autenticação | 1 | — | R$ 3,00 |
| B — estrutura de dados | 3 | — | R$ 9,00 |
| C — assincronia e webhook | 1 | 1 (C2) | R$ 3,00 |
| D — erros | 1 | 1 (D2, provável) | R$ 3,00 |
| **Total** | **6** | **2** | **R$ 18,00 de R$ 50,00** |

**Sobram R$ 29,00 — cerca de 9 requisições pagas.** Devem ser gastas, não guardadas: crédito não usado evapora no fim da prorrogação. Destino recomendado, em ordem:

1. **A V1 na prática** — uma consulta de diário oficial. É o gatilho de prazo, é a parte que a V2 não cobre, e responde de quebra a única pergunta de autenticação em aberto: **a V1 aceita o mesmo token?**
2. **Um monitoramento em diário oficial por OAB** — é o coração de E2 e de D-62. Vale exercitar o ciclo completo: criar, receber a aparição por callback, conferir o formato. Mesma regra de C4: **anotar a data e remover antes da renovação**
3. **Um segundo processo, de outro tribunal** — a variação de formato entre tribunais é incógnita real do modelo de dados do MCP
4. ~~Repetir A1 em processos diferentes a R$ 0,05~~ — sem sentido no teste: cada repetição custa R$ 3,00 cheios

## 4. O que **não** entra no orçamento

| Não fazer | Por quê |
|---|---|
| Consultar preço por rota | A tabela está no painel, e o Playground mostra o custo antes de executar — ambos de graça |
| Paginar em laço | Cada bloco de 200 itens custa R$ 3,00 nas rotas de listagem (R-25) |
| Testar autos restritos, certificado digital ou senha do advogado | R-12, D-30 — fora de todo perfil por decisão de projeto |
| Buscar por nome livre (`GET /api/v1/busca`) | Rota de resultado imprevisível; alto risco de gastar sem aprender |
| Baixar PDF de documento ou de diário | Custo variável, e o formato do binário não está em questão |
| Solicitar resumo por IA | Útil, mas não bloqueia arquitetura nenhuma. Fica para o plano pago |
| Repetir chamada já feita | A resposta bruta fica salva em arquivo |
| Lote, laço ou varredura | Queima a cota inteira em uma execução |

## 5. Registro de execução

Preencher **a cada chamada**, imediatamente. Resposta não registrada é crédito perdido.

| # | Data/hora | Rota | HTTP | `Creditos-Utilizados` | Saldo restante | O que ensinou |
|---|---|---|---|---|---|---|
| A1 | 2026-08-23 15:13 UTC | `GET /api/v2/.../envolvidos?limit=20` | **403** | **ausente** | R$ 50,00 (nada debitado) | Ver §5.1 — três achados, custo zero |
| A1 | 2026-08-26 13:36 UTC | `GET /api/v2/.../envolvidos?limit=20` | **200** | **5** → R$ 0,05 | R$ 49,95 | Autenticação V2 ok, envelope e paginação. **E derrubou a regra dos R$ 3,00 fixos** — ver §5.3 |
| B1 | 2026-08-26 13:36 UTC | `GET /api/v2/processos/numero_cnj/{cnj}` | **200** | **295** → R$ 2,95 | R$ 47,00 | Modelo do processo. Preço de catálogo era R$ 3,00 com `*`: o asterisco é real, e o valor varia |
| B2 | 2026-08-26 13:37 UTC | `GET /api/v2/.../movimentacoes?limit=20&ordem=desc` | **200** | **0** → **R$ 0,00** | R$ 47,00 | Modelo da movimentação — **de graça**. A peça que dispara prazo não custou nada |
| V1-origens | 2026-08-26 13:37 UTC | `GET /api/v1/origens` | **200** | **0** → R$ 0,00 | R$ 47,00 | ✅ **A V1 aceita o mesmo token** — última pergunta de autenticação encerrada, sem custo. E os 185 diários, com os 5 do Amapá |
| V1-criar | 2026-08-26 15:09 UTC | `POST /api/v1/monitoramentos` | **200** | **0** → R$ 0,00 | R$ 47,00 | ✅ **Vigilância criada — id `2813617`**, 5 diários de 181, franquia **1000/mês** (não os 200 documentados). **Criar a assinatura debitou 0 da cota**: a cobrança do monitoramento não passa pelo cabeçalho, só aparece no inventário |
| V1-criar | 2026-08-26 17:43 UTC | `POST /api/v1/monitoramentos` | **422** | ausente | R$ 47,00 (a confirmar) | ❌ *"Você já monitora este termo"* — tentativa duplicada, porque ninguém leu o registro de 15:09. **A API impediu a segunda assinatura; o script não impedia.** Agora impede (D-115) |
| C1 | 2026-08-26 17:44 UTC | `POST /api/v2/.../solicitar-atualizacao` | **422** | ausente | R$ 47,00 (a confirmar) | ❌ *"Não é possível solicitar atualização de documentos públicos e autos ao mesmo tempo"* — mandamos os dois como `0`, e **a API decide pela presença da chave, não pelo valor** (D-113). Corpo corrigido para só `enviar_callback: 1` |
| C2 | 2026-08-26 17:45 UTC | `GET /api/v2/.../status-atualizacao` | **200** | **0** → R$ 0,00 | R$ 47,00 | ✅ **Gratuita, confirmado.** Campos: `numero_cnj`, `data_ultima_verificacao`, `tempo_desde_ultima_verificacao` (texto pronto, *"há 1 semana"*), `ultima_verificacao` (**null** quando não há solicitação em curso) e `opcoes` |
| C1 | 2026-08-26 18:09 UTC | `POST /api/v2/.../solicitar-atualizacao` — corpo `{enviar_callback: 1}` | **201** | **0** → **R$ 0,00** | R$ 47,00 | ✅ **Aceite assíncrono, e de graça.** Solicitação `55413945`, `status: PENDENTE`, `enviar_callback: "SIM"`. Ver §5.5 |
| C2 | 2026-08-26 18:11 UTC | `GET /api/v2/.../status-atualizacao` | **200** | **0** → R$ 0,00 | R$ 47,00 | ✅ Com solicitação em curso, `ultima_verificacao` deixa de ser `null` e passa a **espelhar o objeto do C1**. Ver §5.5 |

**Gasto total até aqui: R$ 3,00 de R$ 50,00.** Restam **R$ 47,00** e 5 dias.

> ⚠️ **Os dois 422 de 26/08 não trouxeram o cabeçalho `Creditos-Utilizados`.** Provavelmente não cobraram — mas *provavelmente* não é confirmação, e o saldo de R$ 47,00 só é certo depois de conferir "Uso dos Créditos" no painel. **Pendência aberta.**

> 🔎 **A máquina de estados do C2, no estado de repouso.** Sem solicitação em curso, `ultima_verificacao` vem `null` e `opcoes` vem vazio; o que existe é a data da última verificação feita pelo próprio Escavador. Ou seja: **`null` não significa erro, significa "nada pedido"**. O chassi precisa distinguir os dois, e essa é metade da resposta que o C1 vai completar.

### 5.3 A regra dos R$ 3,00 fixos não se confirmou — 26/08

O suporte afirmou por escrito, em 25/08:

> *"Durante o período de teste, toda requisição paga custa R$ 3,00, independentemente do valor exibido na tabela do pré-pago."*

**A medição desmente.** Os quatro débitos lidos do cabeçalho `Creditos-Utilizados`, em centavos:

| Chamada | Medido | Catálogo do painel | Bate? |
|---|---|---|---|
| A1 · envolvidos | **5** (R$ 0,05) | R$ 0,05 | ✅ exato |
| B1 · capa | **295** (R$ 2,95) | R$ 3,00 `*` | ≈ (o `*` é preço variável — D-105) |
| B2 · movimentações | **0** | R$ 3,00 `*` | ❌ veio grátis |
| origens (V1) | **0** | não listada | ✅ D-59: ausência da tabela = gratuita |

**O débito segue o catálogo por rota, não a tarifa plana.** Três consequências:

1. **O orçamento tinha inflado.** Blocos A e B custaram **R$ 3,00**, não os R$ 21,00 recalculados na v2.6 pelo pior caso. Sobram R$ 47,00, não R$ 29,00
2. **Escolher a variante barata volta a economizar** — a §1-C dizia que não fazia diferença no teste. Faz
3. **D-55 ressuscita.** A calibragem de preço pela medição, que a §1-C tinha dado por morta durante o bônus, está viva e já produziu quatro pontos de dado

**A postura de orçar pelo pior caso continua certa** — foi ela que impediu de gastar contando com preços baixos. O que muda é a fonte: **medição acima de declaração**. Registrado como **D-108**.

> ⚠️ **A §1-C deste documento e a §11.1 dos achados ficam marcadas como superadas por medição.** Não foram apagadas: o registro de que o suporte informou uma coisa e o sistema fez outra é, ele mesmo, um dado sobre a confiabilidade da fonte — a mesma lição do R-37, em que uma prorrogação prometida por escrito não existia na conta.

### 5.5 A máquina de estados da atualização — 26/08, por R$ 0,00

O Bloco C entregou o que existia para entregar, e **sem debitar um centavo**: tanto o C1 quanto o C2 voltaram `Creditos-Utilizados: 0`.

**O objeto da solicitação, idêntico nas duas rotas:**

| Campo | No aceite (C1, HTTP 201) | O que significa |
|---|---|---|
| `id` | `55413945` | Identificador da solicitação. É a chave de idempotência natural |
| `status` | `PENDENTE` | O estado. Único valor observado até agora |
| `motivo_erro` | `null` | Preenchido quando falha — é onde o diagnóstico vai morar |
| `criado_em` | `2026-08-26T18:09:14+00:00` | Início do relógio |
| `concluido_em` | `null` | **Enquanto for `null`, não terminou** |
| `enviar_callback` | `"SIM"` | Texto, não booleano — coerente com o `1`/`0` do corpo |
| `opcoes` | `[]` | Vazio nesta configuração mínima |

**A descoberta que o chassi precisa:** o status **não fica na raiz** da resposta do C2. Ele vem dentro de `ultima_verificacao`, e esse campo tem dois significados distintos:

| `ultima_verificacao` | Leitura correta |
|---|---|
| `null` | **Nada foi pedido.** Não é erro, não é falha — é repouso. O que existe é `data_ultima_verificacao`, a verificação que o Escavador faz por conta própria |
| objeto com `status` | Há uma solicitação, e o estado dela está aí dentro |

Confundir os dois é ler "nunca pedi" como "deu errado" — e um chassi que erra nisso ou alarma à toa, ou fica esperando para sempre. **`concluido_em` é o sinal confiável de término**, mais que o texto do `status`.

> ⚠️ **O callback só dispara na conclusão.** Enquanto o estado é `PENDENTE`, o n8n **não recebe nada** — e isso é o comportamento correto, não uma falha de configuração. O receptor só pode ser considerado reprovado se `concluido_em` estiver preenchido **e** mesmo assim não houver execução no fluxo.

**Ainda em aberto:** os demais estados (sucesso, erro, e como se distingue "terminou com novidade" de "terminou sem nada"). Todos se descobrem repetindo o C2, que é **gratuito**.

### 5.4 O receptor de callback ficou de pé — 26/08

Publicado no n8n como `[LEX] Receptor de callback do Escavador` (`OymAtbNYI1pjfWkA`), **ativo**. Custo: R$ 0,00 — é infraestrutura nossa, não a API do Escavador.

**A URL não é a que o editor do n8n sugere.** O n8n publica webhook no host de `WEBHOOK_URL`, que nesta instância é outro domínio: o editor abre em `auto.criativeia.com.br`, e o webhook atende em `callback.criativeia.com.br`. O usuário percebeu a divergência antes de cadastrar. Fica registrado porque o erro seria mudo: a URL do editor responde hoje, e pararia de responder no dia em que o editor fosse fechado ao público — vigilância silenciando sem erro, que é R-02.

**Também não confundir com a "Test URL"** (`/webhook-test/`): ela só vive enquanto o botão *Listen for test event* está apertado, recebe uma execução e devolve 404 depois. Cadastrada no Escavador, funcionaria uma vez.

Verificado ao vivo: duas chamadas de teste chegaram e o porteiro carimbou `veredito=RECUSADO` nas duas, por ausência do cabeçalho `Authorization` — a validação por segredo compartilhado funcionando. **URL cadastrada no painel em 26/08**, sem que o painel exibisse qualquer verificação própria.

### 5.1 O que a chamada A1 ensinou — por R$ 0,00

A primeira chamada real do projeto foi recusada. Ela não custou nada e respondeu três perguntas:

**1. O saldo está bloqueado, e a prorrogação não chegou à conta.**

```
HTTP 403
{"error":"Seu saldo está bloqueado. Faça uma recarga para voltar a utilizar a API."}
```

O cabeçalho `Date` da resposta marca **23/08/2026** — a data original de expiração. O suporte prometeu por escrito, em 21/08, "estender o período por mais 10 dias", mas **a extensão não foi aplicada**. Promessa em conversa não é estado de sistema. Registrado como **R-37**.

**2. O token está correto — e isso se sabe pelo código do erro.**

Token inválido responde **401**. O **403** significa que a autenticação passou e quem recusou foi a cobrança. É informação útil: não há nada a corrigir do nosso lado.

**3. 🆕 O erro de saldo é 403, e o OpenAPI não o documenta.**

A especificação lista, para esta rota, apenas `200, 401, 402, 404, 422`. **403 não consta.** O erro de pagamento documentado é o 402 — mas o que a API devolve de verdade, com saldo bloqueado, é 403.

Isso **muda o disjuntor** (§11 das diretrizes, D-33): um servidor MCP que só tratasse 402 como "sem crédito" leria o 403 como problema de permissão e reagiria errado — provavelmente tentando de novo, ou culpando o escopo do usuário em vez de avisar que o dinheiro acabou. O envelope também fica conhecido: `{"error": "<texto em português>"}`, sem código de máquina.

**Parte do Bloco D foi respondida sem gastar um centavo** — justamente a pergunta que a §6 dizia que "só se observa gastando".

> **A trava do script funcionou como projetada.** A fila abortou na primeira chamada, que é a mais barata do catálogo por escolha de ordenação. As duas de R$ 3,00 nunca aconteceram. Sem essa trava, o mesmo 403 teria sido recebido três vezes.

As respostas brutas ficam em `docs/amostras/escavador/` (a criar), com CPF, CNPJ e nome de parte **substituídos por marcadores** antes do commit — dado de cliente não entra no repositório (LGPD, §9 das diretrizes).

### 5.2 O desbloqueio — 25/08/2026

O usuário apontou o bloqueio ao suporte, e a solução veio em **seis minutos**:

> — *"O saldo está constando aqui como bloqueado."* (10:16)
> — *"Liberado novamente."* (10:22)

**O painel passou a exibir "Válido até 01/09/2026"** — sete dias a partir do desbloqueio, e não os dez prometidos em 21/08 contados de 23/08. A data que vale é a do painel, e é ela que este documento adota.

**R-37 encerrado.** A lição, porém, fica registrada e não expira com o risco: **promessa em atendimento não é estado de sistema.** A prorrogação foi concedida por escrito em 21/08 e simplesmente não existiu na conta até alguém tentar usar. Duas consequências permanentes para o projeto:

1. **Antes de qualquer execução paga, conferir o painel** — saldo e "Válido até". É gratuito e leva segundos
2. **O disjuntor do MCP trata `403` como falta de saldo**, não como problema de permissão (§5.1). Foi a tentativa recusada que ensinou isso, e ela custou R$ 0,00

**Estado atual:** R$ 50,00 intactos, 7 dias de validade, Blocos A e B autorizados, alvo definido (P1, TJAP, sem segredo de justiça). **Nada impede a execução.**

## 6. Pendências que a cota de teste **não** resolve

Continuam dependendo do painel autenticado ou do escritório:

Revisado em 2026-08-20 — a maior parte foi resolvida pelo painel:

| Pendência | Situação |
|---|---|
| ~~Tabela de preços por rota (§15.1)~~ | ✅ Lida no painel — `07-painel-escavador-achados.md` §5 e §6 |
| ~~Quais rotas são gratuitas (§15.2)~~ | ✅ Nenhuma é gratuita; várias são baratas |
| ~~Uma URL de callback por conta é suficiente? (§15.7)~~ | ✅ Campo vazio — nada a quebrar |
| ~~Quantos tokens existem e de quem são (R-11)~~ | ✅ Um token, `Testes_Claude`, nunca usado |
| ~~Existe ambiente de homologação? (§15.5)~~ | ✅ **Encerrada** — não há sandbox. Já estava resolvida em `07-painel-escavador-achados.md` §10 (25/08); esta linha estava desatualizada |
| ~~Limite de requisições por minuto~~ | ✅ **Encerrada — 500/min.** Já estava em `mapeamento-escavador.md` §2.2 desde o mapeamento, confirmado na documentação e no SDK; esta linha estava desatualizada |
| ~~A tabela de preços é catálogo ou está limitada pelo bônus?~~ | ✅ **Encerrada pela medição em 26/08** — é o catálogo real, e o débito o segue. Ver §5.3 |
| Formato dos erros 402 e 429 (§15.4) | 🟡 Parcialmente respondido de graça: o **403** de saldo bloqueado está documentado em §5.1. Faltam 402 e 429 |

## 7. Decisões que este documento propõe

| # | Decisão | Recomendação |
|---|---|---|
| **D-47** | Chamada à API do Escavador só ocorre se constar de orçamento aprovado; fora dele, exige aval explícito na hora | Adotar |
| **D-48** | Toda resposta da API é salva bruta em arquivo, anonimizada, e nunca reconsultada | Adotar |
| **D-49** | A cota de teste é gasta em validação de **contrato**, não em cobertura de superfície nem em descoberta de preço | Adotar |
| **D-50** | Recarga paga do Escavador é decisão exclusiva do usuário, tomada com o registro de execução §5 à vista | Adotar |
| **D-95** | **Número CNJ de processo real não entra no repositório.** Vive em arquivo local ignorado pelo Git, lido pelo script de captura. Número é público em regra, mas a lista de processos do escritório é informação sobre a carteira do cliente (§9 das diretrizes) | Adotar |
