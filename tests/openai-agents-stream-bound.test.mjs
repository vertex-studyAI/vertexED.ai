import assert from 'node:assert/strict';
import test from 'node:test';

import { listOpenAiProjectAgents } from '../api/_lib/openAiAgents.js';

const config = {
  apiKey: 'test-key',
  baseUrl: 'https://api.openai.test/v1',
};

test('oversized streamed provider bodies are cancelled before full buffering', async () => {
  const chunk = new Uint8Array(2 * 1024 * 1024);
  let reads = 0;
  let cancelled = false;
  let released = false;
  let textCalled = false;

  const reader = {
    async read() {
      reads += 1;
      return { done: false, value: chunk };
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
    /OpenAI project agents returned an oversized response/,
  );

  assert.equal(reads, 3, 'three 2 MiB chunks should cross the 4 MiB ceiling');
  assert.equal(cancelled, true, 'the upstream stream should be cancelled once the byte ceiling is exceeded');
  assert.equal(released, true, 'the stream reader lock should always be released');
  assert.equal(textCalled, false, 'native streamed responses must not fall back to full-body text buffering');
});
