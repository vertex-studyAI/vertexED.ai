import assert from 'node:assert/strict';
import test from 'node:test';
import { decodePdfRequest, extractPdf } from '../api/_lib/pdfImport.js';
import { createPdfImportHandler } from '../api/_handlers/import-source.js';

import { fixturePdf } from './fixtures/pdf.mjs';

test('real isolated parser extracts page references and deterministic file identity', async () => {
  const result = await extractPdf(fixturePdf(undefined, 2));
  assert.equal(result.pageCount, 2);
  assert.match(result.content, /\[Page 1\]\nSynthetic source/);
  assert.match(result.content, /\[Page 2\]/);
  assert.equal(result.sha256.length, 64);
  assert.deepEqual(result.blankPages, []);
});

test('bounds reject malformed, image-only, overlong and too-many-page PDFs without partial success', async () => {
  await assert.rejects(extractPdf(Buffer.from('%PDF-1.4\nbroken')), /malformed/);
  await assert.rejects(extractPdf(fixturePdf('')), /No selectable text/);
  await assert.rejects(extractPdf(fixturePdf('a', 26)), /at most 25 pages/);
  await assert.rejects(extractPdf(fixturePdf('a'.repeat(2400), 25)), /50,000/);
});

test('upload validation rejects disguised files, oversized data and invalid base64', () => {
  const pdf = fixturePdf();
  assert.deepEqual(decodePdfRequest({ data: pdf.toString('base64') }), pdf);
  assert.throws(() => decodePdfRequest({ data: Buffer.from('not a pdf').toString('base64') }), /not a readable PDF/);
  assert.throws(() => decodePdfRequest({ data: 'a'.repeat(1_400_000) }), /up to 1 MB/);
  assert.throws(() => decodePdfRequest({ data: '%%%=' }), /incomplete/);
});

test('abort and deadline terminate extraction without claiming a result', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(extractPdf(fixturePdf(), { signal: controller.signal }), /cancelled/);
  await assert.rejects(extractPdf(fixturePdf(), { timeoutMs: 1 }), /too long/);
});

function response() { return { code: 0, body: null, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
test('handler authenticates and enforces durable rate limits before parsing private bytes', async () => {
  let parsed = false;
  const req = { method: 'POST', headers: {}, body: { data: fixturePdf().toString('base64') } };
  const res = response();
  await createPdfImportHandler({ verifyUser: async (_req, out) => { out.status(401).json({ error: 'Sign in' }); return null; }, extract: async () => { parsed = true; } })(req, res);
  assert.equal(res.code, 401); assert.equal(parsed, false);
  const limited = response();
  await createPdfImportHandler({ verifyUser: async () => ({ id: 'fixture' }), rateLimit: async () => ({ allowed: false, configurationError: true }), extract: async () => { parsed = true; } })(req, limited);
  assert.equal(limited.code, 503); assert.equal(parsed, false);
  assert.equal(limited.headers['Cache-Control'], 'private, no-store');
});
