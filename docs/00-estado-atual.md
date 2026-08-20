# Estado Atual

| Campo | Valor |
|---|---|
| Atualizado em | 2026-08-20 |
| Fase | **1 — Descoberta e mapeamento das APIs — concluída** |
| Branch | `claude/law-firm-ai-automation-6pwaug` |
| Código | Nenhum ainda. Só definição |
| Crédito Escavador | ⚠️ **Cota de teste: R$ 50,00 · 16 requisições · 10 dias · R$ 3,00 por chamada.** Ver `06-orcamento-de-chamadas-escavador.md` |

> Documento vivo. É o primeiro que uma sessão nova deve ler.

---

## Onde estamos

Fases 0 e 1 concluídas. Os dois mapeamentos de API estão prontos — Escavador e Trello.

**O próximo passo é o PRD e a Spec**, e depois o chassi dos servidores MCP.

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
| Orçamento de chamadas da cota de teste do Escavador | `06-orcamento-de-chamadas-escavador.md` |

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

O suporte do Escavador Business liberou **saldo de teste**: R$ 50,00, **16 requisições**, **10 dias**, com **R$ 3,00 fixos por requisição, em qualquer rota**. Não há plano pago contratado.

Isso vira restrição de projeto, não detalhe operacional:

- **Nenhuma rota é gratuita agora.** O que os mapeamentos marcam 🆓 custa R$ 3,00 na cota de teste
- **A cota não revela a tabela de preços** — o custo é fixo. A pendência de preço por rota continua dependendo do painel autenticado
- **16 chamadas validam contrato, não cobertura.** Autenticação, cobertura do plano (V1 e V2), formato dos dados e ciclo de webhook. Nada além disso
- **Recarga paga é decisão do usuário**, tomada com o registro de execução à vista

Registrado como **R-21** e decisões **D-47 a D-50**. O orçamento chamada a chamada está em `06-orcamento-de-chamadas-escavador.md` e **precisa de aval antes da primeira execução**.

## Próximo passo

**PRD e Spec.** Os dois mapeamentos entregaram o que faltava: superfície real, formato das respostas, limites, custo, modelo de webhook e desenho de ferramentas.

Depois: **chassi dos servidores MCP**. O §14 do mapeamento do Trello registra a diferença que o chassi precisa absorver — o recurso escasso é crédito no Escavador e vazão no Trello, e o disjuntor tem de cobrir os dois.

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
- **Dados do painel do Escavador** — tabela de preços por rota, plano contratado, limite de requisições, URL de callback já cadastrada, tokens existentes na conta. Só existem no painel autenticado
- **Data de início da cota de teste** — para saber quando os 10 dias expiram
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
| **R-15** — plano do Escavador pode não cobrir V1 | **Aberto.** Depende da pergunta 58 |
| **R-20** — token pessoal do Trello dá acesso à conta inteira e pode ser revogado sem aviso | **Aberto.** Depende da pergunta 66. Agrava R-09 |
| R-13, R-14, R-17 a R-19 | Tratados por desenho (D-29, D-32, D-40, D-46) |
| R-01 — rede bloqueada | **Resolvido.** Acesso a Escavador e Trello reconfirmado em 2026-08-20 |
| Demais (R-02 a R-10) | Registrados em `01` §15, tratados por desenho |
