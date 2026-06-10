import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";

export default function Signup() {
  const { loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <>
      <Helmet>
        <title>VertexED — Join Waitlist</title>
        <meta name="description" content="Join the waitlist for Vertex to unlock the AI-powered study toolkit." />
        <link rel="canonical" href="https://www.vertexed.app/signup" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="grid min-h-[78vh] place-items-center px-4 py-10" surface="none">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
            <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
              Private beta
            </div>
            <h1 className="text-4xl font-semibold tracking-tight brand-text-gradient">
              Join the Vertex waitlist
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
              We are opening access in stages. Leave your email and get notified when a spot opens up.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-white/75 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                Early access to new tools
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                Study workflow updates
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                Adaptive account memory
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                One workspace, end to end
              </div>
            </div>

            <p className="mt-6 text-sm text-white/55">
              Want to share more context?{" "}
              <a
                href="https://tally.so/r/ODD6b8"
                target="_blank"
                rel="noopener noreferrer"
                className="sketch-underline text-white/85"
              >
                Tell us what you need
              </a>
            </p>
          </div>

          <form
            className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-transparent p-6 md:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const res = await fetch("/api/waitlist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });

                const data = await res.json();

                if (!res.ok) {
                  throw new Error(data.error || "Failed to join waitlist");
                }

                setSuccess(true);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            <h2 className="text-2xl font-semibold text-white">Get notified</h2>
            <p className="mt-2 text-sm text-white/60">Drop your email and we’ll keep you posted.</p>

            {!success ? (
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={async () => {
                    setGoogleLoading(true);
                    setError(null);
                    track("signup_google_click");
                    try {
                      await loginWithGoogle();
                    } catch (err) {
                      setError((err as Error).message);
                    } finally {
                      setGoogleLoading(false);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
                  aria-label="Continue with Google"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 31.18 29.197 34 24 34c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.058 0 5.842 1.153 7.961 3.039l5.657-5.657C33.643 4.346 29.084 2 24 2 12.955 2 4 10.955 4 22s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.312 16.019 18.78 14 24 14c3.058 0 5.842 1.153 7.961 3.039l5.657-5.657C33.643 4.346 29.084 2 24 2 16.318 2 9.656 6.337 6.306 14.691z"/>
                    <path fill="#4CAF50" d="M24 42c5.138 0 9.642-1.977 12.999-5.184l-5.999-4.999C29.86 33.876 27.08 35 24 35c-5.174 0-9.571-3.291-11.15-7.889l-6.57 5.061C9.607 37.556 16.227 42 24 42z"/>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.363 3.18-5.768 6-11.303 6-5.174 0-9.571-3.291-11.15-7.889l-6.57 5.061C9.607 37.556 16.227 42 24 42c8.822 0 16.245-5.987 18.611-14.083.563-1.953.889-4.028.889-6.083 0-1.341-.138-2.651-.389-3.917z"/>
                  </svg>
                  <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
                </button>

                <div className="relative py-1 text-center text-xs uppercase tracking-[0.2em] text-white/35">
                  <span className="relative z-10 bg-[hsl(var(--background))] px-3">or join the waitlist</span>
                  <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Email</span>
                  <input
                    aria-label="Email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                  />
                </label>

                <button
                  className="w-full rounded-full px-4 py-3 text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Joining…" : "Join waitlist"}
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center">
                <p className="font-medium text-emerald-100">You are on the list.</p>
                <p className="mt-2 text-sm text-emerald-50/80">
                  We have added you to the waitlist and will email you as soon as a spot opens up.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <p className="mt-6 text-center text-sm text-white/60">
              Already have an account?{" "}
              <Link to="/login" className="sketch-underline text-white/85">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </PageSection>
    </>
  );
}
