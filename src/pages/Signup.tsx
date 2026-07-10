import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase();
}

type Mode = "waitlist" | "invite";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("waitlist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitWaitlist = async (e: React.FormEvent) => {
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
      if (!res.ok) throw new Error(data.error || "Failed to join waitlist");
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedEmail = normalizeEmailInput(email);
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (!inviteCode.trim()) {
      setError("Enter your invite code.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/signup-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          inviteCode: inviteCode.trim(),
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create account");

      await login(normalizedEmail, password);
      sessionStorage.setItem("vertex_welcome", "1");
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Vertex — Join or create account</title>
        <meta name="description" content="Join the Vertex waitlist or create an account with an invite code." />
        <link rel="canonical" href="https://www.vertexed.app/signup" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PageSection className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
        <form
          className="relative liquid-glass neu-card w-full max-w-md p-8 md:p-10 animate-fade-in"
          onSubmit={mode === "waitlist" ? submitWaitlist : submitInvite}
        >
          <div className="flex rounded-full border border-border/60 bg-foreground/[0.04] p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("waitlist"); setError(null); setSuccess(false); }}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-medium transition",
                mode === "waitlist" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Waitlist
            </button>
            <button
              type="button"
              onClick={() => { setMode("invite"); setError(null); setSuccess(false); }}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-medium transition",
                mode === "invite" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Invite signup
            </button>
          </div>

          <h1 className="text-3xl font-semibold mb-2 text-center text-foreground">
            {mode === "waitlist" ? "Join the waitlist" : "Create your account"}
          </h1>
          <p className="text-center mb-6 text-sm text-muted-foreground leading-relaxed">
            {mode === "waitlist"
              ? "We're in private beta. Join the list and we'll email you when a spot opens — no account yet."
              : "Got an invite code from the team? You'll be in immediately — no waiting on email."}
          </p>

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

          {mode === "waitlist" && success ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-5 text-center">
              <p className="text-emerald-600 dark:text-emerald-300 font-medium mb-2">You&apos;re on the list</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We saved <span className="font-medium text-foreground">{normalizeEmailInput(email)}</span>.
                We&apos;ll email you when your spot is ready.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mode === "invite" && (
                <div className="neu-input">
                  <input
                    aria-label="Invite code"
                    placeholder="Invite code"
                    className="neu-input-el"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              )}
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
              {mode === "invite" && (
                <div className="neu-input">
                  <input
                    aria-label="Password"
                    placeholder="Password (8+ characters)"
                    className="neu-input-el"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              )}
              <button
                className="w-full btn-solid py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    {mode === "waitlist" ? "Joining…" : "Creating…"}
                  </span>
                ) : mode === "waitlist" ? (
                  "Join waitlist"
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-center text-sm text-red-600 dark:text-red-200">
              {error}
            </div>
          )}

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="sketch-underline text-foreground hover:text-primary">
              Log in
            </Link>
          </p>
        </form>
      </PageSection>
    </>
  );
}
