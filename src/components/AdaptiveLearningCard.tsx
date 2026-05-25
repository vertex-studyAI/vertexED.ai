import { useEffect, useMemo, useState } from "react";
import {
  Save,
  RotateCcw,
  Brain,
  BarChart3,
  Clock3,
  Target,
  Sparkles,
  BadgeInfo,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import {
  buildAdaptiveSnapshot,
  loadAdaptiveState,
  recordAdaptiveSignal,
  saveAdaptivePreferences,
  type AdaptivePreferences,
} from "@/lib/adaptiveLearning";

type Props = {
  compact?: boolean;
};

const SESSION_OPTIONS = [15, 25, 30, 45, 60, 90] as const;
const FOCUS_OPTIONS: Array<NonNullable<AdaptivePreferences["focusMode"]>> = ["practice", "mixed", "explore"];

function toNumber(value: string | number | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-1 text-[11px] text-white/55">{hint}</div>
    </div>
  );
}

export default function AdaptiveLearningCard({ compact = false }: Props) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const metadataPrefs = (user?.user_metadata?.preferences ?? {}) as AdaptivePreferences;

  const [prefs, setPrefs] = useState<AdaptivePreferences>({
    studyGoal: (user?.user_metadata?.studyGoal ?? metadataPrefs.studyGoal) as AdaptivePreferences["studyGoal"],
    gradeLevel: (user?.user_metadata?.gradeLevel ?? metadataPrefs.gradeLevel) as string | undefined,
    preferredSessionMinutes: toNumber(
      user?.user_metadata?.preferredSessionMinutes ?? metadataPrefs.preferredSessionMinutes,
      25,
    ),
    focusMode: metadataPrefs.focusMode ?? "mixed",
  });

  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [preferredMinutes, setPreferredMinutes] = useState(25);
  const [accuracy, setAccuracy] = useState(0.75);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const nextPrefs = {
      studyGoal: (user?.user_metadata?.studyGoal ?? metadataPrefs.studyGoal) as AdaptivePreferences["studyGoal"],
      gradeLevel: (user?.user_metadata?.gradeLevel ?? metadataPrefs.gradeLevel) as string | undefined,
      preferredSessionMinutes: toNumber(
        user?.user_metadata?.preferredSessionMinutes ?? metadataPrefs.preferredSessionMinutes,
        25,
      ),
      focusMode: metadataPrefs.focusMode ?? "mixed",
    };
    setPrefs(nextPrefs);
    setPreferredMinutes(nextPrefs.preferredSessionMinutes ?? 25);
  }, [user?.id, JSON.stringify(metadataPrefs), refreshTick]);

  const state = useMemo(() => loadAdaptiveState(userId, prefs), [userId, prefs, refreshTick]);
  const snapshot = useMemo(() => buildAdaptiveSnapshot(state, prefs), [state, prefs, refreshTick]);

  useEffect(() => {
    if (!savedNotice) return;
    const id = window.setTimeout(() => setSavedNotice(null), 2200);
    return () => window.clearTimeout(id);
  }, [savedNotice]);

  const persistPreferences = async () => {
    const payload: AdaptivePreferences = {
      ...prefs,
      preferredSessionMinutes: Math.min(90, Math.max(15, preferredMinutes)),
      updatedAt: new Date().toISOString(),
    };

    saveAdaptivePreferences(userId, payload);

    if (supabase && user) {
      const nextMetadata = {
        ...(user.user_metadata ?? {}),
        preferences: {
          ...(metadataPrefs ?? {}),
          ...payload,
        },
        studyGoal: payload.studyGoal,
        gradeLevel: payload.gradeLevel,
        preferredSessionMinutes: payload.preferredSessionMinutes,
      };
      const { error } = await supabase.auth.updateUser({ data: nextMetadata });
      if (error) {
        setSavedNotice(error.message);
        return;
      }
    }

    setPrefs(payload);
    setSavedNotice("Preferences saved");
    setRefreshTick((n) => n + 1);
  };

  const logStudySession = () => {
    const focus = topic.trim() || snapshot.focusTopics[0] || "general study";
    const nextState = recordAdaptiveSignal(
      userId,
      {
        topic: focus,
        subject: focus,
        minutes,
        accuracy,
        source: "account-module",
        notes: "Logged from adaptive learning card",
      },
      prefs,
    );

    setRefreshTick((n) => n + 1);
    setSavedNotice(`Logged session #${nextState.sessions}`);
    setTopic("");
  };

  const resetState = () => {
    if (typeof window === "undefined") return;
    const storageKey = `vz:adaptive:v1:${userId || "guest"}`;
    try {
      window.localStorage.removeItem(storageKey);
      setRefreshTick((n) => n + 1);
      setSavedNotice("Learning data reset");
    } catch {
      setSavedNotice("Could not reset storage");
    }
  };

  return (
    <div className={`rounded-[30px] border border-white/10 bg-white/6 shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur-2xl ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
            <Brain className="h-3.5 w-3.5" />
            Adaptive learning
          </div>
          <h3 className="text-xl font-semibold text-white md:text-2xl">
            {snapshot.goalLabel}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
            {snapshot.coachNote}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
              Focus mode: {prefs.focusMode ?? "mixed"}
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
              Session target: {snapshot.sessionLength} min
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
              {snapshot.focusTopics.length} focus areas
            </span>
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-white/65 lg:min-w-[320px]">
            <StatCard label="Day streak" value={snapshot.streak} hint="consecutive study days" />
            <StatCard label="Sessions" value={snapshot.sessions} hint="logged across this account" />
            <StatCard label="Minutes" value={snapshot.totalMinutes} hint="total study time" />
          </div>
        )}
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? "lg:grid-cols-1" : "xl:grid-cols-2"}`}>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 md:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/85">
            <Target className="h-4 w-4" />
            Today’s recommendation
          </div>
          <p className="text-sm leading-relaxed text-white/75">{snapshot.nextAction}</p>

          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-white/55">
                <span>Session length</span>
                <span>{snapshot.sessionLength} minutes</span>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <div
                  className="h-2 rounded-full bg-white/70"
                  style={{ width: `${Math.min(100, (snapshot.sessionLength / 90) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-white/55">
                <span>Confidence</span>
                <span>{Math.round(accuracy * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <div
                  className="h-2 rounded-full bg-emerald-300/80"
                  style={{ width: `${Math.round(accuracy * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {snapshot.focusTopics.map((topicName) => (
              <span key={topicName} className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
                Focus: {topicName}
              </span>
            ))}
            {snapshot.strengthTopics.map((topicName) => (
              <span key={topicName} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                Strong: {topicName}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 md:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/85">
            <BarChart3 className="h-4 w-4" />
            Learning profile
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-white/75">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/50">Preferred session</div>
              <div className="mt-1 font-semibold text-white">{snapshot.sessionLength} min</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/50">Goal</div>
              <div className="mt-1 font-semibold text-white">{snapshot.goalLabel}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/50">Focus areas</div>
              <div className="mt-1 font-semibold text-white">{snapshot.focusTopics.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/50">Best streak</div>
              <div className="mt-1 font-semibold text-white">{snapshot.streak} days</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white/60">
            <div className="mb-2 flex items-center gap-2 text-white/80">
              <BadgeInfo className="h-4 w-4" />
              Tip
            </div>
            Your account remembers study preferences locally and can sync them to Supabase metadata when available.
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/85">
            <Sparkles className="h-4 w-4" />
            Log a study session
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Topic</span>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, derivatives, TOK"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Minutes</span>
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              >
                {SESSION_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option} min
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Accuracy</span>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={accuracy}
                onChange={(e) => setAccuracy(Number(e.target.value))}
                className="w-full accent-white"
              />
              <div className="mt-1 text-xs text-white/55">{Math.round(accuracy * 100)}% confidence</div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/45">Focus mode</span>
              <select
                value={prefs.focusMode ?? "mixed"}
                onChange={(e) => setPrefs((prev) => ({ ...prev, focusMode: e.target.value as AdaptivePreferences["focusMode"] }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              >
                {FOCUS_OPTIONS.map((mode) => (
                  <option key={mode} value={mode} className="bg-slate-900">
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={logStudySession}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark"
            >
              <Clock3 className="h-4 w-4" />
              Log session
            </button>
            <button
              type="button"
              onClick={persistPreferences}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
            >
              <Save className="h-4 w-4" />
              Save preferences
            </button>
            <button
              type="button"
              onClick={resetState}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              Reset data
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/85">
            <Clock3 className="h-4 w-4" />
            Account snapshot
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">Recommended</div>
              <div className="mt-2 text-sm text-white/80">{snapshot.nextAction}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">Goal label</div>
              <div className="mt-2 text-sm text-white/80">{snapshot.goalLabel}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">Current streak</div>
              <div className="mt-2 text-sm text-white/80">{snapshot.streak} days</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/45">Total time</div>
              <div className="mt-2 text-sm text-white/80">{snapshot.totalMinutes} min</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            <TrendingUp className="mr-2 inline h-3.5 w-3.5 align-middle" />
            {savedNotice ?? "Adaptive suggestions update as you log sessions and refine preferences."}
          </div>
        </div>
      </div>
    </div>
  );
}
