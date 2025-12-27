import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
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

        const handleSession = async (session: any) => {
            // Check for invite/recovery flow
            const hash = window.location.hash;
            if (hash && (hash.includes("type=invite") || hash.includes("type=recovery"))) {
                navigate("/update-password", { replace: true });
                return;
            }

            // Check access via API
            try {
                const res = await fetch('/api/check-access', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: session.access_token })
                });
                
                if (!res.ok) {
                    throw new Error('Failed to verify access');
                }

                const result = await res.json();
                if (!result.allowed) {
                    await supabase.auth.signOut();
                    setError("You are not on the invite list. Please join the waitlist.");
                    setTimeout(() => navigate("/"), 3000);
                    return;
                }

                const md = session.user.user_metadata;
                const hasUsername = !!md?.username;
                navigate(hasUsername ? "/main" : "/onboarding", { replace: true });

            } catch (err: any) {
                console.error(err);
                setError("Error verifying access. Please try again.");
            }
        };

        if (data.session) {
          await handleSession(data.session);
          return;
        }

        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session) {
            await handleSession(session);
          }
        });

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
  }, [navigate, location]);

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
