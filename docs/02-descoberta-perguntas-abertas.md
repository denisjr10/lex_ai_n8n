# Descoberta — Perguntas Abertas

| Campo | Valor |
|---|---|
| Status | **Parcialmente respondido** — a seção A1 fechou em 05/09 (só a 5 voltou como pedido de esclarecimento); antes disso, cinco perguntas que travavam o PRD voltaram em 27/08 |
| Versão | 0.3 |
| Data | 2026-09-05 (criado em 2026-08-17) |
| Finalidade | Levantar as informações que faltam para fechar o PRD. Dividido por destinatário. |

> **Como usar.** A Parte A é para o escritório (pode ser enviada como está). A Parte B é técnica, para quem administra os sistemas. A Parte C é sua, sobre contratos e infraestrutura. Nem toda pergunta bloqueia o início — as marcadas com 🚧 bloqueiam.

---

## Parte A — Para o escritório (negócio e operação)

### A1. Estrutura e pessoas

> **Respondida por inteiro em 05/09**, exceto a pergunta 5, que voltou como pedido de esclarecimento. Gerou **D-192 a D-194** e **R-59**.

1. ✅ **RESPONDIDA em 05/09 — sete pessoas, duas advogadas e cinco colaboradoras.** Não há estagiário com acesso distinto; a distinção que existe é a de papel.

    | Papel | Pessoas |
    |---|---|
    | Advogada | Malu Souza · Ana Beatriz |
    | Colaboradora | Andressa Jamile · Estefanny Passos · Bia Nunes · Paula Pinheiro · Mota |

    *(O número dimensiona coisas concretas: são **sete contas individuais** de Telegram a cadastrar no Caminho B (D-147), sete linhas na tabela de identidade, e é sobre sete pessoas — não sobre uma equipe grande — que o rito de escalada da pergunta 20 precisa fazer sentido. Escritório desse tamanho **não tem plantão**: se as duas advogadas estiverem em audiência, o alerta não tem para quem escalar. Ver R-52.)*
2. ✅ **RESPONDIDA em 05/09 — não há hierarquia relevante.** Não existe sócio, associado nem coordenador de área como camada de decisão. **Isso deixa a pergunta 20b sem resposta possível na forma em que foi escrita:** o "N2" do rito de prazo previa escalar para *a sócia responsável*, e não há uma. A escalada terminal do escritório são as duas advogadas — ver D-193.
3. ✅ **RESPONDIDA em 05/09 — sem divisão por área, e sem segmentação de acesso.** *"Atua em todas as áreas, sem divisão específica ou segmentação, nem entre os colaboradores; todos cuidam de todos os processos de todas as áreas."* Não haverá escopo por matéria na matriz de privilégios: o eixo do escopo é **papel** (advogado/colaborador) e **escritório** (isolamento entre inquilinos), nunca área de atuação.
4. ✅ **RESPONDIDA em 27/08 — base inteira.** *"Os advogados têm acesso à base inteira, pois eles se ajudam nos processos um do outro."* Decisão D-07 resolvida; ver D-146 e PRD §3.1. Os três desdobramentos foram respondidos em 05/09:
    - **4a.** ✅ **RESPONDIDA em 05/09 — o colaborador também vê a base inteira.** *"Os colaboradores têm acesso completo também, pois eles fazem movimentação em nome dos advogados e com o acesso e credenciais dos advogados, mas sempre sob observação, orientação e acompanhamento dos advogados."* O usuário registrou que **essa é decisão interna do escritório, sobre a qual não tem ingerência**, e que **a individualização de perfis fica mantida para todos** — advogados e colaboradores — para que toda ação seja registrada e auditável, como o projeto prevê. Ver **D-192**; o padrão restritivo provisório cai. ⚠️ A frase *"com as credenciais dos advogados"* descreve a prática atual **nos sistemas externos** (tribunal, PJe, e-mail) e é justamente o que a plataforma não vai reproduzir — ver **R-59**.
    - **4b.** ✅ **RESPONDIDA em 05/09 — cerca de 313 processos ativos.** Aproximadamente **289** da advogada Malu Souza e **24** da advogada Ana Beatriz. A ordem de grandeza é de **centenas, não de milhares** — ver D-193 e o efeito sobre P-07.
    - **4c.** ✅ **RESPONDIDA em 05/09 — não existe cliente de alto volume.** *"Não há nenhum cliente nesse nível."* Nenhuma parte concentra 200 processos ou mais; o caso que faria a conta explodir não existe nesta carteira.
5. ✅ **RESPONDIDA em 05/09 — Malu Souza.** A responsavel interna pelo projeto e a advogada **Malu Souza** — quem da o "de acordo" nos numeros propostos, decide quando houver conflito entre pedidos do escritorio, e responde as perguntas desta descoberta. Ver **D-200**. *(A pergunta voltara como pedido de esclarecimento; a explicacao do papel esta preservada abaixo, porque ela distingue tres coisas que se confundem.)* O papel e de **negocio**, nao tecnico: quem o exerce nao precisa entender de n8n nem de API, precisa ter autoridade para dizer "e assim que o escritorio trabalha". Pode acumular com o de **administrador da plataforma** (quem cadastra e desliga contas), mas os dois sao distintos: o administrador executa, o responsavel decide. Diferente ainda de "gerente do escritorio", que nao existe ali (pergunta 2).
6. ✅ **RESPONDIDA em 05/09 — todos aprovam, sob supervisão de advogado.** *"Todos os advogados e colaboradores (mas sempre sob observação, orientação e acompanhamento dos advogados)."* Não varia por assunto nem por valor da causa. ⚠️ **Isso encosta na Regra Inegociável 2** — *ato com efeito jurídico ou de prazo exige aprovação de advogado identificado*. "Sob observação" funciona numa sala com sete pessoas; num botão de aprovação, ou o sistema exige advogado ou não exige, e não há meio-termo. A proposta está em **D-194**, e precisa do "de acordo" do escritório.

### A2. Clientes e atendimento

7. Volume aproximado de clientes ativos e de mensagens/dia no WhatsApp.
8. Qual o número de WhatsApp usado hoje? É um número único do escritório ou cada pessoa usa o próprio?
9. 🚧 O número já está em alguma API oficial/BSP, ou é WhatsApp Business comum no celular? (Migração tem impacto no cronograma.)
10. Quais são as **cinco perguntas mais frequentes** dos clientes? (Definem o escopo inicial do agente.)
11. O que o cliente **jamais** deve receber por resposta automática?
12. Há horário de atendimento? O que acontece fora dele?
13. O cliente pode enviar documentos por WhatsApp? Qual o destino deles hoje?
14. Existe cadastro de clientes com CPF/CNPJ e telefone confiável? Em qual sistema?

### A3. E-mail

15. 🚧 Quantas caixas de e-mail devem ser monitoradas, e quais? (Ex.: `contato@`, caixa pessoal de sócio, caixa de intimações.)
16. ✅ **RESPONDIDA — Google Workspace Business Starter, com uma única conta compartilhada por toda a equipe.** Ver R-11 e Nota Técnica 01 §1.6. Desdobramentos nas perguntas 16a a 16c.
    - **16a.** 🚧 Quantas pessoas usam essa conta hoje? *(Define o custo de migrar para licenças individuais. **Continua sem resposta** — e é o número que o escritório vai precisar quando reavaliar o Caminho A.)*
    - **16b.** ✅ **RESPONDIDA em 27/08 — não, por ora.** O escritório optou por **não** contratar licenças individuais do Workspace agora, para evitar gasto no início da implementação.
    - **16c.** ✅ **RESPONDIDA em 27/08 — sim, com ciência.** A identidade individual do projeto virá do **Telegram + painel** (Caminho B): uma conta por colaborador e por advogado, todas identificadas e cadastradas pelo escritório. *"Foi informado acerca das implicações disso, e o escritório aceitou os riscos."* Ver **D-147**; **R-11 permanece aberto para e-mail e Drive**, e **R-47** registra o risco novo (identidade ancorada em número de telefone, sem desligamento central).
17. Volume aproximado de e-mails/dia e proporção de spam.
18. Quais tipos de e-mail chegam com maior frequência? Quais são os críticos?
19. Como intimações e comunicações de tribunal chegam hoje — e-mail, sistema do tribunal, ambos?
20. Existe rotina atual de conferência de prazos? Quem faz e como? *(Sabemos, desde 27/08, que **colaboradores também conferem** — o que muda a quem o alerta é entregue. Falta o resto do desenho, nas quatro perguntas abaixo.)*
    - **20a.** 🚧 **Quanto tempo o escritório aceita que um alerta de prazo fique sem ninguém confirmar que leu, antes de o sistema chamar todos os advogados?** *(Nossa proposta: 2 horas úteis. É o "N1" do rito descrito no PRD §5.2.1.)*
    - **20b.** 🚧 **E antes de escalar para a sócia responsável?** *(Nossa proposta: 4 horas úteis. É o "N2". E quem é essa pessoa, nominalmente?)*
    - **20c.** 🚧 **Qual é o horário útil considerado?** *(O relógio da escalada só corre nele — publicação que chega às 18h de sexta começa a contar na segunda. Sem isso, o sistema acordaria a sócia às 3h da manhã.)*
    - **20d.** 🚧 **Quanto tempo um pedido de aprovação pode ficar parado antes de vencer e precisar ser refeito?** *(Nossa proposta: 4 horas úteis para mensagem ao cliente, 2 horas úteis para ato com efeito de prazo. Aprovar um texto oito horas depois é autorizar a descrição de um mundo que já mudou — ver PRD §6.2.5.)*
21. Que tipos de anexo aparecem — PDF pesquisável, PDF digitalizado, imagem, áudio, planilha, .docx?
22. Existe modelo/padrão de resposta já usado pelo escritório?

### A4. Trello

23. ✅ **RESPONDIDA em 27/08 — quadro de trabalho.** *"O Trello é quadro de trabalho."* A fonte da verdade da demanda é a **base interna** da plataforma; o Trello é a vitrine onde a equipe trabalha. Decisão D-09 resolvida; ver D-152 e PRD §4.3.
24. Quantos quadros, e qual a lógica deles — por área, por cliente, por fase, por pessoa?
25. Qual o fluxo típico de um card, da criação ao encerramento?
26. ⚙️ **REATRIBUÍDA em 27/08 — vira levantamento técnico nosso.** Quais campos personalizados (Custom Fields) estão em uso? *O escritório informou que ninguém sabe responder. Será levantado por nós com a API, assim que a chave do Trello chegar.*
27. ⚙️ **REATRIBUÍDA em 27/08 — vira levantamento técnico nosso.** Há Power-Ups ou automações (Butler) ativos? Quais? *Idem. **Este é o mais crítico dos dois:** o Butler reage às nossas escritas, e uma automação desconhecida pode mover, arquivar ou notificar em cima do que a plataforma criar. Precisa ser inventariado **antes da primeira gravação no Trello**, não depois.*
28. Todos usam o Trello de fato, ou ele coexiste com planilhas e grupos de WhatsApp?
29. Plano contratado (Standard, Premium, Enterprise) e número de licenças.

### A5. Demais plataformas

30. 🚧 Existe software de gestão jurídica (Astrea, Projuris, ADVBOX, Legal One, SAJ ADV, outro)?
31. Onde ficam os documentos hoje — Google Drive, OneDrive, Dropbox, servidor local?
32. Há sistema financeiro/de honorários? Ele precisa ser integrado?
33. Há assinatura de outra ferramenta de consulta processual além do Escavador (Judit, Jusbrasil, Digesto, Codilo)?
34. Usam alguma ferramenta de IA hoje? Qual, e para quê?
35. Existe base de conhecimento interna — modelos de peça, teses, procedimentos? Em que formato?

### A6. Conformidade

36. Existe contrato de honorários padrão? Ele menciona uso de tecnologia ou de IA?
37. Existe DPO ou responsável por LGPD designado?
38. Há política interna de segurança da informação ou de uso de IA?
39. Existe restrição do escritório quanto a dados saírem do país?
40. Que assuntos são especialmente sensíveis (família, criminal, menores) e demandam tratamento mais restritivo?

---

## Parte B — Para quem administra os sistemas (técnico)

> **Respondida em 05/09.** As perguntas 41 a 50 foram medidas pela API da instância, e o resultado inteiro está em **[`16-levantamento-instancia-n8n.md`](16-levantamento-instancia-n8n.md)** — aqui ficam só as respostas. A medição achou duas coisas que ninguém perguntou: **R-60** e **R-61**.

### B1. n8n

41. ✅ **RESPONDIDA em 05/09 — `v1.123.18`, self-hosted.** Sobre Node.js v22.21.0, no ar há ~43 dias sem reinício. A versão sai do endpoint `/metrics`, que responde sem autenticação — ver R-60.
42. ✅ **RESPONDIDA em 05/09 — queue mode, confirmado por medição.** As métricas de fila (`n8n_queue_job_enqueued_total`) só existem em queue mode. **O número de workers não sai por aí** — worker publica métrica no processo dele, e o que respondeu foi o *leader*. Fica valendo **um worker**, como informação declarada. *(Importa para E2: com um worker, um lote de publicações do diário processa uma de cada vez, e o alerta de prazo entra na fila atrás do que já estiver rodando dos outros clientes.)*
43. ✅ **RESPONDIDA — PostgreSQL.** Não sai pela API; declarado pelo usuário.
44. ✅ **RESPONDIDA em 05/09 — todos disponíveis, e já em uso real na instância.** `AI Agent`, `MCP Server Trigger`, `Chat Trigger`, `Tool Workflow` (21 usos), `lmChatOpenAi`, `googleGemini`, `memoryBufferWindow`. A 1.123 é folgadamente posterior ao mínimo de qualquer um. **Nenhum risco de versão para o desenho da plataforma.**
45. ✅ **RESPONDIDA em 05/09 — 194 workflows, 9 ativos.** E o número não é a resposta importante: **cinco dos nove ativos são de outros clientes do prestador** (Font Liberty, Nexus AI, Hermes MCP). A instância é compartilhada — ver **R-60** e a tabela em `16-levantamento...` §2. Nenhum deles é afetado pelo que este projeto fizer, desde que ninguém mexa neles; o inverso não é verdade, e é isso que R-61 trata.
46. ✅ **RESPONDIDA em 05/09 — não há versionamento nenhum.** Não há *source control* (é recurso Enterprise, e `/projects` responde 403), nem exportação versionada. **Os 194 fluxos existem em um lugar só: o banco da instância.** Um fluxo salvo por cima não tem como voltar.

    **Proposta, e é barata:** exportar os fluxos deste projeto pela API para JSON no repositório, a cada mudança — que é exatamente o que `demo/montar-fluxo-a.mjs` e `montar-fluxo-b.mjs` já fazem ao contrário (o fluxo **nasce** do código versionado e é publicado na instância). **A frente LEX já é versionada por construção.** O que falta é o mesmo para os fluxos que não nasceram assim, e isso é decisão sua, não do escritório.
47. ✅ **RESPONDIDA em 05/09 — oito gatilhos HTTP em fluxos ativos, e a proteção não está onde o n8n a colocaria.** Sete estão com `authentication: none` **no nó**; um usa `bearerAuth`. Mas nos três fluxos deste projeto a conferência de origem está **no código do fluxo**, logo depois do webhook — desenho fechado na revisão externa de 31/08 (D-185), reverificado em 05/09 e funcionando. Nos cinco fluxos dos outros clientes **não sabemos**, e não é nosso lugar auditá-los. Tabela completa em `16-levantamento...` §3.
48. ⚠️ **RESPONDIDA PARCIALMENTE em 05/09 — a API do n8n não lista credenciais.** Ela expõe o *esquema* de um tipo de credencial, nunca as credenciais em si (o que é correto). O que dá para saber é o que os fluxos ativos **referenciam**: 10 tipos, 25 credenciais distintas — Supabase (6), Gemini (7), Redis (4), OpenAI (2), Google Sheets, RabbitMQ, Telegram, e **uma credencial da API do próprio n8n** ("Conexão Geral"), usada por dois fluxos de produção de outros clientes. **Essa última é a que pesa** — ver **R-61**. Para a lista completa, só pelo painel.
49. ✅ **RESPONDIDA em 05/09 — não existe, e a explicação estava faltando.** Ambiente de homologação **não é uma segunda assinatura nem uma pasta**: é uma **segunda instância do n8n**, com banco próprio e credenciais próprias (de teste, nunca as de produção), onde a mudança é ensaiada antes de tocar o que está no ar.

    Por que importa aqui: hoje, mexer num fluxo ativo mexe **no fluxo ativo**, com clientes reais do outro lado, e sem versionamento (pergunta 46) não há como voltar. Com 194 fluxos e 9 no ar, o custo de um salvamento errado é imediato.

    **Não é bloqueador para o prazo de 10–15/09, e não proponho montar agora.** A frente LEX já contorna o problema por outro caminho — os fluxos nascem de código versionado e são publicados por script, então o "ensaio" acontece no repositório. Fica como recomendação de operação, para depois da entrega.
50. 🟡 **PARCIAL — o que a aplicação vê foi medido; o host não.** 333 MB residentes, ~0,8% de um núcleo em média nos 43 dias. CPU total, memória total, disco e limites de execução dependem do acesso à infra. Combinado: fica para depois.

### B2. Infraestrutura

> **Sobre o acesso que você ofereceu.** Sim, tem como — e a forma segura **não é** me dar credencial de administrador. Ver a resposta no chat de 05/09: o caminho é você rodar meia dúzia de comandos de leitura e me mandar a saída. Cinco minutos, nada exposto, e responde 51 a 57 de uma vez. Até lá as sete continuam abertas.

51. 🔴 Onde a infra está hospedada — provedor e região?
52. 🔴 Há PostgreSQL disponível para uso da aplicação, ou precisa ser provisionado? *(O n8n já usa um — pergunta 43. A pergunta é se a plataforma compartilha esse ou ganha o dela, e a resposta certa é **o dela**: banco de aplicação com regra de linha e auditoria não divide espaço com o banco operacional de uma ferramenta de terceiros.)*
53. 🔴 Como os servidores MCP serão implantados — mesmo host do n8n, containers separados?
54. 🔴 Há gerenciador de segredos, ou os segredos vivem no n8n?
55. 🔴 Política de backup atual: o quê, com que frequência, e já foi testada uma restauração? *(Com 194 fluxos sem versionamento — pergunta 46 —, esta virou a pergunta mais importante da seção.)*
56. 🔴 Monitoramento e alertas existentes? *(Sabemos que `/metrics` está de pé e **aberto** — R-60. Falta saber se alguém o coleta, ou se ele só está exposto.)*
57. 🔴 Quem tem acesso administrativo à infra?

---

## Parte C — Contratos e credenciais (para você)

> **Respondida em 05/09.** O que ficou de fora está marcado. **A leitura de conjunto está no chat e vale mais que qualquer item isolado: o prazo de 10–15/09 não cabe com E4 (WhatsApp) dentro — ver D-195.**

### C1. Escavador

58. 🟡 **RESPONDIDA em 05/09 — nada contratado ainda; a contratação é terça-feira (08/09).** A cota de teste **expirou em 01/09** e os R$ 44,00 restantes evaporaram (não viram crédito). ⚠️ **Isso é o caminho crítico de E1 e E2:** sem saldo, nenhuma consulta processual roda, e a única coisa que continua chegando de graça é o callback da assinatura `2813617` — que **renova em 26/09** e precisa de decisão antes disso (D-182).
59. ✅ **RESPONDIDA em 05/09 — já resolvida, e há mais de um mês.** A pergunta nasceu quando a rede do ambiente bloqueava saída para fora (R-01) e eu não conseguia abrir a documentação do fornecedor: a saída era pedir o arquivo de especificação — o **OpenAPI/Swagger**, que é o documento que descreve cada rota da API, o que ela recebe e o que devolve — para guardar no repositório e ler localmente.

    **Não precisa mais.** A rede foi liberada, os dois mapeamentos foram feitos e estão em [`mapeamento-escavador.md`](mapeamento-escavador.md), e a fonte primária (o SDK oficial em Python) é clonada quando necessário. **Nada a providenciar da sua parte.**
60. ✅ **RESPONDIDA pelos registros do projeto — não há sandbox; toda chamada consome crédito real.** Foi assim que os R$ 6,00 saíram em 21 requisições. **Mas o custo varia por rota, e existem rotas gratuitas** — as de movimentação, origem, status e criação de vigilância, além das entregas de callback, vieram todas com débito zero (D-108). Gratuito se confirma pelo cabeçalho medido, nunca por suposição.
61. 🟡 **PARCIAL — o saldo é conhecido, o consumo médio não.** Saldo: **R$ 0,00, cota expirada**. Consumo medido: R$ 6,00 em 21 requisições ao longo de agosto, e a distribuição está em [`06-orcamento-de-chamadas-escavador.md`](06-orcamento-de-chamadas-escavador.md) §5. **Consumo médio em regime não existe ainda** — o projeto nunca operou em produção.
62. ✅ **RESPONDIDA pelos registros — sim, e é decisão registrada.** A v1 é usada para o que a v2 não cobre; o recorte está em `mapeamento-escavador.md`.
63. ✅ **RESPONDIDA pelos registros — não.** O módulo de autos com certificado digital não está contratado, e a demo deixou de depender dele: os 8 processos vieram dos **autos em PDF** do próprio escritório, anonimizados, sem gastar crédito.
64. ✅ **RESPONDIDA pelos registros — sim, e é a coisa mais viva do projeto.** Há **uma assinatura ativa, `2813617`**, vigilância de diário, apontando para `callback.criativeia.com.br`. Ela entregou **37 eventos e 34 publicações** entre 27/08 e 04/09, ~6 por dia útil, **26 delas intimação**, e **13 chegaram depois de a cota expirar** — callback não depende de saldo. ⚠️ **Renova em 26/09**, e a renovação é o que custa (D-182).

### C2. Trello

65. 🟡 **RESPONDIDA em 05/09 — ainda não existe; será providenciada na conta do escritório.** 🚧 **Isso trava as perguntas 26 e 27** (campos personalizados e automações Butler), que foram reatribuídas a nós em 27/08 e dependem da chave. **O Butler é o mais urgente dos dois:** uma automação desconhecida pode mover, arquivar ou notificar em cima do que a plataforma criar, e precisa ser inventariada **antes da primeira gravação no Trello**, não depois.
66. ✅ **RESPONDIDA em 05/09 — e a pergunta estava mal formulada.** "Conta de serviço" no Trello **não existe como recurso**: o Trello não tem contas de robô. O que existe é uma **conta de pessoa comum, criada para ser usada só pela automação** — com e-mail próprio do escritório (`automacao@`, `plataforma@`), convidada para os quadros, e cuja chave de API é a que a plataforma usa.

    **Por que não usar a conta da advogada chefe**, que é o que você descreveu: (1) toda ação da plataforma apareceria no quadro como se tivesse sido feita **por ela**, e a auditoria que o projeto inteiro sustenta vira ficção dentro do Trello; (2) a chave de API dela alcança **tudo** o que ela alcança, inclusive quadro pessoal fora do escritório; (3) se ela trocar a senha, revogar o token ou sair, a plataforma para — e ninguém liga uma coisa à outra.

    **Recomendação:** criar essa conta antes de gerar a chave. Custa um e-mail e uma licença, e evita os três problemas de uma vez. Ver **D-196**.

### C3. WhatsApp

67. ✅ **RESPONDIDA em 05/09 — não existe conta ainda.**
68. 🟡 **RESPONDIDA em 05/09 com preferência pela Meta, e a recomendação é outra — ver D-197.** Direto pela Meta é mais barato por mensagem e não tem intermediário; **o problema é o calendário.** Ir direto exige Meta Business Manager, verificação de negócio (documento do CNPJ, e o tempo é da Meta, não nosso), número dedicado que **não pode estar em uso no WhatsApp comum**, e aprovação de cada template. Semanas, não dias.

    Um BSP (*Business Solution Provider* — revendedor homologado pela Meta) já chega verificado: sobe número e template no mesmo dia, e sai mais caro por mensagem. **Com prazo de 10–15/09, "mais caro por mensagem" é irrelevante e "semanas" é fatal.**
69. ✅ **RESPONDIDA em 05/09 — nenhum template aprovado.** ⚠️ Isso pesa mais do que parece: **fora da janela de 24 horas, o WhatsApp só deixa o escritório iniciar conversa por template aprovado.** Alerta que o escritório manda sem o cliente ter escrito antes — "sua audiência é amanhã" — é exatamente esse caso. Sem template aprovado, não sai.

### C4. Modelos de IA

70. ✅ **RESPONDIDA em 05/09 — OpenAI e Gemini já existem; OpenRouter será contratado**, para dispor de todos os modelos necessários, inclusive o Claude. Ver **D-198**: a plataforma passa a ter **um** provedor na configuração, e trocar de modelo deixa de ser troca de credencial.
71. 🟡 **RESPONDIDA em 05/09 — não há teto ainda, fica para depois.** ⚠️ Registrado com ressalva: **a Regra Inegociável 6 diz que custo é requisito funcional**, e o disjuntor de crédito já construído (12 testes passando) foi desenhado para a fonte processual. Sem um número para IA, ele não tem o que vigiar nesse eixo. Não trava a entrega; entra na lista de números que faltam, junto com os do PRD §9.

### C5. Projeto

72. 🔴 **RESPONDIDA em 05/09 — 10/09 é o ideal, 15/09 é o limite para implementação e produção.** **Esta é a resposta mais consequente de todas as 74**, e reorganiza o resto. Ver **D-195**.
73. ✅ **RESPONDIDA em 05/09 — escopo fechado.** Reforça D-195: em escopo fechado, o que não couber no prazo não vira hora extra — vira escopo que precisa ser **negociado agora**, antes de começar, e não descoberto no dia 14.
74. ✅ **RESPONDIDA em 05/09 — o código é seu, licenciado ao escritório.** Confirma o desenho que já estava de pé: **Regra Inegociável 3** manda que regra de negócio do escritório fique fora dos servidores MCP, justamente para que eles sirvam a outros clientes. A resposta transforma essa regra de higiene de arquitetura em **cláusula de contrato**. Ver **D-199**.

---

## Bloqueadores em resumo

> **Atualizado em 05/09.** Das 74 perguntas, **63 estao respondidas**. O que sobra esta abaixo — e a primeira linha e a que reorganiza todas as outras.

| Pergunta | Trava | Estado |
|---|---|---|
| **72 — o prazo: 10/09 ideal, 15/09 limite** | **O escopo inteiro** | 🔴 **Respondida, e e o novo eixo do projeto.** Em escopo fechado (73), o que nao couber precisa ser negociado agora. Ver **D-195** |
| **67–69 — WhatsApp: sem conta, sem numero, sem template** | E4 · Atendimento ao cliente | 🔴 **Nao cabe em 15/09 pelo caminho da Meta.** Verificacao de negocio e aprovacao de template levam semanas, e o tempo e da Meta. Ver **D-197** |
| **58 — plano do Escavador, a contratar em 08/09** | **E1 e E2**, integralmente | 🔴 **Caminho critico.** Cota expirada em 01/09, saldo zero. Sem contratacao na terca, nenhuma consulta roda |
| **65 — chave de API do Trello** | E3, e as perguntas 26–27 (Butler) | 🟡 **Em providencia.** O inventario do Butler precisa acontecer **antes** da primeira gravacao no Trello |
| **51–57 — infraestrutura** | Implantacao dos MCP, banco da aplicacao, cofre de segredos | 🔴 **Sete abertas.** Resolvem-se numa sessao de comandos de leitura — ver a resposta de 05/09 |
| **5 — responsavel interno** | Interlocutor unico das decisoes de negocio | ✅ **Respondida em 05/09 — Malu Souza** (D-200) |
| **6 — colaborador pode aprovar ato de prazo?** | Regra Inegociavel 2 e o botao de aprovacao (RN-09) | 🚧 **Aberta** — proposta em D-194 |
| **20a–20d — rito do alerta de prazo e expiracao de aprovacao** | Configuracao de E2 e do ciclo de aprovacao (RF-13, RN-09) | 🚧 **Aberta**, e a 20b precisa ser reescrita: sem hierarquia, nao existe "socia responsavel" (D-193) |
| **Os numeros propostos** — franquia de aparicoes, tetos de bloco, tetos de orcamento | Configuracao de E2 e do disjuntor (D-149) | 🔴 **Aberto** — aguarda o de acordo do escritorio |
| **71 — teto de gasto mensal com IA** | Disjuntor no eixo de IA (Regra 6) | 🟡 **Adiada pelo usuario.** Nao trava a entrega; entra na lista de numeros que faltam |
| 15 — caixas de e-mail | Desenho da frente F3 | 🔴 Aberta |
| 16a — quantas pessoas usam a conta compartilhada | Custo de reavaliar o Caminho A no futuro | 🔴 Aberta |
| 30 — software de gestao juridica | Arquitetura de integracao | 🔴 Aberta |
| **Perguntas 7 a 14, 17 a 22, 24 a 25, 28 a 29, 31 a 40** | Escopo fino de E3 e E4 | 🔴 **Nao enviadas ao escritorio ainda** — Partes A2 a A6 |

### Resolvidas, por data

| Pergunta | Estado |
|---|---|
| ~~59 — especificacao da API do Escavador~~ | ✅ Resolvida — os dois mapeamentos estao prontos; a rede foi liberada |
| ~~41 a 50 — a instancia n8n~~ | ✅ **Medidas em 05/09** — `16-levantamento-instancia-n8n.md` |
| ~~60 a 64 — sandbox, saldo, v1, autos, webhooks~~ | ✅ **Respondidas em 05/09** pelos registros do proprio projeto |
| ~~66 — conta de servico no Trello~~ | ✅ **Respondida em 05/09** — o recurso nao existe; o que existe e conta dedicada (D-196) |
| ~~70 — provedor de modelos~~ | ✅ **Respondida em 05/09** — OpenRouter (D-198) |
| ~~73–74 — contratacao e propriedade do codigo~~ | ✅ **Respondidas em 05/09** — escopo fechado; codigo do prestador, licenciado (D-199) |
| ~~4 — alcance do acesso do advogado~~ | ✅ Respondida em 27/08 — base inteira (D-146) |
| ~~4a — alcance do acesso do colaborador~~ | ✅ Respondida em 05/09 — base inteira, com perfil individual (D-192) |
| ~~4b / 4c — volume da carteira e cliente de alto volume~~ | ✅ Respondida em 05/09 — ~313 processos, sem cliente de alto volume (D-193) |
| ~~1 a 3 — estrutura, hierarquia e areas~~ | ✅ Respondidas em 05/09 — sete pessoas, sem hierarquia, sem divisao por area |
| ~~23 — papel do Trello~~ | ✅ Respondida em 27/08 — quadro de trabalho (D-152) |
| ~~16b / 16c — licencas individuais do Workspace~~ | ✅ Respondida em 27/08 — Caminho B, pelo Telegram (D-147) |
