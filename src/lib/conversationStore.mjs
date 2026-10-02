import { validateConversations } from '../../contracts/apexConversation.js';

const EMPTY = () => ({ version: 1, threads: [] });
const CONFLICT = 'Conversation history changed elsewhere. Export this copy, then reload the account copy before continuing.';

// A single store per account is shared by every mounted tutor entry point.
// Dependencies are injected so races, failed acknowledgements and offline writes
// can be exercised without a browser or a real learner account.
export function createConversationStore({ key, storage, request, isCurrent, legacyStorage, legacyPrefix }) {
  let raw = null;
  let envelope = { snapshot: EMPTY(), revision: null, dirty: false };
  let state = { ...envelope, ready: false, readOnly: false, status: 'Loading conversation history…' };
  let loading = null;
  let saving = null;
  const listeners = new Set();
  const publish = (patch = {}) => {
    state = { ...state, ...envelope, ...patch };
    listeners.forEach(listener => listener());
  };
  const active = () => { if (!isCurrent()) throw new Error('Account changed. Conversation work was not copied to another account.'); };
  const persist = () => {
    active();
    if (storage.getItem(key) !== raw) throw new Error(CONFLICT);
    const next = JSON.stringify(envelope);
    storage.setItem(key, next);
    raw = next;
  };
  const fail = (error, readOnly = false) => { publish({ ready: true, readOnly: state.readOnly || readOnly || error.message === CONFLICT, status: error.message }); return false; };
  const parseEnvelope = (value) => {
    const data = JSON.parse(value);
    validateConversations(data.snapshot);
    if (typeof data.dirty !== 'boolean' || (data.revision !== null && (typeof data.revision !== 'string' || !Number.isFinite(Date.parse(data.revision))))) throw new Error('Conversation save information is unreadable. Original bytes are preserved.');
    return data;
  };
  try {
    raw = storage.getItem(key);
    if (raw) envelope = parseEnvelope(raw);
    // Import old session history once, retaining its bytes until account cleanup.
    else if (legacyStorage && legacyPrefix) {
      const threads = [];
      for (let i = 0; i < legacyStorage.length; i++) {
        const oldKey = legacyStorage.key(i);
        if (!oldKey?.startsWith(legacyPrefix) || oldKey === key) continue;
        const messages = JSON.parse(legacyStorage.getItem(oldKey));
        if (Array.isArray(messages) && messages.length) threads.push({ id: decodeURIComponent(oldKey.slice(legacyPrefix.length)), messages });
      }
      if (threads.length) envelope = { snapshot: validateConversations({ version: 1, threads }), revision: null, dirty: true };
    }
    publish();
  } catch { fail(new Error('Conversation history could not be read. Original data is preserved. Export account data before recovery.'), true); }

  async function sync() {
    if (saving) return saving;
    if (!state.ready || state.readOnly || !envelope.dirty) return false;
    saving = (async () => {
      try {
        active();
        const sent = envelope.snapshot;
        const expectedUpdatedAt = envelope.revision;
        publish({ status: 'Saving conversation history…' });
        const data = await request('POST', { kind: 'conversation', title: 'AI tutor conversations', replace: true, expectedUpdatedAt, payload: sent });
        active();
        if (!data?.item?.id || data.item.kind !== 'conversation' || typeof data.item.updated_at !== 'string' || !Number.isFinite(Date.parse(data.item.updated_at))
          || (expectedUpdatedAt !== null && Date.parse(data.item.updated_at) <= Date.parse(expectedUpdatedAt))) throw new Error('Cloud acknowledgement was incomplete. Conversation history is saved on this device only.');
        envelope = { ...envelope, revision: data.item.updated_at, dirty: envelope.snapshot !== sent };
        persist();
        publish({ status: envelope.dirty ? 'Newer conversation changes are waiting to sync.' : 'Conversation history saved to your account.' });
        return true;
      } catch (error) { return fail(error); }
      finally { saving = null; }
    })();
    const ok = await saving;
    if (ok && envelope.dirty && !state.readOnly) return sync();
    return ok;
  }

  async function load(acceptCloud = false) {
    if (loading) return loading;
    if (state.readOnly && !acceptCloud) return false;
    loading = (async () => {
      try {
        active();
        if (saving) await saving;
        const data = await request('GET');
        active();
        if (!Array.isArray(data?.items) || data.items.length > 1) throw new Error('Account conversation history could not be verified. Your device copy is preserved.');
        const item = data.items[0];
        const cloud = item ? validateConversations(item.payload) : EMPTY();
        const revision = item?.updated_at ?? null;
        if (revision !== null && (typeof revision !== 'string' || !Number.isFinite(Date.parse(revision)))) throw new Error('Account conversation revision is invalid.');
        if (acceptCloud) {
          const currentBytes = storage.getItem(key);
          storage.setItem(`${key}:recovery:${Date.now()}`, JSON.stringify({ deviceBytes: currentBytes, inMemory: envelope }));
          raw = currentBytes;
        } else {
          if (storage.getItem(key) !== raw) throw new Error(CONFLICT);
          if (envelope.dirty && envelope.revision !== revision) throw new Error(CONFLICT);
        }
        if (acceptCloud || !envelope.dirty) envelope = { snapshot: cloud, revision, dirty: false };
        persist();
        publish({ ready: true, readOnly: false, status: envelope.dirty ? 'Conversation changes are waiting to sync.' : 'Conversation history saved to your account.' });
        return true;
      } catch (error) { return fail(error); }
      finally { loading = null; }
    })();
    const ok = await loading;
    if (ok && envelope.dirty) await sync();
    return ok;
  }

  function updateThread(id, messages) {
    let writeStarted = false;
    try {
      active();
      if (!state.ready || state.readOnly) throw new Error(state.status);
      const threads = envelope.snapshot.threads.filter(thread => thread.id !== id);
      if (messages.length) threads.push({ id, messages });
      const snapshot = validateConversations({ version: 1, threads });
      writeStarted = true;
      // Keep recoverable in-memory work even if the browser rejects this write.
      envelope = { ...envelope, snapshot, dirty: true };
      persist();
      publish({ status: 'Conversation history saved on this device. Account save pending.' });
      return true;
    } catch (error) { return fail(error, writeStarted); }
  }
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => state,
    load, sync, updateThread,
    invalidate() { try { if (storage.getItem(key) !== raw) fail(new Error(CONFLICT), true); } catch { fail(new Error('Browser storage is unavailable. Export the visible history before leaving.'), true); } },
    exportData: () => {
      active();
      let deviceBytes = raw;
      try { deviceBytes = storage.getItem(key); } catch { /* In-memory copy remains exportable. */ }
      return JSON.stringify({ ...envelope, deviceBytes }, null, 2);
    },
  };
}
