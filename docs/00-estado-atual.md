# Estado Atual

| Campo | Valor |
|---|---|
| Atualizado em | 2026-08-20 |
| Fase | **1 — Descoberta e mapeamento das APIs** |
| Branch | `claude/escavador-api-mapping-5f35iz` |
| Código | Nenhum ainda. Só definição |

> Documento vivo. É o primeiro que uma sessão nova deve ler.

---

## Onde estamos

A Fase 0 (diretrizes) está concluída. O **mapeamento da API do Escavador está concluído** — superfície completa de V1 e V2, faixas A0–A4, escopos `escavador:*`, política de cache e desenho das ferramentas MCP.

**O próximo passo é o mapeamento do Trello.**

## Concluído

| Entrega | Documento |
|---|---|
| Diretrizes gerais — escopo, princípios, arquitetura, privilégios, LGPD e ética, riscos | `01-diretrizes-gerais.md` |
| Questionário de descoberta — 74 perguntas por destinatário | `02-descoberta-perguntas-abertas.md` |
| Canal interno e hospedagem dos MCP — Telegram, Google Chat, MCP no n8n | `03-canais-internos-e-hospedagem.md` |
| Modelo de identidade, autorização, aprovação e auditoria | `04-modelo-de-identidade-e-autorizacao.md` |
| Como obter as fontes das APIs | `05-acesso-as-fontes-das-apis.md` |
| **Mapeamento da API do Escavador** — 83 operações, escopos, cache, ferramentas MCP | **`mapeamento-escavador.md`** |

## O que o mapeamento do Escavador concluiu

- **83 operações** mapeadas: 41 em V2, 42 em V1. Fonte primária foram os OpenAPI oficiais de cada versão, não raspagem de HTML.
- **V1 e V2 são complementares, não sucessivas.** V2 não tem diários oficiais, busca livre, entidades (pessoas/instituições) nem saldo. Diário oficial é onde aparece a publicação que dispara prazo — o MCP precisa das duas versões (D-27).
- **15 ferramentas MCP** curadas sobre as 83 operações, com cinco perfis de exposição (D-28).
- **19 escopos `escavador:*`** definidos, com `autos:read` e `monitoramento:delete` deliberadamente separados.
- **Política de cache** por tipo de dado, de "não cachear" (status de tarefa) a "permanente" (conteúdo de documento).
- Decisões **D-27 a D-35** e riscos **R-12 a R-15** somados a `01-diretrizes-gerais.md`.

## Próximo passo

**Mapear a API do Trello** → `docs/mapeamento-trello.md`. Rede já liberada para `*.atlassian.com`, `developer.atlassian.com` e `api.trello.com`.

Depois dele: PRD e Spec, e então o chassi dos servidores MCP.

## Combinado com o usuário, ainda não feito

- **Chassi dos servidores MCP** — base compartilhada (cliente HTTP com repetição e vazão, cache, verificação de escopo, auditoria, formatação de erro, registro de ferramentas por perfil). Acordado fazer depois do mapeamento. O mapeamento do Escavador já entregou o que faltava para desenhá-lo: formato de resposta, cabeçalho de custo, limite de 500 req/min, padrão assíncrono e política de cache.

## Decisões

**D-01 a D-35** estão em `01-diretrizes-gerais.md` §13.

- ✅ Confirmadas: D-01 (n8n como orquestrador), D-02 (camada MCP reutilizável)
- 🟡 Propostas aguardando aval do usuário: todas as demais, exceto as abaixo
- 🔴 Em aberto, dependem do escritório: **D-07** (advogado vê toda a base ou só sua carteira) e **D-09** (Trello é gestão de casos ou quadro de tarefas)

## Pendências com o escritório

Perguntas **16a a 16c** de `02-descoberta-perguntas-abertas.md`, sobre a conta compartilhada do Google Workspace (R-11). Não bloqueiam.

**Elevada em urgência:** pergunta **58** — qual plano do Escavador está contratado, e se ele cobre V1 além de V2. Se cobrir só V2, o escritório fica sem monitoramento de diário oficial (R-15).

Também abertas: **D-07**, **D-09** e o restante do questionário.

## Pendências com o usuário

- **Credenciais do Escavador** — destravam as 7 pendências listadas em `mapeamento-escavador.md` §15, sendo a principal a **tabela de preços por rota**, que só existe no painel autenticado. Sem ela as quotas são arbitrárias
- Acesso à instância n8n e à infraestrutura, para calibrar §12.2 de `01`
- Aval sobre as decisões propostas (D-03 a D-35)

## Riscos ativos

| Risco | Situação |
|---|---|
| **R-11** — conta única do Workspace compartilhada por toda a equipe | **Grave e aberto.** Inviabiliza privilégio por papel, aprovação nominal e auditoria. Levar ao escritório |
| **R-12** — API armazena certificado digital, senha e semente de 2FA do advogado | **Gravíssimo.** Tratado por desenho: rotas de certificado fora de todo perfil de exposição (D-30) |
| **R-15** — plano contratado pode não cobrir V1 | **Aberto.** Depende da pergunta 58 |
| R-13, R-14 — custo recorrente invisível e remoção acidental de monitoramento | Tratados por desenho (D-32, D-29) |
| R-01 — rede bloqueada | **Resolvido.** Acesso a `api.escavador.com` reconfirmado em 2026-08-20 |
| Demais (R-02 a R-10) | Registrados em `01` §15, tratados por desenho |
