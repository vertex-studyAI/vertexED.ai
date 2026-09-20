import { verifyAuthUserOnly as verifyAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { isAdminUser } from '../_lib/admin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { getAccountWaitlistEntry } from '../_lib/waitlistAccess.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  // Bound access-check polling; durable limiter when migrations applied.
  if (!(await rateLimitUserEndpoint(user.id, 'waitlist-status', res, { limit: 120, windowMs: 60 * 60 * 1000 }))) {
    return;
  }

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
    let applicationProfile;
    if (req.query?.profile === '1' && status === 'approved') {
      const own = await supabase.from('waitlist').select('application_profile').eq('auth_user_id', user.id).maybeSingle();
      if (own.error) throw own.error;
      const profile = own.data?.application_profile;
      if (profile) applicationProfile = { school: profile.school, curriculum: profile.curriculum, curriculumOther: profile.curriculumOther, grade: profile.grade };
    }
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ status, method: entry?.signup_method ?? null, access: status === 'approved', ...(applicationProfile ? { applicationProfile } : {}) });
  } catch (err) {
    console.error('waitlist-status error:', err?.code || (err instanceof Error ? err.name : 'UnknownError'));
    return res.status(500).json({ error: 'Could not verify account access.' });
  }
}
