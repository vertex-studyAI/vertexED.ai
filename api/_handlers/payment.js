import { verifyAuthUser, readJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { isValidUuid } from '../_lib/security.js';
import { getVertexAccess } from '../_lib/vertexAccess.js';
import {
  ORDER_TTL_MINUTES, PAYMENT_PLANS, formatRupees, getActiveSubscription, getPaymentConfig,
  isMissingRelation, normaliseUtr, publicOrder,
} from '../_lib/upiPayments.js';

const ORDER_COLUMNS = 'id, plan, status, amount_paise, claimed_utr, created_at, expires_at';

function unavailable(res, error = 'Payments are not available right now. Try again later.') {
  res.setHeader('Retry-After', '60');
  return res.status(503).json({ code: 'PAYMENTS_UNAVAILABLE', error });
}

async function latestOpenOrder(supabase, userId) {
  const { data, error } = await supabase
    .from('payment_orders')
    .select(ORDER_COLUMNS)
    .eq('user_id', userId)
    .in('status', ['pending', 'needs_review'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  const user = await verifyAuthUser(req, res);
  if (!user) return;

  const config = getPaymentConfig();
  if (!config.configured) return unavailable(res, 'UPI payments are not set up on the server yet.');

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch { return unavailable(res); }

  const plans = Object.fromEntries(PAYMENT_PLANS.map(plan => [plan, { amountPaise: config.plans[plan], amount: formatRupees(config.plans[plan]) }]));

  try {
    if (req.method === 'GET') {
      if (!(await rateLimitUserEndpoint(user.id, 'payment-status', res, { limit: 600, windowMs: 60 * 60 * 1000 }))) return;
      const [access, subscription, order] = await Promise.all([
        getVertexAccess(user, supabase),
        getActiveSubscription(supabase, user.id),
        latestOpenOrder(supabase, user.id),
      ]);
      return res.status(200).json({
        plans, payeeVpa: config.vpa, payeeName: config.payeeName,
        access: access.access, canSubscribe: access.status !== 'revoked' && access.status !== 'verification_required',
        subscription, order: publicOrder(order, config),
      });
    }

    const body = readJsonBody(req);

    if (body.action === 'create') {
      if (!PAYMENT_PLANS.includes(body.plan)) return res.status(400).json({ error: 'Choose the monthly or yearly plan.' });
      if (!(await rateLimitUserEndpoint(user.id, 'payment-create', res, { limit: 20, windowMs: 60 * 60 * 1000 }))) return;
      const access = await getVertexAccess(user, supabase);
      if (access.status === 'verification_required') return res.status(403).json({ code: 'EMAIL_VERIFICATION_REQUIRED', error: 'Verify your email address before paying.' });
      if (access.status === 'revoked') return res.status(403).json({ code: 'ACCESS_REVOKED', error: 'This account cannot buy access. Contact support.' });
      const { data, error } = await supabase.rpc('reserve_payment_order', {
        p_user_id: user.id, p_plan: body.plan, p_base_paise: config.plans[body.plan], p_ttl_minutes: ORDER_TTL_MINUTES,
      });
      if (error) {
        if (error.hint === 'PAYMENT_AMOUNTS_EXHAUSTED') return unavailable(res, 'Many checkouts are open right now. Try again in a few minutes.');
        throw error;
      }
      const order = Array.isArray(data) ? data[0] : data;
      if (!order) throw new Error('Payment order was not reserved');
      return res.status(201).json({ order: publicOrder(order, config) });
    }

    if (body.action === 'status') {
      if (!isValidUuid(body.orderId)) return res.status(400).json({ error: 'Unknown checkout.' });
      if (!(await rateLimitUserEndpoint(user.id, 'payment-status', res, { limit: 600, windowMs: 60 * 60 * 1000 }))) return;
      const { data: order, error } = await supabase
        .from('payment_orders').select(ORDER_COLUMNS).eq('id', body.orderId).eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      if (!order) return res.status(404).json({ error: 'Unknown checkout.' });
      const subscription = order.status === 'paid' ? await getActiveSubscription(supabase, user.id) : null;
      return res.status(200).json({ order: publicOrder(order, config), subscription });
    }

    if (body.action === 'claim') {
      const utr = normaliseUtr(body.utr);
      if (!isValidUuid(body.orderId)) return res.status(400).json({ error: 'Unknown checkout.' });
      if (!utr) return res.status(400).json({ error: 'Enter the 12-digit UPI reference number from your payment app.' });
      if (!(await rateLimitUserEndpoint(user.id, 'payment-claim', res, { limit: 10, windowMs: 60 * 60 * 1000 }))) return;
      const { data, error } = await supabase.rpc('claim_payment_order', { p_user_id: user.id, p_order_id: body.orderId, p_utr: utr });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      switch (result?.outcome) {
        case 'paid': return res.status(200).json({ outcome: 'paid', paidUntil: result.paid_until });
        case 'needs_review': return res.status(202).json({ outcome: 'needs_review' });
        case 'utr_used': return res.status(409).json({ outcome: 'utr_used', error: 'That reference number has already been used for another payment.' });
        case 'rejected': return res.status(409).json({ outcome: 'rejected', error: 'This checkout was declined. Contact support if you paid.' });
        default: return res.status(404).json({ error: 'Unknown checkout.' });
      }
    }

    return res.status(400).json({ error: 'Unknown payment action.' });
  } catch (error) {
    console.error('payment error:', error?.code || (error instanceof Error ? error.name : 'UnknownError'));
    if (isMissingRelation(error)) return unavailable(res, 'UPI payments are not set up on the server yet.');
    return unavailable(res);
  }
}
