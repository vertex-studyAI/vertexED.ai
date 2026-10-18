import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { dispatchRoute, ROUTES } from '../api/_lib/routes.js';
import { fetchPaidProviderResponse, readAccountAiUsage, readAiUsage } from '../api/_lib/aiUsage.js';
import { createMocks } from './helpers/mock-http.mjs';
import { AI_USER, AI_NOW } from './helpers/ai-usage-fixture.mjs';

const snapshot = { observed_at: '2026-10-16T12:00:00Z', period_start: '2026-10-16T00:00:00Z', resets_at: '2026-10-17T00:00:00Z', account_limit_microusd: 1_000_000, account_used_microusd: 10, account_reserved_microusd: 100, account_remaining_microusd: 999890, account_active_count: 1, account_carried_reserved_microusd: 0, account_uncertain_count: 0, account_capacity_blocked: false, project_available: true };
function setup(t, { member = true, reserve, read = snapshot, provider } = {}) {
  const calls = [];
  for (const [key, value] of Object.entries({ SUPABASE_URL: 'https://usage-api.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'fixture', SUPABASE_ANON_KEY: 'fixture', WAITLIST_RATE_LIMIT_SALT: 'fixture-salt', NODE_ENV: 'test', VERCEL_ENV: 'test' })) {
    const old = process.env[key]; process.env[key] = value;
    t.after(() => { if (old === undefined) delete process.env[key]; else process.env[key] = old; });
  }
  t.mock.method(Date, 'now', () => AI_NOW);
  t.mock.method(globalThis, 'fetch', async (url, options = {}) => {
    const address = new URL(url); const path = address.pathname;
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : null;
    calls.push({ path, query: address.searchParams, body });
    if (address.hostname === 'api.openai.com') return provider ? provider() : assert.fail('denied call reached provider');
    if (path === '/auth/v1/user') return Response.json({ id: AI_USER, email: 'owner@example.test', email_confirmed_at: member ? '2026-10-16T00:00:00Z' : null });
    if (path === '/rest/v1/waitlist') return Response.json(member ? [{ auth_user_id: AI_USER, status: 'approved', signup_method: 'email' }] : []);
    if (path === '/rest/v1/rpc/consume_waitlist_rate_limit') return Response.json({ allowed: true });
    if (path === '/rest/v1/rpc/reserve_ai_usage') return Response.json(reserve || { allowed: false, reason: 'account_limit', resets_at: '2026-10-17T00:00:00Z' });
    if (path === '/rest/v1/rpc/mark_ai_usage_dispatched') return Response.json({ allowed: true, reason: 'dispatched', state: 'dispatched' });
    if (path === '/rest/v1/rpc/settle_ai_usage') return Response.json({ ok: true, reason: 'settled', state: body.p_outcome, reserved_microusd: 420951, charged_microusd: 0 });
    if (path === '/rest/v1/rpc/read_ai_usage') return read === null ? Response.json({ error: 'not deployed' }, { status: 404 }) : Response.json(read);
    if (path === '/rest/v1/profiles') return Response.json({ id: AI_USER });
    if (path === '/rest/v1/user_study_artifacts') return Response.json([{ id: 'owned-artifact' }]);
    if (path === '/rest/v1/learner_state_items') return Response.json([{ state_key: 'owned-state' }]);
    if (path === '/rest/v1/ai_usage_reservations') return Response.json([{ id: 'owned-operation', state: 'uncertain', reserved_microusd: 100 }]);
    assert.fail(`Unexpected network: ${path}`);
  });
  return calls;
}
const paidCall = () => fetchPaidProviderResponse({ capability: 'chatbot', provider: 'openai', model: 'gpt-4.1-mini', url: 'https://api.openai.com/v1/responses', options: { method: 'POST', body: JSON.stringify({ model: 'gpt-4.1-mini', input: 'private question', max_output_tokens: 1200 }) } });

test('all ten paid registry paths preserve quota denial even if a handler catches and returns success', async t => {
  const calls = setup(t);
  for (const key of ['ask', 'quiz', 'note', 'planner', 'paper-generator', 'review', 'transcribe', 'notebook', 'study-guide-chat', 'board-resource']) {
    t.mock.method(ROUTES[key], 'loader', async () => ({ default: async (_req, res) => { try { await paidCall(); } catch { /* existing fallback shape */ } res.status(200).json({ misleadingFallback: true }); } }));
    const http = createMocks({ headers: { authorization: 'Bearer fixture', 'idempotency-key': `operation-${key}` } });
    await dispatchRoute(key, http.req, http.res);
    assert.equal(http.getStatus(), 429, key); assert.equal(http.getJson().code, 'AI_BUDGET_EXHAUSTED', key);
    assert.equal(http.getHeaders()['Cache-Control'], 'private, no-store');
  }
  assert.equal(calls.filter(call => call.path === '/rest/v1/rpc/reserve_ai_usage').length, 10);
  assert.equal(calls.some(call => call.path === '/v1/responses'), false);
});
test('missing operation key stops before provider and ledger; owner usage remains available without membership', async t => {
  const calls = setup(t);
  t.mock.method(ROUTES.ask, 'loader', async () => ({ default: () => assert.fail('handler invoked without operation identity') }));
  const http = createMocks({ headers: { authorization: 'Bearer fixture' } });
  await dispatchRoute('ask', http.req, http.res);
  assert.equal(http.getStatus(), 400); assert.equal(http.getJson().code, 'AI_OPERATION_ID_REQUIRED');
  assert.equal(calls.some(call => call.path.includes('/rpc/')), false);
});
test('owner usage view bypasses membership while missing deployed RPC is explicitly unavailable', async t => {
  for (const available of [true, false]) await t.test(String(available), async st => {
    const calls = setup(st, { member: false, read: available ? snapshot : null });
    const http = createMocks({ method: 'GET', headers: { authorization: 'Bearer fixture' } });
    await dispatchRoute('ai-usage', http.req, http.res);
    assert.equal(http.getStatus(), available ? 200 : 503);
    assert.equal(calls.some(call => call.path === '/rest/v1/waitlist'), false);
    assert.equal(http.getHeaders()['Cache-Control'], 'private, no-store');
    if (available) assert.equal(http.getJson().account.remainingMicros, 999890);
    else assert.equal(http.getJson().code, 'AI_USAGE_UNAVAILABLE');
  });
});
test('complete owner export includes scoped audit rows and summary; missing ledger read cannot silently omit data', async t => {
  for (const available of [true, false]) await t.test(String(available), async st => {
    const calls = setup(st, { member: false, read: available ? snapshot : null });
    const http = createMocks({ method: 'GET', headers: { authorization: 'Bearer fixture' } });
    await dispatchRoute('account-export', http.req, http.res);
    assert.equal(http.getStatus(), available ? 200 : 503);
    if (available) {
      const owned = calls.find(call => call.path === '/rest/v1/ai_usage_reservations');
      assert.equal(owned.query.get('user_id'), `eq.${AI_USER}`);
      assert.equal(http.getJson().counts.aiUsageOperations, 1);
      assert.equal(http.getJson().aiUsageOperations[0].id, 'owned-operation');
      assert.equal(http.getJson().learnerState[0].state_key, 'owned-state');
      assert.equal(http.getJson().aiUsage.account.usedMicros, 10);
    }
  });
});
test('pricing expiry disables allowance claims but preserves read-only account export snapshot', async () => {
  const expired = Date.parse('2026-10-24T12:00:00Z'); let calls = 0;
  const rpc = async () => { calls++; return snapshot; };
  await assert.rejects(readAiUsage(AI_USER, rpc, expired), { code: 'AI_USAGE_UNAVAILABLE' }); assert.equal(calls, 0);
  const result = await readAccountAiUsage(AI_USER, rpc, expired);
  assert.equal(result.pricingPolicyActive, false); assert.equal(result.account.usedMicros, 10); assert.equal(calls, 1);
});
test('connection close during body reads cancels the operation and records uncertain exposure', async t => {
  let http;
  const calls = setup(t, { reserve: { allowed: true, reason: 'reserved', state: 'reserved', reservation_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', reserved_microusd: 420951 }, provider: () => { setTimeout(() => http.res.emit('close'), 5); return new Response(new ReadableStream()); } });
  t.mock.method(ROUTES.ask, 'loader', async () => ({ default: async (_req, res) => { try { await paidCall(); } catch { /* handler recovery */ } res.json({ fallback: true }); } }));
  http = createMocks({ headers: { authorization: 'Bearer fixture', 'idempotency-key': 'cancel-operation' } });
  Object.assign(http.res, new EventEmitter()); Object.setPrototypeOf(http.res, EventEmitter.prototype);
  await dispatchRoute('ask', http.req, http.res);
  assert.equal(http.getStatus(), 503);
  assert.equal(calls.find(call => call.path === '/rest/v1/rpc/settle_ai_usage').body.p_outcome, 'uncertain');
  assert.equal(http.res.listenerCount('close'), 0);
});
