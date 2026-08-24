/**
 * pdf.mjs — leitura de texto de PDF, compartilhada pelos scripts da captura
 * ---------------------------------------------------------------------------
 * Encapsula o `pdftotext` (Poppler/Xpdf) e o problema chato de achá-lo no
 * Windows: ele vem junto do Git, em mingw64\bin, que não está no PATH do
 * PowerShell. Mandar instalar o que já está instalado é o pior erro possível.
 *
 * Modos que importam aqui:
 *   -table  → colunas alinhadas de verdade. É o que torna a tabela
 *             "Documentos" do PJe legível por programa
 *   -layout → preserva o desenho da página; bom para a capa
 *
 * Nada aqui vai à internet.
 */

import { execFileSync } from 'node:child_process';

const CANDIDATOS = [
  process.env.PDFTOTEXT,
  'pdftotext',
  'C:/Program Files/Git/mingw64/bin/pdftotext.exe',
  'C:/Program Files (x86)/Git/mingw64/bin/pdftotext.exe',
  process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}/Programs/Git/mingw64/bin/pdftotext.exe`,
  'C:/Program Files/poppler/bin/pdftotext.exe',
  'C:/ProgramData/chocolatey/bin/pdftotext.exe',
  'C:/Program Files/Xpdf/bin64/pdftotext.exe',
  '/usr/bin/pdftotext', '/usr/local/bin/pdftotext', '/opt/homebrew/bin/pdftotext',
].filter(Boolean);

let cache;

export function localizarPdftotext() {
  if (cache !== undefined) return cache;
  for (const c of CANDIDATOS) {
    try {
      execFileSync(c, ['-v'], { stdio: 'ignore' });
      return (cache = c);
    } catch (e) {
      // -v sai com código != 0 em algumas versões. Se o erro NÃO é ENOENT,
      // o programa existe — e é isso que estamos procurando.
      if (e && e.code !== 'ENOENT') return (cache = c);
    }
  }
  return (cache = null);
}

export const AJUDA_SEM_PDFTOTEXT = `
  Não encontrei o programa pdftotext, que é quem lê o texto de dentro do PDF.

  Ele costuma vir junto do Git para Windows. Confira se este arquivo existe:
    C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe

  Se existir, rode assim (vale só para esta janela do PowerShell):
    $env:PDFTOTEXT = "C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe"

  Se não existir, instale o Poppler ou o Xpdf e rode de novo.
`;

/** @param {{modo?: 'table'|'layout'|'raw', primeira?: number, ultima?: number}} opcoes */
export function extrairTexto(arquivo, opcoes = {}) {
  const bin = localizarPdftotext();
  if (!bin) throw new Error('pdftotext não encontrado');

  const { modo = 'table', primeira, ultima } = opcoes;
  const args = [];
  if (modo === 'table') args.push('-table');
  else if (modo === 'layout') args.push('-layout');
  args.push('-enc', 'UTF-8');
  if (primeira) args.push('-f', String(primeira));
  if (ultima) args.push('-l', String(ultima));
  args.push(arquivo, '-');

  // No Windows o pdftotext devolve \r\n. Um \r invisível no fim da linha faz
  // qualquer expressão terminada em $ deixar de casar — e o sintoma é "a
  // tabela não foi lida", sem erro nenhum apontando a causa.
  return execFileSync(bin, args, { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })
    .replace(/\r\n?/g, '\n');
}

/** O pdftotext separa páginas com form feed. */
export const paginasDe = (texto) => texto.split('\f');
