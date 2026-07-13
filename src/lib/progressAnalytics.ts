import { getStudyStats } from '@/lib/studyStats';

const SNAPSHOT_KEY = 'vertex_progress_snapshots';

export type DailySnapshot = {
  date: string;
  studyStreak: number;
  habitsDone: number;
  habitCount: number;
  reviewsCompleted: number;
  avgMastery: number | null;
};

export type ProgressTrend = {
  snapshots: DailySnapshot[];
  streakDays: number;
  reviewsThisWeek: number;
  masteryTrend: 'up' | 'down' | 'flat' | 'unknown';
  avgMastery: number | null;
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
  const today = todayKey();
  const snapshots = readSnapshots().filter((s) => s.date !== today);
  snapshots.push({
    date: today,
    studyStreak: stats.studyStreak,
    habitsDone: stats.habitsDoneToday,
    habitCount: stats.habitCount,
    reviewsCompleted: 0,
    avgMastery: null,
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
  const masterySnapshots = last7.filter((snapshot) => typeof snapshot.avgMastery === 'number');
  let masteryTrend: ProgressTrend['masteryTrend'] = 'unknown';
  if (masterySnapshots.length >= 2) {
    const first = masterySnapshots[0].avgMastery ?? 0;
    const last = masterySnapshots[masterySnapshots.length - 1].avgMastery ?? 0;
    if (last > first + 3) masteryTrend = 'up';
    else if (last < first - 3) masteryTrend = 'down';
    else masteryTrend = 'flat';
  }

  const avgMastery = masterySnapshots.length
    ? Math.round(masterySnapshots.reduce((sum, snapshot) => sum + (snapshot.avgMastery ?? 0), 0) / masterySnapshots.length)
    : null;

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
