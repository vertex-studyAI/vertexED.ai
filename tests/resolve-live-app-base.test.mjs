import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveLiveAppBase } from '../scripts/resolve-live-app-base.mjs';

function mockFetchSequence(responses) {
  let i = 0;
  return async (url) => {
    const next = responses[i++];
    if (!next) throw new Error(`Unexpected fetch: ${url}`);
    if (next.throw) throw next.throw;
    return {
      status: next.status,
      headers: {
        get(name) {
          if (String(name).toLowerCase() === 'content-type') return 'application/json';
          return null;
        },
      },
      async json() {
        return next.body;
      },
    };
  };
}

test('resolveLiveAppBase prefers custom domain when liveness is alive', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = mockFetchSequence([
    { status: 200, body: { ok: true, status: 'alive', revision: 'abc123' } },
  ]);
  try {
    const result = await resolveLiveAppBase({
      customBase: 'https://www.vertexed.app',
      fallbackBase: 'https://vertex-ed-ai.vercel.app',
    });
    assert.equal(result.base, 'https://www.vertexed.app');
    assert.equal(result.source, 'custom-domain');
    assert.equal(result.gate1a, 'PASS');
    assert.equal(result.customProbe.revision, 'abc123');
  } finally {
    globalThis.fetch = previous;
  }
});

test('resolveLiveAppBase falls back when custom domain health fails', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = mockFetchSequence([
    { throw: new Error('fetch failed') },
    { status: 200, body: { ok: true, status: 'alive', revision: 'def456' } },
  ]);
  try {
    const result = await resolveLiveAppBase({
      customBase: 'https://www.vertexed.app',
      fallbackBase: 'https://vertex-ed-ai.vercel.app',
    });
    assert.equal(result.base, 'https://vertex-ed-ai.vercel.app');
    assert.equal(result.source, 'canonical-fallback');
    assert.equal(result.gate1a, 'BLOCKED_TLS_OR_HTTP');
    assert.equal(result.fallbackProbe.revision, 'def456');
  } finally {
    globalThis.fetch = previous;
  }
});

test('resolveLiveAppBase returns none when both origins fail', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = mockFetchSequence([
    { throw: new Error('custom down') },
    { status: 503, body: { ok: false, status: 'degraded' } },
  ]);
  try {
    const result = await resolveLiveAppBase({
      customBase: 'https://www.vertexed.app',
      fallbackBase: 'https://vertex-ed-ai.vercel.app',
    });
    assert.equal(result.base, null);
    assert.equal(result.source, 'none');
  } finally {
    globalThis.fetch = previous;
  }
});
