import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabaseClient";

const USERNAME_REGEX = /^([a-zA-Z0-9_.-]{3,20})$/;

type StudyGoal = "" | "ace_exams" | "catch_up" | "build_habits" | "understand_better";
type GradeLevel = "" | "middle_school" | "high_school" | "undergraduate" | "other";

const goalOptions: Array<{ value: Exclude<StudyGoal, "">; label: string; detail: string }> = [
  { value: "ace_exams", label: "Ace upcoming exams", detail: "We'll help you plan around deadlines and practice what counts." },
  { value: "catch_up", label: "Catch up on topics", detail: "Start with the gaps — we'll meet you where you are." },
  { value: "build_habits", label: "Build study habits", detail: "Small routines that stick, not heroic all-nighters." },
  { value: "understand_better", label: "Understand subjects better", detail: "Go beyond memorizing — actually get it." },
];

const gradeOptions: Array<{ value: Exclude<GradeLevel, "">; label: string }> = [
  { value: "middle_school", label: "Middle School" },
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "other", label: "Other" },
];

function getErrorMessage(err: unknown) {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
    return (err as any).message;
  }
  return "Could not save. Try again.";
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("");
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
  const canSave = usernameValid && !loading && !redirecting;

  const helperText = useMemo(() => {
    if (!trimmedUsername) return "Pick something that feels like you.";
    if (trimmedUsername.length < 3) return "At least 3 characters — you've got this.";
    if (trimmedUsername.length > 20) return "Keep it to 20 characters or fewer.";
    if (!USERNAME_REGEX.test(trimmedUsername)) return "Letters, numbers, underscores, dots, or hyphens only.";
    return "Looks good — you're all set.";
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

      const metadata: Record<string, any> = {
        ...(user?.user_metadata ?? {}),
        username: trimmedUsername,
      };

      if (withPreferences) {
        if (studyGoal) {
          metadata.study_goal = studyGoal;
        }
        if (gradeLevel) {
          metadata.grade_level = gradeLevel;
        }
        const prefs: Record<string, any> = {};
        if (studyGoal) prefs.studyGoal = studyGoal;
        if (gradeLevel) prefs.gradeLevel = gradeLevel;
        if (Object.keys(prefs).length > 0) metadata.preferences = prefs;
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
          <title>Welcome — Let’s personalize</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <PageSection className="relative min-h-[70vh] flex items-center justify-center px-4">
          <div className="glass-panel w-full max-w-md p-8 text-center text-white">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            <h1 className="text-2xl font-semibold">Taking you to your dashboard…</h1>
            <p className="mt-2 text-sm text-white/70">You're already set up — heading to your dashboard.</p>
          </div>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Welcome — Let’s personalize</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="relative min-h-[80vh] overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.55))]" />

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="glass-panel p-6 md:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl text-white">
                ✦
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Choose your username</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                This is how we'll greet you and remember your preferences. Make it yours.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                void save(true);
              }}
            >
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-white/80">
                  Username
                </label>
                <div className="rounded-2xl border border-white/15 bg-black/20 p-1">
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
                    className="w-full rounded-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-white/35"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setTouched(true)}
                    maxLength={20}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/55" id="username-help">
                  <span>{helperText}</span>
                  <span>{usernameLength}/20</span>
                </div>
                {touched && !usernameValid && trimmedUsername.length > 0 && (
                  <p id="username-error" className="mt-2 text-sm text-red-300">
                    Usernames must be 3-20 characters and may include letters, numbers, underscores, dots, and hyphens.
                  </p>
                )}
              </div>

              <details className="group rounded-2xl border border-white/15 bg-white/8 p-5 transition hover:bg-white/12">
                <summary className="cursor-pointer select-none list-none text-sm font-medium text-white/85">
                  <span className="flex items-center justify-between gap-3">
                    <span>Optional preferences</span>
                    <span className="text-white/45 transition group-open:rotate-180">⌄</span>
                  </span>
                </summary>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-white/75">Study goal</label>
                    <div className="rounded-2xl border border-white/15 bg-black/20 p-1">
                      <select
                        className="w-full rounded-xl bg-transparent px-4 py-3 text-white outline-none"
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
                    {studyGoal && (
                      <p className="mt-2 text-xs text-white/50">
                        {goalOptions.find((g) => g.value === studyGoal)?.detail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/75">Grade level</label>
                    <div className="rounded-2xl border border-white/15 bg-black/20 p-1">
                      <select
                        className="w-full rounded-xl bg-transparent px-4 py-3 text-white outline-none"
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
              </details>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => save(false)}
                  disabled={!canSave}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Skip personalization"}
                </button>
                <button
                  type="submit"
                  disabled={!canSave}
                  className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:translate-y-[-1px] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save and continue"}
                </button>
              </div>

              <p className="text-center text-xs leading-relaxed text-white/50">
                Don't worry — you can change any of this later in settings.
              </p>
            </form>
          </div>
        </div>
      </PageSection>
    </>
  );
}
