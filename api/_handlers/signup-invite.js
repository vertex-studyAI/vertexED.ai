import { readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { verifyInviteCode } from '../_lib/inviteCode.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (rejectOversizedJsonBody(req, res, 32 * 1024)) return;

  const ip = clientIp(req);
  const rate = checkRateLimit(`signup-invite:${ip}`, 10, 60 * 60 * 1000);
  if (!rate.allowed) {
    return res.status(429).json({
      error: 'Too many signup attempts. Try again later.',
      retryAfter: rate.retryAfterSec,
    });
  }

  if (!process.env.SIGNUP_INVITE_CODE) {
    console.error('SIGNUP_INVITE_CODE is not configured');
    return res.status(503).json({ error: 'Invite signup is not available right now.' });
  }

  try {
    const body = readJsonBody(req);
    const { email, password, inviteCode, website } = body ?? {};

    if (website) {
      return res.status(200).json({ ok: true });
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const pwd = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    if (pwd.length < MIN_PASSWORD) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD} characters.` });
    }

    if (!verifyInviteCode(inviteCode)) {
      return res.status(403).json({ error: 'Invalid invite code or signup is unavailable.' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: pwd,
      email_confirm: true,
    });

    if (error) {
      console.error('signup-invite createUser:', error.message);
      if (error.message?.toLowerCase().includes('already')) {
        return res.status(409).json({ error: 'This email is already registered. Try logging in.' });
      }
      return res.status(400).json({ error: 'Could not create account. Check your details and try again.' });
    }

    return res.status(200).json({
      ok: true,
      userId: data.user?.id ?? null,
    });
  } catch (err) {
    console.error('signup-invite error:', err);
    return res.status(500).json({ error: 'Could not create account. Please try again later.' });
  }
}
