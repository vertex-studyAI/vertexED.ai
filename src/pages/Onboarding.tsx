import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";
import CurriculumSelector from "@/components/curriculum/CurriculumSelector";
import { supabase } from "@/lib/supabaseClient";
import { buildCurriculumMetadata } from "@/lib/curriculum";
import { createFirstStudyPlan } from "@/lib/onboardingPlan";
import { savePlannerSnapshot } from "@/lib/plannerSync";
import type { CurriculumPreference } from "@/types/curriculum";

const USERNAME_REGEX = /^([a-zA-Z0-9_.-]{3,20})$/;

const emptyCurriculum: CurriculumPreference = {
  board: null,
  grade: null,
  subjects: [],
  examDate: null,
};

function getErrorMessage(err: unknown) {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Could not save your setup. Try again.";
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [curriculum, setCurriculum] = useState<CurriculumPreference>(emptyCurriculum);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const existingUsername = user?.user_metadata?.username;
    // Updating user metadata during save also refreshes AuthContext. Do not let
    // that refresh interrupt the authenticated planner save below.
    if (!existingUsername || loading) return;

    setRedirecting(true);
    const id = window.setTimeout(() => navigate("/main", { replace: true }), 150);
    return () => window.clearTimeout(id);
  }, [user, navigate, loading]);

  const trimmedUsername = username.trim();
  const usernameValid = USERNAME_REGEX.test(trimmedUsername);
  const usernameLength = trimmedUsername.length;
  const curriculumValid = Boolean(curriculum.board && curriculum.grade && curriculum.subjects.length > 0);
  const canAdvanceStep1 = usernameValid && !loading && !redirecting;
  const canSave = canAdvanceStep1 && curriculumValid;

  const helperText = useMemo(() => {
    if (!trimmedUsername) return "Letters, numbers, underscores, dots, or hyphens — 3 to 20 characters.";
    if (trimmedUsername.length < 3) return "At least 3 characters required.";
    if (trimmedUsername.length > 20) return "Maximum 20 characters.";
    if (!USERNAME_REGEX.test(trimmedUsername)) return "Only letters, numbers, underscores, dots, and hyphens.";
    return "Available format — continue when ready.";
  }, [trimmedUsername]);

  const save = async () => {
    setTouched(true);
    setError(null);

    if (!usernameValid) {
      setError("Username should be 3–20 characters and can include letters, numbers, _ . -.");
      return;
    }
    if (!curriculum.board || !curriculum.grade) {
      setError("Choose your curriculum and grade / year.");
      return;
    }
    if (curriculum.subjects.length === 0) {
      setError("Choose at least one subject so we can make your first plan.");
      return;
    }
    if (!supabase) {
      setError("Auth is disabled: Supabase is not configured.");
      return;
    }

    try {
      setLoading(true);
      const metadata = buildCurriculumMetadata(curriculum, {
        ...(user?.user_metadata ?? {}),
        username: trimmedUsername,
      });
      const { error: updateError } = await supabase.auth.updateUser({ data: metadata });
      if (updateError) throw updateError;

      const planResult = await savePlannerSnapshot(createFirstStudyPlan(curriculum));
      if (!planResult.cloudSynced) {
        sessionStorage.setItem(
          "vertex_plan_sync_notice",
          "Your starter plan is saved on this device and will sync when the connection is available.",
        );
      }

      sessionStorage.setItem("vertex_welcome", "1");
      navigate("/main", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <>
        <Helmet><title>Welcome — Let&apos;s personalize</title><meta name="robots" content="noindex, nofollow" /></Helmet>
        <PageSection className="relative flex min-h-[70vh] items-center justify-center px-4">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-border border-t-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Taking you to your dashboard…</h1>
            <p className="mt-2 text-sm text-muted-foreground">You&apos;re already set up — heading to your dashboard.</p>
          </div>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Welcome — Let&apos;s personalize</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <PageSection className="relative min-h-[80vh] overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_35%),radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.08),transparent_30%)]" />
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="glass-panel p-6 md:p-10">
            <div className="mb-6 flex items-center justify-center gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={2} aria-label="Onboarding progress">
              {[1, 2].map((currentStep) => <div key={currentStep} className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${step >= currentStep ? "bg-primary" : "bg-foreground/15"}`} aria-hidden />)}
            </div>

            {step === 1 ? (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-foreground/[0.05] text-2xl text-primary">✦</div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Choose your username</h1>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">Shown on your dashboard and in Apex greetings.</p>
                </div>
                <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); if (canAdvanceStep1) setStep(2); }}>
                  <div>
                    <label htmlFor="username" className="mb-2 block text-sm font-medium text-foreground/90">Username</label>
                    <div className="neu-input"><input id="username" aria-label="Username" aria-invalid={touched && !usernameValid} aria-describedby="username-help username-error" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="Pick a username" className="neu-input-el" value={username} onChange={(event) => setUsername(event.target.value)} onBlur={() => setTouched(true)} maxLength={20} /></div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground" id="username-help"><span>{helperText}</span><span>{usernameLength}/20</span></div>
                    {touched && !usernameValid && trimmedUsername.length > 0 && <p id="username-error" className="mt-2 text-sm text-destructive" role="alert">Usernames must be 3–20 characters and may include letters, numbers, underscores, dots, and hyphens.</p>}
                  </div>
                  {error && <div className="alert-error" role="alert">{error}</div>}
                  <button type="submit" disabled={!canAdvanceStep1} className="w-full btn-solid py-3 disabled:cursor-not-allowed disabled:opacity-50">Continue</button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Build your first study plan</h1>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">Choose your curriculum, subjects, and exam date. We&apos;ll create a focused first-week plan that you can edit anytime.</p>
                </div>
                <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void save(); }}>
                  <CurriculumSelector value={curriculum} onChange={setCurriculum} showExamDate showSubjects />
                  <p className="text-sm text-muted-foreground">Select at least one subject. The available subjects update for the curriculum and grade you choose.</p>
                  {error && <div className="alert-error" role="alert">{error}</div>}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => setStep(1)} disabled={loading} className="w-full btn-glass py-3 disabled:cursor-not-allowed disabled:opacity-50">Back</button>
                    <button type="submit" disabled={!canSave} className="w-full btn-solid py-3 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Creating your plan…" : "Create my study plan"}</button>
                  </div>
                  <p className="text-center text-xs leading-relaxed text-muted-foreground">Your curriculum and plan are saved to your account. You can update them anytime in settings and the planner.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </PageSection>
    </>
  );
}
