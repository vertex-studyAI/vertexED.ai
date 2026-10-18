import { getSupabaseAdmin } from './supabaseAdmin.js';
import { getAccountWaitlistEntry } from './waitlistAccess.js';

const MEMBERSHIP_STATUSES = new Set(['approved', 'pending', 'rejected', 'revoked']);

/** The verified Auth identity and server-owned VertexED row are separate gates. */
export async function getVertexAccess(user, supabase) {
  if (!user?.email || !user.email_confirmed_at || user.is_anonymous) {
    return { status: 'verification_required', method: null, access: false };
  }
  const entry = await getAccountWaitlistEntry(supabase ?? getSupabaseAdmin(), user);
  const status = entry?.status ?? 'unregistered';
  if (entry && (entry.auth_user_id !== user.id || !MEMBERSHIP_STATUSES.has(status))) {
    throw new Error('Invalid VertexED membership record');
  }
  return { status, method: entry?.signup_method ?? null, access: status === 'approved' };
}

export function respondAccessUnavailable(res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Retry-After', '30');
  res.status(503).json({
    code: 'ACCESS_UNAVAILABLE', status: 'unavailable', access: false,
    error: 'Beta access is temporarily unavailable. Please try again.', retryAfter: 30,
  });
}

export async function requireVertexAccess(user, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  let access;
  try {
    access = await getVertexAccess(user);
  } catch {
    respondAccessUnavailable(res);
    return false;
  }
  if (access.access) return true;
  res.status(403).json({
    ...access,
    code: access.status === 'verification_required' ? 'EMAIL_VERIFICATION_REQUIRED' : 'VERTEX_ACCESS_REQUIRED',
    error: access.status === 'verification_required'
      ? 'Verify your email address before using VertexED.'
      : access.status === 'pending'
        ? 'Your beta application is awaiting approval.'
        : 'Approved VertexED beta access is required.',
  });
  return false;
}
