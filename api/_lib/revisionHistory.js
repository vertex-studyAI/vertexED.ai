import { createHash } from 'node:crypto';

export const REVISION_EVENT_TYPES = Object.freeze(['note', 'attempt', 'feedback', 'confirmation', 'retry', 'retraction']);
export const REVISION_EVIDENCE_STATUSES = Object.freeze(['generated', 'provisional', 'evidence-linked', 'learner-attested', 'independently-validated', 'retracted']);

const EVENT_TYPES = new Set(REVISION_EVENT_TYPES);
const EVIDENCE_STATUSES = new Set(REVISION_EVIDENCE_STATUSES);
const PAYLOAD_KEYS = new Set(['label', 'summary', 'route', 'artifactId', 'attemptId', 'feedbackId', 'confirmationMethod', 'retryId']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function boundedText(value, max) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : '';
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalValue(value[key])]));
  }
  return value;
}

export function revisionEventHash(value) {
  return createHash('sha256').update(JSON.stringify(canonicalValue(value))).digest('hex');
}

export function normalizeRevisionEvent(input, now = Date.now()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const id = boundedText(input.id, 36);
  const eventType = boundedText(input.eventType, 40);
  // Browser-submitted metadata cannot establish independent verification.
  const claimedStatus = boundedText(input.evidenceStatus, 40);
  const evidenceStatus = claimedStatus === 'independently-validated' ? 'learner-attested' : claimedStatus;
  const occurredAt = boundedText(input.occurredAt, 40);
  const sourceType = boundedText(input.sourceType, 40);
  const sourceKey = boundedText(input.sourceKey, 180);
  const sourceRevision = boundedText(input.sourceRevision, 180);
  const occurredMs = Date.parse(occurredAt);
  if (!UUID.test(id) || !EVENT_TYPES.has(eventType) || !EVIDENCE_STATUSES.has(evidenceStatus)) return null;
  if (!Number.isFinite(occurredMs) || occurredMs > now + 5 * 60_000 || !sourceType || !sourceKey || !sourceRevision) return null;

  const parents = Array.isArray(input.parentEventIds) ? [...new Set(input.parentEventIds)] : [];
  if (parents.length > 8 || parents.some(parent => !UUID.test(parent) || parent === id)) return null;
  if ((eventType === 'retraction') !== (evidenceStatus === 'retracted')) return null;
  if (eventType === 'retraction' && parents.length !== 1) return null;

  const rawPayload = input.payload && typeof input.payload === 'object' && !Array.isArray(input.payload) ? input.payload : {};
  if (Object.keys(rawPayload).some(key => !PAYLOAD_KEYS.has(key))) return null;
  const payload = {};
  for (const key of PAYLOAD_KEYS) {
    const value = boundedText(rawPayload[key], key === 'summary' ? 500 : 180);
    if (value) payload[key] = value;
  }
  if (payload.route && !/^\/(?!\/)[a-z0-9/_?&=.%:+-]*$/i.test(payload.route)) return null;

  const normalized = { id, eventType, occurredAt: new Date(occurredMs).toISOString(), evidenceStatus, sourceType, sourceKey, sourceRevision, parentEventIds: parents, payload };
  return { ...normalized, payloadSha256: revisionEventHash(normalized) };
}

export function materializeRevisionGraph(events) {
  const valid = (Array.isArray(events) ? events : []).filter(event => event && UUID.test(String(event.id || '')));
  const ids = new Set(valid.map(event => event.id));
  const retracted = new Set(valid.filter(event => event.eventType === 'retraction' && event.evidenceStatus === 'retracted').flatMap(event => event.parentEventIds || []));
  return valid
    .map(event => ({
      ...event,
      parentEventIds: (event.parentEventIds || []).filter(parent => ids.has(parent)),
      effectiveEvidenceStatus: retracted.has(event.id) ? 'retracted' : event.evidenceStatus,
    }))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id));
}
