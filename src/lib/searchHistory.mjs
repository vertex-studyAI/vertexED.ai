import { parseStoredArray, safeStorageGet, safeStorageSet } from './browserStorage.mjs';

export function searchHistoryKey(scope) {
  return `vertex_content:${encodeURIComponent(scope || 'signed-out')}:search_history`;
}

export function readSearchHistory(storage, scope) {
  return parseStoredArray(safeStorageGet(storage, searchHistoryKey(scope)))
    .filter(value => typeof value === 'string' && value.trim() && value.length <= 160)
    .slice(0, 8);
}

export function rememberSearch(storage, scope, query) {
  const value = query.trim().slice(0, 160);
  const history = readSearchHistory(storage, scope);
  const next = value ? [value, ...history.filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, 8) : history;
  return { history: next, saved: safeStorageSet(storage, searchHistoryKey(scope), JSON.stringify(next)) };
}
