import { createClient } from '@supabase/supabase-js';

export const MAX_JSON_BODY_BYTES = 2 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

function getSupabaseAuthClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

export function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

export async function verifyAuthUser(req, res) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return null;
  }

  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    res.status(500).json({ error: 'Auth is not configured on the server.' });
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return null;
  }

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
