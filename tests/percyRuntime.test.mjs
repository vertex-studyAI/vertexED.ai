import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PercyStore } from '../tools/percy-runtime/core.mjs';

function fresh(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'percy-'));
  return { dir, db: join(dir, 'percy.sqlite'), store: new PercyStore(join(dir, 'percy.sqlite'), options) };
}
const cleanup = (f) => { try { f.store?.close(); } catch {} rmSync(f.dir, { recursive: true, force: true }); };

test('READY -> CLAIMED -> RUNNING -> VERIFYING -> COMPLETE survives reopen', () => {
  const f = fresh();
  try {
    const id = f.store.submit({ kind: 'echo', payload: { x: 1 } });
    assert.equal(f.store.get(id).status, 'READY');
    assert.equal(f.store.claim('w1', 1000).status, 'CLAIMED');
    assert.equal(f.store.start(id, 'w1'), true);
    assert.equal(f.store.get(id).status, 'RUNNING');
    f.store.addEvidence(id, 'tests', { passed: true });
    assert.equal(f.store.markVerifying(id, 'w1', { ok: true }), true);
    assert.equal(f.store.get(id).status, 'VERIFYING');
    assert.equal(f.store.verifyComplete(id), true);
    assert.equal(f.store.get(id).status, 'COMPLETE');
    f.store.close(); f.store = new PercyStore(f.db);
    assert.equal(f.store.get(id).status, 'COMPLETE');
    assert.deepEqual(f.store.integrityCheck(), ['ok']);
  } finally { cleanup(f); }
});

test('evidence gate blocks VERIFYING -> COMPLETE without evidence', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.claim('w1', 1000); f.store.start('t', 'w1');
    assert.equal(f.store.markVerifying('t', 'w1', {}), true);
    assert.equal(f.store.verifyComplete('t'), false);
    assert.equal(f.store.get('t').status, 'VERIFYING');
  } finally { cleanup(f); }
});

test('default concurrency cap permits two active claims and rejects the third', () => {
  const f = fresh();
  try {
    for (const id of ['a','b','c']) f.store.submit({ id });
    assert.equal(f.store.claim('w1', 10000).id, 'a');
    assert.equal(f.store.claim('w2', 10000).id, 'b');
    assert.equal(f.store.activeCount(), 2);
    assert.equal(f.store.claim('w3', 10000), null);
  } finally { cleanup(f); }
});

test('active lease prevents duplicate execution', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' });
    assert.equal(f.store.claim('w1', 10000).id, 't');
    assert.equal(f.store.claim('w2', 10000), null);
  } finally { cleanup(f); }
});

test('expired lease is recovered and re-claimed', async () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.claim('w1', 100); f.store.start('t', 'w1');
    await new Promise(resolve => setTimeout(resolve, 125));
    const recovered = f.store.claim('w2', 1000);
    assert.equal(recovered.id, 't'); assert.equal(recovered.owner_id, 'w2'); assert.equal(recovered.attempts, 2);
  } finally { cleanup(f); }
});

test('ownership checks block stale worker transitions', async () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.claim('w1', 100); f.store.start('t', 'w1');
    await new Promise(resolve => setTimeout(resolve, 125));
    f.store.claim('w2', 1000); f.store.start('t', 'w2');
    assert.equal(f.store.markVerifying('t', 'w1', {}), false);
    f.store.addEvidence('t', 'tests', { ok: true });
    assert.equal(f.store.markVerifying('t', 'w2', {}), true);
    assert.equal(f.store.verifyComplete('t'), true);
  } finally { cleanup(f); }
});

test('bounded retries preserve failures and end in FAILED', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't', kind: 'fail', maxAttempts: 2 });
    f.store.claim('w1', 1000); f.store.start('t', 'w1'); f.store.fail('t', 'w1', new Error('x'), 0);
    assert.equal(f.store.get('t').status, 'READY');
    f.store.claim('w2', 1000); f.store.start('t', 'w2'); f.store.fail('t', 'w2', new Error('x'), 0);
    assert.equal(f.store.get('t').status, 'FAILED');
    assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM failures WHERE task_id=?').get('t').n, 2);
  } finally { cleanup(f); }
});

test('pause blocks new claims and resume restores them', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.setPaused(true); assert.equal(f.store.claim('w1'), null);
    f.store.setPaused(false); assert.equal(f.store.claim('w1').id, 't');
  } finally { cleanup(f); }
});

test('graceful worker stop can preserve task as STALE then requeue', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.claim('w1', 1000); f.store.start('t', 'w1');
    assert.equal(f.store.markStale('t', 'w1', 'SIGTERM'), true); assert.equal(f.store.get('t').status, 'STALE');
    assert.equal(f.store.requeueStale('t'), true); assert.equal(f.store.get('t').status, 'READY');
  } finally { cleanup(f); }
});
