# Contrato do instantâneo — o que os fluxos da demo leem

| Campo | Valor |
|---|---|
| Versão do contrato | **2** |
| Data | 2026-08-24 |
| Produzido por | [`captura/anonimizar.mjs`](../captura/anonimizar.mjs), a partir da API **ou** de [`captura/importar-autos.mjs`](../captura/importar-autos.mjs) |
| Consumido por | Os fluxos do n8n da Demo A (Telegram) e da Demo B (WhatsApp) |

> Este arquivo é a fronteira entre a captura e a demonstração. Enquanto ele não mudar, **trocar dado fictício por dado real não altera uma linha dos fluxos**.

---

## 1. Por que existe um contrato

A resposta da API do Escavador tem centenas de campos aninhados. O agente da demo precisa de umas duas dezenas. Se os fluxos do n8n lessem a resposta crua, três coisas ruins aconteceriam:

1. **A demo dependeria do formato da API.** Qualquer mudança lá quebraria a apresentação
2. **Os fluxos ficariam ilegíveis** — `$json.fontes[0].capa.assunto_principal_normalizado.nome` não se lê nem se corrige na véspera
3. **Dado pessoal circularia sem necessidade** — CPF e OAB não têm papel nenhum na demo, e o que não entra não vaza

O instantâneo resolve os três de uma vez: é pequeno, é plano, e já vem anonimizado.

## 2. Os dois arquivos

| Arquivo | Origem | Vai para o Git? |
|---|---|---|
| `instantaneo/ensaio.json` | Exemplos oficiais da documentação do Escavador | ✅ **Sim** — é fictício |
| `instantaneo/processos.json` | Captura real, anonimizada | ❌ **Não** — é dado de cliente |

Os fluxos leem **um dos dois**, e o campo `origem` diz qual:

| `origem` | Significa |
|---|---|
| `ensaio-ficticio` | Dado inventado. O agente **precisa** avisar isso na resposta |
| `escavador-v2` | Dado real de processo, vindo da API, anonimizado |
| `autos-fornecidos` | Dado real, extraído dos **autos em PDF** entregues pelo escritório, anonimizado. A linha do tempo vem da tabela *Documentos* do PJe, não de andamentos da API — é mais pobre em texto e mais fiel em datas |

Há ainda um campo booleano no topo, `nomes_reais`:

| `nomes_reais` | Significa |
|---|---|
| `false` (padrão) | Nomes de parte e advogado substituídos por pseudônimos estáveis; número CNJ pseudonimizado |
| `true` | Nomes e número **verdadeiros**, por decisão informada do escritório (D-97). CPF, CNPJ, OAB, e-mail e telefone continuam redigidos |

> Com `nomes_reais: true` o instantâneo passa a ser dado pessoal de cliente em texto claro, e cada pergunta o envia ao provedor de IA. Só existe com aval explícito, e o arquivo nunca entra no Git.

> **Essa distinção é obrigatória, não decorativa.** Um ensaio apresentado como dado real é a pior falha possível numa demonstração para advogado: o escritório tomaria decisão sobre um processo que não existe. O fluxo deve exibir um aviso visível sempre que `origem` for `ensaio-ficticio`.

## 3. Estrutura

```json
{
  "versao_do_contrato": 1,
  "origem": "ensaio-ficticio",
  "aviso": "texto explicando a natureza dos dados",
  "processos": [ { ... } ]
}
```

### Cada processo

| Campo | Tipo | Observação |
|---|---|---|
| `id` | texto | Apelido interno — `ENSAIO-1`, `P1`. É a chave usada nas listas de permissão |
| `numero_cnj` | texto | **Pseudônimo.** Tribunal e ano preservados; sequência trocada e dígito verificador recalculado, então o número continua válido |
| `titulo` | texto | `polo ativo × polo passivo` — pronto para exibir |
| `polo_ativo`, `polo_passivo` | texto | Pseudônimos |
| `tribunal` | objeto | `{ sigla, nome, grau, sistema }` |
| `orgao_julgador` | texto | A vara |
| `classe`, `assunto`, `area` | texto | Classificação processual |
| `situacao` | texto | Ex.: `Baixado`, `INATIVO` |
| `segredo_justica` | booleano | **O fluxo deve recusar exibir conteúdo se for `true`** |
| `valor_causa` | objeto ou nulo | `{ valor, moeda, valor_formatado }` |
| `data_inicio`, `data_ultima_movimentacao` | data | `AAAA-MM-DD` |
| `quantidade_movimentacoes` | número | Total no processo — **maior que o tamanho da lista abaixo** |
| `envolvidos` | lista | Ver adiante |
| `movimentacoes` | lista | As mais recentes primeiro |

### Envolvido

| Campo | Observação |
|---|---|
| `nome` | Pseudônimo estável |
| `papel` | `Requerente`, `Requerido`, `Apelante`, `Juiz`… |
| `polo` | `ATIVO`, `PASSIVO`, `NENHUM` |
| `tipo_pessoa` | `FISICA` ou `JURIDICA` |
| `advogados` | Lista de `{ nome, oab }`. A OAB vem como `"SP [OAB]"` — a UF é útil, o número não |

> **A mesma pessoa aparece mais de uma vez** quando participa em graus diferentes (Requerente no 1º grau, Apelante no 2º). Isso é fiel ao processo, não defeito. Quem exibe é que deve agrupar.

### Movimentação

| Campo | Observação |
|---|---|
| `id` | Identificador do Escavador |
| `data` | `AAAA-MM-DD` |
| `tipo` | Ex.: `ANDAMENTO` |
| `conteudo` | **Texto livre, já redigido** — nomes trocados, CPF/CNPJ/OAB/CNJ substituídos por marcadores |
| `fonte` | Sigla do tribunal |

## 4. O que **não** existe aqui, de propósito

| Ausente | Por quê |
|---|---|
| CPF, CNPJ | Não têm papel na demo. O que não entra não vaza |
| Número real da OAB | A UF basta para dar contexto |
| Número CNJ real | D-95 — a lista de processos do escritório não entra no repositório |
| Documentos, PDFs, autos | Fora do escopo da demo, e R-12 os mantém fora de todo perfil |
| Prazo, cálculo de prazo | **A demo não vigia prazo.** Confiar nela para isso realizaria o R-02 |

## 5. Como regerar

Ensaio, a partir dos exemplos oficiais — não gasta nada:

```bash
node captura/anonimizar.mjs --exemplos
```

Real, a partir da captura — também não gasta nada, porque lê arquivo já baixado:

```bash
node captura/anonimizar.mjs
```

A partir dos autos em PDF — o caminho usado enquanto o saldo do Escavador está bloqueado:

```bash
node captura/importar-autos.mjs
node captura/anonimizar.mjs --autos
```

> **A saída real exige revisão humana antes de qualquer commit.** Redação automática erra: leia o `conteudo` das movimentações procurando nome, endereço ou número que tenha escapado. O anonimizador avisa isso ao terminar.

## 6. Se o contrato mudar

Suba `versao_do_contrato` e anote aqui o que mudou. Os fluxos do n8n devem recusar um instantâneo de versão que não conhecem — **falhar fechado**, como manda a Regra 5 do projeto, em vez de exibir campo errado com confiança.

| Versão | Data | Mudança |
|---|---|---|
| 1 | 2026-08-23 | Primeira versão, derivada dos exemplos oficiais da V2 |
| 2 | 2026-08-24 | Nova `origem` `autos-fornecidos` e campo `nomes_reais`. Nenhum campo de processo mudou — instantâneo da versão 1 continua válido |
