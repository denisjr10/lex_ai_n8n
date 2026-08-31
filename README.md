# lex_ai_n8n

Plataforma de automação e agentes de IA para escritório de advocacia, orquestrada em **n8n**, com camada de integração construída como **servidores MCP reutilizáveis**.

> **Estado atual: Fase 3 — construção.** Fundação e chassi de pé, os dois verificados: monorepo com 9 pacotes,
> 7 migrações num PostgreSQL 16 com 25 provas de regra, e o `mcp-core` com 44 testes passando. Duas demonstrações
> rodando — colaborador no Telegram e cliente no WhatsApp, ligadas uma na outra. PRD (v2.0) e Spec Parte I aguardam aval.
>
> **A fonte da verdade é [`docs/00-estado-atual.md`](docs/00-estado-atual.md)** — este parágrafo é resumo, e resumo envelhece.

## Escopo em uma tela

| Frente | O que é |
|---|---|
| **F1** — Atendimento externo | Agente de WhatsApp para clientes: status do próprio processo, envio de documentos, triagem, escalada a humano |
| **F2** — Operação interna | Agentes para advogados e colaboradores, com privilégios segmentados |
| **F3** — E-mail e documentos | Monitoramento de caixa, classificação, leitura de anexos, resposta após confirmação humana |
| **F4** — Camada MCP | Servidor MCP do Escavador (prioridade 1) e do Trello (prioridade 2), reutilizáveis por vários consumidores |
| **F5** — Governança | Identidade, autorização, auditoria, custos, LGPD e ética profissional |

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/00-estado-atual.md`](docs/00-estado-atual.md) | **Onde o projeto está agora**, o que está pendente e qual o próximo passo |
| [`docs/01-diretrizes-gerais.md`](docs/01-diretrizes-gerais.md) | Escopo, princípios, arquitetura de referência, modelo de privilégios, registro de decisões, riscos |
| [`docs/02-descoberta-perguntas-abertas.md`](docs/02-descoberta-perguntas-abertas.md) | Questionário de descoberta para o escritório, para a equipe técnica e sobre contratos |
| [`docs/03-canais-internos-e-hospedagem.md`](docs/03-canais-internos-e-hospedagem.md) | Nota técnica: por onde a equipe interna usa os agentes (Telegram?) e onde ficam os servidores MCP (dentro do n8n?) |
| [`docs/04-modelo-de-identidade-e-autorizacao.md`](docs/04-modelo-de-identidade-e-autorizacao.md) | Modelo de dados, escopos, contrato do Policy Gate, fluxo de aprovação, auditoria e custo |
| [`docs/05-acesso-as-fontes-das-apis.md`](docs/05-acesso-as-fontes-das-apis.md) | Como obter a documentação das APIs: política de rede, arquivos no repositório, SDKs oficiais |

Documentos previstos: `mapeamento-escavador.md`, `mapeamento-trello.md`, PRD e Spec técnica.

## Roteiro

```
Fase 0  Diretrizes                                            ✅ concluída
Fase 1  Descoberta e mapeamento das APIs (Escavador → Trello)  ✅ concluída
Fase 2  PRD + Spec                                             🟡 escritos, aguardando aval
Fase 3  Fundação (policy gate, auditoria, identidade)          ← estamos aqui
Fase 4  MCP Escavador
Fase 5  Operação interna (e-mail, documentos, Trello)
Fase 6  MCP Trello
Fase 7  Atendimento externo (WhatsApp), em piloto
```

## Duas decisões que definem o projeto

**O agente nunca é a fronteira de segurança.** Privilégios são aplicados como escopos no servidor MCP e como política em um serviço próprio — nunca por instrução no prompt. Detalhes na §6 das diretrizes.

**A IA propõe, o humano dispõe.** Toda ação com efeito externo exige aprovação humana; todo ato com efeito jurídico ou de prazo exige aprovação de advogado, sem exceção.

## Trabalhando neste repositório

[`CLAUDE.md`](CLAUDE.md) traz as convenções, as regras inegociáveis e os fatos de ambiente — é lido automaticamente por sessões do Claude Code.
