import { getClientIp, normalizeEmail } from '../_lib/security.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { checkDbRateLimit } from '../_lib/dbRateLimit.js';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

async function authAccountExists(supabase, email) {
  const { data, error } = await supabase.rpc('auth_email_exists', { check_email: email });
  if (error) throw error;
  return Boolean(data);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch (err) {
    console.error('Waitlist config error:', err instanceof Error ? err.name : 'UnknownError');
    return res.status(500).json({ error: 'Waitlist is not configured on the server.' });
  }

  const body = req.body ?? {};
  if ((body.website ?? body.company) && String(body.website ?? body.company).trim()) {
    return res.status(200).json({ message: 'You have been added to the waitlist.' });
  }

  const method = 'email';
  const email = normalizeEmail(body.email);

  if (!email) return res.status(400).json({ error: 'Please enter a valid email address.' });
  try {
    const rate = await checkDbRateLimit('waitlist', getClientIp(req), RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rate.allowed) {
      if (rate.retryAfterSec) res.setHeader('Retry-After', String(rate.retryAfterSec));
      return res.status(rate.configurationError ? 503 : 429).json({
        error: rate.configurationError
          ? 'Waitlist is not configured on the server.'
          : 'Too many attempts. Please wait a minute and try again.',
      });
    }

    const { data: existing, error: lookupError } = await supabase
      .from('waitlist').select('id, status, signup_method, auth_user_id').eq('email', email).maybeSingle();
    if (lookupError) throw lookupError;

    if (existing) {
      return res.status(409).json({ error: 'This email is already on the waitlist. Check your inbox or sign in.' });
    }

    if (await authAccountExists(supabase, email)) {
      return res.status(409).json({ error: 'This email is already registered. Try logging in or check your inbox.' });
    }

    const { error: insertError } = await supabase.from('waitlist').insert({
      email,
      status: 'pending',
      signup_method: method,
      auth_user_id: null,
    });
    if (insertError) throw insertError;

    return res.status(200).json({
      status: 'pending',
      method,
      message: 'You are on the waitlist. We will email you when your spot is ready.',
    });
  } catch (err) {
    console.error('Waitlist API error:', err?.code || (err instanceof Error ? err.name : 'UnknownError'));
    return res.status(500).json({ error: 'Could not join waitlist. Please try again later.' });
  }
}
