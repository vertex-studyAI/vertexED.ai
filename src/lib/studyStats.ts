import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

export type StudyStats = {
  habitCount: number;
  habitsDoneToday: number;
  activityEntries: number;
  quickNotes: number;
  studyStreak: number;
  lastStudyDate: string | null;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Reset daily habit completion flags at the start of a new day. */
export function ensureDailyHabitReset(): void {
  if (typeof window === "undefined") return;
  const { habits, habitsResetDate } = userContentStorageKeys();
  const today = todayKey();
  const lastReset = window.localStorage.getItem(habitsResetDate);
  if (lastReset === today) return;

  const currentHabits = readJson<Array<{ completed?: boolean }>>(habits, []);
  if (currentHabits.some((habit) => habit.completed)) {
    const reset = currentHabits.map((habit) => ({ ...habit, completed: false }));
    window.localStorage.setItem(habits, JSON.stringify(reset));
  }
  window.localStorage.setItem(habitsResetDate, today);
}

/** Call when user completes a meaningful study action. */
export function recordStudySession(): void {
  if (typeof window === "undefined") return;
  const { studyStreak, lastStudyDate } = userContentStorageKeys();
  const today = todayKey();
  const last = window.localStorage.getItem(lastStudyDate);
  let streak = Number(window.localStorage.getItem(studyStreak) || "0");

  if (last === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (last === yesterdayKey) streak += 1;
  else streak = 1;

  window.localStorage.setItem(studyStreak, String(streak));
  window.localStorage.setItem(lastStudyDate, today);
}

export function getStudyStats(): StudyStats {
  ensureDailyHabitReset();
  const {
    activity,
    quickNotes,
    habits,
    studyStreak,
    lastStudyDate,
  } = userContentStorageKeys();
  const currentHabits = readJson<{ completed?: boolean }[]>(habits, []);
  const entries = readJson<unknown[]>(activity, []);
  const notes = readJson<unknown[]>(quickNotes, []);
  const streak = Number(
    typeof window !== "undefined" ? window.localStorage.getItem(studyStreak) || "0" : "0",
  );
  const lastStudy =
    typeof window !== "undefined" ? window.localStorage.getItem(lastStudyDate) : null;

  return {
    habitCount: currentHabits.length,
    habitsDoneToday: currentHabits.filter((h) => h.completed).length,
    activityEntries: entries.length,
    quickNotes: notes.length,
    studyStreak: streak,
    lastStudyDate: lastStudy,
  };
}
