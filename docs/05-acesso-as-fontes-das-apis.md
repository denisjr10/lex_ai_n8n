# Nota Técnica 02 — Como obter as fontes das APIs (Escavador e Trello)

| Campo | Valor |
|---|---|
| Status | Ativo — instruções operacionais |
| Versão | 0.1 |
| Data | 2026-08-19 |
| Responde a | Como resolver o R-01 (rede bloqueada) para iniciar o mapeamento das APIs |

---

## O problema

Este ambiente de desenvolvimento roda numa máquina virtual gerenciada, atrás de um proxy que aplica a política de rede do ambiente. A política atual (**Trusted**, o padrão) libera repositórios de pacotes e GitHub, e **bloqueia todo o resto**. Confirmado por teste:

```
403  api.escavador.com
403  suporte-api.escavador.com
403  developer.atlassian.com
```

Existem três saídas. Elas não são excludentes — a melhor combinação é a 3 + a 1.

---

## Saída 1 — Liberar os domínios na política de rede

A mais limpa. Vale para todas as sessões futuras.

### Como fazer

1. Abra **claude.ai/code**.
2. Na linha **acima da caixa de mensagem**, clique no **ícone de nuvem** com o nome do ambiente atual (provavelmente `Default`). Não há página de configurações nem URL direta — o acesso é só por esse seletor.
3. Passe o mouse sobre o ambiente e clique no **ícone de engrenagem** que aparece à direita. (Ou escolha **Add cloud environment** para criar um ambiente dedicado a este projeto — mais organizado, e evita mexer no `Default` que serve a todos os seus outros trabalhos.)
4. No campo **Network access**, troque de `Trusted` para **`Custom`**.
5. No campo **Allowed domains**, coloque **um domínio por linha**:

```text
*.escavador.com
developer.atlassian.com
*.atlassian.com
api.trello.com
```

6. Marque a caixa **"Also include default list of common package managers"** — sem ela, você perde o acesso a npm, PyPI e GitHub, e nada mais funciona.
7. Salve.

### Detalhes que importam

- **Só vale para sessões novas.** A configuração é lida quando a sessão inicia; a sessão em andamento continua com a política antiga. Depois de salvar, abra uma sessão nova.
- **Perder esta conversa não perde o trabalho** — tudo está commitado no repositório. Basta a sessão nova ler `docs/` para retomar o contexto.
- `*.` cobre subdomínios: `*.escavador.com` já inclui `api.` e `suporte-api.`.
- Os quatro níveis disponíveis são **None**, **Trusted** (padrão), **Full** e **Custom**. `Full` também resolveria, mas abre tudo — `Custom` é a escolha certa.
- Cada ambiente tem sua própria lista. Não existe lista no nível da organização.

---

## Saída 2 — Documentação dentro do repositório

Mais trabalhosa, mas tem uma vantagem real: **a fonte fica versionada**. Se o Escavador mudar a API, o histórico do repositório mostra o que mudou.

### Como colocar o arquivo aqui

| Forma | Como |
|---|---|
| **Anexar na conversa** | Use o anexo desta conversa. Eu leio e faço o commit |
| **Subir pelo GitHub** | No repositório → botão **Add file** → **Upload files** → arraste os arquivos → escolha a branch `claude/law-firm-ai-automation-6pwaug` → **Commit** |
| **Colar no chat** | Só para trechos curtos. Documentação inteira não cabe |

### O que vale a pena procurar

Em ordem de utilidade:

1. **Especificação OpenAPI / Swagger** — o formato ideal, porque é legível por máquina e completo. A documentação do Escavador parece gerada por ferramenta que costuma publicar esses arquivos. Tente estes endereços no navegador:
   - `https://api.escavador.com/v2/docs/openapi.yaml`
   - `https://api.escavador.com/v2/docs/openapi.json`
   - `https://api.escavador.com/v2/docs/collection.json` *(coleção Postman)*
2. **Coleção Postman ou Insomnia**, se o Escavador fornecer.
3. **Página salva** — no navegador, `Ctrl+S` → "Página completa" ou "HTML somente". Serve, mas dá mais trabalho para interpretar.
4. **PDF** da documentação.

Sugestão de destino no repositório: `docs/fontes/escavador/` e `docs/fontes/trello/`.

---

## Saída 3 — SDKs oficiais via GitHub *(já funciona)*

**Tráfego do GitHub passa por um proxy separado, independente da política de rede.** Ou seja: mesmo com o bloqueio ativo, dá para ler o código-fonte de qualquer repositório público — e o Escavador mantém SDK oficial.

### Já testado e disponível

O repositório [`Escavador/escavador-python`](https://github.com/Escavador/escavador-python) foi clonado com sucesso nesta sessão. O que ele revela:

| Achado | Valor |
|---|---|
| URL base | `https://api.escavador.com/api/v{1,2}/` |
| Limite de vazão | 500 requisições/minuto *(confirma o que a busca web indicava)* |
| Autenticação | Chave de API via variável `ESCAVADOR_API_KEY` |
| **Recursos da v1** | 15 módulos: busca, processo, movimentação, pessoa, instituição, jurisprudência, legislação, diário oficial, tribunal, monitoramento (tribunal e diário), busca assíncrona, callback, saldo |
| **Recursos da v2** | 4 módulos: processo, movimentação, envolvido, tribunal |
| Rotas identificáveis | Mais de 100 caminhos, com parâmetros |
| Modelos de resposta | Classes tipadas com todos os campos documentados |

Isso é **fonte primária real** — é o código que o próprio Escavador mantém, não interpretação de terceiros.

### A ressalva importante

O SDK **não é substituto completo da documentação**. A v2 do SDK cobre 4 recursos, enquanto a documentação oficial descreve áreas que não aparecem ali — monitoramento de processos na v2, atualização de processos sob demanda, e acesso a autos com certificado digital. Ou seja:

> **O SDK dá o esqueleto detalhado; a documentação oficial completa o que falta.** Combinar as duas fontes é o melhor resultado.

### Para o Trello

Mesmo caminho, se necessário: a Atlassian mantém bibliotecas públicas no GitHub, e existem clientes de comunidade bem mantidos. Menos crítico — a API do Trello é simples e estável, e boa parte já foi confirmada por busca web.

---

## Recomendação

1. **Agora:** posso começar o mapeamento do Escavador pelo SDK já clonado. Cobre a maior parte e não depende de você fazer nada.
2. **Em paralelo:** ajuste a política de rede para `Custom` (Saída 1). É rápido e resolve de vez, inclusive para o Trello.
3. **Se a Saída 1 não for possível:** procure o arquivo OpenAPI e traga pela Saída 2.

As três juntas dão cobertura completa. Só a 3 já destrava o início.
