# Orçamento de Chamadas — API do Escavador

| Campo | Valor |
|---|---|
| Versão | 2.3 — **Blocos A e B autorizados pelo usuário** |
| Data | 2026-08-21 |
| Estado | ✅ **Blocos A e B autorizados** em 21/08/2026 · Blocos C e D seguem 🟡 aguardando aval |
| Saldo | R$ 50,00 · 🚧 **débito real por chamada em aberto** — ver §1-C |
| Liberado em | **13/08/2026** |
| **Expira em** | ✅ **Prorrogado em 21/08 por mais 10 dias.** Data exata a confirmar na barra lateral do painel ("Válido até") |
| Gastas até agora | **0** |

> Documento de controle. **Toda** chamada à API do Escavador passa por aqui — antes, para ser autorizada; depois, para registrar o que ensinou.

## 0. Autorização vigente — 21/08/2026

| Item | Situação |
|---|---|
| **Blocos A e B** | ✅ **Autorizados** — 3 chamadas (A1 `envolvidos`, B1 `capa`, B2 `movimentações`) |
| Blocos C e D | 🟡 Não autorizados ainda |
| Processos disponíveis | **2**, ambos com dígito verificador conferido, de **tribunais diferentes** (TJPB e TJAP) — ver §0.1 |
| Alcance | ✅ **Resolvido em 21/08:** as 3 chamadas valem **só para o P1 (TJPB)**. O P2 fica guardado, e ampliar exige novo aval |
| 🚧 Pendente de acesso | **O valor do token não está disponível na sessão.** Sem ele nada executa |

### 0.1 Os processos — e por que eles não estão escritos aqui

Os dois números CNJ foram fornecidos pelo usuário em 21/08 e **conferidos sem custo** pelo dígito verificador (Resolução CNJ 65/2008, validação aritmética local):

| # | Tribunal | Ano | Por que serve |
|---|---|---|---|
| P1 | **TJPB** — Justiça Estadual da Paraíba | 2026 | Processo recente: poucas movimentações, formato atual |
| P2 | **TJAP** — Justiça Estadual do Amapá | 2020 | Processo antigo: histórico longo, e **outro tribunal** |

Serem de tribunais diferentes é sorte útil: a §3 deste documento já apontava "um segundo processo, de outro tribunal" como o melhor destino da folga, porque **a variação de formato entre tribunais é incógnita real do modelo de dados** do MCP. Os dois processos cobrem também extremos de idade — o que testa se movimentação antiga vem com o mesmo formato da recente.

### 0.2 Correção de rota — `limit=5` não existe

O OpenAPI V2 foi lido em 21/08 (documentação pública, **custo zero**) e desmentiu um detalhe deste orçamento: o parâmetro `limit` de `envolvidos` e de `movimentacoes` **só aceita 20, 50 ou 100**. As chamadas A1 e B2 pediam `limit=5`.

Não é detalhe de estilo: valor fora do conjunto arrisca um **422**, e um 422 custa o mesmo que um 200. Corrigido para **20** — o menor aceito, que também é o padrão da API. `movimentacoes` ganhou ainda `ordem=desc`, para que as movimentações mais recentes venham primeiro, que é o que a demo precisa mostrar.

**Lição para o registro:** ler o OpenAPI antes de executar custou zero e evitou até duas chamadas perdidas — R$ 6,00 no pior caso. É a Regra 3 do orçamento funcionando.

**Os números em si não entram no repositório** (D-95). Eles ficam em arquivo local ignorado pelo Git, lido pelo script de captura. Número de processo é público em regra, mas *a lista de processos deste escritório* é informação sobre a carteira do cliente, e §9 das diretrizes mantém dado de cliente fora do histórico.

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

## 1-A. Prazo — prorrogado em 21/08/2026

O saldo foi liberado em **13/08** com validade de 10 dias, o que o faria expirar em 23/08. **Em 21/08 o suporte concedeu mais 10 dias**, por escrito, reconhecendo que o teste começou antes de a arquitetura estar pronta para exercitar callback.

> *"Normalmente o saldo de teste não é renovável. Mas, como você ainda não utilizou os créditos e precisa validar justamente a parte de callback agora que a arquitetura está avançando, vou abrir uma exceção e estender o período por mais 10 dias."* — suporte Escavador B2B, 21/08/2026

**A data exata deve ser confirmada na barra lateral do painel** ("Válido até"), que é onde ela aparece de forma autoritativa — não precisa perguntar.

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

## 1-C. 🚧 A pergunta que ainda decide o tamanho deste orçamento

Há uma contradição aberta entre duas informações do próprio suporte, e ela vale entre **16 chamadas** e **cerca de mil**:

| Fonte | O que diz |
|---|---|
| Liberação da cota (13/08) | **R$ 3,00 por requisição, para qualquer rota**, durante o teste |
| Suporte por escrito (14/08) | *"Não, após o período de teste a tabela retorna aos valores do pré pago. **Cada rota possui uma cobrança**."* |
| Painel e Playground (20/08) | Preços diferenciados por rota — **R$ 0,00**, R$ 0,05, R$ 0,08, R$ 0,20, R$ 0,75 e R$ 3,00 |

A leitura mais provável concilia as três: **a tabela exibida é o catálogo pré-pago** (por isso tem preços diferenciados), mas **o débito durante a cota de teste pode ser de R$ 3,00 fixos por requisição**, independentemente da rota.

Se for assim, o orçamento revisado de ~R$ 15,23 em 9 chamadas passa a custar **R$ 27,00**, e as rotas de status deixam de ser gratuitas enquanto durar o bônus.

**Como resolver, em ordem de custo:**

1. **Perguntar ao suporte** — custo zero, e é a pergunta de maior valor que resta (§10 dos [achados](07-painel-escavador-achados.md))
2. **Medir na primeira chamada** — executar a chamada A1 (`envolvidos`, catálogo R$ 0,05) e conferir *Uso dos Créditos* logo depois. Se o saldo cair R$ 0,05, vale a tabela; se cair R$ 3,00, vale o fixo. A calibragem é gratuita e vem de carona (D-55)

Enquanto a resposta não vier, **o orçamento opera pelo pior caso: R$ 3,00 por chamada.** É a postura que a Regra 8 exige — na dúvida, orçar caro e não gastar.

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

### Bloco A — Autenticação e calibragem · 1 chamada · **R$ 0,05**

Era de 4 chamadas e R$ 12,00. O painel respondeu A3 (catálogo e diário oficial), A4 (jurisprudência ativa) e a maior parte de A1 e A2 de graça.

| # | Chamada | Preço | O que responde |
|---|---|---|---|
| A1 | `GET /api/v2/processos/numero_cnj/{cnj}/envolvidos?limit=20` | **R$ 0,05** | Autenticação na V2 · envelope e paginação · modelo do envolvido · **e o preço realmente cobrado** (conferir em *Uso dos Créditos* logo depois) |

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

> Bônus barato, se A1 mostrar que o processo já tem resumo por IA: `Resumo de um Processo por IA` custa **R$ 0,05**. Vale a pena — o resumo é matéria-prima direta para o agente.

### Bloco C — Assincronia e webhook · 3 chamadas · **R$ 3,18**

**Passo zero, gratuito e a fazer já:** cadastrar a URL de callback e gerar o token de validação em `api.escavador.com/callbacks`. O campo está vazio — não há integração do escritório a quebrar (pendência 7 encerrada). Isso não consome crédito e é pré-requisito de C1.

C3 saiu: a tela *Callbacks* já mostra o histórico de entregas — evento, URL, tentativas, status e payload — de graça.

| # | Chamada | Preço | O que responde |
|---|---|---|---|
| C1 | `POST .../solicitar-atualizacao` — `documentos_publicos: false`, `autos: false` | R$ 3,00 * | Formato do aceite assíncrono. Configuração mínima de propósito. **Se `documentos_publicos: true` custa só R$ 0,20**, vale considerar a variante barata |
| C2 | `GET .../status-atualizacao` | **Gratuito** | Máquina de estados da atualização. O Playground confirma: custo zero. Pode ser repetida à vontade |
| C4 | `POST /api/v2/monitoramentos/processos` — frequência **mensal com documentos públicos** | **R$ 0,18 / mês** | Contrato de criação de monitoramento, na variante mais barata da tabela |

> ⚠️ **C4 gera custo recorrente.** O monitoramento criado deve ser removido assim que o contrato for confirmado (remover não custa no plano; na cota de teste, custa uma chamada — decidir na hora se compensa).
>
> O callback **recebido** não é requisição nossa e não consome cota.

### Bloco D — Erros · 2 chamadas · R$ 6,00

| # | Chamada | O que responde |
|---|---|---|
| D1 | `GET /api/v2/processos/numero_cnj/0000000-00.0000.0.00.0000` | Formato do erro para CNJ inválido/inexistente |
| D2 | Qualquer rota com token propositalmente inválido | Formato do 401. **Provavelmente não consome cota** — rejeição antes do processamento. A confirmar em A1, comparando o saldo |

### Total revisado

| Bloco | Chamadas | Custo |
|---|---|---|
| A — autenticação e calibragem | 1 | R$ 0,05 |
| B — estrutura de dados | 3 | R$ 9,00 |
| C — assincronia e webhook | 3 | R$ 3,18 (C2 é gratuita) |
| D — erros | 2 | ~R$ 3,00 (D2 provavelmente não cobra) |
| **Total** | **9** | **~R$ 15,23 de R$ 50,00** |

**Sobram cerca de R$ 35,00** — folga que na versão 1.1 não existia. Ela deve ser gasta, não guardada: crédito não usado até 23/08 evapora. Destino recomendado, em ordem:

1. **Um segundo processo, de outro tribunal** — a variação de formato entre tribunais é incógnita real do modelo de dados do MCP
2. **A V1 na prática** — uma consulta de diário oficial, que é o gatilho de prazo e a parte que a V2 não cobre
3. **Repetir A1 em processos diferentes a R$ 0,05** — dezenas de amostras do modelo de envolvido por quase nada

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
| — | — | — | — | — | R$ 50,00 | Nenhuma chamada executada ainda |

As respostas brutas ficam em `docs/amostras/escavador/` (a criar), com CPF, CNPJ e nome de parte **substituídos por marcadores** antes do commit — dado de cliente não entra no repositório (LGPD, §9 das diretrizes).

## 6. Pendências que a cota de teste **não** resolve

Continuam dependendo do painel autenticado ou do escritório:

Revisado em 2026-08-20 — a maior parte foi resolvida pelo painel:

| Pendência | Situação |
|---|---|
| ~~Tabela de preços por rota (§15.1)~~ | ✅ Lida no painel — `07-painel-escavador-achados.md` §5 e §6 |
| ~~Quais rotas são gratuitas (§15.2)~~ | ✅ Nenhuma é gratuita; várias são baratas |
| ~~Uma URL de callback por conta é suficiente? (§15.7)~~ | ✅ Campo vazio — nada a quebrar |
| ~~Quantos tokens existem e de quem são (R-11)~~ | ✅ Um token, `Testes_Claude`, nunca usado |
| Existe ambiente de homologação? (§15.5) | ⚠️ Não há sandbox; o Playground usa token real. **Perguntar ao suporte** |
| Limite de requisições por minuto | 🔴 Não aparece no painel. **Perguntar ao suporte** |
| A tabela de preços é catálogo ou está limitada pelo bônus? | 🔴 **Perguntar ao suporte** — e a chamada A1 dá um indício de graça |
| Formato dos erros 402 e 429 (§15.4) | 🔴 Só se observa gastando — Bloco D |

## 7. Decisões que este documento propõe

| # | Decisão | Recomendação |
|---|---|---|
| **D-47** | Chamada à API do Escavador só ocorre se constar de orçamento aprovado; fora dele, exige aval explícito na hora | Adotar |
| **D-48** | Toda resposta da API é salva bruta em arquivo, anonimizada, e nunca reconsultada | Adotar |
| **D-49** | A cota de teste é gasta em validação de **contrato**, não em cobertura de superfície nem em descoberta de preço | Adotar |
| **D-50** | Recarga paga do Escavador é decisão exclusiva do usuário, tomada com o registro de execução §5 à vista | Adotar |
| **D-95** | **Número CNJ de processo real não entra no repositório.** Vive em arquivo local ignorado pelo Git, lido pelo script de captura. Número é público em regra, mas a lista de processos do escritório é informação sobre a carteira do cliente (§9 das diretrizes) | Adotar |
