import assert from 'node:assert/strict';
import test from 'node:test';

import { listOpenAiProjectAgents } from '../api/_lib/openAiAgents.js';

const config = {
  apiKey: 'test-key',
  baseUrl: 'https://api.openai.test/v1',
};

test('a provider cancel hook cannot delay or replace the body timeout', async () => {
  let cancelCalled = false;
  let releaseAttempted = false;

  const reader = {
    read() {
      return new Promise(() => {});
    },
    cancel() {
      cancelCalled = true;
      return new Promise(() => {});
    },
    releaseLock() {
      releaseAttempted = true;
      throw new Error('pending read');
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
      }),
    }),
    (error) => error instanceof Error && error.name === 'ProviderTimeoutError' && error.code === 'PROVIDER_TIMEOUT',
  );

  assert.equal(cancelCalled, true);
  assert.equal(releaseAttempted, true);
});
