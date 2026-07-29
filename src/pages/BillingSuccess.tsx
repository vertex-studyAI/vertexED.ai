import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 8;

/**
 * Landing page after Razorpay Checkout (/billing/success).
 *
 * Checkout redirects here as soon as payment succeeds, but access is granted by
 * the webhook, which can arrive a moment later. So we poll our own status
 * endpoint briefly rather than assuming the subscription is already recorded.
 */
export default function BillingSuccess(): JSX.Element {
  const { subscription, loading, refresh } = useSubscription();
  const [polls, setPolls] = useState(0);
  const location = useLocation();
  const isSimulated = new URLSearchParams(location.search).get("simulated") === "1";

  const settled = subscription.active;
  const timedOut = polls >= MAX_POLLS;

  useEffect(() => {
    if (settled || timedOut || loading) return;
    const timer = window.setTimeout(() => {
      setPolls((n) => n + 1);
      refresh();
    }, POLL_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [settled, timedOut, loading, polls, refresh]);

  return (
    <>
      <SEO title="Subscription confirmed — VertexED" robots="noindex, nofollow" />

      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-5">
        <section className="w-full rounded-2xl border border-border/60 bg-card/40 p-8 text-center">
          {settled ? (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
              <h1 className="mt-4 text-2xl font-semibold text-foreground">You are all set</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {subscription.isTrialing
                  ? "Your free trial has started. Every study tool is unlocked."
                  : "Your subscription is active. Every study tool is unlocked."}
              </p>
              <Button asChild className="mt-6">
                <Link to="/main">Go to your dashboard</Link>
              </Button>

              {isSimulated && (
                <p className="mt-6 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                  Simulated checkout — no payment was taken and no subscription exists.
                  Local preview only.
                </p>
              )}
            </>
          ) : timedOut ? (
            <>
              <h1 className="text-2xl font-semibold text-foreground">Payment received</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Razorpay is still confirming your subscription. This usually takes a few seconds —
                refresh in a moment. If it persists, contact support and we will sort it out.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/main">Continue to dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" aria-hidden="true" />
              <h1 className="mt-4 text-xl font-semibold text-foreground">Confirming your subscription</h1>
              <p className="mt-2 text-sm text-muted-foreground">This only takes a moment.</p>
            </>
          )}
        </section>
      </div>
    </>
  );
}
