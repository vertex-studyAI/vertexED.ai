import { test } from 'node:test';
import assert from 'node:assert/strict';

import { loadWikiIndex, resolvePage, searchWiki, findSection, sectionWithChildren } from '../mcp/wikiIndex.js';
import { listWikiTools, callWikiTool } from '../api/_lib/wikiMcpClient.js';
import { toOpenAiTools, runMcpToolLoop } from '../api/_lib/mcpToolLoop.js';

test('the wiki index loads every manifest page and splits it into sections', async () => {
  const index = await loadWikiIndex();
  assert.ok(index.pages.length > 100, `expected a populated wiki, got ${index.pages.length} pages`);
  assert.ok(index.subjects.some((subject) => subject.slug === 'physics'));
  for (const page of index.pages) {
    assert.ok(page.sections.length > 0, `${page.id} produced no sections`);
    assert.ok(page.url.startsWith('/study-guides/myp/'), `${page.id} has a bad url: ${page.url}`);
  }
});

test('resolvePage accepts every path shape a caller might hold', async () => {
  const index = await loadWikiIndex();
  const expected = 'physics/sessions/M24.md';
  for (const input of [
    'physics/sessions/M24.md',
    'physics/sessions/m24',
    '/study-guides/myp/physics/sessions/M24.md',
    '/study-guides/myp/physics/sessions/m24',
  ]) {
    assert.equal(resolvePage(index, input)?.id, expected, `failed for ${input}`);
  }
  assert.equal(resolvePage(index, 'physics/sessions/does-not-exist'), null);
  assert.equal(resolvePage(index, ''), null);
});

test('searchWiki ranks the on-topic section first and stays inside a requested subject', async () => {
  const index = await loadWikiIndex();
  const hits = searchWiki(index, 'half-life radioactive decay', { subject: 'physics', limit: 4 });
  assert.ok(hits.length > 0);
  assert.ok(hits.every((hit) => hit.pagePath.startsWith('physics/')));
  assert.match(hits[0].heading.toLowerCase(), /half-life/);
  assert.ok(hits[0].text.length > 0);
});

test('searchWiki biases toward the page the reader has open', async () => {
  const index = await loadWikiIndex();
  const boostPath = 'geography/command-terms.md';
  const plain = searchWiki(index, 'explain command term geography', { limit: 1 });
  const boosted = searchWiki(index, 'explain command term geography', { limit: 1, boostPath });
  assert.ok(boosted[0].score > plain[0].score, 'the open page should score higher, not lower');
});

test('a section read includes its nested subsections', async () => {
  const index = await loadWikiIndex();
  const page = resolvePage(index, 'physics/sessions/M24.md');
  const section = findSection(page, 'paper-structure-table');
  assert.ok(section, 'expected a Paper Structure Table heading');
  const text = sectionWithChildren(page, section);
  assert.match(text, /Paper Structure Table/);
  assert.match(text, /\| Q# \|/, 'the table body should come through intact');
});

test('the MCP server advertises the four wiki tools with usable schemas', async () => {
  const tools = await listWikiTools();
  assert.deepEqual(
    tools.map((tool) => tool.name).sort(),
    ['list_wiki_pages', 'read_wiki_page', 'read_wiki_section', 'search_wiki'],
  );
  const search = tools.find((tool) => tool.name === 'search_wiki');
  assert.deepEqual(search.inputSchema.required, ['query']);
  assert.ok(search.description.length > 40, 'tools need descriptions the model can act on');
});

test('search_wiki returns citable structured results over MCP', async () => {
  const result = await callWikiTool('search_wiki', { query: 'rates of reaction collision theory', limit: 3 });
  assert.equal(result.isError, false);
  const results = result.structured.results;
  assert.ok(results.length > 0);
  for (const hit of results) {
    assert.ok(hit.pagePath && hit.anchor && hit.url && hit.label);
  }
  assert.match(result.text, /^\[1\] /, 'hits should be numbered from one for the model to reference');
});

test('read_wiki_section resolves an anchor produced by search_wiki', async () => {
  const search = await callWikiTool('search_wiki', { query: 'half-life decay graph', subject: 'physics', limit: 1 });
  const [hit] = search.structured.results;
  const section = await callWikiTool('read_wiki_section', { path: hit.pagePath, section: hit.anchor });
  assert.equal(section.isError, false);
  assert.equal(section.structured.section.anchor, hit.anchor);
  assert.match(section.text, new RegExp(hit.heading.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('unknown paths and sections come back as tool errors, not exceptions', async () => {
  const page = await callWikiTool('read_wiki_page', { path: 'physics/sessions/M99.md' });
  assert.equal(page.isError, true);
  assert.match(page.text, /No wiki page/);

  const section = await callWikiTool('read_wiki_section', { path: 'physics/overview.md', section: 'not-a-heading' });
  assert.equal(section.isError, true);
  assert.match(section.text, /Available headings/, 'the model needs the valid options to recover');
});

test('MCP tool schemas pass through to OpenAI unchanged', async () => {
  const tools = await listWikiTools();
  const converted = toOpenAiTools(tools);
  const search = converted.find((tool) => tool.function.name === 'search_wiki');

  assert.equal(search.type, 'function');
  assert.ok(search.function.description.length > 40, 'tools need descriptions the model can act on');
  assert.deepEqual(
    search.function.parameters,
    tools.find((tool) => tool.name === 'search_wiki').inputSchema,
    'MCP already advertises JSON Schema, so no conversion should be applied',
  );
});

test('a tool with no declared schema still gets a valid parameters object', () => {
  const [converted] = toOpenAiTools([{ name: 'ping', description: 'x'.repeat(50) }]);
  assert.deepEqual(converted.function.parameters, { type: 'object', properties: {} });
});

/** Shapes a fake OpenAI chat-completion message asking for one tool call. */
function toolCallMessage(id, name, args) {
  return {
    role: 'assistant',
    content: null,
    tool_calls: [{ id, type: 'function', function: { name, arguments: JSON.stringify(args) } }],
  };
}

test('the tool loop chains calls and answers from what the tools returned', async () => {
  const requests = [];
  const responses = [
    toolCallMessage('call_1', 'search_wiki', { query: 'half life', subject: 'physics' }),
    toolCallMessage('call_2', 'read_wiki_section', { path: 'physics/overview.md', section: 'exam-format' }),
    { role: 'assistant', content: 'Answer grounded in the guides.' },
  ];

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    requests.push(JSON.parse(init.body));
    return { ok: true, json: async () => ({ choices: [{ message: responses[requests.length - 1] }] }) };
  };

  try {
    const tools = await listWikiTools();
    const { answer, toolCalls } = await runMcpToolLoop({
      apiKey: 'test-key',
      model: 'test-model',
      systemInstruction: 'system',
      prompt: 'How do I calculate half-life?',
      tools,
      callTool: (name, args) => callWikiTool(name, args),
    });

    assert.equal(answer, 'Answer grounded in the guides.');
    assert.deepEqual(toolCalls.map((call) => call.name), ['search_wiki', 'read_wiki_section']);
    assert.ok(toolCalls[0].structured.results.length > 0, 'search results should reach the caller for citations');

    // Every assistant tool_call must be answered by a tool message carrying the
    // matching tool_call_id, or OpenAI rejects the follow-up request.
    const finalMessages = requests.at(-1).messages;
    assert.deepEqual(
      finalMessages.map((entry) => entry.role),
      ['system', 'user', 'assistant', 'tool', 'assistant', 'tool'],
    );
    assert.deepEqual(
      finalMessages.filter((entry) => entry.role === 'tool').map((entry) => entry.tool_call_id),
      ['call_1', 'call_2'],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('malformed tool arguments are reported back instead of failing the request', async () => {
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    requests.push(JSON.parse(init.body));
    const message = requests.length === 1
      ? {
          role: 'assistant',
          content: null,
          tool_calls: [{ id: 'call_bad', type: 'function', function: { name: 'search_wiki', arguments: '{not json' } }],
        }
      : { role: 'assistant', content: 'Recovered.' };
    return { ok: true, json: async () => ({ choices: [{ message }] }) };
  };

  try {
    const tools = await listWikiTools();
    const { answer, toolCalls } = await runMcpToolLoop({
      apiKey: 'test-key',
      model: 'test-model',
      systemInstruction: 'system',
      prompt: 'anything',
      tools,
      callTool: () => assert.fail('the tool must not be invoked with unparsable arguments'),
    });

    assert.equal(answer, 'Recovered.');
    assert.equal(toolCalls[0].isError, true);
    assert.match(requests[1].messages.at(-1).content, /not valid JSON/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('the tool loop withdraws tools on the last round so it cannot loop forever', async () => {
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    requests.push(JSON.parse(init.body));
    // A model that always wants another tool call.
    return {
      ok: true,
      json: async () => ({
        choices: [{ message: toolCallMessage(`call_${requests.length}`, 'list_wiki_pages', {}) }],
      }),
    };
  };

  try {
    const tools = await listWikiTools();
    await runMcpToolLoop({
      apiKey: 'test-key',
      model: 'test-model',
      systemInstruction: 'system',
      prompt: 'loop forever',
      tools,
      callTool: (name, args) => callWikiTool(name, args),
      maxRounds: 2,
    });
    assert.equal(requests.length, 3, 'maxRounds tool rounds plus one forced answer round');
    assert.ok(requests[0].tools, 'tools offered on the first round');
    assert.equal(requests.at(-1).tools, undefined, 'tools withdrawn on the final round');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
