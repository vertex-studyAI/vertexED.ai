import { authFetchWithAccessToken, getAccessToken } from '@/lib/apiAuth';
import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import {
  parseStoredArray,
  resolveLocalStorage,
  resolveSessionStorage,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from '@/lib/browserStorage.mjs';
import {
  deleteDurableOutboxRecord,
  listDurableOutboxRecords,
  putDurableOutboxRecord,
} from '@/lib/durableOutbox';
import type { StudyArtifactKind } from '@/contracts/domain';
export type { StudyArtifactKind } from '@/contracts/domain';

export type StudyArtifact = {
  id: string;
  kind: StudyArtifactKind;
  title: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  localOnly?: boolean;
  idempotencyKey?: string;
  idempotency_key?: string | null;
  localRevision?: string;
};

export type StudyArtifactListResult = {
  ok: boolean;
  items: StudyArtifact[];
  total?: number;
  nextOffset?: number | null;
  error?: string;
  cloudUnavailable?: boolean;
};

export type SaveArtifactResult = {
  ok: boolean;
  id?: string;
  error?: string;
  localOnly?: boolean;
  replayed?: boolean;
};

const ACCOUNT_CHANGED_ERROR = 'Account changed while study work was being processed. Try again in the current account.';
const STORED_ARTIFACT_KINDS = new Set<StudyArtifactKind>(['note', 'review', 'paper', 'planner', 'notebook']);

function isCurrentUserContentScope(scope: string): boolean {
  return getUserContentStorageScope() === scope;
}

function accountChangedSaveResult(): SaveArtifactResult {
  return { ok: false, error: ACCOUNT_CHANGED_ERROR };
}

function accountChangedListResult(): StudyArtifactListResult {
  return { ok: false, items: [], cloudUnavailable: true, error: ACCOUNT_CHANGED_ERROR };
}

function isPlainStoredObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isStoredTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function normalizeStoredArtifact(value: unknown): StudyArtifact | null {
  if (!isPlainStoredObject(value)) return null;
  if (typeof value.id !== 'string' || value.id.length === 0 || value.id.length > 200) return null;
  if (typeof value.kind !== 'string' || !STORED_ARTIFACT_KINDS.has(value.kind as StudyArtifactKind)) return null;
  if (value.title !== null && (typeof value.title !== 'string' || value.title.length > 200)) return null;
  if (!isPlainStoredObject(value.payload)) return null;
  if (!isStoredTimestamp(value.created_at) || !isStoredTimestamp(value.updated_at)) return null;
  if (value.localOnly !== undefined && typeof value.localOnly !== 'boolean') return null;
  if (value.idempotencyKey !== undefined && typeof value.idempotencyKey !== 'string') return null;
  if (value.idempotency_key !== undefined && value.idempotency_key !== null && typeof value.idempotency_key !== 'string') return null;
  if (value.localRevision !== undefined && typeof value.localRevision !== 'string') return null;

  return {
    id: value.id,
    kind: value.kind as StudyArtifactKind,
    title: value.title as string | null,
    payload: value.payload,
    created_at: value.created_at,
    updated_at: value.updated_at,
    ...(typeof value.localOnly === 'boolean' ? { localOnly: value.localOnly } : {}),
    ...(typeof value.idempotencyKey === 'string' ? { idempotencyKey: value.idempotencyKey } : {}),
    ...(typeof value.idempotency_key === 'string' || value.idempotency_key === null
      ? { idempotency_key: value.idempotency_key as string | null }
      : {}),
    ...(typeof value.localRevision === 'string' ? { localRevision: value.localRevision } : {}),
  };
}

export function createArtifactIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `artifact:${crypto.randomUUID()}`;
  }
  return `artifact:${Date.now()}:${Math.random().toString(36).slice(2, 12)}`;
}

function readRawLocalArtifacts(scope = getUserContentStorageScope()): StudyArtifact[] {
  if (typeof window === 'undefined') return [];
  const { artifacts } = userContentStorageKeys(scope);
  const storage = resolveLocalStorage(window);
  return parseStoredArray(safeStorageGet(storage, artifacts))
    .map(normalizeStoredArtifact)
    .filter((item): item is StudyArtifact => item !== null);
}

function writeLocalArtifacts(items: StudyArtifact[], scope = getUserContentStorageScope()): boolean {
  if (typeof window === 'undefined') return false;
  const { artifacts } = userContentStorageKeys(scope);
  const storage = resolveLocalStorage(window);
  const stripped = items.map(({ localOnly: _localOnly, ...rest }) => rest);
  // This is a recovery outbox, not a recent-items cache. Never silently evict
  // unsynced work because a learner crossed an arbitrary item count.
  return safeStorageSet(storage, artifacts, JSON.stringify(stripped));
}

async function readRecoveryArtifacts(scope: string): Promise<StudyArtifact[]> {
  const local = readRawLocalArtifacts(scope);
  const durable = await listDurableOutboxRecords<StudyArtifact>('artifact', scope);
  const byId = new Map(local.map((item) => [item.id, item]));
  for (const record of durable) {
    const item = normalizeStoredArtifact(record.payload);
    if (!item || item.id !== record.logicalKey) continue;
    const existing = byId.get(item.id);
    if (!existing || String(existing.updated_at) <= String(item.updated_at)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
}

async function saveLocalArtifact(
  kind: StudyArtifactKind,
  title: string,
  payload: Record<string, unknown>,
  idempotencyKey: string,
  scope: string,
): Promise<StudyArtifact | null> {
  if (!isCurrentUserContentScope(scope)) return null;
  const now = new Date().toISOString();
  const item: StudyArtifact = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    kind,
    title: title.trim().slice(0, 200) || kind,
    payload,
    created_at: now,
    updated_at: now,
    localOnly: true,
    idempotencyKey,
    localRevision: createArtifactIdempotencyKey(),
  };
  const durable = await putDurableOutboxRecord({
    channel: 'artifact',
    scope,
    logicalKey: item.id,
    revision: item.localRevision!,
    payload: item,
    updatedAt: now,
  });
  if (!isCurrentUserContentScope(scope)) return null;
  const mirrored = writeLocalArtifacts([item, ...readRawLocalArtifacts(scope)], scope);
  return durable || mirrored ? item : null;
}

function mergeArtifacts(cloud: StudyArtifact[], local: StudyArtifact[]): StudyArtifact[] {
  const seen = new Set(cloud.map((item) => item.id));
  const confirmedKeys = new Set(cloud.map((item) => item.idempotency_key).filter(Boolean));
  const merged = [...cloud];
  for (const item of local) {
    if (!seen.has(item.id) && !(item.idempotencyKey && confirmedKeys.has(item.idempotencyKey))) {
      merged.push(item);
    }
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
    case 'planner':
      return '/planner';
    case 'notebook':
      return '/study-notebook';
  }
}

export function queueArtifactRestore(item: StudyArtifact): void {
  if (typeof window === 'undefined') {
    throw new Error('Temporary browser storage is unavailable.');
  }
  const { restore } = userContentStorageKeys();
  const storage = resolveSessionStorage(window);
  if (!safeStorageSet(storage, restore, JSON.stringify(item))) {
    throw new Error('Temporary browser storage is unavailable.');
  }
}

export function consumeArtifactRestore(): StudyArtifact | null {
  if (typeof window === 'undefined') return null;
  const { restore } = userContentStorageKeys();
  const storage = resolveSessionStorage(window);
  const raw = safeStorageGet(storage, restore);
  if (!raw) return null;
  // A restore handoff is one-time. If cleanup fails, fail closed rather than
  // reusing a stale payload on a later route mount.
  if (!safeStorageRemove(storage, restore)) return null;
  try {
    return normalizeStoredArtifact(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function formatArtifactDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return ' - ';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return ' - ';
  }
}

export async function updateStudyArtifact(
  id: string,
  patch: { title?: string; payload?: Record<string, unknown> },
): Promise<SaveArtifactResult> {
  const scope = getUserContentStorageScope();
  if (!scope) return { ok: false, error: 'Sign in before saving study work.' };
  if (id.startsWith('local-')) {
    const items = await readRecoveryArtifacts(scope);
    if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return { ok: false, error: 'Artifact not found' };
    const now = new Date().toISOString();
    items[idx] = {
      ...items[idx],
      title: patch.title !== undefined ? patch.title.trim().slice(0, 200) || items[idx].title : items[idx].title,
      payload: patch.payload ?? items[idx].payload,
      updated_at: now,
      idempotencyKey: createArtifactIdempotencyKey(),
      localRevision: createArtifactIdempotencyKey(),
    };
    const updated = items[idx];
    const durable = await putDurableOutboxRecord({
      channel: 'artifact', scope, logicalKey: id, revision: updated.localRevision!, payload: updated, updatedAt: now,
    });
    if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
    const mirrored = writeLocalArtifacts(items, scope);
    return durable || mirrored
      ? { ok: true, id, localOnly: true }
      : { ok: false, error: 'Device recovery storage is full or unavailable.' };
  }

  try {
    const accessToken = await getAccessToken();
    if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
    if (!accessToken) return { ok: false, error: 'Your session is unavailable.' };
    const res = await authFetchWithAccessToken('/api/user-content', accessToken, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await res.json().catch(() => null);
    if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
    if (!res.ok) {
      return { ok: false, error: data?.error || 'Update failed' };
    }
    return { ok: true, id: data?.item?.id ?? id };
  } catch (err) {
    if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
    return { ok: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

export function localSaveMessage(result: SaveArtifactResult): string | null {
  if (result.localOnly) {
    return result.error || 'Saved on this device only - cloud sync is unavailable.';
  }
  return null;
}

export async function saveStudyArtifact(
  kind: StudyArtifactKind,
  title: string,
  payload: Record<string, unknown>,
  options: { idempotencyKey?: string } = {},
): Promise<SaveArtifactResult> {
  const scope = getUserContentStorageScope();
  if (!scope) return { ok: false, error: 'Sign in before saving study work.' };
  const idempotencyKey = options.idempotencyKey || createArtifactIdempotencyKey();
  const accessToken = await getAccessToken();
  if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();

  const request = () => {
    if (!isCurrentUserContentScope(scope)) throw new Error(ACCOUNT_CHANGED_ERROR);
    if (!accessToken) throw new Error('Your session is unavailable.');
    return authFetchWithAccessToken('/api/user-content', accessToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, title, payload, idempotencyKey }),
    });
  };

  try {
    let res: Response;
    try {
      res = await request();
    } catch (err) {
      if (!isCurrentUserContentScope(scope)) throw err;
      // A committed response can be lost in transit. One retry with the same key is safe.
      res = await request();
    }
    const data = await res.json().catch(() => null);
    if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
    if (!res.ok) {
      const local = await saveLocalArtifact(kind, title, payload, idempotencyKey, scope);
      if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
      if (!local) return { ok: false, error: 'Device recovery storage is full or unavailable.' };
      return {
        ok: true,
        id: local.id,
        localOnly: true,
        error: data?.error || 'Saved on this device only',
      };
    }
    return { ok: true, id: data?.item?.id, replayed: data?.replayed === true };
  } catch (err) {
    if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
    const local = await saveLocalArtifact(kind, title, payload, idempotencyKey, scope);
    if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();
    if (!local) return { ok: false, error: 'Device recovery storage is full or unavailable.' };
    return {
      ok: true,
      id: local.id,
      localOnly: true,
      error: err instanceof Error ? err.message : 'Saved on this device only',
    };
  }
}

export type ArtifactSyncResult = {
  attempted: number;
  synced: number;
  remaining: number;
  error?: string;
};

export function getLocalArtifactCount(): number {
  return readRawLocalArtifacts().length;
}

/**
 * Replays device-only saves with their original idempotency keys. Successful
 * items are removed locally only after the cloud confirms the write or replay.
 */
export async function syncLocalStudyArtifacts(): Promise<ArtifactSyncResult> {
  const scope = getUserContentStorageScope();
  if (!scope) return { attempted: 0, synced: 0, remaining: 0 };
  const pending = await readRecoveryArtifacts(scope);
  if (!isCurrentUserContentScope(scope)) {
    return { attempted: pending.length, synced: 0, remaining: pending.length, error: ACCOUNT_CHANGED_ERROR };
  }
  const accessToken = await getAccessToken();
  if (!accessToken || !isCurrentUserContentScope(scope)) {
    return {
      attempted: pending.length,
      synced: 0,
      remaining: pending.length,
      error: isCurrentUserContentScope(scope) ? 'Authenticated sync is unavailable.' : ACCOUNT_CHANGED_ERROR,
    };
  }
  let synced = 0;
  let lastError: string | undefined;

  for (const item of pending) {
    if (!isCurrentUserContentScope(scope)) {
      lastError = ACCOUNT_CHANGED_ERROR;
      break;
    }
    const idempotencyKey = item.idempotencyKey || `artifact:sync:${item.id.replace(/[^A-Za-z0-9._:-]/g, '-').slice(0, 100)}`;
    const attemptedRevision = item.localRevision || idempotencyKey;
    try {
      const res = await authFetchWithAccessToken('/api/user-content', accessToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: item.kind,
          title: item.title,
          payload: item.payload,
          idempotencyKey,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!isCurrentUserContentScope(scope)) {
        lastError = ACCOUNT_CHANGED_ERROR;
        break;
      }
      if (!res.ok) {
        lastError = data?.error || `Sync failed (${res.status})`;
        continue;
      }
      writeLocalArtifacts(readRawLocalArtifacts(scope).filter((candidate) =>
        candidate.id !== item.id || (candidate.localRevision || candidate.idempotencyKey) !== attemptedRevision), scope);
      await deleteDurableOutboxRecord('artifact', scope, item.id, attemptedRevision);
      if (!isCurrentUserContentScope(scope)) {
        lastError = ACCOUNT_CHANGED_ERROR;
        break;
      }
      synced += 1;
    } catch (err) {
      if (!isCurrentUserContentScope(scope)) {
        lastError = ACCOUNT_CHANGED_ERROR;
        break;
      }
      lastError = err instanceof Error ? err.message : 'Cloud sync unavailable';
    }
  }

  if (!isCurrentUserContentScope(scope)) {
    return {
      attempted: pending.length,
      synced,
      remaining: Math.max(0, pending.length - synced),
      error: ACCOUNT_CHANGED_ERROR,
    };
  }

  return {
    attempted: pending.length,
    synced,
    remaining: (await readRecoveryArtifacts(scope)).length,
    error: lastError,
  };
}

export async function deleteStudyArtifact(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const scope = getUserContentStorageScope();
  if (!scope) return { ok: false, error: 'Sign in before deleting study work.' };
  if (id.startsWith('local-')) {
    writeLocalArtifacts(readRawLocalArtifacts(scope).filter((item) => item.id !== id), scope);
    await deleteDurableOutboxRecord('artifact', scope, id);
    if (!isCurrentUserContentScope(scope)) return { ok: false, error: ACCOUNT_CHANGED_ERROR };
    return { ok: true };
  }

  try {
    const accessToken = await getAccessToken();
    if (!isCurrentUserContentScope(scope)) return { ok: false, error: ACCOUNT_CHANGED_ERROR };
    if (!accessToken) return { ok: false, error: 'Your session is unavailable.' };
    const res = await authFetchWithAccessToken('/api/user-content', accessToken, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => null);
    if (!isCurrentUserContentScope(scope)) return { ok: false, error: ACCOUNT_CHANGED_ERROR };
    if (!res.ok) {
      return { ok: false, error: data?.error || 'Delete failed' };
    }
    return { ok: true };
  } catch (err) {
    if (!isCurrentUserContentScope(scope)) return { ok: false, error: ACCOUNT_CHANGED_ERROR };
    return { ok: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

export async function listStudyArtifacts(kind?: StudyArtifactKind): Promise<StudyArtifact[]> {
  const result = await listStudyArtifactsDetailed(kind);
  return result.items;
}

export async function listStudyArtifactsDetailed(
  kind?: StudyArtifactKind,
  options: { limit?: number; offset?: number } = {},
): Promise<StudyArtifactListResult> {
  const scope = getUserContentStorageScope();
  if (!scope) return { ok: false, items: [], cloudUnavailable: true, error: 'Sign in to load study work.' };
  const limit = Math.max(1, Math.min(50, Math.floor(options.limit ?? 30)));
  const offset = Math.max(0, Math.floor(options.offset ?? 0));
  const recovered = await readRecoveryArtifacts(scope);
  if (!isCurrentUserContentScope(scope)) return accountChangedListResult();
  const local = offset === 0
    ? (kind ? recovered.filter((item) => item.kind === kind) : recovered)
      .map((item) => ({ ...item, localOnly: true }))
    : [];

  try {
    const accessToken = await getAccessToken();
    if (!isCurrentUserContentScope(scope)) return accountChangedListResult();
    if (!accessToken) throw new Error('Your session is unavailable.');
    const search = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (kind) search.set('kind', kind);
    const qs = `?${search.toString()}`;
    const res = await authFetchWithAccessToken(`/api/user-content${qs}`, accessToken);
    const data = await res.json().catch(() => null);
    if (!isCurrentUserContentScope(scope)) return accountChangedListResult();
    if (!res.ok) {
      return {
        ok: local.length > 0,
        items: local,
        cloudUnavailable: true,
        error: data?.error || 'Cloud sync unavailable - showing device saves',
      };
    }
    const cloud = Array.isArray(data?.items) ? (data.items as StudyArtifact[]) : [];
    return {
      ok: true,
      items: mergeArtifacts(cloud, local),
      total: typeof data?.total === 'number' ? data.total : cloud.length,
      nextOffset: typeof data?.nextOffset === 'number' ? data.nextOffset : null,
    };
  } catch (err) {
    if (!isCurrentUserContentScope(scope)) return accountChangedListResult();
    return {
      ok: local.length > 0,
      items: local,
      cloudUnavailable: true,
      error: err instanceof Error ? err.message : 'Cloud sync unavailable - showing device saves',
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
  if (typeof sessionStorage === 'undefined') return;
  const { chatHandoff } = userContentStorageKeys();
  sessionStorage.setItem(chatHandoff, JSON.stringify(context));
}

export function consumeChatHandoff(): Record<string, string> | null {
  if (typeof sessionStorage === 'undefined') return null;
  const { chatHandoff } = userContentStorageKeys();
  const raw = sessionStorage.getItem(chatHandoff);
  if (!raw) return null;
  sessionStorage.removeItem(chatHandoff);
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}