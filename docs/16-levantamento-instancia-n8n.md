# Levantamento da Instância n8n

| Campo | Valor |
|---|---|
| Status | ✅ **Medido em 05/09/2026**, pela API pública da instância e pelo endpoint de métricas |
| Versão | 1.0 |
| Data | 2026-09-05 |
| Finalidade | Responder as perguntas 41 a 50 da descoberta com dado medido, e registrar o que a medição revelou sem que ninguém perguntasse |
| Instância | `auto.criativeia.com.br` (editor) · `callback.criativeia.com.br` (webhooks) |

> **Como isto foi levantado.** Pela chave de API já existente em `demo/n8n.local` e pelo endpoint `/metrics`, que responde **sem autenticação nenhuma**. Nada foi alterado na instância: só leitura. A chave não tem escopo (R-38) — fora do plano Enterprise ela alcança a instância inteira, e é por isso que o cliente em `demo/n8n.mjs` não tem operação destrutiva.

---

## 1. O que a medição respondeu

| # | Pergunta | Resposta medida |
|---|---|---|
| 41 | Versão e hospedagem | **n8n `v1.123.18`**, self-hosted, sobre **Node.js v22.21.0**. No ar há **~43 dias** sem reinício |
| 42 | Modo de execução e workers | **Queue mode confirmado** — as métricas `n8n_queue_job_enqueued_total` e `n8n_queue_job_completed_total` existem, e existem **só em queue mode**. `n8n_instance_role_leader = 1`: este processo é o *leader* (o que agenda), não um worker. **A contagem de workers não sai por aqui** — worker publica métrica no processo dele, não no do leader. Continua valendo o "um worker" que o usuário informou, agora como informação declarada, não medida |
| 43 | Banco do n8n | **PostgreSQL** (declarado pelo usuário; não sai pela API) |
| 44 | Nós de IA e MCP | **Todos presentes e em uso real.** `@n8n/n8n-nodes-langchain.agent`, `mcpTrigger`, `chatTrigger`, `toolWorkflow` (21 usos), `lmChatOpenAi`, `googleGemini`, `memoryBufferWindow`. A versão 1.123 é folgadamente posterior ao mínimo de qualquer um deles |
| 45 | Workflows em produção | **194 workflows, 9 ativos.** Ver §2 — e a resposta importante não é o número |
| 46 | Versionamento | **Nenhum.** Não há projeto de *source control* (recurso Enterprise, e `/projects` responde 403), nem exportação versionada. Os 194 fluxos existem em um lugar só: o banco da instância |
| 47 | Webhooks expostos | **8 gatilhos HTTP em fluxos ativos.** Ver §3 — e a proteção não está onde o n8n a colocaria |
| 48 | Credenciais configuradas | **A API não lista credenciais** — só o esquema delas. O que dá para saber é quais são **referenciadas pelos fluxos ativos**: 10 tipos, 25 credenciais distintas. Ver §4 |
| 49 | Homologação separada | **Não existe.** Não é uma segunda assinatura: é uma segunda instância, com banco próprio, para ensaiar mudança antes de ela tocar o que está no ar |
| 50 | CPU, memória, disco | Parcial: **333 MB residentes**, 32 descritores de arquivo abertos, ~30.600 s de CPU acumulada em 43 dias (≈0,8% de um núcleo, em média). CPU total, memória total e disco **não saem pela aplicação** — dependem do acesso à infra (Parte B2 da descoberta) |

---

## 2. Os 194 fluxos, e o que eles são

Nove ativos. Os nomes dizem o que o número não diz:

| Fluxo ativo | A quem pertence |
|---|---|
| 🟢 PRODUÇÃO — Agente Font Liberty · Jorge v.1 · Agente de Venda Mlx & Co. | Outro cliente |
| ⭐ Agente de Venda NEXUS AI | Outro cliente |
| PoC v2 — Agente Nexus (AI Agent + sub-agente) | Outro cliente |
| Hermes MCP Gateway | Outro projeto |
| 🟢 NEXUS · Fila · Entrada (Produtor) | Outro cliente |
| **[LEX-DEMO] A · Colaborador (Telegram)** | **Este projeto** |
| **[LEX-DEMO] B · Cliente (WhatsApp)** | **Este projeto** |
| **[LEX] Receptor de callback do Escavador** | **Este projeto** |

**A instância é compartilhada entre os clientes do prestador.** Isso já era verdade e estava implícito na D-148 ("a infra é do prestador"); o levantamento apenas põe número nela. O que ela implica para um escritório de advocacia está em **R-60**.

---

## 3. Os oito gatilhos HTTP, e onde está a proteção

| Autenticação do nó | Gatilho | Fluxo |
|---|---|---|
| **nenhuma** | `webhook` POST | 🟢 PRODUÇÃO — Agente Font Liberty |
| **nenhuma** | `webhook` POST | ⭐ Agente de Venda NEXUS AI |
| **nenhuma** | `chatTrigger` | PoC v2 — Agente Nexus |
| **nenhuma** | `webhook` POST | PoC v2 — Agente Nexus |
| `bearerAuth` | `mcpTrigger` | Hermes MCP Gateway |
| **nenhuma** | `webhook` POST | 🟢 NEXUS · Fila · Entrada |
| **nenhuma** | `webhook` POST | **[LEX-DEMO] B · Cliente (WhatsApp)** |
| **nenhuma** | `webhook` POST | **[LEX] Receptor de callback do Escavador** |

⚠️ **"Autenticação nenhuma" aqui significa "nenhuma no nó", e não "nenhuma".** Nos fluxos deste projeto a conferência de origem está **no código do fluxo**, logo depois do webhook — é o desenho fechado na revisão externa de 31/08 e descrito em D-185: entrega com origem inválida é **gravada** e não vira publicação. A verificação foi refeita em 05/09 e os três fluxos LEX continuam conferindo.

Isso é deliberado e não vai mudar: o `Header Auth` do nó recusa antes de o fluxo existir, e recusar antes de gravar é exatamente o que **não** se quer num receptor de callback — entrega não autenticada é sinal de segurança, e apagar sinal de segurança é apagar a evidência de que alguém está batendo na porta.

**Nos cinco fluxos dos outros clientes, não sabemos** — não foram auditados, não são nossos, e não é nosso lugar mexer neles.

---

## 4. Credenciais referenciadas pelos fluxos ativos

| Tipo | Credenciais distintas |
|---|---|
| `supabaseApi` | 6 |
| `googlePalmApi` (Gemini) | 7 |
| `redis` | 4 |
| `openAiApi` | 2 — inclui `[LEX-DEMO] OpenAI` |
| `googleSheetsOAuth2Api` · `rabbitmq` · `httpBearerAuth` · `telegramApi` · `httpHeaderAuth` | 1 cada |
| **`n8nApi`** | **1 — "Conexão Geral"** |

🔴 **A última linha é a que importa.** Existe, dentro do n8n, uma credencial de **API do próprio n8n**, e ela é usada por **dois fluxos de produção de outros clientes** (Font Liberty e Nexus AI), em nós que apagam execuções em andamento. Uma chave de API do n8n **não tem escopo fora do Enterprise** (R-38): ela alcança todos os 194 fluxos, todas as credenciais e todo o histórico de execução da instância — inclusive os deste projeto. Ver **R-61**.

---

## 5. O que este levantamento não conseguiu, e por quê

| O que falta | Por quê | Como obter |
|---|---|---|
| Contagem de workers | Worker publica métrica no processo dele | `docker ps` / `docker compose ps` na infra |
| Versão do PostgreSQL do n8n, e se é o mesmo da aplicação | Não sai pela API | Acesso à infra (Parte B2 da descoberta) |
| Lista de credenciais configuradas | A API pública do n8n **não expõe** `GET /credentials` | Painel do n8n, por captura de tela da lista (nunca dos valores) |
| CPU/memória/disco do host | A aplicação vê só o processo dela | Acesso à infra |
| Proteção de rede na frente do n8n (WAF, lista de IP, Cloudflare) | Não é observável de dentro | Acesso à infra |

---

## 6. O que a medição achou sem ninguém pedir

1. **`/metrics` responde a qualquer um, sem autenticação** — e entrega a versão exata (`v1.123.18`), a contagem de fluxos ativos, a memória e o tempo no ar. Versão exata é o primeiro dado que alguém procura para escolher uma falha conhecida a tentar. **R-60.**
2. **`/rest/settings` também responde sem autenticação**, mas em `settingsMode: "public"` — devolve só método de login e estado de SSO. É o comportamento correto do n8n; fica registrado por completude, não como achado.
3. **SAML, LDAP e OIDC estão desligados**, e o login é por e-mail e senha. Não há SSO para desligar uma pessoa em um lugar só — o que casa com R-11 e R-47, e vale também para quem administra a instância.
4. **Nenhum versionamento**, com 194 fluxos num banco só. A proposta está na resposta à pergunta 46, em `02-descoberta-perguntas-abertas.md`.
