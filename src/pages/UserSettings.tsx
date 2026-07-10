import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import SavedWorkList, { ArtifactKindFilter } from "@/components/SavedWorkList";
import CurriculumSelector from "@/components/curriculum/CurriculumSelector";
import BoardBadge from "@/components/curriculum/BoardBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, RefreshCw, AlertTriangle, Save } from "lucide-react";
import PageSection from "@/components/PageSection";
import { useEffect, useState } from "react";
import { getStudyStats } from "@/lib/studyStats";
import { getLearnerProfile, gradeLevelLabel, studyGoalLabel } from "@/lib/learnerProfile";
import { buildCurriculumMetadata } from "@/lib/curriculum";
import type { CurriculumPreference } from "@/types/curriculum";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { useAccessibility } from "@/hooks/useAccessibility";
import ThemeToggle from "@/components/ThemeToggle";
import {
  listStudyArtifacts,
  listStudyArtifactsDetailed,
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
  const [curriculum, setCurriculum] = useState<CurriculumPreference>(learnerProfile.curriculum);
  const [savingCurriculum, setSavingCurriculum] = useState(false);
  const { settings: a11y, update: updateA11y } = useAccessibility();

  useEffect(() => {
    setCurriculum(getLearnerProfile(user).curriculum);
  }, [user]);

  const saveCurriculum = async () => {
    if (!supabase) return;
    setSavingCurriculum(true);
    try {
      const metadata = buildCurriculumMetadata(curriculum, user?.user_metadata ?? {});
      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;
      toast({ title: "Curriculum saved", description: "Your board and subjects are updated across all tools." });
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" });
    } finally {
      setSavingCurriculum(false);
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

  const exportAccountData = async () => {
    const saved = await listStudyArtifacts();
    const stats = getStudyStats();
    const learner = getLearnerProfile(user);
    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        username: user?.user_metadata?.username ?? null,
        email: user?.email ?? null,
        studyGoal: learner.studyGoal,
        gradeLevel: learner.gradeLevel,
        curriculum: learner.curriculum,
        memberSince: profile?.created_at ?? user?.created_at ?? null,
        profileName: profile?.full_name ?? null,
      },
      studyStats: stats,
      savedArtifacts: saved,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vertex_account_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayName =
    (user?.user_metadata?.username as string | undefined) ||
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Student";

  const memberSince = formatMemberSince(profile?.created_at ?? user?.created_at);
  const studyGoal = studyGoalLabel(learnerProfile.studyGoal) || "—";
  const gradeLevel = gradeLevelLabel(learnerProfile.gradeLevel) || "—";

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
              <div>
                <h3 className="text-xl font-medium">{displayName}</h3>
                <p className="opacity-70">{user?.email ?? "Vertex Student Account"}</p>
              </div>
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
                <span className="text-right">{studyGoal}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Grade level:</span>
                <span className="text-right">{gradeLevel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Member since:</span>
                <span className="text-right">{memberSince}</span>
              </div>
            </div>
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
              <p className="text-xs text-sky-300/90 mb-3">
                Cloud sync is off — your work is saved on this device and can be reopened anytime.
              </p>
            )}
            {loadingArtifacts ? (
              <p className="text-sm text-muted-foreground">Loading saved study work...</p>
            ) : artifactError ? (
              <div className="space-y-3">
                <p className="text-sm text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
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
                className="w-full neu-button text-left justify-start gap-3 py-4 bg-white/5 hover:bg-white/10"
              >
                Learning Hub
              </button>

              <button
                onClick={handleLogout}
                className="w-full neu-button text-left justify-start gap-3 py-4 border border-red-500/20 bg-red-500/10 hover:bg-red-500/15"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>

              <button
                onClick={exportAccountData}
                className="w-full neu-button text-left justify-start gap-3 py-4 bg-white/5 hover:bg-white/10"
                title="Download your account profile data"
              >
                Export Account Data
              </button>
            </div>
          </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}
