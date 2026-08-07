import { authFetch } from '@/lib/apiAuth';
import type { TaskItem } from '@/features/study-calendar/components/Schedule';
import { trackPlannerRetrieved, trackPlannerSaved } from '@/lib/plannerPersistenceAnalytics.mjs';
import { plannerStorageKeys } from '@/lib/plannerStorageScope.mjs';

export type PlannerSnapshot = {
  tasks: TaskItem[];
  mode: string;
  updatedAt: string;
};

function emptySnapshot(): PlannerSnapshot {
  return { tasks: [], mode: 'Day', updatedAt: new Date(0).toISOString() };
}

function readLocalSnapshot(storageScope?: string | null): PlannerSnapshot {
  if (typeof window === 'undefined') return emptySnapshot();
  const keys = plannerStorageKeys(storageScope);
  try {
    const tasksRaw = localStorage.getItem(keys.tasks);
    const modeRaw = localStorage.getItem(keys.mode);
    const tasks = tasksRaw ? (JSON.parse(tasksRaw) as TaskItem[]) : [];
    return {
      tasks: Array.isArray(tasks) ? tasks : [],
      mode: modeRaw || 'Day',
      updatedAt: localStorage.getItem(keys.updatedAt) || new Date(0).toISOString(),
    };
  } catch {
    return emptySnapshot();
  }
}

export function writeLocalPlannerSnapshot(
  snapshot: PlannerSnapshot,
  storageScope?: string | null,
) {
  if (typeof window === 'undefined') return;
  const keys = plannerStorageKeys(storageScope);
  localStorage.setItem(keys.tasks, JSON.stringify(snapshot.tasks));
  localStorage.setItem(keys.mode, snapshot.mode);
  localStorage.setItem(keys.updatedAt, snapshot.updatedAt);
}

function parseCloudSnapshot(item: {
  payload?: Record<string, unknown>;
  updated_at?: string;
}): PlannerSnapshot | null {
  const payload = item.payload;
  if (!payload || typeof payload !== 'object') return null;
  const tasks = Array.isArray(payload.tasks) ? (payload.tasks as TaskItem[]) : [];
  const mode = typeof payload.mode === 'string' ? payload.mode : 'Day';
  return {
    tasks,
    mode,
    updatedAt: item.updated_at || new Date().toISOString(),
  };
}

function localPlannerSource(snapshot: PlannerSnapshot) {
  return snapshot.tasks.length > 0 ? 'device' : 'empty';
}

export async function loadPlannerSnapshot(storageScope?: string | null): Promise<{
  snapshot: PlannerSnapshot;
  cloudSynced: boolean;
  error?: string;
}> {
  const local = readLocalSnapshot(storageScope);

  try {
    const res = await authFetch('/api/user-content?kind=planner&limit=1');
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      trackPlannerRetrieved({
        source: localPlannerSource(local),
        cloudStatus: 'error',
        taskCount: local.tasks.length,
      });
      return {
        snapshot: local,
        cloudSynced: false,
        error: data?.error || 'Planner saved on this device only',
      };
    }

    const item = Array.isArray(data?.items) ? data.items[0] : null;
    if (!item) {
      trackPlannerRetrieved({
        source: localPlannerSource(local),
        cloudStatus: 'missing',
        taskCount: local.tasks.length,
      });
      return { snapshot: local, cloudSynced: true };
    }

    const cloud = parseCloudSnapshot(item);
    if (!cloud) {
      trackPlannerRetrieved({
        source: localPlannerSource(local),
        cloudStatus: 'invalid',
        taskCount: local.tasks.length,
      });
      return { snapshot: local, cloudSynced: true };
    }

    const localTime = new Date(local.updatedAt).getTime();
    const cloudTime = new Date(cloud.updatedAt).getTime();
    const useCloud = cloudTime >= localTime;
    const snapshot = useCloud ? cloud : local;
    writeLocalPlannerSnapshot(snapshot, storageScope);
    trackPlannerRetrieved({
      source: useCloud ? 'cloud' : localPlannerSource(local),
      cloudStatus: 'available',
      taskCount: snapshot.tasks.length,
    });
    return { snapshot, cloudSynced: true };
  } catch (err) {
    trackPlannerRetrieved({
      source: localPlannerSource(local),
      cloudStatus: 'error',
      taskCount: local.tasks.length,
    });
    return {
      snapshot: local,
      cloudSynced: false,
      error: err instanceof Error ? err.message : 'Planner saved on this device only',
    };
  }
}

export async function savePlannerSnapshot(
  snapshot: PlannerSnapshot,
  storageScope?: string | null,
): Promise<{ ok: boolean; cloudSynced: boolean; error?: string }> {
  writeLocalPlannerSnapshot(snapshot, storageScope);

  try {
    const res = await authFetch('/api/user-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'planner',
        title: 'Study Planner',
        replace: true,
        payload: {
          tasks: snapshot.tasks,
          mode: snapshot.mode,
          version: 1,
        },
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      trackPlannerSaved({ cloudSynced: false, taskCount: snapshot.tasks.length });
      return {
        ok: true,
        cloudSynced: false,
        error: data?.error || 'Saved on this device only',
      };
    }
    trackPlannerSaved({ cloudSynced: true, taskCount: snapshot.tasks.length });
    return { ok: true, cloudSynced: true };
  } catch (err) {
    trackPlannerSaved({ cloudSynced: false, taskCount: snapshot.tasks.length });
    return {
      ok: true,
      cloudSynced: false,
      error: err instanceof Error ? err.message : 'Saved on this device only',
    };
  }
}
