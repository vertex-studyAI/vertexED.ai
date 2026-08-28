import { getStudyStats } from '@/lib/studyStats';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';

export type DailySnapshot = {
  date: string;
  studyStreak: number;
  habitsDone: number;
  habitCount: number;
  reviewsCompleted: number;
  avgMastery: number;
  /** Number of tracked topic aggregates used to compute avgMastery. */
  masterySampleCount?: number;
};

export type ProgressTrend = {
  snapshots: DailySnapshot[];
  streakDays: number;
  reviewsThisWeek: number;
  masteryTrend: 'up' | 'down' | 'flat';
  avgMastery: number;
  hasMasteryData: boolean;
  studyMinutesEstimate: number;
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

export function recordDailySnapshot() {
  const stats = getStudyStats();
  const heatmap = getWeaknessHeatmap(20);
  const masterySampleCount = heatmap.length;
  const avgMastery = masterySampleCount
    ? Math.round(heatmap.reduce((s, h) => s + h.avgPercent, 0) / masterySampleCount)
    : 0;

  const today = todayKey();
  const snapshots = readSnapshots().filter((s) => s.date !== today);
  snapshots.push({
    date: today,
    studyStreak: stats.studyStreak,
    habitsDone: stats.habitsDoneToday,
    habitCount: stats.habitCount,
    reviewsCompleted: heatmap.reduce((s, h) => s + h.attempts, 0),
    avgMastery,
    masterySampleCount,
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

  // Legacy snapshots did not record whether mastery was measured and used a
  // synthetic default. Treat them as unavailable instead of silently carrying
  // that placeholder into evidence-facing analytics.
  const masterySnapshots = last7.filter((snapshot) => (snapshot.masterySampleCount ?? 0) > 0);
  const hasMasteryData = masterySnapshots.length > 0;

  let masteryTrend: ProgressTrend['masteryTrend'] = 'flat';
  if (masterySnapshots.length >= 2) {
    const first = masterySnapshots[0].avgMastery;
    const last = masterySnapshots[masterySnapshots.length - 1].avgMastery;
    if (last > first + 3) masteryTrend = 'up';
    else if (last < first - 3) masteryTrend = 'down';
  }

  const avgMastery = hasMasteryData
    ? Math.round(masterySnapshots.reduce((s, d) => s + d.avgMastery, 0) / masterySnapshots.length)
    : 0;

  // This remains a heuristic convenience estimate, not measured study time.
  const studyMinutesEstimate = stats.studyStreak * 25 + stats.habitsDoneToday * 15;

  return {
    snapshots: last7,
    streakDays: stats.studyStreak,
    reviewsThisWeek,
    masteryTrend,
    avgMastery,
    hasMasteryData,
    studyMinutesEstimate,
  };
}
