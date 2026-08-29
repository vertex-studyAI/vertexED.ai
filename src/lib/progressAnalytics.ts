import { getStudyStats } from '@/lib/studyStats';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';

export type DailySnapshot = {
  date: string;
  studyStreak: number;
  habitsDone: number;
  habitCount: number;
  reviewsCompleted: number;
  /** Null means there was no measured assessment evidence for this snapshot. */
  avgMastery: number | null;
};

export type ProgressTrend = {
  snapshots: DailySnapshot[];
  streakDays: number;
  reviewsThisWeek: number;
  masteryTrend: 'up' | 'down' | 'flat';
  /** Measured mastery only. Null means insufficient measured assessment evidence. */
  avgMastery: number | null;
  /** Heuristic estimate, not measured study time. */
  estimatedStudyMinutes: number;
};

function storageKey() {
  return userContentStorageKeys().progressSnapshots;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readSnapshots(): DailySnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey());
    return raw ? (JSON.parse(raw) as DailySnapshot[]) : [];
  } catch {
    return [];
  }
}

function writeSnapshots(snapshots: DailySnapshot[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(), JSON.stringify(snapshots.slice(-30)));
}

function hasMeasuredMastery(snapshot: DailySnapshot): snapshot is DailySnapshot & { avgMastery: number } {
  // `reviewsCompleted > 0` also prevents legacy no-data snapshots whose old fallback
  // stored a synthetic 50 from being treated as measured evidence.
  return (
    snapshot.reviewsCompleted > 0 &&
    typeof snapshot.avgMastery === 'number' &&
    Number.isFinite(snapshot.avgMastery)
  );
}

export function recordDailySnapshot() {
  const stats = getStudyStats();
  const heatmap = getWeaknessHeatmap(20);
  const reviewsCompleted = heatmap.reduce((s, h) => s + h.attempts, 0);
  const avgMastery =
    heatmap.length > 0 && reviewsCompleted > 0
      ? Math.round(heatmap.reduce((s, h) => s + h.avgPercent, 0) / heatmap.length)
      : null;

  const today = todayKey();
  const snapshots = readSnapshots().filter((s) => s.date !== today);
  snapshots.push({
    date: today,
    studyStreak: stats.studyStreak,
    habitsDone: stats.habitsDoneToday,
    habitCount: stats.habitCount,
    reviewsCompleted,
    avgMastery,
  });
  writeSnapshots(snapshots);
}

/** Read trend data; optionally record today's snapshot first (call once per mount, not on every render). */
export function getProgressTrend(recordSnapshot = false): ProgressTrend {
  if (recordSnapshot) recordDailySnapshot();
  const snapshots = readSnapshots();
  const stats = getStudyStats();
  const last7 = snapshots.slice(-7);
  const reviewsThisWeek = last7.reduce((s, d) => s + d.reviewsCompleted, 0);
  const measuredMastery = last7.filter(hasMeasuredMastery);

  let masteryTrend: ProgressTrend['masteryTrend'] = 'flat';
  if (measuredMastery.length >= 2) {
    const first = measuredMastery[0].avgMastery;
    const last = measuredMastery[measuredMastery.length - 1].avgMastery;
    if (last > first + 3) masteryTrend = 'up';
    else if (last < first - 3) masteryTrend = 'down';
  }

  const avgMastery = measuredMastery.length
    ? Math.round(measuredMastery.reduce((s, d) => s + d.avgMastery, 0) / measuredMastery.length)
    : null;

  // This remains a heuristic derived from streak/habit counters. Naming it as an
  // estimate prevents evidence-oriented consumers from presenting it as measured time.
  const estimatedStudyMinutes = stats.studyStreak * 25 + stats.habitsDoneToday * 15;

  return {
    snapshots: last7,
    streakDays: stats.studyStreak,
    reviewsThisWeek,
    masteryTrend,
    avgMastery,
    estimatedStudyMinutes,
  };
}
