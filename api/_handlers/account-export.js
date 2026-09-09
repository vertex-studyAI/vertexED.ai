import { verifyAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { buildAccountExport, listAllOwnedRows } from '../_lib/accountExport.js';

const PROFILE_FIELDS = 'id, email, full_name, avatar_url, board, grade, subjects, exam_date, created_at, updated_at';
const WAITLIST_FIELDS = 'id, email, status, signup_method, created_at, updated_at';
const ARTIFACT_FIELDS = 'id, kind, title, payload, idempotency_key, created_at, updated_at';
const STATE_FIELDS = 'state_type, state_key, payload, client_revision, client_updated_at, created_at, updated_at';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!(await rateLimitUserEndpoint(user.id, 'account-export', res, { limit: 3, windowMs: 60 * 60 * 1000 }))) return;

  try {
    const supabase = getSupabaseAdmin();
    const [profileResult, waitlistResult, studyArtifacts, learnerState] = await Promise.all([
      supabase.from('profiles').select(PROFILE_FIELDS).eq('id', user.id).maybeSingle(),
      supabase.from('waitlist').select(WAITLIST_FIELDS).eq('auth_user_id', user.id).maybeSingle(),
      listAllOwnedRows(() => supabase
        .from('user_study_artifacts')
        .select(ARTIFACT_FIELDS)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })),
      listAllOwnedRows(() => supabase
        .from('learner_state_items')
        .select(STATE_FIELDS)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (waitlistResult.error) throw waitlistResult.error;

    return res.status(200).json(buildAccountExport({
      user,
      profile: profileResult.data,
      waitlist: waitlistResult.data,
      studyArtifacts,
      learnerState,
      exportedAt: new Date().toISOString(),
    }));
  } catch (error) {
    const rowLimit = error instanceof Error && error.code === 'EXPORT_ROW_LIMIT';
    console.error('account export failed:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(rowLimit ? 413 : 503).json({
      error: rowLimit
        ? error.message
        : 'A complete account export is temporarily unavailable. Try again later.',
    });
  }
}
