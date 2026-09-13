import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const apexSource = fs.readFileSync('src/hooks/useApexChat.ts', 'utf8');

test('Apex chat does not persist prior-scope messages during a storage-key-only render', () => {
  assert.match(apexSource, /const storageKeyRef = useRef\(storageKey\)/);
  assert.match(apexSource, /storageKeyRef\.current = storageKey/);
  assert.match(apexSource, /saveMessages\(storageKeyRef\.current, messages\)/);
  assert.doesNotMatch(apexSource, /saveMessages\(storageKey, messages\)/);
  assert.match(
    apexSource,
    /saveMessages\(storageKeyRef\.current, messages\);\s*\}, \[messages\]\);/s,
  );
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
  assert.match(
    apexSource,
    /\[authLoading, context, sources, mode, input, loading, messages, onSessionRecord, storageKey\]/,
  );
});
