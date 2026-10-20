import { verifyAuthUser } from '../_lib/auth.js';
import { requireAdmin } from '../_lib/admin.js';
import { buildAdminAnalytics, normaliseAnalyticsDays } from '../_lib/adminAnalytics.js';
import { getQueryParam } from '../_lib/query.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';

const MAX_ROWS = 2_000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!requireAdmin(user, res)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'admin-analytics', res, { limit: 60, windowMs: 60 * 60 * 1000 }))) return;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    console.error('admin analytics config error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({ error: 'Admin analytics is not configured on the server.' });
  }

  const days = normaliseAnalyticsDays(getQueryParam(req, 'days'));
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  try {
    const { data, error } = await supabase
      .from('observability_events')
      .select('event_type, capability, outcome, feedback, recorded_at')
      .gte('recorded_at', start)
      .order('recorded_at', { ascending: true })
      .limit(MAX_ROWS + 1);
    if (error) {
      if (error.code === '42P01') return res.status(503).json({ error: 'Observability storage has not been migrated.' });
      throw error;
    }
    const rows = data ?? [];
    return res.status(200).json({
      ok: true,
      analytics: buildAdminAnalytics(rows.slice(0, MAX_ROWS), { days, truncated: rows.length > MAX_ROWS }),
    });
  } catch (error) {
    console.error('admin analytics error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({ error: 'Admin analytics is temporarily unavailable.' });
  }
}
