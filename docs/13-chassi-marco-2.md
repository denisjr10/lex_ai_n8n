# Marco 2 — O chassi: sessão, escopo, abrangência, erro e envelope

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Data | 2026-08-27 |
| Estado | 🟢 **Entregue e verificado** — 44 testes passam, incluindo a matriz de escopo inteira |
| Fase | 3 — construção |
| Marco | **2 de 10** (Spec `09-spec-tecnica.md` §15) |
| Critério de aceite | *"A matriz de escopo passa inteira"* |
| Herda de | `09-spec-tecnica.md` §4, §5, §10, §14 · `04-modelo-de-identidade-e-autorizacao.md` §3, §5 |

> **O que este marco entrega.** O lugar onde a **Regra 1** deixa de ser princípio e vira código: *"o agente de IA nunca é a fronteira de segurança; privilégio se aplica como escopo verificado em código no servidor MCP, jamais por instrução no prompt."*

---

## 1. A ideia, em uma frase

> **A ferramenta declara; o chassi decide.**

Uma ferramenta MCP, neste desenho, **não chama o Policy Gate, não lê token, não mede custo, não escreve auditoria e não decide se pode**. Ela declara o que é:

```ts
definirFerramenta({
  nome: 'consultar_processo',
  faixa: 'A1',                                       // leitura externa paga
  escopo: 'escavador:processo:read',                 // exigência de privilégio
  sujeito: (p) => ({ processos: [p.numero_cnj] }),   // o que será conferido
  entrada: { numero_cnj: cnj() },                    // validação antes de gastar
  executar: (p, ctx) => ctx.escavador.capa(p.numero_cnj),
})
```

O motivo é de segurança, não de elegância. Se cada ferramenta aplicasse o próprio controle, a fronteira de segurança do projeto passaria a depender da disciplina de quem escreve ferramenta — e bastaria **uma** esquecer **uma** linha.

Com o chassi no caminho obrigatório, **é impossível escrever uma ferramenta que não seja verificada**: ela não recebe credencial, não recebe a sessão, não recebe cliente HTTP. Não há com que construir um atalho.

---

## 2. As etapas, e por que a ordem é uma propriedade de segurança

| # | Etapa | Estado |
|---|---|---|
| 1 | Correlação (`requisicao_id`) | ✅ marco 2 |
| 2 | **Sessão** — validade e lista de revogação | ✅ marco 2 |
| 3 | Inquilino e credencial | 🟡 trava mínima; credencial no marco 6 |
| 4 | **Perfil** — a ferramenta está exposta a esta sessão? | ✅ marco 2 |
| 5 | **Escopo** — a sessão tem direito a esta categoria? | ✅ marco 2 |
| 6 | **Abrangência** — a sessão tem direito a **este** processo? | ✅ marco 2 |
| 7 | **Validação de entrada** | ✅ marco 2 |
| 8 | **Faixa e aprovação** | ✅ marco 2 |
| 9 | Custo — estimativa, reserva, reconciliação | ⏭️ marco 4 |
| 10 | Cache | ⏭️ marco 5 |
| 11 | Execução com SDK | ⏭️ marco 6 |

**Negar é sempre mais barato que permitir.** Nenhuma das etapas 2 a 8 custa um centavo. Uma tentativa indevida é recusada sem tocar na API — o que é requisito de custo (Regra 6) **e** de sigilo (RF-07) ao mesmo tempo: recusar sem chamar também não revela que o processo existe.

### 2.1 Uma inversão deliberada em relação à Spec

A Spec numera abrangência como **6** e validação de entrada como **7**. O código faz o contrário, e vale registrar por quê.

A abrangência confere o número CNJ contra a sessão. Comparar um CNJ ainda não normalizado dá **falso negativo**: `0000132-06.2025.5.08.0205` e `00001320620255080205` são o mesmo processo e não são a mesma cadeia de caracteres. A normalização acontece na validação — logo ela precisa vir antes.

A inversão não afrouxa nada: validar entrada não custa crédito e não revela existência de processo. As duas continuam antes de qualquer gasto.

---

## 3. Cinco decisões de desenho que carregam peso

### 3.1 Decisão é **valor**, nunca exceção

Toda etapa devolve uma `Decisao`. Nenhuma lança.

```ts
type Decisao =
  | { permitido: true }
  | { permitido: false; erro: ErroInterno }
```

**Por que isso importa mais do que parece.** Exceção é um canal que pode ser fechado sem querer. Basta um `try { … } catch { }` em qualquer camada acima para que uma recusa de privilégio vire **silêncio** — e silêncio, num sistema que nega por padrão, é indistinguível de permissão.

O defeito não apareceria em teste nenhum: a chamada **funcionaria**.

Valor não some. Quem chama precisa olhar `permitido`, e o compilador cobra: o campo `erro` só existe no ramo negado. É a Regra 1 na forma de tipo — o privilégio deixa de depender da disciplina de quem escreve o `catch`.

### 3.2 Não existe curinga, e `write` não implica `read`

`escavador:*` não é um escopo — é um texto ilegível, e escopo ilegível é concessão inexistente.

Curinga concede o que ainda não foi escrito, inclusive a ferramenta perigosa que alguém vai acrescentar daqui a seis meses.

E `write` **não** implica `read`. Parece conveniente e é armadilha: quem pode escrever num sistema nem sempre deve poder ler tudo dele, e a implicação silenciosa esconde exatamente essa diferença. Quem precisa das duas coisas recebe os dois escopos.

### 3.3 Escopo sem abrangência escrita vale como `own`

`escavador:processo:read`, sem sufixo, é a concessão **mais estreita**, não a mais ampla.

É o caso que mais aparece por engano — alguém escreve o escopo curto achando que concedeu tudo. O padrão seguro é conceder o mínimo (Regra 5). Entre duas concessões que servem, vale a mais ampla, porque a pessoa de fato recebeu as duas.

### 3.4 Chamada sem sujeito, sob `own` ou `carteira`, é **recusada**

Não há o que conferir, e *"nada a conferir"* não pode virar *"tudo liberado"*.

É o caso que aparece quando alguém escreve uma ferramenta nova e esquece o `sujeito`. O resultado tem de ser a ferramenta **não funcionar**, nunca funcionar demais.

### 3.5 A mensagem de recusa é idêntica à de "não encontrei"

```
Não há resultado disponível para esta consulta nesta sessão.
```

Recusa por escopo e ausência de resultado devolvem **exatamente este texto**, byte a byte. Os códigos internos são diferentes — a auditoria precisa distinguir —, mas quem está do lado de fora vê a mesma frase.

Se a mensagem de *"você não tem permissão"* fosse distinguível da de *"não existe"*, qualquer pessoa com acesso ao canal poderia varrer números de processo e descobrir quais existem no acervo do escritório. O sistema viraria um **oráculo de existência de processos**.

Há um teste que compara os dois textos. Se alguém "melhorar" um deles, ele quebra — e é para quebrar.

---

## 4. As travas que agem na carga, não na chamada

`definirFerramenta` **recusa a declaração** e o servidor não sobe. É de propósito: uma ferramenta que o chassi não consegue verificar não pode existir, e melhor não subir do que subir com um buraco.

| Recusado | Por quê |
|---|---|
| Campo de entrada com nome de credencial (`token`, `senha`, `api_key`, `chave`…) | Ferramenta nunca recebe credencial por parâmetro. Sem esta trava, bastaria declarar `entrada: { token: texto() }` para o agente — que lê conteúdo externo, e conteúdo externo é hostil — escolher com qual credencial a plataforma fala com o fornecedor |
| Escopo com abrangência (`escavador:processo:read:any`) | Abrangência é da **concessão**, nunca da exigência. Deixar a ferramenta declarar inverteria o desenho: o objeto verificado passaria a opinar sobre o próprio limite |
| Escopo fora da convenção | Escopo ilegível é ferramenta não verificável |
| Descrição ausente ou curta | É o que o agente lê para escolher a ferramenta |

E na chamada: **parâmetro que ninguém declarou é recusado, não ignorado.** Ignorar seria aceitar em silêncio que o agente mandasse coisas que ninguém declarou — e um dia uma delas se chamaria como um parâmetro que a API entende.

---

## 5. `402` nunca é transitório

A tradução de erro tem um caso que merece linha própria:

> **402 do Escavador — sem saldo — NUNCA é repetível.** Repetir não resolve, e cada tentativa enche o histórico e, dependendo da rota, gasta. É a interseção exata entre a Regra 5 (falha fecha) e a Regra 6 (custo é requisito).

E o `404` do Trello é ambíguo **de propósito**: pode significar "não existe" ou "seu token não enxerga". O Trello não distingue, e o chassi **não tenta adivinhar**. Adivinhar seria construir um oráculo de existência de objetos.

A mensagem crua do fornecedor **nunca** chega ao agente. Ela varia sem aviso — o painel do Escavador já rotulou três erros distintos com o mesmo texto genérico (R-44) — e pode conter detalhe de conta que não deve circular.

---

## 6. Auditoria indisponível bloqueia

D-77, e vale desde já: se `auditoria.registrar` lançar, a chamada devolve erro **mesmo quando ela seria permitida**.

Um sistema que age sem conseguir registrar o ato é um sistema sem prova. Não há fila, não há "grava depois".

Há teste para isso, e ele exercita justamente o caminho feliz com a auditoria fora do ar.

---

## 7. O critério de aceite

```bash
npm test
```

**44 testes, 44 passando.**

### 7.1 A matriz de escopo — 25 casos

Papel × ferramenta × abrangência, cada linha uma afirmação sobre quem pode o quê. Cada caso confere **duas** coisas:

1. o veredito — permitido ou o código de erro esperado;
2. **se a execução foi alcançada.**

> A segunda é a que mais importa. RF-07 tem duas metades — não vazar e **não pagar**. Um teste que só conferisse o código de erro passaria mesmo se o chassi recusasse *depois* de chamar a API. O cenário de teste conta as chamadas ao fornecedor, e toda recusa exige contador em zero.

Cobertura: as três abrangências · escopo ausente · recurso errado · sistema errado · `write` não implica `read` · curinga não existe · abrangência implícita · duas concessões · perfil de exposição · perfil inexistente · ferramenta sem sujeito sob `any` e sob `carteira` · A2 sem aprovação · A3 e A4 sem aprovação · A4 aprovada por estagiário · CNJ com dígito errado · parâmetro não declarado.

### 7.2 As outras 19

Sessão expirada, revogada e com datas incoerentes · tradução de erro (402, 401/403, 429, 5xx, 422, 404, status imprevisto, vazamento de mensagem crua) · envelope obrigatório · recusa na carga · auditoria indisponível · CNJ e escopo no domínio.

---

## 8. O que o marco 2 **não** fez

| Não fez | Por quê |
|---|---|
| Motor de custo | Marco 4. A etapa 9 tem a costura marcada no `chassi.ts` |
| Cache | Marco 5, etapa 10 |
| Chamada real a fornecedor | Marco 6. O `executar` recebe um contexto que ainda não traz cliente |
| Persistência da auditoria | Marco 3. Hoje há a interface e uma implementação de memória |
| Assinatura criptográfica do token de sessão | Marco 9, junto do Policy Gate que emite. O chassi já valida validade e revogação |

---

## 9. Decisões que este marco propõe

| # | Decisão |
|---|---|
| **D-136** | Toda etapa de controle devolve decisão como **valor**, nunca como exceção |
| **D-137** | Não existe curinga em escopo, e `write` não implica `read` |
| **D-138** | Escopo sem abrangência escrita vale como `own`; entre concessões vale a mais ampla |
| **D-139** | Chamada sem sujeito sob `own`/`carteira` é recusada |
| **D-140** | `definirFerramenta` recusa na carga campo com nome de credencial e escopo com abrangência |
| **D-141** | A matriz de escopo verifica o veredito **e** se a execução foi alcançada |

---

## 10. Próximo passo

**Marco 3** — auditoria e consumo: recusa e sucesso geram registro reconstruível pelo `requisicao_id`. A tabela já existe (migração 003, *append-only* provada), a interface já está no chassi, e falta a implementação que escreve no banco.

Não consome crédito e não depende do escritório.
