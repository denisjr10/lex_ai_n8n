# Modelo de Identidade, Autorização, Aprovação e Auditoria

| Campo | Valor |
|---|---|
| Status | Rascunho para validação |
| Versão | 0.2 — **o escritório escolheu o Caminho B em 27/08**; A3 se dividiu; advogado recebe `any` |
| Data | 2026-08-27 (criado em 2026-08-17) |
| Depende de | Nada pendente. ✅ **A aposta se pagou:** o documento valia nos Caminhos A e B, e o Caminho B foi o escolhido — nada estrutural mudou (§8) |
| Alimenta | PRD, Spec, servidores MCP, painel web, workflows n8n |

> **Por que este documento existe agora.** É a peça que mais coisas dependem — os dois servidores MCP, o painel e todos os fluxos do n8n consomem este modelo — e é a que **menos depende de decisão pendente**. O risco R-11 (conta compartilhada do Workspace) também a tornou urgente: quanto antes a identidade estiver desenhada, menor a chance de o desenho ficar refém de uma escolha administrativa do escritório.

---

## 1. Princípio fundador: a identidade é da plataforma

A regra que sustenta todo o resto:

> **A plataforma mantém seu próprio registro de pessoas. Provedores externos — Google, Telegram, WhatsApp — são *vinculados* a uma conta da plataforma; eles nunca *são* a conta.**

Parece detalhe, mas é o que resolve três problemas de uma vez:

1. **Independência da decisão do escritório.** Se comprarem licenças individuais do Workspace, o Google vira um provedor vinculado. Se não comprarem, o login próprio do painel cumpre o papel. **O núcleo do sistema não muda.**
2. **Múltiplos canais, uma pessoa.** A mesma advogada é uma conta só, acessível pelo painel, pelo Telegram e (eventualmente) pelo Google. A auditoria a enxerga como uma pessoa, não como três.
3. **Desligamento real.** Desativar a conta da plataforma corta todos os canais de uma vez, mesmo os que o escritório não administra.

```mermaid
flowchart LR
    subgraph EXT["Identidades externas (vinculadas)"]
        G["Conta Google<br/>(se houver licença individual)"]
        T["Telegram<br/>(ID numérico)"]
        P["Login do painel<br/>(sempre existe)"]
        W["WhatsApp<br/>(só clientes)"]
    end

    subgraph PLAT["Plataforma"]
        U["Conta de usuário<br/>papel · status · vínculos"]
        C["Cadastro de cliente"]
    end

    G --> U
    T --> U
    P --> U
    W --> C
```

**Consequência de projeto:** o login por senha do painel é obrigatório desde a primeira versão. Login único via Google, se vier, é conveniência adicional — nunca a única porta.

---

## 2. Modelo de dados

Entidades e campos essenciais. Não é a modelagem final (isso é da Spec), mas fixa o vocabulário e as relações.

### 2.1 Identidade

**`usuario`** — pessoa da equipe do escritório
`id` · `nome` · `email` · `papel` (colaborador · advogado · administrador) · `numero_oab` (quando advogado) · `areas` · `status` (ativo · suspenso · desligado) · `mfa_habilitado` · `criado_em` · `desligado_em`

**`identidade_externa`** — vínculo com um provedor
`id` · `usuario_id` · `provedor` (painel · google · telegram) · `identificador_externo` · `verificada_em` · `revogada_em`

> Restrição: um `identificador_externo` pertence a **um** usuário por provedor. Isso é o que impede que uma conta compartilhada seja aceita silenciosamente pelo sistema.

**`sessao`** — sessão autenticada, com escopos concedidos
`id` · `usuario_id` · `canal` · `escopos` · `sujeitos_autorizados` · `emitida_em` · `expira_em` · `revogada_em`

### 2.2 Domínio do escritório

**`cliente`** — `id` · `nome` · `tipo` (PF · PJ) · `documento` (CPF/CNPJ) · `status`

**`vinculo_canal_cliente`** — como o cliente é reconhecido em cada canal
`id` · `cliente_id` · `canal` (whatsapp · email) · `identificador` · `verificado_em` · `verificado_por` · `revogado_em`

> **O vínculo é criado pelo escritório, nunca por autodeclaração no chat.** É a materialização de §5.2 das diretrizes.

**`processo`** — `id` · `numero_cnj` · `cliente_id` · `advogado_responsavel_id` · `area` · `status` · `sigiloso`

**`demanda`** — unidade de trabalho, venha de onde vier
`id` · `origem` (email · whatsapp · interno · trello) · `referencia_origem` · `cliente_id` · `processo_id` · `classificacao` · `prioridade` · `prazo` · `status` · `responsavel_id` · `criada_em`

### 2.3 Governança

**`aprovacao`** — pedido de autorização humana
`id` · `demanda_id` · `faixa` (A0 · A1 · A2 · A3a · A3b · A4) · `acao_proposta` · `conteudo_proposto` · `conteudo_final` · `solicitante` (usuário ou agente) · `aprovador_id` · `papel_exigido` · `status` (pendente · aprovada · rejeitada · expirada · escalada) · `criada_em` · `expira_em` · `decidida_em` · `justificativa`

**`gabarito`** — texto aprovado uma vez, para envio automático em A3a (D-142)
`id` · `nome` · `assunto` · `canal` (email · whatsapp) · `corpo` (com lacunas nomeadas) · `campos_exigidos` · `versao` · `aprovado_por` · `aprovado_em` · `revisar_em` · `ativo` · `desativado_por` · `desativado_em`

**`envio_por_gabarito`** — o registro que torna toda mensagem A3a reconstruível (RF-43)
`id` · `gabarito_id` · `gabarito_versao` · `valores_das_lacunas` · `destinatario` · `cliente_id` · `processo_id` · `enviado_em` · `evento_auditoria_id` · `amostrado_em` · `amostrado_por` · `veredito_amostragem`

> **Por que `gabarito_versao` e `valores_das_lacunas` são campos separados e obrigatórios.** Sem eles, a plataforma saberia que mandou uma mensagem, mas não **qual texto** saiu — e a Regra 2 vira promessa. Com eles, qualquer envio de A3a é reconstruído letra por letra, meses depois, mesmo que o gabarito tenha sido revisado três vezes desde então.

**`evento_auditoria`** — append-only, nunca alterado nem removido
`id` · `momento` · `usuario_id` · `papel` · `canal` · `sessao_id` · `acao` · `recurso` · `parametros_resumidos` · `resultado` · `custo_centavos` · `aprovacao_id` · `origem_ip`

**`consumo`** — razão de custo por chamada paga
`id` · `evento_auditoria_id` · `fornecedor` (escavador · modelo_ia) · `operacao` · `custo_centavos` · `usuario_id` · `cliente_id` · `processo_id` · `cache_hit`

**`orcamento`** — `id` · `escopo` (sessao · usuario · escritorio) · `referencia` · `periodo` · `limite_centavos` · `consumido_centavos` · `estado` (normal · alerta · bloqueado)

---

## 3. Escopos

### 3.1 Convenção de nomes

```
<sistema>:<recurso>:<ação>[:<abrangência>]
```

| Parte | Valores | Exemplo |
|---|---|---|
| `sistema` | `escavador` · `trello` · `escritorio` · `documentos` | `escavador` |
| `recurso` | definido no mapeamento de cada API | `processo` |
| `ação` | `read` · `write` · `delete` | `read` |
| `abrangência` | `own` · `carteira` · `any` (ausente = irrestrita) | `own` |

Exemplos: `escavador:processo:read:own` · `escavador:monitoramento:write` · `trello:card:write` · `escritorio:demanda:read:carteira`

### 3.2 O que cada abrangência significa

| Abrangência | Regra aplicada pelo servidor MCP |
|---|---|
| `own` | O documento (CPF/CNPJ) ou número de processo consultado **precisa constar** na lista `sujeitos_autorizados` da sessão. Fora dela, a chamada é recusada — mesmo que o agente insista |
| `carteira` | O recurso precisa pertencer à carteira do usuário, resolvida pelo Policy Gate e entregue na sessão |
| `any` | Sem restrição de sujeito. Continua sujeito a quota e a registro |

Esta é a parte que faz o §6.2 das diretrizes funcionar de verdade: **a restrição é verificada em código, no servidor, com dados que o agente não controla.** Injeção de prompt não alcança.

### 3.3 Escopos por papel — estrutura preliminar

A lista definitiva sai do mapeamento de cada API. A estrutura já pode ser fixada:

| Papel | Padrão de concessão |
|---|---|
| **Cliente** | Apenas leitura, sempre com abrangência `own`, sobre um conjunto reduzido de recursos. **Quota de crédito do Escavador igual a zero** — o agente do cliente lê só da base interna e nunca dispara chamada paga (D-144) |
| **Colaborador** | Leitura ampla com abrangência `carteira`, escrita em recursos internos, quota moderada. Consulta paga acima do teto exige aprovação. 🚧 *A abrangência pode virar `any` — depende da pergunta 4a* |
| **Advogado** | Leitura `any` — **base inteira, confirmado pelo escritório em 27/08 (D-07, D-146)** —, escrita ampla, aprovação de faixas A3b e A4, quota alta. **Exceção:** processo sigiloso exige escopo próprio, que `any` não concede |
| **Administrador** | Configuração, orçamentos, gestão de usuários e leitura da auditoria. **Não recebe escopo de dado de cliente por padrão** — separação entre administrar o sistema e acessar o conteúdo |

> **O que substitui o controle que a abrangência `any` removeu.** Com o advogado enxergando tudo, deixa de existir a barreira que impedia acesso a processo de outra carteira. A troca é deliberada — bloquear atrapalharia a colaboração cruzada que o escritório descreveu como sua operação real — e o substituto é **registro, não permissão**: toda leitura de processo fora da carteira do próprio advogado é marcada como **acesso amplo** no `evento_auditoria` e entra em relatório mensal para o administrador (RF-37). O escritório perde a barreira e ganha o espelho.

---

## 4. Contrato do Policy Gate

O Policy Gate é o serviço que responde: *"esta pessoa, neste canal, pode fazer isto — e com que limites?"*. É consultado pela orquestração **antes** de abrir a sessão MCP.

### 4.1 Pedido

```json
{
  "provedor": "telegram",
  "identificador_externo": "584219773",
  "canal": "telegram",
  "intencao": "consultar_andamento_processual",
  "contexto": {
    "processo_numero": "0801234-56.2024.8.03.0001"
  },
  "requisicao_id": "req_01HQ..."
}
```

### 4.2 Resposta — autorizado

```json
{
  "decisao": "permitido",
  "usuario": {
    "id": "usr_014",
    "nome": "...",
    "papel": "colaborador",
    "areas": ["civel"]
  },
  "sessao": {
    "id": "ses_01HQ...",
    "token": "<token de sessão MCP>",
    "expira_em": "2026-08-17T15:12:00Z"
  },
  "escopos": [
    "escavador:processo:read:carteira",
    "escavador:movimentacao:read:carteira",
    "trello:card:write",
    "escritorio:demanda:read:carteira"
  ],
  "sujeitos_autorizados": {
    "documentos": ["12345678000199"],
    "processos": ["0801234-56.2024.8.03.0001"]
  },
  "orcamento": {
    "restante_sessao_centavos": 800,
    "restante_usuario_centavos": 42000,
    "estado": "normal"
  },
  "exigencias": [
    { "acao": "consulta_certidao", "requer": "aprovacao_advogado" }
  ]
}
```

### 4.3 Resposta — negado

```json
{
  "decisao": "negado",
  "motivo_codigo": "identidade_nao_vinculada",
  "mensagem_usuario": "Não foi possível concluir. Procure o responsável pelo sistema.",
  "requisicao_id": "req_01HQ..."
}
```

### 4.4 Regras do contrato

1. **Falha fecha** (P10). Policy Gate indisponível ⇒ nada é autorizado. Nunca há liberação por omissão.
2. **Sessão curta.** Minutos, não horas. Mudança de papel ou desligamento tem efeito rápido.
3. **A mensagem ao usuário nunca revela a razão técnica.** *"Não localizei"* e *"não autorizado"* são indistinguíveis para quem está fora — caso contrário o sistema vira oráculo de existência de processos (§10.3).
4. **Toda decisão é registrada**, inclusive as negativas. Negativa é sinal de segurança.
5. **Escopos são concedidos, nunca deduzidos pelo agente.** O agente recebe a lista pronta.
6. **`sujeitos_autorizados` é o coração do isolamento** entre clientes. Ele é resolvido contra o cadastro do escritório, jamais contra o que veio na mensagem.

---

## 5. Fluxo de aprovação humana

### 5.1 Faixas e rito

| Faixa | Rito | Quem pode decidir | Prazo padrão |
|---|---|---|---|
| **A0** Leitura interna | Automático | — | — |
| **A1** Leitura externa paga | Automático dentro da quota; acima, aprovação | Advogado | 4 h |
| **A2** Escrita interna | Automático, reversível, registrado | — | — |
| **A3a** Comunicação externa **por gabarito pré-aprovado** | **Automático e registrado** — a aprovação aconteceu antes, sobre o gabarito | Advogado, uma vez, ao aprovar o gabarito | — *(o gabarito tem data de revisão, não prazo de decisão)* |
| **A3b** Comunicação externa **em texto livre** | Aprovação obrigatória, mensagem a mensagem | Advogado | 4 h úteis 🚧 |
| **A4** Efeito jurídico ou prazo | Aprovação obrigatória, **sem exceção** | Advogado, nominalmente | 2 h úteis 🚧 |

> **A divisão de A3 (D-142).** Um gabarito é um texto aprovado uma vez, com lacunas preenchíveis **apenas por campo verificado da base interna** — nunca por frase que o modelo escreveu. O modelo escolhe qual gabarito usar; ele não redige. Falhando qualquer uma das quatro condições de enquadramento (gabarito aprovado, lacunas de campo verificado, assunto autorizado, nenhum sinalizador de exceção), a mensagem cai para **A3b** — o padrão seguro é sempre a fila de aprovação. As condições e os sinalizadores estão no [PRD §6.2.2](08-prd.md).
>
> 🚧 Os prazos de 4 h e 2 h dependem da pergunta 20d.

### 5.2 Estados

```mermaid
stateDiagram-v2
    [*] --> pendente: agente propõe
    pendente --> em_revisao: humano abre no painel
    em_revisao --> pendente: devolve sem decidir
    em_revisao --> aprovada: aprova conteúdo final
    em_revisao --> rejeitada: rejeita com justificativa
    pendente --> escalada: prazo vencido
    escalada --> em_revisao: outro aprovador assume
    escalada --> expirada: ninguém assumiu
    aprovada --> executada: ação realizada
    aprovada --> falha_execucao: erro na execução
    rejeitada --> [*]
    expirada --> [*]
    executada --> [*]
    falha_execucao --> pendente: reprocessa
```

### 5.3 Regras

1. **Aprova-se o conteúdo final**, não a intenção. Em A3b, o texto exato que sairá é o que aparece na tela. Em A3a, o que se aprova é o gabarito **mais** as regras de preenchimento — que juntos produzem um texto determinístico, reconstruível a qualquer momento a partir do registro (RF-43).
2. **Edição antes de aprovar é obrigatória no fluxo** — `conteudo_proposto` e `conteudo_final` são campos distintos, e a diferença entre eles é métrica de qualidade do agente. É também o que faz um caso **graduar** de A3b para A3a: 20 aprovações consecutivas sem edição tornam o caso candidato a gabarito (D-151).
3. **O que expira é o pedido pendente, não a autorização concedida** (D-143). Vencido, o pedido **não envia**, vira registro de "expirado" e devolve o caso à fila — se ainda fizer sentido responder, o agente redige de novo com o dado atual. O motivo é simples: aprovar às 17h um rascunho escrito às 9h autoriza a descrição de um mundo que já mudou. **Não expiram:** gabarito aprovado (tem data de revisão), alerta de prazo (nunca expira, por desenho) e a demanda em si.
4. **Expiração nunca é silenciosa.** Escala e alerta antes de vencer. Aprovação pendente esquecida é demanda perdida.
5. **A4 exige advogado identificado nominalmente.** ✅ **Destravado em 27/08:** a identidade individual passou a existir pelo Telegram + painel (D-147), então a faixa A4 pode ser liberada. Antes disso era trava de projeto, e era a razão pela qual R-11 é grave.
6. **Rejeição pede justificativa.** É o que alimenta a melhoria dos agentes — e a taxa de rejeição é a métrica primária de qualidade (D-66).
7. **Mensagem A3a é amostrada depois do envio** (RF-45) e o gabarito pode ser desligado na hora por qualquer advogado, sem passar por ninguém (RF-44). Desligar é sempre mais fácil que ligar — é o antídoto ao gabarito que envelhece (R-49).

---

## 6. Auditoria

**Todo** evento registra: momento · usuário · papel · canal · sessão · ação · recurso · resumo dos parâmetros · resultado · custo · aprovação vinculada.

Regras:

- **Append-only.** Sem update, sem delete, nem por administrador.
- **Registra a negativa** com o mesmo rigor da permissão.
- **Parâmetros resumidos, nunca íntegra de dado sensível.** A auditoria prova o que aconteceu; não é cópia do acervo.
- **Retenção definida por tipo**, com expurgo automatizado (§9.1 das diretrizes).
- **Consultável pelo administrador**, e pelo advogado quanto aos próprios atos.

---

## 7. Custo e quota

Três níveis de orçamento, verificados em cadeia — o mais restritivo vence:

```
sessão  →  usuário/mês  →  escritório/mês
```

| Estado | Gatilho | Comportamento |
|---|---|---|
| `normal` | Abaixo de 80% | Opera normalmente |
| `alerta` | 80% a 100% | Opera e notifica o administrador |
| `bloqueado` | 100% | Só cache. Consulta nova exige aprovação de advogado |

O custo em centavos vem do cabeçalho de resposta da API do Escavador e é gravado em `consumo`, atribuído a usuário, cliente e processo — o que torna o gasto **repassável** e analisável por caso.

---

## 8. Por que este modelo funciona nos dois caminhos

O ponto que torna seguro construir isto antes da decisão do escritório — **e a aposta se pagou: em 27/08 o escritório escolheu o Caminho B, e nada estrutural precisou mudar** (D-147).

| Componente | Caminho A (licenças individuais) | ✅ **Caminho B (painel + Telegram) — escolhido em 27/08** |
|---|---|---|
| `usuario` | Idêntico | Idêntico |
| `identidade_externa` | Linhas com provedor `google`, `telegram`, `painel` | Linhas com provedor `telegram`, `painel` |
| Login no painel | Senha própria **ou** login único Google | Senha própria |
| Escopos, sessão, Policy Gate | Idêntico | Idêntico |
| Aprovação e auditoria | Idêntico | Idêntico |
| Custo e quota | Idêntico | Idêntico |
| Canal de notificação | Google Chat com botões | Telegram com botões |
| Faixa A4 liberada? | ✅ Sim | ✅ Sim — a identidade vem do painel |

**A diferença é uma tabela de vínculos e o conector do mensageiro.** Nada estrutural. É exatamente o que a decisão D-21 buscava garantir.

> ⚠️ **O que o Caminho B cobra, e que a tabela acima não mostra (R-47).** A conta de Telegram é ancorada em número de telefone e **não é administrada pelo escritório**. Duas consequências que precisam de tratamento explícito:
>
> 1. **Não há desligamento central.** Desligar alguém do escritório não desliga o Telegram dela. O desligamento que de fato importa é o nosso: **revogar o vínculo na plataforma** tira o acesso mesmo com a conta do Telegram continuando a existir. Por isso o vínculo mora em `identidade_externa`, com `revogada_em`, e não é o Telegram que decide quem é quem
> 2. **Troca de chip, clonagem e SIM swap alcançam a conta.** Tratamento: **2FA (senha de nuvem) obrigatório** no Telegram como condição do vínculo (RNF-18), e conteúdo confidencial **não trafega no corpo da mensagem** (D-17) — o mensageiro leva notificação e link; o conteúdo e a aprovação acontecem no painel, que tem autenticação própria
>
> Isso é melhor que a conta compartilhada, que não tinha identidade nenhuma, e pior que a licença individual do Workspace, que o escritório administra. O escritório foi informado e aceitou.

---

## 9. O que ainda depende do mapeamento das APIs

Fica em aberto de propósito, para ser preenchido nas fases seguintes:

- Lista concreta de escopos do Escavador (`escavador:*`) — depende do mapeamento
- Lista concreta de escopos do Trello (`trello:*`) — idem
- Classificação de cada operação nas faixas A0–A4
- Custo típico por operação, para calibrar as quotas
- Regras de validade de cache por tipo de dado

A **estrutura** acima não muda quando essas listas chegarem. Só cresce.

---

## 10. Decisões geradas

| ID | Decisão | Recomendação |
|---|---|---|
| **D-22** | A plataforma mantém registro próprio de usuários; provedores externos são vinculados, nunca são a conta | Adotar |
| **D-23** | Login por senha próprio no painel desde a primeira versão; login único é conveniência adicional | Adotar |
| **D-24** | Convenção de escopos `<sistema>:<recurso>:<ação>[:<abrangência>]`, com `own` / `carteira` / `any` verificadas no servidor MCP | Adotar |
| **D-25** | Faixa A4 permanece bloqueada enquanto não houver identidade individual de advogado | ✅ **Destravada em 27/08** — a identidade existe (D-147) |
| **D-26** | Administrador não recebe escopo de dado de cliente por padrão — administrar o sistema e acessar conteúdo são coisas separadas | Adotar |

### 10.1 Atualização de 27/08 — o que as respostas do escritório mudaram aqui

As decisões abaixo nascem no [PRD](08-prd.md) §15 e estão registradas em `01-diretrizes-gerais.md` §13. Constam aqui porque alteram **este** documento:

| # | O que mudou neste documento |
|---|---|
| **D-142** | §5.1 — a faixa A3 se dividiu em **A3a** (gabarito pré-aprovado, automático) e **A3b** (texto livre, aprovação obrigatória). §2.3 ganhou as entidades `gabarito` e `envio_por_gabarito` |
| **D-143** | §5.3 regra 3 — a expiração recai sobre o **pedido pendente**, não sobre autorização concedida nem sobre gabarito |
| **D-144** | §3.3 — a quota de crédito do Escavador do papel **Cliente** é **zero**, não "apertada". O agente do cliente lê só da base interna |
| **D-146** | §3.3 — **Advogado recebe `any`** (base inteira), com acesso fora da carteira registrado como acesso amplo. Colaborador segue em `carteira` até a pergunta 4a |
| **D-147** | §8 — **Caminho B escolhido.** Identidade individual pelo Telegram + painel, com 2FA obrigatório e revogação na plataforma. Destrava D-25. Risco novo em R-47 |
| **D-151** | §5.3 regra 2 — a diferença entre `conteudo_proposto` e `conteudo_final` deixa de ser só métrica: é o que faz um caso **graduar** de A3b para A3a |
