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

test('local API uses production malformed-body and byte-limit enforcement', async t => {
  assert.equal((await request({ body: '{broken' })).statusCode, 400);
  const oversized = await request({ body: 'x'.repeat(2 * 1024 * 1024 + 1) });
  assert.equal(oversized.statusCode, 413);
  assert.equal(oversized.headers['X-Content-Type-Options'], 'nosniff');
  assert.ok(oversized.headers['X-Request-Id']);
  const env = { SUPABASE_URL: 'https://adapter-boundary.supabase.co', SUPABASE_ANON_KEY: 'test-public-key', SUPABASE_SERVICE_ROLE_KEY: 'test-server-key' };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  t.mock.method(globalThis, 'fetch', async input => {
    const url = new URL(String(input));
    if (url.pathname === '/auth/v1/user') return Response.json({ id: 'adapter-user', email: 'adapter@example.test', email_confirmed_at: '2026-10-16T00:00:00.000Z' });
    if (url.pathname === '/rest/v1/waitlist') return Response.json([{ auth_user_id: 'adapter-user', status: 'approved' }]);
    assert.fail(`Product handler must not run for oversized input: ${url.pathname}`);
  });
  const content = await request({ url: '/user-content', headers: { authorization: 'Bearer approved-fixture' }, body: JSON.stringify({ extra: 'x'.repeat(512 * 1024) }) });
  assert.equal(content.statusCode, 413, 'chunked artifact requests cannot bypass the documented 512 KiB limit');
});

test('local product API rejects anonymous requests before reading or parsing the body', async () => {
  const req = { url: '/user-content', method: 'POST', headers: { 'content-type': 'application/json' },
    on() { assert.fail('anonymous requests must not wait for a body'); } };
  const response = { statusCode: 200, headersSent: false, writableEnded: false,
    setHeader() {}, end() { this.headersSent = true; this.writableEnded = true; } };
  await nodeApiMiddleware(req, response);
  assert.equal(response.statusCode, 401);
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
