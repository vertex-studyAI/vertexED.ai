import assert from 'node:assert/strict';
import test from 'node:test';

import {
  documentHtml,
  normalizePdfMetadata,
} from '../scripts/render-darcy-paper-pdf.mjs';

test('Darcy PDF metadata normalization removes runtime timestamps deterministically', () => {
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

test('Darcy PDF normalization fails closed when expected metadata is missing', () => {
  assert.throws(
    () => normalizePdfMetadata(Buffer.from('%PDF-1.4\n%%EOF', 'latin1')),
    /Expected exactly two fixed-width PDF date fields/,
  );
});

test('Darcy renderer preserves mixed-robustness evidence and result tables', () => {
  const markdown = `# Darcy
HOLD / MIXED_ROBUSTNESS remains because rho=0 reaches 63.8317%, below 65%.
Seed 6 reverses the ordering with harmonic improvement -10.0479%.

| rho | Mean improvement | Harmonic > linear |
|---:|---:|---:|
| 0.0 | 63.8317% | 99/100 |`;
  const html = documentHtml(markdown, '');
  assert.match(html, /HOLD \/ MIXED_ROBUSTNESS/);
  assert.match(html, /rho=0 reaches 63\.8317%/);
  assert.match(html, /Seed 6 reverses the ordering/);
  assert.match(html, /-10\.0479%/);
  assert.match(html, /<table>/);
  assert.match(html, /99\/100/);
});
