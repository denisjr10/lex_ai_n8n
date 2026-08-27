# `testes/` — e as gravações que os fazem existir

| Campo | Valor |
|---|---|
| Estado | 🟡 Esqueleto — criado no marco 1 |
| Atualizado em | 2026-08-27 |

## O problema que `gravacoes/` resolve

A API do Escavador **cobra por chamada**. Um conjunto de testes que chama a API de verdade é um conjunto de testes que gasta dinheiro a cada execução — e testes existem justamente para rodar muitas vezes.

A saída é a de sempre nesse tipo de projeto: os testes rodam sobre **gravações** — respostas reais, capturadas uma vez, anonimizadas, guardadas em arquivo.

**A CI nunca chama a API real (D-78).** Não é preferência: é o que separa "os testes custam zero" de "os testes custam a cota inteira num dia de muitos commits".

## O que pode entrar aqui

Uma gravação só entra depois de passar por três coisas:

1. **Anonimização.** Nome de parte, documento, número CNJ, nome de advogado e OAB são substituídos. Existe ferramenta para isso em `captura/anonimizar.mjs`
2. **Conferência humana.** Anonimizador erra; o que ele deixa passar fica no Git para sempre
3. **Propósito escrito.** Qual contrato aquela gravação prova. Gravação sem propósito é peso morto que ninguém sabe se pode apagar

## O que **não** entra

`captura/respostas-brutas/` — as respostas cruas da captura — **nunca** são versionadas. Elas têm dado real de processo e de pessoa, e o `.gitignore` as bloqueia. Elas são a matéria-prima das gravações, não as gravações.

## Atualizar uma gravação custa dinheiro

Então é **ato deliberado**, não efeito colateral de rodar um teste. Regravar significa uma chamada nova à API, que precisa constar do orçamento em `docs/06-orcamento-de-chamadas-escavador.md` como qualquer outra (Regra 8).
