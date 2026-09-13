import test from 'node:test';
import assert from 'node:assert/strict';
import { routeAiRequest } from '../api/_lib/aiRouting.js';
const base = { capability: 'chatbot', defaultModel: 'existing-model', env: { AI_OPENAI_ECONOMY_MODEL: 'small', AI_OPENAI_ADVANCED_MODEL: 'large' } };
test('routine tutoring uses economy and complex reasoning uses advanced', () => {
  assert.equal(routeAiRequest({ ...base, text: 'Solve 2x + 4 = 10' }).model, 'small');
  assert.equal(routeAiRequest({ ...base, text: 'Prove this using partial fractions' }).model, 'large');
  assert.equal(routeAiRequest({ ...base, capability: 'grading' }).tier, 'advanced');
});
test('routing is provider isolated and retains a configured working default', () => {
  assert.equal(routeAiRequest({ ...base, provider: 'nvidia' }).model, 'existing-model');
  assert.equal(routeAiRequest({ ...base, env: {} }).model, 'existing-model');
  assert.throws(() => routeAiRequest({ ...base, capability: 'user-supplied' }));
});
test('capability override wins and budget cannot increase caller output cap', () => {
  const env = { ...base.env, AI_OPENAI_CHATBOT_MODEL: 'specific', AI_OPENAI_ECONOMY_MAX_TOKENS: '9000' };
  assert.equal(routeAiRequest({ ...base, env }).model, 'specific');
  assert.equal(routeAiRequest({ ...base, env }).maxTokens, 1200);
  assert.equal(routeAiRequest({ ...base, env: { AI_OPENAI_ECONOMY_MAX_TOKENS: '600' } }).maxTokens, 600);
});
