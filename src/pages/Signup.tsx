import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string) {
  return (
    value.length >= 10 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value)
  );
}

type Mode = "waitlist" | "invite";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const waitlistInviteToken = searchParams.get("invite")?.trim() || "";
  const [mode, setMode] = useState<Mode>(() => (waitlistInviteToken ? "invite" : "waitlist"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (waitlistInviteToken) {
      setMode("invite");
      setSuccess(false);
    }
  }, [waitlistInviteToken]);

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
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
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
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Password must be at least 10 characters and include uppercase, lowercase, and a number.");
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
          inviteCode: inviteCode.trim() || undefined,
          waitlistInviteToken: waitlistInviteToken || undefined,
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
        <title>Join VertexED — waitlist or invite</title>
        <meta name="description" content="Join the VertexED waitlist for private beta access, or create an account with a team invite code." />
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
              ? "Private beta — join the waitlist and we'll email when a spot opens. No account is created until you're approved."
              : waitlistInviteToken
                ? "Your private invite link is active. Use the same email we approved and choose a password."
                : "Approved on the waitlist? Create your account with that email. Have a team invite code? Enter it below to skip the waitlist."}
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
            <div className="alert-success text-center" role="status">
              <p className="font-medium mb-2">You&apos;re on the list</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We saved <span className="font-medium text-foreground">{normalizeEmailInput(email)}</span>.
                We&apos;ll email you when your spot is ready.
              </p>
              <button
                type="button"
                className="btn-glass text-sm mt-4 px-4 py-2"
                onClick={() => {
                  setMode("invite");
                  setSuccess(false);
                  setError(null);
                }}
              >
                Already approved? Create account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mode === "invite" && (
                <div className="neu-input">
                  <input
                    aria-label="Invite code (optional if waitlist approved)"
                    placeholder="Invite code (optional if waitlist approved)"
                    className="neu-input-el"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    autoComplete="off"
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
                    placeholder="Password (10+ chars, upper, lower, number)"
                    className="neu-input-el"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
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
            <div className="mt-4 alert-error text-center" role="alert">
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
