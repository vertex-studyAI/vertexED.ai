import { authFetchWithAccessToken, getAccessToken } from '@/lib/apiAuth';
import { mergeExamSessionHistory, normalizeExamSession, readStoredExamSessionHistory } from './examSessionHistory.mjs';
import {
  getUserContentStorageScope,
  userContentStorageKeys,
} from '@/lib/userContentStorageScope.mjs';
import {
  deleteDurableOutboxRecord,
  listDurableOutboxRecords,
  putDurableOutboxRecord,
} from '@/lib/durableOutbox';

export type LearnerStateType = 'weakness' | 'retry' | 'mock_draft' | 'exam_session';

export type LearnerStateWrite = {
  stateType: LearnerStateType;
  stateKey: string;
  payload: Record<string, unknown>;
  clientRevision: string;
  clientUpdatedAt: string;
};

type RemoteLearnerStateItem = LearnerStateWrite & { serverUpdatedAt?: string };

const syncPromises = new Map<string, Promise<{ synced: number; remaining: number }>>();
let listenersInstalled = false;

function randomToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 24);
}

function newRevision(now = Date.now()) {
  return `state:${String(now).padStart(13, '0')}:${randomToken()}`;
}

function outboxKey(scope?: string) {
  return userContentStorageKeys(scope).learnerStateOutbox;
}

function readOutbox(scope?: string): LearnerStateWrite[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(outboxKey(scope)) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOutbox(items: LearnerStateWrite[], scope?: string) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(outboxKey(scope), JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

async function readCombinedOutbox(scope: string): Promise<LearnerStateWrite[]> {
  const combined = new Map(readOutbox(scope).map((item) => [compositeKey(item), item]));
  const durable = await listDurableOutboxRecords<LearnerStateWrite>('learner-state', scope);
  for (const record of durable) {
    const existing = combined.get(record.logicalKey);
    if (!existing || existing.clientUpdatedAt <= record.payload.clientUpdatedAt) combined.set(record.logicalKey, record.payload);
  }
  return [...combined.values()].sort((a, b) => a.clientUpdatedAt.localeCompare(b.clientUpdatedAt));
}

function compositeKey(item: Pick<LearnerStateWrite, 'stateType' | 'stateKey'>) {
  return `${item.stateType}:${item.stateKey}`;
}

function notifyChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('vertexed:learner-state-changed'));
}

export function queueLearnerStateWrite(
  stateType: LearnerStateType,
  stateKey: string,
  payload: Record<string, unknown>,
  now = new Date(),
): LearnerStateWrite {
  const scope = getUserContentStorageScope();
  const item: LearnerStateWrite = {
    stateType,
    stateKey,
    payload,
    clientRevision: newRevision(now.getTime()),
    clientUpdatedAt: now.toISOString(),
  };
  const key = compositeKey(item);
  const pending = readOutbox(scope ?? undefined).filter((candidate) => compositeKey(candidate) !== key);
  pending.push(item);
  writeOutbox(pending, scope ?? undefined);
  notifyChanged();
  if (scope) {
    void putDurableOutboxRecord({
      channel: 'learner-state', scope, logicalKey: key, revision: item.clientRevision, payload: item, updatedAt: item.clientUpdatedAt,
    }).then(() => syncLearnerState()).catch(() => undefined);
  }
  return item;
}

export function getPendingLearnerStateCount(scope = getUserContentStorageScope()) {
  return readOutbox(scope ?? undefined).length;
}

async function removeConfirmedWrites(uploaded: LearnerStateWrite[], scope: string) {
  const revisions = new Set(uploaded.map((item) => item.clientRevision));
  // Compare by revision, not just logical key: a newer edit queued while the
  // request was in flight must remain pending.
  writeOutbox(readOutbox(scope).filter((item) => !revisions.has(item.clientRevision)), scope);
  await Promise.all(uploaded.map((item) => deleteDurableOutboxRecord(
    'learner-state', scope, compositeKey(item), item.clientRevision,
  )));
}

export async function syncLearnerState(): Promise<{ synced: number; remaining: number }> {
  const scope = getUserContentStorageScope();
  if (!scope) return { synced: 0, remaining: 0 };
  const active = syncPromises.get(scope);
  if (active) return active;
  const promise = (async () => {
    const accessToken = await getAccessToken();
    if (!accessToken || getUserContentStorageScope() !== scope) {
      return { synced: 0, remaining: (await readCombinedOutbox(scope)).length };
    }
    const pending = await readCombinedOutbox(scope);
    let synced = 0;
    for (let offset = 0; offset < pending.length; offset += 50) {
      if (getUserContentStorageScope() !== scope) break;
      const batch = pending.slice(offset, offset + 50);
      const response = await authFetchWithAccessToken('/api/learner-state', accessToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: batch }),
      });
      if (!response.ok) break;
      const data = await response.json().catch(() => null);
      const acknowledged = new Set(
        Array.isArray(data?.results) ? data.results.map((item: { requestedRevision?: string }) => item.requestedRevision) : [],
      );
      const confirmed = batch.filter((item) => acknowledged.has(item.clientRevision));
      await removeConfirmedWrites(confirmed, scope);
      synced += confirmed.length;
      if (confirmed.length !== batch.length) break;
    }
    notifyChanged();
    return { synced, remaining: (await readCombinedOutbox(scope)).length };
  })().finally(() => {
    syncPromises.delete(scope);
  });
  syncPromises.set(scope, promise);
  return promise;
}

function applyWeakness(item: RemoteLearnerStateItem, scope: string) {
  const key = userContentStorageKeys(scope).weaknessHeatmap;
  const current = JSON.parse(window.localStorage.getItem(key) || '[]');
  const entries = Array.isArray(current) ? current : [];
  const id = String(item.payload.id || item.stateKey);
  const merged = [{ ...item.payload, id }, ...entries.filter((entry) => String(entry?.id || '') !== id)]
    .sort((a, b) => String(b.recordedAt || '').localeCompare(String(a.recordedAt || '')))
    .slice(0, 500);
  window.localStorage.setItem(key, JSON.stringify(merged));
}

function applyRetry(item: RemoteLearnerStateItem, scope: string) {
  const key = userContentStorageKeys(scope).retryQueue;
  const current = JSON.parse(window.localStorage.getItem(key) || '[]');
  const entries = Array.isArray(current) ? current : [];
  const incomingUpdatedAt = String(item.payload.updatedAt || item.clientUpdatedAt);
  const existing = entries.find((entry) => entry?.id === item.stateKey);
  if (existing && String(existing.updatedAt || '') > incomingUpdatedAt) return;
  const merged = [{ ...item.payload, id: item.stateKey, updatedAt: incomingUpdatedAt }, ...entries.filter((entry) => entry?.id !== item.stateKey)];
  window.localStorage.setItem(key, JSON.stringify(merged.slice(0, 200)));
}

function applyMockDraft(item: RemoteLearnerStateItem, scope: string) {
  const key = userContentStorageKeys(scope).mockExamDraft;
  const existing = JSON.parse(window.localStorage.getItem(key) || 'null');
  const incomingUpdatedAt = String(item.payload.updatedAt || item.payload.savedAt || item.clientUpdatedAt);
  const existingUpdatedAt = String(existing?.updatedAt || existing?.savedAt || '');
  if (existingUpdatedAt > incomingUpdatedAt) return;
  if (item.payload.deleted === true) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, JSON.stringify({ ...item.payload, updatedAt: incomingUpdatedAt }));
}

export async function hydrateLearnerState(): Promise<number> {
  const scope = getUserContentStorageScope();
  if (typeof window === 'undefined' || !scope) return 0;
  const accessToken = await getAccessToken();
  if (!accessToken || getUserContentStorageScope() !== scope) return 0;
  const items: RemoteLearnerStateItem[] = [];
  let cursor: string | null = null;
  const seen = new Set<string>();
  do {
    if (getUserContentStorageScope() !== scope) return 0;
    const url = cursor ? `/api/learner-state?cursor=${encodeURIComponent(cursor)}` : '/api/learner-state';
    const response = await authFetchWithAccessToken(url, accessToken);
    if (!response.ok) throw new Error('Learner-state recovery could not finish. Retry when connected.');
    const data = await response.json();
    if (!Array.isArray(data?.items)) throw new Error('Invalid learner-state recovery response.');
    items.push(...data.items);
    cursor = typeof data.nextCursor === 'string' ? data.nextCursor : null;
    if (cursor && seen.has(cursor)) throw new Error('Learner-state recovery cursor did not advance.');
    if (cursor) seen.add(cursor);
  } while (cursor);
  if (getUserContentStorageScope() !== scope) return 0;
  const pending = new Map((await readCombinedOutbox(scope)).map((item) => [compositeKey(item), item]));
  if (getUserContentStorageScope() !== scope) return 0;
  let recoveryFailures = 0;
  for (const item of items) {
    const localPending = pending.get(compositeKey(item));
    if (localPending && localPending.clientUpdatedAt >= item.clientUpdatedAt) continue;
    try {
      if (item.stateType === 'weakness') applyWeakness(item, scope);
      if (item.stateType === 'retry') applyRetry(item, scope);
      if (item.stateType === 'mock_draft') applyMockDraft(item, scope);
      if (item.stateType === 'exam_session') {
        const key = userContentStorageKeys(scope).examPrepHistory;
        const current = readStoredExamSessionHistory(window.localStorage, key);
        if (!normalizeExamSession(item.payload) || item.payload.id !== item.stateKey) throw new Error('Invalid exam session returned by account sync.');
        window.localStorage.setItem(key, JSON.stringify(mergeExamSessionHistory(current, item.payload)));
      }
    } catch {
      recoveryFailures += 1;
    }
  }
  notifyChanged();
  if (recoveryFailures) throw new Error(`${recoveryFailures} learner records could not be restored on this device. Free browser storage and retry account sync.`);
  return items.length;
}

export async function initializeLearnerStateSync() {
  if (typeof window === 'undefined' || !getUserContentStorageScope()) return;
  if (!listenersInstalled) {
    window.addEventListener('online', () => {
      void initializeLearnerStateSync().catch(() => notifyChanged());
    });
    listenersInstalled = true;
  }
  await syncLearnerState();
  await hydrateLearnerState();
}
