import { getStudyStats } from '@/lib/studyStats';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';

const SNAPSHOT_KEY = 'vertex_progress_snapshots';

export type DailySnapshot = {
  date: string;
  studyStreak: number;
  habitsDone: number;
  habitCount: number;
  reviewsCompleted: number;
  avgMastery: number;
};

export type ProgressTrend = {
  snapshots: DailySnapshot[];
  streakDays: number;
  reviewsThisWeek: number;
  masteryTrend: 'up' | 'down' | 'flat';
  avgMastery: number;
  studyMinutesEstimate: number;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readSnapshots(): DailySnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as DailySnapshot[]) : [];
  } catch {
    return [];
  }
}

function writeSnapshots(snapshots: DailySnapshot[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots.slice(-30)));
}

export function recordDailySnapshot() {
  const stats = getStudyStats();
  const heatmap = getWeaknessHeatmap(20);
  const avgMastery =
    heatmap.length > 0
      ? Math.round(heatmap.reduce((s, h) => s + h.avgPercent, 0) / heatmap.length)
      : 50;

  const today = todayKey();
  const snapshots = readSnapshots().filter((s) => s.date !== today);
  snapshots.push({
    date: today,
    studyStreak: stats.studyStreak,
    habitsDone: stats.habitsDoneToday,
    habitCount: stats.habitCount,
    reviewsCompleted: heatmap.reduce((s, h) => s + h.attempts, 0),
    avgMastery,
  });
  writeSnapshots(snapshots);
}

export function getProgressTrend(): ProgressTrend {
  recordDailySnapshot();
  const snapshots = readSnapshots();
  const stats = getStudyStats();
  const last7 = snapshots.slice(-7);
  const reviewsThisWeek = last7.reduce((s, d) => s + d.reviewsCompleted, 0);

  let masteryTrend: ProgressTrend['masteryTrend'] = 'flat';
  if (last7.length >= 2) {
    const first = last7[0].avgMastery;
    const last = last7[last7.length - 1].avgMastery;
    if (last > first + 3) masteryTrend = 'up';
    else if (last < first - 3) masteryTrend = 'down';
  }

  const avgMastery = last7.length
    ? Math.round(last7.reduce((s, d) => s + d.avgMastery, 0) / last7.length)
    : 50;

  const studyMinutesEstimate = stats.studyStreak * 25 + stats.habitsDoneToday * 15;

  return {
    snapshots: last7,
    streakDays: stats.studyStreak,
    reviewsThisWeek,
    masteryTrend,
    avgMastery,
    studyMinutesEstimate,
  };
}
