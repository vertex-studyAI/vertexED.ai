import { getBearerToken, readJsonBody, verifyAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (!(await rateLimitUserEndpoint(user.id, 'account-delete', res, { limit: 3, windowMs: 60 * 60 * 1000 }))) return;

  const body = readJsonBody(req);
  if (body?.confirmation !== 'DELETE') {
    return res.status(400).json({ error: 'Type DELETE to confirm permanent account deletion.' });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Revoke every refresh session before deleting the identity. Access JWTs are
    // short-lived and cannot be individually revoked, so every application API
    // also validates the still-existing Auth user via getUser().
    const token = getBearerToken(req);
    const { error: signOutError } = await supabase.auth.admin.signOut(token, 'global');
    if (signOutError) {
      console.error('account session revocation failed:', signOutError.name || 'AuthError');
      return res.status(503).json({ error: 'Could not revoke active sessions. Try again.' });
    }

    // Production schema ownership is anchored to auth.users. Learner-owned rows
    // use ON DELETE CASCADE; audit/content attribution rows use SET NULL. Delete
    // the identity once so cleanup is performed by the database instead of
    // manually deleting child rows before auth deletion can still fail.
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error('account delete failed:', error.name || 'AuthError');
      return res.status(500).json({ error: 'Could not delete account. Contact support.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('account delete error:', err instanceof Error ? err.name : 'UnknownError');
    return res.status(500).json({ error: 'Could not delete account' });
  }
}
