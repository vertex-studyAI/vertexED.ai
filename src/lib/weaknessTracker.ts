/**
 * Tracks topic-level weaknesses from reviews, quizzes, and mock scores.
 * Stored in account-scoped localStorage; sync can be added when the backend
 * supports a dedicated learner-state contract.
 *
 * Measurement integrity: only entries explicitly tagged with the measured-v1
 * evidence contract are allowed to influence mastery/weakness summaries.
 * Legacy or heuristic records remain stored but are ignored as measured data.
 */

import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import {
  MEASURED_WEAKNESS_EVIDENCE,
  normalizeMeasuredWeaknessEntry,
  summarizeMeasuredWeakness,
} from '@/lib/weaknessEvidenceCore.mjs';

export type WeaknessEntry = {
  topic: string;
  subject: string;
  board?: string;
  score: number;
  maxScore: number;
  source: 'review' | 'quiz' | 'mock';
  evidence?: typeof MEASURED_WEAKNESS_EVIDENCE;
  recordedAt: string;
};

function storageKey() {
  return userContentStorageKeys().weaknessHeatmap;
}

function readEntries(): WeaknessEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WeaknessEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: WeaknessEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(), JSON.stringify(entries.slice(-200)));
}

export function recordWeakness(entry: Omit<WeaknessEntry, 'recordedAt'>) {
  const normalized = normalizeMeasuredWeaknessEntry({
    ...entry,
    recordedAt: new Date().toISOString(),
  });
  if (!normalized) return false;

  const entries = readEntries();
  entries.unshift(normalized as WeaknessEntry);
  writeEntries(entries);
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
