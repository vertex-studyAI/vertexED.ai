import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { PercyStore } from '../tools/percy-runtime/core.mjs';

const core = readFileSync(new URL('../tools/percy-runtime/core.mjs', import.meta.url), 'utf8');

test('resumeStale atomically rechecks lease expiry and reports actual recovered rows', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-resume-stale-'));
  const store = new PercyStore(join(dir, 'percy.sqlite'));
  try {
    store.submit({ id: 't' });
    assert.equal(store.claim('w1', 60_000).id, 't');
    assert.equal(store.start('t', 'w1'), true);

    assert.equal(store.resumeStale(), 0);
    assert.equal(store.get('t').status, 'RUNNING');
    assert.equal(store.get('t').owner_id, 'w1');

    store.db.prepare('UPDATE tasks SET lease_expires_at=? WHERE id=?').run(Date.now() - 1, 't');
    assert.equal(store.resumeStale(), 1);
    assert.equal(store.get('t').status, 'READY');
    assert.equal(store.get('t').owner_id, null);
    assert.equal(store.resumeStale(), 0);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resumeStale uses one conditional UPDATE instead of a select-then-update race', () => {
  const start = core.indexOf('resumeStale() {');
  const end = core.indexOf('\n\n  claim(', start);
  assert.ok(start >= 0 && end > start);
  const section = core.slice(start, end);

  assert.doesNotMatch(section, /SELECT\s+id\s+FROM\s+tasks/i);
  assert.match(section, /lease_expires_at IS NOT NULL AND lease_expires_at <= \?/);
  assert.match(section, /return Number\(result\.changes\);/);
});
