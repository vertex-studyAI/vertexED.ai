import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizePdfMetadata,
} from '../portfolio/new-projects/t2424-1863-local-diffusion-operator/scripts/render-paper-pdf.mjs';

test('T2424-1863 PDF metadata normalization removes runtime timestamps deterministically', () => {
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

test('T2424-1863 PDF normalization fails closed when expected metadata is missing', () => {
  assert.throws(
    () => normalizePdfMetadata(Buffer.from('%PDF-1.4\n%%EOF', 'latin1')),
    /Expected exactly two fixed-width PDF date fields/,
  );
});
