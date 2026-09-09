import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { nodeApiMiddleware } from '../api/_lib/nodeAdapter.js';

async function request({ url = '/waitlist', body = '{}', method = 'POST', headers = {} } = {}) {
  const req = new PassThrough();
  Object.assign(req, { url, method, headers: { 'content-type': 'application/json', ...headers } });
  const response = { statusCode: 200, headers: {}, body: '', headersSent: false, writableEnded: false,
    setHeader(key, value) { this.headers[key] = value; },
    end(value = '') { this.body = value; this.headersSent = true; this.writableEnded = true; },
  };
  const result = nodeApiMiddleware(req, response);
  req.end(body);
  await result;
  return response;
}

test('local API uses production malformed-body and byte-limit enforcement', async () => {
  assert.equal((await request({ body: '{broken' })).statusCode, 400);
  const oversized = await request({ body: 'x'.repeat(2 * 1024 * 1024 + 1) });
  assert.equal(oversized.statusCode, 413);
  assert.equal(oversized.headers['X-Content-Type-Options'], 'nosniff');
  assert.ok(oversized.headers['X-Request-Id']);
  const content = await request({ url: '/user-content', body: JSON.stringify({ extra: 'x'.repeat(512 * 1024) }) });
  assert.equal(content.statusCode, 413, 'chunked artifact requests cannot bypass the documented 512 KiB limit');
});

test('local API denies untrusted origins and preserves canonical routes/method errors', async () => {
  assert.equal((await request({ headers: { origin: 'https://untrusted.example' } })).statusCode, 403);
  const preflight = await request({ method: 'OPTIONS', headers: { origin: 'https://untrusted.example' } });
  assert.equal(preflight.statusCode, 403);
  assert.ok(preflight.headers['X-Request-Id']);
  assert.equal((await request({ url: '/unknown', method: 'GET' })).statusCode, 404);
  const unsupported = await request({ url: '/quiz', method: 'GET' });
  assert.equal(unsupported.statusCode, 405);
  assert.equal(unsupported.headers.Allow, 'POST');
});

test('Vite does not answer API preflight before the canonical middleware', async () => {
  const config = await readFile(new URL('../vite.config.ts', import.meta.url), 'utf8');
  assert.match(config, /server:\s*\{[^}]*cors:\s*false/s);
});
