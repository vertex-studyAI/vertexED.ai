import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { authFetchWithAccessToken, getAccessToken } from '@/lib/apiAuth';
import { deleteDurableOutboxRecord, listDurableOutboxRecords, putDurableOutboxRecord } from '@/lib/durableOutbox';
import { resolveLocalStorage } from '@/lib/browserStorage.mjs';
import { createRevisionOutbox } from '@/lib/revisionOutbox.mjs';
import type { RevisionEvent } from '@/lib/revisionHistory';

export type RevisionSyncStatus = { scope: string; pending: number; volatile: number; error: string };
const storage = () => typeof window === 'undefined' ? null : resolveLocalStorage(window);
const prefix = (scope: string) => `${userContentStorageKeys(scope).revisionHistoryOutbox}:`;
let installed = false;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

const outbox = createRevisionOutbox({
  getScope: getUserContentStorageScope,
  getToken: getAccessToken,
  async read(scope: string) {
    const entries = new Map<string, RevisionEvent>();
    const local = storage();
    if (local) for (let index = 0; index < local.length; index += 1) {
      const key = local.key(index);
      if (key?.startsWith(prefix(scope))) {
        const value = JSON.parse(local.getItem(key) || 'null') as RevisionEvent;
        if (!value?.id || key !== `${prefix(scope)}${value.id}`) throw new Error('Invalid revision recovery record.');
        entries.set(value.id, value);
      }
    }
    for (const record of await listDurableOutboxRecords<RevisionEvent>('revision-event', scope, true)) entries.set(record.payload.id, record.payload);
    return [...entries.values()];
  },
  async write(scope: string, event: RevisionEvent) {
    let localSaved = false;
    try { const local = storage(); if (local) { local.setItem(`${prefix(scope)}${event.id}`, JSON.stringify(event)); localSaved = true; } } catch { /* IndexedDB can still preserve the event. */ }
    const indexedSaved = await putDurableOutboxRecord({ channel: 'revision-event', scope, logicalKey: event.id, revision: event.id, payload: event, updatedAt: event.occurredAt });
    return localSaved || indexedSaved;
  },
  async remove(scope: string, event: RevisionEvent) {
    try { storage()?.removeItem(`${prefix(scope)}${event.id}`); } catch { return false; }
    return typeof indexedDB === 'undefined' || await deleteDurableOutboxRecord('revision-event', scope, event.id, event.id);
  },
  async send(event: RevisionEvent, token: string) {
    const response = await authFetchWithAccessToken('/api/revision-history', token, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event),
    });
    const body = await response.json().catch(() => null);
    return { ok: response.ok, event: body?.event };
  },
  changed(state: RevisionSyncStatus) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('vertexed:revision-sync', { detail: state }));
    if (state.pending && !retryTimer) retryTimer = setTimeout(() => {
      retryTimer = undefined;
      void outbox.sync();
    }, 30_000);
  },
});

export const queueRevisionEvent = (event: RevisionEvent): Promise<RevisionEvent> => outbox.enqueue(event);
export const syncRevisionHistory = (): Promise<void> => outbox.sync();
export const revisionSyncStatus = (scope: string): RevisionSyncStatus => outbox.status(scope);
export const pendingRevisionEvents = (scope: string): Promise<RevisionEvent[]> => outbox.pending(scope);
export const forgetRevisionEvents = (scope: string) => outbox.forget(scope);

export function initializeRevisionSync() {
  if (typeof window === 'undefined') return;
  if (!installed) {
    window.addEventListener('online', () => { void outbox.sync(); });
    window.addEventListener('focus', () => { void outbox.sync(); });
    installed = true;
  }
  return outbox.sync();
}
