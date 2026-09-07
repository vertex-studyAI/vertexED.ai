import { verifyAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { isAdminUser } from '../_lib/admin.js';
import { getAccountWaitlistEntry } from '../_lib/waitlistAccess.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  // Admins must retain access even if their historical waitlist row uses a
  // different sign-in address or has not yet been linked to auth_user_id.
  if (isAdminUser(user)) {
    return res.status(200).json({ status: 'approved', method: 'admin', access: true });
  }

  try {
    const supabase = getSupabaseAdmin();
    const entry = await getAccountWaitlistEntry(supabase, user);

    // Historical accounts and team invitations are materialized as approved
    // rows by migration/signup. A missing row is not authorization: this also
    // fails closed if hosted Auth signup is accidentally enabled.
    const status = entry?.status ?? 'unregistered';
    return res.status(200).json({ status, method: entry?.signup_method ?? null, access: status === 'approved' });
  } catch (err) {
    console.error('waitlist-status error:', err?.code || (err instanceof Error ? err.name : 'UnknownError'));
    return res.status(500).json({ error: 'Could not verify account access.' });
  }
}
