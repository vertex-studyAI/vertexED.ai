import { checkDbRateLimit } from './dbRateLimit.js';

const buckets = new Map();

const DEFAULT_LIMIT = 60;
const WINDOW_MS = 60_000;

function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function checkInMemoryRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

/**
 * Durable rate limit (Supabase) with in-memory fallback for local tests.
 */
export async function checkRateLimit(key, limit = DEFAULT_LIMIT, windowMs = WINDOW_MS) {
  if (hasSupabaseConfig()) {
    return checkDbRateLimit('api-rate', key, limit, windowMs);
  }
  return checkInMemoryRateLimit(key, limit, windowMs);
}

export async function rateLimitUserEndpoint(userId, endpoint, res) {
  const key = `${userId}:${endpoint}`;
  const result = await checkRateLimit(key);
  if (!result.allowed) {
    res.status(429).json({
      error: `Rate limit exceeded. Try again in ${result.retryAfterSec}s.`,
      retryAfter: result.retryAfterSec,
    });
    return false;
  }
  return true;
}
