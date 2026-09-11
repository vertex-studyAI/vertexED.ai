import {
  resolveSessionStorage,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from './browserStorage.mjs';
import { userContentStorageKeys } from './userContentStorageScope.mjs';

function apexPrefillStorageKey(userId) {
  return userContentStorageKeys(userId ?? null).apexPrefill;
}

export function storeApexPrefill(owner, userId, text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  const storage = resolveSessionStorage(owner);
  return safeStorageSet(storage, apexPrefillStorageKey(userId), text);
}

export function consumeApexPrefill(owner, userId) {
  const storage = resolveSessionStorage(owner);
  const key = apexPrefillStorageKey(userId);
  const value = safeStorageGet(storage, key);
  if (!value) return null;
  return safeStorageRemove(storage, key) ? value : null;
}
