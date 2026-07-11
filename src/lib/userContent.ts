import { authFetch } from '@/lib/apiAuth';

export type StudyArtifactKind = 'note' | 'review' | 'paper';

export type StudyArtifact = {
  id: string;
  kind: StudyArtifactKind;
  title: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  localOnly?: boolean;
};

export type StudyArtifactListResult = {
  ok: boolean;
  items: StudyArtifact[];
  error?: string;
  cloudUnavailable?: boolean;
};

export type SaveArtifactResult = {
  ok: boolean;
  id?: string;
  error?: string;
  localOnly?: boolean;
};

const LOCAL_ARTIFACTS_KEY = 'vertex_local_artifacts';
const RESTORE_KEY = 'vertex_restore_artifact';
const LOCAL_LIMIT = 30;

function readRawLocalArtifacts(): StudyArtifact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ARTIFACTS_KEY);
    return raw ? (JSON.parse(raw) as StudyArtifact[]) : [];
  } catch {
    return [];
  }
}

function readLocalArtifacts(kind?: StudyArtifactKind): StudyArtifact[] {
  const items = readRawLocalArtifacts();
  const filtered = kind ? items.filter((item) => item.kind === kind) : items;
  return filtered.map((item) => ({ ...item, localOnly: true }));
}

function writeLocalArtifacts(items: StudyArtifact[]): void {
  if (typeof window === 'undefined') return;
  const stripped = items.map(({ localOnly: _localOnly, ...rest }) => rest);
  window.localStorage.setItem(LOCAL_ARTIFACTS_KEY, JSON.stringify(stripped.slice(0, LOCAL_LIMIT)));
}

function saveLocalArtifact(
  kind: StudyArtifactKind,
  title: string,
  payload: Record<string, unknown>,
): StudyArtifact {
  const now = new Date().toISOString();
  const item: StudyArtifact = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    kind,
    title: title.trim().slice(0, 200) || kind,
    payload,
    created_at: now,
    updated_at: now,
    localOnly: true,
  };
  writeLocalArtifacts([item, ...readRawLocalArtifacts()]);
  return item;
}

function mergeArtifacts(cloud: StudyArtifact[], local: StudyArtifact[]): StudyArtifact[] {
  const seen = new Set(cloud.map((item) => item.id));
  const merged = [...cloud];
  for (const item of local) {
    if (!seen.has(item.id)) merged.push(item);
  }
  return merged.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export function artifactTargetRoute(kind: StudyArtifactKind): string {
  switch (kind) {
    case 'note':
      return '/notetaker';
    case 'paper':
      return '/paper-maker';
    case 'review':
      return '/answer-reviewer';
  }
}

export function queueArtifactRestore(item: StudyArtifact): void {
  sessionStorage.setItem(RESTORE_KEY, JSON.stringify(item));
}

export function consumeArtifactRestore(): StudyArtifact | null {
  const raw = sessionStorage.getItem(RESTORE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(RESTORE_KEY);
  try {
    return JSON.parse(raw) as StudyArtifact;
  } catch {
    return null;
  }
}

export function formatArtifactDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export async function updateStudyArtifact(
  id: string,
  patch: { title?: string; payload?: Record<string, unknown> },
): Promise<SaveArtifactResult> {
  if (id.startsWith('local-')) {
    const items = readRawLocalArtifacts();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return { ok: false, error: 'Artifact not found' };
    const now = new Date().toISOString();
    items[idx] = {
      ...items[idx],
      title: patch.title !== undefined ? patch.title.trim().slice(0, 200) || items[idx].title : items[idx].title,
      payload: patch.payload ?? items[idx].payload,
      updated_at: now,
    };
    writeLocalArtifacts(items);
    return { ok: true, id, localOnly: true };
  }

  try {
    const res = await authFetch('/api/user-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: data?.error || 'Update failed' };
    }
    return { ok: true, id: data?.item?.id ?? id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

export function localSaveMessage(result: SaveArtifactResult): string | null {
  if (result.localOnly) {
    return result.error || 'Saved on this device only — cloud sync is unavailable.';
  }
  return null;
}

export async function saveStudyArtifact(
  kind: StudyArtifactKind,
  title: string,
  payload: Record<string, unknown>,
): Promise<SaveArtifactResult> {
  try {
    const res = await authFetch('/api/user-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, title, payload }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const local = saveLocalArtifact(kind, title, payload);
      return {
        ok: true,
        id: local.id,
        localOnly: true,
        error: data?.error || 'Saved on this device only',
      };
    }
    return { ok: true, id: data?.item?.id };
  } catch (err) {
    const local = saveLocalArtifact(kind, title, payload);
    return {
      ok: true,
      id: local.id,
      localOnly: true,
      error: err instanceof Error ? err.message : 'Saved on this device only',
    };
  }
}

export async function deleteStudyArtifact(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (id.startsWith('local-')) {
    writeLocalArtifacts(readRawLocalArtifacts().filter((item) => item.id !== id));
    return { ok: true };
  }

  try {
    const res = await authFetch('/api/user-content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: data?.error || 'Delete failed' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

export async function listStudyArtifacts(kind?: StudyArtifactKind): Promise<StudyArtifact[]> {
  const result = await listStudyArtifactsDetailed(kind);
  return result.items;
}

export async function listStudyArtifactsDetailed(
  kind?: StudyArtifactKind,
): Promise<StudyArtifactListResult> {
  const local = readLocalArtifacts(kind);

  try {
    const qs = kind ? `?kind=${kind}&limit=30` : '?limit=30';
    const res = await authFetch(`/api/user-content${qs}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: local.length > 0,
        items: local,
        cloudUnavailable: true,
        error: data?.error || 'Cloud sync unavailable — showing device saves',
      };
    }
    const cloud = Array.isArray(data?.items) ? (data.items as StudyArtifact[]) : [];
    return { ok: true, items: mergeArtifacts(cloud, local) };
  } catch (err) {
    return {
      ok: local.length > 0,
      items: local,
      cloudUnavailable: true,
      error: err instanceof Error ? err.message : 'Cloud sync unavailable — showing device saves',
    };
  }
}

export function setChatHandoff(context: {
  source: string;
  subject?: string;
  question?: string;
  answer?: string;
  feedback?: string;
}) {
  sessionStorage.setItem('vertex_chat_handoff', JSON.stringify(context));
}

export function consumeChatHandoff(): Record<string, string> | null {
  const raw = sessionStorage.getItem('vertex_chat_handoff');
  if (!raw) return null;
  sessionStorage.removeItem('vertex_chat_handoff');
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}
