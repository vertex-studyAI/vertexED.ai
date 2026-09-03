import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { HEALTH_CONTRACT_VERSION, getDeploymentRevision, getReadinessSnapshot } from '../api/_handlers/health.js';
import { createMocks } from './helpers/mock-http.mjs';

const HEALTH_ENV_KEYS = [
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'OPENAI_API_KEY',
  'ChatbotKey',
  'GEMINI_API_KEY',
  'VERCEL_GIT_COMMIT_SHA',
  'GITHUB_SHA',
  'VERCEL_ENV',
];

async function withHealthEnv(values, callback) {
  const previous = Object.fromEntries(HEALTH_ENV_KEYS.map((key) => [key, process.env[key]]));

  try {
    for (const key of HEALTH_ENV_KEYS) delete process.env[key];
    for (const [key, value] of Object.entries(values)) process.env[key] = value;
    return await callback();
  } finally {
    for (const key of HEALTH_ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test('getDeploymentRevision exposes only validated non-secret commit identifiers', () => {
  assert.equal(getDeploymentRevision({}, null), null);
  assert.equal(getDeploymentRevision({ VERCEL_GIT_COMMIT_SHA: 'not-a-sha' }, null), null);
  assert.equal(getDeploymentRevision({}, 'FEDCBA9'), 'fedcba9');
  assert.equal(getDeploymentRevision({}, 'not-a-sha'), null);
  assert.equal(getDeploymentRevision({ GITHUB_SHA: 'ABCDEF1' }, 'fedcba9'), 'abcdef1');
  assert.equal(
    getDeploymentRevision({
      VERCEL_GIT_COMMIT_SHA: '1234567890abcdef1234567890abcdef12345678',
      GITHUB_SHA: 'abcdef1',
    }, 'fedcba9'),
    '1234567890abcdef1234567890abcdef12345678',
  );
});

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
  await withHealthEnv({}, async () => {
    const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: 'GET' });
    req.url = '/api/health';

    await handler(req, res);

    assert.equal(getStatus(), 200);
    assert.equal(getJson().ok, true);
    assert.equal(getJson().status, 'alive');
    assert.equal(getJson().healthContract, HEALTH_CONTRACT_VERSION);
    assert.equal(getJson().checks, undefined);
    assert.equal(getJson().revision, undefined);
    assert.equal(getHeaders()['Cache-Control'], 'no-store');
    assert.equal(getHeaders()['X-VertexED-Health'], 'alive');
    assert.equal(getHeaders()['X-VertexED-Health-Contract'], HEALTH_CONTRACT_VERSION);
    assert.equal(getHeaders()['X-VertexED-Revision'], undefined);
  });
});

test('production liveness fails closed when immutable revision identity is missing', async () => {
  await withHealthEnv({ VERCEL_ENV: 'production' }, async () => {
    const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: 'GET' });
    req.url = '/api/health';

    await handler(req, res);

    assert.equal(getStatus(), 503);
    assert.equal(getJson().ok, false);
    assert.equal(getJson().status, 'unverifiable');
    assert.equal(getJson().identity, 'missing');
    assert.equal(getJson().revision, undefined);
    assert.equal(getHeaders()['X-VertexED-Health'], 'unverifiable');
    assert.equal(getHeaders()['X-VertexED-Health-Contract'], HEALTH_CONTRACT_VERSION);
    assert.equal(getHeaders()['X-VertexED-Revision'], undefined);
  });
});

test('liveness reports exact deployed revision in body and header when available', async () => {
  const revision = '1234567890abcdef1234567890abcdef12345678';
  await withHealthEnv({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_SHA: revision }, async () => {
    const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: 'GET' });
    req.url = '/api/health';

    await handler(req, res);

    assert.equal(getStatus(), 200);
    assert.equal(getJson().status, 'alive');
    assert.equal(getJson().revision, revision);
    assert.equal(getJson().healthContract, HEALTH_CONTRACT_VERSION);
    assert.equal(getHeaders()['X-VertexED-Revision'], revision);
    assert.equal(getHeaders()['X-VertexED-Health-Contract'], HEALTH_CONTRACT_VERSION);
  });
});

test('readiness returns 503 and capability evidence when configuration is incomplete', async () => {
  await withHealthEnv({ SUPABASE_URL: 'https://example.supabase.co' }, async () => {
    const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: 'GET' });
    req.query = { readiness: '1' };
    req.url = '/api/health?readiness=1';

    await handler(req, res);

    assert.equal(getStatus(), 503);
    assert.equal(getJson().ok, false);
    assert.equal(getJson().status, 'degraded');
    assert.equal(getJson().healthContract, HEALTH_CONTRACT_VERSION);
    assert.equal(getJson().checks.authentication, false);
    assert.equal(getJson().checks.waitlist, false);
    assert.equal(getHeaders()['X-VertexED-Health'], 'degraded');
    assert.equal(getHeaders()['X-VertexED-Health-Contract'], HEALTH_CONTRACT_VERSION);
  });
});

test('readiness returns 200 when all production capabilities are configured', async () => {
  await withHealthEnv({
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
    assert.equal(getJson().healthContract, HEALTH_CONTRACT_VERSION);
    assert.ok(Object.values(getJson().checks).every(Boolean));
    assert.equal(getHeaders()['X-VertexED-Health'], 'ready');
    assert.equal(getHeaders()['X-VertexED-Health-Contract'], HEALTH_CONTRACT_VERSION);
  });
});
