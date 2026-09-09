import { userContentStorageKeys, normalizeUserContentStorageScope } from './userContentStorageScope.mjs';
import { plannerStorageKeys } from './plannerStorageScope.mjs';
import { notebookStorageKeys } from './notebookStorageScope.mjs';

export function accountStoragePrefixes(scope) {
  if (!scope || typeof scope !== 'string') throw new Error('An account is required.');
  return [userContentStorageKeys(scope).artifacts, plannerStorageKeys(scope).tasks, notebookStorageKeys(scope).notebooks]
    .map(key => key.slice(0, key.lastIndexOf(':') + 1))
    .concat(`vertex_apex:${normalizeUserContentStorageScope(scope)}:`);
}

export function collectAccountStorage(storage, scope) {
  const prefixes = accountStoragePrefixes(scope);
  const values = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !prefixes.some(prefix => key.startsWith(prefix))) continue;
    const raw = storage.getItem(key);
    try { values[key] = JSON.parse(raw); } catch { values[key] = raw; }
  }
  return values;
}

export function clearAccountStorage(storage, scope) {
  const keys = Object.keys(collectAccountStorage(storage, scope));
  for (const key of keys) storage.removeItem(key);
  if (Object.keys(collectAccountStorage(storage, scope)).length) throw new Error('Some account data could not be cleared from this browser.');
}
