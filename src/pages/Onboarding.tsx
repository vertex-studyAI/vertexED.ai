import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";
import PageSection from "@/components/PageSection";
import CurriculumSelector from "@/components/curriculum/CurriculumSelector";
import { supabase } from "@/lib/supabaseClient";
import { buildCurriculumMetadata, boardFromApiLabel, getGradesForBoard } from "@/lib/curriculum";
import { authFetch } from "@/lib/apiAuth";
import { createFirstStudyPlan } from "@/lib/onboardingPlan";
import { isOnboardingComplete } from "@/lib/onboardingStatus.js";
import { savePlannerSnapshot } from "@/lib/plannerSync";
import { buildCurriculumProfileUpsert } from "@/lib/profileRecovery.mjs";
import { trackProductEvent } from "@/lib/productAnalytics.mjs";
import { markFirstSessionSyncNotice, markFirstSessionWelcome } from "@/lib/firstSessionHandoff.mjs";
import { resolveSessionStorage } from "@/lib/browserStorage.mjs";
import { onboardingError } from "@/lib/onboardingError.mjs";
import type { CurriculumPreference } from "@/types/curriculum";

const USERNAME_REGEX = /^([a-zA-Z0-9_.-]{3,20})$/;

const emptyCurriculum: CurriculumPreference = {
  board: null,
  grade: null,
  subjects: [],
  examDate: null,
};

export default function Onboarding() {
  const { user, session, profile } = useAuth();
  const navigate = useNavigate();
  const savedUsername = typeof user?.user_metadata?.username === "string"
    ? user.user_metadata.username.trim()
    : "";
  const hasSavedUsername = USERNAME_REGEX.test(savedUsername);
  const [step, setStep] = useState(() => hasSavedUsername ? 2 : 1);
  const [username, setUsername] = useState(savedUsername);
  const [curriculum, setCurriculum] = useState<CurriculumPreference>(emptyCurriculum);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [touched, setTouched] = useState(false);
  const curriculumEdited = useRef(false);
  const saveRequestIdRef = useRef(0);
  const saveAccountIdRef = useRef<string | null>(user?.id ?? null);
  const [applicationNotice, setApplicationNotice] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    curriculumEdited.current = false;
    setCurriculum(emptyCurriculum);
    setApplicationNotice('');
    void authFetch('/api/waitlist-status?profile=1', { signal: controller.signal }).then(async response => {
      if (!response.ok) return;
      const { applicationProfile: application } = await response.json();
      if (controller.signal.aborted || curriculumEdited.current || !application) return;
      const board = boardFromApiLabel(application.curriculum === 'A levels' ? 'A Levels' : application.curriculum);
      const match = typeof application.grade === 'string' ? application.grade.match(/^(?:(?:MYP|DP|Grade|Year)\s*)?(\d{1,2})$/i) : null;
      const candidate = match ? Number(match[1]) : null;
      if (board) setCurriculum({ ...emptyCurriculum, board, grade: candidate !== null && getGradesForBoard(board).includes(candidate) ? candidate : null });
      setApplicationNotice(board ? 'We brought your curriculum across from your application. Check your year and choose your subjects below.' : 'Your requested curriculum is recorded. Choose an available programme only if it matches your course.');
    }).catch(() => { /* Application prefill is optional. Manual setup remains available. */ });
    return () => controller.abort();
  }, [user?.id]);

  useEffect(() => {
    const nextAccountId = user?.id ?? null;
    if (saveAccountIdRef.current === nextAccountId) return;
    saveAccountIdRef.current = nextAccountId;
    saveRequestIdRef.current += 1;
    setLoading(false);
    setError(null);
  }, [user?.id]);

  useEffect(() => () => {
    saveRequestIdRef.current += 1;
  }, []);

  useEffect(() => {
    // Updating user metadata during save also refreshes AuthContext. Do not let
    // that refresh interrupt the authenticated planner save below.
    if (!isOnboardingComplete(user) || loading) return;

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
    if (!trimmedUsername) return "Letters, numbers, underscores, dots, or hyphens - 3 to 20 characters.";
    if (trimmedUsername.length < 3) return "At least 3 characters required.";
    if (trimmedUsername.length > 20) return "Maximum 20 characters.";
    if (!USERNAME_REGEX.test(trimmedUsername)) return "Only letters, numbers, underscores, dots, and hyphens.";
    return "Available format - continue when ready.";
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
    if (!user?.id || !session?.access_token) {
      setError("Your session is not ready. Refresh and try again.");
      return;
    }
    if (!supabase) {
      setError("Auth is disabled: Supabase is not configured.");
      return;
    }

    const initiatingAccountId = user.id;
    const initiatingAccessToken = session.access_token;
    const requestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = requestId;
    saveAccountIdRef.current = initiatingAccountId;
    const isCurrentSave = () => (
      requestId === saveRequestIdRef.current
      && saveAccountIdRef.current === initiatingAccountId
    );
    const stillOwnsAuthSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!isCurrentSave()) return false;
      if (sessionError) throw sessionError;
      return data.session?.user.id === initiatingAccountId;
    };

    try {
      setLoading(true);
      // Persist while the existing session is stable. Supabase serializes auth
      // mutations, so starting an authenticated API request after updateUser can
      // otherwise wait behind the metadata refresh lock.
      const planResult = await savePlannerSnapshot(
        createFirstStudyPlan(curriculum),
        initiatingAccountId,
        initiatingAccessToken,
      );
      if (!isCurrentSave() || !(await stillOwnsAuthSession())) return;

      const metadata = buildCurriculumMetadata(curriculum, {
        ...(user?.user_metadata ?? {}),
        username: trimmedUsername,
      });
      const profilePayload = buildCurriculumProfileUpsert(
        user,
        curriculum,
        {
          ...metadata,
          full_name: profile?.full_name ?? metadata.full_name,
          avatar_url: profile?.avatar_url ?? metadata.avatar_url,
        },
      );
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" });
      if (!isCurrentSave()) return;
      if (profileError) throw profileError;
      if (!(await stillOwnsAuthSession())) return;

      const { error: updateError } = await supabase.auth.updateUser({ data: metadata });
      if (!isCurrentSave()) return;
      if (updateError) throw updateError;

      // These markers only drive optional dashboard messaging. Once planner,
      // profile, and auth state are durable, blocked session storage must not
      // make onboarding look failed or prevent navigation to the dashboard.
      const handoffStorage = typeof window === "undefined" ? null : resolveSessionStorage(window);
      if (!planResult.cloudSynced) {
        markFirstSessionSyncNotice(handoffStorage, initiatingAccountId);
      }

      trackProductEvent("Onboarding Completed", {
        curriculum: curriculum.board,
        subject_count: curriculum.subjects.length,
        planner_sync: planResult.cloudSynced ? "cloud" : "device",
      });
      markFirstSessionWelcome(handoffStorage, initiatingAccountId);
      navigate("/main", { replace: true });
    } catch (err) {
      if (!isCurrentSave()) return;
      setError(onboardingError(err));
    } finally {
      if (requestId === saveRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  if (redirecting) {
    return (
      <>
        <Helmet><title>Welcome - Let&apos;s personalize</title><meta name="robots" content="noindex, nofollow" /></Helmet>
        <PageSection className="relative flex min-h-[70vh] items-center justify-center px-4">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-border border-t-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Taking you to your dashboard…</h1>
            <p className="mt-2 text-sm text-muted-foreground">You&apos;re already set up - heading to your dashboard.</p>
          </div>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Welcome - Let&apos;s personalize</title><meta name="robots" content="noindex, nofollow" /></Helmet>
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
                <form className="space-y-6" aria-busy={loading} onSubmit={(event) => { event.preventDefault(); void save(); }}>
                  {applicationNotice && <p className="text-sm text-muted-foreground" role="status">{applicationNotice}</p>}
                  <CurriculumSelector value={curriculum} onChange={value => { curriculumEdited.current = true; setCurriculum(value); }} showExamDate showSubjects />
                  <p className="text-sm text-muted-foreground">Select at least one subject. The available subjects update for the curriculum and grade you choose.</p>
                  {error && <div className="alert-error" role="alert">{error}</div>}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => setStep(1)} disabled={loading} className="w-full btn-glass py-3 disabled:cursor-not-allowed disabled:opacity-50">Back</button>
                    <button type="submit" disabled={!canSave} className="w-full btn-solid py-3 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Creating your plan…" : "Create my study plan"}</button>
                  </div>
                  {loading && <p role="status" aria-live="polite" className="text-center text-sm leading-relaxed text-muted-foreground">Saving your starter plan. On a slow connection this can take a moment; keep this page open.</p>}
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
