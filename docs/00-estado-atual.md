# Estado Atual

| Campo | Valor |
|---|---|
| Atualizado em | 2026-08-19 |
| Fase | **1 — Descoberta e mapeamento das APIs** |
| Branch | `claude/law-firm-ai-automation-6pwaug` |
| Código | Nenhum ainda. Só definição |

> Documento vivo. É o primeiro que uma sessão nova deve ler.

---

## Onde estamos

A Fase 0 (diretrizes) está concluída e documentada. O acesso de rede às fontes das APIs foi liberado pelo usuário. **O próximo passo é o mapeamento da API do Escavador.**

## Concluído

| Entrega | Documento |
|---|---|
| Diretrizes gerais — escopo, princípios, arquitetura, privilégios, LGPD e ética, riscos | `01-diretrizes-gerais.md` |
| Questionário de descoberta — 74 perguntas por destinatário | `02-descoberta-perguntas-abertas.md` |
| Canal interno e hospedagem dos MCP — Telegram, Google Chat, MCP no n8n | `03-canais-internos-e-hospedagem.md` |
| Modelo de identidade, autorização, aprovação e auditoria | `04-modelo-de-identidade-e-autorizacao.md` |
| Como obter as fontes das APIs | `05-acesso-as-fontes-das-apis.md` |

## Próximo passo

**Mapear a API do Escavador** → `docs/mapeamento-escavador.md`.

Fontes disponíveis, a combinar:
- Documentação oficial em `api.escavador.com/v2/docs/` — **rede liberada**
- SDK oficial `Escavador/escavador-python` no GitHub — comando de clone em `CLAUDE.md`

O que o mapeamento precisa produzir: superfície completa de v1 e v2, classificação de cada operação nas faixas A0–A4, custo por operação, escopos `escavador:*` conforme a convenção de `04`, política de cache por tipo de dado, e o desenho das ferramentas MCP segundo §7.1 de `01` (cobertura total no SDK interno, exposição curada nas ferramentas).

Depois dele: mapeamento do Trello, então PRD e Spec.

## Combinado com o usuário, ainda não feito

- **Chassi dos servidores MCP** — base compartilhada (cliente HTTP com repetição e vazão, cache, verificação de escopo, auditoria, formatação de erro, registro de ferramentas por perfil). Foi acordado fazer **depois** do mapeamento, porque o mapeamento revela o formato real das respostas.

## Decisões

**D-01 a D-26** estão em `01-diretrizes-gerais.md` §13.

- ✅ Confirmadas: D-01 (n8n como orquestrador), D-02 (camada MCP reutilizável)
- 🟡 Propostas aguardando aval do usuário: todas as demais, exceto as abaixo
- 🔴 Em aberto, dependem do escritório: **D-07** (advogado vê toda a base ou só sua carteira) e **D-09** (Trello é gestão de casos ou quadro de tarefas)

## Pendências com o escritório

Perguntas **16a a 16c** de `02-descoberta-perguntas-abertas.md`, sobre a conta compartilhada do Google Workspace (R-11). Não bloqueiam: o modelo de `04` funciona nos dois caminhos.

Também abertas: **D-07** e **D-09**, e o restante do questionário.

## Pendências com o usuário

- Acesso à instância n8n e à infraestrutura, para calibrar §12.2 de `01`
- Credenciais e plano contratado do Escavador (perguntas 58 e 60 a 64)
- Aval sobre as decisões propostas

## Riscos ativos

| Risco | Situação |
|---|---|
| **R-11** — conta única do Workspace compartilhada por toda a equipe | **Grave e aberto.** Inviabiliza privilégio por papel, aprovação nominal e auditoria. Levar ao escritório |
| R-01 — rede bloqueada | **Resolvido** pelo usuário, em modo `Custom` |
| Demais (R-02 a R-10) | Registrados em `01` §15, tratados por desenho |
