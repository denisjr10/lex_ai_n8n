# Digesto de aval — as decisões que ainda pedem a sua leitura

| Campo | Valor |
|---|---|
| Versão | 1.1 — **a pilha andou durante a própria triagem.** A colisão de numeração foi corrigida (D-213 a D-215, R-76), a D-171 foi substituída pela D-216, e D-216 a D-218 nasceram da conversa de 08/09 |
| Data | 2026-09-08 |
| Revisado em | 2026-09-08, no mesmo dia — ver §8 |
| Estado | 🟢 **Pronto para leitura.** Não altera o estado de nenhuma decisão — o aval é do usuário |
| Fase | 3 — construção |
| Passo | **P-17** do [plano de execução](17-plano-de-execucao.md) §6. Destrava o **P-02** |
| Herda de | `01-diretrizes-gerais.md` §13 (registro único e centralizado), `17-plano-de-execucao.md`, `00-estado-atual.md` |

> **O que este documento é.** A leitura curta da pilha de aval. A §13 das diretrizes tem **182 decisões em 🟡 Proposta**, e ler as 182 não é caminho — a maior parte é registro de coisa que o projeto já fez e que ninguém contestou. Aqui elas estão separadas em três grupos: as que **precisam da sua leitura uma a uma** (§3), as que se confirmam **em bloco, com uma data** (§4), e as que **não deveriam estar em Proposta** (§5).
>
> **O que este documento não é.** Ele não decide nada e não muda nenhum status. A §13 continua sendo o registro único; este é o índice de leitura dela. **Nenhuma linha da §13 foi alterada para produzir este digesto.**

---

## 1. A contagem de hoje — o número 173 estava velho

Contado em **08/09** sobre `01-diretrizes-gerais.md` §13, linha a linha:

| Estado | Linhas |
|---|---|
| 🟡 **Proposta** | **182** — eram 179 antes de D-216 a D-218 nascerem, em 08/09 |
| ✅ Confirmada / Resolvida | 31 |
| 🔴 Em aberto | 3 — D-197, D-202, D-212 |
| 🔄 Revisada | 1 — D-205 |
| ❌ Derrubada | 1 — D-153 |
| **Total de linhas** | **218**, e agora **218 identificadores distintos** |

Três correções ao que o `00-estado-atual.md` e o plano diziam:

1. **Eram 179 em Proposta, não 173** — e viraram 182 no fim do dia. O número 173 é de 06/09 e o repositório andou: D-208 a D-212 nasceram em 07 e 08/09, D-216 a D-218 nasceram desta triagem, e o resto veio do levantamento da instância.
2. **São 31 confirmadas, não 2.** O `00-estado-atual.md` §Decisões diz "173 contra 2 ✅" — a conta ignorava as 13 da demo, as 5 resolvidas pelo escritório em 27/08, as 4 da revisão externa e as de 05 a 08/09. A pilha é grande, mas menos torta do que o registro fazia parecer.
3. ✅ **A tabela tinha 215 linhas e 212 identificadores** — três IDs usados duas vezes cada. **Corrigido em 08/09** com o aval do usuário, e a §15 tinha a mesma doença no **R-70**. Ver §5.1.

Uma delas conta como Proposta mas com estado escrito à mão fora da convenção: **D-97**, "🟡 Proposta — depende da conversa do usuário com a advogada". Está contada nas 182 e tratada na §5.

---

## 2. Como os três grupos foram separados

| Grupo | Critério | Quantas |
|---|---|---|
| **A — precisa da sua leitura** | Ainda muda desenho, custa dinheiro, afrouxa uma Regra Inegociável, ou é irreversível depois de aplicada | **15** |
| **B — de acordo em bloco** | Registro de coisa que o projeto já fez, que já está no código ou nos documentos, e que ninguém contestou. Confirmar é formalizar o que já existe | **159** |
| **C — não deveria estar em Proposta** | Superada, contradita por decisão mais nova, ou dependia de resposta que já chegou | **8** |

15 + 159 + 8 = **182**. Toda decisão em Proposta está em exatamente um grupo.

**Sobre o grupo A ter passado de 12.** A estimativa do plano era "8 a 12", e o filtro devolveu 13 — e depois 15, quando a conversa de 08/09 gerou três decisões novas e aposentou uma. Não cortei nenhuma para caber no número: cada uma falha em pelo menos um dos quatro testes, e a que sobrasse de fora seria escolhida por conveniência de contagem, não por mérito. Se quiser ler em duas vezes, a §3 marca **7 como urgentes antes de 15/09** e **8 como podendo esperar** — mas as sete não somem por esperar, e três delas têm data própria.

---

## 3. Grupo A — as 15 que pedem a sua leitura

> 🔴 = urgente, tem data em cima · 🟠 = pode ser lida depois de 15/09 sem prejuízo

### A-1 · D-216 🔴 — as atendentes aprovam mensagem ao cliente, e isso vira regra, não exceção

> ⚠️ **Substitui a A-1 da v1.0 deste documento, que recomendava reverter a D-171.** A recomendação estava errada por falta de um dado: a autonomia das duas colaboradoras **é decisão de negócio da advogada proprietária**, não sobra esquecida da demonstração. Ver §8.

**Decide:** mensagem que **informa** (andamento, agenda, recebimento) qualquer perfil aprova; mensagem que **compromete** (assume prazo, promete resultado, reconhece fato, orienta juridicamente) continua exigindo advogada identificada. É a régua da D-194 — reversibilidade e externalidade — aplicada ao texto.
**Se você disser NÃO:** a Malu volta a ser o único gargalo de todo atendimento, o que anula o motivo de as duas terem sido contratadas.
⚠️ **Tem consequência em código:** a **D-156 item (2)** exige papel de advogado em A3b, verificado no chassi, e essa conferência precisa ser afrouxada — a própria D-156 diz que *afrouxar depois é decisão registrada, afrouxar por omissão não é decisão nenhuma*. **O que não se afrouxa:** A4b e matéria sensível (D-211).
**Recomendação: adotar, e implementar como escopo verificado no chassi** (Regra 1), nunca como instrução no prompt.

### A-2 · D-182 🔴 — a vigilância `2813617` renova em 26/09

**Decide:** se a vigilância em diário oficial que entrega ~6 publicações reais por dia útil continua ativa, e quem assume a renovação mensal.
**Se você disser NÃO (remover):** E2 perde a única fonte viva de publicação real, e **sem saldo não há como recriar** — criar monitoramento exige crédito, e a cota de teste expirou em 01/09.
**Recomendação: manter, e decidir junto com a recarga (P-04).** São R$ 3,00/mês pelo insumo central de E2; economizar aqui é economizar na única coisa que E2 entrega.
**Data dura: 26/09.** Ela renova sozinha — decidir depois é decidir tendo pago.

### A-3 · D-207 🔴 — o recorte do escopo de 15/09

**Decide:** E2 sai inteira; E1 sai com a fundação inteira e **uma** consulta ponta a ponta, ficando cache (RF-06), painel de custo (RF-08) e relatório de acesso amplo (RF-37) para a fase seguinte.
**Se você disser NÃO:** volta a valer a D-195 sem recorte — sete marcos de construção em seis dias úteis, com o insumo pago chegando no primeiro deles.
**Recomendação: adotar, e levar à Malu antes de 08/09.** Em escopo fechado, o que não cabe se negocia agora, não no dia 14. ⚠️ Se ela recusar o recorte, a alternativa é **mover a data**, não apertar o trabalho.
Este é o P-01, e ele define a prioridade de tudo o mais.

### A-4 · D-206 🔴 — a triagem de pertinência por CNJ

**Decide:** publicação capturada pelo nome do advogado é filtrada **no receptor, por CNJ**, com três saídas — acompanhado, não acompanhado, e **desconhecido → fila humana, nunca descarte**. Gera RF-45 a RF-48 e o R-70.
**Se você disser NÃO:** ou se filtra na origem (e processo legítimo nunca chega), ou se filtra pela lista de envolvidos — medido: descartaria **18% das publicações legítimas, em silêncio**.
**Recomendação: adotar.** É o desenho de E2, e é o que faz o V1 de R$ 3,00/mês valer contra o V2 de R$ 55–72.
🚧 **Depende de um insumo que ainda não temos:** a lista dos ~24 processos da Ana Beatriz que o escritório acompanha (P-03). Sem ela a triagem não tem contra o que comparar.

### A-5 · D-209 🔴 — a janela de reabertura expira **reabrindo** o alerta

**Decide:** encerramento feito por colaboradora é **provisório até uma advogada tocar**; expirada a janela de 4 h úteis, o alerta reabre em estado *pendente de advogada*, aparecendo uma vez por dia no resumo — sem novo disparo.
**Se você disser NÃO:** o silêncio da advogada volta a ratificar o encerramento, e o R-68 renasce — a RF-15 e a linha **Nunca** do PRD §5.2.1 ficam com exceção de novo.
**Recomendação: adotar.** O escritório já escolheu o lado seguro na 20e; o que falta é o de acordo da Malu sobre a regra do **segundo ciclo** — o que acontece quando reabre e ninguém toca de novo.
🚧 Inerte até a **20c** (horário útil) fechar: "4 horas úteis" precisa de um relógio que diga o que é útil.

### A-6 · D-211 🔴 — matéria sensível encurta o automatismo, nunca o acesso

**Decide:** família, criminal, menores e segredo de justiça restringem **o que a plataforma faz sem humano no meio** — cinco efeitos, sendo o primeiro que *o alerta mostra QUE há prazo, sem o teor*.
**Se você disser NÃO:** o teor da intimação de processo de família aparece no Telegram, e resumo automático ao cliente passa a valer para qualquer matéria.
**Recomendação: adotar o desenho inteiro e implementar só o item 1 agora** — ele é barato e entra junto com E2; os outros quatro ficam fora do recorte de 15/09.
⚠️ Tudo depende de classificar o processo, e classificação errada **falha em silêncio** (R-73) — classificação ausente é tratada como sensível.

### A-7 · D-149 🟠 — os tetos ganham número, e o número vai ao escritório

**Decide:** blocos por papel, franquia de aparições, orçamento por sessão, por pessoa e global deixam de ser intenção e viram número submetido à Malu (PRD §9.2, §9.3.1, §9.5).
**Se você disser NÃO:** a Regra Inegociável 6 (custo é requisito funcional) fica sem número em que se apoiar, e o disjuntor não tem em que disparar.
**Recomendação: adotar e submeter junto com o P-03.** Teto sem número não é controle; número escolhido por nós sem o de acordo do escritório é o mesmo erro pelo outro lado.
Some-se a isto o teto de gasto mensal com IA (pergunta 71), adiado por você — é o único eixo de custo que hoje não tem nem proposta.

### A-8 · D-201 🟠 — o banco da plataforma não divide instância com o n8n

**Decide:** a plataforma ganha instância própria — ou, no mínimo, papel e banco próprios sem superusuário —, porque o n8n conecta ao PostgreSQL como `postgres`, o superusuário da instância.
**Se você disser NÃO:** a política por linha da migração 010 e a auditoria imutável do marco 3 ficam **contornáveis por fora**, com a credencial que vive em variável de ambiente no Portainer — que está público (R-62).
**Recomendação: adotar, como pré-requisito do marco de implantação.** Barreira que se contorna pela porta dos fundos não é barreira, e as duas camadas de proteção do banco custaram três marcos para existir.
**Custa infraestrutura** — é por isso que está aqui e não no bloco.

### A-9 · D-198 🟠 — o OpenRouter como provedor único de modelos

**Decide:** um provedor só na configuração, e trocar de modelo deixa de ser trocar de credencial — o que casa com a Regra 6.
**Se você disser NÃO:** continuam OpenAI e Gemini separados, cada troca de modelo mexendo em credencial e implantação.
⚠️ **O preço não é técnico:** um intermediário a mais passa a ver o conteúdo dos prompts, e **prompt com dado de processo passa a transitar por um terceiro** — que entra no rol de operadores a declarar (RNF-19) e no R-74, junto com a questão de dados saírem do país (pergunta 39, ainda sem resposta).
**Recomendação: adotar, e registrar o OpenRouter entre os operadores antes do primeiro dado real** — não depois.

### A-10 · D-148 🟠 — a plataforma roda na infraestrutura do prestador

**Decide:** n8n, banco e servidores MCP ficam com o prestador, não com o escritório. Destrava a implementação inteira e resolve a dependência de callback.
**Se você disser NÃO:** a implementação para até o escritório prover servidor — e a entrega de 15/09 não existe.
⚠️ **Cria obrigação que o desenho anterior não tinha:** sob a LGPD, o escritório é **controlador** e você é **operador** de dados de terceiros sob sigilo profissional. O contrato precisa dizer isso e prever devolução, expurgo e continuidade ao término (R-48, P-05).
**Recomendação: adotar, com a cláusula escrita antes do primeiro dado real.** A decisão técnica já está tomada de fato; o que falta é o papel.

### A-11 · D-192 🟠 — o colaborador enxerga a base inteira

**Decide:** o alcance de **leitura** passa a ser o escritório inteiro para colaborador e advogado; o escopo de **ação** continua vindo do papel. O padrão restritivo provisório da pergunta 4a cai.
**Se você disser NÃO:** contraria resposta que o escritório já deu em 05/09 — *"eles fazem movimentação em nome dos advogados e com o acesso e credenciais dos advogados, sob observação dos advogados"*.
**Recomendação: adotar, e atualizar a matriz de privilégios da Spec Parte II.** O que não se negocia é o outro eixo: identidade individual continua obrigatória (Regra 7), porque alcance e permissão são coisas separadas.
Está no grupo A por alargar o acesso de sete pessoas a toda a base — é a decisão que mais amplia superfície nesta lista.

### A-12 · D-215 🟠 — o HMAC no anonimizador, adiado *(era D-159 até a renumeração de 08/09)*

**Decide:** a pseudonimização continua em `SHA-256(nome)` sem segredo — quem tiver a lista de partes dos autos consegue testar candidatos até acertar.
**Se você disser NÃO (retomar agora):** trocar o hash muda **todos** os pseudônimos, e com eles o instantâneo, os dois workflows e `demo/listas/clientes.json`.
⚠️ **O motivo do adiamento expirou.** A apresentação foi em 02/09, e a **D-211** devolveu peso ao HMAC: anonimização antes de saída externa deixou de ser opcional e virou condição de envio.
**Recomendação: retomar, mas fora da janela de 15/09** — é o P-24, e nenhuma demo precisa sobreviver à produção. ✅ Esta era uma das três da colisão de numeração — resolvida em 08/09, §5.1.

### A-13 · D-196 🟠 — a chave do Trello nasce em conta dedicada

**Decide:** a chave de API do Trello sai de uma conta criada para a automação, com e-mail próprio do escritório — não da conta da advogada chefe.
**Se você disser NÃO:** toda ação da plataforma aparece no quadro **como feita pela Malu**, e a auditoria que sustenta o projeto vira ficção dentro do Trello; a chave dela alcança também os quadros pessoais dela, fora do escritório.
**Recomendação: adotar, e antes de a chave existir.** Depois de gerada e usada, o histórico já escrito no quadro com o nome errado não se reescreve.
E3 saiu do recorte de 15/09, mas a chave "chega quando chegar" — e a ordem certa precisa estar decidida antes disso, não depois.

### A-14 · D-217 🔴 — a advogada é avisada por exceção, e prestada contas por resumo

**Decide:** o Telegram em tempo real fica reservado ao que tem relógio — alerta de prazo e encerramento A4a (~5/dia útil, pela medição da D-206). Aprovação de mensagem ao cliente **não gera aviso**: vai para o resumo de fim de dia útil, com link e nunca o teor (D-17). Fura o resumo só a aprovação que toca uma regra — segredo, matéria sensível, texto com data ou valor, cliente novo, fora do horário útil.
**Se você disser NÃO (avisar a cada aprovação):** duas atendentes × dezenas de mensagens/dia no mesmo canal onde mora o alerta de prazo. A advogada para de ler o canal, e o que se perde junto é o alerta que aparece uma vez só (R-52, R-76).
**Recomendação: adotar.** A proteção aqui não é a notificação, é a **trilha** — toda aprovação já é registrada nominalmente e de forma imutável. Notificação compra prevenção; trilha compra responsabilização, e com sete pessoas numa sala sob supervisão presencial, responsabilização é a compra certa.
⚠️ **O resíduo está no R-77:** a supervisão passa a depender de alguém abrir o resumo.

### A-15 · D-218 🟠 — o catálogo de gabaritos é o que resolve o volume

**Decide:** subir a prioridade do catálogo de gabaritos (faixa **A3a**, criada pela D-142), que hoje não existe — e por isso **tudo é A3b**, inclusive o parágrafo que se repete quarenta vezes por semana.
**Se você disser NÃO:** toda a discussão de quem aprova e de quem é avisado continua incidindo sobre um volume que não deveria estar na fila de aprovação.
**Recomendação: adotar, para a fase seguinte.** Está fora do recorte de 15/09 (é E4), mas é o que torna a **D-216** confortável em vez de apenas aceitável.
A D-151 já diz como o catálogo cresce: por evidência — 20 aprovações consecutivas sem edição —, não por confiança.

---

## 4. Grupo B — de acordo em bloco

**159 decisões.** Todas registram coisa que o projeto já fez, que já está no código, nos documentos ou na medição, e que ninguém contestou. Confirmar é formalizar o que já existe.

Os blocos abaixo existem para que o seu "de acordo" seja **auditável**: você confirma por bloco, e cada bloco diz exatamente quais identificadores cobre.

| Bloco | O que cobre | Decisões | Nº |
|---|---|---|---|
| **B1** | Arquitetura, camadas, canal interno e modelo de identidade | D-03, D-04, D-05, D-08, D-10 a D-24, D-26 | 20 |
| **B2** | Curadoria do MCP Escavador — perfis, cache, tetos de paginação | D-27 a D-35 | 9 |
| **B3** | MCP Trello — isolamento por quadro, webhooks, laço de sincronização | D-36 a D-46 | 11 |
| **B4** | Disciplina de crédito, token, disjuntor e leitura do painel | D-47, D-48, D-50 a D-60 | 13 |
| **B5** | Produto — ordem das entregas, V1 sobre V2, "sinaliza e nunca calcula prazo" | D-61 a D-64, D-66, D-67 | 6 |
| **B6** | Spec Parte I — monorepo, envelope, reserva e reconciliação, auditoria síncrona | D-68 a D-78 | 11 |
| **B7** | ClickUp — o parecer da Nota Técnica 02 | D-79 a D-84 | 6 |
| **B8** | O custo medido em 26/08 — catálogo por rota, franquia, monitoramento | D-103 a D-110 | 8 |
| **B9** | Lições de execução viradas em barreira de código | D-111 a D-115, D-118 a D-120, D-123, D-124 | 10 |
| **B10** | Idempotência de callback — a chave é o conteúdo, não o envelope | D-116, D-117 | 2 |
| **B11** | Contrato de dados da V2, do PDF e a amostra do TRT8 | D-122, D-125, D-132 a D-135 | 6 |
| **B12** | Banco — migrações imutáveis, permissão mínima, `append-only` em duas camadas | D-126 a D-131, **D-157 a D-159** *(as do Marco 3, que a renumeração de 08/09 liberou da colisão)*, D-160 a D-162 | 12 |
| **B13** | Chassi de escopo — decisão como valor, sem curinga, recusa na carga | D-136 a D-141 | 6 |
| **B14** | Respostas do escritório de 27/08 — A3a/A3b, expiração, catálogo de gabaritos | D-142 a D-145, D-150, D-151 | 6 |
| **B15** | As duas demos — recusa que chama gente, tom, ambiguidade, chamado | D-163 a D-170, D-172 a D-176 | 13 |
| **B16** | O contrato da aparição — 30 callbacks medidos, e o que eles derrubaram | D-177 a D-181, D-183 a D-188 | 11 |
| **B17** | Higiene do repositório, dos hooks e dos comandos | D-189 a D-191 | 3 |
| **B18** | Levantamento da instância n8n e respostas de 05 e 07/09 | D-193, D-199, D-200, D-203, D-204, D-208 | 6 |
| | **Total** | | **159** |

### Como dar o de acordo em bloco

O texto abaixo é o que fecha a parte do bloco no P-02. Ele vale como registro se for datado e colado na §13 das diretrizes, **por você** — este documento não altera status.

> **De acordo em bloco, `<data>`.** Os blocos B1 a B18 do `18-digesto-de-aval.md` v1.0 estão confirmados. As decisões que eles cobrem passam de 🟡 Proposta a ✅ Confirmada (usuário, `<data>`), com este digesto como fundamento. Ficam de fora, e seguem em Proposta, as 15 do grupo A e as 8 do grupo C.

⚠️ **Uma ressalva honesta sobre o bloco.** "Ninguém contestou" não é o mesmo que "foi conferido uma a uma por você". O que o bloco formaliza é que **o projeto já opera assim** e que essas decisões não têm consequência nova a decidir. Se em algum momento uma delas voltar a doer, ela volta como decisão nova, com número próprio — não como conserto retroativo desta assinatura.

---

## 5. Grupo C — as 8 que não deveriam estar em Proposta

### 5.1 ✅ A colisão de numeração — resolvida em 08/09, e as 3 do Marco 3 voltaram ao bloco

**O que havia.** **D-157, D-158 e D-159** estavam usados **duas vezes cada**: um trio do Marco 3 da auditoria (31/08) e outro da revisão externa (01/09). E a colisão já tinha vazado — o `00-estado-atual.md` usava os dois sentidos em trechos diferentes do mesmo documento, o `14-auditoria-marco-3.md` usava o do Marco 3 e o P-24 do plano usava o da revisão externa.

**O que foi feito**, com o aval do usuário em 08/09:

| Era | Virou | Assunto |
|---|---|---|
| D-157 *(revisão externa, 01/09)* | **D-213** | Isolamento entre escritórios em duas camadas |
| D-158 *(revisão externa, 01/09)* | **D-214** | Aprovação vale uma vez, neste escritório e nesta conversa |
| D-159 *(revisão externa, 01/09)* | **D-215** | HMAC no anonimizador, adiado — é a **A-12** deste digesto |

O trio do **Marco 3 ficou com os números originais**, porque fechou primeiro e porque a nota de rodapé da §13 sempre declarou *"D-157 a D-162 nascem do Marco 3"*. As três renumeradas mantiveram a posição cronológica na tabela, como se fez com D-153/D-154, e cada uma carrega a nota do número antigo. As citações em `00-estado-atual.md`, `17-plano-de-execucao.md` e `02-descoberta-perguntas-abertas.md` foram acertadas.

⚠️ **E a §15 tinha a mesma doença, encontrada no caminho.** O **R-70** nomeava dois riscos: o da triagem de pertinência (D-206, 05/09) e o do ruído de alerta (D-209, 07/09). O do ruído virou **R-76**; o da triagem ficou com o R-70, por ser anterior e por a própria D-206 nomeá-lo na coluna de recomendação.

**Efeito na contagem deste digesto:** as três decisões do Marco 3 (auditoria) deixaram de ser um problema de numeração e passaram a ser decisões comuns em 🟡 Proposta. **Saíram do grupo C e entraram no bloco B12**, que é onde o resto da auditoria já estava. Por isso o grupo C tem 8 e não 11.

📌 **Terceira vez que isto acontece** — D-101/D-102, os RF do PRD (P-18) e agora estas duas. A causa é sempre a mesma: uma sessão registra um bloco novo sem conferir o último número usado. **A prevenção é barata e ainda não existe** — um hook que recuse commit com identificador repetido em `01-diretrizes-gerais.md` e no PRD. Entrou no **P-18**.

### 5.2 D-06 — as faixas A0–A4 como estão escritas não existem mais

A decisão diz "faixas A0–A4 e aprovação humana obrigatória em A3/A4". Desde então: a **D-142** partiu A3 em A3a/A3b; a **D-156** **removeu A3 puro** da lista de faixas válidas, e ferramenta que ainda o declare é recusada na carga; e a **D-194** partiu A4 em A4a/A4b.
**O que fazer:** reescrever a D-06 apontando para D-142, D-156 e D-194, ou confirmá-la com a ressalva de que a régua atual é a delas. Deixar como está é manter na tabela um desenho que o código já recusa.

### 5.3 D-25 — a condição que a bloqueava foi atendida

"A faixa A4 permanece bloqueada enquanto não houver identidade individual de advogado." A **D-147** resolveu a identidade individual (Telegram + painel, uma conta por pessoa, 2FA), e o próprio texto dela diz que isso *"destrava a faixa A4 (D-25)"*.
**O que fazer:** fechar a D-25 como **cumprida**, apontando para D-147. ⚠️ Detalhe que vale conferir: o `00-estado-atual.md` §Decisões já a lista entre as confirmadas — a §13 não. Os dois registros discordam, e quem vale é a §13.

### 5.4 D-49 — a cota que ela governava expirou

"A cota de teste do Escavador é gasta em validação de contrato, não em cobertura de superfície nem em descoberta de preço." A cota **expirou em 01/09** com R$ 44,00 dentro (`06-orcamento-de-chamadas-escavador.md`).
**O que fazer:** fechar como **cumprida**, registrando que a regra sobrevive como princípio para o saldo pago do P-04 — que é a **D-50**, essa sim viva. O objeto da D-49 não existe mais.

### 5.5 D-65 — foi reescrita duas vezes desde que foi proposta

"Aprovação humana expira: pedido não respondido em janela definida vence e precisa ser refeito." A **D-143** a redigiu (a expiração recai sobre o pedido pendente, nunca sobre autorização concedida; gabarito não expira; alerta de prazo não expira), e a **D-208** deu os números — 4 h úteis para mensagem ao cliente, 2 h para ato com efeito de prazo.
**O que fazer:** fechar a D-65 apontando para D-143 + D-208. Ela não contradiz nada — só não é mais o texto que vale.

### 5.6 D-85 — a condição do congelamento já foi respondida

"A migração Trello → ClickUp fica congelada até D-09 ser respondida." **A D-09 foi respondida em 27/08** pelo escritório: base própria é a fonte da verdade, Trello é visualização (D-152).
**O que fazer:** fechar como **descongelada e descartada nesta fase** — a D-195 fechou o escopo em E1+E2 e a D-207 recortou mais ainda; ClickUp não está em nenhum dos dois. Se voltar, volta como decisão nova, precedida do piloto no plano gratuito que a própria D-85 exigia.

### 5.7 D-97 — a conversa de que ela dependia não é mais necessária

"A demo roda anonimizada por padrão; nomes reais são decisão informada do escritório." O estado é literalmente *"🟡 Proposta — depende da conversa do usuário com a advogada"*. **A apresentação aconteceu em 02/09 e rodou anonimizada** — o padrão valeu, e o interruptor `--nomes-reais` nunca foi acionado.
**O que fazer:** fechar como **cumprida pelo padrão**. ⚠️ E corrigir o `00-estado-atual.md` §"Onde estamos", cujo passo 5 ainda diz *"decidir o nível de anonimização com a advogada (D-97)"* — o passo já passou.

### 5.8 D-121 — a aparição que ela esperava já chegou

"A vigilância em diário só é removida depois de capturar uma aparição." **Foram 30 entregas reais** entre 27/08 e 02/09, documentadas em `15-contrato-da-aparicao.md`, e o ritmo continua.
**O que fazer:** fechar como **cumprida**. A pergunta viva não é mais "pode remover?", e sim "renova em 26/09, e quem paga?" — que é a **D-182**, item **A-2** deste digesto.

### 5.9 D-171 — foi substituída pela D-216

"Duas colaboradoras aprovam envio ao cliente — exceção explícita e datada à D-06 e à D-142, só para a apresentação de 02/09." A v1.0 deste digesto a leu como exceção esquecida e recomendou reverter. **Estava errado:** o usuário informou em 08/09 que a autonomia das duas é **decisão de negócio da advogada proprietária** — elas foram contratadas como atendentes.
**O que fazer:** fechar a D-171 como **substituída pela D-216**, que registra a mesma coisa no lugar certo e com a fronteira escrita. **Não reverter** `demo/listas/colaboradores.json`. O que sobrevive da D-171 é a lição, que continua boa: exceção sem prazo vira regra por cansaço — só que aqui ela virou regra por decisão, o que é diferente.

---

## 6. Três coisas fora do grupo Proposta que a leitura encontrou

Não fazem parte do P-17, mas seria desonesto ter visto e não registrado.

**1. D-197 e D-202 estão 🔴 Em aberto esperando decisão que já foi tomada.** As duas dizem *"decidir junto com D-195"* — WhatsApp pela Meta ou por BSP (D-197), e o WhatsApp não oficial já instalado no servidor (D-202). **A D-195 está ✅ Confirmada e tirou E4 desta fase.** Com E4 fora, nenhuma das duas precisa ser decidida agora, e a própria D-197 diz que, sem o prazo apertando, a Meta volta a ser a escolha certa. **Sugestão:** movê-las de 🔴 Em aberto para "adiadas pela D-195", com retomada junto de E4. 🔴 Em aberto significa "precisa de informação do escritório", e não é mais o caso.

**2. A D-205 tem um estado que não existe na convenção.** Está marcada 🔄 *Revisada em 05/09 pela D-206*, e a §13 declara três estados: 🟡 Proposta, ✅ Confirmada, 🔴 Em aberto. Metade dela (a Malu por V1) virou ✅ e metade caiu. **Sugestão:** partir em duas linhas, ou confirmá-la **parcialmente**, com a parte derrubada riscada como se fez na D-153.

**3. O `00-estado-atual.md` §Decisões estava desatualizado em quatro pontos** — dizia "D-01 a D-207" (são D-218), "173 contra 2 ✅" (são 182 contra 31), listava D-62 como 🔴 Em aberto (está 🟡 Proposta, e foi confirmada e barateada pelas D-205/D-206) e listava D-25 como confirmada quando a §13 diz Proposta. ✅ Corrigido junto com este digesto.

---

## 7. O que fazer com este documento

| Ordem | Passo | Quem |
|---|---|---|
| 1 | ✅ **Feito em 08/09** — renumeração das colisões (D-213 a D-215, R-76) | 🤖 |
| 2 | ✅ **Feito em 08/09** — a D-171 virou D-216, e a pergunta do aviso virou D-217 e D-218 | 🤖 |
| 3 | Ler a §3 — 15 decisões, ~4 linhas cada, das quais 7 urgentes | 👤 você |
| 4 | Dar o de acordo em bloco da §4, com data, na §13 | 👤 você |
| 5 | Dizer o que fazer com as 11 da §5 | 👤 você |
| 6 | Aplicar as mudanças de status na §13 e fechar o P-02 | 🤖 uma sessão, depois de 3, 4 e 5 |

**Depois disso, o PRD e a Spec destravam.** Os dois estão em *"🟡 Proposta — aguarda aval do usuário"* desde **27/08** — treze dias —, e é a pilha de decisões que os prende, não conteúdo em falta.

---

## 8. Adendo de 08/09 — o que mudou depois da v1.0

Este documento nasceu e envelheceu no mesmo dia, e o registro de por quê é parte dele.

**1. A renumeração foi autorizada e feita.** D-157 a D-159 da revisão externa viraram **D-213 a D-215**; o **R-70** duplicado virou **R-76**. Detalhe na §5.1.

**2. A A-1 da v1.0 estava errada, e o erro era meu.** Eu li a D-171 como exceção de demonstração esquecida no disco e recomendei reverter. O usuário informou o que faltava: **as duas colaboradoras foram contratadas como atendentes, e a advogada proprietária adota a autonomia delas deliberadamente** — sem isso, ou a Malu responde todos os clientes o tempo todo, ou ninguém responde. Não é sobra de demo; é a operação real, registrada no lugar errado. Nasceu a **D-216**.

**3. E veio junto uma pergunta que o projeto ainda não tinha feito:** avisar a advogada a cada aprovação não produz entulho a ponto de ela ignorar tudo, inclusive prazo? **Sim.** Duas correções de fato saíram daí:

- O *"avisar a cada geração"* da D-171 é `console.log` do `montar-fluxo-a.mjs`, dirigido a quem roda o gerador. **Nunca chegou ao Telegram de ninguém**, e a preocupação, embora certa, não incidia sobre um mecanismo existente.
- O mecanismo que **produziria** o entulho é outro, e está no desenho: a compensação (3) da **D-194** dá aviso nominal imediato à advogada a cada encerramento de alerta por colaboradora. Esse fica — a medição da D-206 o limita a ~5 por dia útil. O que **não** entra no canal de tempo real é a aprovação de mensagem ao cliente, que é onde o volume mora.

Daí a **D-217** (avisar por exceção, prestar contas por resumo) e a **D-218** (o catálogo de gabaritos é o que tira o volume da fila), mais o **R-77** (a supervisão passa a depender de alguém abrir o resumo).
