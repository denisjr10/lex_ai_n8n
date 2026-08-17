# Descoberta — Perguntas Abertas

| Campo | Valor |
|---|---|
| Status | Aberto — aguardando respostas |
| Versão | 0.1 |
| Data | 2026-08-17 |
| Finalidade | Levantar as informações que faltam para fechar o PRD. Dividido por destinatário. |

> **Como usar.** A Parte A é para o escritório (pode ser enviada como está). A Parte B é técnica, para quem administra os sistemas. A Parte C é sua, sobre contratos e infraestrutura. Nem toda pergunta bloqueia o início — as marcadas com 🚧 bloqueiam.

---

## Parte A — Para o escritório (negócio e operação)

### A1. Estrutura e pessoas

1. Quantos advogados e quantos colaboradores? Há estagiários com acesso distinto?
2. Existe hierarquia relevante além de "advogado / colaborador" — sócio, associado, coordenador de área?
3. O escritório é dividido por áreas de atuação (cível, trabalhista, tributário…)? O acesso deve ser segmentado por área?
4. 🚧 **Um advogado deve enxergar todos os processos do escritório ou apenas aqueles em que atua?** (Decisão D-07.)
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
16. Provedor: Google Workspace, Microsoft 365, outro?
17. Volume aproximado de e-mails/dia e proporção de spam.
18. Quais tipos de e-mail chegam com maior frequência? Quais são os críticos?
19. Como intimações e comunicações de tribunal chegam hoje — e-mail, sistema do tribunal, ambos?
20. Existe rotina atual de conferência de prazos? Quem faz e como?
21. Que tipos de anexo aparecem — PDF pesquisável, PDF digitalizado, imagem, áudio, planilha, .docx?
22. Existe modelo/padrão de resposta já usado pelo escritório?

### A4. Trello

23. 🚧 O Trello é o sistema de gestão de casos ou apenas quadro de tarefas? (Decisão D-09.)
24. Quantos quadros, e qual a lógica deles — por área, por cliente, por fase, por pessoa?
25. Qual o fluxo típico de um card, da criação ao encerramento?
26. Quais campos personalizados (Custom Fields) estão em uso?
27. Há Power-Ups ou automações (Butler) ativos? Quais?
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

| Pergunta | Trava |
|---|---|
| 59 — especificação da API do Escavador | **Início do mapeamento (Fase 1)** |
| 58 — plano contratado do Escavador | Escopo do MCP Escavador |
| 41 — versão e hospedagem do n8n | Desenho da orquestração |
| 4 — alcance do acesso do advogado | Matriz de privilégios (D-07) |
| 23 — papel do Trello | Prioridade da frente Trello (D-09) |
| 9 — situação do número de WhatsApp | Cronograma da frente F1 |
| 15 — caixas de e-mail | Desenho da frente F3 |
| 30 — software de gestão jurídica | Arquitetura de integração |
