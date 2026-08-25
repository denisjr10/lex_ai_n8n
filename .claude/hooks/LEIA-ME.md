# Hooks do projeto

Um **hook** (gancho) é um comando que o Claude Code executa sozinho em certos
momentos — antes de uma ferramenta rodar, no início da sessão, quando o agente
termina de responder. Quem executa é o programa, não o agente.

Essa é a razão de existirem. As regras inegociáveis do `CLAUDE.md` são hoje
instruções em texto: valem enquanto o agente lembrar delas. O hook transforma
a regra em barreira — e a Regra 1 do próprio projeto diz que privilégio se
aplica em código, nunca por instrução no prompt.

Estão declarados em `.claude/settings.json`, que é versionado de propósito.

## Os quatro hooks

| Arquivo | Evento | O que faz |
|---|---|---|
| `estado-do-repo.mjs` | `SessionStart` | Injeta o estado do Git, o orçamento do Escavador e o cabeçalho de `docs/00-estado-atual.md` no contexto, antes da primeira pergunta. Também tira uma fotografia da árvore de trabalho para o `fechar-ciclo` |
| `guarda-escavador.mjs` | `PreToolUse` | Bloqueia comando ou `WebFetch` que chame a API paga do Escavador |
| `guarda-segredo.mjs` | `PreToolUse` | Bloqueia `git add -f`, `git add` de caminho proibido e commit que carregue segredo ou arquivo de dado de cliente |
| `fechar-ciclo.mjs` | `Stop` | Se a sessão mexeu na memória do projeto sem atualizar `docs/00-estado-atual.md`, interrompe a parada e cobra o fechamento do ciclo |

### `guarda-escavador.mjs` — o disjuntor de crédito

A cota de teste é de **R$ 50,00, R$ 3,00 por requisição, teto de 16**, sem
rota gratuita e sem recarga contratada. É o único erro deste projeto que custa
dinheiro e não se desfaz.

- **Barra:** comando que junte `escavador.com` a um invocador de rede (`curl`,
  `wget`, `node`, `python`, `Invoke-RestMethod`…), qualquer execução de
  `captura/capturar.mjs`, e `WebFetch` em `api.escavador.com`
- **Deixa passar:** ler documentação (`docs.escavador.com`, o OpenAPI), e
  qualquer leitura local — `cat`, `grep`, `git` — mesmo que a palavra
  "escavador.com" apareça no comando

Ele **nega**, não pergunta: falha fecha (Regra 5). Para chamar a API de
verdade, a chamada precisa constar de
`docs/06-orcamento-de-chamadas-escavador.md` e ter aval do usuário na hora.

### `guarda-segredo.mjs` — a barreira do histórico

Três camadas:

1. **`git add -f`** é bloqueado sempre. É a única forma de furar o `.gitignore`
2. **`git add <caminho>`** é bloqueado se o caminho for `*.local*`,
   `captura/autos/`, `captura/respostas-brutas/`, `demo/listas/`, chave,
   certificado ou `.env` — mesmo que o `.gitignore` não pegue
3. **`git commit`** dispara uma varredura do que está preparado (*staged*):
   arquivo proibido no índice, ou chave privada, token `Bearer`, JWT ou segredo
   atribuído a variável nas linhas adicionadas → **bloqueia**

Número de processo no formato **CNJ** não bloqueia: ele **pergunta**. CNJ é
público em regra, mas a lista de processos do escritório é informação sobre a
carteira do cliente (D-95) — e a demo versiona números fictícios de propósito.
Quem decide é você.

Valores obviamente falsos (`SEU_TOKEN_AQUI`, `process.env.X`, `xxxx`) não
disparam alarme.

### `fechar-ciclo.mjs` — o lembrete que fecha o ciclo

O `CLAUDE.md` manda, ao terminar trabalho relevante, atualizar
`docs/00-estado-atual.md`, commitar em português e enviar. A conversa não
sobrevive à sessão; o documento sim.

Para não ser chato, ele compara o `git status` do fim com a **fotografia**
tirada no início da sessão — só cobra o que *esta* sessão mexeu, e só nas
pastas que são a memória do projeto (`docs/`, `demo/`, `captura/`, `.claude/`).

- Mexeu na memória e **não** atualizou o estado → **interrompe** e cobra
- Já atualizou o estado, falta registrar → **aviso leve**, não interrompe
- Nada novo, ou já dentro de um ciclo de cobrança → **fica calado**

O campo `stop_hook_active` garante que ele nunca entre em laço infinito. Para
transformar a cobrança em aviso simples, troque `const BLOQUEAR = true` por
`false` no topo do arquivo.

## Manutenção

Os quatro são Node puro (o projeto já usa `.mjs`), sem dependência externa e
sem acesso à rede. Rodam igual em PowerShell e em Git Bash.

Para testar um hook sem esperar ele disparar, alimente-o pela entrada padrão
com o JSON que o Claude Code enviaria:

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"curl https://api.escavador.com/api/v2/x"}}' | node .claude/hooks/guarda-escavador.mjs
```

Saída vazia = passou. Saída com `"permissionDecision":"deny"` = bloqueou.

**Depois de editar `.claude/settings.json`, reinicie o Claude Code.** Uma
sessão que começou antes da mudança continua com a configuração antiga.
