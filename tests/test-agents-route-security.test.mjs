import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';

import { isTestAgentsEnabled } from '../api/_lib/routes.js';

const original = {
  VERCEL_ENV: process.env.VERCEL_ENV,
  ENABLE_TEST_AGENTS: process.env.ENABLE_TEST_AGENTS,
};

function restore(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  restore('VERCEL_ENV', original.VERCEL_ENV);
  restore('ENABLE_TEST_AGENTS', original.ENABLE_TEST_AGENTS);
});

test('test-agents diagnostic route is disabled by default in preview', () => {
  process.env.VERCEL_ENV = 'preview';
  delete process.env.ENABLE_TEST_AGENTS;
  assert.equal(isTestAgentsEnabled(), false);
});

test('test-agents diagnostic route requires explicit opt-in outside production', () => {
  process.env.VERCEL_ENV = 'preview';
  process.env.ENABLE_TEST_AGENTS = 'true';
  assert.equal(isTestAgentsEnabled(), true);
});

test('test-agents diagnostic route stays disabled in production even when flag is set', () => {
  process.env.VERCEL_ENV = 'production';
  process.env.ENABLE_TEST_AGENTS = 'true';
  assert.equal(isTestAgentsEnabled(), false);
});
