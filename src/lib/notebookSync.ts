import { authFetch } from '@/lib/apiAuth';
import { setNotebookStorageScope, type StudyNotebook } from '@/lib/notebook';
import { notebookStorageKeys } from '@/lib/notebookStorageScope.mjs';
import { supabase } from '@/lib/supabaseClient';

export type NotebookSnapshot = {
  notebooks: StudyNotebook[];
  updatedAt: string;
};

let hydratedStorageScope: string | null | undefined;

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
    return { notebooks: [], updatedAt: new Date(0).toISOString() };
  }
  setNotebookStorageScope(storageScope);
  const keys = notebookStorageKeys(storageScope);
  try {
    const raw = localStorage.getItem(keys.notebooks);
    const notebooks = raw ? (JSON.parse(raw) as StudyNotebook[]) : [];
    return {
      notebooks: Array.isArray(notebooks) ? notebooks : [],
      updatedAt: localStorage.getItem(keys.updatedAt) || new Date(0).toISOString(),
    };
  } catch {
    return { notebooks: [], updatedAt: new Date(0).toISOString() };
  }
}

export function writeLocalNotebookSnapshot(
  snapshot: NotebookSnapshot,
  storageScope?: string | null,
) {
  if (typeof window === 'undefined') return;
  setNotebookStorageScope(storageScope);
  const keys = notebookStorageKeys(storageScope);
  localStorage.setItem(keys.notebooks, JSON.stringify(snapshot.notebooks));
  localStorage.setItem(keys.updatedAt, snapshot.updatedAt);
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

export async function loadNotebookSnapshot(storageScope?: string | null): Promise<{
  snapshot: NotebookSnapshot;
  cloudSynced: boolean;
  error?: string;
}> {
  // Invalidate write ownership synchronously before any account/session lookup or network work.
  hydratedStorageScope = undefined;
  const resolvedScope = await resolveStorageScope(storageScope);
  setNotebookStorageScope(resolvedScope);
  const local = readLocalSnapshot(resolvedScope);

  const finish = (result: {
    snapshot: NotebookSnapshot;
    cloudSynced: boolean;
    error?: string;
  }) => {
    hydratedStorageScope = resolvedScope;
    return result;
  };

  try {
    const res = await authFetch('/api/user-content?kind=notebook&limit=1');
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return finish({
        snapshot: local,
        cloudSynced: false,
        error: data?.error || 'Notebooks saved on this device only',
      });
    }

    const item = Array.isArray(data?.items) ? data.items[0] : null;
    if (!item) {
      return finish({ snapshot: local, cloudSynced: true });
    }

    const cloud = parseCloudSnapshot(item);
    if (!cloud) {
      return finish({ snapshot: local, cloudSynced: true });
    }

    const localTime = new Date(local.updatedAt).getTime();
    const cloudTime = new Date(cloud.updatedAt).getTime();
    const snapshot = cloudTime >= localTime ? cloud : local;
    writeLocalNotebookSnapshot(snapshot, resolvedScope);
    return finish({ snapshot, cloudSynced: true });
  } catch (err) {
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
  setNotebookStorageScope(resolvedScope);

  if (hydratedStorageScope === undefined || hydratedStorageScope !== resolvedScope) {
    return {
      ok: false,
      cloudSynced: false,
      error: 'Waiting for the current account notebook snapshot to finish loading',
    };
  }

  writeLocalNotebookSnapshot(snapshot, resolvedScope);

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
