import assert from 'node:assert/strict';
import test from 'node:test';

import { resolvePlannerProvider } from '../api/_handlers/planner.js';

test('planner prefers Gemini when it is configured', () => {
  const provider = resolvePlannerProvider({
    GEMINI_API_KEY: 'gemini-key',
    OPENAI_API_KEY: 'openai-key',
  });

  assert.equal(provider.name, 'google');
  assert.equal(provider.apiKey, 'gemini-key');
  assert.ok(provider.models.length > 1);
});

test('planner uses the shared OpenAI provider when Gemini is absent', () => {
  const provider = resolvePlannerProvider({ OPENAI_API_KEY: 'openai-key' });

  assert.equal(provider.name, 'openai');
  assert.deepEqual(provider.models, ['gpt-4.1-mini', 'gpt-4o-mini']);
  assert.equal(provider.config.apiKey, 'openai-key');
});

test('planner remains explicitly unavailable without any provider', () => {
  assert.equal(resolvePlannerProvider({}), null);
});
