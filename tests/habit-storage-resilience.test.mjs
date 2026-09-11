import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  MAX_HABITS,
  normalizeHabits,
  readHabitResetDate,
  writeHabitResetDate,
} from '../src/lib/habitStorage.mjs';

const source = fs.readFileSync('src/pages/study-zone/components/HabitTracker.tsx', 'utf8');

test('habit normalization rejects malformed roots and rows', () => {
  assert.deepEqual(normalizeHabits(null), []);
  assert.deepEqual(normalizeHabits({ id: 'not-an-array' }), []);

  const valid = {
    id: 'habit-1',
    name: 'Recall practice',
    completed: false,
    createdAt: '2026-09-11T00:00:00.000Z',
  };
  const normalized = normalizeHabits([
    null,
    'bad',
    { ...valid, id: '' },
    { ...valid, name: '' },
    { ...valid, completed: 'false' },
    { ...valid, createdAt: 'not-a-date' },
    valid,
    { ...valid, name: 'duplicate id' },
  ]);

  assert.deepEqual(normalized, [valid]);
});

test('habit normalization bounds stored state and trims oversized names', () => {
  const rows = Array.from({ length: MAX_HABITS + 4 }, (_, index) => ({
    id: `habit-${index}`,
    name: `  ${'x'.repeat(80)}  `,
    completed: index % 2 === 0,
    createdAt: `2026-09-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
  }));
  const normalized = normalizeHabits(rows);

  assert.equal(normalized.length, MAX_HABITS);
  assert.equal(normalized[0].name.length, 60);
  assert.equal(normalized[0].id, 'habit-0');
});

test('habit reset-date storage fails closed when browser storage is unavailable', () => {
  const unavailable = {
    get localStorage() {
      throw new Error('blocked');
    },
  };
  assert.equal(readHabitResetDate(unavailable, 'reset'), null);
  assert.equal(writeHabitResetDate(unavailable, 'reset', '2026-09-11'), false);

  const throwingStorage = {
    getItem() { throw new Error('blocked read'); },
    setItem() { throw new Error('full'); },
  };
  const owner = { localStorage: throwingStorage };
  assert.equal(readHabitResetDate(owner, 'reset'), null);
  assert.equal(writeHabitResetDate(owner, 'reset', '2026-09-11'), false);
});

test('habit tracker normalizes stored state and avoids direct localStorage access', () => {
  assert.match(source, /useLocalStorage<unknown>\(keys\.habits, \[\]\)/);
  assert.match(source, /normalizeHabits\(storedHabits\)/);
  assert.match(source, /readHabitResetDate\(window, keys\.habitsResetDate\)/);
  assert.match(source, /writeHabitResetDate\(window, keys\.habitsResetDate, today\)/);
  assert.doesNotMatch(source, /window\.localStorage\.(?:getItem|setItem|removeItem)/);
});
