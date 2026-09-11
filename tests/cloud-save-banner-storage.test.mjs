import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/components/CloudSaveBanner.tsx', import.meta.url), 'utf8');

test('cloud save banner uses the shared fail-closed session storage boundary', () => {
  assert.match(source, /resolveSessionStorage\(window\)/);
  assert.match(source, /safeStorageGet\(storage, dismissKey\) === "1"/);
  assert.match(source, /safeStorageRemove\(storage, LEGACY_DISMISS_KEY\)/);
  assert.match(source, /safeStorageSet\(storage, dismissKey, "1"\)/);
  assert.doesNotMatch(source, /sessionStorage\.(?:getItem|setItem|removeItem)/);
});

test('legacy dismissal cleanup cannot override the account-scoped dismissal read', () => {
  const scopedRead = source.indexOf('setDismissedForKey(safeStorageGet(storage, dismissKey) === "1"');
  const legacyCleanup = source.indexOf('safeStorageRemove(storage, LEGACY_DISMISS_KEY)');
  assert.ok(scopedRead >= 0);
  assert.ok(legacyCleanup > scopedRead);
  assert.doesNotMatch(
    source.slice(scopedRead, legacyCleanup),
    /catch\s*\{[\s\S]*setDismissedForKey\(null\)/,
  );
});
