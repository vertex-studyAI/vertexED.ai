import { resolveLocalStorage, safeStorageGet, safeStorageSet } from '@/lib/browserStorage.mjs';
import { localDayKey } from '@/lib/studyDates.mjs';
import { getStudyStats } from '@/lib/studyStats';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { getWeaknessHeatmap, getMeasuredEntries } from '@/lib/weaknessTracker';
import {
  countRecentAttempts,
  estimateStudyMinutes,
  normalizeProgressSnapshots,
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

function storage() {
  return typeof window === 'undefined' ? null : resolveLocalStorage(window);
}

function todayKey(): string {
  return localDayKey();
}

function readSnapshots(): DailySnapshot[] {
  const raw = safeStorageGet(storage(), storageKey());
  if (!raw) return [];
  try {
    return normalizeProgressSnapshots(JSON.parse(raw)) as DailySnapshot[];
  } catch {
    return [];
  }
}

function writeSnapshots(snapshots: DailySnapshot[]) {
  safeStorageSet(storage(), storageKey(), JSON.stringify(snapshots.slice(-30)));
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
  const cutoff = localDayKey(new Date(Date.now() - 7 * 86400000));
  const last7 = snapshots.filter(snapshot => snapshot.date > cutoff && snapshot.date <= todayKey()).sort((a, b) => a.date.localeCompare(b.date));
  const reviewsThisWeek = countRecentAttempts(getMeasuredEntries());
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
