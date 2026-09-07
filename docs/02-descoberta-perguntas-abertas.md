# Descoberta — Perguntas Abertas

| Campo | Valor |
|---|---|
| Status | **Parcialmente respondido** — a seção A1 fechou em 05/09 (só a 5 voltou como pedido de esclarecimento); antes disso, cinco perguntas que travavam o PRD voltaram em 27/08 |
| Versão | 0.7 — a Parte A6 entrou, e o backup voltou |
| Data | 2026-09-07 (criado em 2026-08-17) |
| Finalidade | Levantar as informações que faltam para fechar o PRD. Dividido por destinatário. |

> **Como usar.** A Parte A é para o escritório (pode ser enviada como está). A Parte B é técnica, para quem administra os sistemas. A Parte C é sua, sobre contratos e infraestrutura. Nem toda pergunta bloqueia o início — as marcadas com 🚧 bloqueiam.
>
> **Formato.** Cada item traz **a pergunta em negrito** e, logo abaixo, a resposta recuada. A pergunta **nunca** é apagada quando a resposta chega — sem ela, a resposta perde o sentido para quem lê depois, e este documento precisa continuar legível para o escritório, não só para quem esteve na conversa.

---

## Parte A — Para o escritório (negócio e operação)

### A1. Estrutura e pessoas

> ✅ **Respondida por inteiro em 05/09.** A pergunta 5 voltou primeiro como pedido de esclarecimento e foi respondida no mesmo dia — **Malu Souza**. Gerou **D-192 a D-194**, **D-200** e **R-59**.

1. **Quantos advogados e quantos colaboradores? Há estagiários com acesso distinto?**

    ✅ **RESPONDIDA em 05/09 — sete pessoas, duas advogadas e cinco colaboradoras.** Não há estagiário com acesso distinto; a distinção que existe é a de papel.

    | Papel | Pessoas |
    |---|---|
    | Advogada | Malu Souza · Ana Beatriz |
    | Colaboradora | Andressa Jamile · Estefanny Passos · Bia Nunes · Paula Pinheiro · Mota |

    *(O número dimensiona coisas concretas: são **sete contas individuais** de Telegram a cadastrar no Caminho B (D-147), sete linhas na tabela de identidade, e é sobre sete pessoas — não sobre uma equipe grande — que o rito de escalada da pergunta 20 precisa fazer sentido. Escritório desse tamanho **não tem plantão**: se as duas advogadas estiverem em audiência, o alerta não tem para quem escalar. Ver R-52.)*
2. **Existe hierarquia relevante além de "advogado / colaborador" — sócio, associado, coordenador de área?**

    ✅ **RESPONDIDA em 05/09 — não há hierarquia relevante.** Não existe sócio, associado nem coordenador de área como camada de decisão. **Isso deixou a pergunta 20b sem resposta possível na forma em que foi escrita** — o "N2" do rito previa escalar para *a sócia responsável*, e não há uma. ✅ **Reescrita em 05/09**, com a Malu Souza como último degrau proposto (D-200). A escalada terminal do escritório são as duas advogadas — ver D-193.
3. **O escritório é dividido por áreas de atuação (cível, trabalhista, tributário…)? O acesso deve ser segmentado por área?**

    ✅ **RESPONDIDA em 05/09 — sem divisão por área, e sem segmentação de acesso.** *"Atua em todas as áreas, sem divisão específica ou segmentação, nem entre os colaboradores; todos cuidam de todos os processos de todas as áreas."* Não haverá escopo por matéria na matriz de privilégios: o eixo do escopo é **papel** (advogado/colaborador) e **escritório** (isolamento entre inquilinos), nunca área de atuação.
4. **O advogado enxerga apenas os processos da carteira em que está constituído, ou a base inteira do escritório?**

    ✅ **RESPONDIDA em 27/08 — base inteira.** *"Os advogados têm acesso à base inteira, pois eles se ajudam nos processos um do outro."* Decisão D-07 resolvida; ver D-146 e PRD §3.1. Os três desdobramentos foram respondidos em 05/09:
    - **4a.** **E o colaborador? A resposta falou de advogados. O colaborador (equipe administrativa, estagiários, paralegais) também enxerga a base inteira, ou fica restrito aos processos da área/carteira em que trabalha?**

        ✅ **RESPONDIDA em 05/09 — o colaborador também vê a base inteira.** *"Os colaboradores têm acesso completo também, pois eles fazem movimentação em nome dos advogados e com o acesso e credenciais dos advogados, mas sempre sob observação, orientação e acompanhamento dos advogados."* O usuário registrou que **essa é decisão interna do escritório, sobre a qual não tem ingerência**, e que **a individualização de perfis fica mantida para todos** — advogados e colaboradores — para que toda ação seja registrada e auditável, como o projeto prevê. Ver **D-192**; o padrão restritivo provisório cai. ⚠️ A frase *"com as credenciais dos advogados"* descreve a prática atual **nos sistemas externos** (tribunal, PJe, e-mail) e é justamente o que a plataforma não vai reproduzir — ver **R-59**.
    - **4b.** **Quantos processos ativos o escritório tem, aproximadamente? *(A API cobra por bloco de 200 resultados — este número dimensiona o custo de qualquer consulta ampla. Premissa P-07.)***

        ✅ **RESPONDIDA em 05/09 — cerca de 313 processos ativos.** Aproximadamente **289** da advogada Malu Souza e **24** da advogada Ana Beatriz. A ordem de grandeza é de **centenas, não de milhares** — ver D-193 e o efeito sobre P-07.
    - **4c.** **Existe algum cliente que é parte em muitos processos — uma empresa, um banco, uma prefeitura, uma operadora — que sozinho passe de 200 processos?**

        ✅ **RESPONDIDA em 05/09 — não existe cliente de alto volume.** *"Não há nenhum cliente nesse nível."* Nenhuma parte concentra 200 processos ou mais; o caso que faria a conta explodir não existe nesta carteira.
5. **Quem será o responsável interno pelo projeto — a pessoa que aprova decisões e tira dúvidas?**

    ✅ **RESPONDIDA em 05/09 — Malu Souza.** A responsável interna pelo projeto é a advogada **Malu Souza** — quem dá o "de acordo" nos números propostos, decide quando houver conflito entre pedidos do escritório, e responde as perguntas desta descoberta. Ver **D-200**.

    *(A pergunta voltou primeiro como pedido de esclarecimento, e a explicação fica registrada porque distingue três coisas que se confundem.)* O papel é de **negócio**, não técnico: quem o exerce não precisa entender de n8n nem de API, precisa ter autoridade para dizer "é assim que o escritório trabalha". Pode acumular com o de **administrador da plataforma** (quem cadastra e desliga contas), mas os dois são distintos: o administrador executa, o responsável decide. Diferente ainda de "gerente do escritório", que não existe ali (pergunta 2).
6. **Quem aprova respostas a clientes hoje? Isso muda por tipo de assunto ou por valor da causa?**

    ✅ **RESPONDIDA em 05/09 — todos aprovam, sob supervisão de advogado.** *"Todos os advogados e colaboradores (mas sempre sob observação, orientação e acompanhamento dos advogados)."* Não varia por assunto nem por valor da causa. ⚠️ **Isso encosta na Regra Inegociável 2** — *ato com efeito jurídico ou de prazo exige aprovação de advogado identificado*. "Sob observação" funciona numa sala com sete pessoas; num botão de aprovação, ou o sistema exige advogado ou não exige, e não há meio-termo. A proposta está em **D-194**, e precisa do "de acordo" do escritório.

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

> 🟡 **Parcialmente respondida em 07/09.** O **rito do alerta de prazo fechou por inteiro** — 20a, 20b, 20d e 20e voltaram com números, e a 20e escolheu **o lado seguro** (D-208, D-209; **R-68 cai**). A **20c** voltou como pedido de esclarecimento, com proposta concreta abaixo. As perguntas **15, 17, 18, 19, 20 (principal), 21 e 22 seguem abertas** — e a 15 ganhou urgência nova pelo que a 16a revelou.

15. 🚧 **Quantas caixas de e-mail devem ser monitoradas, e quais?** *(Ex.: `contato@`, caixa pessoal de sócio, caixa de intimações.)*

    🔴 **Aberta — e a resposta da 16a mudou o peso dela.** A caixa compartilhada é usada por **seis das sete pessoas**, e a que falta é a **advogada Ana Beatriz**. Então a pergunta deixou de ser só "quantas caixas": passou a ser **"onde chega o e-mail dos processos da Ana Beatriz, e essa caixa entra no monitoramento?"** Uma caixa que ela não usa não vê o que é endereçado a ela.
16. **Qual serviço de e-mail o escritório usa, e como as contas estão organizadas — uma por pessoa, ou compartilhada?**

    ✅ **RESPONDIDA — Google Workspace Business Starter, com uma única conta compartilhada por toda a equipe.** Ver R-11 e Nota Técnica 01 §1.6.
    - **16a.** **Quantas pessoas usam essa conta hoje?** *(Define o custo de migrar para licenças individuais — é o número que o escritório vai precisar quando reavaliar o Caminho A.)*

        ✅ **RESPONDIDA em 07/09 — seis pessoas: a advogada Malu Souza e as cinco colaboradoras.**

        ⚠️ **São seis das sete, e a que falta é a Ana Beatriz.** Ninguém disse isso; sai da conta. Alimenta a pergunta 15, e não é detalhe: com ~24 processos (D-193) o volume dela é pequeno, mas **um prazo perdido não é**.

        **O que o número destrava:** o custo do Caminho A vira calculável — **seis licenças**, ou sete se a Ana Beatriz entrar. *(O preço vigente sai da página do Google, não da memória.)* E o alcance de **R-11** fica medido: a conta compartilhada é usada por seis pessoas, o que dimensiona exatamente o que se perde em auditoria de e-mail e Drive.
    - **16b.** **O escritório vai contratar licenças individuais do Workspace agora?**

        ✅ **RESPONDIDA em 27/08 — não, por ora.** O escritório optou por **não** contratar licenças individuais do Workspace agora, para evitar gasto no início da implementação.
    - **16c.** **A identidade individual do projeto pode vir do Telegram + painel, com ciência das implicações?**

        ✅ **RESPONDIDA em 27/08 — sim, com ciência.** A identidade individual do projeto virá do **Telegram + painel** (Caminho B): uma conta por colaborador e por advogado, todas identificadas e cadastradas pelo escritório. *"Foi informado acerca das implicações disso, e o escritório aceitou os riscos."* Ver **D-147**; **R-11 permanece aberto para e-mail e Drive**, e **R-47** registra o risco novo (identidade ancorada em número de telefone, sem desligamento central).
17. 🔴 Volume aproximado de e-mails/dia e proporção de spam.
18. 🔴 Quais tipos de e-mail chegam com maior frequência? Quais são os críticos?
19. 🔴 Como intimações e comunicações de tribunal chegam hoje — e-mail, sistema do tribunal, ambos?
20. 🔴 **Existe rotina atual de conferência de prazos? Quem faz e como?** *(Sabemos, desde 27/08, que **colaboradores também conferem** — o que muda a quem o alerta é entregue.)*

    ⚠️ **A pergunta principal segue aberta, e as cinco derivadas fecharam.** Isso é desconfortável de propósito: os números do rito novo estão definidos (20a–20e) **sem que se saiba como o escritório confere prazo hoje**. O rito foi desenhado no vazio, e vai funcionar — mas se a rotina atual tiver um passo que ninguém mencionou, ele aparece só quando o sistema atravessar esse passo. Vale perguntar antes de E2 entrar em operação.
    - **20a.** **Quanto tempo o escritório aceita que um alerta de prazo fique sem ninguém confirmar que leu, antes de o sistema chamar todos os advogados?** *(Nossa proposta: 2 horas úteis. É o "N1" do rito descrito no PRD §5.2.1.)*

        ✅ **RESPONDIDA em 07/09 — 2 horas úteis**, conforme a proposta. Ver **D-208**.
    - **20b.** **E antes de escalar para o último degrau?** *(Nossa proposta: 4 horas úteis — o "N2", com a advogada **Malu Souza** como destino, por ser a responsável interna (D-200) e concentrar ~289 dos ~313 processos (D-193). Reescrita em 05/09, porque a resposta da pergunta 2 mostrou que **não existe sócia** — não há hierarquia.)*

        ✅ **RESPONDIDA em 07/09 — confirmado: 4 horas úteis, escalando para a Malu Souza.** Ver **D-208**.
    - **20c.** 🚧 **Qual é o horário útil considerado?** *(O relógio da escalada só corre nele — publicação que chega às 18h de sexta começa a contar na segunda.)*

        🚧 **PENDENTE, com data: o usuário vai fechar com a Malu na terça (08/09).** Voltou em 07/09 como pedido de esclarecimento — e a resposta é que "horário útil" são **cinco definições**, não uma. ⚠️ **Enquanto ela não fechar, os números da D-208 não significam nada** — "2 horas úteis" precisa de um relógio que diga o que é útil. As propostas estão abaixo, para confirmar ou corrigir: Significa **cinco definições**, e a proposta de cada uma está abaixo, para confirmar ou corrigir:

        | # | O que precisa ser definido | Nossa proposta |
        |---|---|---|
        | 1 | **Dias da semana** em que o relógio corre | Segunda a sexta |
        | 2 | **Janela diária** | **08h às 18h** |
        | 3 | **Fuso horário** | **America/Sao_Paulo** — é o mesmo do Amapá (UTC−3) e **já é o que a instância usa** (`GENERIC_TIMEZONE`, medido em 06/09) |
        | 4 | **O almoço conta?** | **Conta** — o relógio não pausa. Mais simples, e a diferença é de 2 h num prazo de 2 h a 4 h |
        | 5 | **Feriados** | Nacionais + estaduais do Amapá + municipais de Macapá. **Precisa da lista**, e ela precisa ser mantida — feriado não avisa que chegou |

        **E uma regra de borda, que é o motivo de tudo isso existir:** publicação que chega **fora** da janela não começa a contar na hora — começa na abertura seguinte. Publicação de sexta às 17h50 dispara o N1 na segunda às 09h50, não no sábado de madrugada. ⚠️ **Isso é decisão de conforto, não de segurança:** o prazo processual corre no calendário dele, independentemente do nosso relógio. A plataforma **sinaliza indício e nunca calcula prazo** (D-64) — o horário útil governa só quando o sistema incomoda alguém.
    - **20d.** **Quanto tempo um pedido de aprovação pode ficar parado antes de vencer e precisar ser refeito?** *(Nossa proposta: 4 horas úteis para mensagem ao cliente, 2 horas úteis para ato com efeito de prazo. Aprovar um texto oito horas depois é autorizar a descrição de um mundo que já mudou — ver PRD §6.2.5.)*

        ✅ **RESPONDIDA em 07/09 — conforme a proposta: 4 horas úteis para mensagem ao cliente, 2 horas úteis para ato com efeito de prazo.** Ver **D-208**.
    - **20e.** **Quanto tempo a advogada tem para reabrir um alerta de prazo que a colaboradora encerrou — e, quando a janela expira sem ela reagir, o alerta fecha ou reabre?** *(Nasceu da D-194. Nossa proposta: 4 horas úteis. A segunda metade é a que importa: fechar é o cômodo, reabrir é o seguro — ver R-68.)*

        ✅ **RESPONDIDA em 07/09 — 4 horas úteis, e a janela expira REABRINDO.**

        🟢 **O escritório escolheu o lado seguro sobre o cômodo, e isso derruba o R-68.** O silêncio da advogada deixa de ratificar o encerramento: passa a exigir toque dela. Com isso, a promessa da RF-15 (*silêncio nunca é interpretado como "nada aconteceu"*) e a linha **Nunca** do rito no PRD §5.2.1 (*alerta de prazo não se encerra sozinho*) voltam a valer sem exceção — que era exatamente o que a D-194 tinha aberto.

        ⚠️ **A escolha segura cria um problema novo, e ele precisa de resposta:** se reabrir é o padrão, **o que acontece no segundo ciclo?** Advogada em audiência o dia inteiro vê o mesmo alerta reabrir de 4 em 4 horas, indefinidamente — e alerta que repete vira alerta que ninguém lê (R-52). Ver **R-70**, e a proposta em **D-209**: a reabertura **não repete o mesmo aviso**; ela sobe direto para o N2 e o alerta fica em estado de *pendente de advogado*, visível no resumo de fim de dia útil, sem novo disparo até alguém tocar.
21. 🔴 Que tipos de anexo aparecem — PDF pesquisável, PDF digitalizado, imagem, áudio, planilha, .docx?
22. 🔴 Existe modelo/padrão de resposta já usado pelo escritório?

### A4. Trello

23. **O Trello é a fonte da verdade da demanda, ou é visualização de algo que vive em outro lugar?**

    ✅ **RESPONDIDA em 27/08 — quadro de trabalho.** *"O Trello é quadro de trabalho."* A fonte da verdade da demanda é a **base interna** da plataforma; o Trello é a vitrine onde a equipe trabalha. Decisão D-09 resolvida; ver D-152 e PRD §4.3.
24. Quantos quadros, e qual a lógica deles — por área, por cliente, por fase, por pessoa?
25. Qual o fluxo típico de um card, da criação ao encerramento?
26. ⚙️ **REATRIBUÍDA em 27/08 — vira levantamento técnico nosso.** Quais campos personalizados (Custom Fields) estão em uso? *O escritório informou que ninguém sabe responder. Será levantado por nós com a API, assim que a chave do Trello chegar.*
27. ⚙️ **REATRIBUÍDA em 27/08 — vira levantamento técnico nosso.** Há Power-Ups ou automações (Butler) ativos? Quais? *Idem. **Este é o mais crítico dos dois:** o Butler reage às nossas escritas, e uma automação desconhecida pode mover, arquivar ou notificar em cima do que a plataforma criar. Precisa ser inventariado **antes da primeira gravação no Trello**, não depois.*
28. Todos usam o Trello de fato, ou ele coexiste com planilhas e grupos de WhatsApp?
29. Plano contratado (Standard, Premium, Enterprise) e número de licenças.

### A5. Demais plataformas

> 🟡 **Parcialmente respondida em 07/09**, e **a 30 é a resposta mais consequente desta seção inteira**: o escritório já usa um software de gestão jurídica. Isso não invalida o projeto — mas obriga a saber o que ele já faz **antes** de E1 e E2 entrarem em operação, sob pena de a plataforma duplicar o que já existe. Ver **D-210** e **R-71**.

30. **Existe software de gestão jurídica (Astrea, Projuris, ADVBOX, Legal One, SAJ ADV, outro)?**

    🔴 **RESPONDIDA em 07/09 — sim, o Astrea** (da Aurum).

    ⚠️ **Isto reabre uma pergunta que o projeto tratava como fechada.** O Astrea é uma plataforma de gestão para escritórios, e a família de produtos dele cobre — em algum grau, a confirmar — **cadastro de processos, agenda, controle de prazos e acompanhamento de publicações**. Ou seja: parte do que E1 e E2 propõem pode já existir e já estar paga.

    **Não sabemos o quanto**, e não vamos afirmar de memória (Regra: verificação antes de afirmar). O que precisa ser levantado, em ordem de urgência, está em **D-210**:

    | # | O que perguntar | Por que trava |
    |---|---|---|
    | a | **O Astrea já monitora publicações e avisa de prazo?** Se sim, com que módulo, e o escritório confia nele? | É **E2 inteira**. Dois sistemas alertando o mesmo prazo é pior que um — ver **R-71** |
    | b | **O cadastro de processos vive no Astrea?** | Define quem é a fonte da verdade do processo, e a D-09/D-152 respondeu isso sobre o Trello, não sobre o Astrea |
    | c | **O Astrea tem API, e o plano contratado dá acesso a ela?** | Define se dá para integrar ou se a plataforma vive ao lado |
    | d | **Qual plano, e quantas licenças?** | Custo já pago que o projeto pode estar prestes a duplicar |

    **Isto vale mais que qualquer outra pergunta ainda aberta da Parte A**, e precisa ir à Malu junto com a 20c.
31. **Onde ficam os documentos hoje — Google Drive, OneDrive, Dropbox, servidor local?**

    ✅ **RESPONDIDA em 07/09 — Google Drive.**

    ⚠️ **E o Drive está sob a conta compartilhada** (pergunta 16, R-11), usada por **seis pessoas** (16a). Então o mesmo buraco de auditoria do e-mail vale para o documento: não há como saber quem abriu, baixou ou apagou o quê. Para autos e peças de escritório de advocacia, isso é mais pesado que para e-mail.

    **De útil para o desenho:** o servidor do prestador já tem **MinIO** (armazenamento de objetos, medido em 06/09) — o que a plataforma produzir ou receber não precisa passar pelo Drive compartilhado. E o teto de 16 MB por requisição do n8n (D-204) já apontava para lá.
32. 🔴 Há sistema financeiro/de honorários? Ele precisa ser integrado? *(Sem resposta. ⚠️ O Astrea normalmente cobre isso — a resposta pode ser "o próprio Astrea", e essa é uma das coisas a confirmar na D-210.)*
33. **Há assinatura de outra ferramenta de consulta processual além do Escavador (Judit, Jusbrasil, Digesto, Codilo)?**

    🟠 **RESPONDIDA em 07/09 — Jusbrasil.**

    ⚠️ **Segunda sobreposição na mesma seção.** O Jusbrasil também oferece consulta processual e acompanhamento. Junto com o Astrea, são **duas ferramentas já pagas** que tocam o mesmo terreno de E1 e E2 — e o orçamento do Escavador é justamente o ponto mais apertado do projeto (saldo zero, contratação em 08/09).

    **A pergunta que isso levanta não é técnica, é de decisão:** o escritório quer **somar** uma terceira fonte, ou **substituir** o que já tem? São respostas diferentes, e a segunda muda o que se contrata na terça. Ver **D-210**.
34. **Usam alguma ferramenta de IA hoje? Qual, e para quê?**

    ✅ **RESPONDIDA em 07/09 — ChatGPT e Claude**, ambos para *"auxílio geral de pesquisa (em especial de cunho jurídico — legal, jurisprudencial, etc.), na elaboração e na revisão de documentos"*.

    🟢 **De bom:** a equipe já trabalha com IA. A plataforma não vai encontrar resistência cultural, e a expectativa do que a IA faz e não faz já existe. É uma vantagem real de adoção.

    ⚠️ **De aberto, e é fato a registrar, não julgamento:** *"revisão de documentos"* de um escritório de advocacia significa que **peça e documento de cliente provavelmente são colados numa interface de consumo**. Isso importa para as perguntas **37, 38 e 39** (DPO, política de uso de IA, dados fora do país), que continuam sem resposta — e importa para o contrato de honorários (pergunta 36). Ver **R-72**. *(A plataforma não muda isso sozinha: ela oferece um caminho auditado para o mesmo trabalho, e o uso direto continua existindo ao lado.)*
35. **Existe base de conhecimento interna — modelos de peça, teses, procedimentos? Em que formato?**

    ✅ **RESPONDIDA em 07/09 — sim, em `.docx` e `.pdf`.**

    🟢 **Boa notícia para o desenho, e o servidor já tem a peça que falta:** o PostgreSQL da infra é `pgvector/pgvector:pg16` — **já vem com a extensão de busca por similaridade** (medido em 06/09), que é exatamente o que uma base de conhecimento consultável exige. Não precisa provisionar nada novo.

    **O que falta saber:** **quantos** documentos, **onde** estão (Drive? Astrea?) e se os `.pdf` são pesquisáveis ou digitalizados — a pergunta 21 faz a mesma distinção para anexos, e a diferença decide se dá para ler o texto ou se precisa de OCR (reconhecimento óptico, que transforma imagem de texto em texto). **Fora do escopo de 15/09** (D-207); entra quando E3 chegar.

### A6. Conformidade

> 🟡 **Respondida em 07/09**, e a seção inteira devolve a mesma coisa: **as bases existem, os documentos não.** Há contrato, há responsável designado, há noção clara do que é sensível — e **não há política de segurança, não há política de uso de IA, e não há decisão sobre dados saírem do país**, justamente quando a plataforma inteira depende de provedores fora dele. Gerou **D-211**, **R-73** e **R-74**.

36. **Existe contrato de honorários padrão? Ele menciona uso de tecnologia ou de IA?**

    🟡 **RESPONDIDA em 07/09 — existe, não menciona, e será corrigido se for preciso.**

    **É preciso.** Não por formalismo: o cliente do escritório precisa saber que os dados do processo dele passam por (a) uma infraestrutura operada por um **terceiro** que não é o escritório (D-148, R-48), e (b) **provedores de modelo de IA fora do país** (D-198). Nenhuma das duas coisas é irregular; as duas precisam estar ditas.

    **O que o projeto precisa que o contrato cubra** — a redação é da advogada, não nossa:
    - que o escritório usa ferramenta automatizada e de IA no tratamento do caso;
    - que há **operador** de dados contratado, identificado;
    - que há **transferência internacional** de dados (LGPD art. 33), com a base legal escolhida;
    - que **decisão jurídica continua sendo humana** — o que a Regra Inegociável 2 já garante em código, e o contrato só declara.
37. **Existe DPO ou responsável por LGPD designado?**

    🟡 **RESPONDIDA em 07/09 — a advogada Malu Souza, e o usuário naquilo que disser respeito ao sistema que desenvolve e administra.**

    ⚠️ **Há uma sobreposição de papéis a nomear, e ela não é um problema hoje.** Na LGPD, quem decide as finalidades é o **controlador** (o escritório) e quem trata por conta dele é o **operador** (o prestador — o usuário, por D-148). O **encarregado** (é o nome que a LGPD dá ao DPO) é designado pelo controlador e é quem responde ao titular e à ANPD.

    Com o usuário acumulando "operador" e "responsável pela parte do sistema", **quem audita o operador é o próprio operador**. Em escritório de sete pessoas com um prestador só, isso é normal e administrável. Vira problema no dia de um incidente, quando alguém pergunta quem apurou — e a resposta não pode ser "quem causou". **Encaminhamento barato:** o encarregado formal perante o titular e a ANPD é a **Malu**, sempre; o usuário responde tecnicamente **para** ela, e não no lugar dela. Somado ao **R-48**.
38. **Há política interna de segurança da informação ou de uso de IA?**

    🔴 **RESPONDIDA em 07/09 — ainda não, nenhuma das duas.**

    **É a lacuna que dá peso a todas as outras desta seção.** O **R-72** registrou que documento de cliente provavelmente já transita por IA de consumo (ChatGPT, Claude — pergunta 34); a **39** diz que não há restrição sobre dados saírem do país; e a **40** identifica matérias que exigem tratamento mais restrito. **As três só viram regra dentro de uma política** — sem ela, cada pessoa decide sozinha, todo dia, e ninguém está errado porque não há o que contrariar.

    **Não trava o prazo de 15/09** e não é entrega nossa. Mas uma política de uso de IA para sete pessoas cabe em duas páginas, e é o documento de maior efeito por página do projeto inteiro.
39. **Existe restrição do escritório quanto a dados saírem do país?**

    🔴 **RESPONDIDA em 07/09 — ainda não.**

    ⚠️ **"Ainda não há restrição" não é o mesmo que "está liberado"** — é decisão que não foi tomada. E ela já está sendo tomada na prática, por omissão, porque **a plataforma inteira depende de fornecedor fora do país**:

    | O que sai | Para onde | Desde quando |
    |---|---|---|
    | Conteúdo de prompt (peça, publicação, dado de processo) | **OpenRouter**, e por trás dele OpenAI, Google, Anthropic | Decisão D-198 |
    | Uso direto da equipe | ChatGPT e Claude | Já hoje (R-72) |
    | **Backup do banco** | **Cloudflare R2** | **07/09**, ver pergunta 55 |
    | Mensagem ao cliente | Meta (WhatsApp), se E4 acontecer | D-197 |

    Isso **não é irregular** — a LGPD permite transferência internacional, com base legal (art. 33) e informação ao titular. O que não pode é acontecer **sem ninguém ter decidido**. Ver **R-74**; a saída prática é o item que a 36 acrescenta ao contrato.
40. **Que assuntos são especialmente sensíveis (família, criminal, menores) e demandam tratamento mais restritivo?**

    ✅ **RESPONDIDA em 07/09 — família, criminal, menores, e todo processo em segredo de justiça.**

    🟢 **Metade disso o projeto já faz.** Segredo de justiça sempre foi tratado à parte: a **RF-38** diz que *"base inteira" não inclui segredo de justiça*, a **RNF-16** exige escopo próprio, e em 24/08 o alvo de teste do fornecedor foi **trocado** (D-96) justamente por estar em segredo. A parte nova são as **matérias**.

    ⚠️ **E a parte nova exige uma distinção que é fácil de errar.** A pergunta 3 respondeu *"sem divisão por área, sem segmentação de acesso"* — e continua valendo. **Os dois não se contradizem porque são eixos diferentes:**

    | Eixo | Pergunta 3 | Pergunta 40 |
    |---|---|---|
    | **Quem pode ver** | Todos veem tudo. **Não muda** | — |
    | **O que o sistema faz sozinho** | — | **Muda.** Automatismo fica mais curto em matéria sensível |

    Ninguém perde acesso. O que encolhe é o que a plataforma faz **sem humano no meio**. O desenho está em **D-211**, e o risco que ele cria — classificação errada falha em silêncio — em **R-73**.

---

## Parte B — Para quem administra os sistemas (técnico)

> ✅ **Respondida por inteiro em 05–06/09**, e **por medição, não por declaração** — as 41 a 50 pela API da instância, as 51 a 57 no terminal do servidor. O resultado completo está em **[`16-levantamento-instancia-n8n.md`](16-levantamento-instancia-n8n.md)**; aqui ficam as respostas. A medição achou **oito coisas que ninguém perguntou** — **R-60 a R-67** — e três delas precedem qualquer dado real do escritório entrar nessa infraestrutura.

### B1. n8n

41. **Versão do n8n e forma de hospedagem (n8n Cloud, self-hosted, Docker).**

    ✅ **RESPONDIDA em 05/09 — `v1.123.18`, self-hosted.** Sobre Node.js v22.21.0, no ar há ~43 dias sem reinício. A versão sai do endpoint `/metrics`, que responde sem autenticação — ver R-60.
42. **Modo de execução: regular ou queue mode? Quantos workers?**

    ✅ **RESPONDIDA em 05/09 — queue mode, confirmado por medição.** As métricas de fila (`n8n_queue_job_enqueued_total`) só existem em queue mode. **O número de workers não sai por aí** — worker publica métrica no processo dele, e o que respondeu foi o *leader*. ✅ **Confirmado na infra em 05/09: um worker, medido** — e o n8n está em **quatro serviços**: `editor` (1), `webhook` (**2 réplicas**), `worker` (1) e `mcp_api` (1). *(Importa para E2: com um worker, um lote de publicações do diário processa uma de cada vez, e o alerta de prazo entra na fila atrás do que já estiver rodando dos outros clientes.)*
43. **Banco de dados do n8n: SQLite ou PostgreSQL?**

    ✅ **RESPONDIDA e medida em 05/09 — PostgreSQL 16**, imagem `pgvector/pgvector:pg16`, com `pgbouncer` na frente. ⚠️ O n8n conecta como o **superusuário `postgres`** — ver pergunta 52 e **D-201**.
44. **Nós de IA e MCP disponíveis nessa versão? (AI Agent, MCP Client Tool, MCP Server Trigger.)**

    ✅ **RESPONDIDA em 05/09 — todos disponíveis, e já em uso real na instância.** `AI Agent`, `MCP Server Trigger`, `Chat Trigger`, `Tool Workflow` (21 usos), `lmChatOpenAi`, `googleGemini`, `memoryBufferWindow`. A 1.123 é folgadamente posterior ao mínimo de qualquer um. **Nenhum risco de versão para o desenho da plataforma.**
45. **Já existem workflows em produção? Quais, e podem ser afetados?**

    ✅ **RESPONDIDA em 05/09 — 194 workflows, 9 ativos.** E o número não é a resposta importante: **cinco dos nove ativos são de outros clientes do prestador** (Font Liberty, Nexus AI, Hermes MCP). A instância é compartilhada — ver **R-60** e a tabela em `16-levantamento...` §2. Nenhum deles é afetado pelo que este projeto fizer, desde que ninguém mexa neles; o inverso não é verdade, e é isso que R-61 trata.
46. **Como os workflows são versionados hoje — se são?**

    ✅ **RESPONDIDA em 05/09 — não há versionamento nenhum.** Não há *source control* (é recurso Enterprise, e `/projects` responde 403), nem exportação versionada. **Os 194 fluxos existem em um lugar só: o banco da instância.** Um fluxo salvo por cima não tem como voltar.

    **Proposta, e é barata:** exportar os fluxos deste projeto pela API para JSON no repositório, a cada mudança — que é exatamente o que `demo/montar-fluxo-a.mjs` e `montar-fluxo-b.mjs` já fazem ao contrário (o fluxo **nasce** do código versionado e é publicado na instância). **A frente LEX já é versionada por construção.** O que falta é o mesmo para os fluxos que não nasceram assim, e isso é decisão sua, não do escritório.
47. **Há URL pública/webhook exposto? Com que proteção?**

    ✅ **RESPONDIDA em 05/09 — oito gatilhos HTTP em fluxos ativos, e a proteção não está onde o n8n a colocaria.** Sete estão com `authentication: none` **no nó**; um usa `bearerAuth`. Mas nos três fluxos deste projeto a conferência de origem está **no código do fluxo**, logo depois do webhook — desenho fechado na revisão externa de 31/08 (D-185), reverificado em 05/09 e funcionando. Nos cinco fluxos dos outros clientes **não sabemos**, e não é nosso lugar auditá-los. Tabela completa em `16-levantamento...` §3.
48. **Quais credenciais já estão configuradas no n8n?**

    ⚠️ **RESPONDIDA PARCIALMENTE em 05/09 — a API do n8n não lista credenciais.** Ela expõe o *esquema* de um tipo de credencial, nunca as credenciais em si (o que é correto). O que dá para saber é o que os fluxos ativos **referenciam**: 10 tipos, 25 credenciais distintas — Supabase (6), Gemini (7), Redis (4), OpenAI (2), Google Sheets, RabbitMQ, Telegram, e **uma credencial da API do próprio n8n** ("Conexão Geral"), usada por dois fluxos de produção de outros clientes. **Essa última é a que pesa** — ver **R-61**. Para a lista completa, só pelo painel.
49. **Existe ambiente de homologação separado?**

    ✅ **RESPONDIDA em 05/09 — não existe, e a explicação estava faltando.** Ambiente de homologação **não é uma segunda assinatura nem uma pasta**: é uma **segunda instância do n8n**, com banco próprio e credenciais próprias (de teste, nunca as de produção), onde a mudança é ensaiada antes de tocar o que está no ar.

    Por que importa aqui: hoje, mexer num fluxo ativo mexe **no fluxo ativo**, com clientes reais do outro lado, e sem versionamento (pergunta 46) não há como voltar. Com 194 fluxos e 9 no ar, o custo de um salvamento errado é imediato.

    **Não é bloqueador para o prazo de 10–15/09, e não proponho montar agora.** A frente LEX já contorna o problema por outro caminho — os fluxos nascem de código versionado e são publicados por script, então o "ensaio" acontece no repositório. Fica como recomendação de operação, para depois da entrega.
50. **Recursos disponíveis (CPU, memória, disco) e limites de execução.**

    ✅ **RESPONDIDA por inteiro em 05/09.** **2 vCPU, 7,8 GB de RAM** (3,1 em uso), **96,73 GB de disco** (20,1% usados), carga 0,12 — a máquina está ociosa, com **20 containers em 2 núcleos**. **Limites de execução:** 1 h por padrão, 2 h de teto — folgado. ⚠️ **`N8N_PAYLOAD_SIZE_MAX=16` — teto de 16 MB por requisição, e isso é restrição real:** autos em PDF passam disso com frequência, e o sintoma não é erro de lógica — é a requisição ser recusada na porta, o que aparece como "não chegou". O desvio é o **MinIO**, que já está no ar. Ver **D-204**.

### B2. Infraestrutura

> ✅ **Respondida em 05–06/09**, no terminal do servidor, por comandos de leitura que o usuário rodou e cuja saída ele conferiu antes de entregar. Nenhuma credencial trafegou. Detalhe inteiro na **Parte II** de [`16-levantamento-instancia-n8n.md`](16-levantamento-instancia-n8n.md). **Nasceram R-62 a R-67.**

51. **Onde a infra está hospedada — provedor e região?**

    ✅ **RESPONDIDA — Hostinger**, VPS `srv957606`, Ubuntu 22.04.5 LTS, **2 vCPU / 7,8 GB de RAM / 96,73 GB de disco** (20,1% usados). Região não identificada; a Hostinger opera no Brasil e nos EUA, e para LGPD isso importa — fica como sub-pergunta.

    ⚠️ **Não é `docker compose`, é Docker Swarm** — 22 stacks, 24 serviços, 20 containers, criados pelo **Portainer**. A informação inicial era "compose na mão"; os nomes de container desmentiram. Consequência prática: as definições podem não existir em arquivo no disco, e sim dentro do Portainer.
52. **Há PostgreSQL disponível para uso da aplicação, ou precisa ser provisionado?**

    ✅ **RESPONDIDA — existe, e é melhor do que o esperado, com uma ressalva séria.** `pgvector/pgvector:pg16` — **PostgreSQL 16 com pgvector** (extensão de busca por similaridade, útil para base de conhecimento), com **pgbouncer** na frente. Há um segundo, `postgresbackupmcp`, na porta 5433.

    🔴 **A ressalva: o n8n conecta como `postgres`, o superusuário.** Quem tem essa credencial alcança **todos os bancos do servidor**, e ela vive em variável de ambiente que qualquer um com acesso ao Portainer lê. **A plataforma não vai morar ali nessas condições** — ver **D-201**. Barreira de banco que se contorna com a credencial do vizinho não é barreira.
53. **Como os servidores MCP serão implantados — mesmo host do n8n, containers separados?**

    ✅ **RESPONDIDA — como stack de Swarm, igual às outras.** E há precedente pronto: **`n8n_mcp_api` é uma quarta instância do n8n dedicada a servir `/mcp`**, publicada em `callback.criativeia.com.br/mcp`. O caminho de publicar um MCP já existe e está andando.

    Recomendação: os MCP da plataforma **não** ganham endereço público no Traefik — falam com o n8n pela rede interna do Swarm. Endereço público só para o que precisa receber de fora.
54. **Há gerenciador de segredos, ou os segredos vivem no n8n?**

    ✅ **RESPONDIDA — não há gerenciador de segredos; eles vivem em variável de ambiente, em texto plano.** `DB_POSTGRESDB_PASSWORD`, `N8N_ENCRYPTION_KEY` e `N8N_SMTP_PASS` estão no ambiente do serviço. **O Docker Swarm tem cofre nativo (`docker secret`) e ele não está em uso.**

    Isoladamente seria tolerável — infra pequena, um administrador. Junto com o Portainer publicado na internet (R-62), deixa de ser: quem entra no Portainer lê o ambiente de **todos** os serviços. Ver **R-64**.
55. **Política de backup atual: o quê, com que frequência, e já foi testada uma restauração?**

    ✅ **RESOLVIDA em 07/09 — o backup voltou, por outro caminho.** O `pgbackweb` estava em **laço de falha** (`exit 201` a cada ~6 s, medido em 06/09) e foi **substituído por `rclone`**, gravando direto no **Cloudflare R2** do usuário.

    *(Histórico, porque o caminho importa: a pergunta 46 achou **194 fluxos existindo num lugar só, sem versionamento**; esse lugar é o PostgreSQL da instância; e o backup dele estava fora do ar. Era a pior resposta do levantamento.)*

    ⚠️ **Três coisas ficam de pé, e a primeira é a que fecha o R-66:**

    | # | O que falta | Por quê |
    |---|---|---|
    | 1 | **Uma restauração testada**, em banco descartável | **Restauração nunca testada é hipótese, não backup.** O `rclone` copiar arquivo prova que a cópia sai — não prova que ela volta, nem que o `pg_dump` de origem está completo. **R-66 só cai depois disto** |
    | 2 | **O backup está cifrado?** | Sai da máquina e vai para armazenamento de terceiro. O `rclone` tem modo `crypt`; se não estiver ligado, o dump viaja e repousa em claro — e ele contém **as credenciais do n8n e os 194 fluxos** |
    | 3 | **O R2 fica fora do país** | Cai direto na pergunta **39**, que respondeu *"ainda não há restrição"*. Backup de dado de escritório de advocacia atravessando fronteira é transferência internacional, e entra na mesma conta do R-74 |

    **E uma pergunta de higiene:** onde vive a credencial do R2? Se for variável de ambiente como o resto (R-64), ela herda o mesmo alcance — e agora com o backup do lado de lá.
56. **Monitoramento e alertas existentes?**

    ✅ **RESPONDIDA — existe: Prometheus v3.4.2 + Grafana 12.1.1**, ambos no ar e coletando.

    **Isso corrige parcialmente o R-60:** o `/metrics` do n8n não é vazamento acidental, está ligado de propósito porque o Prometheus o coleta — o que é boa prática. O defeito é ele ser alcançável **da internet pública** em vez de só pela rede interna. E o Prometheus **também está público**, sem autenticação (ele não tem nenhuma por padrão), carregando `N8N_METRICS_INCLUDE_WORKFLOW_ID_LABEL=true`, que vaza id de workflow. Ver **R-62**.
57. **Quem tem acesso administrativo à infra?**

    ✅ **RESPONDIDA em 05/09 — somente o usuário.** Nenhuma outra pessoa tem acesso administrativo ao servidor por SSH nem ao Portainer.

    **Isso melhora bastante o quadro dos R-62 a R-64, e não os apaga.** Melhora porque o número de pessoas com a chave é um, o menor possível — não há credencial de ex-colaborador esquecida, nem conta compartilhada de administração. Não apaga porque **o risco medido não é sobre quem tem acesso autorizado: é sobre quem pode tentar sem ter.** O Portainer publicado na internet e a porta 5432 confirmada aberta (R-63) estão ao alcance de qualquer pessoa do mundo, e nada disso passa por "quem tem acesso administrativo".

    ⚠️ **E aparece o outro lado do mesmo fato: ponto único de falha humano.** Uma pessoa só conhece a infraestrutura, e ela é a mesma que responde pelo projeto. Para uma plataforma que vai guardar processo de escritório de advocacia, "o único que sabe entrar ficou indisponível" é um cenário que precisa de resposta — e a resposta não é dar acesso a mais gente, é **documentar a infra e guardar o acesso de emergência em lugar seguro**. Ver **R-67**.

    ⚠️ **Ressalva medida em 05/09:** o enxame tem **dois nós** — `srv957606` e `srv1093898`. A resposta foi dada olhando um; vale confirmar que o segundo não tem chave ou usuário a mais.

#### O que a Parte B2 achou sem ninguém perguntar

| # | Achado | Estado |
|---|---|---|
| **R-62** | **Treze serviços publicados na internet, e três não deveriam:** Portainer (plano de controle do Docker inteiro), Prometheus (sem autenticação) e pgbackweb (backup e restauração de banco). Grafana, RabbitMQ e MinIO também públicos, com login não conferido | 🔴 **O mais grave.** Precede dado real do escritório |
| **R-63** | **`pgbouncer *:5432`, `postgresbackupmcp *:5433` e `wootrico *:3000` publicados direto no host**, fora do Traefik. Em Swarm isso atravessa o `ufw` | 🟠 **CONFIRMADO em 05–06/09** — as duas portas de banco respondem à internet. **Zero tentativa de autenticação falha** no pgbouncer numa janela de ~33 h, o que muda a urgência e não a necessidade: firewall como remendo, **túnel SSH no pgAdmin** como solução |
| **R-64** | Segredos em variável de ambiente, sem cofre — e o Swarm tem um | 🔴 É o R-62 visto de outro lado |
| **R-65** | `NODE_FUNCTION_ALLOW_BUILTIN=*` — nó de código de **qualquer um dos 194 fluxos** alcança o sistema de arquivos e pode abrir processo | 🟠 Puxa contra o `BLOCK_ENV_ACCESS`, que está corretamente ligado |
| **R-66** | O backup está parado — e não "parado": em **laço de falha**, `exit 201` a cada ~6 s | 🔄 **Em conserto por outro caminho** (06/09): o `pgbackweb` sai e outra ferramenta entra. **O risco só cai com backup rodando E restauração testada** |
| **R-67** | **Uma pessoa só conhece a infraestrutura**, e é a mesma que responde pelo projeto — sem documentação das stacks, sem versionamento dos fluxos, com o backup quebrado | 🟠 **Nasceu da resposta à 57.** A saída não é dar acesso a mais gente: é reduzir o que só existe na cabeça de um |
| **D-203** | **A retenção de execução é 14 dias OU 10.000 execuções** — o R-57 deixou de ser estimativa | ✅ Medido na configuração |
| **D-204** | **Teto de 16 MB por requisição** (`N8N_PAYLOAD_SIZE_MAX`) — autos em PDF passam disso. Restrição real de E3 | ✅ Medido |
| **D-202** | **Evolution API, wuzapi e Chatwoot já estão no ar** — a infraestrutura de WhatsApp **não oficial** existe, e é a única que cabe no prazo | 🔴 Decisão do usuário e da Malu |

#### Ainda pendente na infra

| O que | Estado em 06/09 |
|---|---|
| ~~As portas 5432/5433 estão abertas ao mundo?~~ | ✅ **Confirmado: as duas estão.** E **zero tentativa de invasão** na janela de ~33 h medida no pgbouncer |
| ~~Por que o `pgbackweb` não sobe~~ | ✅ **Laço de falha, `exit 201`.** Vai ser substituído (R-66) |
| ~~**57** — quem tem acesso administrativo~~ | ✅ **Só o usuário** — e isso criou o R-67 |
| **Portainer e Prometheus públicos** | 🔴 **Aberto, e é o mais grave que sobrou** (R-62) |
| Grafana, RabbitMQ e MinIO ainda com senha inicial? | 🔴 Aberto — tentar entrar |
| Região do datacenter da Hostinger | 🔴 Aberto — painel da Hostinger; **importa para LGPD** |
| O segundo nó (`srv1093898`) | 🔄 **Vai ser removido.** O receptor de callback não é afetado — já verificado |
| 38 atualizações do SO e reinício pendente | 🟡 Manutenção agendada |

---

## Parte C — Contratos e credenciais (para você)

> **Respondida em 05/09.** O que ficou de fora está marcado. **A leitura de conjunto está no chat e vale mais que qualquer item isolado: o prazo de 10–15/09 não cabe com E4 (WhatsApp) dentro — ver D-195.**

### C1. Escavador

58. **Qual plano da API do Escavador está contratado? *(Define a superfície disponível para o MCP.)***

    🟡 **RESPONDIDA em 05/09 — nada contratado ainda; a contratação é terça-feira (08/09).** A cota de teste **expirou em 01/09** e os R$ 44,00 restantes evaporaram (não viram crédito). ⚠️ **Isso é o caminho crítico de E1 e E2:** sem saldo, nenhuma consulta processual roda, e a única coisa que continua chegando de graça é o callback da assinatura `2813617` — que **renova em 26/09** e precisa de decisão antes disso (D-182).
59. **É possível obter a especificação da API (OpenAPI/Swagger/PDF) para colocar no repositório? *(Necessário enquanto o egress estiver bloqueado — ver R-01.)***

    ✅ **RESPONDIDA em 05/09 — já resolvida, e há mais de um mês.** A pergunta nasceu quando a rede do ambiente bloqueava saída para fora (R-01) e eu não conseguia abrir a documentação do fornecedor: a saída era pedir o arquivo de especificação — o **OpenAPI/Swagger**, que é o documento que descreve cada rota da API, o que ela recebe e o que devolve — para guardar no repositório e ler localmente.

    **Não precisa mais.** A rede foi liberada, os dois mapeamentos foram feitos e estão em [`mapeamento-escavador.md`](mapeamento-escavador.md), e a fonte primária (o SDK oficial em Python) é clonada quando necessário. **Nada a providenciar da sua parte.**
60. **Há ambiente de teste/sandbox, ou toda chamada consome crédito real?**

    ✅ **RESPONDIDA pelos registros do projeto — não há sandbox; toda chamada consome crédito real.** Foi assim que os R$ 6,00 saíram em 21 requisições. **Mas o custo varia por rota, e existem rotas gratuitas** — as de movimentação, origem, status e criação de vigilância, além das entregas de callback, vieram todas com débito zero (D-108). Gratuito se confirma pelo cabeçalho medido, nunca por suposição.
61. **Saldo e consumo médio atual de créditos.**

    🟡 **PARCIAL — o saldo é conhecido, o consumo médio não.** Saldo: **R$ 0,00, cota expirada**. Consumo medido: R$ 6,00 em 21 requisições ao longo de agosto, e a distribuição está em [`06-orcamento-de-chamadas-escavador.md`](06-orcamento-de-chamadas-escavador.md) §5. **Consumo médio em regime não existe ainda** — o projeto nunca operou em produção.
62. **A API v1 ainda é usada para algo que a v2 não cobre?**

    ✅ **RESPONDIDA pelos registros — sim, e é decisão registrada.** A v1 é usada para o que a v2 não cobre; o recorte está em `mapeamento-escavador.md`.
63. **Há contratação do módulo de autos com certificado digital?**

    ✅ **RESPONDIDA pelos registros — não.** O módulo de autos com certificado digital não está contratado, e a demo deixou de depender dele: os 8 processos vieram dos **autos em PDF** do próprio escritório, anonimizados, sem gastar crédito.
64. **Webhooks de monitoramento já são usados hoje? Para onde apontam?**

    ✅ **RESPONDIDA pelos registros — sim, e é a coisa mais viva do projeto.** Há **uma assinatura ativa, `2813617`**, vigilância de diário, apontando para `callback.criativeia.com.br`. Ela entregou **37 eventos e 34 publicações** entre 27/08 e 04/09, ~6 por dia útil, **26 delas intimação**, e **13 chegaram depois de a cota expirar** — callback não depende de saldo. ⚠️ **Renova em 26/09**, e a renovação é o que custa (D-182).

### C2. Trello

65. **Já existe API Key / Token gerado? Vinculado a qual conta?**

    🟡 **RESPONDIDA em 05/09 — ainda não existe; será providenciada na conta do escritório.** 🚧 **Isso trava as perguntas 26 e 27** (campos personalizados e automações Butler), que foram reatribuídas a nós em 27/08 e dependem da chave. **O Butler é o mais urgente dos dois:** uma automação desconhecida pode mover, arquivar ou notificar em cima do que a plataforma criar, e precisa ser inventariada **antes da primeira gravação no Trello**, não depois.
66. **É possível criar uma conta de serviço dedicada, em vez de usar conta pessoal?**

    ✅ **RESPONDIDA em 05/09 — e a pergunta estava mal formulada.** "Conta de serviço" no Trello **não existe como recurso**: o Trello não tem contas de robô. O que existe é uma **conta de pessoa comum, criada para ser usada só pela automação** — com e-mail próprio do escritório (`automacao@`, `plataforma@`), convidada para os quadros, e cuja chave de API é a que a plataforma usa.

    **Por que não usar a conta da advogada chefe**, que é o que você descreveu: (1) toda ação da plataforma apareceria no quadro como se tivesse sido feita **por ela**, e a auditoria que o projeto inteiro sustenta vira ficção dentro do Trello; (2) a chave de API dela alcança **tudo** o que ela alcança, inclusive quadro pessoal fora do escritório; (3) se ela trocar a senha, revogar o token ou sair, a plataforma para — e ninguém liga uma coisa à outra.

    **Recomendação:** criar essa conta antes de gerar a chave. Custa um e-mail e uma licença, e evita os três problemas de uma vez. Ver **D-196**.

### C3. WhatsApp

67. **Já existe conta no WhatsApp Business Platform / Meta Business Manager?**

    ✅ **RESPONDIDA em 05/09 — não existe conta ainda.**
68. **Prefere ir direto pela Meta ou por um BSP (Twilio, 360dialog, Z-API, Gupshup, Take Blip)?**

    🟡 **RESPONDIDA em 05/09 com preferência pela Meta, e a recomendação é outra — ver D-197.** Direto pela Meta é mais barato por mensagem e não tem intermediário; **o problema é o calendário.** Ir direto exige Meta Business Manager, verificação de negócio (documento do CNPJ, e o tempo é da Meta, não nosso), número dedicado que **não pode estar em uso no WhatsApp comum**, e aprovação de cada template. Semanas, não dias.

    Um BSP (*Business Solution Provider* — revendedor homologado pela Meta) já chega verificado: sobe número e template no mesmo dia, e sai mais caro por mensagem. **Com prazo de 10–15/09, "mais caro por mensagem" é irrelevante e "semanas" é fatal.**
69. **Há templates de mensagem já aprovados?**

    ✅ **RESPONDIDA em 05/09 — nenhum template aprovado.** ⚠️ Isso pesa mais do que parece: **fora da janela de 24 horas, o WhatsApp só deixa o escritório iniciar conversa por template aprovado.** Alerta que o escritório manda sem o cliente ter escrito antes — "sua audiência é amanhã" — é exatamente esse caso. Sem template aprovado, não sai.

### C4. Modelos de IA

70. **Já existe conta e chave de API para o provedor de modelos?**

    ✅ **RESPONDIDA em 05/09 — OpenAI e Gemini já existem; OpenRouter será contratado**, para dispor de todos os modelos necessários, inclusive o Claude. Ver **D-198**: a plataforma passa a ter **um** provedor na configuração, e trocar de modelo deixa de ser troca de credencial.
71. **Existe teto de gasto mensal definido para IA?**

    🟡 **RESPONDIDA em 05/09 — não há teto ainda, fica para depois.** ⚠️ Registrado com ressalva: **a Regra Inegociável 6 diz que custo é requisito funcional**, e o disjuntor de crédito já construído (12 testes passando) foi desenhado para a fonte processual. Sem um número para IA, ele não tem o que vigiar nesse eixo. Não trava a entrega; entra na lista de números que faltam, junto com os do PRD §9.

### C5. Projeto

72. **Prazo esperado — há data crítica?**

    🔴 **RESPONDIDA em 05/09 — 10/09 é o ideal, 15/09 é o limite para implementação e produção.** **Esta é a resposta mais consequente de todas as 74**, e reorganiza o resto. Ver **D-195**.
73. **Modelo de contratação: escopo fechado, horas, ou fases?**

    ✅ **RESPONDIDA em 05/09 — escopo fechado.** Reforça D-195: em escopo fechado, o que não couber no prazo não vira hora extra — vira escopo que precisa ser **negociado agora**, antes de começar, e não descoberto no dia 14.
74. **O código será de propriedade do escritório ou seu, licenciado a ele? *(Impacta diretamente o reuso dos servidores MCP em outros projetos — vale definir cedo.)***

    ✅ **RESPONDIDA em 05/09 — o código é seu, licenciado ao escritório.** Confirma o desenho que já estava de pé: **Regra Inegociável 3** manda que regra de negócio do escritório fique fora dos servidores MCP, justamente para que eles sirvam a outros clientes. A resposta transforma essa regra de higiene de arquitetura em **cláusula de contrato**. Ver **D-199**.

---

## Bloqueadores em resumo

> **Atualizado em 07/09.** Das 74 perguntas, **81 estão respondidas** — a Parte A6 inteira entrou — mais as derivadas 20a, 20b, 20d e 20e, que fecharam o rito de prazo. 🔴 **E a 30 abriu a maior pergunta ainda de pé na Parte A:** o escritório já usa **Astrea** e **Jusbrasil**, e parte do que E1 e E2 propõem pode estar duplicando o que já existe (D-210, R-71). O que sobra está abaixo — e a primeira linha é a que reorganiza todas as outras.

| Pergunta | Trava | Estado |
|---|---|---|
| **72 — o prazo: 10/09 ideal, 15/09 limite** | **O escopo inteiro** | 🔴 **Respondida, e e o novo eixo do projeto.** Em escopo fechado (73), o que nao couber precisa ser negociado agora. Ver **D-195** |
| **67–69 — WhatsApp: sem conta, sem numero, sem template** | E4 · Atendimento ao cliente | 🔴 **Nao cabe em 15/09 pelo caminho da Meta.** Verificacao de negocio e aprovacao de template levam semanas, e o tempo e da Meta. Ver **D-197** |
| **58 — plano do Escavador, a contratar em 08/09** | **E1 e E2**, integralmente | 🔴 **Caminho critico.** Cota expirada em 01/09, saldo zero. Sem contratacao na terca, nenhuma consulta roda |
| **65 — chave de API do Trello** | E3, e as perguntas 26–27 (Butler) | 🟡 **Em providencia.** O inventario do Butler precisa acontecer **antes** da primeira gravacao no Trello |
| ~~51–57 — infraestrutura~~ | Implantação dos MCP, banco da aplicação, cofre de segredos | ✅ **Respondidas em 05–06/09, por medição.** Em troca, deixaram uma lista de conserto: **R-62 a R-67**, e o **Portainer publicado na internet** é o mais urgente dela |
| **5 — responsavel interno** | Interlocutor unico das decisoes de negocio | ✅ **Respondida em 05/09 — Malu Souza** (D-200) |
| **6 — colaborador pode aprovar ato de prazo?** | Regra Inegociavel 2 e o botao de aprovacao (RN-09) | 🚧 **Aberta** — proposta em D-194 |
| ~~20a, 20b, 20d, 20e — os números do rito de prazo~~ | Configuração de E2 e do ciclo de aprovação (RF-13, RN-09) | ✅ **RESPONDIDAS em 07/09** (D-208). 2 h úteis no N1, 4 h até a Malu no N2, 4 h/2 h de expiração de aprovação, e a janela de reabertura **expira REABRINDO** — o lado seguro, e **R-68 cai** (D-209) |
| **30 — o escritório usa o Astrea** | **E1 e E2 podem estar duplicando o que já existe e já está pago** | 🔴 **NOVA em 07/09, e é a mais consequente da Parte A.** Quatro perguntas de levantamento em **D-210**; o risco de dois sistemas alertando o mesmo prazo está em **R-71**. Vai à Malu junto com a 20c |
| **33 — e também o Jusbrasil** | Escopo do MCP e o que se contrata no fornecedor em 08/09 | 🟠 **Nova em 07/09.** Segunda sobreposição: somar uma terceira fonte, ou substituir? A resposta muda a contratação de terça |
| **20c — horário útil** | **O relógio de toda a escalada de E2** — sem ele os números da D-208 não significam nada | 🚧 **Pendente, com data: terça (08/09)**, com a Malu. Cinco definições com proposta estão na A3; falta a **lista de feriados** |
| **20 (principal) — como o escritório confere prazo hoje** | Validação do rito antes de E2 entrar em operação | 🔴 **Aberta, e as cinco derivadas fecharam sem ela** |
| **16a → 15 — a Ana Beatriz não usa a caixa compartilhada** | Desenho da frente E3, e o alcance de R-11 | 🔴 **Nova, de 07/09.** São **seis** na conta, não sete: onde chega o e-mail dos processos dela? |
| **75 — a Ana Beatriz tambem vai de V1** | Vigilancia de prazo (E2) dos processos compartilhados | 🔄 **Reescrita em 05/09 (D-206).** A pergunta original era a frequencia do monitoramento por processo — **caiu**: com a Ana Beatriz atuando em outros escritorios, o V1 pelo nome dela custa R$ 3,00/mes contra R$ 55,20-72,00 e ainda cobre mais. **O que resta perguntar a Malu:** (a) confirma o V1 para a Ana Beatriz; (b) **quais dos processos dela o escritorio acompanha** — e a lista precisa existir, porque e a chave da triagem (RF-45); (c) o `limite_aparicoes` do monitoramento novo, que nao pode ser aumentado depois (R-46) |
| **Os numeros propostos** — franquia de aparicoes, tetos de bloco, tetos de orcamento | Configuracao de E2 e do disjuntor (D-149) | 🔴 **Aberto** — aguarda o de acordo do escritorio |
| **71 — teto de gasto mensal com IA** | Disjuntor no eixo de IA (Regra 6) | 🟡 **Adiada pelo usuario.** Nao trava a entrega; entra na lista de numeros que faltam |
| 15 — caixas de e-mail | Desenho da frente F3 | 🔴 Aberta |
| ~~16a — quantas pessoas usam a conta compartilhada~~ | Custo de reavaliar o Caminho A no futuro | ✅ **Respondida em 07/09 — seis** (Malu + as cinco colaboradoras). O Caminho A vira calculável, e **a Ana Beatriz ficou de fora**, o que alimenta a 15 |

| **Perguntas 7 a 14, 15, 17 a 22, 24, 25, 28, 29, 32** | Escopo fino de E3 e E4 | 🔴 **Sem resposta.** A3 e A5 voltaram parciais; **A2 e A4 ainda não foram ao escritório** |
| **38 e 39 — não há política de uso de IA nem decisão sobre dados fora do país** | O contrato (36), o R-72 e o desenho de matéria sensível (D-211) | 🔴 **Respondidas em 07/09 com "ainda não", e é isso que as torna urgentes.** A plataforma inteira depende de fornecedor fora do país, **o backup agora também** — e a decisão está sendo tomada por omissão (R-74) |
| **40 → D-211 — matéria sensível** | O que o automatismo pode fazer sozinho em família, criminal e menores | 🟠 **Respondida, e virou desenho.** Depende de classificação confiável, que falha em silêncio quando erra (R-73) |

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
