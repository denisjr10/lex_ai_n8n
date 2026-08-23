# Captura — a única parte do projeto que gasta dinheiro

**Rodar `capturar.mjs --executar` debita crédito real da conta do Escavador, e crédito não volta.**

Esta pasta existe para cumprir quatro regras do projeto que, sem ferramenta, dependeriam de disciplina humana no meio de uma sessão corrida:

| Regra | O que ela exige | Como o script cumpre |
|---|---|---|
| **4** | Uma chamada, um objetivo registrado | Cada chamada da fila carrega seu objetivo escrito, e ele vai para o registro junto com a resposta |
| **5** | Nunca repetir uma chamada já feita | O registro de execução é consultado antes; chamada repetida é pulada |
| **6** | Nada de laço, lote ou varredura | Fila fixa de no máximo 3 itens, em série, sem paginação e sem nova tentativa |
| **8** | Só chamar o que está no orçamento aprovado | O teto e o processo autorizado estão no topo do arquivo; passar deles exige editar o código, e editar o código exige novo aval |

---

## Autorização vigente

| Campo | Valor |
|---|---|
| Concedida em | **21/08/2026** |
| Blocos | **A e B** |
| Teto | **3 chamadas** |
| Processo | **P1 apenas** — TJPB |
| **Não autorizado** | P2 (TJAP). Está no arquivo de processos, mas fora desta autorização |

As três chamadas, na ordem:

| # | Rota | Catálogo | Por que existe |
|---|---|---|---|
| **A1** | `.../envolvidos?limit=20` | R$ 0,05 | Autenticação, envelope, paginação, modelo do envolvido — **e, de graça, a resposta da §1-C** |
| **B1** | `.../numero_cnj/{cnj}` | R$ 3,00 | Modelo do processo: campos, tipos, o que vem nulo na prática |
| **B2** | `.../movimentacoes?limit=20&ordem=desc` | R$ 3,00 | Modelo da movimentação — a peça que dispara prazo |

**A ordem não é decorativa.** A1 é a mais barata da tabela. Se a autenticação estiver errada, ela falha por R$ 0,05 e aborta a fila — as duas caras nunca chegam a acontecer.

## Como rodar

**Ensaio** — mostra o plano, não chama nada, não gasta nada:

```bash
node captura/capturar.mjs
```

**Execução** — gasta de verdade:

```bash
node captura/capturar.mjs --executar
```

## O token

O script procura o token em duas fontes, nesta ordem:

1. Variável de ambiente `ESCAVADOR_TOKEN`
2. Arquivo `captura/token.local`

**Nunca cole o token em chat, em commit ou em mensagem.** Ele é de visualização única — o painel do Escavador não o exibe de novo depois de criado. Se vazar, o caminho é revogar no painel e gerar outro.

O script não imprime o token, nem inteiro nem em pedaço. Ele confirma só o comprimento.

## As travas, em ordem de acionamento

1. **Sem `--executar`, não chama nada.** O padrão é o ensaio
2. **Teto absoluto.** Atingido o número autorizado, recusa
3. **Registro de execução.** Chamada já feita nunca se repete
4. **Dígito verificador do CNJ** conferido antes de gastar — número errado gastaria R$ 3,00 para receber um 404
5. **Uma chamada por vez**, em série
6. **Erro aborta a fila.** Não continua queimando crédito depois de algo dar errado
7. **Sem nova tentativa automática.** Erro é resultado, não acidente — é justamente o que o Bloco D quer observar

## O que fica no disco

| Caminho | O que é | Vai para o Git? |
|---|---|---|
| `processos.local.json` | Os números CNJ reais | ❌ **Não** (D-95) |
| `token.local` | O token, se você escolher o arquivo | ❌ **Nunca** |
| `registro-de-execucao.local.json` | Toda chamada já feita, com custo e HTTP | ❌ Não |
| `respostas-brutas/` | Resposta crua, com todos os cabeçalhos | ❌ Não — contém dado de parte |
| `capturar.mjs`, `LEIA-ME.md` | O código e este texto | ✅ Sim |

A resposta crua guarda **os cabeçalhos inteiros**, e não só o corpo. É neles que vem `Creditos-Utilizados` — o dado que responde qual foi o custo real.

## Depois de rodar — três passos que não gastam nada

1. **Abra *Uso dos Créditos* no painel.** Se A1 debitou 5 centavos, vale a tabela por rota; se debitou 300, o débito durante o bônus é fixo. Isso encerra a §1-C do orçamento **de graça**
2. **Transcreva o registro** para a §5 de [`docs/06-orcamento-de-chamadas-escavador.md`](../docs/06-orcamento-de-chamadas-escavador.md). Resposta não registrada é crédito jogado fora (Regra 4)
3. **Só então** anonimize as brutas para gerar o instantâneo da demo

> **Sobre a anonimização:** ela ainda não está escrita, e isso é de propósito. Não dá para anonimizar com honestidade uma estrutura que ninguém viu. O anonimizador nasce depois da captura, olhando o formato real — e o resultado passa por revisão humana antes de qualquer commit.

## Se algo der errado no meio

O script aborta a fila e grava o que já aconteceu. **Confira *Uso dos Créditos* no painel** antes de rodar de novo: pode ter havido cobrança mesmo em chamada que falhou. O registro de execução já terá anotado as que completaram, e elas não se repetem.
