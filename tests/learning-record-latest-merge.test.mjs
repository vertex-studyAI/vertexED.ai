import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeLearningRecord, parseLearningRecords } from '../src/lib/learningModel.mjs';

const early = '2026-11-10T12:00:00Z';
const middle = '2026-11-11T12:00:00Z';
const latest = '2026-11-12T12:00:00Z';
const after = '2026-11-13T12:00:00Z';
const factories = {
  practice_attempt: (time, text, extra = {}) => ({ id: 'attempt:latest-merge-01',
    questionId: 'math-modulus-01', answer: text, confidence: 4, hinted: false,
    seconds: 30, at: time, mode: 'mixed', ...extra }),
  mistake: (time, text, extra = {}) => ({ id: 'mistake:latest-merge-01',
    questionId: 'math-modulus-01', cause: 'conceptual', reflection: text,
    correction: 'Keep the original correction', updatedAt: time, ...extra }),
};
const permutations = rows => rows.length < 2 ? [rows] : rows.flatMap((row, i) =>
  permutations(rows.filter((_other, j) => i !== j)).map(rest => [row, ...rest]));
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

for (const [type, make] of Object.entries(factories)) {
  test(`${type}: a stale update cannot discard the newest saved duplicate`, () => {
    const old = make(early, '4');
    const current = make(latest, '5', { historicalNote: { text: 'Only saved copy' } });
    const incoming = make(middle, '7');
    for (const order of permutations([old, current])) {
      const raw = JSON.stringify(order);
      const records = freeze(parseLearningRecords(raw, type));
      assert.equal(records.length, 2, 'Duplicate saved history is a supported input');
      assert.strictEqual(mergeLearningRecord(records, incoming, type), records);
      assert.equal(JSON.stringify(records), raw);
    }
  });

  test(`${type}: conflict checks compare against the newest saved record`, () => {
    const old = make(early, '4');
    const current = make(latest, '5');
    for (const order of permutations([old, current])) {
      const records = freeze(order);
      assert.throws(() => mergeLearningRecord(records, make(latest, '7'), type), /conflicts/);
      assert.equal(records.length, 2);
    }
  });

  test(`${type}: every equal-latest copy participates in the conflict check`, () => {
    const one = make(latest, '5');
    const conflict = make(latest, '7');
    for (const order of permutations([make(early, '4'), one, conflict])) {
      const records = freeze(order);
      assert.throws(() => mergeLearningRecord(records, { ...one }, type), /conflicts/);
      assert.deepEqual(records, order);
    }
  });

  test(`${type}: same-instant metadata merges preserve every original record`, () => {
    const timeKey = type === 'practice_attempt' ? 'at' : 'updatedAt';
    const old = make(early, '4');
    const current = make(latest, '5', { historicalNote: 'First original note' });
    const equivalent = { ...current, [timeKey]: '2026-11-12T17:30:00+05:30', anotherNote: 'Second original note' };
    for (const order of permutations([old, current, equivalent])) {
      const records = freeze(order);
      const merged = mergeLearningRecord(records, make(latest, '5', { addedNote: 'New nonconflicting note' }), type);
      assert.equal(merged.length, records.length);
      for (let i = 0; i < records.length; i++) {
        for (const key of Object.keys(records[i])) assert.deepEqual(merged[i][key], records[i][key]);
        if (records[i] !== old) assert.equal(merged[i].addedNote, 'New nonconflicting note');
      }
    }
  });

  test(`${type}: a genuinely newer revision still replaces its own identity only`, () => {
    const unrelated = { ...make(middle, '8'), id: `${type === 'mistake' ? 'mistake' : 'attempt'}:other-record-01` };
    const incoming = make(after, '9');
    for (const order of permutations([make(early, '4'), make(latest, '5'), unrelated])) {
      const records = freeze(order);
      const merged = mergeLearningRecord(records, incoming, type);
      assert.deepEqual(merged, [unrelated, incoming]);
      assert.strictEqual(merged[0], unrelated);
      assert.strictEqual(merged[1], incoming);
    }
  });
}

test('equal-time metadata conflicts cannot hide behind another duplicate', () => {
  const make = factories.practice_attempt;
  const matching = make(latest, '5', { historicalNote: 'New note' });
  const conflict = make(latest, '5', { historicalNote: 'Only original copy' });
  for (const order of permutations([matching, conflict])) {
    const records = freeze(order);
    assert.throws(() => mergeLearningRecord(records, { ...matching }, 'practice_attempt'), /conflicts/);
  }
});

test('new identities, validation, storage limits and single-record merge behavior remain intact', () => {
  const make = factories.practice_attempt;
  const incoming = make(latest, '5');
  assert.deepEqual(mergeLearningRecord([], incoming, 'practice_attempt'), [incoming]);
  assert.throws(() => mergeLearningRecord([], { ...incoming, answer: '' }, 'practice_attempt'), /invalid/);
  const full = Array.from({ length: 10000 }, (_row, i) => make(early, '4', { id: `attempt:existing-${String(i).padStart(6, '0')}` }));
  assert.throws(() => mergeLearningRecord(full, incoming, 'practice_attempt'), /storage is full/);
  const previous = make(early, '4');
  assert.deepEqual(mergeLearningRecord([previous], incoming, 'practice_attempt'), [incoming]);
  assert.deepEqual(mergeLearningRecord([incoming], { ...incoming, extra: 'Retain this' }, 'practice_attempt'), [{ ...incoming, extra: 'Retain this' }]);
});
