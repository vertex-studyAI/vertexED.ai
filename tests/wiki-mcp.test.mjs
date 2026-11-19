import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { loadWikiIndex, resolvePage, searchWiki, findSection, sectionWithChildren } from '../mcp/wikiIndex.js';
import { listWikiTools, callWikiTool, resetWikiMcpClient } from '../api/_lib/wikiMcpClient.js';
import { toOpenAiTools, runMcpToolLoop, ToolLoopError } from '../api/_lib/mcpToolLoop.js';
import { answerWithWikiTools } from '../api/_lib/wikiTutor.js';
import { usageFixture, paidResponse } from './helpers/ai-usage-fixture.mjs';

let fixture, registerPath, originalRoot;
let entries;
const documents = [
  ['physics', 'Physics', 'overview.md', '# Physics\n\n## Half-life\n\nRadioactive decay reduces a sample by half in each half-life.\n\n### Calculation\n\nAfter two half-lives, one quarter remains.\n'],
  ['physics', 'Physics', 'sessions/M24.md', '# M24\n\n## Paper Structure Table\n\n| Q# | Marks |\n| --- | --- |\n| 1 | 4 |\n\n### Details\n\nThe synthetic example has four marks.\n'],
  ['geography', 'Geography', 'command-terms.md', '# Geography\n\n## Explain\n\nExplain is a command term asking for reasons.\n'],
  ['chemistry', 'Chemistry', 'overview.md', '# Chemistry\n\n## Collision theory\n\nRates of reaction depend on the frequency of collisions.\n'],
];
async function saveRegister(next = entries) {
  await writeFile(registerPath, JSON.stringify({ schemaVersion: 1, entries: next }));
}
before(async () => {
  fixture = await mkdtemp(join(tmpdir(), 'vertex-wiki-test-'));
  originalRoot = process.env.WIKI_ROOT;
  process.env.WIKI_ROOT = join(fixture, 'public');
  registerPath = join(fixture, 'contracts/content-publication-approvals.json');
  await mkdir(join(fixture, 'contracts'), { recursive: true });
  const subjects = new Map();
  entries = [];
  for (const [slug, name, relativePath, content] of documents) {
    const path = `/study-guides/myp/${slug}/${relativePath}`;
    const target = join(process.env.WIKI_ROOT, path);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, content);
    if (!subjects.has(slug)) subjects.set(slug, { slug, name, pages: [] });
    subjects.get(slug).pages.push({ path, relativePath, title: relativePath.split('/').at(-1).replace('.md', '') });
    entries.push({ path, editorialStatus: 'approved', publicationStatus: 'published', source: 'synthetic fixture', factualReviewer: 'test reviewer', reviewedAt: '2020-01-01T00:00:00Z', license: 'CC0', permittedUse: 'synthetic testing', contentVersion: 'fixture-1', answerVersion: 'fixture-1', contentHash: `sha256:${createHash('sha256').update(content).digest('hex')}` });
  }
  await writeFile(join(process.env.WIKI_ROOT, 'study-guides/myp/manifest.json'), JSON.stringify({ subjects: [...subjects.values()] }));
  await saveRegister();
});
after(async () => {
  await resetWikiMcpClient();
  if (originalRoot === undefined) delete process.env.WIKI_ROOT; else process.env.WIKI_ROOT = originalRoot;
  await rm(fixture, { recursive: true, force: true });
});

test('approved exact-byte pages are indexed at section granularity', async () => {
  const index = await loadWikiIndex();
  assert.equal(index.pages.length, 4);
  assert.equal(index.subjects.length, 3);
  assert.ok(index.pages.every(page => page.sections.length && page.contentHash));
});
test('page resolution handles the supported public and relative paths', async () => {
  const index = await loadWikiIndex();
  for (const path of ['physics/sessions/M24.md', 'physics/sessions/m24', '/study-guides/myp/physics/sessions/M24.md']) assert.equal(resolvePage(index, path)?.id, 'physics/sessions/M24.md');
  assert.equal(resolvePage(index, '../../contracts/content-publication-approvals.json'), null);
});
test('search finds the relevant section and obeys the subject filter', async () => {
  const hits = searchWiki(await loadWikiIndex(), 'half-life radioactive decay', { subject: 'physics', limit: 4 });
  assert.ok(hits.length > 0);
  assert.equal(hits[0].heading, 'Half-life');
  assert.ok(hits.every(hit => hit.pagePath.startsWith('physics/')));
});
test('section reads retain a full table and child sections', async () => {
  const page = resolvePage(await loadWikiIndex(), 'physics/sessions/M24.md');
  const section = findSection(page, 'paper-structure-table');
  const text = sectionWithChildren(page, section);
  assert.match(text, /\| Q# \| Marks \|/);
  assert.match(text, /### Details/);
});
test('the actual MCP handshake exposes four read-only tools and their schemas', async () => {
  const tools = await listWikiTools();
  assert.deepEqual(tools.map(tool => tool.name).sort(), ['list_wiki_pages', 'read_wiki_page', 'read_wiki_section', 'search_wiki']);
  assert.ok(tools.every(tool => tool.annotations.readOnlyHint));
  assert.deepEqual(tools.find(tool => tool.name === 'search_wiki').inputSchema.required, ['query']);
  assert.deepEqual(toOpenAiTools(tools)[0].function.parameters, tools[0].inputSchema);
});
test('search then section calls return exact, bounded, citable sources', async () => {
  const found = await callWikiTool('search_wiki', { query: 'half-life decay', subject: 'physics', limit: 1 });
  assert.equal(found.isError, false);
  const hit = found.structured.results[0];
  const read = await callWikiTool('read_wiki_section', { path: hit.pagePath, section: hit.anchor });
  assert.equal(read.isError, false);
  assert.match(read.text, /SOURCE \[wiki-[a-f0-9]+\]/);
  assert.match(read.sources[0].excerpt, /one quarter/);
  assert.ok(read.text.length <= 8000);
  assert.equal(read.sources[0].path, '/study-guides/myp/physics/overview');
});
test('revocation is enforced through an already-warm MCP connection', async () => {
  await saveRegister(entries.map(entry => ({ ...entry, editorialStatus: 'draft' })));
  try {
    assert.equal((await loadWikiIndex()).pages.length, 0);
    assert.equal((await callWikiTool('read_wiki_page', { path: 'physics/overview.md' })).isError, true);
    assert.deepEqual((await callWikiTool('search_wiki', { query: 'half life' })).structured.results, []);
  } finally { await saveRegister(); }
});
test('expired approval and changed bytes are excluded without restarting', async () => {
  await saveRegister(entries.map(entry => ({ ...entry, reviewDueAt: '2020-01-02T00:00:00Z' })));
  assert.equal((await loadWikiIndex()).pages.length, 0);
  await saveRegister();
  const path = join(process.env.WIKI_ROOT, entries[0].path);
  const original = await readFile(path, 'utf8');
  await writeFile(path, original + '\nUnreviewed edit.');
  try { assert.equal(resolvePage(await loadWikiIndex(), 'physics/overview.md'), null); }
  finally { await writeFile(path, original); }
});
test('malformed approval registers fail closed', async () => {
  await writeFile(registerPath, '{}');
  try { await assert.rejects(loadWikiIndex(), /Invalid content approval register/); }
  finally { await saveRegister(); }
});
test('repeated and naturally suffixed headings retain distinct search-to-read identities', async () => {
  const path = join(process.env.WIKI_ROOT, entries[0].path);
  const original = await readFile(path, 'utf8');
  const content = '# Physics\n\n## Topic\n\nFirst uniquefirst.\n\n## Topic\n\nSecond uniquesecond.\n\n## Topic-2\n\nThird uniquethird.\n';
  await writeFile(path, content);
  await saveRegister(entries.map((entry, index) => index ? entry : { ...entry, contentHash: `sha256:${createHash('sha256').update(content).digest('hex')}` }));
  try {
    const page = resolvePage(await loadWikiIndex(), 'physics/overview.md');
    const anchors = page.sections.map(section => section.anchor);
    assert.equal(new Set(anchors).size, anchors.length);
    const ids = [];
    for (const query of ['uniquefirst', 'uniquesecond', 'uniquethird']) {
      const found = await callWikiTool('search_wiki', { query, limit: 1 });
      const hit = found.structured.results[0];
      const read = await callWikiTool('read_wiki_section', { path: hit.pagePath, section: hit.anchor });
      assert.match(read.sources[0].excerpt, new RegExp(query));
      ids.push(read.sources[0].id);
    }
    assert.equal(new Set(ids).size, 3);
  } finally { await writeFile(path, original); await saveRegister(); }
});

function callMessage(id, name, args) { return { role: 'assistant', content: null, tool_calls: [{ id, type: 'function', function: { name, arguments: JSON.stringify(args) } }] }; }
function completion(message, finish_reason = message.tool_calls ? 'tool_calls' : 'stop') { return { choices: [{ message, finish_reason }] }; }
const testTools = [{ name: 'search_wiki', inputSchema: { type: 'object', properties: {} } }];
const loopOptions = { config: {}, model: 'fixture', systemInstruction: 'fixture', prompt: 'fixture', tools: testTools };

test('loop chains real MCP calls and preserves matching tool call IDs', async () => {
  const requests = [];
  const messages = [callMessage('call_1', 'search_wiki', { query: 'half life' }), callMessage('call_2', 'read_wiki_section', { path: 'physics/overview.md', section: 'half-life' }), { role: 'assistant', content: 'Fixture answer.' }];
  const result = await runMcpToolLoop({ ...loopOptions, tools: await listWikiTools(), callTool: callWikiTool, complete: async ({ body }) => { requests.push(structuredClone(body)); return completion(messages[requests.length - 1]); } });
  assert.equal(result.answer, 'Fixture answer.');
  assert.deepEqual(result.toolCalls.map(call => call.name), ['search_wiki', 'read_wiki_section']);
  assert.deepEqual(requests.at(-1).messages.filter(message => message.role === 'tool').map(message => message.tool_call_id), ['call_1', 'call_2']);
});
test('unadvertised tools and malformed JSON never reach the executor', async () => {
  for (const message of [callMessage('bad', 'delete_files', {}), { ...callMessage('bad', 'search_wiki', {}), tool_calls: [{ id: 'bad', type: 'function', function: { name: 'search_wiki', arguments: '{broken' } }] }, callMessage('bad', 'search_wiki', [])]) {
    let step = 0;
    const result = await runMcpToolLoop({ ...loopOptions, callTool: () => assert.fail('executor must not run'), complete: async () => completion(step++ ? { role: 'assistant', content: 'Recovered.' } : message) });
    assert.equal(result.toolCalls[0].isError, true);
  }
});
test('a malicious final-round tool request is rejected before execution', async () => {
  let requests = 0, calls = 0;
  await assert.rejects(runMcpToolLoop({ ...loopOptions, maxRounds: 1, callTool: async () => { calls++; return { text: 'fixture' }; }, complete: async ({ body }) => { if (requests) assert.equal(body.tools, undefined); return completion(callMessage(`call_${++requests}`, 'search_wiki', {})); } }), /budget exhausted/);
  assert.equal(calls, 1);
  assert.equal(requests, 2);
});
test('oversized tool batches are rejected before any execution', async () => {
  const message = callMessage('one', 'search_wiki', {});
  message.tool_calls.push(callMessage('two', 'search_wiki', {}).tool_calls[0]);
  await assert.rejects(runMcpToolLoop({ ...loopOptions, maxToolCalls: 1, callTool: () => assert.fail('budget exceeded'), complete: async () => completion(message) }), /budget exhausted/);
});
test('incomplete model output and duplicate call IDs fail closed', async () => {
  await assert.rejects(runMcpToolLoop({ ...loopOptions, complete: async () => completion({ role: 'assistant', content: 'Cut off' }, 'length') }), /incomplete/);
  const message = callMessage('same', 'search_wiki', {});
  message.tool_calls.push(message.tool_calls[0]);
  await assert.rejects(runMcpToolLoop({ ...loopOptions, callTool: () => assert.fail('duplicate call'), complete: async () => completion(message) }), /duplicate/);
});
test('aborted and invalid-budget calls never reach the provider', async () => {
  await assert.rejects(runMcpToolLoop({ ...loopOptions, signal: AbortSignal.abort(), complete: () => assert.fail('aborted') }));
  await assert.rejects(runMcpToolLoop({ ...loopOptions, maxRounds: Infinity, complete: () => assert.fail('bad budget') }), /budget/);
});
test('a stalled tool respects the total deadline and receives cancellation', async () => {
  let toolSignal;
  const started = Date.now();
  await assert.rejects(runMcpToolLoop({ ...loopOptions, timeoutMs: 30, callTool: async (_name, _args, { signal }) => { toolSignal = signal; return new Promise(() => {}); }, complete: async () => completion(callMessage('stalled', 'search_wiki', {})) }), /time budget exhausted/);
  assert.equal(toolSignal.aborted, true);
  assert.ok(Date.now() - started < 1000);
});
test('caller cancellation interrupts an in-flight tool without another provider round', async () => {
  const controller = new AbortController();
  let calls = 0;
  await assert.rejects(runMcpToolLoop({ ...loopOptions, signal: controller.signal, callTool: async (_name, _args, { signal }) => { assert.equal(signal.aborted, false); controller.abort(new Error('caller stopped')); return new Promise(() => {}); }, complete: async () => { calls++; return completion(callMessage('cancel', 'search_wiki', {})); } }), /caller stopped/);
  assert.equal(calls, 1);
});
test('the routed token cap is preserved in every model round', async () => {
  let calls = 0;
  await runMcpToolLoop({ ...loopOptions, maxTokens: 123, callTool: async () => ({ text: 'fixture' }), complete: async ({ body }) => { assert.equal(body.max_tokens, 123); return completion(calls++ ? { role: 'assistant', content: 'Done.' } : callMessage('tokens', 'search_wiki', {})); } });
  assert.equal(calls, 2);
});
test('the integrated tutor accepts only citations to sources actually read', async () => {
  let step = 0;
  const result = await answerWithWikiTools({ config: {}, model: 'fixture', prompt: 'half-life', systemInstruction: 'fixture', complete: async ({ body }) => {
    if (step++ === 0) return completion(callMessage('read', 'read_wiki_section', { path: 'physics/overview.md', section: 'half-life' }));
    const id = /SOURCE \[([^\]]+)\]/.exec(body.messages.at(-1).content)[1];
    return completion({ role: 'assistant', content: `After two half-lives, one quarter remains. [Source: ${id}]` });
  } });
  assert.equal(result.sources.length, 1);
  assert.equal(result.citations[0].id, result.sources[0].id);
  assert.equal(result.sources[0].title, 'Physics - Overview > Half-life');
  await assert.rejects(answerWithWikiTools({ config: {}, model: 'fixture', prompt: 'x', systemInstruction: 'x', complete: async () => completion({ role: 'assistant', content: 'Fabricated. [Source: nonexistent]' }) }), ToolLoopError);
});
test('approval revoked during generation invalidates the pending answer', async () => {
  let step = 0;
  try {
    await assert.rejects(answerWithWikiTools({ config: {}, model: 'fixture', prompt: 'half-life', systemInstruction: 'fixture', complete: async ({ body }) => {
      if (step++ === 0) return completion(callMessage('read', 'read_wiki_section', { path: 'physics/overview.md', section: 'half-life' }));
      const id = /SOURCE \[([^\]]+)\]/.exec(body.messages.at(-1).content)[1];
      await saveRegister([]);
      return completion({ role: 'assistant', content: `Half-life. [Source: ${id}]` });
    } }), /approval changed/);
  } finally { await saveRegister(); }
});
test('real MCP discovery and tutor generation pass through paid admission and settlement', async () => {
  const usage = usageFixture();
  const originalFetch = globalThis.fetch;
  const dispatched = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/chat/completions');
    const body = JSON.parse(options.body);
    dispatched.push(body);
    if (dispatched.length === 1) {
      assert.equal(body.tools.length, 4);
      return paidResponse(completion(callMessage('paid_read', 'read_wiki_section', { path: 'physics/overview.md', section: 'half-life' })), false);
    }
    const id = /SOURCE \[([^\]]+)\]/.exec(body.messages.at(-1).content)[1];
    return paidResponse(completion({ role: 'assistant', content: `One quarter remains after two half-lives. [Source: ${id}]` }), false);
  };
  try {
    const result = await usage.run(() => answerWithWikiTools({ config: { name: 'openai', apiKey: 'fixture', baseUrl: 'https://api.openai.com/v1' }, model: 'gpt-4.1-mini', maxTokens: 123, prompt: 'Explain half-life.', systemInstruction: 'Use the approved sources.' }));
    assert.equal(result.sources.length, 1);
    assert.equal(dispatched.length, 2);
    assert.ok(dispatched.every(body => body.max_completion_tokens === 123 && body.model === 'gpt-4.1-mini-2025-04-14'));
    assert.deepEqual(usage.calls.map(call => call.name), ['reserve_ai_usage', 'mark_ai_usage_dispatched', 'settle_ai_usage', 'reserve_ai_usage', 'mark_ai_usage_dispatched', 'settle_ai_usage']);
  } finally { globalThis.fetch = originalFetch; }
});
