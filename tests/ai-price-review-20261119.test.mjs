import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_USAGE_POLICY, requireCurrentAiPolicy, preparePaidRequest, actualPaidCost } from '../api/_lib/aiUsagePolicy.js';

const request = model => ({
  provider: 'openai', model, url: 'https://api.openai.com/v1/responses',
  options: { method: 'POST', body: JSON.stringify({ model, input: 'constructed policy fixture', max_output_tokens: 1200 }) },
});

test('the 19 November review admits the previous deadline and current review date with unchanged reservations', () => {
  for (const now of [Date.parse('2026-11-01T00:00:00.000Z'), Date.parse('2026-11-19T12:00:00.000Z')]) {
    for (const [model, reserved] of [['gpt-6-luna', 210900], ['gpt-4.1-mini', 420951], ['gpt-4o-mini', 19920]]) {
      const prepared = preparePaidRequest(request(model), now);
      assert.equal(prepared.reservedMicros, reserved);
      const body = JSON.parse(prepared.options.body);
      assert.equal(body.service_tier, 'default');
      assert.equal(body.store, false);
      assert.equal(prepared.options.redirect, 'error');
    }
  }
});

test('review still expires closed and rejects invalid clocks before admission', () => {
  const expiry = Date.parse(AI_USAGE_POLICY.expiresAt);
  assert.equal(expiry - Date.parse(AI_USAGE_POLICY.reviewedAt), 7 * 24 * 60 * 60 * 1000);
  assert.doesNotThrow(() => requireCurrentAiPolicy(expiry - 1));
  for (const now of [expiry, expiry + 1, NaN, Infinity, -Infinity, Date.parse('2026-10-18T23:59:59.999Z')]) {
    assert.throws(() => preparePaidRequest(request('gpt-6-luna'), now), { code: 'AI_USAGE_UNAVAILABLE' });
  }
});

test('review leaves the account, project and unresolved-operation ceilings unchanged', () => {
  assert.equal(AI_USAGE_POLICY.accountLimit, 1_000_000);
  assert.equal(AI_USAGE_POLICY.projectLimit, 10_000_000);
  assert.equal(AI_USAGE_POLICY.accountConcurrency, 2);
  assert.equal(AI_USAGE_POLICY.projectConcurrency, 8);
  const malformed = request('gpt-6-luna');
  malformed.options.body = JSON.stringify({ model: 'gpt-6-luna', input: 'fixture', max_output_tokens: 4097 });
  assert.throws(() => preparePaidRequest(malformed, Date.parse('2026-10-25T12:00:00.000Z')), { code: 'AI_MODEL_UNSUPPORTED' });
});

test('Luna retains its full-context bound and documented long-context settlement threshold', () => {
  const prepared = preparePaidRequest(request('gpt-6-luna'), Date.parse('2026-10-25T12:00:00.000Z'));
  assert.equal(prepared.contract.context, 1_050_000);
  assert.equal(prepared.contract.longContextThreshold, 272_000);
  assert.equal(actualPaidCost({ model: 'gpt-6-luna', service_tier: 'default', usage: { input_tokens: 272_000, output_tokens: 1, total_tokens: 272_001 } }, prepared), 27_201);
  assert.equal(actualPaidCost({ model: 'gpt-6-luna', service_tier: 'default', usage: { input_tokens: 272_001, output_tokens: 1, total_tokens: 272_002 } }, prepared), 54_402);
});
