# Estado Atual

| Campo | Valor |
|---|---|
| Atualizado em | 2026-09-02 |
| Crédito Escavador | 🔴 **EXPIRADO em 01/09/2026.** Foram gastos **R$ 6,00 de R$ 50,00** em 21 requisições; os **R$ 44,00 restantes evaporaram** — saldo de teste não vira crédito. O programa de validação de contrato foi cumprido quase inteiro (ver §"O saldo de teste expirou"). **Nenhuma chamada nova sem recarga**, e recarga é decisão do usuário, negociada com o comercial (R-22) |
| Callback | ✅ **PROVADO, E EM PRODUÇÃO DE FATO.** Receptor `OymAtbNYI1pjfWkA`: **35 entregas** — 33 `autentico` e 2 `RECUSADO` (os testes sem `Authorization`). ⚠️ O webhook é `responseMode: onReceived`, então **toda execução aparece como `success`** no painel, inclusive a recusada — o "não" está no dado, não no status. 🔴 **E ele não guarda nada** (D-181): dois nós, webhook e carimbo, sem gravação. O evento vive só no histórico do n8n, que é onde a RNF-08 diz que não pode viver |
| ⚠️ **Assinaturas ativas** | **1 — id `2813617`**, vigilância em diário, renovação em **26/09**. 🔄 **A leitura mudou em 02/09 (D-182): ela não é resíduo de teste — é a fonte viva do contrato de prazo**, entregando ~6 publicações reais por dia útil a custo zero. Removê-la deixou de ser faxina e virou decisão sobre a frente E2, a ser tomada **antes de 26/09**. O risco de renovação sem ninguém olhando continua de pé; o que mudou é que agora há alguém olhando |
| ✅ **Aparição** | 🟢 **MEDIDA — 30 entregas reais, e o custo foi R$ 0,00.** O contrato que se dava por perdido chegava por **callback** desde 27/08, e segue chegando: ~6 publicações por dia útil, de 22 processos, **26 delas intimação** — a publicação que faz prazo correr. **13 chegaram depois de a cota expirar**, porque callback não depende de saldo. 🔴 **E o polling errou:** as leituras de `/aparicoes` voltaram vazias no mesmo dia em que o callback entregava (R-55). Contrato em `15-contrato-da-aparicao.md`; D-177 a D-182 |
| Bloco C | ✅ **FECHADO de ponta a ponta, e custou R$ 0,00.** Solicitação `55413945` concluiu em 3h45, o n8n recebeu 2 segundos depois com `veredito: autentico`. E revelou que **o `uuid` do Escavador não serve como chave de idempotência** — ver `06-orcamento...` §5.6 |
| 🟢 **O escritório respondeu** | **27/08.** Cinco perguntas que travavam o PRD voltaram: identidade individual **pelo Telegram** (D-147), advogado vê **a base inteira** (D-146), Trello é **visualização** (D-152), colaborador **também confere prazo** (D-145), e a infra é **do prestador** (D-148). **D-07 e D-09 estão resolvidas.** PRD na v2.0; D-142 a D-154 e R-46 a R-49 somados. Ver §"As respostas do escritório chegaram" |
| 🔎 **Revisão externa** | **28–31/08.** O Codex revisou o projeto inteiro. **A maior parte procede** — 12 achados abertos, do webhook aberto da Demo B ao disjuntor contornável. **Um virou trava (D-155):** a Demo B afirma ao cliente que um advogado revisou o texto, e nenhum revisa — a frase **fica**, porque a demo mostra o texto de produção, e o que entrou foi a amarra que impede a frase de sobreviver sem o aviso de demonstração. Três achados **não** procedem — os arquivos de exemplo são fictícios, os processos estão de fato anonimizados (nomes E número CNJ), e os pacotes vazios são esqueletos de marco. **Onze dos doze achados foram fechados** — cinco em 31/08 e seis em 01/09 — webhook autenticado, auditoria antes do ato, disjuntor por segmento, segredo de justiça fechando, a D-142 dentro do código (D-156), e o **isolamento entre escritórios em duas camadas** (D-157), **uso único de aprovação** (D-158) e os menores. Falta só o **HMAC no anonimizador, adiado por decisão do usuário até depois da apresentação** (D-159). Ver §"Uma revisão externa passou no projeto inteiro" |
| Fase | **3 — construção.** **Marcos 1, 2 e 3 fechados e verificados**: monorepo e migrações; o chassi, com a matriz de escopo passando inteira; e **a auditoria, que grava, recusa alteração e reconstrói a operação pelo `requisicao_id`**. PRD (v2.0) e Spec Parte I (v1.2) aguardam aval; **a Parte II está quase destravada** — falta só o levantamento do Trello e os números do escritório |
| Branch | `claude/law-firm-ai-automation-6pwaug` |
| Código | ✅ **Fundação, chassi e auditoria de pé, os três verificados.** Monorepo com 9 pacotes, **10 migrações** aplicadas num PostgreSQL 16 (23 tabelas) com **45 de 45 provas de regra**, **23 de 23 provas de auditoria contra o banco de pé**, e **92 testes passando** — 69 do domínio, do chassi e da auditoria, 12 do disjuntor de crédito. `npm run verificar` roda os três. O banco recusa conta compartilhada, alteração de auditoria, estouro de orçamento e evento duplicado. Mais: captura, importador de autos em PDF, anonimizador, cliente do n8n e **as duas demos rodando** — A no Telegram (`ZPh3DxptHFIyWETO`, **31 nós, 162 verificações**) e B no WhatsApp (`Hxc7uAmAUhyPE7E1`, **15 nós, 106 verificações** — a recusa agora chama um advogado no Telegram, D-163), **ligadas uma na outra**: aprovar no Telegram envia ao cliente |
| Regras de cobrança | ⚠️ **Duas das quatro caíram.** Valem: callback é grátis (3 entregas, R$ 0,00); "200 itens" são aparições. **Não valem:** a tarifa plana de R$ 3,00 (débito por rota, D-108) nem o teto de 16 requisições (18 feitas, saldo intacto, D-119). Ver `06-orcamento...` §5.3 |
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

**Ainda não remova (D-121).** Falta a última medição do experimento: **a aparição** — a peça que dispara prazo, o contrato central de E2 e da D-62, e o único que nunca foi visto. A rota é **gratuita**:

```bash
node captura/monitorar.mjs aparicoes 2813617 --executar
```

O custo de esperar é zero: a assinatura já foi paga e só renova em **26/09**, bem depois de o crédito expirar em 01/09. Vale rodar a cada dia ou dois — diário oficial publica em dias úteis, e o termo é o nome de uma advogada só, então pode levar dias até aparecer alguma coisa.

**Depois de capturar uma aparição — ou até 22/09, o que vier primeiro:**

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

### O callback chegou, e trouxe um problema de arquitetura junto

A solicitação `55413945` concluiu às **21:54:35**, 3h45 depois de pedida. O n8n registrou a entrega **2 segundos depois**, com `veredito: autentico`. O ciclo assíncrono inteiro — pedir, esperar, receber, validar — está provado.

**Os dois caminhos do receptor foram exercitados**, e isso é o que o torna confiável:

| Entregas | O que era | Veredito |
|---|---|---|
| 2, às 15:05 | `curl` com `{"teste": true}`, **sem `Authorization`** | ✅ `RECUSADO` |
| 3, entre 20:16 e 22:20 | Escavador, com `Authorization` | ✅ `autentico` |

#### 🔴 O `uuid` do Escavador não serve para deduplicar

A **mesma solicitação chegou três vezes**, com `uuid` diferente em cada uma — e duas com corpo idêntico, salvo o próprio `uuid`. Ou seja: o `uuid` identifica a **tentativa de entrega**, não o evento.

A Spec dizia para preferir o identificador do fornecedor e só cair no resumo do conteúdo quando ele faltasse. **A preferência estava invertida.** Seguir a versão antiga faria a terceira entrega passar como novidade — e neste domínio "novidade" vira prazo lançado, tarefa criada e advogado avisado. Duas vezes, sem erro nenhum aparecer.

Pior: a mesma `atualizacao.id` **concluiu duas vezes**, com `concluido_em` diferente (19:47 e 21:54). Chave por `id` sozinha descartaria a segunda — que é a que vale.

Spec §8.3 reescrita: a chave é **sempre o resumo do conteúdo, com o envelope de entrega removido antes do resumo**. D-116, D-117, D-118 e R-43 registrados; detalhes medidos em `06-orcamento...` §5.6.

**Custo do Bloco C inteiro: R$ 0,00.** Estava orçado em R$ 3,00.

**O que falta:** nada do Bloco C. A vigilância em diário (id `2813617`) segue ativa, **para remover até 22/09**.

### O painel foi conferido, e fecha duas contas — 26/08

O histórico de requisições do painel bate **linha a linha** com `captura/registro-de-execucao.local.json`: 18 requisições, 17 em 26/08 e uma em 23/08, nenhuma a mais e nenhuma a menos. O nosso registro é confiável — o que importa, porque é dele que sai todo o controle de gasto.

**1. Os dois 422 não cobraram.** Saldo segue **R$ 47,00**. Pendência encerrada.

**2. O "teto de 16 requisições" não existe.** Foram **18** requisições e o saldo não se mexeu além dos R$ 3,00 medidos. O número 16 nunca foi um limite do fornecedor — era R$ 50,00 ÷ R$ 3,00, uma conta nossa, feita sobre a tarifa plana que também não existe. **A cota é de dinheiro, e só.** Rota gratuita não consome nada (D-119).

Isso muda o planejamento: sobram **R$ 47,00**, não "12 requisições". Chamada gratuita passa a ser ilimitada de fato — e a maior parte do que ainda queremos saber está em rota gratuita.

#### ⚠️ O texto de erro do painel não é o erro que a API devolveu

| Requisição | Corpo que a API devolveu | Texto no painel |
|---|---|---|
| `POST /v1/monitoramentos` 422 | *"Você já monitora este termo"* | *"Muitas requisições foram feitas em pouco tempo"* |
| `POST .../solicitar-atualizacao` 422 | *"Não é possível solicitar atualização de documentos públicos e autos ao mesmo tempo"* | *"Muitas requisições foram feitas em pouco tempo"* |
| `GET .../envolvidos` 403 (23/08) | *"Seu saldo está bloqueado"* | *"O token utilizado não possui permissão para acessar este recurso"* |

O painel exibe um **texto genérico por código HTTP**, não o motivo real. Nos três casos ele aponta para a causa errada — e nos dois primeiros aponta para *limite de vazão*, que mandaria alguém esperar e tentar de novo quando o problema era o corpo da requisição. Tentar de novo custa dinheiro.

**Consequência de projeto:** o diagnóstico vem do **corpo da resposta**, que o `capturar.mjs` e o `atualizar.mjs` já gravam em `respostas-brutas/`. O painel serve para conferir **saldo e volume**, nunca para descobrir por que algo falhou (D-120, R-44).

É a terceira vez que uma fonte oficial do Escavador diz uma coisa e o sistema faz outra — depois da tarifa plana (D-108) e da prorrogação que não existia na conta (R-37).

### 🔴 A chave de API do n8n vazou duas vezes no mesmo dia

Primeiro por um comando do assistente que imprimiu o JWT inteiro no histórico. Depois — pior — pela própria ferramenta criada para evitar isso: o `guardar-segredo.mjs` prometia esconder a digitação, **não escondeu no PowerShell**, e ainda imprimiu com todas as letras *"o valor não foi exibido em momento nenhum"*.

O bloqueio de eco era um remendo em `process.stdout.write`, que não segura o eco do terminal do Windows. Reescrito para desligar o eco onde ele mora — modo cru — e para **recusar** quando não conseguir, em vez de tentar (D-114, R-42).

**✅ Encerrado em 26/08.** A correção foi exercitada com valor descartável antes do uso real — o eco ficou mudo —, a chave nova foi gravada e **as duas anteriores foram revogadas** pelo usuário. A chave nova já foi usada para ler as execuções do n8n, então está funcionando.

Fica a regra, que é o que sobrevive ao incidente: **ferramenta de segredo se testa com lixo antes de receber o segredo** (D-114).

> ✅ O bloco duplicado que existia neste documento (seções repetidas de "As duas demos" até "Riscos ativos") foi removido em 26/08. Era colisão entre sessões paralelas.

## O marco 1 fechou — 27/08/2026

A construção começou. O marco 1 da §15 da Spec — **esqueleto do monorepo, esquema do banco e migrações** — está escrito. Detalhes em `docs/12-fundacao-marco-1.md`.

### O que existe agora

| Peça | O que é |
|---|---|
| `package.json` + `tsconfig.base.json` | Monorepo com **9 pacotes**, ligados por referências de projeto. `npx tsc --build` compila os 9 |
| `infra/docker-compose.yml` | PostgreSQL 16, escutando **só em 127.0.0.1**, com `healthcheck` |
| `dados/migracoes/*.sql` | **7 migrações, 22 tabelas** — governança, chassi e vigilância |
| `ferramentas/banco/subir.mjs` | O "um comando": sobe, espera aceitar conexão, migra |
| `ferramentas/banco/migrar.mjs` | Migrador próprio, sem biblioteca e sem `npm install` |
| `dados/precos-escavador.json` | Catálogo de preços com o que foi **medido**, com `lido_em` e `fonte` |

### ✅ E foi verificado contra um banco de verdade

As 7 migrações aplicaram do zero em 27/08 às 05:08, num PostgreSQL 16 — **23 tabelas** no banco.

Mas "as migrações rodaram" não é a prova que interessa. O que este marco afirma é mais forte: que o banco **recusa** o que as regras proíbem. Isso virou comando:

```bash
npm run banco:conferir
```

Ele **tenta fazer cada coisa proibida** e falha se alguma passar. Cada caso monta o cenário, tenta, e termina em `ROLLBACK` — nada fica no banco. **25 de 25 corretos.**

Recusou: dois usuários no mesmo WhatsApp · faixa A4 com estagiário · estagiário com OAB · advogado sem OAB · `UPDATE`, `DELETE` e `TRUNCATE` na auditoria · gasto além do limite · evento de callback duplicado · publicação duplicada · CNJ malformado · vínculo verificado sem autor · vigilância desativada sem autor · alerta sem origem.

Aceitou o que deve aceitar: reaproveitar um número **já revogado**, e reservar **exatamente** até o teto. Isso importa tanto quanto o resto — barreira que barra o caminho legítimo é barreira que alguém desliga.

E a trava da história imutável (D-127) também foi provada: editei uma migração já aplicada e o migrador recusou de rodar, nomeando o arquivo.

### As seis regras que viraram restrição do banco

O trabalho principal não foi criar tabelas; foi transformar regra escrita em coisa que o banco recusa.

| Regra | Como ficou no banco |
|---|---|
| **7** — nada de conta compartilhada | Índice único em `identidade_externa`: duas pessoas no mesmo número **colidem** |
| **2** — ato jurídico exige advogado | `CHECK` que impede faixa A4 com papel que não seja advogado ou sócio |
| **auditoria imutável** | Gatilho que recusa `UPDATE`, `DELETE` **e `TRUNCATE`** — vale até para o dono do banco — mais a ausência de permissão para a aplicação |
| **5** — negar por padrão | `processo.sigiloso` nasce `true`; a aplicação recebe só `SELECT` e `INSERT`, e o resto é concedido tabela a tabela |
| **6** — custo é requisito | `CHECK (consumido + reservado <= limite)`: o teto é do banco, não do código |
| **idempotência** | Índice único sobre o resumo do **conteúdo**, não sobre o identificador do fornecedor |

**Sobre o `TRUNCATE`:** ele não dispara gatilho por linha. Sem uma cláusula própria, a tabela "imutável" se esvazia inteira com um comando — e o gatilho existente daria uma impressão de proteção que não havia.

### Três ausências deliberadas

- **Não existe `alerta.prazo_calculado`.** A plataforma sinaliza indício; quem conta prazo é advogado (RF-11, D-64)
- **Não existe `alerta.lido` booleano.** Existem `lido_por` e `lido_em`, porque escalar exige saber **quem** não leu
- **Não existe `DELETE` para `publicacao` e `movimentacao`.** Apagar uma é apagar a justificativa de um aviso já dado. O único `DELETE` de todo o esquema é o do cache

## O marco 2 fechou — o chassi existe · 27/08/2026

O `mcp-core` está escrito e testado. É o lugar onde a **Regra 1** deixa de ser princípio e vira código. Detalhes em `docs/13-chassi-marco-2.md`.

### A ideia, em uma frase

> **A ferramenta declara; o chassi decide.**

Uma ferramenta não chama o Policy Gate, não lê token, não mede custo, não escreve auditoria e não decide se pode. Ela declara o que é — faixa, escopo, sujeito, entrada — e o chassi faz o resto.

O motivo é de segurança, não de elegância: se cada ferramenta aplicasse o próprio controle, a fronteira de segurança passaria a depender da disciplina de quem escreve ferramenta, e bastaria **uma** esquecer **uma** linha. Com o chassi no caminho obrigatório, **não existe caminho alternativo até a API** — a ferramenta não recebe credencial, nem a sessão, nem cliente HTTP.

### O critério de aceite: a matriz de escopo

```bash
npm test
```

**44 testes, 44 passando** — 25 deles a matriz de escopo (papel × ferramenta × abrangência).

Cada caso confere **duas** coisas: o veredito, e **se a execução foi alcançada**. A segunda é a que mais importa: RF-07 tem duas metades — não vazar e **não pagar** —, e um teste que só olhasse o código de erro passaria mesmo se o chassi recusasse *depois* de chamar a API. O cenário conta as chamadas ao fornecedor, e toda recusa exige o contador em zero.

### Cinco decisões que carregam peso

**Decisão é valor, nunca exceção.** Exceção é um canal que se fecha sem querer — basta um `catch` vazio numa camada acima para uma recusa de privilégio virar silêncio, e silêncio, num sistema que nega por padrão, é indistinguível de permissão. O pior é que o defeito não apareceria em teste nenhum: a chamada **funcionaria**.

**Não existe curinga, e `write` não implica `read`.** Curinga concede o que ainda não foi escrito, inclusive a ferramenta perigosa que alguém acrescenta daqui a seis meses.

**Escopo sem abrangência escrita vale como `own`** — o mínimo, não o máximo. É o engano mais comum, e o padrão seguro é o estreito.

**Chamada sem sujeito, sob `own` ou `carteira`, é recusada.** "Nada a conferir" não pode virar "tudo liberado" — é o que acontece quando alguém escreve uma ferramenta nova e esquece o `sujeito`.

**A mensagem de recusa é idêntica à de "não encontrei".** Byte a byte. Se fossem distinguíveis, qualquer pessoa com acesso ao canal poderia varrer números e descobrir quais processos existem no acervo — o sistema viraria um oráculo de existência. Há teste comparando os dois textos.

### Travas que agem na carga, e o servidor não sobe

`definirFerramenta` recusa a declaração se houver campo de entrada com nome de credencial (`token`, `senha`, `api_key`, `chave`) ou escopo com abrangência. Sem a primeira, bastaria declarar `entrada: { token: texto() }` para o agente — que lê conteúdo externo, e conteúdo externo é hostil — escolher com qual credencial a plataforma fala com o fornecedor.

E na chamada: **parâmetro que ninguém declarou é recusado, não ignorado.**

### Duas coisas mais

**`402` — sem saldo — nunca é repetível.** Repetir não resolve, e cada tentativa enche o histórico e pode gastar. É a interseção exata entre a Regra 5 e a Regra 6.

**Auditoria indisponível bloqueia** (D-77), já valendo: se o registro falhar, a chamada devolve erro mesmo quando seria permitida. Há teste exercitando justamente o caminho feliz com a auditoria fora do ar.

## O marco 3 fechou — a auditoria grava e reconstrói · 31/08/2026

`services/auditoria` saiu do esqueleto. Detalhes em `docs/14-auditoria-marco-3.md`.

O critério de aceite **não** era "a tabela aceita INSERT" — ela já aceitava desde o marco 1. Era conseguir contar, meses depois, o que aconteceu numa operação e por quê. Por isso a verificação roda **o chassi de verdade**, com a auditoria de PostgreSQL no lugar da de memória, e depois pergunta ao banco o que aconteceu:

```
npm run banco:auditoria     →  23 de 23 corretos
npm run verificar           →  25 de 25 · 23 de 23 · 81 testes
```

### O que a prova cobre

Uma **recusa** e um **sucesso** atravessam o chassi e viram registro; a operação se remonta pelo `requisicao_id`, dizendo quem agiu, com que papel, por qual canal, qual etapa recusou e com que código; `UPDATE` e `DELETE` são recusados **para o papel da aplicação**; o consumo grava na mesma transação do ato; e a auditoria fora do ar **bloqueia a chamada sem tocar no fornecedor**.

Esse último é o que dá sentido à correção de 31/08 que moveu o registro para antes da execução: o teste aponta uma conexão de verdade para uma porta onde não há banco — não é um dublê que lança, é a falha que de fato acontece às três da manhã — e confere que o contador de chamadas ao fornecedor **não se moveu**.

### As decisões que carregam peso

**A auditoria conecta como `lex_app`, nunca como o dono** (D-157). Conectar como dono não quebraria teste nenhum: o gatilho continuaria recusando e tudo pareceria certo, enquanto o desenho de duas camadas virava uma em silêncio. A segunda camada existe porque a primeira é um objeto do banco que quem tem DDL pode remover.

**O resumo recusa dado pessoal, e recusa em vez de limpar** (D-158). A imutabilidade que protege a prova protegeria o vazamento com o mesmo empenho: **dado pessoal que entra ali não sai nunca mais**, e um pedido de eliminação sob a LGPD encontra uma tabela desenhada para recusá-lo. A barreira fica antes do INSERT porque depois não existe conserto, existe incidente. E a mensagem de recusa não repete o que encontrou, para não escrever o dado no log.

**`aprovacao_id` entra no evento** (D-159) — achado 4 da revisão. A pergunta que se faz depois de um ato A4 dar errado não é "houve aprovação?", é "de quem foi a assinatura?".

**A consulta de trilha exige `inquilino_id`** (D-160). `requisicao_id` sozinho atravessa inquilinos — o mesmo defeito do comentário da migração 005.

### 🔴 O achado da integração: a sessão precisa estar no banco

`evento_auditoria.sessao_id` tem chave estrangeira para `sessao`. A primeira execução da prova falhou aí, e a falha ensina algo que não estava escrito em lugar nenhum:

> Uma sessão emitida pelo Policy Gate e mantida **só em memória** torna toda chamada dela irregistrável — e, pela D-77, **impossível**.

O acoplamento está certo. O desagradável é o sintoma: não é "a auditoria falhou", é **"a plataforma inteira parou"**, e nada no erro aponta para a sessão. Virou **R-50**, e é exigência para o Policy Gate do marco 9.

### Duas consequências que mudam hábitos do repositório

**Entrou a primeira dependência de produção** (D-161): o `pg`. Ferramenta fala com o banco por `docker compose exec psql`; serviço não pode — um processo por gravação é inviável quando toda chamada gera pelo menos uma.

**A prova deixa resíduo, e é para deixar** (D-162). Um teste de *append-only* que conseguisse limpar a si mesmo teria acabado de refutar o que veio testar. `npm run banco:zerar` recomeça.

## As respostas do escritório chegaram — 27/08/2026

Cinco perguntas travavam o PRD desde 20/08. Todas voltaram, e três delas mudaram desenho. O PRD subiu para a **versão 2.0**; a Spec, para a **1.2**.

### O que o escritório respondeu

| Pergunta | Resposta | Decisão |
|---|---|---|
| Conta compartilhada (16a–16c, P-01) | **Identidade individual pelo Telegram**, uma conta por colaborador e por advogado, todas identificadas. Não vão contratar licenças do Workspace agora, para evitar gasto no início — e **aceitaram os riscos por escrito** | **D-147** |
| D-07 — advogado vê tudo ou só a carteira? | **A base inteira.** "Eles se ajudam nos processos um do outro" | **D-146** |
| D-09 — Trello é fonte da verdade? | **Não. É quadro de trabalho** — visualização | **D-152** |
| D-64 — quem confere indício de prazo? | Advogado conta o prazo, **mas os colaboradores também verificam** | **D-145** |
| Instância n8n | **É a minha**, fornecida junto com o serviço | **D-148** |

### As três que mudam desenho

**1. A identidade individual existe — e R-11 só foi resolvido pela metade.**

O Caminho B da Nota Técnica 01 foi o escolhido, e a aposta de desenho se pagou: o documento `04` valia igual nos dois caminhos, e **nada estrutural precisou mudar**. RF-01, aprovação nominal e a **faixa A4** (D-25) estão destravados.

Mas a metade que não foi resolvida importa: **e-mail e Drive continuam numa conta única.** Quando E3 for construída, ela vai ler de uma caixa que nenhuma pessoa responde individualmente. R-11 fica aberto, com o escopo reduzido e escrito.

E o Caminho B cobra um preço novo — **R-47**: a conta de Telegram é ancorada em número de telefone e **o escritório não a administra**. Desligar alguém do escritório não desliga o Telegram dela. O tratamento é revogar o vínculo na plataforma (que é o desligamento que de fato importa), exigir 2FA como condição do vínculo, e manter conteúdo confidencial fora do corpo da mensagem — só notificação e link.

**2. Advogado com base inteira: a barreira sai, o espelho entra.**

Bloquear atrapalharia exatamente a colaboração que o escritório descreveu como sua operação real. Então o controle removido é substituído por **registro**, não por permissão: acesso a processo fora da própria carteira é marcado como **acesso amplo** e vai a relatório mensal (RF-37). Segredo de justiça continua exigindo escopo próprio, que abrangência ampla **não** concede (RF-38).

🚧 Ficou em aberto o mesmo ponto para o **colaborador** — a resposta falou só de advogados. Até que venha, ele segue em `carteira` (pergunta 4a, nova).

**3. A aprovação humana deixou de ser pedágio em toda mensagem.**

Foi a objeção mais forte do escritório, repetida três vezes: exigir aprovação de tudo anula o ganho de eficiência. A objeção está certa, e a resposta não foi afrouxar a Regra 2 — foi separar dois casos que estavam misturados (**D-142**):

- **A3a — gabarito pré-aprovado:** texto aprovado por advogado **antes**, com lacunas preenchíveis apenas por campo verificado da base interna. Sai sozinho, registrado, amostrado depois e desligável na hora
- **A3b — texto livre:** continua exigindo aprovação mensagem a mensagem

O advogado continua aprovando o texto exato que sai — ele só aprova antes, uma vez, para todos os casos iguais. Aprovar mil vezes o mesmo parágrafo não é controle, é ritual. E o que **nunca** sai sem leitura humana continua sendo texto novo sobre situação imprevista, que é onde mora o risco.

A autonomia cresce **pelo catálogo** (D-151): caso com 20 aprovações consecutivas sem edição vira candidato a gabarito. É a resposta à pergunta "em algum momento o agente responde sozinho?" — sim, e cada vez mais, mas por evidência medida, não por decisão de confiar.

Risco novo que isso cria, e que precisa de antídoto: **R-49**, gabarito envelhece em silêncio. Tratamento: revisão datada, amostragem pós-envio, desligamento imediato por qualquer advogado, e taxa de correção pós-envio como contramétrica declarada.

### 🔴 O achado técnico da rodada: a franquia de aparições não é editável

Ao escrever o procedimento do alarme de 70%, a pergunta óbvia era "e aí, aumenta a franquia". O mapeamento respondeu que não: o `PUT /api/v1/monitoramentos/{id}` aceita **`origens_ids` e `variacoes`, e só** — `limite_aparicoes` não está lá. A rota equivalente da V2, que se parece com esta, **aceita**.

Isso muda o tratamento de R-40 inteiro (**R-46**, **D-150**): **a criação é o único momento de controle**, e o alarme de 70% pede um *procedimento*, não um ajuste de número — refinar `variacoes` se for ruído, cobrir os processos críticos por V2 se for volume real, reforçar a conferência humana, e registrar o consumo do ciclo para dimensionar o próximo.

*Lido do OpenAPI, não medido. Conferir antes de implementar — e é conferência gratuita.*

### O canal do cliente passou a custar zero, e a decisão foi do escritório

O escritório perguntou quanto custa uma consulta paga de cliente, e concluiu sozinho que o melhor é escalar para um humano em vez de gastar. **Está certo, e foi adotado** (D-144): capa e movimentações são as duas rotas de R$ 3,00 do catálogo, que é exatamente o que uma pergunta de cliente pediria.

Agora o agente do cliente **nunca** dispara chamada paga. Dado ausente ou vencido vira escalada, com aviso honesto ao cliente. A exposição financeira do canal externo passa a ser **exatamente zero em crédito do Escavador** — e zero não precisa de teto, alarme nem disjuntor. Some junto a pergunta "qual é o teto por conversa?", que não tinha boa resposta.

### O que ficou pendente, e de quem

| Pendência | De quem |
|---|---|
| **Aval das decisões D-142 a D-152** | Usuário |
| **Os números** — franquia de aparições, tetos de bloco, tetos de orçamento | Escritório. O texto para a conversa com a advogada proprietária está pronto no PRD §9.3.1 |
| **Perguntas novas 4a, 4b, 4c e 20a–20d** | Escritório |
| **Perguntas 26 e 27 (Trello)** | ⚙️ **Reatribuídas a nós** — o escritório não sabe responder. Depende da chave de API |
| **D-62** — vigiar diário por nome de advogado | Escritório vai confirmar |
| Saldo do Escavador, credenciais do Trello, WhatsApp oficial | Em providência |

### Correção de numeração

Duas decisões vindas do suporte do Escavador em 25/08 estavam numeradas **D-101 e D-102**, colidindo com as decisões da demo de 26/08. Foram renumeradas para **D-153** e **D-154**. Nenhum outro documento as referenciava — a correção não deixou ponta solta.

## Uma revisão externa passou no projeto inteiro — 28/08/2026

O Codex revisou tudo o que existe. **A maior parte dos achados procede**, e três não procedem — vale registrar os três, porque cada um deles é uma leitura que a próxima revisão pode repetir.

### O que foi corrigido nesta rodada

**A Demo B afirma, ao cliente, que um advogado revisou o texto — e nenhum revisa (D-155).** A nota veio da Demo A, onde a frase é fato porque o texto para no Telegram e só sai com o clique de quem tem o papel. Na rota de consulta da Demo B o modelo escreve e a Uazapi envia, sem parar em ninguém.

**A frase permanece, por decisão do usuário, e a decisão está certa.** A demonstração existe para mostrar ao escritório **como será** o atendimento em produção, onde a aprovação existe — maquete tem de mostrar o rodapé da casa pronta. E o contexto que torna isso inofensivo é verificável, não presumido: a única destinatária cadastrada é quem conduz a demo, e o aviso `⚠️ DEMONSTRAÇÃO` sai no topo de toda resposta, imediatamente acima da nota.

**O que entrou não foi um texto, foi uma amarra.** O risco nunca foi a demo: é ela virar produção com a frase intacta e o aviso removido. A trava de `demo/testar-fluxo-b.mjs` **não proíbe a afirmação — condiciona-a**:

> Enquanto o texto afirmar revisão humana, o fluxo é obrigado a carregar o aviso de demonstração **ou** ter um nó de aprovação.

Verificada nos três cenários: demo de hoje passa; produção descuidada (frase sem aviso, sem aprovação) **reprova**; produção correta (frase com nó de aprovação) passa. Quem tirar o aviso para atender cliente real encontra o teste no caminho, e a escolha vira explícita em vez de silenciosa.

Isso **não** conserta a rota: pela D-142 aquele texto é livre, portanto **A3b**, que exige aprovação mensagem a mensagem. A rota segue enviando sozinha, e nessa forma **não atende cliente real**.

### Cinco achados fechados em 31/08

| Achado | O que mudou | Prova |
|---|---|---|
| **Webhook da Demo B sem autenticação** | Segredo no caminho, **gerado sozinho na primeira execução** — o estado inseguro deixou de ser alcançável por esquecimento. Vai no caminho e não em cabeçalho porque a config de webhook da Uazapi aceita `url`, `events` e `enabled`, e nada mais. O JSON versionado leva um marcador; o valor real só vai para o n8n | 3 verificações novas, uma delas garantindo que o segredo não volte ao Git |
| **Chassi executava antes de auditar** | O registro da autorização foi para **antes** de `executar`. Se a gravação falha, nada foi executado — "falha fecha" que fechava depois do fato não fechava nada | 4 testes, todos rodados contra o chassi anterior: **4 reprovam lá** |
| **`registrar()` síncrono** | Virou `Promise<void> \| void`, e o chassi aguarda. Era o achado mais difícil de ver: a auditoria do marco 3 grava em PostgreSQL, a promessa rejeitaria sozinha longe do `try/catch`, e a trava da D-77 sumiria em silêncio com o teste verde | Teste com auditoria que rejeita promessa |
| **Disjuntor contornável** | Análise **por segmento**. `monitorar.mjs listar --executar && capturar.mjs --executar` era liberado pela metade inocente. O segmentador junta continuação de linha antes de quebrar em `
` — senão o conserto abriria um furo novo | Arquivo de teste novo, 12 casos; **3 reprovam no hook anterior** |
| **Segredo de justiça falhando aberto** | `false` explícito em `capturar.mjs`; terceiro estado `null` em `importar-autos.mjs`; `?? true` em `anonimizar.mjs`. **Achou um caso real:** o AUTOS-08, trabalhista do TRT8, não tem o rótulo na capa e vinha sendo importado como público havia uma semana | Importador marca ❓ e lista o problema |

E mais uma que não estava na lista do revisor, porque nasceu da leitura dos documentos: **a D-142 entrou no código (D-156)**. `A3` puro deixou de existir, **A3b passou a exigir papel de advogado** — um estagiário aprovava comunicação externa até 31/08 — e A3a é recusada na carga enquanto o catálogo de gabaritos não existir.

### O isolamento entre escritórios fechou — 01/09

Era o achado que eu tinha classificado como **órfão no roteiro**: os dez marcos da Spec §15 não têm dono para ele, e o marco 1 já passou sem incluí-lo. Foi feito agora porque **agora é o momento mais barato que vai existir** — quatro fatos sustentam isso:

| Fato | Por que importa |
|---|---|
| `lex_app` é papel comum, não dono das tabelas | Política por linha **não se aplica** ao dono nem a superusuário. A migração 007 já separava os dois por outro motivo — deixar a auditoria imutável — e a pré-condição difícil já estava satisfeita por acidente de bom desenho |
| Havia **um** consumidor do banco | Um `SET LOCAL` num helper. Os marcos 4 a 9 trazem cinco consumidores novos, e cada um escrito antes seria mais um lugar para retrofit |
| Não há dado em produção | As chaves compostas entraram `NOT NULL` sem preencher nada retroativamente |
| 17 das 22 tabelas já tinham `inquilino_id` | As cinco de fora se explicam sozinhas: `inquilino` é a própria lista de escritórios; `identidade_externa` e `reserva_orcamento` penduram num pai único; `catalogo_preco` e `custo_observado` são dado do fornecedor, iguais para todo mundo |

**Duas camadas, e nenhuma substitui a outra.** A 009 impede **escrita** inconsistente; a 010 impede **leitura** cruzada. Precisam das duas porque a conferência de chave estrangeira roda como dona da tabela e passa por cima da política — só a 009 fica entre um bug e um vínculo apontando para o cliente de outro escritório.

**O preço, escrito para não virar surpresa:** conexão sem escritório declarado não vê nada, e o sintoma é **vazio, não erro** — que é confuso de diagnosticar. A defesa não está no SQL: está em `noInquilino(inquilino_id, …)`, a porta de todo acesso a dado de escritório, que exige o inquilino como argumento. Sem ele, não compila.

**Provado nos dois sentidos, e é isso que separa a trava do comentário:**

```
COM a política, o escritório A vê: 0 cliente(s) do B
SEM a política, o escritório A vê: 1 cliente(s) do B
```

O mesmo para a chave composta: com ela, `ERROR`; sem ela, `INSERT 0 1`. E o cenário das provas ganhou um **segundo escritório** — sem ele não há como afirmar isolamento, só funcionamento.

> ⚠️ **Um susto no caminho, que vale mais que a correção.** O `INSERT` do escritório vizinho esqueceu a coluna `tipo` de `cliente`. O cenário inteiro passou a falhar, e com isso **todos** os casos `deveRecusar` passaram pelo motivo errado: o banco recusava, mas recusava o cenário, não a regra. Prova que falha antes de chegar na regra é prova que não prova nada — e ela ficou verde.

**O que NÃO foi feito, e é decisão sua:** papéis separados por serviço (`lex_auditoria`, `lex_callback`, `lex_policy`). `conexao.ts` fixa `lex_app` e documenta que o papel é decisão de segurança, não de configuração; separar mexeria nessa trava, e isso merece ser deliberado em vez de sair como efeito colateral.

### O que a revisão achou e ainda está aberto

| # | Achado | Onde | Peso |
|---|---|---|---|
| 1 | **Webhook da Demo B sem autenticação**, e o número do remetente vem do próprio corpo recebido | `demo/montar-fluxo-b.mjs` | Alto — superfície aberta enquanto o fluxo estiver ativo |
| 2 | **O chassi executa a ferramenta ANTES de registrar a auditoria.** Se o registro falha, o efeito externo já saiu. É a D-141 aplicada só à matriz de escopo: o teste de auditoria não confere o contador de chamadas | `packages/mcp-core/src/chassi.ts:237` · `testes/chassi.test.mjs:213` | Alto |
| 3 | **`registrar()` é declarado síncrono**, e a gravação real em PostgreSQL será assíncrona. O `try/catch` de hoje não pega falha de promessa — a trava da D-77 deixa de funcionar em silêncio quando o Marco 3 entrar | `packages/mcp-core/src/chassi.ts:58` | Alto, e é o mais fácil de não notar |
| 4 | **Aprovação A3 não confere o papel do aprovador** (estagiário aprova), não tem uso único, não é vinculada a inquilino nem sessão, e o `aprovacao_id` não entra no evento de auditoria | `packages/mcp-core/src/etapas.ts:200` | Alto — o último item é o que impede a trilha de provar quem assinou |
| 5 | **O banco não isola inquilinos.** Referências apontam só o id do cliente/usuário/processo, sem o `inquilino_id` junto; não há política por linha; `lex_app` lê e insere em tudo | migrações 002 e 007 | Alto na produção, inerte hoje com um inquilino só |
| 6 | **Segredo de justiça falha aberto** — os três scripts só recusam em `=== true`; ausência e erro de extração viram "público" | `capturar.mjs:159` · `anonimizar.mjs:305` · `importar-autos.mjs:95` | Alto, e contraria a Regra 5 |
| 7 | **O disjuntor de crédito é contornável**: a expressão de rota gratuita é testada contra o comando inteiro, então `monitorar.mjs listar && capturar.mjs --executar` passa | `.claude/hooks/guarda-escavador.mjs:89` | Alto — Regra 8 |
| 8 | **Normalização de CNJ quebrada na Demo A**: `/\D/g` dentro de template string virou `/D/g` no JSON gerado. CNJ com pontuação não é reconhecido; o teste não pega porque a memória curta guardou o processo | `demo/montar-fluxo-a.mjs:134` | Médio, mas é bug de verdade |
| 9 | **As demos não rodam numa cópia limpa do Git** — os testes foram escritos contra os dados locais ignorados. Verificado com `git archive`: as duas quebram com `TypeError` | `demo/testar-fluxo-*.mjs` | Médio — hoje elas testam a máquina, não o repositório |
| 10 | **Retentativa sem idempotência** nos envios (3 tentativas). Entrega bem-sucedida com resposta perdida reenvia. É a D-116 espelhada | Fluxos A e B | Médio |
| 11 | Pseudonimização por SHA-256 sem segredo — previsível por teste de nome candidato. HMAC resolve | `captura/anonimizar.mjs:114` | Médio |
| 12 | `--sem-validacao` combina com `--publicar`: dá para publicar receptor que aceita qualquer entrega | `captura/montar-receptor-callback.mjs:42` | Médio |
| 13 | Menores confirmados: sessão emitida no futuro é aceita (`sessao.ts:65`); `Number("")`/`false`/`[]` viram 0 (`esquema.ts:121`); `parametros: null` estoura antes do erro tratado (`esquema.ts:201`); banco cria `sujeitos_autorizados` como `[]` e o TypeScript espera objeto (001:121); `CHECK` de rota gratuita passa com `preco_centavos` NULL (004:43); índice único de callback sem `inquilino_id` (005:57); erro cru do fornecedor volta ao agente (`chassi.ts:241`); `--conferir` cria tabela apesar de dizer que não altera; README ainda diz "Fase 0, nenhum código" | vários | Baixo |

### Um comentário que promete garantia que não entrega

`005-assincronia-e-cache.sql:124` afirma que a chave primária composta torna **impossível** ler a entrada de outro inquilino por esquecimento de `WHERE`. É falso: `SELECT * FROM cache_entrada WHERE chave = 'x'` atravessa inquilinos. Chave composta impede **colisão**, não **leitura**. O desenho está certo; o comentário é que mente — e comentário que mente é pior que comentário ausente, porque a próxima pessoa confia nele.

### Os três achados que NÃO procedem

1. **"Os arquivos `.exemplo.json` contêm identificadores reais."** Não contêm — são `111111111`, `"Nome do Advogado"`, `5500000000000`. A revisão citou a linha 2 dos dois arquivos, que é o `_leia-me`.
2. **"Os workflows expõem os oito processos, inclusive os em segredo."** Expõem a estrutura, não as pessoas: o `anonimizar.mjs` troca os nomes por pseudônimos de um cofre que nunca é gravado e **recalcula o número CNJ com dígito verificador válido**. O que de fato está nos JSONs versionados é dado pessoal **do Denis** — id do Telegram, nome, celular. O repositório é **privado**, o que rebaixa isso de incidente a higiene, mas a D-147 acabou de tornar o id do Telegram uma âncora de identidade, então ele merece sair.
3. **"Os SDKs e servidores MCP são arquivos vazios."** São esqueletos deliberados, cada um com o marco escrito no cabeçalho — Marco 3, 6 e 7. A revisão leu o roteiro como pendência.

### O que a revisão confirmou que está de pé

9 configurações TypeScript, 29 arquivos `.mjs`, 34 JSONs, os 44 testes do domínio e do chassi, e nenhum link quebrado na documentação. Nenhuma chamada à API externa foi feita.

## A aparição estava chegando o tempo todo — 02/09/2026

Fui conferir se o receptor de callback funcionava. Funciona — e trouxe junto a correção de um item de cabeçalho deste documento. Contrato completo em `docs/15-contrato-da-aparicao.md`.

### O que este documento dizia, e estava errado

> *"⏳ Aparição — **NUNCA CAPTURADA — é a perda real da expiração.** O contrato da aparição de diário oficial — a peça que dispara prazo — segue **não medido**. Só se fecha com saldo novo."*

**Ele foi medido, 30 vezes, e não custou nada.** As duas leituras de `/api/v1/monitoramentos/{id}/aparicoes` em 27/08 voltaram `items: []`, e a conclusão foi que a vigilância não tinha produzido nada. No mesmo dia, às 06:02 UTC, o Escavador entregava quatro eventos `diario_movimentacao_nova` no nosso receptor — e seguiu entregando todo dia útil desde então.

```
27/08  4        31/08  8        total  30 publicações
28/08  5        01/09  7               22 processos distintos
                02/09  6               6,0 por dia útil
```

**26 das 30 são intimação** — a publicação que faz prazo correr, e a razão de ser da frente E2. Cada uma traz o processo vinculado com CNJ, os envolvidos com OAB, o texto íntegro (mediana de 1.059 caracteres) e o link do PDF. 126 campos mapeados.

**Treze chegaram em 01/09 e 02/09, depois de a cota expirar.** Callback não depende de saldo.

### Quatro coisas que isso muda

**🔴 O polling não é fonte confiável (R-55, D-177).** Ele e o callback discordaram, e o polling errou. Não se sabe por quê — se a rota lista outra coisa, se o parâmetro estava errado, ou se há defasagem de indexação. O sintoma é o pior possível: uma fonte de publicação que responde *"nada novo"* quando há algo novo é indistinguível de um dia tranquilo, e o custo de errar é prazo perdido. O callback passa a ser o caminho primário.

**🔴 Existem três vocabulários para "quem é parte", e a D-132 só conhecia um (D-180).** O diário traz `Polo Ativo`/`Polo Passivo`/`Advogado` e **não** traz `tipo_normalizado`. Somados ao `RECLAMANTE`/`RECLAMADO` do importador de PDF (D-135) e ao `Autor`/`Réu` da V2 (D-132), são três. A conclusão do Bloco E — *"não há tabela de tradução a construir"* — vale **dentro da V2, entre ramos da Justiça**, e é falsa **entre fontes**. O eixo da tradução é a fonte, não o tribunal.

**🔴 As duas datas vieram iguais, e isso não é uma regra (R-56, D-179).** `data_disponibilizacao` e `data_publicacao` coincidiram nas 30 amostras — dois tribunais, cinco dias. No processo civil os conceitos se separam, e a diferença é de um dia útil: exatamente a margem que decide se um prazo foi cumprido.

**🔄 A vigilância `2813617` mudou de natureza (D-182).** Ela estava na lista de resíduos a remover. Não é: é a **fonte viva do contrato mais importante do projeto**, entregando publicação real de graça. Renova em **26/09**, e a decisão sobre ela passou a ser sobre a frente de prazo, não sobre faxina.

### 🔴 E o que se faz com o evento hoje: nada

O receptor tem dois nós — webhook e um `Code` que confere o token e carimba. **Não grava em banco, não enfileira, não escreve arquivo.** O evento vive só no histórico de execução do n8n, que é onde a RNF-08 diz que ele não pode viver (D-181).

A instância retém execuções há ~302 dias, então **não há perda em curso** — a urgência é menor do que parece. Mas retenção é configuração, não garantia. As 30 amostras foram copiadas para `captura/respostas-brutas/callback-execucoes.local.json`, fora do Git, e essa é hoje a única cópia fora do n8n.

### Duas notas de higiene

**O token do callback está em texto puro dentro do nó `Code`**, embutido na publicação por `captura/montar-receptor-callback.mjs:119`. **Não está no repositório** — vive em `captura/callback-token.local`, ignorado pelo Git. Mas ficou legível na saída do terminal ao inspecionar o nó. **Convém rotacionar**, e guardar como credencial do n8n em vez de literal no código: literal em código é o que o torna imprimível por acidente.

**`monitoramento.descricao` carrega o nome da advogada em texto puro** e vem em toda entrega. Importa na hora de decidir o que o receptor de produção grava.

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
| **PRD — produto, entregas, requisitos, regras de negócio e modelo de custo** — **v2.0**, com as respostas do escritório | `08-prd.md` |
| **Spec Técnica — Parte I: chassi, motor de custo, cache, callbacks, esquema de dados** — **v1.2** | `09-spec-tecnica.md` |
| **Nota Técnica 02 — ClickUp no lugar de Workspace, Chat e Trello: viabilidade, recursos e custo** | `10-clickup-avaliacao.md` |
| **Nota Técnica 03 — Demonstração ao vivo para o escritório, antes do contrato** | `11-nota-tecnica-demo.md` |
| **Hooks do Claude Code — as regras inegociáveis viraram barreira em código** | `.claude/hooks/LEIA-ME.md` |
| **Marco 1 — fundação: monorepo, esquema do banco e migrações** · 25 de 25 provas de regra | `12-fundacao-marco-1.md` |
| **Marco 2 — o chassi: sessão, escopo, abrangência, erro e envelope** · a matriz de escopo inteira | `13-chassi-marco-2.md` |
| **Marco 3 — a auditoria: grava, recusa alteração e reconstrói pelo `requisicao_id`** · 23 de 23 contra o banco | `14-auditoria-marco-3.md` |
| **O contrato da aparição em diário oficial — medido em 30 entregas reais de callback, a custo zero** | `15-contrato-da-aparicao.md` |

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
- **Recarga paga é decisão do usuário**, tomada com o registro de execução à vista — **e passou a ser necessária** desde 01/09 para qualquer chamada nova

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

> ⚠️ **Superado em parte pela v2.0 (27/08).** O que segue descreve a v1.0. As mudanças estão em §"As respostas do escritório chegaram", acima.

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

## A demo tem um comando de volta ao ar — 01/09/2026

A instância gratuita da Uazapi vive **uma hora**, e no dia 01/09 ela expirou três vezes — uma delas **no meio de um teste**. Toda vez, a mesma sequência de quatro passos à mão.

`demo/reapontar.mjs` faz a sequência inteira (D-169): confere a instância, grava a credencial no n8n, reaponta o webhook e **republica e reativa os dois fluxos**.

O quarto passo é o que mais escapava, e é o mais traiçoeiro: sem ele os fluxos continuam citando a **credencial antiga**, tudo parece publicado, e o envio só falha na hora em que tem gente olhando. O script **para no primeiro erro** — credencial nova com fluxos velhos é pior que nada feito, porque parece pronto.

O momento em que isso mais vai valer é a apresentação ao escritório: se a instância cair no meio, o caminho de volta é um comando, e não quatro que alguém tenta lembrar com a sala esperando.

**O token não passa pelo script nem pelo chat.** Sai de `demo/uazapi.local`, gravado por `guardar-segredo.mjs`, e não é impresso nem em mensagem de erro (D-114, R-51).

```
node guardar-segredo.mjs demo/uazapi.local
node demo/reapontar.mjs
```

**Pendente:** a instância atual expirou e o usuário criou outra; falta gravar o token novo e rodar o comando. Depois disso, dois testes nunca exercitados ao vivo — o **chamado ao advogado no Telegram** ("vou ganhar essa causa?") e a **conversa da escolha de processo** corrigida hoje.

## A demo ganhou elenco: três clientes e três convidados — 02/09/2026

A apresentação ao escritório deixa de ter um cliente só.

| Cliente simulado | Processo | Papel na cena |
|---|---|---|
| **Ana Beatriz Siqueira Lacerda** (número do Dênis) | AUTOS-06 + AUTOS-07 | o único com **mais de um processo** — a ação e o agravo do mesmo caso |
| **Vinicius Andrade Peixoto** | AUTOS-04 — previdência, 18 andamentos | cliente de um processo |
| **Tiago Correia Bandeira** | AUTOS-05 — progressão funcional, 53 andamentos | cliente de um processo |

Os números são de colaboradores do escritório, que atuam como clientes na hora.

**O isolamento foi verificado nos três sentidos**, e é a cena central: a mesma pergunta feita pelos três devolve coisas diferentes; um número de fora é recusado sem que se confirme que processo algum existe; e **cada um citando o CNJ do outro** recebe *"trato apenas do processo vinculado ao seu cadastro"* — sem confirmar nem desmentir que aquele processo exista.

**Três IDs de Telegram entraram para o bot (D-170), como estagiário.** O papel não foi informado, e papel não informado entra como o de **menor privilégio** — Regra 5 aplicada ao cadastro de pessoas, não só ao tráfego. Promover a advogado é uma linha; conceder aprovação por engano não se desfaz, porque quem aprova faz sair mensagem para cliente de verdade. **Falta confirmar nome e papel de cada um.**

Efeito colateral bem-vindo: com os convidados como estagiários, a demonstração mostra ao vivo **o barramento e o encaminhamento ao advogado**.

**Um defeito de teste que a lista maior expôs (R-54).** O fluxo A reprovou três verificações ao regerar — não era o fluxo. O teste escolhia o "processo sem destinatário" excluindo apenas os processos do **primeiro** cliente, e com três acabava pegando um que passara a ter dono. Pior: agora **todo processo fora do segredo tem cliente**, então não sobra processo real para exercitar aquele caminho. Corrigido para excluir os de todos e, quando não sobra nenhum, usar um id que não existe em lista alguma.

**A: 138 · B: 101 verificações. Os 5 nós de envio conferidos na credencial atual.**

### O ciclo fechou nos dois sentidos — 02/09/2026

**O defeito que o teste real achou (D-172).** O chamado da Demo B chegava a **uma pessoa só**. As execuções `11738` e `11731` mostram o envio bem-sucedido para o chat `898717066` — e mais ninguém. A causa era o desenho: o filtro era `papel === 'advogado'` e o destinatário era `ADVOGADOS[0]`. Os colaboradores nunca foram alvo.

Agora quem é chamado sai de `pode_aprovar_envio_ao_cliente`, e o chamado é espalhado em um item por pessoa — mesmo desenho do encaminhamento do fluxo A.

**O que isso quebrou junto (D-173).** Com quatro destinatários, a saída de erro separada deixou de servir: uma falha e três sucessos mandariam o fluxo pelos dois caminhos, e **o cliente receberia duas respostas contraditórias**. Os itens seguem por uma saída só, e um nó reduz o conjunto a uma decisão — **basta um ter recebido** para "já avisei o escritório" ser verdade.

**A volta (D-174, D-176).** O chamado ganhou o botão **"✍️ Responder ao cliente"**. Quem clica escreve o rascunho na mensagem seguinte; o modelo ajusta tom e clareza; o texto volta como **proposta com os três botões de sempre**. Responder não é atalho — continua exigindo aprovação.

Isso funciona porque **as duas demos usam o mesmo bot**, e só um fluxo pode ter o gatilho do Telegram: o clique num botão criado pela Demo B chega ao porteiro da Demo A. O ciclo cliente → chamado → resposta → aprovação → cliente atravessa os dois fluxos sem ponte nenhuma. O destinatário é **reconferido contra a lista** dentro do fluxo A, nunca aceito do botão.

**A regra que protege o texto (D-175).** O modelo **veste, não completa**. Se o rascunho traz prazo ou avaliação de chance, mantém-se — é a resposta de uma pessoa habilitada, e é o que o cliente pediu. O que ele não pode é preencher lacuna: um *"deve sair em breve"* surgido do nada chega ao cliente com a assinatura do escritório.

**Fluxo A: 151 → 162 verificações, 31 nós. Fluxo B: 101 → 106, 15 nós.**

Uma verificação precisou ficar mais precisa: *"o cliente não tem botão nenhum"* olhava o JSON inteiro atrás de `inlineKeyboard`. Agora ela olha só os nós que falam com o **WhatsApp** — o cliente continua sem botão, e o botão que existe é do colaborador, no Telegram. A distinção é a razão de ser da Demo B.

### Os convidados ganharam nome e papel — 02/09/2026

| Pessoa | Papel | Aprova envio ao cliente? |
|---|---|---|
| Dênis Júnior | advogado | ✅ |
| **Malu Souza** | advogado | ✅ |
| **Estefanny** | colaboradora | ⚠️ **sim — exceção só da demo** (D-171) |
| **Andressa** | colaboradora | ⚠️ **sim — exceção só da demo** (D-171) |
| Colega de teste | estagiario | ❌ — é ele que mostra o barramento |

🔴 **PENDÊNCIA APÓS A APRESENTAÇÃO: reverter Estefanny e Andressa para `pode_aprovar_envio_ao_cliente: false`** em `demo/listas/colaboradores.json`. A D-06 e a D-142 reservam essa aprovação ao advogado; a liberação é explícita, datada e pedida pelo usuário — mas **o risco não é a exceção, é ela sobreviver ao motivo**. O gerador do fluxo A passa a avisar, em amarelo e a cada geração, quem aprova sem ser advogado.

Verificado pessoa a pessoa no código: os quatro com aprovação enviam ao cliente; **o estagiário não envia, e nele o texto ao cliente sequer é montado** — não é só o envio que não acontece.

## O primeiro uso real derrubou dois defeitos que 86 testes não viram — 01/09/2026

Dois minutos de conversa de verdade no WhatsApp acharam o que a bateria automática não achou. Nenhum dos dois é falha de segurança: em ambos o sistema faz exatamente o que foi mandado, e é **a conversa** que fica impossível (R-53).

**1. O laço da escolha de processo (D-167).** O assistente listava os processos pela classe — "procedimento comum cível", "agravo de instrumento" — e depois **só aceitava resposta por número CNJ**. O cliente respondeu *"O procedimento comum"*, que é literalmente o rótulo oferecido, e recebeu a mesma pergunta de volta. Tentou *"Procedimento comum cível"*, exato. Mesma pergunta. Três vezes.

É o pior tipo de defeito de conversa: quem está do outro lado fez tudo certo e o sistema insiste. A regra que fica: **se o sistema oferece uma opção com um rótulo, ele aceita aquele rótulo de volta.**

Agora valem três formas, da mais específica para a menos — o número, o rótulo e a ordem ("o segundo", "2"). **No empate não escolhe**, porque escolher no empate é responder com confiança sobre o processo errado. E a pergunta passou a ensinar como responder, cuja ausência era metade do problema.

**2. A saudação composta (D-168).** *"Oi, boa tarde"* — a forma mais comum de abrir conversa em português — não era reconhecida como saudação, porque a regra exigia um cumprimento **e mais nada**. Resultado: a primeira mensagem do cliente caía direto na pergunta sobre qual processo, **sem ele nunca ter sido cumprimentado pelo nome**.

Cumprimento composto agora é saudação; cumprimento **seguido de pergunta** continua sendo pergunta. E quem tem mais de um processo recebe a lista já nas boas-vindas — sem isso, a conversa começa com uma pergunta nossa em vez de uma resposta.

**O que isso ensina sobre como testamos (R-53).** As 86 verificações checam o que o código decide, não o que uma pessoa consegue fazer com ele. Toda cena da demonstração passa a ter uma **transcrição de conversa** entre as verificações — a do print está reproduzida inteira na suíte, incluindo "O procedimento comum" com artigo na frente, "procedimento" cortado, "o primeiro" e "1".

**Fluxo B: 86 → 101 verificações.**

## A recusa passou a chamar uma pessoa — 01/09/2026

A Demo B recusa três coisas por regra. Até hoje a recusa era **um beco**: o cliente descobria que o robô não responde aquilo, e a conversa morria ali. Agora ela **chama um advogado no Telegram** (D-163).

É a mesma frase que a revisão do Codex mandou tirar — *"vou avisar a equipe"* — voltando na ordem certa: **primeiro o mecanismo, depois a promessa.**

**O que dispara o chamado:**

| Gatilho | O que o cliente ouve |
|---|---|
| **Prazo** | "Sobre prazo eu não informo — só um advogado, olhando o processo" |
| **Prognóstico** — *"vou ganhar?"*, *"quais as chances?"*, *"vale a pena recorrer?"* | "Sobre a chance de ganhar eu não opino. Não seria honesto eu arriscar um palpite" |
| **Pedido de gente** | "Combinado — falar com uma pessoa é o caminho certo aqui" |

**A barreira de prognóstico é nova (D-165)**, e é irmã da de prazo. "Eu vou ganhar?" é a pergunta que mais interessa ao cliente e a que menos pode ser respondida por robô: errar para mais cria expectativa que vira reclamação na OAB; errar para menos faz o cliente desistir de direito que tinha. E **não existe resposta prudente automática** — até "as chances parecem boas" é opinião jurídica dada por quem não pode dar. Como no prazo, a recusa vem antes do modelo.

**A ordem importa, e é a D-101 do outro lado do balcão (D-164).** Lá era a tela do colaborador dizendo "enviado" antes do envio; aqui seria o cliente ouvindo "já avisei" antes do aviso. São três textos:

- **base** — não afirma aviso nenhum
- **sucesso** — *"Já avisei o escritório da sua mensagem"*, e só sai depois que o Telegram aceitou
- **falha** — *"Não consegui avisar o escritório agora. Se for urgente, ligue"*

O nó do Telegram tem `retryOnFail` e **saída de erro**. `continueRegularOutput` produziria exatamente a frase falsa.

**O que o advogado recebe** — nome do cliente, número mascarado, motivo, e a pergunta original **entre aspas, escapada e cortada em 500 caracteres**, sob uma linha dizendo que aquilo é fala de cliente e não ordem ao assistente (D-166, Regra 4). O aviso de demonstração vai junto: quem recebe precisa saber sem pensar se é ensaio ou cliente de verdade.

**Sem advogado na lista, o gerador recusa publicar.** Prometer aviso sem ter a quem avisar é a D-102 de volta.

**E o risco que isso cria está registrado (R-52):** três gatilhos com um cliente é confortável; num escritório com centenas, o chamado vira ruído e morre de sucesso — sem ninguém desligar nada, só deixando de olhar. Aí a frase "já avisei" volta a ser falsa, não por defeito, mas por saturação.

## Um cliente com dois processos — o caminho que existia e ninguém tinha testado — 01/09/2026

A lista da demo sempre teve cliente de **um** processo só. Ao montar a rodada com vários clientes, descobriu-se que **Ana Beatriz Siqueira Lacerda tem dois processos nos autos do escritório, e são o mesmo caso em duas instâncias**: AUTOS-06 é a ação na 1ª Vara de Fazenda Pública, AUTOS-07 é o agravo de instrumento que subiu ao tribunal. O AUTOS-07 tem zero movimentações — recurso recém-distribuído, não defeito.

Com dois processos, o Porteiro **não escolhe por ele**: pergunta *"sobre qual deles é a sua pergunta?"* e lista **pelas classes**, não pelos números — o cliente reconhece "agravo", ninguém decora CNJ. A alternativa seria o robô chutar e responder com confiança sobre o caso errado, que é pior do que não responder.

**Esse caminho existia no código desde sempre e nunca tinha sido exercitado** — nem por teste, nem por pessoa. Ao trocar a lista, **10 verificações falharam de uma vez**, e nenhuma era defeito: era a suíte inteira presumindo cliente de um processo só. Corrigiu-se a suíte, não o fluxo, e o caminho ganhou 5 verificações próprias — incluindo a de que ter dois processos **não** abre um terceiro.

**Guarda nova no gerador da Demo A:** número de destino de faz-de-conta agora **para a geração**. A Uazapi *aceita* envio para número inexistente, então a tela diria `📤 APROVADO E ENTREGUE` sobre entrega nenhuma — a mesma mentira que a D-101 acabou de tirar dali. Provado com `5500000000000` e com `55968`: os dois recusam.

**Número do cliente na demo:** `5596981071928` (13 dígitos, com o nono). O anterior ficou indisponível. Os demais clientes entram na hora da apresentação, com os números dos colaboradores do escritório.

## A demo voltou ao ar para nova rodada de testes — 01/09/2026

A instância gratuita da Uazapi expira em **1 hora** — a anterior tinha morrido, e com ela o último salto da Demo A (o envio real ao cliente). Subiu instância nova, e as correções da revisão do Codex **ainda não foram exercidas ao vivo**.

**O ritual de religar, em ordem** — é isto que se repete a cada nova instância:

1. `node demo/uazapi.mjs criar <nome>` — grava o token em `demo/uazapi.local`, fora do Git, sem imprimir
2. **parear** — QR code, escaneado por uma pessoa
3. `credencial` — recria a credencial no n8n e registra o id em `demo/credenciais.json`
4. `webhook` — reaponta a Demo B, com o segredo no caminho
5. republicar os **dois** fluxos com `--publicar --ativar`

**O pareamento pelo script falhou, e isso custou uma volta.** O usuário pareou direto no painel da Uazapi, que criou **outra** instância ("Lex AI", `559681009574`) — ficaram duas, e os fluxos apontavam para a vazia, que nunca receberia nada. A correção foi trocar o token em `demo/uazapi.local` pelo da instância pareada e refazer os passos 3 a 5. **Lição operacional: depois de parear, confirme com `status` que o número conectado é o que você espera** — instância criada e instância pareada podem não ser a mesma, e o sintoma disso é silêncio, não erro.

**O que ficou pendente de teste ao vivo** — os três caminhos que a correção do Codex criou e que nenhum humano ainda viu funcionar:

| Caminho | O que precisa aparecer |
|---|---|
| Aprovar com a Uazapi viva | `✅ APROVADO · Enviando ao cliente…` e depois `📤 APROVADO E ENTREGUE`, com número mascarado |
| Aprovar com a Uazapi morta | `❌ APROVADO, MAS NÃO ENTREGUE`, dizendo em letras que ninguém foi avisado no lugar do cliente |
| Demo B, pergunta de prazo | Oferece falar com uma pessoa do escritório — **não** promete avisar a equipe |

Só o processo **AUTOS-05** tem cliente vinculado na lista; aprovar qualquer outro cai no `⚠️ APROVADO, MAS SEM DESTINATÁRIO`, que é comportamento correto.

**E um vazamento pequeno, que ensina um grande** (R-51): o token da instância apareceu numa captura de tela do painel da Uazapi. Aqui o dano é nulo — instância gratuita, uma hora de vida. Mas é o mesmo campo que, em produção, dá acesso ao WhatsApp do escritório: **quem tem o token manda mensagem como o escritório.** Foi exatamente por isso que a D-114 tirou o segredo da saída dos scripts — e o painel do fornecedor não obedece à nossa disciplina.

## As duas demos ficaram prontas, e ligadas — 24/08/2026

A **Demo A** (colaborador no Telegram) e a **Demo B** (cliente no WhatsApp) estão publicadas e ativas, sobre os 8 processos reais anonimizados. **Custo em crédito do Escavador: R$ 0,00.**

O que a Demo A faz: identifica quem falou pelo `user_id`, encontra o processo por número, apelido interno ou nome da parte, responde sobre o andamento, redige mensagem ao cliente e propõe com três botões — aprovar, editar, descartar. Editar não é atalho: o texto reescrito à mão volta com os mesmos três botões, porque quem reescreve pode não ser quem aprova.

O que a Demo B faz: **o escopo vem da lista, nunca da mensagem.** Pergunta sobre prazo é recusada em código, antes de chegar ao modelo. Processo de outra pessoa citado por número é recusado em código — defeito encontrado no teste ao vivo do usuário, em que o modelo improvisou uma promessa de retorno sobre caso alheio.

E o fio entre as duas: **aprovar no Telegram envia de verdade no WhatsApp do cliente** (D-99). Quem não é advogado não perde o trabalho: o clique dele **encaminha** a proposta ao advogado, com os mesmos três botões, e o desfecho volta para quem redigiu (D-100). A trilha passa a registrar as duas pessoas — quem redigiu e quem aprovou. O destinatário sai da mesma lista que a Demo B usa para decidir escopo — não sai da conversa, nem da redação do modelo, nem de um número digitado. É a Regra 1 aplicada ao caminho de volta: o poder de escolher para quem o escritório fala não mora dentro de um texto.

**155 verificações automáticas** rodam sem n8n, sem Telegram, sem WhatsApp e sem gastar token de modelo.

O que continua valendo do risco R-33: isto é demonstração. Não tem Policy Gate, não tem motor de custo, e usa WhatsApp não oficial em instância gratuita que **expira em 1 hora**.

## A primeira chamada real foi feita — e recusada, sem custo

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

## Próximo passo

> Atualizado em 31/08, com os marcos 1, 2 e 3 fechados e cinco achados da revisão externa corrigidos.

### 1. Marco 4 — motor de custo · sem gastar nada

O próximo da fila. A costura já está marcada no `chassi.ts` como **etapa 9**, a tabela `consumo` já grava na mesma transação do ato desde o marco 3, e `orcamento` já recusa estouro por restrição do banco desde a migração 004.

Falta quem calcule o número: estimativa antes de chamar, reserva enquanto chama, reconciliação com o `Creditos-Utilizados` que vier na resposta — o cabeçalho que já sabemos que **varia por rota** (D-108) e que é a única fonte de verdade sobre preço.

Termina quando uma chamada que estouraria o orçamento é recusada **antes** de custar.

> ✅ **Marco 3 fechado em 31/08** — 23 de 23 contra o banco de pé. Ver §"O marco 3 fechou".

### 2. ✅ Feito de outro jeito — a aparição veio por callback

Ver §"A aparição estava chegando o tempo todo". **30 publicações medidas, custo zero.** O que sobrou de aberto não é capturar: é **entender por que o polling discordou** (R-55) — e isso depende de saldo.

O passo prático agora é **fazer o receptor gravar** (D-181), que não depende de recarga nem do escritório.

### 3. ✅ Feito — as cinco perguntas voltaram em 27/08

Ver §"As respostas do escritório chegaram". **D-07 e D-09 resolvidas**, identidade individual destravada (D-147), e a Parte II da Spec deixou de ser ficção.

### 3b. Levar ao escritório a rodada seguinte

Quatro perguntas novas (4a, 4b, 4c, 20a–20d) e **os números** — franquia de aparições, tetos de bloco e de orçamento. O texto para a conversa com a advogada proprietária está pronto no **PRD §9.3.1**, e é o mais urgente dos dois: o número da franquia **não pode ser alterado depois de criado o monitoramento** (R-46).

### O saldo de teste expirou — 01/09/2026

**Gastamos R$ 6,00 de R$ 50,00.** Os R$ 44,00 restantes evaporaram: saldo de bônus não vira crédito e não se transfere. Não há recarga contratada, e recarga **não é autosserviço** — depende do comercial (R-22).

**O que o dinheiro não gasto não custou.** O objetivo declarado da cota nunca foi cobertura, foi **contrato** (§2 do orçamento), e o contrato foi validado quase inteiro por R$ 6,00:

| Pergunta que travava arquitetura | Estado |
|---|---|
| O token autentica na V2? E na V1? | ✅ Sim, o mesmo token nas duas |
| Envelope, paginação e modelo de envolvido, processo e movimentação | ✅ Medidos e gravados em `captura/respostas-brutas/` |
| O ciclo assíncrono e o callback funcionam ponta a ponta? | ✅ Provado — solicitação `55413945`, n8n recebeu em 2 s |
| O preço é por rota ou plano? | ✅ Medido: por rota (D-108). Há rotas gratuitas |
| O contrato muda entre ramos da Justiça? | ✅ Não — TRT8 e TJAP têm o mesmo formato (§5.8) |
| Como são os erros? | ✅ 403 e dois 422 reais, de graça |
| Criar vigilância em diário: contrato, franquia, recorrência | ✅ id `2813617`, franquia 1000/mês |
| **Como é uma aparição de diário oficial?** | 🔴 **NUNCA MEDIDA — a perda** |

**A perda concreta é uma só, e é relevante:** a **aparição** é o gatilho de prazo da entrega E2, o coração da D-62. Sabemos criar a vigilância e sabemos que o callback chega; **não sabemos o formato do que chega quando o nome aparece no diário**. O que temos é o OpenAPI, e a R-44 registra três vezes em que a fonte oficial do Escavador disse uma coisa e o sistema fez outra.

Perdas menores, de baixo impacto: o Bloco D formal (respondido de graça pelos erros reais), um terceiro ramo da Justiça (o Bloco E já mostrou o contrato estável) e a medição gratuita da R-46 (a franquia não editável).

### Precisa de saldo novo para terminar? Depende de qual "terminar"

| Frente | Precisa de crédito? |
|---|---|
| Marcos 4 (motor de custo) e 5 (cache), achados abertos da revisão, Spec Parte II, PRD, demos A e B | ❌ **Não.** As demos rodam sobre 8 processos reais anonimizados dos autos em PDF, sem tocar a API |
| Fechar o contrato da aparição e validar E2 de ponta a ponta | ✅ **Sim** — e não tem substituto |
| Reconciliar o motor de custo contra `Creditos-Utilizados` real | ✅ **Sim**, no fim do marco 4 |
| Homologação e produção | ✅ **Sim, e a conta deve ser do escritório**, não do prestador — é consumo do cliente e responsabilidade dele (conversa com R-48) |

**Recomendação de sequência:** construir até o marco 4 ficar pronto **sem crédito nenhum**, e só então pedir recarga, para que o crédito pago seja gasto pela máquina que mede e reconcilia — e não por script avulso. Antes de recarregar, **resolver a assinatura `2813617`**: recarga com ela ativa financia cobrança mensal esquecida (R-13).

### Depois

**Marco 5** — cache, etapa 10 do chassi. E os **achados abertos da revisão** que ainda não foram fechados: o isolamento de inquilinos no banco (5), a retentativa sem idempotência (10), a pseudonimização sem segredo (11) e os menores. Nenhum consome crédito nem depende do escritório.

A **Parte II** da Spec é escrita quando as respostas do escritório chegarem.

## Decisões

**D-01 a D-182** estão em `01-diretrizes-gerais.md` §13 — registro único e centralizado.

- ✅ Confirmadas: D-01 (n8n como orquestrador), D-02 (camada MCP reutilizável), as da demo (D-86 a D-102), e agora **D-07, D-09, D-25, D-61, D-63 a D-67, D-146, D-147 e D-152**, todas resolvidas ou confirmadas pelo escritório em 27/08
- 🟡 Propostas aguardando aval do usuário: todas as demais, incluindo **D-142 a D-145 e D-148 a D-151**, novas em 27/08
- 🔴 Em aberto: **D-62** (vigiar diário por nome de advogado) — o escritório vai confirmar
- ⚠️ **Renumeradas em 27/08:** as duas decisões do suporte do Escavador de 25/08 passaram de D-101/D-102 para **D-153/D-154**, por colisão de numeração com as decisões da demo

## Pendências com o escritório

> ✅ **Atualizado em 27/08.** As cinco que travavam o PRD foram respondidas — 16a–16c, D-07, D-09, D-64 e a instância n8n. O que segue abaixo é o que sobrou, mais o que nasceu das respostas.

**Novas, nascidas das respostas de 27/08:**

- **Pergunta 4a** — o **colaborador** também vê a base inteira, ou fica na carteira? A resposta falou só de advogados
- **Perguntas 4b e 4c** — quantos processos ativos o escritório tem (ordem de grandeza basta), e existe algum cliente com mais de 200 processos? É o que fecha a premissa P-07 e dimensiona os tetos de bloco
- **Perguntas 20a a 20d** — o rito do alerta de prazo: quanto tempo até chamar todos os advogados (proposta: 2 h úteis), até escalar para a sócia (4 h úteis), qual é o horário útil, e quanto tempo um pedido de aprovação pode ficar parado antes de vencer
- **Os números** — franquia de aparições (proposta: 1.000/mês por advogado), tetos de bloco por papel, tetos de orçamento. **O texto pronto para a conversa com a advogada proprietária está no PRD §9.3.1**
- **D-62** — o escritório vai confirmar a vigilância de diário por nome de advogado

**Que continuam abertas:**

- **Pergunta 58** — plano contratado do Escavador. Saldo em providência
- **Pergunta 66** — é possível criar conta de serviço dedicada no Trello? Se não, R-20 fica sem tratamento
- **Pergunta 16a** — quantas pessoas usam a conta compartilhada do Workspace. Não bloqueia mais nada agora, mas é o número necessário para reavaliar o Caminho A no futuro
- **Pergunta 15** — caixas de e-mail a monitorar. Trava o desenho da frente F3
- **Pergunta 30** — software de gestão jurídica

**Saíram da lista do escritório:**

- ⚙️ **Perguntas 26 e 27** (campos personalizados e Butler no Trello) — o escritório informou que ninguém sabe responder. **Viraram levantamento técnico nosso**, assim que a chave de API chegar. A 27 é a crítica: o Butler reage às nossas escritas e precisa ser inventariado **antes** da primeira gravação

As pendências completas de cada mapeamento estão em `mapeamento-escavador.md` §15 e `mapeamento-trello.md` §13.

## Pendências com o usuário

- ~~**Token do Escavador**~~ ✅ **Usado em 26/08** — 18 requisições, autenticação V1 e V2 confirmadas com o mesmo token
- ~~**Dados do painel do Escavador**~~ ✅ **Levantados em 20/08** — ver `07-painel-escavador-achados.md`, inclusive a tela de criação de token. Resta do Escavador apenas a **resposta do suporte** às perguntas da §10 (mensagem enviada em 20/08)
- ~~**Número CNJ de um processo real**~~ ✅ **Resolvido** — 8 processos, dos autos em PDF do escritório. P1 (TJAP) é o alvo autorizado
- ~~**URL pública de callback**~~ ✅ **De pé e provada em 26/08** — `callback.criativeia.com.br/webhook/escavador-callback`, validada nos dois caminhos
- **Credenciais do Trello** — chave de API, token e segredo da aplicação (este último é o que assina os webhooks)
- ~~Acesso à instância n8n~~ ✅ **Em uso** — chave de API guardada em `demo/n8n.local`, rotacionada em 26/08 depois de dois vazamentos (R-42)
- ✅ **Aparição de diário oficial** — **capturada, 30 vezes, e sem gastar nada.** Veio por callback, não por leitura: `15-contrato-da-aparicao.md`. **Não depende de recarga.** O que ainda depende é entender por que o polling discordou (R-55)
- ⚠️ **Resolver a assinatura `2813617`** até **22/09** — a D-121 (segurar até capturar a aparição) **caiu com a expiração**: não há mais como capturar sem recarga. Conferir o estado no painel; se a remoção pela API for recusada por saldo bloqueado, remover pelo painel ou pelo suporte. **E fazer isso antes de qualquer recarga**
- ~~Acesso à instância n8n do cliente~~ ✅ **Resolvido em 27/08 (D-148)** — a instância é a do prestador, fornecida com o serviço. Cria obrigação contratual nova: sob a LGPD, o escritório é controlador e o prestador é operador (R-48). **Precisa de cláusula antes de o primeiro dado real entrar**
- **Levar ao escritório os números e as quatro perguntas novas** — o texto para a advogada proprietária está pronto no PRD §9.3.1
- **Aval sobre as decisões propostas — D-03 a D-152.** O PRD (v2.0) e a Spec Parte I (v1.2) aguardam junto. **D-142 a D-152 são as novas**, e três delas mudam desenho: a divisão da faixa A3 (D-142), o canal do cliente a custo zero (D-144) e a franquia de aparições não editável (D-150)

## Riscos ativos

| Risco | Situação |
|---|---|
| **R-16** — Trello não tem escopo por quadro; token vê a conta inteira | **Grave e estrutural.** Tratado por desenho (D-36), mas o isolamento passa a depender do nosso código. Precisa ser dito ao escritório |
| **R-11** — conta única do Workspace compartilhada por toda a equipe | ⚠️ **Resolvido pela metade em 27/08.** A identidade **da plataforma** virou individual pelo Telegram (D-147), destravando privilégio por papel, aprovação nominal, auditoria e a faixa A4. **E-mail e Drive seguem na conta única** — E3 vai ler de uma caixa que ninguém responde individualmente. O escritório foi informado e aceitou |
| **R-51** — o painel do fornecedor exibe o token da instância em tela, e ele vaza por captura | **Novo, moderado — e fora do nosso alcance.** A D-114 tirou o segredo da saída dos nossos scripts, mas o painel da Uazapi mostra o token em texto aberto, e a captura de tela o carrega para onde o usuário mandar. Em produção esse campo **dá acesso a mandar mensagem como o escritório**. Aconteceu em 01/09, sem dano — instância gratuita de 1 hora | Segredo se lê pelo script, nunca pelo painel; se o painel for inevitável, tape o campo antes de qualquer captura. Na plataforma real, token de canal externo mora no cofre e nenhuma tela o exibe |
| **R-46** — a franquia de aparições **não é editável** depois de criada | **Novo e grave.** O `PUT` da V1 aceita só `origens_ids` e `variacoes`. O alarme de 70% pede procedimento, não ajuste de número (D-150). *Lido do OpenAPI; conferir por medição — é gratuito* |
| **R-47** — identidade individual ancorada em conta de Telegram | **Novo, moderado a grave.** Número de telefone é o âncora (SIM swap, troca de chip), e **o escritório não administra as contas** — não há desligamento central. Tratado por revogação do vínculo na plataforma, 2FA obrigatório e conteúdo fora do corpo da mensagem |
| **R-48** — a plataforma roda em infraestrutura do prestador | **Novo, jurídico.** Dado sob sigilo profissional em ambiente de terceiro. Escritório é controlador, prestador é operador — precisa de cláusula de finalidade, devolução, expurgo e continuidade |
| **R-49** — gabarito pré-aprovado envelhece em silêncio | **Novo, moderado — e é o risco que a D-142 cria.** Texto aprovado uma vez segue saindo depois de a realidade mudar, e ninguém percebe porque não passa mais por ninguém. Tratado por revisão datada, amostragem pós-envio, desligamento imediato e contramétrica |
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
| **R-40** — cegueira por cota: o monitoramento atinge a franquia mensal e para de capturar, sem erro | **Novo e grave.** Franquia real medida: **1000/mês**, não os 200 documentados. Alarme a 70% (D-107) |
| **R-41** — não existe conferência de inventário de assinaturas | **Novo, e já se realizou** em 26/08: uma assinatura ficou ativa e fora do inventário por horas. Tratado por código no `monitorar.mjs` e pela tabela no topo deste documento |
| **R-42** — segredo exibido na tela por ferramenta que prometia escondê-lo | ✅ **Encerrado em 26/08.** Ferramenta reescrita em modo cru, chave rotacionada, anteriores revogadas (D-114) |
| **R-43** — reentrega de callback com identificador diferente a cada vez | **Novo e grave.** Medido: 3 entregas, 3 `uuid`, 2 corpos idênticos. Deduplicação por resumo do conteúdo (D-116, D-117) |
| **R-44** — fonte oficial do Escavador contradiz o comportamento do sistema (3ª vez) | **Novo, moderado e insidioso.** Declaração vira premissa só depois de medida (D-120) |
| Demais (R-02 a R-10) | Registrados em `01` §15, tratados por desenho |
