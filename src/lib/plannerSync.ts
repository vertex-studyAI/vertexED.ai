import { authFetchWithAccessToken, getAccessToken } from '@/lib/apiAuth';
import { createRequestDeadline } from '@/lib/apiRequestRecovery.mjs';

const PLANNER_SYNC_TIMEOUT_MS = 15_000;
const PLANNER_SYNC_TIMEOUT_MESSAGE = 'Cloud sync timed out; using planner saved on this device';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import { readSnapshotArray, backupSnapshotBytes, readSnapshotMetadata, writeSnapshotMetadata, reconcileSnapshot, serializeSnapshotWrite, captureSnapshotRevision, expectedSnapshotRevision } from '@/lib/snapshotConcurrency.mjs';
import type { TaskItem } from '@/features/study-calendar/components/Schedule';
import { trackPlannerRetrieved, trackPlannerSaved } from '@/lib/plannerPersistenceAnalytics.mjs';
import { plannerStorageKeys } from '@/lib/plannerStorageScope.mjs';
import { validatePlannerSnapshot } from '@/lib/snapshotValidation.mjs';
import { supabase } from '@/lib/supabaseClient';

export type PlannerSnapshot = {
  tasks: TaskItem[];
  mode: string;
  updatedAt: string;
};

function emptySnapshot(): PlannerSnapshot {
  return { tasks: [], mode: 'Day', updatedAt: new Date(0).toISOString() };
}

function accountChangedPlannerResult() {
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

function readLocalSnapshot(storageScope?: string | null): PlannerSnapshot {
  if (typeof window === 'undefined') return emptySnapshot();
  const keys = plannerStorageKeys(storageScope);
    const tasks = readSnapshotArray(localStorage, keys.tasks) as TaskItem[];
    const modeRaw = localStorage.getItem(keys.mode);
    return validatePlannerSnapshot({
      tasks,
      mode: modeRaw || 'Day',
      updatedAt: localStorage.getItem(keys.updatedAt) || new Date(0).toISOString(),
    });
}

export function writeLocalPlannerSnapshot(
  snapshot: PlannerSnapshot,
  storageScope?: string | null,
) {
  if (typeof window === 'undefined') return;
  snapshot = validatePlannerSnapshot(snapshot);
  const keys = plannerStorageKeys(storageScope);
  localStorage.setItem(keys.tasks, JSON.stringify(snapshot.tasks));
  localStorage.setItem(keys.mode, snapshot.mode);
  localStorage.setItem(keys.updatedAt, snapshot.updatedAt);
}

function parseCloudSnapshot(item: {
  payload?: Record<string, unknown>;
  updated_at?: string;
}): PlannerSnapshot | null {
  try {
    return validatePlannerSnapshot({ tasks: item.payload?.tasks, mode: item.payload?.mode ?? 'Day', updatedAt: item.updated_at });
  } catch { return null; }
}

function localPlannerSource(snapshot: PlannerSnapshot) {
  return snapshot.tasks.length > 0 ? 'device' : 'empty';
}

export async function loadPlannerSnapshot(storageScope?: string | null, acceptCloud = false): Promise<{
  snapshot: PlannerSnapshot;
  cloudSynced: boolean;
  error?: string;
  readOnly?: boolean;
}> {
  const resolvedScope = await resolveStorageScope(storageScope);
  if (!resolvedScope || getUserContentStorageScope() !== resolvedScope) return accountChangedPlannerResult();
  const keys = plannerStorageKeys(resolvedScope);
  let local: PlannerSnapshot;
  let localReadFailed = false;
  try {
    local = readLocalSnapshot(resolvedScope);
  } catch {
    localReadFailed = true;
    if (!acceptCloud) return { snapshot: emptySnapshot(), cloudSynced: false, readOnly: true, error: 'Device planner could not be read. Export account data or reload the cloud copy. Original device data is preserved.' };
    try { backupSnapshotBytes(localStorage, keys, `${keys.updatedAt}:conflict:${Date.now()}`); }
    catch { return { snapshot: emptySnapshot(), cloudSynced: false, readOnly: true, error: 'Cannot preserve a device backup. Allow browser storage or export account data before recovery.' }; }
    local = emptySnapshot();
  }
  const accessToken = await getAccessToken().catch(() => null);
  if (getUserContentStorageScope() !== resolvedScope) return accountChangedPlannerResult();
  if (!accessToken) return { snapshot: local, cloudSynced: false, readOnly: localReadFailed, error: 'Your session is unavailable.' };
  const metadataKey = plannerStorageKeys(resolvedScope).updatedAt;
  const deadline = createRequestDeadline(undefined, PLANNER_SYNC_TIMEOUT_MS);

  try {
    const res = await authFetchWithAccessToken('/api/user-content?kind=planner&limit=1', accessToken, { signal: deadline.signal });
    const data = await res.json().catch(() => null);
    if (getUserContentStorageScope() !== resolvedScope) return accountChangedPlannerResult();
    if (!res.ok) {
      trackPlannerRetrieved({
        source: localPlannerSource(local),
        cloudStatus: 'error',
        taskCount: local.tasks.length,
      });
      return {
        snapshot: local,
        cloudSynced: false,
        readOnly: localReadFailed,
        error: data?.error || 'Planner saved on this device only',
      };
    }

    if (!Array.isArray(data?.items)) throw new Error('Invalid cloud response. Local work was preserved.');
    const item = data.items[0] ?? null;
    const cloud = item ? parseCloudSnapshot(item) : null;
    if (item && !cloud) throw new Error('Invalid cloud snapshot. Local work was preserved.');
    const metadata = readSnapshotMetadata(localStorage, metadataKey);
    if (acceptCloud && !cloud) return { snapshot: local, cloudSynced: false, readOnly: true, error: 'No cloud planner is available. Original device data is preserved in your account export.' };
    const merged = reconcileSnapshot({ local: acceptCloud ? local : readLocalSnapshot(resolvedScope), cloud, metadata, acceptCloud });
    if (acceptCloud && cloud) backupSnapshotBytes(localStorage, keys, `${metadataKey}:conflict:${Date.now()}`);
    captureSnapshotRevision(metadataKey, merged.metadata.revision);
    writeSnapshotMetadata(localStorage, metadataKey, merged.metadata);
    const snapshot = merged.snapshot;
    writeLocalPlannerSnapshot(snapshot, resolvedScope);
    const result = { snapshot, cloudSynced: merged.cloudSynced,
      error: merged.conflict ? 'Cloud work changed. Export your local copy or reload the cloud copy; a local backup will be kept.' : merged.cloudSynced ? undefined : 'Local edits are waiting to sync.' };
    return result;
  } catch (err) {
    if (getUserContentStorageScope() !== resolvedScope) return accountChangedPlannerResult();
    trackPlannerRetrieved({
      source: localPlannerSource(local),
      cloudStatus: 'error',
      taskCount: local.tasks.length,
    });
    return {
      snapshot: local,
      cloudSynced: false,
      readOnly: localReadFailed,
      error: deadline.didTimeout() ? PLANNER_SYNC_TIMEOUT_MESSAGE : err instanceof Error ? err.message : 'Planner saved on this device only',
    };
  } finally {
    deadline.cleanup();
  }
}

export async function savePlannerSnapshot(
  snapshot: PlannerSnapshot,
  storageScope?: string | null,
  accessToken?: string | null,
): Promise<{ ok: boolean; cloudSynced: boolean; error?: string }> {
  const resolvedScope = await resolveStorageScope(storageScope);
  if (!resolvedScope || getUserContentStorageScope() !== resolvedScope) return { ok: false, cloudSynced: false, error: 'Account changed or session unavailable.' };
  const metadataKey = plannerStorageKeys(resolvedScope).updatedAt;
  try {
    readLocalSnapshot(resolvedScope);
    const metadata = readSnapshotMetadata(localStorage, metadataKey);
    writeLocalPlannerSnapshot(snapshot, resolvedScope);
    writeSnapshotMetadata(localStorage, metadataKey, { ...metadata, pending: true });
  } catch (error) { return { ok: false, cloudSynced: false, error: error instanceof Error ? error.message : 'Browser storage is unavailable. Export your work before leaving.' }; }
  return serializeSnapshotWrite(metadataKey, async () => {
    const deadline = createRequestDeadline(undefined, PLANNER_SYNC_TIMEOUT_MS);
    try {
      if (getUserContentStorageScope() !== resolvedScope) return { ok: true, cloudSynced: false, error: 'Account changed. Work remains on this device.' };
      const token = accessToken || await getAccessToken();
      if (!token || getUserContentStorageScope() !== resolvedScope) return { ok: true, cloudSynced: false, error: 'Saved on this device. Sign in again to resume cloud sync.' };
      const metadata = readSnapshotMetadata(localStorage, metadataKey);
      const payload = { tasks: snapshot.tasks, mode: snapshot.mode, version: 1 };
      if (new TextEncoder().encode(JSON.stringify(payload)).length > 256 * 1024) return { ok: true, cloudSynced: false, error: 'This collection exceeds the cloud save limit. Export a backup and reduce its size to resume sync.' };
      const res = await authFetchWithAccessToken('/api/user-content', token, {
        signal: deadline.signal,
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'planner', title: 'Study Planner', replace: true, expectedUpdatedAt: expectedSnapshotRevision(metadataKey, metadata.revision), payload }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return { ok: true, cloudSynced: false, error: data?.error || 'Saved on this device only' };
      if (typeof data?.item?.updated_at !== 'string') return { ok: true, cloudSynced: false, error: 'Cloud acknowledgement was incomplete. Local work is preserved.' };
      if (getUserContentStorageScope() !== resolvedScope) return { ok: true, cloudSynced: false, error: 'Account changed after saving.' };
      captureSnapshotRevision(metadataKey, data.item.updated_at);
      const current = readLocalSnapshot(resolvedScope);
      const pending = current.updatedAt !== snapshot.updatedAt;
      writeSnapshotMetadata(localStorage, metadataKey, { revision: data.item.updated_at, pending, syncedLocalTime: snapshot.updatedAt });
      trackPlannerSaved({ cloudSynced: !pending, taskCount: snapshot.tasks.length });
      return { ok: true, cloudSynced: !pending };
    } catch (err) { return { ok: true, cloudSynced: false, error: deadline.didTimeout() ? PLANNER_SYNC_TIMEOUT_MESSAGE : err instanceof Error ? err.message : 'Saved on this device only' }; }
    finally {
      deadline.cleanup();
    }
  });
}