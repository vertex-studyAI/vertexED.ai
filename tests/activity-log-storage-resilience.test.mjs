import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  MAX_ACTIVITY_LOG_ENTRIES,
  normalizeActivityLogEntries,
} from '../src/lib/activityLogStorage.mjs';

const source = fs.readFileSync('src/pages/study-zone/components/ActivityLog.tsx', 'utf8');

test('activity log normalization rejects malformed roots and rows', () => {
  assert.deepEqual(normalizeActivityLogEntries(null), []);
  assert.deepEqual(normalizeActivityLogEntries({ id: 'not-an-array' }), []);

  const valid = {
    id: 'entry-1',
    message: 'Finished mechanics review',
    createdAt: '2026-09-12T00:00:00.000Z',
  };

  const normalized = normalizeActivityLogEntries([
    null,
    'bad',
    { ...valid, id: '' },
    { ...valid, message: '' },
    { ...valid, createdAt: 'not-a-date' },
    valid,
    { ...valid, message: 'duplicate id' },
  ]);

  assert.deepEqual(normalized, [valid]);
});

test('activity log normalization bounds corrupted persisted collections', () => {
  const rows = Array.from({ length: MAX_ACTIVITY_LOG_ENTRIES + 10 }, (_, index) => ({
    id: `entry-${index}`,
    message: `Entry ${index}`,
    createdAt: new Date(Date.UTC(2026, 8, 12, 0, 0, index)).toISOString(),
  }));

  const normalized = normalizeActivityLogEntries(rows);
  assert.equal(normalized.length, MAX_ACTIVITY_LOG_ENTRIES);
  assert.equal(normalized[0].id, 'entry-0');
  assert.equal(normalized[MAX_ACTIVITY_LOG_ENTRIES - 1].id, `entry-${MAX_ACTIVITY_LOG_ENTRIES - 1}`);
});

test('activity log normalizes hydrated state and functional updates before array operations', () => {
  assert.match(source, /useLocalStorage<unknown>\(activityKey, \[\]\)/);
  assert.match(source, /normalizeActivityLogEntries\(storedEntries\)/);
  assert.match(source, /normalizeActivityLogEntries\(\[entry, \.\.\.normalizeActivityLogEntries\(prev\)\]\)/);
  assert.match(source, /normalizeActivityLogEntries\(prev\)\.filter/);
});
