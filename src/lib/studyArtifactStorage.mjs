import { isPlainRecord, isStudyArtifactKind } from '../../contracts/studyArtifact.js';

function validTimestamp(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 80) return false;
  return Number.isFinite(Date.parse(value));
}

function optionalString(value, maxLength = 256) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength
    ? value
    : undefined;
}

export function normalizeStoredStudyArtifact(value) {
  if (!isPlainRecord(value)) return null;
  if (typeof value.id !== 'string' || value.id.length === 0 || value.id.length > 512) return null;
  if (!isStudyArtifactKind(value.kind)) return null;
  if (!(value.title === null || typeof value.title === 'string')) return null;
  if (!isPlainRecord(value.payload)) return null;
  if (!validTimestamp(value.created_at) || !validTimestamp(value.updated_at)) return null;

  const normalized = {
    id: value.id,
    kind: value.kind,
    title: value.title === null ? null : value.title.slice(0, 200),
    payload: value.payload,
    created_at: value.created_at,
    updated_at: value.updated_at,
  };

  if (value.localOnly === true) normalized.localOnly = true;

  const idempotencyKey = optionalString(value.idempotencyKey, 256);
  if (idempotencyKey) normalized.idempotencyKey = idempotencyKey;

  if (value.idempotency_key === null) normalized.idempotency_key = null;
  else {
    const cloudIdempotencyKey = optionalString(value.idempotency_key, 256);
    if (cloudIdempotencyKey) normalized.idempotency_key = cloudIdempotencyKey;
  }

  const localRevision = optionalString(value.localRevision, 256);
  if (localRevision) normalized.localRevision = localRevision;

  return normalized;
}

export function normalizeStoredStudyArtifacts(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  const seen = new Set();
  for (const candidate of value) {
    const artifact = normalizeStoredStudyArtifact(candidate);
    if (!artifact || seen.has(artifact.id)) continue;
    seen.add(artifact.id);
    result.push(artifact);
  }
  return result;
}
