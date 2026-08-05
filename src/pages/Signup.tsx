import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { useAuth } from "@/contexts/AuthContext";
import { trackProductEvent } from "@/lib/productAnalytics.mjs";
import { shouldOfferInvalidInviteRecovery } from "@/lib/signupInviteRecovery";

function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string) {
  return value.length >= 10 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value);
}

function isValidUsername(value: string) {
  return /^[a-zA-Z0-9_.-]{3,20}$/.test(value);
}

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const waitlistInviteToken = searchParams.get("invite")?.trim() || "";
  const hasWaitlistInvite = Boolean(waitlistInviteToken);
  const [useTeamInvite, setUseTeamInvite] = useState(false);
  const isAccountSignup = hasWaitlistInvite || useTeamInvite;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!waitlistInviteToken) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/signup-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validateInvite", waitlistInviteToken }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not verify this approval link.");
        if (!cancelled) setEmail(data.email || "");
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [waitlistInviteToken]);

  const submitWaitlist = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const normalizedEmail = normalizeEmailInput(email);

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, method: "email", website: honeypot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join waitlist.");
      setSuccess(true);
      trackProductEvent("Waitlist Joined", { method: "email" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedEmail = normalizeEmailInput(email);
    const normalizedUsername = username.trim();
    const normalizedInviteCode = inviteCode.trim();

    if (hasWaitlistInvite && !normalizedEmail) {
      setError("This approval link could not be verified. Refresh the page or request a new approval link.");
      setLoading(false);
      return;
    }
    if (useTeamInvite && !isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (useTeamInvite && !normalizedInviteCode) {
      setError("Enter the invite code shared by the VertexED team.");
      setLoading(false);
      return;
    }
    if (!isValidUsername(normalizedUsername)) {
      setError("Choose a username with 3-20 letters, numbers, dots, underscores, or hyphens.");
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
          email: useTeamInvite ? normalizedEmail : undefined,
          password,
          username: normalizedUsername,
          inviteCode: useTeamInvite ? normalizedInviteCode : undefined,
          waitlistInviteToken: hasWaitlistInvite ? waitlistInviteToken : undefined,
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 && data.retryAfter) {
          const mins = Math.max(1, Math.ceil(Number(data.retryAfter) / 60));
          throw new Error(`${data.error || "Too many attempts."} Try again in about ${mins} minute${mins === 1 ? "" : "s"}.`);
        }
        throw new Error(data.error || "Could not create account.");
      }

      await login(normalizedEmail, password);
      trackProductEvent("Account Created", {
        invite_type: hasWaitlistInvite ? "waitlist" : "team",
      });
      sessionStorage.setItem("vertex_welcome", "1");
      navigate("/connect-google", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamInvite = () => {
    setUseTeamInvite((current) => !current);
    setError(null);
    setSuccess(false);
  };

  const recoverFromInvalidInvite = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setInviteCode("");
    setError(null);
    setSuccess(false);
    setUseTeamInvite(false);
    navigate("/signup", { replace: true });
  };

  const loadingLabel = hasWaitlistInvite && !email
    ? "Checking..."
    : isAccountSignup
      ? "Creating..."
      : "Joining...";
  const hasInvalidWaitlistInvite = shouldOfferInvalidInviteRecovery({
    hasWaitlistInvite,
    loading,
    email,
    error,
  });

  return (
    <>
      <Helmet>
        <title>{isAccountSignup ? "Create a VertexED account" : "Join VertexED - waitlist"}</title>
        <meta name="description" content="Join the VertexED private beta or create an account with an invite." />
        <link rel="canonical" href="https://www.vertexed.app/signup" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PageSection className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
        <form className="relative liquid-glass neu-card w-full max-w-md p-8 md:p-10 animate-fade-in" onSubmit={isAccountSignup ? submitInvite : submitWaitlist}>
          <h1 className="text-3xl font-semibold mb-2 text-center text-foreground">
            {isAccountSignup ? "Create your account" : "Join the waitlist"}
          </h1>
          <p className="text-center mb-6 text-sm text-muted-foreground leading-relaxed">
            {!isAccountSignup
              ? "Private beta - join with your email and we'll send an account-creation link when a spot opens."
              : hasWaitlistInvite
                ? email
                  ? <>Your private approval link is active for <span className="font-medium text-foreground">{email}</span>. Choose a username and password.</>
                  : "Checking your private approval link..."
                : "Enter the email and invite code shared by the VertexED team, then choose your account details."}
          </p>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} className="absolute h-0 w-0 opacity-0 pointer-events-none overflow-hidden" />

          {!isAccountSignup && success ? (
            <div className="alert-success text-center" role="status">
              <p className="font-medium mb-2">You're on the list</p>
              <p className="text-sm text-muted-foreground leading-relaxed">We saved <span className="font-medium text-foreground">{normalizeEmailInput(email)}</span>. We'll email you when your spot is ready.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(!isAccountSignup || useTeamInvite) && (
                <div className="neu-input">
                  <input aria-label="Email" placeholder="you@school.edu" className="neu-input-el" value={email} onChange={(event) => setEmail(event.target.value)} type="email" inputMode="email" autoComplete="email" required />
                </div>
              )}
              {useTeamInvite && (
                <div className="neu-input">
                  <input aria-label="Invite code" placeholder="Team invite code" className="neu-input-el" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} type="password" autoComplete="one-time-code" required />
                </div>
              )}
              {isAccountSignup && (
                <>
                  <div className="neu-input">
                    <input aria-label="Username" placeholder="Username (3-20 characters)" className="neu-input-el" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" minLength={3} maxLength={20} pattern="[a-zA-Z0-9_.-]{3,20}" required />
                  </div>
                  <div className="neu-input">
                    <input aria-label="Password" placeholder="Password (10+ chars, upper, lower, number)" className="neu-input-el" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={10} required />
                  </div>
                </>
              )}
              <button className="w-full btn-solid py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed transition" disabled={loading || (hasWaitlistInvite && !email)} type="submit">
                {loading ? loadingLabel : isAccountSignup ? "Create account" : "Join waitlist"}
              </button>
            </div>
          )}

          {!hasWaitlistInvite && !success && (
            <button type="button" onClick={toggleTeamInvite} className="mt-5 w-full text-sm text-primary hover:text-primary/80 underline underline-offset-4">
              {useTeamInvite ? "Join the waitlist instead" : "Have an invite code? Create your account"}
            </button>
          )}

          {error && <div className="mt-4 alert-error text-center" role="alert">{error}</div>}

          {hasInvalidWaitlistInvite && (
            <button type="button" onClick={recoverFromInvalidInvite} className="mt-4 w-full btn-glass py-3 text-center">
              Return to waitlist
            </button>
          )}

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="sketch-underline text-foreground hover:text-primary">Log in</Link>
          </p>
        </form>
      </PageSection>
    </>
  );
}