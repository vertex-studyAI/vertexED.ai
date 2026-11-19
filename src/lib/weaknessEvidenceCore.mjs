export const MEASURED_WEAKNESS_EVIDENCE = 'measured-v2';
export const LEARNER_ATTESTED_WEAKNESS_EVIDENCE = 'learner-attested-v1';

export const MEASUREMENT_METHODS = Object.freeze([
  'validated-answer-key',
]);

export const ATTESTATION_METHODS = Object.freeze([
  'learner-attested-teacher-check',
  'learner-attested-mark-scheme-check',
]);

const MEASUREMENT_METHOD_SET = new Set(MEASUREMENT_METHODS);
const ATTESTATION_METHOD_SET = new Set(ATTESTATION_METHODS);

const ALLOWED_SOURCES = new Set(['review', 'quiz', 'mock']);

function normalizeEvidenceEntry(entry, { evidence, methods }) {
  if (!entry || typeof entry !== 'object') return null;
  if (entry.evidence !== evidence) return null;

  const topic = typeof entry.topic === 'string' ? entry.topic.trim() : '';
  const subject = typeof entry.subject === 'string' ? entry.subject.trim() : '';
  const source = typeof entry.source === 'string' ? entry.source : '';
  const recordedAt = typeof entry.recordedAt === 'string' ? entry.recordedAt : '';
  const score = Number(entry.score);
  const maxScore = Number(entry.maxScore);
  const verification = entry.verification;

  if (!topic || !subject || !ALLOWED_SOURCES.has(source) || !recordedAt) return null;
  if (!Number.isFinite(score) || !Number.isFinite(maxScore)) return null;
  if (score < 0 || maxScore <= 0 || score > maxScore) return null;
  if (!verification || !methods.has(verification.method)) return null;
  if (!Number.isFinite(Date.parse(verification.confirmedAt))) return null;

  return {
    ...entry,
    topic,
    subject,
    score,
    maxScore,
    source,
    recordedAt,
    evidence,
    verification: {
      method: verification.method,
      confirmedAt: verification.confirmedAt,
      reference: typeof verification.reference === 'string'
        ? verification.reference.trim().slice(0, 160)
        : undefined,
    },
  };
}

export function normalizeMeasuredWeaknessEntry(entry) {
  return normalizeEvidenceEntry(entry, {
    evidence: MEASURED_WEAKNESS_EVIDENCE,
    methods: MEASUREMENT_METHOD_SET,
  });
}

export function normalizeLearnerAttestedWeaknessEntry(entry) {
  return normalizeEvidenceEntry(entry, {
    evidence: LEARNER_ATTESTED_WEAKNESS_EVIDENCE,
    methods: ATTESTATION_METHOD_SET,
  });
}

export function retainNewestWeaknessEntries(entries, limit = 200) {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(0, Math.floor(Number(limit))) : 200;
  return (Array.isArray(entries) ? entries : []).slice(0, safeLimit);
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
    .map(entry => { const result = { ...entry }; delete result.total; return result; });
}
