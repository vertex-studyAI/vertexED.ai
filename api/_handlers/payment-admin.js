import { verifyAuthUser, readJsonBody } from '../_lib/auth.js';
import { requireAdmin } from '../_lib/admin.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { isValidUuid } from '../_lib/security.js';
import { formatRupees, isMissingRelation, normaliseUtr } from '../_lib/upiPayments.js';

async function emailsFor(supabase, userIds) {
  const emails = {};
  if (!userIds.length) return emails;
  const { data, error } = await supabase.from('waitlist').select('auth_user_id, email').in('auth_user_id', userIds);
  if (error) throw error;
  for (const row of data ?? []) emails[row.auth_user_id] = row.email;
  return emails;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!requireAdmin(user, res)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'payment-admin', res, { limit: 300, windowMs: 60 * 60 * 1000 }))) return;

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch { return res.status(503).json({ error: 'Payments are not configured.' }); }

  try {
    const body = readJsonBody(req);

    if (body.action === 'list') {
      const [orders, alerts] = await Promise.all([
        supabase.from('payment_orders')
          .select('id, user_id, plan, amount_paise, status, claimed_utr, created_at, updated_at')
          .eq('status', 'needs_review').order('updated_at', { ascending: false }).limit(100),
        supabase.from('payment_alerts')
          .select('id, amount_paise, utr, received_at, sender, excerpt')
          .eq('status', 'unmatched').order('received_at', { ascending: false }).limit(100),
      ]);
      if (orders.error) throw orders.error;
      if (alerts.error) throw alerts.error;
      const emails = await emailsFor(supabase, [...new Set((orders.data ?? []).map(order => order.user_id))]);
      return res.status(200).json({
        orders: (orders.data ?? []).map(order => ({
          id: order.id, email: emails[order.user_id] ?? null, plan: order.plan,
          amount: formatRupees(order.amount_paise), claimedUtr: order.claimed_utr,
          createdAt: order.created_at, updatedAt: order.updated_at,
        })),
        alerts: (alerts.data ?? []).map(alert => ({
          id: alert.id, amount: formatRupees(alert.amount_paise), utr: alert.utr,
          receivedAt: alert.received_at, sender: alert.sender, excerpt: alert.excerpt,
        })),
      });
    }

    if (body.action === 'approve' || body.action === 'reject') {
      if (!isValidUuid(body.orderId)) return res.status(400).json({ error: 'Unknown order.' });
      const utr = body.action === 'approve' ? normaliseUtr(body.utr) : null;
      if (body.action === 'approve' && !utr) return res.status(400).json({ error: 'Enter the 12-digit UPI reference you saw in your bank.' });
      const { data, error } = await supabase.rpc('resolve_payment_order', {
        p_order_id: body.orderId, p_approve: body.action === 'approve', p_utr: utr,
      });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      if (result?.outcome === 'not_found') return res.status(404).json({ error: 'Unknown order.' });
      if (result?.outcome === 'utr_used') return res.status(409).json({ error: 'That UPI reference is already attached to another order.' });
      return res.status(200).json({ outcome: result?.outcome, paidUntil: result?.paid_until ?? null });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (error) {
    console.error('payment-admin error:', error?.code || (error instanceof Error ? error.name : 'UnknownError'));
    if (isMissingRelation(error)) return res.status(503).json({ error: 'Apply the UPI payments migration first.' });
    return res.status(503).json({ error: 'Payment review is temporarily unavailable.' });
  }
}
