/**
 * identificador.ts — a costura entre `string` no domínio e `uuid` no banco
 * ---------------------------------------------------------------------------
 * O CHASSI TRABALHA COM `string`. O BANCO EXIGE `uuid`.
 *
 * `EventoDeAuditoria` declara `usuario_id: string`, `sessao_id: string`,
 * `inquilino_id: string` e `requisicao_id: string`. As colunas correspondentes
 * são `uuid NOT NULL`, três delas com chave estrangeira. O domínio não sabe
 * disso, e não deve saber — ele descreve o ato, não o armazenamento.
 *
 * ⚠️ POR QUE ISSO É MAIS GRAVE DO QUE UM ERRO DE TIPO COMUM.
 *
 * Auditoria indisponível BLOQUEIA a operação (D-77). Um identificador
 * malformado faz o INSERT falhar, o `registrar` lançar, e o chassi recusar a
 * chamada — **inclusive as legítimas**. Um `usuario_id` fora do formato não
 * degrada o registro: ele para a plataforma inteira.
 *
 * Isso está certo — é a Regra 5 funcionando, e parar é melhor do que agir sem
 * prova. Mas o diagnóstico não pode ser
 * `invalid input syntax for type uuid: "usr_014"` vindo do PostgreSQL às três
 * da manhã. Quem for acordado precisa ler QUAL campo veio torto.
 *
 * Por isso a conferência acontece aqui, antes do INSERT, e nomeia o campo.
 *
 * E ela NÃO substitui a do banco. A coluna continua `uuid`, a chave
 * estrangeira continua existindo, e é ela que garante que o `usuario_id`
 * aponta para uma pessoa que existe — coisa que nenhuma expressão regular
 * sabe. Esta função só melhora a mensagem; a barreira continua sendo o banco
 * (Regra 1: privilégio e integridade se aplicam em código verificado, não em
 * boa vontade da camada de cima).
 */

/**
 * UUID em qualquer versão, incluindo o `nil`.
 *
 * Deliberadamente NÃO exige a versão 4. O `gen_random_uuid()` do PostgreSQL
 * produz v4, mas identificador que venha de fora — de um canal, de um
 * fornecedor, de uma migração futura — pode ser v1 ou v7 e continua sendo um
 * `uuid` válido para a coluna. Recusar aqui o que o banco aceita seria
 * inventar uma regra que o esquema não tem.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class IdentificadorInvalido extends Error {
  readonly campo: string;

  constructor(campo: string, valor: unknown) {
    // O VALOR ENTRA NA MENSAGEM DE PROPÓSITO, e é seguro: estes campos são
    // identificadores internos — id de sessão, de usuário, de inquilino, de
    // requisição. Nenhum deles carrega número de processo, nome de parte ou
    // teor de peça. Sem o valor, a mensagem diria "o usuario_id está torto" e
    // deixaria quem investiga sem o que procurar no log do canal.
    super(
      `auditoria: o campo "${campo}" precisa ser um uuid e veio ${JSON.stringify(valor)}. ` +
        `Nenhuma operação prossegue sem registro (D-77), então isto bloqueia a chamada — ` +
        `conserte a origem do identificador, não a auditoria.`,
    );
    this.name = 'IdentificadorInvalido';
    this.campo = campo;
  }
}

/** Confere e devolve o mesmo texto. Lança `IdentificadorInvalido` se não for. */
export function exigirUuid(campo: string, valor: unknown): string {
  if (typeof valor !== 'string' || !UUID.test(valor)) {
    throw new IdentificadorInvalido(campo, valor);
  }
  return valor;
}

/** Versão opcional: `null` e `undefined` passam, o resto é conferido. */
export function uuidOpcional(campo: string, valor: unknown): string | null {
  if (valor === undefined || valor === null || valor === '') return null;
  return exigirUuid(campo, valor);
}

/** Só responde se é uuid, sem lançar. Para quem precisa decidir, não gravar. */
export function ehUuid(valor: unknown): valor is string {
  return typeof valor === 'string' && UUID.test(valor);
}
