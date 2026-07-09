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
const LOCAL_LIMIT = 30;

function readLocalArtifacts(kind?: StudyArtifactKind): StudyArtifact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ARTIFACTS_KEY);
    const items = raw ? (JSON.parse(raw) as StudyArtifact[]) : [];
    const filtered = kind ? items.filter((item) => item.kind === kind) : items;
    return filtered.map((item) => ({ ...item, localOnly: true }));
  } catch {
    return [];
  }
}

function writeLocalArtifacts(items: StudyArtifact[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_ARTIFACTS_KEY, JSON.stringify(items.slice(0, LOCAL_LIMIT)));
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
  const existing = readLocalArtifacts();
  writeLocalArtifacts([item, ...existing]);
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
