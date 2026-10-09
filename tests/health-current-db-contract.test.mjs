import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HEALTH_CONTRACT_VERSION,
  getDeepReadinessSnapshot,
} from '../api/_handlers/health.js';

const HEALTH_ENV_KEYS = [
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'OPENAI_API_KEY',
  'ChatbotKey',
  'CHATBOT_KEY',
  'GEMINI_API_KEY',
  'WAITLIST_RATE_LIMIT_SALT',
];

const configuredEnv = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  OPENAI_API_KEY: 'openai-key',
  GEMINI_API_KEY: 'gemini-key',
  WAITLIST_RATE_LIMIT_SALT: 'rate-limit-salt',
};

const completeDatabaseReadiness = {
  atomicRateLimitRpc: true,
  learnerStateStorage: true,
  batchLearnerStateSync: true,
  examSessionStorage: true,
  observabilityStorage: true,
  singletonIntegrity: true,
  expiringHashedInvites: true,
  automaticTimestamps: true,
};

async function withHealthEnv(callback) {
  const previous = Object.fromEntries(HEALTH_ENV_KEYS.map((key) => [key, process.env[key]]));
  try {
    for (const key of HEALTH_ENV_KEYS) delete process.env[key];
    Object.assign(process.env, configuredEnv);
    return await callback();
  } finally {
    for (const key of HEALTH_ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

async function snapshotFor(databaseChecks) {
  return withHealthEnv(async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify(databaseChecks), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    try {
      return await getDeepReadinessSnapshot();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
}

test('health contract version 4 requires the current database readiness surface', () => {
  assert.equal(HEALTH_CONTRACT_VERSION, '4');
});

test('deep readiness fails closed when expiring hashed invite support is absent', async () => {
  const result = await snapshotFor({
    ...completeDatabaseReadiness,
    expiringHashedInvites: false,
  });

  assert.equal(result.ready, false);
  assert.equal(result.checks.databaseConnection, true);
  assert.equal(result.checks.expiringHashedInvites, false);
  assert.equal(result.checks.automaticTimestamps, true);
});

test('deep readiness fails closed when automatic timestamp support is absent', async () => {
  const result = await snapshotFor({
    ...completeDatabaseReadiness,
    automaticTimestamps: false,
  });

  assert.equal(result.ready, false);
  assert.equal(result.checks.databaseConnection, true);
  assert.equal(result.checks.expiringHashedInvites, true);
  assert.equal(result.checks.automaticTimestamps, false);
});
