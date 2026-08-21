# Nota Técnica 02 — ClickUp no lugar do Google Workspace, do Google Chat e do Trello

| Campo | Valor |
|---|---|
| Status | Para decisão |
| Versão | 1.0 |
| Data | 2026-08-20 |
| Responde a | (1) O ClickUp substitui o Google Workspace e o Google Chat? (2) Qual a viabilidade técnica para este projeto? (3) Quais recursos dele seriam úteis? (4) Sai mais barato, com conta individual por pessoa? (5) Ele também substitui o Trello? |
| Decisões geradas | D-79 a D-85 (ver `01-diretrizes-gerais.md` §13) |
| Riscos gerados | R-29 a R-32 (ver `01-diretrizes-gerais.md` §15) |
| Documentos afetados | `03-canais-internos-e-hospedagem.md` (§1.6), `mapeamento-trello.md`, `08-prd.md`, `09-spec-tecnica.md` |

---

## 1. Resposta curta, antes do detalhe

A pergunta parece uma só, mas são **três substituições diferentes**, com respostas diferentes. Misturá-las é o que faz a proposta parecer melhor (ou pior) do que é.

| Substituição | Veredito | Em uma linha |
|---|---|---|
| ClickUp no lugar do **Google Workspace** | ❌ **Não substitui** | O ClickUp não hospeda e-mail em domínio próprio, não é provedor de identidade e não é o Drive. Ele **se conecta** ao e-mail que já existe — não o fornece |
| ClickUp no lugar do **Google Chat** | 🟡 **Substitui, com ressalvas** | Resolve a limitação que hoje inviabiliza o Chat (convidado externo não interage com aplicativo), mas a API de Chat é **experimental**, não tem botão nem identidade de robô |
| ClickUp no lugar do **Trello** | ✅ **Substitui, e com ganho real** | É o único dos três eixos em que a troca melhora o projeto — e o ganho **não é de preço, é de segurança**: o ClickUp consegue ser a segunda barreira que o Trello não é (R-16) |

E sobre custo, a resposta direta: **não sai mais barato.** O ClickUp é **somado** ao Google Workspace, não subtraído dele, porque o e-mail do escritório continua precisando de um provedor. O que ele substitui é o Trello — e aí a comparação é **US$ 7 a US$ 12** por pessoa/mês contra os **US$ 5 a US$ 10** do Trello.

> **Se a pergunta por trás da pergunta for "como reduzo a conta mensal?", a resposta não é ClickUp.** Se for "como tiro o Trello do caminho crítico de segurança deste projeto?", aí sim ele é a melhor candidata que encontrei.

---

## 2. Eixo 1 — ClickUp no lugar do Google Workspace

### 2.1 O que o Workspace entrega e o ClickUp não tem como entregar

O Google Workspace, no cenário do escritório, faz quatro coisas. O ClickUp faz uma delas.

| O que o Workspace faz | ClickUp faz? | Por quê |
|---|:---:|---|
| **Hospeda o e-mail** `nome@escritorio.adv.br` — recebe, armazena, aplica antispam, responde por MX, DKIM e SPF *(registros de DNS que provam que aquele domínio pode enviar e receber e-mail)* | ❌ | O ClickUp não é provedor de e-mail. Ele **conecta-se** a uma conta que já existe (Gmail, Outlook, Microsoft 365 ou IMAP) para ler e enviar de dentro da tarefa |
| **É o provedor de identidade** — a conta que autentica a pessoa, com segundo fator e desligamento central | ❌ | Toda conta ClickUp **começa** por um endereço de e-mail que veio de outro lugar. Ele é consumidor de identidade, não emissor. Consome SSO *(login único: uma senha só para vários sistemas)* — Google SSO no plano Business, SAML no Enterprise |
| **Armazena e edita documentos** — Drive, Docs, Planilhas, com histórico e compartilhamento | 🟡 parcial | Tem **ClickUp Docs** e anexo em tarefa, com armazenamento ilimitado nos planos pagos e **teto de 1 GB por arquivo**. Não é sistema de arquivos: não tem pasta sincronizada no computador e não substitui o Drive como repositório do acervo |
| **Agenda e videoconferência** | ❌ / 🟡 | Não tem Meet nem agenda própria de verdade — sincroniza com o Google Agenda em vez de substituí-lo |

### 2.2 O detalhe que fecha a questão: o "Email" do ClickUp não é caixa postal

O recurso *Email ClickApp* é frequentemente confundido com e-mail próprio. Ele **anexa** uma conta externa e permite mandar e receber mensagens de dentro de uma tarefa. As restrições, direto da documentação:

- Só conecta **Outlook** (hotmail/live/outlook), **Gmail** (@gmail.com), **Microsoft 365** e **IMAP** *(protocolo padrão de leitura de caixa postal)* — ou seja, sempre há um provedor por baixo, que continua sendo pago à parte
- **Plano Free:** 1 conta de e-mail, **100 usos**. **Unlimited:** 1 conta, uso ilimitado. **Business:** 2 contas
- **Convidado não usa o recurso de e-mail** — o que exclui qualquer colaborador que não tenha assento pago

Traduzindo para este projeto: a frente **F3 (monitoramento da caixa de e-mail)** continuaria dependendo do Google (ou de outro provedor). O ClickUp não muda nada nessa frente — no máximo, vira mais um lugar por onde o mesmo e-mail aparece.

### 2.3 E o problema da conta compartilhada (R-11)?

Aqui há uma nuance importante, e é a única coisa que o ClickUp de fato oferece neste eixo.

O ClickUp **dá identidade individual barata** — inclusive de graça: o plano Free aceita **membros ilimitados**. Doze pessoas, doze contas, doze registros de auditoria, sem custo de licença.

Isso **atenua** o R-11 dentro da plataforma, mas **não o encerra**:

- O e-mail continua compartilhado. Quem acessa `contato@escritorio.adv.br` continua sendo "o escritório", não uma pessoa
- Cada conta ClickUp precisa de um endereço de e-mail único — que, sem Workspace individual, seria o Gmail pessoal de cada um. Identidade individual sim, **mas hospedada em conta pessoal**, fora do controle do escritório, sem desligamento central. É exatamente a desvantagem 3 do Telegram, listada na Nota Técnica 01 §1.3
- Aprovação de faixa A4 exige comprovar que **quem aprovou era advogado**. Isso o ClickUp resolve — desde que a conta seja mesmo individual e não vire, ela também, uma conta compartilhada

**Conclusão do eixo 1:** o ClickUp não substitui o Workspace. Ele pode ser um **paliativo de identidade** enquanto o escritório não corrige a conta compartilhada — papel que já estava previsto para o painel próprio (Caminho B da Nota Técnica 01 §1.6.3). Não muda a recomendação: o Caminho A, com licenças individuais, continua sendo a correção certa.

---

## 3. Eixo 2 — ClickUp no lugar do Google Chat

### 3.1 O que melhora

A Nota Técnica 01 §1.6.1 registrou o motivo pelo qual o Google Chat foi descartado: **usuário externo não interage com aplicativo** — não menciona bot, não usa comando de barra, não clica em botão de card. Isso reduzia o Chat a mural de avisos.

No ClickUp essa barreira **não existe da mesma forma**: quem tem assento de membro interage com tudo. E membro no plano Free é ilimitado. Ou seja, o obstáculo que matou o Google Chat some.

### 3.2 O que piora — e é sério

| Achado | Consequência para o projeto |
|---|---|
| **A API de Chat é experimental.** A própria documentação diz que os endpoints são "experimentais e sujeitos a mudança a qualquer momento" | Não serve de base para o canal de notificação de prazo. Uma mudança silenciosa quebra o aviso de intimação (R-29) |
| **Não existe cartão com botão.** O endpoint de criar mensagem aceita `content` (markdown ou texto), `assignee`, reações e seguidores. **Não há componente de botão, cartão nem anexo** | O fluxo `[Aprovar] [Editar] [Rejeitar]` dentro da mensagem, que era a vantagem do Telegram e do Google Chat, **não existe no ClickUp Chat** |
| **Não há identidade de aplicativo.** O corpo da requisição não tem campo de bot; a mensagem sai como o **dono do token** | O "robô" apareceria como uma pessoa. Para não usar a conta de alguém, é preciso **um assento pago dedicado** ao robô — custo recorrente e mais uma identidade a governar (R-30) |
| **Histórico de 30 dias no plano Unlimited**; ilimitado só a partir do Business | Não afeta a auditoria (que é do nosso banco, §10.1 das diretrizes), mas afeta o uso cotidiano |
| **Plano Free: 1.000 mensagens/mês** e 30 *Posts* por Workspace, sem reposição | Inviabiliza usar o Free como canal de produção |

### 3.3 A saída que torna o eixo 2 aceitável — e que vale para o Trello também

A ausência de botão parece fatal, mas só é fatal se insistirmos em aprovar **dentro do chat**. Existe caminho melhor, e ele é nativo do ClickUp:

> **A aprovação vive na tarefa, não na mensagem.** O pedido de aprovação é uma tarefa com status próprio (`Aguardando revisão` → `Aprovado` / `Rejeitado`) ou um campo customizado. Mudar o status **é** o ato de aprovar. Uma *Automation* do ClickUp dispara um webhook *(chamada automática que o sistema faz ao nosso servidor quando algo acontece)* para o n8n, assinado e identificando quem fez a mudança.

Isso é melhor que botão de chat em três aspectos que importam neste projeto:

1. **Identidade** — o webhook do ClickUp traz `user.id` e `username` dentro de `history_items`. Quem aprovou fica registrado pelo próprio sistema, não pela nossa inferência
2. **Auditoria** — o histórico da tarefa é imutável para o usuário comum, diferente de mensagem de chat, que pode ser apagada (desvantagem 7 do Telegram)
3. **Conteúdo** — a tarefa comporta texto longo, anexo e edição antes de aprovar (necessidades N3, N4 e N6 da Nota Técnica 01 §1.1), coisa que uma bolha de conversa não comporta

E o webhook do ClickUp tem **segredo compartilhado por webhook**, devolvido no momento da criação, para verificar assinatura — o mesmo mecanismo que já planejávamos usar no Trello.

**Conclusão do eixo 2:** o ClickUp Chat serve como **mural de notificação**, não como superfície de ação. A ação vai para a tarefa. Nesse arranjo, o Telegram continua útil para o aviso urgente fora do horário, e o painel próprio continua sendo onde o conteúdo confidencial aparece. **A decisão D-17 — conteúdo confidencial não trafega no corpo da mensagem — continua valendo integralmente.**

---

## 4. Eixo 3 — ClickUp no lugar do Trello

Este é o eixo que justifica a nota inteira.

### 4.1 O achado central: o ClickUp consegue ser a segunda barreira

O R-16 é, segundo o próprio `mapeamento-trello.md`, o achado mais grave daquele mapeamento:

> A API do Trello **não tem escopo por quadro ou recurso**. Um token `read` lê a conta inteira. O isolamento entre carteiras depende do nosso código, não do Trello.

E o R-24 mostrou que o Escavador tem o mesmo defeito. Duas APIs, nenhuma delas segunda barreira — daí o R-26, com o `mcp-core` concentrando tudo.

**No ClickUp isso muda.** A autenticação via OAuth 2.0 *(protocolo em que cada usuário autoriza o aplicativo e recebe um token próprio)* emite **um token por usuário**, e esse token **só alcança o que aquele usuário alcança dentro do ClickUp**. As permissões do produto — Espaço privado, compartilhamento de Pasta e de Lista, papéis de convidado com permissão de leitura — passam a valer **também para a API**.

Na prática, para este projeto:

| Situação | Trello (hoje) | ClickUp |
|---|---|---|
| Token vazado de um colaborador | Alcança **toda** a conta do Trello onde ele é membro | Alcança **só** o que aquele usuário já podia ver |
| Isolamento entre carteiras de advogados | Só existe se o nosso código o impuser (D-36) | Existe no produto **e** no nosso código — defesa em profundidade |
| Conta de serviço dedicada (pergunta 66, R-20) | Depende de criar um usuário-robô e torcer | O mesmo, mas o usuário-robô pode ser **restringido por Espaço** |
| Verificação de assinatura de webhook | Segredo da aplicação | Segredo por webhook, devolvido na criação |

**Isso não dispensa a Regra 1.** O agente continua sem ser a fronteira, e o MCP continua verificando escopo antes de chamar. O que muda é que uma falha nossa deixa de ser a **única** coisa entre o agente e os dados — o R-26 fica menos afiado.

Uma ressalva honesta: a documentação do ClickUp **não publica uma lista de escopos por recurso** para o OAuth. O que ela garante é que "cada usuário só acessa o conteúdo disponível à sua conta". É herança de permissão, não escopo declarado — melhor que o Trello, mas não é o ideal.

### 4.2 Comparação recurso a recurso, pelos critérios do projeto

| Critério | Trello | ClickUp |
|---|---|---|
| Escopo de token por recurso | ❌ (R-16) | ✅ herda a permissão do usuário |
| OAuth 2.0 com escopos granulares documentados | ❌ anunciado em 2025, **não chegou** (D-37) | 🟡 OAuth por usuário funciona; **lista de escopos não é documentada** |
| Limite de vazão | 300 req/10s por chave; 100 req/10s por token | 100 req/min (Free, Unlimited, Business) · 1.000 (Business Plus) · 10.000 (Enterprise) — **mais apertado que o Trello nos planos baixos** |
| Webhook assinado | ✅ | ✅ segredo por webhook |
| Webhook identifica o autor da mudança | ✅ | ✅ `user.id` e `username` |
| Campos customizados | 🟡 limitado, e melhor nos planos pagos | ✅ gerenciador avançado a partir do Unlimited |
| Status personalizados por fluxo | ❌ (a lista é o status) | ✅ status próprios por Espaço/Lista — encaixa direto no ciclo de vida da demanda |
| Automação nativa | Butler — e ele **reage às nossas escritas** (pergunta 27) | Automations, com ação **"chamar webhook"**. Free: 5 regras / 100 execuções. Unlimited: 500 / 1.000. Business: ilimitadas / 5.000 |
| Documentos | ❌ | ✅ ClickUp Docs |
| Formulários de entrada | 🟡 via Power-Up | ✅ nativo |
| Importação do que já existe | — | ✅ importador oficial de Trello, com ressalvas (§4.3) |
| Superfície de API já mapeada por nós | ✅ 261 operações, 12 ferramentas curadas | ❌ **zero** — teria que ser refeito |

### 4.3 O custo escondido da migração

O importador oficial traz quadros, listas e cartões — mas:

- **Responsável não mapeado é responsável perdido.** Se a pessoa não existir no ClickUp na hora da importação, a atribuição some
- **Arquivo acima de 1 GB não vem**
- **Automação Butler não migra.** Toda regra teria que ser reescrita como Automation — o que, aliás, é uma oportunidade de finalmente inventariá-las (pergunta 27)
- **O nosso `mapeamento-trello.md` — 261 operações, 12 ferramentas curadas, 11 decisões — seria descartado**, e um mapeamento equivalente do ClickUp teria que ser feito do zero (R-31)

Esse último item é o custo real, e ele é nosso, não do escritório.

---

## 5. Recursos do ClickUp que seriam úteis a este projeto

Separando o que serve do que é vitrine:

| Recurso | Para que serviria aqui | Plano mínimo |
|---|---|---|
| **Status personalizados por Lista** | Ciclo de vida da demanda (`Recebida` → `Triada` → `Aguardando revisão` → `Aprovada` → `Respondida`) sem a gambiarra de usar lista como status | Free |
| **Automations com ação "chamar webhook"** | Aprovação humana virando evento no n8n, com identidade de quem aprovou | Free (5 regras) · Unlimited (500) |
| **Webhooks de API assinados** | Receber mudança de tarefa no n8n com verificação de origem | Free |
| **Campos customizados** | Guardar número CNJ, OAB do responsável, prazo indicado, custo consumido na consulta e o `requisicao_id` (D-75) | Unlimited, para o gerenciador avançado |
| **Espaços privados e permissão por Pasta/Lista** | Isolamento entre carteiras — a mitigação de R-16 descrita em §4.1 | Unlimited (permissão de convidado) · Enterprise para permissão em nível de Espaço |
| **Convidado somente-leitura, gratuito e ilimitado** | Cliente do escritório acompanhando o próprio caso, sem assento pago. **Atenção:** exige decisão de sigilo antes de qualquer uso real | Unlimited |
| **ClickUp Docs** | Modelos de peça, procedimento interno, base de conhecimento do agente | Free |
| **Formulários nativos** | Entrada estruturada de demanda, em vez de e-mail livre — reduz a exposição da Regra 4 (conteúdo externo é hostil) | Free |
| **MCP oficial** (`mcp.clickup.com`, OAuth, beta público, todos os planos) | **Ferramenta de desenvolvimento**, não caminho de produção — ver §5.1 | Free |
| **Nó nativo no n8n** (ClickUp e ClickUp Trigger, com token pessoal ou OAuth2) | Integração sem escrever cliente HTTP à mão | — |
| ClickUp Brain (IA) | ❌ **Não usar.** US$ 9/usuário/mês para uma IA que não passa pelo nosso Policy Gate, não respeita o motor de custo e não gera a nossa auditoria | — |

### 5.1 Sobre o MCP oficial do ClickUp — cuidado

Existe um servidor MCP oficial e hospedado pelo próprio ClickUp, em beta público, disponível em todos os planos, autenticado **só por OAuth**, no qual o agente age com as permissões do usuário conectado.

É tentador. E seria uma violação direta da **Regra 1** usá-lo como caminho do agente em produção, porque:

- Ele expõe **a superfície da API que o usuário alcança**, sem o cardápio filtrado por papel que a D-03 exige
- Não passa pelo Policy Gate, não emite a nossa auditoria e não conhece o `requisicao_id`
- Está em **beta**, hospedado por terceiro, com contrato de ferramentas que pode mudar sem aviso

**Uso legítimo:** o desenvolvedor explorando a base durante a construção, e a confirmação de que a estrutura de dados do ClickUp é acessível. **Uso ilegítimo:** qualquer agente do escritório falando com ele diretamente.

---

## 6. Custo — a conta feita por inteiro

### 6.1 Preços de tabela (agosto de 2026)

Conversão a **US$ 1 = R$ 5,19** (cotação de 20/08/2026), acrescida de **IOF de 3,5%** *(imposto sobre compra em moeda estrangeira no cartão)*, o que dá um fator prático de **R$ 5,37 por dólar**. Preço de tabela, em plano anual.

| Produto / plano | US$/usuário/mês | ≈ R$/usuário/mês |
|---|---:|---:|
| ClickUp Free | 0 | 0 |
| **ClickUp Unlimited** | 7 | **≈ 37,60** |
| **ClickUp Business** | 12 | **≈ 64,50** |
| ClickUp Business Plus | 19 | ≈ 102,10 |
| ClickUp Brain (adicional) | +9 | ≈ +48,30 |
| Trello Standard | 5 | ≈ 26,90 |
| Trello Premium | 10 | ≈ 53,70 |
| **Google Workspace Business Starter** | — | **32,72** (anunciado em reais na página brasileira) |
| Google Workspace Business Standard | — | 81,80 |

> **Detalhe que costuma passar batido:** o Workspace é anunciado em reais no Brasil; o ClickUp e o Trello, em dólar. A conta do ClickUp e do Trello **varia com o câmbio, e a do Workspace não** — uma alta de 15% no dólar é aumento de 15% na mensalidade (R-32).

### 6.2 Cenários, para uma equipe hipotética de 12 pessoas

O tamanho real da equipe é pergunta aberta; 12 é a hipótese usada desde a Nota Técnica 01.

| Cenário | Composição | Custo mensal | Identidade individual? |
|---|---|---:|:---:|
| **0 — Hoje** | 1 licença Workspace compartilhada + Trello Standard × 12 | **≈ R$ 356** | ❌ |
| **1 — Caminho A (correção do R-11), sem ClickUp** | Workspace × 12 + Trello Standard × 12 | **≈ R$ 715** | ✅ |
| **2 — Caminho A + ClickUp Unlimited no lugar do Trello** | Workspace × 12 + ClickUp Unlimited × 12 | **≈ R$ 844** | ✅ |
| **3 — Caminho A + ClickUp Business** | Workspace × 12 + ClickUp Business × 12 | **≈ R$ 1.167** | ✅ |
| **4 — Híbrido: Workspace só para quem precisa de e-mail** | Workspace × 5 (advogados) + ClickUp Unlimited × 12 | **≈ R$ 615** | ✅ na plataforma; ❌ no e-mail dos colaboradores |
| **5 — ClickUp Free como piloto** | Workspace atual + ClickUp Free × 12, Trello mantido | **≈ R$ 33 a 356** | ✅ na plataforma |

### 6.3 O que a tabela diz

1. **ClickUp não reduz custo.** Comparando os cenários 1 e 2 — que é a comparação honesta, porque ambos corrigem o R-11 — trocar Trello por ClickUp Unlimited custa **≈ R$ 129 a mais por mês**, cerca de R$ 1.550 por ano. O plano Business custa **≈ R$ 452 a mais por mês**
2. **A economia do cenário 4 é falsa.** Ele parece o mais barato porque deixa sete pessoas sem e-mail no domínio do escritório — o que não é economia, é o problema de identidade mudando de lugar
3. **O cenário 5 é o que eu levaria ao escritório primeiro.** O plano Free tem membros ilimitados e dá para provar o fluxo inteiro — tarefa, status, automação, webhook, identidade individual — por **R$ 0,00**. Os limites que o inviabilizam em produção (60 MB de armazenamento, 100 execuções de automação por mês, 1.000 mensagens de chat) não atrapalham um piloto
4. **O que justifica pagar não é preço, é o R-16.** Se o escritório entender que o isolamento entre carteiras precisa existir também no produto, e não só no nosso código, os R$ 129/mês são o preço dessa garantia. Se não entender, não há argumento financeiro que sustente a troca

---

## 7. Viabilidade técnica — resumo

| Requisito do projeto | ClickUp atende? | Observação |
|---|:---:|---|
| Identidade individual verificável (N1, R-11) | ✅ | Inclusive no plano gratuito |
| Privilégio por papel (N2) | 🟡 | Papéis padrão em todos os planos; **papéis customizados só em Business Plus/Enterprise** |
| Aprovação de conteúdo integral, com edição (N3, N4) | ✅ | Na tarefa, não no chat (§3.3) |
| Notificação urgente (N5) | 🟡 | Push do aplicativo; para intimação fora do horário, manter Telegram |
| Trilha auditável (N7) | ✅ | Histórico da tarefa + webhook identificando o autor. **A auditoria de verdade continua no nosso banco** (D-77) |
| Sigilo profissional (N8) | 🟡 | SOC 2, DPA com menção expressa à **LGPD, arts. 6º e 46**, sub-processadores publicados. Dado hospedado nos EUA; **residência local só no Enterprise, sob negociação** |
| Encerrar acesso na saída (N9) | ✅ | Desativação central pelo administrador |
| Integração com n8n | ✅ | Nós nativos ClickUp e ClickUp Trigger, com token pessoal ou OAuth2 |
| Não conter regra de negócio no MCP (Regra 3) | ✅ | Um MCP ClickUp genérico é tão viável quanto o do Trello |
| Custo é requisito funcional (Regra 6) | ✅ | O ClickUp não cobra por chamada — o recurso escasso aqui é **vazão**, e ela é **mais apertada que a do Trello** nos planos até Business |

---

## 8. Recomendação

1. **Separar as três perguntas ao falar com o escritório.** "Trocar o Google pelo ClickUp" não existe como proposta viável — o e-mail continua no Google. O que existe é "trocar o Trello pelo ClickUp e usar o chat dele como mural"
2. **Não propor a troca como economia.** Ela custa mais. Propor como **redução de risco**: o R-16 deixa de ser estrutural
3. **Não deixar a decisão bloquear a fundação.** Os marcos 1 a 5 da Spec — chassi, auditoria, motor de custo, cache — são idênticos nos dois mundos. O que muda é qual MCP se escreve depois, e essa escolha pode esperar
4. **Se houver interesse, começar pelo plano Free**, com um fluxo real e pequeno, antes de qualquer contrato
5. **Manter a recomendação da Nota Técnica 01 intacta:** licenças individuais do Workspace (Caminho A) continuam sendo a correção certa do R-11. O ClickUp não substitui isso — no máximo adia
6. **Congelar a decisão de migrar** até o escritório responder a **D-09**: o Trello é gestão de casos ou quadro de tarefas? Se for quadro de tarefas simples, a migração é esforço grande para ganho pequeno. Se for gestão de casos, com dado de cliente nos cartões, o R-16 pesa muito mais e a migração se justifica

---

## 9. Perguntas que esta nota abre para o escritório

| # | Pergunta | Por que trava algo |
|---|---|---|
| P-08 | Quantas pessoas, de fato, precisariam de assento? | Toda a conta de custo depende disso; 12 é hipótese nossa |
| P-09 | O Trello guarda **dado de cliente** nos cartões, ou só tarefas internas? | Define se o R-16 é grave ou tolerável — e, portanto, se a migração se justifica |
| P-10 | Há disposição para um **piloto sem contrato** (ClickUp Free), com um fluxo real? | É o caminho de menor risco para decidir com informação em vez de opinião |
| P-11 | O escritório aceita que dado de cliente fique hospedado **fora do Brasil**? | Vale para ClickUp e para o Workspace atual. Residência local no ClickUp só no Enterprise |
| P-12 | Existe intenção de dar acesso ao **cliente final** para acompanhar o caso? | O convidado somente-leitura gratuito do ClickUp é atraente, mas exige decisão de sigilo antes |

---

## 10. Decisões propostas

| ID | Decisão | Recomendação |
|---|---|---|
| **D-79** | **O ClickUp não substitui o Google Workspace.** Ele não hospeda e-mail em domínio próprio nem emite identidade. A recomendação de licenças individuais (D-21, D-67) permanece inalterada | Adotar |
| **D-80** | Avaliar o ClickUp **apenas** nos eixos "Trello" e "canal interno". A troca se justifica por **redução do R-16**, não por economia — ela custa mais | Adotar |
| **D-81** | Ainda que o ClickUp herde a permissão do usuário no token OAuth, **a Regra 1 continua valendo**: o MCP verifica escopo antes de chamar. A permissão do produto é defesa em profundidade, nunca substituto da nossa | Adotar |
| **D-82** | **Não usar o MCP oficial do ClickUp como caminho do agente em produção** — sem cardápio por papel, sem Policy Gate, sem a nossa auditoria, e em beta. Uso permitido: ferramenta de desenvolvimento | Adotar |
| **D-83** | **A aprovação humana vive na tarefa, não na mensagem** — mudança de status ou de campo, capturada por webhook assinado que identifica o autor. Vale para ClickUp e para Trello, e independe da migração | Adotar |
| **D-84** | **Não construir sobre a API de Chat do ClickUp** enquanto ela estiver marcada como experimental. O chat serve como mural; a ação vai para a tarefa e o aviso urgente segue no Telegram (D-18) | Adotar |
| **D-85** | A decisão de migrar Trello → ClickUp fica **congelada até D-09 ser respondida** e, se houver interesse, precedida de piloto no plano gratuito. A fundação (marcos 1 a 5) é construída sem depender dela | Adotar |

---

## 11. Riscos novos

| ID | Risco | Gravidade | Tratamento |
|---|---|---|---|
| **R-29** | A API de Chat do ClickUp é **experimental e sujeita a mudança a qualquer momento** — uma alteração silenciosa quebraria o aviso de prazo | Moderado, se usada como canal crítico | Não usar como canal crítico (D-84); Telegram e painel continuam sendo o caminho da notificação urgente |
| **R-30** | **Não há identidade de aplicativo no Chat.** A mensagem sai como o dono do token — a automação se confunde com uma pessoa, e evitar isso exige um assento pago dedicado ao robô | Moderado — confusão de autoria e custo recorrente | Assento dedicado e identificado como robô, ou publicação via Automation do próprio ClickUp |
| **R-31** | Migrar descarta o `mapeamento-trello.md` (261 operações, 12 ferramentas, D-36 a D-46) e reinicia a curva; o importador não preserva responsável não mapeado, arquivo acima de 1 GB nem regra do Butler | Moderado — custo nosso, de retrabalho | Congelar a decisão até D-09 (D-85); se migrar, mapear o ClickUp antes de escrever qualquer ferramenta |
| **R-32** | Concentrar tarefa, documento, chat e fluxo em **um único fornecedor estrangeiro cobrado em dólar** aumenta a dependência e expõe a mensalidade ao câmbio | Moderado — financeiro e de continuidade | Manter o acervo documental fora do ClickUp; exportação periódica; contrato anual para travar preço |

---

## Fontes consultadas

- [ClickUp — Pricing and Plans](https://clickup.com/pricing)
- [ClickUp Developer — Authentication](https://developer.clickup.com/docs/authentication)
- [ClickUp Developer — Rate Limits](https://developer.clickup.com/docs/rate-limits)
- [ClickUp Developer — Webhooks](https://developer.clickup.com/docs/webhooks)
- [ClickUp Developer — Chat](https://developer.clickup.com/docs/chat)
- [ClickUp Developer — Send a message (Chat)](https://developer.clickup.com/reference/createchatmessage)
- [ClickUp Developer — Create a Channel](https://developer.clickup.com/reference/createchatchannel)
- [ClickUp Developer — MCP Server Setup Instructions](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server-1)
- [ClickUp Help — What is ClickUp MCP](https://help.clickup.com/hc/en-us/articles/33335772678423-What-is-ClickUp-MCP)
- [ClickUp Help — Use Email in ClickUp](https://help.clickup.com/hc/en-us/articles/6303747270807-Use-Email-in-ClickUp)
- [ClickUp Help — Import from Trello](https://help.clickup.com/hc/en-us/articles/6311084821015-Import-from-Trello)
- [ClickUp Help — Intro to user roles](https://help.clickup.com/hc/en-us/articles/6310033667223-Intro-to-user-roles)
- [ClickUp Help — Manage Custom Role permissions](https://help.clickup.com/hc/en-us/articles/6309195687959-Manage-Custom-Role-permissions)
- [ClickUp Help — Pricing per user role and plan](https://help.clickup.com/hc/en-us/articles/6303244318999-Pricing-per-user-role-and-plan)
- [ClickUp Help — Integrate ClickUp using Automation webhooks](https://help.clickup.com/hc/en-us/articles/35313844961943-Integrate-ClickUp-using-Automation-webhooks)
- [ClickUp Help — Data hosting](https://help.clickup.com/hc/en-us/articles/15999383444247-Data-hosting)
- [ClickUp Help — Compliance and GDPR](https://help.clickup.com/hc/en-us/articles/6327673904663-Compliance-and-General-Protection-Data-Regulation-GDPR)
- [ClickUp — Data Protection Addendum](https://clickup.com/terms/dpa)
- [n8n Docs — ClickUp node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.clickup)
- [n8n Docs — ClickUp Trigger node](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.clickuptrigger/)
- [n8n Docs — ClickUp credentials](https://docs.n8n.io/integrations/builtin/credentials/clickup)
- [Google Workspace — Preços (pt-BR)](https://workspace.google.com/pricing?hl=pt)
- [Trello — Pricing](https://trello.com/pricing)
