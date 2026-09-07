import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchWithTimeout, ProviderTimeoutError } from '../api/_lib/fetchWithTimeout.js';

test('provider fetch aborts at its deadline with a stable error class', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  try {
    await assert.rejects(() => fetchWithTimeout('https://provider.invalid', {}, 5), ProviderTimeoutError);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider fetch clears its deadline after a completed response', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const response = new Response('{}', { status: 200 });
  globalThis.fetch = async () => response;
  try {
    assert.equal(await fetchWithTimeout('https://provider.invalid', {}, 50), response);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
