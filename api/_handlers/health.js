import { BUILD_REVISION } from '../_generated/build-revision.js';
import { API_VERSION, ROUTES } from '../_lib/routes.js';
import { getQueryParam } from '../_lib/query.js';
import { applyApiSecurityHeaders, isProduction } from '../_lib/security.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { hasServerSupabaseConfig } from '../_lib/serverSupabase.js';

export const HEALTH_CONTRACT_VERSION = '2';

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeRevision(value) {
  if (typeof value !== 'string') return null;
  const revision = value.trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(revision) ? revision : null;
}

export function getDeploymentRevision(env = process.env, buildRevision = BUILD_REVISION) {
  // Keep deployment identity fail-closed and sourced only from immutable build/runtime provenance.
  return (
    normalizeRevision(env.VERCEL_GIT_COMMIT_SHA) ||
    normalizeRevision(env.GITHUB_SHA) ||
    normalizeRevision(buildRevision) ||
    null
  );
}

export function getReadinessSnapshot(env = process.env) {
  const hasSupabaseUrl = hasValue(env.SUPABASE_URL) || hasValue(env.VITE_SUPABASE_URL);
  const hasSupabaseAnonKey = hasValue(env.SUPABASE_PUBLISHABLE_KEY) || hasValue(env.SUPABASE_ANON_KEY) || hasValue(env.VITE_SUPABASE_PUBLISHABLE_KEY) || hasValue(env.VITE_SUPABASE_ANON_KEY);
  const hasOpenAi = hasValue(env.OPENAI_API_KEY) || hasValue(env.ChatbotKey) || hasValue(env.CHATBOT_KEY);
  const hasGemini = hasValue(env.GEMINI_API_KEY);
  const hasRateLimitSalt = hasValue(env.WAITLIST_RATE_LIMIT_SALT);

  const checks = {
    authentication: hasSupabaseUrl && hasSupabaseAnonKey,
    waitlist: hasServerSupabaseConfig(env),
    coreAi: hasOpenAi,
    plannerAi: hasGemini || hasOpenAi,
    durableRateLimiting: hasRateLimitSalt,
  };

  return {
    ready: Object.values(checks).every(Boolean),
    checks,
  };
}

export async function getDeepReadinessSnapshot(env = process.env) {
  const base = getReadinessSnapshot(env);
  const databaseChecks = {
    databaseConnection: false,
    atomicRateLimitRpc: false,
    learnerStateStorage: false,
    batchLearnerStateSync: false,
    examSessionStorage: false,
    observabilityStorage: false,
    singletonIntegrity: false,
  };
  let databaseError = null;

  if (base.checks.authentication && base.checks.waitlist) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.rpc('vertexed_readiness');
      if (error) throw error;
      const snapshot = Array.isArray(data) ? data[0] : data;
      databaseChecks.databaseConnection = true;
      databaseChecks.atomicRateLimitRpc = snapshot?.atomicRateLimitRpc === true;
      databaseChecks.learnerStateStorage = snapshot?.learnerStateStorage === true;
      databaseChecks.batchLearnerStateSync = snapshot?.batchLearnerStateSync === true;
      databaseChecks.examSessionStorage = snapshot?.examSessionStorage === true;
      databaseChecks.observabilityStorage = snapshot?.observabilityStorage === true;
      databaseChecks.singletonIntegrity = snapshot?.singletonIntegrity === true;
    } catch (error) {
      databaseError = typeof error?.code === 'string' ? error.code : 'unavailable';
    }
  }

  const checks = { ...base.checks, ...databaseChecks };
  return {
    ready: Object.values(checks).every(Boolean),
    checks,
    ...(databaseError ? { databaseError } : {}),
  };
}

function isReadinessRequest(req) {
  const readiness = getQueryParam(req, 'readiness');
  const mode = getQueryParam(req, 'mode');
  return mode === 'readiness' || ['1', 'true', 'yes'].includes(String(readiness || '').toLowerCase());
}

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const readinessRequested = isReadinessRequest(req);
  const readiness = readinessRequested ? await getDeepReadinessSnapshot() : null;
  const revision = getDeploymentRevision();
  const identityMissing = isProduction() && !revision;
  const statusCode = identityMissing || (readiness && !readiness.ready) ? 503 : 200;

  const healthState = identityMissing
    ? 'unverifiable'
    : readinessRequested
      ? (readiness.ready ? 'ready' : 'degraded')
      : 'alive';

  res.setHeader('X-VertexED-Health', healthState);
  res.setHeader('X-VertexED-Health-Contract', HEALTH_CONTRACT_VERSION);
  if (revision) res.setHeader('X-VertexED-Revision', revision);

  if (req.method === 'HEAD') {
    return res.status(statusCode).end();
  }

  const payload = {
    ok: identityMissing ? false : (readiness ? readiness.ready : true),
    service: 'vertexed',
    apiVersion: API_VERSION,
    healthContract: HEALTH_CONTRACT_VERSION,
    status: healthState,
    timestamp: new Date().toISOString(),
  };

  if (revision) payload.revision = revision;
  if (identityMissing) payload.identity = 'missing';

  if (readiness) {
    payload.checks = readiness.checks;
    if (readiness.databaseError) payload.databaseError = readiness.databaseError;
  } else if (!isProduction()) {
    payload.routes = Object.keys(ROUTES).length;
  }

  return res.status(statusCode).json(payload);
}
