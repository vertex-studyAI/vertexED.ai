import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { isOnboardingComplete } from "@/lib/onboardingStatus.js";
import { markPasswordRecoveryVerified } from "@/lib/passwordRecovery";
import ResetPassword from "@/pages/ResetPassword";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setError("Auth is disabled: Supabase not configured.");
      return;
    }

    let cancelled = false;
    let completed = false;
    let timeout: number | undefined;
    let unsubscribe: (() => void) | undefined;

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const recoveryHint =
      searchParams.get("recovery") === "1" ||
      searchParams.get("type") === "recovery" ||
      hashParams.get("type") === "recovery";

    const finish = async (
      session: Session,
      event?: AuthChangeEvent,
    ) => {
      if (cancelled || completed) return;
      completed = true;
      if (timeout) window.clearTimeout(timeout);
      unsubscribe?.();

      if (event === "PASSWORD_RECOVERY" || recoveryHint) {
        markPasswordRecoveryVerified();
        // Stay on the already allow-listed callback URL. The reset form performs
        // the password update only after this verified recovery session exists.
        window.history.replaceState({}, document.title, "/auth/callback?recovery=1");
        setRecoveryReady(true);
        return;
      }

      const returnAfterGoogleLink = sessionStorage.getItem("vertex_google_link_return");
      if (returnAfterGoogleLink) {
        sessionStorage.removeItem("vertex_google_link_return");
        navigate(returnAfterGoogleLink, { replace: true });
        return;
      }
      navigate(isOnboardingComplete(session.user) ? "/main" : "/onboarding", { replace: true });
    };

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) void finish(session, event);
    });
    unsubscribe = () => authSubscription.subscription.unsubscribe();

    const run = async () => {
      try {
        const authError =
          searchParams.get("error_description") ||
          searchParams.get("error") ||
          hashParams.get("error_description") ||
          hashParams.get("error");
        if (authError) {
          setError(`Authentication could not be completed: ${authError}`);
          return;
        }
        const code = searchParams.get("code");

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled || completed) return;
          if (exchangeError) {
            setError(exchangeError.message);
            return;
          }
          if (data.session) {
            void finish(data.session);
            return;
          }
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (cancelled || completed) return;
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        if (data.session) {
          void finish(data.session);
          return;
        }

        timeout = window.setTimeout(() => {
          if (!cancelled && !completed) {
            setError(
              recoveryHint
                ? "The password recovery link did not establish a valid session. Request a new link and try again."
                : "Authentication did not return a Supabase session. Check the provider and redirect URLs, then try again.",
            );
          }
        }, 20_000);
      } catch (e: unknown) {
        if (!cancelled && !completed) {
          setError(e instanceof Error ? e.message : "Unexpected error");
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (timeout) clearTimeout(timeout);
    };
  }, [navigate]);

  if (recoveryReady) return <ResetPassword />;

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
              <div className="text-red-400 font-medium mb-2">Authentication error</div>
              <div className="text-sm text-muted-foreground">{error}</div>
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
