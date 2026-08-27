# Estado Atual

| Campo | Valor |
|---|---|
| Atualizado em | 2026-08-27 |
| Crédito Escavador | ✅ **R$ 44,00 de R$ 50,00** — R$ 47,00 conferidos no painel em 26/08, menos R$ 3,00 do Bloco E em 27/08. 21 requisições feitas; o painel batia linha a linha com o nosso registro na última conferência. **O "teto de 16 requisições" não existe** (D-119): a cota é de dinheiro, e rota gratuita não consome nada. Expira **01/09** |
| Callback | ✅ **PROVADO nos dois caminhos.** Receptor `OymAtbNYI1pjfWkA`: recusou 2 entregas sem `Authorization` e aceitou 3 do Escavador. `callback.criativeia.com.br/webhook/escavador-callback` — **não** é o host do editor |
| 🔴 **Assinaturas ativas** | **1 — id `2813617`**, vigilância em diário criada em 26/08. **Remover até 22/09** — mas **não remova ainda**: falta capturar uma aparição, que é gratuita e é o último contrato não validado. Ver §"Assinaturas do Escavador" |
| ⏳ Aparição | **Ainda nenhuma**, em duas leituras (27/08 de madrugada e ao meio-dia), as duas gratuitas. Primeira leitura ~13h depois de criada a vigilância: `items: []`, `Creditos-Utilizados: 0`. Vazio não é falha — diário publica em dia útil, e vigiamos o nome de uma advogada só. **Repetir a cada dia útil** |
| Bloco C | ✅ **FECHADO de ponta a ponta, e custou R$ 0,00.** Solicitação `55413945` concluiu em 3h45, o n8n recebeu 2 segundos depois com `veredito: autentico`. E revelou que **o `uuid` do Escavador não serve como chave de idempotência** — ver `06-orcamento...` §5.6 |
| Fase | **3 — construção.** **Marcos 1 e 2 fechados e verificados**: monorepo, esquema do banco e migrações; e o chassi — sessão, escopo, abrangência, erro e envelope — com a matriz de escopo passando inteira. PRD e Spec Parte I seguem aguardando aval; a Parte II depende do escritório |
| Branch | `claude/law-firm-ai-automation-6pwaug` |
| Código | ✅ **Fundação e chassi de pé, os dois verificados.** Monorepo com 9 pacotes, **7 migrações** aplicadas num PostgreSQL 16 (23 tabelas) com **25 de 25 provas de regra**, e o **`mcp-core` com 44 testes passando** — a matriz de escopo inteira, `npm test` — o banco recusa conta compartilhada, alteração de auditoria, estouro de orçamento e evento duplicado. `npm run banco:subir` · `npm run banco:conferir`. Mais: captura, importador de autos em PDF, anonimizador, cliente do n8n e **as duas demos rodando** — A no Telegram (`ZPh3DxptHFIyWETO`, 23 nós, 138 verificações) e B no WhatsApp (`Hxc7uAmAUhyPE7E1`, 8 nós, 51 verificações), **ligadas uma na outra**: aprovar no Telegram envia ao cliente |
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

> Atualizado em 27/08, com os marcos 1 e 2 fechados e o Bloco E executado.

### 1. Marco 3 — auditoria e consumo · sem gastar nada

O próximo da fila, e o mais fácil de encaixar: **a tabela já existe** (migração 003, *append-only* provada contra o banco) e **a interface já está no chassi**. Falta a implementação que escreve no PostgreSQL em vez de na memória, mais a tabela `consumo`.

Termina quando recusa e sucesso geram registro reconstruível pelo `requisicao_id`.

### 2. Capturar uma aparição de diário oficial — gratuito

Duas leituras em 27/08, as duas vazias — o esperado para uma vigilância sobre o nome de uma advogada só.

```bash
node captura/monitorar.mjs aparicoes 2813617 --executar
```

**Repetir a cada dia útil.** Enquanto não vier, a vigilância não se remove (D-121). Depois de capturada — ou até 22/09, o que vier primeiro — remover.

### 3. Levar ao escritório as cinco perguntas

Destravam a Parte II da Spec, com destaque para a conta compartilhada (D-67), que é bloqueio de projeto. O usuário ficou de providenciar.

### O que sobrou de crédito, e o que ele ainda pode comprar

**R$ 44,00**, expirando em **01/09**. Sem teto de requisições, e rota gratuita não consome nada.

| O que | Custo | Vale? |
|---|---|---|
| Aparição de diário | gratuito | **Sim** — é o contrato que falta |
| Bloco D — formato dos erros | ~R$ 0,00 | Boa parte já foi respondida de graça pelo 403 de 23/08 e pelos 422 de 26/08 |
| Um terceiro ramo (Justiça Federal, STJ) | ~R$ 3,00 | **Talvez.** O Bloco E mostrou que o contrato é o mesmo entre ramos; um terceiro ponto confirmaria a regra, mas o retorno já é menor |

> ⚠️ **Crédito não usado evapora em 01/09.** Não há recarga contratada, e recarga é decisão do usuário, tomada com o registro à vista — nunca consequência de chamada exploratória.

### Depois

**Marcos 4 e 5** — motor de custo e cache. Nenhum consome crédito nem depende do escritório. A costura dos dois já está marcada no `chassi.ts`, nas etapas 9 e 10.

A **Parte II** da Spec é escrita quando as respostas do escritório chegarem.

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

- ~~**Token do Escavador**~~ ✅ **Usado em 26/08** — 18 requisições, autenticação V1 e V2 confirmadas com o mesmo token
- ~~**Dados do painel do Escavador**~~ ✅ **Levantados em 20/08** — ver `07-painel-escavador-achados.md`, inclusive a tela de criação de token. Resta do Escavador apenas a **resposta do suporte** às perguntas da §10 (mensagem enviada em 20/08)
- ~~**Número CNJ de um processo real**~~ ✅ **Resolvido** — 8 processos, dos autos em PDF do escritório. P1 (TJAP) é o alvo autorizado
- ~~**URL pública de callback**~~ ✅ **De pé e provada em 26/08** — `callback.criativeia.com.br/webhook/escavador-callback`, validada nos dois caminhos
- **Credenciais do Trello** — chave de API, token e segredo da aplicação (este último é o que assina os webhooks)
- ~~Acesso à instância n8n~~ ✅ **Em uso** — chave de API guardada em `demo/n8n.local`, rotacionada em 26/08 depois de dois vazamentos (R-42)
- **Aparição de diário oficial** — gratuita, e é o último contrato não validado. Rodar `aparicoes 2813617` até capturar uma
- **Remover a assinatura `2813617`** até **22/09**, depois de capturada a aparição (D-121)
- **Aval sobre as decisões propostas — D-03 a D-121.** São 119 decisões aguardando, e o PRD (v1.1) e a Spec Parte I (v1.1) aguardam junto

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
| **R-40** — cegueira por cota: o monitoramento atinge a franquia mensal e para de capturar, sem erro | **Novo e grave.** Franquia real medida: **1000/mês**, não os 200 documentados. Alarme a 70% (D-107) |
| **R-41** — não existe conferência de inventário de assinaturas | **Novo, e já se realizou** em 26/08: uma assinatura ficou ativa e fora do inventário por horas. Tratado por código no `monitorar.mjs` e pela tabela no topo deste documento |
| **R-42** — segredo exibido na tela por ferramenta que prometia escondê-lo | ✅ **Encerrado em 26/08.** Ferramenta reescrita em modo cru, chave rotacionada, anteriores revogadas (D-114) |
| **R-43** — reentrega de callback com identificador diferente a cada vez | **Novo e grave.** Medido: 3 entregas, 3 `uuid`, 2 corpos idênticos. Deduplicação por resumo do conteúdo (D-116, D-117) |
| **R-44** — fonte oficial do Escavador contradiz o comportamento do sistema (3ª vez) | **Novo, moderado e insidioso.** Declaração vira premissa só depois de medida (D-120) |
| Demais (R-02 a R-10) | Registrados em `01` §15, tratados por desenho |
