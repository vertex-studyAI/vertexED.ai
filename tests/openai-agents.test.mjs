import assert from 'node:assert/strict';
import test from 'node:test';

import { isOpenAiAgentId, listOpenAiProjectAgents } from '../api/_lib/openAiAgents.js';

const config = {
  apiKey: 'test-key',
  baseUrl: 'https://api.openai.test/v1',
};

test('agent ids are validated before they reach the browser catalog', () => {
  assert.equal(isOpenAiAgentId('agent_vertexed_1'), true);
  assert.equal(isOpenAiAgentId(' id '), true);
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

test('provider metadata is normalized to the browser contract and duplicate ids are removed', async () => {
  const longName = ` ${'n'.repeat(140)} `;
  const longModel = ` ${'m'.repeat(140)} `;
  const longTool = ` ${'t'.repeat(80)} `;
  const tools = Array.from({ length: 40 }, (_, index) => ({ type: index === 0 ? longTool : `tool_${index}` }));

  const agents = await listOpenAiProjectAgents({
    config,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        data: [
          { id: ' agent_same ', name: longName, model: longModel, tools, updated_at: -1 },
          { id: 'agent_same', name: 'duplicate', model: 'duplicate', tools: [] },
        ],
        has_more: false,
        last_id: 'agent_same',
      }),
    }),
  });

  assert.equal(agents.length, 1);
  assert.equal(agents[0].id, 'agent_same');
  assert.equal(agents[0].name.length, 120);
  assert.equal(agents[0].model.length, 120);
  assert.equal(agents[0].toolTypes.length, 32);
  assert.equal(agents[0].toolTypes[0].length, 64);
  assert.equal(agents[0].updatedAt, null);
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

test('provider pagination is bounded when filtered pages never yield public agents', async () => {
  let requestCount = 0;
  const agents = await listOpenAiProjectAgents({
    config,
    maxPages: 3,
    fetchImpl: async () => {
      requestCount += 1;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          data: [{ id: `../private-agent-${requestCount}`, name: 'Filtered', model: 'gpt-test', tools: [] }],
          has_more: true,
          last_id: `private-agent-${requestCount}`,
        }),
      };
    },
  });

  assert.equal(requestCount, 3);
  assert.deepEqual(agents, []);
});

test('total pagination deadline stops before another provider request', async () => {
  let requestCount = 0;
  const ticks = [1_000, 1_000, 11_000];
  let tickIndex = 0;

  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      totalTimeoutMs: 10_000,
      now: () => ticks[Math.min(tickIndex++, ticks.length - 1)],
      fetchImpl: async () => {
        requestCount += 1;
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({
            data: [{ id: `agent_${requestCount}`, name: 'Visible', model: 'gpt-test', tools: [] }],
            has_more: true,
            last_id: `agent_${requestCount}`,
          }),
        };
      },
    }),
    (error) => error instanceof Error && error.name === 'ProviderTimeoutError' && error.code === 'PROVIDER_TIMEOUT',
  );

  assert.equal(requestCount, 1);
});

test('invalid operational limits fail before any provider request', async () => {
  let requestCount = 0;
  const fetchImpl = async () => {
    requestCount += 1;
    return { ok: true, status: 200, text: async () => '{"data":[]}' };
  };

  const invalidCases = [
    [{ timeoutMs: 0 }, /Invalid OpenAI project request timeout/],
    [{ totalTimeoutMs: 0 }, /Invalid OpenAI project total timeout/],
    [{ totalTimeoutMs: 30_001 }, /Invalid OpenAI project total timeout/],
    [{ maxAgents: 0 }, /Invalid OpenAI project agent limit/],
    [{ maxAgents: 501 }, /Invalid OpenAI project agent limit/],
    [{ maxPages: 0 }, /Invalid OpenAI project pagination limit/],
    [{ maxPages: 21 }, /Invalid OpenAI project pagination limit/],
    [{ now: null }, /Invalid OpenAI project clock/],
  ];

  for (const [options, expected] of invalidCases) {
    await assert.rejects(listOpenAiProjectAgents({ config, fetchImpl, ...options }), expected);
  }

  assert.equal(requestCount, 0);
});

test('malformed successful provider payloads fail closed instead of appearing as an empty project', async () => {
  const malformedPayloads = ['not-json', JSON.stringify({}), JSON.stringify({ data: null }), JSON.stringify([])];

  for (const body of malformedPayloads) {
    await assert.rejects(
      listOpenAiProjectAgents({
        config,
        fetchImpl: async () => ({ ok: true, status: 200, text: async () => body }),
      }),
      /OpenAI project agents returned an invalid response/,
    );
  }
});

test('successful provider responses are bounded by declared and actual body size', async () => {
  let declaredBodyReads = 0;
  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        headers: { get: (name) => name.toLowerCase() === 'content-length' ? String(4 * 1024 * 1024 + 1) : null },
        text: async () => {
          declaredBodyReads += 1;
          return '{"data":[]}';
        },
      }),
    }),
    /OpenAI project agents returned an oversized response/,
  );
  assert.equal(declaredBodyReads, 0);

  const oversizedBody = 'x'.repeat(4 * 1024 * 1024 + 1);
  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      fetchImpl: async () => ({ ok: true, status: 200, text: async () => oversizedBody }),
    }),
    /OpenAI project agents returned an oversized response/,
  );
});

test('provider pages cannot exceed the requested page cardinality', async () => {
  const data = Array.from({ length: 101 }, (_, index) => ({
    id: `agent_${index}`,
    name: `Agent ${index}`,
    model: 'gpt-test',
    tools: [],
  }));

  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ data, has_more: false, last_id: 'agent_100' }),
      }),
    }),
    /OpenAI project agents returned an oversized page/,
  );
});

test('project agent provider failures are bounded without reading private error bodies', async () => {
  let bodyRead = false;
  await assert.rejects(
    listOpenAiProjectAgents({
      config,
      fetchImpl: async () => ({
        ok: false,
        status: 403,
        text: async () => {
          bodyRead = true;
          return '{"error":"private detail"}';
        },
      }),
    }),
    (error) => error instanceof Error && error.message === 'OpenAI project agents could not be listed' && error.status === 403,
  );
  assert.equal(bodyRead, false);
});
