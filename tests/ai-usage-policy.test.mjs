import test from 'node:test';
import assert from 'node:assert/strict';
import { preparePaidRequest, actualPaidCost, AI_USAGE_POLICY } from '../api/_lib/aiUsagePolicy.js';
import { AI_NOW } from './helpers/ai-usage-fixture.mjs';

const request = (body = {}, extra = {}) => ({ provider: 'openai', model: 'gpt-6-luna', url: 'https://api.openai.com/v1/responses', options: { method: 'POST', body: JSON.stringify({ model: 'gpt-6-luna', input: [{ role: 'user', content: 'hello' }], max_output_tokens: 1200, ...body }) }, ...extra });
test('reservation uses the full documented context, long-context rates and explicit standard tier', () => {
  const result = preparePaidRequest(request(), AI_NOW);
  assert.equal(result.reservedMicros, 210900);
  assert.deepEqual(JSON.parse(result.options.body), { model: 'gpt-6-luna', input: [{ role: 'user', content: 'hello' }], max_output_tokens: 1200, service_tier: 'default', store: false, reasoning: { effort: 'none' } });
  assert.equal(AI_USAGE_POLICY.accountLimit, 1_000_000);
  assert.equal(AI_USAGE_POLICY.projectLimit, 10_000_000);
});
test('pricing expires closed and rejects unknown provider/model/input charges', () => {
  assert.throws(() => preparePaidRequest(request(), Date.parse(AI_USAGE_POLICY.expiresAt)), { code: 'AI_USAGE_UNAVAILABLE' });
  const cases = [request({}, { provider: 'google' }), request({}, { model: 'gpt-5' }), request({}, { url: 'https://custom.invalid/v1/responses' }), request({ tools: [] }), request({ stream: true }), request({ reasoning: {} }), request({ input: [{ role: 'user', content: [{ type: 'input_image', image_url: 'data:fixture' }] }] }), request({ max_output_tokens: 4097 }), request({ max_output_tokens: null }), request({ conversation: 'conv_test' })];
  for (const value of cases) assert.throws(() => preparePaidRequest(value, AI_NOW), { code: 'AI_MODEL_UNSUPPORTED' });
});
test('chat completions pin the model and cap all completion tokens', () => {
  const prepared = preparePaidRequest(request({}, { model: 'gpt-4o-mini', url: 'https://api.openai.com/v1/chat/completions', options: { method: 'POST', body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'hello' }], max_tokens: 1200 }) } }), AI_NOW);
  assert.equal(prepared.reservedMicros, 19920);
  assert.equal(JSON.parse(prepared.options.body).max_completion_tokens, 1200);
  assert.equal(JSON.parse(prepared.options.body).max_tokens, undefined);
});
test('settlement validates actual identity, finite tokens, totals and conservative bounds', () => {
  const prepared = preparePaidRequest(request(), AI_NOW);
  const payload = { model: prepared.model, service_tier: 'default', usage: { input_tokens: 20, output_tokens: 5, total_tokens: 25 } };
  assert.equal(actualPaidCost(payload, prepared), 5);
  assert.equal(actualPaidCost({ ...payload, model: 'gpt-6-luna-2026-09-22' }, prepared), 5);
  for (const patch of [{ model: 'unknown' }, { service_tier: 'priority' }, { usage: null }, { usage: { input_tokens: 20, output_tokens: 1201, total_tokens: 1221 } }, { usage: { input_tokens: 20, output_tokens: 5, total_tokens: 24 } }, { usage: { input_tokens: NaN, output_tokens: 5, total_tokens: 25 } }]) assert.throws(() => actualPaidCost({ ...payload, ...patch }, prepared), { code: 'AI_USAGE_UNAVAILABLE' });
});

test('settlement applies documented long-context rates to the full request', () => {
  const prepared = preparePaidRequest(request({ max_output_tokens: 16 }), AI_NOW);
  const inputTokens = 272_001;
  assert.equal(actualPaidCost({
    model: prepared.model,
    service_tier: 'default',
    usage: { input_tokens: inputTokens, output_tokens: 1, total_tokens: inputTokens + 1 },
  }, prepared), 54_402);
});
