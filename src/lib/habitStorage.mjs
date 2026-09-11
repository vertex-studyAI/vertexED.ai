import {
  resolveLocalStorage,
  safeStorageGet,
  safeStorageSet,
} from './browserStorage.mjs';

export const MAX_HABITS = 8;

export function normalizeHabits(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  const habits = [];

  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;

    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const createdAt = typeof item.createdAt === 'string' ? item.createdAt : '';
    if (!id || !name || seen.has(id)) continue;
    if (typeof item.completed !== 'boolean') continue;
    if (!createdAt || !Number.isFinite(Date.parse(createdAt))) continue;

    seen.add(id);
    habits.push({
      id,
      name: name.slice(0, 60),
      completed: item.completed,
      createdAt,
    });
    if (habits.length >= MAX_HABITS) break;
  }

  return habits;
}

export function readHabitResetDate(owner, key) {
  return safeStorageGet(resolveLocalStorage(owner), key);
}

export function writeHabitResetDate(owner, key, value) {
  return safeStorageSet(resolveLocalStorage(owner), key, value);
}
