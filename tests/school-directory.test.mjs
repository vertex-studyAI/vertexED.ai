import test from 'node:test';
import assert from 'node:assert/strict';
import { schoolIdentity, resolveSchool } from '../api/_lib/schoolDirectory.js';
import { normalizeWaitlistProfile } from '../api/_lib/waitlistProfile.js';

test('school matching tolerates case and spacing, but separates countries and campuses', () => {
  assert.equal(schoolIdentity(' Oak  School ', ' INDIA '), schoolIdentity('oak school', 'India'));
  assert.notEqual(schoolIdentity('Oak School', 'India'), schoolIdentity('Oak School', 'Canada'));
  assert.notEqual(schoolIdentity('Oak School North', 'India'), schoolIdentity('Oak School South', 'India'));
});
test('omitted school does not access the directory', async () => {
  assert.equal(await resolveSchool(null, { school: '' }), null);
});
test('GCSE and unlisted curricula are preserved, not silently discarded', () => {
  const profile = { country: 'India', school: '', curriculum: 'GCSE', grade: '10', age: 15, consent: true };
  assert.equal(normalizeWaitlistProfile(profile).curriculum, 'GCSE');
  assert.throws(() => normalizeWaitlistProfile({ ...profile, curriculum: 'Other' }));
  assert.equal(normalizeWaitlistProfile({ ...profile, curriculum: 'Other', curriculumOther: ' State Board ' }).curriculumOther, 'State Board');
});
