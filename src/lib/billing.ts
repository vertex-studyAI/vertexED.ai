import { authFetch } from "@/lib/apiAuth";
import { supabase } from "@/lib/supabaseClient";

export type PlanId = "weekly" | "monthly" | "quarterly";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  /** Honest per-month equivalent so the ladder is comparable at a glance. */
  equivalent: string;
  note?: string;
  highlight?: boolean;
};

export const TRIAL_DAYS = 3;

/**
 * Display copy only — the amounts actually charged live in the Razorpay
 * dashboard Plans referenced by RAZORPAY_PLAN_*. These MUST be kept in sync
 * with those Plans by hand; nothing validates that they match.
 *
 * Priced in INR for an Indian student audience. The original USD ladder
 * ($7 / $25 / $70) works out to roughly ₹600 / ₹2,200 / ₹6,200, which is steep
 * for school students here — these are a starting point, not a final answer.
 */
export const PLANS: Plan[] = [
  {
    id: "weekly",
    name: "Weekly",
    price: "₹149",
    cadence: "per week",
    equivalent: "≈ ₹645/month",
    note: "Good for a single exam week.",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹499",
    cadence: "per month",
    equivalent: "₹499/month",
    note: "Save ₹146/month vs weekly.",
    highlight: true,
  },
  {
    id: "quarterly",
    name: "3 Months",
    price: "₹1,299",
    cadence: "per 3 months",
    equivalent: "≈ ₹433/month",
    note: "Save ₹198 vs paying monthly.",
  },
];

export type SubscriptionStatus = {
  active: boolean;
  status: string;
  plan: PlanId | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isTrialing: boolean;
};

export const INACTIVE_SUBSCRIPTION: SubscriptionStatus = {
  active: false,
  status: "inactive",
  plan: null,
  currentPeriodEnd: null,
  trialEnd: null,
  cancelAtPeriodEnd: false,
  isTrialing: false,
};

type CheckoutSession = {
  subscriptionId: string;
  keyId: string;
  plan: PlanId;
  trialDays: number;
  prefill: { email: string };
};

export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  const response = await authFetch("/api/billing-status");
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Could not load subscription");
  return data as SubscriptionStatus;
}

export async function createSubscription(plan: PlanId): Promise<CheckoutSession> {
  const response = await authFetch("/api/billing-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Could not start checkout");
  return data as CheckoutSession;
}

/** Cancels at the end of the paid cycle unless `immediate` is set. */
export async function cancelSubscription(immediate = false): Promise<void> {
  const response = await authFetch("/api/billing-cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ immediate }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Could not cancel subscription");
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

/** Loads Razorpay Checkout once and reuses the same promise thereafter. */
function loadRazorpayScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // allow a retry on the next click
      reject(new Error("Could not load Razorpay Checkout."));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Opens Razorpay Checkout for an already-created subscription.
 *
 * The UPI Autopay / card e-mandate is approved inside Razorpay's modal, so no
 * payment credentials touch this app. Resolves when the mandate is approved and
 * rejects if the user dismisses the modal — but note that neither outcome grants
 * access: the webhook is the only thing that does.
 */
export async function openRazorpayCheckout(session: CheckoutSession): Promise<void> {
  await loadRazorpayScript();

  const RazorpayCtor = (window as unknown as { Razorpay?: new (options: unknown) => { open: () => void } })
    .Razorpay;
  if (!RazorpayCtor) throw new Error("Razorpay Checkout is unavailable.");

  const planName = PLANS.find((p) => p.id === session.plan)?.name ?? session.plan;

  return new Promise((resolve, reject) => {
    const checkout = new RazorpayCtor({
      key: session.keyId,
      subscription_id: session.subscriptionId,
      name: "VertexED",
      description:
        session.trialDays > 0
          ? `VertexED Pro — ${planName} (${session.trialDays}-day free trial)`
          : `VertexED Pro — ${planName}`,
      prefill: { email: session.prefill?.email || "" },
      theme: { color: "#4f8ff7" },
      handler: () => resolve(),
      modal: {
        ondismiss: () => reject(new Error("Checkout was cancelled.")),
      },
    });
    checkout.open();
  });
}

export function formatRenewalDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

// --- Local development helpers -------------------------------------------
// Razorpay and Supabase are not wired up on a fresh clone, so `npm run dev`
// would otherwise show only an error state. These let you preview both sides of
// the paywall locally, and are compiled out of production builds by DEV checks.

const DEV_OVERRIDE_KEY = "vertex.devSubscription";

/**
 * True on a local clone with no Supabase configured. In that state there is no
 * real session token, so /api/billing-checkout correctly answers 401 and the
 * purchase journey cannot run for real.
 *
 * When this is true the UI substitutes a simulated checkout so the flow is
 * walkable. It is NOT a test of the Razorpay integration — no subscription is
 * created, no mandate is authorised, and no money moves. The real Razorpay
 * sheet only appears once real Supabase and Razorpay test keys are present.
 */
export function isDevPreviewBilling(): boolean {
  return import.meta.env.DEV && !supabase;
}

/** Stands in for Razorpay Checkout during local preview. Grants nothing real. */
export function simulateDevCheckout(): void {
  if (!isDevPreviewBilling()) return;
  setDevSubscriptionOverride("trialing");
}

export function getDevSubscriptionOverride(): "active" | "trialing" | "inactive" {
  if (!import.meta.env.DEV) return "inactive";
  const value = window.localStorage.getItem(DEV_OVERRIDE_KEY);
  return value === "active" || value === "trialing" ? value : "inactive";
}

export function setDevSubscriptionOverride(value: "active" | "trialing" | "inactive") {
  if (!import.meta.env.DEV) return;
  window.localStorage.setItem(DEV_OVERRIDE_KEY, value);
  window.dispatchEvent(new Event("vertex:dev-subscription-changed"));
}

export function devSubscriptionStatus(): SubscriptionStatus {
  const override = getDevSubscriptionOverride();
  if (override === "inactive") return INACTIVE_SUBSCRIPTION;
  return {
    active: true,
    status: override === "trialing" ? "authenticated" : "active",
    plan: "monthly",
    currentPeriodEnd: new Date(Date.now() + 30 * 864e5).toISOString(),
    trialEnd: override === "trialing" ? new Date(Date.now() + 3 * 864e5).toISOString() : null,
    cancelAtPeriodEnd: false,
    isTrialing: override === "trialing",
  };
}
