import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { User, LogOut, Settings, Download, Sparkles, BadgeInfo, CopyCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";
import AdaptiveLearningCard from "@/components/AdaptiveLearningCard";
import { useAuth } from "@/contexts/AuthContext";

function safeValue(value: unknown, fallback = "Not set") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-1 text-sm text-white/85">{value}</div>
    </div>
  );
}

export default function UserSettings() {
  const { logout, user, profile } = useAuth();
  const navigate = useNavigate();

  const metadata = user?.user_metadata ?? {};
  const displayName =
    (typeof metadata.username === "string" && metadata.username.trim()) ||
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Student";

  const accountSummary = useMemo(
    () => [
      { label: "Email", value: user?.email ?? "Not signed in" },
      { label: "Username", value: metadata.username ?? "Not set" },
      { label: "Study goal", value: metadata.preferences?.studyGoal ?? metadata.studyGoal ?? "Not set" },
      { label: "Grade level", value: metadata.preferences?.gradeLevel ?? metadata.gradeLevel ?? "Not set" },
    ],
    [metadata, user?.email],
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Logout error", e);
    } finally {
      navigate("/", { replace: true });
    }
  };

  const exportAccountData = () => {
    const data = {
      accountType: "Free Tier",
      memberSince: profile?.created_at ?? "Today",
      username: metadata.username || null,
      email: user?.email || null,
      studyGoal: metadata.preferences?.studyGoal ?? metadata.studyGoal ?? null,
      gradeLevel: metadata.preferences?.gradeLevel ?? metadata.gradeLevel ?? null,
      preferredSessionMinutes: metadata.preferences?.preferredSessionMinutes ?? metadata.preferredSessionMinutes ?? null,
      adaptiveLearning: true,
      adaptiveSnapshot: true,
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

  return (
    <>
      <Helmet>
        <title>Vertex — Account Settings</title>
        <meta name="description" content="Manage your Vertex account settings and preferences." />
        <link rel="canonical" href="https://www.vertexed.app/user-settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="max-w-[1280px] space-y-6" surface="none">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-transparent p-6 md:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
                <Settings className="h-3.5 w-3.5" />
                Account controls
              </div>
              <h1 className="text-3xl font-semibold tracking-tight brand-text-gradient flex items-center gap-3">
                <User className="h-8 w-8" />
                {displayName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
                Manage your account, tune your learning preferences, and keep your adaptive study profile in sync across sessions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportAccountData}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark"
              >
                <Download className="h-4 w-4" />
                Export data
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {accountSummary.map((item) => (
              <InfoRow key={item.label} label={item.label} value={safeValue(item.value)} />
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
            <BadgeInfo className="mr-2 inline h-4 w-4 align-middle" />
            Your preferences are saved locally and can be synced to your Supabase auth metadata when available.
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 md:p-6 shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white/80" />
              <h2 className="text-xl font-semibold text-white">Adaptive learning profile</h2>
            </div>
            <AdaptiveLearningCard compact />
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 md:p-6 shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-2">
                <CopyCheck className="h-5 w-5 text-white/80" />
                <h2 className="text-xl font-semibold text-white">Saved account details</h2>
              </div>

              <div className="grid gap-3">
                {accountSummary.map((item) => (
                  <InfoRow key={item.label} label={item.label} value={safeValue(item.value)} />
                ))}
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/65">
                  <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-white/45">Member status</div>
                  <div>{profile?.created_at ? `Joined ${new Date(profile.created_at).toLocaleDateString()}` : "Recently joined"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 md:p-6 shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-white/80" />
                <h2 className="text-xl font-semibold text-white">What this account remembers</h2>
              </div>
              <p className="text-sm leading-relaxed text-white/65">
                Study goal, grade level, preferred session length, and adaptive session history are all preserved to make future recommendations feel personal rather than generic.
              </p>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
