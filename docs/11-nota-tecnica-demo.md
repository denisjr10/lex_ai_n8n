# Nota Técnica 03 — Demonstração ao vivo para o escritório, antes do contrato

| Campo | Valor |
|---|---|
| Status | Para decisão |
| Versão | 1.0 |
| Data | 2026-08-21 |
| Responde a | (1) Dá para mostrar algo funcionando antes de fechar o contrato? (2) Um agente para colaborador no Telegram e outro para cliente no WhatsApp? (3) Isso bagunça o desenvolvimento? Precisa copiar o repositório? (4) Dá para fazer com as rotas baratas do Escavador? |
| Decisões geradas | D-86 a D-94 (ver `01-diretrizes-gerais.md` §13) |
| Riscos gerados | R-33 a R-36 (ver `01-diretrizes-gerais.md` §15) |
| Documentos afetados | `06-orcamento-de-chamadas-escavador.md` (a captura reaproveita os Blocos A e B), `08-prd.md` (§13 — a demo pode responder perguntas abertas), `00-estado-atual.md` |

---

## 1. Resposta curta

**Sim, dá — e sai mais barato do que parecia.** As quatro dúvidas têm respostas diferentes:

| Pergunta | Resposta |
|---|---|
| Dá para demonstrar antes do contrato? | ✅ **Sim.** Dois fluxos no n8n, sem código de arquitetura, em cerca de dois dias de trabalho |
| Custa crédito do Escavador? | ✅ **R$ 0,00 incrementais.** A demo consome as respostas dos Blocos A e B do orçamento, que já estavam previstas para validar contrato. Nenhuma chamada nova |
| Precisa copiar o repositório? | ❌ **Não — e copiar é o pior caminho.** Branch descartável e pasta `demo/` no mesmo repositório |
| Dá para usar as rotas "de centavos"? | ⚠️ **Não como imaginado.** As duas perguntas naturais da demo — capa e movimentações — custam R$ 3,00 cada. As gratuitas são só as de *status* do ciclo assíncrono, e sozinhas não servem para nada |

> **O achado central desta nota:** a demo não precisa de chamada nenhuma à API. Ela lê o mesmo instantâneo que os Blocos A e B vão produzir de qualquer jeito. O custo incremental em crédito é **zero**, e a demo continua funcionando depois de o bônus expirar.

---

## 2. O que a prorrogação mudou — e o que não mudou

A prorrogação concedida em 21/08 (mais 10 dias) **tira a pressa, mas não muda a proposta**. Duas consequências:

**1. A captura deixa de ser corrida.** Na versão anterior desta proposta, a captura precisava acontecer em 48 horas ou o saldo evaporaria. Agora ela pode esperar o número CNJ real chegar sem sobressalto e — melhor ainda — pode ser executada **pelo próprio chassi**, quando os marcos 1 a 5 estiverem prontos, validando o motor de custo de verdade em vez de um script avulso.

**2. A pergunta aberta da §1-C do orçamento é a única que aperta.** Se o débito durante o bônus for de **R$ 3,00 fixos por rota**, o teto passa a ser **16 requisições**, não R$ 50,00. E aí a demo e a validação de contrato disputariam a mesma cota:

| Cenário | Blocos A+B+C+D (validação) | Captura da demo | Total | Cabe? |
|---|---|---|---|---|
| **Tabela por rota** (otimista) | ~R$ 15,23 · 9 chamadas | R$ 0,00 · 0 chamadas novas | R$ 15,23 | ✅ Folga enorme |
| **R$ 3,00 fixos** (pessimista) | R$ 27,00 · 9 chamadas | R$ 0,00 · 0 chamadas novas | R$ 27,00 · 9 de 16 | ✅ Cabe, com 7 de folga |

**Em ambos os cenários a demo cabe, porque ela não adiciona chamadas.** É exatamente por isso que a captura é desenhada como reaproveitamento, e não como um orçamento paralelo (D-87). Registrado como **R-36**.

**A contrapartida combinada continua valendo.** A prorrogação foi concedida com uma razão declarada — validar callback — e o suporte pediu retorno. O **Bloco C mantém prioridade sobre a demo** no consumo da cota (D-94). Seria de má-fé gastar em vitrine comercial um crédito estendido para validação técnica; e não é preciso, porque a demo não gasta.

---

## 3. Por que fazer a demo — e por que ela é boa para o projeto

A demanda veio do escritório: eles querem ver antes de assinar. Isso é legítimo e comum. Mas a demo tem valor técnico próprio, além do comercial:

- **Responde perguntas do PRD sem questionário.** Vendo o agente funcionar, o escritório reage — e reação é informação melhor do que resposta a formulário. Em particular, **D-07** (advogado vê toda a base ou só a carteira) e **D-09** (Trello é gestão de casos ou quadro de tarefas) tendem a se responder sozinhas quando alguém vê a coisa recusando um acesso
- **Testa a hipótese mais frágil do produto:** que o cliente aceita conversar com um robô sobre o próprio processo. Se não aceitar, é melhor descobrir agora
- **Dá matéria-prima ao retorno prometido ao Escavador**, que mantém aberto o canal do comercial (R-22)
- **Exercita o tom.** O Provimento 205/2021 limita o modo como o escritório se comunica. Calibrar isso em demonstração é barato; calibrar em produção, não

---

## 4. O roteiro — o que o escritório vê

Duas conversas curtas que, juntas, contam a história inteira do projeto.

### 4.1 Demo A — colaborador no Telegram

| # | Pedido | O que aparece na tela |
|---|---|---|
| **A1** | "Como está o processo 0801234-…?" | Resumo em linguagem clara: partes, fase, últimas movimentações, o que mudou desde a última consulta |
| **A2** | "Redige um retorno para o cliente sobre isso" | O agente escreve a mensagem e **para**, pedindo aprovação: ✅ Aprovar e enviar · ✏️ Editar · ❌ Descartar |
| **A3** | *(alguém fora da lista tenta usar o bot)* | Recusa imediata, sem consultar nada |

### 4.2 Demo B — cliente no WhatsApp

| # | Pedido | O que aparece na tela |
|---|---|---|
| **B1** | "Oi, tem novidade no meu processo?" | Resposta sem juridiquês, só sobre **o processo vinculado àquele número cadastrado** |
| **B2** | "E o processo do meu irmão, o 0805678-…?" | **Recusa** — "esse processo não está vinculado ao seu cadastro" — e oferece falar com um humano |
| **B3** | *(consequência de B2)* | O pedido de atendimento humano cai no Telegram do colaborador, identificado |

### 4.3 O momento que decide

**Aprovar em A2 dispara o envio em B1.** O escritório vê a mensagem sair do Telegram do advogado e chegar no WhatsApp do cliente — **porque um humano clicou**.

Isso demonstra ao vivo as duas regras que sustentam o projeto inteiro:

| Regra | Onde aparece no roteiro |
|---|---|
| **Regra 2 — a IA propõe, o humano dispõe** | A2: o agente redige e para. Nada sai sem clique |
| **Regra 1 — o agente nunca é a fronteira de segurança** | B2 e A3: a recusa acontece em código, antes de o agente ser consultado. Não é instrução de texto, é verificação |

É mais convincente do que um robô que responde bonito — e é honesto, porque é o que o produto realmente faz.

---

## 5. Como a demo é construída — e por que ela é deliberadamente "errada"

A demo **viola de propósito** a arquitetura alvo. Isso é escolha, não descuido:

| Componente do projeto | Na demo | Por quê |
|---|---|---|
| `mcp-core` (chassi) | ❌ Ausente | Construir o chassi para uma vitrine de duas semanas é desperdício. Ele está sendo construído em paralelo, no lugar certo |
| Policy Gate, matriz de escopo | ❌ Substituído por lista de permissão fixa no n8n | Uma lista com 3 nomes e 2 telefones demonstra o conceito |
| Motor de custo, reserva, disjuntor | ❌ Ausente | A demo não chama API paga. Não há custo a controlar |
| Auditoria | ⚠️ Log simples do n8n | Suficiente para mostrar "quem pediu o quê" |
| Fonte do dado processual | ✅ Instantâneo em arquivo | **Antecipa D-63** — o agente do cliente lê da base interna, nunca da API paga sob demanda |
| Aprovação humana | ✅ Botão no Telegram | É o coração da demonstração |
| Verificação de identidade | ✅ Cadastro prévio número ↔ processo | **Antecipa D-08** — o número é chave de busca, nunca prova de identidade |

Repare no padrão: **o que a demo implementa é exatamente o que ela precisa demonstrar.** O resto é omitido conscientemente, e o `LEIA-ME.md` da pasta registra cada omissão.

---

## 6. Isolamento — não copie o repositório

Copiar o repositório separa a **memória do projeto** dos documentos. Os documentos são a única memória que sobrevive entre sessões; duplicá-los faz as duas cópias divergirem em uma semana. É o pior desfecho possível.

| | |
|---|---|
| **Onde** | Mesmo repositório, branch `claude/demo-vitrine`, saindo da branch de trabalho |
| **O quê** | Pasta `demo/` — workflows do n8n exportados em JSON, instantâneo anonimizado, `demo/LEIA-ME.md` |
| **Primeira linha do LEIA-ME** | "**Isto é descartável e não é a arquitetura do projeto.**" Seguida da tabela §5 acima |
| **Como descartar** | Apagar a branch. Os documentos ficam intactos |
| **O que volta para o projeto** | Um documento: `docs/12-nota-tecnica-demo-resultados.md`, com o que a demo ensinou e como o escritório reagiu. Isso alimenta o PRD |

### O risco real não é bagunçar o repositório

É **a demo virar produção**. "Já está funcionando, deixa assim, só liga no número de verdade." É a forma mais comum de um piloto matar um projeto bem desenhado — e é especialmente perigosa aqui, porque a demo não tem Policy Gate, não tem motor de custo e usa WhatsApp não oficial. Registrado como **R-33**, com o `LEIA-ME.md` e a D-86 como tratamento.

Risco irmão: **a demo cria expectativa de prazo.** Dois dias para a vitrine, meses para o produto — e a diferença é invisível para quem assiste. Precisa ser dito na apresentação, não depois. **R-35**.

---

## 7. WhatsApp não oficial — o conflito com a D-10

A **D-10** decide "somente WhatsApp oficial, sem biblioteca não oficial", e o **R-08** é banimento do número. Uazapi é biblioteca não oficial. O conflito é real e precisa de decisão formal, não de silêncio.

**Posição recomendada: admitir na demo, sob três condições inegociáveis (D-89).**

| # | Condição | Por quê |
|---|---|---|
| 1 | **Número descartável** — chip novo, jamais o número de atendimento do escritório | Banimento na demo é irrelevante. Banimento do número do escritório é incidente sério e irreversível |
| 2 | **Lista de permissão fechada** — só números cadastrados manualmente. Nenhum cliente real recebe mensagem | Sem isso, a demo vira atendimento sem governança |
| 3 | **Fica dito por escrito** que produção exige a API oficial da Meta, com prazo, homologação e custo próprios | Para o escritório não assinar achando que "já está pronto e é de graça" |

Se as três não valerem, a recomendação é **não fazer a Demo B** e demonstrar só o Telegram. A demonstração perde força; a decisão continua sendo do usuário.

---

## 8. LGPD, sigilo e ética profissional

A demo mexe com dado de processo real. Três salvaguardas:

- **O "cliente" da demo é pessoa do escritório ou o próprio usuário** — nunca um cliente real sem consentimento por escrito (D-90). Dado de processo é público em regra, mas *conversa sobre o processo* em canal não oficial não é
- **Aviso de IA em toda mensagem ao "cliente"** (D-92). Duas normas distintas, que não se confundem: a **Recomendação nº 001/2024 do CFOAB** orienta informar previamente o uso de IA na prestação do serviço — daí o aviso; o **Provimento 205/2021** exige publicidade informativa e sóbria — daí o tom: o agente informa, não vende, não promete resultado, não cria urgência
  - **Isto não é exigência da demo, é do produto.** O aviso já é **RF-26** do [PRD](08-prd.md), e §9.2 das [diretrizes](01-diretrizes-gerais.md) prevê ainda cláusula no contrato de honorários. A D-92 só impede que a demo dispense o aviso *por ser demo* — o que faria o escritório formar expectativa errada do que vai receber
  - **A forma difere.** Na demo, o aviso vai em **toda** mensagem, porque não há sessão, cadastro prévio nem contrato a que ancorá-lo. Em produção, RF-26 pede aviso **na abertura** da conversa e caminho de escalada disponível em qualquer ponto — repetir em cada mensagem viraria ruído, e ruído que ninguém lê não informa ninguém
- **O instantâneo entra no repositório anonimizado** — CPF, CNPJ e nome de parte substituídos por marcadores, conforme §9 das diretrizes e a D-48

E uma vedação explícita: **a demo não escreve em nenhum sistema real do escritório** (D-93). Não toca Trello, não lê e-mail, não grava no Drive. Ela lê um arquivo e envia mensagem para números da lista. Superfície mínima.

---

## 9. Custo real da demo

| Item | Custo | Observação |
|---|---|---|
| Crédito do Escavador | **R$ 0,00** | Reaproveita os Blocos A e B, já orçados |
| n8n | R$ 0,00 | Teste gratuito da nuvem (14 dias) ou Docker local com túnel |
| Provedor de IA | < R$ 5,00 | Umas poucas dezenas de mensagens |
| Uazapi | R$ 0,00 | O usuário já possui |
| Chip descartável | ~R$ 15,00 | Pré-pago |
| **Total** | **< R$ 25,00** | E sem consumir crédito do Escavador a mais |

**Esforço:** cerca de dois dias de trabalho depois que os pré-requisitos chegarem.

---

## 10. Pré-requisitos

| # | O que falta | De quem | Trava o quê |
|---|---|---|---|
| 1 | **1 ou 2 números CNJ reais** do escritório | Escritório | 🚧 Trava a captura — e já travava os Blocos A e B |
| 2 | Aval do orçamento de chamadas (Blocos A e B) | Usuário | 🚧 Regra 8 — nenhuma chamada sem aval |
| 3 | Onde roda o n8n durante a demo | Usuário | Não temos acesso à instância do cliente |
| 4 | Credenciais Uazapi + chip descartável | Usuário | Demo B |
| 5 | Chave do provedor de IA | Usuário | Ambas |
| 6 | Nome e telefone dos 2 ou 3 participantes | Escritório | Listas de permissão dos dois lados |
| 7 | Consentimento do "cliente" da demo | Usuário / escritório | §8 |

---

## 11. Ordem de trabalho

| Etapa | O que acontece | Depende de |
|---|---|---|
| **1. Captura** | Executar os Blocos A e B do orçamento sobre 1 ou 2 processos reais; salvar as respostas brutas; anonimizar | Pré-requisitos 1 e 2 |
| **2. Instantâneo** | Transformar as respostas brutas em um arquivo simples que os fluxos da demo consultam | Etapa 1 |
| **3. Demo A** | Bot do Telegram, lista de permissão, consulta e aprovação com botão | Etapa 2, pré-requisitos 3 e 5 |
| **4. Demo B** | Fluxo Uazapi, cadastro número ↔ processo, recusa fora de escopo, escalonamento | Etapa 3, pré-requisito 4 |
| **5. Ensaio** | Rodar o roteiro inteiro duas vezes antes de mostrar. Demonstração que trava não convence ninguém | Etapa 4 |
| **6. Apresentação** | Roteiro §4, com as ressalvas do §12 ditas em voz alta | Etapa 5 |
| **7. Retorno** | `docs/12-...-resultados.md`; retorno ao suporte do Escavador; descarte da branch | Etapa 6 |

---

## 12. O que precisa ser dito na apresentação

Não como letra miúda no fim — como parte do roteiro, porque a credibilidade da proposta depende disso:

1. **"Isto é uma maquete, não o produto."** Ela demonstra o comportamento, não a engenharia
2. **"O WhatsApp aqui é não oficial e o número é descartável."** Produção exige a API da Meta, com prazo e custo próprios
3. **"O dado é real, mas está congelado."** Consulta ao vivo custa dinheiro por chamada, e é justamente isso que o produto controla
4. **"Isto levou dois dias. O produto leva meses."** A diferença está no que não aparece na tela: controle de custo, auditoria, isolamento entre carteiras, tratamento de prazo
5. **"O que vocês estão vendo funcionar aqui é o mínimo. O que vocês não estão vendo é o que impede um vazamento e um prejuízo."**

---

## 13. Critério de sucesso

A demo **não** é bem-sucedida por impressionar. Ela é bem-sucedida se produzir três coisas:

| # | Resultado | Como se mede |
|---|---|---|
| 1 | **Decisão comercial** — o escritório avança ou não | Resposta objetiva, em vez de silêncio |
| 2 | **Respostas às perguntas abertas** — D-07, D-09 e a conta compartilhada (R-11) | O que o escritório disse ao ver a coisa funcionando |
| 3 | **Validação da hipótese do canal** — o cliente aceita falar com um robô sobre o próprio processo? | Reação de quem fez o papel de cliente |

Se a demo impressionar e não produzir nenhuma das três, ela custou dois dias e não ensinou nada.

---

## 14. Decisões propostas

| # | Decisão | Recomendação |
|---|---|---|
| **D-86** | A demo vive em branch descartável (`claude/demo-vitrine`) e pasta `demo/`, no mesmo repositório. **Nunca é promovida a produção.** O retorno ao projeto é um documento, não código | Adotar |
| **D-87** | A demo **não faz chamada nova ao Escavador.** Ela consome as respostas dos Blocos A e B, já orçadas. Custo incremental em crédito: R$ 0,00 | Adotar |
| **D-88** | A demo lê de **instantâneo local**, nunca da API ao vivo — antecipando a D-63 e sobrevivendo à expiração do bônus | Adotar |
| **D-89** | WhatsApp não oficial (Uazapi) é admitido **exclusivamente na demo**, sob as três condições da §7. A **D-10 permanece válida para produção**, sem exceção | Adotar |
| **D-90** | Nenhum cliente real participa da demo sem consentimento por escrito. O papel de cliente é feito por pessoa do escritório ou pelo usuário | Adotar |
| **D-91** | O roteiro **demonstra explicitamente a Regra 2 (aprovação humana) e a Regra 1 (verificação em código)**. Não são adornos de apresentação — são o produto | Adotar |
| **D-92** | Toda mensagem do agente ao "cliente" traz aviso de que é atendimento automatizado (Recomendação nº 001/2024 do CFOAB), em tom informativo e sóbrio (Provimento 205/2021). **Não cria a obrigação** — ela já é RF-26 do PRD; impede que a demo a dispense por ser demo | Adotar |
| **D-93** | A demo **não escreve em nenhum sistema real do escritório** — não toca Trello, e-mail nem Drive. Lê arquivo, envia mensagem para a lista | Adotar |
| **D-94** | O **Bloco C (callback) mantém prioridade** sobre a demo no consumo da cota de teste. A prorrogação foi concedida para validação técnica, e é isso que ela financia primeiro | Adotar |

## 15. Riscos gerados

| # | Risco | Impacto | Encaminhamento |
|---|---|---|---|
| **R-33** | **A demo vira produção** — "já funciona, deixa assim" —, colocando em uso um sistema sem Policy Gate, sem motor de custo e com WhatsApp não oficial | **Grave — anula o desenho de segurança inteiro** | D-86; `LEIA-ME.md` abrindo com a declaração de descarte; ressalva dita em voz alta na apresentação (§12) |
| **R-34** | Banimento do número usado na Uazapi, ou instabilidade de biblioteca não oficial no meio da demonstração | Moderado — constrangimento, não dano | Chip descartável (D-89); ensaio prévio (§11, etapa 5); a Demo A funciona sozinha se a B cair |
| **R-35** | A demo cria **expectativa de prazo e escopo** que a arquitetura real não cumpre no mesmo tempo | Moderado — comercial e de relacionamento | §12, itens 1 e 4, ditos na apresentação, não depois |
| **R-36** | Se o débito durante o bônus for **R$ 3,00 fixos**, o teto real é de 16 requisições, e captura e validação de contrato disputam a mesma cota | Operacional | D-87 elimina a disputa: a captura **é** a validação, não um consumo paralelo. D-94 define a ordem de prioridade |
