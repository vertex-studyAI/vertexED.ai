import { verifyAuthUser } from '../_lib/auth.js';
import { getSubscriptionForUser, toPublicSubscription, isBillingEnforced } from '../_lib/subscription.js';

/**
 * GET /api/billing-status
 * The single source of truth the frontend uses to decide what to unlock.
 */
export default async function handler(req, res) {
  const user = await verifyAuthUser(req, res);
  if (!user) return;

  // When the paywall is off, report everyone as active so the UI stays unlocked.
  if (!isBillingEnforced()) {
    return res.status(200).json({
      active: true,
      status: 'billing_disabled',
      plan: null,
      currentPeriodEnd: null,
      trialEnd: null,
      cancelAtPeriodEnd: false,
      isTrialing: false,
    });
  }

  try {
    const subscription = await getSubscriptionForUser(user.id);
    return res.status(200).json(toPublicSubscription(subscription));
  } catch (err) {
    console.error('billing-status error:', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Could not load your subscription.' });
  }
}
