#!/usr/bin/env node
/**
 * importar-autos.mjs — converte autos em PDF para o formato da API do Escavador
 * ---------------------------------------------------------------------------
 * POR QUE ELE IMITA A API, E NÃO O CONTRATO DA DEMO DIRETAMENTE
 *
 * Seria mais curto escrever o instantâneo aqui mesmo. Seria também um erro:
 * passariam a existir DOIS lugares que anonimizam, e um deles acabaria ficando
 * para trás. Este script produz a mesma forma que a API do Escavador devolve,
 * e quem anonimiza continua sendo `anonimizar.mjs`, sozinho.
 *
 * O QUE SAI DO PDF — e o que fica de propósito
 *
 * Sai: capa (número, classe, órgão, assunto, valor, datas, segredo de justiça),
 * partes com papel e advogado, e a linha do tempo da tabela "Documentos".
 * Fica: petição, decisão, laudo, anexo. A API do Escavador também não os
 * entrega, e a demo não deve prometer o que o produto não vai fazer.
 *
 * De um processo de 700 páginas saem umas três.
 *
 * Uso:
 *   node captura/importar-autos.mjs            # converte tudo de captura/autos/
 *   node captura/importar-autos.mjs --conferir # + relatório do que foi lido
 *
 * Depois:
 *   node captura/anonimizar.mjs --autos        # gera o instantâneo anonimizado
 *
 * Nada aqui chama a internet nem gasta crédito de API.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extrairTexto, localizarPdftotext, AJUDA_SEM_PDFTOTEXT } from './pdf.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ENTRADA = path.join(AQUI, 'autos');
const SAIDA = path.join(AQUI, 'autos-texto');
const conferir = process.argv.includes('--conferir');

if (!localizarPdftotext()) { console.error(AJUDA_SEM_PDFTOTEXT); process.exit(1); }
if (!fs.existsSync(ENTRADA)) { console.error(`\n  ${ENTRADA} não existe.\n`); process.exit(1); }

// ===========================================================================
// Vocabulário processual
// ===========================================================================
const POLO_ATIVO = /^(AUTOR|REQUERENTE|EXEQUENTE|RECLAMANTE|APELANTE|IMPETRANTE|AGRAVANTE|EMBARGANTE|RECORRENTE|SUSCITANTE|DEMANDANTE|CREDOR|INVENTARIANTE)/;
const POLO_PASSIVO = /^(R[ÉE]U|REQUERIDO|EXECUTADO|RECLAMAD|APELAD|IMPETRAD|AGRAVAD|EMBARGAD|RECORRID|SUSCITAD|DEMANDAD|DEVEDOR|LITISCONSORTE)/;
const EH_ADVOGADO = /(ADVOGAD|PROCURADOR|DEFENSOR)/;

// Marcas de pessoa jurídica. Não é infalível, e não precisa ser: erra para
// FISICA, que é o pseudônimo mais conservador.
const MARCAS_PJ = /\b(LTDA|S\.?\/?A\b|EIRELI|ME\b|MEI\b|EPP\b|MUNIC[ÍI]PIO|ESTADO DO|UNI[ÃA]O|SECRETARIA|MINIST[ÉE]RIO|BANCO|SEGURADORA|INSS|FAZENDA|PREFEITURA|EMPREENDIMENTOS|COM[ÉE]RCIO|IND[ÚU]STRIA|SERVI[ÇC]OS|ASSOCIA[ÇC][ÃA]O|FUNDA[ÇC][ÃA]O|COOPERATIVA|INSTITUTO|HOSPITAL|CL[ÍI]NICA|OPERADORA|TELECOM|ENERGIA|SANEAMENTO)\b/i;

const tipoPessoa = (nome) => (MARCAS_PJ.test(nome) ? 'JURIDICA' : 'FISICA');
const poloDe = (papel) => (POLO_ATIVO.test(papel) ? 'ATIVO' : POLO_PASSIVO.test(papel) ? 'PASSIVO' : 'NENHUM');

// Tribunal a partir do segmento J.TR do número CNJ, quando o cabeçalho não diz
const TRIBUNAIS = {
  '8.03': ['TJAP', 'Tribunal de Justiça do Estado do Amapá'],
  '8.15': ['TJPB', 'Tribunal de Justiça da Paraíba'],
  '5.08': ['TRT8', 'Tribunal Regional do Trabalho da 8ª Região'],
};

const dataBr = (s) => {
  const m = String(s || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

function valorCausa(s) {
  const m = String(s || '').match(/R\$\s*([\d.]+,\d{2})/);
  if (!m) return null;
  const valor = Number(m[1].replace(/\./g, '').replace(',', '.'));
  return { valor, moeda: 'BRL', valor_formatado: `R$ ${m[1]}` };
}

const rotulo = (texto, re) => { const m = texto.match(re); return m ? m[1].trim() : null; };

// ===========================================================================
// Capa — duas variantes
// ===========================================================================

/** PJe cível/estadual: rótulos em linha própria, partes em duas colunas. */
function lerCapaPJe(bloco) {
  const numero = rotulo(bloco, /^\s*N[úu]mero:\s*([\d.\-]+)\s*$/m);
  if (!numero) return null;

  return {
    numero_cnj: numero,
    classe: rotulo(bloco, /^\s*Classe:\s*(.+?)\s*$/m),
    orgao_julgador: rotulo(bloco, /^\s*[ÓO]rg[ãa]o julgador:\s*(.+?)\s*$/m),
    assunto: rotulo(bloco, /^\s*Assuntos?:\s*(.+?)\s*$/m),
    data_inicio: dataBr(rotulo(bloco, /^\s*[ÚU]ltima distribui[çc][ãa]o\s*:\s*(.+?)\s*$/m)),
    valor_causa: valorCausa(rotulo(bloco, /^\s*Valor da causa:\s*(.+?)\s*$/m)),
    segredo_justica: /^\s*Segredo de justi[çc]a\?\s*SIM/mi.test(bloco),
    envolvidos: lerPartesPJe(bloco),
  };
}

/** As partes vivem entre o cabeçalho "Partes … Procurador" e "Documentos".
 *  Cada linha traz `NOME (PAPEL)` à esquerda e, quando há, o advogado à direita. */
function lerPartesPJe(bloco) {
  const m = bloco.match(/^\s*Partes\s{2,}Procurador[\s\S]*?$/m);
  if (!m) return [];
  const inicio = bloco.indexOf(m[0]) + m[0].length;
  const fim = bloco.indexOf('\nDocumentos', inicio);
  const trecho = bloco.slice(inicio, fim > 0 ? fim : inicio + 4000);

  const envolvidos = [];
  for (const linha of trecho.split('\n')) {
    if (!linha.trim()) continue;
    // O -table separa colunas por 2+ espaços, mas o nome também pode vir
    // quebrado dentro da célula. Casar o par NOME (PAPEL) é mais robusto.
    const pares = [...linha.matchAll(/([A-ZÀ-Ý][A-ZÀ-Ý0-9ÇÃÕÁÉÍÓÚÂÊÔÀ.'&/\- ]{1,80}?)\s*\(([A-ZÀ-Ý ]{3,40})\)/g)]
      .map((p) => ({ nome: p[1].replace(/\s{2,}/g, ' ').trim(), papel: p[2].trim() }));
    if (!pares.length) continue;

    const partes = pares.filter((p) => !EH_ADVOGADO.test(p.papel));
    const advs = pares.filter((p) => EH_ADVOGADO.test(p.papel));

    if (partes.length) {
      for (const p of partes) {
        envolvidos.push({
          nome: p.nome, tipo: p.papel, tipo_normalizado: p.papel,
          polo: poloDe(p.papel), tipo_pessoa: tipoPessoa(p.nome),
          advogados: advs.map((a) => ({ nome: a.nome, tipo_pessoa: 'FISICA', oabs: [] })),
        });
      }
    } else if (advs.length && envolvidos.length) {
      // Advogado numa linha só sua pertence à parte imediatamente acima
      const ultimo = envolvidos[envolvidos.length - 1];
      for (const a of advs) ultimo.advogados.push({ nome: a.nome, tipo_pessoa: 'FISICA', oabs: [] });
    }
  }
  return envolvidos;
}

/** Justiça do Trabalho: `PAPEL: NOME`, uma por linha, sob "Partes:". */
function lerCapaTrabalhista(bloco) {
  const numero = (bloco.match(/\b(\d{7}-\d{2}\.\d{4}\.5\.\d{2}\.\d{4})\b/) || [])[1];
  if (!numero) return null;

  const envolvidos = [];
  const trecho = bloco.slice(bloco.search(/^\s*Partes:\s*$/m));
  // No -table cada parte fica separada da seguinte por uma linha em branco.
  // Parar na primeira em branco cortaria a lista logo na primeira parte; o
  // fim do bloco são DUAS em branco seguidas.
  let brancasSeguidas = 0;
  for (const linha of trecho.split('\n').slice(1, 40)) {
    if (!linha.trim()) { if (envolvidos.length && ++brancasSeguidas >= 2) break; continue; }
    brancasSeguidas = 0;
    const m = linha.match(/^\s*([A-ZÀ-Ý ]{3,30}):\s*(.+?)\s*$/);
    if (!m) { if (envolvidos.length) break; continue; }
    const [, papel, nome] = [m[0], m[1].trim(), m[2].trim()];
    if (EH_ADVOGADO.test(papel)) {
      if (envolvidos.length) envolvidos[envolvidos.length - 1].advogados.push({ nome, tipo_pessoa: 'FISICA', oabs: [] });
    } else {
      envolvidos.push({
        nome, tipo: papel, tipo_normalizado: papel, polo: poloDe(papel),
        tipo_pessoa: tipoPessoa(nome), advogados: [],
      });
    }
  }

  return {
    numero_cnj: numero,
    classe: rotulo(bloco, /^\s*(A[çc][ãa]o Trabalhista[^\n]*)$/m),
    orgao_julgador: rotulo(bloco, /(\d+ª\s+VARA DO TRABALHO[^\n]*)/i),
    assunto: null,
    data_inicio: dataBr(rotulo(bloco, /^\s*Data da Autua[çc][ãa]o:\s*(.+?)\s*$/m)),
    valor_causa: valorCausa(rotulo(bloco, /^\s*Valor da causa:\s*(.+?)\s*$/m)),
    segredo_justica: /^\s*Segredo de justi[çc]a\?\s*SIM/mi.test(bloco),
    envolvidos,
  };
}

// ===========================================================================
// A linha do tempo — tabela "Documentos"
// ===========================================================================
// No modo -table as colunas ficam alinhadas de verdade. Uma entrada é uma linha
// que começa com o Id; a hora vem na linha seguinte, sozinha.
// O id é numérico no PJe estadual e hexadecimal na Justiça do Trabalho; lá a
// hora vem na mesma linha, aqui na seguinte. Exigir a data logo após o id é o
// que impede a expressão de casar com qualquer número solto da página.
const LINHA_ENTRADA = /^\s*([0-9A-Fa-f]{6,12})\s+(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2}))?\s+(.*)$/;
const SO_HORA = /^\s*(\d{2}:\d{2})\s*$/;

function lerDocumentos(texto) {
  // A tabela é lida PÁGINA A PÁGINA. Varrer o documento inteiro de uma vez
  // fazia a leitura seguir para dentro das peças, e ali o texto do corpo
  // entrava como se fosse continuação de título — arrastando cabeçalho de
  // página e nome de parte de outro processo junto.
  //
  // Mas ela também NÃO se limita às páginas com cabeçalho: num processo longo
  // o cabeçalho aparece uma vez e a tabela segue por dezenas de páginas. A
  // regra é: começa no cabeçalho, e continua enquanto a página ainda render
  // linhas de tabela. A primeira página sem nenhuma encerra a leitura.
  const CABECALHO = /^\s*Id\.?\s{2,}Data(\s+da)?\s{2,}Documento\s{2,}Tipo\s*$/m;
  const itens = [];
  let ativo = false;
  let colunas = null;

  for (const pagina of texto.split('\f')) {
    const temCabecalho = CABECALHO.test(pagina);
    if (temCabecalho) { ativo = true; colunas = colunasDoCabecalho(pagina); }
    if (!ativo) continue;

    const daPagina = lerDocumentosDaPagina(pagina, colunas);
    if (!daPagina.length && !temCabecalho) { ativo = false; continue; }
    itens.push(...daPagina);
  }
  return itens;
}

function colunasDoCabecalho(pagina) {
  const linha = pagina.split('\n').find((l) => /^\s*Id\.?\s{2,}Data/.test(l)) || '';
  return { doc: linha.indexOf('Documento'), tipo: linha.indexOf('Tipo') };
}

function lerDocumentosDaPagina(texto, colunas) {
  const linhas = texto.split('\n');
  const itens = [];
  // Numa página de continuação não há cabeçalho: as colunas vêm da página que
  // abriu a tabela, e a leitura já começa valendo.
  let dentro = !texto.match(/^\s*Id\.?\s{2,}Data/m);
  let atual = null;
  // Onde começam as colunas Documento e Tipo, lidas do próprio cabeçalho.
  // Sem isso, a continuação de um título engolia cabeçalho de página inteiro —
  // inclusive nome de parte de OUTRO processo, que o cofre não conhece e
  // portanto não anonimiza. Foi assim que "BORGES" chegou ao instantâneo.
  let colDoc = colunas ? colunas.doc : 0;
  let colTipo = colunas ? colunas.tipo : Infinity;

  for (const linha of linhas) {
    if (/^\s*Id\.?\s{2,}Data(\s+da)?\s{2,}Documento\s{2,}Tipo\s*$/.test(linha)) {
      dentro = true;
      colDoc = linha.indexOf('Documento');
      colTipo = linha.indexOf('Tipo');
      continue;
    }
    if (!dentro) continue;

    const m = linha.match(LINHA_ENTRADA);
    if (m) {
      const [, id, data, hora, resto] = m;
      const colunas = resto.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);
      atual = {
        id, data: dataBr(data), hora: hora || null,
        documento: colunas[0] || null,
        tipo: colunas.length > 1 ? colunas[colunas.length - 1] : colunas[0] || null,
      };
      itens.push(atual);
      continue;
    }

    const h = linha.match(SO_HORA);
    if (h && atual && !atual.hora) { atual.hora = h[1]; continue; }

    // Continuação do nome do documento, quando ele quebra em duas linhas.
    // Só vale se o texto começar DENTRO da coluna Documento: qualquer coisa
    // fora dela é cabeçalho, rodapé ou carimbo do sistema.
    if (atual && linha.trim() && !SO_HORA.test(linha)) {
      const inicio = linha.search(/\S/);
      if (inicio >= colDoc - 2 && inicio < colTipo - 2) {
        const cont = linha.slice(colDoc - 2, colTipo - 2).trim().split(/\s{2,}/)[0];
        if (cont && cont.length < 60 && !/^\d{6,}$/.test(cont)) {
          atual.documento = `${atual.documento || ''} ${cont}`.trim();
        }
      }
    }
  }
  return itens;
}

// ===========================================================================
// Montagem no formato da API
// ===========================================================================
function montar(capa, documentos, apelido) {
  const [, jtr] = capa.numero_cnj.match(/\.(\d)\.(\d{2})\./) ? [null, capa.numero_cnj.match(/\.(\d)\.(\d{2})\./).slice(1).join('.')] : [null, ''];
  const [sigla, nomeTribunal] = TRIBUNAIS[jtr] || [null, null];

  const ordenados = [...documentos].sort((a, b) => String(b.data).localeCompare(String(a.data)));
  const ativos = ordenados.filter((d) => d.data);

  const ativo = capa.envolvidos.find((e) => e.polo === 'ATIVO');
  const passivo = capa.envolvidos.find((e) => e.polo === 'PASSIVO');

  return {
    capa: {
      numero_cnj: capa.numero_cnj,
      titulo_polo_ativo: ativo ? ativo.nome : 'NÃO INFORMADO',
      titulo_polo_passivo: passivo ? passivo.nome : 'NÃO INFORMADO',
      data_inicio: capa.data_inicio,
      data_ultima_movimentacao: ativos.length ? ativos[0].data : null,
      quantidade_movimentacoes: documentos.length,
      unidade_origem: { nome: capa.orgao_julgador, tribunal_sigla: sigla },
      fontes: [{
        sigla, nome: nomeTribunal, grau_formatado: 'Primeiro Grau', sistema: 'PJe',
        segredo_justica: capa.segredo_justica,
        status_predito: null,
        capa: {
          orgao_julgador: capa.orgao_julgador,
          classe: capa.classe,
          assunto: capa.assunto,
          area: null,
          situacao: null,
          valor_causa: capa.valor_causa,
        },
        envolvidos: capa.envolvidos,
      }],
    },
    envolvidos: { items: [] },   // a lista boa é a da capa; ver anonimizar.mjs
    movimentacoes: {
      items: ativos.map((d) => ({
        id: d.id,
        data: d.data,
        tipo: d.tipo || 'DOCUMENTO',
        // O PJe não tem texto de andamento como o Escavador: o que existe é o
        // título do documento. É pouco, e é honesto — inventar não é opção.
        conteudo: [d.tipo, d.documento].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' — '),
        fonte: { sigla },
      })),
    },
    _origem_apelido: apelido,
  };
}

// ===========================================================================
// Execução
// ===========================================================================
const pdfs = fs.readdirSync(ENTRADA).filter((f) => f.toLowerCase().endsWith('.pdf')).sort();
if (!pdfs.length) { console.log('\nNenhum PDF em captura/autos/.\n'); process.exit(0); }

fs.mkdirSync(SAIDA, { recursive: true });
console.log(`\n${pdfs.length} PDF(s) em captura/autos/\n`);

let n = 0;
const problemas = [];
// Um mesmo processo aparece mais de uma vez: a capa se repete ao longo dos
// autos, e há apensos que trazem a capa do processo de origem.
const jaVistos = new Map();

for (const nome of pdfs) {
  const caminho = path.join(ENTRADA, nome);
  let texto;
  try {
    texto = extrairTexto(caminho, { modo: 'table' });
  } catch (e) {
    problemas.push(`${nome}: não deu para ler (${String(e.message).split('\n')[0]})`);
    continue;
  }

  // Um arquivo pode trazer mais de um processo (apenso, processo de origem).
  // Cada "Número:" abre uma capa nova.
  const marcas = [...texto.matchAll(/^\s*N[úu]mero:\s*[\d.\-]+\s*$/gm)].map((m) => m.index);
  const blocos = marcas.length
    ? marcas.map((ini, i) => texto.slice(ini, marcas[i + 1] ?? texto.length))
    : [texto];

  const documentos = lerDocumentos(texto);

  let capasLidas = 0;
  blocos.forEach((bloco, i) => {
    const capa = lerCapaPJe(bloco) || lerCapaTrabalhista(bloco);
    if (!capa) return;
    capasLidas++;

    const anterior = jaVistos.get(capa.numero_cnj);
    if (anterior) {
      // Fica a versão com mais partes reconhecidas — capa repetida no meio dos
      // autos costuma vir truncada.
      if (capa.envolvidos.length > anterior.partes) {
        anterior.partes = capa.envolvidos.length;
        const dados = montar(capa, anterior.docs, anterior.apelido);
        fs.writeFileSync(path.join(SAIDA, `${anterior.apelido}.local.json`), JSON.stringify(dados, null, 2) + '\n');
      }
      return;
    }
    const apelido = `AUTOS-${String(++n).padStart(2, '0')}`;
    // Com mais de uma capa no arquivo, só a primeira leva a linha do tempo:
    // não há como saber a qual processo cada documento pertence.
    const docs = i === 0 ? documentos : [];
    jaVistos.set(capa.numero_cnj, { apelido, docs, partes: capa.envolvidos.length });
    const dados = montar(capa, docs, apelido);

    fs.writeFileSync(path.join(SAIDA, `${apelido}.local.json`), JSON.stringify(dados, null, 2) + '\n');

    console.log(`  ${capa.segredo_justica ? '🔒' : '  '} ${apelido}  ${capa.numero_cnj}`);
    console.log(`       ${capa.classe || '(classe não lida)'}`);
    console.log(`       ${capa.envolvidos.length} parte(s) · ${docs.length} entrada(s) de linha do tempo · início ${capa.data_inicio || '?'}`);
    if (!capa.envolvidos.length) problemas.push(`${apelido}: nenhuma parte reconhecida`);
    if (i === 0 && !docs.length) problemas.push(`${apelido}: tabela Documentos não lida`);

    if (conferir) {
      for (const e of capa.envolvidos) {
        console.log(`       · ${e.nome} (${e.tipo}, ${e.polo}, ${e.tipo_pessoa})${e.advogados.length ? ` — adv: ${e.advogados.map((a) => a.nome).join(', ')}` : ''}`);
      }
      for (const d of dados.movimentacoes.items.slice(0, 5)) {
        console.log(`       ▸ ${d.data} · ${String(d.conteudo).slice(0, 90)}`);
      }
    }
    console.log('');
  });

  if (!capasLidas) problemas.push(`${nome}: nenhuma capa reconhecida`);
}

console.log(`  ${n} processo(s) escritos em captura/autos-texto/ (fora do Git)\n`);

if (problemas.length) {
  console.log('  \x1b[33mConfira estes pontos:\x1b[0m');
  for (const p of problemas) console.log(`    - ${p}`);
  console.log('');
}

console.log(`  Estes arquivos ainda têm NOME REAL. A anonimização é o passo seguinte:
    node captura/anonimizar.mjs --autos

  Para ver parte por parte o que foi lido:
    node captura/importar-autos.mjs --conferir
`);
