import assert from 'node:assert/strict';
import test from 'node:test';
import { AI_USAGE_POLICY, AiUsageError, requireCurrentAiPolicy, preparePaidRequest, actualPaidCost } from '../api/_lib/aiUsagePolicy.js';

const reviewedNow = Date.parse('2026-11-19T12:00:00.000Z');
const nextReview = Date.parse('2026-11-26T00:00:00.000Z');
const request = (model = 'gpt-4o-mini', changes = {}) => ({
  provider: 'openai', model, url: 'https://api.openai.com/v1/chat/completions',
  options: { method: 'POST', body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Local policy fixture only.' }], max_tokens: 256, ...changes }) },
});

test('the reviewed policy admits the review date and still closes exactly at the next review', () => {
  assert.doesNotThrow(() => requireCurrentAiPolicy(reviewedNow));
  assert.doesNotThrow(() => requireCurrentAiPolicy(nextReview - 1));
  for (const now of [nextReview, nextReview + 1, NaN, Infinity, -Infinity, Date.parse('2026-10-15T23:59:59.999Z')]) {
    assert.throws(() => requireCurrentAiPolicy(now), AiUsageError);
  }
  assert.equal(AI_USAGE_POLICY.expiresAt, '2026-11-26T00:00:00.000Z');
});

test('existing account, project and concurrency limits remain unchanged', () => {
  assert.equal(AI_USAGE_POLICY.accountLimit, 1_000_000);
  assert.equal(AI_USAGE_POLICY.projectLimit, 10_000_000);
  assert.equal(AI_USAGE_POLICY.accountConcurrency, 2);
  assert.equal(AI_USAGE_POLICY.projectConcurrency, 8);
  assert.equal(Object.isFrozen(AI_USAGE_POLICY), true);
});

test('both reviewed aliases and snapshots retain exact context reservations and immutable provider identity', () => {
  const expected = [
    ['gpt-4.1-mini', 'gpt-4.1-mini-2025-04-14', 1_047_576, 400_000, 1_600_000, 419441],
    ['gpt-4.1-mini-2025-04-14', 'gpt-4.1-mini-2025-04-14', 1_047_576, 400_000, 1_600_000, 419441],
    ['gpt-4o-mini', 'gpt-4o-mini-2024-07-18', 128_000, 150_000, 600_000, 19354],
    ['gpt-4o-mini-2024-07-18', 'gpt-4o-mini-2024-07-18', 128_000, 150_000, 600_000, 19354],
  ];
  for (const [alias, snapshot, context, inputRate, outputRate, reserved] of expected) {
    const prepared = preparePaidRequest(request(alias, { store: true, service_tier: 'auto' }), reviewedNow);
    assert.deepEqual(prepared.contract, { snapshot, context, inputRate, outputRate });
    assert.equal(prepared.reservedMicros, reserved);
    assert.equal(prepared.options.redirect, 'error');
    const body = JSON.parse(prepared.options.body);
    assert.equal(body.model, snapshot);
    assert.equal(body.store, false);
    assert.equal(body.service_tier, 'default');
    assert.equal(body.max_completion_tokens, 256);
    assert.equal(body.n, 1);
  }
});

test('renewal does not admit new models, hosted tools, unbounded output or unsupported providers', () => {
  for (const value of [request('gpt-6-luna'), request('gpt-4o-mini', { tools: [{ type: 'web_search' }] }), request('gpt-4o-mini', { max_tokens: 4097 }), { ...request(), provider: 'other' }]) {
    assert.throws(() => preparePaidRequest(value, reviewedNow), AiUsageError);
  }
});

test('actual usage remains exact, bounded and tied to the reviewed immutable model', () => {
  const prepared = preparePaidRequest(request(), reviewedNow);
  const usage = { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 };
  assert.equal(actualPaidCost({ model: prepared.model, usage }, prepared), 45);
  for (const value of [
    { model: 'gpt-4o-mini', usage },
    { model: prepared.model, usage: { ...usage, prompt_tokens: NaN } },
    { model: prepared.model, usage: { ...usage, completion_tokens: 257, total_tokens: 357 } },
    { model: prepared.model, usage: { ...usage, total_tokens: 149 } },
    { model: prepared.model, service_tier: 'priority', usage },
  ]) assert.throws(() => actualPaidCost(value, prepared), AiUsageError);
});
