import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync('src/pages/Main.tsx', 'utf8');
const header = fs.readFileSync('src/components/portal/MemberPortalHeader.tsx', 'utf8');
const account = fs.readFileSync('src/components/portal/MemberAccountPanel.tsx', 'utf8');
const engagement = fs.readFileSync('src/components/portal/PortalEngagementRow.tsx', 'utf8');
const portalState = fs.readFileSync('src/lib/portalFeatures.ts', 'utf8');
const adaptive = fs.readFileSync('src/lib/adaptiveLearning.ts', 'utf8');

test('member portal connects the current Today, saved work, tools and account surfaces', () => {
  assert.match(main, /MemberPortalHeader/);
  assert.match(main, /PortalEngagementRow/);
  assert.match(main, /MemberAccountPanel/);
  assert.match(header, /Approved private beta access/);
  for (const anchor of ['#today-plan', '#quick-capture', '#continue-studying', '#member-tools', '#account-data']) {
    assert.match(header, new RegExp(anchor));
  }
  assert.match(account, /cloud plus device export/);
});

test('confidence check-in starts unset and cannot create an inferred low-confidence recommendation', () => {
  assert.match(portalState, /rating: null/);
  assert.match(adaptive, /r\.rating !== null && r\.rating <= 2/);
  assert.match(engagement, /row\.rating === null \? 'Not set'/);
  assert.match(engagement, /role="radiogroup"/);
  assert.match(engagement, /aria-checked=\{row\.rating === n\}/);
});
