import test from 'node:test';
import assert from 'node:assert/strict';
import { preparePaidRequest, actualPaidCost } from '../api/_lib/aiUsagePolicy.js';
import { fetchPaidProviderResponse } from '../api/_lib/aiUsage.js';
import { AI_NOW, usageFixture, paidResponse } from './helpers/ai-usage-fixture.mjs';

// Match the unbounded optional strings currently advertised by the MCP server.
// The paid boundary must narrow these, not trust the SDK schema as a cost cap.
const definitions = [
  ['list_wiki_pages', { subject: { type: 'string' } }, []],
  ['search_wiki', { query: { type: 'string', minLength: 2 }, subject: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 12 } }, ['query']],
  ['read_wiki_page', { path: { type: 'string' }, max_chars: { type: 'integer', minimum: 500, maximum: 40000 } }, ['path']],
  ['read_wiki_section', { path: { type: 'string' }, section: { type: 'string' } }, ['path', 'section']],
];
const tools = () => definitions.map(([name, properties, required]) => ({ type: 'function', function: {
  name, description: `Read-only ${name}`, parameters: { type: 'object', properties: structuredClone(properties),
    ...(required.length ? { required } : {}), additionalProperties: false, $schema: 'http://json-schema.org/draft-07/schema#' },
} }));
const initial = () => [{ role: 'system', content: 'Use approved wiki sources.' }, { role: 'user', content: 'Explain half-life.' }];
const call = (id = 'call_1', name = 'search_wiki', args = { query: 'half-life', limit: 1 }) => ({ id, type: 'function', function: { name, arguments: JSON.stringify(args) } });
const round = (calls = [call()], content = 'Synthetic approved text.') => [
  { role: 'assistant', content: null, tool_calls: calls },
  ...calls.map(item => ({ role: 'tool', tool_call_id: item.id, content })),
];
const request = (patch = {}, capability = 'study_guide_chat') => ({ capability, provider: 'openai', model: 'gpt-4.1-mini', url: 'https://api.openai.com/v1/chat/completions', options: {
  method: 'POST', body: JSON.stringify({ model: 'gpt-4.1-mini', store: false, temperature: 0.2, max_tokens: 900, messages: initial(), tools: tools(), ...patch }),
} });
const prepare = value => preparePaidRequest(value, AI_NOW);
const denied = value => assert.throws(() => prepare(value), { code: 'AI_MODEL_UNSUPPORTED' });

test('only the wiki capability accepts the four known schemas and advertises bounded inputs', () => {
  const prepared = prepare(request());
  const body = JSON.parse(prepared.options.body);
  assert.deepEqual(body.tools.map(tool => tool.function.name), definitions.map(([name]) => name));
  assert.equal(body.tools[1].function.parameters.properties.query.maxLength, 2000);
  assert.equal(body.tools[2].function.parameters.properties.path.maxLength, 512);
  assert.equal(body.tools[3].function.parameters.properties.section.maxLength, 240);
  assert.ok(body.tools.every(tool => tool.function.parameters.additionalProperties === false));
  assert.equal(body.max_completion_tokens, 900);
  assert.equal(body.model, 'gpt-4.1-mini-2025-04-14');
  assert.equal(body.store, false);
  assert.equal(prepared.options.redirect, 'error');
  const unscoped = request(); delete unscoped.capability; denied(unscoped);
  for (const capability of ['chatbot', 'notebook', 'study-guide-chat', 'grading']) denied(request({}, capability));
});

test('tool support does not expand the Responses API or admit provider-hosted tools', () => {
  const responses = request();
  responses.url = 'https://api.openai.com/v1/responses';
  responses.options.body = JSON.stringify({ model: responses.model, input: 'text', max_output_tokens: 900, tools: tools() });
  denied(responses);
  for (const bad of [[{ type: 'web_search_preview' }], [{ type: 'code_interpreter' }], []]) denied(request({ tools: bad }));
  denied(request({ tool_choice: 'auto' }));
  denied(request({ parallel_tool_calls: true }));
});

test('foreign schemas, extra arguments, schema references and changed semantics fail before dispatch', () => {
  for (const mutate of [
    value => { value[0].function.name = 'delete_files'; },
    value => { value[0].function.parameters.properties.command = { type: 'string' }; },
    value => { value[1].function.parameters.required = []; },
    value => { value[1].function.parameters.required = ['query', 'query']; },
    value => { value[0].function.parameters.additionalProperties = true; },
    value => { value[1].function.parameters.properties.query.$ref = 'https://example.test/schema'; },
    value => { value[1].function.parameters.properties.query.type = 'object'; },
    value => { value[1].function.parameters.properties.limit.maximum = 1000; },
    value => { value[0].function.description = 'x'.repeat(2049); },
    value => { value.push(value[0]); },
    value => { value[1] = value[0]; },
  ]) {
    const candidate = tools(); mutate(candidate); denied(request({ tools: candidate }));
  }
});

test('valid transcript pairs survive final-round tool withdrawal and retain the entire cost bound', () => {
  const transcript = [...initial(), ...round(), ...round([call('call_2', 'read_wiki_section', { path: 'physics/overview.md', section: 'half-life' })])];
  const first = prepare(request());
  const last = prepare(request({ messages: transcript, tools: undefined }));
  assert.equal(last.reservedMicros, 420471);
  assert.equal(last.reservedMicros, first.reservedMicros);
  assert.deepEqual(JSON.parse(last.options.body).messages, transcript);
  const large = prepare(request({ messages: [...initial(), ...round([call('large', 'search_wiki', { query: 'é'.repeat(2000) })], '界'.repeat(8000))] }));
  // Schemas, descriptions, Unicode arguments and tool text never disappear from
  // cost accounting: each dispatch still reserves the FULL documented context.
  assert.equal(large.reservedMicros, first.reservedMicros);
  const input = large.contract.context;
  const output = large.output;
  assert.equal(actualPaidCost({ model: large.model, service_tier: 'default', usage: { prompt_tokens: input, completion_tokens: output, total_tokens: input + output } }, large), large.reservedMicros);
  assert.throws(() => actualPaidCost({ model: large.model, usage: { prompt_tokens: input + 1, completion_tokens: 0, total_tokens: input + 1 } }, large), { code: 'AI_USAGE_UNAVAILABLE' });
});

test('orphan, missing, duplicate, reordered and non-text tool messages are rejected', () => {
  const paired = round([call('one'), call('two')]);
  for (const extra of [
    [{ role: 'tool', tool_call_id: 'orphan', content: 'text' }],
    [paired[0]],
    [paired[0], paired[2], paired[1]],
    [...round(), ...round()],
    [{ role: 'assistant', content: null, tool_calls: [call('same'), call('same')] }, ...round([call('same')]).slice(1)],
    [...round().slice(0, 1), { role: 'tool', tool_call_id: 'call_1', content: [{ type: 'image', data: 'x' }] }],
    [...round().slice(0, 1), { role: 'tool', tool_call_id: 'call_1', content: 'text', name: 'search_wiki' }],
    [{ role: 'user', content: 'additional instructions' }],
  ]) denied(request({ messages: [...initial(), ...extra] }));
});

test('tool arguments must be bounded JSON objects for exactly the corresponding wiki operation', () => {
  const malformed = call(); malformed.function.arguments = '{broken';
  const nonObject = call(); nonObject.function.arguments = '[]';
  const huge = call(); huge.function.arguments = ' '.repeat(4097);
  const extraCallField = { ...call(), billing: 'extra' };
  for (const bad of [
    malformed, nonObject, huge, extraCallField,
    call('one', 'execute_command', { command: 'x' }),
    call('one', 'search_wiki', {}), call('one', 'search_wiki', { query: 'x' }),
    call('one', 'search_wiki', { query: 'x'.repeat(2001) }),
    call('one', 'search_wiki', { query: 'half-life', limit: 13 }),
    call('one', 'search_wiki', { query: 'half-life', limit: 1.5 }),
    call('one', 'search_wiki', { query: 'half-life', extra: 'no' }),
    call('one', 'list_wiki_pages', { subject: 'x'.repeat(121) }),
    call('one', 'read_wiki_page', { path: 'x'.repeat(513) }),
    call('one', 'read_wiki_page', { path: 'physics/overview.md', max_chars: 40001 }),
    call('one', 'read_wiki_section', { path: 'physics/overview.md', section: 'x'.repeat(241) }),
    call('bad id', 'list_wiki_pages', {}),
  ]) denied(request({ messages: [...initial(), ...round([bad])] }));
  for (const good of [call('list', 'list_wiki_pages', {}), call('page', 'read_wiki_page', { path: 'physics/overview.md', max_chars: 40000 })]) prepare(request({ messages: [...initial(), ...round([good])] }));
});

test('round, call, per-message, output and serialized-byte budgets fail closed', () => {
  const eight = Array.from({ length: 8 }, (_, i) => call(`c${i}`));
  prepare(request({ messages: [...initial(), ...round(eight)] }));
  denied(request({ messages: [...initial(), ...round([...eight, call('ninth')])] }));
  const rounds = Array.from({ length: 5 }, (_, i) => round([call(`r${i}`)]));
  prepare(request({ messages: [...initial(), ...rounds.slice(0, 4).flat()] }));
  denied(request({ messages: [...initial(), ...rounds.flat()] }));
  denied(request({ messages: [...initial(), ...round([call()], 'x'.repeat(8001))] }));
  denied(request({ messages: [{ role: 'system', content: 'x'.repeat(16001) }, initial()[1]] }));
  denied(request({ max_tokens: 901 }));
  denied(request({ messages: [{ role: 'system', content: '界'.repeat(16000) }, { role: 'user', content: '界'.repeat(16000) }, ...round(eight, '界'.repeat(8000))] }));
});

test('real paid dispatcher reserves, pins, buffers and settles both tool rounds independently', async () => {
  const fixture = usageFixture();
  const dispatched = [];
  const transport = async (_url, options) => {
    dispatched.push(JSON.parse(options.body));
    return paidResponse({ choices: [{ message: { role: 'assistant', content: 'fixture' }, finish_reason: 'stop' }] }, false);
  };
  await fixture.run(async () => {
    await fetchPaidProviderResponse({ ...request(), fetchImpl: transport });
    await fetchPaidProviderResponse({ ...request({ messages: [...initial(), ...round()], tools: undefined }), fetchImpl: transport });
  });
  assert.equal(dispatched.length, 2);
  assert.equal(dispatched[0].tools.length, 4);
  assert.equal(dispatched[1].messages.at(-1).role, 'tool');
  assert.ok(dispatched.every(body => body.model === 'gpt-4.1-mini-2025-04-14' && body.max_completion_tokens === 900 && body.store === false));
  assert.deepEqual(fixture.calls.map(item => item.name), ['reserve_ai_usage', 'mark_ai_usage_dispatched', 'settle_ai_usage', 'reserve_ai_usage', 'mark_ai_usage_dispatched', 'settle_ai_usage']);
  const reserved = fixture.calls.filter(item => item.name === 'reserve_ai_usage');
  assert.ok(reserved.every(item => item.args.p_capability === 'study_guide_chat' && item.args.p_reserved_microusd === 420471));
  assert.notEqual(reserved[0].args.p_operation_id, reserved[1].args.p_operation_id);
  assert.ok(fixture.calls.filter(item => item.name === 'settle_ai_usage').every(item => item.args.p_outcome === 'succeeded' && item.args.p_actual_microusd === 16));
});

test('quota denial and invalid tool protocols never reach a paid provider', async () => {
  const quota = usageFixture({ reserve_ai_usage: async () => ({ allowed: false, reason: 'account_limit', resets_at: '2026-10-17T00:00:00Z' }) });
  await assert.rejects(quota.run(() => fetchPaidProviderResponse({ ...request(), fetchImpl: () => assert.fail('quota denial reached provider') })), { code: 'AI_BUDGET_EXHAUSTED' });
  assert.deepEqual(quota.calls.map(item => item.name), ['reserve_ai_usage']);
  const invalid = usageFixture();
  await assert.rejects(invalid.run(() => fetchPaidProviderResponse({ ...request({ messages: [...initial(), ...round([call('x', 'execute_command', {})])] }), fetchImpl: () => assert.fail('invalid tool reached provider') })), { code: 'AI_MODEL_UNSUPPORTED' });
  assert.equal(invalid.calls.length, 0);
});
