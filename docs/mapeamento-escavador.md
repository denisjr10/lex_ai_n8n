# Mapeamento da API do Escavador

| Campo | Valor |
|---|---|
| Status | 🟢 Completo quanto à superfície · 🟡 Custo por rota pendente de credencial |
| Versão | 1.0 |
| Data | 2026-08-20 |
| Fase | 1 — Descoberta e mapeamento das APIs |
| Fontes | OpenAPI oficial de V1 e V2, documentação HTML e SDK Python oficial (§16) |

> Este documento é a base do **MCP Escavador (F4a)**. Ele descreve a superfície completa das duas versões da API, classifica cada operação nas faixas A0–A4, define os escopos `escavador:*`, a política de cache e o desenho das ferramentas MCP conforme §7.1 das diretrizes.

---

## 1. Como este mapeamento foi feito

O acesso de rede a `api.escavador.com` foi confirmado no início da sessão (`/v2/docs/` respondeu 200). A documentação publica três artefatos legíveis por máquina, que foram usados como fonte primária em vez de raspagem de HTML:

| Artefato | URL | Uso |
|---|---|---|
| OpenAPI V2 | `https://api.escavador.com/v2/docs/openapi.json` | Superfície, parâmetros e respostas de V2 |
| OpenAPI V1 | `https://api.escavador.com/v1/docs/openapi.json` | Superfície, parâmetros e respostas de V1 |
| "LLM Ready" JSONL | `https://api.escavador.com/v{1,2}/docs/llm-ready.jsonl` | Exemplos de resposta por rota |
| Postman Collection | `https://api.escavador.com/v{1,2}/docs/collection.json` | Conferência cruzada |
| SDK Python oficial | `github.com/Escavador/escavador-python` | Conferência de rotas e do limite de vazão |

**Contagem conferida:** V2 tem **41 operações** em 33 caminhos; V1 tem **42 operações** em 37 caminhos. Total: **83 operações**.

---

## 2. Fundamentos da API — o que vale para todas as rotas

### 2.1 Autenticação

Personal Access Token (PAT) no padrão Bearer, enviado no cabeçalho `Authorization: Bearer <token>`. O token é de visualização única — gerado no painel em `api.escavador.com/tokens` e não exibido de novo. A documentação é explícita: o PAT é **exclusivamente server-to-server** e não deve aparecer em frontend.

**Consequência para o desenho:** o token vive no servidor MCP, nunca no n8n em nó HTTP solto e nunca em prompt. Isso reforça D-19 (MCP como serviço em código) e é compatível com o multi-inquilino de §7.2 — a credencial é resolvida por inquilino, na sessão.

### 2.2 Limite de vazão

**500 requisições por minuto**, confirmado tanto na documentação quanto no SDK oficial (`DEFAULT_RATE_LIMIT = 500` em `escavador/api.py`). O limite é da conta, não do usuário — ou seja, é um recurso compartilhado que precisa de controle central. Conforme §8.4 das diretrizes, o controle de vazão fica no servidor MCP, não no consumidor.

### 2.3 Custo — como a API cobra

O custo de cada requisição vem **em centavos, no cabeçalho de resposta `Creditos-Utilizados`**. Essa é a peça central do requisito de custo (Regra 6, §11 das diretrizes).

Três achados relevantes:

1. **A tabela de preços por rota não é pública.** Ela vive no painel da API ("Preços das rotas"), atrás de autenticação. Sem credencial não há como tabelar o custo unitário de cada operação — por isso a coluna "custo" das tabelas abaixo classifica em **pago / gratuito / variável**, e o valor exato fica pendente.
2. **Nem toda rota cobra, e algumas cobram condicionalmente.** A documentação registra explicitamente:
   - Monitoramento de processos: se o processo não for encontrado, o status vira `NAO_ENCONTRADO` e **não há cobrança**.
   - Solicitação de atualização em lote: "a cobrança é realizada individualmente por processo criado" — o custo do lote é proporcional, não fixo.
   - Solicitação de atualização de um processo: pedir `documentos_publicos` ou `autos` **altera o custo**. São parâmetros que encarecem a chamada.
3. **O custo real só é conhecido depois da chamada.** Não há endpoint de cotação prévia. O disjuntor de §11 precisa, portanto, operar por estimativa antes e reconciliação depois — nunca por preço garantido.

> **Implicação de desenho:** o servidor MCP lê `Creditos-Utilizados` em **toda** resposta e grava o consumo atribuído a solicitante, cliente e processo, como manda §7 do modelo de identidade. Rotas de custo variável (`autos`, `documentos_publicos`) recebem tratamento próprio na quota.

### 2.4 Saldo

- **V1** expõe `GET /api/v1/quantidade-creditos`. **V2 não tem equivalente.**
- O MCP deve consultar o saldo por essa rota de V1 mesmo quando a operação principal for V2. É uma dependência cruzada entre versões que precisa estar no chassi.

### 2.5 Paginação

V2 usa **paginação por cursor**, com os dados em `items` e os links em `links`. A documentação inclui um aviso próprio — "Atenção a mudanças de dados durante a navegação" — sobre inconsistência entre páginas quando o conjunto muda durante a travessia. V1 usa **paginação numerada** (`page` / `limit`).

**Implicação:** o SDK interno encapsula a travessia (o SDK oficial faz isso em `helpers/consume_cursor.py`), mas a ferramenta MCP **nunca** devolve coleção ilimitada (§7.2, item 8). A travessia automática é o principal vetor de gasto acidental: percorrer 40 páginas de um envolvido com muitos processos é 40 chamadas pagas. Deve haver teto explícito por chamada de ferramenta.

### 2.6 Callbacks (webhooks)

A URL de callback é configurada **no painel**, não por API — é uma URL única por conta, não por solicitação. O token de validação também é gerado no painel e chega no cabeçalho `Authorization` do callback recebido.

Eventos documentados em V2:

| Evento | Origem |
|---|---|
| `atualizacao_processo_concluida` | Atualização de processo |
| `novo_processo` | Monitoramento de novos processos |
| `nova_movimentacao` | Monitoramento de processos |
| `novo_documento` | Monitoramento de processos |
| `processo_encontrado` | Monitoramento de processos |
| `processo_nao_encontrado` | Monitoramento de processos |
| `processo_verificado` | Monitoramento de processos |

Eventos em V1: `diario_movimentacao_nova`, `resultado_processo_async`, `resultado_busca_assincrona`, `update_time`.

Ambas as versões oferecem rotas de reconciliação — listar callbacks, marcar como recebidos e reenviar. Isso permite recuperar eventos perdidos sem repetir a chamada paga.

> **Implicação, e é importante:** a URL de callback ser única por conta significa que o receptor precisa ser um **endpoint dedicado do nosso lado**, que valida o token e roteia por evento — exatamente o que §8.4 das diretrizes já previa ("webhooks recebidos por endpoint dedicado com verificação de origem, e não por webhook exposto do n8n"). O mapeamento confirma a diretriz.

### 2.7 Assincronia

Confirmado o que §8.4 antecipava: **as operações caras são assíncronas**. O padrão é sempre o mesmo — solicita, recebe identificador, depois consulta status ou espera callback. Isso vale para atualização de processo (V2), resumo por IA (V2) e todas as buscas no site do tribunal (V1).

A documentação inclui uma página inteira de orquestração (`fluxo-resumo-processos-ia`) recomendando: solicitar → *polling* de status → buscar o resultado pronto. Nenhuma ferramenta MCP pode bloquear esperando.

### 2.8 Erros

Padrão consistente entre versões. O que interessa ao chassi:

| Status | Significado | Tratamento no MCP |
|---|---|---|
| 401 | Token inválido ou ausente | Falha imediata, sem repetição |
| 402 | `"Você não possui saldo em crédito da API."` | **Falha fecha** — aciona o disjuntor, não repete, devolve erro acionável |
| 404 | Não encontrado | Resposta vazia legítima, não é erro de sistema |
| 422 | Validação | Erro acionável ao agente, com o campo problemático |
| 429 | Limite de vazão | Recuo exponencial no servidor, transparente ao consumidor |
| 5xx | Falha transitória | Repetição com recuo, teto de tentativas |

O erro 402 é o mais relevante: é a interseção entre custo e a Regra 5 ("negar por padrão, e falha fecha"). Ele não deve nunca ser tratado como transitório.

---

## 3. V1 e V2 — não são versões, são produtos diferentes

Este é o achado mais importante do mapeamento para o planejamento.

A nomenclatura sugere que V2 substitui V1. **Não substitui.** São duas coberturas com sobreposição parcial:

| Capacidade | V1 | V2 |
|---|---|---|
| Processo estruturado e detalhado por CNJ | ✗ | ✅ |
| Processos por envolvido (nome ou CPF/CNPJ) | parcial (via busca) | ✅ |
| Processos por OAB | ✅ (diários e tribunal) | ✅ (estruturado) |
| Movimentações estruturadas | parcial | ✅ |
| Documentos e autos do processo | parcial (V1 async) | ✅ |
| Resumo do processo por IA | ✗ | ✅ |
| Certificado digital gerenciado por API | ✗ | ✅ |
| Monitoramento de processo | ✅ | ✅ |
| Monitoramento de novos processos por termo | ✅ (diários) | ✅ (tribunais) |
| **Diários oficiais** (origens, páginas, PDF) | ✅ | **✗** |
| **Busca livre por termo** (pessoas, empresas, processos) | ✅ | **✗** |
| **Pessoas e instituições** como entidades | ✅ | **✗** |
| **Jurisprudência e legislação** | ✅ (no SDK) | **✗** |
| **Processo administrativo (NUP)** | ✅ | **✗** |
| **Saldo de créditos** | ✅ | **✗** |

**Recomendação com posição definida:** o MCP Escavador deve cobrir **as duas versões** desde o início, com V2 como caminho preferencial para tudo que é processo judicial e V1 como caminho obrigatório para diários oficiais, busca livre, saldo e entidades. Fingir que V1 é legado nos deixaria sem monitoramento de diário oficial — que, para um escritório, é justamente onde aparece a publicação que dispara prazo.

Consequência prática: o SDK interno tem dois clientes com um mesmo chassi (autenticação, vazão, custo, cache, auditoria), e as ferramentas MCP escondem do agente qual versão está sendo usada. O agente pede "movimentações do processo X"; o SDK decide a rota.

---

## 4. Superfície completa — API V2

Convenções das tabelas:

- **Custo:** 💰 pago · 🆓 gratuito ou de custo desprezível · ⚠️ variável conforme parâmetro. Sem credencial, a classificação é inferida da natureza da rota e das notas da documentação — **precisa de confirmação contra a tabela de preços do painel**.
- **Faixa:** A0–A4 conforme §6.3 das diretrizes.
- `*` marca parâmetro obrigatório.

### 4.1 Consulta de processos

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Processo por CNJ | `GET /api/v2/processos/numero_cnj/{numero}` | `numero*` | 💰 | A1 |
| Movimentações do processo | `GET /api/v2/processos/numero_cnj/{numero}/movimentacoes` | `numero*`, `limit`, `ordem` | 💰 | A1 |
| Envolvidos do processo | `GET /api/v2/processos/numero_cnj/{numero}/envolvidos` | `numero*`, `limit` | 💰 | A1 |
| Processos do envolvido | `GET /api/v2/envolvido/processos` | `nome`, `cpf_cnpj`, `ordena_por`, `ordem`, `limit`, `tribunais`, `incluir_homonimos`, `polo`, `status`, `data_minima`, `data_maxima`, `assuntos_codigos_cnj`, `envolvidos_relacionados` | 💰 | A1 |
| Resumo de processos do envolvido | `GET /api/v2/envolvido/resumo` | `nome`, `cpf_cnpj` | 💰 | A1 |
| Estatísticas do envolvido | `GET /api/v2/envolvido/estatisticas` | `nome`, `cpf_cnpj`, `apenas_match_exato_nome` | 💰 | A1 |
| Processos do advogado por OAB | `GET /api/v2/advogado/processos` | `oab_estado*`, `oab_numero*`, `oab_tipo`, `limit`, `tribunais`, `status`, `data_minima`, `data_maxima` | 💰 | A1 |
| Resumo de processos do advogado | `GET /api/v2/advogado/resumo` | `oab_estado*`, `oab_numero*`, `oab_tipo` | 💰 | A1 |
| Documentos públicos do processo | `GET /api/v2/processos/numero_cnj/{numero}/documentos-publicos` | `numero*`, `limit` | 💰 | A1 |
| Autos do processo (restritos) | `GET /api/v2/processos/numero_cnj/{numero}/autos` | `numero*`, `limit` | 💰 | **A1 + restrição** |
| Download de PDF de documento | `GET /api/v2/processos/numero_cnj/{numero}/documentos/{key}` | `numero*`, `key*` | ⚠️ | A1 |

Notas:

- `envolvido/processos` aceita `nome` **ou** `cpf_cnpj`, nenhum dos dois marcado como obrigatório no OpenAPI — mas a chamada sem nenhum dos dois é inútil. O SDK interno valida isso antes de gastar crédito.
- `incluir_homonimos` é um parâmetro de risco: amplia o resultado para pessoas de mesmo nome. Para um escritório, misturar homônimos num relatório é erro grave. **Recomendação: o MCP expõe esse parâmetro com padrão `false` e descrição explícita.**
- **`autos` é a rota mais sensível de toda a API.** Ela entrega documentos restritos do processo. Ver §9.

### 4.2 Atualização de processos (assíncrono)

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Solicitar atualização de um processo | `POST /api/v2/processos/numero_cnj/{numero}/solicitar-atualizacao` | corpo: `enviar_callback`, `documentos_publicos`, `autos`, `utilizar_certificado`, `certificado_id`, `usuario`, `senha`, `documentos_especificos` — **valores são `1`/`0`, não booleanos JSON** (lido na documentação oficial em 26/08) | ⚠️ **alto** | A1 |
| Status da atualização de um processo | `GET /api/v2/processos/numero_cnj/{numero}/status-atualizacao` | `numero*` | 🆓 | A0 |
| Solicitar atualização em lote | `POST /api/v2/processos/lote/solicitar-atualizacao` | corpo: `processos*`, `enviar_callback`, `documentos_publicos`, `autos`, `utilizar_certificado`, `certificado_id`, `usuario`, `senha`, `ignorar_atualizados` | ⚠️ **alto ×N** | A1 |
| Status do lote | `GET /api/v2/processos/lote/{id}/status` | `id*` | 🆓 | A0 |

Notas:

- Esta é a operação que **vai ao site do tribunal buscar dado novo** — é a mais cara da API e a que tem maior latência.
- `ignorar_atualizados` é o parâmetro de economia mais importante da API: pula processos já atualizados recentemente. **Deve ser `true` por padrão** em qualquer ferramenta que o MCP exponha.
- `usuario` e `senha` no corpo são credenciais de tribunal em texto claro. Ver §9.
- O lote cobra por processo criado. Uma ferramenta que aceite lista de processos sem teto é um buraco de custo. **Teto obrigatório por chamada, e faixa A1 com aprovação acima da quota.**

### 4.3 Resumo de processos por IA (assíncrono)

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Solicitar resumo | `POST /api/v2/processos/numero_cnj/{numero}/ia/resumo/solicitar-atualizacao` | `numero*`, `enviar_callback` | 💰 | A1 |
| Status do resumo | `GET /api/v2/processos/numero_cnj/{numero}/ia/resumo/status` | `numero*`, `id` | 🆓 | A0 |
| Obter resumo pronto | `GET /api/v2/processos/numero_cnj/{numero}/ia/resumo` | `numero*` | 🆓 ou 💰 | A1 |

**Parecer, e vale registrar:** esta rota é IA de terceiro produzindo conteúdo jurídico. Ela colide com dois pontos das diretrizes — R-05 (alucinação em conteúdo jurídico) e §9.3 (dados e o provedor de IA). Um resumo gerado pelo Escavador é tão sujeito a erro quanto um gerado por nós, com o agravante de que **não controlamos o modelo, o prompt nem a política de retenção**.

Recomendação: usar como **insumo de leitura para o profissional**, nunca como fonte para resposta a cliente e nunca como base de decisão de prazo. Marcado sempre com a origem ("resumo automático do Escavador"), como manda §8.2.

### 4.4 Monitoramento de processos

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Criar monitoramento | `POST /api/v2/monitoramentos/processos` | corpo: `numero*`, `tribunal`, `frequencia`, `documentos_publicos` | 💰 recorrente | **A2** |
| Listar monitoramentos | `GET /api/v2/monitoramentos/processos` | — | 🆓 | A0 |
| Buscar monitoramento | `GET /api/v2/monitoramentos/processos/{id}` | `id*` | 🆓 | A0 |
| Remover monitoramento | `DELETE /api/v2/monitoramentos/processos/{id}` | `id*` | 🆓 | **A2 destrutivo** |

Notas:

- Criar monitoramento gera **custo recorrente**, não pontual. É diferente de todas as outras rotas pagas e a quota precisa tratar isso — um monitoramento criado hoje continua consumindo mês que vem.
- Se o processo não for encontrado (`NAO_ENCONTRADO`), não há cobrança.
- **Remover monitoramento é a operação mais perigosa da API do ponto de vista do escritório.** Não gasta dinheiro; desliga o alerta de um processo. Um processo sem monitoramento é uma publicação que ninguém vê — R-02, perda de prazo. Tratamento em §8.

### 4.5 Monitoramento de novos processos

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Criar monitoramento | `POST /api/v2/monitoramentos/novos-processos` | corpo: `termo*`, `variacoes`, `termos_auxiliares`, `tribunais`, `limite_aparicoes` | 💰 recorrente | **A2** |
| Listar monitoramentos | `GET /api/v2/monitoramentos/novos-processos` | — | 🆓 | A0 |
| Buscar monitoramento | `GET /api/v2/monitoramentos/novos-processos/{id}` | `id*` | 🆓 | A0 |
| Editar monitoramento | `PATCH /api/v2/monitoramentos/novos-processos/{id}` | `id*`; corpo: `variacoes`, `termos_auxiliares`, `tribunais`, `limite_aparicoes` | 🆓 | **A2** |
| Remover monitoramento | `DELETE /api/v2/monitoramentos/novos-processos/{id}` | `id*` | 🆓 | **A2 destrutivo** |
| Listar processos encontrados | `GET /api/v2/monitoramentos/novos-processos/{id}/resultados` | `id*` | 🆓 ou 💰 | A1 |

`limite_aparicoes` é um controle de custo direto: limita quantos resultados o monitoramento produz. Deve ter valor padrão conservador definido pelo escritório, não pelo agente.

### 4.6 Certificados digitais

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Criar certificado | `POST /api/v2/certificados` | corpo: `certificado*`, `senha*`, `autenticacoes[]` | 🆓 | **A2 crítico** |
| Listar certificados | `GET /api/v2/certificados` | `cpf` | 🆓 | A0 |
| Buscar certificado | `GET /api/v2/certificados/{id}` | `id*` | 🆓 | A0 |
| Remover certificado | `DELETE /api/v2/certificados/{id}` | `id*` | 🆓 | **A2 destrutivo** |
| Configurar autenticações | `POST /api/v2/certificados/{id}/autenticacoes` | `id*`; corpo: `autenticacoes[].tribunal*`, `.sistemas*`, `.secret_2fa*` | 🆓 | **A2 crítico** |
| Remover autenticação | `DELETE /api/v2/certificados/{id}/autenticacoes/{autenticacaoId}` | ambos `*` | 🆓 | **A2 destrutivo** |

**Nenhuma dessas rotas deve ser exposta como ferramenta MCP.** Ver §9. Elas entram no SDK interno (cobertura total, §7.1) e ficam fora de todo perfil de exposição, inclusive `full`, na primeira entrega.

### 4.7 Apoio e catálogos

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Listar tribunais | `GET /api/v2/tribunais` | `estados` | 🆓 | A0 |
| Listar sistemas de tribunais | `GET /api/v2/tribunais/sistemas` | `tribunais`, `utiliza_certificado_digital`, `utiliza_2fa` | 🆓 | A0 |
| Listar assuntos (CNJ) | `GET /api/v2/assuntos` | `nome`, `path`, `materia`, `limit` | 🆓 | A0 |
| Listar callbacks | `GET /api/v2/callbacks` | `data_maxima`, `data_minima`, `evento`, `item_tipo`, `item_id`, `status` | 🆓 | A0 |
| Marcar callbacks recebidos | `POST /api/v2/callbacks/marcar-recebidos` | corpo: `ids*` | 🆓 | A2 |
| Reenviar callback | `POST /api/v2/callbacks/{id}/reenviar` | `id*` | 🆓 | A2 |

Estes catálogos são o caso mais claro de cache longo: mudam raramente e são consultados o tempo todo para validar entrada. Ver §7.

---

## 5. Superfície completa — API V1

### 5.1 Busca e entidades

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Busca livre por termo | `GET /api/v1/busca` | `q*`, `qo*`, `qs`, `limit`, `page`, `utilizar_operadores_logicos` | 💰 | A1 |
| Obter pessoa | `GET /api/v1/pessoas/{pessoaId}` | `pessoaId*` | 💰 | A1 |
| Processos de uma pessoa | `GET /api/v1/pessoas/{pessoaId}/processos` | `pessoaId*`, `limit`, `page` | 💰 | A1 |
| Obter instituição | `GET /api/v1/instituicoes/{instituicaoId}` | `instituicaoId*` | 💰 | A1 |
| Processos de uma instituição | `GET /api/v1/instituicoes/{instituicaoId}/processos` | `instituicaoId*`, `limit`, `page` | 💰 | A1 |
| Pessoas de uma instituição | `GET /api/v1/instituicoes/{instituicaoId}/pessoas` | `instituicaoId*`, `limit`, `page` | 💰 | A1 |

`qo` define o tipo de entidade buscada (processos, pessoas, instituições, diários…). É a única rota de busca aberta da API — e, por isso, a mais fácil de um agente usar mal e gastar crédito à toa.

### 5.2 Processos em diários oficiais

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Processo por id | `GET /api/v1/processos/{processoId}` | `processoId*` | 💰 | A1 |
| Movimentações em diários | `GET /api/v1/processos/{processoId}/movimentacoes` | `processoId*`, `limit`, `page` | 💰 | A1 |
| Envolvidos em diários | `GET /api/v1/processos/{processoId}/envolvidos` | `processoId*`, `limit`, `page` | 💰 | A1 |
| Processo por número | `GET /api/v1/processos/numero/{numero}` | `numero*`, `match_exato` | 💰 | A1 |
| Processos por OAB em diários | `GET /api/v1/oab/{estado}/{numero}/processos` | `estado*`, `numero*`, `page` | 💰 | A1 |
| Uma movimentação | `GET /api/v1/movimentacoes/{movimentacao}` | `movimentacao*` | 💰 | A1 |

### 5.3 Diários oficiais

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Listar origens (diários) | `GET /api/v1/origens` | — | 🆓 | A0 |
| Página de diário | `GET /api/v1/diarios/{id}` (SDK; `page`) | `id`, `page` | 💰 | A1 |
| Download do PDF da página | `GET /api/v1/diarios/{id}/pdf/pagina/{pagina}/baixar` | `id*`, `pagina*` | 💰 | A1 |

**Esta é a capacidade que V2 não tem** e que é operacionalmente crítica para um escritório: a publicação em diário oficial é o que dispara prazo.

### 5.4 Busca no site do tribunal (assíncrono)

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Processo no tribunal | `POST /api/v1/processo-tribunal/{numero}/async` | corpo: `send_callback`, `wait`, `autos`, `documentos_publicos`, `usuario`, `senha`, `origem`, `tipo_numero`, `dias_ultima_atualizacao`, `utilizar_certificado`, `certificado_id`, `documentos_especificos` | ⚠️ alto | A1 |
| Por nome do envolvido | `POST /api/v1/tribunal/{origem}/busca-por-nome/async` | `origem*`; corpo: `nome*`, `permitir_parcial`, `send_callback` | ⚠️ alto | A1 |
| Por CPF/CNPJ | `POST /api/v1/tribunal/{origem}/busca-por-documento/async` | `origem*`; corpo: `numero_documento*`, `permitir_parcial`, `send_callback` | ⚠️ alto | A1 |
| Por OAB | `POST /api/v1/tribunal/{origem}/busca-por-oab/async` | `origem*`; corpo: `numero_oab*`, `estado_oab*`, `permitir_parcial`, `send_callback` | ⚠️ alto | A1 |
| Em lote | `POST /api/v1/tribunal/async/lote` | corpo: `tipo*`, `tribunais*`, `nome`, `numero_documento`, `numero_oab`, `estado_oab`, `send_callback` | ⚠️ alto ×N | A1 |
| Processo administrativo (NUP) | `POST /api/v1/processo-administrativo/{numero_nup}/async` | `numero_nup*`; corpo: `send_callback`, `wait`, `origem`, `dias_ultima_atualizacao` | ⚠️ alto | A1 |
| Resultados assíncronos | `GET /api/v1/async/resultados` | — | 🆓 | A0 |
| Um resultado assíncrono | `GET /api/v1/async/resultados/{id}` | `id*` | 🆓 | A0 |

`dias_ultima_atualizacao` é o equivalente V1 de `ignorar_atualizados`: evita reconsulta cara. Mesmo tratamento — padrão conservador definido em configuração.

### 5.5 Monitoramento em diários oficiais

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Criar monitoramento | `POST /api/v1/monitoramentos` | corpo: `tipo*` (`termo`\|`processo`), `termo`, **`origens_ids`**, `processo_id`, `variacoes`, `termos_auxiliares`, `limite_aparicoes` | 💰 assinatura | **A2** |
| Listar | `GET /api/v1/monitoramentos` | `page` | 🆓 | A0 |
| Buscar | `GET /api/v1/monitoramentos/{id}` | `id*` | 🆓 | A0 |
| Editar | `PUT /api/v1/monitoramentos/{id}` | corpo: `origens_ids`, `variacoes` | 🆓 | **A2** |
| Remover | `DELETE /api/v1/monitoramentos/{id}` | `id*` | 🆓 | **A2 destrutivo** |
| Origens monitoradas | `GET /api/v1/monitoramentos/{id}/origens` | `id*` | 🆓 | A0 |
| Aparições | `GET /api/v1/monitoramentos/{id}/aparicoes` | `id*` | 🆓 | A0 |
| Testar callback | `POST /api/v1/monitoramentos/testcallback` | corpo: `callback*`, `tipo` (`movimentacao`\|`diario`) | 💰 **paga** | A0 |
| Origens dos diários | `GET /api/v1/origens` | — | 🆓 | A0 |

> ⚠️ **Corrigido em 26/08 pela documentação oficial** (`api.escavador.com/v1/docs`), que é mais completa que o OpenAPI de onde esta tabela nasceu. Quatro correções, duas delas com custo:
>
> 1. **`origens_ids` é obrigatório** quando `tipo = termo` — a tabela o listava como opcional. Omitir devolve 422, e **422 custa o mesmo que 200**
> 2. **`testcallback` é PAGA**, não gratuita. Não existe rota barata para ensaiar o webhook
> 3. **`variacoes` aceita no máximo 3**
> 4. **`limite_aparicoes` tem padrão de 200/mês** e, ao atingir o teto, **o monitoramento para de capturar até o mês seguinte**. Isso é risco de prazo (R-02), não de dinheiro: vigilância silenciada por cota é publicação que ninguém vê. O valor precisa ser decidido pelo escritório, com folga, e o silêncio precisa ser alarmado
>
> **Não existe `tipo` de OAB.** Vigiar uma OAB em diário oficial é `tipo = termo` com a OAB (ou o nome do advogado) como termo — a resposta traz `oab_principal` e `variacoes[].formato_oab`, sinal de que a API reconhece e expande formatos de OAB sozinha. D-62 continua de pé; muda só o modo de expressá-la.
>
> A mesma leitura **confirmou** o limite de **500 requisições por minuto** já registrado em §2.2 — não é achado novo, é terceira fonte concordando (documentação, SDK e agora a página de introdução).

### 5.6 Monitoramento no site do tribunal

| Operação | Método e rota | Parâmetros | Custo | Faixa |
|---|---|---|---|---|
| Criar | `POST /api/v1/monitoramentos-tribunal` | corpo: `tipo*`, `valor*`, `tribunal*`, `estado_oab`, `frequencia`, `tipo_numero` | 💰 recorrente | **A2** |
| Listar | `GET /api/v1/monitoramentos-tribunal` | — | 🆓 | A0 |
| Buscar | `GET /api/v1/monitoramentos-tribunal/{id}` | `id*` | 🆓 | A0 |
| Editar | `PUT /api/v1/monitoramentos-tribunal/{id}` | corpo: `frequencia` | 🆓 | **A2** |
| Remover | `DELETE /api/v1/monitoramentos-tribunal/{id}` | `id*` | 🆓 | **A2 destrutivo** |

### 5.7 Catálogos, saldo e callbacks

| Operação | Método e rota | Custo | Faixa |
|---|---|---|---|
| Saldo de créditos | `GET /api/v1/quantidade-creditos` | 🆓 | A0 |
| Sistemas de tribunais | `GET /api/v1/tribunal/origens` | 🆓 | A0 |
| Detalhes de um tribunal | `GET /api/v1/tribunal/origens/{origem}` | 🆓 | A0 |
| Órgãos administrativos | `GET /api/v1/orgao-administrativo/origens` | 🆓 | A0 |
| Listar callbacks | `GET /api/v1/callbacks` | 🆓 | A0 |
| Marcar recebidos | `POST /api/v1/callbacks/marcar-recebidos` | 🆓 | A2 |
| Reenviar callback | `POST /api/v1/callbacks/{id}/reenviar` | 🆓 | A2 |

### 5.8 Jurisprudência e legislação — presentes no SDK, ausentes do OpenAPI

O SDK oficial expõe rotas que **não constam** no OpenAPI publicado de V1:

| Recurso | Rotas no SDK |
|---|---|
| Jurisprudência | `GET jurisprudencias`, `GET jurisprudencias/busca`, `GET jurisprudencias/documento/{tipo}/{id}`, `GET jurisprudencias/pdf/{tipo}/{id}/{arquivo}` |
| Legislação | `GET legislacoes`, `GET legislacoes/busca`, `GET legislacoes/documento/{tipo}/{id}`, `GET legislacoes/pdf/{tipo}/{id}/fragmentos` |

**Não afirmo que estejam ativas.** Podem ser rotas de plano específico, em descontinuação, ou simplesmente ausentes da documentação. É uma verificação de uma chamada, assim que houver credencial — e potencialmente valiosa, porque pesquisa de jurisprudência é uma das frentes mais úteis para o escritório. Registrado como pergunta em §15.

---

## 6. Escopos `escavador:*`

Seguindo a convenção `<sistema>:<recurso>:<ação>[:<abrangência>]` (D-24).

### 6.1 Lista completa

| Escopo | Cobre | Abrangências aplicáveis |
|---|---|---|
| `escavador:processo:read` | Processo por CNJ, envolvidos, movimentações, processos por envolvido/OAB, resumo, estatísticas | `own` · `carteira` · `any` |
| `escavador:movimentacao:read` | Movimentações (V2) e movimentações em diários (V1) | `own` · `carteira` · `any` |
| `escavador:documento:read` | Documentos públicos e download de PDF público | `own` · `carteira` · `any` |
| `escavador:autos:read` | **Autos restritos** — documentos sob segredo ou acesso autenticado | `own` · `carteira` apenas. **Nunca `any`** |
| `escavador:processo:atualizar` | Solicitar atualização (individual e em lote), busca no site do tribunal | `own` · `carteira` · `any` |
| `escavador:resumo_ia:read` | Resumo de processo por IA (solicitar e obter) | `own` · `carteira` · `any` |
| `escavador:monitoramento:read` | Listar e consultar monitoramentos, aparições, resultados | `any` |
| `escavador:monitoramento:write` | Criar e editar monitoramentos (todos os tipos, V1 e V2) | `any` |
| `escavador:monitoramento:delete` | **Remover monitoramento** — escopo separado de propósito | `any` |
| `escavador:busca:read` | Busca livre V1, pessoas, instituições | `any` |
| `escavador:diario:read` | Origens, páginas e PDF de diários oficiais | `any` |
| `escavador:jurisprudencia:read` | Jurisprudência e legislação (se ativas) | `any` |
| `escavador:catalogo:read` | Tribunais, sistemas, assuntos, órgãos administrativos | `any` |
| `escavador:saldo:read` | Saldo de créditos e histórico de consumo | `any` |
| `escavador:callback:read` | Listar callbacks | `any` |
| `escavador:callback:write` | Marcar recebidos, reenviar | `any` |
| `escavador:certificado:read` | Listar e consultar certificados digitais | `any` |
| `escavador:certificado:write` | Criar certificado, configurar autenticações | `any` |
| `escavador:certificado:delete` | Remover certificado ou autenticação | `any` |

Duas escolhas merecem explicação:

**Por que `escavador:autos:read` é separado de `escavador:documento:read`.** Documento público e autos restritos são coisas diferentes em direito e em risco. Autos podem conter segredo de justiça, dado de menor, dado de saúde. Um escopo único deixaria "ler documento do processo" e "ler autos sob segredo" como a mesma permissão — o que é errado. E `any` não é oferecido: ninguém tem autorização irrestrita a autos restritos de qualquer processo.

**Por que `monitoramento:delete` é separado de `monitoramento:write`.** Remover monitoramento não custa nada e por isso passaria despercebido em qualquer controle baseado em custo. Mas é a operação com maior potencial de dano silencioso da API: desliga o alerta de um processo, e o efeito só aparece quando o prazo já passou (R-02). Separar o escopo garante que essa capacidade seja concedida deliberadamente, não de carona.

### 6.2 Escopos por papel — proposta

| Papel | Escopos concedidos |
|---|---|
| **Cliente** | `escavador:processo:read:own`, `escavador:movimentacao:read:own` |
| **Colaborador** | `escavador:processo:read:carteira`, `escavador:movimentacao:read:carteira`, `escavador:documento:read:carteira`, `escavador:resumo_ia:read:carteira`, `escavador:monitoramento:read`, `escavador:catalogo:read`, `escavador:busca:read`, `escavador:diario:read`, `escavador:jurisprudencia:read` |
| **Advogado** | Tudo do colaborador com abrangência conforme **D-07**, mais `escavador:autos:read:carteira`, `escavador:processo:atualizar`, `escavador:monitoramento:write`, `escavador:monitoramento:delete` |
| **Administrador** | `escavador:saldo:read`, `escavador:callback:read`, `escavador:callback:write`, `escavador:catalogo:read`. **Sem escopo de dado de cliente** (D-26) |
| **Certificados** | Nenhum papel recebe `escavador:certificado:*` nesta fase (D-12) |

Observação sobre o cliente: `escavador:processo:read:own` significa que o CPF/CNPJ ou número de processo consultado precisa constar em `sujeitos_autorizados` da sessão. Isso é verificado **em código no MCP**, antes da chamada paga — o que economiza crédito e fecha R-06 ao mesmo tempo.

---

## 7. Política de cache

O cache é requisito funcional, não otimização (Regra 6). A validade varia pela velocidade com que o dado envelhece.

| Tipo de dado | Rotas | Validade | Justificativa |
|---|---|---|---|
| **Catálogos** | tribunais, sistemas, assuntos, origens, órgãos administrativos | **30 dias** | Mudam com mudança institucional, o que é raro |
| **Capa do processo** (partes, classe, assunto, valor, vara) | `processos/numero_cnj/{numero}` — bloco cadastral | **7 dias** | Dado cadastral. Muda em redistribuição ou emenda |
| **Movimentações históricas** | `movimentacoes` — itens anteriores à última verificação | **permanente** | Movimentação passada não muda. Só entram novas |
| **Estado do processo** (última movimentação, situação, arquivado) | `processos/numero_cnj/{numero}` — bloco de estado | **6 horas** | É o dado que justifica a consulta. Precisa ser recente |
| **Envolvidos** | `envolvidos` | **7 dias** | Muda com habilitação ou substituição, ocasional |
| **Processos do envolvido / do advogado** | `envolvido/processos`, `advogado/processos` | **24 horas** | Conjunto cresce devagar; a consulta é cara e ampla |
| **Estatísticas e resumos** | `envolvido/resumo`, `envolvido/estatisticas`, `advogado/resumo` | **24 horas** | Agregados; variação diária é irrelevante |
| **Documentos e autos** (conteúdo) | `documentos/{key}`, PDF de diário | **permanente por `key`** | O conteúdo de um documento não muda. Rebaixar isso é jogar dinheiro fora |
| **Lista de documentos** | `documentos-publicos`, `autos` | **24 horas** | A lista cresce; os itens não mudam |
| **Resumo por IA** | `ia/resumo` | **até nova solicitação** | Só muda quando explicitamente regerado |
| **Status de tarefa assíncrona** | `status-atualizacao`, `lote/{id}/status`, `async/resultados` | **não cachear** | É justamente o que precisa ser fresco |
| **Monitoramentos** (configuração) | listagens e consultas | **1 hora** | Muda por ação nossa; invalidar na escrita |
| **Saldo** | `quantidade-creditos` | **5 minutos** | Precisa ser recente para o disjuntor, mas não a cada chamada |

Três regras que atravessam a tabela:

1. **Invalidação por evento.** Callback recebido para um processo invalida o cache daquele processo imediatamente. Isso é mais eficiente que qualquer validade curta — o Escavador nos avisa quando algo mudou.
2. **Cache é por inquilino, nunca global.** Dado de processo é dado de cliente. Compartilhar cache entre inquilinos é vazamento.
3. **Modo degradado.** Com o disjuntor de custo em `bloqueado`, o MCP serve **só do cache** e informa a idade do dado na resposta. Nunca finge que é fresco. É o comportamento que §7 do modelo de identidade já previa.

---

## 8. Desenho das ferramentas MCP

Aplicando §7.1: **cobertura total no SDK interno (83 operações), exposição curada nas ferramentas.**

### 8.1 Ferramentas propostas

| Ferramenta | Consolida | Escopo exigido | Faixa |
|---|---|---|---|
| `consultar_processo` | Processo por CNJ + envolvidos + movimentações, com `formato: resumo \| completo` | `escavador:processo:read` | A1 |
| `listar_movimentacoes` | Movimentações V2 e V1, paginado com teto | `escavador:movimentacao:read` | A1 |
| `buscar_processos` | Por envolvido (nome/CPF/CNPJ) ou por OAB, com `tipo_busca` | `escavador:processo:read` | A1 |
| `resumir_carteira` | `envolvido/resumo`, `envolvido/estatisticas`, `advogado/resumo` | `escavador:processo:read` | A1 |
| `listar_documentos` | Documentos públicos e autos, com `incluir_restritos` | `escavador:documento:read` (+ `autos:read`) | A1 |
| `obter_documento` | Download de PDF por `key` | `escavador:documento:read` | A1 |
| `solicitar_atualizacao` | Atualização individual e em lote, com teto e `ignorar_atualizados=true` | `escavador:processo:atualizar` | A1 |
| `verificar_status_tarefa` | Status de atualização, lote, resumo IA e assíncronos V1 | escopo da tarefa original | A0 |
| `obter_resumo_ia` | Solicitar, consultar status e obter resumo | `escavador:resumo_ia:read` | A1 |
| `gerenciar_monitoramento` | `operacao: criar \| listar \| consultar \| editar` — **sem remover** | `escavador:monitoramento:read` / `:write` | A0/A2 |
| `remover_monitoramento` | **Ferramenta própria**, com confirmação explícita por parâmetro | `escavador:monitoramento:delete` | A2 destrutivo |
| `consultar_diario_oficial` | Origens, páginas, PDF de diário | `escavador:diario:read` | A1 |
| `busca_livre` | Busca V1 por termo, com `tipo` obrigatório | `escavador:busca:read` | A1 |
| `consultar_catalogo` | Tribunais, sistemas, assuntos, origens, órgãos | `escavador:catalogo:read` | A0 |
| `consultar_saldo` | Saldo e consumo | `escavador:saldo:read` | A0 |

**15 ferramentas para 83 operações.** É uma janela de contexto administrável, e nenhuma capacidade foi perdida — tudo continua no SDK interno.

Duas decisões de desenho que quero justificar:

**`remover_monitoramento` é ferramenta separada, não uma operação de `gerenciar_monitoramento`.** Consolidar seria coerente com o princípio geral, mas errado aqui: colocar `remover` como valor de um parâmetro `operacao` torna a remoção acessível pelo mesmo caminho da listagem. Um erro de parâmetro do agente desliga o monitoramento de um processo. Ferramenta separada, escopo separado, confirmação explícita.

**`gerenciar_certificado` não existe.** Certificado digital não entra em nenhum perfil de exposição nesta fase (§9).

### 8.2 Perfis de exposição

| Perfil | Ferramentas |
|---|---|
| `cliente` | `consultar_processo` (formato resumo, `own`), `listar_movimentacoes` (`own`) |
| `colaborador` | + `buscar_processos`, `resumir_carteira`, `listar_documentos` (sem restritos), `obter_documento`, `verificar_status_tarefa`, `consultar_catalogo`, `consultar_diario_oficial`, `busca_livre` |
| `advogado` | + `solicitar_atualizacao`, `obter_resumo_ia`, `listar_documentos` com restritos, `gerenciar_monitoramento`, `remover_monitoramento` |
| `administrador` | `consultar_saldo`, `consultar_catalogo`, `verificar_status_tarefa` |
| `full` | Todas as acima. **Certificados continuam fora** |

O perfil não substitui o escopo. O perfil decide **o que aparece na janela do agente**; o escopo decide **o que a chamada tem direito de fazer**. Um agente com a ferramenta na mão e sem escopo recebe recusa do servidor — que é exatamente a Regra 1.

### 8.3 Formato das respostas

Conforme §7.2 item 4, nada de JSON bruto. A resposta de `GET /processos/numero_cnj/{numero}` traz dezenas de campos aninhados (fontes, capa, assuntos normalizados, audiências, partes, advogados, valor da causa…). Despejar isso no contexto é caro e prejudica o agente.

| Formato | Conteúdo |
|---|---|
| `resumo` | CNJ, partes, classe, assunto principal, vara, situação, data e teor da última movimentação, quantidade de movimentações |
| `completo` | Acrescenta fontes, graus, capa completa, envolvidos com papéis, audiências, valor da causa |

Toda resposta carrega três metadados obrigatórios: **origem do dado** (cache ou API), **idade do dado**, e **custo em centavos** da chamada. O agente precisa saber se está lendo dado de ontem, e o sistema precisa registrar o gasto.

---

## 9. Material sensível — certificado digital e credenciais de tribunal

Este é o ponto do mapeamento que exige mais cautela.

**O que a API oferece:** cadastrar um certificado digital A1 (arquivo + senha) e configurar autenticações por tribunal, incluindo `secret_2fa` — o segredo do segundo fator. Além disso, várias rotas de atualização aceitam `usuario` e `senha` de tribunal diretamente no corpo da requisição.

**O que isso significa na prática:** um certificado digital de advogado é a identidade jurídica dele. Com ele se peticiona, se assina, se acessa autos sob segredo. O `secret_2fa` armazenado remove o próprio propósito do segundo fator — quem tem certificado, senha e semente do 2FA tem a identidade completa do profissional, sem nenhum passo humano.

**Posição:** confirma-se integralmente D-12 (autos via certificado fora da primeira entrega), e proponho ir além:

1. Nenhuma rota de `certificados` é exposta como ferramenta MCP em nenhum perfil, inclusive `full`.
2. O SDK interno as implementa (cobertura, §7.1) mas com barreira de configuração — desabilitadas por padrão.
3. Credenciais de tribunal (`usuario`, `senha`, `certificado_id`) **jamais** vêm de parâmetro de ferramenta. São resolvidas pelo servidor a partir do cofre, pela identidade da sessão. Um agente não pode nem informar nem descobrir credencial.
4. Uso de certificado é operação de faixa **A4** — efeito jurídico —, exigindo aprovação nominal do advogado titular. E como D-25 mantém A4 bloqueada enquanto não houver identidade individual, isso permanece desligado até R-11 se resolver.

Registro isto como risco novo, **R-12**.

---

## 10. Custo e quota — o que o mapeamento acrescenta

O modelo de três níveis (sessão → usuário/mês → escritório/mês) do documento 04 §7 continua válido. O mapeamento acrescenta quatro refinamentos:

1. **Custo recorrente precisa de orçamento próprio.** Monitoramentos cobram continuamente. Um teto mensal que só conta chamadas não enxerga o monitoramento criado há três meses. Proposta: **quota separada para "assinaturas ativas"**, com o número de monitoramentos ativos como métrica, revisada mensalmente.

2. **Operações de custo variável precisam de estimativa antes.** `solicitar-atualizacao` com `autos=true` custa mais que sem. Como não há cotação prévia, o servidor mantém uma **tabela de custo estimado**, aprendida das respostas anteriores (média móvel do `Creditos-Utilizados` por rota e combinação de parâmetros), e usa a estimativa para decidir se a chamada cabe na quota. Reconcilia com o valor real depois.

3. **Lote precisa de teto.** `processos/lote/solicitar-atualizacao` cobra por processo. O teto por chamada de ferramenta é obrigatório, e acima dele a operação vira aprovação humana mesmo dentro da quota.

4. **Paginação é multiplicador de custo.** Travessia automática de cursor precisa de teto de páginas por chamada, com a ferramenta informando ao agente que há mais resultados em vez de buscá-los sozinha.

---

## 11. Assincronia e recebimento de eventos

O receptor de callbacks é um componente próprio, não um webhook do n8n. Responsabilidades:

1. Validar o token no cabeçalho `Authorization` — falha fecha.
2. Responder rápido (a documentação pede isso) e processar em fila.
3. Deduplicar por identificador de evento — a documentação recomenda idempotência explicitamente.
4. Invalidar o cache do recurso afetado.
5. Registrar em auditoria e disparar o fluxo n8n correspondente.
6. **Reconciliar periodicamente** com `GET /callbacks`, marcando recebidos e reenviando o que faltou. Isso fecha a janela de evento perdido sem repetir chamada paga.

Sobre o `wait` de V1 (espera síncrona na busca em tribunal): **não usar.** Bloqueia a conexão e é incompatível com o modelo de fluxo do n8n. O caminho é sempre solicitar → callback ou *polling*.

---

## 12. O que muda nas diretrizes

Nada do que estava escrito precisou ser revisto. O mapeamento **confirmou** as antecipações de §8.4 (assincronia como regra, créditos em cabeçalho, 500 req/min, cache por tipo de dado, webhook em endpoint dedicado, cautela com certificado) e acrescentou detalhe onde havia lacuna.

O único ponto que exige atenção de planejamento é o de §3: **V1 e V2 são complementares**. Se o plano contratado do escritório cobrir só uma delas, perdemos capacidade — e no caso de V1, perdemos diário oficial, que é o gatilho de prazo. Isso torna a **pergunta 58** (plano contratado) mais urgente do que parecia.

---

## 13. Decisões geradas

Para somar à tabela §13 de `01-diretrizes-gerais.md`:

| ID | Decisão | Recomendação |
|---|---|---|
| **D-27** | MCP Escavador cobre V1 **e** V2; V2 é preferencial para processo judicial, V1 é obrigatória para diários oficiais, busca livre, entidades e saldo | Adotar |
| **D-28** | Ferramentas MCP curadas em ~15 unidades sobre 83 operações, com perfis `cliente`/`colaborador`/`advogado`/`administrador`/`full` | Adotar |
| **D-29** | `remover_monitoramento` é ferramenta e escopo separados, com confirmação explícita — desligar alerta é dano silencioso (R-02) | Adotar |
| **D-30** | Rotas de certificado digital ficam fora de **todos** os perfis de exposição, inclusive `full`; credenciais de tribunal nunca vêm de parâmetro de ferramenta | Adotar |
| **D-31** | Política de cache por tipo de dado conforme §7, com invalidação por callback e cache segregado por inquilino | Adotar |
| **D-32** | Orçamento separado para custo recorrente (monitoramentos ativos), além do orçamento por chamada | Adotar |
| **D-33** | Custo estimado por média móvel do cabeçalho `Creditos-Utilizados`, com reconciliação posterior — não há cotação prévia na API | Adotar |
| **D-34** | Resumo por IA do Escavador é insumo de leitura para o profissional, nunca fonte para resposta a cliente nem base de decisão de prazo; sempre marcado com a origem | Adotar |
| **D-35** | Teto obrigatório de páginas e de itens em toda ferramenta que percorra paginação | Adotar |

---

## 14. Riscos gerados

Para somar à tabela §15 de `01-diretrizes-gerais.md`:

| # | Risco | Impacto | Encaminhamento |
|---|---|---|---|
| **R-12** | A API armazena certificado digital, senha e **semente de 2FA** do advogado. Comprometimento entrega a identidade jurídica completa | **Gravíssimo** — peticionamento e assinatura em nome do profissional | Rotas fora de todo perfil de exposição; uso de certificado é faixa A4, bloqueada por D-25 (§9, D-30) |
| **R-13** | Custo recorrente de monitoramentos invisível a orçamento baseado em chamadas | Financeiro, crescente e silencioso | Orçamento separado para assinaturas ativas (D-32) |
| **R-14** | Remoção acidental de monitoramento por agente desliga alerta de processo sem custo nem sinal | **Grave** — realiza R-02, perda de prazo | Ferramenta e escopo separados, confirmação explícita (D-29) |
| **R-15** | Plano contratado pode não cobrir V1, deixando o escritório sem monitoramento de diário oficial | Operacional grave | Pergunta 58, com urgência elevada (§12) |

---

## 15. Pendências deste mapeamento

> ✅ **Atualização de 2026-08-20:** o painel autenticado foi lido e **seis das sete pendências abaixo foram encerradas**, sem gastar crédito. A situação atual de cada uma está em [`07-painel-escavador-achados.md`](07-painel-escavador-achados.md) §3. A tabela abaixo fica como registro do que estava em aberto no fechamento do mapeamento.

Todas dependem de credencial da API — nenhuma bloqueia o desenho, só a calibragem.

| # | Pendência | Por quê |
|---|---|---|
| 1 | **Tabela de preços por rota** | Só existe no painel autenticado. Sem ela, as quotas de §10 são arbitrárias |
| 2 | **Confirmar quais rotas são gratuitas** | A classificação 💰/🆓 das tabelas é inferida da natureza da rota, não medida |
| 3 | **Jurisprudência e legislação estão ativas?** | Presentes no SDK, ausentes do OpenAPI (§5.8). Uma chamada resolve |
| 4 | **Formato real das respostas de erro 402 e 429** | Para calibrar o disjuntor e o recuo |
| 5 | **Existe ambiente de homologação?** | A documentação menciona "diferença entre homologação e produção" no guia de problemas, sem detalhar. Determina se os testes de contrato de §7.2 item 12 custam crédito |
| 6 | **Plano contratado cobre V1, V2 ou ambas?** | Pergunta 58. Elevada a bloqueio de escopo (R-15) |
| 7 | **Uma URL de callback por conta é suficiente?** | Se o escritório já usa a conta do Escavador para outra coisa, cadastrar nossa URL pode quebrar a integração existente |

---

## 16. Fontes consultadas

Todas acessadas em 2026-08-20.

| Fonte | Endereço |
|---|---|
| Documentação V2 (índice, autenticação, créditos, paginação, callbacks) | `https://api.escavador.com/v2/docs/` |
| OpenAPI V2 | `https://api.escavador.com/v2/docs/openapi.json` |
| OpenAPI V1 | `https://api.escavador.com/v1/docs/openapi.json` |
| Exemplos de resposta V1 e V2 | `https://api.escavador.com/v{1,2}/docs/llm-ready.jsonl` |
| Postman Collection V1 e V2 | `https://api.escavador.com/v{1,2}/docs/collection.json` |
| Páginas de seção V2 | `consulta-de-processos`, `atualizacao-de-processos`, `monitoramento-de-processos`, `monitoramento-de-novos-processos`, `resumo-de-processos-ia`, `certificados-digitais`, `tribunais`, `assuntos`, `callback`, `callbacks`, `respostas`, `solucao-de-problemas`, `fluxo-resumo-processos-ia` |
| SDK Python oficial | `https://github.com/Escavador/escavador-python` |

A página de preços (`api.escavador.com/precos`) retornou **404**; os preços por rota ficam no painel autenticado, conforme a própria documentação indica.
