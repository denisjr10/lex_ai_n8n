# PRD — Plataforma de Automação e Agentes de IA para Escritório de Advocacia

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Data | 2026-08-20 |
| Estado | 🟡 **Proposta — aguarda aval do usuário** |
| Fase | 2 — PRD e Spec |
| Antecede | `09-spec-tecnica.md` (a escrever) |
| Herda de | `01-diretrizes-gerais.md`, `04-modelo-de-identidade-e-autorizacao.md`, `mapeamento-escavador.md`, `mapeamento-trello.md`, `07-painel-escavador-achados.md` |

> **O que este documento é.** A definição do **produto**: quem usa, o que faz, com que regras, a que custo e como se sabe que deu certo. Ele não descreve implementação — isso é da Spec. Onde uma decisão de produto depende de resposta do escritório, o requisito está marcado 🚧 e opera sob premissa declarada.

---

## 1. Sumário executivo

O escritório opera hoje de forma manual em três frentes que consomem tempo qualificado sem produzir valor jurídico: **responder clientes** sobre o andamento dos próprios processos, **acompanhar publicações e movimentações** para não perder prazo, e **registrar e triar demandas** que chegam por e-mail.

A plataforma automatiza essas três frentes com agentes de IA orquestrados em **n8n**, apoiados em uma camada de integração construída como **servidores MCP reutilizáveis** (*Model Context Protocol* — padrão que expõe capacidades a agentes de IA de forma estruturada). O acesso a dado de cliente é controlado por papel, verificado em código, e toda ação de efeito externo passa por aprovação humana.

**O que muda para o escritório, em ordem de valor:**

1. Prazo deixa de depender de alguém lembrar de olhar o diário oficial
2. Cliente obtém status do próprio processo sem consumir tempo de advogado
3. Nenhuma demanda que chega por e-mail fica sem registro rastreável
4. O escritório passa a saber o que a IA fez, para quem e a que custo

**O que a plataforma deliberadamente não faz:** não peticiona, não emite parecer, não estima chance de êxito, não envia nada para fora sem um humano aprovar o texto exato.

---

## 2. Problema

### 2.1 Situação atual

| Dor | Consequência hoje |
|---|---|
| Acompanhamento de publicação e movimentação é manual | **Risco de perda de prazo** — o pior cenário possível deste projeto |
| Cliente liga ou manda mensagem para saber do processo | Tempo de advogado consumido em informação que é factual e pública |
| Demanda chega por e-mail e depende de alguém registrar | Demanda perdida, ou registrada tarde, ou registrada duas vezes |
| Consulta a tribunal é repetitiva e manual | Trabalho qualificado gasto em tarefa mecânica |
| Não há registro de quem consultou o quê | Impossível auditar acesso a dado sob sigilo profissional |

### 2.2 Por que agora

A API do Escavador cobre o dado que falta (processos, movimentações, diários oficiais, jurisprudência) e o escritório já usa Trello para organizar trabalho. As duas superfícies foram mapeadas — 83 operações no Escavador, 261 no Trello — e os preços reais foram levantados. O caminho está aberto e mensurável.

### 2.3 Resultados esperados

Herdados de `01-diretrizes-gerais.md` §1.1, agora com métrica associada — ver §10.

1. Cliente obtém status do próprio processo sem consumir tempo de advogado ou colaborador
2. Nenhuma demanda que chega por e-mail se perde ou fica sem registro rastreável
3. Consultas a tribunais e andamentos deixam de ser trabalho manual repetitivo
4. O escritório mantém controle e auditoria sobre o que a IA fez, para quem e a que custo
5. A camada de integração é reaproveitável em projetos futuros sem reescrita

---

## 3. Usuários e papéis

Quatro papéis, herdados de `01` §5.1. O PRD acrescenta o que cada um **espera do produto**.

| Papel | Quem é | Canal | O que espera |
|---|---|---|---|
| **Cliente** | Pessoa ou empresa com vínculo contratual ativo | WhatsApp | Saber como está o processo dele, a qualquer hora, sem esperar |
| **Colaborador** | Equipe administrativa, estagiários, paralegais | Canal interno, e-mail | Não precisar consultar tribunal manualmente; ter a demanda já registrada e triada |
| **Advogado** | Advogado(a) inscrito(a) atuante | Canal interno, e-mail | Não perder prazo; revisar rápido o que a IA propôs; ter fonte para tudo que a IA afirma |
| **Administrador** | Sócio responsável ou TI | Painel administrativo | Saber o custo, controlar quem acessa o quê, auditar |

### 3.1 O que separa cliente de todo o resto

O cliente é o único papel que acessa a plataforma **de fora**, por um canal que não autentica ninguém de verdade — o número de WhatsApp é identificador fraco (chip trocado, clonado ou emprestado). Isso não é detalhe de implementação: é o que define metade dos requisitos de segurança do produto.

**RN-01** — O número de telefone é **chave de busca**, nunca prova de identidade. Nenhum dado processual é revelado antes de verificação adicional (§6.1).

---

## 4. Escopo do produto

### 4.1 Entregas, em ordem

O produto vai ao ar em quatro entregas. A ordem é deliberada e **o atendimento ao cliente é a última**, mesmo sendo a mais visível — é a de maior risco reputacional e a que depende de todas as outras estarem maduras.

| Entrega | Conteúdo | Quem passa a usar | Encerra quando |
|---|---|---|---|
| **E1 · Fundação e consulta processual** | Identidade, Policy Gate, auditoria, custo, MCP Escavador | Advogados e colaboradores, pelo canal interno | Uma consulta processual roda ponta a ponta, autorizada, auditada e com custo registrado |
| **E2 · Vigilância de prazo** | Monitoramento de diário oficial e de movimentação, com alerta no canal interno | Advogados | Uma publicação em diário oficial vira alerta no canal interno, no mesmo dia, sem ninguém pedir |
| **E3 · Demandas e organização** | Ingestão de e-mail, classificação, registro, Trello, rascunho de resposta com aprovação | Colaboradores e advogados | Nenhum e-mail entra sem gerar registro rastreável; resposta só sai aprovada |
| **E4 · Atendimento ao cliente** | WhatsApp, em piloto restrito antes de ampliar | Clientes | Piloto com grupo controlado atendido sem escalada indevida |

> **Por que E2 vem antes de E3.** Perda de prazo é o pior desfecho possível do projeto e a dor mais cara do escritório. E2 é também a entrega mais barata em crédito (§9.3). E3 depende de decisões do escritório que ainda não vieram (D-09, perguntas 26 e 27).

### 4.2 Fora de escopo

Herdado de `01` §2.2, reafirmado aqui como compromisso de produto. Nenhum destes entra sem decisão formal:

- Peticionamento ou protocolo automático em sistema de tribunal
- Parecer, orientação jurídica ou estimativa de chance de êxito ao cliente sem revisão de advogado
- Substituição do sistema de gestão jurídica do escritório — a plataforma **integra**
- Migração de dados históricos
- Aplicativo próprio para clientes — o canal é WhatsApp
- Assinatura digital e uso de certificado digital da OAB (§7.4)
- Operação sobre autos sob segredo de justiça na primeira entrega

---

## 5. Requisitos funcionais

Numerados `RF-nn`. Cada um traz **critério de aceite** — a condição objetiva que diz se está pronto.

### 5.1 E1 — Fundação e consulta processual

| # | Requisito | Critério de aceite |
|---|---|---|
| **RF-01** | Cada pessoa da equipe tem identidade individual na plataforma, com autenticação nominal e segundo fator | Duas pessoas distintas produzem registros de auditoria distintos ao fazer a mesma consulta. Conta compartilhada é rejeitada 🚧 R-11 |
| **RF-02** | Um agente interno responde perguntas sobre processo em linguagem natural, pelo canal interno | Pergunta "como está o processo X?" devolve situação, última movimentação e data, com a fonte identificada |
| **RF-03** | Toda afirmação factual do agente aponta a fonte e a idade do dado | Nenhuma resposta contém fato processual sem origem (cache ou API) e data. Resposta sem fonte é bug, não estilo |
| **RF-04** | O agente enxerga apenas as ferramentas que o papel do solicitante permite | Colaborador não vê `remover_monitoramento` na lista de ferramentas. Advogado vê |
| **RF-05** | Toda chamada paga é registrada com solicitante, papel, processo, ferramenta, custo e resultado | O painel de custo reconstrói qualquer gasto até a pessoa que o originou |
| **RF-06** | Consulta repetida ao mesmo dado dentro da validade é servida por cache, sem custo | Duas consultas ao mesmo processo em 1 hora geram uma cobrança, não duas |
| **RF-07** | O sistema recusa consulta fora do escopo do papel, em código, antes da chamada paga | Cliente consultando CPF de terceiro recebe recusa **sem que a API seja chamada** — não gasta crédito e não vaza a existência do dado |
| **RF-08** | O administrador vê consumo de crédito por pessoa, por papel e por período | Painel responde "quem gastou o quê no mês" sem consulta manual ao banco |

### 5.2 E2 — Vigilância de prazo

| # | Requisito | Critério de aceite |
|---|---|---|
| **RF-09** | O escritório cadastra o que quer vigiar — OAB dos advogados, nome ou CPF/CNPJ de clientes, processos específicos | Cadastro feito por advogado ou administrador, nunca pelo agente por conta própria |
| **RF-10** | Publicação em diário oficial que mencione item vigiado vira alerta no canal interno no mesmo dia | Publicação captada pelo Escavador aparece como alerta em até 1 hora do recebimento do evento |
| **RF-11** | O alerta identifica processo, tipo de publicação, teor e **o que ele pode significar em termos de prazo** — sem calcular o prazo | O alerta diz "há indício de prazo" e encaminha a advogado; **nunca** afirma "o prazo vence em X" |
| **RF-12** | Movimentação nova em processo vigiado gera alerta equivalente | Movimentação captada vira alerta com CNJ, data e teor |
| **RF-13** | Alerta com indício de prazo tem prioridade máxima e exige confirmação de leitura de um advogado | Alerta de prazo não lido em N horas escala. 🚧 N depende da pergunta 12 |
| **RF-14** | Remover um item de vigilância exige confirmação explícita e fica registrado | Remoção nunca acontece como efeito colateral de outra operação (R-14) |
| **RF-15** | Falha na recepção de eventos é visível | Se nenhum evento chega em janela esperada, o sistema alerta o administrador. Silêncio nunca é interpretado como "nada aconteceu" |

> **RF-11 é uma restrição de produto, não uma limitação técnica.** Calcular prazo processual envolve contagem em dias úteis, suspensão, feriado forense local, prerrogativa e intimação ficta. Errar por um dia é dano irreversível. A plataforma **sinaliza indício**; quem conta prazo é advogado.

### 5.3 E3 — Demandas e organização

| # | Requisito | Critério de aceite |
|---|---|---|
| **RF-16** | A caixa de e-mail do escritório é lida e cada mensagem classificada | Classes: demanda de cliente · comunicação de tribunal · indício de prazo · administrativo · irrelevante |
| **RF-17** | Toda mensagem processada gera registro rastreável, **inclusive as classificadas como irrelevantes** | Auditoria consegue responder "o que aconteceu com o e-mail recebido às 14h32" para qualquer mensagem |
| **RF-18** | Mensagem que a automação não conseguiu classificar vai para fila humana explícita | Nenhuma mensagem é descartada em silêncio. Falha é visível |
| **RF-19** | Anexo é processado em ambiente isolado, com varredura e limite de tipo e tamanho | Anexo malicioso não alcança o agente nem o sistema de arquivos da plataforma |
| **RF-20** | Demanda identificada vira card no Trello com os campos de correspondência preenchidos | Card criado traz `id_demanda`, `numero_cnj`, `cliente_id` e `origem: automacao` |
| **RF-21** | Resposta a e-mail é **rascunho** até um humano aprovar o texto exato que sai | Aprovação recai sobre o conteúdo final, nunca sobre um resumo dele |
| **RF-22** | O que a automação criou é distinguível do que a pessoa criou | Campo `origem` permite corrigir erro em massa sem tocar em trabalho manual |

### 5.4 E4 — Atendimento ao cliente

| # | Requisito | Critério de aceite |
|---|---|---|
| **RF-23** | O cliente é identificado antes de qualquer dado processual | Vínculo número ↔ cliente é cadastrado **pelo escritório**, nunca autodeclarado no chat. Verificação adicional obrigatória (RN-01) |
| **RF-24** | O cliente consulta apenas processo em que é parte e que esteja vinculado ao escritório | Tentativa de consultar terceiro é recusada em código, antes da chamada paga (RF-07) |
| **RF-25** | O agente informa **status e fatos**; não interpreta, não estima prazo de desfecho, não avalia chance de êxito, não recomenda conduta | Pergunta do tipo "eu vou ganhar?" é encaminhada a advogado, com resposta padrão registrada |
| **RF-26** | O cliente sabe que fala com um assistente automatizado e como chamar um humano | Aviso na abertura da conversa e caminho de escalada disponível em qualquer ponto |
| **RF-27** | Escalada a humano acontece por pedido explícito, por sinal de insatisfação ou por assunto fora de escopo | Escalada registrada com motivo |
| **RF-28** | Conversa de cliente tem teto de custo | Atingido o teto, a conversa continua servida por cache e escala a humano. **Nunca** para em silêncio nem segue gastando |
| **RF-29** | O agente do cliente responde a partir da base interna alimentada pela vigilância, não da API paga sob demanda | Ver §9.4 — é a decisão que separa custo previsível de custo aberto |

---

## 6. Regras de negócio

Numeradas `RN-nn`. São inegociáveis dentro do produto; alterá-las exige decisão formal.

### 6.1 Identidade e acesso

| # | Regra |
|---|---|
| **RN-01** | Número de telefone é chave de busca, nunca prova de identidade |
| **RN-02** | Conta compartilhada é proibida para colaborador e advogado — inviabiliza auditoria e responsabilização |
| **RN-03** | O privilégio é verificado **em código no servidor MCP**, jamais por instrução no prompt do agente. O agente nunca é a fronteira de segurança |
| **RN-04** | Negar por padrão. Sem lista de permissão explícita, nega |
| **RN-05** | Falha fecha. Governança indisponível bloqueia a operação em vez de liberá-la |

### 6.2 Aprovação humana

Faixas herdadas de `01` §6.3. O PRD fixa o rito:

| Faixa | Natureza | Rito | Quem aprova |
|---|---|---|---|
| **A0** | Leitura interna, sem custo | Automática, registrada | — |
| **A1** | Leitura externa com custo | Automática dentro da quota; acima, aprovação | Advogado |
| **A2** | Escrita interna, reversível | Automática, registrada | — |
| **A3** | Comunicação externa | **Aprovação obrigatória** | Advogado |
| **A4** | Efeito jurídico ou prazo | **Aprovação de advogado identificado, sempre** | Advogado, nominalmente |

| # | Regra |
|---|---|
| **RN-06** | A aprovação recai sobre o **conteúdo final**, não sobre a intenção. O humano aprova o texto exato que será enviado |
| **RN-07** | Aprovação em lote é permitida **apenas** na faixa A1 |
| **RN-08** | Ato com efeito jurídico ou de prazo exige aprovação de **advogado identificado**. Sem exceção e sem automatização |
| **RN-09** | Aprovação expira. Pedido não respondido em janela definida vence e precisa ser refeito — aprovação velha não autoriza ação nova |

### 6.3 Conteúdo e veracidade

| # | Regra |
|---|---|
| **RN-10** | Sem fonte, não se afirma. Toda afirmação factual aponta processo, documento ou consulta verificável |
| **RN-11** | É proibido citar jurisprudência, número de processo, dispositivo legal ou prazo que não venha de consulta registrada |
| **RN-12** | A plataforma **sinaliza indício de prazo**; não calcula prazo (RF-11) |
| **RN-13** | Conteúdo externo — e-mail, anexo, mensagem de cliente — é hostil até prova em contrário e nunca alimenta diretamente um agente com poder de ação |

### 6.4 Custo

| # | Regra |
|---|---|
| **RN-14** | Toda chamada paga é atribuída a solicitante, papel, cliente/processo e fluxo |
| **RN-15** | Orçamento em três níveis: por conversa/sessão · por pessoa/mês · global do escritório/mês |
| **RN-16** | Ao atingir o teto, o sistema **degrada para cache e exige aprovação**. Não para em silêncio, não continua gastando |
| **RN-17** | Nenhuma ferramenta pagina em laço automático. Cada bloco de 200 resultados custa dinheiro (R-25) |
| **RN-18** | Alerta antes do teto, não depois |

---

## 7. Requisitos não funcionais

### 7.1 Segurança

| # | Requisito |
|---|---|
| **RNF-01** | Segredo (token, chave, senha) vive em cofre ou variável de ambiente. Nunca em repositório, documento ou prompt |
| **RNF-02** | Um token por aplicação, com expiração de no máximo 1 ano e revogação isolada |
| **RNF-03** | Entrada externa é sanitizada e delimitada antes de chegar ao agente; instrução encontrada em conteúdo externo nunca é executada |
| **RNF-04** | O endpoint que recebe callback do Escavador valida o segredo compartilhado no cabeçalho `Authorization` antes de processar |
| **RNF-05** | O receptor de callback é idempotente — o Escavador reentrega, e reentrega não pode duplicar efeito |
| **RNF-06** | Nenhuma das APIs de destino oferece segunda barreira (R-16 no Trello, R-24 no Escavador). O código do MCP é a única fronteira, e é auditado como tal |

### 7.2 Auditoria

| # | Requisito |
|---|---|
| **RNF-07** | Registro imutável de quem pediu, o que foi consultado, o que foi decidido, o que custou e quem aprovou |
| **RNF-08** | O registro sobrevive à indisponibilidade do n8n — auditoria vive em banco próprio, não em histórico de execução de fluxo |
| **RNF-09** | Acesso a dado de cliente é registrado inclusive quando negado. Tentativa recusada é informação de segurança |

### 7.3 Desempenho e disponibilidade

| # | Requisito |
|---|---|
| **RNF-10** | Operação assíncrona nunca bloqueia. O sistema aceita, devolve identificador e notifica quando concluir |
| **RNF-11** | Consulta servida por cache responde em menos de 2 segundos |
| **RNF-12** | Vazão da API de destino é controlada no servidor MCP, não no consumidor |
| **RNF-13** | Indisponibilidade do Escavador degrada para cache com aviso explícito de idade do dado, em vez de erro seco |

### 7.4 Conformidade e sigilo

| # | Requisito |
|---|---|
| **RNF-14** | Dado pessoal de cliente não entra em repositório de código. Amostra de resposta de API é anonimizada antes de versionada |
| **RNF-15** | Certificado digital da OAB, senha de tribunal e semente de 2FA ficam **fora de todo perfil** nesta fase (R-12) |
| **RNF-16** | Autos sob segredo de justiça exigem escopo próprio, jamais concedido com abrangência ampla |
| **RNF-17** | O cliente é informado do uso de IA — exigência ética, não cortesia |

---

## 8. Superfície de ferramentas

O produto expõe ao agente uma superfície **curada**, não a API inteira. Cobertura total fica no SDK interno; exposição é decidida por perfil.

| Sistema | Operações mapeadas | Ferramentas expostas | Detalhe |
|---|---|---|---|
| Escavador | 83 | **15** | `mapeamento-escavador.md` §8.1 |
| Trello | 261 | **12** | `mapeamento-trello.md` §9 |

**RF-30** — O perfil decide o que **aparece** na janela do agente; o escopo decide o que a chamada tem **direito** de fazer. Ferramenta na mão sem escopo recebe recusa do servidor.

Capacidades que ficam fora de **todo** perfil, em qualquer papel:

- Escavador: toda a família de certificados digitais
- Trello: excluir card, quadro, workspace, ação ou definição de campo; convite por e-mail; operações em massa
- Ambos: qualquer operação destrutiva que tenha alternativa reversível — arquivar em vez de excluir

---

## 9. Modelo de custo

Esta seção é requisito funcional, não anexo financeiro (P7). Os preços são os do painel autenticado, levantados em 20/08/2026 (`07-painel-escavador-achados.md`).

### 9.1 O que custa, e quanto

| Operação | Preço |
|---|---|
| Consultar envolvidos de um processo | R$ 0,05 |
| Obter resumo por IA já existente | R$ 0,05 |
| Solicitar geração de resumo por IA | R$ 0,08 |
| Consultar status de tarefa assíncrona | **Gratuito** |
| Capa do processo · movimentações · atualização no tribunal | R$ 3,00 |
| Listar processos de um envolvido ou de uma OAB | R$ 3,00 **por bloco de 200 resultados** |
| Monitorar um processo no tribunal | R$ 0,18 a R$ 3,00 **por mês** |
| Monitorar termo em diários oficiais (V1) | R$ 3,00/mês até 200 itens · + R$ 0,05 a cada 200 |

### 9.2 O risco de custo aberto

**R-25** é a exposição financeira central do produto: quatro rotas cobram **por bloco de 200 resultados**, e o volume é desconhecido antes da chamada. "Quais são os processos deste cliente?" — a pergunta mais natural que existe — custa R$ 3,00 para uma pessoa física comum e R$ 15,00 para uma empresa litigante.

Tratamento, já como requisito:

| # | Requisito |
|---|---|
| **RF-31** | Nenhuma ferramenta pagina em laço. Traz um bloco, devolve, informa que há mais |
| **RF-32** | Antes de listar envolvido de volume desconhecido, **contar** com a rota de resumo |
| **RF-33** | Teto de blocos por chamada e por papel. Acima do teto, a IA propõe e o humano aprova |

### 9.3 Vigilância de prazo — a escolha que muda a conta

Há dois caminhos para descobrir que algo aconteceu num processo, e eles diferem em **duas ordens de grandeza**:

| Caminho | Como funciona | Custo para 200 processos |
|---|---|---|
| Monitorar cada processo no tribunal (V2) | Um monitoramento por processo | 200 × R$ 3,00/mês = **R$ 600,00/mês** |
| Monitorar cada processo, variante mensal com documentos públicos | Idem, frequência menor | 200 × R$ 0,18/mês = **R$ 36,00/mês** |
| **Monitorar a OAB dos advogados no diário oficial (V1)** | Um monitoramento por advogado, captura toda publicação que o mencione | **R$ 3,00/mês** até 200 itens |

**Recomendação de produto:** a vigilância de prazo se apoia primariamente no **monitoramento de diário oficial por OAB (V1)**, complementada por monitoramento de processo apenas onde houver razão específica. Três motivos:

1. **É onde nasce o prazo.** Publicação em diário oficial é o gatilho da intimação; movimentação no sistema do tribunal é consequência
2. **O custo não cresce com a carteira.** Um monitoramento por advogado cobre todos os processos em que ele está constituído, inclusive os que o escritório ainda não cadastrou
3. **Custa duas ordens de grandeza menos** que a alternativa por processo

🚧 **Depende de confirmação:** o "até 200 itens" do monitoramento em diários oficiais se refere a 200 **termos vigiados** ou a 200 **aparições por mês**? A diferença é grande e a pergunta está na lista ao suporte (§13).

### 9.4 O atendimento ao cliente não consulta a API paga

**RF-29** é a decisão de custo mais importante do produto. Se cada pergunta de cliente no WhatsApp disparar uma consulta paga, a exposição financeira fica aberta e nas mãos de quem não paga a conta.

O desenho é outro: a **vigilância** (E2) alimenta a base interna; o **agente do cliente** (E4) lê a base interna. A API paga só é acionada quando o dado interno está ausente ou vencido — e, nesse caso, dentro do teto por conversa (RF-28).

| Sem esta decisão | Com esta decisão |
|---|---|
| 100 clientes × 3 perguntas/mês × R$ 3,00 = **R$ 900,00/mês**, e crescendo com a base de clientes | Custo dominado pela vigilância, que é fixa e previsível. Pergunta de cliente tende a **R$ 0,00** |

### 9.5 Orçamento e disjuntor

| Nível | O que limita |
|---|---|
| Por conversa/sessão | Impede que um cliente ou um agente em laço torre o saldo |
| Por pessoa/mês | Distribui responsabilidade e revela uso atípico |
| Global do escritório/mês | Último anteparo |

Ao atingir o teto: degrada para cache, avisa, exige aprovação para prosseguir (RN-16). Duas camadas de alarme — a nossa e o **Alerta de saldo** nativo do painel do Escavador, que é gratuito (D-54).

**RF-34** — Recarga de crédito do Escavador **não é autosserviço**: depende de atendimento comercial e pode levar dias (R-22). O disjuntor alerta com antecedência suficiente para pedir recarga antes de parar, não depois.

---

## 10. Métricas de sucesso

Cada resultado esperado da §2.3 com métrica e instrumentação.

| Resultado | Métrica | Como se mede |
|---|---|---|
| Cliente se atende sozinho | Taxa de resolução sem humano; tempo até primeira resposta | Conversas encerradas sem escalada ÷ total |
| Nada se perde | Cobertura de registro | Mensagens processadas com registro ÷ mensagens recebidas. **Meta: 100%** |
| Prazo não se perde | Tempo entre publicação e alerta lido por advogado | Carimbo de evento até confirmação de leitura |
| Trabalho manual cai | Volume de consulta automatizada; consultas manuais residuais | Contagem por fluxo |
| Controle e auditoria | Rastreabilidade completa | Amostra aleatória de ações reconstruída ponta a ponta |
| Qualidade do agente | **Taxa de rejeição em aprovação humana** | Rascunhos rejeitados ÷ rascunhos submetidos |
| Custo sob controle | Custo por consulta; custo por cliente atendido; % de resposta servida por cache | Painel de custo |

**A métrica mais informativa é a taxa de rejeição em aprovação humana.** Ela mede diretamente se o agente é útil ou se está gerando trabalho de revisão. Subindo, o problema é do agente, não do revisor.

Contramétrica obrigatória: **taxa de escalada indevida** — conversa escalada a humano por falha do agente em algo que estava dentro do escopo dele. Sem ela, é fácil parecer seguro escalando tudo.

---

## 11. Premissas

Declaradas porque o questionário de descoberta ainda não voltou. Se uma cair, o requisito associado muda.

| # | Premissa | Se cair |
|---|---|---|
| **P-01** | O escritório aceita migrar de conta compartilhada para identidade individual | RF-01 fica impossível; auditoria e aprovação nominal caem junto. **É a premissa mais crítica** (R-11) |
| **P-02** | Advogado tem acesso à carteira em que está constituído, não à base inteira | Muda a matriz de privilégios (D-07) |
| **P-03** | O Trello é quadro de trabalho, e a base interna é a fonte da verdade da demanda | Muda o desenho de E3 (D-09) |
| **P-04** | Há saldo contratado no Escavador quando E1 entrar em operação | Sem saldo, o produto não funciona — a cota de teste expira em 23/08/2026 |
| **P-05** | O escritório usará WhatsApp Business Platform oficial | Biblioteca não oficial arrisca banimento do número; E4 não vai ao ar |
| **P-06** | Os preços do painel são de catálogo, não limitados pelo bônus | Todo o §9 precisa ser refeito. 🚧 Pergunta pendente ao suporte |
| **P-07** | O volume da carteira cabe em um bloco de 200 na maioria das consultas | R-25 vira problema maior e RF-33 fica mais restritivo |

---

## 12. Dependências

| Dependência | Estado | Bloqueia |
|---|---|---|
| Saldo contratado no Escavador | 🔴 Só cota de teste, expira 23/08/2026 | E1 em produção |
| Acesso à instância n8n do cliente | 🔴 Não temos | Toda implementação |
| Credenciais do Trello (chave, token, segredo) | 🔴 Não temos | E3 |
| Conta WhatsApp Business Platform | 🔴 Não confirmada | E4 |
| Identidade individual para a equipe | 🔴 Conta compartilhada hoje | RF-01, auditoria, aprovação nominal |
| URL pública para receber callback | 🔴 Não existe | E2 |
| Número CNJ de processo real para teste | 🟡 Em obtenção | Validação de contrato da API |
| Respostas do questionário de descoberta | 🔴 74 perguntas em aberto | Refino de E3 e E4 |

---

## 13. Perguntas que bloqueiam este PRD

Numeração de `02-descoberta-perguntas-abertas.md`. 🚧 marca o que trava decisão de produto.

| Pergunta | Trava | Destinatário |
|---|---|---|
| 🚧 **16a–16c** | Conta compartilhada — P-01, RF-01 | Escritório |
| 🚧 **D-07** | Advogado vê base inteira ou só a carteira? — P-02 | Escritório |
| 🚧 **D-09** | Trello é fonte da verdade ou visualização? — P-03 | Escritório |
| 🚧 **12** | Prazo de escalada de alerta não lido — RF-13 | Escritório |
| 🚧 **26 e 27** | Campos personalizados e automações Butler existentes — RF-20 | Escritório |
| 🚧 Ao suporte do Escavador | "Até 200 itens" no monitoramento de diário: termos ou aparições? — §9.3 | Escavador |
| 🚧 Ao suporte do Escavador | Os preços são de catálogo ou limitados pelo bônus? — P-06 | Escavador |

---

## 14. Riscos que afetam o produto

Recorte dos riscos de `01` §15 que mudam **o que o produto faz**, não apenas como é construído.

| Risco | Efeito no produto | Tratamento |
|---|---|---|
| **R-11** — conta compartilhada | Sem identidade individual, aprovação nominal e auditoria não existem. **Inviabiliza metade dos requisitos** | P-01; escalar ao escritório como bloqueio, não como sugestão |
| **R-24** e **R-16** — nenhuma API de destino tem escopo | O código do MCP é a única fronteira de segurança | RN-03, RNF-06, revisão de segurança dedicada |
| **R-25** — custo por bloco de 200 | A consulta mais natural do cliente é a de custo mais imprevisível | RF-31 a RF-33 |
| **R-22** — recarga não é autosserviço | O produto pode parar por dias esperando o comercial | RF-34 |
| **R-02 / R-14** — perda de prazo por falha silenciosa | O pior desfecho possível | RF-13, RF-14, RF-15; e RN-12 mantém o humano na contagem |
| **R-12** — a API guarda certificado e senha de advogado | Capacidade que não entra no produto | RNF-15 |

---

## 15. Decisões que este documento propõe

| # | Decisão | Recomendação |
|---|---|---|
| **D-61** | O produto vai ao ar em quatro entregas, com **vigilância de prazo (E2) antes de demandas (E3)** e **atendimento ao cliente (E4) por último** | Adotar |
| **D-62** | A vigilância de prazo se apoia primariamente em **monitoramento de diário oficial por OAB (V1)**, não em monitoramento por processo | Adotar |
| **D-63** | O agente do cliente lê da **base interna alimentada pela vigilância**, e só recorre à API paga com dado ausente ou vencido, dentro de teto por conversa | Adotar |
| **D-64** | A plataforma **sinaliza indício de prazo e nunca calcula prazo**. Contagem é ato de advogado | Adotar |
| **D-65** | Aprovação **expira**: pedido não respondido em janela definida vence e precisa ser refeito | Adotar |
| **D-66** | A **taxa de rejeição em aprovação humana** é a métrica primária de qualidade do agente, com a taxa de escalada indevida como contramétrica | Adotar |
| **D-67** | Identidade individual (P-01) é tratada como **bloqueio de projeto**, não como preferência — sem ela, E1 não é entregue como especificado | Adotar |

---

## 16. Próximo passo

**A Spec técnica** (`09-spec-tecnica.md`): contratos de ferramenta MCP, esquema de dados, contrato do Policy Gate já esboçado em `04` §4, desenho do receptor de callback, política de cache por tipo de dado e organização do repositório.

Antes dela, este PRD precisa de **aval** — e as sete perguntas da §13 precisam de resposta, sob pena de a Spec detalhar premissa em vez de requisito.
