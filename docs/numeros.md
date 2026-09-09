# Números do projeto

| Campo | Valor |
|---|---|
| Origem | **Gerado por `ferramentas/contar.mjs`** — não edite à mão |
| Como refazer | `node ferramentas/contar.mjs --escrever` |
| Como conferir | `node ferramentas/contar.mjs --conferir` (o `fechar-ciclo.mjs` e a CI rodam sozinhos) |

> **Este arquivo é a sede única dos números contáveis do projeto.**
> Documento que precise de um número aponta para cá; nenhum documento o copia.
> A regra nasceu da revisão de 09/09, que achou cinco contagens diferentes da
> pilha de decisões — todas datadas do mesmo dia, nenhuma igual ao disco.
>
> Campo com `—` é campo **não medido**, não campo zerado. Provas de banco
> exigem `--com-banco` (PostgreSQL de pé); testes exigem o build em dia.

## Código e banco

| O quê | Quanto |
|---|---|
| Migrações SQL | **13** |
| Tabelas criadas | **23** |
| Tabelas com política por linha | **18** de 23 |
| Pacotes do monorepo | **9** — 4 implementados, 5 ainda casca |
| Testes passando | **116** |
| Provas de regra (exige banco) | **46 de 46** |
| Provas de auditoria (exige banco) | **23 de 23** |
| Linhas versionadas | TypeScript 3752 · SQL 1759 · Node 12958 |

**Pacotes ainda sem uma linha executável:** `packages/sdk-escavador` · `packages/sdk-trello` · `mcp-servers/escavador` · `mcp-servers/trello` · `services/policy-gate`.

## Documentação

| O quê | Quanto |
|---|---|
| Documentos escritos em `docs/` | **22** — sem contar este, que é gerado |
| Requisitos funcionais (RF) | **61** |
| Requisitos não funcionais (RNF) | **19** |
| Riscos registrados (§15) | **83** — o maior é R-83 |

## Decisões (§13 de `01-diretrizes-gerais.md`)

**233 linhas**, e o maior identificador é D-233.

| Estado | Quantas |
|---|---|
| 🟡 Proposta | **191** |
| ✅ Confirmada | **30** |
| ✅ Resolvida | **5** |
| 🔴 Em aberto | **3** |
| ❌ Derrubada / Recusada | **2** |
| 🔄 Revisada | **1** |
| ✅ Feita | **1** |
| **Total** | **233** |

