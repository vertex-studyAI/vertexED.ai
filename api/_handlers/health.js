import { API_VERSION, ROUTES } from '../_lib/routes.js';
import { getQueryParam } from '../_lib/query.js';
import { applyApiSecurityHeaders, isProduction } from '../_lib/security.js';

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
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
  const statusCode = readiness && !readiness.ready ? 503 : 200;

  res.setHeader('X-VertexED-Health', readinessRequested ? (readiness.ready ? 'ready' : 'degraded') : 'alive');

  if (req.method === 'HEAD') {
    return res.status(statusCode).end();
  }

  const payload = {
    ok: readiness ? readiness.ready : true,
    service: 'vertexed',
    apiVersion: API_VERSION,
    status: readiness ? (readiness.ready ? 'ready' : 'degraded') : 'alive',
    timestamp: new Date().toISOString(),
  };

  if (readiness) {
    payload.checks = readiness.checks;
  } else if (!isProduction()) {
    payload.routes = Object.keys(ROUTES).length;
  }

  return res.status(statusCode).json(payload);
}
