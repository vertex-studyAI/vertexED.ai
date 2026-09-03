import { useEffect, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import PageSection from "@/components/PageSection";
import {
  clearPasswordRecoveryMarker,
  hasVerifiedPasswordRecovery,
} from "@/lib/passwordRecovery";
import { validateAccountPassword } from "@/lib/passwordPolicy.mjs";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifyRecoverySession = async () => {
      if (!supabase) {
        setError("Password recovery is unavailable — auth is not configured.");
        setChecking(false);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError || !data.session) {
        clearPasswordRecoveryMarker();
        setError(sessionError?.message || "This password reset session has expired. Request a new link.");
        setChecking(false);
        return;
      }

      if (!hasVerifiedPasswordRecovery(data.session.user.id)) {
        clearPasswordRecoveryMarker();
        setError("Open the password reset link from your email to continue.");
        setChecking(false);
        return;
      }

      setAuthorized(true);
      setChecking(false);
    };

    void verifyRecoverySession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!authorized || !supabase) {
      setError("Open a fresh password reset link from your email to continue.");
      return;
    }
    const passwordCheck = validateAccountPassword(password);
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

      clearPasswordRecoveryMarker();
      setPassword("");
      setConfirmPassword("");
      setAuthorized(false);

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw new Error(
          "Password updated, but VertexED could not verify that this recovery session was signed out. Do not continue using this session; return to login after the session is fully cleared.",
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your password. Request a new reset link and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset password — VertexED</title>
        <meta name="description" content="Securely choose a new password for your VertexED account." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="relative min-h-[70vh] flex items-center justify-center px-4">
        <div className="relative glass-panel w-full max-w-md p-8 md:p-10">
          <h1 className="text-3xl font-semibold mb-2 text-center text-foreground">Reset password</h1>

          {checking ? (
            <div className="mt-6 text-center" role="status" aria-live="polite">
              <div className="animate-pulse text-muted-foreground">Verifying reset link…</div>
            </div>
          ) : success ? (
            <div className="mt-6 space-y-5 text-center">
              <div
                className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                role="status"
              >
                Password updated. Sign in with your new password to continue.
              </div>
              <Link to="/login" className="neu-button inline-flex px-5 py-3">
                Back to login
              </Link>
            </div>
          ) : authorized ? (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Choose a new password for this account. You will be signed out after the update and asked to log in again.
              </p>
              <div>
                <label htmlFor="reset-password" className="form-label">New password</label>
                <div className="neu-input">
                  <input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    aria-describedby="reset-password-hint"
                    placeholder="Enter a new password"
                    className="neu-input-el"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={saving}
                    minLength={10}
                    maxLength={128}
                    required
                  />
                </div>
                <p id="reset-password-hint" className="mt-1.5 text-xs text-muted-foreground">
                  At least 10 characters with uppercase, lowercase, and a number.
                </p>
              </div>
              <div>
                <label htmlFor="reset-password-confirm" className="form-label">Confirm new password</label>
                <div className="neu-input">
                  <input
                    id="reset-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    className="neu-input-el"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={saving}
                    minLength={10}
                    maxLength={128}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full neu-button py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? "Updating password…" : "Update password"}
              </button>
            </form>
          ) : null}

          {error && (
            <div className="mt-5 alert-error text-center" role="alert">
              {error}
            </div>
          )}

          {!authorized && !checking && !success && (
            <p className="text-center mt-5 text-sm text-muted-foreground">
              <Link to="/login" className="sketch-underline text-foreground hover:text-primary">
                Return to login and request a new link
              </Link>
            </p>
          )}
        </div>
      </PageSection>
    </>
  );
}
