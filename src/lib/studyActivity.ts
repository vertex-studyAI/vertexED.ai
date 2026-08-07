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
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
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
  window.localStorage.setItem(activity, JSON.stringify(next));
}

export function rememberStudySession(path: string, label: string): void {
  if (typeof window === 'undefined') return;
  const { lastStudySession } = userContentStorageKeys();
  sessionStorage.setItem(
    lastStudySession,
    JSON.stringify({ path, label, at: new Date().toISOString() } satisfies LastStudySession),
  );
}

export function getLastStudySession(): LastStudySession | null {
  if (typeof window === 'undefined') return null;
  const { lastStudySession } = userContentStorageKeys();
  const raw = sessionStorage.getItem(lastStudySession);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastStudySession;
  } catch {
    return null;
  }
}
