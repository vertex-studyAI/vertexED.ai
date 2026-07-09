import { authFetch } from '@/lib/apiAuth';

export type StudyArtifactKind = 'note' | 'review' | 'paper';

export type StudyArtifact = {
  id: string;
  kind: StudyArtifactKind;
  title: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type StudyArtifactListResult = {
  ok: boolean;
  items: StudyArtifact[];
  error?: string;
};

export async function saveStudyArtifact(
  kind: StudyArtifactKind,
  title: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const res = await authFetch('/api/user-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, title, payload }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error || 'Save failed' };
    return { ok: true, id: data?.item?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Save failed' };
  }
}

export async function listStudyArtifacts(kind?: StudyArtifactKind): Promise<StudyArtifact[]> {
  const result = await listStudyArtifactsDetailed(kind);
  return result.items;
}

export async function listStudyArtifactsDetailed(
  kind?: StudyArtifactKind,
): Promise<StudyArtifactListResult> {
  try {
    const qs = kind ? `?kind=${kind}&limit=30` : '?limit=30';
    const res = await authFetch(`/api/user-content${qs}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        items: [],
        error: data?.error || 'Unable to load saved study work',
      };
    }
    return { ok: true, items: Array.isArray(data?.items) ? data.items : [] };
  } catch (err) {
    return {
      ok: false,
      items: [],
      error: err instanceof Error ? err.message : 'Unable to load saved study work',
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
