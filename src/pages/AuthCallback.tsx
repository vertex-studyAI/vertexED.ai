import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase, authRecoveryEvent } from "@/lib/supabaseClient";
import { isOnboardingComplete } from "@/lib/onboardingStatus.js";
import { isVerifiedInviteSession } from "@/lib/inviteAcceptance.mjs";
import { markPasswordRecoveryVerified } from "@/lib/passwordRecovery";
import { consumeGoogleLinkReturn } from "@/lib/authReturn.mjs";
import ResetPassword from "@/pages/ResetPassword";
import SetInitialPassword from "@/pages/SetInitialPassword";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [inviteReady, setInviteReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let completed = false;
    let initializationChecked = false;
    let pendingAuthEvent: { session: Session; event: AuthChangeEvent } | undefined;
    let timeout: number | undefined;
    const unsubscribeRef: { current?: () => void } = {};

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const recoveryHint =
      searchParams.get("recovery") === "1" ||
      searchParams.get("type") === "recovery" ||
      hashParams.get("type") === "recovery";
    const inviteHint =
      searchParams.get("invite") === "1" ||
      searchParams.get("type") === "invite" ||
      hashParams.get("type") === "invite";

    // OAuth codes, provider errors, and access tokens must not remain in browser
    // history while the callback performs network work or renders an error.
    const safeCallbackPath = recoveryHint
      ? "/auth/callback?recovery=1"
      : inviteHint
        ? "/auth/callback?invite=1"
        : "/auth/callback";
    window.history.replaceState({}, document.title, safeCallbackPath);

    if (!supabase) {
      setError("Sign-in is unavailable because this deployment is missing its authentication configuration.");
      return;
    }

    if (recoveryHint && inviteHint) {
      setError("This authentication link contains conflicting account actions. Request a fresh link and try again.");
      return;
    }

    const authError = ["error", "error_code", "error_description"].some(
      key => searchParams.has(key) || hashParams.has(key),
    );
    // Fail before subscribing: an existing cached session must not turn a
    // rejected provider return into an apparent successful sign-in.
    if (authError) {
      setError("Authentication could not be completed. Return to login and try again.");
      return;
    }

    const clearCallbackTimeout = () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
        timeout = undefined;
      }
    };

    const fail = (message: string) => {
      if (cancelled || completed) return;
      completed = true;
      clearCallbackTimeout();
      unsubscribeRef.current?.();
      setError(message);
    };

    const armCallbackTimeout = (message: string) => {
      clearCallbackTimeout();
      timeout = window.setTimeout(() => {
        fail(message);
      }, 20_000);
    };

    // The deadline covers initialization AND exchange/getSession, including a
    // stalled network request. Late responses cannot navigate after failure.
    armCallbackTimeout("Sign-in took too long. Return to login and try again when your connection is available.");

    const finish = (
      session: Session,
      event?: AuthChangeEvent,
    ) => {
      if (cancelled || completed) return;

      // A recovery query/hash marker is only routing context. It is user-controlled
      // and must never authorize a password change by itself. Supabase emits the
      // PASSWORD_RECOVERY event for a genuine recovery link, so ignore ordinary
      // INITIAL_SESSION/SIGNED_IN events while a recovery callback is pending.
      if (recoveryHint && event !== "PASSWORD_RECOVERY") return;

      if (inviteHint) {
        // The invite query/hash marker is also user-controlled. Require the
        // authenticated Supabase user to carry both invitation provenance and a
        // confirmed email before exposing initial-password setup.
        if (!isVerifiedInviteSession(session.user)) {
          completed = true;
          clearCallbackTimeout();
          unsubscribeRef.current?.();
          setError("This session was not established from a verified account invitation. Open the invitation from your email.");
          return;
        }

        completed = true;
        clearCallbackTimeout();
        unsubscribeRef.current?.();
        window.history.replaceState({}, document.title, "/auth/callback?invite=1");
        setInviteReady(true);
        return;
      }

      completed = true;
      clearCallbackTimeout();
      unsubscribeRef.current?.();

      if (event === "PASSWORD_RECOVERY") {
        try {
          markPasswordRecoveryVerified(session.user.id);
        } catch {
          setError("Your browser could not keep this password reset session. Allow site storage, then request a new link.");
          return;
        }
        window.history.replaceState({}, document.title, "/auth/callback?recovery=1");
        setRecoveryReady(true);
        return;
      }

      // Getting the storage object itself can also throw in restricted browsers.
      let returnAfterGoogleLink: string | null = null;
      try { returnAfterGoogleLink = consumeGoogleLinkReturn(window.sessionStorage); } catch { /* use normal destination */ }
      if (returnAfterGoogleLink) {
        navigate(returnAfterGoogleLink, { replace: true });
        return;
      }
      navigate(isOnboardingComplete(session.user) ? "/main" : "/onboarding", { replace: true });
    };

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return;
      if (!initializationChecked) {
        // Preserve PASSWORD_RECOVERY if INITIAL_SESSION follows it.
        if (pendingAuthEvent?.event !== "PASSWORD_RECOVERY") pendingAuthEvent = { session, event };
        return;
      }
      finish(session, event);
    });
    unsubscribeRef.current = () => authSubscription.subscription.unsubscribe();

    const run = async () => {
      try {
        const code = searchParams.get("code");

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled || completed) return;
          if (exchangeError) {
            fail("The authentication link could not be verified. Return to login and try again.");
            return;
          }
          initializationChecked = true;
          if (pendingAuthEvent?.event === "PASSWORD_RECOVERY") finish(pendingAuthEvent.session, pendingAuthEvent.event);
          if (completed) return;
          if (data.session && !recoveryHint) {
            void finish(data.session);
            return;
          }
          if (recoveryHint) {
            armCallbackTimeout(
              "The password recovery link did not establish a verified recovery session. Request a new link and try again.",
            );
            return;
          }
        } else {
          // getSession alone hides errors from SDK URL initialization (for
          // example an expired implicit token returned to the site's root).
          const { error: initializationError } = await supabase.auth.initialize();
          if (cancelled || completed) return;
          if (initializationError) {
            fail("The authentication link could not be verified. Return to login and try again.");
            return;
          }
          initializationChecked = true;
          if (pendingAuthEvent) finish(pendingAuthEvent.session, pendingAuthEvent.event);
          if (completed) return;
        }

        if (recoveryHint) {
          const { data: recoveryData } = await supabase.auth.getSession();
          if (cancelled || completed) return;
          if (recoveryData.session && authRecoveryEvent.consume(recoveryData.session.user.id)) {
            finish(recoveryData.session, "PASSWORD_RECOVERY");
            return;
          }
          armCallbackTimeout(
            "The password recovery link did not establish a verified recovery session. Request a new link and try again.",
          );
          return;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (cancelled || completed) return;
        if (sessionError) {
          fail("Your authenticated session could not be verified. Return to login and try again.");
          return;
        }
        if (data.session) {
          void finish(data.session);
          return;
        }

        armCallbackTimeout(
          inviteHint
            ? "The account invitation did not establish a verified Supabase session. Open a fresh invitation from your email."
            : "Authentication did not return a Supabase session. Check the provider and redirect URLs, then try again.",
        );
      } catch (e: unknown) {
        if (!cancelled && !completed) {
          fail("Authentication could not be completed. Return to login and try again.");
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      clearCallbackTimeout();
    };
  }, [navigate]);

  if (recoveryReady) return <ResetPassword />;
  if (inviteReady) return <SetInitialPassword />;

  return (
    <>
      <Helmet>
        <title>Completing authentication…</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="neu-card max-w-md w-full p-8 text-center">
          {!error ? (
            <>
              <div className="animate-pulse text-muted-foreground">Finalising authentication…</div>
              <div className="text-xs text-muted-foreground mt-2">Please wait a moment.</div>
            </>
          ) : (
            <>
              <h1 className="text-xl text-foreground font-semibold mb-3">Authentication error</h1>
              <div role="alert" className="text-base text-muted-foreground">{error}</div>
              <button
                type="button"
                className="neu-button mt-4 px-4 py-2"
                onClick={() => navigate("/login")}
              >
                Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
