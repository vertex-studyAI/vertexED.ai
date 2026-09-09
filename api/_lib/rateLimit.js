import { checkDbRateLimit } from './dbRateLimit.js';
import { hasServerSupabaseConfig } from './serverSupabase.js';

const buckets = new Map();

const DEFAULT_LIMIT = 60;
const WINDOW_MS = 60_000;

function isProductionRuntime() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
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
 * Durable rate limit (Supabase) with an in-memory fallback for local/test runtimes.
 * Production fails closed when durable rate-limit storage is not configured; an
 * in-memory bucket is not a safe enforcement boundary across serverless instances.
 */
export async function checkRateLimit(key, limit = DEFAULT_LIMIT, windowMs = WINDOW_MS) {
  if (hasServerSupabaseConfig()) {
    return checkDbRateLimit('api-rate', key, limit, windowMs);
  }

  if (isProductionRuntime()) {
    return {
      allowed: false,
      configurationError: true,
      retryAfterSec: Math.ceil(windowMs / 1000),
    };
  }

  return checkInMemoryRateLimit(key, limit, windowMs);
}

export async function rateLimitUserEndpoint(userId, endpoint, res, options = {}) {
  const key = `${userId}:${endpoint}`;
  const result = await checkRateLimit(
    key,
    options.limit ?? DEFAULT_LIMIT,
    options.windowMs ?? WINDOW_MS,
  );
  if (!result.allowed) {
    if (result.configurationError) {
      res.status(503).json({
        error: 'Rate limiting is temporarily unavailable. Try again later.',
      });
      return false;
    }

    res.status(429).json({
      error: `Rate limit exceeded. Try again in ${result.retryAfterSec}s.`,
      retryAfter: result.retryAfterSec,
    });
    return false;
  }
  return true;
}
