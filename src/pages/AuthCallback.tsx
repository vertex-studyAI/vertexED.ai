import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError("Auth is disabled: Supabase not configured.");
      return;
    }

    let cancelled = false;
    let timeout: number | undefined;
    let unsubscribe: (() => void) | undefined;

    const finish = (session: Session) => {
      if (cancelled) return;
      const hasUsername = !!session.user.user_metadata?.username;
      navigate(hasUsername ? "/main" : "/onboarding", { replace: true });
    };

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (exchangeError) {
            setError(exchangeError.message);
            return;
          }
          if (data.session) {
            finish(data.session);
            return;
          }
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        if (data.session) {
          finish(data.session);
          return;
        }

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) finish(session);
        });
        unsubscribe = () => sub.subscription.unsubscribe();

        timeout = window.setTimeout(() => {
          if (!cancelled) setError("Could not complete sign-in. Please try again.");
        }, 8000);
      } catch (e: unknown) {
        if (!cancelled) {
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

  return (
    <>
      <Helmet>
        <title>Signing you in…</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="neu-card max-w-md w-full p-8 text-center">
          {!error ? (
            <>
              <div className="animate-pulse text-muted-foreground">Finalising sign-in…</div>
              <div className="text-xs text-muted-foreground mt-2">Please wait a moment.</div>
            </>
          ) : (
            <>
              <div className="text-red-400 font-medium mb-2">Sign-in error</div>
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
