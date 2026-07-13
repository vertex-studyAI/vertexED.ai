import { verifyAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';

function unavailable(error) {
  return error?.code === '42P01' || /does not exist|relation .* does not exist/i.test(String(error?.message || error || ''));
}

async function accountExport(supabase, user) {
  const [profileResult, artifactsResult, sessionsResult, masteryResult, scheduleResult, recommendationResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('user_study_artifacts').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
    supabase.from('assessment_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('mastery_states').select('*').eq('user_id', user.id),
    supabase.from('concept_review_schedule').select('*').eq('user_id', user.id),
    supabase.from('learning_recommendations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  const coreResults = [profileResult, artifactsResult];
  const coreError = coreResults.find((result) => result.error)?.error;
  if (coreError) throw coreError;
  const assessmentResults = [sessionsResult, masteryResult, scheduleResult, recommendationResult];
  const assessmentError = assessmentResults.find((result) => result.error)?.error;
  if (assessmentError && !unavailable(assessmentError)) throw assessmentError;

  const sessions = sessionsResult.error ? [] : sessionsResult.data ?? [];
  const sessionIds = sessions.map((session) => session.id);
  let items = [];
  let responses = [];
  let gradingRuns = [];
  let learningEvidence = [];
  if (sessionIds.length) {
    const itemResult = await supabase.from('assessment_session_items').select('*').in('session_id', sessionIds).order('ordinal');
    if (itemResult.error && !unavailable(itemResult.error)) throw itemResult.error;
    items = itemResult.data ?? [];
    const itemIds = items.map((item) => item.id);
    if (itemIds.length) {
      const [responseResult, gradingResult] = await Promise.all([
        supabase.from('assessment_responses').select('*').in('session_item_id', itemIds),
        supabase.from('grading_runs').select('*').in('session_item_id', itemIds),
      ]);
      if (responseResult.error && !unavailable(responseResult.error)) throw responseResult.error;
      if (gradingResult.error && !unavailable(gradingResult.error)) throw gradingResult.error;
      responses = responseResult.data ?? [];
      gradingRuns = gradingResult.data ?? [];
    }
  }
  if (!assessmentError) {
    const evidenceResult = await supabase.from('learning_evidence').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false });
    if (evidenceResult.error && !unavailable(evidenceResult.error)) throw evidenceResult.error;
    learningEvidence = evidenceResult.data ?? [];
  }

  return {
    exportVersion: '2026-07-13',
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at ?? null,
      userMetadata: user.user_metadata ?? {},
      profile: profileResult.data ?? null,
    },
    savedStudyArtifacts: artifactsResult.data ?? [],
    assessmentData: {
      available: !assessmentError,
      sessions,
      sessionItems: items,
      responses,
      gradingRuns,
      learningEvidence,
      masteryStates: masteryResult.data ?? [],
      reviewSchedule: scheduleResult.data ?? [],
      recommendations: recommendationResult.data ?? [],
    },
  };
}

export default async function handler(req, res) {
  if (!['GET', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const user = await verifyAuthUser(req, res);
  if (!user) return;

  const limitKey = req.method === 'DELETE' ? 'account-delete' : 'account-export';
  if (!(await rateLimitUserEndpoint(user.id, limitKey, res))) return;
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return res.status(503).json({ error: 'Account service is not configured.' });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, data: await accountExport(supabase, user) });
    }

    // User-owned assessment and learning records cascade from auth.users. Delete the
    // independent legacy artifact/profile records first, then remove the auth user.
    const [artifactResult, profileResult] = await Promise.all([
      supabase.from('user_study_artifacts').delete().eq('user_id', user.id),
      supabase.from('profiles').delete().eq('id', user.id),
    ]);
    if (artifactResult.error) throw artifactResult.error;
    if (profileResult.error) throw profileResult.error;
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(`account ${req.method.toLowerCase()} failed:`, error);
    return res.status(500).json({ error: req.method === 'GET' ? 'Could not export account data.' : 'Could not delete account. Contact support.' });
  }
}
