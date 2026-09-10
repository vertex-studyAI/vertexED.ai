import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const adminUiSource = fs.readFileSync('src/pages/admin/WaitlistAdmin.tsx', 'utf8');

test('waitlist list requests are owned by the latest request id', () => {
  assert.match(adminUiSource, /const listRequestIdRef = useRef\(0\)/);
  assert.match(adminUiSource, /const requestId = \+\+listRequestIdRef\.current/);

  const staleGuards = adminUiSource.match(/requestId !== listRequestIdRef\.current/g) ?? [];
  assert.ok(staleGuards.length >= 2, 'success and failure paths should reject stale responses');

  assert.match(
    adminUiSource,
    /finally \{\s*if \(requestId === listRequestIdRef\.current\) \{\s*setLoading\(false\)/s,
  );
});

test('waitlist refreshes always read the latest filter, search, and page', () => {
  assert.match(
    adminUiSource,
    /latestListQueryRef\.current = \{ filter, search, page: pagination\.page \}/,
  );
  assert.match(adminUiSource, /const query = latestListQueryRef\.current/);
  assert.match(adminUiSource, /status: query\.filter === 'all' \? undefined : query\.filter/);
  assert.match(adminUiSource, /search: query\.search/);
  assert.match(adminUiSource, /page: query\.page/);
  assert.match(adminUiSource, /const loadEntries = useCallback\(async \(\) =>/);
  assert.match(adminUiSource, /\}, \[\]\);/);
});

test('waitlist query changes and unmount invalidate older list requests', () => {
  assert.match(
    adminUiSource,
    /return \(\) => \{\s*listRequestIdRef\.current \+= 1;\s*\};\s*\}, \[filter, search, pagination\.page, loadEntries\]\);/s,
  );
});
