# Spec Técnica — Parte I: chassi, custo e fundação

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Data | 2026-08-20 |
| Estado | 🟡 **Proposta — aguarda aval do usuário** |
| Fase | 2 — PRD e Spec |
| Recorte | **Parte I** — o que não depende de resposta do escritório |
| Herda de | `08-prd.md`, `04-modelo-de-identidade-e-autorizacao.md`, `mapeamento-escavador.md`, `mapeamento-trello.md`, `07-painel-escavador-achados.md`, `01-diretrizes-gerais.md` |

> **O que este documento é.** A especificação de **como** o produto é construído — componentes, contratos, esquema de dados, comportamento sob falha. O PRD diz o que o produto faz; a Spec diz de que ele é feito.
>
> **O que esta Parte I é.** O **chassi**: a base compartilhada pelos dois servidores MCP (*Model Context Protocol* — padrão que expõe capacidades a agentes de IA de forma estruturada), o motor de custo, o cache, o receptor de eventos, a auditoria e o esquema de dados que sustenta tudo isso. É a metade da Spec que já pode ser escrita e construída **hoje**, porque depende das APIs e da nossa arquitetura, não de decisão do escritório.

---

## 1. Recorte — o que a Parte I especifica, e por quê

### 1.1 O critério de corte

O PRD terminou com sete perguntas em aberto (§13) e sete premissas declaradas (§11). Escrever a Spec inteira agora seria detalhar premissa em vez de requisito — e refazer depois.

O critério que separa as duas partes é simples:

> **Está na Parte I** tudo que seria construído **exatamente igual** sob qualquer resposta que o escritório der.
> **Fica para a Parte II** tudo cuja forma muda conforme a resposta.

Exemplo do critério funcionando: *como* o servidor verifica se um usuário tem direito a um processo é Parte I — o mecanismo é o mesmo tanto faz se advogado enxerga a carteira ou a base inteira. *Qual* é a resposta certa (carteira ou base inteira) é D-07, e fica para a Parte II. O chassi lê a regra de uma tabela de configuração; a regra é que depende do escritório.

### 1.2 O que fica para a Parte II

| Área | Depende de | Por quê |
|---|---|---|
| Matriz definitiva de escopos por papel | **D-07** — advogado vê carteira ou base inteira | Muda a abrangência concedida em quase todo escopo |
| Modelagem da demanda e correspondência com o Trello | **D-09** — Trello é fonte da verdade ou visualização | Muda quem é dono do dado e a direção da sincronização |
| Campos personalizados e convivência com o Butler | **Perguntas 26 e 27** | Escrever num quadro com automação desconhecida é gravar às cegas |
| Rito de escalada de alerta não lido | **Pergunta 12** — o prazo N de RF-13 | O mecanismo é Parte I; o relógio é do escritório |
| Fluxos n8n de E2, E3 e E4 | Todas as acima | Fluxo é onde mora a regra de negócio (Regra 3) |
| Provedor e templates de WhatsApp | **P-05** | Não há como especificar contra provedor desconhecido |
| Dimensionamento de infraestrutura | Acesso à instância n8n | §12.2 de `01` já registra que será revisada com dados reais |

E fica para a Parte II uma coisa que **não** depende do escritório, mas depende do Escavador: o **preço definitivo do catálogo**, pendente da resposta do suporte (P-06). O desenho da Parte I trata preço como dado, não como código, exatamente para que essa resposta não custe reescrita.

---

## 2. Arquitetura de execução

### 2.1 Componentes

| Componente | Natureza | Responsabilidade |
|---|---|---|
| **Canais** | Telegram, WhatsApp, e-mail, painel web | Entrada e saída. Nunca decidem nada |
| **n8n** | Orquestração | Fluxo, regra de negócio do escritório, composição de ferramentas, espera por aprovação humana |
| **Policy Gate** | Serviço próprio | Responde *"esta pessoa, neste canal, pode fazer isto — e com que limites?"*. Emite a sessão |
| **Servidores MCP** | Serviço próprio, um por sistema de destino | Expõem ferramentas curadas ao agente. **São a fronteira de segurança** |
| **`mcp-core`** | Biblioteca compartilhada | O chassi: escopo, custo, cache, vazão, erro, auditoria. Toda ferramenta passa por ele |
| **SDK interno** | Biblioteca por fornecedor | Cobertura de 100% da API, tipada. Não decide privilégio |
| **Receptor de callbacks** | Serviço próprio | Recebe evento de Escavador e Trello, valida, deduplica, alimenta a base interna |
| **Base de governança** | PostgreSQL (banco de dados relacional) | Identidade, sessão, aprovação, auditoria, consumo, orçamento |
| **Base interna de vigilância** | PostgreSQL | Publicações, movimentações e alertas. É o que o agente do cliente lê (D-63) |

### 2.2 O caminho de uma pergunta

```mermaid
flowchart TD
    A[Canal: Telegram, WhatsApp, e-mail, painel] --> B[n8n - orquestracao]
    B --> C{Policy Gate}
    C -->|negado| D[Recusa registrada em auditoria]
    C -->|permitido: sessao + escopos + orcamento| E[Servidor MCP]
    E --> F[mcp-core: escopo, custo, cache, vazao, auditoria]
    F -->|cache valido| G[Resposta servida do cache - custo zero]
    F -->|precisa da fonte| H[SDK interno]
    H --> I[(API Escavador V1 e V2)]
    H --> J[(API Trello)]
    I -.evento.-> K[Receptor de callbacks]
    J -.webhook.-> K
    K --> L[(Base interna de vigilancia)]
    K --> B
    F --> M[(Auditoria e consumo)]
```

Duas leituras que o desenho impõe:

**A seta que não existe.** Não há seta do agente direto para a API. Todo acesso passa pelo `mcp-core`. Se houvesse um caminho alternativo — um nó HTTP solto no n8n, por exemplo —, ele seria uma porta sem fechadura, porque nem o Escavador nem o Trello oferecem escopo no token (R-24 e R-16).

**A seta de volta do receptor.** O evento não vai para o agente: vai para a **base interna**, e é a base que o agente lê. Isso é o que torna a pergunta do cliente barata (D-63) e é o que faz o alerta de prazo existir mesmo com todos os agentes desligados.

### 2.3 Fronteiras — o que cada camada pode e não pode

| Camada | Pode | **Não pode** |
|---|---|---|
| Agente de IA | Escolher ferramenta, redigir texto, propor ação | Decidir privilégio, escolher rota, conhecer credencial, executar A3/A4 sem aprovação |
| n8n | Compor ferramentas, aplicar regra do escritório, orquestrar aprovação | Guardar credencial de destino em nó, conter lógica reutilizável, receber webhook de fornecedor |
| Servidor MCP | Verificar escopo, aplicar teto, chamar a API, registrar custo | Conter regra de negócio do escritório (Regra 3) |
| SDK interno | Cobrir a API inteira, tipar, paginar sob comando | Decidir se a chamada é permitida |
| Policy Gate | Resolver identidade, conceder escopos e orçamento | Executar ação |

---

## 3. Stack e organização do repositório

**Linguagem e tempo de execução:** TypeScript sobre Node.js, com o SDK oficial de MCP. Escolhido porque é onde o MCP tem suporte de primeira classe e porque o n8n vive no mesmo ecossistema — depurar os dois lados exige uma linguagem, não duas.

**Persistência:** PostgreSQL, único banco para governança e vigilância. Cache também em PostgreSQL na fundação; *Redis* (banco em memória, muito rápido) entra apenas se o volume justificar. Volume de escritório é pequeno — simplicidade vale mais que latência aqui, e cada peça a menos é uma peça a menos para operar.

**Formato do repositório:** *monorepo* (um único repositório com vários pacotes que se referenciam). O motivo é direto: `mcp-core` é a fronteira de segurança compartilhada, e não pode existir em versões diferentes entre os dois servidores.

```
lex_ai_n8n/
├── docs/                        diretrizes, PRD, spec, mapeamentos, decisões
├── packages/
│   ├── mcp-core/                O CHASSI — escopo, custo, cache, vazão, erro, auditoria
│   ├── sdk-escavador/           cobertura 100% da API V1 e V2, tipada
│   ├── sdk-trello/              cobertura curada da API do Trello
│   └── dominio/                 tipos compartilhados: usuário, sessão, escopo, faixa
├── mcp-servers/
│   ├── escavador/               15 ferramentas + perfis de exposição
│   └── trello/                  12 ferramentas + perfis de exposição
├── services/
│   ├── policy-gate/             identidade, escopos, orçamento, sessão
│   ├── receptor-callbacks/      Escavador e Trello, validação e fila
│   └── auditoria/               escrita append-only e consulta
├── n8n/
│   ├── workflows/               fluxos exportados em JSON, versionados
│   └── credentials/             apenas esquemas — nunca segredos
├── dados/
│   ├── precos-escavador.json    catálogo de preços versionado (§6.1)
│   └── migracoes/               evolução do esquema do banco
├── testes/
│   └── gravacoes/               respostas reais anonimizadas, para teste (§14)
└── infra/                       containers, implantação, configuração
```

Três regras de organização que não são estéticas:

1. **`mcp-core` não importa nada de `mcp-servers/`.** A dependência é de mão única. Chassi que conhece o servidor específico deixa de ser chassi.
2. **`sdk-*` não conhece papel, escopo nem orçamento.** O SDK sabe falar com a API; quem decide se pode é o chassi. Misturar os dois é o caminho mais curto para um privilégio que vaza.
3. **Nenhum segredo em nenhum diretório.** Credencial vive em cofre e chega por variável de ambiente. O `.gitignore` já bloqueia `.env`, `secrets/`, chaves e `*.credentials.json`.

---

## 4. O chassi comum — `mcp-core`

Esta é a seção central do documento. O chassi é onde a **Regra 1** deixa de ser princípio e vira código.

### 4.1 A ideia central: a ferramenta declara, o chassi decide

Uma ferramenta MCP, no nosso desenho, **não chama o Policy Gate, não lê token, não mede custo, não escreve auditoria e não decide se pode**. Ela declara o que é, e o chassi faz o resto.

O motivo é de segurança, não de elegância: se cada ferramenta aplicasse o próprio controle, a fronteira de segurança do projeto passaria a depender da disciplina de quem escreve ferramenta. Bastaria uma esquecer uma linha. Com o chassi no caminho obrigatório, **é impossível escrever uma ferramenta que não seja verificada** — não existe caminho alternativo até a API.

```ts
export const consultarProcesso = definirFerramenta({
  nome: 'consultar_processo',
  faixa: 'A1',                                       // leitura externa paga
  escopo: 'escavador:processo:read',                 // exigência de privilégio
  sujeito: (p) => ({ processos: [p.numero_cnj] }),   // o que será conferido contra a sessão
  custo: { rota: 'v2.processo.capa' },               // chave no catálogo de preços
  cache: 'estado_processo',                          // tipo de dado, define a validade
  entrada: esquema({ numero_cnj: cnj(), formato: umDe(['resumo', 'completo']) }),
  executar: async (p, ctx) => ctx.escavador.processoPorCnj(p.numero_cnj),
})
```

Cada campo dessa declaração é um controle que o chassi aplica sozinho:

| Campo | O que o chassi faz com ele |
|---|---|
| `faixa` | Decide se exige aprovação humana antes de executar (A3, A4) ou apenas registra (A0, A2) |
| `escopo` | Recusa se a sessão não trouxer o escopo — **antes** de qualquer chamada paga |
| `sujeito` | Confere o processo/documento contra `sujeitos_autorizados` da sessão quando a abrangência for `own` ou `carteira` |
| `custo` | Consulta o catálogo, estima, **reserva** no orçamento e reconcilia depois |
| `cache` | Procura no cache antes de gastar; grava depois; devolve a idade do dado |
| `entrada` | Valida e normaliza. Entrada inválida nunca chega à API — erro de validação não custa crédito |
| `executar` | Recebe `ctx` com os clientes já autenticados. **A ferramenta nunca vê o token** |

### 4.2 As onze etapas de toda chamada

O chassi é um *pipeline* (sequência de etapas por onde toda chamada passa, sempre na mesma ordem). A ordem importa: as etapas baratas e as que negam vêm antes das que gastam.

| # | Etapa | Se falhar |
|---|---|---|
| 1 | **Correlação** — recebe ou cria `requisicao_id`, que acompanha tudo até a auditoria | Não falha; o identificador é gerado |
| 2 | **Sessão** — valida assinatura e validade do token de sessão; confere lista de revogação | Recusa. Falha fecha |
| 3 | **Inquilino e credencial** — resolve de qual escritório é a sessão e qual credencial usar | Recusa. Credencial ausente nunca vira chamada anônima |
| 4 | **Perfil** — confere se a ferramenta está no perfil de exposição da sessão | Recusa: ferramenta desconhecida |
| 5 | **Escopo** — confere o escopo exigido contra os escopos concedidos | Recusa, registrada como evento de segurança |
| 6 | **Abrangência** — confere o sujeito da chamada contra `sujeitos_autorizados` | Recusa **antes de gastar crédito** (RF-07) |
| 7 | **Validação de entrada** — esquema, formato de CNJ, tetos de tamanho | Erro acionável ao agente. Não gasta |
| 8 | **Faixa e aprovação** — A3 e A4 exigem aprovação registrada e vigente | Devolve pedido de aprovação; não executa |
| 9 | **Custo** — estima, verifica os três orçamentos, **reserva** | Bloqueia ou degrada para cache, conforme o estado (§6.3) |
| 10 | **Cache** — procura; se achar válido, devolve e libera a reserva | Segue para a fonte |
| 11 | **Execução** — vazão, chamada, repetição conforme a taxonomia de erro, leitura do custo real, reconciliação, gravação em cache, normalização e **auditoria** | Erro traduzido para envelope acionável; a auditoria grava de todo modo |

Duas propriedades que essa ordem garante:

- **Negar é sempre mais barato que permitir.** As etapas 2 a 8 não custam um centavo. Uma tentativa indevida é recusada sem tocar na API — é requisito de custo e de sigilo ao mesmo tempo, porque também não revela que o processo existe.
- **A auditoria é a última etapa e é incondicional.** Sucesso, recusa, erro de rede e estouro de orçamento geram registro. Silêncio na auditoria significa que a plataforma não rodou, nunca que nada aconteceu.

### 4.3 Envelope de resposta

Toda ferramenta devolve a mesma estrutura. O agente aprende uma forma, não quinze.

```json
{
  "dados": { "...": "conteúdo já resumido para contexto, nunca JSON bruto da API" },
  "meta": {
    "origem": "cache",
    "idade_segundos": 3480,
    "custo_centavos": 0,
    "ha_mais": false,
    "proximo_cursor": null,
    "requisicao_id": "req_01HQ..."
  },
  "avisos": [
    "Dado servido do cache, com 58 minutos. Para forçar consulta nova, peça atualização."
  ]
}
```

`origem`, `idade_segundos` e `custo_centavos` são **obrigatórios em toda resposta**. Não são telemetria: são o que permite ao agente cumprir RF-03 — toda afirmação factual aponta a fonte e a idade do dado. Resposta sem esses campos é defeito, não estilo.

`ha_mais` existe para cumprir D-57: havendo mais resultados, a ferramenta **informa** em vez de buscar. Cada bloco a mais custa dinheiro (R-25).

### 4.4 Envelope de erro

```json
{
  "erro": {
    "codigo": "orcamento_esgotado",
    "mensagem_agente": "O orçamento desta conversa acabou. Só há dados de cache disponíveis.",
    "acao_sugerida": "escalar_humano",
    "repetivel": false,
    "requisicao_id": "req_01HQ..."
  }
}
```

`acao_sugerida` é o campo que faz diferença na prática: diz ao agente o que fazer a seguir — `tentar_novamente`, `usar_cache`, `pedir_aprovacao`, `escalar_humano`, `corrigir_parametro`, `desistir` — em vez de devolver um código HTTP e esperar que ele adivinhe.

`mensagem_agente` **nunca revela razão técnica de negativa de privilégio**. Recusa por escopo e ausência de resultado produzem a mesma mensagem para quem está fora, pela razão registrada em `04` §4.4: caso contrário o sistema vira oráculo de existência de processos.

### 4.5 O que o chassi proíbe, por construção

| Proibição | Como é impedida |
|---|---|
| Ferramenta receber credencial por parâmetro | O esquema de entrada rejeita campos de credencial; o `ctx` já entrega o cliente autenticado |
| Ferramenta paginar em laço | O SDK só avança cursor com teto explícito, e o chassi conta blocos contra o orçamento (D-35, D-57) |
| Ferramenta devolver coleção ilimitada | Teto de itens aplicado no envelope, com `ha_mais` |
| Escrita habilitada por omissão | Ferramenta sem escopo de escrita declarado é somente-leitura |
| Operação destrutiva sem confirmação | Faixa destrutiva exige parâmetro de confirmação explícito, verificado no chassi (D-29) |
| Chamar rota fora do catálogo | Rota sem entrada no catálogo de preços é classificada `desconhecida` e exige liberação deliberada (D-59) |

---

## 5. Sessão e identidade

### 5.1 O token de sessão

O Policy Gate emite, no fim da autorização, um **token de sessão** (credencial temporária que o servidor MCP entende) já com tudo o que o chassi precisa para decidir sem perguntar de novo:

```json
{
  "sessao_id": "ses_01HQ...",
  "inquilino_id": "esc_001",
  "usuario_id": "usr_014",
  "papel": "colaborador",
  "canal": "telegram",
  "perfil": "colaborador",
  "escopos": ["escavador:processo:read:carteira", "escavador:movimentacao:read:carteira"],
  "sujeitos_autorizados": {
    "documentos": ["12345678000199"],
    "processos": ["0801234-56.2024.8.03.0001"]
  },
  "orcamento": { "sessao_centavos": 800, "estado": "normal" },
  "emitida_em": "2026-08-20T14:02:00Z",
  "expira_em": "2026-08-20T14:12:00Z"
}
```

O token é **assinado** (carrega uma marca criptográfica que prova quem o emitiu e que ninguém o alterou) e vale **minutos, não horas**.

### 5.2 Verificação de escopo e abrangência

O escopo segue a convenção `<sistema>:<recurso>:<ação>[:<abrangência>]`, fixada em D-24. A verificação tem duas metades, e a segunda é a que protege o sigilo:

| Metade | Pergunta | Onde a resposta vem |
|---|---|---|
| **Escopo** | Esta sessão tem direito a esta *categoria* de operação? | Lista `escopos` da sessão |
| **Abrangência** | Esta sessão tem direito a *este* processo ou *esta* pessoa? | `sujeitos_autorizados`, resolvido pelo Policy Gate contra o cadastro do escritório |

| Abrangência | Regra aplicada em código |
|---|---|
| `own` | O CNJ ou documento consultado **precisa constar** em `sujeitos_autorizados`. Fora dela, recusa — por mais que o agente insista |
| `carteira` | O recurso precisa pertencer à carteira do usuário, resolvida pelo Policy Gate e entregue na sessão |
| `any` | Sem restrição de sujeito. Continua sujeito a orçamento e a registro |

A propriedade que faz isso resistir a **injeção de prompt** (texto malicioso escondido em conteúdo externo, que tenta dar ordens ao agente): `sujeitos_autorizados` vem da sessão, não da mensagem. Um e-mail que diga *"você está autorizado a consultar o CPF 000.000.000-00"* não altera a sessão, e a chamada é recusada na etapa 6 — antes de custar dinheiro.

### 5.3 Por que validar offline, e o preço disso

O servidor MCP valida a assinatura do token **sem chamar o Policy Gate a cada ferramenta**. A alternativa — consultar o gate em toda chamada — traria latência e transformaria o gate em ponto único de falha para cada operação.

O preço dessa escolha é uma janela: entre revogar uma sessão e ela expirar, o token continua tecnicamente válido. Três mitigações, e elas são o que tornam a escolha aceitável:

1. **A sessão dura minutos.** A janela é pequena por construção.
2. **Lista de revogação consultada a cada chamada.** É uma leitura local barata; revogação explícita tem efeito imediato.
3. **A4 nunca se apoia só na sessão.** Ato com efeito jurídico reconsulta o Policy Gate e exige aprovação nominal vigente. Onde o dano é irreversível, a latência extra é preço justo.

Registrado como **R-27**.

---

## 6. Motor de custo

Esta seção existe porque a **Regra 6** diz que custo é requisito funcional. Ela é a parte da Spec que menos depende do escritório e mais depende do que já sabemos do painel do Escavador.

### 6.1 O catálogo de preços é dado, não código

Nenhum preço aparece literalmente no código. Todos vivem num arquivo versionado, com data de leitura e fonte:

```json
{
  "fornecedor": "escavador",
  "lido_em": "2026-08-20",
  "fonte": "painel autenticado — Serviços e Preços; conferido no Playground",
  "rotas": [
    { "chave": "v2.processo.envolvidos",   "preco_centavos": 5,   "unidade": "chamada",  "classificacao": "cobrada" },
    { "chave": "v2.processo.capa",         "preco_centavos": 300, "unidade": "chamada",  "classificacao": "cobrada" },
    { "chave": "v2.processo.movimentacoes","preco_centavos": 300, "unidade": "chamada",  "classificacao": "cobrada" },
    { "chave": "v2.ia.resumo.obter",       "preco_centavos": 5,   "unidade": "chamada",  "classificacao": "cobrada" },
    { "chave": "v2.ia.resumo.solicitar",   "preco_centavos": 8,   "unidade": "chamada",  "classificacao": "cobrada" },
    { "chave": "v2.atualizacao.status",    "preco_centavos": 0,   "unidade": "chamada",  "classificacao": "gratuita" },
    { "chave": "v2.envolvido.processos",   "preco_centavos": 300, "unidade": "bloco_200","classificacao": "cobrada" },
    { "chave": "v2.oab.processos",         "preco_centavos": 300, "unidade": "bloco_200","classificacao": "cobrada" },
    { "chave": "v1.monitoramento.diario",  "preco_centavos": 300, "unidade": "mes_bloco_200", "adicional_centavos": 5, "classificacao": "cobrada" },
    { "chave": "v2.monitoramento.processo.mensal_docs", "preco_centavos": 18, "unidade": "mes", "classificacao": "cobrada" }
  ]
}
```

Três propriedades desse formato:

**`classificacao` tem três valores, não dois** — `cobrada`, `gratuita`, `desconhecida` (D-59). A tela de preços do Escavador lista **só o que é cobrado**; ausência dali pode significar gratuito, como se descobriu com as rotas de status. `desconhecida` é a única classificação que exige medição, e uma rota `desconhecida` não é chamada sem liberação deliberada.

**`unidade` distingue três formas de cobrar** — por `chamada`, por `bloco_200` de resultados e por `mes` de assinatura. Sem essa distinção o orçamento erra sistematicamente: trata assinatura como gasto único e listagem grande como gasto pequeno.

**`lido_em` e `fonte` estão no arquivo.** Quando o suporte responder P-06 — se estes são preços de catálogo ou limitados pelo bônus —, muda-se um arquivo de dados, não o código. É por isso que a pendência não trava a construção.

### 6.2 Reserva antes, reconciliação depois

A API do Escavador não tem cotação prévia: o custo real só é conhecido **depois** da chamada, no cabeçalho `Creditos-Utilizados`. Por isso o orçamento opera em dois tempos:

| Tempo | O que acontece |
|---|---|
| **Antes** | Estima pelo catálogo (ou pela média móvel observada, D-33) e **reserva** o valor no orçamento. Sem reserva concedida, a chamada não sai |
| **Depois** | Lê o custo real, grava em `consumo` e **reconcilia** a reserva — libera o que sobrou, ou registra o excedente |

A reserva é o que impede o modo de falha mais caro que existe aqui: várias chamadas simultâneas, cada uma vendo saldo suficiente porque nenhuma debitou ainda. Sem reserva, dez chamadas concorrentes de R$ 3,00 passam por um orçamento de R$ 5,00.

Nas rotas por bloco, a reserva usa o **pior caso permitido** (o teto de blocos daquele papel), não a média — porque subestimar ali é o único caso em que a reconciliação chega depois de o dinheiro já ter saído. Registrado como **R-28**.

### 6.3 Três níveis e três estados

Os orçamentos são verificados em cadeia, e **o mais restritivo vence**:

```
sessão/conversa  →  usuário/mês  →  escritório/mês
```

| Estado | Gatilho | Comportamento do chassi |
|---|---|---|
| `normal` | Abaixo de 80% | Opera |
| `alerta` | 80% a 100% | Opera, notifica o administrador, e o aviso viaja no envelope de resposta |
| `bloqueado` | 100% | **Só cache.** Consulta nova exige aprovação de advogado |

O comportamento em `bloqueado` é o que RN-16 exige: **degrada, avisa e exige aprovação**. Não para em silêncio nem continua gastando. E o aviso vem **antes** do teto, não depois (RN-18) — um disjuntor que só avisa quando já desligou não serve para nada, especialmente porque recarregar crédito no Escavador depende de atendimento comercial e pode levar dias (R-22).

Há ainda uma segunda camada, externa e gratuita: o **Alerta de saldo** nativo do painel do Escavador (D-54). Duas camadas independentes, porque a nossa pode falhar junto com o sistema que ela deveria vigiar.

### 6.4 Custo recorrente — assinaturas

Monitoramentos cobram **todo mês**, para sempre, sem gerar chamada nenhuma. Um orçamento que conte apenas requisições **não enxerga** o monitoramento criado três meses atrás — e é assim que uma conta cresce sem ninguém notar (R-13).

Por isso o chassi mantém uma tabela `assinatura`, separada do consumo por chamada:

| O que registra | Para quê |
|---|---|
| Tipo, alvo, frequência e custo mensal | Somar o compromisso mensal total, a qualquer momento |
| Quem criou, quando, e com qual justificativa | Responsabilizar — assinatura órfã é dinheiro escorrendo |
| Estado e data de remoção | Detectar monitoramento removido, que é perda de alerta (R-14) |

Regra de operação que vale desde o primeiro teste: **monitoramento criado para experimento é removido ao terminar o experimento**. Fica no chassi como alerta automático sobre assinatura criada em ambiente de desenvolvimento.

### 6.5 Blocos de 200 — o tratamento de R-25

Quatro rotas cobram por volume de resultado, e o volume é desconhecido antes de perguntar. É a exposição financeira central do produto. O chassi aplica três controles, nesta ordem:

| # | Controle | Efeito |
|---|---|---|
| 1 | **Nunca paginar em laço.** Traz um bloco, devolve, marca `ha_mais: true` | Um susto de R$ 3,00 nunca vira um susto de R$ 15,00 sem decisão |
| 2 | **Contar antes de listar** quando o volume for suspeito, usando a rota de resumo | Descobre o tamanho por um preço conhecido, em vez de descobrir pela fatura |
| 3 | **Teto de blocos por papel.** Acima dele, a ferramenta devolve proposta em vez de resultado | A IA propõe, o humano dispõe (Regra 2), inclusive sobre gastar |

O terceiro controle é o que transforma R-25 de risco em requisito: acima do teto, a resposta ao agente não é um erro — é *"esta consulta deve custar cerca de R$ 15,00; peça aprovação"*.

### 6.6 "Recurso escasso" é uma abstração só

O Escavador cobra dinheiro; o Trello cobra vazão (quantas requisições cabem por janela de tempo). São dois recursos escassos com a mesma forma: um saldo que se esgota, um estado que degrada, um disjuntor que precisa disparar antes do fim.

O chassi trata os dois pelo mesmo mecanismo — reservar, consumir, reconciliar, degradar —, mudando apenas a unidade:

| Dimensão | Escavador | Trello |
|---|---|---|
| Unidade | Centavos | Requisições por janela |
| Onde o custo é lido | Cabeçalho `Creditos-Utilizados` | Contagem local nos baldes |
| O que registra em `consumo` | Custo real | Custo zero e consumo de cota |
| Natureza do dano ao estourar | Financeiro e parada por dias (R-22) | Erro 429 em cascata, e o Trello pune insistência |

Um só disjuntor, duas unidades. É isso que evita construir metade da lógica de controle duas vezes — e evita que a metade do Trello seja a mal feita, por ser a que não custa dinheiro.

---

## 7. Cache

O cache é **requisito funcional**, não otimização: é ele que faz duas perguntas iguais custarem uma cobrança (RF-06), e é ele que mantém o sistema respondendo quando o Escavador está fora do ar (RNF-13).

### 7.1 A chave

```
<inquilino>:<fornecedor>:<tipo_dado>:<identificador>:<variante>
```

`inquilino` vem primeiro e não é opcional: **cache é por escritório, nunca global** (D-31). Dado de processo é dado de cliente; compartilhar cache entre inquilinos é vazamento, não economia.

`variante` distingue `resumo` de `completo`, e é o que impede a resposta resumida de ser servida a quem pediu a completa.

### 7.2 Validades

Herdadas de `mapeamento-escavador.md` §7, com a lógica em uma frase: **o tempo de vida acompanha a velocidade com que o dado envelhece.**

| Tipo de dado | Validade | Por quê |
|---|---|---|
| Catálogos (tribunais, assuntos, origens) | 30 dias | Mudam com mudança institucional |
| Capa do processo | 7 dias | Dado cadastral |
| Movimentações históricas | permanente | Movimentação passada não muda |
| Estado do processo | 6 horas | É o dado que justifica a consulta |
| Envolvidos | 7 dias | Muda em habilitação ou substituição |
| Processos do envolvido / da OAB | 24 horas | Conjunto cresce devagar; a consulta é cara |
| Documento por `key` | permanente | O conteúdo de um documento não muda |
| Resumo por IA | até nova solicitação | Só muda quando regerado |
| Status de tarefa assíncrona | **não cachear** | É justamente o que precisa ser fresco |
| Saldo | 5 minutos | Precisa ser recente para o disjuntor |

### 7.3 Invalidação por evento

Callback recebido para um processo **invalida imediatamente** o cache daquele processo. Isso é mais eficiente do que qualquer validade curta: o Escavador nos avisa quando algo mudou, e é desperdício pagar por uma validade de 6 horas quando existe uma notificação de mudança.

Invalidação também acontece na escrita: criar ou editar monitoramento invalida a listagem de monitoramentos.

### 7.4 Cache negativo

"Não encontrado" também é guardado, por **1 hora**.

Parece detalhe e não é: sem cache negativo, um agente que consulta um CNJ inexistente — ou digitado errado — paga de novo a cada tentativa, e agente que erra tende a repetir. Uma hora é curta o bastante para não esconder um processo que acabou de ser distribuído, e longa o bastante para conter o laço.

### 7.5 Modo degradado

Com o disjuntor em `bloqueado`, ou com o Escavador indisponível, o chassi serve **só do cache** e informa a idade do dado na resposta. Nunca finge que é fresco.

A regra que fecha o comportamento: **um dado velho identificado como velho é útil; um dado velho apresentado como atual é um defeito de produto** — e, num escritório de advocacia, pode virar um erro de prazo.

---

## 8. Receptor de callbacks

É um serviço próprio, **fora do n8n**. A razão está nos dois mapeamentos: a URL de callback do Escavador é única por conta e configurada no painel, e a validação exige segredo. Expor um webhook do n8n direto para a internet colocaria a fronteira no lugar errado.

### 8.1 Responsabilidades, na ordem

| # | Etapa | Regra |
|---|---|---|
| 1 | **Validar a origem** | Falha fecha. Evento não validado é descartado e registrado como incidente |
| 2 | **Responder rápido** | Confirma o recebimento e processa em fila. Os dois fornecedores penalizam receptor lento |
| 3 | **Deduplicar** | Chave de evento única; segunda entrega não repete efeito |
| 4 | **Persistir cru** | O corpo recebido é guardado antes de ser interpretado |
| 5 | **Invalidar cache** | Do recurso afetado, imediatamente |
| 6 | **Alimentar a base interna** | Publicação, movimentação e alerta (§9.3) — é o que sustenta E2 e D-63 |
| 7 | **Disparar o fluxo n8n** | O n8n é acionado pelo receptor, não pelo fornecedor |
| 8 | **Auditar** | Todo evento recebido vira registro, inclusive o rejeitado |

### 8.2 Validação por fornecedor

Os dois usam modelos diferentes, e o chassi suporta ambos (D-52):

| | Escavador | Trello |
|---|---|---|
| Método | Segredo compartilhado no cabeçalho `Authorization` | Assinatura HMAC-SHA1 do corpo + URL, no cabeçalho `X-Trello-Webhook` |
| Segredo | Token gerado no painel, tela *Callbacks* | Segredo da aplicação |
| Verificação extra | — | Faixa de IP `104.192.142.240/28` (D-39) |
| Anti-laço | Não se aplica | `X-Trello-Client-Identifier` obrigatório em toda escrita (D-40) |
| Retentativa do fornecedor | Sim — o painel conta as tentativas | 3 tentativas: 30 s, 60 s, 120 s |

O `X-Trello-Client-Identifier` merece a ênfase que o mapeamento já dava: sem ele, nossa escrita no Trello dispara webhook, que aciona nossa automação, que escreve de novo — laço infinito, vazão esgotada e cards bagunçados. Está no chassi desde o primeiro dia, não como melhoria posterior.

### 8.3 Idempotência

*Idempotência* é a propriedade de receber a mesma mensagem duas vezes e produzir um efeito só. É obrigatória aqui porque os dois fornecedores reentregam.

A chave de deduplicação é construída pelo receptor, com o identificador do evento quando existe e um resumo criptográfico do conteúdo quando não existe. A tabela `evento_callback` guarda a chave com restrição de unicidade — a segunda entrega é reconhecida pelo banco, não por lógica que alguém pode esquecer de escrever.

### 8.4 Reconciliação e silêncio

Duas rotinas periódicas, e ambas existem por causa de um risco registrado:

**Reconciliação** — as duas APIs oferecem listar callbacks, marcar recebidos e reenviar. Uma rotina periódica fecha a janela de evento perdido **sem repetir chamada paga**. É a diferença entre descobrir que faltou um evento e descobrir que faltou um prazo.

**Detecção de silêncio** — se nenhum evento chega em janela esperada, o administrador é alertado (RF-15). Vale para os dois lados:

- No Trello, um webhook quebrado sobrevive **30 dias e mais de 1.000 falhas** antes de ser desativado — semanas perdendo evento sem sinal (R-18). O receptor verifica periodicamente `consecutiveFailures` e `active`.
- No Escavador, silêncio pode significar monitoramento removido por engano (R-14) — que é a realização do pior risco do projeto, a perda de prazo.

**Silêncio nunca é interpretado como "nada aconteceu".** É a regra que separa uma automação confiável de uma que só parece funcionar.

---

## 9. Esquema de dados

Três blocos: governança (já esboçado em `04` §2), chassi (novo) e vigilância (novo). O que depende de D-07 e D-09 está marcado 🚧 e fica para a Parte II.

### 9.1 Governança

| Tabela | Campos essenciais |
|---|---|
| `usuario` | `id` · `nome` · `email` · `papel` · `numero_oab` · `areas` · `status` · `mfa_habilitado` · `criado_em` · `desligado_em` |
| `identidade_externa` | `id` · `usuario_id` · `provedor` · `identificador_externo` · `verificada_em` · `revogada_em` |
| `sessao` | `id` · `usuario_id` · `inquilino_id` · `canal` · `perfil` · `escopos` · `sujeitos_autorizados` · `emitida_em` · `expira_em` · `revogada_em` |
| `cliente` | `id` · `nome` · `tipo` · `documento` · `status` |
| `vinculo_canal_cliente` | `id` · `cliente_id` · `canal` · `identificador` · `verificado_em` · `verificado_por` · `revogado_em` |
| `processo` | `id` · `numero_cnj` · `cliente_id` · `advogado_responsavel_id` · `area` · `status` · `sigiloso` |
| `aprovacao` | `id` · `faixa` · `acao_proposta` · `conteudo_proposto` · `conteudo_final` · `solicitante` · `aprovador_id` · `papel_exigido` · `status` · `criada_em` · `expira_em` · `decidida_em` · `justificativa` |
| `evento_auditoria` | `id` · `momento` · `requisicao_id` · `usuario_id` · `papel` · `canal` · `sessao_id` · `acao` · `recurso` · `parametros_resumidos` · `resultado` · `custo_centavos` · `aprovacao_id` · `origem_ip` |
| `consumo` | `id` · `evento_auditoria_id` · `fornecedor` · `operacao` · `custo_centavos` · `usuario_id` · `cliente_id` · `processo_id` · `cache_hit` |
| `orcamento` | `id` · `escopo` · `referencia` · `periodo` · `limite_centavos` · `consumido_centavos` · `reservado_centavos` · `estado` |

Duas mudanças em relação a `04` §2, ambas vindas do chassi: `sessao` ganhou `inquilino_id` e `perfil`; `orcamento` ganhou `reservado_centavos`, sem o qual a reserva de §6.2 não existe.

Restrição que sustenta a Regra 7 e o R-11: **um `identificador_externo` pertence a um único usuário por provedor.** É o que impede uma conta compartilhada de ser aceita em silêncio pelo sistema.

### 9.2 Tabelas do chassi

| Tabela | Campos essenciais | Para quê |
|---|---|---|
| `inquilino` | `id` · `nome` · `status` · `configuracao` | Multi-inquilino desde o início (§7.2 de `01`) |
| `credencial_inquilino` | `id` · `inquilino_id` · `fornecedor` · `referencia_cofre` · `expira_em` · `rotacionada_em` · `status` | Aponta para o cofre. **Nunca guarda o segredo** |
| `catalogo_preco` | `id` · `fornecedor` · `rota` · `classificacao` · `preco_centavos` · `unidade` · `adicional_centavos` · `lido_em` · `fonte` | Espelho do arquivo versionado (§6.1) |
| `custo_observado` | `rota` · `media_movel_centavos` · `amostras` · `atualizado_em` | Estimativa aprendida das respostas reais (D-33) |
| `reserva_orcamento` | `id` · `requisicao_id` · `orcamento_id` · `estimado_centavos` · `real_centavos` · `estado` · `criada_em` · `reconciliada_em` | Reserva antes, reconciliação depois |
| `assinatura` | `id` · `fornecedor` · `tipo` · `alvo` · `frequencia` · `custo_mensal_centavos` · `criado_por` · `criado_em` · `estado` · `removido_em` · `ambiente` | Custo recorrente visível (D-32, R-13) |
| `tarefa_assincrona` | `id` · `fornecedor` · `tipo` · `identificador_externo` · `requisicao_id` · `solicitada_por` · `estado` · `concluida_em` · `resultado_ref` | Liga o pedido ao callback que volta |
| `evento_callback` | `id` · `fornecedor` · `chave_evento` (única) · `tipo` · `recebido_em` · `origem_valida` · `tentativas` · `payload_ref` · `processado_em` · `estado` | Idempotência e depuração |
| `cache_entrada` | `chave` · `inquilino_id` · `tipo_dado` · `conteudo` · `obtido_em` · `expira_em` · `custo_origem_centavos` · `negativo` | Cache, inclusive negativo |

`custo_origem_centavos` guarda **quanto custou o dado que está em cache**. É o que permite responder à pergunta que justifica todo o mecanismo: *quanto o cache economizou este mês?*

### 9.3 Base interna de vigilância

Este bloco implementa D-63 — o agente do cliente lê daqui, não da API paga. É também o que faz o alerta de prazo existir independentemente de qualquer agente estar no ar.

| Tabela | Campos essenciais |
|---|---|
| `item_vigiado` | `id` · `tipo` (`oab` · `nome` · `documento` · `processo`) · `valor` · `assinatura_id` · `criado_por` · `criado_em` · `ativo` · `desativado_em` · `desativado_por` |
| `publicacao` | `id` · `fonte` · `origem_diario` · `data_publicacao` · `numero_cnj` · `teor` · `itens_vigiados` · `hash` (único) · `recebida_em` · `evento_callback_id` |
| `movimentacao` | `id` · `numero_cnj` · `data` · `teor` · `fonte` · `hash` (único) · `recebida_em` · `evento_callback_id` |
| `alerta` | `id` · `tipo` · `prioridade` · `publicacao_id` · `movimentacao_id` · `processo_id` · `indicio_de_prazo` · `enviado_em` · `destinatarios` · `lido_por` · `lido_em` · `escalado_em` · `resolvido_em` |

Quatro observações de desenho, e cada uma corresponde a um requisito do PRD:

**`hash` único em `publicacao` e `movimentacao`** — a mesma publicação pode chegar por dois caminhos (monitoramento de OAB e monitoramento de processo). Sem deduplicação, o advogado recebe o mesmo alerta duas vezes e passa a ignorar alertas. Ruído destrói a confiança que o produto depende de ter.

**`indicio_de_prazo` é um sinalizador, não uma data** — RF-11 e D-64. A plataforma sinaliza indício; quem conta prazo é advogado. Não existe campo `prazo_calculado` neste esquema, e a ausência é deliberada.

**`lido_por` e `lido_em` existem porque RF-13 exige confirmação de leitura** — e `escalado_em` porque alerta não lido escala. O prazo da escalada é configuração, e é ele que depende do escritório (pergunta 12).

**`item_vigiado.desativado_por` e `desativado_em`** — desligar vigilância é a operação de maior potencial de dano silencioso do projeto (R-14). Quem desligou e quando fica registrado, e a remoção é ferramenta separada com confirmação explícita (D-29).

### 9.4 Regras de esquema

1. **`evento_auditoria` é append-only** (só aceita inserção — nunca alteração nem remoção), inclusive por administrador. É imposto por permissão no banco, não por disciplina da aplicação.
2. **Auditoria não vive no histórico de execução do n8n** (RNF-08). Fluxo é efêmero; prova não é.
3. **Parâmetros resumidos, nunca íntegra de dado sensível.** A auditoria prova o que aconteceu; não é cópia do acervo.
4. **Toda tabela com dado de cliente tem `inquilino_id`**, e a consulta é filtrada por ele no chassi — não na aplicação que chama.

---

## 10. Taxonomia de erros

O chassi traduz erro de fornecedor para erro interno acionável. A tradução é única, e é o que permite ao agente reagir igual a problemas equivalentes de sistemas diferentes.

| Fornecedor | Situação | Código interno | Repete? | `acao_sugerida` |
|---|---|---|---|---|
| Ambos | Token inválido ou revogado (401) | `credencial_invalida` | **Nunca** | `escalar_humano` |
| Escavador | Sem saldo (402) | `saldo_esgotado` | **Nunca** | `escalar_humano` |
| Ambos | Não encontrado (404) | `nao_encontrado` | Não | `desistir` — resposta vazia legítima, vai para cache negativo |
| Escavador | Validação (422) | `parametro_invalido` | Não | `corrigir_parametro`, com o campo problemático |
| Ambos | Vazão (429) | `vazao_excedida` | Sim, com recuo exponencial | `tentar_novamente` |
| Trello | Limite de banco do token | `consulta_pesada` | Sim, dividida | `corrigir_parametro` — pedir menos por vez |
| Ambos | Falha transitória (5xx) | `fornecedor_indisponivel` | Sim, com teto | `usar_cache` |
| Interno | Escopo ausente | `nao_autorizado` | Não | `escalar_humano` — mensagem indistinguível de `nao_encontrado` |
| Interno | Orçamento no teto | `orcamento_esgotado` | Não | `pedir_aprovacao` ou `usar_cache` |

Dois erros merecem destaque porque são os que mais costumam ser tratados errado:

**402 do Escavador — sem saldo — nunca é transitório.** Repetir não resolve, e cada tentativa aparece no histórico como ruído. Ele aciona o disjuntor e devolve erro acionável. É a interseção exata entre a Regra 5 (falha fecha) e a Regra 6 (custo é requisito).

**404 do Trello é ambíguo de propósito** — pode significar "não existe" ou "seu token não enxerga". O Trello não distingue, e **o chassi não tenta adivinhar**. Adivinhar aqui seria construir um oráculo de existência de objetos, exatamente o que §10.3 das diretrizes proíbe.

---

## 11. Vazão e resiliência

O controle de vazão fica **no servidor MCP**, não no consumidor (RNF-12). O motivo é que o limite é da conta, não do usuário: dois fluxos n8n bem-comportados isoladamente estouram o limite juntos.

| Fornecedor | Limite | Balde |
|---|---|---|
| Escavador | 500 req/min, por conta | Um balde por inquilino |
| Trello | 300 req/10 s, por chave | Balde da chave |
| Trello | 100 req/10 s, por token | Balde do token |
| Trello | 100 req/900 s em `/search`, `/members` | **Balde próprio** — o mais restritivo e o mais fácil de esgotar (R-19) |

*Balde* aqui é a imagem usual: um recipiente que enche a cada requisição e vaza a uma taxa constante. Quando enche, a chamada espera em vez de falhar.

Três comportamentos obrigatórios:

**Recuo exponencial com variação aleatória.** No Trello, acima de 200 respostas 429 na chave, **tudo** vira 429 até o fim da janela — insistir piora. A variação aleatória evita que várias tentativas retomem no mesmo instante e recriem o pico.

**Preferir aninhamento a iteração.** O Trello permite trazer quadro e cards numa requisição só, e agrupar até 10 leituras em lote. Com 100 req/10 s por token, iterar 200 cards individualmente já estoura o limite — não é otimização, é a diferença entre funcionar e não funcionar.

**Nunca usar espera síncrona.** O parâmetro `wait` da V1 do Escavador bloqueia a conexão esperando o tribunal responder. Toda operação assíncrona segue o padrão solicitar → identificador → callback (RNF-10).

---

## 12. Observabilidade

**Correlação por `requisicao_id`.** Um identificador nasce no canal, atravessa n8n, Policy Gate, servidor MCP, SDK, auditoria e volta no callback. É o que permite reconstruir uma operação inteira a partir de qualquer ponta — inclusive meses depois, que é quando a pergunta costuma aparecer.

**Cada chamada emite:** consumidor, sessão, papel, ferramenta, rota, latência, resultado, origem (cache ou API), custo estimado, custo real e estado do orçamento.

**Métricas mínimas da fundação:**

| Métrica | Por que ela e não outra |
|---|---|
| Taxa de acerto de cache | Mede diretamente o dinheiro economizado |
| Custo por consulta e por cliente | Torna o gasto repassável e revela uso atípico |
| Recusas por escopo | Sobe = configuração errada ou tentativa indevida. Ambos exigem olhar |
| Latência por ferramenta | Onde o agente trava |
| Eventos recebidos por dia | Queda a zero é a assinatura de vigilância quebrada |
| Assinaturas ativas e compromisso mensal | O custo que ninguém vê crescer |

**O painel do Escavador é instrumentação gratuita e complementar.** *Histórico das Requisições* filtra por token; *Histórico de Callbacks* mostra payload e tentativas; *Uso dos Créditos* dá o custo médio por requisição. É a nossa conferência independente — e foi o que permitiu, em 20/08, levantar preço e comportamento sem gastar um centavo.

---

## 13. Segurança do chassi

O ponto de partida é o achado mais desconfortável dos dois mapeamentos, e ele vale repetir aqui:

> **Nenhuma das duas APIs de destino oferece segunda barreira.** O token do Trello vê a conta inteira (R-16); o token do Escavador alcança toda a superfície da API da organização, incluindo as rotas de certificado digital (R-24). **O código do `mcp-core` é a única fronteira. Não há rede embaixo.**

Daí decorre tudo nesta seção.

| Controle | Regra |
|---|---|
| **Segredos** | Em cofre ou variável de ambiente. Nunca em repositório, documento, prompt ou nó do n8n |
| **Um token por aplicação** | Não dá privilégio menor, mas dá atribuição e revogação isolada (D-51) |
| **Expiração e rotação** | Máximo de 1 ano no Escavador — o painel já cobra data; rotação registrada em `credencial_inquilino` |
| **Playground desligado** | Todo token de produção do Escavador é criado com Playground = Não |
| **Credencial nunca é parâmetro** | Usuário, senha de tribunal e `certificado_id` são resolvidos pelo servidor a partir do cofre. Um agente não pode informar nem descobrir credencial |
| **Superfície proibida** | Rotas de certificado digital fora de todo perfil, inclusive `full` (D-30, RNF-15) |
| **Conteúdo externo** | Sanitizado e delimitado antes de chegar ao agente. Instrução encontrada em conteúdo externo **nunca** é executada (RN-13) |
| **Revisão de segurança dedicada** | O `mcp-core` é auditado como fronteira, com atenção especial às etapas 5 e 6 do pipeline |

Sobre a delimitação de conteúdo externo, que é o tratamento de injeção de prompt: e-mail, anexo e mensagem de cliente chegam ao agente **marcados como dados**, dentro de fronteiras explícitas, e o agente que os lê **não tem poder de ação**. Quem age é outro agente, com escopo próprio, que recebe da etapa anterior um resultado estruturado — nunca o texto bruto. É a separação de privilégio de §10.2 das diretrizes, aplicada no desenho e não no prompt.

E vale a consequência que ninguém gosta de escrever, mas que é honesta: **o `mcp-core` concentra o risco.** Um defeito nele atinge os dois servidores, todos os papéis e todos os inquilinos. É o preço de ter uma fronteira só — e é preferível a ter cinco fronteiras, das quais três estarão desatualizadas. O tratamento é a suíte de testes de §14 e a revisão dedicada. Registrado como **R-26**.

---

## 14. Testes e critério de aceite da fundação

### 14.1 A suíte que não pode faltar

| Suíte | O que verifica | Por que é obrigatória |
|---|---|---|
| **Matriz de escopo** | Toda combinação papel × ferramenta × abrangência, esperando permitido ou negado | É a prova de que a Regra 1 vale. Sem ela, o privilégio é intenção, não fato |
| **Recusa não gasta** | Chamada negada por escopo ou abrangência **não** aciona o cliente HTTP | RF-07 tem duas metades: não vazar e não pagar |
| **Disjuntor** | `normal` → `alerta` → `bloqueado`, com degradação para cache e exigência de aprovação | RN-16 — não parar em silêncio, não seguir gastando |
| **Reserva concorrente** | Dez chamadas simultâneas contra orçamento insuficiente: só as que cabem passam | O modo de falha mais caro do motor de custo (§6.2) |
| **Idempotência** | O mesmo callback entregue três vezes produz um efeito | Os dois fornecedores reentregam |
| **Cache** | Validade por tipo, invalidação por evento, cache negativo, isolamento entre inquilinos | Isolamento entre inquilinos é teste de vazamento, não de desempenho |
| **Tradução de erro** | Cada erro de fornecedor vira o código interno certo, com `repetivel` correto | 402 tratado como transitório queima saldo em laço |
| **Contrato** | Requisição e resposta conferem com o formato real da API | Detecta mudança do fornecedor antes que ela vire incidente |

### 14.2 Como testar sem gastar crédito

**CI nunca chama a API real.** *CI* (integração contínua — a rotina automática que roda os testes a cada mudança) roda contra **gravações**: respostas reais capturadas uma vez, anonimizadas e versionadas em `testes/gravacoes/`.

| Regra | Motivo |
|---|---|
| Uma resposta real é gravada **uma vez** e reusada para sempre | D-48 — nenhuma chamada é repetida |
| A gravação é anonimizada antes de versionada | RNF-14 e LGPD — dado de cliente não entra em repositório |
| Atualizar gravação é ato deliberado, com registro no orçamento | Uma atualização automática seria um laço de gasto disfarçado de teste |

**Consequência importante para o planejamento:** toda a fundação — chassi, motor de custo, cache, receptor, auditoria — pode ser **construída e testada sem gastar um centavo**. O crédito só é necessário na verificação final ponta a ponta, e ela já está orçada em `06-orcamento-de-chamadas-escavador.md` (Bloco A, R$ 0,05).

### 14.3 Critério de aceite da fundação

A Fase 3 encerra quando **uma chamada atravessa tudo e deixa rastro**. Concretamente:

- [ ] Uma pessoa identificada nominalmente faz uma pergunta pelo canal interno
- [ ] O Policy Gate resolve identidade, concede escopos e emite sessão de vida curta
- [ ] O servidor MCP recusa a mesma pergunta feita por quem não tem escopo, **sem chamar a API**
- [ ] A consulta autorizada executa, e a resposta traz origem, idade e custo
- [ ] A repetição da mesma consulta é servida do cache, com custo zero e idade informada
- [ ] O gasto aparece atribuído à pessoa, ao cliente e ao processo
- [ ] Um callback recebido invalida o cache daquele processo e alimenta a base interna
- [ ] O mesmo callback entregue de novo não duplica nada
- [ ] O disjuntor, forçado ao teto, degrada para cache e exige aprovação
- [ ] Tudo isso é reconstruível pelo `requisicao_id`, meses depois

---

## 15. Sequência de construção

Ordem deliberada — cada marco termina em algo verificável, e nenhum depende de resposta do escritório.

| # | Marco | Termina quando | Depende de |
|---|---|---|---|
| 1 | Esqueleto do monorepo, esquema do banco, migrações | O banco sobe do zero com um comando | Nada |
| 2 | `dominio` e `mcp-core` sem rede: sessão, escopo, abrangência, erro, envelope | A matriz de escopo passa inteira | 1 |
| 3 | Auditoria e consumo | Recusa e sucesso geram registro reconstruível | 2 |
| 4 | Motor de custo: catálogo, estimativa, reserva, reconciliação, disjuntor | Reserva concorrente e disjuntor passam | 3 |
| 5 | Cache com validade por tipo, invalidação, cache negativo, isolamento | Suíte de cache passa | 4 |
| 6 | `sdk-escavador` sobre gravações, com V1 e V2 no mesmo chassi | Testes de contrato passam sem chamar a API | 5 |
| 7 | Servidor MCP do Escavador com as 15 ferramentas e os perfis | Ferramentas respondem no envelope padrão, por perfil | 6 |
| 8 | Receptor de callbacks e base interna de vigilância | Idempotência e invalidação passam | 5 |
| 9 | Policy Gate com a estrutura de escopos e a configuração de abrangência | Emite sessão válida e nega o que deve negar | 3 |
| 10 | **Verificação ponta a ponta** com uma chamada real | O critério de aceite de §14.3 está inteiro | Token, CNJ real, R$ 0,05 |

Duas escolhas de ordem que merecem justificativa:

**A auditoria vem antes do motor de custo** (marco 3 antes do 4). Custo é um tipo de registro; se a malha de registro não existe, o custo é gravado em algum lugar improvisado e depois migrado. Fazer na ordem inversa é retrabalho garantido.

**O receptor de callbacks (8) não espera o servidor MCP (7).** São caminhos independentes: um recebe evento, o outro atende pergunta. Construir o receptor cedo antecipa a entrega mais valiosa do produto — a vigilância de prazo (E2) — e é ele que alimenta a base que torna o atendimento ao cliente barato.

---

## 16. O que a Parte II precisa, e de quem

| Insumo | De quem | Destrava |
|---|---|---|
| Respostas às perguntas 16a–16c (conta compartilhada) | Escritório | RF-01, aprovação nominal, faixa A4 |
| **D-07** — carteira ou base inteira | Escritório | Matriz definitiva de escopos |
| **D-09** — Trello fonte da verdade ou visualização | Escritório | Modelagem da demanda e da sincronização |
| Perguntas 26 e 27 — campos personalizados e Butler | Escritório | Qualquer escrita no Trello |
| Pergunta 12 — prazo de escalada | Escritório | Configuração do rito de alerta |
| **P-06** — preços de catálogo ou limitados pelo bônus | Suporte Escavador | Confirmação do §6, sem reescrita |
| "Até 200 itens": termos ou aparições? | Suporte Escavador | Dimensionamento da vigilância (D-62) |
| Acesso à instância n8n | Usuário/escritório | §12.2 de `01` e os fluxos |
| Número CNJ real | Escritório | Marco 10, verificação ponta a ponta |

---

## 17. Decisões que este documento propõe

| # | Decisão | Recomendação |
|---|---|---|
| **D-68** | Monorepo em TypeScript com pacote `mcp-core` compartilhado, PostgreSQL como única persistência, cache no próprio banco até que o volume justifique outra coisa | Adotar |
| **D-69** | A sessão MCP é **token assinado de vida curta** emitido pelo Policy Gate e validado offline pelo servidor, com lista de revogação consultada a cada chamada; **faixa A4 reconsulta o Policy Gate** | Adotar |
| **D-70** | Toda ferramenta devolve o **envelope padrão** `dados` + `meta` + `avisos`, com origem, idade e custo obrigatórios; erro devolve código interno, mensagem ao agente e `acao_sugerida` | Adotar |
| **D-71** | O **catálogo de preços é dado versionado** com classificação `cobrada`/`gratuita`/`desconhecida`, unidade de cobrança, data de leitura e fonte. Preço nunca aparece literal no código | Adotar |
| **D-72** | O orçamento opera por **reserva antes e reconciliação depois**; sem reserva concedida a chamada não sai, e rotas por bloco reservam pelo **pior caso permitido**, não pela média | Adotar |
| **D-73** | "Recurso escasso" é **uma abstração só** — crédito no Escavador, vazão no Trello — com um único mecanismo de reserva, degradação e disjuntor | Adotar |
| **D-74** | Resposta "não encontrado" vai para **cache negativo de 1 hora**, para que agente que erra não pague repetidamente pela mesma resposta vazia | Adotar |
| **D-75** | Um **`requisicao_id`** nasce no canal e atravessa n8n, Policy Gate, MCP, SDK, auditoria e callback — toda operação é reconstruível por ele | Adotar |
| **D-76** | A **base interna de vigilância** (publicações, movimentações e alertas), alimentada pelo receptor de callbacks, é a fonte de leitura do agente do cliente. Implementa D-63 | Adotar |
| **D-77** | A auditoria é **síncrona ao ato**, em banco próprio, com append-only imposto por permissão no banco. **Auditoria indisponível bloqueia a operação** — falha fecha também aqui | Adotar |
| **D-78** | A **matriz de escopo** (papel × ferramenta × abrangência) é critério de aceite da fundação, e **a CI nunca chama a API real** — testes rodam sobre gravações anonimizadas, atualizadas só por ato deliberado | Adotar |

---

## 18. Riscos que este documento levanta

| # | Risco | Impacto | Tratamento |
|---|---|---|---|
| **R-26** | O `mcp-core` concentra a fronteira de segurança: um defeito nele atinge os dois servidores, todos os papéis e todos os inquilinos | **Grave** — raio de dano máximo | Revisão de segurança dedicada, matriz de escopo como critério de aceite (D-78), dependência de mão única (§3) |
| **R-27** | A validação offline da sessão cria janela entre revogar e expirar | Moderado | Sessão de minutos, lista de revogação a cada chamada, A4 reconsultando o Policy Gate (D-69) |
| **R-28** | A reserva por estimativa pode subestimar o custo real nas rotas por bloco — o excedente só aparece na reconciliação, com o dinheiro já gasto | Financeiro | Reserva pelo pior caso permitido, teto de blocos por papel, contar antes de listar (D-72, D-58) |

---

## 19. Próximo passo

Esta Parte I precisa de **aval** — em bloco ou com ressalvas.

Avalizada, o trabalho segue por dois caminhos que não competem entre si:

1. **Construir os marcos 1 a 5** (esqueleto, chassi, auditoria, custo, cache). Nenhum consome crédito do Escavador nem depende do escritório
2. **Levar ao escritório** as cinco perguntas que destravam a Parte II — com destaque para a conta compartilhada, que o PRD já registra como bloqueio de projeto (D-67)

A Parte II é escrita quando essas respostas chegarem. Enquanto não chegarem, ela seria ficção bem formatada.
