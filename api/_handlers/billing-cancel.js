import { verifyAuthUser, readJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { getRazorpay, isBillingConfigured } from '../_lib/razorpay.js';
import { getSubscriptionForUser, upsertSubscription } from '../_lib/subscription.js';

/**
 * POST /api/billing-cancel  { immediate?: boolean }
 *
 * Razorpay has no hosted customer portal (unlike Stripe), so cancellation lives
 * here. Defaults to cancelling at the end of the paid cycle so the user keeps
 * the access they already paid for.
 *
 * The webhook will follow with subscription.cancelled and reconcile the row;
 * the local write below is just so the UI updates immediately.
 */
export default async function handler(req, res) {
  if (!isBillingConfigured()) {
    return res.status(503).json({ error: 'Billing is not configured on this server.' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (!(await rateLimitUserEndpoint(user.id, 'billing-cancel', res))) return;

  const body = readJsonBody(req);
  const cancelAtCycleEnd = body.immediate === true ? 0 : 1;

  try {
    const subscription = await getSubscriptionForUser(user.id);
    const subscriptionId = subscription?.provider_subscription_id;

    if (!subscriptionId) {
      return res.status(404).json({ error: 'No active subscription found.' });
    }

    const razorpay = getRazorpay();
    const updated = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);

    await upsertSubscription({
      user_id: user.id,
      provider: 'razorpay',
      provider_subscription_id: subscriptionId,
      status: updated?.status ?? subscription.status,
      cancel_at_period_end: cancelAtCycleEnd === 1,
    });

    return res.status(200).json({
      cancelled: true,
      atCycleEnd: cancelAtCycleEnd === 1,
      status: updated?.status ?? null,
    });
  } catch (err) {
    console.error('billing-cancel error:', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Could not cancel the subscription. Please try again.' });
  }
}
