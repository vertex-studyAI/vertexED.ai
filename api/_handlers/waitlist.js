
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length) {
    return realIp.trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function hashIp(ip) {
  const salt = process.env.WAITLIST_RATE_LIMIT_SALT || 'vertexed-waitlist';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

function normalizeEmail(raw) {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (!email) return null;
  // Practical RFC 5322 subset
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailPattern.test(email)) return null;
  if (email.length > 254) return null;
  return email;
}

async function isRateLimited(supabase, ipHash) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await supabase
    .from('waitlist_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('attempted_at', since);

  if (error) {
    console.error('Rate limit check failed:', error);
    return false;
  }

  return (count ?? 0) >= RATE_LIMIT_MAX;
}

async function recordRateLimitAttempt(supabase, ipHash) {
  const { error } = await supabase
    .from('waitlist_rate_limits')
    .insert({ ip_hash: ipHash });

  if (error) {
    console.error('Rate limit insert failed:', error);
  }

  const staleBefore = new Date(Date.now() - 60 * 60_000).toISOString();
  supabase
    .from('waitlist_rate_limits')
    .delete()
    .lt('attempted_at', staleBefore)
    .then(({ error: cleanupError }) => {
      if (cleanupError) console.error('Rate limit cleanup failed:', cleanupError);
    });
}

async function authAccountExists(supabase, email) {
  const { data, error } = await supabase.rpc('auth_email_exists', {
    check_email: email,
  });

  if (error) {
    console.error('auth_email_exists RPC failed:', error);
    throw error;
  }

  return Boolean(data);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error('Waitlist config error:', err);
    return res.status(500).json({ error: 'Waitlist is not configured on the server.' });
  }

  const body = req.body ?? {};
  const honeypot = body.website ?? body.company;
  if (honeypot && String(honeypot).trim()) {
    return res.status(200).json({ message: 'You have been added to the waitlist.' });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const ipHash = hashIp(getClientIp(req));

  try {
    if (await isRateLimited(supabase, ipHash)) {
      return res.status(429).json({
        error: 'Too many attempts. Please wait a minute and try again.',
      });
    }

    await recordRateLimitAttempt(supabase, ipHash);

    if (await authAccountExists(supabase, email)) {
      return res.status(409).json({
        error: 'This email is already registered. Try logging in or check your inbox.',
      });
    }

    const { data: existingWaitlist, error: lookupError } = await supabase
      .from('waitlist')
      .select('id, status')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existingWaitlist) {
      return res.status(409).json({
        error: 'This email is already registered. Try logging in or check your inbox.',
      });
    }

    const { error: dbError } = await supabase
      .from('waitlist')
      .insert([{ email, status: 'pending' }]);

    if (dbError) {
      if (dbError.code === '23505') {
        return res.status(409).json({ error: 'This email is already registered. Try logging in or check your inbox.' });
      }
      throw dbError;
    }

    return res.status(200).json({
      message: 'You are on the waitlist. We will email you when your spot is ready.',
      email,
    });
  } catch (err) {
    console.error('Waitlist API error:', err);
    return res.status(500).json({ error: 'Could not join the waitlist. Please try again later.' });
  }
}
