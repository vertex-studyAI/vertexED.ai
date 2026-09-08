import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

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
  const { activity } = userContentStorageKeys();
  try {
    const raw = window.localStorage.getItem(activity);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry.message === 'string' && typeof entry.createdAt === 'string') : [];
  } catch {
    return [];
  }
}

/** Append a study win to the activity feed shown on the dashboard. */
export function logStudyActivity(message: string): void {
  if (typeof window === 'undefined' || !message.trim()) return;
  const { activity } = userContentStorageKeys();
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...readActivities()].slice(0, ACTIVITY_LIMIT);
  try {
    window.localStorage.setItem(activity, JSON.stringify(next));
  } catch {
    // Optional activity history must not interrupt saving the study work itself.
  }
}

export function rememberStudySession(path: string, label: string): void {
  if (typeof window === 'undefined') return;
  const { lastStudySession } = userContentStorageKeys();
  try {
    window.sessionStorage.setItem(
      lastStudySession,
      JSON.stringify({ path, label, at: new Date().toISOString() } satisfies LastStudySession),
    );
  } catch {
    // Navigation remains available when browser storage is blocked or full.
  }
}

export function getLastStudySession(): LastStudySession | null {
  if (typeof window === 'undefined') return null;
  const { lastStudySession } = userContentStorageKeys();
  try {
    const raw = window.sessionStorage.getItem(lastStudySession);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value.path !== 'string' || !value.path.startsWith('/')
      || value.path.startsWith('//') || value.path.includes('\\')
      || typeof value.label !== 'string' || typeof value.at !== 'string'
      || !Number.isFinite(Date.parse(value.at))) return null;
    return value as LastStudySession;
  } catch {
    return null;
  }
}
