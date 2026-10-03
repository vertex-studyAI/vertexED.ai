/** Pure revision rules. Callers must supply complete, account-scoped evidence. */
export const REVISION_INTERVAL_DAYS = Object.freeze([1, 3, 7, 14, 30]);
export const EVIDENCE_STATES = Object.freeze(['verified_correct', 'verified_incorrect',
  'self_checked_correct', 'self_checked_incorrect', 'unverified', 'unknown', 'skipped']);
const DAY = 86400000;
// Validate the represented UTC date, not only Date.parse's normalized result.
const timestamp = value => {
  if (typeof value !== 'string') return NaN;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
  if (!match) return NaN;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return NaN;
  const canonical = `${match[1]}T${match[2]}.${(match[3] || '').padEnd(3, '0')}Z`;
  return new Date(parsed).toISOString() === canonical ? parsed : NaN;
};
// Four-digit UTC dates are the format accepted by the persisted evidence schema.
const clock = value => Number.isFinite(value)
  && value >= -62167219200000 && value <= 253402300799999;
const id = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 200;

/** A retry never upgrades self-check evidence into verified evidence. */
export function scheduleRevisionRetry(schedule, evidenceState, now) {
  if (!clock(now) || !EVIDENCE_STATES.includes(evidenceState)
    || !Number.isInteger(schedule?.intervalStep) || schedule.intervalStep < 0
    || schedule.intervalStep >= REVISION_INTERVAL_DAYS.length
    || !Number.isFinite(timestamp(schedule.dueAt))) throw new TypeError('Invalid revision schedule.');
  if (['unverified', 'unknown', 'skipped'].includes(evidenceState)) return { ...schedule };
  const intervalStep = evidenceState.endsWith('_incorrect') ? 0
    : Math.min(schedule.intervalStep + 1, REVISION_INTERVAL_DAYS.length - 1);
  const due = now + REVISION_INTERVAL_DAYS[intervalStep] * DAY;
  if (!clock(due)) throw new TypeError('Invalid revision schedule.');
  return { ...schedule, intervalStep, dueAt: new Date(due).toISOString(),
    lastOutcome: evidenceState };
}

/** Reject ambiguous duplicate identities rather than silently choosing evidence. */
export function rankWeakTopics(attempts, { now, complete = false } = {}) {
  if (complete !== true) return { complete: false, ranked: [], insufficient: [] };
  if (!Array.isArray(attempts) || !clock(now)) throw new TypeError('Invalid evidence scope.');
  const seen = new Map(), topics = new Map();
  for (const attempt of attempts) {
    if (!id(attempt?.id) || !id(attempt.topicId) || !id(attempt.sessionId) || !id(attempt.questionId)
      || !id(attempt.topicLabel) || !EVIDENCE_STATES.includes(attempt.evidenceState)
      || !Number.isFinite(timestamp(attempt.at)) || timestamp(attempt.at) > now) {
      throw new TypeError('Invalid revision evidence.');
    }
    const canonical = JSON.stringify([attempt.topicId, attempt.topicLabel, attempt.sessionId,
      attempt.questionId, attempt.evidenceState, attempt.at]);
    if (seen.has(attempt.id)) {
      if (seen.get(attempt.id) !== canonical) throw new TypeError('Conflicting attempt identity.');
      continue;
    }
    seen.set(attempt.id, canonical);
    if (!attempt.evidenceState.startsWith('verified_')) continue;
    let topic = topics.get(attempt.topicId);
    if (!topic) {
      topic = { topicId: attempt.topicId, topicLabel: attempt.topicLabel, verifiedAttempts: 0,
        verifiedIncorrect: 0, lastIncorrectAt: null, sessions: new Set(), questions: new Set() };
      topics.set(attempt.topicId, topic);
    }
    if (topic.topicLabel !== attempt.topicLabel) throw new TypeError('Conflicting topic label.');
    topic.verifiedAttempts++;
    topic.sessions.add(attempt.sessionId); topic.questions.add(attempt.questionId);
    if (attempt.evidenceState === 'verified_incorrect') {
      topic.verifiedIncorrect++;
      if (!topic.lastIncorrectAt || timestamp(attempt.at) > timestamp(topic.lastIncorrectAt)) topic.lastIncorrectAt = attempt.at;
    }
  }
  const ranked = [], insufficient = [];
  for (const topic of topics.values()) {
    const eligible = topic.verifiedAttempts >= 3 && topic.sessions.size >= 2 && topic.questions.size >= 2;
    const { sessions, questions, ...counts } = topic;
    const row = { ...counts, distinctSessions: sessions.size, distinctQuestions: questions.size,
      errorRate: topic.verifiedIncorrect / topic.verifiedAttempts,
      evidenceLabel: `${topic.verifiedIncorrect} incorrect of ${topic.verifiedAttempts} verified attempts`,
      status: eligible ? 'Needs review' : 'Not enough verified attempts' };
    (eligible ? ranked : insufficient).push(row);
  }
  const labelOrder = (a, b) => a.topicLabel.localeCompare(b.topicLabel) || a.topicId.localeCompare(b.topicId);
  ranked.sort((a, b) => b.errorRate - a.errorRate
    || (timestamp(b.lastIncorrectAt) || 0) - (timestamp(a.lastIncorrectAt) || 0) || labelOrder(a, b));
  insufficient.sort(labelOrder);
  return { complete: true, ranked, insufficient };
}

/** No mutation: deferring a row does not record a successful attempt. */
export function deriveRevisionQueue(entries, now, limit = 10) {
  if (!Array.isArray(entries) || !clock(now) || !Number.isInteger(limit)
    || limit < 1 || limit > 30) throw new TypeError('Invalid revision queue.');
  const seen = new Set();
  for (const entry of entries) {
    if (!id(entry?.id) || seen.has(entry.id) || !EVIDENCE_STATES.includes(entry.evidenceState)
      || !Number.isFinite(timestamp(entry.dueAt)) || !Number.isFinite(timestamp(entry.updatedAt))) {
      throw new TypeError('Invalid revision entry.');
    }
    seen.add(entry.id);
  }
  return entries.filter(entry => timestamp(entry.dueAt) <= now)
    .sort((a, b) => timestamp(a.dueAt) - timestamp(b.dueAt)
      || Number(b.evidenceState === 'verified_incorrect') - Number(a.evidenceState === 'verified_incorrect')
      || timestamp(b.updatedAt) - timestamp(a.updatedAt) || a.id.localeCompare(b.id)).slice(0, limit);
}
