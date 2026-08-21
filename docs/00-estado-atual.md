# Estado Atual

| Campo | Valor |
|---|---|
| Atualizado em | 2026-08-21 |
| Fase | **2 — PRD e Spec.** PRD escrito; **Spec Parte I (chassi) escrita**. Ambos aguardam aval. A Parte II depende do escritório |
| Branch | `claude/law-firm-ai-automation-6pwaug` |
| Código | Nenhum ainda. Só definição |
| Crédito Escavador | ✅ **Prorrogado em 21/08 por mais 10 dias** (data exata na barra lateral do painel). R$ 50,00 · **R$ 0,00 gastos** · 🚧 débito real por chamada em aberto — ver `06-orcamento-de-chamadas-escavador.md` §1-C |

> Documento vivo. É o primeiro que uma sessão nova deve ler.

---

## Onde estamos

Fases 0 e 1 concluídas. Os dois mapeamentos de API estão prontos — Escavador e Trello.

Fase 2 em andamento: **PRD escrito e Spec Parte I escrita**, ambos aguardando aval. **O próximo passo é construir a fundação** (marcos 1 a 5 da §15 da Spec), que não depende de crédito nem de resposta do escritório.

## Concluído

| Entrega | Documento |
|---|---|
| Diretrizes gerais — escopo, princípios, arquitetura, privilégios, LGPD e ética, riscos | `01-diretrizes-gerais.md` |
| Questionário de descoberta — 74 perguntas por destinatário | `02-descoberta-perguntas-abertas.md` |
| Canal interno e hospedagem dos MCP — Telegram, Google Chat, MCP no n8n | `03-canais-internos-e-hospedagem.md` |
| Modelo de identidade, autorização, aprovação e auditoria | `04-modelo-de-identidade-e-autorizacao.md` |
| Como obter as fontes das APIs | `05-acesso-as-fontes-das-apis.md` |
| Mapeamento da API do Escavador — 83 operações | `mapeamento-escavador.md` |
| Mapeamento da API do Trello — 261 operações | `mapeamento-trello.md` |
| Orçamento de chamadas da cota de teste do Escavador (rev. 2.0) | `06-orcamento-de-chamadas-escavador.md` |
| **Achados do painel autenticado do Escavador — preços, tokens, callbacks, organização** | `07-painel-escavador-achados.md` |
| **PRD — produto, entregas, requisitos, regras de negócio e modelo de custo** | `08-prd.md` |
| **Spec Técnica — Parte I: chassi, motor de custo, cache, callbacks, esquema de dados** | `09-spec-tecnica.md` |
| **Nota Técnica 02 — ClickUp no lugar de Workspace, Chat e Trello: viabilidade, recursos e custo** | `10-clickup-avaliacao.md` |

## O que os mapeamentos concluíram

**Escavador (83 operações — 41 em V2, 42 em V1)**

- V1 e V2 são **complementares, não sucessivas**. V2 não cobre diários oficiais, busca livre, entidades nem saldo. Diário oficial é onde sai a publicação que dispara prazo — o MCP precisa das duas (D-27).
- 15 ferramentas curadas, 19 escopos `escavador:*`, política de cache por tipo de dado.
- Custo vem no cabeçalho `Creditos-Utilizados`, mas a tabela de preços por rota só existe no painel autenticado.
- **R-12:** a API armazena certificado digital, senha e semente de 2FA do advogado.

**Trello (261 operações)**

- **R-16 é o achado central:** a API **não tem escopo por quadro ou recurso**. Um token `read` lê a conta inteira. O isolamento entre carteiras depende do nosso código, não do Trello (D-36).
- O OAuth 2.0, que traria escopos granulares, foi anunciado em abril de 2025 e **ainda não chegou** em julho de 2026. Não dá para planejar contando com ele (D-37).
- 12 ferramentas curadas sobre 261 operações — a superfície destrutiva do Trello (excluir quadro, apagar histórico, arquivar em massa) fica fora de todo perfil.
- Recurso escasso aqui é **vazão**, não dinheiro: o Trello não cobra por chamada.
- Resolvida a ressalva de §7.3: ferramentas de fluxo do escritório vivem no **n8n**, não no MCP (Regra 3, D-44).

## Restrição nova — crédito do Escavador

O suporte do Escavador Business liberou **saldo de teste** em **13/08/2026**: R$ 50,00, **16 requisições**, **10 dias** — ou seja, **expira em 23/08/2026** — com **R$ 3,00 fixos por requisição, em qualquer rota**. Não há plano pago contratado.

🔴 **O prazo é o problema maior que o dinheiro.** Crédito não gasto até 23/08 é perdido. Primeira providência: **pedir prorrogação ao suporte**. Em paralelo, executar os Blocos A e B do orçamento, que não dependem de nada além do token e de um número de processo.

Isso vira restrição de projeto, não detalhe operacional:

- ~~**Nenhuma rota é gratuita agora.**~~ ✅ **Corrigido em 20/08 pelo Playground:** as rotas de *status* do ciclo assíncrono são **gratuitas**, e os preços vão de R$ 0,00 a R$ 3,00 — ver a seção do painel, abaixo
- **A cota não revela a tabela de preços** — o custo é fixo. A pendência de preço por rota continua dependendo do painel autenticado
- **16 chamadas validam contrato, não cobertura.** Autenticação, cobertura do plano (V1 e V2), formato dos dados e ciclo de webhook. Nada além disso
- **Recarga paga é decisão do usuário**, tomada com o registro de execução à vista

Registrado como **R-21** e decisões **D-47 a D-50**. O orçamento chamada a chamada está em `06-orcamento-de-chamadas-escavador.md` e **precisa de aval antes da primeira execução**.

## O painel do Escavador foi lido — 20/08/2026

Com o Claude Code rodando na máquina local, foi possível navegar no painel autenticado `api.escavador.com` e transcrever tudo, **sem gastar um centavo de crédito**. O documento é `07-painel-escavador-achados.md`. Seis das sete pendências de `mapeamento-escavador.md` §15 foram encerradas.

O que mais muda o projeto:

- **Nem toda requisição custa R$ 3,00.** Os preços vão de **R$ 0,05** (`Envolvidos do processo`) a R$ 3,00. O teto de "16 requisições" era o pior caso — o orçamento revisado gasta ~R$ 18,25 em 9 chamadas
- **R-15 encerrado.** V1 e V2 estão ambas disponíveis, com diário oficial, jurisprudência e legislação. Não há restrição de plano — a conta está "sem contrato ativo"
- **Não há URL de callback cadastrada.** Nada a quebrar, e cadastrar a nossa é gratuito. O Bloco C está destravado do lado do Escavador
- **O token do Escavador não tem escopo** — a tela de criação só oferece nome, expiração e um interruptor de Playground. É o mesmo problema do R-16 do Trello, agora nas duas APIs: **nenhuma delas é segunda barreira** (R-24). Um token por aplicação continua valendo, mas por atribuição e revogação, não por privilégio (D-51)
- **Existem rotas gratuitas** — as de **status** do ciclo assíncrono. O Playground confere nove de nove serviços com a tabela de preços, e revela que ela lista **só o que é cobrado**: ausência dali pode significar gratuito (D-59)
- **Quatro rotas cobram por bloco de 200 resultados**, com volume desconhecido antes da chamada — é a consulta mais natural do agente e a de custo mais imprevisível (R-25, D-57, D-58)
- **Recarga não é autosserviço** — depende do comercial. Risco novo, R-22
- **O painel substitui instrumentação nossa**: histórico de requisições filtrável por token, histórico de callbacks com payload e tentativas, e alerta de saldo por e-mail

## O PRD está escrito — 20/08/2026

`08-prd.md`, versão 1.0, 🟡 aguardando aval. Ele define quatro entregas (E1 fundação e consulta · E2 vigilância de prazo · E3 demandas e organização · E4 atendimento ao cliente), 34 requisitos funcionais com critério de aceite, 18 regras de negócio, 17 não funcionais, métricas e modelo de custo com os preços reais.

Três decisões de produto que valem destaque:

- **E2 antes de E3** — perda de prazo é o pior desfecho do projeto, e a vigilância é também a entrega mais barata
- **D-62 — vigiar diário oficial por OAB, não processo a processo.** Mesma cobertura por **R$ 3,00/mês** em vez de R$ 600,00/mês para 200 processos. É onde nasce o prazo, e o custo não cresce com a carteira
- **D-63 — o agente do cliente lê da base interna**, não da API paga sob demanda. Sem isso, a exposição financeira fica aberta e nas mãos de quem não paga a conta

Sete perguntas travam o refino (§13 do PRD), e **P-01 — identidade individual — é a premissa mais crítica**: se cair, metade dos requisitos cai junto (D-67).

## A Spec técnica começou pela metade que não depende do escritório — 20/08/2026

`09-spec-tecnica.md`, **Parte I**, versão 1.0, 🟡 aguardando aval. O critério de corte: está na Parte I tudo que seria construído **exatamente igual** sob qualquer resposta que o escritório der.

Ela especifica o **chassi** (`mcp-core`) e tudo que se apoia nele: arquitetura de execução, organização do repositório, sessão e verificação de escopo, motor de custo, cache, receptor de callbacks, esquema de dados, taxonomia de erros, vazão, observabilidade, segurança e testes.

O que mais decide desenho:

- **A ferramenta declara, o chassi decide.** Nenhuma ferramenta MCP chama o Policy Gate, lê token, mede custo ou grava auditoria. Ela declara faixa, escopo, sujeito, custo e cache — e o chassi aplica. Assim **não existe caminho até a API que escape da verificação**, e a Regra 1 deixa de depender da disciplina de quem escreve ferramenta
- **Onze etapas, e negar é sempre mais barato que permitir.** As oito primeiras não custam um centavo: recusa por escopo ou abrangência acontece antes da chamada paga (RF-07)
- **Preço é dado, não código.** O catálogo fica em arquivo versionado, com classificação `cobrada`/`gratuita`/`desconhecida`, unidade de cobrança e data de leitura. Quando o suporte responder P-06, muda-se um arquivo — não o código (D-71)
- **Reserva antes, reconciliação depois** (D-72). Sem reserva, dez chamadas simultâneas de R$ 3,00 passam por um orçamento de R$ 5,00, porque nenhuma debitou ainda
- **A auditoria vem antes do motor de custo** na ordem de construção, porque custo é um tipo de registro. Fazer na ordem inversa é retrabalho garantido
- **Toda a fundação pode ser construída e testada sem gastar crédito**, sobre gravações anonimizadas. O crédito só entra na verificação final ponta a ponta — os R$ 0,05 já orçados (D-78)

Riscos novos: **R-26** (o chassi concentra a fronteira — raio de dano máximo), **R-27** (janela entre revogar sessão e ela expirar), **R-28** (reserva por estimativa pode subestimar nas rotas por bloco). Decisões **D-68 a D-78**.

## O ClickUp foi avaliado — 20/08/2026

`10-clickup-avaliacao.md`, versão 1.0, 🟡 aguardando aval. A pergunta era se o ClickUp poderia substituir Google Workspace, Google Chat e Trello. **São três perguntas, com três respostas:**

- **Workspace: não substitui.** O ClickUp não hospeda e-mail em domínio próprio nem emite identidade — o recurso "Email" dele **conecta** uma conta que já existe (Gmail, Outlook, M365 ou IMAP). A frente F3 continuaria dependendo do Google. A recomendação de licenças individuais (D-21, D-67) fica intacta (D-79)
- **Google Chat: substitui, com ressalvas.** Some a limitação que matou o Chat (convidado externo não interage com aplicativo), mas a **API de Chat é experimental**, **não tem botão nem cartão** e **não tem identidade de robô** — a mensagem sai como o dono do token (R-29, R-30)
- **Trello: substitui, e é o único eixo com ganho real** — mas o ganho é **de segurança, não de preço**

O achado central: **o token OAuth do ClickUp herda as permissões do usuário**, então o produto consegue ser a segunda barreira que nem o Trello (R-16) nem o Escavador (R-24) conseguem ser. Isso torna o R-26 menos afiado, sem dispensar a Regra 1 (D-81).

Achado secundário, de desenho, que vale independentemente de migração: **a aprovação humana deve viver na tarefa, não na mensagem** — mudança de status capturada por webhook assinado que identifica o autor. Resolve as necessidades N3, N4 e N6 melhor que botão de chat (D-83).

E a conta de custo: **não sai mais barato.** Corrigindo o R-11 nos dois cenários, trocar Trello por ClickUp Unlimited custa **≈ R$ 129/mês a mais** para 12 pessoas; o plano Business, ≈ R$ 452/mês a mais. O caminho recomendado é **piloto no plano gratuito** (membros ilimitados, custo zero) antes de qualquer contrato, e **congelar a migração até D-09 ser respondida** (D-85).

Riscos novos: **R-29** (API de Chat experimental), **R-30** (sem identidade de aplicativo), **R-31** (migrar descarta o mapeamento do Trello), **R-32** (concentração em fornecedor único cobrado em dólar). Decisões **D-79 a D-85**. Perguntas novas ao escritório: **P-08 a P-12**.

## Próximo passo

Dois caminhos que não competem entre si:

1. **Construir os marcos 1 a 5** da §15 da Spec — esqueleto, chassi, auditoria, motor de custo, cache. Nenhum consome crédito do Escavador nem depende de resposta do escritório
2. **Levar ao escritório** as cinco perguntas que destravam a Parte II, com destaque para a conta compartilhada, registrada como bloqueio de projeto (D-67)

A **Parte II** da Spec — matriz definitiva de escopos, modelagem da demanda, fluxos n8n — é escrita quando essas respostas chegarem.

## Decisões

**D-01 a D-46** estão em `01-diretrizes-gerais.md` §13.

- ✅ Confirmadas: D-01 (n8n como orquestrador), D-02 (camada MCP reutilizável)
- 🟡 Propostas aguardando aval do usuário: todas as demais, exceto as abaixo
- 🔴 Em aberto, dependem do escritório: **D-07** (advogado vê toda a base ou só sua carteira) e **D-09** (Trello é gestão de casos ou quadro de tarefas)

## Pendências com o escritório

**Elevadas em urgência pelos mapeamentos:**

- **Pergunta 58** — plano contratado do Escavador. Se não cobrir V1, o escritório fica sem monitoramento de diário oficial (R-15)
- **Pergunta 66** — é possível criar conta de serviço dedicada no Trello? Se não, R-20 fica sem tratamento
- **Pergunta 27** — Power-Ups e automações Butler ativos no Trello. Butler reage às nossas escritas; precisa ser inventariado antes da primeira gravação

Também abertas: perguntas **16a a 16c** (conta compartilhada do Workspace, R-11), **D-07**, **D-09**, e o restante do questionário. As pendências completas de cada mapeamento estão em `mapeamento-escavador.md` §15 e `mapeamento-trello.md` §13.

## Pendências com o usuário

- **Token do Escavador gerado** ✅ — mas ainda não usado. Aguarda aval do orçamento de chamadas
- ~~**Dados do painel do Escavador**~~ ✅ **Levantados em 20/08** — ver `07-painel-escavador-achados.md`, inclusive a tela de criação de token. Resta do Escavador apenas a **resposta do suporte** às perguntas da §10 (mensagem enviada em 20/08)
- **Número CNJ de um processo real do escritório** — trava a primeira chamada, que custa R$ 0,05 e resolve quatro perguntas de uma vez
- **URL pública de callback** — sem ela, o Bloco C do orçamento não pode ser executado
- **Credenciais do Trello** — chave de API, token e segredo da aplicação (este último é o que assina os webhooks)
- Acesso à instância n8n e à infraestrutura, para calibrar §12.2 de `01`
- Aval sobre as decisões propostas (D-03 a D-46)

## Riscos ativos

| Risco | Situação |
|---|---|
| **R-16** — Trello não tem escopo por quadro; token vê a conta inteira | **Grave e estrutural.** Tratado por desenho (D-36), mas o isolamento passa a depender do nosso código. Precisa ser dito ao escritório |
| **R-11** — conta única do Workspace compartilhada por toda a equipe | **Grave e aberto.** Inviabiliza privilégio por papel, aprovação nominal e auditoria |
| **R-12** — API do Escavador armazena certificado digital, senha e semente de 2FA | **Gravíssimo.** Tratado por desenho: rotas fora de todo perfil (D-30) |
| **R-15** — plano do Escavador pode não cobrir V1 | ✅ **Encerrado em 20/08.** O painel lista V1 e V2 inteiras, com preço, nada bloqueado |
| **R-22** — recarga do Escavador não é autosserviço, depende do comercial | **Novo e aberto.** Risco de prazo: o projeto para até o comercial responder |
| **R-24** — token do Escavador não tem escopo; alcança toda a API da organização | **Novo e grave.** Espelha o R-16 do Trello. Privilégio fica só no código do MCP. Agrava R-12 |
| **R-26** — o `mcp-core` concentra a fronteira de segurança dos dois servidores | **Novo e grave.** Consequência aceita de R-16 + R-24: com uma fronteira só, ela precisa ser auditada como tal (D-78) |
| **R-27** — janela entre revogar a sessão MCP e ela expirar | **Novo, moderado.** Sessão de minutos, lista de revogação, A4 reconsultando o Policy Gate |
| **R-28** — reserva por estimativa pode subestimar o custo nas rotas por bloco | **Novo, financeiro.** Reserva pelo pior caso permitido e teto de blocos por papel |
| **R-29 a R-32** — riscos do ClickUp: API de Chat experimental, sem identidade de robô, migração descarta o mapeamento do Trello, concentração em fornecedor único em dólar | **Novos, moderados e condicionais** — só se materializam se a migração for adotada (`10-clickup-avaliacao.md` §11) |
| ~~R-23~~ — o painel não exibiria a expiração do bônus | ✅ Encerrado no mesmo dia: o painel exibe "Válido até 23/08/2026" |
| **R-20** — token pessoal do Trello dá acesso à conta inteira e pode ser revogado sem aviso | **Aberto.** Depende da pergunta 66. Agrava R-09 |
| R-13, R-14, R-17 a R-19 | Tratados por desenho (D-29, D-32, D-40, D-46) |
| R-01 — rede bloqueada | **Resolvido.** Acesso a Escavador e Trello reconfirmado em 2026-08-20 |
| Demais (R-02 a R-10) | Registrados em `01` §15, tratados por desenho |
