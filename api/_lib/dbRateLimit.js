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

function denyForWindow(windowMs) {
  return { allowed: false, retryAfterSec: Math.ceil(windowMs / 1000) };
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
    console.error('dbRateLimit config error:', err);
    if (isProduction()) {
      return denyForWindow(windowMs);
    }
    return checkInMemoryFallback(scope, key, maxAttempts, windowMs);
  }

  const ipHash = hashKey(scope, key);
  if (!ipHash) {
    console.error('WAITLIST_RATE_LIMIT_SALT missing; using in-memory rate limit fallback');
    return checkInMemoryFallback(scope, key, maxAttempts, windowMs);
  }
  const since = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await supabase
    .from('waitlist_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('attempted_at', since);

  if (error) {
    console.error('dbRateLimit check failed:', error);
    return { allowed: true };
  }

  if ((count ?? 0) >= maxAttempts) {
    return denyForWindow(windowMs);
  }

  const { error: insertError } = await supabase
    .from('waitlist_rate_limits')
    .insert({ ip_hash: ipHash });

  if (insertError) {
    console.error('dbRateLimit insert failed:', insertError);
    return { allowed: true };
  }

  return { allowed: true };
}
