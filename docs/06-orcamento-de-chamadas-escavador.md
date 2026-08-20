# Orçamento de Chamadas — API do Escavador

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Data | 2026-08-20 |
| Estado | 🟡 Proposta — aguarda aval do usuário |
| Saldo | R$ 50,00 · 16 requisições · R$ 3,00 cada |
| Validade | 10 dias a partir da liberação (**data de início a confirmar**) |
| Gastas até agora | **0 de 16** |

> Documento de controle. **Toda** chamada à API do Escavador passa por aqui — antes, para ser autorizada; depois, para registrar o que ensinou.

---

## 1. O que mudou com a cota de teste

O suporte do Escavador Business liberou saldo de teste mediante CNPJ. As condições informadas por escrito:

- **R$ 50,00** de saldo, válido por **10 dias**
- **Até 16 requisições**
- **R$ 3,00 por requisição — para qualquer rota, durante o período de teste**

Três consequências que mudam o planejamento:

**1. Não existe rota gratuita agora.** A classificação 🆓 do `mapeamento-escavador.md` vale para o plano contratado, não para a cota de teste. `GET /api/v1/quantidade-creditos`, `GET /api/v1/origens`, consultar status de atualização — tudo custa R$ 3,00 aqui.

**2. A cota de teste não revela a tabela de preços.** Como o custo é fixo em R$ 3,00, o cabeçalho `Creditos-Utilizados` durante o teste não mede o preço real de cada rota. A pendência 1 de `mapeamento-escavador.md` §15 **continua aberta** e só se resolve no painel autenticado. Não gaste chamada tentando descobrir preço.

**3. 16 chamadas é pouco para 83 operações mapeadas.** O objetivo do teste não é cobrir a API — é validar **contrato**: autenticação funciona, o plano cobre V1 e V2, o formato dos dados é o que o mapeamento previu, e o webhook chega. Cobertura vem depois, com plano pago.

## 2. Princípio de alocação

Cada uma das 16 chamadas precisa responder uma pergunta que **a documentação não responde** e que **bloqueia decisão de arquitetura**. Se a resposta está no OpenAPI, no SDK oficial ou no mapeamento, não é chamada — é leitura.

Ordem de prioridade:

1. **O plano cobre o que precisamos?** (R-15 — se V1 não estiver no plano, o escritório fica sem diário oficial, que é o gatilho de prazo)
2. **O formato dos dados é o que o mapeamento previu?** (define o modelo de dados do MCP)
3. **O ciclo assíncrono e o webhook funcionam ponta a ponta?** (define o chassi)
4. **Como são os erros?** (calibra o disjuntor)

## 3. Orçamento proposto

**14 chamadas alocadas, 2 de reserva.** Nenhuma é executada sem aval.

### Bloco A — Autenticação e cobertura do plano · 4 chamadas · R$ 12,00

| # | Chamada | O que responde |
|---|---|---|
| A1 | `GET /api/v1/quantidade-creditos` | V1 autentica com este token? Envelope do saldo. O que o cabeçalho `Creditos-Utilizados` traz numa cota de teste |
| A2 | `GET /api/v2/monitoramentos/processos` | V2 autentica? Envelope e paginação da V2. Já existem monitoramentos na conta? |
| A3 | `GET /api/v1/origens` | **R-15 / pergunta 58** — diário oficial está no plano? Catálogo de origens para o MCP |
| A4 | `GET /api/v1/jurisprudencias/busca?q=dano+moral&limit=1` | Pendência 3 — jurisprudência está ativa? Está no SDK, ausente do OpenAPI |

### Bloco B — Estrutura de dados · 4 chamadas · R$ 12,00

Todas sobre **um único processo real do escritório**, escolhido pelo usuário, para que as respostas se conversem.

| # | Chamada | O que responde |
|---|---|---|
| B1 | `GET /api/v2/processos/numero_cnj/{cnj}` | Modelo do processo: campos, tipos, o que vem nulo na prática |
| B2 | `GET /api/v2/processos/numero_cnj/{cnj}/movimentacoes?limit=5` | Modelo da movimentação — é a peça que dispara prazo |
| B3 | `GET /api/v2/processos/numero_cnj/{cnj}/envolvidos?limit=5` | Como o envolvido é identificado. Sem isso não dá para verificar `sujeitos_autorizados` (R-06) |
| B4 | `GET /api/v2/envolvido/processos?cpf_cnpj={cnpj}&limit=5` | Caminho "todos os processos deste cliente" — a consulta mais comum do agente |

### Bloco C — Assincronia e webhook · 4 chamadas · R$ 12,00

Só depois que houver uma URL de callback pública cadastrada no painel. **Não iniciar antes disso** — sem o callback, a chamada C1 se perde.

| # | Chamada | O que responde |
|---|---|---|
| C1 | `POST /api/v2/processos/numero_cnj/{cnj}/solicitar-atualizacao` — `enviar_callback: true`, `documentos_publicos: false`, `autos: false` | Formato do aceite assíncrono. Configuração deliberadamente mínima, para não disparar custo variável |
| C2 | `GET /api/v2/processos/numero_cnj/{cnj}/status-atualizacao` | Máquina de estados da atualização |
| C3 | `GET /api/v2/callbacks` | O callback foi registrado? Formato do histórico |
| C4 | `POST /api/v2/monitoramentos/processos` — frequência mínima | Contrato de criação de monitoramento |

> ⚠️ **C4 gera custo recorrente.** O monitoramento criado deve ser removido assim que o contrato for confirmado (remover não custa no plano; na cota de teste, custa uma chamada — decidir na hora se compensa).
>
> O callback **recebido** não é requisição nossa e não consome cota.

### Bloco D — Erros · 2 chamadas · R$ 6,00

| # | Chamada | O que responde |
|---|---|---|
| D1 | `GET /api/v2/processos/numero_cnj/0000000-00.0000.0.00.0000` | Formato do erro para CNJ inválido/inexistente |
| D2 | Qualquer rota com token propositalmente inválido | Formato do 401. **Provavelmente não consome cota** — rejeição antes do processamento. A confirmar em A1, comparando o saldo |

### Reserva — 2 chamadas · R$ 6,00

Guardadas para o que os blocos anteriores revelarem de inesperado. Não são alocadas antecipadamente.

## 4. O que **não** entra no orçamento

| Não fazer | Por quê |
|---|---|
| Consultar preço por rota | Custo fixo na cota de teste; a tabela real está no painel |
| Testar autos restritos, certificado digital ou senha do advogado | R-12, D-30 — fora de todo perfil por decisão de projeto |
| Buscar por nome livre (`GET /api/v1/busca`) | Rota de resultado imprevisível; alto risco de gastar sem aprender |
| Baixar PDF de documento ou de diário | Custo variável, e o formato do binário não está em questão |
| Solicitar resumo por IA | Útil, mas não bloqueia arquitetura nenhuma. Fica para o plano pago |
| Repetir chamada já feita | A resposta bruta fica salva em arquivo |
| Lote, laço ou varredura | Queima a cota inteira em uma execução |

## 5. Registro de execução

Preencher **a cada chamada**, imediatamente. Resposta não registrada é crédito perdido.

| # | Data/hora | Rota | HTTP | `Creditos-Utilizados` | Saldo restante | O que ensinou |
|---|---|---|---|---|---|---|
| — | — | — | — | — | R$ 50,00 | Nenhuma chamada executada ainda |

As respostas brutas ficam em `docs/amostras/escavador/` (a criar), com CPF, CNPJ e nome de parte **substituídos por marcadores** antes do commit — dado de cliente não entra no repositório (LGPD, §9 das diretrizes).

## 6. Pendências que a cota de teste **não** resolve

Continuam dependendo do painel autenticado ou do escritório:

| Pendência | Onde se resolve |
|---|---|
| Tabela de preços por rota (§15.1) | Painel — "Preços das rotas" |
| Quais rotas são gratuitas no plano contratado (§15.2) | Painel |
| Existe ambiente de homologação? (§15.5) | Painel ou suporte |
| Uma URL de callback por conta é suficiente? (§15.7) | Painel — verificar se já há URL cadastrada |
| Limite de requisições por minuto do plano | Painel |
| Quantos tokens existem na conta e de quem são (R-11) | Painel — `api.escavador.com/tokens` |

## 7. Decisões que este documento propõe

| # | Decisão | Recomendação |
|---|---|---|
| **D-47** | Chamada à API do Escavador só ocorre se constar de orçamento aprovado; fora dele, exige aval explícito na hora | Adotar |
| **D-48** | Toda resposta da API é salva bruta em arquivo, anonimizada, e nunca reconsultada | Adotar |
| **D-49** | A cota de teste é gasta em validação de **contrato**, não em cobertura de superfície nem em descoberta de preço | Adotar |
| **D-50** | Recarga paga do Escavador é decisão exclusiva do usuário, tomada com o registro de execução §5 à vista | Adotar |
