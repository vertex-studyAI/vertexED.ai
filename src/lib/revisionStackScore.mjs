import { resolveLocalStorage, safeStorageGet, safeStorageSet } from './browserStorage.mjs';
import { userContentStorageKeys } from './userContentStorageScope.mjs';

const MAX_REVISION_STACK_SCORE = 9_999_900;

export function normalizeRevisionStackScore(value) {
  const score = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(score) || score < 0 || score > MAX_REVISION_STACK_SCORE || score % 100 !== 0) return 0;
  return score;
}

export function readRevisionStackHighScore(owner, scope) {
  const storage = resolveLocalStorage(owner);
  return normalizeRevisionStackScore(safeStorageGet(storage, userContentStorageKeys(scope).revisionStackHighScore));
}

export function saveRevisionStackHighScore(owner, scope, score) {
  const normalized = normalizeRevisionStackScore(score);
  const current = readRevisionStackHighScore(owner, scope);
  if (normalized <= current) return { score: current, saved: true };
  const saved = safeStorageSet(
    resolveLocalStorage(owner),
    userContentStorageKeys(scope).revisionStackHighScore,
    String(normalized),
  );
  return { score: saved ? normalized : current, saved };
}
