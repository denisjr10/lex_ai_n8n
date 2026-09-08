# Digesto de aval — as decisões que ainda pedem a sua leitura

| Campo | Valor |
|---|---|
| Versão | **2.1 — os cinco primeiros avais chegaram, e três delas geraram decisão nova.** A-1, A-2, A-4 e A-5 confirmadas; **A-3 recusada** (não recortar, mover a data). Nasceram **D-219 a D-222**, na nova §3.1. **2.0 — reescrita para ser lida por quem decide, não por quem programou.** Cada ficha do grupo A ganhou contexto, exemplo concreto, o custo em reais quando existe e uma linha de decisão para marcar. Entrou o **glossário** da §9. Nenhum conteúdo de decisão mudou entre a v1.1 e esta |
| Data | 2026-09-08 |
| Estado | 🟢 **Pronto para leitura.** Não altera o estado de nenhuma decisão — o aval é do usuário |
| Fase | 3 — construção |
| Passo | **P-17** do [plano de execução](17-plano-de-execucao.md) §6. Destrava o **P-02** |
| Herda de | `01-diretrizes-gerais.md` §13 (registro único e centralizado), `17-plano-de-execucao.md`, `00-estado-atual.md` |

> **O que este documento é.** A leitura curta da pilha de aval. A §13 das diretrizes tem **182 decisões em 🟡 Proposta**, e ler as 182 não é caminho — a maior parte é registro de coisa que o projeto já fez e que ninguém contestou. Aqui elas estão separadas em três grupos: as que **precisam da sua leitura uma a uma** (§3), as que se confirmam **em bloco, com uma data** (§4), e as que **não deveriam estar em Proposta** (§5).
>
> **O que este documento não é.** Ele não decide nada e não muda nenhum status. A §13 continua sendo o registro único; este é o índice de leitura dela. **Nenhuma linha da §13 foi alterada para produzir este digesto.**

---

## 0. Como ler isto — leia esta seção primeiro, ela custa dois minutos

### O que é uma "decisão" neste projeto

Uma **decisão** (identificada `D-nn`) é uma escolha de desenho registrada por escrito, com o motivo junto. Ela existe para que ninguém — nem você daqui a seis meses, nem outra pessoa que entre no projeto — precise adivinhar *por que* algo foi feito daquele jeito. Todas moram numa tabela só, a §13 de `01-diretrizes-gerais.md`.

Cada decisão tem um **estado**:

| Estado | Significa | Quem resolve |
|---|---|---|
| 🟡 **Proposta** | Eu recomendei, você ainda não disse sim nem não. **O projeto já opera assim** — o que falta é o registro formal | Você |
| ✅ **Confirmada** | Fechada. Mudar exige decisão nova | — |
| 🔴 **Em aberto** | Falta informação **do escritório**, não sua | A Malu |

### O que "dar aval" muda na prática

Pouco no código e muito no papel. As decisões em 🟡 já estão implementadas ou já orientam o trabalho — **o aval não liga nada, ele torna explícito o que já vale**. Isso importa por três motivos concretos:

1. **O PRD e a Spec estão travados desde 27/08** esperando isto. São os dois documentos que descrevem o produto e como ele é construído, e ambos dizem "aguarda aval do usuário" no cabeçalho.
2. **Em contrato de escopo fechado** (você entrega um escopo por um preço, e estouro não vira hora extra), o que não está escrito e acordado vira discussão depois.
3. **Decisão em 🟡 é decisão que qualquer sessão futura pode desfazer sem perceber** — e algumas destas são barreiras de segurança.

### Como percorrer este documento

| Se você tem | Leia |
|---|---|
| **10 minutos** | A §3.0 (o quadro das 15 em uma tabela) e as **7 marcadas 🔴** |
| **30 minutos** | A §3 inteira, marcando a linha de decisão de cada ficha |
| **45 minutos** | Acrescente a §4 (o bloco) e a §5 (as que já venceram) |

**Não precisa ler a §13 inteira. Nunca.** Se uma ficha da §3 não convencer, é sinal de que eu expliquei mal — pergunte, não vá para a tabela.

### Sobre os termos técnicos

Toda ficha explica o termo entre parênteses na primeira vez que ele aparece. **O glossário completo está na §9**, e vale abrir junto numa segunda aba: ele explica MCP, chassi, faixas de aprovação, callback, hash, política por linha e o resto do vocabulário que este projeto acumulou.

---

## 1. A contagem de hoje — o número 173 estava velho

Contado em **08/09** sobre `01-diretrizes-gerais.md` §13, linha a linha:

| Estado | Linhas |
|---|---|
| 🟡 **Proposta** | **181** — cinco saíram com os avais de 08/09, e quatro entraram (D-219 a D-222) |
| ✅ Confirmada / Resolvida | **35** |
| 🔴 Em aberto | 3 — D-197, D-202, D-212 |
| 🔄 Revisada | 1 — D-205 |
| ❌ Derrubada / Recusada | 2 — D-153 e **D-207** |
| **Total de linhas** | **222**, e **222 identificadores distintos** |

Três correções ao que o `00-estado-atual.md` e o plano diziam:

1. **Eram 179 em Proposta, não 173** — e viraram 182 no fim do dia. O número 173 é de 06/09 e o repositório andou: D-208 a D-212 nasceram em 07 e 08/09, D-216 a D-218 nasceram desta triagem, e o resto veio do levantamento da instância.
2. **São 31 confirmadas, não 2.** O `00-estado-atual.md` §Decisões dizia "173 contra 2 ✅" — a conta ignorava as 13 da demo, as 5 resolvidas pelo escritório em 27/08, as 4 da revisão externa e as de 05 a 08/09. A pilha é grande, mas menos torta do que o registro fazia parecer.
3. ✅ **A tabela tinha 215 linhas e 212 identificadores** — três IDs usados duas vezes cada. **Corrigido em 08/09** com o seu aval, e a §15 tinha a mesma doença no **R-70**. Ver §5.1.

Uma delas conta como Proposta mas com estado escrito à mão fora da convenção: **D-97**, "🟡 Proposta — depende da conversa do usuário com a advogada". Está contada nas 182 e tratada na §5.

---

## 2. Como os três grupos foram separados

| Grupo | Critério | Quantas |
|---|---|---|
| **A — precisa da sua leitura** | Ainda muda desenho, custa dinheiro, afrouxa uma Regra Inegociável, ou é irreversível depois de aplicada | **14 pendentes** — eram 15, cinco foram decididas em 08/09 e quatro novas entraram |
| **B — de acordo em bloco** | Registro de coisa que o projeto já fez, que já está no código ou nos documentos, e que ninguém contestou. Confirmar é formalizar o que já existe | **159** |
| **C — não deveria estar em Proposta** | Superada, contradita por decisão mais nova, ou dependia de resposta que já chegou | **8** |

14 + 159 + 8 = **181**. Toda decisão em Proposta está em exatamente um grupo.

**O filtro do grupo A, em detalhe.** Uma decisão entra na §3 se responde **sim** a pelo menos uma destas quatro perguntas:

| Teste | Pergunta | Por que é critério de leitura |
|---|---|---|
| **Muda desenho** | Se você disser não, alguma coisa é construída de outro jeito? | Decidir depois custa refazer trabalho |
| **Custa dinheiro** | Sai dinheiro do bolso do escritório ou do seu por causa dela? | A Regra Inegociável 6 diz que custo é requisito, não consequência |
| **Afrouxa uma Regra Inegociável** | Ela abre exceção numa das 8 regras que não se renegociam? | Exceção por omissão não é decisão — precisa ser escolhida |
| **É irreversível** | Depois de aplicada, desfazer custa caro ou é impossível? | É a única categoria em que "decidir depois" não existe |

**Sobre o grupo A ter passado de 12.** A estimativa do plano era "8 a 12", e o filtro devolveu 13 — e depois 15, quando a conversa de 08/09 gerou três decisões novas e aposentou uma. Não cortei nenhuma para caber no número: a que sobrasse de fora seria escolhida por conveniência de contagem, não por mérito. Se quiser ler em duas vezes, a §3 marca **7 como urgentes antes de 15/09** e **8 como podendo esperar** — mas as oito não somem por esperar, e três delas têm data própria.

---

## 3. Grupo A — as que pedem a sua leitura

> ✅ **Cinco foram decididas em 08/09** — A-1, A-2, A-4 e A-5 adotadas; **A-3 recusada**, com a data movendo em vez do escopo encolhendo. As fichas delas ficam aqui, marcadas, porque o registro de *o que foi decidido e com que fundamento* vale mais que a economia de espaço.
>
> 🆕 **Três dessas decisões vieram com perguntas suas, e as perguntas acharam buracos reais no desenho.** As respostas viraram **D-219 a D-222**, na **§3.1** — quatro fichas novas, no fim desta seção.

**Sobram 10 das originais + 4 novas = 14 pendentes.**

### 3.0 O quadro, antes de entrar em cada uma

> 🔴 = urgente, tem data em cima · 🟠 = pode ser lida depois de 15/09 sem prejuízo · ✅ = já decidida · ❌ = recusada

| # | Decisão | Em uma frase | Testes que ela dispara | Custo direto |
|---|---|---|---|---|
| **A-1** | ✅ D-216 | As atendentes aprovam mensagem ao cliente; o que compromete continua com advogada | Afrouxa Regra 2 · Muda desenho | — |
| **A-2** | ✅ D-182 | A vigilância que já entrega publicação real renova em 26/09 | Custa dinheiro · Irreversível | **R$ 3,00/mês** |
| **A-3** | ❌ D-207 | O que entra e o que sai da entrega de 15/09 | Muda desenho · Contrato | — |
| **A-4** | ✅ D-206 | Publicação é triada por número de processo, no receptor | Muda desenho · Custa dinheiro | evita **R$ 52–69/mês** |
| **A-5** | ✅ D-209 | Alerta encerrado por colaboradora reabre se nenhuma advogada tocar | Muda desenho · Afrouxa Regra 2 | — |
| **A-6** | 🔴 D-211 | Matéria sensível encurta o automatismo, não o acesso | Muda desenho | — |
| **A-14** | 🔴 D-217 | A advogada é avisada por exceção, e prestada contas por resumo | Muda desenho | — |
| **A-7** | 🟠 D-149 | Os tetos de gasto ganham número e vão à Malu | Custa dinheiro | teto **R$ 300/mês** |
| **A-8** | 🟠 D-201 | O banco da plataforma não divide instância com o n8n | Custa dinheiro · Segurança | infra |
| **A-9** | 🟠 D-198 | Um provedor só de modelos de IA — e um terceiro vendo os prompts | Muda desenho · LGPD | assinatura |
| **A-10** | 🟠 D-148 | A plataforma roda na sua infraestrutura, não na do escritório | Irreversível · Contrato | hospedagem |
| **A-11** | 🟠 D-192 | Colaborador enxerga a base inteira, como o advogado | Muda desenho · Amplia acesso | — |
| **A-12** | 🟠 D-215 | O HMAC no anonimizador continua adiado | Muda desenho · LGPD | — |
| **A-13** | 🟠 D-196 | A chave do Trello nasce em conta dedicada, não na da Malu | Irreversível | 1 licença |
| **A-15** | 🟠 D-218 | O catálogo de gabaritos sobe de prioridade | Muda desenho | — |
| **A-16** | 🔴 D-219 | A data se move — E2 em 15/09, E1 completa em 30/09 | Muda desenho · Contrato | — |
| **A-17** | 🟠 D-220 | Como um processo novo entra na lista da triagem | Muda desenho | — |
| **A-18** | 🟠 D-221 | Como se cadastra um advogado novo para ser vigiado | Custa dinheiro · Irreversível | **R$ 3,00/mês** cada |
| **A-19** | 🔴 D-222 | Como a advogada confirma, no primeiro e no segundo ciclo | Muda desenho | — |

**Como cada ficha está organizada:** *em uma frase* → *o que está em jogo* (o cenário concreto) → *o que a decisão determina* → *se você disser não* → *recomendação* → *linha de decisão para marcar*.

---

### A-1 · D-216 🔴 — as atendentes aprovam mensagem ao cliente, e isso vira regra, não exceção

> ⚠️ **Substitui a A-1 da v1.0 deste documento, que recomendava reverter a D-171.** A recomendação estava errada por falta de um dado: a autonomia das duas colaboradoras **é decisão de negócio da advogada proprietária**, não sobra esquecida da demonstração. Ver §8.

**Em uma frase.** Estefanny e Andressa podem aprovar mensagens ao cliente sem serem advogadas — mas só as que **informam**; as que **comprometem** continuam exigindo advogada identificada.

**O que está em jogo.** As duas foram contratadas como atendentes. Se toda mensagem ao cliente precisasse de advogada, ou a Malu responde tudo o tempo todo (e o projeto não entrega ganho nenhum), ou ninguém responde. Por outro lado, a **Regra Inegociável 2** do projeto diz que *ato com efeito jurídico ou de prazo exige aprovação de advogado identificado* — então a autonomia não pode ser total. A decisão é onde fica a linha.

**O que a decisão determina.** A linha é traçada **pela consequência da mensagem, não pelo cargo de quem escreve**:

| Tipo de mensagem | Exemplo | Quem aprova |
|---|---|---|
| **Informa** | "Recebemos seu documento" · "A audiência ficou para 12/11" · "O processo está aguardando decisão" | Qualquer perfil cadastrado |
| **Compromete** | "O prazo para recorrer vence dia X" · "Suas chances são boas" · "Confirmo que o valor foi depositado" · qualquer orientação jurídica | **Advogada identificada, sempre** |

É a mesma régua que a **D-194** já usou para os atos internos: separar por **reversibilidade** (dá para desfazer?) e **externalidade** (produz efeito para fora?).

⚠️ **A consequência técnica, explicada.** O projeto classifica toda ação numa **faixa de aprovação** (A0 a A4b — a escala que diz que rito cada ação segue; ver §9). Mensagem ao cliente em texto livre é a faixa **A3b**. Hoje o **chassi** (a camada de código comum que confere identidade e permissão antes de qualquer ação acontecer) **exige papel de advogado em A3b** — isso foi decidido em 31/08, pela D-156. Para as atendentes aprovarem, essa conferência precisa ser afrouxada em código.

Isso não é detalhe de implementação: a própria D-156 escreveu a regra desta situação — *"afrouxar depois é decisão registrada; afrouxar por omissão não é decisão nenhuma"*. É por isso que a D-216 existe em vez de alguém simplesmente mexer no código.

**O que NÃO se afrouxa, em nenhuma hipótese:**
- **A4b** — ato que produz direito perante terceiro (petição, acordo, renúncia). Regra 2 inteira, sem exceção.
- **Matéria sensível** — família, criminal, menores, segredo de justiça (D-211). Nunca sai resposta automática com conteúdo.

**Se você disser NÃO.** A Malu volta a ser o gargalo único de todo o atendimento, o que anula o motivo de as duas terem sido contratadas — e o escritório provavelmente contorna o sistema por fora, respondendo pelo WhatsApp pessoal, o que é pior: perde-se o registro.

**Recomendação: adotar**, e implementar como **escopo verificado no chassi** (permissão conferida em código, antes da ação) — nunca como instrução escrita no *prompt* (o texto que se manda ao modelo de IA). É a **Regra Inegociável 1**: o agente de IA nunca é a fronteira de segurança, porque instrução em prompt se contorna com conversa.

✅ **DECIDIDO em 08/09 — adotar como recomendado.** A D-216 está **✅ Confirmada** na §13.
**O que isso põe em movimento:** a fronteira *informa* × *compromete* passa a valer, e o afrouxamento da conferência de papel em A3b vira trabalho de implementação em vez de pergunta em aberto. Continua inteira a exigência de advogada em **A4b** e em **matéria sensível**.

---

### A-2 · D-182 🔴 — a vigilância `2813617` renova em 26/09

**Em uma frase.** O monitoramento que hoje avisa o escritório de toda publicação no diário oficial em nome da Malu é uma assinatura paga, e ela se renova sozinha em 26/09.

**O que está em jogo.** Essa vigilância (número `2813617`) não é resto de teste — **é a única fonte viva de publicação real do projeto**. Ela entrega cerca de **6 publicações por dia útil**, de 22 processos, e **26 das primeiras 30 eram intimação**, que é o tipo de publicação que faz prazo correr. Foram 30 entregas medidas entre 27/08 e 02/09, e o ritmo continua.

**Os números que importam:**

| Fato | Valor |
|---|---|
| Custo da assinatura | **R$ 3,00/mês** por termo vigiado (o nome da advogada) |
| Custo das entregas | **R$ 0,00** — o *callback* (aviso automático que o fornecedor manda quando algo acontece, em vez de a gente ficar perguntando) é gratuito, e continuou funcionando **depois de o crédito de teste expirar** |
| Próxima renovação | **26/09** |
| Saldo disponível hoje | **Zero** — a cota de teste expirou em 01/09 com R$ 44,00 dentro |

**A armadilha.** Criar um monitoramento **consome crédito**. Como o saldo expirou, se a vigilância for removida hoje ela **não pode ser recriada** até você contratar saldo novo. Você estaria desligando a única coisa do projeto que já funciona com dado real.

**Se você disser NÃO (remover).** E2 (a entrega de vigilância de prazo) perde a fonte que a alimenta, e a construção passa a ser feita contra dado simulado — exatamente o erro que a D-135 já registrou como perigoso ("teste construído sobre o instantâneo passaria contra dado que a produção nunca vai ver").

**Recomendação: manter**, e decidir junto com a recarga de crédito (passo P-04 do plano). R$ 3,00/mês pelo insumo central de E2 é barato ao ponto de a economia ser uma escolha errada — economizar aqui é economizar na única coisa que E2 entrega.

**Data dura: 26/09.** Ela renova sozinha. Não decidir é decidir por manter, tendo pago.

✅ **DECIDIDO em 08/09 — manter, e tratar junto com a contratação de saldo.** A D-182 está **✅ Confirmada** na §13.
**O que isso põe em movimento:** a vigilância NÃO se remove, e a renovação de 26/09 entra na conversa do **P-04**. A data continua dura — ela renova sozinha.

---

### A-3 · D-207 🔴 — o recorte do escopo de 15/09

**Em uma frase.** O que foi acordado para 15/09 não cabe em 15/09, e esta decisão diz o que entra e o que sai.

**O que está em jogo.** A conta que gerou a decisão:

| Fato | Número |
|---|---|
| Dias úteis entre 08/09 e 15/09 | **6** — 08, 09, 10, 11, 14 e 15 (07/09 é feriado) |
| Marcos de construção que faltam | **7** — os marcos 4 a 10 da Spec |
| Marcos entregues até aqui | **3**, em ritmo bem mais folgado |
| Quando o crédito pago chega | **08/09** — o primeiro dos seis dias |

Sete marcos em seis dias, com o insumo pago chegando no primeiro deles, e cada marco fechando com sua própria bateria de testes — que é o padrão que o projeto sustentou até aqui (92 testes automatizados hoje).

**O que a decisão determina.** O recorte proposto:

| Entrega | O que sai em 15/09 | O que fica para depois |
|---|---|---|
| **E2 — vigilância de prazo** | **Inteira.** Já recebe dado real por callback desde 27/08; falta ligar o que chega a um alerta com nome e rito | — |
| **E1 — fundação e consulta** | Fundação **inteira** (identidade, Policy Gate, auditoria, motor de custo) + **uma** consulta processual ponta a ponta pelo Telegram | **Cache** (RF-06), **painel de custo** (RF-08), **relatório de acesso amplo** (RF-37) |
| **E3 — demandas / Trello** | Nada | Tudo — já estava fora pela D-195 |
| **E4 — atendimento ao cliente** | Nada | Tudo — já estava fora pela D-195 |

**Se você disser NÃO.** Volta a valer o escopo cheio da D-195, e o risco muda de natureza: não é entregar menos, é entregar **mal verificado**. O PRD registra isso com todas as letras — *perder prazo de cliente por software mal verificado é o pior desfecho possível do projeto*.

**Recomendação: adotar, e levar à Malu.** Em contrato de escopo fechado, o que não cabe se negocia **agora**, não no dia 14. ⚠️ E se ela recusar o recorte, a alternativa honesta é **mover a data**, não apertar o trabalho.

Este é o passo **P-01** do plano, e ele define a prioridade de tudo o mais — por isso está entre os primeiros.

❌ **RECUSADO em 08/09 — não recortar, e negociar mover a data**, *"para que possamos fazer tudo e entregar completo e verificado"*. A D-207 está **❌ Recusada** na §13.
**Isto não contraria a decisão — é a saída que ela mesma previa:** recusado o recorte, a alternativa é **mover a data, não apertar o trabalho**.
**O que isso põe em movimento:** cache (RF-06), painel de custo (RF-08) e relatório de acesso amplo (RF-37) **voltam ao escopo**. A data vira a **D-219**, ficha **A-16** da §3.1 — com um número, porque mover data sem número não se negocia.
⚠️ **E3 e E4 continuam fora**, por força da D-195, que a Malu já acordou. "Fazer tudo" aqui significa **E1 e E2 inteiras**.

---

### A-4 · D-206 🔴 — a triagem de pertinência por CNJ

**Em uma frase.** A vigilância captura publicações pelo **nome** da advogada, e nem toda publicação em nome dela é do escritório — então alguém precisa filtrar, e a decisão é **onde** e **por qual chave**.

**O que está em jogo — o problema concreto.** A Ana Beatriz **não é exclusiva deste escritório**. A Malu acompanha apenas ~24 dos processos dela. Se vigiarmos o nome da Ana Beatriz no diário oficial, chegam publicações de processos de **outros escritórios**, que não são nossa responsabilidade e cujo conteúdo não deveríamos nem guardar.

**As três formas de filtrar, e por que duas são ruins:**

| Onde filtrar | Como funciona | Problema |
|---|---|---|
| **Na origem** (pedir ao Escavador que só mande o que interessa) | Restringir os termos do monitoramento | Publicação legítima que não casar com o filtro **nunca chega**, e ninguém descobre |
| **Pela lista de envolvidos** ("o advogado do escritório está nesta publicação?") | Olhar o campo `envolvidos` de cada publicação | ❌ **Medido e reprovado:** a Malu aparece nesse campo em apenas **28 de 34** publicações do próprio monitoramento dela. Filtrar assim descartaria **18% das publicações legítimas, em silêncio** |
| **Pelo CNJ, no receptor** ✅ | Comparar o número do processo contra a lista dos que o escritório acompanha | O CNJ veio em **34 de 34** publicações, sempre estruturado |

> **CNJ** é o número padronizado do processo judicial, aquele formato longo `0000000-00.0000.0.00.0000`. É a identidade estável de um processo em qualquer tribunal do país. **Receptor** é o nosso programa que recebe os avisos do Escavador.

**O que a decisão determina.** Uma triagem com **três saídas**, e a terceira é a que importa:

| Resultado da comparação | O que acontece |
|---|---|
| Processo **acompanhado** pelo escritório | Caminho completo — vira alerta de prazo |
| Processo **não acompanhado** | Registro mínimo permanente, **sem conteúdo** — guarda-se que chegou, não o que dizia |
| Processo **desconhecido** | **Fila humana. Nunca descarte.** |

A terceira saída existe porque cadastro incompleto é normal, e "não achei na lista" não pode significar "não é nosso".

**O que isso economiza.** Vigiar pelo nome no diário (a chamada **V1**) custa **R$ 3,00/mês por advogada**. Vigiar processo por processo (a **V2**) custaria **R$ 55,20 a R$ 72,00/mês** para os 24 processos da Ana Beatriz — e ainda cobriria **menos**, porque só vê processo já cadastrado.

**Se você disser NÃO.** Ou se filtra na origem e se perde publicação em silêncio, ou se paga 20× mais por uma cobertura menor.

**Recomendação: adotar.** É o desenho de E2, e é o que faz o V1 barato valer.

🚧 **Depende de um insumo que ainda não temos:** a lista dos ~24 processos da Ana Beatriz que o escritório acompanha. É o pedido mais bloqueante do passo **P-03** — sem ela, a triagem não tem contra o que comparar.

✅ **DECIDIDO em 08/09 — adotar, e pedir a lista dos ~24 à Malu com prioridade.** A D-206 está **✅ Confirmada** na §13.
🆕 **E a sua pergunta achou um buraco real.** Você perguntou como processos e advogados **futuros** entram nessa triagem — e a D-206 não respondia. Viraram a **D-220** (ficha **A-17**) e a **D-221** (ficha **A-18**), na §3.1.

---

### A-5 · D-209 🔴 — a janela de reabertura expira **reabrindo** o alerta

**Em uma frase.** Quando uma colaboradora encerra um alerta de prazo, esse encerramento é **provisório**: se nenhuma advogada confirmar em 4 horas úteis, o alerta **volta a ficar aberto**.

**O que está em jogo.** A D-194 permitiu que a colaboradora encerrasse alerta de prazo — o que exige uma compensação, porque prazo perdido é o pior dano que este projeto pode causar. A compensação é uma janela em que a advogada pode reabrir. A pergunta que sobrou: **e quando a janela vence sem ninguém tocar?**

**As duas respostas possíveis, e o que cada uma significa:**

| Se a janela expira… | Significado prático | Consequência |
|---|---|---|
| **fechando** (o cômodo) | O **silêncio** da advogada ratifica o encerramento | Alerta de prazo passa a se encerrar sozinho por decurso de tempo — o que contraria a linha **"Nunca"** do próprio rito do produto |
| **reabrindo** (o seguro) ✅ | O silêncio volta a **não significar nada** | O alerta nunca fecha sem toque humano de advogada |

**O escritório escolheu reabrir**, em 07/09. Isso **derrubou o R-68**, que era o risco registrado de "silêncio vira ratificação".

**O problema novo que a escolha certa criou, e como a decisão resolve.** Se reabrir significasse *reenviar o aviso*, uma advogada em audiência o dia inteiro veria o mesmo alerta pipocar de 4 em 4 horas — e alerta que repete é alerta que se ignora (o risco **R-76**). A D-209 separa duas coisas que pareciam uma:

- **Reabrir = mudar o ESTADO** do alerta (volta a contar como aberto, sai da lista de resolvidos, vira *pendente de advogada*).
- **Avisar = mandar mensagem.** Não acontece de novo.

O alerta pendente aparece **uma vez por dia** no resumo de fim de dia útil, não de 4 em 4 horas. O ciclo só termina por toque humano de advogada: confirmar o encerramento, ou assumir o alerta.

**Se você disser NÃO.** O R-68 renasce, e a promessa do produto de que *silêncio nunca é interpretado como "nada aconteceu"* volta a ter exceção.

**Recomendação: adotar.** O escritório já escolheu o lado seguro; o que falta é o de acordo da Malu sobre a **regra do segundo ciclo** — o que acontece quando reabre e continua ninguém tocando.

🚧 **Inerte até a pergunta 20c fechar.** "4 horas úteis" precisa de um relógio que diga o que é hora útil — e falta a lista de feriados. É a pergunta que está com a Malu.

⚠️ **O resíduo que software não resolve:** alerta pendente sobrevive enquanto ninguém ler o resumo. Isso é compromisso de operação, não de código.

✅ **DECIDIDO em 08/09 — adotar, e a Malu deu o de acordo sobre a regra do segundo ciclo.** A D-209 está **✅ Confirmada** na §13.
🆕 **A sua segunda pergunta achou a outra metade que faltava:** *como a advogada confirma, na prática?* O primeiro ciclo estava desenhado; o segundo não estava. Virou a **D-222**, ficha **A-19** da §3.1.

---

### A-6 · D-211 🔴 — matéria sensível encurta o automatismo, nunca o acesso

**Em uma frase.** Processos de família, criminal, menores e segredo de justiça não restringem **quem vê** — restringem **o que a plataforma faz sozinha, sem humano no meio**.

**O que está em jogo.** O escritório respondeu duas coisas que parecem contraditórias e não são:
- Pergunta 3: *"sem divisão por área, sem segmentação de acesso"* — ninguém perde visão de nada.
- Pergunta 40: matéria sensível é família, criminal, menores e todo processo em segredo.

A conciliação é que **acesso e automatismo são eixos diferentes**. A pessoa continua podendo abrir o processo; o que encolhe é o que o robô faz sem que ninguém peça.

**O que a decisão determina — cinco efeitos concretos:**

| # | Efeito | Custa |
|---|---|---|
| **1** | **O alerta mostra QUE há prazo, sem o teor.** A referência do processo basta para agir; o texto da intimação não precisa aparecer no Telegram | Barato — entra junto com E2 |
| 2 | **Nada de resumo automático ao cliente** em matéria sensível — cai sempre em aprovação humana | E4, fase seguinte |
| 3 | **Anonimização antes de qualquer saída externa** deixa de ser opcional e vira condição de envio | Devolve peso à A-12 (HMAC) |
| 4 | **Acesso a esses processos entra no relatório de acesso amplo**, que hoje só cobre acesso fora da carteira | Fase seguinte |
| 5 | **Conteúdo de processo sensível não vai a provedor de modelo de IA sem decisão expressa** — e a decisão ainda não existe | Depende das perguntas 38 e 39 |

**Se você disser NÃO.** O teor de uma intimação de processo de família aparece por extenso no Telegram — que é um aplicativo de mensagem, num celular que pode estar sendo projetado numa reunião —, e resumo automático ao cliente passa a valer para qualquer matéria.

**Recomendação: adotar o desenho inteiro, implementar só o item 1 agora.** Ele é barato e entra junto com E2; os outros quatro estão fora do recorte de 15/09.

⚠️ **O ponto fraco, e é honesto declará-lo:** tudo isso depende de **classificar o processo**, e classificação errada **falha em silêncio** — um processo de família cadastrado como cível não dá erro nenhum, apenas recebe o tratamento comum e o teor sai. Por isso o padrão é: **classificação ausente ou desconhecida é tratada como sensível** (risco R-73).

**Sua decisão:**
- [ ] Adotar o desenho, implementar o item 1 com E2
- [ ] Adotar o desenho inteiro já (sai do recorte de 15/09)
- [ ] Não adotar

---

### A-14 · D-217 🔴 — a advogada é avisada por exceção, e prestada contas por resumo

**Em uma frase.** Aprovação de mensagem ao cliente **não gera notificação** para a Malu; vai para o resumo de fim de dia. O Telegram em tempo real fica reservado ao que tem relógio correndo.

**O que está em jogo.** Esta decisão nasceu de uma pergunta sua, em 08/09: *avisar a advogada a cada aprovação não vira entulho a ponto de ela ignorar tudo, inclusive prazo?* A resposta é **sim**, e o raciocínio vale escrito.

**Primeiro, um esclarecimento de fato.** O *"avisar a cada geração"* que consta da D-171 é uma mensagem impressa no terminal pelo script que monta o fluxo — dirigida a **quem roda o script**, ou seja, você. **Nunca chegou ao Telegram de ninguém.** A preocupação estava certa, mas não incidia sobre um mecanismo existente.

**Segundo, a conta de volume.** O que decide isto não é opinião, é aritmética:

| Fluxo de aviso | Volume medido / estimado | Cabe em tempo real? |
|---|---|---|
| Alerta de indício de prazo | ~5 a 6 por dia útil (medido em 30 entregas) | ✅ Sim |
| Encerramento de alerta por colaboradora | Limitado pelo anterior — no máximo ~5/dia | ✅ Sim |
| **Aprovação de mensagem ao cliente** | **Dezenas por dia** — é o trabalho de duas atendentes | ❌ **Não** |

**O que a decisão determina — três faixas, separadas por urgência e não por assunto:**

| Faixa | O que entra | Frequência |
|---|---|---|
| **1. Tempo real no Telegram** | Só o que tem relógio: alerta de prazo e encerramento de alerta por colaboradora | ~5/dia útil |
| **2. Aviso imediato por exceção** | Aprovação que toca uma regra: processo em segredo ou matéria sensível, texto contendo data/valor/palavra de prazo, primeiro contato com cliente novo, aprovação fora do horário útil | Raro |
| **3. Resumo de fim de dia útil** | Toda a rotina — quantas mensagens saíram, quem aprovou, para quais clientes, com **link** e nunca o teor no corpo | 1 mensagem/dia |

**O fundamento — e é a parte que vale mais que o mecanismo.** A proteção aqui **não é a notificação, é a trilha**. Toda aprovação já é registrada de forma nominal e **imutável** (o registro não pode ser alterado nem apagado, nem por quem administra o banco). Então a pergunta *"quem aprovou o quê"* tem resposta sem que ninguém leia nada em tempo real.

> **Notificação compra prevenção. Trilha compra responsabilização.**

Com sete pessoas numa sala e supervisão presencial contínua — a descrição do próprio escritório —, responsabilização é a compra certa. Prevenção aqui significaria uma advogada lendo dezenas de mensagens por dia, coisa que ela nunca ia fazer.

**Se você disser NÃO (avisar a cada aprovação).** Duas atendentes × dezenas de mensagens/dia, no mesmo canal onde mora o alerta de prazo. **Canal de urgência é recurso escasso: cada aviso de rotina que entra nele desvaloriza o alerta que está do lado.** A advogada para de ler o canal, e o que se perde junto é justamente o alerta que aparece uma vez só.

**Recomendação: adotar.** E a faixa 1 não recebe nada além do que está listado — acrescentar exige decisão nova.

⚠️ **O resíduo está no risco R-77:** a supervisão passa a depender de alguém abrir o resumo. Se a Malu não abrir por uma semana, nada quebra e nada avisa. A mitigação proposta é o resumo registrar **se foi aberto**, e a falta de leitura por alguns dias úteis virar ela própria um item do resumo seguinte — o único ponto do desenho em que o silêncio é medido em vez de suposto.

**Sua decisão:**
- [ ] Adotar as três faixas como estão
- [ ] Adotar, mas quero ajustar o que fura o resumo (faixa 2)
- [ ] Não adotar — quero aviso a cada aprovação

---

### A-7 · D-149 🟠 — os tetos de gasto ganham número, e o número vai ao escritório

**Em uma frase.** O sistema tem um **disjuntor de custo** (mecanismo que corta o gasto ao atingir um limite), e ele precisa de números concretos — que só valem com o de acordo do escritório.

**O que está em jogo.** A **Regra Inegociável 6** diz que custo é requisito funcional, não consequência. Mas "vamos controlar o gasto" sem número não é controle, é intenção. E número escolhido por nós sem o aval de quem paga é o mesmo erro pelo outro lado.

**O problema concreto que os tetos protegem.** Algumas rotas do Escavador cobram **por bloco de até 200 resultados**, e **ninguém sabe quantos resultados vêm antes de perguntar**. A pergunta mais natural que existe — *"quais são os processos deste cliente?"* — custa R$ 3,00 para uma pessoa com dois processos e **R$ 15,00 ou mais** para uma empresa que litiga muito. Mesma pergunta, mesmo jeito, cinco vezes o preço.

**Os números propostos hoje** (PRD §9.5) — três tetos encadeados, e **o mais restritivo vence**:

| Nível | O que impede | Teto proposto |
|---|---|---|
| **Por sessão/conversa** | Um agente em laço torrar o saldo numa tarde | **R$ 9,00** (três chamadas caras) |
| **Por pessoa/mês** | Distribui responsabilidade e revela uso atípico | **R$ 60,00** advogada · **R$ 30,00** colaboradora |
| **Global do escritório/mês** | Último anteparo | **R$ 300,00** |

**O que acontece quando um teto é atingido** — e esta parte responde à pergunta "o sistema para de funcionar?":

1. **Para de gastar.** Nenhuma chamada paga nova sai. É a parte que impede o prejuízo.
2. **Continua respondendo**, com o que já está guardado, **dizendo a idade do dado** ("última movimentação registrada em 03/09").
3. **A chamada que estourou vira um pedido de aprovação**, com o custo escrito nele. Aprovar libera **aquela chamada**, não levanta o teto do mês.

**Se você disser NÃO.** O disjuntor fica sem número em que disparar — e a Regra 6 vira texto sem mecanismo.

**Recomendação: adotar e submeter à Malu junto com o passo P-03.**

⚠️ **Falta um eixo inteiro:** o **teto de gasto mensal com IA** (pergunta 71) foi adiado por você e continua sem nem proposta. É o único eixo de custo do projeto sem número, e ele cresce com o uso.

**Sua decisão:**
- [ ] Adotar os números propostos e levar à Malu
- [ ] Adotar com outros números (diga quais)
- [ ] Quero fechar o teto de IA (pergunta 71) antes de submeter o conjunto

---

### A-8 · D-201 🟠 — o banco da plataforma não divide instância com o n8n

**Em uma frase.** O banco de dados onde vão morar a governança, a auditoria e a vigilância **não pode ser o mesmo servidor de banco que o n8n usa hoje** — porque o n8n se conecta a ele como superusuário.

**O que está em jogo, em linguagem direta.** Foi medido em 05/09: o **n8n** (a ferramenta de automação onde os fluxos rodam) conecta ao **PostgreSQL** (o banco de dados) com o usuário `postgres` — que é o **superusuário da instância**, a conta que pode tudo, em todos os bancos daquele servidor. E essa credencial vive numa **variável de ambiente** (configuração entregue ao programa quando ele inicia, e legível por quem administra o servidor) visível no **Portainer**, o painel de administração dos contêineres — que **está exposto na internet** (risco R-62).

**Por que isso destrói duas proteções que custaram três marcos para construir:**

| Proteção | O que ela faz | Como seria contornada |
|---|---|---|
| **Política por linha** (migração 010) | A conexão declara em que escritório trabalha, e o banco devolve **só aquilo** — consulta que esquece o filtro deixa de vazar | Política por linha **não se aplica ao dono da tabela**. Quem entra como superusuário vê tudo |
| **Auditoria imutável** (marco 3) | O registro de quem fez o quê **não pode ser alterado nem apagado** | Superusuário pode remover a trava e apagar o histórico |

> **A frase que resume:** barreira que se contorna pela porta dos fundos não é barreira. Não é preciso quebrar nada do nosso código — basta abrir o banco com a credencial do n8n.

**O que a decisão determina.** A plataforma ganha **instância própria** de banco, ou no mínimo **papel próprio sem superusuário e banco próprio**, com credencial que nenhum fluxo de terceiro conhece.

**Se você disser NÃO.** As duas camadas de proteção do banco continuam existindo no papel e sendo contornáveis na prática — o que é pior que não tê-las, porque produz confiança falsa.

**Recomendação: adotar, como pré-requisito do marco de implantação.** Ou seja: não é item de melhoria, é portão — o dado real não entra antes disso.

**Custa infraestrutura** (uma instância a mais, ou trabalho de separação). É por isso que está aqui e não no bloco.

**Sua decisão:**
- [ ] Adotar — instância própria
- [ ] Adotar a versão mínima — papel e banco próprios, sem superusuário, na mesma instância
- [ ] Não adotar

---

### A-9 · D-198 🟠 — o OpenRouter como provedor único de modelos

**Em uma frase.** Passar a acessar todos os modelos de IA por um intermediário só — o que simplifica muito a operação e coloca **mais um terceiro vendo o conteúdo dos prompts**.

**O que está em jogo.** Hoje existem contas de OpenAI e Gemini separadas. O **OpenRouter** é um serviço que dá acesso a modelos de vários fornecedores — inclusive o Claude — através de **uma credencial só**.

**O ganho, e ele é real.** Não é o catálogo: é que **trocar de modelo deixa de ser trocar de credencial**. Com a escolha do modelo virando um parâmetro de configuração, o custo por tarefa vira ajuste em vez de reimplantação — se um modelo mais barato der conta de uma tarefa, a troca é uma linha. Isso casa direto com a Regra 6.

⚠️ **O preço, e ele não é técnico.** Um intermediário a mais no caminho de toda chamada de IA significa que **prompt com dado de processo passa a transitar por um terceiro**. Isso tem três consequências que precisam estar escritas:

1. O OpenRouter entra no **rol de operadores de dados a declarar** (requisito RNF-19) — sob a LGPD, quem trata dado pessoal em nome do escritório precisa constar.
2. Entra no risco **R-74**, que é a decisão sobre **dados saírem do país** — decisão que está sendo tomada **por omissão** hoje, e o escritório ainda não respondeu a pergunta 39.
3. Uma dependência nova no caminho de **toda** chamada de IA — se o OpenRouter cair, cai tudo, em vez de cair um provedor.

**Se você disser NÃO.** Continuam OpenAI e Gemini separados, cada troca de modelo mexendo em credencial e implantação — e o custo por tarefa fica mais difícil de ajustar.

**Recomendação: adotar**, e registrar o OpenRouter entre os operadores **antes do primeiro dado real**, não depois. Declarar operador depois de o dado já ter passado é regularizar, não cumprir.

**Sua decisão:**
- [ ] Adotar, com o registro do operador feito antes do primeiro dado real
- [ ] Adotar, mas só depois que a pergunta 39 (dados fora do país) for respondida
- [ ] Não adotar

---

### A-10 · D-148 🟠 — a plataforma roda na infraestrutura do prestador

**Em uma frase.** O n8n, o banco e os servidores da plataforma ficam **com você**, não com o escritório — e isso muda o seu papel jurídico.

**O que está em jogo.** Tecnicamente a decisão já está tomada de fato: é o que destrava a implementação inteira e resolve a dependência de **callback** (o Escavador precisa de um endereço estável para entregar os avisos, e ele precisa estar de pé).

⚠️ **O que muda, e não mudava no desenho anterior.** Sob a LGPD, quando dados pessoais de terceiros — que aqui são **partes em processo judicial**, sob sigilo profissional — moram na sua infraestrutura:

| Papel | Quem é | O que significa |
|---|---|---|
| **Controlador** | O escritório | Decide para que os dados são usados |
| **Operador** | **Você** | Trata os dados em nome do controlador, e responde por isso |

**O contrato precisa dizer isso**, e prever três coisas que hoje não estão escritas: **devolução** dos dados, **expurgo** (apagar o que ficou) e **continuidade** ao término da relação. É o risco **R-48** e o passo **P-05**.

> ⚠️ **Um agravante já registrado:** a encarregada de dados do escritório é a Malu, com você no que toca ao sistema. Ou seja, quem auditaria o operador é, em parte, o próprio operador. Não é irregular, mas precisa estar consciente e escrito.

**Se você disser NÃO.** A implementação para até o escritório prover servidor próprio — e a entrega de 15/09 deixa de existir.

**Recomendação: adotar, com a cláusula escrita antes do primeiro dado real.** A decisão técnica já está tomada; o que falta é o papel — e papel escrito depois do incidente não vale.

**Sua decisão:**
- [ ] Adotar, e escrever a cláusula antes do primeiro dado real
- [ ] Adotar, e escrever a cláusula depois de 15/09 (ciente do risco)
- [ ] Não adotar — a infraestrutura passa ao escritório

---

### A-11 · D-192 🟠 — o colaborador enxerga a base inteira

**Em uma frase.** Colaboradoras passam a ver todos os processos do escritório, igual às advogadas — o que muda é só a **leitura**, não o que cada uma pode **fazer**.

**O que está em jogo.** O escritório respondeu em 05/09: *"eles fazem movimentação em nome dos advogados e com o acesso e credenciais dos advogados, sob observação dos advogados"*. Isso derruba o padrão restritivo provisório que o projeto vinha adotando.

**A distinção que sustenta a decisão** — e é a parte que precisa ficar clara:

| Eixo | O que é | O que a D-192 faz |
|---|---|---|
| **Alcance** | Até onde a pessoa **vê** | Passa a ser o escritório inteiro, para os dois papéis |
| **Permissão** | O que a pessoa pode **fazer** | **Não muda.** Continua vindo do papel |

Dar a todos a mesma visão **não autoriza a todos os mesmos atos**, e não dispensa saber quem fez o quê.

**O que NÃO se negocia junto.** A **identidade individual** continua obrigatória (Regra Inegociável 7): cada pessoa com perfil próprio, para que toda ação seja registrada e auditável. Foi o próprio usuário que registrou isso ao responder a pergunta 4a.

**Se você disser NÃO.** Contraria uma resposta que o escritório já deu — e descreve mal a operação real deles.

**Recomendação: adotar**, e atualizar a matriz de privilégios da Spec Parte II.

**Por que está no grupo A e não no bloco:** é a decisão que **mais amplia superfície** nesta lista — sete pessoas passam a alcançar toda a base. Ampliação de acesso merece ser dita, não herdada.

**Sua decisão:**
- [ ] Adotar
- [ ] Adotar, mas com o relatório de acesso amplo (RF-37) ligado desde o início
- [ ] Não adotar

---

### A-12 · D-215 🟠 — o HMAC no anonimizador, adiado *(era D-159 até a renumeração de 08/09)*

**Em uma frase.** O jeito como o projeto esconde os nomes reais nos dados de demonstração tem uma fraqueza conhecida, e o conserto está adiado por decisão sua de 01/09.

**O que está em jogo, explicado do zero.**

> Um **hash** é uma função que transforma um texto num código de tamanho fixo, sem volta — de "Maria Silva" sai algo como `a3f9c2...`. Serve para substituir o nome real por um pseudônimo estável.
>
> O problema: o hash é **público e sem senha**. Quem tiver a lista de partes dos autos pode calcular o hash de cada nome candidato e comparar com o pseudônimo até acertar. Chama-se ataque de dicionário, e não exige nenhuma sofisticação.
>
> Um **HMAC** é o mesmo hash **com uma senha secreta misturada**. Sem a senha, testar candidatos não funciona. É o conserto.

**Por que foi adiado, e o motivo é bom.** Trocar o hash muda **todos** os pseudônimos de uma vez — e com eles o instantâneo de dados, os dois fluxos de demonstração e o arquivo `demo/listas/clientes.json`. A demo passaria a mostrar nomes diferentes dos já apresentados ao escritório. Era o único item da revisão externa com efeito visível na apresentação.

⚠️ **O motivo do adiamento expirou.** A apresentação foi em **02/09**. E a **D-211** (A-6 deste digesto) encareceu o item: anonimização antes de qualquer saída externa deixou de ser opcional e virou **condição de envio**.

**Se você disser NÃO (retomar agora).** Custa refazer o instantâneo e os fluxos da demo — trabalho, não risco.

**Recomendação: retomar, mas fora da janela de 15/09.** É o passo **P-24**, e nenhuma demo precisa sobreviver à produção — os dados de demonstração não vão para o ar.

✅ Esta era uma das três decisões envolvidas na colisão de numeração, resolvida em 08/09 (§5.1).

**Sua decisão:**
- [ ] Retomar depois de 15/09, como P-24
- [ ] Retomar antes de 15/09
- [ ] Manter adiado sem data

---

### A-13 · D-196 🟠 — a chave do Trello nasce em conta dedicada

**Em uma frase.** A chave que permite ao sistema escrever no Trello precisa sair de uma **conta criada só para a automação** — não da conta pessoal da Malu.

**O que está em jogo.** Foi respondido em 05/09 que "conta de serviço" não existe como recurso no Trello. O que existe é uma **conta de pessoa comum criada para uso exclusivo da automação**, com e-mail próprio do escritório, convidada para os quadros.

> Uma **chave de API** é a credencial que identifica quem está chamando um serviço de fora. No Trello ela herda tudo o que a pessoa dona da conta alcança.

**Os três motivos, e o primeiro é o do projeto inteiro:**

| # | Se a chave for da Malu | Consequência |
|---|---|---|
| **1** | Toda ação da plataforma aparece no quadro **como feita por ela** | A auditoria que sustenta o projeto **vira ficção dentro do Trello** — o histórico do quadro diz que a Malu moveu um card que ninguém moveu |
| **2** | A chave alcança tudo o que ela alcança | Inclusive **quadros pessoais dela**, fora do escritório |
| **3** | Troca de senha, revogação de token ou desligamento param a plataforma | E ninguém liga uma coisa à outra na hora |

**Por que é irreversível.** Depois de a chave ser gerada e usada, o histórico já escrito no quadro com o nome errado **não se reescreve**. Trocar a chave depois conserta o futuro, nunca o passado.

**Se você disser NÃO.** A auditoria dentro do Trello passa a atribuir à Malu atos que ela não praticou — e o projeto perde justamente a propriedade que o justifica.

**Recomendação: adotar, e antes de a chave existir.** Custa um e-mail e uma licença.

E3 (a frente do Trello) saiu do recorte de 15/09, mas a chave "chega quando chegar" — e a ordem certa precisa estar decidida **antes** disso, não depois.

**Sua decisão:**
- [ ] Adotar — conta dedicada antes de gerar a chave
- [ ] Não adotar — usar a conta da Malu

---

### A-15 · D-218 🟠 — o catálogo de gabaritos é o que resolve o volume

**Em uma frase.** A maior parte das mensagens ao cliente **não deveria passar por aprovação nenhuma** — e o mecanismo que faz isso existe no desenho, mas nunca foi construído.

**O que está em jogo.** A D-142 criou a faixa **A3a**: comunicação externa por **gabarito** (modelo de texto aprovado uma vez por advogada) **sai automática e registrada**, sem aprovação mensagem a mensagem.

Mas a D-156 recusa a faixa A3a enquanto o catálogo de gabaritos não existir — o que é correto (uma faixa que dispensa aprovação apoiada num catálogo inexistente seria uma faixa que libera sem garantia nenhuma). O efeito colateral é que **hoje tudo cai em A3b**, inclusive o parágrafo que se repete quarenta vezes por semana.

**O que muda com o catálogo de pé:**

| Mensagem | Hoje | Com catálogo |
|---|---|---|
| "Recebemos seu documento" | Fila de aprovação | Sai sozinha, registrada |
| "A audiência ficou marcada para 12/11" | Fila de aprovação | Sai sozinha, registrada |
| "O processo está na fase X" | Fila de aprovação | Sai sozinha, registrada |
| "Sobre a situação que você descreveu ontem…" | Fila de aprovação | **Continua na fila** — é onde mora o risco |

**Por que isso importa para as decisões A-1 e A-14.** Enquanto tudo for A3b, toda a discussão de *quem aprova* e *quem é avisado* incide sobre um volume que **não deveria estar na fila**. Nas palavras da própria D-142: *aprovar mil vezes o mesmo parágrafo não é controle, é ritual*.

**Como o catálogo cresce, sem virar autonomia por confiança.** A D-151 já respondeu: um caso com **20 aprovações consecutivas sem edição e nenhuma rejeição** na janela vira candidato a gabarito, aprovado uma vez por advogada. A autonomia sobe **por evidência medida**, não porque alguém decidiu confiar.

**Se você disser NÃO.** O volume continua na fila, e A-1 e A-14 ficam resolvendo um problema maior do que precisava ser.

**Recomendação: adotar, para a fase seguinte.** Está fora do recorte de 15/09 (é E4), mas é o que torna a **D-216** confortável em vez de apenas aceitável.

**Sua decisão:**
- [ ] Adotar para a fase seguinte
- [ ] Adotar e tentar encaixar em 15/09
- [ ] Não adotar

---

## 3.1 Nasceram dos seus avais de 08/09 — quatro decisões novas

Três delas existem porque as suas perguntas encontraram buracos reais no desenho. A quarta é a consequência direta de você ter recusado o recorte.

### A-16 · D-219 🔴 — a data se move, e a proposta são duas datas em vez de uma

**Em uma frase.** Você recusou o recorte; a alternativa é mover a data — e mover data sem número não se negocia, então aqui está o número.

**O que está em jogo.** A Malu deu o de acordo dela em **05/09** sobre 15/09 (D-195, ✅ Confirmada). Mudar isso é **conversa com ela**, não aviso. E há um agravante de contexto: o **R-75** — hoje **ninguém está vigiando prazo no escritório**. O Astrea que parecia ser a rede de segurança foi contratado "para experimentar" e não está em uso. Cada semana que E2 não entra é uma semana em que a rede não existe.

**A proposta: faseamento, não adiamento.** A diferença importa — **nada sai do escopo**, só se ordena o que chega primeiro:

| Data | O que entra | Por que esta ordem |
|---|---|---|
| **15/09** | **E2 inteira em produção** — vigilância de prazo, triagem, alerta com nome e rito | É a frente que **protege prazo**, e a mais adiantada: o callback já entrega publicação real desde 27/08. Falta ligar o que chega a um alerta |
| **30/09** | **E1 completa** — fundação, consulta processual, mais os três itens que o recorte tirava: cache (RF-06), painel de custo (RF-08), relatório de acesso amplo (RF-37) | É o que não cabia. **17 dias úteis** a partir de 08/09, contra os 6 que sobravam |

**A conta, e ela é apertada — vale dizer em voz alta.** Os três marcos entregues levaram cerca de **5 dias úteis**. Faltam **sete**, mais a integração e os dois requisitos que o recorte tirava. 17 dias úteis dá folga, não conforto.

**Por que faseamento e não simplesmente 30/09 para tudo.** Uma data que se move e **não entrega nada no caminho** gasta a confiança que o projeto acumulou. Uma data que se move **entregando na data original a metade que protege prazo** gasta muito menos — e entrega justamente o que o R-75 tornou urgente. Há ainda um motivo de calendário: a renovação da vigilância cai em **26/09**, dentro da janela, o que põe a decisão de custo na frente de quem decide enquanto o trabalho corre.

⚠️ **O que NÃO volta ao escopo.** E3 (Trello) e E4 (WhatsApp) continuam fora, por força da **D-195**, que está confirmada e teve o de acordo da Malu. "Fazer tudo" aqui significa **E1 e E2 inteiras** — se você quis dizer as quatro frentes, isto muda de figura e precisamos conversar antes de levar à Malu.

**Recomendação: levar as duas datas à Malu junto com o P-01.** Se ela recusar o faseamento e exigir 15/09 cheio, a conversa volta para o recorte da D-207 — e aí ele é a única saída que não passa por entregar sem verificar.

**Sua decisão:**
- [ ] Levar o faseamento 15/09 (E2) + 30/09 (E1) à Malu
- [ ] Levar só uma data — 30/09 para tudo
- [ ] Outra data (diga qual)
- [ ] ⚠️ Eu quis dizer E1 a E4, não só E1+E2 — vamos conversar antes

---

### A-17 · D-220 🟠 — como um processo novo entra na lista da triagem

> Resposta à sua pergunta em A-4. **O buraco era real:** a D-206 desenhou a triagem e a RF-47 disse como um processo entra em *não acompanhado* — ninguém tinha escrito como ele entra em **acompanhado**. Sem isso a triagem funciona no dia da carga inicial e envelhece a partir do dia seguinte.

**Em uma frase.** Três portas, e a principal é a própria fila de triagem — o cadastro acontece sozinho, no momento em que importa.

**As três portas, em ordem de uso real:**

| # | Porta | Quando é usada | Quem faz |
|---|---|---|---|
| **1** | **Carga inicial**, em lote | Uma vez só — os ~289 da Malu e os ~24 da Ana Beatriz | Operação, junto com o P-03 |
| **2** | **A fila humana da triagem** ⭐ | **O tempo todo, daqui para a frente** | Quem estiver de plantão, pelo Telegram |
| **3** | **Cadastro direto pelo bot** | No intervalo entre o processo ser distribuído e aparecer no diário pela primeira vez | Colaboradora ou advogada |

**A porta 2 é a resposta, e vale explicar por quê.** Lembre que a triagem tem três saídas, e a terceira é *desconhecido → fila humana, nunca descarte*. Essa fila **já é o cadastro**:

> Chega publicação de um CNJ que ninguém conhece → vai para a fila → a pessoa responde uma pergunta só: **"este processo é acompanhado pelo escritório?"**
> **Sim** → o processo é criado na base como acompanhado, nominal e datado, e a publicação segue o caminho completo, virando alerta.
> **Não** → registro mínimo permanente, sem conteúdo (é a RF-47: ato nominal, datado e reversível).

**O ganho é que ninguém precisa lembrar de nada.** Processo novo do escritório aparece no diário em dias ou semanas — e é exatamente aí que ele entra na base, com a informação na frente de quem decide. Cadastro que depende de alguém lembrar é cadastro que envelhece.

**O limite honesto, e é o que justifica a porta 3.** Entre a distribuição do processo e a primeira publicação, ele **não está na base**. Se nesse intervalo alguém quiser consultá-lo pelo bot, não acha. A porta 3 cobre isso: manda o CNJ ao bot, e ele entra.

⚠️ **A porta 3 NÃO consulta a capa do processo.** Consultar custaria crédito para confirmar um número que a pessoa acabou de digitar. O CNJ sozinho basta para a triagem funcionar, e o processo se enriquece na primeira publicação que chegar.

⚠️ **E não conte com painel web.** A D-16 prevê um, mas ele **não é nenhum dos dez marcos** da Spec — não existe em E1+E2 nem no escopo cheio. Cadastro que dependa dele não tem porta nenhuma até a fase seguinte. Por isso as três portas acima são todas Telegram ou lote.

**Recomendação: adotar.** A porta 2 sai junto com a triagem (é E2, requisito RF-45); a porta 3 cabe no bot de E1; a porta 1 é operação, não código.

**Sua decisão:**
- [ ] Adotar as três portas
- [ ] Adotar, mas quero que a porta 3 consulte a capa mesmo custando crédito
- [ ] Outra coisa

---

### A-18 · D-221 🟠 — como se cadastra um advogado novo para ser vigiado

> Resposta à segunda metade da sua pergunta em A-4. **Você acertou o mecanismo:** sim, cadastra-se um monitoramento novo no Escavador. O que faltava era dizer que o cadastro tem **duas metades**, e que confundi-las é o que produz assinatura esquecida pagando sozinha.

**Em uma frase.** Uma metade é grátis e reversível; a outra custa R$ 3,00/mês para sempre e tem um campo que não se conserta depois.

| Metade | Onde | Custa | Reversível? |
|---|---|---|---|
| **1 — A pessoa** | Na nossa base: nome, OAB, e se é exclusiva do escritório ou compartilhada | **R$ 0,00** | Sim |
| **2 — O monitoramento** | No Escavador: V1, tipo `termo`, o nome da pessoa, jurisdição restrita aos diários do Amapá | **R$ 3,00/mês, recorrente** | Remover antes da renovação para de cobrar no ciclo seguinte |

⚠️ **A armadilha, e ela é cara.** A **franquia de aparições** (o teto mensal de publicações que a assinatura cobre) é definida **na criação** e **não pode ser alterada depois** — a rota de edição do Escavador simplesmente não aceita esse campo. Errar obriga a **criar tudo de novo, pagando de novo**. Por isso o cadastro de advogado novo tem um passo humano obrigatório: **decidir a franquia com a Malu antes de criar**, nunca por padrão do sistema.

🔑 **E aqui está o campo que faltava no desenho, e que a sua pergunta revelou.** O advogado é marcado como **exclusivo** ou **compartilhado**, e isso **muda o padrão da fila — nunca a decisão**:

| Advogada | Marcação | O que "CNJ desconhecido" provavelmente significa | O que a fila sugere |
|---|---|---|---|
| Malu | **Exclusiva** | Processo nosso que ainda não cadastramos | *Acompanhar* |
| Ana Beatriz | **Compartilhada** | Processo de outro escritório | *Não acompanhar* |

**Nos dois casos quem decide é gente** — a RF-47 continua inteira, e nada entra em "não acompanhado" por inferência da automação. O que muda é qual botão vem primeiro e o que a fila diz. Sem esse campo, a fila da Ana Beatriz teria o padrão da Malu e produziria dezenas de decisões por mês **contra o padrão errado** — que é o jeito de a pessoa começar a clicar no automático.

**O custo de escala, para você ter presente.** Cada advogado compartilhado novo é R$ 3,00/mês, para sempre, até alguém remover. Cinco parcerias dessas são R$ 15,00/mês — barato, e **fácil de esquecer**. É o risco R-13. O antídoto já existe como requisito: a **conferência periódica do inventário de vigilâncias contra o quadro de advogados** (RF-36), que precisa ser ligada.

**Recomendação: adotar**, com o campo exclusivo/compartilhado e a RF-36 ligada.

**Sua decisão:**
- [ ] Adotar
- [ ] Adotar sem o campo exclusivo/compartilhado (a fila trata todos igual)
- [ ] Outra coisa

---

### A-19 · D-222 🔴 — como a advogada confirma, no primeiro e no segundo ciclo

> Resposta à sua pergunta em A-5. **Metade já estava desenhada; a outra metade não estava**, e você achou exatamente a metade que faltava.

**Em uma frase.** Botão, sempre — e no segundo ciclo são dois botões, com significados diferentes.

**Ciclo 1 — já estava definido.** O alerta chega no Telegram com um botão **"Ciente"** (PRD §5.2.1), e ele significa coisas diferentes conforme quem clica:

| Quem clica | O que acontece |
|---|---|
| **Colaboradora** | Registra a triagem e para o reenvio **para ela**. Desde a D-194, ela também pode **encerrar**, com motivo declarado |
| **Advogada** | Encerra a escalada |

⚠️ **E o PRD já responde uma parte da sua dúvida, com todas as letras:** *"Confirmar não é resolver. 'Ciente' significa **eu li**. O que fazer com o prazo é trabalho jurídico, e a plataforma não acompanha isso — ela só garante que ninguém pode dizer que não viu."* Isso é fronteira deliberada, não lacuna: a plataforma **sinaliza indício de prazo e nunca calcula prazo** (RF-11, D-64).

**Ciclo 2 — é o que esta decisão fecha.** Depois que o alerta reabre e aparece no resumo de fim de dia útil, **o resumo carrega os botões**. Cada alerta pendente vem com um par:

| Botão | O que a advogada está dizendo | O que acontece com o alerta |
|---|---|---|
| **✅ Confirmo o encerramento** | *"Olhei, concordo com a colaboradora. Não há prazo aqui, ou já foi tratado"* | **Fecha de verdade.** Sai da lista. Não reabre |
| **📌 Assumo este alerta** | *"Discordo, ou quero olhar melhor. Este é meu agora"* | Continua **aberto, com dona**. Sai de *pendente de advogada* e vira *em tratamento por X*. Para de escalar, porque já tem responsável nomeado |

**É isto que "toque humano" significa na prática:** um clique, num dos dois botões, dentro do resumo diário. Não é mandar mensagem para o bot, não é entrar em lugar nenhum.

**Por que botão e nunca mensagem de texto** — as três razões vêm de erros que este projeto já cometeu e pagou:

1. **D-167.** Sistema que oferece uma opção com um rótulo é obrigado a aceitar aquele rótulo de volta. Pedir para digitar cria o caminho em que a pessoa responde certo e o sistema não entende — e isso já aconteceu aqui, com um cliente respondendo três vezes a mesma pergunta.
2. **D-99.** O botão carrega consigo **de que ele trata**. Com três alertas pendentes, um *"confirmo"* digitado não diz **qual** — e adivinhar, sobre prazo, é o erro mais caro possível.
3. Digitar é um passo a mais, e o passo a mais é onde a pessoa desiste.

**Um terceiro estado que faltava nome.** O que acontece com um alerta **assumido**? Ele não pode ficar aberto em silêncio para sempre, senão "assumir" vira o jeito de fazer desaparecer. Proposta: alerta assumido **continua no resumo**, em seção própria, com **há quantos dias** — não escala, não reenvia, e não some. Quem assumiu fecha com o mesmo botão ✅.

**Teto prático.** No máximo **5 alertas com botão** no corpo do resumo. Acima disso, o resumo diz o número e mostra os cinco mais antigos — porque um resumo com trinta botões é ilegível, e porque, com vinte pendentes, a mensagem certa não é a lista: é que o rito está falhando.

**E se as duas advogadas clicarem ao mesmo tempo?** Já resolvido pela D-214 (aprovação vale uma vez): o primeiro clique vale, o segundo recebe *"já confirmado por X"*.

**Recomendação: adotar.**

**Sua decisão:**
- [ ] Adotar
- [ ] Adotar, mas quero um terceiro botão (diga qual)
- [ ] Outra coisa

---

## 4. Grupo B — de acordo em bloco

**159 decisões.** Todas registram coisa que o projeto já fez, que já está no código, nos documentos ou na medição, e que ninguém contestou. Confirmar é formalizar o que já existe.

Os blocos abaixo existem para que o seu "de acordo" seja **auditável**: você confirma por bloco, e cada bloco diz exatamente quais identificadores cobre e **o que ele significa em linguagem direta**.

| Bloco | O que este bloco decide, em uma frase | Decisões | Nº |
|---|---|---|---|
| **B1** | **A forma da plataforma.** n8n como orquestrador, integrações como servidores reutilizáveis, Telegram como canal interno, conteúdo confidencial nunca no corpo da mensagem, e a plataforma mantendo cadastro próprio de usuários em vez de depender de login de terceiro | D-03, D-04, D-05, D-08, D-10 a D-24, D-26 | 20 |
| **B2** | **O que o sistema pode pedir ao Escavador.** Cerca de 15 ferramentas curadas sobre 83 operações disponíveis, com perfis por papel; certificado digital fora de todos os perfis; teto obrigatório em tudo que percorre lista longa | D-27 a D-35 | 9 |
| **B3** | **O que o sistema pode fazer no Trello.** Isolamento por quadro conferido em código (a API do Trello não oferece isso), webhook com assinatura conferida, marcação obrigatória em toda escrita para não criar laço infinito, e só a alternativa reversível exposta — arquivar, nunca excluir | D-36 a D-46 | 11 |
| **B4** | **A disciplina de crédito.** Nenhuma chamada paga sem constar de orçamento aprovado; toda resposta salva bruta em arquivo e nunca reconsultada; preço conferido no painel depois da chamada; nenhuma ferramenta percorre páginas em laço automático | D-47, D-48, D-50 a D-60 | 13 |
| **B5** | **A forma do produto.** Quatro entregas nesta ordem, vigilância barata por nome no diário em vez de cara por processo, o agente do cliente lendo da base interna, e a plataforma **sinalizando** indício de prazo sem **nunca** calcular prazo | D-61 a D-64, D-66, D-67 | 6 |
| **B6** | **Como o sistema é construído.** Um repositório em TypeScript, PostgreSQL como única persistência, toda ferramenta devolvendo o mesmo formato de resposta, orçamento por reserva-antes/reconciliação-depois, e auditoria que **bloqueia a operação** se estiver indisponível | D-68 a D-78 | 11 |
| **B7** | **O parecer sobre o ClickUp.** Ele não substitui o Google Workspace, não vira caminho do agente em produção, e a aprovação humana vive na tarefa e não na mensagem | D-79 a D-84 | 6 |
| **B8** | **O custo real, medido em 26/08.** O catálogo é por rota e não tarifa plana; monitoramento cobra na criação e a cada renovação; a franquia de aparições é alarmada a 70% antes de cegar | D-103 a D-110 | 8 |
| **B9** | **Erros cometidos que viraram barreira de código.** Script novo que gasta crédito entra no disjuntor no mesmo commit; ferramenta de segredo recusa em vez de tentar; memória de "já foi feito" mora em arquivo e é conferida antes de criar custo recorrente; diagnóstico sai do corpo bruto da resposta, nunca do painel | D-111 a D-115, D-118 a D-120, D-123, D-124 | 10 |
| **B10** | **Como não avisar duas vezes do mesmo prazo.** A chave que identifica um aviso repetido é o **conteúdo**, não o identificador do envelope de entrega — medido em três entregas do mesmo evento com três identificadores diferentes | D-116, D-117 | 2 |
| **B11** | **A forma dos dados que o Escavador devolve.** Nenhum campo da capa pode ser tratado como obrigatório (medido entre justiça comum e trabalhista), lê-se o campo já normalizado, e o dado extraído de PDF não substitui o contrato da API nos testes | D-122, D-125, D-132 a D-135 | 6 |
| **B12** | **As travas do banco de dados.** Migração aplicada é imutável; a aplicação recebe só leitura e inserção por padrão; processo sem classificação nasce **sigiloso**; a auditoria é protegida por duas camadas e o resumo **recusa** dado pessoal antes de gravar | D-126 a D-131, **D-157 a D-159** *(as do Marco 3, que a renumeração de 08/09 liberou da colisão)*, D-160 a D-162 | 12 |
| **B13** | **As travas de permissão.** Não existe permissão curinga; "poder escrever" não implica "poder ler"; chamada sem sujeito sob alcance restrito é **recusada**; e ferramenta mal declarada derruba o servidor na partida em vez de subir com buraco | D-136 a D-141 | 6 |
| **B14** | **O que as respostas do escritório de 27/08 mudaram.** A divisão A3a/A3b, a expiração recaindo sobre o pedido pendente e não sobre autorização concedida, e o catálogo de gabaritos crescendo por evidência | D-142 a D-145, D-150, D-151 | 6 |
| **B15** | **O comportamento das duas demonstrações.** Quando o robô não pode responder ele chama uma pessoa; o chamado acontece antes da resposta ao cliente; prognóstico é barreira em código; e o modelo **veste** o rascunho de quem escreveu, nunca **completa** o que não foi dito | D-163 a D-170, D-172 a D-176 | 13 |
| **B16** | **O que 30 callbacks reais ensinaram.** O aviso automático é o caminho primário e a consulta periódica errou; publicação se identifica pelo id do fornecedor; duas datas parecidas são tratadas como distintas; e entrega com origem inválida é **gravada** sem virar publicação | D-177 a D-181, D-183 a D-188 | 11 |
| **B17** | **Higiene do repositório.** A lista do que conta como trabalho virou lista de exclusão (pasta nova nasce coberta); autoria vem do que foi provadamente escrito; e comando que você roda nunca depende da sintaxe de um shell específico | D-189 a D-191 | 3 |
| **B18** | **O que o levantamento do servidor mediu.** ~313 processos e nenhum cliente de alto volume; o código é do prestador e licenciado ao escritório; a Malu é a responsável interna; a retenção de execução do n8n é curta e variável; e os números do rito de prazo | D-193, D-199, D-200, D-203, D-204, D-208 | 6 |
| | **Total** | | **159** |

### Como dar o de acordo em bloco

O texto abaixo é o que fecha a parte do bloco no P-02. Ele vale como registro se for datado e colado na §13 das diretrizes, **por você** — este documento não altera status.

> **De acordo em bloco, `<data>`.** Os blocos B1 a B18 do `18-digesto-de-aval.md` estão confirmados. As decisões que eles cobrem passam de 🟡 Proposta a ✅ Confirmada (usuário, `<data>`), com este digesto como fundamento. Ficam de fora, e seguem em Proposta, as 15 do grupo A e as 8 do grupo C.

**Se quiser confirmar só uma parte**, o de acordo pode nomear os blocos: *"Os blocos B1 a B14 estão confirmados; B15 a B18 seguem em Proposta"*. O registro aceita recorte — o que ele não aceita é ambiguidade sobre o que foi coberto.

⚠️ **Uma ressalva honesta sobre o bloco.** "Ninguém contestou" não é o mesmo que "foi conferido uma a uma por você". O que o bloco formaliza é que **o projeto já opera assim** e que essas decisões não têm consequência nova a decidir. Se em algum momento uma delas voltar a doer, ela volta como decisão nova, com número próprio — não como conserto retroativo desta assinatura.

---

## 5. Grupo C — as 8 que não deveriam estar em Proposta

Estas não pedem escolha: pedem **arrumação**. Cada uma já foi respondida pelos fatos, e continuar em 🟡 Proposta faz o registro descrever um projeto que não é mais este.

### 5.1 ✅ A colisão de numeração — resolvida em 08/09, e as 3 do Marco 3 voltaram ao bloco

**O que havia.** **D-157, D-158 e D-159** estavam usados **duas vezes cada**: um trio do Marco 3 da auditoria (31/08) e outro da revisão externa (01/09). E a colisão já tinha vazado — o `00-estado-atual.md` usava os dois sentidos em trechos diferentes do mesmo documento, o `14-auditoria-marco-3.md` usava o do Marco 3 e o P-24 do plano usava o da revisão externa.

**O que foi feito**, com o seu aval em 08/09:

| Era | Virou | Assunto |
|---|---|---|
| D-157 *(revisão externa, 01/09)* | **D-213** | Isolamento entre escritórios em duas camadas |
| D-158 *(revisão externa, 01/09)* | **D-214** | Aprovação vale uma vez, neste escritório e nesta conversa |
| D-159 *(revisão externa, 01/09)* | **D-215** | HMAC no anonimizador, adiado — é a **A-12** deste digesto |

O trio do **Marco 3 ficou com os números originais**, porque fechou primeiro e porque a nota de rodapé da §13 sempre declarou *"D-157 a D-162 nascem do Marco 3"*. As três renumeradas mantiveram a posição cronológica na tabela, como se fez com D-153/D-154, e cada uma carrega a nota do número antigo. As citações em `00-estado-atual.md`, `17-plano-de-execucao.md` e `02-descoberta-perguntas-abertas.md` foram acertadas.

⚠️ **E a §15 tinha a mesma doença, encontrada no caminho.** O **R-70** nomeava dois riscos: o da triagem de pertinência (D-206, 05/09) e o do ruído de alerta (D-209, 07/09). O do ruído virou **R-76**; o da triagem ficou com o R-70, por ser anterior e por a própria D-206 nomeá-lo na coluna de recomendação.

**Efeito na contagem deste digesto:** as três decisões do Marco 3 (auditoria) deixaram de ser um problema de numeração e passaram a ser decisões comuns em 🟡 Proposta. **Saíram do grupo C e entraram no bloco B12**, que é onde o resto da auditoria já estava. Por isso o grupo C tem 8 e não 11.

📌 **Terceira vez que isto acontece** — D-101/D-102, os RF do PRD (P-18) e agora estas duas. A causa é sempre a mesma: uma sessão registra um bloco novo sem conferir o último número usado. **A prevenção é barata e ainda não existe** — um *hook* (script que roda automaticamente antes de o trabalho ser salvo no histórico) que recuse identificador repetido. Entrou no **P-18**.

### 5.2 D-06 — as faixas A0–A4 como estão escritas não existem mais

A decisão diz "faixas A0–A4 e aprovação humana obrigatória em A3/A4". Desde então: a **D-142** partiu A3 em A3a/A3b; a **D-156** **removeu A3 puro** da lista de faixas válidas, e ferramenta que ainda o declare é recusada quando o servidor sobe; e a **D-194** partiu A4 em A4a/A4b.
**Na prática:** a tabela descreve uma régua de aprovação que o código já não aceita.
**O que fazer:** reescrever a D-06 apontando para D-142, D-156 e D-194, ou confirmá-la com a ressalva de que a régua atual é a delas.

### 5.3 D-25 — a condição que a bloqueava foi atendida

"A faixa A4 permanece bloqueada enquanto não houver identidade individual de advogado." A **D-147** resolveu a identidade individual (Telegram + painel, uma conta por pessoa, autenticação em dois fatores), e o próprio texto dela diz que isso *"destrava a faixa A4 (D-25)"*.
**Na prática:** o bloqueio já não existe, mas a tabela ainda o anuncia.
**O que fazer:** fechar a D-25 como **cumprida**, apontando para D-147. ⚠️ Detalhe que vale conferir: o `00-estado-atual.md` §Decisões já a lista entre as confirmadas — a §13 não. Os dois registros discordam, e quem vale é a §13.

### 5.4 D-49 — a cota que ela governava expirou

"A cota de teste do Escavador é gasta em validação de contrato, não em cobertura de superfície nem em descoberta de preço." A cota **expirou em 01/09** com R$ 44,00 dentro.
**Na prática:** a regra não tem mais objeto — não há cota de teste a governar.
**O que fazer:** fechar como **cumprida**, registrando que o princípio sobrevive para o saldo pago do P-04 — que é a **D-50**, essa sim viva.

### 5.5 D-65 — foi reescrita duas vezes desde que foi proposta

"Aprovação humana expira: pedido não respondido em janela definida vence e precisa ser refeito." A **D-143** a redigiu (a expiração recai sobre o pedido pendente, nunca sobre autorização já concedida; gabarito não expira; alerta de prazo não expira), e a **D-208** deu os números — 4 h úteis para mensagem ao cliente, 2 h para ato com efeito de prazo.
**Na prática:** ela não contradiz nada, só não é mais o texto que vale.
**O que fazer:** fechar a D-65 apontando para D-143 + D-208.

### 5.6 D-85 — a condição do congelamento já foi respondida

"A migração Trello → ClickUp fica congelada até D-09 ser respondida." **A D-09 foi respondida em 27/08** pelo escritório: base própria é a fonte da verdade, Trello é visualização (D-152).
**Na prática:** o congelamento venceu, e a migração não está em nenhum escopo.
**O que fazer:** fechar como **descongelada e descartada nesta fase** — a D-195 fechou o escopo em E1+E2 e a D-207 recortou mais ainda. Se voltar, volta como decisão nova, precedida do piloto no plano gratuito que a própria D-85 exigia.

### 5.7 D-97 — a conversa de que ela dependia não é mais necessária

"A demo roda anonimizada por padrão; nomes reais são decisão informada do escritório." O estado é literalmente *"🟡 Proposta — depende da conversa do usuário com a advogada"*. **A apresentação aconteceu em 02/09 e rodou anonimizada** — o padrão valeu, e o interruptor `--nomes-reais` nunca foi acionado.
**Na prática:** a decisão foi tomada pelo padrão, sem que ninguém precisasse escolher.
**O que fazer:** fechar como **cumprida pelo padrão**. ⚠️ E corrigir o `00-estado-atual.md` §"Onde estamos", cujo passo 5 ainda diz *"decidir o nível de anonimização com a advogada (D-97)"*.

### 5.8 D-121 — a aparição que ela esperava já chegou

"A vigilância em diário só é removida depois de capturar uma aparição." **Foram 30 entregas reais** entre 27/08 e 02/09, documentadas em `15-contrato-da-aparicao.md`, e o ritmo continua.
**Na prática:** a condição foi cumprida com folga.
**O que fazer:** fechar como **cumprida**. A pergunta viva não é mais "pode remover?", e sim "renova em 26/09, e quem paga?" — que é a **D-182**, item **A-2** deste digesto.

### 5.9 D-171 — foi substituída pela D-216

"Duas colaboradoras aprovam envio ao cliente — exceção explícita e datada à D-06 e à D-142, só para a apresentação de 02/09." A v1.0 deste digesto a leu como exceção esquecida e recomendou reverter. **Estava errado:** você informou em 08/09 que a autonomia das duas é **decisão de negócio da advogada proprietária** — elas foram contratadas como atendentes.
**Na prática:** a operação real do escritório estava registrada como se fosse uma gambiarra de demonstração.
**O que fazer:** fechar a D-171 como **substituída pela D-216**, que registra a mesma coisa no lugar certo e com a fronteira escrita. **Não reverter** `demo/listas/colaboradores.json`. O que sobrevive da D-171 é a lição, que continua boa: exceção sem prazo vira regra por cansaço — só que aqui ela virou regra por decisão, o que é diferente.

---

## 6. Três coisas fora do grupo Proposta que a leitura encontrou

Não fazem parte do P-17, mas seria desonesto ter visto e não registrado.

**1. D-197 e D-202 estão 🔴 Em aberto esperando decisão que já foi tomada.** As duas dizem *"decidir junto com D-195"* — WhatsApp pela Meta ou por intermediário homologado (D-197), e o WhatsApp não oficial já instalado no servidor (D-202). **A D-195 está ✅ Confirmada e tirou E4 desta fase.** Com E4 fora, nenhuma das duas precisa ser decidida agora, e a própria D-197 diz que, sem o prazo apertando, a Meta volta a ser a escolha certa. **Sugestão:** movê-las de 🔴 Em aberto para "adiadas pela D-195", com retomada junto de E4. 🔴 Em aberto significa "precisa de informação do escritório", e não é mais o caso.

**2. A D-205 tem um estado que não existe na convenção.** Está marcada 🔄 *Revisada em 05/09 pela D-206*, e a §13 declara três estados. Metade dela (a Malu por V1) virou ✅ e metade caiu. **Sugestão:** partir em duas linhas, ou confirmá-la **parcialmente**, com a parte derrubada riscada como se fez na D-153.

**3. O `00-estado-atual.md` §Decisões estava desatualizado em quatro pontos** — dizia "D-01 a D-207" (são D-218), "173 contra 2 ✅" (são 182 contra 31), listava D-62 como 🔴 Em aberto (está 🟡 Proposta, e foi confirmada e barateada pelas D-205/D-206) e listava D-25 como confirmada quando a §13 diz Proposta. ✅ Corrigido junto com este digesto.

---

## 7. O que fazer com este documento

| Ordem | Passo | Quem |
|---|---|---|
| 1 | ✅ **Feito em 08/09** — renumeração das colisões (D-213 a D-215, R-76) | 🤖 |
| 2 | ✅ **Feito em 08/09** — a D-171 virou D-216, e a pergunta do aviso virou D-217 e D-218 | 🤖 |
| 3 | ✅ **Cinco decididas em 08/09** — A-1, A-2, A-4, A-5 adotadas e A-3 recusada | 👤 feito |
| 4 | Ler o que sobrou da §3 e a §3.1 — **14 pendentes**, das quais **3 urgentes** (A-14, A-16, A-19) | 👤 você |
| 5 | Dar o de acordo em bloco da §4, com data, na §13 | 👤 você |
| 6 | Dizer o que fazer com as **8** da §5 | 👤 você |
| 7 | Aplicar o resto das mudanças de status na §13 e fechar o P-02 | 🤖 uma sessão, depois de 4, 5 e 6 |

**Você não precisa fazer 3, 4 e 5 na mesma sentada.** O passo 4 é o que mais destrava por unidade de esforço — 159 decisões saem da pilha com um parágrafo. Os passos 3 e 5 podem vir depois.

**Depois disso, o PRD e a Spec destravam.** Os dois estão em *"🟡 Proposta — aguarda aval do usuário"* desde **27/08** — treze dias —, e é a pilha de decisões que os prende, não conteúdo em falta.

---

## 8. Adendo de 08/09 — o que mudou depois da v1.0

Este documento nasceu e envelheceu no mesmo dia, e o registro de por quê é parte dele.

**1. A renumeração foi autorizada e feita.** D-157 a D-159 da revisão externa viraram **D-213 a D-215**; o **R-70** duplicado virou **R-76**. Detalhe na §5.1.

**2. A A-1 da v1.0 estava errada, e o erro era meu.** Eu li a D-171 como exceção de demonstração esquecida no disco e recomendei reverter. Você informou o que faltava: **as duas colaboradoras foram contratadas como atendentes, e a advogada proprietária adota a autonomia delas deliberadamente** — sem isso, ou a Malu responde todos os clientes o tempo todo, ou ninguém responde. Não é sobra de demo; é a operação real, registrada no lugar errado. Nasceu a **D-216**.

**3. E veio junto uma pergunta que o projeto ainda não tinha feito:** avisar a advogada a cada aprovação não produz entulho a ponto de ela ignorar tudo, inclusive prazo? **Sim.** Duas correções de fato saíram daí:

- O *"avisar a cada geração"* da D-171 é mensagem impressa no terminal pelo script que monta o fluxo, dirigida a quem roda o script. **Nunca chegou ao Telegram de ninguém**, e a preocupação, embora certa, não incidia sobre um mecanismo existente.
- O mecanismo que **produziria** o entulho é outro, e está no desenho: a compensação (3) da **D-194** dá aviso nominal imediato à advogada a cada encerramento de alerta por colaboradora. Esse fica — a medição da D-206 o limita a ~5 por dia útil. O que **não** entra no canal de tempo real é a aprovação de mensagem ao cliente, que é onde o volume mora.

Daí a **D-217** (avisar por exceção, prestar contas por resumo) e a **D-218** (o catálogo de gabaritos é o que tira o volume da fila), mais o **R-77** (a supervisão passa a depender de alguém abrir o resumo).

**4. E esta v2.0 reescreveu a apresentação, não o conteúdo.** A pedido do usuário em 08/09: cada ficha do grupo A ganhou contexto, exemplo concreto, os números em reais quando existem e uma linha de decisão; os 18 blocos do grupo B passaram a dizer o que decidem em vez de só nomear o assunto; e entrou o glossário da §9. **Nenhuma recomendação mudou entre a v1.1 e a v2.0** — se tivesse mudado, estaria registrada aqui.

---

## 9. Glossário — o vocabulário que este projeto acumulou

Organizado por assunto, não por ordem alfabética, porque os termos se explicam em grupo.

### Arquitetura — as peças da plataforma

| Termo | O que é |
|---|---|
| **n8n** | A ferramenta de automação onde os fluxos rodam. É o "orquestrador": ele chama as peças na ordem certa |
| **Fluxo / workflow** | Uma automação montada no n8n — a sequência de passos que responde a um evento |
| **MCP** *(Model Context Protocol)* | Um padrão que expõe **ferramentas** a um agente de IA. Neste projeto, um "servidor MCP" é um programa separado que conversa com o Escavador ou com o Trello e oferece funções controladas ao agente |
| **Chassi** | A camada de código comum a todos os servidores MCP. Antes de qualquer ferramenta rodar, ela confere **quem é**, **o que pode** e **registra** |
| **Policy Gate** | O guardião que decide, **fora** dos servidores MCP, se aquela ação pode acontecer segundo as regras do escritório. Existe para que os MCP fiquem genéricos e reutilizáveis (Regra 3) |
| **Agente** | O componente de IA que interpreta o pedido e escolhe que ferramenta usar |
| **Prompt** | O texto que se manda ao modelo de IA. ⚠️ **Nunca é fronteira de segurança** — instrução em prompt se contorna com conversa (Regra 1) |
| **Instância** | Uma cópia de um programa rodando. "Instância do n8n" = o n8n do cliente, específico |

### Permissão — quem pode o quê

| Termo | O que é |
|---|---|
| **Papel** | O cargo dentro do sistema: cliente, colaborador, advogado, administrador |
| **Escopo** | Uma permissão nomeada, no formato `sistema:recurso:ação`. Exemplo: `escavador:processo:read` |
| **Abrangência** | Até onde o escopo alcança: `own` (só o que é meu), `carteira` (os processos sob minha responsabilidade), `any` (tudo) |
| **Faixa de aprovação** | A escala que diz que rito cada ação segue — ver quadro abaixo |
| **Matriz de escopo** | A tabela papel × ferramenta × abrangência, verificada por testes automatizados |

**As faixas de aprovação, em uma linha cada:**

| Faixa | Natureza | Rito |
|---|---|---|
| **A0** | Leitura interna, sem custo e sem efeito | Automática, registrada |
| **A1** | Leitura externa que consome crédito | Automática dentro da quota; acima disso, aprovação |
| **A2** | Escrita interna, reversível | Automática, registrada |
| **A3a** | Comunicação externa **por gabarito** aprovado antes | **Automática e registrada** |
| **A3b** | Comunicação externa em **texto livre** | Aprovação humana, mensagem a mensagem |
| **A4a** | Interromper internamente a vigilância de um prazo | Colaboradora identificada pode, com motivo, aviso à advogada e janela de reabertura |
| **A4b** | Ato com efeito jurídico que sai do escritório | **Advogada identificada, sempre. Sem exceção** |

### Dados e vigilância

| Termo | O que é |
|---|---|
| **API** | O endereço programável de um serviço — como um sistema conversa com outro sem tela no meio |
| **Chave de API / token** | A credencial que identifica quem está chamando. No Trello, ela herda tudo o que a pessoa dona alcança |
| **V1 e V2** | As duas versões da API do Escavador. A **V1** tem diário oficial e monitoramento por termo; a **V2** tem o processo judicial detalhado |
| **Monitoramento / vigilância** | Uma assinatura paga no Escavador que avisa quando um termo (nome de advogado) ou um processo aparece |
| **Aparição** | Cada vez que o termo vigiado aparece numa publicação de diário oficial |
| **Franquia de aparições** | O teto mensal de aparições incluído na assinatura. ⚠️ **Não é editável depois de criada** |
| **Callback** | O fornecedor **avisa a gente** quando algo acontece, em vez de a gente ficar perguntando. É gratuito |
| **Webhook** | O endereço nosso que recebe esse aviso |
| **Polling** | O contrário do callback: perguntar de tempos em tempos. Neste projeto, ele **discordou** do callback e errou |
| **Receptor** | O nosso programa que recebe os callbacks, confere a origem e grava |
| **CNJ** | O número padronizado do processo judicial. É a identidade estável em qualquer tribunal |
| **Intimação** | A publicação que faz prazo correr. 26 das primeiras 30 capturadas eram disso |
| **Idempotência** | A propriedade de uma operação poder ser repetida sem duplicar efeito — importa porque o Escavador reentrega o mesmo aviso |
| **Cache** | Cópia guardada de uma resposta, para não pagar duas vezes pela mesma pergunta |
| **Disjuntor** | O mecanismo que corta o gasto ao atingir um teto |

### Banco de dados e segurança

| Termo | O que é |
|---|---|
| **PostgreSQL** | O banco de dados usado no projeto |
| **Migração** | Um arquivo que muda a estrutura do banco, numerado e aplicado em ordem. **Migração aplicada é imutável** — a correção é sempre uma migração nova |
| **Superusuário** | A conta do banco que pode tudo, em todos os bancos daquele servidor. É o problema da decisão **A-8** |
| **Política por linha** | Regra do banco que faz cada consulta ver **só** as linhas do escritório declarado. ⚠️ Não se aplica ao dono da tabela |
| **Append-only** | Tabela em que só se pode **acrescentar** — nunca alterar nem apagar. É como a auditoria vira prova |
| **Inquilino** *(tenant)* | Cada escritório atendido pela mesma plataforma. O isolamento entre inquilinos é o que impede um ver o outro |
| **Auditoria / trilha** | O registro nominal e imutável de quem fez o quê, quando, sob qual aprovação |
| **Hash** | Função que transforma um texto num código de tamanho fixo, sem volta |
| **HMAC** | O mesmo hash **com uma senha secreta misturada** — o que impede alguém de testar candidatos até acertar |
| **Anonimização / pseudonimização** | Trocar o nome real por um código estável, para que o dado possa circular sem identificar a pessoa |
| **Variável de ambiente** | Configuração entregue ao programa quando ele inicia — inclusive senhas. Legível por quem administra o servidor |
| **Contêiner / Docker Swarm** | A caixa isolada onde cada programa roda, e o orquestrador que cuida delas |
| **Portainer** | O painel web que administra esses contêineres. ⚠️ Está exposto na internet (R-62) |
| **Hook** | Script que roda automaticamente num momento fixo do trabalho — por exemplo, antes de algo ser salvo no histórico do projeto |

### Documentos, produto e conformidade

| Termo | O que é |
|---|---|
| **PRD** | O documento que diz **o que** o produto faz — requisitos, regras de negócio, modelo de custo |
| **Spec** | O documento que diz **de que** o produto é feito — componentes, contratos, esquema de dados |
| **RF-nn / RNF-nn** | Requisito funcional / não funcional, numerados no PRD |
| **D-nn / R-nn / P-nn** | Decisão / risco / passo do plano de execução |
| **E1 a E4** | As quatro entregas: fundação e consulta (E1), vigilância de prazo (E2), demandas e Trello (E3), atendimento ao cliente (E4) |
| **Marco** | Uma etapa de construção que fecha com sua própria bateria de testes. Três entregues, sete restantes |
| **Gabarito** | Modelo de mensagem aprovado uma vez por advogada, que dispensa aprovação a cada envio |
| **Escopo fechado** | Contratação em que se entrega um escopo por um preço — estouro não vira hora extra, vira escopo não entregue |
| **LGPD — controlador** | Quem decide para que os dados pessoais são usados. Aqui, o escritório |
| **LGPD — operador** | Quem trata os dados em nome do controlador, e responde por isso. Aqui, você |
| **Encarregado** | A pessoa que responde pelo tratamento de dados perante os titulares e a autoridade. Aqui, a Malu |
