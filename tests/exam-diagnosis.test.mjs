import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnoseExamEvidence } from '../src/lib/examDiagnosis.mjs';
test('diagnosis isolates subjects, rejects malformed marks and prioritises lower recorded performance', () => {
  const result = diagnoseExamEvidence([
    { subject: 'Maths', topic: 'Partial fractions', score: 2, maxScore: 10 },
    { subject: 'Maths', topic: 'Algebra', score: 8, maxScore: 10 },
    { subject: 'Chemistry', topic: 'Rates', score: 0, maxScore: 10 },
    { subject: 'Maths', topic: 'Invalid', score: 20, maxScore: 10 },
  ], 'Maths');
  assert.equal(result.length, 2);
  assert.equal(result[0].percent, 20);
  assert.match(result[0].next, /coefficient matching/);
  assert.deepEqual(diagnoseExamEvidence([], 'Maths'), []);
});
test('diagnosis never mixes marks from different curricula or unspecified boards', () => {
  const entry = { subject: 'Maths', topic: 'Algebra', score: 4, maxScore: 10 };
  const result = diagnoseExamEvidence([{ ...entry, board: 'IB_MYP' }, { ...entry, board: 'IB_DP' }, entry], 'Maths', 'IB MYP');
  assert.equal(result[0].attempts, 1);
});
