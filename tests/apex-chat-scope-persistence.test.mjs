import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const apexSource = fs.readFileSync('src/hooks/useApexChat.ts', 'utf8');

test('Apex subscribes to an account store instead of persisting a prior render into a new scope', () => {
  assert.match(apexSource, /getConversationStore\(accountScope\)/);
  assert.match(apexSource, /useSyncExternalStore/);
  assert.doesNotMatch(apexSource, /saveMessages\(storageKey/);
});

test('Apex chat result ownership is bound to the initiating account and thread scope', () => {
  assert.match(apexSource, /const requestStorageKey = storageKey/);
  assert.match(
    apexSource,
    /requestRef\.current !== requestId \|\| storageKeyRef\.current !== requestStorageKey/,
  );
  assert.match(
    apexSource,
    /requestRef\.current === requestId && storageKeyRef\.current === requestStorageKey/,
  );

});
