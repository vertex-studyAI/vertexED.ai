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

test('a stalled provider body also remains inside the per-request timeout budget', async () => {
  let clockReads = 0;
  const now = () => {
    clockReads += 1;
    return clockReads >= 4 ? 20 : 0;
  };
  let cancelled = false;

  const reader = {
    read() {
      return new Promise(() => {});
    },
    async cancel() {
      cancelled = true;
    },
    releaseLock() {},
  };

  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      timeoutMs: 25,
      totalTimeoutMs: 100,
      now,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        headers: { get: () => null },
        body: { getReader: () => reader },
        text: async () => '{"data":[]}',
      }),
    }),
    (error) =>
      error instanceof Error &&
      error.name === 'ProviderTimeoutError' &&
      error.code === 'PROVIDER_TIMEOUT' &&
      error.message.includes('25ms'),
  );

  assert.equal(cancelled, true, 'per-request body deadline should cancel the upstream response stream');
});
