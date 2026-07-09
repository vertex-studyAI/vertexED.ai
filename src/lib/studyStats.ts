export type StudyStats = {
  habitCount: number;
  habitsDoneToday: number;
  activityEntries: number;
  quickNotes: number;
  studyStreak: number;
  lastStudyDate: string | null;
};

const STREAK_KEY = "vertex_study_streak";
const LAST_DATE_KEY = "vertex_last_study_date";

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

/** Call when user completes a meaningful study action. */
export function recordStudySession(): void {
  if (typeof window === "undefined") return;
  const today = todayKey();
  const last = window.localStorage.getItem(LAST_DATE_KEY);
  let streak = Number(window.localStorage.getItem(STREAK_KEY) || "0");

  if (last === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (last === yesterdayKey) streak += 1;
  else streak = 1;

  window.localStorage.setItem(STREAK_KEY, String(streak));
  window.localStorage.setItem(LAST_DATE_KEY, today);
}

export function getStudyStats(): StudyStats {
  const habits = readJson<{ completed?: boolean }[]>("studyzone_habits", []);
  const entries = readJson<unknown[]>("studyzone_activity", []);
  const notes = readJson<unknown[]>("studyzone_notes", []);
  const streak = Number(
    typeof window !== "undefined" ? window.localStorage.getItem(STREAK_KEY) || "0" : "0",
  );
  const lastStudyDate =
    typeof window !== "undefined" ? window.localStorage.getItem(LAST_DATE_KEY) : null;

  return {
    habitCount: habits.length,
    habitsDoneToday: habits.filter((h) => h.completed).length,
    activityEntries: entries.length,
    quickNotes: notes.length,
    studyStreak: streak,
    lastStudyDate,
  };
}
