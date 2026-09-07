import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

const TRANSIENT_FIELDS = new Set(['restore', 'chatHandoff', 'apexPrefill', 'mockReviewHandoff']);

function parseStoredValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function collectDeviceStudyData(storage: Storage = window.localStorage, scope = getUserContentStorageScope()) {
  if (!scope) throw new Error('Account storage is not hydrated. Sign in again before exporting.');
  const keys = userContentStorageKeys(scope) as Record<string, string>;
  const values: Record<string, unknown> = {};

  for (const [field, key] of Object.entries(keys)) {
    if (TRANSIENT_FIELDS.has(field)) continue;
    const stored = storage.getItem(key);
    if (stored !== null) values[field] = parseStoredValue(stored);
  }

  const accessibility = storage.getItem('vertex_a11y_settings');
  if (accessibility !== null) values.accessibility = parseStoredValue(accessibility);

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
