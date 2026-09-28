import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSourceFile, decodeSourceFile } from '../src/lib/sourceFileImport.mjs';

test('supported source formats preserve real UTF-8 text and reject other formats', () => {
  for (const name of ['notes.txt', 'NOTES.MD', 'source.markdown', 'measurements.csv']) {
    assert.doesNotThrow(() => validateSourceFile({ name, size: 100 }));
  }
  assert.equal(decodeSourceFile(new TextEncoder().encode('  Δp = FΔt\nCafé  ')), 'Δp = FΔt\nCafé');
  assert.doesNotThrow(() => validateSourceFile({ name: 'packet.pdf', size: 100 }));
  assert.throws(() => validateSourceFile({ name: 'packet.pdf', size: 1_000_001 }), /1 MB/);
  assert.throws(() => validateSourceFile({ name: 'empty.txt', size: 0 }), /empty/);
  assert.throws(() => validateSourceFile({ name: 'large.txt', size: 200001 }), /200 KB/);
});

test('binary content, invalid encoding, empty text and oversized decoded sources fail visibly', () => {
  assert.throws(() => decodeSourceFile(new Uint8Array([0, 1, 2, 3])), /binary/);
  assert.throws(() => decodeSourceFile(new Uint8Array([255, 255])), /UTF-8/);
  assert.throws(() => decodeSourceFile(new TextEncoder().encode('  \n ')), /no text/);
  assert.throws(() => decodeSourceFile(new TextEncoder().encode('a'.repeat(50001))), /50,000/);
});
