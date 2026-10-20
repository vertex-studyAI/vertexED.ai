import { verifyAuthUser } from '../_lib/auth.js';
import { requireAdmin } from '../_lib/admin.js';
import { normaliseSupportQuery, toSupportCase } from '../_lib/adminSupport.js';
import { getQueryParam } from '../_lib/query.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!requireAdmin(user, res)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'admin-support', res, { limit: 120, windowMs: 60 * 60 * 1000 }))) return;

  const query = normaliseSupportQuery({
    category: getQueryParam(req, 'category'),
    requestId: getQueryParam(req, 'requestId'),
    page: getQueryParam(req, 'page'),
    pageSize: getQueryParam(req, 'pageSize'),
  });
  if (query.hasInvalidRequestId) {
    return res.status(400).json({ error: 'Enter a valid support request ID.' });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    console.error('admin support config error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({ error: 'Admin support is not configured on the server.' });
  }

  try {
    const from = (query.page - 1) * query.pageSize;
    let request = supabase
      .from('product_feedback')
      .select('id, category, rating, feedback, page_path, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + query.pageSize - 1);
    if (query.category !== 'all') request = request.eq('category', query.category);
    if (query.requestId) request = request.eq('id', query.requestId);

    const { data, error, count } = await request;
    if (error) {
      if (error.code === '42P01') return res.status(503).json({ error: 'Product feedback storage has not been migrated.' });
      throw error;
    }

    const total = count ?? 0;
    return res.status(200).json({
      ok: true,
      cases: (data ?? []).map(toSupportCase),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
      privacy: 'Support cases show only submitted product feedback, its route and generated request ID. They do not expose learner records, saved study work or account profiles.',
      retention: 'Retention and responder procedures require an approved support policy before operational use.',
    });
  } catch (error) {
    console.error('admin support error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({ error: 'Admin support is temporarily unavailable.' });
  }
}
