# lex_ai_n8n

Plataforma de automação e agentes de IA para escritório de advocacia, orquestrada em **n8n**, com camada de integração construída como **servidores MCP reutilizáveis**.

> **Estado atual: Fase 3 — construção.** Os marcos 1, 2 e 3 estão fechados e verificados — fundação, chassi e auditoria. Os servidores MCP, os SDKs e o Policy Gate ainda são casca.
>
> - **Onde o projeto está, e qual o próximo passo:** [`docs/00-estado-atual.md`](docs/00-estado-atual.md)
> - **Quantas migrações, testes, provas, decisões e riscos existem:** [`docs/numeros.md`](docs/numeros.md), gerado do disco por `node ferramentas/contar.mjs` — nunca escrito à mão
>
> *Este README não traz número nenhum, de propósito. Até 11/09 ele dizia 7 migrações e 44 testes, números de semanas antes, e chamava de "previstos" quatro documentos que já existiam. Resumo envelhece; ponteiro não (D-232).*

## Escopo em uma tela

| Frente | O que é |
|---|---|
| **F1** — Atendimento externo | Agente de WhatsApp para clientes: status do próprio processo, envio de documentos, triagem, escalada a humano |
| **F2** — Operação interna | Agentes para advogados e colaboradores, com privilégios segmentados |
| **F3** — E-mail e documentos | Monitoramento de caixa, classificação, leitura de anexos, resposta após confirmação humana |
| **F4** — Camada MCP | Servidor MCP do Escavador (prioridade 1) e do Trello (prioridade 2), reutilizáveis por vários consumidores |
| **F5** — Governança | Identidade, autorização, auditoria, custos, LGPD e ética profissional |

## Documentação

Os documentos são numerados na ordem em que foram criados. **Comece sempre pelo `00`.**

| Documento | Conteúdo |
|---|---|
| [`00-estado-atual.md`](docs/00-estado-atual.md) | **Onde o projeto está agora**, o que está pendente e qual o próximo passo |
| [`01-diretrizes-gerais.md`](docs/01-diretrizes-gerais.md) | Escopo, princípios, arquitetura, modelo de privilégios — e o **registro único** de decisões (§13) e de riscos (§15) |
| [`02-descoberta-perguntas-abertas.md`](docs/02-descoberta-perguntas-abertas.md) | As perguntas feitas ao escritório, com as respostas recuadas abaixo de cada uma |
| [`03-canais-internos-e-hospedagem.md`](docs/03-canais-internos-e-hospedagem.md) | Nota Técnica 01 — por onde a equipe usa os agentes, e onde ficam os servidores MCP |
| [`04-modelo-de-identidade-e-autorizacao.md`](docs/04-modelo-de-identidade-e-autorizacao.md) | Modelo de dados, escopos, contrato do Policy Gate, aprovação, auditoria e custo |
| [`05-acesso-as-fontes-das-apis.md`](docs/05-acesso-as-fontes-das-apis.md) | Como obter a documentação das APIs: rede, arquivos no repositório, SDKs oficiais |
| [`06-orcamento-de-chamadas-escavador.md`](docs/06-orcamento-de-chamadas-escavador.md) | Orçamento de chamadas ao Escavador — **o cabeçalho é a sede única do saldo** (D-233). Leia antes de qualquer chamada |
| [`07-painel-escavador-achados.md`](docs/07-painel-escavador-achados.md) | O que o painel da API do Escavador mostrou, medido |
| [`08-prd.md`](docs/08-prd.md) | PRD — requisitos funcionais e não funcionais, cada um com critério de aceite |
| [`09-spec-tecnica.md`](docs/09-spec-tecnica.md) | Spec técnica, Parte I — chassi, custo e fundação. **A árvore do repositório está na §3** |
| [`10-clickup-avaliacao.md`](docs/10-clickup-avaliacao.md) | Nota Técnica 02 — ClickUp no lugar do Google Workspace, do Chat e do Trello |
| [`11-nota-tecnica-demo.md`](docs/11-nota-tecnica-demo.md) | Nota Técnica 03 — a demonstração ao vivo para o escritório, antes do contrato |
| [`12-fundacao-marco-1.md`](docs/12-fundacao-marco-1.md) | Marco 1 — a fundação: monorepo, esquema e migrações |
| [`13-chassi-marco-2.md`](docs/13-chassi-marco-2.md) | Marco 2 — o chassi: sessão, escopo, abrangência, erro e envelope |
| [`14-auditoria-marco-3.md`](docs/14-auditoria-marco-3.md) | Marco 3 — a auditoria: a prova que não se edita |
| [`15-contrato-da-aparicao.md`](docs/15-contrato-da-aparicao.md) | O contrato da aparição em diário oficial, medido em entregas reais |
| [`16-levantamento-instancia-n8n.md`](docs/16-levantamento-instancia-n8n.md) | Levantamento da instância n8n: versão, retenção, o que é deste projeto e o que não é |
| [`17-plano-de-execucao.md`](docs/17-plano-de-execucao.md) | Plano de execução — passos, dependências e o que dá para fazer em paralelo |
| [`18-digesto-de-aval.md`](docs/18-digesto-de-aval.md) | Digesto de aval — as decisões que pedem a sua leitura, agrupadas (P-02) |
| [`19-painel-web-e-administracao.md`](docs/19-painel-web-e-administracao.md) | Nota Técnica 04 — o painel web e a administração da plataforma |
| [`20-revisao-geral.md`](docs/20-revisao-geral.md) | A revisão completa de 09/09 — **o roteiro vivo** da execução dela, item a item |
| [`21-pauta-reuniao-malu.md`](docs/21-pauta-reuniao-malu.md) | Pauta da reunião com a Malu — tudo o que depende do escritório, na ordem da conversa |
| [`mapeamento-escavador.md`](docs/mapeamento-escavador.md) | Mapeamento da API do Escavador, V1 e V2 |
| [`mapeamento-trello.md`](docs/mapeamento-trello.md) | Mapeamento da API do Trello |
| [`numeros.md`](docs/numeros.md) | **Gerado** por `ferramentas/contar.mjs`. Não edite à mão — a CI e o fechamento de sessão recusam o arquivo desatualizado |

## Roteiro

```
Fase 0  Diretrizes                                            ✅ concluída
Fase 1  Descoberta e mapeamento das APIs (Escavador → Trello)  ✅ concluída
Fase 2  PRD + Spec                                             🟡 escritos, aguardando aval
Fase 3  Construção: fundação, chassi, auditoria               ← estamos aqui
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

A verificação completa roda com `npm run verificar`, e exige o PostgreSQL de desenvolvimento de pé (`npm run banco:subir`). A integração contínua roda a mesma coisa a cada envio.
