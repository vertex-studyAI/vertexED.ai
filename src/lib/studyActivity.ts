import {
  parseStoredArray,
  parseStoredObject,
  resolveLocalStorage,
  resolveSessionStorage,
  safeStorageGet,
  safeStorageSet,
} from '@/lib/browserStorage.mjs';
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

function normalizeActivityEntry(value: unknown): ActivityEntry | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || !candidate.id.trim()
    || typeof candidate.message !== 'string' || !candidate.message.trim()
    || typeof candidate.createdAt !== 'string'
    || !Number.isFinite(Date.parse(candidate.createdAt))) return null;
  return {
    id: candidate.id,
    message: candidate.message,
    createdAt: candidate.createdAt,
  };
}

function readActivities(): ActivityEntry[] {
  if (typeof window === 'undefined') return [];
  const { activity } = userContentStorageKeys();
  const storage = resolveLocalStorage(window);
  return parseStoredArray(safeStorageGet(storage, activity))
    .map(normalizeActivityEntry)
    .filter((entry): entry is ActivityEntry => entry !== null)
    .slice(0, ACTIVITY_LIMIT);
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
  safeStorageSet(resolveLocalStorage(window), activity, JSON.stringify(next));
}

export function rememberStudySession(path: string, label: string): void {
  if (typeof window === 'undefined') return;
  const { lastStudySession } = userContentStorageKeys();
  safeStorageSet(
    resolveSessionStorage(window),
    lastStudySession,
    JSON.stringify({ path, label, at: new Date().toISOString() } satisfies LastStudySession),
  );
}

export function getLastStudySession(): LastStudySession | null {
  if (typeof window === 'undefined') return null;
  const { lastStudySession } = userContentStorageKeys();
  const value = parseStoredObject(safeStorageGet(resolveSessionStorage(window), lastStudySession));
  if (!value || typeof value.path !== 'string' || !value.path.startsWith('/')
    || value.path.startsWith('//') || value.path.includes('\\')
    || typeof value.label !== 'string' || typeof value.at !== 'string'
    || !Number.isFinite(Date.parse(value.at))) return null;
  return value as LastStudySession;
}
