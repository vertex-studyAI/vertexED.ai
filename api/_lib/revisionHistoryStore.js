import { normalizeRevisionEvent } from './revisionHistory.js';

const FIELDS = 'id, event_type, occurred_at, evidence_status, source_type, source_key, source_revision, parent_event_ids, payload, payload_sha256, created_at';

function mapRow(row) {
  return {
    id: row.id,
    eventType: row.event_type,
    occurredAt: row.occurred_at,
    evidenceStatus: row.evidence_status,
    sourceType: row.source_type,
    sourceKey: row.source_key,
    sourceRevision: row.source_revision,
    parentEventIds: row.parent_event_ids ?? [],
    payload: row.payload ?? {},
    payloadSha256: row.payload_sha256,
    createdAt: row.created_at,
  };
}

const CURSOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function encodeRevisionCursor(row) {
  return Buffer.from(JSON.stringify({ occurredAt: row.occurred_at, id: row.id })).toString('base64url');
}

export function decodeRevisionCursor(value) {
  if (!value || typeof value !== 'string' || value.length > 256) return null;
  let parsed;
  try { parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')); }
  catch { throw new TypeError('Invalid revision-history cursor'); }
  const occurredAt = typeof parsed?.occurredAt === 'string' ? parsed.occurredAt : '';
  const occurredMs = Date.parse(occurredAt);
  if (!Number.isFinite(occurredMs) || new Date(occurredMs).toISOString() !== occurredAt || !CURSOR_ID.test(parsed?.id ?? '')) {
    throw new TypeError('Invalid revision-history cursor');
  }
  return { occurredAt, id: parsed.id };
}

export async function appendRevisionEvent(supabase, userId, input, now = Date.now()) {
  const event = normalizeRevisionEvent(input, now);
  if (!event) return { data: null, error: { code: 'INVALID_REVISION_EVENT' } };

  if (event.parentEventIds.length) {
    const parents = await supabase.from('revision_events').select('id').eq('user_id', userId).in('id', event.parentEventIds);
    if (parents.error) return { data: null, error: parents.error };
    if (new Set((parents.data ?? []).map(row => row.id)).size !== event.parentEventIds.length) {
      return { data: null, error: { code: 'REVISION_PARENT_NOT_FOUND' } };
    }
  }

  const row = {
    id: event.id,
    user_id: userId,
    event_type: event.eventType,
    occurred_at: event.occurredAt,
    evidence_status: event.evidenceStatus,
    source_type: event.sourceType,
    source_key: event.sourceKey,
    source_revision: event.sourceRevision,
    parent_event_ids: event.parentEventIds,
    payload: event.payload,
    payload_sha256: event.payloadSha256,
  };
  const inserted = await supabase.from('revision_events').insert(row).select(FIELDS).single();
  if (!inserted.error) return { data: mapRow(inserted.data), error: null, idempotent: false };
  if (inserted.error.code !== '23505') return { data: null, error: inserted.error };

  const existing = await supabase.from('revision_events').select(FIELDS)
    .eq('user_id', userId)
    .eq('source_type', event.sourceType)
    .eq('source_key', event.sourceKey)
    .eq('source_revision', event.sourceRevision)
    .eq('event_type', event.eventType)
    .maybeSingle();
  if (existing.error || !existing.data || existing.data.payload_sha256 !== event.payloadSha256) {
    return { data: null, error: existing.error ?? { code: 'REVISION_EVENT_CONFLICT' } };
  }
  return { data: mapRow(existing.data), error: null, idempotent: true };
}

export async function listRevisionEvents(supabase, userId, cursorValue = null) {
  const cursor = decodeRevisionCursor(cursorValue);
  let query = supabase.from('revision_events').select(FIELDS).eq('user_id', userId)
    .order('occurred_at', { ascending: false }).order('id', { ascending: false });
  if (cursor) {
    query = query.or(`occurred_at.lt.${cursor.occurredAt},and(occurred_at.eq.${cursor.occurredAt},id.lt.${cursor.id})`);
  }
  const result = await query.limit(201);
  const rows = (result.data ?? []).slice(0, 200);
  return {
    data: rows.map(mapRow),
    error: result.error,
    nextCursor: result.data?.length > 200 ? encodeRevisionCursor(rows.at(-1)) : null,
  };
}
