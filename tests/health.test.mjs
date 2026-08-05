import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { getReadinessSnapshot } from '../api/_handlers/health.js';
import { createMocks } from './helpers/mock-http.mjs';

const READINESS_ENV_KEYS = [
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'OPENAI_API_KEY',
  'ChatbotKey',
  'GEMINI_API_KEY',
];

async function withReadinessEnv(values, callback) {
  const previous = Object.fromEntries(READINESS_ENV_KEYS.map((key) => [key, process.env[key]]));

  try {
    for (const key of READINESS_ENV_KEYS) delete process.env[key];
    for (const [key, value] of Object.entries(values)) process.env[key] = value;
    return await callback();
  } finally {
    for (const key of READINESS_ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test('getReadinessSnapshot reports each required production capability', () => {
  const missing = getReadinessSnapshot({});
  assert.equal(missing.ready, false);
  assert.deepEqual(missing.checks, {
    authentication: false,
    waitlist: false,
    coreAi: false,
    plannerAi: false,
  });

  const configured = getReadinessSnapshot({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    OPENAI_API_KEY: 'openai-key',
    GEMINI_API_KEY: 'gemini-key',
  });

  assert.equal(configured.ready, true);
  assert.ok(Object.values(configured.checks).every(Boolean));
});

test('liveness remains green without evaluating production dependencies', async () => {
  await withReadinessEnv({}, async () => {
    const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: 'GET' });
    req.url = '/api/health';

    await handler(req, res);

    assert.equal(getStatus(), 200);
    assert.equal(getJson().ok, true);
    assert.equal(getJson().status, 'alive');
    assert.equal(getJson().checks, undefined);
    assert.equal(getHeaders()['Cache-Control'], 'no-store');
    assert.equal(getHeaders()['X-VertexED-Health'], 'alive');
  });
});

test('readiness returns 503 and capability evidence when configuration is incomplete', async () => {
  await withReadinessEnv({ SUPABASE_URL: 'https://example.supabase.co' }, async () => {
    const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: 'GET' });
    req.query = { readiness: '1' };
    req.url = '/api/health?readiness=1';

    await handler(req, res);

    assert.equal(getStatus(), 503);
    assert.equal(getJson().ok, false);
    assert.equal(getJson().status, 'degraded');
    assert.equal(getJson().checks.authentication, false);
    assert.equal(getJson().checks.waitlist, false);
    assert.equal(getHeaders()['X-VertexED-Health'], 'degraded');
  });
});

test('readiness returns 200 when all production capabilities are configured', async () => {
  await withReadinessEnv({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    ChatbotKey: 'openai-key',
    GEMINI_API_KEY: 'gemini-key',
  }, async () => {
    const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: 'GET' });
    req.query = { mode: 'readiness' };
    req.url = '/api/health?mode=readiness';

    await handler(req, res);

    assert.equal(getStatus(), 200);
    assert.equal(getJson().ok, true);
    assert.equal(getJson().status, 'ready');
    assert.ok(Object.values(getJson().checks).every(Boolean));
    assert.equal(getHeaders()['X-VertexED-Health'], 'ready');
  });
});
