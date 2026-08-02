import { readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { checkDbRateLimit } from '../_lib/dbRateLimit.js';
import { verifyInviteCode } from '../_lib/inviteCode.js';
import { getWaitlistEntryByToken } from '../_lib/waitlistAccess.js';
import { getClientIp, normalizeEmail, validatePassword } from '../_lib/security.js';

function hasSignupBackendConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (rejectOversizedJsonBody(req, res, 32 * 1024)) return;

  try {
    const body = readJsonBody(req);
    const {
      action,
      email,
      password,
      username,
      inviteCode,
      waitlistInviteToken,
      website,
    } = body ?? {};

    if (website) {
      return res.status(200).json({ ok: true });
    }

    const inviteToken = typeof waitlistInviteToken === 'string' ? waitlistInviteToken.trim() : '';

    if (action === 'validateInvite') {
      if (!inviteToken) {
        return res.status(400).json({ error: 'Approval token is required.' });
      }
      if (!hasSignupBackendConfig()) {
        return res.status(503).json({ error: 'Account creation is temporarily unavailable. Please try again later.' });
      }

      const supabase = getSupabaseAdmin();
      const entry = await getWaitlistEntryByToken(supabase, inviteToken);
      if (!entry || entry.status !== 'approved') {
        return res.status(403).json({ error: 'This approval link is invalid, expired, or has already been used.' });
      }
      return res.status(200).json({ ok: true, email: entry.email });
    }

    // Reject malformed account data before touching account-creation services.
    const pwd = typeof password === 'string' ? password : '';
    const passwordCheck = validatePassword(pwd);
    if (!passwordCheck.ok) {
      return res.status(400).json({ error: passwordCheck.error });
    }

    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(normalizedUsername)) {
      return res.status(400).json({ error: 'Choose a username with 3-20 letters, numbers, dots, underscores, or hyphens.' });
    }

    // Rate-limit before validating a shared invite code so invalid-code attempts
    // cannot bypass protection by returning early.
    const ip = getClientIp(req);
    const rate = await checkDbRateLimit('signup-invite', ip, 20, 60 * 60 * 1000);
    if (!rate.allowed) {
      return res.status(429).json({
        error: 'Too many signup attempts from this network. Wait a few minutes and try again.',
        retryAfter: rate.retryAfterSec,
      });
    }

    let normalizedEmail = '';
    let inviteEntry = null;

    if (!inviteToken) {
      if (!process.env.SIGNUP_INVITE_CODE) {
        return res.status(503).json({ error: 'Team invite signup is currently unavailable.' });
      }
      if (!verifyInviteCode(inviteCode)) {
        return res.status(403).json({ error: 'This invite code is invalid.' });
      }

      normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
      }
    }

    if (!hasSignupBackendConfig()) {
      return res.status(503).json({ error: 'Account creation is temporarily unavailable. Please try again later.' });
    }

    const supabase = getSupabaseAdmin();

    if (inviteToken) {
      inviteEntry = await getWaitlistEntryByToken(supabase, inviteToken);
      normalizedEmail = normalizeEmail(inviteEntry?.email);

      if (!inviteEntry || inviteEntry.status !== 'approved' || !normalizedEmail) {
        return res.status(403).json({ error: 'This approval link is invalid, expired, or has already been used.' });
      }
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: pwd,
      email_confirm: true,
      user_metadata: { username: normalizedUsername },
    });

    if (error) {
      console.error('signup-invite createUser:', error.message);
      if (error.message?.toLowerCase().includes('already')) {
        return res.status(409).json({ error: 'This email is already registered. Try logging in.' });
      }
      return res.status(400).json({ error: 'Could not create account. Check your details and try again.' });
    }

    if (inviteEntry) {
      await supabase
        .from('waitlist')
        .update({
          auth_user_id: data.user.id,
          invite_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inviteEntry.id);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('signup-invite error:', err);
    return res.status(500).json({ error: 'Could not create account. Please try again later.' });
  }
}
