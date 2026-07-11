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

    await supabase.from('user_study_artifacts').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('id', user.id);

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
