import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <>
      <Helmet>
        <title>Vertex — Join Waitlist</title>
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
