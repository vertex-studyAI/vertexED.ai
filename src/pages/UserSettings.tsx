import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import SavedWorkList, { ArtifactKindFilter } from "@/components/SavedWorkList";
import CurriculumSelector from "@/components/curriculum/CurriculumSelector";
import BoardBadge from "@/components/curriculum/BoardBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router";
import { User, LogOut, Settings, RefreshCw, AlertTriangle, Save, Trash2 } from "lucide-react";
import PageSection from "@/components/PageSection";
import { useCallback, useEffect, useState } from "react";
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
import { validExamDate } from "@/lib/examTargets.mjs";
import type { CurriculumPreference } from "@/types/curriculum";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { useAccessibility } from "@/hooks/useAccessibility";
import ThemeToggle from "@/components/ThemeToggle";
import {
  listStudyArtifactsDetailed,
  type StudyArtifact,
  type StudyArtifactKind,
} from "@/lib/userContent";
import { authFetch, authFetchWithAccessToken, getAccessToken } from "@/lib/apiAuth";
import { collectCompleteDeviceStudyData, clearDeviceAccountData, downloadAccountExport } from "@/lib/accountExport";
import { getUserContentStorageScope } from "@/lib/userContentStorageScope.mjs";
import { logoutWithLocalFallback } from "@/lib/logoutFlow.mjs";

function formatMemberSince(createdAt?: string | null): string {
  if (!createdAt) return " - ";
  try {
    return new Date(createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return " - ";
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
  const [artifactTotal, setArtifactTotal] = useState(0);
  const [nextArtifactOffset, setNextArtifactOffset] = useState<number | null>(null);
  const [loadingMoreArtifacts, setLoadingMoreArtifacts] = useState(false);
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
  const [savingCurriculum, setSavingCurriculum] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingAccount, setExportingAccount] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const { settings: a11y, update: updateA11y } = useAccessibility();

  useEffect(() => {
    const profile = getLearnerProfile(user);
    setCurriculum(profile.curriculum);
    setStudyGoal(profile.studyGoal ?? "");
    setGradeLevel(profile.gradeLevel ?? "");
    setAiStyle(profile.preferences.aiStyle);
    setExplanationDepth(profile.preferences.explanationDepth);
    setSessionMinutes(profile.preferences.sessionMinutes);
  }, [user]);

  const saveCurriculum = async () => {
    if (!supabase || !user) return;
    setSavingCurriculum(true);
    try {
      if (curriculum.examTargets?.some((target) => !validExamDate(target.date))) {
        throw new Error('Choose a valid date for each exam, or remove the unfinished entry.');
      }
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
    if (!supabase) return;
    setSavingProfile(true);
    try {
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
      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;
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

  const loadArtifacts = useCallback(async (offset = 0) => {
    if (offset === 0) setLoadingArtifacts(true);
    else setLoadingMoreArtifacts(true);
    const result = await listStudyArtifactsDetailed(
      kindFilter === "all" ? undefined : kindFilter,
      { offset, limit: 30 },
    );
    setArtifacts((current) => {
      if (offset === 0) return result.items;
      const byId = new Map(current.map((item) => [item.id, item]));
      for (const item of result.items) byId.set(item.id, item);
      return [...byId.values()];
    });
    if (offset === 0 || result.ok) {
      setArtifactTotal(result.total ?? result.items.length);
      setNextArtifactOffset(result.nextOffset ?? null);
    }
    setCloudUnavailable(Boolean(result.cloudUnavailable));
    setArtifactError(
      result.cloudUnavailable
        ? null
        : result.ok
          ? null
          : result.error || "Unable to load saved work.",
    );
    if (offset === 0) setLoadingArtifacts(false);
    else setLoadingMoreArtifacts(false);
  }, [kindFilter]);

  useEffect(() => {
    void loadArtifacts();
  }, [loadArtifacts]);

  const handleLogout = async () => {
    try {
      const result = await logoutWithLocalFallback(logout);
      if (result.scope === "local") {
        toast({
          title: "Signed out on this device",
          description: "Other active sessions could not be revoked. Sign out there separately if needed.",
        });
      }
      navigate("/", { replace: true });
    } catch (error) {
      toast({
        title: "Could not sign out",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const linkGoogleIdentity = async () => {
    if (!supabase || !user) return;
    setLinkingGoogle(true);
    sessionStorage.setItem("vertex_google_link_return", "/user-settings");
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      sessionStorage.removeItem("vertex_google_link_return");
      toast({
        title: "Could not connect Google",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
      setLinkingGoogle(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your VertexED account permanently? Saved work in the cloud will be removed. This cannot be undone.",
    );
    if (!confirmed) return;

    if (!user) return;
    const deletedUserId = user.id;
    let cloudDeleted = false;
    setDeletingAccount(true);
    try {
      const res = await authFetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Account deletion failed");
      }
      cloudDeleted = true;
      try { await clearDeviceAccountData(deletedUserId); }
      finally { await logout({ localOnly: true }); }
      toast({ title: "Account deleted" });
      navigate("/", { replace: true });
    } catch (err) {
      toast({
        title: cloudDeleted ? "Cloud account deleted; browser cleanup needs attention" : "Could not delete account",
        description: err instanceof Error ? err.message : "Try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const exportAccountData = async () => {
    if (!user) return;
    setExportingAccount(true);
    const expectedUserId = user.id;
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Your session is unavailable.");
      const response = await authFetchWithAccessToken("/api/account-export", accessToken);
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Account export failed.");
      if (getUserContentStorageScope() !== expectedUserId) {
        throw new Error("Account changed while the export was being prepared.");
      }
      downloadAccountExport({
        ...data,
        deviceData: await collectCompleteDeviceStudyData(expectedUserId),
      });
      toast({ title: "Account data exported" });
    } catch (error) {
      toast({
        title: "Could not export account data",
        description: error instanceof Error ? error.message : "Try again later.",
        variant: "destructive",
      });
    } finally {
      setExportingAccount(false);
    }
  };

  const exportDeviceBackup = async () => {
    if (!user) return;
    setExportingAccount(true);
    try {
      downloadAccountExport({ exportScope: 'current-device-only', exportedAt: new Date().toISOString(), deviceData: await collectCompleteDeviceStudyData(user.id) });
      toast({ title: 'Device backup exported', description: 'Cloud-only records are not included in this backup.' });
    } catch (error) {
      toast({ title: 'Could not export device backup', description: error instanceof Error ? error.message : 'Check browser storage access.', variant: 'destructive' });
    } finally { setExportingAccount(false); }
  };

  const displayName =
    (user?.user_metadata?.username as string | undefined) ||
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Student";

  const memberSince = formatMemberSince(profile?.created_at ?? user?.created_at);
  const studyGoalDisplay = studyGoalLabel(learnerProfile.studyGoal) || " - ";
  const gradeLevelDisplay = gradeLevelLabel(learnerProfile.gradeLevel) || " - ";

  return (
    <>
      <Helmet>
        <title>Vertex - Account Settings</title>
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
                    " - "
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

          <NeumorphicCard className="p-8" title="Sign-in methods">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your approved email and password are your primary sign-in method. Connect the same Google account to use Google sign-in without creating a second VertexED account.
            </p>
            {user?.identities?.some((identity) => identity.provider === "google") ? (
              <p className="mt-4 text-sm font-medium text-emerald-300">Google is connected to this account.</p>
            ) : (
              <button
                type="button"
                onClick={() => void linkGoogleIdentity()}
                disabled={linkingGoogle}
                className="neu-button mt-5 px-4 py-2 disabled:opacity-60"
              >
                {linkingGoogle ? "Connecting Google…" : "Connect Google sign-in"}
              </button>
            )}
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
                  <option value="socratic">Socratic - asks what you&apos;ve tried first</option>
                  <option value="balanced">Balanced - mix of hints and explanations</option>
                  <option value="direct">Direct - clear steps when you&apos;re stuck</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground mb-1.5 block">Explanation depth</span>
                <select
                  className="neu-input-el w-full"
                  value={explanationDepth}
                  onChange={(e) => setExplanationDepth(e.target.value as ExplanationDepth)}
                >
                  <option value="concise">Concise - bullet points and key steps</option>
                  <option value="standard">Standard - balanced detail</option>
                  <option value="detailed">Detailed - full walkthroughs</option>
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
                Cloud sync is off - your work is saved on this device and can be reopened anytime.
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
                  No saved {kindFilter === "all" ? "work" : `${kindFilter}s`} yet - generate some in the tools above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <ArtifactKindFilter value={kindFilter} onChange={setKindFilter} />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {artifactTotal || artifacts.length} saved item{(artifactTotal || artifacts.length) === 1 ? "" : "s"}
                  </p>
                  <button
                    onClick={() => void loadArtifacts()}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </button>
                </div>
                <SavedWorkList items={artifacts} onChanged={() => loadArtifacts(0)} />
                {nextArtifactOffset !== null && (
                  <button
                    type="button"
                    onClick={() => void loadArtifacts(nextArtifactOffset)}
                    disabled={loadingMoreArtifacts}
                    className="neu-button w-full py-2.5 text-sm disabled:opacity-60"
                  >
                    {loadingMoreArtifacts ? "Loading more…" : "Load more saved work"}
                  </button>
                )}
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
                onClick={() => navigate("/planner")}
                className="w-full neu-button text-left justify-start gap-3 py-4"
              >
                Open planner
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
                title="Download a complete account and study-data export"
              >
                {exportingAccount ? "Preparing complete export…" : "Export Account Data"}
              </button>

              <button
                onClick={() => void exportDeviceBackup()}
                disabled={exportingAccount}
                className="w-full neu-button text-left justify-start gap-3 py-4"
                title="Download current-device study work, including unsynced changes, without contacting the server"
              >
                Export Device Backup
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
