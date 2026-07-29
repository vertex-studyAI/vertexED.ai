import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Loader2, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import {
  PLANS,
  TRIAL_DAYS,
  createSubscription,
  openRazorpayCheckout,
  cancelSubscription,
  isDevPreviewBilling,
  simulateDevCheckout,
  formatRenewalDate,
  getDevSubscriptionOverride,
  setDevSubscriptionOverride,
  type PlanId,
} from "@/lib/billing";

/** Survives the round trip through /login so a chosen plan is not forgotten. */
const PENDING_PLAN_KEY = "vertex.pendingPlan";

const INCLUDED = [
  "AI chatbot tutor with curriculum grounding",
  "Adaptive study planner",
  "Paper maker for IB, IGCSE, A-Level and AP",
  "Answer reviewer with rubric-level feedback",
  "Notetaker, flashcards and spaced repetition",
  "Study notebook with cloud sync",
];

export default function Pricing(): JSX.Element {
  const { user } = useAuth();
  const { subscription, loading, refresh } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pending, setPending] = useState<PlanId | null>(null);
  const [cancelPending, setCancelPending] = useState(false);

  const cameFrom = (location.state as { from?: string } | null)?.from;

  // Set when the user picked a plan, got sent to login, and came back signed in.
  // Deliberately NOT auto-opened: a payment sheet appearing on page load, with
  // no click behind it, is alarming. They confirm with one click instead.
  const [resumePlan, setResumePlan] = useState<PlanId | null>(null);
  useEffect(() => {
    if (!user) return;
    const stored = window.sessionStorage.getItem(PENDING_PLAN_KEY);
    if (stored && PLANS.some((p) => p.id === stored)) {
      setResumePlan(stored as PlanId);
      window.sessionStorage.removeItem(PENDING_PLAN_KEY);
    }
  }, [user?.id]);

  const handleSubscribe = async (plan: PlanId) => {
    if (!user) {
      // Remember the intent so signing in returns them to the plan they picked
      // instead of a blank pricing page.
      window.sessionStorage.setItem(PENDING_PLAN_KEY, plan);
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }
    window.sessionStorage.removeItem(PENDING_PLAN_KEY);
    setPending(plan);

    // Local clone with no Supabase: there is no session token, so the real
    // checkout call would 401. Substitute a simulated purchase so the journey
    // is walkable. Nothing is charged and no subscription is created.
    if (isDevPreviewBilling()) {
      simulateDevCheckout();
      navigate("/billing/success?simulated=1");
      return;
    }

    try {
      const session = await createSubscription(plan);
      // The UPI/card mandate is approved inside Razorpay's modal, so no payment
      // credentials touch this app. Access is granted by the webhook, not here.
      await openRazorpayCheckout(session);
      navigate("/billing/success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      // Dismissing the modal is a normal action, not an error worth alarming over.
      if (!message.includes("cancelled")) {
        toast({ title: "Could not start checkout", description: message, variant: "destructive" });
      }
      setPending(null);
    }
  };

  const handleCancel = async () => {
    setCancelPending(true);
    try {
      await cancelSubscription();
      toast({
        title: "Subscription cancelled",
        description: "You keep access until the end of your current billing period.",
      });
      refresh();
    } catch (err) {
      toast({
        title: "Could not cancel",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelPending(false);
    }
  };

  const renewal = formatRenewalDate(subscription.currentPeriodEnd);

  return (
    <>
      <SEO
        title="Pricing — VertexED Pro"
        description={`Every VertexED study tool on one plan. Start with a ${TRIAL_DAYS}-day free trial, then $7 per week, $25 per month, or $70 for three months.`}
        canonical="https://www.vertexed.app/pricing"
      />

      <div className="mx-auto max-w-6xl px-5 py-14">
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {TRIAL_DAYS}-day free trial
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One plan. Every study tool.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Cancel anytime during the trial and you will not be charged. Pick the length that
            matches your exam season.
          </p>
        </header>

        {resumePlan && !subscription.active && (
          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-foreground">
              You are signed in — continue with the{" "}
              <strong>{PLANS.find((p) => p.id === resumePlan)?.name}</strong> plan?
            </p>
            <Button size="sm" onClick={() => handleSubscribe(resumePlan)} disabled={pending !== null}>
              {pending === resumePlan && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Continue
            </Button>
          </div>
        )}

        {cameFrom && !subscription.active && (
          <div
            role="status"
            className="mx-auto mt-8 max-w-2xl rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-foreground"
          >
            That feature is part of VertexED Pro. Start your free trial to unlock it.
          </div>
        )}

        {!loading && subscription.active && (
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 text-center">
            <p className="text-sm font-medium text-foreground">
              {subscription.isTrialing ? "Your free trial is active" : "Your subscription is active"}
              {subscription.plan ? ` — ${subscription.plan} plan` : ""}
            </p>
            {renewal && (
              <p className="mt-1 text-xs text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? "Access ends" : "Renews"} on {renewal}
              </p>
            )}
            {!subscription.cancelAtPeriodEnd && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleCancel}
                disabled={cancelPending}
              >
                {cancelPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Cancel subscription
              </Button>
            )}
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <section
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition ${
                plan.highlight
                  ? "border-primary/60 bg-primary/[0.03] shadow-lg shadow-primary/5"
                  : "border-border/60 bg-card/40"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}

              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {plan.name}
              </h2>

              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.cadence}</span>
              </p>

              <p className="mt-1 text-xs text-muted-foreground">{plan.equivalent}</p>
              {plan.note && <p className="mt-3 text-sm text-foreground/80">{plan.note}</p>}

              <Button
                className="mt-6 w-full"
                variant={plan.highlight ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id)}
                disabled={pending !== null || subscription.active}
              >
                {pending === plan.id && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {subscription.active
                  ? "Current plan available"
                  : user
                    ? `Start ${TRIAL_DAYS}-day free trial`
                    : "Sign in to start free trial"}
              </Button>

              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Then {plan.price} {plan.cadence}. Cancel anytime.
              </p>
            </section>
          ))}
        </div>

        <section className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border/60 bg-card/30 p-6">
          <h2 className="text-sm font-semibold text-foreground">Every plan includes</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          Pay by UPI Autopay, card, or net banking. Payments are processed by Razorpay —
          VertexED never sees or stores your payment details.
        </p>

        {import.meta.env.DEV && <DevSubscriptionToggle />}
      </div>
    </>
  );
}

/**
 * Local-only control for previewing the paywall without Razorpay or Supabase running.
 * `import.meta.env.DEV` is statically false in production builds, so bundlers drop this.
 */
function DevSubscriptionToggle(): JSX.Element {
  const [value, setValue] = useState(getDevSubscriptionOverride());

  const apply = (next: "active" | "trialing" | "inactive") => {
    setValue(next);
    setDevSubscriptionOverride(next);
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
        Dev only — not in production builds
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Simulate subscription state to preview both sides of the paywall.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["inactive", "trialing", "active"] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={value === option ? "default" : "outline"}
            onClick={() => apply(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
