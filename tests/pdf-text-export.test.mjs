import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = fs.readFileSync('src/lib/pdfTextExport.ts', 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { createTextPdfBytes } = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);

test('text PDF writer emits paginated, searchable PDF bytes with valid object offsets', () => {
  const bytes = createTextPdfBytes([
    { text: 'VertexED Study Notes', style: 'title' },
    { text: 'Café → x² and (evidence) \\ revision', style: 'body' },
    { text: Array.from({ length: 180 }, (_, index) => `Line ${index + 1}: retrieval practice evidence.`).join('\n'), style: 'body' },
  ]);
  const pdf = new TextDecoder().decode(bytes);

  assert.match(pdf, /^%PDF-1\.4/);
  assert.ok(pdf.includes('(Cafe -> x^2 and \\(evidence\\) \\\\ revision)'));
  assert.match(pdf, /\/Count [2-9]/);
  assert.match(pdf, /xref\n0 \d+/);
  assert.match(pdf, /%%EOF\n$/);

  const xref = pdf.slice(pdf.indexOf('xref\n')).split('\n');
  const objectCount = Number(xref[1].split(' ')[1]) - 1;
  for (let index = 1; index <= objectCount; index += 1) {
    const offset = Number(xref[index + 2].slice(0, 10));
    assert.equal(pdf.slice(offset, offset + String(index).length + 6), `${index} 0 obj`);
  }
});

test('PDF export architecture has no raster capture or jsPDF runtime dependency', () => {
  const sources = [
    fs.readFileSync('src/pages/NotetakerQuiz.tsx', 'utf8'),
    fs.readFileSync('src/pages/PaperMaker.tsx', 'utf8'),
    fs.readFileSync('src/lib/pdfTextExport.ts', 'utf8'),
    fs.readFileSync('package.json', 'utf8'),
  ].join('\n');
  assert.doesNotMatch(sources, /html2canvas/i);
  assert.doesNotMatch(sources, /jspdf/i);
  assert.match(sources, /createTextPdfBytes/);
});
