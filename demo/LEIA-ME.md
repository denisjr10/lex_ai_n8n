# ⚠️ Isto é descartável e não é a arquitetura do projeto

**Esta pasta é uma maquete de demonstração, construída para ser jogada fora.**

Ela não tem controle de privilégio, não tem controle de custo, não tem auditoria e usa uma biblioteca não oficial de WhatsApp. Se você está lendo isto porque alguém sugeriu "ligar isso no número de verdade" ou "usar só um pouquinho enquanto o produto não fica pronto", **a resposta é não** — e as seções §3 e §4 explicam exatamente o que quebraria.

| Campo | Valor |
|---|---|
| Natureza | Maquete de vitrine · **descartável** |
| Branch | `claude/demo-vitrine` — apagada depois da apresentação |
| Vida útil prevista | Dias, não meses |
| Documento que a especifica | [`docs/11-nota-tecnica-demo.md`](../docs/11-nota-tecnica-demo.md) |
| Decisões que a governam | D-86 a D-94 · Riscos R-33 a R-36 ([`docs/01-diretrizes-gerais.md`](../docs/01-diretrizes-gerais.md) §13 e §15) |

---

## 1. Para que ela existe

O escritório pediu para ver algo funcionando antes de fechar o contrato. Isso é legítimo. Esta pasta atende esse pedido com o menor esforço possível: dois fluxos no n8n que **demonstram o comportamento** do produto sem construir a engenharia dele.

Ela também tem três objetivos técnicos próprios, que constam do critério de sucesso (§13 da nota técnica): produzir uma decisão comercial objetiva, responder perguntas abertas do PRD pela reação de quem assiste, e testar a hipótese mais frágil do produto — a de que o cliente aceita conversar com um robô sobre o próprio processo.

## 2. O que ela demonstra

| # | Cena | Regra do projeto que fica visível |
|---|---|---|
| A1 | Colaborador pergunta pelo processo no Telegram e recebe um resumo em linguagem clara | — |
| A2 | Agente redige um retorno ao cliente e **para**, pedindo aprovação com botão | **Regra 2** — a IA propõe, o humano dispõe |
| A3 | Alguém fora da lista tenta usar o bot e é recusado antes de qualquer consulta | **Regra 5** — negar por padrão |
| B1 | Cliente pergunta pelo processo no WhatsApp e recebe resposta sem juridiquês | — |
| B2 | Cliente pede o processo de um terceiro e é recusado | **Regra 1** — a verificação está no código, não no prompt |
| B3 | A recusa vira pedido de atendimento humano no Telegram do colaborador | — |

**O momento central:** aprovar em A2 dispara o envio em B1. A mensagem sai do Telegram do advogado e chega no WhatsApp do cliente **porque um humano clicou**.

## 3. O que esta pasta NÃO tem — e por quê

Cada ausência abaixo é deliberada. Nenhuma é "a gente adiciona depois".

| Componente do produto | Aqui | Por que foi omitido | O que acontece sem ele |
|---|---|---|---|
| `mcp-core` — o chassi | ❌ Ausente | Construí-lo para uma vitrine de dias é desperdício. Está sendo feito em paralelo, no lugar certo | Não existe caminho verificado até a API. Cada fluxo faz o que quiser |
| Policy Gate e matriz de escopo | ❌ Lista fixa no n8n | Uma lista com 3 nomes e 2 telefones demonstra o conceito | Privilégio não escala nem se audita. Mudar quem pode o quê é editar workflow na mão |
| Motor de custo, reserva, disjuntor | ❌ Ausente | A demo não chama API paga | **Ligada a uma API de verdade, a exposição financeira fica aberta.** Um cliente curioso vira uma fatura |
| Auditoria | ⚠️ Log simples do n8n | Suficiente para mostrar "quem pediu o quê" | Sem trilha nominal. Não serve para responsabilização nem para LGPD |
| Isolamento entre carteiras | ❌ Ausente | Só há um processo na demo | Com dois clientes reais, nada impede um ver o dado do outro |
| Tratamento de prazo | ❌ Ausente | Fora do roteiro | **Nada aqui vigia prazo.** Confiar nisso realiza o R-02 |
| WhatsApp oficial (API da Meta) | ❌ Uazapi | Homologação não cabe no prazo da vitrine | Viola os termos do WhatsApp. Risco de banimento do número (R-08) |
| Fonte do dado ao vivo | ❌ Instantâneo congelado | Consulta ao vivo custa por chamada | **O dado envelhece e ninguém percebe.** Depois de alguns dias, a demo mente com convicção |

## 4. Se alguém sugerir colocar isto em uso

Cinco perguntas. Se qualquer resposta for "não sei" ou "ainda não", isto não vai para produção:

1. Quem pode consultar o processo de quem — e **onde essa regra está escrita em código verificável**, não em texto de prompt?
2. Quanto o escritório vai gastar no Escavador se dez clientes conversarem com o robô na mesma tarde — e **o que interrompe o gasto** quando o teto for atingido?
3. Se um cliente receber informação errada, **quem consultou o quê e quando** — com nome, não com "o sistema"?
4. O número de WhatsApp em uso é **descartável**? Se for banido amanhã, o escritório perde o canal de atendimento?
5. O dado que o agente está respondendo é **de quando**?

O produto de verdade responde as cinco. Esta pasta não responde nenhuma. É por isso que ela é descartável — não por ser feia, mas por ser **incompleta de propósito** nos pontos que mais importam.

## 5. Condições de uso da Uazapi

A [D-10](../docs/01-diretrizes-gerais.md) decide "somente WhatsApp oficial, sem biblioteca não oficial". A [D-89](../docs/11-nota-tecnica-demo.md) abre uma exceção **exclusiva para esta pasta**, sob três condições que não se negociam:

1. **Número descartável.** Chip novo, comprado para isto. **Jamais** o número de atendimento do escritório
2. **Lista de permissão fechada.** Só números cadastrados manualmente. Nenhum cliente real recebe mensagem
3. **Ressalva por escrito.** O escritório sabe que produção exige a API oficial da Meta, com prazo, homologação e custo próprios

E, por [D-90](../docs/11-nota-tecnica-demo.md): **nenhum cliente real participa sem consentimento por escrito.** O papel de cliente é feito por alguém do escritório ou pelo próprio responsável pelo projeto.

## 6. Superfície — o que a demo alcança

Por [D-93](../docs/11-nota-tecnica-demo.md), a demo **não escreve em nenhum sistema real do escritório**.

| Sistema | Acesso |
|---|---|
| Arquivo de instantâneo (local) | 📖 Leitura |
| Telegram — bot da demo | 💬 Mensagem para a lista |
| WhatsApp — chip descartável | 💬 Mensagem para a lista |
| Trello, e-mail, Drive, Escavador ao vivo | 🚫 **Nenhum.** Nem leitura |

## 7. Conteúdo da pasta

| Arquivo | O que é |
|---|---|
| `LEIA-ME.md` | Este documento |
| `instantaneo/` | As respostas do Escavador, **anonimizadas** — CPF, CNPJ e nome de parte substituídos por marcadores (D-48) |
| `workflows/` | Os fluxos do n8n exportados em JSON, para importar na instância |
| `listas/` | Listas de permissão: quem pode usar o bot, e qual número vê qual processo |

**Nada de credencial entra aqui.** Token, chave de API e segredo ficam nas credenciais do n8n, nunca em arquivo do repositório.

## 8. Como descartar

Depois da apresentação:

1. Escrever `docs/12-nota-tecnica-demo-resultados.md` — o que a demo ensinou e como o escritório reagiu. **Este é o único produto duradouro da demo**
2. Desligar o bot do Telegram e a instância da Uazapi
3. Apagar a branch `claude/demo-vitrine`

Os `docs/` ficam intactos — eles nunca foram cópia, sempre foram os mesmos arquivos.

## 9. Onde está a coisa de verdade

| Você quer | Leia |
|---|---|
| Entender o projeto | [`docs/00-estado-atual.md`](../docs/00-estado-atual.md) |
| As regras que não se negociam | [`docs/01-diretrizes-gerais.md`](../docs/01-diretrizes-gerais.md) |
| O que o produto faz | [`docs/08-prd.md`](../docs/08-prd.md) |
| Como o produto é construído | [`docs/09-spec-tecnica.md`](../docs/09-spec-tecnica.md) |
| Por que esta pasta existe e como ela morre | [`docs/11-nota-tecnica-demo.md`](../docs/11-nota-tecnica-demo.md) |

---

> **Última palavra.** O que se vê funcionando aqui é o mínimo. O que não se vê é o que impede um vazamento de dado de cliente e um prejuízo em conta de API. Essa diferença é o projeto inteiro.
