import { validExamDate } from './examTargets.mjs';

const KINDS = new Set(['review-mock', 'finish-mock', 'retry', 'weak-topic', 'flashcards', 'practice', 'revision', 'diagnostic']);

function timestamp(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)
    && validExamDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}

export function readStoredExamSessionHistory(storage, key) {
  try {
    const current = JSON.parse(storage.getItem(key) ?? '[]');
    if (Array.isArray(current) && current.every(value => normalizeExamSession(value))) return mergeExamSessionHistory(current, null);
  } catch { /* Recovery/export owns the original bytes. Never replace them here. */ }
  throw new Error('Session history could not be read. Original device data is preserved. Export account data before recovery.');
}

export function normalizeExamSession(value) {
  if (!value || typeof value !== 'object' || typeof value.id !== 'string' || !/^[a-zA-Z0-9-]{8,100}$/.test(value.id)) return null;
  if (!validExamDate(value.day)
    || typeof value.subject !== 'string' || !value.subject || value.subject.length > 160
    || ![25, 45, 75].includes(value.minutes)
    || !timestamp(value.startedAt) || !timestamp(value.updatedAt)
    || Date.parse(value.updatedAt) < Date.parse(value.startedAt)) return null;
  const mission = value.mission;
  if (!mission || !KINDS.has(mission.kind) || typeof mission.title !== 'string' || mission.title.length > 500
    || typeof mission.detail !== 'string' || mission.detail.length > 1000) return null;
  if (!Array.isArray(value.completed) || value.completed.length > 3 || value.completed.some((key) => typeof key !== 'string' || key.length > 1500)) return null;
  return {
    id: value.id, day: value.day, subject: value.subject, minutes: value.minutes,
    mode: ['recommended', 'practice', 'revision', 'diagnostic'].includes(value.mode) ? value.mode : 'recommended',
    mission: { kind: mission.kind, title: mission.title, detail: mission.detail, ...(typeof mission.retryId === 'string' ? { retryId: mission.retryId.slice(0, 160) } : {}) },
    completed: [...new Set(value.completed)], startedAt: new Date(value.startedAt).toISOString(), updatedAt: new Date(value.updatedAt).toISOString(),
  };
}

export function mergeExamSessionHistory(current, incoming) {
  const sessions = new Map();
  for (const raw of [...(Array.isArray(current) ? current : []), incoming]) {
    const session = normalizeExamSession(raw);
    if (!session) continue;
    const previous = sessions.get(session.id);
    if (!previous || Date.parse(previous.updatedAt) <= Date.parse(session.updatedAt)) sessions.set(session.id, session);
  }
  return [...sessions.values()].sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt) || a.id.localeCompare(b.id)).slice(0, 200);
}
