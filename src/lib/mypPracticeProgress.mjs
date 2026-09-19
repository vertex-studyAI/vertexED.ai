import { userContentStorageKeys } from './userContentStorageScope.mjs';

const SCHEMA_VERSION = 1;
const MAX_RECORDS = 200;
const CONFIDENCE_LEVELS = new Set(['not-yet', 'developing', 'secure']);
const RETRY_DAYS = new Set([1, 3, 7, 14]);

function storageFor(host, scope) {
  if (!host || scope === undefined) return null;
  return scope ? host.localStorage : host.sessionStorage;
}

function cleanRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (!CONFIDENCE_LEVELS.has(value.confidence)) return null;
  if (!Array.isArray(value.checkedCriteria) || value.checkedCriteria.length > 12) return null;
  const checkedCriteria = value.checkedCriteria
    .filter((item) => typeof item === 'string' && item.trim().length > 0 && item.length <= 200)
    .map((item) => item.trim());
  if (checkedCriteria.length !== value.checkedCriteria.length) return null;
  if (!Number.isFinite(Date.parse(value.updatedAt)) || !Number.isFinite(Date.parse(value.retryAt))) return null;
  return {
    confidence: value.confidence,
    checkedCriteria: [...new Set(checkedCriteria)],
    updatedAt: value.updatedAt,
    retryAt: value.retryAt,
  };
}

function readAll(host, scope) {
  const storage = storageFor(host, scope);
  if (!storage) return {};
  try {
    const raw = storage.getItem(userContentStorageKeys(scope).mypPracticeProgress);
    const payload = raw ? JSON.parse(raw) : null;
    if (!payload || payload.schemaVersion !== SCHEMA_VERSION || !payload.records || typeof payload.records !== 'object') return {};
    return Object.fromEntries(Object.entries(payload.records)
      .map(([id, value]) => [id, cleanRecord(value)])
      .filter(([id, value]) => typeof id === 'string' && id.length <= 160 && value));
  } catch {
    return {};
  }
}

export function readMypPracticeProgress(host, scope, questionId) {
  if (typeof questionId !== 'string' || !questionId.trim()) return null;
  return readAll(host, scope)[questionId] ?? null;
}

export function saveMypPracticeProgress(host, scope, questionId, input, now = new Date()) {
  const storage = storageFor(host, scope);
  const normalizedQuestionId = typeof questionId === 'string' ? questionId.trim() : '';
  const timestamp = now instanceof Date && Number.isFinite(now.getTime()) ? now : null;
  if (!storage || !normalizedQuestionId || normalizedQuestionId.length > 160 || !timestamp) return { saved: false, progress: null };
  if (!CONFIDENCE_LEVELS.has(input?.confidence) || !RETRY_DAYS.has(input?.retryDays)) return { saved: false, progress: null };
  const candidate = cleanRecord({
    confidence: input.confidence,
    checkedCriteria: input.checkedCriteria,
    updatedAt: timestamp.toISOString(),
    retryAt: new Date(timestamp.getTime() + input.retryDays * 86_400_000).toISOString(),
  });
  if (!candidate) return { saved: false, progress: null };

  try {
    const records = readAll(host, scope);
    const retained = Object.entries({ ...records, [normalizedQuestionId]: candidate })
      .sort(([, left], [, right]) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, MAX_RECORDS);
    storage.setItem(userContentStorageKeys(scope).mypPracticeProgress, JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      records: Object.fromEntries(retained),
    }));
    return { saved: true, progress: candidate };
  } catch {
    return { saved: false, progress: null };
  }
}
