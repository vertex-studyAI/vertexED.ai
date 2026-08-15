import { BUILD_REVISION } from '../_generated/build-revision.js';
import { API_VERSION, ROUTES } from '../_lib/routes.js';
import { getQueryParam } from '../_lib/query.js';
import { applyApiSecurityHeaders, isProduction } from '../_lib/security.js';

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeRevision(value) {
  if (typeof value !== 'string') return null;
  const revision = value.trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(revision) ? revision : null;
}

export function getDeploymentRevision(env = process.env, buildRevision = BUILD_REVISION) {
  return (
    normalizeRevision(env.VERCEL_GIT_COMMIT_SHA) ||
    normalizeRevision(env.GITHUB_SHA) ||
    normalizeRevision(buildRevision) ||
    null
  );
}

export function getReadinessSnapshot(env = process.env) {
  const hasSupabaseUrl = hasValue(env.SUPABASE_URL) || hasValue(env.VITE_SUPABASE_URL);
  const hasSupabaseAnonKey = hasValue(env.SUPABASE_ANON_KEY) || hasValue(env.VITE_SUPABASE_ANON_KEY);
  const hasSupabaseServiceRole = hasValue(env.SUPABASE_SERVICE_ROLE_KEY) || hasValue(env.SUPABASE_SECRET_KEY);
  const hasOpenAi = hasValue(env.OPENAI_API_KEY) || hasValue(env.ChatbotKey);
  const hasGemini = hasValue(env.GEMINI_API_KEY);

  const checks = {
    authentication: hasSupabaseUrl && hasSupabaseAnonKey,
    waitlist: hasSupabaseUrl && hasSupabaseServiceRole,
    coreAi: hasOpenAi,
    plannerAi: hasGemini,
  };

  return {
    ready: Object.values(checks).every(Boolean),
    checks,
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
  const readiness = readinessRequested ? getReadinessSnapshot() : null;
  const revision = getDeploymentRevision();
  const revisionRequired = isProduction();
  const revisionReady = !revisionRequired || Boolean(revision);
  const dependenciesReady = !readiness || readiness.ready;
  const healthy = revisionReady && dependenciesReady;
  const statusCode = healthy ? 200 : 503;
  const healthStatus = healthy ? (readinessRequested ? 'ready' : 'alive') : 'degraded';

  res.setHeader('X-VertexED-Health', healthStatus);
  if (revision) res.setHeader('X-VertexED-Revision', revision);

  if (req.method === 'HEAD') {
    return res.status(statusCode).end();
  }

  const payload = {
    ok: healthy,
    service: 'vertexed',
    apiVersion: API_VERSION,
    status: healthStatus,
    timestamp: new Date().toISOString(),
  };

  if (revision) payload.revision = revision;

  if (readiness) {
    payload.checks = readiness.checks;
  } else if (!isProduction()) {
    payload.routes = Object.keys(ROUTES).length;
  }

  return res.status(statusCode).json(payload);
}
