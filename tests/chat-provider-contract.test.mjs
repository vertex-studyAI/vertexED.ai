import assert from 'node:assert/strict';
import test from 'node:test';

import {
  callChatProvider,
  extractChatAnswer,
  resolveChatProvider,
} from '../api/_lib/aiProviders.js';

test('OpenAI remains the default provider with a generally available model', () => {
  const config = resolveChatProvider({ ChatbotKey: 'legacy-key' });

  assert.equal(config.name, 'openai');
  assert.equal(config.apiKey, 'legacy-key');
  assert.equal(config.baseUrl, 'https://api.openai.com/v1');
  assert.equal(config.primaryModel, 'gpt-4.1-mini');
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

test('chat provider call uses OpenAI-compatible request shape without switching providers', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
    };
  };

  const config = resolveChatProvider({
    CHATBOT_PROVIDER: 'nvidia',
    NVIDIA_API_KEY: 'nv-key',
    NVIDIA_CHATBOT_MODEL: 'example/model',
  });

  const result = await callChatProvider({
    config,
    model: config.primaryModel,
    messages: [{ role: 'user', content: 'hello' }],
    fetchImpl,
  });

  assert.equal(result.provider, 'nvidia');
  assert.equal(result.model, 'example/model');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://integrate.api.nvidia.com/v1/chat/completions');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer nv-key');

  const payload = JSON.parse(calls[0].options.body);
  assert.equal(payload.model, 'example/model');
  assert.deepEqual(payload.messages, [{ role: 'user', content: 'hello' }]);
  assert.equal(payload.temperature, 0.4);
  assert.equal(payload.max_tokens, 1200);
});

test('OpenAI chat requests use the Responses API with output token limits', async () => {
  let captured;
  const config = resolveChatProvider({
    OPENAI_API_KEY: 'openai-key',
    OPENAI_PROJECT_ID: 'proj_test',
    OPENAI_ORGANIZATION_ID: 'org_test',
  });
  await callChatProvider({
    config,
    model: config.primaryModel,
    messages: [{ role: 'user', content: 'hello' }],
    safetyIdentifier: 'hashed-user',
    fetchImpl: async (url, options) => {
      captured = { url, payload: JSON.parse(options.body), headers: options.headers };
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ output_text: 'ok' }),
      };
    },
  });

  assert.match(captured.url, /\/responses$/);
  assert.equal(captured.payload.max_output_tokens, 1200);
  assert.equal(captured.payload.store, false);
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
