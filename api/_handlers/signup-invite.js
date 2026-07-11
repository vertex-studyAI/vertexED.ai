import { readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { verifyInviteCode } from '../_lib/inviteCode.js';
import { checkDbRateLimit } from '../_lib/dbRateLimit.js';
import { assertWaitlistSignupAllowed } from '../_lib/waitlistAccess.js';
import { getClientIp, normalizeEmail, validatePassword } from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (rejectOversizedJsonBody(req, res, 32 * 1024)) return;

  const ip = getClientIp(req);
  const rate = await checkDbRateLimit('signup-invite', ip, 10, 60 * 60 * 1000);
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
    const { email, password, inviteCode, waitlistInviteToken, website } = body ?? {};

    if (website) {
      return res.status(200).json({ ok: true });
    }

    const normalizedEmail = normalizeEmail(email);
    const pwd = typeof password === 'string' ? password : '';

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const passwordCheck = validatePassword(pwd);
    if (!passwordCheck.ok) {
      return res.status(400).json({ error: passwordCheck.error });
    }

    const hasTeamInvite = verifyInviteCode(inviteCode);
    const supabase = getSupabaseAdmin();

    let hasValidInvite = hasTeamInvite;
    if (!hasValidInvite && typeof inviteCode === 'string' && inviteCode.trim()) {
      const { data: tokenEntry, error: tokenError } = await supabase
        .from('waitlist')
        .select('email, status')
        .eq('invite_token', inviteCode.trim())
        .maybeSingle();

      if (tokenError) {
        console.error('waitlist invite token lookup failed:', tokenError);
      } else if (
        tokenEntry?.status === 'approved' &&
        tokenEntry.email?.toLowerCase() === normalizedEmail
      ) {
        hasValidInvite = true;
      }
    }

    if (!hasValidInvite) {
      const failRate = await checkDbRateLimit('signup-invite-fail', ip, 5, 60 * 60 * 1000);
      if (!failRate.allowed) {
        return res.status(429).json({
          error: 'Too many failed signup attempts. Try again later.',
          retryAfter: failRate.retryAfterSec,
        });
      }

      const waitlistCheck = await assertWaitlistSignupAllowed(supabase, normalizedEmail, {
        inviteToken: waitlistInviteToken,
      });
      if (!waitlistCheck.allowed) {
        return res.status(waitlistCheck.status).json({ error: waitlistCheck.error });
      }
    }

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

    if (!hasValidInvite) {
      await supabase
        .from('waitlist')
        .update({ updated_at: new Date().toISOString() })
        .eq('email', normalizedEmail);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('signup-invite error:', err);
    return res.status(500).json({ error: 'Could not create account. Please try again later.' });
  }
}
