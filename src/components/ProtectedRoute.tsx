import type React from 'react';
import { Link, Navigate, useLocation } from "react-router";
import { useContext, useEffect, useState } from "react";
import { BetaAccessDisplayContext } from '@/contexts/BetaAccessDisplayContext';
import { PUBLIC_INTAKE_ROUTES } from '@/lib/intakeRoutes.mjs';
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/apiAuth";
import { isOnboardingComplete } from "@/lib/onboardingStatus.js";
import PageLoader from "@/components/PageLoader";
import '@/styles/beta-access.css';
import { accessFailureMessage, accessStateFromResponse, requestAccessJson } from '@/lib/accessRequest.mjs';

function AccessActions() {
  return <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
    <Link className="inline-flex min-h-11 items-center text-primary underline" to="/user-settings">Account and data controls</Link>
    <a className="inline-flex min-h-11 items-center text-primary underline" href={PUBLIC_INTAKE_ROUTES.support}>Contact support</a>
  </div>;
}

function WaitlistPending() {
  return (
    <div className="beta-access-state mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
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
          We have your request. We will email you when your beta access is approved.
        </p>
        <AccessActions />
      </section>
    </div>
  );
}

function WaitlistRejected() {
  return (
    <div className="beta-access-state mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
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
        <AccessActions />
      </section>
    </div>
  );
}

function WaitlistUnavailable({ onRetry, message, retrySeconds }: { onRetry: () => void; message: string; retrySeconds: number }) {
  return (
    <div className="beta-access-state mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
      <section
        className="glass-panel w-full p-8 text-center"
        role="alert"
        aria-labelledby="waitlist-unavailable-title"
        aria-describedby="waitlist-unavailable-description"
      >
        <p className="text-sm font-semibold text-primary">Access check unavailable</p>
        <h1 id="waitlist-unavailable-title" className="mt-2 text-2xl font-semibold text-foreground">
          We could not verify your access
        </h1>
        <p id="waitlist-unavailable-description" className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <button type="button" className="neu-button mt-5 min-h-11 px-4 py-2 disabled:opacity-60" disabled={retrySeconds > 0} onClick={onRetry}>{retrySeconds > 0 ? `Try again in ${retrySeconds}s` : 'Try again'}</button>
        <AccessActions />
      </section>
    </div>
  );
}

export default function ProtectedRoute({ children, accountControls = false }: { children: React.JSX.Element; accountControls?: boolean }) {
  const setAccessPanelVisible = useContext(BetaAccessDisplayContext);
  const { user, session, loading } = useAuth();
  const location = useLocation();
  const userId = user?.id;
  const [access, setAccess] = useState('checking');
  const [accessUserId, setAccessUserId] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [failureMessage, setFailureMessage] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(Date.now);
  const retrySeconds = Math.max(0, Math.ceil((retryAt - now) / 1000));

  useEffect(() => {
    if (!retryAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  useEffect(() => {
    if (!userId || accountControls) {
      setAccess("checking");
      setAccessUserId(null);
      return;
    }
    setAccess(previous => previous === 'approved' ? previous : 'checking');
    // Local waitlist bypass is opt-in only — never automatic for any DEV bundle.
    if (import.meta.env.DEV && import.meta.env.VITE_SKIP_WAITLIST_GATE === '1') {
      setAccess("approved");
      setAccessUserId(userId);
      return;
    }
    let active = true;
    const controller = new AbortController();
    let refreshTimer: number | undefined;
    let refreshAllowed = false;
    let nextCheckAt = Date.now() + 60_000;
    const refreshWhenVisible = () => {
      if (refreshAllowed && document.visibilityState === 'visible' && Date.now() >= nextCheckAt) {
        nextCheckAt = Infinity;
        setRetryAttempt(attempt => attempt + 1);
      }
    };
    void requestAccessJson("/api/waitlist-status", { signal: controller.signal }, { fetcher: authFetch })
      .then((data) => {
        if (active) {
          const next = accessStateFromResponse(data);
          setAccess(next);
          setFailureMessage(accessFailureMessage(null));
          setAccessUserId(userId);
          setRetryAt(0);
          // Recheck long-lived product screens. A revoked membership must not
          // remain approved until the next navigation. No retries on outages.
          if (next === 'approved') {
            refreshAllowed = true;
            refreshTimer = window.setTimeout(refreshWhenVisible, 60_000);
          }
        }
      })
      .catch((error) => {
        if (active) {
          setAccess(error.kind === 'session' ? 'signed_out' : 'unavailable');
          setFailureMessage(accessFailureMessage(error));
          setNow(Date.now());
          setRetryAt(Date.now() + (error.retryAfter || 0) * 1000);
          setAccessUserId(userId);
        }
      });
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => { active = false; controller.abort(); window.clearTimeout(refreshTimer); document.removeEventListener('visibilitychange', refreshWhenVisible); };
  }, [userId, session?.access_token, retryAttempt, accountControls]);

  const accessDecisionIsCurrent = Boolean(user && accessUserId === user.id);
  const accessPanelVisible = Boolean(user && !accountControls && accessDecisionIsCurrent && !['checking', 'approved'].includes(access));
  useEffect(() => {
    setAccessPanelVisible(accessPanelVisible);
    return () => setAccessPanelVisible(false);
  }, [accessPanelVisible, setAccessPanelVisible]);

  if (loading) return <PageLoader label="Checking your access" />;
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  // Account export/deletion and logout stay reachable without product approval.
  if (accountControls) return children;
  if (!accessDecisionIsCurrent || access === 'checking') return <PageLoader label="Checking your access" />;
  if (access === "unavailable") return <WaitlistUnavailable message={failureMessage} retrySeconds={retrySeconds} onRetry={() => { if (Date.now() >= retryAt) setRetryAttempt(attempt => attempt + 1); }} />;
  if (access === "denied") return <WaitlistRejected />;
  if (access === "pending") return <WaitlistPending />;
  if (access === 'verification_required' || access === 'signed_out') return <div className="beta-access-state mx-auto flex min-h-[55vh] max-w-lg items-center px-5"><section className="glass-panel w-full p-8 text-center" role="status" aria-labelledby="access-verification-title">
    <h1 id="access-verification-title" className="text-2xl font-semibold">{access === 'signed_out' ? 'Sign in again' : 'Verify your email'}</h1>
    <p className="mt-3 text-sm text-muted-foreground">{access === 'signed_out' ? failureMessage : 'Open the secure link in your invitation email. Email verification and beta approval are separate steps.'}</p>
    <Link className="neu-button mt-5 inline-flex min-h-11 items-center px-4 py-2" to="/login">Go to sign in</Link>
    <AccessActions />
  </section></div>;
  const isPreOnboardingRoute = location.pathname === "/connect-google" || location.pathname === "/onboarding";
  if (!isOnboardingComplete(user) && !isPreOnboardingRoute) return <Navigate to="/onboarding" replace />;
  return children;
}
