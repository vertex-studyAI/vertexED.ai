import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeout: number | undefined;
    let unsub: (() => void) | null = null;
    let active = true;

    const run = async () => {
      try {
        if (!supabase) {
          setError("Auth is disabled: Supabase not configured.");
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError(error.message);
          return;
        }

        const go = (sessionUser: { user_metadata?: { username?: string } } | null | undefined) => {
          const hasUsername = !!sessionUser?.user_metadata?.username;
          navigate(hasUsername ? "/main" : "/onboarding", { replace: true });
        };

        if (data.session) {
          go(data.session.user);
          return;
        }

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!active || !session) return;
          go(session.user);
        });

        unsub = () => sub.subscription.unsubscribe();

        timeout = window.setTimeout(() => {
          if (unsub) unsub();
          setError("Could not complete sign-in. Please try again.");
        }, 6000);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      }
    };

    run();

    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
      if (unsub) unsub();
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
              <div className="animate-pulse text-slate-300">Finalising sign-in…</div>
              <div className="text-xs text-slate-500 mt-2">Please wait a moment.</div>
            </>
          ) : (
            <>
              <div className="text-red-400 font-medium mb-2">Sign-in error</div>
              <div className="text-sm text-slate-300">{error}</div>
              <button
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
