import assert from 'node:assert/strict';
import test from 'node:test';

import { isOpenAiAgentId, listOpenAiProjectAgents } from '../api/_lib/openAiAgents.js';

const config = {
  apiKey: 'test-key',
  baseUrl: 'https://api.openai.test/v1',
};

test('agent ids are validated before they reach the browser catalog', () => {
  assert.equal(isOpenAiAgentId('agent_vertexed_1'), true);
  assert.equal(isOpenAiAgentId('id'), true);
  assert.equal(isOpenAiAgentId('../agent_secret'), false);
});

test('project agent inventory paginates and returns only public metadata', async () => {
  const requests = [];
  const pages = [
    {
      data: [{
        id: 'agent_apex',
        name: 'Apex Project Agent',
        model: 'gpt-test',
        instructions: 'server-only secret instructions',
        tools: [{ type: 'function' }, { type: 'function' }, { type: 'file_search' }],
        updated_at: 123,
      }],
      has_more: true,
      last_id: 'agent_apex',
    },
    {
      data: [{ id: 'agent_notes', name: null, model: 'gpt-test-2', tools: [], updated_at: 456 }],
      has_more: false,
      last_id: 'agent_notes',
    },
  ];

  const agents = await listOpenAiProjectAgents({
    config,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      const body = pages.shift();
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(body),
      };
    },
  });

  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /limit=100/);
  assert.match(requests[1].url, /after=agent_apex/);
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test-key');
  assert.equal(requests[0].options.headers['OpenAI-Project'], undefined);
  assert.deepEqual(agents, [
    { id: 'agent_apex', name: 'Apex Project Agent', model: 'gpt-test', toolTypes: ['function', 'file_search'], updatedAt: 123 },
    { id: 'agent_notes', name: 'Unnamed agent', model: 'gpt-test-2', toolTypes: [], updatedAt: 456 },
  ]);
  assert.equal('instructions' in agents[0], false);
});

test('pagination continues when a page contains only filtered agent ids', async () => {
  const requests = [];
  const pages = [
    {
      data: [{ id: '../private-agent', name: 'Filtered', model: 'gpt-test', tools: [] }],
      has_more: true,
      last_id: '../private-agent',
    },
    {
      data: [{ id: 'agent_visible', name: 'Visible', model: 'gpt-test-2', tools: [], updated_at: 789 }],
      has_more: false,
      last_id: 'agent_visible',
    },
  ];

  const agents = await listOpenAiProjectAgents({
    config,
    fetchImpl: async (url) => {
      requests.push(url);
      const body = pages.shift();
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(body),
      };
    },
  });

  assert.equal(requests.length, 2);
  assert.match(requests[1], /after=..%2Fprivate-agent|after=..%2fprivate-agent|after=..%2Fprivate-agent/);
  assert.deepEqual(agents, [
    { id: 'agent_visible', name: 'Visible', model: 'gpt-test-2', toolTypes: [], updatedAt: 789 },
  ]);
});

test('project agent provider failures are bounded', async () => {
  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      fetchImpl: async () => ({ ok: false, status: 403, text: async () => '{"error":"private detail"}' }),
    }),
    (error) => error instanceof Error && error.message === 'OpenAI project agents could not be listed' && error.status === 403,
  );
});
