import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeChatMode, resolveChatRoute } from '../api/_lib/modelPolicy.js';

const providerConfig = {
  name: 'openai',
  primaryModel: 'current-primary',
  fallbackModel: 'current-fallback',
};

test('normalizeChatMode defaults unknown values to tutor', () => {
  assert.equal(normalizeChatMode(undefined), 'tutor');
  assert.equal(normalizeChatMode(''), 'tutor');
  assert.equal(normalizeChatMode('unknown'), 'tutor');
  assert.equal(normalizeChatMode(' DEEP '), 'deep');
});

test('resolveChatRoute preserves current models when role overrides are absent', () => {
  assert.deepEqual(
    resolveChatRoute({ mode: 'tutor', providerConfig, env: {} }),
    {
      mode: 'tutor',
      primaryModel: 'current-primary',
      fallbackModel: 'current-fallback',
    },
  );
});

test('resolveChatRoute selects explicit fast and reasoning models', () => {
  const env = {
    CHATBOT_FAST_MODEL: 'fast-model',
    CHATBOT_FAST_FALLBACK_MODEL: 'fast-fallback',
    CHATBOT_REASONING_MODEL: 'reasoning-model',
    CHATBOT_REASONING_FALLBACK_MODEL: 'reasoning-fallback',
  };

  assert.deepEqual(resolveChatRoute({ mode: 'quick', providerConfig, env }), {
    mode: 'quick',
    primaryModel: 'fast-model',
    fallbackModel: 'fast-fallback',
  });
  assert.deepEqual(resolveChatRoute({ mode: 'deep', providerConfig, env }), {
    mode: 'deep',
    primaryModel: 'reasoning-model',
    fallbackModel: 'reasoning-fallback',
  });
});

test('resolveChatRoute ignores blank role overrides and keeps provider fallback', () => {
  const route = resolveChatRoute({
    mode: 'quick',
    providerConfig,
    env: { CHATBOT_FAST_MODEL: '   ', CHATBOT_FAST_FALLBACK_MODEL: '' },
  });

  assert.equal(route.primaryModel, 'current-primary');
  assert.equal(route.fallbackModel, 'current-fallback');
});

test('resolveChatRoute requires a configured primary model', () => {
  assert.throws(
    () => resolveChatRoute({ mode: 'tutor', providerConfig: {}, env: {} }),
    /primary model/,
  );
});
