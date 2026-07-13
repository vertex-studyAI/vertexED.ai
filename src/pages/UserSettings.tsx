import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import SavedWorkList, { ArtifactKindFilter } from "@/components/SavedWorkList";
import CurriculumSelector from "@/components/curriculum/CurriculumSelector";
import BoardBadge from "@/components/curriculum/BoardBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, RefreshCw, AlertTriangle, Save, Trash2 } from "lucide-react";
import PageSection from "@/components/PageSection";
import { useEffect, useState } from "react";
import {
  getLearnerProfile,
  getProfileCompleteness,
  gradeLevelLabel,
  studyGoalLabel,
  buildLearnerMetadataPatch,
  type StudyGoal,
  type GradeLevel,
  type AiStyle,
  type ExplanationDepth,
} from "@/lib/learnerProfile";
import { buildCurriculumMetadata } from "@/lib/curriculum";
import type { CurriculumPreference } from "@/types/curriculum";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { useAccessibility } from "@/hooks/useAccessibility";
import ThemeToggle from "@/components/ThemeToggle";
import { getHideExamReadiness, setHideExamReadiness } from "@/lib/dashboardPrefs";
import {
  listStudyArtifactsDetailed,
  clearDeviceStudyData,
  type StudyArtifact,
  type StudyArtifactKind,
} from "@/lib/userContent";

function formatMemberSince(createdAt?: string | null): string {
  if (!createdAt) return "—";
  try {
    return new Date(createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function UserSettings() {
  const { logout, user, profile } = useAuth();
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<StudyArtifact[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(true);
  const [artifactError, setArtifactError] = useState<string | null>(null);
  const [cloudUnavailable, setCloudUnavailable] = useState(false);
  const [kindFilter, setKindFilter] = useState<StudyArtifactKind | "all">("all");
  const learnerProfile = getLearnerProfile(user);
  const profileCompleteness = getProfileCompleteness(learnerProfile);
  const [curriculum, setCurriculum] = useState<CurriculumPreference>(learnerProfile.curriculum);
  const [studyGoal, setStudyGoal] = useState<StudyGoal | "">(learnerProfile.studyGoal ?? "");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | "">(learnerProfile.gradeLevel ?? "");
  const [aiStyle, setAiStyle] = useState<AiStyle>(learnerProfile.preferences.aiStyle);
  const [explanationDepth, setExplanationDepth] = useState<ExplanationDepth>(
    learnerProfile.preferences.explanationDepth,
  );
  const [sessionMinutes, setSessionMinutes] = useState(learnerProfile.preferences.sessionMinutes);
  const [age, setAge] = useState(learnerProfile.age != null ? String(learnerProfile.age) : "");
  const [school, setSchool] = useState(learnerProfile.school ?? "");
  const [onboardingNotes, setOnboardingNotes] = useState(learnerProfile.onboardingNotes ?? "");
  const [hideExamReadiness, setHideExamReadinessState] = useState(() =>
    getHideExamReadiness(user?.user_metadata),
  );
  const [savingCurriculum, setSavingCurriculum] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingAccount, setExportingAccount] = useState(false);
  const { settings: a11y, update: updateA11y } = useAccessibility();

  useEffect(() => {
    const profile = getLearnerProfile(user);
    setCurriculum(profile.curriculum);
    setStudyGoal(profile.studyGoal ?? "");
    setGradeLevel(profile.gradeLevel ?? "");
    setAiStyle(profile.preferences.aiStyle);
    setExplanationDepth(profile.preferences.explanationDepth);
    setSessionMinutes(profile.preferences.sessionMinutes);
    setAge(profile.age != null ? String(profile.age) : "");
    setSchool(profile.school ?? "");
    setOnboardingNotes(profile.onboardingNotes ?? "");
    setHideExamReadinessState(getHideExamReadiness(user?.user_metadata));
  }, [user]);

  const saveCurriculum = async () => {
    if (!supabase || !user) return;
    setSavingCurriculum(true);
    try {
      const metadata = buildCurriculumMetadata(curriculum, user?.user_metadata ?? {});
      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          board: curriculum.board ?? null,
          grade: curriculum.grade ?? null,
          subjects: curriculum.subjects ?? [],
          exam_date: curriculum.examDate ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      toast({ title: "Curriculum saved", description: "Your board and subjects are updated across all tools." });
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" });
    } finally {
      setSavingCurriculum(false);
    }
  };

  const saveLearningProfile = async () => {
    if (!supabase || !user) return;
    setSavingProfile(true);
    try {
      const ageNum = age.trim() ? Number.parseInt(age.trim(), 10) : null;
      if (age.trim() && (Number.isNaN(ageNum) || ageNum! < 10 || ageNum! > 99)) {
        throw new Error("Enter a valid age (10–99) or leave it blank.");
      }

      const metadata = buildLearnerMetadataPatch(
        {
          studyGoal: studyGoal || null,
          gradeLevel: gradeLevel || null,
          preferences: {
            aiStyle,
            explanationDepth,
            sessionMinutes,
          },
        },
        user?.user_metadata ?? {},
      );
      if (ageNum != null) metadata.age = ageNum;
      else delete metadata.age;
      if (school.trim()) metadata.school = school.trim();
      else delete metadata.school;
      if (onboardingNotes.trim()) metadata.onboarding_notes = onboardingNotes.trim();
      else delete metadata.onboarding_notes;

      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;

      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email ?? null,
        age: ageNum,
        school: school.trim() || null,
        onboarding_notes: onboardingNotes.trim() || null,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Learning profile saved",
        description: "Apex, planner suggestions, and default focus-block length now follow your saved preferences.",
      });
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveDashboardPrefs = async (hide: boolean) => {
    setHideExamReadinessState(hide);
    setHideExamReadiness(hide);
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.updateUser({
        data: { ...(user?.user_metadata ?? {}), hide_exam_readiness: hide },
      });
      if (error) throw error;
      toast({
        title: hide ? "Exam readiness hidden" : "Exam readiness shown",
        description: hide
          ? "The readiness ring is off your dashboard — you can turn it back on anytime."
          : "The readiness ring is back on your dashboard.",
      });
    } catch (e) {
      toast({
        title: "Could not save preference",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  const loadArtifacts = async () => {
    setLoadingArtifacts(true);
    const result = await listStudyArtifactsDetailed(
      kindFilter === "all" ? undefined : kindFilter,
    );
    setArtifacts(result.items);
    setCloudUnavailable(Boolean(result.cloudUnavailable));
    setArtifactError(
      result.cloudUnavailable
        ? null
        : result.ok
          ? null
          : result.error || "Unable to load saved work.",
    );
    setLoadingArtifacts(false);
  };

  useEffect(() => {
    void loadArtifacts();
  }, [kindFilter]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (e) {
      console.error("Logout error", e);
      navigate("/", { replace: true });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your VertexED account permanently? Saved work in the cloud will be removed. This cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      const { authFetch } = await import("@/lib/apiAuth");
      const res = await authFetch("/api/account", { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Account deletion failed");
      }
      clearDeviceStudyData();
      await logout();
      toast({ title: "Account deleted" });
      navigate("/", { replace: true });
    } catch (err) {
      toast({
        title: "Could not delete account",
        description: err instanceof Error ? err.message : "Try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const exportAccountData = async () => {
    setExportingAccount(true);
    try {
      const { authFetch } = await import("@/lib/apiAuth");
      const res = await authFetch("/api/account");
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.ok || !result?.data) {
        throw new Error(result?.error || "Account export failed");
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `vertexed-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Account export ready", description: "Your cloud profile, saved work, and verified learning records were downloaded." });
    } catch (error) {
      toast({
        title: "Could not export account data",
        description: error instanceof Error ? error.message : "Try again shortly.",
        variant: "destructive",
      });
    } finally {
      setExportingAccount(false);
    }
  };

  const displayName =
    (user?.user_metadata?.username as string | undefined) ||
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Student";

  const memberSince = formatMemberSince(profile?.created_at ?? user?.created_at);
  const studyGoalDisplay = studyGoalLabel(learnerProfile.studyGoal) || "—";
  const gradeLevelDisplay = gradeLevelLabel(learnerProfile.gradeLevel) || "—";

  return (
    <>
      <Helmet>
        <title>Vertex — Account Settings</title>
        <meta name="description" content="Manage your Vertex account settings and preferences." />
        <link rel="canonical" href="https://www.vertexed.app/user-settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="max-w-2xl">
        <h1 className="text-3xl font-semibold mb-6 flex items-center gap-3 brand-text-gradient">
          <Settings className="h-8 w-8" />
          Account Settings
        </h1>

        <div className="space-y-6">
          <NeumorphicCard className="p-8" title="Profile Information">
            <div className="flex items-center gap-4 mb-6">
              <div className="neu-surface p-4 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-medium">{displayName}</h3>
                <p className="opacity-70">{user?.email ?? "Vertex Student Account"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 mb-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm font-medium">Profile completeness</span>
                <span className="text-sm tabular-nums text-primary">{profileCompleteness.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all"
                  style={{ width: `${profileCompleteness.score}%` }}
                />
              </div>
              {profileCompleteness.nudge && (
                <p className="text-xs text-muted-foreground mt-2">{profileCompleteness.nudge}</p>
              )}
            </div>

            <div className="space-y-4 text-sm opacity-80">
              <div className="flex justify-between gap-4 items-center">
                <span>Exam board:</span>
                <span className="text-right">
                  {learnerProfile.curriculum.board ? (
                    <BoardBadge board={learnerProfile.curriculum.board} />
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Study goal:</span>
                <span className="text-right">{studyGoalDisplay}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Grade level:</span>
                <span className="text-right">{gradeLevelDisplay}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Member since:</span>
                <span className="text-right">{memberSince}</span>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-8" title="Learning Profile">
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Goal, year group, and Apex style tune dashboard recommendations, session length defaults, and how direct vs Socratic replies feel.
            </p>
            <div className="space-y-5">
              <label className="block">
                <span className="text-sm text-muted-foreground mb-1.5 block">Study goal</span>
                <select
                  className="neu-input-el w-full"
                  value={studyGoal}
                  onChange={(e) => setStudyGoal(e.target.value as StudyGoal | "")}
                >
                  <option value="">Not set</option>
                  <option value="ace_exams">Maximise exam marks</option>
                  <option value="catch_up">Close topic gaps</option>
                  <option value="build_habits">Build steady routines</option>
                  <option value="understand_better">Understand deeply</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground mb-1.5 block">Year group</span>
                <select
                  className="neu-input-el w-full"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value as GradeLevel | "")}
                >
                  <option value="">Not set</option>
                  <option value="middle_school">Middle School</option>
                  <option value="high_school">High School</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground mb-1.5 block">Apex tutoring style</span>
                <select
                  className="neu-input-el w-full"
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value as AiStyle)}
                >
                  <option value="socratic">Socratic — asks what you&apos;ve tried first</option>
                  <option value="balanced">Balanced — mix of hints and explanations</option>
                  <option value="direct">Direct — clear steps when you&apos;re stuck</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground mb-1.5 block">Explanation depth</span>
                <select
                  className="neu-input-el w-full"
                  value={explanationDepth}
                  onChange={(e) => setExplanationDepth(e.target.value as ExplanationDepth)}
                >
                  <option value="concise">Concise — bullet points and key steps</option>
                  <option value="standard">Standard — balanced detail</option>
                  <option value="detailed">Detailed — full walkthroughs</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground mb-1.5 block">
                  Typical focus session ({sessionMinutes} min)
                </span>
                <input
                  type="range"
                  min={15}
                  max={90}
                  step={5}
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/40">
                <label className="block">
                  <span className="text-sm text-muted-foreground mb-1.5 block">Age (optional)</span>
                  <input
                    type="number"
                    min={10}
                    max={99}
                    className="neu-input-el w-full"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Not set"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-muted-foreground mb-1.5 block">School (optional)</span>
                  <input
                    className="neu-input-el w-full"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Not set"
                    maxLength={120}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm text-muted-foreground mb-1.5 block">Notes for Apex (optional)</span>
                <textarea
                  className="neu-input-el w-full min-h-[72px] resize-y"
                  value={onboardingNotes}
                  onChange={(e) => setOnboardingNotes(e.target.value)}
                  placeholder="Topics you struggle with, report grades, or what you want from VertexED…"
                  maxLength={800}
                />
              </label>
            </div>
            <button
              onClick={() => void saveLearningProfile()}
              disabled={savingProfile}
              className="mt-6 neu-button inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? "Saving…" : "Save learning profile"}
            </button>
          </NeumorphicCard>

          <NeumorphicCard className="p-8" title="Curriculum Preferences">
            <p className="text-sm text-muted-foreground mb-5">
              Your board drives tool defaults, learning paths, and AI terminology across Vertex.
            </p>
            <CurriculumSelector
              value={curriculum}
              onChange={setCurriculum}
              showExamDate
              showSubjects
            />
            <button
              onClick={() => void saveCurriculum()}
              disabled={savingCurriculum}
              className="mt-6 neu-button inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {savingCurriculum ? "Saving…" : "Save curriculum"}
            </button>
          </NeumorphicCard>

          <NeumorphicCard className="p-8" title="Appearance & Accessibility">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Color theme</p>
                <ThemeToggle />
              </div>
              <div className="space-y-4 text-sm border-t border-border/50 pt-5">
              <label className="flex items-center justify-between gap-4">
                <span>High contrast mode</span>
                <input type="checkbox" checked={a11y.highContrast} onChange={(e) => updateA11y({ highContrast: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>Dyslexia-friendly font</span>
                <input type="checkbox" checked={a11y.dyslexiaFont} onChange={(e) => updateA11y({ dyslexiaFont: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>Simple mode (fewer tiles)</span>
                <input type="checkbox" checked={a11y.simpleMode} onChange={(e) => updateA11y({ simpleMode: e.target.checked })} />
              </label>
              <label className="flex items-start justify-between gap-4 border-t border-border/40 pt-4">
                <span>
                  Hide exam readiness score
                  <span className="block text-xs text-muted-foreground mt-1 font-normal leading-relaxed">
                    Removes the readiness ring from your dashboard. Scores are estimates — exam day can always surprise you.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={hideExamReadiness}
                  onChange={(e) => void saveDashboardPrefs(e.target.checked)}
                  className="mt-1"
                />
              </label>
              <div className="flex items-center justify-between gap-4">
                <span>Font size</span>
                <select
                  className="neu-input-el max-w-[10rem]"
                  value={a11y.fontSize}
                  onChange={(e) => updateA11y({ fontSize: e.target.value as typeof a11y.fontSize })}
                >
                  <option value="base">Default</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra large</option>
                </select>
              </div>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-8" title="Saved Study Work">
            {cloudUnavailable && (
              <p className="text-xs text-primary/90 mb-3">
                Cloud sync is off — your work is saved on this device and can be reopened anytime.
              </p>
            )}
            {loadingArtifacts ? (
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                <div className="h-4 w-1/2 rounded skeleton-shimmer" />
              </div>
            ) : artifactError ? (
              <div className="space-y-3">
                <p className="text-sm text-destructive flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                  <span>{artifactError}</span>
                </p>
                <button
                  onClick={() => void loadArtifacts()}
                  className="neu-button px-3 py-2 text-sm inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry loading
                </button>
              </div>
            ) : artifacts.length === 0 ? (
              <div className="space-y-3">
                <ArtifactKindFilter value={kindFilter} onChange={setKindFilter} />
                <p className="text-sm text-muted-foreground">
                  No saved {kindFilter === "all" ? "work" : `${kindFilter}s`} yet — generate some in the tools above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <ArtifactKindFilter value={kindFilter} onChange={setKindFilter} />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {artifacts.length} saved item{artifacts.length === 1 ? "" : "s"}
                  </p>
                  <button
                    onClick={() => void loadArtifacts()}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </button>
                </div>
                <SavedWorkList items={artifacts} onChanged={loadArtifacts} />
              </div>
            )}
          </NeumorphicCard>

          <NeumorphicCard className="p-8" title="Quick Actions">
            <div className="space-y-4">
              <button
                onClick={() => navigate("/main")}
                className="w-full neu-button text-left justify-start gap-3 py-4"
              >
                ← Dashboard
              </button>

              <button
                onClick={() => navigate("/learning-hub")}
                className="w-full neu-button text-left justify-start gap-3 py-4"
              >
                Learning Hub
              </button>

              <button
                onClick={handleLogout}
                className="w-full neu-button text-left justify-start gap-3 py-4 border border-destructive/25 bg-destructive/10 hover:bg-destructive/15 text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>

              <button
                onClick={() => void exportAccountData()}
                disabled={exportingAccount}
                className="w-full neu-button text-left justify-start gap-3 py-4"
                title="Download your cloud profile, saved work, and verified learning records"
              >
                {exportingAccount ? "Preparing account export…" : "Export Account Data"}
              </button>

              <button
                onClick={() => void handleDeleteAccount()}
                disabled={deletingAccount}
                className="w-full neu-button text-left justify-start gap-3 py-4 border border-destructive/25 bg-destructive/10 hover:bg-destructive/15 text-destructive disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deletingAccount ? "Deleting account…" : "Delete Account"}
              </button>
            </div>
          </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}
