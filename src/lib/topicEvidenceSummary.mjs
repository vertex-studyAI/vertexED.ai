import { normalizeMeasuredWeaknessEntry } from './weaknessEvidenceCore.mjs';

function pct(entry) {
  return (entry.score / entry.maxScore) * 100;
}

export function summarizeTopicEvidence(entries, subject) {
  const normalizedSubject = typeof subject === 'string' ? subject.trim() : '';
  if (!normalizedSubject) return [];

  const seen = new Set();
  const groups = new Map();

  for (const raw of Array.isArray(entries) ? entries : []) {
    const entry = normalizeMeasuredWeaknessEntry(raw);
    if (!entry || entry.subject !== normalizedSubject) continue;
    const identity = entry.id || JSON.stringify([
      entry.subject,
      entry.topic,
      entry.attemptId ?? null,
      entry.recordedAt,
      entry.score,
      entry.maxScore,
    ]);
    if (seen.has(identity)) continue;
    seen.add(identity);

    const rows = groups.get(entry.topic) ?? [];
    rows.push(entry);
    groups.set(entry.topic, rows);
  }

  return [...groups.entries()].map(([topic, rows]) => {
    const ordered = rows.toSorted((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
    const first = ordered[0];
    const latest = ordered.at(-1);
    const averagePercent = ordered.reduce((sum, row) => sum + pct(row), 0) / ordered.length;
    const differentInstant = ordered.length >= 2 && Date.parse(first.recordedAt) !== Date.parse(latest.recordedAt);
    const verificationMethods = [...new Set(ordered.map((row) => row.verification.method))].sort();

    return {
      topic,
      attempts: ordered.length,
      averagePercent,
      latestPercent: pct(latest),
      changePercentPoints: differentInstant ? pct(latest) - pct(first) : null,
      firstSeen: first.recordedAt,
      lastSeen: latest.recordedAt,
      verificationMethods,
      entries: ordered.toReversed(),
    };
  }).sort((a, b) => (
    a.averagePercent - b.averagePercent
    || Date.parse(b.lastSeen) - Date.parse(a.lastSeen)
    || a.topic.localeCompare(b.topic)
  ));
}
