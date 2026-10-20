import { readJsonBody, rejectOversizedJsonBody, verifyAuthUser } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { normalizeProductFeedback } from '../../src/lib/productFeedback.mjs';

const MAX_FEEDBACK_BODY_BYTES = 8 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (rejectOversizedJsonBody(req, res, MAX_FEEDBACK_BODY_BYTES)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'product-feedback', res, { limit: 10, windowMs: 10 * 60 * 1000 }))) return;

  const normalized = normalizeProductFeedback(readJsonBody(req));
  if (!normalized.ok) return res.status(400).json({ error: normalized.error });

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    console.error('product feedback config error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({ error: 'Feedback is temporarily unavailable.' });
  }

  try {
    const { data, error } = await supabase
      .from('product_feedback')
      .insert({ user_id: user.id, ...normalized.data })
      .select('id')
      .single();
    if (error) {
      if (error.code === '42P01') return res.status(503).json({ error: 'Feedback storage has not been migrated.' });
      throw error;
    }
    return res.status(201).json({ ok: true, case: { id: data.id } });
  } catch (error) {
    console.error('product feedback error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({ error: 'Feedback could not be saved. Please try again.' });
  }
}
