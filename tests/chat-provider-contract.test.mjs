import assert from 'node:assert/strict';
import test from 'node:test';

import {
  callChatProvider,
  extractChatAnswer,
  resolveChatProvider,
} from '../api/_lib/aiProviders.js';
import { usageFixture, paidResponse } from './helpers/ai-usage-fixture.mjs';

test('OpenAI remains the default provider with a generally available model', () => {
  const config = resolveChatProvider({ ChatbotKey: 'legacy-key' });

  assert.equal(config.name, 'openai');
  assert.equal(config.apiKey, 'legacy-key');
  assert.equal(config.baseUrl, 'https://api.openai.com/v1');
  assert.equal(config.primaryModel, 'gpt-6-luna');
  assert.equal(config.fallbackModel, 'gpt-4o-mini');
});

test('NVIDIA provider is opt-in and requires both API key and model identity', () => {
  assert.throws(
    () => resolveChatProvider({ CHATBOT_PROVIDER: 'nvidia', NVIDIA_API_KEY: 'nv-key' }),
    /Missing NVIDIA_CHATBOT_MODEL/,
  );

  const config = resolveChatProvider({
    CHATBOT_PROVIDER: 'nvidia',
    NVIDIA_API_KEY: 'nv-key',
    NVIDIA_CHATBOT_MODEL: 'example/model',
  });

  assert.deepEqual(config, {
    name: 'nvidia',
    apiKey: 'nv-key',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    primaryModel: 'example/model',
    fallbackModel: '',
  });
});

test('provider base URLs are normalized and unsupported providers fail closed', () => {
  const config = resolveChatProvider({
    CHATBOT_PROVIDER: 'nvidia',
    NVIDIA_API_KEY: 'nv-key',
    NVIDIA_CHATBOT_MODEL: 'example/model',
    NVIDIA_API_BASE: 'https://example.invalid/v1///',
  });

  assert.equal(config.baseUrl, 'https://example.invalid/v1');
  assert.throws(
    () => resolveChatProvider({ CHATBOT_PROVIDER: 'mystery', OPENAI_API_KEY: 'x' }),
    /Unsupported CHATBOT_PROVIDER: mystery/,
  );
});

test('unpriced opt-in provider cannot dispatch under the finite cost policy', async () => {
  let calls = 0;
  const config = resolveChatProvider({ CHATBOT_PROVIDER: 'nvidia', NVIDIA_API_KEY: 'nv-key', NVIDIA_CHATBOT_MODEL: 'example/model' });
  await assert.rejects(usageFixture().run(() => callChatProvider({ config, model: config.primaryModel, messages: [{ role: 'user', content: 'hello' }], fetchImpl: async () => { calls++; return paidResponse(); } })), { code: 'AI_MODEL_UNSUPPORTED' });
  assert.equal(calls, 0);
});

test('OpenAI chat requests use the Responses API with output token limits', async () => {
  let captured;
  const config = resolveChatProvider({
    OPENAI_API_KEY: 'openai-key',
    OPENAI_PROJECT_ID: 'proj_test',
    OPENAI_ORGANIZATION_ID: 'org_test',
  });
  await usageFixture().run(() => callChatProvider({
    config,
    model: config.primaryModel,
    messages: [{ role: 'user', content: 'hello' }],
    safetyIdentifier: 'hashed-user',
    fetchImpl: async (url, options) => {
      captured = { url, payload: JSON.parse(options.body), headers: options.headers };
      return paidResponse({ output_text: 'ok', model: 'gpt-6-luna' });
    },
  }));

  assert.match(captured.url, /\/responses$/);
  assert.equal(captured.payload.max_output_tokens, 1200);
  assert.equal(captured.payload.store, false);
  assert.deepEqual(captured.payload.reasoning, { effort: 'none' });
  assert.equal(captured.payload.safety_identifier, 'hashed-user');
  assert.deepEqual(captured.payload.metadata, { product: 'vertexed', capability: 'chatbot' });
  assert.deepEqual(captured.payload.input, [{ role: 'user', content: 'hello' }]);
  assert.equal(captured.headers['OpenAI-Project'], 'proj_test');
  assert.equal(captured.headers['OpenAI-Organization'], 'org_test');
});

test('answer extraction supports chat-completions and response-style payloads', () => {
  assert.equal(
    extractChatAnswer({ choices: [{ message: { content: '  chat answer  ' } }] }),
    'chat answer',
  );
  assert.equal(extractChatAnswer({ output_text: ' response answer ' }), 'response answer');
  assert.equal(extractChatAnswer({ choices: [{ message: { content: '' } }] }), null);
});
