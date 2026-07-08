import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase();
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
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
      <PageSection className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
        <form
          className="relative neu-card w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 animate-fade-in"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            const normalizedEmail = normalizeEmailInput(email);
            if (!normalizedEmail) {
              setError("Please enter your email address.");
              setLoading(false);
              return;
            }

            try {
              const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalizedEmail, website: honeypot }),
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
          <h1 className="text-3xl font-semibold mb-2 text-center text-white">Join the Waitlist</h1>
          <p className="text-center mb-4 text-sm opacity-80">
            Vertex is in private beta. Joining the waitlist does <strong>not</strong> create an account — we&apos;ll email you when you can sign up.
          </p>
          <p className="text-center mb-6 text-sm opacity-80">
            Optional:{" "}
            <a
              href="https://tally.so/r/ODD6b8"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-100 transition"
            >
              tell us more about yourself
            </a>
            .
          </p>

          {!success ? (
            <div className="space-y-4">
              {/* Honeypot — hidden from users, catches basic bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute h-0 w-0 opacity-0 pointer-events-none overflow-hidden"
              />
              <div className="neu-input">
                <input
                  aria-label="Email"
                  placeholder="you@school.edu"
                  className="neu-input-el"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                />
              </div>
              <button className="w-full neu-button py-3 mt-2" disabled={loading} type="submit">
                {loading ? "Joining..." : "Join Waitlist"}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-emerald-500 font-medium mb-2">You&apos;re on the list!</p>
              <p className="text-sm opacity-80">
                We&apos;ve saved <span className="font-medium text-white/90">{normalizeEmailInput(email)}</span>. We&apos;ll email you when your spot is ready — no account has been created yet.
              </p>
            </div>
          )}

          {error && <p className="text-center mt-4 text-sm text-red-500">{error}</p>}

          <p className="text-center mt-6 text-sm opacity-80">
            Already invited and have an account?{" "}
            <Link to="/login" className="sketch-underline">
              Log in
            </Link>
          </p>
        </form>
      </PageSection>
    </>
  );
}
