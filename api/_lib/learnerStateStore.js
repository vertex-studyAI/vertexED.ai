import { normalizeExamSession } from '../../src/lib/examSessionHistory.mjs';

const STATE_TYPES = new Set(['weakness', 'retry', 'mock_draft', 'exam_session']);
const STATE_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/;
const REVISION = /^state:[0-9]{13}:[A-Za-z0-9-]{8,64}$/;
const MAX_PAYLOAD_BYTES = 256 * 1024;

function cleanDate(value) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return null;
  const date = new Date(value);
  if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) return null;
  return date.toISOString();
}

export function normalizeLearnerStateItem(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const stateType = typeof value.stateType === 'string' ? value.stateType : '';
  const stateKey = typeof value.stateKey === 'string' ? value.stateKey : '';
  const clientRevision = typeof value.clientRevision === 'string' ? value.clientRevision : '';
  const clientUpdatedAt = cleanDate(value.clientUpdatedAt);
  const payload = value.payload;
  if (!STATE_TYPES.has(stateType) || !STATE_KEY.test(stateKey) || !REVISION.test(clientRevision)) return null;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !clientUpdatedAt) return null;
  if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > MAX_PAYLOAD_BYTES) return null;
  if (stateType === 'exam_session' && (!normalizeExamSession(payload) || payload.id !== stateKey)) return null;
  return { stateType, stateKey, payload, clientRevision, clientUpdatedAt };
}

export async function syncLearnerStateItem(supabase, userId, item) {
  const { data, error } = await supabase.rpc('sync_learner_state_item', {
    p_user_id: userId,
    p_state_type: item.stateType,
    p_state_key: item.stateKey,
    p_payload: item.payload,
    p_client_revision: item.clientRevision,
    p_client_updated_at: item.clientUpdatedAt,
  });
  const result = Array.isArray(data) ? data[0] : data;
  return { data: result ?? null, error };
}

export async function syncLearnerStateItems(supabase, userId, items) {
  return supabase.rpc('sync_learner_state_items', {
    p_user_id: userId,
    p_items: items,
  });
}

export async function listLearnerStateItems(supabase, userId, cursor = null) {
  let query = supabase
    .from('learner_state_items')
    .select('state_type, state_key, payload, client_revision, client_updated_at, updated_at')
    .eq('user_id', userId)
    .order('state_type', { ascending: true })
    .order('state_key', { ascending: true });
  if (cursor) {
    const [type, ...parts] = cursor.split(':');
    const key = parts.join(':');
    if (!STATE_TYPES.has(type) || !STATE_KEY.test(key)) throw new TypeError('Invalid learner-state cursor');
    query = query.or(`state_type.gt.${type},and(state_type.eq.${type},state_key.gt.${key})`);
  }
  const { data, error } = await query.limit(501);
  const items = (data || []).slice(0, 500);
  const last = items.at(-1);
  return { data: items, error, nextCursor: data?.length > 500 ? `${last.state_type}:${last.state_key}` : null };
}
