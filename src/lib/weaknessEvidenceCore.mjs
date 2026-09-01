export const MEASURED_WEAKNESS_EVIDENCE = 'measured-v1';

const ALLOWED_SOURCES = new Set(['review', 'quiz', 'mock']);

export function normalizeMeasuredWeaknessEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  if (entry.evidence !== MEASURED_WEAKNESS_EVIDENCE) return null;

  const topic = typeof entry.topic === 'string' ? entry.topic.trim() : '';
  const subject = typeof entry.subject === 'string' ? entry.subject.trim() : '';
  const source = typeof entry.source === 'string' ? entry.source : '';
  const recordedAt = typeof entry.recordedAt === 'string' ? entry.recordedAt : '';
  const score = Number(entry.score);
  const maxScore = Number(entry.maxScore);

  if (!topic || !subject || !ALLOWED_SOURCES.has(source) || !recordedAt) return null;
  if (!Number.isFinite(score) || !Number.isFinite(maxScore)) return null;
  if (score < 0 || maxScore <= 0 || score > maxScore) return null;

  return {
    ...entry,
    topic,
    subject,
    score,
    maxScore,
    source,
    recordedAt,
    evidence: MEASURED_WEAKNESS_EVIDENCE,
  };
}

export function summarizeMeasuredWeakness(entries, limit = 12) {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, Math.floor(Number(limit))) : 12;
  const byTopic = new Map();

  for (const raw of Array.isArray(entries) ? entries : []) {
    const entry = normalizeMeasuredWeaknessEntry(raw);
    if (!entry) continue;

    const key = `${entry.subject}::${entry.topic}`;
    const pct = (entry.score / entry.maxScore) * 100;
    const existing = byTopic.get(key);
    if (existing) {
      existing.attempts += 1;
      existing.total += pct;
      existing.avgPercent = existing.total / existing.attempts;
      if (entry.recordedAt > existing.lastSeen) existing.lastSeen = entry.recordedAt;
    } else {
      byTopic.set(key, {
        topic: entry.topic,
        subject: entry.subject,
        attempts: 1,
        avgPercent: pct,
        lastSeen: entry.recordedAt,
        total: pct,
      });
    }
  }

  return Array.from(byTopic.values())
    .sort((a, b) => a.avgPercent - b.avgPercent)
    .slice(0, safeLimit)
    .map(({ total: _total, ...rest }) => rest);
}
