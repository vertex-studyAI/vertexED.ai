import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeout: number | undefined;
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
        const go = (toMainIfOnboarded = true) => {
          const u = supabase.auth.getUser ? undefined : undefined; // placeholder to satisfy lints where needed
        };

        if (data.session) {
          const md = data.session.user.user_metadata;
          const hasUsername = !!md?.username;
          navigate(hasUsername ? "/main" : "/onboarding", { replace: true });
          return;
        }

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            const hasUsername = !!session.user.user_metadata?.username;
            navigate(hasUsername ? "/main" : "/onboarding", { replace: true });
          }
        });
        // Fallback timeout to show error after a few seconds
        // @ts-ignore - window.setTimeout typing

        timeout = window.setTimeout(() => {
          sub.subscription.unsubscribe();
          setError("Could not complete sign-in. Please try again.");
        }, 6000);
        return () => sub.subscription.unsubscribe();
      } catch (e: any) {
        setError(e.message || "Unexpected error");
      }
    };
    run();
    return () => {
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
