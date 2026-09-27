import { LEARNING_QUESTIONS, PRACTICE_MODES, selectLearningQuestion } from './learningModel.mjs';

const recoveryMessage = 'Your saved session could not be read. Its original data is preserved. Export account data in Settings before recovery.';
export function parsePracticeSession(raw) {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || !/^[a-zA-Z0-9-]{8,70}$/.test(value.id || '')
      || !Array.isArray(value.ids) || !value.ids.length || value.ids.length > LEARNING_QUESTIONS.length
      || new Set(value.ids).size !== value.ids.length
      || value.ids.some(id => !LEARNING_QUESTIONS.some(q => q.id === id))
      || !PRACTICE_MODES.includes(value.mode)
      || !Number.isInteger(value.index) || value.index < 0 || value.index >= value.ids.length
      || typeof value.finished !== 'boolean' || !Number.isFinite(value.startedAt) || value.startedAt < 0
      || (value.deadline !== null && (!Number.isFinite(value.deadline) || value.deadline < 0))
      || (value.mode === 'exam') !== (value.deadline !== null)
      || ['subject', 'topic', 'concept', 'curriculum'].some(key => typeof value[key] !== 'string')
      || !value.responses || typeof value.responses !== 'object' || Array.isArray(value.responses)
      || Object.entries(value.responses).some(([id, r]) => !value.ids.includes(id)
        || !r || typeof r.answer !== 'string' || r.answer.length > 200
        || ![1, 2, 3, 4, 5].includes(r.confidence) || !Number.isFinite(r.seconds) || r.seconds < 0 || r.seconds > 86400
        || typeof r.hinted !== 'boolean' || typeof r.flagged !== 'boolean'
        || (r.submitted !== undefined && (r.submitted !== `attempt:${value.id}-${value.ids.indexOf(id)}` || !r.answer.trim())))) {
      throw new Error(recoveryMessage);
    }
    return value;
  } catch {
    throw new Error(recoveryMessage);
  }
}

// Once a question has been visited, its place and attempt identity stay fixed.
// Adapt only the unanswered, unvisited tail of a diagnostic.
export function advancePracticeSession(session, attempts) {
  const nextIndex = Math.min(session.ids.length - 1, session.index + 1);
  let ids = session.ids;
  const hasVisitedTail = ids.slice(nextIndex).some(id => Object.hasOwn(session.responses, id));
  if (session.mode === 'diagnostic' && !session.finished && nextIndex > session.index && !hasVisitedTail) {
    const next = selectLearningQuestion({ ...session, attempts, exclude: ids.slice(0, nextIndex) });
    if (next) ids = [...ids.slice(0, nextIndex), next.id, ...ids.slice(nextIndex).filter(id => id !== next.id)].slice(0, ids.length);
  }
  return { ...session, ids, index: nextIndex, responses: { ...session.responses, [ids[nextIndex]]: session.responses[ids[nextIndex]] || { answer: '', confidence: 3, hinted: false, seconds: 0, flagged: false } } };
}

export function writePracticeSession(storage, key, expectedRaw, session) {
  if (storage.getItem(key) !== expectedRaw) {
    throw new Error('This practice session changed in another tab. Your work here is paused so it cannot overwrite that copy. Copy any unsaved answer before reloading.');
  }
  const raw = JSON.stringify(session);
  parsePracticeSession(raw);
  storage.setItem(key, raw);
  return raw;
}
