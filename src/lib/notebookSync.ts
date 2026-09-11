import { authFetchWithAccessToken, getAccessToken } from '@/lib/apiAuth';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import { readSnapshotArray, backupSnapshotBytes, readSnapshotMetadata, writeSnapshotMetadata, reconcileSnapshot, serializeSnapshotWrite, captureSnapshotRevision, expectedSnapshotRevision } from '@/lib/snapshotConcurrency.mjs';
import { setNotebookStorageScope, type StudyNotebook } from '@/lib/notebook';
import { notebookStorageKeys } from '@/lib/notebookStorageScope.mjs';
import { validateNotebookSnapshot } from '@/lib/snapshotValidation.mjs';
import { supabase } from '@/lib/supabaseClient';

export type NotebookSnapshot = {
  notebooks: StudyNotebook[];
  updatedAt: string;
};

let hydratedStorageScope: string | null | undefined;

function emptySnapshot(): NotebookSnapshot {
  return { notebooks: [], updatedAt: new Date(0).toISOString() };
}

function accountChangedNotebookResult() {
  return {
    snapshot: emptySnapshot(),
    cloudSynced: false,
    readOnly: true,
    error: 'Account changed during recovery.',
  };
}

async function resolveStorageScope(explicitScope?: string | null): Promise<string | null> {
  if (typeof explicitScope === 'string' && explicitScope.trim()) return explicitScope;
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function readLocalSnapshot(storageScope?: string | null): NotebookSnapshot {
  if (typeof window === 'undefined') {
    return emptySnapshot();
  }
  setNotebookStorageScope(storageScope);
  const keys = notebookStorageKeys(storageScope);
    const notebooks = readSnapshotArray(localStorage, keys.notebooks) as StudyNotebook[];
    return validateNotebookSnapshot({
      notebooks,
      updatedAt: localStorage.getItem(keys.updatedAt) || new Date(0).toISOString(),
    });
}

export function writeLocalNotebookSnapshot(
  snapshot: NotebookSnapshot,
  storageScope?: string | null,
) {
  if (typeof window === 'undefined') return;
  snapshot = validateNotebookSnapshot(snapshot);
  setNotebookStorageScope(storageScope);
  const keys = notebookStorageKeys(storageScope);
  localStorage.setItem(keys.notebooks, JSON.stringify(snapshot.notebooks));
  localStorage.setItem(keys.updatedAt, snapshot.updatedAt);
}

function parseCloudSnapshot(item: {
  payload?: Record<string, unknown>;
  updated_at?: string;
}): NotebookSnapshot | null {
  try {
    return validateNotebookSnapshot({ notebooks: item.payload?.notebooks, updatedAt: item.updated_at });
  } catch { return null; }
}

export async function loadNotebookSnapshot(storageScope?: string | null, acceptCloud = false): Promise<{
  snapshot: NotebookSnapshot;
  cloudSynced: boolean;
  error?: string;
  readOnly?: boolean;
}> {
  // Invalidate write ownership synchronously before any account/session lookup or network work.
  hydratedStorageScope = undefined;
  const resolvedScope = await resolveStorageScope(storageScope);
  if (!resolvedScope || getUserContentStorageScope() !== resolvedScope) return accountChangedNotebookResult();
  setNotebookStorageScope(resolvedScope);
  const keys = notebookStorageKeys(resolvedScope);
  let local: NotebookSnapshot;
  let localReadFailed = false;
  try {
    local = readLocalSnapshot(resolvedScope);
  } catch {
    localReadFailed = true;
    const empty = emptySnapshot();
    if (!acceptCloud) return { snapshot: empty, cloudSynced: false, readOnly: true, error: 'Device notebooks could not be read. Export account data or reload the cloud copy. Original device data is preserved.' };
    try { backupSnapshotBytes(localStorage, keys, `${keys.updatedAt}:conflict:${Date.now()}`); }
    catch { return { snapshot: empty, cloudSynced: false, readOnly: true, error: 'Cannot preserve a device backup. Allow browser storage or export account data before recovery.' }; }
    local = empty;
  }
  const accessToken = await getAccessToken().catch(() => null);
  if (getUserContentStorageScope() !== resolvedScope) return accountChangedNotebookResult();
  if (!accessToken) {
    if (!localReadFailed) hydratedStorageScope = resolvedScope;
    return { snapshot: local, cloudSynced: false, readOnly: localReadFailed, error: localReadFailed ? 'Device recovery needs a cloud connection. Original device data is preserved.' : 'Device work recovered. Sign in again to resume cloud sync.' };
  }
  const metadataKey = notebookStorageKeys(resolvedScope).updatedAt;

  const finish = (result: {
    snapshot: NotebookSnapshot;
    cloudSynced: boolean;
    error?: string;
    readOnly?: boolean;
  }) => {
    if (getUserContentStorageScope() !== resolvedScope) return accountChangedNotebookResult();
    const readOnly = result.readOnly || (localReadFailed && !result.cloudSynced);
    if (!readOnly) hydratedStorageScope = resolvedScope;
    return { ...result, readOnly };
  };

  try {
    const res = await authFetchWithAccessToken('/api/user-content?kind=notebook&limit=1', accessToken);
    const data = await res.json().catch(() => null);
    if (getUserContentStorageScope() !== resolvedScope) return accountChangedNotebookResult();
    if (!res.ok) {
      return finish({
        snapshot: local,
        cloudSynced: false,
        error: data?.error || 'Notebooks saved on this device only',
      });
    }

    if (!Array.isArray(data?.items)) throw new Error('Invalid cloud response. Local work was preserved.');
    const item = data.items[0] ?? null;
    const cloud = item ? parseCloudSnapshot(item) : null;
    if (item && !cloud) throw new Error('Invalid cloud snapshot. Local work was preserved.');
    const metadata = readSnapshotMetadata(localStorage, metadataKey);
    if (acceptCloud && !cloud) return finish({ snapshot: local, cloudSynced: false, readOnly: true, error: 'No cloud notebooks are available. Original device data is preserved in your account export.' });
    const merged = reconcileSnapshot({ local: acceptCloud ? local : readLocalSnapshot(resolvedScope), cloud, metadata, acceptCloud });
    if (acceptCloud && cloud) backupSnapshotBytes(localStorage, keys, `${metadataKey}:conflict:${Date.now()}`);
    captureSnapshotRevision(metadataKey, merged.metadata.revision);
    writeSnapshotMetadata(localStorage, metadataKey, merged.metadata);
    const snapshot = merged.snapshot;
    writeLocalNotebookSnapshot(snapshot, resolvedScope);
    const result = { snapshot, cloudSynced: merged.cloudSynced,
      error: merged.conflict ? 'Cloud work changed. Export your local copy or reload the cloud copy; a local backup will be kept.' : merged.cloudSynced ? undefined : 'Local edits are waiting to sync.' };
    return finish(result);
  } catch (err) {
    if (getUserContentStorageScope() !== resolvedScope) return accountChangedNotebookResult();
    return finish({
      snapshot: local,
      cloudSynced: false,
      error: err instanceof Error ? err.message : 'Notebooks saved on this device only',
    });
  }
}

export async function saveNotebookSnapshot(
  snapshot: NotebookSnapshot,
  storageScope?: string | null,
): Promise<{ ok: boolean; cloudSynced: boolean; error?: string }> {
  const resolvedScope = await resolveStorageScope(storageScope);
  if (hydratedStorageScope === undefined || hydratedStorageScope !== resolvedScope) return { ok: false, cloudSynced: false, error: 'Waiting for the current account notebook snapshot to finish loading' };
  if (!resolvedScope || getUserContentStorageScope() !== resolvedScope) return { ok: false, cloudSynced: false, error: 'Account changed or session unavailable.' };
  const metadataKey = notebookStorageKeys(resolvedScope).updatedAt;
  try {
    readLocalSnapshot(resolvedScope);
    const metadata = readSnapshotMetadata(localStorage, metadataKey);
    writeLocalNotebookSnapshot(snapshot, resolvedScope);
    writeSnapshotMetadata(localStorage, metadataKey, { ...metadata, pending: true });
  } catch (error) { return { ok: false, cloudSynced: false, error: error instanceof Error ? error.message : 'Browser storage is unavailable. Export your work before leaving.' }; }
  return serializeSnapshotWrite(metadataKey, async () => {
    try {
      if (getUserContentStorageScope() !== resolvedScope) return { ok: true, cloudSynced: false, error: 'Account changed. Work remains on this device.' };
      const token = await getAccessToken();
      if (!token || getUserContentStorageScope() !== resolvedScope) return { ok: true, cloudSynced: false, error: 'Saved on this device. Sign in again to resume cloud sync.' };
      const metadata = readSnapshotMetadata(localStorage, metadataKey);
      const payload = { notebooks: snapshot.notebooks, version: 1 };
      if (new TextEncoder().encode(JSON.stringify(payload)).length > 256 * 1024) return { ok: true, cloudSynced: false, error: 'This collection exceeds the cloud save limit. Export a backup and reduce its size to resume sync.' };
      const res = await authFetchWithAccessToken('/api/user-content', token, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'notebook', title: 'Study Notebooks', replace: true, expectedUpdatedAt: expectedSnapshotRevision(metadataKey, metadata.revision), payload }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return { ok: true, cloudSynced: false, error: data?.error || 'Saved on this device only' };
      if (typeof data?.item?.updated_at !== 'string') return { ok: true, cloudSynced: false, error: 'Cloud acknowledgement was incomplete. Local work is preserved.' };
      if (getUserContentStorageScope() !== resolvedScope) return { ok: true, cloudSynced: false, error: 'Account changed after saving.' };
      captureSnapshotRevision(metadataKey, data.item.updated_at);
      const current = readLocalSnapshot(resolvedScope);
      const pending = current.updatedAt !== snapshot.updatedAt;
      writeSnapshotMetadata(localStorage, metadataKey, { revision: data.item.updated_at, pending, syncedLocalTime: snapshot.updatedAt });

      return { ok: true, cloudSynced: !pending };
    } catch (err) { return { ok: true, cloudSynced: false, error: err instanceof Error ? err.message : 'Saved on this device only' }; }
  });
}