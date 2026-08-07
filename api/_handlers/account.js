import { verifyAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (!(await rateLimitUserEndpoint(user.id, 'account-delete', res))) return;

  try {
    const supabase = getSupabaseAdmin();

    // Production schema ownership is anchored to auth.users. Learner-owned rows
    // use ON DELETE CASCADE; audit/content attribution rows use SET NULL. Delete
    // the identity once so cleanup is performed by the database instead of
    // manually deleting child rows before auth deletion can still fail.
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error('account delete failed:', error);
      return res.status(500).json({ error: 'Could not delete account. Contact support.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('account delete error:', err);
    return res.status(500).json({ error: 'Could not delete account' });
  }
}
