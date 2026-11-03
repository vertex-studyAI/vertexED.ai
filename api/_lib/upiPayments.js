/**
 * Direct UPI checkout configuration and subscription lookup. See
 * docs/UPI_PAYMENTS.md for the payment flow and forwarder setup.
 */

import { timingSafeEqual, createHash } from 'node:crypto';

export const PAYMENT_PLANS = ['monthly', 'yearly'];
export const ORDER_TTL_MINUTES = 15;
const VPA_RE = /^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9.-]{1,64}$/;
const DEFAULT_PLAN_PAISE = { monthly: 19900, yearly: 199900 };
const MISSING_RELATION_CODES = new Set(['42P01', 'PGRST205']);

function planPaise(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const paise = Number(value);
  return Number.isSafeInteger(paise) && paise >= 100 && paise <= 10_000_000 ? paise : null;
}

export function getPaymentConfig(env = process.env) {
  const vpa = String(env.UPI_PAYEE_VPA || '').trim();
  const payeeName = String(env.UPI_PAYEE_NAME || 'VertexED').trim().slice(0, 50);
  const plans = {
    monthly: planPaise(env.UPI_PLAN_MONTHLY_PAISE, DEFAULT_PLAN_PAISE.monthly),
    yearly: planPaise(env.UPI_PLAN_YEARLY_PAISE, DEFAULT_PLAN_PAISE.yearly),
  };
  const configured = VPA_RE.test(vpa) && Boolean(plans.monthly && plans.yearly);
  return { configured, vpa, payeeName, plans };
}

export function formatRupees(paise) {
  return (paise / 100).toFixed(2);
}

// Percent-encodes a UPI link value but keeps '@' literal: several UPI apps
// read pa=name%40bank as an invalid UPI ID.
function upiParam(value) {
  return encodeURIComponent(value).replace(/%40/g, '@');
}

/** UPI deep link / QR payload (NPCI UPI linking specification). */
export function buildUpiUri({ vpa, payeeName, amountPaise, note }) {
  const params = [['pa', vpa], ['pn', payeeName], ['am', formatRupees(amountPaise)], ['cu', 'INR']];
  if (note) params.push(['tn', note.slice(0, 50)]);
  return `upi://pay?${params.map(([key, value]) => `${key}=${upiParam(value)}`).join('&')}`;
}

export function orderNote(orderId) {
  return `VertexED ${String(orderId).slice(0, 8).toUpperCase()}`;
}

export function publicOrder(order, config) {
  if (!order) return null;
  const expired = order.status === 'pending' && Date.parse(order.expires_at) <= Date.now();
  return {
    id: order.id,
    plan: order.plan,
    status: expired ? 'expired' : order.status,
    amountPaise: order.amount_paise,
    amount: formatRupees(order.amount_paise),
    expiresAt: order.expires_at,
    createdAt: order.created_at,
    claimedUtr: order.claimed_utr ?? null,
    upiUri: buildUpiUri({ vpa: config.vpa, payeeName: config.payeeName, amountPaise: order.amount_paise, note: orderNote(order.id) }),
  };
}

export function isMissingRelation(error) {
  return MISSING_RELATION_CODES.has(error?.code);
}

/** Returns the active subscription, or null. Tolerates an unapplied migration. */
export async function getActiveSubscription(supabase, userId, now = new Date()) {
  const { data, error } = await supabase
    .from('upi_subscriptions')
    .select('plan, paid_until')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return null;
    throw error;
  }
  if (!data || !(Date.parse(data.paid_until) > now.getTime())) return null;
  return { plan: data.plan, paidUntil: data.paid_until };
}

/** Constant-time check of the forwarder's shared secret. */
export function isValidAlertSecret(supplied, expected = process.env.PAYMENT_ALERT_SECRET) {
  if (typeof supplied !== 'string' || typeof expected !== 'string' || expected.length < 32) return false;
  const a = createHash('sha256').update(supplied).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export function normaliseUtr(value) {
  const utr = String(value ?? '').replace(/\s+/g, '');
  return /^[0-9]{12}$/.test(utr) ? utr : null;
}
