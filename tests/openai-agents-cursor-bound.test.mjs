import assert from 'node:assert/strict';
import test from 'node:test';

import { listOpenAiProjectAgents } from '../api/_lib/openAiAgents.js';

const config = {
  apiKey: 'test-key',
  baseUrl: 'https://api.openai.test/v1',
};

async function expectInvalidCursor(lastId) {
  let requestCount = 0;

  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      fetchImpl: async () => {
        requestCount += 1;
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({
            data: [{ id: 'agent_visible', name: 'Visible', model: 'gpt-test', tools: [] }],
            has_more: true,
            last_id: lastId,
          }),
        };
      },
    }),
    /OpenAI project agents returned an invalid pagination cursor/,
  );

  assert.equal(requestCount, 1, 'an invalid cursor must be rejected before a follow-up request');
}

test('provider pagination rejects oversized cursors before another request', async () => {
  await expectInvalidCursor('x'.repeat(257));
});

test('provider pagination rejects control characters in cursors before another request', async () => {
  await expectInvalidCursor('agent_cursor\nnext');
});
