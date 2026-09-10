# Revisão geral do projeto — achados e plano de execução

| Campo | Valor |
|---|---|
| Status | **Vivo — este documento é o roteiro de execução da revisão** |
| Versão | 1.0 |
| Data | 2026-09-09 · atualizado em 2026-09-10 |
| Origem | Revisão completa do repositório feita em 09/09/2026, em seis frentes de auditoria |
| Decisões geradas | D-232 a D-244 (ver [`01-diretrizes-gerais.md`](01-diretrizes-gerais.md) §13) |
| Riscos gerados | R-84 a R-88 (ver [`01-diretrizes-gerais.md`](01-diretrizes-gerais.md) §15) |
| Documentos afetados | `00-estado-atual.md`, `01-diretrizes-gerais.md` (§13 e §15), `CLAUDE.md`, e os listados no Bloco 3 |
| Números | Nenhum número escrito à mão aqui. Ver [`numeros.md`](numeros.md) (D-232) |

---

## Como usar este documento

> **Para a sessão que está lendo isto:** este é o **roteiro vivo** da revisão de 09/09.
> Ele existe porque um `/clear` apagou a sessão que fez a revisão, e o plano só
> vivia no contexto. O disco é a memória do projeto; o contexto, não.

**O protocolo, em três regras:**

1. **Antes de trabalhar num item**, leia a linha dele aqui. A coluna *Estado* diz se já foi feito, e a coluna *Prova* diz onde conferir.
2. **Ao terminar um item**, marque-o na mesma hora — estado, commit e o que mudou. Não deixe para o fim da sessão: o fim da sessão é justamente o que pode não chegar.
3. **Se um achado cair** (a revisão errou, ou o projeto já tratava aquilo), **não apague a linha** — marque ⛔ e escreva por quê. O registro de que a suposição existiu e falhou vale mais que a tabela limpa.

**Convenção de estado:**

| Marcador | Significa |
|---|---|
| ✅ | Feito e verificado, com commit apontado |
| 🔴 | Pendente e urgente |
| 🟠 | Pendente, obrigatório antes do primeiro dado real de cliente |
| ⬜ | Pendente, sem urgência marcada |
| 👤 | Depende do usuário — conversa com o escritório, painel de fornecedor, decisão de negócio |
| ⛔ | Achado derrubado — a revisão errou, e a explicação fica na linha |

---

## A tese, em um parágrafo

Quase tudo que a revisão encontrou é sintoma de **um único defeito de método**: o projeto guardava o mesmo fato em vários lugares, escrito à mão, sem nada que conferisse se os lugares concordavam. Foi assim que nasceram as cinco contagens de decisões, os quatro números errados no cabeçalho do estado atual, as nove decisões com estado divergente e o saldo do Escavador em três arquivos e um hook, todos diferentes. **Corrigir os números um a um resolveria hoje e não resolveria em outubro.** Por isso o Bloco 1 valeu mais do que parecia: ele trocou "lembrar de atualizar" por "o commit não fecha se estiver errado".

---

## Painel de execução

**Fechados:** Blocos 1 e 2 inteiros. **O Bloco 2 fechou em 10/09.**
**Próximo:** o Bloco 3 — 14 correções pontuais de documentação, ~7 h, divisível. O Bloco 0 continua sendo seu.

### BLOCO 0 — Antes da conversa com a Malu

*Caminho crítico dos próximos dias. Nada aqui é técnico, e nada aqui é meu: é decisão sua.*

| # | Item | Estado | Prova / observação |
|---|---|---|---|
| 0.1 | **Não dar o aval em bloco (P-02) antes de três consertos:** riscar a parte revogada da D-63 (a D-144 já a derrubou), criar o bloco B19 no digesto com D-228/D-229/D-230 — que hoje não estão em grupo nenhum —, e reescrever o parágrafo de aval com os números do quadro §3.0 | 👤 🔴 | É o único item da revisão que, se ignorado, produz **registro formal falso assinado por você**. ~20 min |
| 0.2 | **Reescrever a lista "O que levar à Malu"**, que hoje omite os dois assuntos de efeito contratual: a D-219 (mover a data de 15/09) e a D-226/P-28 (mudança de escopo do Trello) | 👤 🔴 | ~10 min |
| 0.3 | **Tratar o R-02 como travado, não mitigado.** A única mitigação escrita é "rotina humana preservada", e o R-75 mostrou que **ninguém vigia prazo no escritório hoje** | 👤 🔴 | Muda o status da pergunta 20: de "informação útil" para **bloqueadora de produção**. ~10 min |
| 0.4 | **Remover a assinatura `2813617` do Escavador até 22/09**, e antes de qualquer recarga | 👤 ⚠️ | Assinatura mensal ativa em conta sem saldo. Pelo painel — a remoção por API pode ser recusada por saldo bloqueado |

### BLOCO 1 — A hora que eliminou uma classe inteira de defeito

*Fechado em 09/09. Se fosse para fazer um bloco só, era este.*

| # | Item | Estado | Prova |
|---|---|---|---|
| 1.1 | **`ferramentas/contar.mjs`** conta do disco e grava `docs/numeros.md`, a sede única. Campo não medido sai como `—`, nunca como zero | ✅ | `aa444ba`, corrigido em `30ebedb` (arquivo novo só contava depois do commit) e `5cb3387` (provas de banco medidas) |
| 1.2 | **`fechar-ciclo.mjs` recusa encerrar** a sessão com número divergente | ✅ | `aa444ba`. Barreira testada na prática: pegou um defeito **dela própria** no dia seguinte |
| 1.3 | **`CLAUDE.md` corrigido** — as quatro afirmações falsas: o "não existe código", a cota viva, os acessos que faltavam e a máquina que não era esta | ✅ | `aa444ba` |
| 1.4 | **O hook `estado-do-repo.mjs` lê o orçamento** do `docs/06` em vez de repetir o saldo cravado no código | ✅ | `aa444ba`. Gerou a **D-233** |
| 1.5 | **Integração contínua** — `.github/workflows/verificar.yml` roda `npm run verificar` a cada envio | ✅ | `aa444ba`. Registrada como **D-242** |

### BLOCO 2 — Antes do primeiro dado real de cliente

*Metade fechada em 09/09 (`bc954d6`). Nada aqui é urgente esta semana; tudo aqui é obrigatório antes de a plataforma tocar em processo de verdade.*

| # | Item | Estado | Prova / próximo passo |
|---|---|---|---|
| 2.1 | **Travar a faixa A4** enquanto o Policy Gate e a identidade nominal não existirem | ✅ **Feito, mas não como a revisão pediu** | Trava na **execução**, não na carga, por escolha do usuário em 09/09. `etapaAprovacao` recusa a A4 depois de conferir tudo o mais — assim "falta aprovação" e "estagiário não aprova" continuam respondendo o que é mais útil, e a trava só pega o caminho feliz. 117 testes, dois novos. ⚠️ **A premissa do achado original era falsa.** A revisão dizia *"hoje não existe ferramenta A4 nenhuma, a trava não incomoda ninguém"*. Existe: `testes/ajuda.mjs:94` declara `peticionar` como A4, e é o alicerce de toda a suíte do chassi. Implementada como a revisão pedia — recusa na **carga** —, ela derrubou **47 dos 118 testes**, porque o alicerce deixa de carregar. Revertida no mesmo turno; a árvore está verde. Ver a nota abaixo. → **D-236** |
| 2.2 | **A sessão precisa chegar assinada**, e o chassi não pode aceitar objeto `Sessao` pronto vindo de fora | ✅ **Feito — a trava possível, não a definitiva** | A verificação de assinatura é do marco 9 e depende do Policy Gate emitir o token. O que dava para travar hoje foi feito: `ConfiguracaoDoChassi` ganhou o campo **obrigatório** `origem_da_sessao`, sem padrão — sem ele o chassi recusa a chamada —, e declarar `'verificada'` é recusado enquanto o chassi não souber conferir assinatura. A lacuna deixou de ser invisível e virou declaração escrita. 120 testes, três novos. ⚠️ **A segunda metade do achado era falsa:** o `13-chassi-marco-2.md` **não** declarava a etapa concluída — ele escopa a etapa 2 a *"validade e lista de revogação"* e defere a assinatura ao marco 9 na §8. Quem superdeclarava era a **Spec**, §4.2 e §5.3, e foi lá que a correção entrou. → **D-237** |
| 2.3 | **`identidade_externa` e `reserva_orcamento`:** `inquilino_id`, política por linha, chave composta, e a busca global de login virando função dedicada | ✅ **Feito — opção (a), escolhida por você** | Migração **014**. As duas tabelas entraram na política: **20 de 23** agora, eram 18. A porta única do login é `identidade_para_login(provedor, identificador)`, `SECURITY DEFINER`, que devolve **só** `inquilino_id` e `usuario_id`. 🔴 **O índice de unicidade NÃO virou composto, e isso é o ponto:** com `UNIQUE (inquilino_id, provedor, identificador)` o mesmo WhatsApp poderia ser pessoa diferente em dois escritórios, em silêncio — a conta compartilhada que a Regra 7 existe para impedir (R-11). O isolamento é da **leitura**; a unicidade da identidade é do **sistema**. **52 provas de regra**, seis novas. → **D-239** |
| 2.4 | **`conferirPapel()` dentro de `abrirConexao`** — a conferência do papel deixou de ser opcional | ✅ | `bc954d6`. Importa porque a migração 010 não usa `FORCE ROW LEVEL SECURITY`: era disciplina, virou trava. → **D-240** |
| 2.5 | **Tetos de tamanho no receptor de callbacks** — teor 200 KB, nome 300 caracteres, 200 envolvidos, profundidade de JSON 32. Estourar **não descarta** | ✅ **Feito — com uma correção no remédio** | Migração **015** e `services/receptor-callbacks/src/limites.ts`. ⚠️ **A recomendação era gravar com `estado = 'truncado'`, e isso não funciona:** `estado` é o ciclo de vida, e o índice de não processados é `WHERE estado = 'recebido'`. Um evento marcado `'truncado'` sairia do índice e **nunca seria processado** — o remédio contra o descarte em silêncio viraria uma forma nova de descarte em silêncio. Truncagem virou **coluna própria** (`jsonb`, dizendo o que estourou e por quanto), e o evento segue `'recebido'`. O teto de profundidade é o único que também é defesa contra travamento: sem ele, um JSON aninhado derruba a pilha **antes** de o evento ser registrado. **129 testes**, nove novos. → **D-241** |
| 2.6 | **Revalidar a origem do callback dentro do serviço** | ✅ **Feito** | Migração **016** e `services/receptor-callbacks/src/origem.ts`. O serviço confere o segredo nos cabeçalhos — que o nó do n8n **sempre carimbou**, e o recolhimento jogava fora. O veredito do serviço prevalece, inclusive contra o de quem chama: **o de fora nunca promove entrega que nós recusamos**. Sem segredo configurado, `origem_valida = false` (Regra 5). `evento_callback.origem_conferida_por` registra quem decidiu, e a reentrega com conferência real corrige um veredito antigo — só nesse sentido. **141 testes**, doze novos. → **D-245**, **R-90** |
| 2.7 | **403 do Escavador é saldo, não credencial** — usar o campo `mensagem`, que já chegava na função e nunca era usado | ✅ | `bc954d6`. Um 403 **sem corpo** continua sendo credencial: sem o que ler, não se chuta |
| 2.8 | **Exigir `custo.rota` na faixa A1** (Regra 6) e **`confirmacao()` para ação `delete`** (D-29), ambos recusados na carga | ✅ | `bc954d6`. A trava pegou uma declaração real no primeiro minuto: o `conferir-auditoria.mjs` declarava consulta paga sem rota de custo. → **D-238** |
| 2.9 | **A frase da demo** — *"revisada por um advogado do escritório"* | ⛔ | **Achado derrubado.** É a **D-155**: decisão consciente, com trava mecânica em `demo/testar-fluxo-b.mjs:461` que amarra a frase ao aviso de DEMONSTRAÇÃO. Nada foi alterado na demo. A causa do erro está na ressalva de método abaixo |
| 2.9b | **O destino da demo** — a D-86 confina `demo/` numa branch que não existe. Recomendação: (a) mantê-la na branch principal, corrigir a D-86 e declarar um marco de remoção | ⬜ | → **D-243** |
| 2.10 | **Falso positivo do guarda de segredo** — ele bloqueava quem *escrevia sobre* um comando perigoso, em vez de quem o executa | ✅ | `bc954d6`. Barrou três vezes: a gravação do relatório, uma busca que citava a frase, e o próprio commit da correção. Agora só conta o que está em posição de comando. → **R-88** |

### BLOCO 3 — Documentação: parar de duplicar

*Barato, e é o que impede a Parte 1 da revisão de se repetir em outubro. ~7 h no total, e dá para dividir.*

| # | Item | Estado |
|---|---|---|
| 3.1 | Tirar a **coluna de estado** das tabelas de decisão do PRD, da NT01 e do Modelo de Identidade; depois decidir uma a uma as nove divergentes → **D-234** | ⬜ |
| 3.2 | Ampliar a **convenção de estados** da §13 para os sete realmente usados, com formato de célula fixo → **D-235** | ⬜ |
| 3.3 | Substituir a seção **"Riscos ativos"** do `00-estado-atual.md` por ponteiro para a §15 — hoje ela congelou em 26/08 e omite dezenas de riscos, entre eles o banco exposto (R-63) e o Portainer publicado (R-62) | ⬜ |
| 3.4 | Subir **cabeçalho e versão** do PRD e do plano de execução, com calendário provisório sob a hipótese da D-219 | ⬜ |
| 3.5 | Marcar a **D-145 como Revisada pela D-194**, e riscar a 20e do P-14 (já respondida em 07/09) | ⬜ |
| 3.6 | Escolher a **numeração canônica de marco** — o receptor é 7 ou 8? — e corrigir as cinco ocorrências divergentes | ⬜ |
| 3.7 | Corrigir o **Marco 1**: nota datada de 02/09 dizendo que a prova *"mesma publicação por dois caminhos → recusado"* foi derrubada pelo dado real (migração 013), **riscando em vez de apagar** | ⬜ |
| 3.8 | Corrigir `credentials/` → `esquemas-de-credencial/` nas diretrizes §12.3 e na Spec §3, e atualizar a árvore de diretórios | ⬜ |
| 3.9 | Atualizar o **README** — trocar números por ponteiro e listar os documentos que existem | ⬜ |
| 3.10 | Corrigir a **Spec**: `hash (único)` → `hash (índice)`, preços apontando para `dados/precos-escavador.json`, e a §9.3 registrando que o rito da D-145 ainda não está no banco | ⬜ |
| 3.11 | **Nove requisitos sem critério de aceite** — RF-30, RF-34, RF-31 a RF-33, RF-42 a RF-45 | ⬜ |
| 3.12 | Recalcular a **§9.5** com a base real (2 advogadas, não 5), separando fórmula genérica do número deste cliente | ⬜ |
| 3.13 | Corrigir os **riscos com número derrubado**: R-40, R-21, R-72, R-41 e R-42 | ⬜ |
| 3.14 | Dar **gancho operacional ao R-10 (OAB)**, com dono nomeado e data → **D-244** | ⬜ |

---

## Nota — o item 2.1 e o limite da analogia com a A3a

A revisão recomendou travar a faixa A4 **na carga**, no mesmo padrão da A3a, com o
argumento de que *"hoje não existe ferramenta A4 nenhuma, então a trava não
incomoda ninguém"*. **Isso foi verificado em 09/09 e é falso.**

`testes/ajuda.mjs:94` declara `peticionar` como A4, e essa ferramenta é o
alicerce de toda a suíte do chassi. Com a trava na carga, o módulo de apoio para
de carregar e **47 dos 118 testes caem** — inclusive os que exercitam a própria
lógica de aprovação que a A4 existe para proteger. A trava foi escrita, medida e
revertida no mesmo turno.

**Por que a analogia não transfere.** A A3a é uma faixa que **dispensa** aprovação
apoiada numa garantia inexistente: barrá-la na carga remove um caminho permissivo,
e nada mais depende dela. A A4 é a faixa mais **restritiva** do projeto, e o
caminho dela — aprovação, papel de advogado, identidade nominal, registro na
auditoria — está implementado e coberto por testes. O furo é específico: **falta a
reconsulta ao Policy Gate no ato de executar**, e a identificação nominal é hoje
um campo de texto não vazio. Barrar a declaração desliga o caminho inteiro,
inclusive a parte que funciona, e cega os testes que a cobrem.

**O que foi feito, decidido pelo usuário em 09/09:** trava na **execução** em vez
da carga. A faixa continua declarável e `etapaAprovacao` recusa a A4 enquanto
`A4_DISPONIVEL` for falso — **depois** de conferir aprovação, papel, prazo e
resumo, para que as recusas mais específicas continuem tendo precedência. Um
agente sem aprovação segue ouvindo *"precisa de aprovação"*, e não *"o chassi
está incompleto"*.

A recusa sai como `erro_interno` com ação `escalar_humano`, e **não** como
`precisa_aprovacao`: não falta aprovação, falta metade do chassi — mandar pedir
aprovação faria a advogada aprovar algo que não sairia mesmo assim. Na trilha de
auditoria o evento fica como `erro`, não `negado`, e a distinção é a certa: quem
for ler depois precisa separar *"o privilégio não permitia"* de *"a plataforma
ainda não sabe verificar"*.

Custo real: dois testes novos, um teste repontado de A4 para A3b — ele provava
uma propriedade geral da auditoria e usava a A4 só como veículo — e nenhuma
cobertura perdida. 117 de 117.

**Isto vale para o 2.2 também:** ele tem a mesma forma — trava de carga proposta
pela revisão para a sessão assinada — e merece a mesma pergunta antes de virar
código.

---

## O que a revisão recomenda **não** fazer agora

Dizer o que fica de fora é parte da proposta:

- **Não implementar o Policy Gate agora.** É o marco 9 e depende de decisões ainda em Proposta. As travas de carga (2.1 e 2.2) compram a mesma segurança por 30 minutos.
- **Não reescrever os documentos grandes.** O `00-estado-atual.md` e o `01-diretrizes-gerais.md` são enormes, e a tentação de "organizar" consumiria a semana que falta para 15/09. Só as correções pontuais do Bloco 3.
- **Não criar o painel web** para resolver o problema do teor no Telegram. A D-223 já disse que nenhuma camada dele entra em E1.
- **Não recarregar o Escavador** antes de remover a assinatura `2813617`.

---

## Ressalva de método — leia antes de confiar nos achados

A revisão rodou **seis frentes em agentes paralelos**, e a **verificação adversarial não aconteceu**: a lente que pergunta *"isto já está tratado em outro lugar?"* morreu junto com o limite de sessão. Um achado já caiu por isso — o **2.9**, que era a D-155, decisão consciente e com trava mecânica.

**Já são três os achados que não se sustentaram**, e os três pela mesma causa:

| Achado | O que a revisão disse | O que o disco disse |
|---|---|---|
| 2.9 | A Demo B afirma revisão por advogado que não acontece | É a **D-155**, decisão consciente com trava mecânica |
| 2.1 | *"Hoje não existe ferramenta A4 nenhuma"* | `testes/ajuda.mjs:94` declara uma, e é o alicerce da suíte |
| 2.2 | O `13-chassi-marco-2.md` declara a etapa 2 concluída | Ele escopa a etapa a *"validade e revogação"* e defere a assinatura ao marco 9 |

**Consequência prática:** todo item ainda não marcado ✅ merece a pergunta *"isto já está tratado?"* antes de virar trabalho — e a pergunta precisa ser respondida **lendo o arquivo**, não relendo o achado. Os itens marcados ✅ passaram por essa conferência ao serem implementados.

Os laudos brutos dos subagentes e o relatório original estão **fora do repositório**, em `Documentos\Claude\recuperado-sessao-2026-09-09\` — recuperados do diretório temporário do sistema depois de um `/clear`, e mantidos fora do Git por conterem caminhos e saídas de máquina.

---

## O que a revisão **não** encontrou

Num projeto que vai lidar com dado de cliente, isto importa tanto quanto o resto:

- Nenhum segredo no histórico do Git.
- Nenhum dado pessoal real em arquivo versionado — os exemplos têm nomes de fachada.
- Nenhum `node_modules/` ou `dist/` versionado.
- Nenhum erro de compilação, nenhum teste falhando.
- Nenhum SQL montado por concatenação de texto — tudo parametrizado.
- Nenhum caso de privilégio decidido por instrução em prompt: onde há verificação, ela está em código.

**O projeto erra por duplicar informação, não por descuido de segurança.** É um defeito muito mais barato de corrigir — e o Bloco 1 corrigiu a causa, não os sintomas.
