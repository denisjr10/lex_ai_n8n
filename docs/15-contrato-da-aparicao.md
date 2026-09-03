# O contrato da aparição em diário oficial — medido, enfim

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Data | 2026-09-02 |
| Estado | 🟢 **Medido em 30 entregas reais**, entre 27/08 e 02/09/2026 |
| Fonte | Entregas de callback do Escavador no receptor `OymAtbNYI1pjfWkA`, vigilância `2813617` |
| Custo | **R$ 0,00.** Callback é gratuito, e as entregas continuaram depois de a cota expirar |
| Herda de | `mapeamento-escavador.md` · `06-orcamento-de-chamadas-escavador.md` §5 |

> **Por que este documento existe.** Até 02/09 o projeto acreditava que o contrato da aparição era a peça que **nunca** tinha sido medida — *"conhecida só pelo OpenAPI, que a R-44 manda não tratar como fonte"*, e perdida junto com a cota. Estava errado: ele chegava por callback desde 27/08, e ninguém tinha olhado.

---

## 1. O que aconteceu, e por que passou despercebido

Duas leituras da rota `/api/v1/monitoramentos/{id}/aparicoes` em 27/08 voltaram `items: []`. A conclusão registrada foi *"a vigilância ainda não produziu nada"*.

**Ela estava produzindo.** No mesmo dia 27/08, às 06:02 UTC, o Escavador entregou quatro eventos `diario_movimentacao_nova` no nosso receptor — e seguiu entregando todo dia útil desde então.

> 🔴 **O polling e o callback discordaram, e o polling é que estava errado.** Enquanto não se souber por quê — se `aparicoes` lista outra coisa, se o parâmetro estava errado, ou se há defasagem de indexação —, **a rota de leitura não é fonte confiável para "há publicação nova?"**. Virou R-55.

Isso inverte uma premissa de desenho: o caminho principal para saber de publicação **é o callback**, e o polling é que precisa ser justificado.

---

## 2. O que chegou

| | |
|---|---|
| Entregas totais no receptor | **35** — 33 `autentico`, 2 `RECUSADO` (os testes sem `Authorization` de 26/08) |
| Eventos `diario_movimentacao_nova` | **30** |
| Janela | 27/08 a 02/09/2026 — cinco dias úteis |
| Ritmo | **6,0 por dia útil** |
| Processos distintos | **22** — cinco deles com mais de uma publicação; o mais movimentado, quatro |
| Origens | **DJAP/AP** (26) · **TRT-8/PA** (4) |
| `uuid` distintos | 30 de 30 |
| `movimentacao.id` distintos | 30 de 30 |
| Campos mapeados | **126** |

**26 das 30 são `Intimação`** — a publicação que faz prazo correr, e a razão de ser da frente E2 (D-62).

---

## 3. A forma do evento

```
event                     "diario_movimentacao_nova"
uuid                      string — identificador DA ENTREGA
monitoramento { … }       a vigilância que disparou
movimentacao  { … }       a publicação
  .diario   { … }         o caderno, com as datas
  .processo { … }         o processo vinculado
  .envolvidos [ … ]       partes e advogados
```

### 3.1 Os campos que sustentam a frente de prazo

| Campo | Tipo | Presença | Para que serve |
|---|---|---|---|
| `movimentacao.id` | `number` | 30/30 | **A chave natural.** Estável, do lado do Escavador — é por ela que se deduplica, não pelo `uuid` (ver §4.1) |
| `movimentacao.conteudo` | `string` | 30/30 | O texto publicado. 123 a 14.701 caracteres, mediana **1.059** |
| `movimentacao.diario.data_publicacao` | `string` (AAAA-MM-DD) | 30/30 | **De onde o prazo conta** |
| `movimentacao.diario.data_disponibilizacao` | `string` | 30/30 | Ver o alerta em §4.2 |
| `movimentacao.processo.id` | `number` | 30/30 | O processo, do lado do Escavador |
| `movimentacao.processo.numero_novo` | `string` | 30/30 | **O CNJ** — é por ele que se responde "este processo é nosso?" |
| `movimentacao.processo.is_cnj` | `number` | 30/30 | `1` em todas |
| `movimentacao.envolvidos[]` | `array` | 2 a 16, mediana 3 | Partes e advogados |
| `movimentacao.link_pdf` | `string` | 30/30 | A página do diário |
| `movimentacao.pagina` | `number` | 30/30 | Onde no caderno |

### 3.2 Vocabulários fechados observados

| Campo | Valores nas 30 amostras |
|---|---|
| `event` | `diario_movimentacao_nova` |
| `monitoramento.tipo` | `TERMO` |
| `monitoramento.api` | `SIM` |
| `monitoramento.desativado` | `NAO` |
| `movimentacao.diario.origem.sigla` | `DJAP` · `TRT-8` |
| `movimentacao.diario.origem.estado` | `AP` · `PA` |
| `movimentacao.diario.origem.categoria` | `Diários do Judiciário` · `Tribunais Regionais do Trabalho` |
| `movimentacao.diario.tipo_exibicao` | `MOVIMENTACOES` |
| `movimentacao.diario.atena_status` | `INDEXED` · `NOT_INDEXED` |
| `movimentacao.envolvidos[].envolvido_tipo` | `Polo Ativo` · `Polo Passivo` · `Advogado` |

### 3.3 Campos que existem e nunca trouxeram nada

Nas 30 amostras, sempre nulos ou vazios: `movimentacao.subtipo`, `movimentacao.complemento`, `movimentacao.subprocesso`, `movimentacao.letras_processo`, `movimentacao.texto_categoria` (string vazia), `monitoramento.variacao_principal`, `monitoramento.processo_id`, `movimentacao.envolvidos[].advogado_de`.

> ⚠️ **`advogado_de` é o mais tentador e o mais perigoso.** O nome promete exatamente o que a frente de prazo precisa — qual parte cada advogado representa —, e ele veio **vazio nas 48 ocorrências de advogado**. Código que contar com ele funciona no teste que alguém escrever à mão e falha contra o dado real.

---

## 4. Três achados que mudam desenho

### 4.1 🔴 O `uuid` identifica a ENTREGA, não a publicação

30 `uuid` distintos para 30 publicações distintas — o que **não prova nada** sobre reentrega, porque nenhuma foi reentregue nesta janela.

E já se sabe, do Bloco C, que **o `uuid` do Escavador não serve como chave de idempotência** (`06-orcamento…` §5.6). A leitura conjunta é:

> Deduplicar por **`movimentacao.id`**, que é a identidade da publicação. O `uuid` serve para correlacionar uma entrega específica no log, e para mais nada.

### 4.2 🔴 `data_disponibilizacao == data_publicacao` nas 30 — e isso **não** é uma regra

Nos cinco dias medidos, os dois campos vieram sempre iguais. É uma observação sobre **dois tribunais em cinco dias**, não um contrato.

No processo civil os dois conceitos são distintos e a diferença é justamente onde o prazo mora: publica-se no dia útil seguinte ao da disponibilização, e o prazo começa do dia útil seguinte ao da publicação. Tribunal que separe os dois — e há muitos — produziria evento em que os campos diferem.

> **Nenhum cálculo de prazo deve tratar os dois campos como intercambiáveis.** A igualdade observada é coincidência de amostra, e tratá-la como contrato erraria por um dia — que é o erro que perde prazo. Virou **R-56**.

### 4.3 🔴 Existem **três** vocabulários para "quem é parte", e a D-132 só conhecia um

Este é o achado que mais mexe no modelo de dados.

| Origem | Campo | Valores |
|---|---|---|
| Importador de autos em PDF | — | `RECLAMANTE` · `RECLAMADO` (D-135) |
| API V2, `/processos/.../envolvidos` | `tipo_normalizado` | `Autor` · `Réu` · `null` (D-132) |
| **Callback do diário** | **`envolvido_tipo`** | **`Polo Ativo` · `Polo Passivo` · `Advogado`** |

A **D-132** concluiu, do Bloco E, que *"não há tabela de tradução a construir"*. Aquilo continua verdadeiro **dentro da V2**, entre ramos da Justiça — e é falso **entre fontes**. O evento de diário não traz `tipo_normalizado`: traz vocabulário próprio, e ainda em duplicata (`pivot_tipo` é o mesmo valor em maiúsculas).

> A tabela de tradução existe, é obrigatória, e o eixo dela é **a fonte**, não o tribunal.

E há uma assimetria que o modelo precisa acomodar: o diário classifica **advogado como um tipo de envolvido** (48 das 100 ocorrências), enquanto a V2 separa parte de advogado. Achatar os dois num campo só perde a distinção.

---

## 5. O que isso custa, e o que renova

As entregas são **gratuitas** — confirmado pela medição de 26/08 e reconfirmado agora: **13 das 30 chegaram em 01/09 e 02/09, com a cota já expirada.** Callback não depende de saldo.

O que custa é a **assinatura da vigilância**, `2813617`, que segue `desativado: "NAO"` e **renova em 26/09**.

> Isso dá contorno a uma decisão em aberto. A vigilância não é um resíduo de teste a ser removido: **é a única fonte viva do contrato mais importante do projeto**, e está entregando ~6 publicações reais por dia útil, de 22 processos. Removê-la é decisão sobre a frente de prazo, não faxina.

---

## 6. 🔴 O que se faz com o evento hoje: **nada**

O receptor tem dois nós — webhook e um `Code` que confere o token e carimba. **Não grava em banco, não enfileira, não escreve arquivo.** O evento existe num lugar só: o histórico de execução do n8n.

Que é exatamente onde a **RNF-08** diz que ele não pode viver: *"fluxo é efêmero, prova não é."*

A instância retém execuções há ~302 dias (a mais antiga é de 04/11/2025), então **não há perda em curso** — a urgência é menor do que parece à primeira vista. Mas a retenção é configuração, não garantia, e o repositório já tem comando para repor a demo *"depois que a instância expira"*. As 30 amostras foram copiadas para `captura/respostas-brutas/callback-execucoes.local.json`, fora do Git, e essa é hoje a **única cópia fora do n8n**.

---

## 7. Para que serve, marco a marco

| Marco | O que estas 30 amostras destravam |
|---|---|
| **4 — custo** | Confirma um caminho de **custo zero** para a informação mais valiosa. Muda a conta: nem toda leitura de publicação precisa passar pelas rotas de R$ 2,95 |
| **5 — cache** | Volume e forma reais para dimensionar: 6/dia, mediana de 1.059 caracteres, 22 processos, cinco deles repetindo na janela |
| **6 — SDK** | Contrato medido em vez de OpenAPI, que a R-44 manda não tratar como fonte |
| **7 — receptor** | O `movimentacao.id` como chave de idempotência, e as 126 posições de campo para o esquema de gravação |
| **E2 — prazo** | **26 intimações reais com o texto íntegro.** É o conjunto contra o qual se constrói e se afere qualquer detecção de indício de prazo — e, sem saldo, não há outra forma de obtê-lo |
| **D-145 — a quem alertar** | `envolvidos[].oab` chega preenchida (52 ocorrências), o que permite rotear o alerta pelo advogado da publicação |

---

## 8. Decisões que este documento propõe

| # | Decisão |
|---|---|
| **D-177** | O callback é o caminho **primário** para saber de publicação nova; o polling de `aparicoes` não é fonte confiável enquanto a divergência não for explicada |
| **D-178** | Deduplicar publicação por **`movimentacao.id`**, nunca pelo `uuid` da entrega |
| **D-179** | `data_disponibilizacao` e `data_publicacao` são tratadas como campos **distintos**, mesmo tendo vindo iguais nas 30 amostras |
| **D-180** | **Existe tabela de tradução de tipo de envolvido, e o eixo é a fonte** — corrige o alcance da D-132 |
| **D-181** | O receptor precisa **persistir** o evento antes de responder; histórico de execução do n8n não é armazenamento (RNF-08) |
| **D-182** | A vigilância `2813617` **não é resíduo de teste** — é a fonte viva do contrato de prazo, e removê-la é decisão sobre a frente E2 |
