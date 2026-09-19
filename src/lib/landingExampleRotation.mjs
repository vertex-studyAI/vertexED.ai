import { resolveLocalStorage, safeStorageGet, safeStorageSet } from './browserStorage.mjs';

export const LANDING_EXAMPLE_KEY = 'vertexed.landing-example-v1';
let visitIndex = null;

export function nextLandingExampleIndex(rawValue, count) {
  if (!Number.isInteger(count) || count < 1) return 0;
  if (rawValue === null || rawValue === undefined || rawValue === '') return 0;
  const previous = Number(rawValue);
  return Number.isInteger(previous) && previous >= 0 && previous < count
    ? (previous + 1) % count
    : 0;
}

export function landingExampleForVisit(owner, count) {
  if (Number.isInteger(visitIndex)) return visitIndex % Math.max(1, count);
  const storage = resolveLocalStorage(owner);
  visitIndex = nextLandingExampleIndex(safeStorageGet(storage, LANDING_EXAMPLE_KEY), count);
  safeStorageSet(storage, LANDING_EXAMPLE_KEY, String(visitIndex));
  return visitIndex;
}

export function rememberLandingExample(owner, index, count) {
  if (!Number.isInteger(index) || !Number.isInteger(count) || count < 1) return false;
  visitIndex = ((index % count) + count) % count;
  return safeStorageSet(resolveLocalStorage(owner), LANDING_EXAMPLE_KEY, String(visitIndex));
}

export function resetLandingExampleVisitForTests() {
  visitIndex = null;
}
