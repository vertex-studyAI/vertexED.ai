import { resolveLocalStorage, safeStorageGet, safeStorageSet } from '@/lib/browserStorage.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import {
  dueRetryItems,
  completeRetryItem,
  dismissRetryItem,
  retryIdForWeakness,
  scheduleMeasuredRetry,
  validRetryItems,
} from '@/lib/retryQueueCore.mjs';
import type { WeaknessEntry } from '@/lib/weaknessTracker';
import { queueLearnerStateWrite } from '@/lib/learnerStateSync';

export type RetryItem = {
  id: string;
  topic: string;
  subject: string;
  board?: string;
  source: WeaknessEntry['source'];
  evidence: 'measured-v2';
  scorePercent: number;
  dueAt: string;
  scheduledAt: string;
  measuredAttempts: number;
  status: 'scheduled' | 'completed' | 'dismissed';
  updatedAt: string;
  completedAt: string | null;
  dismissedAt: string | null;
  history: Array<{ status: 'scheduled' | 'completed' | 'dismissed'; at: string; scorePercent?: number }>;
};

function storageKey() {
  return userContentStorageKeys().retryQueue;
}

function read(): RetryItem[] {
  if (typeof window === 'undefined') return [];
  const storage = resolveLocalStorage(window);
  try {
    const raw = safeStorageGet(storage, storageKey());
    return validRetryItems(raw ? JSON.parse(raw) : []) as RetryItem[];
  } catch {
    return [];
  }
}

function persist(items: RetryItem[]) {
  if (typeof window === 'undefined') return false;
  const storage = resolveLocalStorage(window);
  return safeStorageSet(storage, storageKey(), JSON.stringify(items));
}

export function getRetryQueue(): RetryItem[] {
  return read().filter((item) => item.status === 'scheduled');
}

export function getRetryHistory(): RetryItem[] {
  return read();
}

export function getDueRetries(now = new Date()): RetryItem[] {
  return dueRetryItems(read(), now) as RetryItem[];
}

export function scheduleRetry(entry: WeaknessEntry, now = new Date()): RetryItem[] {
  const next = scheduleMeasuredRetry(read(), entry, now) as RetryItem[];
  persist(next);
  const changed = next.find((item) => item.id === retryIdForWeakness(entry));
  if (changed) queueLearnerStateWrite('retry', changed.id, changed as unknown as Record<string, unknown>, now);
  return next;
}

function writeTransition(next: RetryItem[], id: string, now: Date) {
  persist(next);
  const changed = next.find((item) => item.id === id);
  if (changed) queueLearnerStateWrite('retry', changed.id, changed as unknown as Record<string, unknown>, now);
  return changed ?? null;
}

export function completeRetry(id: string, scorePercent?: number, now = new Date()): RetryItem | null {
  return writeTransition(completeRetryItem(read(), id, now, scorePercent) as RetryItem[], id, now);
}

export function dismissRetry(id: string, now = new Date()): RetryItem | null {
  return writeTransition(dismissRetryItem(read(), id, now) as RetryItem[], id, now);
}

export function retryTargetRoute(item: RetryItem): string {
  const params = new URLSearchParams({
    subject: item.subject,
    topic: item.topic,
    retry: item.id,
  });
  return `/answer-reviewer?${params.toString()}`;
}
