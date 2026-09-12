import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { collectAccountStorage, clearAccountStorage } from '@/lib/deviceAccountData.mjs';
import { listDurableOutboxRecords, clearDurableAccountData } from '@/lib/durableOutbox';
import { resolveLocalStorage, resolveSessionStorage } from '@/lib/browserStorage.mjs';

function browserOwner() {
  return typeof window === 'undefined' ? null : window;
}

function incompleteSnapshotError(kind: 'local' | 'session') {
  return new Error(`Browser ${kind} storage is unavailable. Account export cannot prove a complete device-data snapshot.`);
}

function requireLocalStorage(): Storage {
  const storage = resolveLocalStorage(browserOwner());
  if (!storage) throw incompleteSnapshotError('local');
  return storage;
}

function requireSessionStorage(): Storage {
  const storage = resolveSessionStorage(browserOwner());
  if (!storage) throw incompleteSnapshotError('session');
  return storage;
}

function collectRequiredAccountStorage(storage: Storage, scope: string, kind: 'local' | 'session') {
  try {
    return collectAccountStorage(storage, scope);
  } catch {
    throw incompleteSnapshotError(kind);
  }
}

export async function collectCompleteDeviceStudyData(scope: string) {
  const [artifacts, learnerState] = await Promise.all([
    listDurableOutboxRecords('artifact', scope, true),
    listDurableOutboxRecords('learner-state', scope, true),
  ]);
  if (getUserContentStorageScope() !== scope) throw new Error('Account changed during export.');

  // A complete export must fail closed rather than silently omit browser-backed
  // account data when a privacy mode or browser policy denies storage access.
  const localStorage = requireLocalStorage();
  const sessionStorage = requireSessionStorage();

  return {
    ...collectDeviceStudyData(localStorage, scope),
    schemaVersion: 2,
    accountStorage: collectRequiredAccountStorage(localStorage, scope, 'local'),
    sessionStorage: collectRequiredAccountStorage(sessionStorage, scope, 'session'),
    durableOutbox: [...artifacts, ...learnerState],
  };
}

export async function clearDeviceAccountData(scope: string) {
  const owner = browserOwner();
  const localStorage = resolveLocalStorage(owner);
  const sessionStorage = resolveSessionStorage(owner);

  // All stores are attempted even if one is unavailable. An unavailable store
  // remains a cleanup failure because we cannot prove that account data there
  // was cleared after cloud deletion.
  const results = await Promise.allSettled([
    clearDurableAccountData(scope),
    localStorage
      ? Promise.resolve().then(() => clearAccountStorage(localStorage, scope))
      : Promise.reject(new Error('Browser local storage is unavailable.')),
    sessionStorage
      ? Promise.resolve().then(() => clearAccountStorage(sessionStorage, scope))
      : Promise.reject(new Error('Browser session storage is unavailable.')),
  ]);
  if (results.some(result => result.status === 'rejected')) throw new Error('Your cloud account was deleted, but some browser data could not be cleared. Clear this site’s storage in browser settings.');
}

const TRANSIENT_FIELDS = new Set(['restore', 'chatHandoff', 'apexPrefill', 'mockReviewHandoff']);

function parseStoredValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function collectDeviceStudyData(storage?: Storage | null, scope = getUserContentStorageScope()) {
  if (!scope) throw new Error('Account storage is not hydrated. Sign in again before exporting.');
  const resolvedStorage = storage ?? resolveLocalStorage(browserOwner());
  if (!resolvedStorage) throw incompleteSnapshotError('local');

  const keys = userContentStorageKeys(scope) as Record<string, string>;
  const values: Record<string, unknown> = {};

  try {
    for (const [field, key] of Object.entries(keys)) {
      if (TRANSIENT_FIELDS.has(field)) continue;
      const stored = resolvedStorage.getItem(key);
      if (stored !== null) values[field] = parseStoredValue(stored);
    }

    const accessibility = resolvedStorage.getItem('vertex_a11y_settings');
    if (accessibility !== null) values.accessibility = parseStoredValue(accessibility);
  } catch {
    throw incompleteSnapshotError('local');
  }

  return { storageScope: scope, values };
}

export function downloadAccountExport(data: unknown, exportedAt = new Date()) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `vertex_account_${exportedAt.toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
