# Descoberta — Perguntas Abertas

| Campo | Valor |
|---|---|
| Status | **Parcialmente respondido** — cinco perguntas que travavam o PRD voltaram em 27/08; quatro novas nasceram delas |
| Versão | 0.2 |
| Data | 2026-08-27 (criado em 2026-08-17) |
| Finalidade | Levantar as informações que faltam para fechar o PRD. Dividido por destinatário. |

> **Como usar.** A Parte A é para o escritório (pode ser enviada como está). A Parte B é técnica, para quem administra os sistemas. A Parte C é sua, sobre contratos e infraestrutura. Nem toda pergunta bloqueia o início — as marcadas com 🚧 bloqueiam.

---

## Parte A — Para o escritório (negócio e operação)

### A1. Estrutura e pessoas

1. Quantos advogados e quantos colaboradores? Há estagiários com acesso distinto?
2. Existe hierarquia relevante além de "advogado / colaborador" — sócio, associado, coordenador de área?
3. O escritório é dividido por áreas de atuação (cível, trabalhista, tributário…)? O acesso deve ser segmentado por área?
4. ✅ **RESPONDIDA em 27/08 — base inteira.** *"Os advogados têm acesso à base inteira, pois eles se ajudam nos processos um do outro."* Decisão D-07 resolvida; ver D-146 e PRD §3.1. Três desdobramentos:
    - **4a.** 🚧 **E o colaborador?** A resposta falou de advogados. O colaborador (equipe administrativa, estagiários, paralegais) também enxerga a base inteira, ou fica restrito aos processos da área/carteira em que trabalha? *(Até a resposta, ele segue restrito — é o padrão seguro.)*
    - **4b.** 🚧 **Quantos processos ativos o escritório tem, aproximadamente?** Cem, quinhentos, dois mil? Ordem de grandeza basta. *(A API cobra por bloco de 200 resultados — este número dimensiona o custo de qualquer consulta ampla. Premissa P-07.)*
    - **4c.** 🚧 **Existe algum cliente que é parte em muitos processos** — uma empresa, um banco, uma prefeitura, uma operadora — que sozinho passe de 200 processos? *(Se existir, é ele que faz a conta explodir, e precisa de tratamento próprio.)*
5. Quem será o responsável interno pelo projeto — a pessoa que aprova decisões e tira dúvidas?
6. Quem aprova respostas a clientes hoje? Isso muda por tipo de assunto ou por valor da causa?

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

### B1. n8n

41. 🚧 Versão do n8n e forma de hospedagem (n8n Cloud, self-hosted, Docker).
42. Modo de execução: regular ou queue mode? Quantos workers?
43. Banco de dados do n8n: SQLite ou PostgreSQL?
44. Nós de IA e MCP disponíveis nessa versão? (AI Agent, MCP Client Tool, MCP Server Trigger.)
45. Já existem workflows em produção? Quais, e podem ser afetados?
46. Como os workflows são versionados hoje — se são?
47. Há URL pública/webhook exposto? Com que proteção?
48. Quais credenciais já estão configuradas no n8n?
49. Existe ambiente de homologação separado?
50. Recursos disponíveis (CPU, memória, disco) e limites de execução.

### B2. Infraestrutura

51. Onde a infra está hospedada — provedor e região?
52. Há PostgreSQL disponível para uso da aplicação, ou precisa ser provisionado?
53. Como os servidores MCP serão implantados — mesmo host do n8n, containers separados?
54. Há gerenciador de segredos, ou os segredos vivem no n8n?
55. Política de backup atual: o quê, com que frequência, e já foi testada uma restauração?
56. Monitoramento e alertas existentes?
57. Quem tem acesso administrativo à infra?

---

## Parte C — Contratos e credenciais (para você)

### C1. Escavador

58. 🚧 **Qual plano da API do Escavador está contratado?** (Define a superfície disponível para o MCP.)
59. 🚧 **É possível obter a especificação da API (OpenAPI/Swagger/PDF) para colocar no repositório?** Necessário enquanto o egress estiver bloqueado — ver R-01.
60. Há ambiente de teste/sandbox, ou toda chamada consome crédito real?
61. Saldo e consumo médio atual de créditos.
62. A API v1 ainda é usada para algo que a v2 não cobre?
63. Há contratação do módulo de autos com certificado digital?
64. Webhooks de monitoramento já são usados hoje? Para onde apontam?

### C2. Trello

65. Já existe API Key / Token gerado? Vinculado a qual conta?
66. É possível criar uma conta de serviço dedicada, em vez de usar conta pessoal?

### C3. WhatsApp

67. Já existe conta no WhatsApp Business Platform / Meta Business Manager?
68. Prefere ir direto pela Meta ou por um BSP (Twilio, 360dialog, Z-API, Gupshup, Take Blip)?
69. Há templates de mensagem já aprovados?

### C4. Modelos de IA

70. Já existe conta e chave de API para o provedor de modelos?
71. Existe teto de gasto mensal definido para IA?

### C5. Projeto

72. Prazo esperado — há data crítica?
73. Modelo de contratação: escopo fechado, horas, ou fases?
74. O código será de propriedade do escritório ou seu, licenciado a ele? (Impacta diretamente o reuso dos servidores MCP em outros projetos — vale definir cedo.)

---

## Bloqueadores em resumo

As perguntas 🚧 são as que travam alguma coisa:

| Pergunta | Trava | Estado |
|---|---|---|
| ~~59 — especificação da API do Escavador~~ | Início do mapeamento (Fase 1) | ✅ Resolvida — os dois mapeamentos estão prontos |
| ~~41 — versão e hospedagem do n8n~~ | Desenho da orquestração | ✅ Resolvida — a instância é do prestador e já está em uso (D-148) |
| ~~4 — alcance do acesso do advogado~~ | Matriz de privilégios (D-07) | ✅ **Respondida em 27/08 — base inteira** (D-146) |
| ~~23 — papel do Trello~~ | Prioridade da frente Trello (D-09) | ✅ **Respondida em 27/08 — quadro de trabalho** (D-152) |
| ~~16b / 16c — licenças individuais do Workspace~~ | Modelo de identidade do projeto (D-21, R-11) | ✅ **Respondida em 27/08 — Caminho B, pelo Telegram** (D-147) |
| **4a — alcance do acesso do colaborador** | Matriz definitiva de escopos (Spec Parte II) | 🚧 **Nova, aberta** |
| **4b / 4c — volume da carteira e cliente de alto volume** | Tetos de bloco e premissa P-07 (PRD §9.2, §11.1) | 🚧 **Nova, aberta** |
| **20a–20d — rito do alerta de prazo e expiração de aprovação** | Configuração de E2 e do ciclo de aprovação (RF-13, RN-09) | 🚧 **Nova, aberta** |
| 58 — plano contratado do Escavador | Escopo do MCP Escavador | 🟡 Saldo em providência |
| 9 — situação do número de WhatsApp | Cronograma da frente F1 | 🟡 Em providência |
| 15 — caixas de e-mail | Desenho da frente F3 | 🔴 Aberta |
| 16a — quantas pessoas usam a conta compartilhada | Custo de reavaliar o Caminho A no futuro | 🔴 Aberta |
| 30 — software de gestão jurídica | Arquitetura de integração | 🔴 Aberta |
| **Os números propostos** — franquia de aparições, tetos de bloco, tetos de orçamento | Configuração de E2 e do disjuntor (D-149) | 🔴 **Aberto — aguarda o de acordo do escritório** |
