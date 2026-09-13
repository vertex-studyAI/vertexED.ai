import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWaitlistProfile } from '../api/_lib/waitlistProfile.js';

const profile = { school: '', country: ' India ', curriculum: 'IB MYP', grade: 'MYP 5', age: 15, consent: true };
test('profile normalizes only permitted fields and allows an omitted school name', () => {
  assert.deepEqual(normalizeWaitlistProfile({ ...profile, secret: 'not retained' }), { ...profile, country: 'India', version: 1 });
  assert.equal(normalizeWaitlistProfile({ ...profile, school: undefined }).school, '');
});
test('profile rejects missing fields, minors below beta age, invalid ages and absent consent', () => {
  for (const value of [null, {}, { ...profile, age: 12 }, { ...profile, age: 15.2 }, { ...profile, age: '15' }, { ...profile, consent: false }, { ...profile, country: '' }, { ...profile, curriculum: 'unknown' }, { ...profile, school: 'a'.repeat(161) }]) {
    assert.throws(() => normalizeWaitlistProfile(value));
  }
});
