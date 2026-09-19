import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { paperMakerError } from '../src/lib/paperMakerError.mjs';

test('paperMakerError never echoes raw provider/export details', () => {
  assert.match(paperMakerError(new Error('Gemini 429 quota org-secret'), 'generate'), /Too many paper requests/i);
  assert.doesNotMatch(paperMakerError(new Error('Gemini 429 quota org-secret'), 'generate'), /org-secret/);
  assert.match(paperMakerError(new Error('Failed to fetch'), 'generate'), /connection/i);
  assert.match(paperMakerError(new Error('jsPDF Internal Error: font xyz'), 'pdf'), /PDF export failed/i);
  assert.doesNotMatch(paperMakerError(new Error('jsPDF Internal Error: font xyz'), 'pdf'), /font xyz/);
  assert.match(paperMakerError(new Error('Packer crash stack'), 'docx'), /DOCX export failed/i);
  assert.doesNotMatch(paperMakerError(new Error('Packer crash stack'), 'docx'), /Packer crash/);
  assert.match(paperMakerError(new Error('upstream dump'), 'generate'), /could not be generated/i);
  assert.doesNotMatch(paperMakerError(new Error('upstream dump'), 'generate'), /upstream dump/);
});

test('PaperMaker wires paperMakerError for generate and export failures', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/pages/PaperMaker.tsx'), 'utf8');
  assert.match(source, /import \{ paperMakerError \} from ['"]@\/lib\/paperMakerError\.mjs['"]/);
  assert.match(source, /paperMakerError\(data\.error \|\| ['"]Generation failed['"], ['"]generate['"]\)/);
  assert.match(source, /paperMakerError\(err, ['"]generate['"]\)/);
  assert.match(source, /paperMakerError\(err, ['"]pdf['"]\)/);
  assert.match(source, /paperMakerError\(err, ['"]docx['"]\)/);
  assert.doesNotMatch(source, /PDF export failed: ["'] \+ String\(err\)/);
  assert.doesNotMatch(source, /DOCX export failed: ["'] \+ String\(err\)/);
  assert.doesNotMatch(source, /setError\(data\.error \|\| ["']Generation failed["']\)/);
});
