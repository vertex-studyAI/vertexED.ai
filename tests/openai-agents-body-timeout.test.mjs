import assert from 'node:assert/strict';
import test from 'node:test';

import { listOpenAiProjectAgents } from '../api/_lib/openAiAgents.js';

const config = {
  apiKey: 'test-key',
  baseUrl: 'https://api.openai.test/v1',
};

test('a stalled provider response body cannot outlive the total enumeration deadline', async () => {
  let cancelled = false;
  let released = false;
  let textCalled = false;

  const reader = {
    read() {
      return new Promise(() => {});
    },
    async cancel() {
      cancelled = true;
    },
    releaseLock() {
      released = true;
    },
  };

  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      totalTimeoutMs: 50,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        headers: { get: () => null },
        body: { getReader: () => reader },
        text: async () => {
          textCalled = true;
          return '{"data":[]}';
        },
      }),
    }),
    (error) => error instanceof Error && error.name === 'ProviderTimeoutError' && error.code === 'PROVIDER_TIMEOUT',
  );

  assert.equal(cancelled, true, 'deadline expiry should cancel the upstream response stream');
  assert.equal(released, true, 'deadline expiry should release the stream reader lock');
  assert.equal(textCalled, false, 'streaming responses must not fall back to unbounded text buffering');
});
