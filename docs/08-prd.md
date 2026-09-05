# PRD — Plataforma de Automação e Agentes de IA para Escritório de Advocacia


| Campo    | Valor                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Versão   | 2.0 — **o escritório respondeu.** P-01 a P-03 e P-07 fechadas, D-07 e D-09 resolvidas, e a aprovação humana ganhou a faixa que devolve eficiência (§6.2)   |
| Data     | 2026-08-27                                                                                                                                                 |
| Estado   | 🟡 **Proposta — aguarda aval do usuário sobre as decisões novas (D-142 a D-152)**                                                                          |
| Fase     | 2 — PRD e Spec                                                                                                                                             |
| Antecede | `09-spec-tecnica.md` — **Parte I escrita em 20/08**; a Parte II está quase destravada (§13)                                                                |
| Herda de | `01-diretrizes-gerais.md`, `04-modelo-de-identidade-e-autorizacao.md`, `mapeamento-escavador.md`, `mapeamento-trello.md`, `07-painel-escavador-achados.md` |


> **O que este documento é.** A definição do **produto**: quem usa, o que faz, com que regras, a que custo e como se sabe que deu certo. Ele não descreve implementação — isso é da Spec. Onde uma decisão de produto depende de resposta do escritório, o requisito está marcado 🚧 e opera sob premissa declarada.

> **O que mudou na versão 2.0.** As respostas do escritório chegaram em 27/08 e mudaram cinco coisas de fundo:
>
> 1. **A aprovação humana deixa de ser um pedágio em toda mensagem.** A faixa A3 se divide: comunicação por **gabarito pré-aprovado** sai sozinha e registrada; só texto livre pede aprovação (§6.2, D-142)
> 2. **Advogado enxerga a base inteira** — D-07 resolvida. A compensação é auditoria, não bloqueio (§3.1, D-146)
> 3. **O Trello é visualização; a base interna é a fonte da verdade** — D-09 resolvida (§4.3, D-152)
> 4. **O agente do cliente não gasta um centavo de crédito.** Dado ausente vira escalada, nunca chamada paga (§9.4, D-144)
> 5. **A identidade individual existe, e vem pelo Telegram** — não pelo Workspace. Resolve RF-01 e mantém R-11 aberto para e-mail e Drive (§11, D-147)

---

## 1. Sumário executivo

O escritório opera hoje de forma manual em três frentes que consomem tempo qualificado sem produzir valor jurídico: **responder clientes** sobre o andamento dos próprios processos, **acompanhar publicações e movimentações** para não perder prazo, e **registrar e triar demandas** que chegam por e-mail.

A plataforma automatiza essas três frentes com agentes de IA orquestrados em **n8n**, apoiados em uma camada de integração construída como **servidores MCP reutilizáveis** (*Model Context Protocol* — padrão que expõe capacidades a agentes de IA de forma estruturada). O acesso a dado de cliente é controlado por papel, verificado em código, e **nada sai do escritório sem que um advogado tenha aprovado o texto — ou o gabarito de onde aquele texto veio**.

**O que muda para o escritório, em ordem de valor:**

1. Prazo deixa de depender de alguém lembrar de olhar o diário oficial
2. Cliente obtém status do próprio processo sem consumir tempo de advogado
3. Nenhuma demanda que chega por e-mail fica sem registro rastreável
4. O escritório passa a saber o que a IA fez, para quem e a que custo

**O que a plataforma deliberadamente não faz:** não peticiona, não emite parecer, não estima chance de êxito, e não improvisa texto novo para fora do escritório sem que um advogado tenha lido aquele texto.

---

## 2. Problema

### 2.1 Situação atual


| Dor                                                    | Consequência hoje                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| Acompanhamento de publicação e movimentação é manual   | **Risco de perda de prazo** — o pior cenário possível deste projeto |
| Cliente liga ou manda mensagem para saber do processo  | Tempo de advogado consumido em informação que é factual e pública   |
| Demanda chega por e-mail e depende de alguém registrar | Demanda perdida, ou registrada tarde, ou registrada duas vezes      |
| Consulta a tribunal é repetitiva e manual              | Trabalho qualificado gasto em tarefa mecânica                       |
| Não há registro de quem consultou o quê                | Impossível auditar acesso a dado sob sigilo profissional            |


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


| Papel             | Quem é                                         | Canal                        | O que espera                                                                            |
| ----------------- | ---------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| **Cliente**       | Pessoa ou empresa com vínculo contratual ativo | WhatsApp                     | Saber como está o processo dele, a qualquer hora, sem esperar                           |
| **Colaborador**   | Equipe administrativa, estagiários, paralegais | **Telegram**, e-mail, painel | Não precisar consultar tribunal manualmente; ter a demanda já registrada e triada       |
| **Advogado**      | Advogado(a) inscrito(a) atuante                | **Telegram**, e-mail, painel | Não perder prazo; revisar rápido o que a IA propôs; ter fonte para tudo que a IA afirma |
| **Administrador** | Sócio responsável ou TI                        | Painel administrativo        | Saber o custo, controlar quem acessa o quê, auditar                                     |


### 3.1 O que o advogado enxerga — D-07 resolvida

✅ **Respondido pelo escritório em 27/08:** *"Os advogados têm acesso à base inteira, pois eles se ajudam nos processos um do outro."*

A premissa P-02 caiu. O advogado recebe abrangência `any`, não `carteira`. A matriz de privilégios muda de acordo (`01` §5.3).

Isso é uma escolha legítima de um escritório pequeno, onde a colaboração cruzada é a operação real — mas ela **remove um controle**, e o controle removido precisa ser substituído, não simplesmente esquecido:


| #         | Requisito                                                                                                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-37** | Acesso a processo fora da carteira do próprio advogado é registrado como **acesso amplo** e entra em relatório mensal para o administrador. Não é bloqueado, nem exige justificativa na hora — é visível depois |
| **RF-38** | Processo marcado como **sigiloso** ou sob segredo de justiça continua exigindo escopo próprio, nunca concedido por abrangência ampla (RNF-16). "Base inteira" não inclui segredo de justiça                     |


> **Por que registrar em vez de bloquear.** Bloquear atrapalharia exatamente a colaboração que o escritório descreveu. Registrar não atrapalha nada e responde à única pergunta que importa depois de um incidente: *quem viu o quê, e quando?* O escritório perde a barreira e ganha o espelho.

✅ **RESOLVIDO em 05/09 — o colaborador também tem abrangência `escritorio`.** O escritório confirmou que colaboradores atuam sobre todos os processos, *"em nome dos advogados e sob observação deles"*. A abrangência provisória `carteira` cai; RF-37 e RF-38 valem igualmente para os dois papéis, e o **perfil individual continua obrigatório para as sete pessoas** (RN-02, Regra 7) — é o que mantém o espelho funcionando. Ver **D-192**.

⚠️ **O espelho tem uma borda.** A mesma resposta revelou que, **nos sistemas externos** (tribunal, PJe, e-mail), colaboradoras operam com as credenciais das advogadas. A auditoria da plataforma registra quem pediu o que **dentro dela** e não alcança o que acontece fora — a trilha parece completa e não é. Ver **R-59**: é decisão interna do escritório, e a plataforma se declara pelo que de fato registra.

### 3.2 O que separa cliente de todo o resto

O cliente é o único papel que acessa a plataforma **de fora**, por um canal que não autentica ninguém de verdade — o número de WhatsApp é identificador fraco (chip trocado, clonado ou emprestado). Isso não é detalhe de implementação: é o que define metade dos requisitos de segurança do produto.

**RN-01** — O número de telefone é **chave de busca**, nunca prova de identidade. Nenhum dado processual é revelado antes de verificação adicional (§6.1).

---

## 4. Escopo do produto

### 4.1 Entregas, em ordem

O produto vai ao ar em quatro entregas. A ordem é deliberada e **o atendimento ao cliente é a última**, mesmo sendo a mais visível — é a de maior risco reputacional e a que depende de todas as outras estarem maduras.


| Entrega                                 | Conteúdo                                                                                    | Quem passa a usar                                      | Encerra quando                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **E1 · Fundação e consulta processual** | Identidade, Policy Gate, auditoria, custo, MCP Escavador                                    | Advogados e colaboradores, pelo Telegram e pelo painel | Uma consulta processual roda ponta a ponta, autorizada, auditada e com custo registrado     |
| **E2 · Vigilância de prazo**            | Monitoramento de diário oficial e de movimentação, com alerta no Telegram                   | Advogados e colaboradores                              | Uma publicação em diário oficial vira alerta no mesmo dia, sem ninguém pedir                |
| **E3 · Demandas e organização**         | Ingestão de e-mail, classificação, registro, Trello, resposta por gabarito ou com aprovação | Colaboradores e advogados                              | Nenhum e-mail entra sem gerar registro rastreável; resposta só sai aprovada ou por gabarito |
| **E4 · Atendimento ao cliente**         | WhatsApp, em piloto restrito antes de ampliar                                               | Clientes                                               | Piloto com grupo controlado atendido sem escalada indevida                                  |


> **Por que E2 vem antes de E3.** Perda de prazo é o pior desfecho possível do projeto e a dor mais cara do escritório. E2 é também a entrega mais barata em crédito (§9.3). E3 depende de um levantamento que ainda não foi feito (perguntas 26 e 27, agora sob nossa responsabilidade — §13).

### 4.2 Fora de escopo

Herdado de `01` §2.2, reafirmado aqui como compromisso de produto. Nenhum destes entra sem decisão formal:

- Peticionamento ou protocolo automático em sistema de tribunal
- Parecer, orientação jurídica ou estimativa de chance de êxito ao cliente sem revisão de advogado
- Substituição do sistema de gestão jurídica do escritório — a plataforma **integra**
- Migração de dados históricos
- Aplicativo próprio para clientes — o canal é WhatsApp
- Assinatura digital e uso de certificado digital da OAB (§7.4)
- Operação sobre autos sob segredo de justiça na primeira entrega

### 4.3 A base interna — o que é, e por que ela existe

✅ **P-03 confirmada pelo escritório em 27/08:** o Trello é quadro de trabalho, não sistema de gestão de casos. **D-09 resolvida.**

O escritório perguntou o que é essa "base interna" que o documento cita o tempo todo. É o ponto mais importante da arquitetura, e vale explicar sem jargão:

> **A base interna é o banco de dados da própria plataforma** — uma tabela de processos, uma de clientes, uma de publicações capturadas, uma de movimentações, uma de demandas e uma de alertas. Ela vive no PostgreSQL do projeto (*banco de dados relacional* — o programa que guarda os dados em tabelas), que já está de pé desde o marco 1, com 23 tabelas.

Ela existe por três motivos, e cada um resolve um problema concreto:


| Motivo                    | O que resolve                                                                                                                                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **É de graça consultar**  | A vigilância traz a publicação por *callback* (o Escavador nos avisa sozinho quando algo aparece) — que é gratuito, medido — e guarda. Quem perguntar depois lê daqui, sem pagar de novo. É o que torna o atendimento ao cliente barato (§9.4) |
| **Ela é nossa**           | O Trello pode cair, mudar de plano, ser migrado para ClickUp ou ser cancelado. A demanda registrada não some junto. O Trello vira uma **vitrine** do que a base já sabe                                                                        |
| **Prova o que aconteceu** | Card do Trello se move, se arquiva, se apaga. Registro de auditoria não. A responsabilização mora na base, não no quadro                                                                                                                       |


**Na prática, a divisão de trabalho fica assim:**

- Chegou e-mail com uma demanda → a plataforma registra **na base interna** (isso é o fato) → e cria um **card no Trello** para a pessoa trabalhar (isso é a vista)
- A pessoa move o card no Trello → o *webhook* (aviso automático que o Trello dispara a cada mudança) notifica a plataforma → a base interna atualiza o status
- Se o card for apagado por engano, a demanda continua existindo, e a divergência aparece na conferência


| #         | Requisito                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-39** | Toda demanda existe primeiro na base interna e depois no Trello. Card sem demanda correspondente é sinalizado na conferência periódica, e demanda sem card também |


---

## 5. Requisitos funcionais

Numerados `RF-nn`. Cada um traz **critério de aceite** — a condição objetiva que diz se está pronto.

### 5.1 E1 — Fundação e consulta processual


| #         | Requisito                                                                                                         | Critério de aceite                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-01** | Cada pessoa da equipe tem identidade individual na plataforma, com autenticação nominal e segundo fator           | Duas pessoas distintas produzem registros de auditoria distintos ao fazer a mesma consulta. Conta compartilhada é rejeitada. ✅ **Viabilizado por D-147** — identidade pelo Telegram + painel |
| **RF-02** | Um agente interno responde perguntas sobre processo em linguagem natural, pelo Telegram                           | Pergunta "como está o processo X?" devolve situação, última movimentação e data, com a fonte identificada                                                                                    |
| **RF-03** | Toda afirmação factual do agente aponta a fonte e a idade do dado                                                 | Nenhuma resposta contém fato processual sem origem (cache ou API) e data. Resposta sem fonte é bug, não estilo                                                                               |
| **RF-04** | O agente enxerga apenas as ferramentas que o papel do solicitante permite                                         | Colaborador não vê `remover_monitoramento` na lista de ferramentas. Advogado vê                                                                                                              |
| **RF-05** | Toda chamada paga é registrada com solicitante, papel, processo, ferramenta, custo e resultado                    | O painel de custo reconstrói qualquer gasto até a pessoa que o originou                                                                                                                      |
| **RF-06** | Consulta repetida ao mesmo dado dentro da validade é servida por cache, sem custo                                 | Duas consultas ao mesmo processo em 1 hora geram uma cobrança, não duas                                                                                                                      |
| **RF-07** | O sistema recusa consulta fora do escopo do papel, em código, antes da chamada paga                               | Cliente consultando CPF de terceiro recebe recusa **sem que a API seja chamada** — não gasta crédito e não vaza a existência do dado                                                         |
| **RF-08** | O administrador vê consumo de crédito por pessoa, por papel e por período                                         | Painel responde "quem gastou o quê no mês" sem consulta manual ao banco                                                                                                                      |
| **RF-37** | Acesso a processo fora da carteira do próprio advogado é registrado como acesso amplo e entra em relatório mensal | O relatório existe e é gerado sem consulta manual ao banco (§3.1)                                                                                                                            |
| **RF-38** | Processo sigiloso exige escopo próprio, jamais concedido por abrangência ampla                                    | Advogado com abrangência `any` **não** alcança processo marcado sigiloso sem escopo dedicado                                                                                                 |


### 5.2 E2 — Vigilância de prazo


| #         | Requisito                                                                                                                                          | Critério de aceite                                                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-09** | O escritório cadastra o que quer vigiar — nome dos advogados, nome ou CPF/CNPJ de clientes, processos específicos                                  | Cadastro feito por advogado ou administrador, nunca pelo agente por conta própria                                                                                               |
| **RF-10** | Publicação em diário oficial que mencione item vigiado vira alerta no mesmo dia                                                                    | Publicação captada pelo Escavador aparece como alerta em até 1 hora do recebimento do evento                                                                                    |
| **RF-11** | O alerta identifica processo, tipo de publicação, teor e **o que ele pode significar em termos de prazo** — sem calcular o prazo                   | O alerta diz "há indício de prazo" e encaminha a advogado; **nunca** afirma "o prazo vence em X"                                                                                |
| **RF-12** | Movimentação nova em processo vigiado gera alerta equivalente                                                                                      | Movimentação captada vira alerta com CNJ, data e teor                                                                                                                           |
| **RF-13** | Alerta com indício de prazo tem prioridade máxima, vai para **advogado e colaborador**, e escala enquanto não for confirmado por um advogado       | O rito completo está em §5.2.1. 🚧 Os prazos N1 e N2 dependem das perguntas 20a–20c                                                                                             |
| **RF-14** | Remover um item de vigilância exige confirmação explícita e fica registrado                                                                        | Remoção nunca acontece como efeito colateral de outra operação (R-14)                                                                                                           |
| **RF-15** | Falha na recepção de eventos é visível                                                                                                             | Se nenhum evento chega em janela esperada, o sistema alerta o administrador. Silêncio nunca é interpretado como "nada aconteceu"                                                |
| **RF-35** | O esgotamento da franquia de aparições é alarmado **antes** de cegar                                                                               | Ao atingir **70%** da franquia no ciclo, o sistema alerta o administrador e dispara o procedimento de §9.3.1. Em 100% a captura do mês já parou (R-40)                          |
| **RF-36** | O inventário de vigilâncias é conferido contra o quadro de advogados                                                                               | Rotina periódica compara os monitoramentos ativos com a lista de advogados. **Faltou** → alarme de prazo. **Sobrou** → alarme de custo. Ambas as listagens são gratuitas (R-41) |
| **RF-40** | A franquia de aparições é definida **na criação** do monitoramento, com valor decidido pelo escritório, e registrada na base com a data da decisão | Nenhum monitoramento é criado com o valor padrão da API por omissão. A criação registra quem escolheu o número (R-46)                                                           |


> **RF-11 é uma restrição de produto, não uma limitação técnica.** Calcular prazo processual envolve contagem em dias úteis, suspensão, feriado forense local, prerrogativa e intimação ficta. Errar por um dia é dano irreversível. A plataforma **sinaliza indício**; quem conta prazo é advogado.
>
> ✅ **Complemento do escritório, 27/08:** os **colaboradores também conferem** indício de prazo, na rotina que já existe hoje. Isso não muda D-64 — contar prazo continua sendo ato de advogado —, mas muda a quem o alerta é entregue (RF-13) e quem pode encerrá-lo (§5.2.1).

#### 5.2.1 O rito do alerta de prazo, na prática

O escritório pediu para entender como isso funciona no dia a dia. É assim:


| Momento                                 | O que acontece                                                                                                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T0**                                  | O Escavador entrega a publicação no nosso receptor. A plataforma registra na base interna, marca "indício de prazo" e monta o alerta com o número do processo, a data, o teor e o link para o inteiro teor |
| **T0 + segundos**                       | O alerta chega no Telegram do **advogado responsável pelo processo** e do **colaborador de plantão**, com um botão "Ciente"                                                                                |
| **T0 + N1** *(proposta: 2 horas úteis)* | Se ninguém clicou, o alerta é reenviado e passa a tocar **todos os advogados**, não só o responsável                                                                                                       |
| **T0 + N2** *(proposta: 4 horas úteis)* | Se ainda ninguém confirmou, escala para a sócia responsável e o alerta aparece como **"não confirmado"** no painel                                                                                         |
| **Fim do dia útil**                     | O resumo diário lista todo alerta de prazo que ficou sem confirmação. Ninguém termina o dia sem ver a lista                                                                                                |
| **Nunca**                               | O alerta **não** se encerra sozinho, **não** expira e **não** some da lista. Alerta de prazo é a única coisa no sistema que não tem prazo de validade                                                      |


**Três regras que fazem o rito funcionar:**

1. **O relógio só corre em horário útil.** Publicação que chega às 18h de sexta começa a contar na segunda de manhã. Contar madrugada geraria escalada para a sócia às 3h por um alerta que ninguém poderia ler
2. **Quem encerra é advogado.** O "Ciente" do colaborador registra a triagem e para o reenvio *para ele* — mas o relógio da escalada continua correndo até um advogado confirmar. É a tradução operacional de D-64: colaborador confere, advogado responde pelo prazo
3. **Confirmar não é resolver.** "Ciente" significa *eu li*. O que fazer com o prazo é trabalho jurídico, e a plataforma não acompanha isso — ela só garante que ninguém pode dizer que não viu

🚧 **O que falta o escritório decidir** (perguntas 20a a 20c): os valores de N1 e N2, qual é o horário útil considerado, e quem é "a sócia responsável" no último degrau da escalada. Os números acima são proposta nossa, não decisão tomada.

### 5.3 E3 — Demandas e organização


| #         | Requisito                                                                                           | Critério de aceite                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **RF-16** | A caixa de e-mail do escritório é lida e cada mensagem classificada                                 | Classes: demanda de cliente · comunicação de tribunal · indício de prazo · administrativo · irrelevante |
| **RF-17** | Toda mensagem processada gera registro rastreável, **inclusive as classificadas como irrelevantes** | Auditoria consegue responder "o que aconteceu com o e-mail recebido às 14h32" para qualquer mensagem    |
| **RF-18** | Mensagem que a automação não conseguiu classificar vai para fila humana explícita                   | Nenhuma mensagem é descartada em silêncio. Falha é visível                                              |
| **RF-19** | Anexo é processado em ambiente isolado, com varredura e limite de tipo e tamanho                    | Anexo malicioso não alcança o agente nem o sistema de arquivos da plataforma                            |
| **RF-20** | Demanda identificada vira card no Trello com os campos de correspondência preenchidos               | Card criado traz `id_demanda`, `numero_cnj`, `cliente_id` e `origem: automacao`                         |
| **RF-21** | Resposta a e-mail sai por **gabarito pré-aprovado** (A3a) ou como **rascunho para aprovação** (A3b) | Nenhum texto novo, escrito pelo modelo, sai sem passar por um humano                                    |
| **RF-22** | O que a automação criou é distinguível do que a pessoa criou                                        | Campo `origem` permite corrigir erro em massa sem tocar em trabalho manual                              |
| **RF-39** | A demanda existe primeiro na base interna e depois no Trello (§4.3)                                 | Conferência periódica sinaliza card órfão e demanda sem card                                            |


### 5.4 E4 — Atendimento ao cliente


| #         | Requisito                                                                                                                                      | Critério de aceite                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-23** | O cliente é identificado antes de qualquer dado processual                                                                                     | Vínculo número ↔ cliente é cadastrado **pelo escritório**, nunca autodeclarado no chat. Verificação adicional obrigatória (RN-01)       |
| **RF-24** | O cliente consulta apenas processo em que é parte e que esteja vinculado ao escritório                                                         | Tentativa de consultar terceiro é recusada em código, antes da chamada paga (RF-07)                                                     |
| **RF-25** | O agente informa **status e fatos**; não interpreta, não estima prazo de desfecho, não avalia chance de êxito, não recomenda conduta           | Pergunta do tipo "eu vou ganhar?" é encaminhada a advogado, com resposta padrão registrada                                              |
| **RF-26** | O cliente sabe que fala com um assistente automatizado e como chamar um humano                                                                 | Aviso na abertura da conversa e caminho de escalada disponível em qualquer ponto                                                        |
| **RF-27** | Escalada a humano acontece por pedido explícito, por sinal de insatisfação, por assunto fora de escopo **ou por dado interno ausente/vencido** | Escalada registrada com motivo                                                                                                          |
| **RF-28** | Conversa de cliente tem teto de consumo de **modelo** e de mensagens                                                                           | Atingido o teto, a conversa escala a humano. **Nunca** para em silêncio. O teto de crédito do Escavador é zero por construção (RF-29)   |
| **RF-29** | O agente do cliente lê **exclusivamente** da base interna e **nunca dispara chamada paga ao Escavador**                                        | Dado ausente ou vencido produz escalada ao time, não consulta. Ver §9.4 — é a decisão que fecha a exposição financeira do canal externo |
| **RF-41** | Toda mensagem enviada ao cliente sai por gabarito pré-aprovado ou por texto aprovado por advogado                                              | Nenhuma prosa livre do modelo alcança o cliente sem passar por um humano (§6.2)                                                         |


---

## 6. Regras de negócio

Numeradas `RN-nn`. São inegociáveis dentro do produto; alterá-las exige decisão formal.

### 6.1 Identidade e acesso


| #         | Regra                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN-01** | Número de telefone é chave de busca, nunca prova de identidade                                                                               |
| **RN-02** | Conta compartilhada é proibida para colaborador e advogado — inviabiliza auditoria e responsabilização                                       |
| **RN-03** | O privilégio é verificado **em código no servidor MCP**, jamais por instrução no prompt do agente. O agente nunca é a fronteira de segurança |
| **RN-04** | Negar por padrão. Sem lista de permissão explícita, nega                                                                                     |
| **RN-05** | Falha fecha. Governança indisponível bloqueia a operação em vez de liberá-la                                                                 |


### 6.2 Aprovação humana — o que realmente exige um humano

Esta seção foi reescrita na v2.0. O escritório levantou, com razão, que exigir aprovação de **tudo** anula boa parte do ganho de eficiência. A resposta não é afrouxar a regra — é separar dois casos que estavam misturados.

#### 6.2.1 O que é "efeito externo"

Efeito externo é **o que atravessa a porta do escritório com o nome do escritório**. Nem toda ação da plataforma faz isso — a maioria, na verdade, não faz:


| Ação                                                      | Sai do escritório?                       | Faixa | Precisa de humano?                           |
| --------------------------------------------------------- | ---------------------------------------- | ----- | -------------------------------------------- |
| Consultar a base interna                                  | Não                                      | A0    | Não                                          |
| Consultar processo no Escavador                           | Não fala com ninguém — só gasta dinheiro | A1    | Só acima da quota                            |
| Registrar demanda, criar card no Trello, anexar documento | Não (interno e reversível)               | A2    | Não                                          |
| Marcar alerta como lido, mover card                       | Não                                      | A2    | Não                                          |
| **Responder e-mail de cliente**                           | **Sim**                                  | A3    | Depende — ver 6.2.2                          |
| **Mandar mensagem no WhatsApp do cliente**                | **Sim**                                  | A3    | Depende — ver 6.2.2                          |
| **Peticionar, protocolar, assinar, requerer prazo**       | **Sim, com efeito jurídico**             | A4    | **Sempre**, e está fora de escopo nesta fase |


Ou seja: das dezenas de coisas que a plataforma faz por dia, **só duas categorias são de efeito externo** — responder e-mail e falar com cliente. Todo o resto — vigiar diário, capturar publicação, alertar advogado, registrar demanda, criar card, consultar processo, montar relatório de custo — roda sozinho, registrado, sem pedir nada a ninguém.

#### 6.2.2 A faixa A3 se divide em duas


| Faixa   | Natureza                                          | Rito                                                             | Quem aprova                                     |
| ------- | ------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| **A0**  | Leitura interna, sem custo                        | Automática, registrada                                           | —                                               |
| **A1**  | Leitura externa com custo                         | Automática dentro da quota; acima, aprovação                     | Advogado                                        |
| **A2**  | Escrita interna, reversível                       | Automática, registrada                                           | —                                               |
| **A3a** | **Comunicação externa por gabarito pré-aprovado** | **Automática e registrada.** O advogado aprovou o gabarito antes | Advogado, **uma vez**, na aprovação do gabarito |
| **A3b** | **Comunicação externa em texto livre**            | **Aprovação obrigatória, mensagem a mensagem**                   | Advogado                                        |
| **A4**  | Efeito jurídico ou prazo                          | **Aprovação de advogado identificado, sempre**                   | Advogado, nominalmente                          |


**O que é um gabarito.** Um texto aprovado uma vez por um advogado, com lacunas que só podem ser preenchidas por **campo da base interna** — número do processo, data da movimentação, nome do cliente, teor da publicação. O modelo escolhe **qual** gabarito usar; ele não escreve o texto.

Exemplo, com as lacunas em colchetes:

> *"Olá, [nome do cliente]. O processo [número] teve uma movimentação em [data]: [teor registrado]. Nossa equipe já está acompanhando. Se precisar de alguma orientação sobre o que isso significa, é só responder que um advogado retorna. — [Escritório] · mensagem enviada por assistente automatizado."*

**As quatro condições para uma mensagem sair como A3a.** Falhando qualquer uma, ela cai para A3b e vai para a fila de aprovação:

1. O texto é um gabarito **aprovado por advogado antes**, fora da pressa do atendimento
2. Toda lacuna é preenchida por **campo verificado da base interna** — nunca por frase que o modelo escreveu
3. O assunto está na **lista de assuntos autorizados** para envio automático
4. **Nenhum sinalizador de exceção disparou:** menção a prazo, valor, reclamação, pedido de orientação jurídica, processo sigiloso, cliente sem vínculo verificado, ou processo em que o escritório não é o constituído


| #         | Requisito                                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-42** | Existe um catálogo de gabaritos versionado, com data de aprovação, advogado aprovador e histórico de revisões. Alterar um gabarito exige nova aprovação e cria versão nova |
| **RF-43** | Toda mensagem A3a registra **qual gabarito, qual versão e quais valores** preencheram as lacunas. Reconstruir o texto exato enviado é sempre possível                      |
| **RF-44** | Um gabarito pode ser **desligado na hora** por qualquer advogado, sem passar por ninguém. Desligar é sempre mais fácil que ligar                                           |
| **RF-45** | Amostragem periódica: uma fração das mensagens A3a enviadas é revista por advogado depois do envio, e o resultado alimenta a revisão do gabarito                           |


> **Por que isto não afrouxa a Regra 2.** O advogado continua aprovando o texto exato que sai — ele só aprova antes, uma vez, para todos os casos iguais, em vez de aprovar mil vezes o mesmo parágrafo. É a diferença entre revisar uma minuta-padrão e revisar cada cópia dela. O que **nunca** sai sem leitura humana é texto novo, escrito pelo modelo, sobre situação que ninguém previu — e é exatamente aí que mora o risco.

#### 6.2.3 Mensagem de ofício e mensagem de resposta

O escritório perguntou se a regra vale igual para os dois casos. Vale igual — mas o efeito prático é bem diferente, e a diferença é boa notícia:


| Tipo                                                   | O que é                                                                            | Cabe em gabarito?                                                                                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **De ofício** — o escritório avisa sem o cliente pedir | "Seu processo teve movimentação", "recebemos seu documento", "audiência designada" | **Quase sempre.** São fatos previsíveis, recorrentes e de forma estável. É o caso que mais se beneficia de A3a                            |
| **Resposta** — o cliente perguntou algo                | "Em que pé está?", "quando sai a sentença?", "o que significa isso?"               | **Depende.** As perguntas repetidas (status, documento, prazo de retorno) viram gabarito. As demais são texto livre, e vão para aprovação |


**Contraintuitivamente, é a mensagem de ofício — a que o cliente não pediu — que mais se automatiza.** Porque ela nasce de um fato registrado na base, não de uma pergunta imprevisível. E é justamente a que o escritório não manda hoje, por falta de tempo.

#### 6.2.4 As regras


| #         | Regra                                                                                                                                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN-06** | A aprovação recai sobre o **conteúdo final**, não sobre a intenção. Em A3b, o advogado aprova o texto exato da mensagem; em A3a, aprova o gabarito e as regras de preenchimento — que produzem um texto determinístico, reconstruível a qualquer momento (RF-43) |
| **RN-07** | Aprovação em lote é permitida **apenas** na faixa A1                                                                                                                                                                                                             |
| **RN-08** | Ato com efeito jurídico ou de prazo exige aprovação de **advogado identificado**. Sem exceção e sem automatização                                                                                                                                                |
| **RN-09** | **O pedido de aprovação pendente expira** — não a autorização já concedida. Ver 6.2.5                                                                                                                                                                            |
| **RN-19** | Na dúvida, cai para A3b. Sinalizador ambíguo, campo faltando, cliente sem vínculo verificado: o caminho é a fila de aprovação, nunca o envio                                                                                                                     |


#### 6.2.5 O que "aprovação expira" quer dizer — RN-09 explicada

O escritório pediu esclarecimento, e a regra estava mal redigida. Ela vale para **um pedido de aprovação que ficou parado**, e não para gabaritos nem para autorizações permanentes.

**O caso concreto:** às 9h o agente redige uma resposta ao cliente e manda para o advogado aprovar. O advogado entra em audiência. Às 17h a resposta ainda está lá, sem ninguém clicar. Nesse meio-tempo, o processo pode ter tido nova movimentação, o cliente pode ter ligado e recebido a informação por telefone, ou o assunto pode ter sido resolvido.

Se o advogado clicar em "aprovar" às 17h sem reler, **ele autoriza um texto que descreve um mundo de oito horas atrás**.

Por isso: passada a janela (proposta: **4 horas úteis** para A3b, **2 horas úteis** para A4), o pedido **vence**. O que acontece quando vence:

1. A mensagem **não é enviada**
2. O pedido sai da fila de pendentes e vira registro de "expirado"
3. O caso volta para a fila de trabalho — se ainda fizer sentido responder, o agente redige de novo, **com o dado atual**
4. Ninguém é penalizado, e nada é perdido: a demanda continua na base

**O que não expira:**

- Gabarito aprovado (A3a) — ele tem **data de revisão**, não vencimento por mensagem. Um gabarito revisado em janeiro segue valendo em março, e é reavaliado na revisão periódica (RF-45)
- Alerta de prazo — nunca expira, por desenho (§5.2.1)
- A demanda em si — o pedido de aprovação vence; o trabalho não

🚧 As janelas de 4h e 2h são proposta. Dependem da pergunta 20d.

### 6.3 Conteúdo e veracidade


| #         | Regra                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN-10** | Sem fonte, não se afirma. Toda afirmação factual aponta processo, documento ou consulta verificável                                                     |
| **RN-11** | É proibido citar jurisprudência, número de processo, dispositivo legal ou prazo que não venha de consulta registrada                                    |
| **RN-12** | A plataforma **sinaliza indício de prazo**; não calcula prazo (RF-11)                                                                                   |
| **RN-13** | Conteúdo externo — e-mail, anexo, mensagem de cliente — é hostil até prova em contrário e nunca alimenta diretamente um agente com poder de ação        |
| **RN-20** | **Promessa sem mecanismo não entra em texto nem em gabarito** (D-102). "Vamos verificar e retornamos" só pode ser dito onde existe rotina que faça isso |


### 6.4 Custo


| #         | Regra                                                                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN-14** | Toda chamada paga é atribuída a solicitante, papel, cliente/processo e fluxo                                                                                                        |
| **RN-15** | Orçamento em três níveis: por conversa/sessão · por pessoa/mês · global do escritório/mês                                                                                           |
| **RN-16** | Ao atingir o teto, o sistema **degrada para cache e exige aprovação da chamada específica**. Não para em silêncio, não continua gastando, e aprovar não levanta o teto (§9.5)       |
| **RN-17** | Nenhuma ferramenta pagina em laço automático. Cada bloco de 200 resultados custa dinheiro (R-25)                                                                                    |
| **RN-18** | Alerta antes do teto, não depois                                                                                                                                                    |
| **RN-21** | **O canal do cliente não gasta crédito do Escavador.** Nunca, em nenhuma circunstância, nem com aprovação. Aumentar o teto do canal externo não é uma opção de configuração (RF-29) |


---

## 7. Requisitos não funcionais

### 7.1 Segurança


| #          | Requisito                                                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RNF-01** | Segredo (token, chave, senha) vive em cofre ou variável de ambiente. Nunca em repositório, documento ou prompt                                                             |
| **RNF-02** | Um token por aplicação, com expiração de no máximo 1 ano e revogação isolada                                                                                               |
| **RNF-03** | Entrada externa é sanitizada e delimitada antes de chegar ao agente; instrução encontrada em conteúdo externo nunca é executada                                            |
| **RNF-04** | O endpoint que recebe callback do Escavador valida o segredo compartilhado no cabeçalho `Authorization` antes de processar                                                 |
| **RNF-05** | O receptor de callback é idempotente — o Escavador reentrega, e reentrega não pode duplicar efeito                                                                         |
| **RNF-06** | Nenhuma das APIs de destino oferece segunda barreira (R-16 no Trello, R-24 no Escavador, R-38 no n8n). O código do MCP é a única fronteira, e é auditado como tal          |
| **RNF-18** | O vínculo identidade ↔ Telegram é cadastrado pelo escritório e exige **senha de nuvem (2FA) ativa** na conta do Telegram da pessoa. Sem ela, o vínculo não é aceito (R-47) |


### 7.2 Auditoria


| #          | Requisito                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| **RNF-07** | Registro imutável de quem pediu, o que foi consultado, o que foi decidido, o que custou e quem aprovou                   |
| **RNF-08** | O registro sobrevive à indisponibilidade do n8n — auditoria vive em banco próprio, não em histórico de execução de fluxo |
| **RNF-09** | Acesso a dado de cliente é registrado inclusive quando negado. Tentativa recusada é informação de segurança              |


### 7.3 Desempenho e disponibilidade


| #          | Requisito                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| **RNF-10** | Operação assíncrona nunca bloqueia. O sistema aceita, devolve identificador e notifica quando concluir      |
| **RNF-11** | Consulta servida por cache responde em menos de 2 segundos                                                  |
| **RNF-12** | Vazão da API de destino é controlada no servidor MCP, não no consumidor                                     |
| **RNF-13** | Indisponibilidade do Escavador degrada para cache com aviso explícito de idade do dado, em vez de erro seco |


### 7.4 Conformidade e sigilo


| #          | Requisito                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **RNF-14** | Dado pessoal de cliente não entra em repositório de código. Amostra de resposta de API é anonimizada antes de versionada                                                                                                                   |
| **RNF-15** | Certificado digital da OAB, senha de tribunal e semente de 2FA ficam **fora de todo perfil** nesta fase (R-12)                                                                                                                             |
| **RNF-16** | Autos sob segredo de justiça exigem escopo próprio, jamais concedido com abrangência ampla — inclusive para advogado com abrangência `any` (RF-38)                                                                                         |
| **RNF-17** | O cliente é informado do uso de IA — exigência ética, não cortesia                                                                                                                                                                         |
| **RNF-19** | A plataforma roda em infraestrutura do prestador, não do escritório (D-148). O escritório é **controlador** dos dados e o prestador é **operador** — o contrato precisa dizer isso, e precisa prever devolução e expurgo ao término (R-48) |


---

## 8. Superfície de ferramentas

O produto expõe ao agente uma superfície **curada**, não a API inteira. Cobertura total fica no SDK interno; exposição é decidida por perfil.


| Sistema   | Operações mapeadas | Ferramentas expostas | Detalhe                        |
| --------- | ------------------ | -------------------- | ------------------------------ |
| Escavador | 83                 | **15**               | `mapeamento-escavador.md` §8.1 |
| Trello    | 261                | **12**               | `mapeamento-trello.md` §9      |


**RF-30** — O perfil decide o que **aparece** na janela do agente; o escopo decide o que a chamada tem **direito** de fazer. Ferramenta na mão sem escopo recebe recusa do servidor.

Capacidades que ficam fora de **todo** perfil, em qualquer papel:

- Escavador: toda a família de certificados digitais
- Trello: excluir card, quadro, workspace, ação ou definição de campo; convite por e-mail; operações em massa
- Ambos: qualquer operação destrutiva que tenha alternativa reversível — arquivar em vez de excluir

---

## 9. Modelo de custo

Esta seção é requisito funcional, não anexo financeiro (P7). Os preços são os do painel autenticado, levantados em 20/08/2026 (`07-painel-escavador-achados.md`) e **calibrados pela medição** de 26 e 27/08 (D-108).

### 9.1 O que custa, e quanto


| Operação                                                   | Preço                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| Consultar envolvidos de um processo                        | R$ 0,05                                                                  |
| Obter resumo por IA já existente                           | R$ 0,05                                                                  |
| Solicitar geração de resumo por IA                         | R$ 0,08                                                                  |
| Consultar status de tarefa assíncrona                      | **Gratuito** — medido                                                    |
| Receber entrega de callback                                | **Gratuito** — medido, 3 entregas a R$ 0,00                              |
| Listar, consultar, editar e **remover** monitoramento      | **Gratuito** — medido                                                    |
| Consultar aparições de um monitoramento                    | **Gratuito** — medido                                                    |
| Capa do processo · movimentações · atualização no tribunal | R$ 3,00                                                                  |
| Listar processos de um envolvido ou de uma OAB             | R$ 3,00 **por bloco de 200 resultados**                                  |
| Monitorar um processo no tribunal                          | R$ 0,18 a R$ 3,00 **por mês**                                            |
| Monitorar termo em diários oficiais (V1)                   | R$ 3,00/mês por termo · + R$ 0,05 a cada 200 aparições acima da franquia |


### 9.2 O risco de custo aberto — R-25 explicado

O escritório pediu para entender melhor. É o seguinte.

Algumas rotas do Escavador não cobram por consulta: cobram **por bloco de até 200 resultados**. Se a resposta tem 150 resultados, é um bloco — R$ 3,00. Se tem 201, são dois blocos — R$ 6,00. Se tem 1.000, são cinco — R$ 15,00.

O problema é que **ninguém sabe quantos resultados vêm antes de perguntar**. E a pergunta que aciona isso é a mais natural que existe:

> *"Quais são os processos deste cliente?"*

Para uma pessoa física com dois processos, custa R$ 3,00. Para uma empresa que litiga muito — um banco, uma operadora, um município — pode custar R$ 15,00 ou mais, **na mesma pergunta, feita do mesmo jeito**. É a única despesa do sistema que não dá para prever olhando para a pergunta.

Tratamento, já como requisito:


| #         | Requisito                                                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-31** | Nenhuma ferramenta pagina em laço. Traz um bloco, devolve, e **informa que há mais** — quem decide continuar é gente                            |
| **RF-32** | Antes de listar envolvido de volume desconhecido, **contar** com a rota de resumo, que é barata. Perguntar "quantos são?" antes de "quais são?" |
| **RF-33** | Teto de blocos por chamada e por papel. Acima do teto, a IA propõe, escreve o custo estimado no pedido, e um advogado aprova                    |


**Os tetos propostos** (configuráveis, e este é o número que o escritório precisa avalizar):


| Papel       | Blocos sem aprovação                                       | Custo máximo por chamada |
| ----------- | ---------------------------------------------------------- | ------------------------ |
| Cliente     | **0** — o agente do cliente nunca lista nada pago (RF-29)  | R$ 0,00                  |
| Colaborador | 1 bloco (até 200 resultados)                               | R$ 3,00                  |
| Advogado    | 2 blocos (até 400 resultados)                              | R$ 6,00                  |
| Acima disso | A IA propõe, com o custo estimado escrito. Advogado aprova | —                        |


### 9.3 Vigilância de prazo — a escolha que muda a conta

Há dois caminhos para descobrir que algo aconteceu num processo, e eles diferem em **duas ordens de grandeza**:


| Caminho                                                          | Como funciona                                                         | Custo para 200 processos                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Monitorar cada processo no tribunal (V2)                         | Um monitoramento por processo                                         | 200 × R$ 3,00/mês = **R$ 600,00/mês**                                       |
| Monitorar cada processo, variante mensal com documentos públicos | Idem, frequência menor                                                | 200 × R$ 0,18/mês = **R$ 36,00/mês**                                        |
| **Monitorar o nome dos advogados no diário oficial (V1)**        | Um monitoramento por advogado, captura toda publicação que o mencione | **R$ 3,00/mês por advogado** · escritório com 5 advogados: **R$ 15,00/mês** |


**Recomendação de produto:** a vigilância de prazo se apoia primariamente no **monitoramento de diário oficial por nome de advogado (V1)**, complementada por monitoramento de processo apenas onde houver razão específica. Três motivos:

1. **É onde nasce o prazo.** Publicação em diário oficial é o gatilho da intimação; movimentação no sistema do tribunal é consequência
2. **O custo não cresce com a carteira.** Um monitoramento por advogado cobre todos os processos em que ele está constituído, inclusive os que o escritório ainda não cadastrou
3. **Custa duas ordens de grandeza menos** que a alternativa por processo

✅ **Confirmado pelo suporte em 25/08:** o "até 200 itens" são **aparições encontradas**, não termos vigiados. A assinatura é **por termo** — R$ 3,00/mês por nome vigiado, com franquia mensal de aparições e **+ R$ 0,05 a cada 200 aparições** adicionais. **R-25 não se aplica aqui** (ver `07-painel-escavador-achados.md` §11.5).

> ⚠️ **Nota de vocabulário, medida em 26/08 (D-109):** a API V1 não tem tipo "OAB". Ela aceita `termo` e `processo`. O que se vigia, na prática, é o **nome do advogado** — não o número de inscrição. O documento diz "por OAB" em vários lugares por herança; o que o sistema faz é vigiar nome.

#### 9.3.1 A franquia de aparições — como funciona, e o que fazer quando ela apertar

> 🔴 **A franquia não é só preço — é um interruptor de desligamento.** A documentação oficial da V1 é explícita: *"Ao atingir este limite dentro do mês, o monitoramento interrompe a captura de novos dados até ao próximo mês."*
>
> A assinatura segue ativa, paga e saudável em qualquer listagem — e para de ver. **Nada distingue "cegou no dia 12" de "mês tranquilo."**

**Como o número é definido, na prática.** Ele é um campo — `limite_aparicoes` — preenchido **no momento de criar o monitoramento**. Na criação real de 26/08, a API devolveu `limite_aparicoes: 1000`, e não os 200 que a documentação descreve como padrão. Por isso o chassi **lê o teto da resposta**, nunca o supõe (D-107).

> 🔴 **E aqui está o achado que muda o tratamento (R-46).** Conforme o mapeamento do OpenAPI, a rota de edição da V1 — `PUT /api/v1/monitoramentos/{id}` — aceita apenas `origens_ids` e `variacoes`. **`limite_aparicoes` não está entre os campos editáveis.** Ou seja: **o número escolhido na criação é o número do ciclo inteiro.** Não dá para aumentar a franquia no meio do mês quando o alarme tocar.
>
> Isso transforma "dimensionar com folga" de conselho prudente em **único controle disponível**. *(Levantado do mapeamento do OpenAPI, ainda não medido contra a API — conferir antes de implementar.)*

**Como comunicar isso à advogada proprietária.** O escritório pediu ajuda com a conversa. Sugestão de texto, para dizer com essas palavras:

> *"Cada nome que a gente coloca para vigiar nos diários oficiais tem uma franquia mensal de publicações capturadas. Dentro dela, tudo é capturado normalmente. Se estourar, o Escavador **para de capturar até o mês seguinte** — e não avisa: a vigilância continua aparecendo como ativa no painel. Passar da franquia custa R$ 0,05 a cada 200 publicações — cinco centavos. Ou seja, apertar esse número economiza centavos e compra risco de perder prazo. Minha recomendação é começar com folga larga — **1.000 publicações por mês, por advogado** — e revisar no terceiro mês, com o volume real já medido. Preciso do seu de acordo com esse número, porque ele é decisão do escritório, não minha. E preciso que seja agora, na criação, porque esse valor não pode ser aumentado depois — só na recriação, no mês seguinte."*

**O procedimento quando o alarme de 70% toca** (RF-35). O escritório perguntou o que fazer. Nesta ordem:

1. **O alarme já traz o número** — quantas aparições foram consumidas, quantas faltam e quantos dias faltam para o ciclo virar. A primeira coisa é olhar se o ritmo realmente vai estourar
2. **Conferir se o volume é real ou ruído.** Nome comum captura publicação de homônimo. Se for isso, a rota de edição **aceita `variacoes`** — refinar as variações reduz o consumo, e é o único ajuste que a API permite no meio do ciclo
3. **Se o volume for real, a franquia não sobe neste ciclo.** As saídas, em ordem de preferência:
  - **(a)** Cobrir os processos com prazo próximo com **monitoramento por processo** (V2) até o ciclo virar. Custa R$ 0,18 a R$ 3,00 por processo/mês, e só nos que importam
  - **(b)** Reforçar a conferência humana do diário nos dias restantes — a rotina manual que R-02 nunca dispensou
  - **(c)** Recriar o monitoramento com franquia maior. **Cobra assinatura nova**, e é decisão do escritório, não do agente
4. **Registrar o que aconteceu.** O consumo real deste ciclo é o que dimensiona o próximo. É assim que o número deixa de ser chute em três meses

**E como a vigilância é operada no dia a dia:** a assinatura **fica ligada indefinidamente**. Removê-la é a operação de maior dano silencioso do projeto (R-14), restrita a `remover_monitoramento` — ferramenta separada, escopo separado, confirmação explícita (D-29) — e reservada a eventos de cadastro: o advogado sai do escritório, transfere a OAB, o escritório deixa de atuar numa jurisdição. **Remoção rotineira só existe em ambiente de teste.**

### 9.4 O atendimento ao cliente não consulta a API paga — e agora, nunca

**RF-29 é a decisão de custo mais importante do produto.** O escritório fez a pergunta certa: *"quanto custa uma única consulta de um cliente?"*

A resposta: **R$ 3,00.** Capa do processo e movimentações são as duas rotas de R$ 3,00 do catálogo — e são exatamente o que uma pergunta de cliente pediria. Três centavos seria irrelevante; três reais, por uma pergunta que o cliente pode repetir amanhã, não é.

O escritório também observou, com razão, que **o dado interno pode estar desatualizado**. Está certo — e a conclusão que ele tirou é a que adotamos:

> ✅ **D-144 — O agente do cliente não gasta crédito do Escavador. Nunca.**
>
> Dado ausente ou vencido **não** dispara consulta paga: dispara **escalada ao time**, com um aviso honesto ao cliente de que alguém vai verificar. Quem decide se vale R$ 3,00 é uma pessoa do escritório, com o caso na frente — não um agente respondendo uma pergunta às 23h de domingo.

Isso é mais restritivo do que a v1.0 do PRD dizia ("dentro do teto por conversa"), e é melhor por três motivos:

1. **A exposição financeira do canal externo passa a ser exatamente zero em crédito do Escavador**, e zero não precisa de teto, de alarme nem de disjuntor
2. **Some a pergunta "qual é o teto por conversa?"** — que o escritório fez, e que não tinha boa resposta
3. **A escalada é honesta com o cliente.** "Não tenho essa informação atualizada, vou pedir para a equipe verificar" é melhor resposta que um dado de trinta dias apresentado como atual

**O que mantém a base fresca, então?** A vigilância (E2), que é assinatura mensal fixa e cujas entregas por callback são **gratuitas, medidas**. O dado chega sozinho, de graça, todo dia útil. A base interna não fica velha por falta de consulta paga — ela fica fresca porque o Escavador empurra o que muda.


| Sem esta decisão                                                                                 | Com esta decisão                                                                             |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 100 clientes × 3 perguntas/mês × R$ 3,00 = **R$ 900,00/mês**, e crescendo com a base de clientes | Custo do canal do cliente em crédito do Escavador: **R$ 0,00**, fixo, independente do volume |


**E o RF-28, o "teto por conversa"?** Ele continua existindo, mas passa a limitar outra coisa: **consumo de modelo de IA e número de mensagens**. Uma conversa que passa de ~30 mensagens ou de um teto de custo de modelo escala a humano — não porque ficou cara, mas porque conversa longa demais é sinal de que o agente não está resolvendo. 🚧 Os números dependem do provedor de modelo escolhido (pergunta 70) e ainda não foram medidos.

### 9.5 Orçamento e disjuntor — como funciona, e com que números

O escritório pediu para entender o mecanismo. São três tetos encadeados, e **o mais restritivo vence**:


| Nível                        | O que limita                                          | Teto proposto                                    |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| **Por sessão/conversa**      | Impede que um agente em laço torre o saldo numa tarde | **R$ 9,00** (três chamadas caras)                |
| **Por pessoa/mês**           | Distribui responsabilidade e revela uso atípico       | **R$ 60,00** advogado · **R$ 30,00** colaborador |
| **Global do escritório/mês** | Último anteparo                                       | **R$ 300,00**                                    |


> Os números acima são **proposta**, dimensionada para um escritório de porte pequeno com vigilância de 5 advogados (R$ 15/mês fixos) e consulta pontual. Eles precisam do aval do escritório, e serão recalibrados no primeiro trimestre com o consumo real. O teto do canal do cliente não aparece na tabela porque é zero por construção (RN-21).

**O que acontece quando um teto é atingido.** Três coisas, nesta ordem:

1. **Para de gastar.** Nenhuma chamada paga nova sai. Esta é a parte que impede o prejuízo
2. **Continua respondendo — "degrada para cache".** Isto é o que a expressão quer dizer: o sistema segue atendendo com o que **já está guardado** na base interna e no cache, e **diz a idade do dado** em toda resposta ("última movimentação registrada em 14/08"). O agente não fica mudo; ele fica honesto sobre estar olhando para uma fotografia, não para a janela
3. **A chamada que estourou o teto vira um pedido de aprovação**, com o custo estimado escrito nele: *"consultar movimentações do processo X — estimativa R$ 3,00 — orçamento do mês em 100%"*

**"Exige aprovação para prosseguir" — prosseguir com o quê?** Com **aquela chamada específica**, e só com ela. Aprovar não levanta o teto, não libera o mês e não abre exceção para as próximas. Cada chamada acima do teto é um pedido novo. Levantar o teto de verdade é outra coisa: é alteração de configuração, feita pelo administrador, registrada — e é o momento certo para alguém perguntar se o orçamento está subdimensionado ou se tem algo errado no uso.

Duas camadas de alarme: a nossa e o **Alerta de saldo** nativo do painel do Escavador, que é gratuito (D-54).

**RF-34** — Recarga de crédito do Escavador **não é autosserviço**: depende de atendimento comercial e pode levar dias (R-22). O disjuntor alerta com antecedência suficiente para pedir recarga antes de parar, não depois.

---

## 10. Métricas de sucesso

Cada resultado esperado da §2.3 com métrica e instrumentação.


| Resultado                 | Métrica                                                                         | Como se mede                                                             |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Cliente se atende sozinho | Taxa de resolução sem humano; tempo até primeira resposta                       | Conversas encerradas sem escalada ÷ total                                |
| Nada se perde             | Cobertura de registro                                                           | Mensagens processadas com registro ÷ mensagens recebidas. **Meta: 100%** |
| Prazo não se perde        | Tempo entre publicação e alerta confirmado por advogado                         | Carimbo de evento até o "Ciente" (§5.2.1)                                |
| Trabalho manual cai       | Volume de consulta automatizada; consultas manuais residuais                    | Contagem por fluxo                                                       |
| Controle e auditoria      | Rastreabilidade completa                                                        | Amostra aleatória de ações reconstruída ponta a ponta                    |
| Qualidade do agente       | **Taxa de rejeição em aprovação humana**                                        | Rascunhos rejeitados ÷ rascunhos submetidos                              |
| **Autonomia**             | **% de mensagens externas enviadas por gabarito (A3a)**                         | Mensagens A3a ÷ total de mensagens externas                              |
| Custo sob controle        | Custo por consulta; custo por cliente atendido; % de resposta servida por cache | Painel de custo                                                          |


### 10.1 Por quanto tempo se mede a taxa de rejeição, e o agente responde sozinho algum dia?

O escritório fez as duas perguntas. As respostas:

**A medição não tem prazo para acabar** — mas o que se faz com ela muda ao longo do tempo:


| Momento               | Para que serve a taxa de rejeição                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Piloto de E3 e E4** | É o critério que decide se o agente sai do piloto. Rejeição alta = não abre                                                                                |
| **Operação normal**   | É termômetro. Ela sobe quando um gabarito envelhece, quando a base ganha um tipo de caso novo, ou quando alguém mexeu no prompt. Subiu, tem coisa quebrada |
| **Sempre**            | É o que autoriza um caso a virar gabarito — ver abaixo                                                                                                     |


Ela é barata de medir (sai da diferença entre `conteudo_proposto` e `conteudo_final`, que a base já guarda) e não custa trabalho a ninguém. Desligar um termômetro que não incomoda é como parar de olhar o painel do carro porque o motor está bom.

**E sim, o agente responde sozinho — cada vez mais.** Mas não porque alguém decidiu confiar nele: porque casos **graduam** de A3b para A3a, por evidência:

> **D-151 — O catálogo de gabaritos cresce por evidência.** Um tipo de mensagem que acumula **20 aprovações consecutivas sem edição** e nenhuma rejeição na janela vira candidato a gabarito. Um advogado lê o gabarito proposto, aprova (ou não), e a partir dali aquele caso sai sozinho — registrado, amostrado (RF-45) e desligável a qualquer momento (RF-44).

É essa a resposta à preocupação com eficiência: **a eficiência cresce pelo catálogo, não pela retirada do humano.** No começo, quase tudo passa por aprovação. Em três meses, o volume repetitivo — que é a maior parte — sai por gabarito, e a fila de aprovação fica só com o que é realmente novo. Que é exatamente onde o advogado deveria estar olhando.

Contramétrica obrigatória: **taxa de escalada indevida** — conversa escalada a humano por falha do agente em algo que estava dentro do escopo dele. Sem ela, é fácil parecer seguro escalando tudo.

Segunda contramétrica, nova nesta versão: **taxa de correção pós-envio em A3a** — mensagem enviada por gabarito que precisou de retificação depois. Sem ela, é fácil parecer eficiente automatizando o que não devia (R-49).

---

## 11. Premissas

Atualizadas em 27/08 com as respostas do escritório.


| #            | Premissa                                                                        | Estado                              | Consequência                                                                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P-01**     | O escritório aceita migrar de conta compartilhada para identidade individual    | ✅ **Confirmada, por outro caminho** | Identidade individual **pelo Telegram**, uma conta por pessoa, todas identificadas — não por licenças do Workspace, para evitar gasto no início. O escritório foi informado das implicações e aceitou os riscos. RF-01 é viável e a faixa A4 fica liberada (D-25). **Mas R-11 continua aberto para e-mail e Drive** — ver §14 e D-147 |
| **P-02**     | ~~Advogado tem acesso à carteira em que está constituído~~                      | ❌ **Caiu**                          | Advogado acessa **a base inteira** (D-07 resolvida). Matriz de privilégios alterada; compensação por auditoria em RF-37 (§3.1)                                                                                                                                                                                                        |
| **P-03**     | O Trello é quadro de trabalho, e a base interna é a fonte da verdade da demanda | ✅ **Confirmada**                    | D-09 resolvida. Desenho de E3 mantido; a base interna está explicada em §4.3                                                                                                                                                                                                                                                          |
| **P-04**     | Há saldo contratado no Escavador quando E1 entrar em operação                   | 🟡 **Em providência**               | A cota de teste expira em **01/09/2026** (renovada; a v1.0 dizia 23/08). Sem saldo, E1 não opera em produção                                                                                                                                                                                                                          |
| **P-05**     | O escritório usará WhatsApp Business Platform oficial                           | 🟡 **A confirmar**                  | Biblioteca não oficial arrisca banimento do número; E4 não vai ao ar. D-10 permanece                                                                                                                                                                                                                                                  |
| ~~**P-06**~~ | ✅ **Encerrada em 25/08.** Os preços do painel **são** o catálogo do pré-pago    | —                                   | O §9 se apoia em preço confirmado e medido                                                                                                                                                                                                                                                                                            |
| **P-07**     | O volume da carteira cabe em um bloco de 200 na maioria das consultas           | ✅ **Confirmada em 05/09**           | ~313 processos ativos (289 + 24) e **nenhum cliente com 200 processos ou mais**. Consulta ampla cabe em um bloco; o pior caso conhecido é **dois**. R-25 fica pequeno e os tetos da §9.2 se sustentam. Ver §11.1 e D-193                                                                                                                |
| **P-08**     | A infraestrutura (n8n, banco, MCP) é do prestador, não do escritório            | ✅ **Confirmada**                    | Destrava a implementação inteira, e cria obrigação contratual de operador de dados (RNF-19, D-148, R-48)                                                                                                                                                                                                                              |


### 11.1 O que P-07 quer dizer, e o que as contagens responderam

O escritório respondeu *"não entendi; o que eu preciso confirmar?"*. Justo — a premissa estava escrita em jargão. Traduzindo:

As rotas de listagem cobram por bloco de 200 (§9.2). A premissa P-07 diz: *"na maior parte das vezes, a resposta vai caber em um bloco só, e vai custar R$ 3,00"*. Se isso for verdade, R-25 é um risco pequeno. Se for falso — se as consultas normalmente devolverem 500 ou 1.000 resultados —, cada consulta custa R$ 9,00 ou R$ 15,00, e os tetos da §9.2 ficam apertados demais para o trabalho fluir.

**As duas contagens chegaram em 05/09** (perguntas 4b e 4c em `02-descoberta-perguntas-abertas.md`), e a premissa se confirma:

1. **Quantos processos ativos?** ~**313** — cerca de 289 da advogada Malu Souza e 24 da Ana Beatriz. Centenas, não milhares
2. **Existe cliente com mais de 200 processos?** **Não.** Nenhuma parte concentra volume que exija tratamento próprio

O efeito prático: uma varredura da carteira inteira custa **dois blocos** no pior caso, não dez, e a consulta do dia a dia — por cliente, por processo — cabe folgadamente em um. Os tetos da §9.2 não precisam ser afrouxados, e a consulta processo a processo prevista para o "cliente de alto volume" **não precisa ser construída agora**: não há a quem aplicá-la. Ver **D-193**.

⚠️ **A mesma resposta cobrou um preço em outro lugar.** Com sete pessoas e sem hierarquia (perguntas 1 e 2 da descoberta), **não existe a "sócia responsável"** para quem a §5.2.1 mandava escalar no N2. O rito de prazo termina nas duas advogadas, e precisa ser redesenhado com isso — ver §5.2.1 e a pergunta 20b.

---

## 12. Dependências

Atualizadas em 27/08.


| Dependência                                   | Estado                                                                                                             | Bloqueia                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Saldo contratado no Escavador                 | 🟡 **Cota de teste renovada até 01/09/2026**, R$ 44,00 restantes. Saldo contratado em providência                  | E1 em produção                             |
| Acesso à instância n8n                        | ✅ **Resolvido — é a instância do prestador**, fornecida junto com o serviço, já em uso                             | —                                          |
| URL pública para receber callback             | ✅ **Resolvido e provado** — `callback.criativeia.com.br`, no n8n do prestador, validada nos dois caminhos em 26/08 | —                                          |
| Número CNJ de processo real para teste        | ✅ **Resolvido** — 8 processos dos autos em PDF; TJAP e TRT8 já capturados                                          | —                                          |
| Identidade individual para a equipe           | ✅ **Resolvido — contas individuais no Telegram**, uma por pessoa, cadastradas pelo escritório                      | —                                          |
| Credenciais do Trello (chave, token, segredo) | 🟡 **Em providência**                                                                                              | E3, e o levantamento das perguntas 26 e 27 |
| Conta WhatsApp Business Platform              | 🟡 **Em providência**                                                                                              | E4                                         |
| Respostas do questionário de descoberta       | 🟡 **Em providência.** As cinco que travavam o PRD foram respondidas em 27/08                                      | Refino de E3 e E4                          |
| Aval do escritório sobre os números propostos | 🔴 **Aberto** — franquia de aparições, tetos de bloco, tetos de orçamento, N1 e N2 da escalada                     | Configuração de E2 e do disjuntor          |


---

## 13. Perguntas que bloqueiam este PRD

Numeração de `02-descoberta-perguntas-abertas.md`. 🚧 marca o que trava decisão de produto.


| Pergunta                           | Trava                                                                                             | Destinatário             | Estado                                                                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~16a–16c~~                        | Conta compartilhada — P-01, RF-01                                                                 | Escritório               | ✅ **Respondida em 27/08** — identidade individual pelo Telegram (D-147). É o Caminho B da Nota Técnica 01 §1.6.3                                                               |
| ~~D-07~~                           | Advogado vê base inteira ou só a carteira?                                                        | Escritório               | ✅ **Respondida em 27/08** — base inteira (§3.1, D-146)                                                                                                                         |
| ~~D-09~~                           | Trello é fonte da verdade ou visualização?                                                        | Escritório               | ✅ **Respondida em 27/08** — visualização (§4.3, D-152)                                                                                                                         |
| ~~12~~                             | Prazo de escalada de alerta não lido                                                              | Escritório               | ⚠️ **Referência corrigida.** A pergunta 12 do questionário é sobre horário de atendimento, não sobre escalada. O rito foi escrito em §5.2.1 e as perguntas viraram **20a–20d** |
| 🚧 **20a–20d**                     | N1, N2, horário útil, último degrau da escalada e janela de expiração de aprovação — RF-13, RN-09 | Escritório               | 🔴 **Nova, aberta**                                                                                                                                                            |
| ~~4a~~                             | O colaborador também vê a base inteira, ou segue na carteira?                                     | Escritório               | ✅ **Respondida em 05/09** — base inteira, com perfil individual mantido (D-192, R-59)                                                                                          |
| ~~4b–4c~~                          | Quantos processos ativos? Há cliente com mais de 200 processos? — P-07                            | Escritório               | ✅ **Respondida em 05/09** — ~313 processos, sem cliente de alto volume. **P-07 confirmada** (§11.1, D-193)                                                                     |
| 🚧 **6**                           | Colaborador pode aprovar ato com efeito de prazo? — Regra Inegociável 2, RN-09                    | Escritório               | 🔴 **Nova, aberta.** O escritório disse "todos aprovam, sob supervisão"; supervisão informal não cabe num botão. Proposta em D-194                                             |
| **26 e 27**                        | Campos personalizados e automações Butler existentes — RF-20                                      | ~~Escritório~~ → **Nós** | 🟡 **Reatribuída em 27/08.** O escritório não sabe responder. Vira levantamento técnico nosso, assim que a chave de API do Trello chegar                                       |
| 🚧 **Franquia, tetos e orçamento** | Os números da §9.2, §9.3.1 e §9.5                                                                 | Escritório               | 🔴 **Aberto** — propostas escritas, aguardando o de acordo                                                                                                                     |
| ~~Ao suporte do Escavador~~        | "Até 200 itens" são aparições, não termos                                                         | Escavador                | ✅ Respondida em 25/08 — §9.3                                                                                                                                                   |
| ~~Ao suporte do Escavador~~        | A tabela é o catálogo real do pré-pago                                                            | Escavador                | ✅ Respondida em 25/08 — P-06 encerrada                                                                                                                                         |


---

## 14. Riscos que afetam o produto

Recorte dos riscos de `01` §15 que mudam **o que o produto faz**, não apenas como é construído.


| Risco                                                              | Efeito no produto                                                                                                                                                                                                                                                                               | Tratamento                                                                                                                                                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R-11** — conta compartilhada                                     | ⚠️ **Parcialmente resolvido.** A identidade da plataforma passa a ser individual pelo Telegram, o que destrava RF-01, aprovação nominal e a faixa A4. **Mas e-mail e Drive do escritório continuam numa conta única** — ou seja, E3 lê de uma caixa que nenhuma pessoa responde individualmente | D-147; dito com clareza ao escritório, que aceitou (item 16c). Reavaliar quando E3 entrar                                                                                                     |
| **R-47** — identidade pelo Telegram depende de número de telefone  | **Novo.** Troca de chip, clonagem e SIM swap alcançam a conta; e o escritório **não administra** as contas do Telegram da equipe — não há desligamento central                                                                                                                                  | Vínculo cadastrado pelo escritório e revogável na plataforma (RNF-18); 2FA obrigatório no Telegram; conteúdo confidencial não trafega na mensagem (D-17), só notificação e link para o painel |
| **R-24** e **R-16** — nenhuma API de destino tem escopo            | O código do MCP é a única fronteira de segurança                                                                                                                                                                                                                                                | RN-03, RNF-06, revisão de segurança dedicada                                                                                                                                                  |
| **R-25** — custo por bloco de 200                                  | A consulta mais natural do cliente é a de custo mais imprevisível                                                                                                                                                                                                                               | RF-31 a RF-33, com os tetos da §9.2                                                                                                                                                           |
| **R-46** — a franquia de aparições não é editável depois de criada | **Novo.** O alarme de 70% não pode ser resolvido aumentando o número. Dimensionar na criação é o único controle                                                                                                                                                                                 | RF-40, procedimento de §9.3.1                                                                                                                                                                 |
| **R-48** — a plataforma roda em infraestrutura do prestador        | **Novo.** Concentração, dependência e obrigação de operador de dados sob a LGPD                                                                                                                                                                                                                 | RNF-19; contrato prevendo devolução, expurgo e continuidade                                                                                                                                   |
| **R-49** — gabarito pré-aprovado envelhece                         | **Novo.** Um texto aprovado uma vez continua saindo depois de a realidade mudar — e ninguém percebe, porque não passa mais por ninguém                                                                                                                                                          | Revisão datada, amostragem pós-envio (RF-45), desligamento imediato por qualquer advogado (RF-44), taxa de correção pós-envio como contramétrica (§10)                                        |
| **R-22** — recarga não é autosserviço                              | O produto pode parar por dias esperando o comercial                                                                                                                                                                                                                                             | RF-34                                                                                                                                                                                         |
| **R-02 / R-14** — perda de prazo por falha silenciosa              | O pior desfecho possível                                                                                                                                                                                                                                                                        | RF-13 com o rito de §5.2.1, RF-14, RF-15, RF-35, RF-36; e RN-12 mantém o humano na contagem                                                                                                   |
| **R-12** — a API guarda certificado e senha de advogado            | Capacidade que não entra no produto                                                                                                                                                                                                                                                             | RNF-15                                                                                                                                                                                        |
| **R-40** — cegueira por cota                                       | Vigilância para de ver sem emitir erro                                                                                                                                                                                                                                                          | RF-35, RF-40, §9.3.1                                                                                                                                                                          |


---

## 15. Decisões que este documento propõe

### 15.1 Decisões da v1.0, com a resposta do escritório


| #        | Decisão                                                                                                                                          | Resposta do escritório                                     | Estado                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| **D-61** | Quatro entregas, com **vigilância de prazo (E2) antes de demandas (E3)** e **atendimento ao cliente (E4) por último**                            | ✅ Sim                                                      | ✅ **Confirmada** (escritório, 27/08)                               |
| **D-62** | A vigilância de prazo se apoia primariamente em **monitoramento de diário oficial por nome de advogado (V1)**, não em monitoramento por processo | 🟡 "Vou confirmar com o escritório"                        | 🟡 **Proposta** — pendente                                         |
| **D-63** | O agente do cliente lê da **base interna alimentada pela vigilância**                                                                            | ✅ Sim, com esclarecimento                                  | ✅ **Confirmada e endurecida por D-144** — nunca recorre à API paga |
| **D-64** | A plataforma **sinaliza indício de prazo e nunca calcula prazo**. Contagem é ato de advogado                                                     | ✅ Sim — "mas os colaboradores também verificam isso"       | ✅ **Confirmada**, com o complemento em **D-145**                   |
| **D-65** | Aprovação **expira**                                                                                                                             | ✅ Após esclarecimento (§6.2.5)                             | ✅ **Confirmada**, redigida em **D-143**                            |
| **D-66** | A **taxa de rejeição em aprovação humana** é a métrica primária de qualidade                                                                     | ✅ Sim, com esclarecimento (§10.1)                          | ✅ **Confirmada**                                                   |
| **D-67** | Identidade individual é **bloqueio de projeto**, não preferência                                                                                 | ✅ "Terá identidade individual, pelo Telegram por enquanto" | ✅ **Confirmada** — desdobrada em **D-147**                         |


### 15.2 Decisões novas, geradas pelas respostas


| #         | Decisão                                                                                                                                                                                                                                                                                                                          | Recomendação       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **D-142** | **A faixa A3 se divide em A3a e A3b.** Comunicação externa por **gabarito pré-aprovado** sai automática e registrada; texto livre exige aprovação mensagem a mensagem. É o que devolve eficiência sem tirar o humano do circuito (§6.2)                                                                                          | Adotar             |
| **D-143** | **A expiração recai sobre o pedido de aprovação pendente**, nunca sobre gabarito nem sobre autorização concedida. Pedido vencido não envia, vira registro e devolve o caso à fila — o agente redige de novo com o dado atual (§6.2.5)                                                                                            | Adotar             |
| **D-144** | **O agente do cliente não gasta crédito do Escavador em nenhuma circunstância.** Dado ausente ou vencido produz escalada, não chamada paga. Fecha a exposição financeira do canal externo em zero e torna desnecessário o teto de crédito por conversa (§9.4). **Endurece D-63**                                                 | Adotar             |
| **D-145** | **O alerta de indício de prazo vai para colaborador e advogado; só o "Ciente" de um advogado encerra a escalada.** O clique do colaborador registra triagem e para o reenvio para ele, sem parar o relógio. Traduz a informação do escritório sem afrouxar D-64 (§5.2.1)                                                         | Adotar             |
| **D-146** | **Advogado enxerga a base inteira** (D-07 resolvida). O controle removido é substituído por registro: acesso fora da carteira é marcado como acesso amplo e vai a relatório mensal (RF-37). Segredo de justiça continua exigindo escopo próprio (RF-38)                                                                          | Adotar             |
| **D-147** | **A identidade individual vem do Telegram + painel — Caminho B da Nota Técnica 01 §1.6.3.** Uma conta por pessoa, vínculo cadastrado pelo escritório, 2FA obrigatório na conta do Telegram, revogação na plataforma. **R-11 permanece aberto para e-mail e Drive**, e isso foi dito e aceito pelo escritório (item 16c)          | Adotar             |
| **D-148** | **A plataforma roda na infraestrutura do prestador**, não do escritório — n8n, banco e servidores MCP. Consequência contratual: o escritório é **controlador** e o prestador é **operador** de dados pessoais, com obrigação de devolução e expurgo ao término (RNF-19, R-48)                                                    | Adotar             |
| **D-149** | **Tetos numéricos propostos** como padrão configurável: blocos por papel (§9.2), franquia de aparições de 1.000/mês por advogado (§9.3.1), orçamento de R$ 9,00 por sessão · R$ 60,00 e R$ 30,00 por pessoa/mês · R$ 300,00 no escritório (§9.5). Números são proposta nossa e exigem o de acordo do escritório                  | Adotar, e submeter |
| **D-150** | **A franquia de aparições da V1 não é editável depois de criada** — a rota de edição aceita só `origens_ids` e `variacoes`. Dimensionar na criação é o único controle, e o alarme de 70% dispara um **procedimento** (§9.3.1), não um ajuste de número (R-46). *Levantado do OpenAPI; conferir por medição antes de implementar* | Adotar             |
| **D-151** | **O catálogo de gabaritos cresce por evidência.** Caso com 20 aprovações consecutivas sem edição e nenhuma rejeição vira candidato a gabarito, aprovado uma vez por advogado. É assim que a autonomia sobe — pelo catálogo, não pela retirada do humano (§10.1)                                                                  | Adotar             |
| **D-152** | **O Trello é visualização; a base interna é a fonte da verdade** (D-09 resolvida). Demanda existe primeiro na base e depois no quadro; card órfão e demanda sem card são sinalizados na conferência (RF-39, §4.3)                                                                                                                | Adotar             |


---

## 16. Próximo passo

1. **Aval do usuário** sobre D-142 a D-152 — em bloco ou com ressalvas
2. **Levar ao escritório os números** que precisam do de acordo dele: franquia de aparições (§9.3.1), tetos de bloco (§9.2), tetos de orçamento (§9.5), N1 e N2 da escalada (§5.2.1) e a janela de expiração de aprovação (§6.2.5). O texto para a conversa com a advogada proprietária está pronto em §9.3.1
3. **Levar ao escritório as quatro perguntas novas** — 4a (colaborador), 4b e 4c (volume da carteira), 20a a 20d (rito do alerta)
4. **Escrever a Parte II da Spec.** Com D-07 e D-09 resolvidas, ela deixou de ser ficção: a matriz definitiva de escopos e a modelagem da demanda estão destravadas. Falta apenas o levantamento do Trello, que depende da chave de API

> **Atualização de 27/08/2026.** A Parte I da Spec (chassi, motor de custo, cache, receptor de callbacks e esquema de dados) segue válida integralmente — nada nas respostas do escritório a contradiz. O que muda é que a **Parte II** ganhou insumo: escopos por papel com abrangência definida, e a demanda modelada com a base interna como fonte da verdade.

