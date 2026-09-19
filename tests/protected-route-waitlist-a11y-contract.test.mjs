import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/components/ProtectedRoute.tsx', 'utf8');

test('waitlist pending panel exposes status labelling', () => {
  assert.match(source, /role="status"/);
  assert.match(source, /aria-labelledby="waitlist-pending-title"/);
  assert.match(source, /aria-describedby="waitlist-pending-description"/);
  assert.match(source, /id="waitlist-pending-title"/);
  assert.match(source, /id="waitlist-pending-description"/);
});

test('waitlist rejected and unavailable alerts expose labelled recovery copy', () => {
  assert.match(source, /aria-labelledby="waitlist-rejected-title"/);
  assert.match(source, /aria-describedby="waitlist-rejected-description"/);
  assert.match(source, /id="waitlist-rejected-title"/);
  assert.match(source, /id="waitlist-rejected-description"/);

  assert.match(source, /aria-labelledby="waitlist-unavailable-title"/);
  assert.match(source, /aria-describedby="waitlist-unavailable-description"/);
  assert.match(source, /id="waitlist-unavailable-title"/);
  assert.match(source, /id="waitlist-unavailable-description"/);

  const rejectedAlert = source.indexOf('aria-labelledby="waitlist-rejected-title"');
  const unavailableAlert = source.indexOf('aria-labelledby="waitlist-unavailable-title"');
  assert.ok(rejectedAlert > 0 && unavailableAlert > rejectedAlert);
  assert.match(source.slice(0, rejectedAlert), /role="alert"/);
  assert.match(source.slice(rejectedAlert, unavailableAlert + 80), /role="alert"/);
});
