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

import fs from 'node:fs';

test('waitlist handler only echoes curated profile validation copy', () => {
  const source = fs.readFileSync('api/_handlers/waitlist.js', 'utf8');
  assert.match(source, /message\.startsWith\('Please '\)/);
  assert.match(source, /Please complete your study profile\./);
  assert.doesNotMatch(source, /catch \(error\) \{ return res\.status\(400\)\.json\(\{ error: error\.message \}\); \}/);
});

test('waitlist conflict responses do not enumerate account vs waitlist state', () => {
  const source = fs.readFileSync('api/_handlers/waitlist.js', 'utf8');
  assert.match(source, /If this email can join VertexED/);
  assert.doesNotMatch(source, /already on the waitlist/);
  assert.doesNotMatch(source, /already registered/);
});
