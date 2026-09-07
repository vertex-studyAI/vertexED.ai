import assert from 'node:assert/strict';
import test from 'node:test';

import {
  documentHtml,
  normalizePdfMetadata,
} from '../scripts/render-neurocad-paper-pdf.mjs';

test('NeuroCAD PDF metadata normalization removes runtime timestamps deterministically', () => {
  const first = Buffer.from(
    "%PDF-1.4\n/CreationDate (D:20260831010628+00'00')\n/ModDate (D:20260831010628+00'00')\n%%EOF",
    'latin1',
  );
  const second = Buffer.from(
    "%PDF-1.4\n/CreationDate (D:20260901123456+00'00')\n/ModDate (D:20260901123456+00'00')\n%%EOF",
    'latin1',
  );
  const normalizedFirst = normalizePdfMetadata(first);
  const normalizedSecond = normalizePdfMetadata(second);
  assert.deepEqual(normalizedFirst, normalizedSecond);
  assert.equal(normalizedFirst.byteLength, first.byteLength);
  assert.match(normalizedFirst.toString('latin1'), /D:19700101000000\+00'00'/);
  assert.doesNotMatch(normalizedFirst.toString('latin1'), /D:2026/);
});

test('NeuroCAD PDF normalization fails closed when expected metadata is missing', () => {
  assert.throws(
    () => normalizePdfMetadata(Buffer.from('%PDF-1.4\n%%EOF', 'latin1')),
    /Expected exactly two fixed-width PDF date fields/,
  );
});

test('NeuroCAD renderer preserves bounded falsification language and tables', () => {
  const markdown = `# NeuroCAD
VALIDATION_DOMINANT falsifies the typed-parser-specific mechanism on the reused 20-case diagnostic.

| Variant | Accuracy |
| --- | --- |
| Typed + validation | 1.00 |
| Direct + matched validation | 1.00 |`;
  const html = documentHtml(markdown, '');
  assert.match(html, /VALIDATION_DOMINANT/);
  assert.match(html, /typed-parser-specific mechanism/);
  assert.match(html, /reused 20-case diagnostic/);
  assert.match(html, /<table>/);
  assert.match(html, /Direct \+ matched validation/);
});
