# Hooks do projeto

Um **hook** (gancho) é um comando que o Claude Code executa sozinho em certos
momentos — antes de uma ferramenta rodar, no início da sessão, quando o agente
termina de responder. Quem executa é o programa, não o agente.

Essa é a razão de existirem. As regras inegociáveis do `CLAUDE.md` são hoje
instruções em texto: valem enquanto o agente lembrar delas. O hook transforma
a regra em barreira — e a Regra 1 do próprio projeto diz que privilégio se
aplica em código, nunca por instrução no prompt.

Estão declarados em `.claude/settings.json`, que é versionado de propósito.

## Os cinco hooks

| Arquivo | Evento | O que faz |
|---|---|---|
| `estado-do-repo.mjs` | `SessionStart` | Injeta o estado do Git, o orçamento do Escavador e o cabeçalho de `docs/00-estado-atual.md` no contexto, antes da primeira pergunta. Também tira uma fotografia da árvore de trabalho para o `fechar-ciclo` |
| `guarda-escavador.mjs` | `PreToolUse` | Bloqueia comando ou `WebFetch` que chame a API paga do Escavador |
| `guarda-segredo.mjs` | `PreToolUse` | Bloqueia `git add -f`, `git add` de caminho proibido e commit que carregue segredo ou arquivo de dado de cliente |
| `anotar-escrita.mjs` | `PostToolUse` | Anota cada arquivo que esta sessão escreveu, para que a cobrança do ciclo saiba de quem é a autoria |
| `fechar-ciclo.mjs` | `Stop` | Se a sessão escreveu na memória do projeto sem atualizar `docs/00-estado-atual.md`, interrompe a parada e cobra o fechamento do ciclo |

### `guarda-escavador.mjs` — o disjuntor de crédito

Chamada à API é o único erro deste projeto que custa dinheiro e não se desfaz.

O custo **varia por rota**, e existem **rotas gratuitas** — a tarifa plana de
R$ 3,00 que o suporte informou foi desmentida pela medição (D-108), e o teto de
16 requisições não existe (D-119). Isso não afrouxa nada: gratuito se confirma
pelo cabeçalho medido, nunca por suposição. A cota de teste **expirou em
01/09/2026**, e recarga é decisão do usuário.

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

Ele cobra pelo que a sessão **provadamente escreveu** — a lista que o
`anotar-escrita.mjs` foi acumulando — e não pelo que apareceu no disco.

- Mexeu na memória e **não** atualizou o estado → **interrompe** e cobra
- Já atualizou o estado, falta registrar → **aviso leve**, não interrompe
- Nada novo, ou já dentro de um ciclo de cobrança → **fica calado**
- Mudou algo que a sessão **não** escreveu, e ela nunca rodou terminal capaz
  de escrever → **fica calado**: é trabalho de outra sessão
- Mudou algo que ela não escreveu, mas ela **rodou** terminal que escreve →
  **cobra, com ressalva** de que a autoria não está provada

O que conta como trabalho é definido por **exclusão**: tudo conta, menos
`node_modules/`, `dist/`, `.log`, `tmp/` e as próprias anotações de sessão.
A lista era de inclusão até 04/09 e ficou dez dias desatualizada — `services/`,
`dados/` e `testes/` nasceram invisíveis, e o hook não enxergava 13 dos 24
arquivos dos últimos dez commits. Por exclusão, a pasta nova já nasce coberta.

Fotografia **ausente** não desarma a cobrança (isso era falha *abrindo*, contra
a Regra 5): as anotações de escrita continuam valendo sozinhas. Fotografia
**ilegível** com árvore suja vira aviso, em vez de silêncio.

O campo `stop_hook_active` garante que ele nunca entre em laço infinito. Para
transformar a cobrança em aviso simples, troque `const BLOQUEAR = true` por
`false` no topo do arquivo.

### `anotar-escrita.mjs` — quem escreveu o quê

Roda depois de cada `Write`, `Edit`, `NotebookEdit` e comando de terminal, e
anota em `.claude/.sessoes/<sessão>.escritas.txt` o caminho de cada arquivo que
**esta** sessão escreveu. Comando de terminal não diz quais arquivos tocou, então
ali ele grava só a marca `!bash-escreveu` — o suficiente para o `fechar-ciclo`
saber que a possibilidade existiu.

Existe por causa de um defeito medido em 02/09: uma sessão que apenas **leu**
arquivos foi barrada e cobrada por alterações que outra sessão, rodando em
paralelo, fizera segundos antes. Sem este registro, a autoria era um palpite.

Ele grava em modo *append* (acrescentar ao fim, sem reler) porque duas
ferramentas podem rodar ao mesmo tempo — ler-modificar-gravar um JSON perderia
anotações na corrida. E ignora `2>/dev/null` e `2>&1` ao decidir se um comando
escreve: eles aparecem em quase todo comando, e se contassem, a marca estaria
sempre ligada e não distinguiria mais nada.

## Manutenção

Os cinco são Node puro (o projeto já usa `.mjs`), sem dependência externa e
sem acesso à rede. Rodam igual em PowerShell e em Git Bash.

Três deles têm suíte de testes própria, que monta um repositório Git
descartável e encena as situações — nenhuma depende de commit deste projeto,
então não apodrecem com o tempo:

```bash
node .claude/hooks/testar-anotar-escrita.mjs && node .claude/hooks/testar-fechar-ciclo.mjs && node .claude/hooks/testar-guarda-escavador.mjs && node .claude/hooks/testar-guarda-segredo.mjs
```

Para testar um hook sem esperar ele disparar, alimente-o pela entrada padrão
com o JSON que o Claude Code enviaria:

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"curl https://api.escavador.com/api/v2/x"}}' | node .claude/hooks/guarda-escavador.mjs
```

Saída vazia = passou. Saída com `"permissionDecision":"deny"` = bloqueou.

**Depois de editar `.claude/settings.json`, reinicie o Claude Code.** Uma
sessão que começou antes da mudança continua com a configuração antiga.
