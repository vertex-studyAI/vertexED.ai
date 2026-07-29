import { verifyAuthUser, readJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import {
  getRazorpay,
  isBillingConfigured,
  getPublicKeyId,
  getRazorpayPlanId,
  getPlanConfig,
  PLANS,
  TRIAL_PERIOD_DAYS,
} from '../_lib/razorpay.js';
import {
  getSubscriptionForUser,
  isSubscriptionActive,
  upsertSubscription,
} from '../_lib/subscription.js';

/**
 * POST /api/billing-checkout  { plan: 'weekly' | 'monthly' | 'quarterly' }
 *
 * Creates a Razorpay Subscription and returns the ids the browser needs to open
 * Razorpay Checkout. Unlike a hosted redirect flow, the customer approves the
 * UPI Autopay / card e-mandate inside Razorpay's modal, so no card or UPI detail
 * ever reaches this app.
 *
 * Access is NOT granted here — only the webhook does that, after Razorpay
 * confirms the mandate.
 */
export default async function handler(req, res) {
  if (!isBillingConfigured()) {
    return res.status(503).json({ error: 'Billing is not configured on this server.' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (!(await rateLimitUserEndpoint(user.id, 'billing-checkout', res))) return;

  const body = readJsonBody(req);
  const planId = typeof body.plan === 'string' ? body.plan.trim() : '';

  if (!PLANS[planId]) {
    return res.status(400).json({ error: 'Unknown plan.' });
  }

  const razorpayPlanId = getRazorpayPlanId(planId);
  if (!razorpayPlanId) {
    return res.status(503).json({ error: `No Razorpay plan configured for the ${planId} plan.` });
  }

  try {
    const existing = await getSubscriptionForUser(user.id);

    if (isSubscriptionActive(existing)) {
      return res.status(409).json({
        error: 'You already have an active subscription.',
        code: 'already_subscribed',
      });
    }

    // One free trial per account. Razorpay implements a trial as "first charge
    // happens at start_at" — the mandate is still authorised up front, so the
    // subscription converts automatically unless the user cancels.
    const hasHadTrial = Boolean(existing?.trial_end);
    const trialEndsAt = hasHadTrial
      ? null
      : Math.floor(Date.now() / 1000) + TRIAL_PERIOD_DAYS * 24 * 60 * 60;

    const razorpay = getRazorpay();
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: getPlanConfig(planId).totalCount,
      quantity: 1,
      customer_notify: 1,
      ...(trialEndsAt ? { start_at: trialEndsAt } : {}),
      notes: { supabase_user_id: user.id, plan: planId },
    });

    // Record it before the user reaches the modal, so a webhook that arrives
    // without readable notes can still be matched back to this user.
    await upsertSubscription({
      user_id: user.id,
      provider: 'razorpay',
      provider_subscription_id: subscription.id,
      status: subscription.status || 'created',
      plan: planId,
      plan_id: razorpayPlanId,
      trial_end: trialEndsAt ? new Date(trialEndsAt * 1000).toISOString() : existing?.trial_end ?? null,
    });

    return res.status(200).json({
      subscriptionId: subscription.id,
      keyId: getPublicKeyId(),
      plan: planId,
      trialDays: trialEndsAt ? TRIAL_PERIOD_DAYS : 0,
      prefill: { email: user.email ?? '' },
    });
  } catch (err) {
    console.error('billing-checkout error:', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
