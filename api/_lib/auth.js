import { createServerSupabaseClient } from './serverSupabase.js';

export const MAX_JSON_BODY_BYTES = 2 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

// Share the Auth result only within one request, so the registry and its handler
// verify the same identity without a second network round trip. Never cache an
// approval or a session across requests: revocation must be rechecked next time.
const verifiedUsers = new WeakMap();

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

export async function verifyAuthUser(req, res) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ code: 'AUTH_REQUIRED', error: 'Authentication required. Please log in.' });
    return null;
  }

  const verified = verifiedUsers.get(req);
  if (verified?.token === token) return verified.user;

  let supabase;
  try { supabase = getSupabaseAuthClient(); } catch {
    res.status(503).json({ code: 'AUTH_UNAVAILABLE', error: 'Auth is not configured on the server.' });
    return null;
  }
  if (!supabase) {
    res.status(503).json({ code: 'AUTH_UNAVAILABLE', error: 'Auth is not configured on the server.' });
    return null;
  }

  let result;
  try {
    result = await supabase.auth.getUser(token);
  } catch {
    res.status(503).json({ code: 'AUTH_UNAVAILABLE', error: 'Authentication service is temporarily unavailable. Please try again.' });
    return null;
  }
  const { data: { user } = {}, error } = result;
  if (error && isTransientAuthError(error)) {
    res.status(503).json({ code: 'AUTH_UNAVAILABLE', error: 'Authentication service is temporarily unavailable. Please try again.' });
    return null;
  }
  if (error || !user) {
    res.status(401).json({ code: 'SESSION_INVALID', error: 'Invalid or expired session. Please log in again.' });
    return null;
  }

  verifiedUsers.set(req, { token, user });
  return user;
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
