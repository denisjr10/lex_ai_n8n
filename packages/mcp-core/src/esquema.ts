/**
 * Esquema de entrada — valida e normaliza antes de qualquer coisa cara
 * ---------------------------------------------------------------------------
 * Spec §4.2, etapa 7: *"Entrada inválida nunca chega à API — erro de validação
 * não custa crédito."*
 *
 * É uma biblioteca minúscula de propósito. Existem validadores excelentes no
 * ecossistema, e nenhum deles faz a única coisa que este precisa fazer e que
 * eles não fazem: **recusar campo com cara de credencial** (Spec §4.5).
 *
 * Trocar isto por uma biblioteca pronta é uma escolha razoável no dia em que a
 * superfície crescer — desde que a trava de credencial venha junto.
 */

import { parametroInvalido, type ErroInterno } from '@lex/dominio';
import { normalizarCnj } from '@lex/dominio';

export type Validacao<T> =
  | { readonly ok: true; readonly valor: T }
  | { readonly ok: false; readonly erro: ErroInterno };

export interface Campo<T> {
  readonly obrigatorio: boolean;
  /** Recebe o valor cru; devolve o normalizado ou um erro. */
  readonly ler: (bruto: unknown, nome: string) => Validacao<T>;
}

/**
 * ⚠️ A TRAVA QUE JUSTIFICA ESTE ARQUIVO EXISTIR
 *
 * Nenhuma ferramenta recebe credencial por parâmetro. O `ctx` já entrega o
 * cliente autenticado, e a ferramenta nunca vê o token.
 *
 * Sem esta trava, bastaria alguém declarar `entrada: { token: texto() }` para
 * abrir um caminho em que o agente — que lê conteúdo externo, e conteúdo
 * externo é hostil (Regra 4) — passa a escolher com qual credencial a
 * plataforma fala com o fornecedor. É a Regra 1 furada por um nome de campo.
 *
 * A recusa acontece na DECLARAÇÃO da ferramenta, não na chamada: o erro
 * aparece para quem escreve a ferramenta, e não para quem a usa.
 */
const NOME_DE_CREDENCIAL =
  /(^|_)(token|senha|password|secret|credencial|credential|api[_-]?key|apikey|authorization|bearer|chave)($|_)/i;

export function nomeDeCampoProibido(nome: string): boolean {
  return NOME_DE_CREDENCIAL.test(nome);
}

// ---------------------------------------------------------------------------
// Campos
// ---------------------------------------------------------------------------

export function texto(opcoes: { maximo?: number; obrigatorio?: boolean } = {}): Campo<string> {
  const maximo = opcoes.maximo ?? 500;
  return {
    obrigatorio: opcoes.obrigatorio ?? true,
    ler(bruto, nome) {
      if (typeof bruto !== 'string') {
        return { ok: false, erro: parametroInvalido(nome, 'precisa ser texto') };
      }
      const v = bruto.trim();
      if (!v) return { ok: false, erro: parametroInvalido(nome, 'não pode ser vazio') };
      if (v.length > maximo) {
        return {
          ok: false,
          erro: parametroInvalido(nome, `passa do tamanho máximo de ${maximo} caracteres`),
        };
      }
      return { ok: true, valor: v };
    },
  };
}

/**
 * Número CNJ, com dígito verificador conferido.
 *
 * Normaliza para a forma com máscara aqui, e só aqui. Depois desta etapa, o
 * número que circula pelo chassi é canônico — o que faz a comparação exata
 * contra `sujeitos_autorizados` ser segura.
 */
export function cnj(opcoes: { obrigatorio?: boolean } = {}): Campo<string> {
  return {
    obrigatorio: opcoes.obrigatorio ?? true,
    ler(bruto, nome) {
      if (typeof bruto !== 'string') {
        return { ok: false, erro: parametroInvalido(nome, 'precisa ser texto') };
      }
      const normalizado = normalizarCnj(bruto);
      if (!normalizado) {
        return {
          ok: false,
          erro: parametroInvalido(
            nome,
            'não é um número CNJ válido (formato NNNNNNN-DD.AAAA.J.TR.OOOO, com dígito verificador conferido)',
          ),
        };
      }
      return { ok: true, valor: normalizado };
    },
  };
}

export function umDe<const T extends readonly string[]>(
  valores: T,
  opcoes: { obrigatorio?: boolean } = {},
): Campo<T[number]> {
  return {
    obrigatorio: opcoes.obrigatorio ?? true,
    ler(bruto, nome) {
      if (typeof bruto !== 'string' || !valores.includes(bruto)) {
        return {
          ok: false,
          erro: parametroInvalido(nome, `precisa ser um de: ${valores.join(', ')}`),
        };
      }
      return { ok: true, valor: bruto as T[number] };
    },
  };
}

export function inteiro(
  opcoes: { minimo?: number; maximo?: number; obrigatorio?: boolean } = {},
): Campo<number> {
  const minimo = opcoes.minimo ?? 0;
  const maximo = opcoes.maximo ?? 100;
  return {
    obrigatorio: opcoes.obrigatorio ?? true,
    ler(bruto, nome) {
      // `Number()` DIZ SIM PARA COISAS QUE NÃO SÃO NÚMERO, e três delas viram
      // zero: `Number('')`, `Number(false)` e `Number([])`. Todas passavam por
      // `Number.isInteger` e chegavam à ferramenta como um `0` que ninguém
      // escreveu — um limite, uma página, uma quantidade, silenciosamente zero.
      //
      // O conserto não é testar as três: é aceitar só o que de fato representa
      // um número. Texto numérico continua valendo, porque parâmetro que chega
      // por JSON de agente frequentemente vem como texto, e recusar "12" seria
      // rigor sem propósito. Texto VAZIO, não: vazio é ausência de valor, e
      // ausência é assunto de `obrigatorio`, nunca de conversão.
      const ehTextoNumerico = typeof bruto === 'string' && bruto.trim() !== '';
      if (typeof bruto !== 'number' && !ehTextoNumerico) {
        return { ok: false, erro: parametroInvalido(nome, 'precisa ser um número inteiro') };
      }
      const n = typeof bruto === 'number' ? bruto : Number(bruto);
      if (!Number.isInteger(n)) {
        return { ok: false, erro: parametroInvalido(nome, 'precisa ser um número inteiro') };
      }
      if (n < minimo || n > maximo) {
        return { ok: false, erro: parametroInvalido(nome, `precisa estar entre ${minimo} e ${maximo}`) };
      }
      return { ok: true, valor: n };
    },
  };
}

/**
 * Confirmação explícita de operação destrutiva (D-29).
 *
 * Só aceita `true` literal. Não aceita `"true"`, nem `1`, nem `"sim"` — porque
 * a conversão automática é exatamente como um valor vindo de conteúdo externo
 * vira confirmação sem que ninguém tenha confirmado nada.
 */
export function confirmacao(): Campo<true> {
  return {
    obrigatorio: true,
    ler(bruto, nome) {
      if (bruto !== true) {
        return {
          ok: false,
          erro: parametroInvalido(
            nome,
            'esta operação é destrutiva e exige confirmação explícita (o valor booleano verdadeiro)',
          ),
        };
      }
      return { ok: true, valor: true };
    },
  };
}

// ---------------------------------------------------------------------------
// Esquema
// ---------------------------------------------------------------------------

export type Esquema = Readonly<Record<string, Campo<unknown>>>;

export type Lido<E extends Esquema> = {
  -readonly [K in keyof E]: E[K] extends Campo<infer T> ? T : never;
};

/**
 * Confere um esquema no momento da DECLARAÇÃO da ferramenta.
 *
 * Devolve a lista de problemas. Vazia significa esquema aceitável.
 */
export function conferirEsquema(esquema: Esquema): string[] {
  const problemas: string[] = [];
  for (const nome of Object.keys(esquema)) {
    if (nomeDeCampoProibido(nome)) {
      problemas.push(
        `o campo "${nome}" tem nome de credencial. Ferramenta nunca recebe credencial ` +
          'por parâmetro — o contexto já entrega o cliente autenticado (Spec §4.5).',
      );
    }
  }
  return problemas;
}

/**
 * Valida a entrada de uma chamada.
 *
 * Campo desconhecido é **recusado**, não ignorado. Ignorar seria aceitar em
 * silêncio que o agente mandasse coisas que ninguém declarou — e um dia uma
 * delas se chamaria como um parâmetro que a API entende.
 */
export function validar<E extends Esquema>(
  esquema: E,
  bruto: Readonly<Record<string, unknown>>,
): Validacao<Lido<E>> {
  // O TIPO DIZ `Record`, MAS O VALOR VEM DA REDE.
  //
  // `parametros` chega de um JSON que o agente montou, e `null` é JSON válido.
  // `Object.keys(null)` lança TypeError — e lançar aqui é diferente de recusar
  // aqui: o chassi devolveria uma exceção crua em vez do envelope de erro que
  // toda recusa produz, saindo pela porta que não passa pela tradução de erro.
  // Assinatura de tipo não protege de entrada externa; ela descreve o contrato
  // que o chamador deveria cumprir, e conteúdo externo é hostil (Regra 4).
  if (bruto === null || typeof bruto !== 'object' || Array.isArray(bruto)) {
    return {
      ok: false,
      erro: parametroInvalido('parametros', 'precisa ser um objeto com os parâmetros da ferramenta'),
    };
  }

  const conhecidos = new Set(Object.keys(esquema));
  for (const nome of Object.keys(bruto)) {
    if (!conhecidos.has(nome)) {
      return {
        ok: false,
        erro: parametroInvalido(nome, 'não é um parâmetro desta ferramenta'),
      };
    }
  }

  const saida: Record<string, unknown> = {};
  for (const [nome, campo] of Object.entries(esquema)) {
    const valor = bruto[nome];
    if (valor === undefined || valor === null) {
      if (campo.obrigatorio) {
        return { ok: false, erro: parametroInvalido(nome, 'é obrigatório') };
      }
      continue;
    }
    const r = campo.ler(valor, nome);
    if (!r.ok) return { ok: false, erro: r.erro };
    saida[nome] = r.valor;
  }

  return { ok: true, valor: saida as Lido<E> };
}
