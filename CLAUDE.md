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

| Item | Valor |
|---|---|
| Saldo | **R$ 50,00** |
| Custo por requisição | **R$ 3,00 — plano, para qualquer rota** |
| Teto de requisições | **16** |
| Validade | **10 dias** a partir da liberação |

Não há recarga contratada. Uma recarga paga só acontece quando for **realmente necessária** — e essa é uma decisão do usuário, nunca uma consequência de uma chamada exploratória.

**Regras operacionais:**

1. **Toda chamada gasta R$ 3,00.** Não existe rota gratuita durante a cota de teste. Rotas marcadas 🆓 nos mapeamentos custam o mesmo que as pagas
2. **Só chame o que está no orçamento** de `docs/06-orcamento-de-chamadas-escavador.md`. Chamada fora dele exige aval explícito do usuário, na hora
3. **Não gaste chamada para descobrir o que a documentação já responde.** Consulte `docs/mapeamento-escavador.md`, o OpenAPI e o SDK oficial primeiro
4. **Uma chamada, um objetivo registrado.** Toda resposta recebida vai para o orçamento com o que ela ensinou — resposta não anotada é crédito jogado fora
5. **Nunca repita uma chamada já feita.** Guarde a resposta bruta em arquivo e releia dali
6. **Nada de laço, lote ou varredura.** Nenhum script que chame a API mais de uma vez por execução
7. **Cuidado com custo recorrente.** Criar monitoramento gera cobrança periódica. Se criar um para teste, remova ao terminar

**A tabela de preços por rota continua pendente.** Como a cota de teste cobra R$ 3,00 fixo, ela não revela o preço real de nada — os preços continuam vindo só do painel autenticado.

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

**Rede** — o ambiente foi configurado em modo `Custom` liberando `*.escavador.com`, `*.atlassian.com`, `developer.atlassian.com` e `api.trello.com`. Se algum desses retornar 403, a sessão iniciou antes da mudança valer — avise o usuário.

**SDK do Escavador** — `/workspace/` não persiste entre sessões. Para reler o SDK oficial (fonte primária útil no mapeamento):

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 \
  https://github.com/Escavador/escavador-python \
  /workspace/escavador/escavador-python
```

Tráfego do GitHub usa proxy próprio e funciona independentemente da política de rede.

**Ainda sem acesso** — instância n8n do cliente, credenciais do Escavador e do Trello.

## O que este projeto ainda não é

Não existe código. O trabalho até aqui é de definição: diretrizes, notas técnicas e modelo de identidade. Fases 0 e 1. Não comece a implementar sem que a etapa correspondente tenha sido acordada com o usuário.
