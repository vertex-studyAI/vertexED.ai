export type PdfTextBlock = {
  text: string;
  style?: 'title' | 'heading' | 'body' | 'small';
};

type PdfTextExport = {
  filename: string;
  blocks: PdfTextBlock[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const STYLE = {
  title: { size: 20, font: 'F2', before: 0, after: 16 },
  heading: { size: 14, font: 'F2', before: 12, after: 8 },
  body: { size: 11, font: 'F1', before: 0, after: 8 },
  small: { size: 9, font: 'F1', before: 0, after: 6 },
} as const;

function cleanPdfText(value: string) {
  const normalized = String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/→/g, '->')
    .replace(/•/g, '-')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/≠/g, '!=')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/÷/g, '/')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '');
  return Array.from(normalized).map((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || (code >= 32 && code <= 126) ? character : '?';
  }).join('').slice(0, 200_000);
}

function safeFilename(value: string) {
  const stem = value.replace(/\.pdf$/i, '').replace(/[^a-z0-9._-]+/gi, '_').replace(/^_+|_+$/g, '');
  return `${stem || 'vertexed-export'}.pdf`;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapLine(line: string, maxChars: number) {
  if (!line) return [''];
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const parts = word.length > maxChars
      ? word.match(new RegExp(`.{1,${maxChars}}`, 'g')) ?? [word]
      : [word];
    for (const part of parts) {
      const next = current ? `${current} ${part}` : part;
      if (next.length > maxChars && current) {
        lines.push(current);
        current = part;
      } else {
        current = next;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function commandForLine(text: string, font: string, size: number, y: number) {
  return `BT /${font} ${size} Tf 1 0 0 1 ${MARGIN} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET`;
}

export function createTextPdfBytes(blocks: PdfTextBlock[]) {
  const pages: string[][] = [[]];
  let y = PAGE_HEIGHT - MARGIN;
  const currentPage = () => pages[pages.length - 1];
  const addPage = () => {
    pages.push([]);
    y = PAGE_HEIGHT - MARGIN;
  };

  for (const block of blocks) {
    const text = cleanPdfText(block.text).trim();
    if (!text) continue;
    const style = STYLE[block.style ?? 'body'];
    const lineHeight = style.size * 1.4;
    const maxChars = Math.max(20, Math.floor((PAGE_WIDTH - (MARGIN * 2)) / (style.size * 0.52)));
    const lines = text.split('\n').flatMap((line) => wrapLine(line, maxChars));
    if (y - style.before - lineHeight < MARGIN) addPage();
    y -= style.before;
    for (const line of lines) {
      if (y - lineHeight < MARGIN) addPage();
      currentPage().push(commandForLine(line, style.font, style.size, y));
      y -= lineHeight;
    }
    y -= style.after;
  }

  pages.forEach((commands, index) => {
    commands.push(commandForLine(`${index + 1} / ${pages.length}`, 'F1', 9, 24));
  });

  const objects: string[] = [];
  const pageIds = pages.map((_, index) => 5 + (index * 2));
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  pages.forEach((commands, index) => {
    const content = `${commands.join('\n')}\n`;
    const contentId = 6 + (index * 2);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  });

  let pdf = '%PDF-1.4\n%VertexED\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

export async function exportTextPdf({ filename, blocks }: PdfTextExport) {
  const bytes = createTextPdfBytes(blocks);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename(filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
