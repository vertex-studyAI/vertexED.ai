import type React from 'react';
import { Navigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/apiAuth";
import { isOnboardingComplete } from "@/lib/onboardingStatus.js";
import PageLoader from "@/components/PageLoader";

function WaitlistPending() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
      <section
        className="glass-panel w-full p-8 text-center"
        role="status"
        aria-labelledby="waitlist-pending-title"
        aria-describedby="waitlist-pending-description"
      >
        <p className="text-sm font-semibold text-primary">Private beta</p>
        <h1 id="waitlist-pending-title" className="mt-2 text-2xl font-semibold text-foreground">
          Your access is pending
        </h1>
        <p id="waitlist-pending-description" className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We have your request. We will email an account-creation link once it is approved.
        </p>
      </section>
    </div>
  );
}

function WaitlistRejected() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
      <section
        className="glass-panel w-full p-8 text-center"
        role="alert"
        aria-labelledby="waitlist-rejected-title"
        aria-describedby="waitlist-rejected-description"
      >
        <p className="text-sm font-semibold text-destructive">Private beta</p>
        <h1 id="waitlist-rejected-title" className="mt-2 text-2xl font-semibold text-foreground">
          Access is not approved
        </h1>
        <p id="waitlist-rejected-description" className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This account does not currently have beta access. Contact support if you believe this is a mistake.
        </p>
      </section>
    </div>
  );
}

function WaitlistUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
      <section
        className="glass-panel w-full p-8 text-center"
        role="alert"
        aria-labelledby="waitlist-unavailable-title"
        aria-describedby="waitlist-unavailable-description"
      >
        <p className="text-sm font-semibold text-amber-500">Connection problem</p>
        <h1 id="waitlist-unavailable-title" className="mt-2 text-2xl font-semibold text-foreground">
          We could not verify your access
        </h1>
        <p id="waitlist-unavailable-description" className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You are signed in, but the access service could not confirm your beta approval. Your access status was not changed. Try again or contact support if this continues.
        </p>
        <button type="button" className="neu-button mt-5 px-4 py-2" onClick={onRetry}>Try again</button>
      </section>
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: React.JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [access, setAccess] = useState<"checking" | "approved" | "pending" | "rejected" | "unavailable">("checking");
  const [accessUserId, setAccessUserId] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    if (!user) {
      setAccess("checking");
      setAccessUserId(null);
      return;
    }
    setAccess("checking");
    // Local waitlist bypass is opt-in only — never automatic for any DEV bundle.
    if (import.meta.env.DEV && import.meta.env.VITE_SKIP_WAITLIST_GATE === '1') {
      setAccess("approved");
      setAccessUserId(user.id);
      return;
    }
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    void authFetch("/api/waitlist-status", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) {
          setAccess(data.status === "approved" ? "approved" : data.status === "pending" ? "pending" : "rejected");
          setAccessUserId(user.id);
        }
      })
      .catch(() => {
        if (active) {
          setAccess("unavailable");
          setAccessUserId(user.id);
        }
      })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [user, retryAttempt]);

  const accessDecisionIsCurrent = Boolean(user && accessUserId === user.id);

  if (loading || (user && (!accessDecisionIsCurrent || access === "checking"))) return <PageLoader label="Checking your access" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (access === "unavailable") return <WaitlistUnavailable onRetry={() => setRetryAttempt((attempt) => attempt + 1)} />;
  if (access === "rejected") return <WaitlistRejected />;
  if (access === "pending") return <WaitlistPending />;
  const isPreOnboardingRoute = location.pathname === "/connect-google" || location.pathname === "/onboarding";
  if (!isOnboardingComplete(user) && !isPreOnboardingRoute) return <Navigate to="/onboarding" replace />;
  return children;
}
