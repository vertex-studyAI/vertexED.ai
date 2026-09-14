import assert from 'node:assert/strict';
import test from 'node:test';

import {
  callChatProvider,
  createSafetyIdentifier,
  extractChatAnswer,
  resolveChatProvider,
} from '../api/_lib/aiProviders.js';

test('OpenAI remains the default provider with a generally available model', () => {
  const config = resolveChatProvider({ ChatbotKey: 'legacy-key' });

  assert.equal(config.name, 'openai');
  assert.equal(config.apiKey, 'legacy-key');
  assert.equal(config.baseUrl, 'https://api.openai.com/v1');
  assert.equal(config.primaryModel, 'gpt-5.6-terra');
  assert.equal(config.fallbackModel, 'gpt-5.6-luna');
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

test('OpenAI requests use the Responses API without storing learner content', async () => {
  let payload;
  let requestUrl;
  let requestHeaders;
  const config = resolveChatProvider({
    OPENAI_API_KEY: 'openai-key',
    OPENAI_PROJECT_ID: 'proj_vertexed',
    OPENAI_ORGANIZATION_ID: 'org_vertexed',
  });
  await callChatProvider({
    config,
    model: config.primaryModel,
    messages: [
      { role: 'system', content: 'Teach clearly.' },
      { role: 'user', content: 'hello' },
    ],
    safetyIdentifier: createSafetyIdentifier('learner-123'),
    capability: 'apex-tutor',
    fetchImpl: async (url, options) => {
      requestUrl = url;
      requestHeaders = options.headers;
      payload = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ choices: [{ message: { content: 'ok' } }] }),
      };
    },
  });

  assert.equal(requestUrl, 'https://api.openai.com/v1/responses');
  assert.equal(requestHeaders['OpenAI-Project'], 'proj_vertexed');
  assert.equal(requestHeaders['OpenAI-Organization'], 'org_vertexed');
  assert.equal(payload.max_output_tokens, 1200);
  assert.equal(payload.store, false);
  assert.equal(payload.instructions, 'Teach clearly.');
  assert.deepEqual(payload.input, [{ role: 'user', content: 'hello' }]);
  assert.equal(payload.metadata.product, 'vertexed');
  assert.equal(payload.metadata.capability, 'apex-tutor');
  assert.match(payload.safety_identifier, /^[a-f0-9]{64}$/);
  assert.notEqual(payload.safety_identifier, 'learner-123');
  assert.equal('max_tokens' in payload, false);
  assert.equal('messages' in payload, false);
  assert.equal('temperature' in payload, false);
});

test('OpenAI structured requests use strict JSON schema output', async () => {
  let payload;
  const config = resolveChatProvider({ OPENAI_API_KEY: 'openai-key' });
  await callChatProvider({
    config,
    model: config.primaryModel,
    messages: [{ role: 'user', content: 'make a plan' }],
    jsonSchema: {
      type: 'object',
      properties: { task: { type: 'string' } },
      required: ['task'],
      additionalProperties: false,
    },
    schemaName: 'study plan',
    fetchImpl: async (_url, options) => {
      payload = JSON.parse(options.body);
      return { ok: true, status: 200, text: async () => JSON.stringify({ output_text: '{"task":"review"}' }) };
    },
  });
  assert.equal(payload.text.format.type, 'json_schema');
  assert.equal(payload.text.format.name, 'study_plan');
  assert.equal(payload.text.format.strict, true);
});

test('answer extraction supports chat-completions and response-style payloads', () => {
  assert.equal(
    extractChatAnswer({ choices: [{ message: { content: '  chat answer  ' } }] }),
    'chat answer',
  );
  assert.equal(extractChatAnswer({ output_text: ' response answer ' }), 'response answer');
  assert.equal(extractChatAnswer({ output: [{ type: 'reasoning' }, { content: [{ type: 'output_text', text: ' nested answer ' }] }] }), 'nested answer');
  assert.equal(extractChatAnswer({ choices: [{ message: { content: '' } }] }), null);
});
