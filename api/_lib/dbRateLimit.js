import { createHash } from 'crypto';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import { getWaitlistRateLimitSalt, isProduction } from './security.js';

const fallbackBuckets = new Map();

function hashKey(scope, key) {
  const salt = getWaitlistRateLimitSalt();
  if (!salt) return null;
  return createHash('sha256').update(`${salt}:${scope}:${key}`).digest('hex');
}

function checkInMemoryFallback(scope, key, maxAttempts, windowMs) {
  const bucketKey = `${scope}:${key}`;
  const now = Date.now();
  const entry = fallbackBuckets.get(bucketKey);

  if (!entry || now >= entry.resetAt) {
    fallbackBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

function denyForWindow(windowMs, configurationError = false) {
  return { allowed: false, retryAfterSec: Math.ceil(windowMs / 1000), configurationError };
}

/**
 * IP- or user-scoped rate limit backed by Supabase (survives serverless cold starts).
 * Reuses waitlist_rate_limits with scoped ip_hash values.
 */
export async function checkDbRateLimit(scope, key, maxAttempts, windowMs) {
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('dbRateLimit config error:', err instanceof Error ? err.name : 'UnknownError');
    if (isProduction()) {
      return denyForWindow(windowMs, true);
    }
    return checkInMemoryFallback(scope, key, maxAttempts, windowMs);
  }

  const ipHash = hashKey(scope, key);
  if (!ipHash) {
    console.error('WAITLIST_RATE_LIMIT_SALT missing');
    if (isProduction()) return denyForWindow(windowMs, true);
    return checkInMemoryFallback(scope, key, maxAttempts, windowMs);
  }
  const since = new Date(Date.now() - windowMs).toISOString();

  const { data, error } = await supabase.rpc('consume_waitlist_rate_limit', {
    rate_key: ipHash,
    window_start: since,
    max_attempts: maxAttempts,
    attempted_at: new Date().toISOString(),
  });

  if (error) {
    console.error('dbRateLimit atomic check failed:', error?.code || 'DatabaseError');
    if (isProduction()) return denyForWindow(windowMs, true);
    return checkInMemoryFallback(scope, key, maxAttempts, windowMs);
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || result.allowed !== true) {
    return {
      allowed: false,
      retryAfterSec: Number.isFinite(Number(result?.retry_after_sec))
        ? Math.max(1, Math.ceil(Number(result.retry_after_sec)))
        : Math.ceil(windowMs / 1000),
    };
  }
  return { allowed: true };
}
