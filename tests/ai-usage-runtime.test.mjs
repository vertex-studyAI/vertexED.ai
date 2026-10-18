import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPaidProviderResponse, runAiUsageContext, readAiUsage } from '../api/_lib/aiUsage.js';
import { callChatProvider } from '../api/_lib/aiProviders.js';
import { fetchProvider } from '../api/_lib/providerRequest.js';
import { ProviderTimeoutError } from '../api/_lib/fetchWithTimeout.js';
import { AI_USER, usageFixture, paidResponse } from './helpers/ai-usage-fixture.mjs';
const request = (extra = {}) => ({ capability: 'chatbot', provider: 'openai', model: 'gpt-4.1-mini', url: 'https://api.openai.com/v1/responses', options: { method: 'POST', body: JSON.stringify({ model: 'gpt-4.1-mini', input: 'hello', max_output_tokens: 1200 }) }, ...extra });
test('no trusted account or stable operation identity means zero provider calls', async () => {
  let count = 0;
  await assert.rejects(fetchPaidProviderResponse(request({ fetchImpl: async () => { count++; return paidResponse(); } })), { code: 'AI_USAGE_UNAVAILABLE' });
  assert.throws(() => runAiUsageContext({ userId: AI_USER, operationId: '' }, () => {}), { code: 'AI_OPERATION_ID_REQUIRED' });
  assert.equal(count, 0);
});
test('reserve then mark precede provider; exact validated actual usage settles once', async () => {
  const fixture = usageFixture(); let count = 0;
  const response = await fixture.run(() => fetchPaidProviderResponse(request({ fetchImpl: async (_url, options) => {
    assert.deepEqual(fixture.calls.map(row => row.name), ['reserve_ai_usage', 'mark_ai_usage_dispatched']);
    assert.equal(JSON.parse(options.body).model, 'gpt-4.1-mini-2025-04-14'); count++; return paidResponse({ output_text: 'answer' });
  } })));
  assert.equal((await response.json()).output_text, 'answer'); assert.equal(count, 1);
  assert.equal(fixture.calls[2].args.p_actual_microusd, 16);
  assert.equal(fixture.calls[0].args.p_user_id, AI_USER);
  assert.match(fixture.calls[0].args.p_request_fingerprint, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(fixture.calls).includes('hello'), false);
});
test('quota, concurrency, duplicate, unavailable and invalid acknowledgements prevent dispatch', async () => {
  for (const [result, code] of [[{ allowed: false, reason: 'account_limit', resets_at: '2026-10-17T00:00:00Z' }, 'AI_BUDGET_EXHAUSTED'], [{ allowed: false, reason: 'project_limit' }, 'AI_BUDGET_EXHAUSTED'], [{ allowed: false, reason: 'account_concurrency' }, 'AI_CAPACITY_EXCEEDED'], [{ allowed: false, reason: 'project_concurrency' }, 'AI_CAPACITY_EXCEEDED'], [{ allowed: false, reason: 'duplicate' }, 'AI_OPERATION_EXISTS'], [{ allowed: false, reason: 'idempotency_conflict' }, 'AI_OPERATION_EXISTS'], [{ allowed: 'true' }, 'AI_USAGE_UNAVAILABLE']]) {
    let count = 0; const fixture = usageFixture({ reserve_ai_usage: () => result });
    await assert.rejects(fixture.run(() => fetchPaidProviderResponse(request({ fetchImpl: async () => { count++; return paidResponse(); } }))), { code });
    assert.equal(count, 0);
  }
  for (const stage of ['reserve_ai_usage', 'mark_ai_usage_dispatched']) {
    let count = 0; const fixture = usageFixture({ [stage]: () => { throw new Error('RPC down'); } });
    await assert.rejects(fixture.run(() => fetchPaidProviderResponse(request({ fetchImpl: async () => { count++; return paidResponse(); } }))));
    assert.equal(count, 0);
  }
});
test('stalled body cancellation retains uncertain exposure and blocks fallback', async () => {
  const fixture = usageFixture(); let count = 0;
  await fixture.run(async () => {
    await assert.rejects(fetchPaidProviderResponse(request({ timeoutMs: 5, fetchImpl: async () => { count++; return new Response(new ReadableStream()); } })), ProviderTimeoutError);
    await assert.rejects(fetchPaidProviderResponse(request({ fetchImpl: async () => { count++; return paidResponse(); } })), { code: 'AI_USAGE_UNAVAILABLE' });
  });
  assert.equal(count, 1); assert.equal(fixture.calls.at(-1).args.p_outcome, 'uncertain');
});
test('missing usage and settlement failure stay uncertain; complete rejection charges full bound', async () => {
  const malformed = usageFixture();
  await assert.rejects(malformed.run(() => fetchPaidProviderResponse(request({ fetchImpl: async () => Response.json({ output_text: 'no usage' }) }))), { code: 'AI_USAGE_UNAVAILABLE' });
  assert.equal(malformed.calls.at(-1).args.p_outcome, 'uncertain');
  const failed = usageFixture();
  const response = await failed.run(() => fetchPaidProviderResponse(request({ fetchImpl: async () => Response.json({ error: 'denied' }, { status: 429 }) })));
  assert.equal(response.status, 429); assert.equal(failed.calls.at(-1).args.p_outcome, 'failed');
  const unavailable = usageFixture({ settle_ai_usage: () => { throw new Error('settlement unavailable'); } });
  await assert.rejects(unavailable.run(() => fetchPaidProviderResponse(request({ fetchImpl: async () => paidResponse() }))));
  assert.equal(unavailable.calls.at(-1).args.p_outcome, 'uncertain');
});
test('caller cancellation before dispatch releases only reserved exposure', async () => {
  const fixture = usageFixture(); const controller = new AbortController(); const reason = new Error('cancelled'); controller.abort(reason);
  const input = request(); input.options.signal = controller.signal;
  await assert.rejects(fixture.run(() => fetchPaidProviderResponse(input)), error => error === reason);
  assert.deepEqual(fixture.calls.map(row => row.name), ['reserve_ai_usage', 'settle_ai_usage']);
  assert.equal(fixture.calls[1].args.p_outcome, 'released');
});
test('nested board-style provider wrappers reserve one operation and dispatch once', async t => {
  const fixture = usageFixture(); let count = 0;
  t.mock.method(globalThis, 'fetch', async () => { count++; return paidResponse({ output_text: 'answer' }); });
  const result = await fixture.run(() => callChatProvider({ config: { name: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: 'fixture' }, model: 'gpt-4.1-mini', messages: [{ role: 'user', content: 'hello' }], capability: 'board_resource', fetchImpl: (url, options) => fetchProvider({ capability: 'board_resource', provider: 'openai', model: 'gpt-4.1-mini', url, options }) }));
  assert.equal(JSON.parse(result.raw).output_text, 'answer'); assert.equal(count, 1);
  assert.deepEqual(fixture.calls.map(row => row.name), ['reserve_ai_usage', 'mark_ai_usage_dispatched', 'settle_ai_usage']);
});
test('usage view is owner scoped, finite, and exposes prior-day unresolved capacity', async () => {
  const row = { observed_at: '2026-10-16T12:00:00Z', period_start: '2026-10-16T00:00:00Z', resets_at: '2026-10-17T00:00:00Z', account_limit_microusd: 1_000_000, account_used_microusd: 10, account_reserved_microusd: 100, account_remaining_microusd: 999890, account_active_count: 2, account_carried_reserved_microusd: 200, account_uncertain_count: 1, account_capacity_blocked: true, project_available: false, private_project_used: 999 };
  const output = await readAiUsage(AI_USER, async (_name, args) => { assert.equal(args.p_user_id, AI_USER); return row; });
  assert.equal(output.account.carriedReservedMicros, 200); assert.deepEqual(output.project, { available: false });
  assert.equal(output.concurrency.accountBlocked, true);
  for (const patch of [{ account_remaining_microusd: Infinity }, { account_capacity_blocked: false }, { account_carried_reserved_microusd: undefined }, { account_uncertain_count: 3 }, { resets_at: row.period_start }]) await assert.rejects(readAiUsage(AI_USER, async () => ({ ...row, ...patch })), { code: 'AI_USAGE_UNAVAILABLE' });
});

test('simultaneous duplicate operations accept only one provider dispatch from atomic admission replies', async () => {
  const delegate = usageFixture(); const seen = new Map(); let providerCalls = 0;
  const rpc = async (name, args) => {
    if (name === 'reserve_ai_usage') {
      const previous = seen.get(args.p_operation_id);
      if (previous) return { allowed: false, reason: previous === args.p_request_fingerprint ? 'duplicate' : 'idempotency_conflict' };
      seen.set(args.p_operation_id, args.p_request_fingerprint);
    }
    return delegate.rpc(name, args);
  };
  const execute = () => delegate.run(() => fetchPaidProviderResponse(request({ fetchImpl: async () => { providerCalls++; return paidResponse(); } })), { operationId: 'same-operation-identity', rpc });
  const results = await Promise.allSettled([execute(), execute()]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.code, 'AI_OPERATION_EXISTS');
  assert.equal(providerCalls, 1);
  // This verifies coordinator handling of an atomic RPC contract; actual SQL
  // serialization/replay remains separately unexecuted in this environment.
});

test('expired leases, duplicate marks and malformed mark acknowledgements never reach provider', async () => {
  for (const result of [{ allowed: false, reason: 'reservation_expired', state: 'reserved' }, { allowed: false, reason: 'duplicate', state: 'dispatched' }, { allowed: 'true', reason: 'dispatched', state: 'dispatched' }, { allowed: true, reason: 'dispatched', state: 'reserved' }]) {
    const fixture = usageFixture({ mark_ai_usage_dispatched: () => result }); let providerCalls = 0;
    await assert.rejects(fixture.run(() => fetchPaidProviderResponse(request({ fetchImpl: async () => { providerCalls++; return paidResponse(); } }))), { code: 'AI_USAGE_UNAVAILABLE' });
    assert.equal(providerCalls, 0);
    assert.equal(fixture.calls.some(call => call.args.p_outcome === 'released'), false, 'ambiguous dispatch acknowledgement must not refund');
  }
});
