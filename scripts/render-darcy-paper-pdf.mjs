import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const normalizePrintText = (value) => value
  .replace(/[\u2010-\u2015]/g, '-')
  .replace(/\u00a0/g, ' ');


const CANONICAL_PDF_DATE = "D:19700101000000+00'00'";

export function normalizePdfMetadata(pdf) {
  const source = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
  const latin1 = source.toString('latin1');
  let replacements = 0;
  const normalized = latin1.replace(
    /\/(?:CreationDate|ModDate) \(D:\d{14}[+-]\d{2}'\d{2}'\)/g,
    (entry) => {
      replacements += 1;
      const key = entry.startsWith('/CreationDate') ? '/CreationDate' : '/ModDate';
      return `${key} (${CANONICAL_PDF_DATE})`;
    },
  );
  if (replacements !== 2 || normalized.length !== latin1.length) {
    throw new Error(`Expected exactly two fixed-width PDF date fields; found ${replacements}`);
  }
  return Buffer.from(normalized, 'latin1');
}

const inline = (source) => {
  let value = escapeHtml(normalizePrintText(source));
  value = value.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
  value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return value;
};

const isTableDivider = (line) =>
  /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);

const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());

export function renderMarkdown(markdown, figureSvg) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      output.push(`<figure>${normalizePrintText(figureSvg)}<figcaption>${inline(image[1])}</figcaption></figure>`);
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      output.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.trim().startsWith('|') && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const header = cells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(cells(lines[index]));
        index += 1;
      }
      output.push('<table><thead><tr>' + header.map((cell) => `<th>${inline(cell)}</th>`).join('') + '</tr></thead><tbody>');
      for (const row of rows) output.push('<tr>' + row.map((cell) => `<td>${inline(cell)}</td>`).join('') + '</tr>');
      output.push('</tbody></table>');
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      output.push('<ol>' + items.map((item) => `<li>${inline(item)}</li>`).join('') + '</ol>');
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^-\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^-\s+/, ''));
        index += 1;
      }
      output.push('<ul>' + items.map((item) => `<li>${inline(item)}</li>`).join('') + '</ul>');
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      output.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(?:#{1,4}\s|!\[|\d+\.\s+|-\s+|>\s?)/.test(lines[index]) &&
      !(lines[index].trim().startsWith('|') && index + 1 < lines.length && isTableDivider(lines[index + 1]))
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }

  return output.join('\n');
}

export function documentHtml(markdown, figureSvg) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>T2424-0050 Darcy bounded mixed-robustness manuscript</title>
<style>
  @page { size: A4; margin: 20mm 18mm 22mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #17202a; font: 10pt/1.43 Georgia, "Times New Roman", serif; }
  h1, h2, h3, h4 { color: #102a43; font-family: Arial, Helvetica, sans-serif; break-after: avoid; }
  h1 { margin: 0 0 18pt; font-size: 23pt; line-height: 1.18; border-bottom: 2px solid #185fa5; padding-bottom: 10pt; }
  h2 { margin: 17pt 0 7pt; font-size: 15pt; }
  h3 { margin: 15pt 0 6pt; font-size: 12pt; }
  h4 { margin: 12pt 0 5pt; font-size: 10.5pt; }
  p { margin: 0 0 7pt; text-align: justify; orphans: 3; widows: 3; }
  blockquote { margin: 10pt 12pt; padding: 8pt 12pt; border-left: 3px solid #185fa5; background: #f4f8fb; font-style: italic; }
  code { font: 8.7pt/1.35 "SFMono-Regular", Consolas, monospace; background: #f1f4f7; padding: 1px 3px; overflow-wrap: anywhere; }
  a { color: #185fa5; text-decoration: none; }
  ol, ul { margin: 5pt 0 9pt 18pt; padding: 0; }
  li { margin: 2pt 0; }
  table { width: 100%; margin: 10pt 0 13pt; border-collapse: collapse; font-size: 8.7pt; break-inside: avoid; }
  th { background: #eaf2f8; color: #102a43; font-family: Arial, Helvetica, sans-serif; font-weight: 700; }
  th, td { border: 0.6px solid #9fb3c8; padding: 5px 6px; text-align: right; vertical-align: top; }
  th:first-child, td:first-child { text-align: left; }
  figure { width: 78%; margin: 10pt auto 12pt; break-inside: avoid; }
  figure svg { display: block; width: 100%; height: auto; }
  figcaption { margin-top: 5pt; color: #52606d; font-size: 8.5pt; text-align: left; }
  strong { color: #102a43; }
</style>
</head>
<body>
${renderMarkdown(markdown, figureSvg)}
</body>
</html>`;
}

async function main() {
  const [manuscriptPath, outputPath] = process.argv.slice(2);
  if (!manuscriptPath || !outputPath) {
    throw new Error('Usage: node scripts/render-darcy-paper-pdf.mjs <MANUSCRIPT.md> <paper.pdf>');
  }

  const markdown = await readFile(manuscriptPath, 'utf8');
  const figureSvg = '';
  await mkdir(dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(documentHtml(markdown, figureSvg), { waitUntil: 'load' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: '<div style="width:100%;font:8px Arial;color:#52606d;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: '20mm', right: '18mm', bottom: '22mm', left: '18mm' },
      preferCSSPageSize: true,
    });
    const rendered = await readFile(outputPath);
    await writeFile(outputPath, normalizePdfMetadata(rendered));
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  await main();
}
