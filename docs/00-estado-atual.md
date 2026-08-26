# Estado Atual

| Campo | Valor |
|---|---|
| Atualizado em | 2026-08-26 |
| Crédito Escavador | ✅ **R$ 47,00 de R$ 50,00.** Blocos A e B executados em 26/08 e custaram **R$ 3,00**, não os R$ 9,00 orçados — o débito segue o catálogo por rota, e **não** a tarifa plana que o suporte informou (D-108). Expira **01/09** |
| Callback | ✅ **De pé.** Receptor ativo no n8n (`OymAtbNYI1pjfWkA`), URL cadastrada no painel: `callback.criativeia.com.br/webhook/escavador-callback` — **não** é o host do editor |
| 🔴 **Assinaturas ativas** | **1 — id `2813617`**, vigilância em diário criada em 26/08 às 15:09. **Remover até 22/09.** Ver §"Assinaturas do Escavador" |
| Bloco C | ✅ **Feito, e custou R$ 0,00.** C1 voltou **201** com solicitação `55413945` em `PENDENTE`; C2 confirmada gratuita. Máquina de estados registrada em `06-orcamento...` §5.5. **Aguardando a conclusão** para provar o callback |
| Fase | **2 — PRD e Spec.** PRD escrito; **Spec Parte I (chassi) escrita**. Ambos aguardam aval. A Parte II depende do escritório |
| Branch | `claude/law-firm-ai-automation-6pwaug` |
| Código | Captura, importador de autos em PDF, anonimizador, cliente do n8n e **as duas demos rodando** — A no Telegram (`ZPh3DxptHFIyWETO`, 23 nós, 128 verificações) e B no WhatsApp (`Hxc7uAmAUhyPE7E1`, 8 nós, 49 verificações), **ligadas uma na outra**: aprovar no Telegram envia ao cliente |
| Regras de cobrança | ⚠️ **Metade confirmada, metade desmentida.** Valem: callback é grátis; monitoramento cobra na criação e a cada renovação; "200 itens" são aparições. **Não vale** a tarifa plana de R$ 3,00 — a medição de 26/08 mostrou débito por rota (D-108). Ver `06-orcamento...` §5.3 |
| Dados da demo | ✅ **8 processos reais, anonimizados**, extraídos dos autos em PDF do escritório. **Sem gastar crédito** — a demo deixou de depender do desbloqueio |
| Alvo do Escavador | 🔄 **Trocado em 24/08** (D-96): o anterior estava em segredo de justiça. Agora é um processo de saúde pública do TJAP |

> Documento vivo. É o primeiro que uma sessão nova deve ler.

---

## Assinaturas do Escavador — conferir em toda sessão

> **Por que esta seção existe no topo:** monitoramento cobra **todo mês**, sozinho, sem gerar chamada nenhuma. Um esquecido em ambiente de teste vira dinheiro escorrendo indefinidamente (R-13). A conversa não sobrevive à sessão; esta tabela sim.

| Alvo | id | Criado em | **Remover até** | Ambiente | Estado |
|---|---|---|---|---|---|
| vigilância em diário (termo/OAB) | `2813617` | 2026-08-26 | **2026-09-22** | teste | ativa |

**Quando criar uma, preencha aqui na mesma hora.** O comando abaixo imprime a linha pronta para colar, com a data-limite já calculada:

```bash
node captura/monitorar.mjs criar --executar --confirmo-custo-recorrente
```

A vigilância por OAB **já existe** — criada em 26/08 às 15:09, id `2813617`, 5 diários dos 181 disponíveis, franquia de **1000 aparições/mês**. O script agora recusa criar uma segunda (Regra 5 virou código).

**Para encerrar, quando o teste terminar:**

```bash
node captura/monitorar.mjs remover 2813617 --executar
```

Conferência gratuita, a qualquer momento — e vale fazer se esta tabela parecer velha:

```bash
node captura/monitorar.mjs listar --executar
```

**A regra dos dois regimes**, que confunde e precisa ficar escrita:

| | Remove? |
|---|---|
| **Teste** | ✅ Sim, ao terminar o experimento. Ele não protege ninguém — só valida contrato |
| **Produção** | ❌ **Nunca por rotina.** É o produto. Remover é a operação de maior dano silencioso do projeto (R-14, D-29), reservada a evento de cadastro decidido por gente |

---

## A execução paga ficou pronta — 26/08/2026

O usuário autorizou, no chat, executar os Blocos A e B, exercitar o Bloco C e criar uma vigilância em diário oficial por OAB. **Nada foi gasto ainda:** R$ 50,00 intactos.

**Antes de gastar, a documentação oficial da V1 foi lida inteira — de graça — e desmentiu o nosso mapeamento em cinco pontos.** Dois deles custariam dinheiro:

- **`origens_ids` é obrigatório** para monitoramento por termo, e o mapeamento dizia opcional. Omitir devolve **422, que custa os mesmos R$ 3,00 de um acerto**
- **`testcallback` é rota PAGA**, não gratuita como o mapeamento afirmava. Não havia ensaio barato do webhook, ao contrário do que planejávamos
- **`limite_aparicoes` tem padrão de 200/mês e, ao atingir o teto, o monitoramento PARA de capturar.** Isto não é risco de dinheiro, é **risco de prazo (R-02)**: vigilância silenciada por cota é publicação que ninguém vê
- `variacoes` aceita no máximo 3; e **não existe `tipo` de OAB** — vigiar OAB é `tipo = termo`

E duas pendências antigas caíram na mesma leitura: **500 requisições por minuto** e **não existe ambiente de homologação**.

**O que foi construído:**

| Arquivo | O que faz |
|---|---|
| `captura/monitorar.mjs` | Vigilância V1: `origens` e `listar` grátis, `criar` com trava de custo recorrente, `remover` para encerrar a assinatura |
| `captura/montar-receptor-callback.mjs` | Publica no n8n o endereço público que recebe os callbacks. ACK imediato, conferência do `Authorization` em tempo constante, e o corpo é registrado — nunca interpretado (Regra 4) |
| `.claude/hooks/testar-guarda-escavador.mjs` | **15 casos.** O disjuntor de crédito passou a ter teste |

**O disjuntor tinha três falsos positivos, e todos foram corrigidos:** ele barrava `cat` no script pago (ler código é grátis), barrava a documentação em `/v1/docs` (que é justamente o que evita gastar) e barrava o ensaio sem `--executar` (que existe para não gastar). Falso positivo em barreira de segurança não é incômodo: é o que ensina a próxima sessão a desligar a barreira.

### O que foi executado, e o que custou

| Chamada | HTTP | Débito medido | Catálogo |
|---|---|---|---|
| A1 · envolvidos | 200 | **R$ 0,05** | R$ 0,05 — exato |
| B1 · capa | 200 | **R$ 2,95** | R$ 3,00 `*` |
| B2 · movimentações | 200 | **R$ 0,00** | R$ 3,00 `*` |
| origens (V1) | 200 | **R$ 0,00** | gratuita |

**Total: R$ 3,00.** O orçamento previa R$ 9,00 para os Blocos A e B, pela tarifa plana que o suporte informou por escrito. **A tarifa plana não existe** — o débito segue o catálogo por rota. Virou **D-108: o custo real vem da medição, não da declaração do fornecedor.** É a segunda vez que a palavra do suporte não corresponde ao sistema; a primeira foi o R-37.

De quebra, e de graça: **a V1 aceita o mesmo token** (última pergunta de autenticação encerrada) e **as movimentações não custaram nada** — justamente a peça que dispara prazo.

### O callback está de pé

Receptor publicado e **ativo** no n8n (`OymAtbNYI1pjfWkA`), URL **cadastrada no painel** em 26/08. O painel não exibiu verificação própria no cadastro.

⚠️ **A URL não é a do host do editor.** O n8n publica webhook em `WEBHOOK_URL`, que nesta instância é outro domínio:

| | |
|---|---|
| Editor abre em | `auto.criativeia.com.br` |
| **Webhook atende em** | **`callback.criativeia.com.br/webhook/escavador-callback`** |

O usuário percebeu a divergência antes de cadastrar. O erro seria mudo — a URL do editor responde hoje e pararia de responder no dia em que ele fosse fechado ao público. `demo/n8n.json` passou a declarar `webhookBaseUrl` para o engano não se repetir.

### O hook do estado tinha dois furos, e os dois foram fechados

O `fechar-ciclo.mjs` cobra a atualização deste documento ao fim de cada sessão. Auditado a pedido do usuário, revelou:

1. **Quem commitava antes de parar escapava da conferência.** O hook só olhava o que estava *por commitar*; árvore limpa fazia ele sair calado — justamente nas sessões mais produtivas, que são as que commitam. Agora ele compara também com o commit em que a sessão começou (`commitNoInicio`, gravado pelo `estado-do-repo.mjs`)
2. **A primeira linha do `git status` era sempre mal interpretada.** O helper fazia `.trim()` na saída inteira, comendo o espaço inicial de `" M arquivo"`, e o `slice(3)` cortava um caractere a mais — `docs/00-estado-atual.md` virava `ocs/00-estado-atual.md`. Se este documento calhasse de ser a primeira linha, o hook bloquearia a parada **mesmo com ele atualizado**

O segundo é o mais perigoso dos dois: falso positivo em barreira é o que ensina a próxima sessão a desligar a barreira. Ambos os hooks agora têm teste (`testar-fechar-ciclo.mjs`, 8 casos, com repositório Git descartável).

### O Bloco C ganhou script, e o C4 saiu do orçamento

`captura/atualizar.mjs` — separado do `capturar.mjs` de propósito: aquele tem fila fixa de GETs e teto travado na autorização dos Blocos A e B, e mexer nele para acomodar um POST significaria afrouxar as travas que já protegeram duas execuções.

**A documentação oficial corrigiu o contrato antes de a chamada custar.** O orçamento previa `documentos_publicos: false, autos: false`; a documentação mostra que os campos são texto e valem `1`/`0`, **não booleanos JSON**. Mandar `true` onde a API espera `1` seria o mesmo erro do `origens_ids` da semana passada: um 422 que custa igual a um 200. Segunda vez que ler a documentação de graça evita gastar R$ 3,00.

**C4 retirado por decisão do usuário (D-110).** Ele validaria monitoramento **por processo** — a rota que a D-62 rejeitou. A vigilância por OAB exercita o mesmo ciclo de cobrança na rota que vai para produção.

### O disjuntor de crédito tinha uma brecha e um exagero

Auditado ao acrescentar o script novo:

1. **Brecha (D-111):** o `atualizar.mjs` nasceu depois do hook e passava por fora dele. Por alguns minutos existiu um script que debita R$ 3,00 sem barreira. Regra derivada: script pago novo entra no hook no **mesmo commit** em que nasce
2. **Exagero (D-112):** o hook lia `--executar` como sinônimo de "gasta", e barrava `listar`, `status`, `aparicoes` e — pior — **`remover`**, a única operação que *para* a cobrança mensal. Um hook de custo impedindo reduzir custo é um hook que a próxima sessão desliga. Liberação por lista explícita; subcomando desconhecido continua bloqueado

`testar-guarda-escavador.mjs` passou de 15 para **20 casos**. As duas suítes passam inteiras.

### As execuções de 17h ensinaram três coisas, e duas foram erro nosso

**1. A vigilância já existia — e ninguém tinha registrado.** O `criar` das 17:43 voltou 422 *"Você já monitora este termo"*. O motivo estava no disco desde as 15:09: uma criação com HTTP 200, id `2813617`, gravada no registro de execução e na resposta bruta. Nem o script conferia, nem eu li antes de mandar rodar.

Foi o **R-41 se realizando em horas** — uma assinatura mensal ativa, sem dono e fora do inventário — e o único motivo de não terem virado duas assinaturas cobrando em paralelo foi a API ter recusado. Depender da gentileza do fornecedor não é controle. O `monitorar.mjs criar` agora lê o registro e recusa em código.

**2. A franquia real é 1000, não 200.** A documentação diz padrão de 200 aparições/mês; a criação voltou `limite_aparicoes: 1000`. O padrão depende da conta — então não se supõe, lê-se da resposta. A D-107 foi corrigida.

**3. Nesta API, campo ausente ≠ campo com valor falso.** O C1 mandou `documentos_publicos: 0, autos: 0` e levou 422: *"Não é possível solicitar atualização de documentos públicos e autos ao mesmo tempo."* A API decide pela **presença** da chave. Zerar os dois é pedir os dois. Corrigido para mandar só `enviar_callback: 1`.

Terceiro caso do mesmo padrão na semana, depois de `origens_ids` obrigatório e de `1`/`0` em vez de booleanos.

### Custo das quatro execuções: R$ 0,00

| Chamada | HTTP | `Creditos-Utilizados` |
|---|---|---|
| `V1-criar` (15:09) | 200 | **0** |
| `V1-criar` (17:43) | 422 | cabeçalho ausente |
| `C1 solicitar` | 422 | cabeçalho ausente |
| `C2 status` | 200 | **0** |

Os dois 422 não trouxeram o cabeçalho de custo — provavelmente não cobraram, mas *provavelmente* não é confirmação. **Conferir "Uso dos Créditos" no painel** antes de tratar o saldo de R$ 47,00 como certo.

E fica o dado que interessa: **criar a assinatura debitou 0 da cota de teste.** A cobrança do monitoramento não passa pelo cabeçalho — ela é da assinatura, e por isso o inventário é a única forma de enxergá-la.

### O Bloco C fechou, e não custou nada

O C1 com o corpo corrigido voltou **HTTP 201** e `Creditos-Utilizados: 0` — solicitação `55413945`, estado `PENDENTE`, `enviar_callback: "SIM"`. O C2 também veio a zero. **A quarta medição seguida contradizendo a tarifa plana de R$ 3,00** (D-108).

**O n8n não recebeu nada, e está certo assim.** O callback só dispara na **conclusão**; enquanto o estado for `PENDENTE`, não há entrega a fazer. O receptor só pode ser dado como reprovado se `concluido_em` estiver preenchido **e** mesmo assim não houver execução no fluxo.

**A descoberta que o chassi precisa:** o status não fica na raiz da resposta — vem dentro de `ultima_verificacao`, e esse campo é `null` quando **nada foi pedido**. `null` ali não é erro, é repouso. Confundir os dois faz o chassi ou alarmar à toa, ou esperar para sempre. O sinal confiável de término é **`concluido_em`**, não o texto do status. Detalhes em `06-orcamento...` §5.5.

O `atualizar.mjs status` lia o campo errado e dizia "não trouxe um campo status óbvio" com o estado ali, um nível abaixo. Corrigido — agora ele explica o que está acontecendo em vez de despejar JSON.

**O que falta:** repetir o `status` (gratuito) até `concluido_em` deixar de ser `null`, e então conferir se a execução apareceu no n8n. É a última peça do Bloco C, e não custa nada.

### 🔴 A chave de API do n8n vazou duas vezes no mesmo dia

Primeiro por um comando do assistente que imprimiu o JWT inteiro no histórico. Depois — pior — pela própria ferramenta criada para evitar isso: o `guardar-segredo.mjs` prometia esconder a digitação, **não escondeu no PowerShell**, e ainda imprimiu com todas as letras *"o valor não foi exibido em momento nenhum"*.

O bloqueio de eco era um remendo em `process.stdout.write`, que não segura o eco do terminal do Windows. Reescrito para desligar o eco onde ele mora — modo cru — e para **recusar** quando não conseguir, em vez de tentar (D-114, R-42).

**Estado:** a chave precisa de uma terceira rotação. Nenhuma das duas anteriores deve continuar válida.

**Antes de colar a chave nova, exercite a ferramenta com lixo:**

```bash
node guardar-segredo.mjs demo/teste-eco.local
```

Digite qualquer coisa. Se aparecer na tela, **pare** — a correção não pegou nesse terminal, e o caminho seguro é abrir `demo/n8n.local` num editor e colar lá, salvando em UTF-8.

> ⚠️ Este documento tem um bloco duplicado (as seções "As duas demos ficaram prontas", "Próximo passo", "Decisões", "Pendências" e "Riscos ativos" aparecem duas vezes). Provável colisão entre sessões paralelas. Não foi corrigido aqui para não atropelar outra sessão que possa estar com o arquivo aberto.

## Onde estamos

Fases 0 e 1 concluídas. Os dois mapeamentos de API estão prontos — Escavador e Trello.

Fase 2 em andamento: **PRD escrito e Spec Parte I escrita**, ambos aguardando aval.

Em paralelo, a **demonstração** (Nota Técnica 03) saiu do papel: a Demo A responde no Telegram, com o Porteiro barrando em código quem pode o quê, e o ciclo de aprovação funcionando de ponta a ponta. Os dados deixaram de depender do Escavador — os autos em PDF entregues pelo escritório foram convertidos para o mesmo contrato que a API produziria (D-98).

**Próximos passos imediatos:**

1. ✅ **Feito** — os 8 processos estão no fluxo publicado, com a ficha cortada em 20 movimentações (406 tokens por pergunta) e barreira de segredo de justiça em código
2. ✅ **Feito** — Demo B (cliente no WhatsApp via Uazapi) construída, publicada e testada ao vivo
3. ✅ **Feito** — o ciclo fechou: aprovar no Telegram envia a mensagem ao cliente no WhatsApp (D-99)
4. **Ensaiar o roteiro inteiro** com a instância viva, do lado do colaborador e do lado do cliente
5. Decidir o nível de anonimização com a advogada (D-97) — o interruptor já existe

## Concluído

| Entrega | Documento |
|---|---|
| Diretrizes gerais — escopo, princípios, arquitetura, privilégios, LGPD e ética, riscos | `01-diretrizes-gerais.md` |
| Questionário de descoberta — 74 perguntas por destinatário | `02-descoberta-perguntas-abertas.md` |
| Canal interno e hospedagem dos MCP — Telegram, Google Chat, MCP no n8n | `03-canais-internos-e-hospedagem.md` |
| Modelo de identidade, autorização, aprovação e auditoria | `04-modelo-de-identidade-e-autorizacao.md` |
| Como obter as fontes das APIs | `05-acesso-as-fontes-das-apis.md` |
| Mapeamento da API do Escavador — 83 operações | `mapeamento-escavador.md` |
| Mapeamento da API do Trello — 261 operações | `mapeamento-trello.md` |
| Orçamento de chamadas da cota de teste do Escavador (rev. 2.0) | `06-orcamento-de-chamadas-escavador.md` |
| **Achados do painel autenticado do Escavador — preços, tokens, callbacks, organização** | `07-painel-escavador-achados.md` |
| **PRD — produto, entregas, requisitos, regras de negócio e modelo de custo** | `08-prd.md` |
| **Spec Técnica — Parte I: chassi, motor de custo, cache, callbacks, esquema de dados** | `09-spec-tecnica.md` |
| **Nota Técnica 02 — ClickUp no lugar de Workspace, Chat e Trello: viabilidade, recursos e custo** | `10-clickup-avaliacao.md` |
| **Nota Técnica 03 — Demonstração ao vivo para o escritório, antes do contrato** | `11-nota-tecnica-demo.md` |
| **Hooks do Claude Code — as regras inegociáveis viraram barreira em código** | `.claude/hooks/LEIA-ME.md` |

## As regras saíram do prompt e viraram barreira — 25/08/2026

Quatro hooks passaram a rodar automaticamente, declarados em
`.claude/settings.json`. A motivação é a Regra 1 do próprio projeto: privilégio
se aplica em código, nunca por instrução no prompt. As regras inegociáveis do
`CLAUDE.md` dependiam de o agente lembrar delas — agora o programa as aplica.

| Hook | Evento | Protege |
|---|---|---|
| `estado-do-repo.mjs` | `SessionStart` | Injeta estado do Git, orçamento do Escavador e o cabeçalho deste documento antes da primeira pergunta |
| `guarda-escavador.mjs` | `PreToolUse` | Regra 8 — bloqueia chamada à API paga; ler documentação continua livre |
| `guarda-segredo.mjs` | `PreToolUse` | R-12 e D-95 — bloqueia `git add -f`, caminho proibido e segredo em commit; CNJ pergunta em vez de bloquear |
| `fechar-ciclo.mjs` | `Stop` | Cobra a atualização deste documento quando a sessão mexeu na memória do projeto |

O `estado-do-repo.mjs` foi criado por uma sessão paralela mais cedo no mesmo
dia; os outros três foram somados a ele, e ele ganhou a fotografia da árvore de
trabalho que o `fechar-ciclo` consome. Todos são Node puro, sem dependência
externa e sem acesso à rede.

**Reinicie o Claude Code depois de mexer em `.claude/settings.json`** — uma
sessão que começou antes da mudança segue com a configuração antiga.

## O que os mapeamentos concluíram

**Escavador (83 operações — 41 em V2, 42 em V1)**

- V1 e V2 são **complementares, não sucessivas**. V2 não cobre diários oficiais, busca livre, entidades nem saldo. Diário oficial é onde sai a publicação que dispara prazo — o MCP precisa das duas (D-27).
- 15 ferramentas curadas, 19 escopos `escavador:*`, política de cache por tipo de dado.
- Custo vem no cabeçalho `Creditos-Utilizados`, mas a tabela de preços por rota só existe no painel autenticado.
- **R-12:** a API armazena certificado digital, senha e semente de 2FA do advogado.

**Trello (261 operações)**

- **R-16 é o achado central:** a API **não tem escopo por quadro ou recurso**. Um token `read` lê a conta inteira. O isolamento entre carteiras depende do nosso código, não do Trello (D-36).
- O OAuth 2.0, que traria escopos granulares, foi anunciado em abril de 2025 e **ainda não chegou** em julho de 2026. Não dá para planejar contando com ele (D-37).
- 12 ferramentas curadas sobre 261 operações — a superfície destrutiva do Trello (excluir quadro, apagar histórico, arquivar em massa) fica fora de todo perfil.
- Recurso escasso aqui é **vazão**, não dinheiro: o Trello não cobra por chamada.
- Resolvida a ressalva de §7.3: ferramentas de fluxo do escritório vivem no **n8n**, não no MCP (Regra 3, D-44).

## Restrição nova — crédito do Escavador

O suporte do Escavador Business liberou **saldo de teste** em **13/08/2026**: R$ 50,00, **16 requisições**, **10 dias** — com **R$ 3,00 fixos por requisição, em qualquer rota**. Não há plano pago contratado.

⚠️ **Prorrogação prometida em 21/08 — mas não aplicada.** O suporte concedeu por escrito "mais 10 dias", e em 23/08 a API recusou com `403 · "Seu saldo está bloqueado"` (R-37). O que segue continua valendo **se e quando** a extensão for de fato lançada na conta; a fonte do estado real é a barra lateral do painel ("Válido até"), nunca a conversa. O que era corrida contra o relógio virou execução ordenada: os Blocos A e B seguem dependendo apenas do token e de um número de processo real, e o **Bloco C voltou ao plano** — ele é a razão declarada da prorrogação, e tem prioridade (D-94). O suporte pediu retorno sobre os testes; é a contrapartida combinada, e mantém aberto o canal do comercial (R-22).

🚧 **A pergunta que resta decide o tamanho do orçamento:** o débito durante o bônus segue a tabela por rota ou é de R$ 3,00 fixos? Enquanto não houver resposta, o orçamento opera pelo pior caso. Ver `06-orcamento-de-chamadas-escavador.md` §1-C.

Isso vira restrição de projeto, não detalhe operacional:

- ~~**Nenhuma rota é gratuita agora.**~~ ✅ **Corrigido em 20/08 pelo Playground:** as rotas de *status* do ciclo assíncrono são **gratuitas**, e os preços vão de R$ 0,00 a R$ 3,00 — ver a seção do painel, abaixo
- **A cota não revela a tabela de preços** — o custo é fixo. A pendência de preço por rota continua dependendo do painel autenticado
- **16 chamadas validam contrato, não cobertura.** Autenticação, cobertura do plano (V1 e V2), formato dos dados e ciclo de webhook. Nada além disso
- **Recarga paga é decisão do usuário**, tomada com o registro de execução à vista

Registrado como **R-21** e decisões **D-47 a D-50**. O orçamento chamada a chamada está em `06-orcamento-de-chamadas-escavador.md` e **precisa de aval antes da primeira execução**.

## O painel do Escavador foi lido — 20/08/2026

Com o Claude Code rodando na máquina local, foi possível navegar no painel autenticado `api.escavador.com` e transcrever tudo, **sem gastar um centavo de crédito**. O documento é `07-painel-escavador-achados.md`. Seis das sete pendências de `mapeamento-escavador.md` §15 foram encerradas.

O que mais muda o projeto:

- **Nem toda requisição custa R$ 3,00.** Os preços vão de **R$ 0,05** (`Envolvidos do processo`) a R$ 3,00. O teto de "16 requisições" era o pior caso — o orçamento revisado gasta ~R$ 18,25 em 9 chamadas
- **R-15 encerrado.** V1 e V2 estão ambas disponíveis, com diário oficial, jurisprudência e legislação. Não há restrição de plano — a conta está "sem contrato ativo"
- **Não há URL de callback cadastrada.** Nada a quebrar, e cadastrar a nossa é gratuito. O Bloco C está destravado do lado do Escavador
- **O token do Escavador não tem escopo** — a tela de criação só oferece nome, expiração e um interruptor de Playground. É o mesmo problema do R-16 do Trello, agora nas duas APIs: **nenhuma delas é segunda barreira** (R-24). Um token por aplicação continua valendo, mas por atribuição e revogação, não por privilégio (D-51)
- **Existem rotas gratuitas** — as de **status** do ciclo assíncrono. O Playground confere nove de nove serviços com a tabela de preços, e revela que ela lista **só o que é cobrado**: ausência dali pode significar gratuito (D-59)
- **Quatro rotas cobram por bloco de 200 resultados**, com volume desconhecido antes da chamada — é a consulta mais natural do agente e a de custo mais imprevisível (R-25, D-57, D-58)
- **Recarga não é autosserviço** — depende do comercial. Risco novo, R-22
- **O painel substitui instrumentação nossa**: histórico de requisições filtrável por token, histórico de callbacks com payload e tentativas, e alerta de saldo por e-mail

## O PRD está escrito — 20/08/2026

`08-prd.md`, versão 1.0, 🟡 aguardando aval. Ele define quatro entregas (E1 fundação e consulta · E2 vigilância de prazo · E3 demandas e organização · E4 atendimento ao cliente), 34 requisitos funcionais com critério de aceite, 18 regras de negócio, 17 não funcionais, métricas e modelo de custo com os preços reais.

Três decisões de produto que valem destaque:

- **E2 antes de E3** — perda de prazo é o pior desfecho do projeto, e a vigilância é também a entrega mais barata
- **D-62 — vigiar diário oficial por OAB, não processo a processo.** Mesma cobertura por **R$ 3,00/mês** em vez de R$ 600,00/mês para 200 processos. É onde nasce o prazo, e o custo não cresce com a carteira
- **D-63 — o agente do cliente lê da base interna**, não da API paga sob demanda. Sem isso, a exposição financeira fica aberta e nas mãos de quem não paga a conta

Sete perguntas travam o refino (§13 do PRD), e **P-01 — identidade individual — é a premissa mais crítica**: se cair, metade dos requisitos cai junto (D-67).

## A Spec técnica começou pela metade que não depende do escritório — 20/08/2026

`09-spec-tecnica.md`, **Parte I**, versão 1.0, 🟡 aguardando aval. O critério de corte: está na Parte I tudo que seria construído **exatamente igual** sob qualquer resposta que o escritório der.

Ela especifica o **chassi** (`mcp-core`) e tudo que se apoia nele: arquitetura de execução, organização do repositório, sessão e verificação de escopo, motor de custo, cache, receptor de callbacks, esquema de dados, taxonomia de erros, vazão, observabilidade, segurança e testes.

O que mais decide desenho:

- **A ferramenta declara, o chassi decide.** Nenhuma ferramenta MCP chama o Policy Gate, lê token, mede custo ou grava auditoria. Ela declara faixa, escopo, sujeito, custo e cache — e o chassi aplica. Assim **não existe caminho até a API que escape da verificação**, e a Regra 1 deixa de depender da disciplina de quem escreve ferramenta
- **Onze etapas, e negar é sempre mais barato que permitir.** As oito primeiras não custam um centavo: recusa por escopo ou abrangência acontece antes da chamada paga (RF-07)
- **Preço é dado, não código.** O catálogo fica em arquivo versionado, com classificação `cobrada`/`gratuita`/`desconhecida`, unidade de cobrança e data de leitura. Quando o suporte responder P-06, muda-se um arquivo — não o código (D-71)
- **Reserva antes, reconciliação depois** (D-72). Sem reserva, dez chamadas simultâneas de R$ 3,00 passam por um orçamento de R$ 5,00, porque nenhuma debitou ainda
- **A auditoria vem antes do motor de custo** na ordem de construção, porque custo é um tipo de registro. Fazer na ordem inversa é retrabalho garantido
- **Toda a fundação pode ser construída e testada sem gastar crédito**, sobre gravações anonimizadas. O crédito só entra na verificação final ponta a ponta — os R$ 0,05 já orçados (D-78)

Riscos novos: **R-26** (o chassi concentra a fronteira — raio de dano máximo), **R-27** (janela entre revogar sessão e ela expirar), **R-28** (reserva por estimativa pode subestimar nas rotas por bloco). Decisões **D-68 a D-78**.

## O ClickUp foi avaliado — 20/08/2026

`10-clickup-avaliacao.md`, versão 1.0, 🟡 aguardando aval. A pergunta era se o ClickUp poderia substituir Google Workspace, Google Chat e Trello. **São três perguntas, com três respostas:**

- **Workspace: não substitui.** O ClickUp não hospeda e-mail em domínio próprio nem emite identidade — o recurso "Email" dele **conecta** uma conta que já existe (Gmail, Outlook, M365 ou IMAP). A frente F3 continuaria dependendo do Google. A recomendação de licenças individuais (D-21, D-67) fica intacta (D-79)
- **Google Chat: substitui, com ressalvas.** Some a limitação que matou o Chat (convidado externo não interage com aplicativo), mas a **API de Chat é experimental**, **não tem botão nem cartão** e **não tem identidade de robô** — a mensagem sai como o dono do token (R-29, R-30)
- **Trello: substitui, e é o único eixo com ganho real** — mas o ganho é **de segurança, não de preço**

O achado central: **o token OAuth do ClickUp herda as permissões do usuário**, então o produto consegue ser a segunda barreira que nem o Trello (R-16) nem o Escavador (R-24) conseguem ser. Isso torna o R-26 menos afiado, sem dispensar a Regra 1 (D-81).

Achado secundário, de desenho, que vale independentemente de migração: **a aprovação humana deve viver na tarefa, não na mensagem** — mudança de status capturada por webhook assinado que identifica o autor. Resolve as necessidades N3, N4 e N6 melhor que botão de chat (D-83).

E a conta de custo: **não sai mais barato.** Corrigindo o R-11 nos dois cenários, trocar Trello por ClickUp Unlimited custa **≈ R$ 129/mês a mais** para 12 pessoas; o plano Business, ≈ R$ 452/mês a mais. O caminho recomendado é **piloto no plano gratuito** (membros ilimitados, custo zero) antes de qualquer contrato, e **congelar a migração até D-09 ser respondida** (D-85).

Riscos novos: **R-29** (API de Chat experimental), **R-30** (sem identidade de aplicativo), **R-31** (migrar descarta o mapeamento do Trello), **R-32** (concentração em fornecedor único cobrado em dólar). Decisões **D-79 a D-85**. Perguntas novas ao escritório: **P-08 a P-12**.

## O escritório pediu para ver funcionando — 21/08/2026

Antes de fechar o contrato, o escritório quer ver algo rodando na prática. `11-nota-tecnica-demo.md`, versão 1.0, 🟡 aguardando aval, especifica uma **demonstração descartável**: um agente para colaborador no **Telegram** e um para cliente no **WhatsApp via Uazapi**, com um roteiro de duas conversas curtas.

O achado que viabiliza tudo: **a demo não consome crédito novo do Escavador.** Ela lê de um **instantâneo** produzido pelos Blocos A e B do orçamento — chamadas que já estavam previstas para validar contrato. Custo incremental em crédito: **R$ 0,00** (D-87). E, por ler de arquivo, a demo continua funcionando depois de o bônus expirar, antecipando a D-63.

Três decisões que valem destaque:

- **Não copiar o repositório.** Copiar separa a memória do projeto dos documentos, e as duas cópias divergem em uma semana. A demo vive em branch descartável `claude/demo-vitrine` e pasta `demo/`; o que volta ao projeto é um documento, não código (D-86)
- **O roteiro demonstra as regras, não só o robô.** Aprovar no Telegram dispara o envio no WhatsApp — a Regra 2 acontecendo na frente do cliente. E a recusa de acesso a processo de terceiro mostra a Regra 1: verificação em código, não instrução de prompt (D-91)
- **Uazapi é exceção, e só na demo.** A D-10 (somente WhatsApp oficial) permanece válida para produção. Na demo, três condições inegociáveis: chip descartável, lista de permissão fechada e ressalva por escrito (D-89)

O risco central **não** é bagunçar o repositório: é **a demo virar produção** — sem Policy Gate, sem motor de custo, com WhatsApp não oficial (R-33). Riscos novos: **R-33 a R-36**. Decisões: **D-86 a D-94**.

**Trava a demo o mesmo que já travava os Blocos A e B:** um número CNJ real do escritório.

## As duas demos ficaram prontas, e ligadas — 24/08/2026

A **Demo A** (colaborador no Telegram) e a **Demo B** (cliente no WhatsApp) estão publicadas e ativas, sobre os 8 processos reais anonimizados. **Custo em crédito do Escavador: R$ 0,00.**

O que a Demo A faz: identifica quem falou pelo `user_id`, encontra o processo por número, apelido interno ou nome da parte, responde sobre o andamento, redige mensagem ao cliente e propõe com três botões — aprovar, editar, descartar. Editar não é atalho: o texto reescrito à mão volta com os mesmos três botões, porque quem reescreve pode não ser quem aprova.

O que a Demo B faz: **o escopo vem da lista, nunca da mensagem.** Pergunta sobre prazo é recusada em código, antes de chegar ao modelo. Processo de outra pessoa citado por número é recusado em código — defeito encontrado no teste ao vivo do usuário, em que o modelo improvisou uma promessa de retorno sobre caso alheio.

E o fio entre as duas: **aprovar no Telegram envia de verdade no WhatsApp do cliente** (D-99). Quem não é advogado não perde o trabalho: o clique dele **encaminha** a proposta ao advogado, com os mesmos três botões, e o desfecho volta para quem redigiu (D-100). A trilha passa a registrar as duas pessoas — quem redigiu e quem aprovou. O destinatário sai da mesma lista que a Demo B usa para decidir escopo — não sai da conversa, nem da redação do modelo, nem de um número digitado. É a Regra 1 aplicada ao caminho de volta: o poder de escolher para quem o escritório fala não mora dentro de um texto.

**155 verificações automáticas** rodam sem n8n, sem Telegram, sem WhatsApp e sem gastar token de modelo.

O que continua valendo do risco R-33: isto é demonstração. Não tem Policy Gate, não tem motor de custo, e usa WhatsApp não oficial em instância gratuita que **expira em 1 hora**.

## Próximo passo

Três caminhos que não competem entre si:

1. **Construir os marcos 1 a 5** da §15 da Spec — esqueleto, chassi, auditoria, motor de custo, cache. Nenhum consome crédito do Escavador nem depende de resposta do escritório
2. **Levar ao escritório** as cinco perguntas que destravam a Parte II, com destaque para a conta compartilhada, registrada como bloqueio de projeto (D-67)
3. ~~**Executar a captura** (Blocos A e B)~~ — ✅ **feita em 26/08.** Custou R$ 3,00, não os R$ 9,00 orçados (D-108)

**As duas chamadas pagas que restam autorizadas** — ambas gastam dinheiro, e por isso passam pela mão do usuário, não pela do agente. O hook `guarda-escavador.mjs` bloqueia o agente em código:

```bash
node captura/monitorar.mjs criar --executar --confirmo-custo-recorrente
```

```bash
node captura/atualizar.mjs solicitar --executar --confirmo-custo
```

Depois do C1, o acompanhamento é **gratuito** e pode ser repetido à vontade:

```bash
node captura/atualizar.mjs status --executar
```

A **Parte II** da Spec — matriz definitiva de escopos, modelagem da demanda, fluxos n8n — é escrita quando essas respostas chegarem.

## Decisões

**D-01 a D-46** estão em `01-diretrizes-gerais.md` §13.

- ✅ Confirmadas: D-01 (n8n como orquestrador), D-02 (camada MCP reutilizável)
- 🟡 Propostas aguardando aval do usuário: todas as demais, exceto as abaixo
- 🔴 Em aberto, dependem do escritório: **D-07** (advogado vê toda a base ou só sua carteira) e **D-09** (Trello é gestão de casos ou quadro de tarefas)

## Pendências com o escritório

**Elevadas em urgência pelos mapeamentos:**

- **Pergunta 58** — plano contratado do Escavador. Se não cobrir V1, o escritório fica sem monitoramento de diário oficial (R-15)
- **Pergunta 66** — é possível criar conta de serviço dedicada no Trello? Se não, R-20 fica sem tratamento
- **Pergunta 27** — Power-Ups e automações Butler ativos no Trello. Butler reage às nossas escritas; precisa ser inventariado antes da primeira gravação

Também abertas: perguntas **16a a 16c** (conta compartilhada do Workspace, R-11), **D-07**, **D-09**, e o restante do questionário. As pendências completas de cada mapeamento estão em `mapeamento-escavador.md` §15 e `mapeamento-trello.md` §13.

## Pendências com o usuário

- **Token do Escavador gerado** ✅ — mas ainda não usado. Aguarda aval do orçamento de chamadas
- ~~**Dados do painel do Escavador**~~ ✅ **Levantados em 20/08** — ver `07-painel-escavador-achados.md`, inclusive a tela de criação de token. Resta do Escavador apenas a **resposta do suporte** às perguntas da §10 (mensagem enviada em 20/08)
- **Número CNJ de um processo real do escritório** — trava a primeira chamada, que custa R$ 0,05 e resolve quatro perguntas de uma vez
- **URL pública de callback** — sem ela, o Bloco C do orçamento não pode ser executado
- **Credenciais do Trello** — chave de API, token e segredo da aplicação (este último é o que assina os webhooks)
- Acesso à instância n8n e à infraestrutura, para calibrar §12.2 de `01`
- Aval sobre as decisões propostas (D-03 a D-46)

## Riscos ativos

| Risco | Situação |
|---|---|
| **R-16** — Trello não tem escopo por quadro; token vê a conta inteira | **Grave e estrutural.** Tratado por desenho (D-36), mas o isolamento passa a depender do nosso código. Precisa ser dito ao escritório |
| **R-11** — conta única do Workspace compartilhada por toda a equipe | **Grave e aberto.** Inviabiliza privilégio por papel, aprovação nominal e auditoria |
| **R-12** — API do Escavador armazena certificado digital, senha e semente de 2FA | **Gravíssimo.** Tratado por desenho: rotas fora de todo perfil (D-30) |
| **R-15** — plano do Escavador pode não cobrir V1 | ✅ **Encerrado em 20/08.** O painel lista V1 e V2 inteiras, com preço, nada bloqueado |
| **R-22** — recarga do Escavador não é autosserviço, depende do comercial | **Novo e aberto.** Risco de prazo: o projeto para até o comercial responder |
| **R-24** — token do Escavador não tem escopo; alcança toda a API da organização | **Novo e grave.** Espelha o R-16 do Trello. Privilégio fica só no código do MCP. Agrava R-12 |
| **R-26** — o `mcp-core` concentra a fronteira de segurança dos dois servidores | **Novo e grave.** Consequência aceita de R-16 + R-24: com uma fronteira só, ela precisa ser auditada como tal (D-78) |
| **R-27** — janela entre revogar a sessão MCP e ela expirar | **Novo, moderado.** Sessão de minutos, lista de revogação, A4 reconsultando o Policy Gate |
| **R-28** — reserva por estimativa pode subestimar o custo nas rotas por bloco | **Novo, financeiro.** Reserva pelo pior caso permitido e teto de blocos por papel |
| **R-29 a R-32** — riscos do ClickUp: API de Chat experimental, sem identidade de robô, migração descarta o mapeamento do Trello, concentração em fornecedor único em dólar | **Novos, moderados e condicionais** — só se materializam se a migração for adotada (`10-clickup-avaliacao.md` §11) |
| ~~R-23~~ — o painel não exibiria a expiração do bônus | ✅ Encerrado no mesmo dia: o painel exibe "Válido até 23/08/2026" |
| **R-20** — token pessoal do Trello dá acesso à conta inteira e pode ser revogado sem aviso | **Aberto.** Depende da pergunta 66. Agrava R-09 |
| R-13, R-14, R-17 a R-19 | Tratados por desenho (D-29, D-32, D-40, D-46) |
| R-01 — rede bloqueada | **Resolvido.** Acesso a Escavador e Trello reconfirmado em 2026-08-20 |
| Demais (R-02 a R-10) | Registrados em `01` §15, tratados por desenho |
### A primeira chamada real foi feita — e recusada, sem custo

Com token e processo em mãos, `captura/capturar.mjs --executar` disparou a chamada A1. A resposta:

```
HTTP 403
{"error":"Seu saldo está bloqueado. Faça uma recarga para voltar a utilizar a API."}
```

🔴 **A prorrogação prometida em 21/08 não foi aplicada à conta.** O cabeçalho `Date` da resposta marca 23/08 — a data original de expiração. Registrado como **R-37**: promessa em atendimento não é estado de sistema, e o painel ("Válido até") é a única fonte do estado real.

**Três achados, custo R$ 0,00:**

1. **Nada foi debitado.** `Creditos-Utilizados` veio ausente. A trava do script abortou a fila na primeira chamada — que é a mais barata do catálogo por escolha de ordenação —, de modo que B1 e B2, de R$ 3,00 cada, nunca aconteceram
2. **O token está correto.** Token inválido responde 401; o 403 significa que a autenticação passou e quem recusou foi a cobrança
3. 🆕 **O erro de saldo é 403, e o OpenAPI não o documenta** — ele lista 402 para pagamento. **Isso muda o disjuntor** (D-33): um MCP que só tratasse 402 leria o 403 como problema de permissão e reagiria errado. Envelope: `{"error": "<texto>"}`, sem código de máquina. **Parte do Bloco D foi respondida sem gastar um centavo**

**O que destrava:** reabrir com o suporte do Escavador anexando a mensagem de 21/08. Enquanto o painel não mostrar "Válido até" numa data futura, não adianta tentar de novo — cada tentativa é só outro 403.

## As duas demos ficaram prontas, e ligadas — 24/08/2026

A **Demo A** (colaborador no Telegram) e a **Demo B** (cliente no WhatsApp) estão publicadas e ativas, sobre os 8 processos reais anonimizados. **Custo em crédito do Escavador: R$ 0,00.**

O que a Demo A faz: identifica quem falou pelo `user_id`, encontra o processo por número, apelido interno ou nome da parte, responde sobre o andamento, redige mensagem ao cliente e propõe com três botões — aprovar, editar, descartar. Editar não é atalho: o texto reescrito à mão volta com os mesmos três botões, porque quem reescreve pode não ser quem aprova.

O que a Demo B faz: **o escopo vem da lista, nunca da mensagem.** Pergunta sobre prazo é recusada em código, antes de chegar ao modelo. Processo de outra pessoa citado por número é recusado em código — defeito encontrado no teste ao vivo do usuário, em que o modelo improvisou uma promessa de retorno sobre caso alheio.

E o fio entre as duas: **aprovar no Telegram envia de verdade no WhatsApp do cliente** (D-99). Quem não é advogado não perde o trabalho: o clique dele **encaminha** a proposta ao advogado, com os mesmos três botões, e o desfecho volta para quem redigiu (D-100). A trilha passa a registrar as duas pessoas — quem redigiu e quem aprovou. O destinatário sai da mesma lista que a Demo B usa para decidir escopo — não sai da conversa, nem da redação do modelo, nem de um número digitado. É a Regra 1 aplicada ao caminho de volta: o poder de escolher para quem o escritório fala não mora dentro de um texto.

**155 verificações automáticas** rodam sem n8n, sem Telegram, sem WhatsApp e sem gastar token de modelo.

O que continua valendo do risco R-33: isto é demonstração. Não tem Policy Gate, não tem motor de custo, e usa WhatsApp não oficial em instância gratuita que **expira em 1 hora**.

## Próximo passo

Três caminhos que não competem entre si:

1. **Construir os marcos 1 a 5** da §15 da Spec — esqueleto, chassi, auditoria, motor de custo, cache. Nenhum consome crédito do Escavador nem depende de resposta do escritório
2. **Levar ao escritório** as cinco perguntas que destravam a Parte II, com destaque para a conta compartilhada, registrada como bloqueio de projeto (D-67)
3. ~~**Executar a captura** (Blocos A e B)~~ — ✅ **feita em 26/08.** Custou R$ 3,00, não os R$ 9,00 orçados (D-108)

**As duas chamadas pagas que restam autorizadas** — ambas gastam dinheiro, e por isso passam pela mão do usuário, não pela do agente. O hook `guarda-escavador.mjs` bloqueia o agente em código:

```bash
node captura/monitorar.mjs criar --executar --confirmo-custo-recorrente
```

```bash
node captura/atualizar.mjs solicitar --executar --confirmo-custo
```

Depois do C1, o acompanhamento é **gratuito** e pode ser repetido à vontade:

```bash
node captura/atualizar.mjs status --executar
```

A **Parte II** da Spec — matriz definitiva de escopos, modelagem da demanda, fluxos n8n — é escrita quando essas respostas chegarem.

## Decisões

**D-01 a D-46** estão em `01-diretrizes-gerais.md` §13.

- ✅ Confirmadas: D-01 (n8n como orquestrador), D-02 (camada MCP reutilizável)
- 🟡 Propostas aguardando aval do usuário: todas as demais, exceto as abaixo
- 🔴 Em aberto, dependem do escritório: **D-07** (advogado vê toda a base ou só sua carteira) e **D-09** (Trello é gestão de casos ou quadro de tarefas)

## Pendências com o escritório

**Elevadas em urgência pelos mapeamentos:**

- **Pergunta 58** — plano contratado do Escavador. Se não cobrir V1, o escritório fica sem monitoramento de diário oficial (R-15)
- **Pergunta 66** — é possível criar conta de serviço dedicada no Trello? Se não, R-20 fica sem tratamento
- **Pergunta 27** — Power-Ups e automações Butler ativos no Trello. Butler reage às nossas escritas; precisa ser inventariado antes da primeira gravação

Também abertas: perguntas **16a a 16c** (conta compartilhada do Workspace, R-11), **D-07**, **D-09**, e o restante do questionário. As pendências completas de cada mapeamento estão em `mapeamento-escavador.md` §15 e `mapeamento-trello.md` §13.

## Pendências com o usuário

- **Token do Escavador gerado** ✅ — mas ainda não usado. Aguarda aval do orçamento de chamadas
- ~~**Dados do painel do Escavador**~~ ✅ **Levantados em 20/08** — ver `07-painel-escavador-achados.md`, inclusive a tela de criação de token. Resta do Escavador apenas a **resposta do suporte** às perguntas da §10 (mensagem enviada em 20/08)
- **Número CNJ de um processo real do escritório** — trava a primeira chamada, que custa R$ 0,05 e resolve quatro perguntas de uma vez
- **URL pública de callback** — sem ela, o Bloco C do orçamento não pode ser executado
- **Credenciais do Trello** — chave de API, token e segredo da aplicação (este último é o que assina os webhooks)
- Acesso à instância n8n e à infraestrutura, para calibrar §12.2 de `01`
- Aval sobre as decisões propostas (D-03 a D-46)

## Riscos ativos

| Risco | Situação |
|---|---|
| **R-16** — Trello não tem escopo por quadro; token vê a conta inteira | **Grave e estrutural.** Tratado por desenho (D-36), mas o isolamento passa a depender do nosso código. Precisa ser dito ao escritório |
| **R-11** — conta única do Workspace compartilhada por toda a equipe | **Grave e aberto.** Inviabiliza privilégio por papel, aprovação nominal e auditoria |
| **R-12** — API do Escavador armazena certificado digital, senha e semente de 2FA | **Gravíssimo.** Tratado por desenho: rotas fora de todo perfil (D-30) |
| **R-15** — plano do Escavador pode não cobrir V1 | ✅ **Encerrado em 20/08.** O painel lista V1 e V2 inteiras, com preço, nada bloqueado |
| **R-22** — recarga do Escavador não é autosserviço, depende do comercial | **Novo e aberto.** Risco de prazo: o projeto para até o comercial responder |
| **R-24** — token do Escavador não tem escopo; alcança toda a API da organização | **Novo e grave.** Espelha o R-16 do Trello. Privilégio fica só no código do MCP. Agrava R-12 |
| **R-26** — o `mcp-core` concentra a fronteira de segurança dos dois servidores | **Novo e grave.** Consequência aceita de R-16 + R-24: com uma fronteira só, ela precisa ser auditada como tal (D-78) |
| **R-27** — janela entre revogar a sessão MCP e ela expirar | **Novo, moderado.** Sessão de minutos, lista de revogação, A4 reconsultando o Policy Gate |
| **R-28** — reserva por estimativa pode subestimar o custo nas rotas por bloco | **Novo, financeiro.** Reserva pelo pior caso permitido e teto de blocos por papel |
| **R-29 a R-32** — riscos do ClickUp: API de Chat experimental, sem identidade de robô, migração descarta o mapeamento do Trello, concentração em fornecedor único em dólar | **Novos, moderados e condicionais** — só se materializam se a migração for adotada (`10-clickup-avaliacao.md` §11) |
| ~~R-23~~ — o painel não exibiria a expiração do bônus | ✅ Encerrado no mesmo dia: o painel exibe "Válido até 23/08/2026" |
| **R-20** — token pessoal do Trello dá acesso à conta inteira e pode ser revogado sem aviso | **Aberto.** Depende da pergunta 66. Agrava R-09 |
| R-13, R-14, R-17 a R-19 | Tratados por desenho (D-29, D-32, D-40, D-46) |
| R-01 — rede bloqueada | **Resolvido.** Acesso a Escavador e Trello reconfirmado em 2026-08-20 |
| Demais (R-02 a R-10) | Registrados em `01` §15, tratados por desenho |
