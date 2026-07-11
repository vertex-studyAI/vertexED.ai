import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";
import CurriculumSelector from "@/components/curriculum/CurriculumSelector";
import { supabase } from "@/lib/supabaseClient";
import { buildCurriculumMetadata } from "@/lib/curriculum";
import type { CurriculumPreference } from "@/types/curriculum";

const USERNAME_REGEX = /^([a-zA-Z0-9_.-]{3,20})$/;

type StudyGoal = "" | "ace_exams" | "catch_up" | "build_habits" | "understand_better";
type GradeLevel = "" | "middle_school" | "high_school" | "undergraduate" | "other";

const goalOptions: Array<{ value: Exclude<StudyGoal, "">; label: string; detail: string }> = [
  { value: "ace_exams", label: "Maximise exam marks", detail: "Mocks, rubric review, and cram-friendly planning weighted toward your exam date." },
  { value: "catch_up", label: "Close topic gaps", detail: "One gap topic at a time — notes, quiz, then review — not a full syllabus reset." },
  { value: "build_habits", label: "Build steady routines", detail: "Study Zone timers, habit streaks, and spaced cards sized for busy weeks." },
  { value: "understand_better", label: "Understand deeply", detail: "Apex and Reviewer focus on reasoning and mark schemes, not finished answers to memorise." },
];

const gradeOptions: Array<{ value: Exclude<GradeLevel, "">; label: string }> = [
  { value: "middle_school", label: "Middle School" },
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "other", label: "Other" },
];

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
  return "Could not save. Try again.";
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("");
  const [curriculum, setCurriculum] = useState<CurriculumPreference>(emptyCurriculum);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const existingUsername = user?.user_metadata?.username;
    if (!existingUsername) return;

    setRedirecting(true);
    const id = window.setTimeout(() => {
      navigate("/main", { replace: true });
    }, 150);

    return () => window.clearTimeout(id);
  }, [user, navigate]);

  const trimmedUsername = username.trim();
  const usernameValid = USERNAME_REGEX.test(trimmedUsername);
  const usernameLength = trimmedUsername.length;
  const canAdvanceStep1 = usernameValid && !loading && !redirecting;
  const canSave = canAdvanceStep1 && !loading && !redirecting;

  const helperText = useMemo(() => {
    if (!trimmedUsername) return "Letters, numbers, underscores, dots, or hyphens — 3 to 20 characters.";
    if (trimmedUsername.length < 3) return "At least 3 characters required.";
    if (trimmedUsername.length > 20) return "Maximum 20 characters.";
    if (!USERNAME_REGEX.test(trimmedUsername)) return "Only letters, numbers, underscores, dots, and hyphens.";
    return "Available format — continue when ready.";
  }, [trimmedUsername]);

  const save = async (withPreferences: boolean) => {
    setTouched(true);
    setError(null);

    if (!trimmedUsername) {
      setError("Please choose a username.");
      return;
    }
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setError("Username should be 3-20 characters and can include letters, numbers, _ . -.");
      return;
    }

    try {
      setLoading(true);

      if (!supabase) {
        throw new Error("Auth is disabled: Supabase not configured.");
      }

      let metadata: Record<string, unknown> = {
        ...(user?.user_metadata ?? {}),
        username: trimmedUsername,
      };

      if (withPreferences) {
        if (studyGoal) metadata.study_goal = studyGoal;
        if (gradeLevel) metadata.grade_level = gradeLevel;
        const prefs: Record<string, unknown> = {};
        if (studyGoal) prefs.studyGoal = studyGoal;
        if (gradeLevel) prefs.gradeLevel = gradeLevel;
        if (Object.keys(prefs).length > 0) metadata.preferences = prefs;

        if (curriculum.board) {
          metadata = buildCurriculumMetadata(curriculum, metadata);
        }
      }

      const { error: updErr } = await supabase.auth.updateUser({ data: metadata });
      if (updErr) throw updErr;

      sessionStorage.setItem("vertex_welcome", "1");
      navigate("/main", { replace: true });
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <>
        <Helmet>
          <title>Welcome — Let's personalize</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <PageSection className="relative min-h-[70vh] flex items-center justify-center px-4">
          <div className="glass-panel w-full max-w-md p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-border border-t-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Taking you to your dashboard…</h1>
            <p className="mt-2 text-sm text-muted-foreground">You're already set up — heading to your dashboard.</p>
          </div>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Welcome — Let's personalize</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="relative min-h-[80vh] overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_35%),radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.08),transparent_30%)]" />

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="glass-panel p-6 md:p-10">
            <div className="mb-6 flex items-center justify-center gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={2} aria-label="Onboarding progress">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${step >= s ? "bg-primary" : "bg-foreground/15"}`}
                  aria-hidden
                />
              ))}
            </div>

            {step === 1 && (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-foreground/[0.05] text-2xl text-primary">
                    ✦
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Choose your username</h1>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    Shown on your dashboard and in Apex greetings. Choose something you&apos;re comfortable seeing every session.
                  </p>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canAdvanceStep1) setStep(2);
                  }}
                >
                  <div>
                    <label htmlFor="username" className="mb-2 block text-sm font-medium text-foreground/90">
                      Username
                    </label>
                    <div className="neu-input">
                      <input
                        id="username"
                        aria-label="Username"
                        aria-invalid={touched && !usernameValid}
                        aria-describedby="username-help username-error"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="Pick a username"
                        className="neu-input-el"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => setTouched(true)}
                        maxLength={20}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground" id="username-help">
                      <span>{helperText}</span>
                      <span>{usernameLength}/20</span>
                    </div>
                    {touched && !usernameValid && trimmedUsername.length > 0 && (
                      <p id="username-error" className="mt-2 text-sm text-destructive" role="alert">
                        Usernames must be 3-20 characters and may include letters, numbers, underscores, dots, and hyphens.
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="alert-error" role="alert">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canAdvanceStep1}
                    className="w-full btn-solid py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Set up your curriculum</h1>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    Board, subjects, and exam date tune Paper Maker, Reviewer, Apex, and your dashboard. You can change these later in settings.
                  </p>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save(true);
                  }}
                >
                  <CurriculumSelector
                    value={curriculum}
                    onChange={setCurriculum}
                    showExamDate
                    showSubjects
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="study-goal" className="mb-2 block text-sm text-foreground/80">Study goal</label>
                      <div className="neu-input">
                        <select
                          id="study-goal"
                          className="neu-input-el cursor-pointer"
                          value={studyGoal}
                          onChange={(e) => setStudyGoal(e.target.value as StudyGoal)}
                        >
                          <option value="">Select one (optional)</option>
                          {goalOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="grade-level" className="mb-2 block text-sm text-foreground/80">Grade level</label>
                      <div className="neu-input">
                        <select
                          id="grade-level"
                          className="neu-input-el cursor-pointer"
                          value={gradeLevel}
                          onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                        >
                          <option value="">Select (optional)</option>
                          {gradeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="alert-error" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full btn-glass py-3"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => save(false)}
                      disabled={!canSave}
                      className="w-full btn-glass py-3 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Saving…" : "Skip curriculum"}
                    </button>
                    <button
                      type="submit"
                      disabled={!canSave}
                      className="w-full btn-solid py-3 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Saving…" : "Save and continue"}
                    </button>
                  </div>

                  <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    You can change your board and subjects anytime in settings.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </PageSection>
    </>
  );
}
