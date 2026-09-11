# Levantamento da Instância n8n

| Campo | Valor |
|---|---|
| Status | ✅ **Medido em 05/09/2026** — a **Parte I** pela API do n8n; a **Parte II** no terminal do servidor, por comandos de leitura rodados pelo usuário |
| Versão | 2.0 — a infraestrutura entrou |
| Data | 2026-09-05 |
| Finalidade | Responder as perguntas **41 a 57** da descoberta com dado medido, e registrar o que a medição revelou sem que ninguém perguntasse |
| Instância | `auto.criativeia.com.br` (editor) · `callback.criativeia.com.br` (webhooks) |
| Servidor | Hostinger VPS `srv957606` · Ubuntu 22.04.5 · **2 vCPU, 7,8 GB, 96 GB** · **Docker Swarm**, 22 stacks |
| ⚠️ Achados | **R-60 a R-66** nasceram deste levantamento. Os três mais graves estão na §8 e na §10 |

> **Como isto foi levantado.** Pela chave de API já existente em `demo/n8n.local` e pelo endpoint `/metrics`, que responde **sem autenticação nenhuma**. Nada foi alterado na instância: só leitura. A chave não tem escopo (R-38) — fora do plano Enterprise ela alcança a instância inteira, e é por isso que o cliente em `demo/n8n.mjs` não tem operação destrutiva.

---

## 1. O que a medição respondeu

| # | Pergunta | Resposta medida |
|---|---|---|
| 41 | Versão e hospedagem | **n8n `v1.123.18`**, self-hosted, sobre **Node.js v22.21.0**. No ar há **~43 dias** sem reinício |
| 42 | Modo de execução e workers | **Queue mode confirmado** — as métricas `n8n_queue_job_enqueued_total` e `n8n_queue_job_completed_total` existem, e existem **só em queue mode**. `n8n_instance_role_leader = 1`: este processo é o *leader* (o que agenda), não um worker. **A contagem de workers não sai por aqui** — worker publica métrica no processo dele, não no do leader. ✅ **Resolvido na Parte II (§9): um worker, medido.** E o n8n está em **quatro** serviços — editor, webhook (2 réplicas), worker e `mcp_api` |
| 43 | Banco do n8n | **PostgreSQL 16** — imagem `pgvector/pgvector:pg16`, com **pgbouncer** na frente. ⚠️ O n8n conecta como o superusuário `postgres` (§9). Medido na Parte II |
| 44 | Nós de IA e MCP | **Todos presentes e em uso real.** `@n8n/n8n-nodes-langchain.agent`, `mcpTrigger`, `chatTrigger`, `toolWorkflow` (21 usos), `lmChatOpenAi`, `googleGemini`, `memoryBufferWindow`. A versão 1.123 é folgadamente posterior ao mínimo de qualquer um deles |
| 45 | Workflows em produção | **194 workflows, 9 ativos.** Ver §2 — e a resposta importante não é o número |
| 46 | Versionamento | **Nenhum.** Não há projeto de *source control* (recurso Enterprise, e `/projects` responde 403), nem exportação versionada. Os 194 fluxos existem em um lugar só: o banco da instância |
| 47 | Webhooks expostos | **8 gatilhos HTTP em fluxos ativos.** Ver §3 — e a proteção não está onde o n8n a colocaria |
| 48 | Credenciais configuradas | **A API não lista credenciais** — só o esquema delas. O que dá para saber é quais são **referenciadas pelos fluxos ativos**: 10 tipos, 25 credenciais distintas. Ver §4 |
| 49 | Homologação separada | **Não existe.** Não é uma segunda assinatura: é uma segunda instância, com banco próprio, para ensaiar mudança antes de ela tocar o que está no ar |
| 50 | CPU, memória, disco | ✅ **Completo na Parte II (§7):** **2 vCPU, 7,8 GB de RAM** (3,1 em uso), **96,73 GB de disco** (20,1% usados), carga 0,12. O processo do n8n usa 333 MB. **Limites de execução: 1 h por padrão, 2 h de teto**, e **payload máximo de 16 MB** — este último é restrição real (§12.5) |

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

## 5. O que a Parte I não conseguiu — e o que a Parte II resolveu

> Quase tudo desta seção caiu quando o levantamento chegou ao servidor. Ficou o que segue:

| O que falta | Por quê | Como obter |
|---|---|---|
| Lista de credenciais configuradas | A API pública do n8n **não expõe** `GET /credentials` | Painel do n8n, por captura de tela da lista (nunca dos valores) |
| Proteção de rede na frente do n8n | ✅ **Respondido na Parte II (§8):** Traefik v2.11.24, único a expor porta ao mundo. Sem WAF nem lista de IP |

---

## 6. O que a medição achou sem ninguém pedir

1. **`/metrics` responde a qualquer um, sem autenticação** — e entrega a versão exata (`v1.123.18`), a contagem de fluxos ativos, a memória e o tempo no ar. Versão exata é o primeiro dado que alguém procura para escolher uma falha conhecida a tentar. **R-60.**
2. **`/rest/settings` também responde sem autenticação**, mas em `settingsMode: "public"` — devolve só método de login e estado de SSO. É o comportamento correto do n8n; fica registrado por completude, não como achado.
3. **SAML, LDAP e OIDC estão desligados**, e o login é por e-mail e senha. Não há SSO para desligar uma pessoa em um lugar só — o que casa com R-11 e R-47, e vale também para quem administra a instância.
4. **Nenhum versionamento**, com 194 fluxos num banco só. A proposta está na resposta à pergunta 46, em `02-descoberta-perguntas-abertas.md`.

---

# Parte II — A infraestrutura

> **Medida em 05/09/2026**, no terminal do servidor, por comandos de leitura rodados pelo usuário. Nenhuma credencial trafegou: a saída passou por filtro antes de ser lida, e o usuário conferiu antes de entregar.

## 7. A máquina, e o que ela é de verdade

| Campo | Valor |
|---|---|
| Provedor | **Hostinger**, VPS `srv957606` |
| Sistema | Ubuntu 22.04.5 LTS, kernel 5.15.0-185 |
| Processador | **2 vCPU** |
| Memória | **7,8 GB** — 3,1 em uso, 4,3 disponíveis, swap zerado |
| Disco | **96,73 GB**, 20,1% usados (~77 GB livres) |
| Carga | 0,12 — a máquina está ociosa |
| No ar desde | ~6 semanas. **Último login humano: 24/07** |
| Pendências do SO | **38 atualizações**, e `*** System restart required ***` |

⚠️ **Não é `docker compose`, é Docker Swarm.** A informação inicial foi "compose na mão", e o nome dos containers desmentiu: o formato `serviço.réplica.identificador` e a etiqueta `com.docker.compose.project.working_dir` **vazia** em todos são assinatura de Swarm. As stacks foram criadas pelo **Portainer**, o que do ponto de vista de quem subiu foi mesmo "colar um compose" — mas o arquivo pode não existir em disco.

**22 stacks, 24 serviços, 20 containers em 2 núcleos.**

## 8. O que está publicado na internet

Treze serviços respondem publicamente, por HTTPS com certificado Let's Encrypt, atrás do Traefik v2.11.24 — que é o único a expor porta ao mundo (`0.0.0.0:80` e `:443`).

| Endereço | Serviço | Leitura |
|---|---|---|
| `container.criativeia.com.br` | **Portainer** | 🔴 É o **plano de controle** do Docker inteiro. Quem entra manda nas 22 stacks, lê todos os segredos, sobe e derruba qualquer coisa — inclusive o n8n do escritório |
| `dashprometheus.criativeia.com.br` | **Prometheus** | 🔴 **Não tem autenticação por padrão.** É de onde sai o R-60, e ele carrega **rótulo de id de workflow** (`N8N_METRICS_INCLUDE_WORKFLOW_ID_LABEL=true`) — vaza mais que a versão |
| `pgbackweb.criativeia.com.br` | **Backup do PostgreSQL** | 🔴 Interface de backup e restauração, com as credenciais dos bancos dentro. **E o serviço está parado** (§10) |
| `dashgrafana.criativeia.com.br` | Grafana 12.1.1 | 🟠 Tem login; senha inicial não conferida |
| `rmq.criativeia.com.br` | RabbitMQ (painel) | 🟠 Idem |
| `minioconsole.` · `s3.criativeia.com.br` | MinIO | 🟠 Idem, e o `s3.` serve arquivo direto |
| `chatw.` · `chatwapi.` | Chatwoot v4.1.0 | 🟡 Precisa ser pública |
| `whatsevolution.` | Evolution API v2.3.1 | 🟡 Precisa ser pública. **Ver §11** |
| `apiwuzapi.` | wuzapi | 🟡 Idem |
| `wootrico.` | wootrico | 🟡 Idem |
| `auto.criativeia.com.br` | **n8n editor** | 🟡 Precisa ser pública |
| `callback.criativeia.com.br` | **n8n webhook** (2 réplicas) | 🟡 É onde as entregas do fornecedor processual chegam |
| `callback.criativeia.com.br/mcp` | **`n8n_mcp_api`** — quarta instância do n8n, dedicada a servir MCP | 🟡 Precedente útil: existe caminho pronto para publicar MCP |

**Isto não é ataque nem descuido deliberado.** É o resultado de subir stacks prontas de um catálogo: cada uma vem com o rótulo do Traefik já preenchido. Ninguém *decidiu* expor o Portainer — ele veio exposto. É comum e é corrigível. Ver **R-62**.

### 8.1 Portas publicadas direto no host, fora do Traefik

```
pgbouncer_pgbouncer          *:5432->5432/tcp
postgresbackupmcp            *:5433->5432/tcp
wootrico_wootrico-webhook    *:3000->3000/tcp
```

O `*:` é **todas as interfaces**, o IP público incluído.

🔴 **CONFIRMADO em 05/09.** `Test-NetConnection 72.60.14.3 -Port 5432` de fora da rede do servidor devolveu **`TcpTestSucceeded: True`**. A suspeita era que em Swarm a porta publicada atravessa o `ufw` — atravessa mesmo. **O PostgreSQL responde à internet, e a única coisa entre ela e o banco é a senha.**

Com precisão, para não exagerar nem amenizar: isso **não** significa que alguém entrou — não há evidência em nenhuma direção, e conferir os registros de autenticação do banco é o próximo passo. Significa que qualquer pessoa pode tentar senha indefinidamente, sem limite e sem ninguém ver, e que qualquer falha conhecida do PostgreSQL ou do pgbouncer fica ao alcance direto. Ver **R-63**.

## 9. Os quatro papéis do n8n, e o banco

| Serviço | Réplicas | Papel |
|---|---|---|
| `n8n_editor_n8n_editor` | 1 | A interface, em `auto.` |
| `n8n_webhook_n8n_webhook` | **2** | Atende os webhooks, em `callback.` |
| `n8n_worker_n8n_worker` | **1** | Executa os fluxos. **Confirma a pergunta 42: um worker** |
| `n8n_mcp_api_n8n_mcp_api` | 1 | Serve `/mcp` |

**Fila:** Redis 7.4.5, banco 2 (`QUEUE_BULL_REDIS_DB=2`). **`EXECUTIONS_MODE=queue`** confirmado na configuração, não só na métrica.

**Banco:** `pgvector/pgvector:pg16` — **PostgreSQL 16 com pgvector** (extensão de busca por similaridade, útil para base de conhecimento), com **pgbouncer** na frente. Há um **segundo** PostgreSQL idêntico, `postgresbackupmcp`, na porta 5433.

🔴 **O n8n conecta como `postgres`** — `DB_POSTGRESDB_USER=postgres`, o superusuário da instância. Quem tiver essa credencial alcança **todos os bancos daquele servidor**, não só o `n8n_database`. Isso decide onde o banco da plataforma vai morar: **não ali, e nunca com essa credencial**. Ver **D-201**.

## 10. O backup existe, e está parado

```
pgbackweb_pgbackweb   replicated   0/1
```

**Zero de uma réplica.** E a leitura de 05/09 mostrou que não está apenas "parado": está em **laço de falha**. Reinicia e morre com `task: non-zero exit (201)` a cada ~6 segundos, indefinidamente — o Swarm tenta subir, o container sai com erro, o Swarm tenta de novo. **Nenhum backup roda há tanto tempo quanto esse laço dura.**

⚠️ **E o `NODE` da tarefa é `srv1093898`, não `srv957606`.** O enxame tem **dois nós** — o `portainer_agent` em modo `global 2/2` confirma. **Existe uma segunda máquina que este levantamento não olhou**, e os achados R-62 a R-66 podem valer para ela também.

Isso responde a pergunta 55 de um jeito que ninguém esperava, e fecha um ciclo: a pergunta 46 achou **194 fluxos existindo em um lugar só, sem versionamento**; esse lugar é este PostgreSQL; e o backup dele está parado. Ver **R-66**.

## 11. A infraestrutura de WhatsApp já existe — e é a não oficial

No ar, funcionando, com endereço público: **Evolution API v2.3.1**, **wuzapi**, **Chatwoot v4.1.0** (três serviços) e **wootrico**.

Evolution e wuzapi são bibliotecas **não oficiais** de WhatsApp. Isso muda a conversa da pergunta 68 sem mudar a recomendação:

- **A favor:** sobe um número hoje. Sem verificação de negócio na Meta, sem template aprovado, sem espera. **Cabe no prazo de 15/09**, e é a única opção que cabe (D-195).
- **Contra:** é exatamente o caminho que o projeto recusou em **D-10** e **P-05**, e o motivo não mudou — biblioteca não oficial arrisca **banimento do número**. Para um escritório de advocacia, perder o número pelo qual os clientes falam com ele não é contratempo técnico: é perder o canal de atendimento de um dia para o outro, sem aviso e sem recurso.

O que mudou é que a alternativa deixou de ser hipótese e virou opção concreta na mesma máquina. Por isso vira **decisão do usuário e da Malu, com o risco escrito**, e não coisa que se descarte sozinho. Ver **D-202**.

## 12. A configuração do n8n, lida linha a linha

### 12.1 O achado que corrige um número do projeto

```
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=336          # horas = 14 dias
EXECUTIONS_DATA_PRUNE_MAX_COUNT=10000
EXECUTIONS_DATA_PRUNE_HARD_DELETE_INTERVAL=15   # minutos
```

**A retenção de execução é de 14 dias OU 10.000 execuções — o que vier primeiro — e a poda definitiva roda a cada 15 minutos.**

O R-57 registrou, em 02/09, que 11.076 execuções de 11.249 haviam sumido, e que a primeira leitura ("~302 dias de retenção, não há perda em curso") estava errada porque olhou a mais antiga **sobrevivente**. Estava certo em desconfiar, e agora o número não é mais inferido: **está configurado**. Num servidor com fluxos comerciais ativos, o teto de 10.000 chega bem antes dos 14 dias.

**Consequência direta:** entrega de callback que fique só no histórico de execução tem prazo de validade curto e variável. O receptor gravar na hora (marco 8, D-181) deixa de ser boa prática e passa a ter número em cima. Ver **D-203**.

### 12.2 Onde os segredos vivem — pergunta 54

**Em variável de ambiente do serviço, em texto plano.** `DB_POSTGRESDB_PASSWORD`, `N8N_ENCRYPTION_KEY` e `N8N_SMTP_PASS` estão ali (foram filtrados antes da leitura, mas a forma é essa). **O Swarm tem cofre nativo — `docker secret` — e ele não está em uso.**

Quem lê o ambiente de um serviço lê os segredos. E quem entra no Portainer lê o ambiente de todos. **R-62 e R-64 são o mesmo problema visto de dois lados.** Ver **R-64**.

### 12.3 O que está bem configurado

| Ajuste | Por que importa |
|---|---|
| `N8N_BLOCK_ENV_ACCESS_IN_NODE=true` | Nó de código não lê variável de ambiente — é o que separa o segredo do fluxo |
| `N8N_BLOCK_RUNNER_ENV_ACCESS=true` | O mesmo para os *runners* |
| `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true` | Permissão restrita no arquivo de configuração |
| `N8N_GIT_NODE_DISABLE_BARE_REPOS=true` | Fecha um vetor conhecido do nó de Git |
| `N8N_DIAGNOSTICS_ENABLED=false` | Nenhuma telemetria sai para o fornecedor — bom para LGPD |
| `GENERIC_TIMEZONE=America/Sao_Paulo` | **Fuso correto**, e isso importa para o rito de prazo (pergunta 20c) |
| `NODE_ENV=production` | Modo de produção |

### 12.4 O que preocupa

| Ajuste | Leitura |
|---|---|
| **`NODE_FUNCTION_ALLOW_BUILTIN=*`** | 🔴 O nó de código pode carregar **qualquer módulo interno do Node** — `fs`, `child_process`, `net`. Um nó de código em **qualquer um dos 194 fluxos**, incluindo os de outros clientes, alcança o sistema de arquivos do container e pode abrir processo. Puxa para o lado contrário do `BLOCK_ENV_ACCESS`: bloquear a leitura direta do ambiente vale menos quando se pode abrir um processo e ler o ambiente por outro caminho. Ver **R-65** |
| `N8N_COMMUNITY_PACKAGES_ENABLED=true` + `N8N_REINSTALL_MISSING_PACKAGES=true` | 🟠 Pacote de terceiro é instalado, e reinstalado sozinho quando falta. Superfície de cadeia de suprimento |
| `N8N_PUBLIC_API_SWAGGERUI_DISABLED=false` | 🟠 A documentação da API pública responde em `auto.criativeia.com.br/api/v1/docs`, para qualquer um |
| `N8N_METRICS_INCLUDE_WORKFLOW_ID_LABEL=true` | 🟠 O `/metrics` público (R-60) carrega **id de workflow** — não é só a versão que vaza |
| `N8N_SMTP_USER=denis.juniorfla@gmail.com` | 🟡 O e-mail do sistema sai de uma conta pessoal do Gmail. Funciona; não é endereço de escritório de advocacia |

### 12.5 Limites que viram restrição de projeto

| Ajuste | Valor | O que restringe |
|---|---|---|
| `EXECUTIONS_TIMEOUT` / `_MAX` | **1 h / 2 h** | Teto de duração de um fluxo. Folgado para o que a plataforma faz |
| **`N8N_PAYLOAD_SIZE_MAX`** | **16 MB** | 🔴 **Teto do que entra por webhook.** Autos em PDF passam de 16 MB com frequência — é restrição real para E3, e precisa de caminho alternativo (enviar ao MinIO e passar só a referência). Ver **D-204** |
| `N8N_DATA_TABLES_MAX_SIZE_BYTES` | 50 MB | Tabelas internas do n8n |
| `OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true` | — | Execução manual também vai para o worker único |

## 13. O que ainda falta

| # | Pergunta | Estado |
|---|---|---|
| 57 | Quem tem acesso administrativo à infra | 🔴 **Só o usuário responde.** Vale para o servidor **e** para o Portainer |
| — | ~~A porta 5432 está aberta ao mundo?~~ | 🔴 **CONFIRMADO ABERTA em 05/09.** A 5433 ainda não foi testada |
| — | **O segundo nó do enxame (`srv1093898`)** | 🚧 **Novo, e não foi olhado.** `docker node ls` |
| — | Há tentativa de autenticação falha nos registros do PostgreSQL? | 🚧 Converte "exposto" em "o que de fato aconteceu" |
| — | Grafana, RabbitMQ e MinIO ainda estão com senha inicial? | 🚧 Pendente |
| — | Por que o `pgbackweb` não sobe | 🟡 **Parcial:** laço de falha com `exit 201`, no nó `srv1093898`. Falta o registro do container |
| — | Backup: existe restauração já testada? | 🔴 Presume-se que não |
