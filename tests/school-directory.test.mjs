import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
test('learner profile migration stores optional school text without implying verification', async () => {
  const source = await readFile(new URL('../supabase/migrations/20260920162144_add_optional_school_to_profiles.sql', import.meta.url), 'utf8');
  assert.match(source, /add column if not exists school_name text/i);
  assert.match(source, /length\(trim\(school_name\)\) between 1 and 160/i);
  assert.match(source, /not a verified affiliation/i);
});
