# `n8n/` — os fluxos, versionados

| Campo | Valor |
|---|---|
| Estado | 🟡 Esqueleto — criado no marco 1 |
| Atualizado em | 2026-08-27 |

## O que mora aqui

| Pasta | Conteúdo |
|---|---|
| `workflows/` | Fluxos exportados em JSON, versionados no Git |
| `esquemas-de-credencial/` | **Apenas esquemas** — quais credenciais um fluxo espera, nunca os valores |

## Por que os fluxos ficam no Git

O n8n guarda os fluxos no banco dele. Isso funciona até o dia em que alguém altera um nó em produção e ninguém sabe o que mudou, quando, nem como voltar. Exportar para JSON versionado dá ao fluxo o mesmo tratamento que o código tem: histórico, revisão e desfazer.

É também onde a **Regra 3** se apoia. Regra de negócio do escritório não entra em servidor MCP — ela vive aqui. Se ela vive aqui, ela precisa ser legível e auditável como qualquer outra regra.

## A regra que não se negocia

**Nunca exportar fluxo com credencial embutida.** O n8n oferece as duas formas de exportação, e a diferença não é visível no nome do arquivo. O `.gitignore` já bloqueia `*.credentials.json`, mas bloqueio é a segunda linha de defesa — a primeira é exportar certo.

Em `esquemas-de-credencial/` entram apenas **esquemas**: o nome da credencial e quais campos ela tem. O valor vive no cofre do n8n e chega por variável de ambiente.

## Por que a pasta não se chama `credentials/`

A Spec §3 previa esse nome. O `.gitignore` deste projeto bloqueia `credentials/` inteiro — regra escrita quando ninguém imaginava querer versionar coisa alguma com esse nome.

Havia duas saídas: abrir uma exceção no `.gitignore`, ou renomear a pasta. **Renomear.** Uma exceção numa regra de segurança vale para sempre e para todo mundo, inclusive para o arquivo que alguém vai salvar ali com o valor dentro por engano daqui a um ano. O nome da pasta é barato; a exceção não é.

## Os fluxos que já existem

Os das duas demos estão em `demo/workflows/`, e continuam lá por enquanto: são demonstração, não produto. Migram para cá quando virarem fluxo de produção.
