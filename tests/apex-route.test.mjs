import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { shouldOfferApex } from '../src/lib/apexRoute.mjs';

const layoutSource = fs.readFileSync('src/components/layout/SiteLayout.tsx', 'utf8');

test('Apex follows learners across public, curriculum, study and account routes', () => {
  for (const route of ['/', '/about', '/features', '/myp', '/myp/subjects/physics', '/planner', '/study-zone', '/resource-library', '/user-settings']) {
    assert.equal(shouldOfferApex(route), true, route);
  }
});

test('Apex stays out of authentication, onboarding, admin and legal transactions', () => {
  for (const route of ['/login', '/login/', '/signup', '/auth/callback', '/onboarding', '/admin/waitlist', '/privacy', '/terms']) {
    assert.equal(shouldOfferApex(route), false, route);
  }
  assert.match(layoutSource, /const chatEligibleRoute =\s*shouldOfferApex\(location\.pathname\)/);
});
