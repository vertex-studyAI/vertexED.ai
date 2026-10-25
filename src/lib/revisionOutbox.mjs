// Account-bound, append-only delivery. A failed request never acknowledges an event.
export function createRevisionOutbox({ getScope, getToken, read, write, remove, send, changed }) {
  const memory = new Map();
  const active = new Map();
  const states = new Map();
  const deleted = new Set();
  const records = scope => {
    if (!memory.has(scope)) memory.set(scope, new Map());
    return memory.get(scope);
  };
  const publish = (scope, error = '') => {
    if (deleted.has(scope)) return;
    const entries = [...records(scope).values()];
    const state = { scope, pending: entries.length, volatile: entries.filter(item => !item.durable).length, error };
    states.set(scope, state);
    changed(state);
    return state;
  };
  async function recover(scope) {
    const saved = await read(scope);
    if (deleted.has(scope)) return;
    for (const event of saved) {
      if (!event?.id || !event.sourceKey || !event.sourceRevision) throw new Error('Some revision records could not be read. Export your device data before clearing storage.');
      if (!records(scope).has(event.id)) records(scope).set(event.id, { event, durable: true, ready: true });
    }
  }
  function deliveryOrder(scope) {
    const waiting = records(scope);
    const ordered = [];
    const visited = new Set();
    const visiting = new Set();
    function visit(item) {
      if (visited.has(item.event.id)) return true;
      if (!item.ready || visiting.has(item.event.id)) return false;
      visiting.add(item.event.id);
      for (const parentId of item.event.parentEventIds ?? []) {
        const parent = waiting.get(parentId);
        if (parent && !visit(parent)) return false;
      }
      visiting.delete(item.event.id);
      visited.add(item.event.id);
      ordered.push(item);
      return true;
    }
    for (const item of waiting.values()) visit(item);
    return ordered.slice(0, 50);
  }
  async function sync() {
    const scope = getScope();
    if (!scope || deleted.has(scope)) return;
    if (active.has(scope)) return active.get(scope);
    const operation = (async () => {
      try {
        await recover(scope);
        if (getScope() !== scope || deleted.has(scope)) return;
        const token = await getToken();
        if (!token || getScope() !== scope || deleted.has(scope)) return publish(scope);
        // Bound each background pass. Remaining records stay recoverable.
        for (const { event } of deliveryOrder(scope)) {
          if (getScope() !== scope || deleted.has(scope)) return;
          const result = await send(event, token);
          if (getScope() !== scope || deleted.has(scope)) return;
          const acknowledgement = result?.event;
          if (!result?.ok || acknowledgement?.id !== event.id || acknowledgement?.sourceKey !== event.sourceKey
              || acknowledgement?.sourceRevision !== event.sourceRevision || acknowledgement?.eventType !== event.eventType) {
            return publish(scope, 'Revision history has not reached your account. Retry when connected.');
          }
          // Keep an acknowledged item pending if cleanup fails: replay is idempotent.
          if (!await remove(scope, event)) return publish(scope, 'Revision history reached your account, but device cleanup needs another retry.');
          if (deleted.has(scope)) return;
          records(scope).delete(event.id);
        }
        return publish(scope);
      } catch {
        return publish(scope, 'Revision history could not sync. Your pending entries remain available for export.');
      }
    })().finally(() => active.delete(scope));
    active.set(scope, operation);
    return operation;
  }
  async function enqueue(event) {
    const scope = getScope();
    if (!scope || deleted.has(scope)) throw new Error('Sign in before saving revision history.');
    // Clone before yielding, so an editor cannot mutate a queued event.
    const snapshot = JSON.parse(JSON.stringify(event));
    const entry = { event: snapshot, durable: false, ready: false };
    records(scope).set(snapshot.id, entry);
    publish(scope);
    try { entry.durable = await write(scope, snapshot); } catch { entry.durable = false; }
    entry.ready = true;
    if (deleted.has(scope)) { records(scope).delete(snapshot.id); return snapshot; }
    publish(scope, entry.durable ? '' : 'Revision history is only held in this tab. Export pending entries before leaving.');
    if (getScope() === scope) void sync();
    return snapshot;
  }
  return {
    enqueue, sync,
    status: scope => states.get(scope) ?? { scope, pending: 0, volatile: 0, error: '' },
    async pending(scope) {
      await recover(scope);
      if (getScope() !== scope || deleted.has(scope)) throw new Error('Account changed during revision export.');
      return [...records(scope).values()].map(item => item.event);
    },
    forget(scope) { deleted.add(scope); memory.delete(scope); states.delete(scope); },
  };
}
