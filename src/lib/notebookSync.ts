import { authFetch } from '@/lib/apiAuth';
import type { StudyNotebook } from '@/lib/notebook';

const LOCAL_KEY = 'vertex_study_notebooks_v1';

export type NotebookSnapshot = {
  notebooks: StudyNotebook[];
  updatedAt: string;
};

function readLocalSnapshot(): NotebookSnapshot {
  if (typeof window === 'undefined') {
    return { notebooks: [], updatedAt: new Date(0).toISOString() };
  }
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const notebooks = raw ? (JSON.parse(raw) as StudyNotebook[]) : [];
    return {
      notebooks: Array.isArray(notebooks) ? notebooks : [],
      updatedAt: localStorage.getItem('vertex_notebooks_updated_at') || new Date(0).toISOString(),
    };
  } catch {
    return { notebooks: [], updatedAt: new Date(0).toISOString() };
  }
}

export function writeLocalNotebookSnapshot(snapshot: NotebookSnapshot) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(snapshot.notebooks));
  localStorage.setItem('vertex_notebooks_updated_at', snapshot.updatedAt);
}

function parseCloudSnapshot(item: {
  payload?: Record<string, unknown>;
  updated_at?: string;
}): NotebookSnapshot | null {
  const payload = item.payload;
  if (!payload || typeof payload !== 'object') return null;
  const notebooks = Array.isArray(payload.notebooks) ? (payload.notebooks as StudyNotebook[]) : [];
  return {
    notebooks,
    updatedAt: item.updated_at || new Date().toISOString(),
  };
}

export async function loadNotebookSnapshot(): Promise<{
  snapshot: NotebookSnapshot;
  cloudSynced: boolean;
  error?: string;
}> {
  const local = readLocalSnapshot();

  try {
    const res = await authFetch('/api/user-content?kind=notebook&limit=1');
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        snapshot: local,
        cloudSynced: false,
        error: data?.error || 'Notebooks saved on this device only',
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
    writeLocalNotebookSnapshot(snapshot);
    return { snapshot, cloudSynced: true };
  } catch (err) {
    return {
      snapshot: local,
      cloudSynced: false,
      error: err instanceof Error ? err.message : 'Notebooks saved on this device only',
    };
  }
}

export async function saveNotebookSnapshot(
  snapshot: NotebookSnapshot,
): Promise<{ ok: boolean; cloudSynced: boolean; error?: string }> {
  writeLocalNotebookSnapshot(snapshot);

  try {
    const res = await authFetch('/api/user-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'notebook',
        title: 'Study Notebooks',
        replace: true,
        payload: {
          notebooks: snapshot.notebooks,
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
