import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import PageSection from "@/components/PageSection";
import { useEffect, useState } from "react";
import { getStudyStats } from "@/lib/studyStats";
import { listStudyArtifacts, type StudyArtifact } from "@/lib/userContent";

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

  useEffect(() => {
    listStudyArtifacts().then(setArtifacts);
  }, []);

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
    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        username: user?.user_metadata?.username ?? null,
        email: user?.email ?? null,
        studyGoal: user?.user_metadata?.study_goal ?? null,
        gradeLevel: user?.user_metadata?.grade_level ?? null,
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
  const studyGoal = (user?.user_metadata?.study_goal as string | undefined) || "—";
  const gradeLevel = (user?.user_metadata?.grade_level as string | undefined) || "—";

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

          <NeumorphicCard className="p-8" title="Saved Study Work">
            {artifacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Generate notes, papers, or reviews — they&apos;ll appear here when cloud save is active.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {artifacts.slice(0, 12).map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between gap-3 border-b border-white/10 pb-2 last:border-0"
                  >
                    <span className="text-foreground truncate">{item.title || item.kind}</span>
                    <span className="text-muted-foreground shrink-0 capitalize">{item.kind}</span>
                  </li>
                ))}
              </ul>
            )}
          </NeumorphicCard>

          <NeumorphicCard className="p-8" title="Quick Actions">
            <div className="space-y-4">
              <button
                onClick={() => navigate("/main")}
                className="w-full neu-button text-left justify-start gap-3 py-4"
              >
                ← Back to Dashboard
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
