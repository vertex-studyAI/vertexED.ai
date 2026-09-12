const writes = new Map();
// Each tab keeps the revision it actually read. Another tab changing shared
// localStorage must not authorize a stale in-memory snapshot to overwrite it.
const revisions = new Map();

export function readSnapshotArray(storage, key) {
  const raw = storage.getItem(key);
  if (raw === null) return [];
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value)) return value;
  } catch { /* Preserve the original bytes for explicit recovery/export. */ }
  throw new Error('Device work could not be read. Export your account data before loading the cloud copy. The original device data has not been changed.');
}

export function backupSnapshotBytes(storage, keys, backupKey) {
  const raw = Object.fromEntries(Object.entries(keys).map(([name, key]) => [name, storage.getItem(key)]));
  storage.setItem(backupKey, JSON.stringify({ format: 'vertexed.raw-snapshot.v1', raw }));
}

export function writeSnapshotValues(storage, entries) {
  const previous = entries.map(([key]) => [key, storage.getItem(key)]);
  let written = 0;
  try {
    for (const [key, value] of entries) {
      storage.setItem(key, value);
      written += 1;
    }
  } catch (error) {
    let rollbackFailed = false;
    for (let index = written - 1; index >= 0; index -= 1) {
      const [key, previousValue] = previous[index];
      try {
        if (previousValue === null) storage.removeItem(key);
        else storage.setItem(key, previousValue);
      } catch {
        rollbackFailed = true;
      }
    }
    if (rollbackFailed) {
      throw new Error('Device storage write failed and the previous snapshot could not be fully restored. Export your account data before continuing.');
    }
    throw error;
  }
}

export function captureSnapshotRevision(key, revision) {
  revisions.set(key, revision);
}

export function expectedSnapshotRevision(key, fallback = null) {
  if (!revisions.has(key)) revisions.set(key, fallback);
  return revisions.get(key);
}

export function readSnapshotMetadata(storage, key) {
  const raw = storage.getItem(`${key}:sync`);
  if (!raw) return { revision: null, pending: false, syncedLocalTime: null };
  const value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || (value.pending !== undefined && typeof value.pending !== 'boolean')
    || [value.revision, value.syncedLocalTime].some(time => time != null && (typeof time !== 'string' || !Number.isFinite(Date.parse(time))))) {
    throw new Error('Snapshot recovery metadata is invalid. Export device data before resetting it.');
  }
  return value;
}

export function writeSnapshotMetadata(storage, key, metadata) {
  storage.setItem(`${key}:sync`, JSON.stringify(metadata));
}

export function reconcileSnapshot({ local, cloud, metadata, acceptCloud = false }) {
  const dirty = metadata.pending || (local.updatedAt !== new Date(0).toISOString() && local.updatedAt !== metadata.syncedLocalTime);
  const different = JSON.stringify({ ...local, updatedAt: null }) !== JSON.stringify({ ...cloud, updatedAt: null });
  const conflict = Boolean(cloud && dirty && different && metadata.revision !== cloud.updatedAt);
  if (conflict && !acceptCloud) return { snapshot: local, cloudSynced: false, conflict: true, metadata };
  const snapshot = acceptCloud && cloud ? cloud : dirty ? local : cloud || local;
  const pending = snapshot === local && dirty && (!cloud || different);
  return { snapshot, cloudSynced: !pending, conflict: false, metadata: { revision: cloud?.updatedAt ?? null, pending, syncedLocalTime: pending ? metadata.syncedLocalTime : snapshot.updatedAt } };
}

export function serializeSnapshotWrite(key, write) {
  const previous = writes.get(key) || Promise.resolve();
  const current = previous.catch(() => undefined).then(write);
  writes.set(key, current);
  void current.finally(() => { if (writes.get(key) === current) writes.delete(key); }).catch(() => undefined);
  return current;
}
