export const STUDY_ARTIFACT_KINDS = Object.freeze([
  'note',
  'review',
  'paper',
  'planner',
  'notebook',
]);

const STUDY_ARTIFACT_KIND_SET = new Set(STUDY_ARTIFACT_KINDS);
const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

export function isStudyArtifactKind(value) {
  return typeof value === 'string' && STUDY_ARTIFACT_KIND_SET.has(value);
}

export function isPlainRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function normalizeStudyArtifactPayload(value) {
  if (isPlainRecord(value)) return { ok: true, value };
  if (typeof value === 'string') return { ok: true, value: { text: value } };
  return { ok: false, error: 'Artifact payload must be a JSON object or text.' };
}

export function normalizeArtifactIdempotencyKey(value) {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: null };
  }
  if (typeof value !== 'string' || !IDEMPOTENCY_KEY_RE.test(value)) {
    return {
      ok: false,
      error: 'Idempotency key must be 8–128 URL-safe characters.',
    };
  }
  return { ok: true, value };
}

export function parseStudyArtifactCreate(value) {
  if (!isPlainRecord(value)) {
    return { ok: false, error: 'Artifact request must be a JSON object.' };
  }

  if (!isStudyArtifactKind(value.kind)) {
    return {
      ok: false,
      error: `Invalid kind. Use ${STUDY_ARTIFACT_KINDS.join(', ')}.`,
    };
  }

  const rawPayload = value.payload ?? value.content;
  if (rawPayload === undefined) {
    return { ok: false, error: 'Artifact payload is required.' };
  }

  const payload = normalizeStudyArtifactPayload(rawPayload);
  if (!payload.ok) return payload;

  const idempotencyKey = normalizeArtifactIdempotencyKey(value.idempotencyKey);
  if (!idempotencyKey.ok) return idempotencyKey;

  const title = typeof value.title === 'string'
    ? value.title.trim().slice(0, 200) || null
    : null;

  return {
    ok: true,
    value: {
      kind: value.kind,
      title,
      payload: payload.value,
      replace: value.replace === true,
      idempotencyKey: idempotencyKey.value,
    },
  };
}
