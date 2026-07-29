import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchSubscriptionStatus,
  devSubscriptionStatus,
  INACTIVE_SUBSCRIPTION,
  type SubscriptionStatus,
} from "@/lib/billing";

type UseSubscription = {
  subscription: SubscriptionStatus;
  /** True while the first check is in flight — gate on this to avoid a paywall flash. */
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Reads subscription state from /api/billing-status.
 *
 * This drives the UI only. Every premium API route re-checks the subscription
 * server-side, so tampering with this in the browser unlocks nothing.
 */
export function useSubscription(): UseSubscription {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>(INACTIVE_SUBSCRIPTION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  // Keep the dev toggle on /pricing in sync across mounted components.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const onChange = () => refresh();
    window.addEventListener("vertex:dev-subscription-changed", onChange);
    return () => window.removeEventListener("vertex:dev-subscription-changed", onChange);
  }, [refresh]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Signed out in local dev means Supabase is simply not configured yet, so
      // honour the dev toggle instead of hard-locking the preview.
      setSubscription(import.meta.env.DEV ? devSubscriptionStatus() : INACTIVE_SUBSCRIPTION);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    fetchSubscriptionStatus()
      .then((status) => {
        if (active) {
          setSubscription(status);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!active) return;
        // A fresh clone has no backend running; fall back to the local toggle so
        // both sides of the paywall are previewable. Never do this in production.
        if (import.meta.env.DEV) {
          setSubscription(devSubscriptionStatus());
          setError(null);
          return;
        }
        setSubscription(INACTIVE_SUBSCRIPTION);
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id, authLoading, nonce]);

  return { subscription, loading, error, refresh };
}
