import assert from 'node:assert/strict';
import test from 'node:test';

import {
  documentHtml,
  normalizePdfMetadata,
  renderMarkdown,
} from '../scripts/render-t2424-0025-paper-pdf.mjs';

test('T2424-0025 PDF metadata normalization removes runtime timestamps deterministically', () => {
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

test('T2424-0025 PDF normalization fails closed without both date fields', () => {
  assert.throws(
    () => normalizePdfMetadata(Buffer.from('%PDF-1.4\n%%EOF', 'latin1')),
    /Expected exactly two fixed-width PDF date fields/,
  );
});

test('renderer embeds exact retained SVG artifacts with captions', () => {
  const html = renderMarkdown(
    '![Figure 1 retained.](figure1)\n\n![Figure 2 retained.](figure2)',
    { figure1: '<svg id="f1"></svg>', figure2: '<svg id="f2"></svg>' },
  );
  assert.match(html, /<svg id="f1"><\/svg>/);
  assert.match(html, /<svg id="f2"><\/svg>/);
  assert.match(html, /Figure 1 retained/);
  assert.match(html, /Figure 2 retained/);
});

test('renderer preserves the clean-control falsifier and bounded claim', () => {
  const markdown = `# Bounded robust readouts
At 0% Cauchy contamination, mean MAE is 0.0246469 and median MAE is 0.0125699, a 49.00% reduction.
The result does not establish a Transformer result, learned-memory advantage, or uniquely non-Gaussian mechanism.

| Contamination | Mean | Median |
|---:|---:|---:|
| 0.00 | 0.0246469 | 0.0125699 |`;
  const html = documentHtml(markdown, {});
  assert.match(html, /0% Cauchy contamination/);
  assert.match(html, /0\.0246469/);
  assert.match(html, /0\.0125699/);
  assert.match(html, /49\.00% reduction/);
  assert.match(html, /does not establish a Transformer result/);
  assert.match(html, /<table>/);
});
