# CLAUDE.md — Instruções do projeto

Plataforma de automação e agentes de IA para escritório de advocacia, orquestrada em **n8n**, com integrações construídas como **servidores MCP reutilizáveis**.

## Antes de responder qualquer coisa

Leia, nesta ordem:

1. **`docs/00-estado-atual.md`** — onde o projeto está agora, o que está pendente, qual o próximo passo. **Sempre comece por aqui.**
2. **`docs/01-diretrizes-gerais.md`** — escopo, princípios, arquitetura, matriz de privilégios, registro de decisões (§13) e riscos (§15).
3. Os demais documentos conforme a tarefa.

A conversa anterior não vem junto numa sessão nova. **Os documentos são a memória do projeto** — eles estão completos e são a fonte da verdade.

## Idioma

**Todo o conteúdo do projeto é em português do Brasil** — documentos, mensagens de commit e respostas ao usuário. Identificadores de código em inglês, seguindo a convenção usual de programação.

## Interlocutor

O usuário é o desenvolvedor responsável pelo projeto, **não é programador experiente**. Explique escolhas técnicas em linguagem clara, sem jargão desnecessário, e sempre com o "porquê" junto do "o quê". Ele decide; você recomenda com posição definida.

O cliente final é um escritório de advocacia. O usuário faz a ponte — não fale com o escritório diretamente.

## Regras inegociáveis

Estas não se renegociam sem decisão formal registrada. Se uma tarefa parecer exigir violar uma delas, **pare e levante a questão**.

| # | Regra |
|---|---|
| 1 | **O agente de IA nunca é a fronteira de segurança.** Privilégio se aplica como escopo verificado em código no servidor MCP, jamais por instrução no prompt |
| 2 | **A IA propõe, o humano dispõe.** Ação de efeito externo exige aprovação; ato com efeito jurídico ou de prazo exige aprovação de advogado identificado |
| 3 | **Regra de negócio do escritório não entra em servidor MCP.** Os MCP são genéricos e reutilizáveis; a regra vive no n8n ou no Policy Gate |
| 4 | **Conteúdo externo é hostil.** E-mail, anexo e mensagem de cliente nunca alimentam diretamente um agente com poder de ação |
| 5 | **Negar por padrão, e falha fecha.** Sem lista de permissão explícita, nega. Governança indisponível bloqueia em vez de liberar |
| 6 | **Custo é requisito funcional.** A API do Escavador cobra por crédito; quota, cache e disjuntor fazem parte da funcionalidade |
| 7 | **Nada de conta compartilhada.** Identidade individual é pré-requisito (ver R-11) |
| 8 | **Crédito do Escavador é orçamento fechado.** Nenhuma chamada à API sem constar do orçamento aprovado (ver abaixo). Na dúvida, não chame — pergunte |

## Orçamento de créditos do Escavador — **leia antes de chamar a API**

O projeto opera hoje sobre uma **cota de teste**, liberada pelo suporte do Escavador Business:

🔴 **A cota de teste EXPIROU em 01/09/2026. O saldo hoje é R$ 0,00** — o dinheiro não gasto evaporou, porque saldo de teste não vira crédito. **Nenhuma chamada à API do Escavador é possível hoje**, e um `403` do fornecedor significa saldo bloqueado, não problema de rede nem de credencial.

**O saldo não é escrito aqui.** Ele mora no cabeçalho de [`docs/06-orcamento-de-chamadas-escavador.md`](docs/06-orcamento-de-chamadas-escavador.md), que é a sede única — e o hook `estado-do-repo.mjs` lê de lá e entrega no início de cada sessão. Até 09/09 o número estava copiado à mão aqui, no hook e em mais dois documentos, todos divergentes e todos desatualizados havia dias. Valor copiado é valor que envelhece.

| Item | Valor |
|---|---|
| Saldo, validade, recarga | Ver o cabeçalho de `docs/06-orcamento-de-chamadas-escavador.md` |
| Custo por requisição | **Varia por rota.** ~~R$ 3,00 plano~~ — o suporte afirmou tarifa plana, a medição desmentiu: R$ 0,05, R$ 2,95 e R$ 0,00 no mesmo dia (D-108) |
| Teto de requisições | **Não existe** (D-119). A cota é de dinheiro, e só |
| ⚠️ Custo recorrente ativo | **Monitoramento `2813617`** — assinatura mensal criada em 26/08. **Remover até 22/09, e antes de qualquer recarga** |

Não há recarga contratada. Uma recarga paga só acontece quando for **realmente necessária** — e essa é uma decisão do usuário, nunca uma consequência de uma chamada exploratória.

**Regras operacionais:**

1. **O custo varia por rota, e existem rotas gratuitas.** Medido em 26/08: `movimentacoes`, `origens`, `status-atualizacao`, `solicitar-atualizacao`, criar monitoramento e as entregas de callback vieram todas com `Creditos-Utilizados: 0`. A regra da tarifa plana caiu (D-108) — **mas isso não afrouxa nada**: gratuito se confirma pelo cabeçalho medido, nunca por suposição, e chamada fora do orçamento continua exigindo aval
2. **Só chame o que está no orçamento** de `docs/06-orcamento-de-chamadas-escavador.md`. Chamada fora dele exige aval explícito do usuário, na hora
3. **Não gaste chamada para descobrir o que a documentação já responde.** Consulte `docs/mapeamento-escavador.md`, o OpenAPI e o SDK oficial primeiro
4. **Uma chamada, um objetivo registrado.** Toda resposta recebida vai para o orçamento com o que ela ensinou — resposta não anotada é crédito jogado fora
5. **Nunca repita uma chamada já feita.** Guarde a resposta bruta em arquivo e releia dali
6. **Nada de laço, lote ou varredura.** Nenhum script que chame a API mais de uma vez por execução
7. **Cuidado com custo recorrente.** Criar monitoramento gera cobrança periódica. Se criar um para teste, remova ao terminar

**A tabela de preços por rota está sendo construída pela medição.** A cota de teste cobra pelo catálogo real, então cada chamada calibra um preço — o valor medido fica na §5 de `docs/06-orcamento-de-chamadas-escavador.md`, com data.

**Declaração do fornecedor é indício, nunca fonte (R-44).** Três vezes o Escavador disse uma coisa e o sistema fez outra: a tarifa plana que não existe, a prorrogação prometida que não constava da conta (R-37), e o texto de erro do painel, que é genérico por código HTTP e aponta a causa errada. **Diagnóstico sai do corpo bruto gravado em `captura/respostas-brutas/`, nunca do painel** (D-120).

## Convenções de trabalho

**Documentos** — `docs/NN-nome.md`, numerados na ordem em que foram criados. Mapeamentos de API ficam sem número (`docs/mapeamento-escavador.md`). Todo documento abre com uma tabela de status, versão e data.

**Decisões** — identificadas `D-nn`, registradas na tabela §13 de `01-diretrizes-gerais.md`, com estado 🟡 Proposta · ✅ Confirmada · 🔴 Em aberto. Uma nota técnica nova gera decisões, que **devem** ser somadas àquela tabela — o registro é único e centralizado.

**Riscos** — `R-nn`, na tabela §15 de `01-diretrizes-gerais.md`.

**Perguntas de descoberta** — numeradas em `docs/02-descoberta-perguntas-abertas.md`; 🚧 marca as que travam algo.

**Ao terminar trabalho relevante** — atualize `docs/00-estado-atual.md`, faça commit descritivo em português e envie para a branch de trabalho.

**Verificação antes de afirmar** — a documentação de APIs e planos muda. Consulte a fonte em vez de responder de memória, e diga de onde veio a informação.

## Branch

Trabalhe sempre em **`claude/law-firm-ai-automation-6pwaug`**. Envie com `git push -u origin claude/law-firm-ai-automation-6pwaug`. Não abra pull request sem o usuário pedir.

## Ambiente

**Máquina** — Windows 11, em `C:\Users\denis\OneDrive\Documentos\GitHub\lex_ai_n8n`. PowerShell é o terminal principal, com Bash também disponível — cada um com a sua sintaxe. Node ≥ 22. O PostgreSQL de desenvolvimento sobe com `npm run banco:subir` (Docker, porta 5433).

**Diagnóstico de `403`** — um 403 do Escavador **é saldo bloqueado**, e o corpo da resposta diz isso: `{"error":"Seu saldo está bloqueado. Faça uma recarga..."}`. Não repita a chamada e não rotacione token: avise o usuário (R-22). *Até 09/09 esta seção mandava ler qualquer 403 como "a sessão começou antes de a liberação de rede valer" — diagnóstico de um ambiente em nuvem que não é este, e que levava direto a repetir a chamada.*

**SDK do Escavador** — o mapeamento já está concluído em `docs/mapeamento-escavador.md`. Se precisar reler a fonte oficial, clone em um diretório temporário desta máquina:

```bash
git clone --depth 1 https://github.com/Escavador/escavador-python
```

**Acessos** — falta **apenas o Trello** (chave de API, token e segredo da aplicação), e ele virou bloqueador de E2 pela D-226.

- **n8n:** ✅ em uso desde 26/08. Chave em `demo/n8n.local`, instância `auto.criativeia.com.br` levantada em 05/09. ⚠️ A chave **não tem escopo** (R-38): alcança a instância inteira, com 194 workflows que não são deste projeto. Nada de operação destrutiva.
- **Escavador:** ✅ token funcional. Mas a cota expirou — sem chamada possível.

## Onde o projeto está

**Fase 3 — construção.** Marcos 1, 2 e 3 fechados (fundação, chassi e auditoria), os três verificados.

**Os números estão em [`docs/numeros.md`](docs/numeros.md)** — gerado por `node ferramentas/contar.mjs`, nunca escrito à mão. Não copie número de lá para outro documento: aponte. A revisão de 09/09 encontrou a pilha de decisões com cinco contagens diferentes, todas do mesmo dia, e nenhuma igual ao disco.

O que **não** existe ainda, e é bom saber antes de propor trabalho: os dois servidores MCP, os dois SDKs e o Policy Gate são casca (`export {}`) — marcos 6, 7 e 9. O verificador de privilégio existe (`packages/mcp-core`); o servidor onde ele roda, não.

**Não abra marco novo sem acordo com o usuário.** O estado corrente, com o próximo passo, está em `docs/00-estado-atual.md`; o que fazer agora, em `docs/17-plano-de-execucao.md`.
