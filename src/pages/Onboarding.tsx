import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";
import CurriculumSelector from "@/components/curriculum/CurriculumSelector";
import { supabase } from "@/lib/supabaseClient";
import { buildCurriculumMetadata } from "@/lib/curriculum";
import { buildOnboardingCompleteMetadata } from "@/lib/onboarding";
import type { CurriculumPreference } from "@/types/curriculum";

const USERNAME_REGEX = /^([a-zA-Z0-9_.-]{3,20})$/;

type StudyGoal = "" | "ace_exams" | "catch_up" | "build_habits" | "understand_better";
type GradeLevel = "" | "middle_school" | "high_school" | "undergraduate" | "other";

const goalOptions: Array<{ value: Exclude<StudyGoal, "">; label: string }> = [
  { value: "ace_exams", label: "Maximise exam marks" },
  { value: "catch_up", label: "Close topic gaps" },
  { value: "build_habits", label: "Build steady routines" },
  { value: "understand_better", label: "Understand deeply" },
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

function readString(meta: Record<string, unknown>, key: string): string {
  const v = meta[key];
  return typeof v === "string" ? v : "";
}

function readAge(meta: Record<string, unknown>): string {
  const v = meta.age;
  if (typeof v === "number" && v > 0) return String(v);
  if (typeof v === "string" && v.trim()) return v.trim();
  return "";
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const meta = user?.user_metadata ?? {};

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(() => readString(meta, "username"));
  const [age, setAge] = useState(() => readAge(meta));
  const [school, setSchool] = useState(() => readString(meta, "school"));
  const [studyGoal, setStudyGoal] = useState<StudyGoal>(() => (readString(meta, "study_goal") as StudyGoal) || "");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(() => (readString(meta, "grade_level") as GradeLevel) || "");
  const [curriculum, setCurriculum] = useState<CurriculumPreference>(emptyCurriculum);
  const [notes, setNotes] = useState(() => readString(meta, "onboarding_notes"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!user) return;
    import("@/lib/curriculum").then(({ getCurriculumPreference }) => {
      setCurriculum(getCurriculumPreference(user));
    });
  }, [user]);

  const trimmedUsername = username.trim();
  const usernameValid = USERNAME_REGEX.test(trimmedUsername);
  const usernameLength = trimmedUsername.length;
  const hasExistingUsername = Boolean(readString(meta, "username"));
  const canAdvanceStep1 = usernameValid && !loading;

  const helperText = useMemo(() => {
    if (!trimmedUsername) return "Letters, numbers, underscores, dots, or hyphens — 3 to 20 characters.";
    if (trimmedUsername.length < 3) return "At least 3 characters required.";
    if (trimmedUsername.length > 20) return "Maximum 20 characters.";
    if (!USERNAME_REGEX.test(trimmedUsername)) return "Only letters, numbers, underscores, dots, and hyphens.";
    return "Looks good.";
  }, [trimmedUsername]);

  const save = async () => {
    setTouched(true);
    setError(null);

    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setError("Username should be 3–20 characters (letters, numbers, _ . -).");
      return;
    }

    const ageNum = age.trim() ? Number.parseInt(age.trim(), 10) : null;
    if (age.trim() && (Number.isNaN(ageNum) || ageNum! < 10 || ageNum! > 99)) {
      setError("Enter a valid age (10–99) or leave it blank.");
      return;
    }

    try {
      setLoading(true);
      if (!supabase || !user) {
        throw new Error("Auth is disabled: Supabase not configured.");
      }

      let metadata: Record<string, unknown> = {
        ...(user.user_metadata ?? {}),
        username: trimmedUsername,
      };

      if (studyGoal) metadata.study_goal = studyGoal;
      if (gradeLevel) metadata.grade_level = gradeLevel;
      const prefs: Record<string, unknown> = {
        ...(typeof metadata.preferences === "object" && metadata.preferences
          ? (metadata.preferences as Record<string, unknown>)
          : {}),
      };
      if (studyGoal) prefs.studyGoal = studyGoal;
      if (gradeLevel) prefs.gradeLevel = gradeLevel;
      metadata.preferences = prefs;

      if (curriculum.board) {
        metadata = buildCurriculumMetadata(curriculum, metadata);
      }
      if (ageNum != null) metadata.age = ageNum;
      if (school.trim()) metadata.school = school.trim();
      if (notes.trim()) metadata.onboarding_notes = notes.trim();

      metadata = buildOnboardingCompleteMetadata(metadata);

      const { error: updErr } = await supabase.auth.updateUser({ data: metadata });
      if (updErr) throw updErr;

      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email ?? null,
        board: curriculum.board,
        grade: curriculum.grade,
        subjects: curriculum.subjects,
        exam_date: curriculum.examDate,
        age: ageNum,
        school: school.trim() || null,
        onboarding_notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      });

      sessionStorage.setItem("vertex_welcome", "1");
      navigate("/main", { replace: true });
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;

  return (
    <>
      <Helmet>
        <title>Welcome — quick setup</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="relative min-h-[80vh] overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_35%)]" />

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="glass-panel p-6 md:p-10">
            <div className="mb-2 text-center">
              <p className="text-xs uppercase tracking-widest text-primary">Quick setup</p>
              <p className="text-sm text-muted-foreground mt-1">
                {hasExistingUsername
                  ? "We refreshed onboarding — a few questions help tune your dashboard."
                  : "A few questions so your dashboard reflects you, not generic placeholders."}
              </p>
            </div>

            <div
              className="mb-6 flex items-center justify-center gap-2"
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-label="Onboarding progress"
            >
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${step >= s ? "bg-primary" : "bg-foreground/15"}`}
                  aria-hidden
                />
              ))}
            </div>

            {step === 1 && (
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                    {hasExistingUsername ? "Confirm your username" : "Choose a username"}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">Shown on your dashboard and in Apex greetings.</p>
                </div>
                <form
                  className="space-y-5"
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
                        className="neu-input-el"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => setTouched(true)}
                        maxLength={20}
                        autoComplete="username"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{helperText} · {usernameLength}/20</p>
                  </div>
                  {error && <div className="alert-error" role="alert">{error}</div>}
                  <button type="submit" disabled={!canAdvanceStep1} className="w-full btn-solid py-3 disabled:opacity-50">
                    Continue
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Your curriculum</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Board and subjects tune Paper Maker, Reviewer, and Apex. Skip anything you are not sure about yet.
                  </p>
                </div>
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(3);
                  }}
                >
                  <CurriculumSelector value={curriculum} onChange={setCurriculum} showExamDate showSubjects />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="age" className="mb-2 block text-sm text-foreground/80">Age (optional)</label>
                      <div className="neu-input">
                        <input
                          id="age"
                          type="number"
                          min={10}
                          max={99}
                          className="neu-input-el"
                          placeholder="e.g. 16"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="school" className="mb-2 block text-sm text-foreground/80">School (optional)</label>
                      <div className="neu-input">
                        <input
                          id="school"
                          className="neu-input-el"
                          placeholder="Where you study"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          maxLength={120}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="btn-glass flex-1 py-3">Back</button>
                    <button type="submit" className="btn-solid flex-1 py-3">Continue</button>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Almost done</h1>
                  <p className="mt-2 text-sm text-muted-foreground">All optional — helps us suggest better study paths.</p>
                </div>
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save();
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="study-goal" className="mb-2 block text-sm text-foreground/80">Study goal</label>
                      <div className="neu-input">
                        <select
                          id="study-goal"
                          className="neu-input-el cursor-pointer"
                          value={studyGoal}
                          onChange={(e) => setStudyGoal(e.target.value as StudyGoal)}
                        >
                          <option value="">Skip</option>
                          {goalOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="grade-level" className="mb-2 block text-sm text-foreground/80">Year group</label>
                      <div className="neu-input">
                        <select
                          id="grade-level"
                          className="neu-input-el cursor-pointer"
                          value={gradeLevel}
                          onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                        >
                          <option value="">Skip</option>
                          {gradeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="notes" className="mb-2 block text-sm text-foreground/80">
                      Anything else? (optional)
                    </label>
                    <div className="neu-input">
                      <textarea
                        id="notes"
                        className="neu-input-el min-h-[88px] resize-y"
                        placeholder="Recent report grades, topics you struggle with, or what you want from VertexED…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={800}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Paste a short summary from a report card or transcript — no file upload needed.
                    </p>
                  </div>
                  {error && <div className="alert-error" role="alert">{error}</div>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="btn-glass flex-1 py-3">Back</button>
                    <button type="submit" disabled={loading} className="btn-solid flex-1 py-3 disabled:opacity-50">
                      {loading ? "Saving…" : "Finish setup"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </PageSection>
    </>
  );
}
