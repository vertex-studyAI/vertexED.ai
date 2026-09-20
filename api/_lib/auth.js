import { createServerSupabaseClient } from './serverSupabase.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import { isAdminUser } from './admin.js';
import { getAccountWaitlistEntry } from './waitlistAccess.js';

export const MAX_JSON_BODY_BYTES = 2 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

function getSupabaseAuthClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createServerSupabaseClient(url, anonKey);
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

export function isTransientAuthError(error) {
  const status = Number(error?.status);
  return error?.name === 'AuthRetryableFetchError'
    || error?.code === 'PROVIDER_TIMEOUT'
    || status === 0
    || status >= 500;
}

export async function verifyAuthUserOnly(req, res) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return null;
  }

  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    res.status(503).json({ error: 'Auth is not configured on the server.' });
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error && isTransientAuthError(error)) {
    res.status(503).json({ error: 'Authentication service is temporarily unavailable. Please try again.' });
    return null;
  }
  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return null;
  }

  return user;
}

/**
 * Authenticate a VertexED product request and require explicit beta access.
 *
 * The shared Supabase Auth project contains identities that are not VertexED
 * members, so a valid bearer token is not sufficient product authorization.
 * Account privacy/lifecycle and access-status handlers must use
 * verifyAuthUserOnly() so an unapproved identity can still export/delete its
 * own data and inspect its access state.
 */
export async function verifyAuthUser(req, res) {
  const user = await verifyAuthUserOnly(req, res);
  if (!user) return null;

  // Allowlisted operators retain product access even when their historical
  // waitlist row is absent or linked to a different sign-in address.
  if (isAdminUser(user)) return user;

  try {
    const supabase = getSupabaseAdmin();
    const entry = await getAccountWaitlistEntry(supabase, user);
    if (entry?.status !== 'approved') {
      res.status(403).json({ error: 'Approved VertexED beta access is required.' });
      return null;
    }
    return user;
  } catch (error) {
    console.error('VertexED access verification failed:', error?.code || (error instanceof Error ? error.name : 'UnknownError'));
    res.status(503).json({ error: 'Account access could not be verified. Please try again.' });
    return null;
  }
}

export function readJsonBody(req) {
  let body = req.body ?? {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body;
}

export function rejectOversizedJsonBody(req, res, maxBytes = MAX_JSON_BODY_BYTES) {
  const length = Number(req.headers['content-length'] || 0);
  if (length > maxBytes) {
    res.status(413).json({ error: 'Request body too large.' });
    return true;
  }
  return false;
}
