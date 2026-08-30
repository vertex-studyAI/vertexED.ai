import { getStudyStats } from '@/lib/studyStats';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';
import {
  estimateStudyMinutes,
  summarizeHeatmapMastery,
  summarizeSnapshotMastery,
} from '@/lib/progressAnalyticsCore.mjs';

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

export function recordDailySnapshot() {
  const stats = getStudyStats();
  const heatmap = getWeaknessHeatmap(20);
  const { reviewsCompleted, avgMastery } = summarizeHeatmapMastery(heatmap);

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
  const { avgMastery, masteryTrend } = summarizeSnapshotMastery(last7);

  return {
    snapshots: last7,
    streakDays: stats.studyStreak,
    reviewsThisWeek,
    masteryTrend,
    avgMastery,
    // Explicitly named as an estimate so consumers cannot mistake it for measured time.
    estimatedStudyMinutes: estimateStudyMinutes(stats),
  };
}
