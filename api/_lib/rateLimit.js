const buckets = new Map();

const DEFAULT_LIMIT = 60;
const WINDOW_MS = 60_000;

export function checkRateLimit(key, limit = DEFAULT_LIMIT, windowMs = WINDOW_MS) {
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

export function rateLimitUserEndpoint(userId, endpoint, res) {
  const key = `${userId}:${endpoint}`;
  const result = checkRateLimit(key);
  if (!result.allowed) {
    res.status(429).json({
      error: `Rate limit exceeded. Try again in ${result.retryAfterSec}s.`,
      retryAfter: result.retryAfterSec,
    });
    return false;
  }
  return true;
}
