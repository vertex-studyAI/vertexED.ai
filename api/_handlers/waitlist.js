import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { getClientIp, getWaitlistRateLimitSalt, normalizeEmail } from '../_lib/security.js';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key);
}

function hashIp(ip) {
  const salt = getWaitlistRateLimitSalt();
  return salt ? createHash('sha256').update(`${salt}:${ip}`).digest('hex') : null;
}

async function isRateLimited(supabase, ipHash) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error } = await supabase.from('waitlist_rate_limits').select('*', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('attempted_at', since);
  if (error) { console.error('Rate limit check failed:', error); return true; }
  return (count ?? 0) >= RATE_LIMIT_MAX;
}

async function recordRateLimitAttempt(supabase, ipHash) {
  await supabase.from('waitlist_rate_limits').insert({ ip_hash: ipHash });
}

async function authAccountExists(supabase, email) {
  const { data, error } = await supabase.rpc('auth_email_exists', { check_email: email });
  if (error) throw error;
  return Boolean(data);
}

function bearerToken(req) {
  const header = String(req.headers.authorization || '');
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let supabase;
  try { supabase = getSupabase(); } catch (err) {
    console.error('Waitlist config error:', err);
    return res.status(500).json({ error: 'Waitlist is not configured on the server.' });
  }

  const body = req.body ?? {};
  if ((body.website ?? body.company) && String(body.website ?? body.company).trim()) {
    return res.status(200).json({ message: 'You have been added to the waitlist.' });
  }

  const method = body.method === 'google' ? 'google' : 'email';
  let authUser = null;
  let email = normalizeEmail(body.email);

  if (method === 'google') {
    const token = bearerToken(req);
    if (!token) return res.status(401).json({ error: 'Sign in with Google before joining the Google waitlist.' });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email) return res.status(401).json({ error: 'Could not verify your Google account.' });
    if (!data.user.app_metadata?.providers?.includes('google')) return res.status(400).json({ error: 'Use Google sign-in to join this waitlist path.' });
    authUser = data.user;
    email = normalizeEmail(data.user.email);
  }

  if (!email) return res.status(400).json({ error: 'Please enter a valid email address.' });
  const ipHash = hashIp(getClientIp(req));
  if (!ipHash) return res.status(503).json({ error: 'Waitlist is not configured on the server.' });

  try {
    if (await isRateLimited(supabase, ipHash)) return res.status(429).json({ error: 'Too many attempts. Please wait a minute and try again.' });
    await recordRateLimitAttempt(supabase, ipHash);

    const { data: existing, error: lookupError } = await supabase
      .from('waitlist').select('id, status, signup_method, auth_user_id').eq('email', email).maybeSingle();
    if (lookupError) throw lookupError;

    if (existing) {
      if (method === 'google' && (!existing.auth_user_id || existing.auth_user_id === authUser.id)) {
        if (!existing.auth_user_id) await supabase.from('waitlist').update({ auth_user_id: authUser.id, signup_method: 'google', updated_at: new Date().toISOString() }).eq('id', existing.id);
        return res.status(200).json({ status: existing.status, method: 'google', message: existing.status === 'approved' ? 'Your access is approved. You can use Google sign-in.' : 'Your Google waitlist request is pending approval.' });
      }
      return res.status(409).json({ error: 'This email is already on the waitlist. Check your inbox or sign in.' });
    }

    if (method === 'email' && await authAccountExists(supabase, email)) {
      return res.status(409).json({ error: 'This email is already registered. Try logging in or check your inbox.' });
    }

    const { error: insertError } = await supabase.from('waitlist').insert({
      email,
      status: 'pending',
      signup_method: method,
      auth_user_id: authUser?.id ?? null,
    });
    if (insertError) throw insertError;

    return res.status(200).json({
      status: 'pending',
      method,
      message: method === 'google' ? 'Your Google waitlist request is pending approval.' : 'You are on the waitlist. We will email you when your spot is ready.',
    });
  } catch (err) {
    console.error('Waitlist API error:', err);
    return res.status(500).json({ error: 'Could not join waitlist. Please try again later.' });
  }
}