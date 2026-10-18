import { verifyAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { getVertexAccess, respondAccessUnavailable } from '../_lib/vertexAccess.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
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

  try {
    const access = await getVertexAccess(user);
    let applicationProfile;
    if (req.query?.profile === '1' && access.access) {
      const supabase = getSupabaseAdmin();
      const own = await supabase.from('waitlist').select('application_profile').eq('auth_user_id', user.id).maybeSingle();
      if (own.error) throw own.error;
      const profile = own.data?.application_profile;
      if (profile) applicationProfile = { school: profile.school, curriculum: profile.curriculum, curriculumOther: profile.curriculumOther, grade: profile.grade };
    }
    return res.status(200).json({ ...access, ...(applicationProfile ? { applicationProfile } : {}) });
  } catch (err) {
    console.error('waitlist-status error:', err?.code || (err instanceof Error ? err.name : 'UnknownError'));
    return respondAccessUnavailable(res);
  }
}
