import { authFetch } from '@/lib/apiAuth';
import type { TaskItem } from '@/features/study-calendar/components/Schedule';

const LOCAL_TASKS_KEY = 'planner_tasks';
const LOCAL_MODE_KEY = 'planner_mode';

export type PlannerSnapshot = {
  tasks: TaskItem[];
  mode: string;
  updatedAt: string;
};

function readLocalSnapshot(): PlannerSnapshot {
  if (typeof window === 'undefined') {
    return { tasks: [], mode: 'Day', updatedAt: new Date(0).toISOString() };
  }
  try {
    const tasksRaw = localStorage.getItem(LOCAL_TASKS_KEY);
    const modeRaw = localStorage.getItem(LOCAL_MODE_KEY);
    const tasks = tasksRaw ? (JSON.parse(tasksRaw) as TaskItem[]) : [];
    return {
      tasks: Array.isArray(tasks) ? tasks : [],
      mode: modeRaw || 'Day',
      updatedAt: localStorage.getItem('planner_updated_at') || new Date(0).toISOString(),
    };
  } catch {
    return { tasks: [], mode: 'Day', updatedAt: new Date(0).toISOString() };
  }
}

export function writeLocalPlannerSnapshot(snapshot: PlannerSnapshot) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(snapshot.tasks));
  localStorage.setItem(LOCAL_MODE_KEY, snapshot.mode);
  localStorage.setItem('planner_updated_at', snapshot.updatedAt);
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

export async function loadPlannerSnapshot(): Promise<{
  snapshot: PlannerSnapshot;
  cloudSynced: boolean;
  error?: string;
}> {
  const local = readLocalSnapshot();

  try {
    const res = await authFetch('/api/user-content?kind=planner&limit=1');
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        snapshot: local,
        cloudSynced: false,
        error: data?.error || 'Planner saved on this device only',
      };
    }

    const item = Array.isArray(data?.items) ? data.items[0] : null;
    if (!item) {
      return { snapshot: local, cloudSynced: true };
    }

    const cloud = parseCloudSnapshot(item);
    if (!cloud) {
      return { snapshot: local, cloudSynced: true };
    }

    const localTime = new Date(local.updatedAt).getTime();
    const cloudTime = new Date(cloud.updatedAt).getTime();
    const snapshot = cloudTime >= localTime ? cloud : local;
    writeLocalPlannerSnapshot(snapshot);
    return { snapshot, cloudSynced: true };
  } catch (err) {
    return {
      snapshot: local,
      cloudSynced: false,
      error: err instanceof Error ? err.message : 'Planner saved on this device only',
    };
  }
}

export async function savePlannerSnapshot(
  snapshot: PlannerSnapshot,
): Promise<{ ok: boolean; cloudSynced: boolean; error?: string }> {
  writeLocalPlannerSnapshot(snapshot);

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
      return {
        ok: true,
        cloudSynced: false,
        error: data?.error || 'Saved on this device only',
      };
    }
    return { ok: true, cloudSynced: true };
  } catch (err) {
    return {
      ok: true,
      cloudSynced: false,
      error: err instanceof Error ? err.message : 'Saved on this device only',
    };
  }
}
