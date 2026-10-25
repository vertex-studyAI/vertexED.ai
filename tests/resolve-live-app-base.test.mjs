import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveLiveAppBase } from '../scripts/resolve-live-app-base.mjs';
const base = 'https://vertex-ed-ai.vercel.app';
const response = (status, body) => ({ status, headers: { get: () => 'application/json' }, json: async () => body });

test('resolver probes the configured Vercel origin without following redirects', async () => {
  const result = await resolveLiveAppBase({ base, request: async (url, options) => {
    assert.equal(url, `${base}/api/health`);
    assert.equal(options.redirect, 'manual');
    return response(200, { ok: true, service: 'vertexed', status: 'alive', revision: 'abc123' });
  } });
  assert.equal(result.base, base);
  assert.equal(result.source, 'vercel-app');
  assert.equal(result.probe.revision, 'abc123');
});

test('unavailable or unrelated applications never count as VertexED health', async () => {
  for (const [status, body] of [[307, null], [503, { ok: false }], [200, { ok: true, status: 'alive', service: 'other' }]]) {
    const result = await resolveLiveAppBase({ base, request: async () => response(status, body) });
    assert.equal(result.base, null);
  }
});

test('resolver rejects expired domains without making a request', async () => {
  await assert.rejects(resolveLiveAppBase({ base: 'https://www.vertexed.app', request: () => { throw new Error('must not probe'); } }), /non-expired/);
});

test('network failure remains a blocked check', async () => {
  const result = await resolveLiveAppBase({ base, request: async () => { throw new Error('network down'); } });
  assert.equal(result.base, null);
  assert.equal(result.gate1a, 'BLOCKED_HTTP');
});
