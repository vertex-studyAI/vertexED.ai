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
      <section className="glass-panel w-full p-8 text-center">
        <p className="text-sm font-semibold text-primary">Private beta</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Your access is pending</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">We have your request. We will email an account-creation link once it is approved.</p>
      </section>
    </div>
  );
}

function WaitlistRejected() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
      <section className="glass-panel w-full p-8 text-center" role="alert">
        <p className="text-sm font-semibold text-destructive">Private beta</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Access is not approved</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">This account does not currently have beta access. Contact support if you believe this is a mistake.</p>
      </section>
    </div>
  );
}

function WaitlistUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
      <section className="glass-panel w-full p-8 text-center" role="alert">
        <p className="text-sm font-semibold text-amber-500">Connection problem</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">We could not verify your access</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Your access status was not changed. Check your connection and try again.</p>
        <button type="button" className="neu-button mt-5 px-4 py-2" onClick={onRetry}>Try again</button>
      </section>
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: React.JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [access, setAccess] = useState<"checking" | "approved" | "pending" | "rejected" | "unavailable">("checking");
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    if (!user) { setAccess("checking"); return; }
    setAccess("checking");
    // The waitlist backend is intentionally not required during local development,
    // so the product can be tested before Supabase access is available.
    if (import.meta.env.DEV) { setAccess("approved"); return; }
    let active = true;
    void authFetch("/api/waitlist-status")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) setAccess(data.status === "approved" ? "approved" : data.status === "rejected" ? "rejected" : "pending");
      })
      .catch(() => active && setAccess("unavailable"));
    return () => { active = false; };
  }, [user?.id, retryAttempt]);

  if (loading || (user && access === "checking")) return <PageLoader label="Checking your access" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (access === "unavailable") return <WaitlistUnavailable onRetry={() => setRetryAttempt((attempt) => attempt + 1)} />;
  if (access === "rejected") return <WaitlistRejected />;
  if (access === "pending") return <WaitlistPending />;
  const isPreOnboardingRoute = location.pathname === "/connect-google" || location.pathname === "/onboarding";
  if (!isOnboardingComplete(user) && !isPreOnboardingRoute) return <Navigate to="/onboarding" replace />;
  return children;
}
