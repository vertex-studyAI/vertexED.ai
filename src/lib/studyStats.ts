import { localDayKey, currentStreak } from '@/lib/studyDates.mjs';
import { resolveLocalStorage, safeStorageGet, safeStorageSet } from '@/lib/browserStorage.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

export type StudyStats = {
  habitCount: number;
  habitsDoneToday: number;
  activityEntries: number;
  quickNotes: number;
  studyStreak: number;
  lastStudyDate: string | null;
};

type HabitRow = { completed?: boolean };

function storage() {
  return typeof window === 'undefined' ? null : resolveLocalStorage(window);
}

function readArray(key: string): unknown[] {
  try {
    const raw = safeStorageGet(storage(), key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readHabits(key: string): HabitRow[] {
  return readArray(key).filter(
    (value): value is HabitRow => Boolean(value) && typeof value === 'object' && !Array.isArray(value),
  );
}

function todayKey(): string {
  return localDayKey();
}

/** Reset daily habit completion flags at the start of a new day. */
export function ensureDailyHabitReset(): void {
  const local = storage();
  if (!local) return;
  const { habits, habitsResetDate } = userContentStorageKeys();
  const today = todayKey();
  const lastReset = safeStorageGet(local, habitsResetDate);
  if (lastReset === today) return;

  const currentHabits = readHabits(habits);
  if (currentHabits.some((habit) => habit.completed)) {
    const reset = currentHabits.map((habit) => ({ ...habit, completed: false }));
    if (!safeStorageSet(local, habits, JSON.stringify(reset))) return;
  }
  safeStorageSet(local, habitsResetDate, today);
}

/** Call when user completes a meaningful study action. */
export function recordStudySession(): void {
  const local = storage();
  if (!local) return;
  const { studyStreak, lastStudyDate } = userContentStorageKeys();
  const today = todayKey();
  const last = safeStorageGet(local, lastStudyDate);
  let streak = Number(safeStorageGet(local, studyStreak) || '0');
  if (!Number.isFinite(streak) || streak < 0) streak = 0;

  if (last === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDayKey(yesterday);

  if (last === yesterdayKey) streak += 1;
  else streak = 1;

  // Keep the date/streak pair coherent: if the streak cannot be stored, do not
  // advance the date marker and suppress a later retry with partial state.
  if (!safeStorageSet(local, studyStreak, String(streak))) return;
  safeStorageSet(local, lastStudyDate, today);
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
  const local = storage();
  const currentHabits = readHabits(habits);
  const entries = readArray(activity);
  const notes = readArray(quickNotes);
  const rawStreak = Number(safeStorageGet(local, studyStreak) || '0');
  const streak = Number.isFinite(rawStreak) && rawStreak >= 0 ? rawStreak : 0;
  const lastStudy = safeStorageGet(local, lastStudyDate);

  return {
    habitCount: currentHabits.length,
    habitsDoneToday: currentHabits.filter((habit) => habit.completed).length,
    activityEntries: entries.length,
    quickNotes: notes.length,
    studyStreak: currentStreak(streak, lastStudy),
    lastStudyDate: lastStudy,
  };
}
