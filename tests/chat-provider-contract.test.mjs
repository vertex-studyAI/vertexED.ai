import assert from 'node:assert/strict';
import test from 'node:test';

import {
  callChatProvider,
  extractChatAnswer,
  resolveChatProvider,
} from '../api/_lib/aiProviders.js';

test('OpenAI remains the default provider and preserves legacy key/model behavior', () => {
  const config = resolveChatProvider({ ChatbotKey: 'legacy-key' });

  assert.equal(config.name, 'openai');
  assert.equal(config.apiKey, 'legacy-key');
  assert.equal(config.baseUrl, 'https://api.openai.com/v1');
  assert.match(config.primaryModel, /^ft:gpt-4\.1-mini-/);
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

test('answer extraction supports chat-completions and response-style payloads', () => {
  assert.equal(
    extractChatAnswer({ choices: [{ message: { content: '  chat answer  ' } }] }),
    'chat answer',
  );
  assert.equal(extractChatAnswer({ output_text: ' response answer ' }), 'response answer');
  assert.equal(extractChatAnswer({ choices: [{ message: { content: '' } }] }), null);
});
