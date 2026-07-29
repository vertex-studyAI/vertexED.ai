import { getSupabaseAdmin } from './supabaseAdmin.js';
import { isBillingConfigured } from './razorpay.js';

/**
 * Razorpay subscription states that grant access:
 * - authenticated: mandate approved, inside the free trial (start_at not reached)
 * - active:        charged and running
 * - pending:       a charge failed and Razorpay is retrying. Kept as access-granting
 *                  so a temporary bank decline does not instantly lock a paying
 *                  student out; Razorpay moves it to 'halted' once retries are
 *                  exhausted, which does revoke access.
 * - comped:        manually granted (early waitlist users, staff, goodwill).
 *                  Not a Razorpay state; only ever set by hand in the database.
 *
 * Explicitly NOT access-granting: created (mandate never approved), halted,
 * cancelled, completed, expired, paused, inactive.
 */
export const ACTIVE_STATUSES = new Set(['authenticated', 'active', 'pending', 'comped']);

/** States that mean "inside the free trial, not yet charged". */
export const TRIAL_STATUSES = new Set(['authenticated']);

/**
 * Webhooks can be delayed or retried. Trusting `current_period_end` to the
 * second would lock out paying users during that lag, so we allow a grace
 * window past the recorded period end.
 */
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

/**
 * Whether the paywall is enforced. Defaults to "on once Razorpay is configured",
 * so deploying this code before adding keys cannot lock anyone out.
 * Set BILLING_ENFORCED=true/false to override either way.
 */
export function isBillingEnforced() {
  const flag = String(process.env.BILLING_ENFORCED || '').trim().toLowerCase();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return isBillingConfigured();
}

export async function getSubscriptionForUser(userId) {
  if (!userId) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('subscriptions fetch error:', error.message);
    return null;
  }
  return data ?? null;
}

export function isSubscriptionActive(subscription) {
  if (!subscription) return false;
  if (!ACTIVE_STATUSES.has(subscription.status)) return false;

  // 'comped' rows are open-ended and intentionally skip the expiry check.
  if (subscription.status === 'comped') return true;

  // During the trial, access runs until the first charge date.
  if (TRIAL_STATUSES.has(subscription.status)) return true;

  if (!subscription.current_period_end) return true;
  const endsAt = new Date(subscription.current_period_end).getTime();
  if (Number.isNaN(endsAt)) return true;
  return endsAt + GRACE_PERIOD_MS > Date.now();
}

/** Shape returned to the client. Never leak provider ids to the browser. */
export function toPublicSubscription(subscription) {
  return {
    active: isSubscriptionActive(subscription),
    status: subscription?.status ?? 'inactive',
    plan: subscription?.plan ?? null,
    currentPeriodEnd: subscription?.current_period_end ?? null,
    trialEnd: subscription?.trial_end ?? null,
    cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
    isTrialing: TRIAL_STATUSES.has(subscription?.status),
  };
}

/**
 * Gate for premium API handlers. Call immediately after verifyAuthUser.
 * Returns true when the request may proceed; otherwise it has already
 * responded with 402 and the caller must return.
 *
 *   const user = await verifyAuthUser(req, res);
 *   if (!user) return;
 *   if (!(await requireActiveSubscription(user, res))) return;
 */
export async function requireActiveSubscription(user, res) {
  if (!isBillingEnforced()) return true;

  let subscription = null;
  try {
    subscription = await getSubscriptionForUser(user.id);
  } catch (err) {
    // A database outage must not hand out free access to premium features.
    console.error('subscription check failed:', err instanceof Error ? err.message : err);
    res.status(503).json({ error: 'Could not verify your subscription. Please try again.' });
    return false;
  }

  if (isSubscriptionActive(subscription)) return true;

  res.status(402).json({
    error: 'This feature requires a VertexED Pro subscription.',
    code: 'subscription_required',
    status: subscription?.status ?? 'inactive',
  });
  return false;
}

/**
 * Upsert the local mirror of a Razorpay subscription. Called only by the webhook
 * and by checkout when it first records a pending subscription.
 * `user_id` is the conflict target, so a user can never accumulate duplicate rows.
 */
export async function upsertSubscription(row) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('subscriptions')
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  if (error) {
    throw new Error(`subscriptions upsert failed: ${error.message}`);
  }
}

/**
 * Resolve our user id from a Razorpay subscription id.
 * Webhook events carry no JWT, so this is how an event is tied back to a user
 * when the subscription notes are missing.
 */
export async function findUserIdBySubscriptionId(subscriptionId) {
  if (!subscriptionId) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('provider_subscription_id', subscriptionId)
    .maybeSingle();

  if (error) {
    console.error('subscriptions lookup by subscription id error:', error.message);
    return null;
  }
  return data?.user_id ?? null;
}
