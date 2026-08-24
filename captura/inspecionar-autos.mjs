#!/usr/bin/env node
/**
 * inspecionar-autos.mjs — olha os PDFs dos autos SEM extrair nada para a demo
 * ---------------------------------------------------------------------------
 * Antes de escrever qualquer conversor, é preciso saber com o que se lida:
 *
 *   - o PDF tem camada de texto, ou é imagem escaneada? (imagem exige OCR)
 *   - quantas páginas, e onde está a lista de movimentações?
 *   - o tribunal formata a lista de que jeito?
 *
 * Este script responde a isso sem gravar nada e sem gastar crédito de API.
 * Nada aqui chama a internet.
 *
 * Depende do `pdftotext` (do pacote Poppler/Xpdf). No Windows ele costuma vir
 * junto do Git, em C:\Program Files\Git\mingw64\bin — instalado, mas fora do
 * PATH do PowerShell. Por isso o script procura em vez de exigir.
 *
 * Uso:
 *   node captura/inspecionar-autos.mjs              # só o diagnóstico
 *   node captura/inspecionar-autos.mjs --amostra    # + trecho do texto
 *
 * ⚠️ `--amostra` IMPRIME CONTEÚDO REAL do processo na tela. Se você colar essa
 *    saída no chat, o conteúdo vai junto. Use quando quiser mesmo mostrar o
 *    formato — é uma decisão sua, e por isso não é o comportamento padrão.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PASTA = path.join(AQUI, 'autos');
const comAmostra = process.argv.includes('--amostra');

if (!fs.existsSync(PASTA)) {
  console.error(`\n  A pasta ${path.relative(process.cwd(), PASTA)} não existe.\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Onde está o pdftotext
// ---------------------------------------------------------------------------
// "ENOENT" quer dizer apenas "não achei o programa" — e no Windows isso quase
// sempre significa que ele está instalado, mas fora do PATH do PowerShell.
// Procurar nos lugares prováveis evita mandar o usuário instalar o que ele já tem.
function localizarPdftotext() {
  const candidatos = [
    process.env.PDFTOTEXT,
    'pdftotext',
    'C:/Program Files/Git/mingw64/bin/pdftotext.exe',
    'C:/Program Files (x86)/Git/mingw64/bin/pdftotext.exe',
    process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}/Programs/Git/mingw64/bin/pdftotext.exe`,
    'C:/Program Files/poppler/bin/pdftotext.exe',
    'C:/ProgramData/chocolatey/bin/pdftotext.exe',
    'C:/Program Files/Xpdf/bin64/pdftotext.exe',
    '/usr/bin/pdftotext',
    '/usr/local/bin/pdftotext',
    '/opt/homebrew/bin/pdftotext',
  ].filter(Boolean);

  for (const c of candidatos) {
    try {
      execFileSync(c, ['-v'], { stdio: 'ignore' });
      return c;
    } catch (e) {
      // -v sai com código diferente de zero em algumas versões, mas se o
      // programa existe o erro NÃO é ENOENT. Então esse caso conta como achado.
      if (e && e.code !== 'ENOENT') return c;
    }
  }
  return null;
}

const PDFTOTEXT = localizarPdftotext();

if (!PDFTOTEXT) {
  console.error(`
  Não encontrei o programa pdftotext, que é quem lê o texto de dentro do PDF.

  Ele costuma vir junto do Git para Windows. Confira se este arquivo existe:
    C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe

  Se existir, rode assim (vale só para esta janela do PowerShell):
    $env:PDFTOTEXT = "C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe"
    node captura/inspecionar-autos.mjs

  Se não existir, instale o Poppler ou o Xpdf e rode de novo.
`);
  process.exit(1);
}

const pdfs = fs.readdirSync(PASTA).filter((f) => f.toLowerCase().endsWith('.pdf')).sort();

if (!pdfs.length) {
  console.log(`
  Nenhum PDF em captura/autos/.

  Coloque os arquivos lá e rode de novo. A pasta é ignorada pelo Git —
  os autos ficam no seu disco e não entram no repositório.
`);
  process.exit(0);
}

// pdftotext -layout preserva colunas, o que importa numa lista de movimentações.
// O separador de página é o caractere de form feed (\f).
function extrair(arquivo, primeira, ultima, comLayout = true) {
  const args = comLayout ? ['-layout', '-enc', 'UTF-8'] : ['-enc', 'UTF-8'];
  if (primeira) args.push('-f', String(primeira));
  if (ultima) args.push('-l', String(ultima));
  args.push(arquivo, '-');
  return execFileSync(PDFTOTEXT, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

// A linha do tempo do PJe NÃO é uma seção chamada "movimentações": é a tabela
// "Documentos" da capa — Id / Data / Documento / Tipo. Procurar pela palavra
// "andamento" dá falso positivo em petição que fala do andamento do feito.
const CABECALHO_TABELA = /\bId\.?\b[\s\S]{0,120}?\bData\b[\s\S]{0,120}?\bDocumento\b[\s\S]{0,120}?\bTipo\b/;
const PISTAS_CAPA = [
  /n[úu]mero( [úu]nico)?[:\s]/i, /classe[:\s]/i, /assunto[:\s]/i,
  /[óo]rg[ãa]o julgador/i, /valor da (causa|a[çc][ãa]o)/i, /autua[çc][ãa]o|distribui[çc][ãa]o/i,
];
const ROTULOS_PJE = [
  ['Número', /^\s*N[úu]mero:\s*(.+)$/m],
  ['Classe', /^\s*Classe:\s*(.+)$/m],
  ['Órgão julgador', /^\s*[ÓO]rg[ãa]o julgador:\s*(.+)$/m],
  ['Distribuição', /^\s*[ÚU]ltima distribui[çc][ãa]o\s*:\s*(.+)$/m],
  ['Autuação', /^\s*Data da Autua[çc][ãa]o:\s*(.+)$/m],
  ['Valor da causa', /^\s*Valor da causa:\s*(.+)$/m],
  ['Assuntos', /^\s*Assuntos?:\s*(.+)$/m],
  ['Segredo de justiça', /^\s*Segredo de justi[çc]a\?\s*(.+)$/m],
];

console.log(`\n${pdfs.length} PDF(s) em captura/autos/`);
console.log(`leitor: ${PDFTOTEXT}\n`);

const resumo = [];

for (const nome of pdfs) {
  const caminho = path.join(PASTA, nome);
  const tamanho = fs.statSync(caminho).size;

  let texto;
  try {
    texto = extrair(caminho);
  } catch (e) {
    console.log(`  ✗ ${nome}\n      pdftotext falhou: ${String(e.message).split('\n')[0]}\n`);
    resumo.push({ nome, estado: 'ilegível' });
    continue;
  }

  const paginas = texto.split('\f');
  const totalPaginas = paginas.length - (paginas[paginas.length - 1].trim() ? 0 : 1);
  const caracteres = texto.replace(/\s/g, '').length;
  const porPagina = Math.round(caracteres / Math.max(totalPaginas, 1));

  // Menos de ~100 caracteres úteis por página quase sempre significa PDF de
  // imagem: o texto está lá para o olho humano, não para o programa.
  const temCamadaDeTexto = porPagina >= 100;

  // Onde começa a tabela Documentos, e quantas entradas ela tem
  const paginasComTabela = [];
  paginas.forEach((p, i) => { if (CABECALHO_TABELA.test(p)) paginasComTabela.push(i + 1); });

  // As entradas se contam pelos carimbos de data e hora da coluna Data — mas
  // no modo -layout as colunas se embaralham. Sem -layout o pdftotext devolve
  // a tabela coluna a coluna, e cada carimbo fica inteiro numa linha só.
  let entradas = 0;
  if (paginasComTabela.length) {
    const cru = extrair(caminho, paginasComTabela[0], paginasComTabela[paginasComTabela.length - 1], false);
    entradas = (cru.match(/\b\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\b/g) || []).length;
  }

  // Quais rótulos da capa foram encontrados — é o que o conversor vai ler
  const capa = ROTULOS_PJE
    .map(([rotulo, re]) => [rotulo, (texto.match(re) || [])[1]])
    .filter(([, v]) => v);
  const segredo = /^\s*Segredo de justi[çc]a\?\s*SIM/mi.test(texto);

  const paginasComCapa = [];
  paginas.forEach((p, i) => {
    const acertos = PISTAS_CAPA.filter((r) => r.test(p)).length;
    if (acertos >= 3) paginasComCapa.push(i + 1);
  });

  // Datas em formato brasileiro são o esqueleto de uma lista de andamentos
  const datas = texto.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || [];
  const cnj = texto.match(/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g) || [];

  console.log(`  ${temCamadaDeTexto ? '✓' : '⚠'} ${nome}`);
  console.log(`      ${totalPaginas} páginas · ${(tamanho / 1048576).toFixed(1)} MB · ${porPagina} caracteres úteis por página`);
  console.log(`      camada de texto : ${temCamadaDeTexto ? 'sim — dá para extrair' : 'NÃO — parece PDF escaneado, precisaria de OCR'}`);
  console.log(`      capa lida       : ${capa.length ? capa.map(([r]) => r).join(' · ') : 'nenhum rótulo do PJe reconhecido'}`);
  console.log(`      tabela Documentos: ${paginasComTabela.length ? `páginas ${paginasComTabela[0]}–${paginasComTabela[paginasComTabela.length - 1]} · ${entradas} entrada(s)` : 'não localizada'}`);
  console.log(`      outros processos citados: ${new Set(cnj).size > 1 ? `${new Set(cnj).size} números CNJ distintos` : 'só o próprio'}`);
  if (segredo) console.log(`      \x1b[33m⚠ SEGREDO DE JUSTIÇA\x1b[0m — o contrato manda o fluxo recusar exibir conteúdo`);

  if (comAmostra) {
    const alvo = paginasComTabela[0] || paginasComCapa[0] || 1;
    const linhas = paginas[alvo - 1].split('\n').filter((l) => l.trim()).slice(0, 20);
    console.log(`\n      — amostra da página ${alvo} —`);
    for (const l of linhas) console.log(`      | ${l.slice(0, 160)}`);
  }
  console.log('');

  resumo.push({
    nome, totalPaginas, temCamadaDeTexto, entradas, segredo,
    estado: !temCamadaDeTexto ? 'precisa de OCR'
      : !capa.length ? 'capa em formato não reconhecido'
      : !paginasComTabela.length ? 'capa ok, sem tabela Documentos'
      : `pronto — ${entradas} entrada(s) de linha do tempo`,
  });
}

console.log('  ─────────────────────────────────────────────');
for (const r of resumo) console.log(`  ${r.segredo ? '🔒' : '  '} ${r.nome}: ${r.estado}`);

const semTexto = resumo.filter((r) => r.temCamadaDeTexto === false).length;
const emSegredo = resumo.filter((r) => r.segredo).length;
if (emSegredo) console.log(`
  🔒 ${emSegredo} processo(s) em segredo de justiça. O contrato do instantâneo
     já prevê o campo, e a regra é recusar exibir conteúdo. Vale decidir se
     entra na demo como CASO DE TESTE da recusa, ou se fica de fora.`);
console.log(`
  O que acontece a seguir: destes PDFs sai APENAS o que cabe no contrato do
  instantâneo — capa, partes e lista de movimentações. Petição, decisão e
  documento anexo ficam de fora de propósito (demo/CONTRATO-DO-INSTANTANEO.md,
  §4): a API do Escavador também não os entrega, e a demo não deve prometer
  o que o produto não vai fazer.
${semTexto ? `
  ⚠️ ${semTexto} arquivo(s) sem camada de texto. Esses são imagem, não texto —
     precisariam de OCR (leitura de imagem), que é outro caminho e outro custo.
` : ''}${comAmostra ? '' : `
  Para ver como o tribunal formata a lista (e eu conseguir escrever o
  conversor), rode:  node captura/inspecionar-autos.mjs --amostra
  Isso imprime conteúdo real na tela — é decisão sua mostrar ou não.
`}`);
