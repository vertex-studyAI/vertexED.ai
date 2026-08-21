import { useEffect, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router";
import PageSection from "@/components/PageSection";
import { isVerifiedInviteSession, validateInitialPassword } from "@/lib/inviteAcceptance.mjs";
import { supabase } from "@/lib/supabaseClient";

export default function SetInitialPassword() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const verifyInviteSession = async () => {
      if (!supabase) {
        setError("Account invitation is unavailable — auth is not configured.");
        setChecking(false);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError || !data.session) {
        setError(sessionError?.message || "This invitation session has expired. Open a fresh invite from your email.");
        setChecking(false);
        return;
      }

      if (!isVerifiedInviteSession(data.session.user)) {
        setError("Open the account invitation from your email to choose a password.");
        setChecking(false);
        return;
      }

      setAuthorized(true);
      setChecking(false);
    };

    void verifyInviteSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!authorized || !supabase) {
      setError("Open a fresh account invitation from your email to continue.");
      return;
    }

    const passwordCheck = validateInitialPassword(password);
    if (!passwordCheck.ok) {
      setError(passwordCheck.error);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      sessionStorage.setItem("vertex_welcome", "1");
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set your password. Open a fresh invite and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Finish account setup — VertexED</title>
        <meta name="description" content="Finish your verified VertexED invitation by choosing a password." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="relative min-h-[70vh] flex items-center justify-center px-4">
        <div className="relative glass-panel w-full max-w-md p-8 md:p-10">
          <h1 className="text-3xl font-semibold mb-2 text-center text-foreground">Finish account setup</h1>

          {checking ? (
            <div className="mt-6 text-center" role="status" aria-live="polite">
              <div className="animate-pulse text-muted-foreground">Verifying invitation…</div>
            </div>
          ) : authorized ? (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Your email is verified. Choose the password you will use to sign in to VertexED.
              </p>
              <div className="neu-input">
                <input
                  type="password"
                  autoComplete="new-password"
                  aria-label="New password"
                  placeholder="Password (10+ chars, upper, lower, number)"
                  className="neu-input-el"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={saving}
                  minLength={10}
                  required
                />
              </div>
              <div className="neu-input">
                <input
                  type="password"
                  autoComplete="new-password"
                  aria-label="Confirm new password"
                  placeholder="Confirm password"
                  className="neu-input-el"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={saving}
                  minLength={10}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full neu-button py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? "Finishing setup…" : "Set password and continue"}
              </button>
            </form>
          ) : null}

          {error && <div className="mt-5 alert-error text-center" role="alert">{error}</div>}

          {!authorized && !checking && (
            <button type="button" className="neu-button mt-5 w-full px-4 py-3" onClick={() => navigate("/login")}>
              Back to login
            </button>
          )}
        </div>
      </PageSection>
    </>
  );
}
