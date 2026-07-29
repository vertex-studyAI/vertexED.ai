import Razorpay from 'razorpay';

/** Days of full access before the first charge. */
export const TRIAL_PERIOD_DAYS = 3;

/**
 * Plan catalog. Amounts live in the Razorpay dashboard (one Plan per entry);
 * we only reference plan ids, kept in env so test and live modes share code.
 *
 * `totalCount` is the number of billing cycles Razorpay will run. Razorpay has
 * no "until cancelled" option, so each is set to roughly ten years -- long
 * enough to behave like an open-ended subscription.
 */
export const PLANS = {
  weekly: { id: 'weekly', label: 'Weekly', planEnv: 'RAZORPAY_PLAN_WEEKLY', totalCount: 520 },
  monthly: { id: 'monthly', label: 'Monthly', planEnv: 'RAZORPAY_PLAN_MONTHLY', totalCount: 120 },
  quarterly: { id: 'quarterly', label: '3 Months', planEnv: 'RAZORPAY_PLAN_QUARTERLY', totalCount: 40 },
};

let cachedClient = null;

export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET');
  }
  if (!cachedClient) {
    cachedClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return cachedClient;
}

export function isBillingConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/** The publishable key id — safe to send to the browser for Checkout. */
export function getPublicKeyId() {
  return process.env.RAZORPAY_KEY_ID || null;
}

export function getPlanConfig(planId) {
  return PLANS[planId] ?? null;
}

/** Resolve a client-supplied plan id to its configured Razorpay plan id. */
export function getRazorpayPlanId(planId) {
  const plan = PLANS[planId];
  if (!plan) return null;
  const value = process.env[plan.planEnv];
  return value && value.trim() ? value.trim() : null;
}

/** Reverse lookup so the webhook can record which plan a subscription belongs to. */
export function getPlanIdForRazorpayPlan(razorpayPlanId) {
  if (!razorpayPlanId) return null;
  for (const plan of Object.values(PLANS)) {
    if (process.env[plan.planEnv] === razorpayPlanId) return plan.id;
  }
  return null;
}
