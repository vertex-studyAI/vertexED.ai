/**
 * Tracks topic-level weaknesses from reviews, quizzes, and mock scores.
 * Measurement integrity: only entries explicitly tagged with the measured-v2
 * evidence contract and a human/validated-key verification method influence
 * mastery. Legacy and AI-only records remain stored but are ignored.
 * Legacy or heuristic records remain stored but are ignored as measured data.
 */

import { resolveLocalStorage, safeStorageGet, safeStorageSet } from '@/lib/browserStorage.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import {
  MEASURED_WEAKNESS_EVIDENCE,
  normalizeMeasuredWeaknessEntry,
  retainNewestWeaknessEntries,
  summarizeMeasuredWeakness,
} from '@/lib/weaknessEvidenceCore.mjs';
import { scheduleRetry } from '@/lib/retryQueue';
import { queueLearnerStateWrite } from '@/lib/learnerStateSync';

export type WeaknessEntry = {
  id: string;
  attemptId?: string;
  topic: string;
  subject: string;
  board?: string;
  score: number;
  maxScore: number;
  source: 'review' | 'quiz' | 'mock';
  evidence?: typeof MEASURED_WEAKNESS_EVIDENCE;
  verification: {
    method: 'teacher-confirmed' | 'official-mark-scheme' | 'validated-answer-key';
    confirmedAt: string;
    reference?: string;
  };
  recordedAt: string;
};

function storageKey() {
  return userContentStorageKeys().weaknessHeatmap;
}

function readEntries(): WeaknessEntry[] {
  if (typeof window === 'undefined') return [];
  const storage = resolveLocalStorage(window);
  try {
    const raw = safeStorageGet(storage, storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WeaknessEntry[]) : [];
  } catch {
    return [];
  }
}

export function getMeasuredEntries(): WeaknessEntry[] {
  return readEntries().map(normalizeMeasuredWeaknessEntry).filter(Boolean) as WeaknessEntry[];
}

function writeEntries(entries: WeaknessEntry[]) {
  if (typeof window === 'undefined') return false;
  const storage = resolveLocalStorage(window);
  return safeStorageSet(storage, storageKey(), JSON.stringify(retainNewestWeaknessEntries(entries, 500)));
}

function measurementId() {
  const token = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return `measurement:${token}`;
}

export function recordWeakness(entry: Omit<WeaknessEntry, 'id' | 'recordedAt'>) {
  const now = new Date();
  const normalized = normalizeMeasuredWeaknessEntry({
    ...entry,
    id: measurementId(),
    recordedAt: now.toISOString(),
  });
  if (!normalized) return false;

  const entries = readEntries();
  entries.unshift(normalized as WeaknessEntry);
  writeEntries(entries);
  scheduleRetry(normalized as WeaknessEntry);
  queueLearnerStateWrite('weakness', normalized.id, normalized as Record<string, unknown>, now);
  return true;
}

export type TopicHeat = {
  topic: string;
  subject: string;
  attempts: number;
  avgPercent: number;
  lastSeen: string;
};

export function getWeaknessHeatmap(limit = 12): TopicHeat[] {
  return summarizeMeasuredWeakness(readEntries(), limit) as TopicHeat[];
}

export function getWeakestTopics(count = 5): TopicHeat[] {
  return getWeaknessHeatmap(count).filter((t) => t.avgPercent < 70);
}
