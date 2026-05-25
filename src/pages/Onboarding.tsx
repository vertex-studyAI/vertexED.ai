import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, BadgeCheck, Clock3, Target, GraduationCap } from "lucide-react";

const USERNAME_REGEX = /^([a-zA-Z0-9_.-]{3,20})$/;

type StudyGoal = "" | "ace_exams" | "catch_up" | "build_habits" | "understand_better";
type GradeLevel = "" | "middle_school" | "high_school" | "undergraduate" | "other";

const goalOptions: Array<{ value: Exclude<StudyGoal, "">; label: string; detail: string }> = [
  { value: "ace_exams", label: "Ace upcoming exams", detail: "Build a plan around deadlines and practice." },
  { value: "catch_up", label: "Catch up on topics", detail: "Focus on missing foundations first." },
  { value: "build_habits", label: "Build study habits", detail: "Create a steady routine you can keep." },
  { value: "understand_better", label: "Understand subjects better", detail: "Improve clarity and long-term recall." },
];

const gradeOptions: Array<{ value: Exclude<GradeLevel, "">; label: string }> = [
  { value: "middle_school", label: "Middle School" },
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "other", label: "Other" },
];

const sessionLengthOptions = [15, 25, 30, 45, 60, 90] as const;

function getErrorMessage(err: unknown) {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
    return (err as any).message;
  }
  return "Could not save. Try again.";
}

function StepCard({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
          {icon}
        </div>
        <div>
          <div className="font-medium text-white">{title}</div>
          <div className="text-sm text-white/55">{detail}</div>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("");
  const [preferredSessionMinutes, setPreferredSessionMinutes] = useState<number>(25);
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
  const canSave = Boolean(usernameValid && studyGoal && gradeLevel && !loading && !redirecting);

  const helperText = useMemo(() => {
    if (!trimmedUsername) return "Pick a clean username that matches your style.";
    if (trimmedUsername.length < 3) return "Use at least 3 characters.";
    if (trimmedUsername.length > 20) return "Keep it to 20 characters or fewer.";
    if (!USERNAME_REGEX.test(trimmedUsername)) return "Use letters, numbers, underscores, dots, or hyphens only.";
    return "Looks good.";
  }, [trimmedUsername]);

  const save = async () => {
    setTouched(true);
    setError(null);

    if (!trimmedUsername) {
      setError("Please choose a username.");
      return;
    }
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setError("Username should be 3-20 characters and use only letters, numbers, underscores, dots, or hyphens.");
      return;
    }
    if (!studyGoal) {
      setError("Choose a study goal.");
      return;
    }
    if (!gradeLevel) {
      setError("Choose your grade level.");
      return;
    }

    setLoading(true);
    try {
      const nextMetadata = {
        ...(user?.user_metadata ?? {}),
        username: trimmedUsername,
        studyGoal,
        gradeLevel,
        preferredSessionMinutes,
        preferences: {
          ...(user?.user_metadata?.preferences ?? {}),
          studyGoal,
          gradeLevel,
          preferredSessionMinutes,
        },
      };

      const { error: updateError } = await supabase.auth.updateUser({ data: nextMetadata });
      if (updateError) throw updateError;


      navigate("/main", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Vertex — Welcome</title>
        <meta name="description" content="Set up your Vertex account with a username, study goal, grade level, and preferred session length." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="grid min-h-[82vh] place-items-center px-4 py-8" surface="none">
        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 md:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
              Onboarding
            </div>
            <h1 className="text-4xl font-semibold tracking-tight brand-text-gradient">
              Set up your study profile
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
              Vertex uses these details to personalize recommendations, session timing, and adaptive account memory.
            </p>

            <div className="mt-6 grid gap-3">
              <StepCard icon={<Sparkles className="h-4 w-4" />} title="Pick a username" detail="A clean handle makes your account feel yours." />
              <StepCard icon={<Target className="h-4 w-4" />} title="Choose a goal" detail="We adapt recommendations around this target." />
              <StepCard icon={<GraduationCap className="h-4 w-4" />} title="Add your level" detail="This keeps tone and difficulty closer to your stage." />
              <StepCard icon={<Clock3 className="h-4 w-4" />} title="Set session length" detail="We will suggest a routine that fits your attention span." />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold text-white">Your details</h2>
            <p className="mt-2 text-sm text-white/60">This only takes a minute.</p>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Username</span>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setTouched(true);
                  }}
                  placeholder="vertexstudent"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
                />
                <div className={`mt-2 text-xs ${touched && !usernameValid ? "text-amber-200" : "text-white/45"}`}>
                  {helperText}
                </div>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Study goal</span>
                  <select
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value as StudyGoal)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                  >
                    <option value="" className="bg-slate-900">Select goal</option>
                    {goalOptions.map((goal) => (
                      <option key={goal.value} value={goal.value} className="bg-slate-900">
                        {goal.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Grade level</span>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                  >
                    <option value="" className="bg-slate-900">Select level</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade.value} value={grade.value} className="bg-slate-900">
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Preferred session length</span>
                <select
                  value={preferredSessionMinutes}
                  onChange={(e) => setPreferredSessionMinutes(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                >
                  {sessionLengthOptions.map((sessionLength) => (
                    <option key={sessionLength} value={sessionLength} className="bg-slate-900">
                      {sessionLength} minutes
                    </option>
                  ))}
                </select>
              </label>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => save()}
                  disabled={!canSave}
                  className="flex-1 rounded-full px-4 py-3 text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Save and continue"}
                </button>
                <button
                  type="button"
                  onClick={() => save()}
                  disabled={!canSave}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 disabled:opacity-60"
                >
                  Quick save
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                <BadgeCheck className="mr-2 inline h-4 w-4 align-middle text-emerald-200" />
                These preferences help Vertex tune session lengths, difficulty, and the adaptive learning card across your account.
              </div>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
