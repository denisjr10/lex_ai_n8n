# Plano de Execução — o caminho até 15/09

| Campo | Valor |
|---|---|
| Versão | 1.0 — primeira ordenação completa do que falta, com dependências, paralelismo e calendário |
| Data | 2026-09-06 |
| Estado | 🟡 **Proposta** — o recorte da §4 (D-207) precisa do aval do usuário e do "de acordo" da Malu |
| Fase | 3 — construção |
| Herda de | `00-estado-atual.md`, `01-diretrizes-gerais.md`, `02-descoberta-perguntas-abertas.md`, `08-prd.md`, `09-spec-tecnica.md`, `16-levantamento-instancia-n8n.md` |

> **O que este documento é.** A lista ordenada do que falta para chegar em **E1 + E2 em produção até 15/09** (D-195), com quatro informações que nenhum outro documento reúne: **o que trava o quê**, **o que pode ser pulado**, **o que pode começar fora de ordem** e **o que pode rodar em sessões paralelas de Claude Code sem uma apagar o trabalho da outra**.
>
> **O que este documento não é.** Ele não substitui o `00-estado-atual.md`, que continua sendo a memória do projeto e o primeiro que uma sessão nova deve ler. Este é o roteiro de execução de **uma janela específica** — a de 06 a 15/09 — e envelhece junto com ela.

---

## 1. A leitura de conjunto — o escopo não cabe no calendário

Uma coisa reorganiza todas as outras, e ela precisa estar escrita antes da primeira linha da lista:

> **O escopo acordado — E1 + E2 em produção até 15/09 (D-195) — não cabe no calendário que sobrou.**

A conta:

| Fato | Número |
|---|---|
| Data desta análise | domingo, 06/09 |
| **07/09 é feriado nacional** (Independência) | –1 dia útil |
| Dias úteis até 15/09 | **6** — 08, 09, 10, 11, 14, 15 |
| Saldo do Escavador é contratado em | **08/09** — o primeiro dos seis |
| Marcos de construção que faltam | **7** — os marcos 4 a 10 da Spec §15 |
| Marcos concluídos até aqui | 3, em ritmo bem mais folgado |

Sete marcos em seis dias, com o insumo pago chegando no primeiro deles, e cada marco fechando com suíte de verificação própria — que é o padrão que o repositório sustenta hoje (92 testes, 45 provas de regra, 23 provas de auditoria contra banco de pé).

**Isto não é motivo para parar. É motivo para o passo 1 ser recortar, e não codificar.** Em contratação de escopo fechado (pergunta 73), o que não cabe precisa ser negociado **agora**, não descoberto no dia 14. O recorte proposto está na §4, passo P-01, e virou a **D-207**.

---

## 2. Legenda

| Marca | Significa |
|---|---|
| 👤 | O usuário faz ou providencia — fora do Claude Code |
| 🤖 | Uma sessão de Claude Code faz |
| 🔴 | **Urgente** — tem data em cima |
| 🚧 | **Bloqueador** — a coluna "trava" diz o quê |
| 🔀 | **Independente** — pode começar a qualquer momento, fora de ordem |
| ⏭️ | **Pulável** nesta fase, sem afetar o que vem depois |

---

## 3. O mapa de dependências

```
P-01 recorte do escopo ─────────────┐
                                    ├──> define a prioridade de TUDO abaixo
P-02 aval das decisões ─────────────┘

P-04 saldo Escavador (08/09) ──┬──> P-15 verificação ponta a ponta
                               ├──> P-16 monitoramentos de produção
                               └──> reconciliação do motor de custo (parte de P-08)

P-03 números da Malu ──────────┬──> P-16 (limite_aparicoes é IRREVERSÍVEL)
                               ├──> P-11 triagem por CNJ (precisa da lista da Ana Beatriz)
                               └──> P-14 rito do alerta (N1, N2, horário útil)

P-05 cláusula LGPD ────────────┐
P-06 consertos de infra ───────┼──> ENTRADA DE DADO REAL EM PRODUÇÃO
P-07 identidades no Telegram ──┘

P-08 motor de custo ──> P-10 cache ──┬──> P-12 SDK ──> P-13 MCP ──> P-15
                                     └──> P-11 receptor/vigilância ──> P-14
P-09 Policy Gate ────────────────────────────────────────────────────> P-15
```

**A leitura que importa:** há **duas frentes que não se atrapalham** — a de código (P-08 em diante) e a de providências (P-03 a P-07). Elas só se encontram no fim, na entrada em produção. As providências podem correr enquanto as sessões constroem.

---

## 4. Bloco 0 — urgente e bloqueador

### P-01 · 👤🔴🚧 Recortar o escopo com a Malu — antes de 08/09

**Trava:** a prioridade de todo o resto. Sem isso, as sessões constroem na ordem errada e o dia 15 chega com sete meias-entregas em vez de duas inteiras.

O recorte proposto (**D-207**):

| Entrega | Recorte proposto para 15/09 | O que fica para a fase seguinte |
|---|---|---|
| **E2 · Vigilância de prazo** | **Inteira.** Publicação de diário vira alerta nominal no Telegram, com triagem por CNJ, rito de escalada e inventário | Vigilância de movimentação processual (RF-12), que depende de consulta paga |
| **E1 · Fundação e consulta** | **Fundação inteira** — identidade, Policy Gate, auditoria, motor de custo — mais **uma** consulta processual funcionando ponta a ponta pelo Telegram | Cache (RF-06), painel de custo (RF-08), relatório de acesso amplo (RF-37) |

**Por que E2 inteira e E1 recortada.** E2 já entrega dado real desde 27/08: o *callback* (aviso automático que o Escavador dispara quando algo é publicado) traz ~6 publicações por dia útil, de graça, e 37 eventos já estão gravados no banco. O que falta em E2 é **ligar o que já chega a um alerta com nome e rito**. E1, ao contrário, precisa de cinco marcos de código novos *e* do saldo que só chega dia 08.

**Se a Malu não aceitar o recorte**, a alternativa honesta é mover a data — não apertar o trabalho. Perder prazo de cliente por software mal verificado é o pior desfecho possível deste projeto, e está escrito assim no PRD.

### P-02 · 👤🔴🚧 Dar o aval nas decisões, no PRD e na Spec

**Trava:** formalmente, toda a construção. O PRD (v2.0) e a Spec Parte I (v1.2) estão desde 27/08 em "🟡 Proposta — aguarda aval do usuário".

**O tamanho real do problema:** **173 decisões em estado 🟡 Proposta** contra 2 confirmadas. Isso é dívida acumulada, não uma pilha de escolhas pendentes — a maior parte é registro de coisa que o projeto já fez e que ninguém contestou.

**Recomendação:** não ler as 173. O passo **P-17** produz um digesto — a lista curta (estimadas 8 a 12) das decisões que ainda mudam desenho e merecem leitura individual, mais um "de acordo em bloco" datado para o resto.

### P-03 · 👤🔴🚧 Levar à Malu o pacote de números e as perguntas que sobraram

**Trava:** P-11 (triagem), P-14 (rito do alerta) e P-16 (criação dos monitoramentos). O texto já está pronto no PRD §9.3.1.

| O que perguntar | Por que trava | Urgência |
|---|---|---|
| **A lista dos ~24 processos da Ana Beatriz que o escritório acompanha** | É a **chave da triagem por CNJ** (RF-45). A Ana Beatriz atua em outros escritórios; sem essa lista o sistema não distingue publicação do escritório de publicação de fora | 🔴 **A mais bloqueante de todas** |
| **O `limite_aparicoes` de cada monitoramento novo** | ⚠️ **Não pode ser alterado depois de criado** (R-46). Errar aqui custa criar tudo de novo | 🔴 Antes de P-16 |
| **20a a 20e** — 2h úteis para chamar todos? 4h para escalar? Qual o horário útil? Quanto tempo o pedido de aprovação vive? E **quando a janela de reversão expira em silêncio, o alerta fecha ou reabre?** | Configuração de E2 (RF-13) | 🟠 Antes de P-14 |
| Confirmar o V1 para a Ana Beatriz — R$ 3,00/mês contra R$ 55–72 do V2 | Custo mensal de E2 | 🟠 Junto com o resto |

**A 20e merece destaque na conversa.** Hoje o desenho diz que **o silêncio da advogada ratifica** o encerramento feito pela colaboradora. Está registrado como **R-68**, e é a única coisa nesta fase que contraria a linha *"Nunca"* do próprio rito do PRD §5.2.1. Vale a Malu decidir isso com os olhos abertos.

### P-04 · 👤🔴🚧 Contratar o saldo do Escavador — 08/09 — e resolver a assinatura antes

**Trava:** P-15, P-16 e a reconciliação do motor de custo. Sem saldo, nenhuma consulta processual roda.

**Ordem obrigatória:**

1. **Primeiro**, conferir no painel a assinatura `2813617` — a vigilância que entrega as publicações hoje. Ela **renova em 26/09** e passa a cobrar. Recarregar com ela ativa financia uma cobrança mensal que ninguém está olhando (R-13).
2. **Decidir** se ela vira a vigilância de produção da Malu ou se sai e nasce outra com o `limite_aparicoes` correto — o valor atual, 1000/mês, foi escolhido em ambiente de teste.
3. **Só então** contratar.

**Perguntar ao comercial, na mesma conversa:** qual a tarifa por rota do plano contratado. O projeto já mediu que a tarifa plana de R$ 3,00 informada pelo suporte **não existe** (D-108) — o débito segue o catálogo por rota, e há rotas gratuitas. Vale ter isso por escrito antes de o dinheiro entrar (R-44).

### P-05 · 👤🔴🚧 Cláusula de LGPD antes do primeiro dado real

**Trava:** a entrada em produção. Não o código — a produção.

A infraestrutura é do prestador, não do escritório (D-148). Sob a LGPD isso faz do escritório **controlador** e do usuário **operador** de dado sob sigilo profissional (R-48). Precisa de cláusula escrita de finalidade, devolução, expurgo e continuidade, assinada **antes** de o primeiro processo real do escritório entrar no banco.

Não é burocracia adiável: é a diferença entre um contrato de prestação e uma exposição pessoal sobre dado sigiloso de terceiros.

### P-06 · 👤🔴🚧 Consertar a infraestrutura — o que precede dado real

**Trava:** a entrada em produção, pelo mesmo motivo do P-05.

| # | O que | Por que agora |
|---|---|---|
| 1 | **Portainer publicado na internet** | É o plano de controle do Docker inteiro — quem entra ali comanda as 22 stacks. É o mais grave que sobrou (R-62) |
| 2 | **Prometheus publicado, e sem autenticação por padrão** | Entrega o mapa da infraestrutura a quem pedir (R-62) |
| 3 | **Portas 5432 e 5433 abertas à internet** | Confirmado por teste de fora em 05–06/09 (R-63). ✅ Zero tentativa de autenticação falha numa janela de ~33 h — mas **ninguém ter tentado não é estar protegido**. Solução: **túnel SSH no pgAdmin**; firewall como remendo imediato |
| 4 | **Backup do PostgreSQL parado**, em laço de falha | Em conserto por outro caminho (R-66). **O risco só cai com backup rodando E restauração testada** — restauração não testada é backup imaginário |
| 5 | Grafana, RabbitMQ e MinIO ainda com senha inicial? | Aberto — vale tentar entrar e ver |
| 6 | Região do datacenter da Hostinger | Importa para a LGPD, e está no painel |
| 7 | Segredos em variável de ambiente, sem cofre | O Swarm tem cofre nativo (R-64). Pode esperar |

**Os itens 1 a 4 são o portão.** Os 5 a 7 podem correr depois.

### P-07 · 👤🔴🚧 As sete identidades no Telegram, e o bot de produção

**Trava:** RF-01 (identidade individual) e **todo alerta de E2** — um alerta que não chega a ninguém não é vigilância.

Levantado em 06/09: existe bot de Telegram na **demo**, não em produção, e nenhuma das sete pessoas está cadastrada.

1. **Criar o bot de produção**, separado do bot da demo, e guardar o token pelo `guardar-segredo.mjs` — nunca por captura de tela do painel (R-51).
2. **Coletar o id de Telegram das sete pessoas** — Malu, Ana Beatriz, Andressa, Estefanny, Bia, Paula e Mota.
3. **Exigir 2FA em cada conta.** A identidade da plataforma inteira fica ancorada em número de telefone (R-47), e o escritório não administra essas contas — não há desligamento central.

É o passo mais fácil de subestimar: não é técnico, depende de sete pessoas responderem, e cada dia de atraso é um dia sem poder testar E2 de verdade.

---

## 5. Bloco 1 — construção

A ordem canônica é a da **Spec §15** — não a seção "Próximo passo" do `00-estado-atual.md`, que está congelada em 31/08 e foi ultrapassada pelos fatos.

| # | Passo | Marco | Depende de | Crédito? |
|---|---|---|---|---|
| **P-08** | 🤖 **Motor de custo** — catálogo, estimativa, reserva, reconciliação, disjuntor | 4 | Nada — o marco 3 está pronto | ❌ Só a reconciliação final |
| **P-09** | 🤖🔀 **Policy Gate** — emite a sessão assinada e nega o que deve negar | 9 | Nada | ❌ Não |
| **P-10** | 🤖 **Cache** — validade por tipo, invalidação, cache negativo, isolamento | 5 | P-08 | ❌ Não |
| **P-11** | 🤖🔀 **Receptor gravando na hora + base de vigilância + triagem por CNJ** (RF-45 a RF-48) | 8 | P-03 para a lista de CNJ; o mecanismo, nada | ❌ Não |
| **P-12** | 🤖 **SDK do Escavador** sobre as gravações, V1 e V2 no mesmo chassi | 6 | P-10 | ❌ Roda sobre `captura/respostas-brutas/` |
| **P-13** | 🤖 **Servidor MCP do Escavador** com as ferramentas e os perfis | 7 | P-12 | ❌ Não |
| **P-14** | 🤖🔀 **Fluxos n8n de produção** — bot do Telegram (consulta E1) e alerta de prazo com o rito (E2) | — | P-07 (bot) e P-03 (números) | ❌ Não |
| **P-15** | 🤖🔴 **Verificação ponta a ponta** com uma chamada real | 10 | P-04, P-13, P-09 | ✅ **Sim** |
| **P-16** | 🤖🔴 **Criar os monitoramentos V1 de produção** (Malu e Ana Beatriz) | — | P-03 e P-04 | ✅ **Sim, e é irreversível** (R-46) |

**Três observações que mudam a ordem de ataque:**

1. **P-11 é o caminho mais curto para valor real.** O callback já entrega desde 27/08, mas as entregas só chegam ao banco quando alguém roda `npm run receptor:recolher` à mão — e a retenção de execução do n8n é de **14 dias OU 10.000 execuções, o que vier primeiro** (D-203), num servidor com fluxos comerciais de outros clientes rodando. Entrega que chegue e seja podada antes do próximo recolhimento **some**. P-11 fecha esse buraco e é o coração de E2.
2. **P-09 não depende de nada, e ninguém está olhando para ele.** Ser o marco 9 na Spec dá impressão de ser tardio, mas ele só depende do marco 3, fechado em 31/08. Pode começar imediatamente.
3. **P-16 é a única operação irreversível da lista.** Não rodar sem a resposta escrita da Malu na mão.

---

## 6. Bloco 2 — documentação e higiene

| # | Passo | O que está errado |
|---|---|---|
| **P-17** | 🤖🔴 **Digesto de aval** — a lista curta das decisões que ainda mudam desenho | 173 decisões em 🟡 Proposta contra 2 confirmadas. É dívida, não escolha pendente. Destrava o **P-02** |
| **P-18** | 🤖🔀 **Corrigir a colisão de numeração no PRD** | **RF-42, RF-43, RF-44 e RF-45 estão cada um definido duas vezes**, com significados diferentes — os do catálogo de gabaritos (§6.3) e os da vigilância (§9.3). Mesmo tipo de colisão que já aconteceu com D-101/D-102 em 27/08 |
| **P-19** | 🤖🔀 **Atualizar o que envelheceu** | O `README.md` diz **7 migrações e 44 testes** e sua tabela de documentos para no `05`; o disco tem **13 migrações, 92 testes e 17 documentos**. O cabeçalho do `00-estado-atual.md` diz **10 migrações**, e sua seção "Onde estamos" diz **"Fase 2"** enquanto o cabeçalho do mesmo documento diz **"Fase 3"** |
| **P-20** | 🤖⏭️ **Preparar as Partes A2 a A6 da descoberta** | 25 perguntas nunca enviadas. Dimensionam **E3 e E4** — fora desta fase |

---

## 7. Bloco 3 — depois de 15/09

| # | Passo | Quando |
|---|---|---|
| **P-21** | 👤🔴 **Decidir a assinatura `2813617` antes de 26/09** | Data dura. Ela renova sozinha e passa a cobrar |
| **P-22** | 👤 Chave de API do Trello em **conta dedicada** do escritório (D-196), depois o inventário do Butler | Antes da primeira gravação no Trello, nunca depois — o Butler reage ao que escrevermos |
| **P-23** | 👤 WhatsApp por BSP, não direto pela Meta (D-197) | E4. Pelo caminho da Meta são semanas, e o tempo é da Meta |
| **P-24** | 🤖 HMAC no anonimizador (D-159), retentativa com idempotência, cofre de segredos no Swarm | Achados abertos, nenhum urgente |
| **P-25** | 🤖 Entender por que o *polling* discordou do callback (R-55) | Precisa de crédito, baixo valor agora |

---

## 8. O que dá para pular sem afetar nada

| Pode pular | Por quê |
|---|---|
| **Tudo de Trello (P-22) e de WhatsApp (P-23)** | E3 e E4 saíram desta fase por decisão registrada (D-195) |
| **Partes A2 a A6 da descoberta (P-20)** | Escopo fino de E3 e E4 |
| **Perguntas 15, 16a e 30** | E-mail, conta compartilhada e software de gestão — fase seguinte |
| **Teto de gasto mensal com IA (pergunta 71)** | Adiado pelo usuário. Não trava a entrega, mas deixa a Regra 6 sem número no eixo de IA |
| **P-25 (R-55) e o HMAC (P-24)** | Gastam crédito ou tempo sem destravar nada |
| **As duas demos** | Cumpriram o papel. Não precisam sobreviver à produção |
| **Itens 5 a 7 do P-06** | Os itens 1 a 4 são o portão; estes podem esperar |

**E um que parece pulável e não é: o cache (P-10).** RF-06 tem critério de aceite explícito — duas consultas ao mesmo processo em 1 hora geram uma cobrança, não duas. Sem ele, cada pergunta repetida de cada uma das sete pessoas vira dinheiro. Se precisar cortar, corte para uma versão mínima; não corte inteiro.

---

## 9. Guia de sessões em paralelo

O repositório tem **três pontos de conflito silencioso** — do tipo que não dá erro, só perde trabalho.

### 9.1 Os três recursos exclusivos

| Recurso | Por que é exclusivo | Regra |
|---|---|---|
| **O banco de desenvolvimento** | Existe **um** container (`lex-banco`), com **um** volume (`lex-dados-banco`). `banco:zerar`, `banco:migrar` e `npm run verificar` mexem no mesmo estado | 🔴 **Uma sessão por vez.** Duas rodando `verificar` juntas dão teste verde mentiroso e teste vermelho falso |
| **`docs/00-estado-atual.md` e `docs/01-diretrizes-gerais.md`** | **Toda** sessão escreve neles no fim — o hook `fechar-ciclo` cobra isso — e todas compartilham o mesmo disco, sem *worktree* separada | 🔴 **Uma sessão por vez na hora de fechar.** Sem merge do Git no meio, a segunda escrita apaga a primeira em silêncio |
| **A numeração das migrações** | Duas sessões criando `014-*.sql` ao mesmo tempo geram duas migrações 014 | 🟡 Quem for criar migração avisa a outra sessão, ou reserva a faixa antes |

### 9.2 Os dois trilhos

**Trilho 1 — a corrente do chassi. Estritamente uma de cada vez.**

```
P-08 motor de custo → P-10 cache → P-12 SDK → P-13 servidor MCP
```

Todos tocam `packages/mcp-core/src/chassi.ts` e `etapas.ts`, todos precisam do banco para verificar, e cada um depende do anterior. **Nunca dois destes ao mesmo tempo**, nem em janelas separadas do Claude Code.

**Trilho 2 — as peças soltas. Paralelizáveis entre si e com o Trilho 1.**

| Sessão | Arquivos que toca | Conflita com |
|---|---|---|
| **P-09 · Policy Gate** | `services/policy-gate/`, `packages/dominio/src/escopo.ts` | Quase nada. Só o banco, na verificação |
| **P-11 · Receptor e triagem** | `services/receptor-callbacks/`, migrações novas | Só o banco e a numeração de migração |
| **P-14 · Fluxos n8n** | `n8n/`, scripts de montagem | **Nada.** Nem TypeScript, nem banco |
| **P-18 / P-19 · Documentação** | `docs/`, `README.md` | 🔴 **Conflita com todas** |

### 9.3 As combinações recomendadas

| Rodar juntas | Segurança |
|---|---|
| **P-09 + P-11 + P-14** | 🟢 **Seguro em paralelo** — três sessões, arquivos disjuntos. Coordenar só quem roda `verificar` e quem cria migração |
| **Trilho 1 (uma de cada vez) + P-14** | 🟢 **Seguro** — P-14 não toca TypeScript nem banco |
| **Trilho 1 + P-11** | 🟡 **Cuidado** — as duas precisam do banco. Uma constrói enquanto a outra verifica; nunca as duas verificando |
| **Qualquer sessão + P-18/P-19** | 🔴 **Não.** Documentação roda **sozinha**, entre lotes |
| **P-15 ou P-16 + qualquer coisa** | 🔴 **Sozinhas, sempre.** Gastam crédito, e P-16 é irreversível |

### 9.4 Três regras de operação

1. **Commitar antes de abrir a próxima sessão.** Árvore limpa é o que impede uma sessão de atribuir a si o trabalho da outra — o hook `anotar-escrita` protege a autoria, não a memória de quem esqueceu o que estava em andamento.
2. **Fechar uma sessão por vez.** O momento perigoso não é o trabalho, é o encerramento, quando duas escrevem em `00-estado-atual.md`.
3. **Para paralelismo de verdade**, usar `git worktree` — cópia isolada do repositório, com branch própria. Aí o conflito volta a ser um merge visível do Git, em vez de uma sobrescrita silenciosa. Vale para o Trilho 2; não vale para uma semana de seis dias.

---

## 10. O calendário

Assumindo a **D-207** aceita.

| Dia | Usuário (👤) | Sessões (🤖) |
|---|---|---|
| **Dom 06/09** | Mandar à Malu o recorte (P-01) e o pacote de números (P-03) | **P-17** digesto de aval · **P-09** Policy Gate começa |
| **Seg 07/09** *(feriado)* | Coletar os 7 ids de Telegram e criar o bot (P-07) — não depende de expediente | **P-09** e **P-11** em paralelo |
| **Ter 08/09** | 🔴 **Contratar o Escavador** (P-04), com a `2813617` resolvida antes · P-06 itens 1 a 3 | **P-08** motor de custo · **P-11** continua · **P-14** começa |
| **Qua 09/09** | Cláusula de LGPD em redação (P-05) · P-06 item 4 | **P-10** cache · **P-14** continua |
| **Qui 10/09** | Respostas da Malu na mão, espera-se | **P-12** SDK · **P-11** recebe a lista de CNJ e fecha a triagem |
| **Sex 11/09** | Conferir P-06 fechado — é o portão da produção | **P-13** servidor MCP |
| **Seg 14/09** | Cláusula assinada (P-05) | 🔴 **P-15** ponta a ponta, sozinha · depois **P-16**, sozinha |
| **Ter 15/09** | Acompanhar o primeiro dia real | **P-19** documentação · reserva para o que escorregar |

Está apertado e **sem folga real**. O que quebra primeiro, se quebrar, é o Trilho 1 — e é por isso que P-01 vem antes de tudo.

---

## 11. Decisão que este documento propõe

| # | Decisão | Recomendação |
|---|---|---|
| **D-207** | **O recorte mínimo de E1 + E2 para 15/09: E2 inteira, E1 com a fundação inteira e uma consulta ponta a ponta** — cache, painel de custo e relatório de acesso amplo saem para a fase seguinte | Levar à Malu antes de 08/09. Se ela recusar o recorte, mover a data — não apertar o trabalho |

---

## 12. Achados de documentação, levantados em 06/09

Nenhum trava código. Três enganam quem ler o repositório na semana que vem — inclusive uma sessão nova de Claude Code, que lê estes arquivos como fonte da verdade.

| # | Achado | Onde | Peso |
|---|---|---|---|
| 1 | **RF-42 a RF-45 estão cada um definido duas vezes**, com significados diferentes: catálogo de gabaritos e vigilância de prazo | `08-prd.md` §6.3 e §9.3 | **Médio** — dois requisitos com o mesmo número viram um só na hora de conferir o aceite |
| 2 | O `README.md` diz **7 migrações e 44 testes**; o disco tem **13 e 92**. A tabela de documentos dele para no `05`, e existem 17 | `README.md` | Baixo, e é o cartão de visita do repositório |
| 3 | O cabeçalho do `00-estado-atual.md` diz **10 migrações**; o disco tem 13 — as 011 a 013 vieram do receptor em 02/09 e o cabeçalho não acompanhou | `00-estado-atual.md` | Baixo |
| 4 | A seção "Onde estamos" diz **"Fase 2 em andamento"**; o cabeçalho do mesmo documento diz **"Fase 3 — construção"**. E a seção "Próximo passo" está congelada em 31/08 | `00-estado-atual.md` | **Médio** — é a seção que uma sessão nova lê para saber o que fazer, e ela aponta para o passo errado |

Os quatro são o conteúdo dos passos **P-18** e **P-19**.
