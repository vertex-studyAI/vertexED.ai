/**
 * Tracks topic-level weaknesses from reviews, quizzes, and mock scores.
 * Stored in localStorage; syncs to cloud when user_study_artifacts supports weakness kind.
 */

export type WeaknessEntry = {
  topic: string;
  subject: string;
  board?: string;
  score: number;
  maxScore: number;
  source: 'review' | 'quiz' | 'mock';
  recordedAt: string;
};

const STORAGE_KEY = 'vertex_weakness_heatmap';

function readEntries(): WeaknessEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WeaknessEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: WeaknessEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-200)));
}

export function recordWeakness(entry: Omit<WeaknessEntry, 'recordedAt'>) {
  const entries = readEntries();
  entries.unshift({ ...entry, recordedAt: new Date().toISOString() });
  writeEntries(entries);
}

export type TopicHeat = {
  topic: string;
  subject: string;
  attempts: number;
  avgPercent: number;
  lastSeen: string;
};

export function getWeaknessHeatmap(limit = 12): TopicHeat[] {
  const entries = readEntries();
  const byTopic = new Map<string, TopicHeat & { total: number }>();

  for (const e of entries) {
    const key = `${e.subject}::${e.topic}`;
    const pct = e.maxScore > 0 ? (e.score / e.maxScore) * 100 : 0;
    const existing = byTopic.get(key);
    if (existing) {
      existing.attempts += 1;
      existing.total += pct;
      existing.avgPercent = existing.total / existing.attempts;
      if (e.recordedAt > existing.lastSeen) existing.lastSeen = e.recordedAt;
    } else {
      byTopic.set(key, {
        topic: e.topic,
        subject: e.subject,
        attempts: 1,
        avgPercent: pct,
        lastSeen: e.recordedAt,
        total: pct,
      });
    }
  }

  return Array.from(byTopic.values())
    .sort((a, b) => a.avgPercent - b.avgPercent)
    .slice(0, limit)
    .map(({ total: _t, ...rest }) => rest);
}

export function getWeakestTopics(count = 5): TopicHeat[] {
  return getWeaknessHeatmap(count).filter((t) => t.avgPercent < 70);
}
