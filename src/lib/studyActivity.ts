const ACTIVITY_KEY = 'studyzone_activity';
const LAST_SESSION_KEY = 'vertex_last_study_session';
const ACTIVITY_LIMIT = 50;

export type ActivityEntry = {
  id: string;
  message: string;
  createdAt: string;
};

export type LastStudySession = {
  path: string;
  label: string;
  at: string;
};

function readActivities(): ActivityEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

/** Append a study win to the activity feed shown on the dashboard. */
export function logStudyActivity(message: string): void {
  if (typeof window === 'undefined' || !message.trim()) return;
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...readActivities()].slice(0, ACTIVITY_LIMIT);
  window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
}

export function rememberStudySession(path: string, label: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    LAST_SESSION_KEY,
    JSON.stringify({ path, label, at: new Date().toISOString() } satisfies LastStudySession),
  );
}

export function getLastStudySession(): LastStudySession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(LAST_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastStudySession;
  } catch {
    return null;
  }
}
