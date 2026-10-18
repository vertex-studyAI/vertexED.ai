import { LEARNING_QUESTIONS, PRACTICE_MODES, selectLearningQuestion } from './learningModel.mjs';
import { PRACTICE_CONTENT_REVISION } from './practiceHistory.mjs';

const recoveryMessage = 'Your saved session could not be read. Its original data is preserved. Export account data in Settings before recovery.';
export function parsePracticeSession(raw) {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || !/^[a-zA-Z0-9-]{8,70}$/.test(value.id || '')
      || !Array.isArray(value.ids) || !value.ids.length || value.ids.length > 200
      || new Set(value.ids).size !== value.ids.length
      || value.ids.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(id))
      || (value.contentRevisions !== undefined && (!value.contentRevisions || typeof value.contentRevisions !== 'object' || Array.isArray(value.contentRevisions)
        || Object.entries(value.contentRevisions).some(([id, revision]) => !value.ids.includes(id) || !PRACTICE_CONTENT_REVISION.test(revision))))
      || (value.budgetMinutes !== undefined && (!Number.isInteger(value.budgetMinutes) || value.budgetMinutes < 5 || value.budgetMinutes > 60))
      || !PRACTICE_MODES.includes(value.mode)
      || !Number.isInteger(value.index) || value.index < 0 || value.index >= value.ids.length
      || typeof value.finished !== 'boolean' || !Number.isFinite(value.startedAt) || value.startedAt < 0
      || (value.deadline !== null && (!Number.isFinite(value.deadline) || value.deadline < 0))
      || (value.mode === 'exam') !== (value.deadline !== null)
      || ['subject', 'topic', 'concept', 'curriculum'].some(key => typeof value[key] !== 'string')
      || !value.responses || typeof value.responses !== 'object' || Array.isArray(value.responses)
      || Object.entries(value.responses).some(([id, r]) => !value.ids.includes(id)
        || !r || typeof r.answer !== 'string' || r.answer.length > 200
        || (r.confidence !== null && ![1, 2, 3, 4, 5].includes(r.confidence)) || !Number.isFinite(r.seconds) || r.seconds < 0 || r.seconds > 86400
        || (r.hintLevel !== undefined && (!Number.isInteger(r.hintLevel) || r.hintLevel < 0 || r.hintLevel > 3 || (r.hintLevel > 0 && !r.hinted)))
        || typeof r.hinted !== 'boolean' || typeof r.flagged !== 'boolean'
        || (r.submitted !== undefined && (r.submitted !== `attempt:${value.id}-${value.ids.indexOf(id)}` || !r.answer.trim())))) {
      throw new Error(recoveryMessage);
    }
    return value;
  } catch {
    throw new Error(recoveryMessage);
  }
}

/** Restorable history is separate from permission to continue grading it. */
export function practiceSessionNeedsReview(session, questions = LEARNING_QUESTIONS) {
  return Boolean(session && session.ids.some(id => {
    const question = questions.find(item => item.id === id);
    return !question || !PRACTICE_CONTENT_REVISION.test(question.contentRevision)
      || session.contentRevisions?.[id] !== question.contentRevision;
  }));
}

// Once a question has been visited, its place and attempt identity stay fixed.
// Adapt only the unanswered, unvisited tail of a diagnostic.
export function advancePracticeSession(session, attempts, { questions = LEARNING_QUESTIONS } = {}) {
  if (practiceSessionNeedsReview(session, questions)) return session;
  const nextIndex = Math.min(session.ids.length - 1, session.index + 1);
  let ids = session.ids;
  const hasVisitedTail = ids.slice(nextIndex).some(id => Object.hasOwn(session.responses, id));
  if (session.mode === 'diagnostic' && !session.finished && nextIndex > session.index && !hasVisitedTail) {
    const next = selectLearningQuestion({ ...session, questions, attempts, exclude: [...ids.slice(0, nextIndex), ...(session.budgetMinutes ? questions.filter(q => q.estimatedSeconds > questions.find(q => q.id === ids[nextIndex]).estimatedSeconds).map(q => q.id) : [])] });
    if (next) ids = [...ids.slice(0, nextIndex), next.id, ...ids.slice(nextIndex).filter(id => id !== next.id)].slice(0, ids.length);
  }
  return { ...session, ids, contentRevisions: Object.fromEntries(ids.map(id => [id, questions.find(q => q.id === id)?.contentRevision])), index: nextIndex, responses: { ...session.responses, [ids[nextIndex]]: session.responses[ids[nextIndex]] || { answer: '', confidence: null, hinted: false, seconds: 0, flagged: false } } };
}

export function writePracticeSession(storage, key, expectedRaw, session, { questions = LEARNING_QUESTIONS } = {}) {
  if (practiceSessionNeedsReview(session, questions)) throw new Error('This saved session is awaiting question review. Its original answers are preserved; start a new published session when available.');
  if (storage.getItem(key) !== expectedRaw) {
    throw new Error('This practice session changed in another tab. Your work here is paused so it cannot overwrite that copy. Copy any unsaved answer before reloading.');
  }
  const raw = JSON.stringify(session);
  parsePracticeSession(raw);
  storage.setItem(key, raw);
  return raw;
}

const MAX_HELD_SESSIONS = 100;
const MAX_HELD_ARCHIVE_BYTES = 2 * 1024 * 1024;
const utf8Bytes = raw => new TextEncoder().encode(raw).length;

/** Preserve exact saved bytes before the UI offers a separate new session. */
export function archiveHeldPracticeSession(storage, key, expectedRaw, session) {
  const preserved = 'Your original session is preserved. Export account data before recovery.';
  if (!/^vertex_content:[^:]+:practice_session$/.test(key) || typeof expectedRaw !== 'string'
    || !session || !practiceSessionNeedsReview(session)) throw new Error(`Only a saved account session awaiting review can be archived. ${preserved}`);
  if (storage.getItem(key) !== expectedRaw) throw new Error(`This practice session changed in another tab. ${preserved}`);
  const saved = parsePracticeSession(expectedRaw);
  if (JSON.stringify(saved) !== JSON.stringify(session)) throw new Error(`The visible session differs from its saved copy. ${preserved}`);
  const archiveKey = `${key}:held-history`;
  const previousRaw = storage.getItem(archiveKey);
  let entries;
  try {
    if (previousRaw !== null && utf8Bytes(previousRaw) > MAX_HELD_ARCHIVE_BYTES) throw new Error();
    entries = previousRaw === null ? [] : JSON.parse(previousRaw);
    if (!Array.isArray(entries) || entries.length > MAX_HELD_SESSIONS || entries.some(entry =>
      !entry || typeof entry.raw !== 'string' || typeof entry.archivedAt !== 'string'
      || !Number.isFinite(Date.parse(entry.archivedAt)) || parsePracticeSession(entry.raw)?.id !== entry.sessionId)) throw new Error();
  } catch {
    throw new Error(`Saved session history could not be read. ${preserved}`);
  }
  if (entries.some(entry => entry.raw === expectedRaw)) {
    if (storage.getItem(key) !== expectedRaw || storage.getItem(archiveKey) !== previousRaw) throw new Error(`Saved practice changed in another tab. ${preserved}`);
    return;
  }
  const nextRaw = JSON.stringify([...entries, { sessionId: saved.id, raw: expectedRaw, archivedAt: new Date().toISOString() }]);
  if (entries.length >= MAX_HELD_SESSIONS || utf8Bytes(nextRaw) > MAX_HELD_ARCHIVE_BYTES) throw new Error(`Saved session history is full. ${preserved}`);
  if (storage.getItem(key) !== expectedRaw || storage.getItem(archiveKey) !== previousRaw) throw new Error(`Saved practice changed in another tab. ${preserved}`);
  try {
    storage.setItem(archiveKey, nextRaw);
    if (storage.getItem(archiveKey) !== nextRaw) throw new Error();
  } catch {
    throw new Error(`This session could not be archived on your device. ${preserved}`);
  }
  if (storage.getItem(key) !== expectedRaw) throw new Error(`This practice session changed in another tab. ${preserved}`);
  // Keep the active key intact. Only a later, explicit new-session save may
  // replace it, using the existing compare-and-swap session write contract.
}
