# Mapeamento da API do Trello

| Campo | Valor |
|---|---|
| Status | 🟢 Completo quanto à superfície · 🔴 Um achado bloqueante de segurança (§3) |
| Versão | 1.0 |
| Data | 2026-08-20 |
| Fase | 1 — Descoberta e mapeamento das APIs |
| Fontes | OpenAPI oficial (`swagger.v3.json`) e guias da Atlassian (§15) |

> Este documento é a base do **MCP Trello (F4b)** e fecha o parecer preliminar de §7.3 das diretrizes. Ele descreve a superfície completa da API, classifica as operações nas faixas A0–A4, define os escopos `trello:*` e desenha as ferramentas MCP.
>
> **Leia o §3 antes de qualquer decisão de cronograma.** O modelo de autorização do Trello tem uma limitação que colide de frente com a Regra 1 do projeto, e ela muda o que dá para prometer.

---

## 1. Como este mapeamento foi feito

Acesso de rede confirmado no início: `developer.atlassian.com` e `api.trello.com` respondem. A Atlassian publica um **OpenAPI 3.0 oficial** em `developer.atlassian.com/cloud/trello/swagger.v3.json`, usado como fonte primária, complementado pelos guias de autorização, limites e webhooks (todos com atualização registrada em 28/07/2026).

**Contagem conferida:** **261 operações** em 191 caminhos. Distribuição por método: 128 GET, 51 PUT, 45 POST, 37 DELETE.

Para comparação: o Escavador tem 83 operações. **O Trello é três vezes maior em superfície** — o que reforça, e não enfraquece, a diretriz de exposição curada de §7.1.

### Distribuição por recurso

| Recurso | Operações | Relevância para o escritório |
|---|---|---|
| `members` | 45 | Média — identidade e atribuição |
| `cards` | 42 | **Alta** — é a demanda |
| `boards` | 41 | **Alta** — é a carteira |
| `organizations` | 26 | Média — workspace do escritório |
| `enterprises` | 21 | Nenhuma — plano Enterprise |
| `actions` | 16 | **Alta** — é o histórico auditável |
| `checklists` | 12 | Média — subtarefas |
| `lists` | 11 | **Alta** — é a fase do fluxo |
| `notifications` | 11 | Baixa |
| `customFields` | 8 | **Alta** — ver §8 |
| `tokens` | 8 | Média — gestão da credencial |
| `labels` | 5 | Média |
| `plugins` | 5 | Nenhuma |
| `webhooks` | 5 | **Alta** — é a sincronização |
| `search` | 2 | Média, com limite severo |
| `applications`, `batch`, `emoji` | 3 | `batch` é útil (§4.3) |

---

## 2. Fundamentos da API

### 2.1 Endereço e formato

Base `https://api.trello.com/1`. REST convencional, JSON. Sem versionamento além do `/1` — a Atlassian evolui a API por adição e comunica remoções pelo changelog, com prazo declarado (o padrão observado é 6 meses).

### 2.2 Autenticação — como funciona hoje

Dois mecanismos documentados:

1. **Chave de API + token de usuário**, obtido pelo fluxo `1/authorize`. A chave fica vinculada a um Power-Up registrado em `trello.com/apps/admin`.
2. **OAuth 1.0**, pelas rotas `OAuthGetRequestToken` / `OAuthAuthorizeToken` / `OAuthGetAccessToken`.

A credencial pode viajar de três formas: parâmetros de consulta (`key=` e `token=`), cabeçalho `Authorization: OAuth oauth_consumer_key="...", oauth_token="..."`, ou corpo de PUT/POST.

> **Decisão de desenho:** usar sempre o **cabeçalho**. Credencial em parâmetro de consulta acaba em log de servidor, em log de proxy e em histórico de navegador. A própria Atlassian chama isso de "o jeito mais fácil e rápido" — o que não é o mesmo que o jeito certo.

### 2.3 Escopos — e aqui está o problema

O fluxo `1/authorize` aceita apenas três escopos, em lista separada por vírgula:

| Escopo | O que concede |
|---|---|
| `read` | Leitura de quadros, organizações etc. **em nome do usuário** |
| `write` | Escrita de quadros, organizações etc. em nome do usuário |
| `account` | Ler e-mail do membro, escrever informação do membro, marcar notificações como lidas |

E a expiração aceita `1hour`, `1day`, `30days` ou `never`.

**O que isso significa, em português claro:** não existe escopo por quadro, por lista, por cliente ou por tipo de operação. Um token com `read` lê **tudo** o que o usuário dono do token enxerga. Um token com `write` escreve em **tudo**. A própria documentação diz, em negrito: *"Tokens for users should always be securely stored as they grant access to the entire user's account!"*

Isso é tratado no §3, porque não é um detalhe técnico — é o achado que decide o desenho da frente.

### 2.4 OAuth 2.0 — anunciado, ainda não entregue

O parecer preliminar de §7.3 registrou "migração para OAuth 2.0/3LO em curso pela Atlassian". **Verifiquei o estado atual e a afirmação precisa ser atualizada.**

O anúncio existe e está no changelog em **16 de abril de 2025** (RFC-89): a Atlassian declarou que vai substituir o mecanismo atual por OAuth 2.0 (3LO), *"introduzindo novos escopos, restrições de recurso e expiração de token para maior segurança"*.

Só que a página de autorização, **atualizada em 28 de julho de 2026** — mais de um ano depois —, continua documentando apenas o fluxo `1/authorize` e o OAuth 1.0. Não há OAuth 2.0 documentado, nem data de disponibilidade no changelog, cuja entrada mais recente é de fevereiro de 2026 e trata de outro assunto.

**Conclusão honesta:** o OAuth 2.0 do Trello está anunciado há mais de um ano e não chegou. Ele traria exatamente o que falta a este projeto — escopos granulares e restrição por recurso. **Não dá para planejar contando com ele.** O desenho precisa funcionar sem, e ganhar simplificação se e quando chegar.

### 2.5 Limites de vazão

Mais detalhados do que o parecer preliminar registrava:

| Limite | Valor | Observação |
|---|---|---|
| Por **chave de API** | 300 req / 10 s | Compartilhado por todos os tokens da chave |
| Por **token** | 100 req / 10 s | Por usuário |
| Rotas `/1/members/`, `/1/membersSearch`, `/1/search` | **100 req / 900 s** | Muito mais restrito. Vale por rota, além dos limites acima |
| Escalada de erro | Acima de 200 respostas 429 na chave, tudo vira 429 até o fim da janela de 10 s | Punição por insistência |

Erros trazem `API_KEY_LIMIT_EXCEEDED` ou `API_TOKEN_LIMIT_EXCEEDED`, o que permite distinguir qual limite estourou e reagir certo.

Há ainda dois limites menos óbvios:

- **`API_TOKEN_DB_LIMIT_EXCEEDED`** — cada token tem um orçamento de tempo de banco. Consultas caras demais estouram, e a documentação admite que "não há solução clara" além de quebrar em requisições menores.
- **`API_TOO_MANY_CARDS_REQUESTED`** — pedir todos os cards de um quadro com suas ações junto falha em quadro grande.

> **Implicações:** o controle de vazão vai no servidor MCP, com **dois baldes** (chave e token) e um **terceiro balde específico** para as rotas de membros e busca. A escalada de 429 significa que repetição cega piora a situação — o recuo tem de ser exponencial e a fila, central.

### 2.6 Limites de objeto

O Trello limita quantos objetos cabem num quadro, e expõe isso pela própria API: `GET /boards/{id}?fields=limits` devolve cada limite com `status` (`ok` / `warn` / `disabled`), `warnAt` e `disableAt`.

Os valores variam por conta e plano — a documentação é explícita em não garantir números. Os exemplos que ela mostra incluem **5.000 cards abertos por quadro** e 1.520 membros por quadro.

> **Implicação prática, e continua relevante mesmo depois de D-09.** O Trello **não** é o sistema de gestão de casos — é visualização (D-152) —, mas um escritório com muitos processos ativos ainda pode se aproximar do teto de cards abertos por quadro, porque a vitrine reflete o volume da base. O MCP deve **ler `limits` e avisar em `warn`**, antes de a escrita começar a falhar. É barato de implementar e evita uma falha silenciosa e confusa.

### 2.7 Webhooks

A sincronização séria depende deles — e são bem resolvidos.

| Aspecto | Comportamento |
|---|---|
| **Vínculo** | O webhook **pertence ao token** e só observa objetos que aquele token alcança |
| **Alvo** | Qualquer modelo com ações: quadro, card, lista, membro, organização |
| **Criação** | A `callbackURL` precisa responder 200 a um HEAD **no momento da criação**, e ter certificado SSL válido se usar HTTPS |
| **Entrega** | POST com três campos: `action` (o que mudou), `model` (o objeto observado) e `webhook` |
| **Repetição** | 3 tentativas, com espera de 30 s, 60 s e 120 s |
| **Assinatura** | Cabeçalho `X-Trello-Webhook`: HMAC-SHA1 em base64 de `corpo + callbackURL`, com chave = **segredo da aplicação** |
| **Origem** | Sempre da faixa `104.192.142.240/28`, porta 443 |
| **Desativação automática** | Só após falhas consecutivas por **30 dias E mais de 1.000 falhas**. Uma resposta bem-sucedida zera as contagens |
| **Anti-laço** | Cabeçalho `X-Trello-Client-Identifier` enviado na requisição volta no webhook |

Três coisas merecem destaque:

**A assinatura HMAC resolve a verificação de origem** que §8.4 exige. Combinada com a faixa de IP, dá dupla verificação. O segredo da aplicação vive no cofre, nunca no n8n.

**O `X-Trello-Client-Identifier` é a defesa contra laço de sincronização.** Sem ele, nossa automação escreve no Trello, o Trello dispara webhook, nossa automação reage e escreve de novo — laço infinito, com custo de vazão e cards bagunçados. Com ele, reconhecemos o que nós mesmos causamos e ignoramos. **Isto tem de estar no chassi desde o primeiro dia.** A documentação avisa que o valor pode acabar em log, então não é lugar de segredo — é identificador, não credencial.

**A desativação automática é generosa mas traiçoeira.** 30 dias tolerando falha parece bom, mas significa que um webhook quebrado pode passar semanas sem ninguém notar, perdendo eventos o tempo todo. O MCP deve **verificar periodicamente `consecutiveFailures` e `active`** dos webhooks registrados, e alertar — não esperar a desativação.

### 2.8 Batch e recursos aninhados

Duas ferramentas de eficiência que reduzem muito o consumo de vazão:

- **`GET /batch?urls=...`** — até **10 requisições GET** numa chamada só.
- **Recursos aninhados** — em vez de buscar o quadro e depois iterar pelos cards, `GET /boards/{id}?cards=all&card_fields=...` traz tudo junto. Vale para ações, membros, listas, checklists, com parâmetros de filtro e limite (`actions_limit`, `actions_since`, `action_fields` etc.).

> **Implicação:** o SDK interno deve **preferir aninhamento a iteração**, e usar `batch` quando precisar de objetos não relacionados. Isso não é otimização prematura: com 100 req/10 s por token, iterar 200 cards individualmente já estoura o limite. É a diferença entre funcionar e não funcionar.

### 2.9 Erros

| Status | Significado | Tratamento no MCP |
|---|---|---|
| 400 | Requisição malformada, ou falta chave/token | Erro acionável, sem repetição |
| 401 | Token inválido ou **revogado** | Falha fecha. Sinaliza para reautorização; nunca repete |
| 404 | Não existe, **ou o token não enxerga** | Ambíguo de propósito. Não distinguir "não existe" de "sem permissão" é comportamento correto do Trello e o MCP não deve tentar adivinhar |
| 429 | Limite de vazão | Recuo exponencial. Repetição cega agrava (§2.5) |

O 401 por revogação merece atenção: a documentação diz que o usuário pode revogar o token a qualquer momento na página de conta dele. A integração precisa tratar isso com elegância — e, se o token for de uma pessoa, **qualquer pessoa pode derrubar a automação inteira sem avisar ninguém** (§3).

---

## 3. O achado que decide a frente: o Trello não tem escopo por recurso

Este é o equivalente, no Trello, ao achado do certificado digital no Escavador. Preciso registrá-lo com clareza.

### 3.1 O que a Regra 1 do projeto exige

> *"O agente de IA nunca é a fronteira de segurança. Privilégio se aplica como escopo verificado em código no servidor MCP."*

E §3.2 do modelo de identidade define o que `own` e `carteira` significam: o recurso consultado **precisa constar** na lista autorizada da sessão; fora dela, a chamada é recusada.

### 3.2 O que o Trello oferece

`read`, `write`, `account` — sobre a conta inteira do usuário dono do token. Sem recorte por quadro, lista ou card.

### 3.3 A consequência

**A API do Trello não consegue impor a restrição que o projeto exige.** Isso não é contornável por configuração — é o modelo de autorização do produto.

Só existem três caminhos, e vale conhecer os três:

| Caminho | Como funciona | Avaliação |
|---|---|---|
| **A. Um token, filtragem no MCP** | Um token de serviço com acesso amplo; o MCP verifica em código se o quadro/card pedido está na abrangência da sessão e recusa o resto | **Recomendado.** Mantém a Regra 1: a verificação continua sendo em código no servidor, com dado que o agente não controla. O que muda é que a *API de destino* não é mais uma segunda barreira |
| **B. Um token por usuário** | Cada pessoa autoriza a aplicação; o MCP usa o token de quem pediu | Parece mais seguro e é pior. Depende de identidade individual (R-11, ainda aberto), cada token dá acesso à conta inteira daquela pessoa, e qualquer uma pode revogar e derrubar a automação sem avisar |
| **C. Um token por quadro** | Contas de serviço distintas, cada uma membro de um subconjunto de quadros | Funciona de verdade — o isolamento passa a ser real. Mas exige múltiplas contas Trello (licenças pagas) e vira um problema de administração. Só se justifica com separação forte por área |

**Recomendação com posição definida: caminho A**, com três salvaguardas obrigatórias:

1. **Credencial de serviço, nunca token pessoal.** Já era o ponto fixado em §8.5, e o mapeamento mostra que é ainda mais importante do que parecia: token pessoal aqui não é só acoplamento a uma pessoa, é acesso à conta inteira dela — inclusive quadros que nada têm a ver com o escritório.
2. **A conta de serviço é membro apenas dos quadros do escritório.** Isso não é escopo de API, é escopo de associação — e é o único limite real disponível. Reduz o estrago de um vazamento ao conjunto que ela participa.
3. **Escrita começa desligada.** Somente-leitura é o padrão (§7.2 item 7). Escrita se habilita por escopo `trello:*:write`, verificado no MCP.

E uma consequência que precisa ser dita ao usuário sem rodeio: **enquanto o Trello não tiver OAuth 2.0 com restrição de recurso, o isolamento entre carteiras no Trello é garantido pelo nosso código, não pelo Trello.** Se o escritório precisar de isolamento forte — por exemplo, uma área que não pode enxergar os casos de outra —, o caminho é C (contas de serviço separadas) ou não usar o Trello para esse dado.

Registrado como risco **R-16**.

### 3.4 O agravante dos webhooks de administrador

A documentação descreve, como boa prática, criar webhooks com o token de um **administrador da organização**, porque assim eles recebem ações de quadros **mesmo que o administrador não seja membro deles** — inclusive quadros marcados como privados.

É uma capacidade útil e uma armadilha de privacidade. Num escritório de advocacia, um quadro privado pode existir justamente porque contém algo restrito. Um webhook de administrador drena isso para dentro do nosso sistema sem que os membros do quadro saibam.

**Posição:** não usar token de administrador para webhooks nesta fase. Webhooks são criados pela conta de serviço, e ela só recebe o que os quadros de que participa produzem. Se o escritório quiser cobertura ampla depois, é decisão consciente e documentada, não um efeito colateral de configuração.

---

## 4. Superfície completa

`*` marca obrigatório. As faixas seguem §6.3 das diretrizes. **Nenhuma operação do Trello consome crédito** — não há custo por chamada, só limite de vazão. Isso torna o Trello muito diferente do Escavador em quota: o recurso escasso aqui é **vazão**, não dinheiro.

### 4.1 Cards — 42 operações

| Operação | Rota | Faixa |
|---|---|---|
| Criar card | `POST /cards` (`idList*`, `name`, `desc`, `due`, `start`, `idMembers`, `idLabels`, `pos`, `idCardSource`, `keepFromSource`, `cardRole`) | A2 |
| Obter card | `GET /cards/{id}` | A0 |
| Atualizar card | `PUT /cards/{id}` | A2 |
| **Excluir card** | `DELETE /cards/{id}` | **A2 destrutivo** |
| Obter campo do card | `GET /cards/{id}/{field}` | A0 |
| Ações do card | `GET /cards/{id}/actions` | A0 |
| Comentar | `POST /cards/{id}/actions/comments` | A2 |
| Editar comentário | `PUT /cards/{id}/actions/{idAction}/comments` | A2 |
| Excluir comentário | `DELETE /cards/{id}/actions/{idAction}/comments` | **A2 destrutivo** |
| Anexos: listar, obter, criar, excluir | `GET|POST /cards/{id}/attachments`, `GET|DELETE .../{idAttachment}` | A0 / A2 |
| Checklists no card: listar, criar, excluir | `GET|POST /cards/{id}/checklists`, `DELETE .../{idChecklist}` | A0 / A2 |
| Itens de checklist: obter, atualizar, excluir | `GET|PUT|DELETE /cards/{id}/checkItem/{idCheckItem}`, `PUT /cards/{idCard}/checklist/{idChecklist}/checkItem/{idCheckItem}` | A0 / A2 |
| Estados dos itens | `GET /cards/{id}/checkItemStates` | A0 |
| Campos personalizados: ler, atualizar um, atualizar vários | `GET /cards/{id}/customFieldItems`, `PUT /cards/{idCard}/customField/{idCustomField}/item`, `PUT /cards/{idCard}/customFields` | A0 / A2 |
| Etiquetas: adicionar, remover, criar | `POST /cards/{id}/idLabels`, `DELETE .../{idLabel}`, `POST /cards/{id}/labels` | A2 |
| Membros: listar, adicionar, remover | `GET /cards/{id}/members`, `POST /cards/{id}/idMembers`, `DELETE .../{idMember}` | A2 |
| Quadro e lista do card | `GET /cards/{id}/board`, `GET /cards/{id}/list` | A0 |
| Votos, adesivos, dados de plugin, marcar notificações | `membersVoted`, `stickers`, `pluginData`, `markAssociatedNotificationsRead` | A0 / A2 |

**Nota sobre `DELETE /cards/{id}`:** no Trello, arquivar (`PUT /cards/{id}` com `closed=true`) é reversível; excluir **não é**. Um card excluído leva junto comentários, anexos e histórico. Ver §7.

### 4.2 Boards — 41 operações

| Operação | Rota | Faixa |
|---|---|---|
| Criar quadro | `POST /boards/` | **A2 estrutural** |
| Obter, atualizar quadro | `GET|PUT /boards/{id}` | A0 / A2 |
| **Excluir quadro** | `DELETE /boards/{id}` | **A2 destrutivo grave** |
| Cards do quadro, filtrados | `GET /boards/{id}/cards`, `GET /boards/{id}/cards/{filter}` | A0 |
| Listas do quadro, filtradas, criar | `GET /boards/{id}/lists`, `.../{filter}`, `POST /boards/{id}/lists` | A0 / A2 |
| Etiquetas: listar, criar | `GET|POST /boards/{id}/labels` | A0 / A2 |
| Checklists e campos personalizados do quadro | `GET /boards/{id}/checklists`, `GET /boards/{id}/customFields` | A0 |
| Ações do quadro | `GET /boards/{boardId}/actions` | A0 |
| Membros: listar, adicionar, remover, convidar por e-mail | `GET /boards/{id}/members`, `PUT .../{idMember}`, `DELETE .../{idMember}`, `PUT /boards/{id}/members` | **A2 / A3** |
| Associações: listar, atualizar | `GET /boards/{id}/memberships`, `PUT .../{idMembership}` | A2 |
| Exportação: criar, listar, obter, baixar, excluir | `POST /boards/{id}/exports`, `GET .../mostRecent`, `GET|DELETE .../{idExport}`, `GET .../{idExport}/download` | **A1 / A2 sensível** |
| Chaves de e-mail e calendário | `POST /boards/{id}/emailKey/generate`, `POST /boards/{id}/calendarKey/generate` | **A2 sensível** |
| Power-Ups: listar, habilitar, desabilitar | `GET|POST /boards/{id}/boardPlugins`, `DELETE .../{idPlugin}` | A2 |
| Preferências pessoais (`myPrefs/*`) | 6 rotas PUT | A0 |
| Estrelas, marcar como visto, tags, campo | `boardStars`, `markedAsViewed`, `idTags`, `{field}` | A0 / A2 |

Três pontos sensíveis, e não são óbvios:

- **`PUT /boards/{id}/members` convida alguém por e-mail** — é comunicação que sai do escritório para um terceiro. **Faixa A3, aprovação humana obrigatória.** Um agente convidando alguém para um quadro com dado de cliente é exatamente o tipo de erro que a faixa A3 existe para impedir.
- **`POST /boards/{id}/emailKey/generate` e `calendarKey/generate`** criam endereços/URLs que dão acesso ao quadro **sem autenticação**. Gerar uma dessas chaves é criar uma porta lateral. Não deve ser exposto como ferramenta.
- **Exportação de quadro** produz um arquivo com o conteúdo inteiro — todos os cards, comentários e anexos. É a operação de maior volume de dado sensível numa chamada só.

### 4.3 Lists — 11 operações

| Operação | Rota | Faixa |
|---|---|---|
| Criar lista | `POST /lists` | A2 |
| Obter, atualizar lista | `GET|PUT /lists/{id}` | A0 / A2 |
| Arquivar/desarquivar lista | `PUT /lists/{id}/closed` | A2 |
| Mover lista para outro quadro | `PUT /lists/{id}/idBoard` | A2 |
| Cards da lista | `GET /lists/{id}/cards` | A0 |
| **Arquivar todos os cards da lista** | `POST /lists/{id}/archiveAllCards` | **A2 destrutivo em massa** |
| **Mover todos os cards da lista** | `POST /lists/{id}/moveAllCards` | **A2 em massa** |
| Ações, quadro, campo | `GET /lists/{id}/actions`, `/board`, `PUT /lists/{id}/{field}` | A0 / A2 |

`archiveAllCards` e `moveAllCards` são operações em massa disparadas por uma chamada. Um agente que erra o `idList` arquiva a fase errada do fluxo inteiro. Ver §7.

### 4.4 Checklists, labels e custom fields — 25 operações

Checklists (12): criar, obter, atualizar, excluir; itens (listar, criar, obter, excluir); quadro e card de origem; campo.
Labels (5): criar, obter, atualizar, excluir, atualizar campo.
Custom Fields (8): criar definição, obter, atualizar definição, excluir definição; opções de lista suspensa (adicionar, listar, obter, excluir).

**Custom Fields merecem destaque** — é neles que vive a ponte entre o Trello e a base interna. Ver §8.

Atenção: excluir uma **definição** de campo personalizado remove o valor daquele campo em todos os cards do quadro. É destrutivo em massa disfarçado de operação de configuração.

### 4.5 Actions — 16 operações

| Operação | Rota | Faixa |
|---|---|---|
| Obter ação, campo | `GET /actions/{id}`, `GET /actions/{id}/{field}` | A0 |
| Atualizar ação / texto de comentário | `PUT /actions/{id}`, `PUT /actions/{id}/text` | A2 |
| **Excluir ação** | `DELETE /actions/{id}` | **A2 destrutivo — ver abaixo** |
| Contexto: quadro, card, lista, membro, criador, organização | `GET /actions/{id}/board|card|list|member|memberCreator|organization` | A0 |
| Reações: listar, criar, obter, excluir, resumo | `/actions/{idAction}/reactions*` | A0 / A2 |

**As `actions` são o histórico do Trello** — quem fez o quê, quando. É o mais próximo de uma trilha de auditoria que o Trello oferece, e §6 do modelo de identidade depende disso para reconstruir o que aconteceu.

Por isso, `DELETE /actions/{id}` e `PUT /actions/{id}` são especialmente sérios: permitem **apagar ou reescrever o histórico**. Nenhuma ferramenta MCP deve expor isso, em nenhum perfil. Um agente com poder de editar o registro do que ele mesmo fez destrói a premissa da auditoria.

### 4.6 Members — 45 operações

Perfil (obter, atualizar, campo), quadros do membro, organizações, cards, notificações, listas de tarefas, avatar, preferências, sessões, tokens.

**Relevância baixa para o escritório e risco alto de vazão:** a rota `/1/members/` tem limite de 100 req por 900 s (§2.5). Uma ferramenta que resolva nomes de membros um a um esgota a cota em minutos.

> **Regra:** o MCP resolve membros pelos **recursos aninhados** (`/boards/{id}/members`, `/organizations/{id}/members`), como a própria documentação recomenda, e mantém um cache de identidade. Nunca itera `/members/{id}`.

Também aqui: a maioria dessas rotas escreve no perfil pessoal de alguém (avatar, preferências, nome). Nada disso tem uso legítimo neste projeto. Fica no SDK, fora das ferramentas.

### 4.7 Organizations e Enterprises — 47 operações

Organizations (26): criar, obter, atualizar, excluir workspace; membros e associações; quadros; convites; logotipo; preferências; tags; exportações.
Enterprises (21): membros, organizações vinculadas, tokens de admin, licenças, auditoria.

**Enterprises só existe no plano Enterprise.** Sem saber o plano do escritório (pergunta 29), essas 21 operações são especulativas. Ficam no SDK, fora de toda ferramenta.

Organizations tem um subconjunto útil — listar quadros do workspace e listar membros — e um subconjunto perigoso: excluir workspace, remover membros, gerar exportações. Mesma regra: leitura entra, escrita estrutural não.

### 4.8 Webhooks, search, batch e tokens — 16 operações

| Operação | Rota | Faixa |
|---|---|---|
| Criar webhook | `POST /webhooks/` (`callbackURL*`, `idModel*`, `description`, `active`) | A2 |
| Obter, atualizar, excluir webhook, campo | `GET|PUT|DELETE /webhooks/{id}`, `GET /webhooks/{id}/{field}` | A0 / A2 |
| Buscar no Trello | `GET /search` (`query*`, `idBoards`, `idOrganizations`, `modelTypes`, `cards_limit`, `partial`…) | A0, **vazão restrita** |
| Buscar membros | `GET /search/members/` | A0, **vazão restrita** |
| Batch (até 10 GET) | `GET /batch?urls=` | A0 |
| Tokens: obter, excluir, webhooks do token, membro | 8 rotas em `/tokens` | A0 / A2 |

`GET /search` é a ferramenta mais natural para "encontre o card do cliente X" — e cai no limite de 100 req/900 s. **Precisa de cache agressivo e de um teto por sessão**, ou uma conversa de WhatsApp movimentada esgota a busca para o escritório inteiro.

---

## 5. Escopos `trello:*`

Seguindo `<sistema>:<recurso>:<ação>[:<abrangência>]` (D-24). Lembrando o §3: estes escopos são verificados **no nosso servidor**; o Trello não os conhece.

| Escopo | Cobre | Abrangências |
|---|---|---|
| `trello:card:read` | Card, campos, checklists, anexos, campos personalizados, comentários | `carteira` · `any` |
| `trello:card:write` | Criar e atualizar card, comentar, anexar, mover, etiquetar, atribuir | `carteira` · `any` |
| `trello:card:arquivar` | Arquivar card (reversível) | `carteira` · `any` |
| `trello:card:delete` | **Excluir card** (irreversível) | `carteira` apenas |
| `trello:board:read` | Quadro, listas, etiquetas, membros, associações | `carteira` · `any` |
| `trello:board:write` | Criar e atualizar quadro, criar listas e etiquetas | `any` |
| `trello:board:membro:write` | Adicionar e remover membro de quadro | `any` |
| `trello:board:convidar` | **Convidar por e-mail** — comunicação externa | `any`, faixa A3 |
| `trello:board:export` | Criar e baixar exportação de quadro | `any` |
| `trello:lista:write` | Criar, atualizar, arquivar, mover lista | `any` |
| `trello:lista:massa` | `archiveAllCards`, `moveAllCards` | `any`, confirmação obrigatória |
| `trello:checklist:write` | Checklists e itens | `carteira` · `any` |
| `trello:customfield:read` | Ler valores de campos personalizados | `carteira` · `any` |
| `trello:customfield:write` | Escrever valores em cards | `carteira` · `any` |
| `trello:customfield:definir` | Criar, alterar e **excluir definições** de campo | `any`, destrutivo em massa |
| `trello:acao:read` | Histórico (actions), reações | `carteira` · `any` |
| `trello:membro:read` | Membros, via recursos aninhados | `any` |
| `trello:busca:read` | `search` e `searchMembers`, com teto de vazão | `any` |
| `trello:webhook:read` | Listar e consultar webhooks | `any` |
| `trello:webhook:write` | Criar, atualizar, excluir webhooks | `any` |
| `trello:organizacao:read` | Workspace, quadros e membros | `any` |

**Sem escopo, e de propósito:** edição e exclusão de `actions` (§4.5), geração de `emailKey`/`calendarKey` (§4.2), exclusão de quadro e de workspace, escrita em perfil de membro, e toda a família `enterprises`. Essas capacidades existem no SDK e não são alcançáveis por ferramenta.

### 5.1 Escopos por papel — proposta

| Papel | Escopos |
|---|---|
| **Cliente** | **Nenhum.** O cliente não fala com o Trello. Se ele precisa saber o andamento, isso vem da base interna, não do quadro de trabalho interno do escritório |
| **Colaborador** | `trello:card:read:carteira`, `trello:card:write:carteira`, `trello:card:arquivar:carteira`, `trello:board:read:carteira`, `trello:checklist:write:carteira`, `trello:customfield:read/write:carteira`, `trello:acao:read:carteira`, `trello:busca:read`, `trello:membro:read` |
| **Advogado** | Tudo do colaborador com abrangência conforme **D-07**, mais `trello:card:delete:carteira`, `trello:lista:write`, `trello:board:write` |
| **Administrador** | `trello:webhook:read/write`, `trello:organizacao:read`, `trello:board:read`. **Sem escopo de conteúdo de card** (D-26) |

A linha do cliente merece explicação: seria tecnicamente fácil deixar o cliente consultar o card dele. Mas o Trello é a ferramenta de trabalho interna — comentários entre colegas, anotações francas, hipóteses de estratégia. Expor isso a cliente, mesmo filtrado, é criar um vazamento à espera de acontecer. O canal do cliente lê da base interna, que contém o que foi deliberadamente publicado para ele.

---

## 6. Cache e sincronização

Diferente do Escavador, **cache aqui não economiza dinheiro — economiza vazão** e reduz latência. Mas o Trello muda o tempo todo, e cache velho num quadro de trabalho gera confusão real.

| Dado | Validade | Justificativa |
|---|---|---|
| Estrutura do quadro (listas, etiquetas, definições de campos) | **1 hora**, invalidada por webhook | Muda raramente |
| Membros do quadro e da organização | **6 horas**, invalidada por webhook | Muda com entrada e saída de pessoal |
| Conteúdo de card | **5 minutos**, invalidada por webhook | É dado de trabalho vivo |
| Resultado de busca | **15 minutos** | O limite de 100/900 s obriga |
| `limits` do quadro | **12 horas** | Muda devagar; serve para alertar (§2.6) |
| Actions (histórico) | **permanente por id** | Ação passada não muda |
| Anexos (conteúdo) | **permanente por id** | O arquivo não muda |

**A invalidação por webhook é o mecanismo principal, não a validade.** Com webhook ativo no quadro, o cache pode ser mais longo, porque sabemos quando algo mudou. Sem webhook, tem de ser curto. O MCP deve saber quais quadros têm webhook ativo e ajustar a política por quadro — não uma validade única para tudo.

**Sobre o laço de sincronização**, repetindo o §2.7 porque é o erro mais provável desta frente: toda escrita do MCP no Trello envia `X-Trello-Client-Identifier` com um identificador nosso. O receptor de webhook descarta eventos que trazem esse identificador. Sem isso, a sincronização Trello ↔ base interna se realimenta.

---

## 7. Operações destrutivas e o rito de confirmação

O Trello não cobra nada, o que remove o freio natural que o custo dá no Escavador. Aqui o dano não é financeiro — é perda de trabalho e de histórico.

| Operação | Reversível? | Tratamento |
|---|---|---|
| Arquivar card ou lista | **Sim** | Operação normal, faixa A2 |
| Excluir card | **Não** | Confirmação explícita por parâmetro; escopo próprio |
| Excluir comentário ou anexo | **Não** | Confirmação explícita |
| `archiveAllCards` / `moveAllCards` | Arquivar é reversível card a card, mas trabalhoso | Confirmação com **contagem prévia**: a ferramenta informa quantos cards serão afetados e exige confirmação com esse número |
| Excluir definição de campo personalizado | **Não** — apaga valores em todos os cards | Fora das ferramentas na primeira entrega |
| Excluir quadro ou workspace | **Não** | Fora das ferramentas, sempre |
| Excluir ou editar `action` | **Não** — destrói auditoria | Fora das ferramentas, sempre |

**Regra geral, e ela vale mais que a lista:** quando existir uma alternativa reversível, a ferramenta expõe **a reversível** e não a destrutiva. Arquivar em vez de excluir é o comportamento padrão. Excluir é a exceção, com escopo próprio e confirmação.

---

## 8. Campos personalizados — a ponte com a base interna

✅ **D-09 foi resolvida em 27/08: o Trello é visualização**, e a base interna é a fonte da verdade (D-152). A peça abaixo continua sendo exatamente a mesma — o parágrafo original dizia que os dois caminhos precisavam dela, e estava certo: **uma forma de saber que o card X corresponde à demanda Y da base interna**. O que a resposta define é a **direção**: a demanda nasce na base e o card é derivado dela, nunca o contrário (RF-39 do PRD).

Custom Fields são essa peça. Proposta de campos a criar nos quadros do escritório:

| Campo | Tipo | Função |
|---|---|---|
| `id_demanda` | texto | Identificador na base interna. **A chave da correspondência** |
| `numero_cnj` | texto | Liga o card ao processo no Escavador |
| `cliente_id` | texto | Liga o card ao cliente na base interna |
| `origem` | lista | `manual` · `automacao` — distingue o que foi criado por pessoa do que foi criado por fluxo |

Duas observações:

**`id_demanda` no campo personalizado, não no nome do card nem na descrição.** Colocar identificador no texto obriga a interpretá-lo com expressão regular, quebra quando alguém edita o título, e polui a leitura humana. Campo personalizado é estruturado, consultável e sobrevive a edição.

**`origem` não é burocracia.** Saber o que a automação criou é o que permite corrigir um erro em massa sem tocar no trabalho manual das pessoas. É barato agora e caro de acrescentar depois.

Confirmar quais campos já existem hoje é a **pergunta 26**.

---

## 9. Desenho das ferramentas MCP

**12 ferramentas para 261 operações.** A razão de curadoria é ainda mais agressiva que a do Escavador, e deliberadamente: a maior parte da superfície do Trello (membros, enterprises, plugins, adesivos, reações, preferências) não tem uso neste projeto.

| Ferramenta | Consolida | Escopo | Faixa |
|---|---|---|---|
| `consultar_card` | Card + checklists + campos personalizados + comentários, com `formato: resumo \| completo` | `trello:card:read` | A0 |
| `listar_cards` | Cards de lista ou de quadro, com filtro e teto | `trello:card:read` | A0 |
| `buscar_cards` | `GET /search` restrito a cards, com teto de vazão e cache | `trello:busca:read` | A0 |
| `criar_card` | Criar com lista, membros, etiquetas, prazo e campos personalizados numa chamada | `trello:card:write` | A2 |
| `atualizar_card` | Nome, descrição, prazo, posição, membros, etiquetas, campos personalizados | `trello:card:write` | A2 |
| `mover_card` | Mudar lista e posição — a operação mais comum do fluxo | `trello:card:write` | A2 |
| `comentar_card` | Adicionar comentário | `trello:card:write` | A2 |
| `anexar_ao_card` | Anexar arquivo ou URL | `trello:card:write` | A2 |
| `gerenciar_checklist` | `operacao: criar \| adicionar_item \| marcar_item \| listar` | `trello:checklist:write` | A0/A2 |
| `consultar_quadro` | Estrutura: listas, etiquetas, membros, campos personalizados, `limits` | `trello:board:read` | A0 |
| `historico_do_card` | Actions do card, somente leitura | `trello:acao:read` | A0 |
| `arquivar_card` | Arquivar (reversível). **Excluir não é ferramenta** | `trello:card:arquivar` | A2 |

### 9.1 Perfis de exposição

| Perfil | Ferramentas |
|---|---|
| `cliente` | **Nenhuma** (§5.1) |
| `colaborador` | `consultar_card`, `listar_cards`, `buscar_cards`, `criar_card`, `atualizar_card`, `mover_card`, `comentar_card`, `anexar_ao_card`, `gerenciar_checklist`, `consultar_quadro`, `historico_do_card` |
| `advogado` | + `arquivar_card` |
| `administrador` | `consultar_quadro`, `historico_do_card` |
| `full` | Todas as acima. **Continuam fora:** exclusão de card, quadro, workspace, ação e definição de campo; convite por e-mail; geração de `emailKey`/`calendarKey`; operações em massa; toda a família `enterprises` |

Gestão de webhooks não é ferramenta de agente — é função do chassi, configurada por administrador no painel.

### 9.2 A ferramenta que falta, e por que ela não está aqui

§7.3 dizia: *"o valor real não é `updateCard`, é mover esta demanda para a fase seguinte do fluxo do escritório, notificando o responsável"*. Concordo — e é exatamente por isso que ela **não** está na lista.

"A fase seguinte do fluxo do escritório" é **regra de negócio deste cliente**. Saber que depois de "Aguardando documentos" vem "Em elaboração", e que o responsável muda nesse ponto, é conhecimento do escritório — e a Regra 3 é clara: regra de negócio não entra em servidor MCP.

**O desenho correto:** o MCP oferece `mover_card` (genérico, reutilizável, sabe mover para qualquer lista). O fluxo n8n sabe qual é a lista seguinte, quem notificar e o que registrar. A ferramenta de alto nível existe — ela mora no n8n, composta de chamadas ao MCP.

Isso resolve a ressalva que o próprio §7.3 tinha levantado ("decidir se mora no MCP como ferramenta parametrizável ou no n8n é item do mapeamento"). **Item resolvido: mora no n8n.**

---

## 10. Parecer definitivo — utilidade e viabilidade

O parecer preliminar de §7.3 pedia avaliação de utilidade e viabilidade. Fechando:

**Viabilidade: alta, confirmada.** API estável, OpenAPI oficial, documentação atualizada, webhooks com assinatura, limites de vazão folgados para o volume de um escritório. Nenhum bloqueio técnico.

**Utilidade: alta, e a construção continua justificada.** As três razões de §7.3 seguem de pé, e o mapeamento acrescentou uma quarta:

1. Controle de escopo por papel — os servidores prontos não têm.
2. Ferramentas de alto nível — confirmado, mas com a fronteira agora definida (§9.2).
3. Auditoria e custo unificados.
4. **Nova: proteção contra a superfície destrutiva.** Um MCP genérico de Trello expõe `DELETE /boards/{id}`, `DELETE /actions/{id}` e `archiveAllCards` como ferramentas comuns. Num escritório de advocacia, isso é inaceitável. A curadoria de §9 não é conveniência — é contenção.

**A ressalva nova, que não existia no parecer preliminar:** o §3. O Trello não consegue impor isolamento por quadro, e enquanto o OAuth 2.0 não chegar, esse isolamento é responsabilidade do nosso código. Isso não inviabiliza a frente — mas precisa ser dito ao escritório antes de o Trello receber dado que exija segregação forte.

**Prioridade:** mantida em 2, atrás do Escavador. E a ressalva de redução de §7.3 continua válida — se houver pressão de prazo, as 12 ferramentas de §9 já são o núcleo mínimo; não há o que cortar sem perder função.

---

## 11. Decisões geradas

Para somar à tabela §13 de `01-diretrizes-gerais.md`:

| ID | Decisão | Recomendação |
|---|---|---|
| **D-36** | Isolamento por quadro no Trello é garantido por verificação em código no MCP, não pela API — que não oferece escopo por recurso. Caminho A de §3.3, com conta de serviço membro apenas dos quadros do escritório | Adotar |
| **D-37** | Não planejar contando com o OAuth 2.0 do Trello: anunciado em abril de 2025, ainda não documentado em julho de 2026 | Adotar |
| **D-38** | Webhooks criados pela conta de serviço, nunca por token de administrador da organização — token de admin drena quadros privados sem conhecimento dos membros | Adotar |
| **D-39** | Verificação dupla de webhook: assinatura HMAC-SHA1 (`X-Trello-Webhook`) **e** faixa de IP `104.192.142.240/28` | Adotar |
| **D-40** | `X-Trello-Client-Identifier` obrigatório em toda escrita, com descarte dos webhooks correspondentes, para impedir laço de sincronização | Adotar |
| **D-41** | Ferramentas expõem a alternativa reversível (arquivar) e não a destrutiva (excluir); exclusão de quadro, workspace, ação e definição de campo fica fora de todo perfil | Adotar |
| **D-42** | Edição e exclusão de `actions` nunca são expostas — preservar o histórico do Trello é premissa da auditoria | Adotar |
| **D-43** | Correspondência com a base interna por Custom Fields (`id_demanda`, `numero_cnj`, `cliente_id`, `origem`), nunca por texto no nome ou descrição do card | Adotar |
| **D-44** | Ferramentas de fluxo do escritório ("avançar de fase") vivem no n8n, compostas sobre ferramentas genéricas do MCP — resolve a ressalva de §7.3 pela Regra 3 | Adotar |
| **D-45** | O papel `cliente` não recebe nenhuma ferramenta do Trello; o canal do cliente lê da base interna | Adotar |
| **D-46** | Controle de vazão com três baldes (chave, token e rotas de membros/busca), com recuo exponencial — repetição cega agrava o 429 | Adotar |

---

## 12. Riscos gerados

Para somar à tabela §15 de `01-diretrizes-gerais.md`:

| # | Risco | Impacto | Encaminhamento |
|---|---|---|---|
| **R-16** | **A API do Trello não oferece escopo por quadro ou por recurso** — `read`/`write` valem para a conta inteira. O isolamento entre carteiras depende só do nosso código | **Grave — a API de destino não é segunda barreira; uma falha no MCP expõe todos os quadros** | Conta de serviço restrita por associação, verificação em código, escrita desligada por padrão (D-36). Se o escritório exigir isolamento forte, usar contas de serviço separadas por área |
| **R-17** | Laço de sincronização entre n8n e Trello, com escrita realimentando webhook | Operacional — cards bagunçados e vazão esgotada | `X-Trello-Client-Identifier` obrigatório (D-40) |
| **R-18** | Webhook quebrado passa até 30 dias e 1.000 falhas antes de o Trello desativar, perdendo eventos silenciosamente | Grave — sincronização se degrada sem sinal | Verificação periódica de `consecutiveFailures` e `active`, com alerta ativo (§2.7) |
| **R-19** | Limite de 100 req/900 s em `/search` e `/members` esgotável por uma conversa movimentada, afetando o escritório inteiro | Operacional | Balde próprio de vazão, cache de 15 min e teto por sessão (D-46) |
| **R-20** | Token pessoal do Trello dá acesso à conta inteira da pessoa e pode ser revogado por ela a qualquer momento, derrubando a automação | Operacional e de privacidade | Conta de serviço dedicada (§8.5, perguntas 65 e 66) |

> R-09 (dependência de token pessoal no Trello) continua válido e é **agravado** por este mapeamento: o problema não é só acoplamento a uma pessoa, é que o token carrega a conta inteira dela.

---

## 13. Pendências deste mapeamento

| # | Pendência | Depende de |
|---|---|---|
| 1 | **O Trello é gestão de casos ou quadro de tarefas?** | Pergunta 23 / **D-09** — muda a prioridade e o volume |
| 2 | Quantos quadros e qual a lógica deles | Pergunta 24 — define a granularidade do escopo `carteira` |
| 3 | Fluxo típico de um card, da criação ao encerramento | Pergunta 25 — define os fluxos n8n de §9.2 |
| 4 | Campos personalizados já em uso | Pergunta 26 — evita colidir com o desenho de §8 |
| 5 | Power-Ups e automações Butler ativos | Pergunta 27 — **Butler pode reagir às nossas escritas e criar efeitos inesperados** |
| 6 | Plano contratado e número de licenças | Pergunta 29 — decide se `enterprises` existe e se cabe conta de serviço |
| 7 | É possível criar conta de serviço dedicada? | Pergunta 66 — **se a resposta for não, R-20 fica sem tratamento** |
| 8 | Volume de cards por quadro | Teto de 5.000 cards abertos (§2.6) |

A pendência 5 merece atenção que o questionário não dava: **o Butler é automação nativa do Trello**. Se ele estiver ativo, nossas escritas disparam regras dele, e o comportamento do sistema passa a depender de duas automações que não se conhecem. Precisa ser inventariado antes da primeira escrita.

---

## 14. Comparação com o Escavador

Vale registrar porque muda o desenho do chassi comum:

| Dimensão | Escavador | Trello |
|---|---|---|
| Operações | 83 | 261 |
| Recurso escasso | **Crédito** (dinheiro) | **Vazão** (requisições) |
| Custo por chamada | Sim, em `Creditos-Utilizados` | Nenhum |
| Escopo na API de destino | Não há, mas o dado é por consulta | **Não há, e o token vê tudo** |
| Assincronia | Regra, nas operações caras | Não há — tudo síncrono |
| Webhooks | URL única por conta, no painel | Por objeto, criados via API, com HMAC |
| Operação destrutiva | Remover monitoramento | **Muitas, e algumas em massa** |
| Natureza do dano | Financeiro e perda de alerta | **Perda de trabalho e de histórico** |

**O que isso significa para o chassi:** a base compartilhada precisa de um conceito de "recurso escasso" abstrato — que no Escavador é crédito e no Trello é vazão —, com disjuntor sobre os dois. O registro de custo continua existindo nos dois, só que no Trello o custo é zero e o que se registra é consumo de cota.

---

## 15. Fontes consultadas

Todas acessadas em 2026-08-20. As páginas de guia registram última atualização em 28/07/2026.

| Fonte | Endereço |
|---|---|
| OpenAPI 3.0 oficial | `https://developer.atlassian.com/cloud/trello/swagger.v3.json` |
| Referência da REST API | `https://developer.atlassian.com/cloud/trello/rest/` |
| Introdução à API | `.../guides/rest-api/api-introduction/` |
| Autorização | `.../guides/rest-api/authorization/` |
| Limites de vazão | `.../guides/rest-api/rate-limits/` |
| Limites de objeto | `.../guides/rest-api/limits/` |
| Recursos aninhados | `.../guides/rest-api/nested-resources/` |
| Webhooks | `.../guides/rest-api/webhooks/` |
| Changelog (verificação do OAuth 2.0) | `https://developer.atlassian.com/cloud/trello/changelog/` |

O anúncio do OAuth 2.0 (RFC-89) está no changelog em 16/04/2025. A entrada mais recente do changelog é de 20/02/2026 e trata de requisitos de segurança de apps, sem menção a disponibilidade do OAuth 2.0 para a API do Trello.
