import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PercyStore } from '../tools/percy-runtime/core.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'percy-'));
  return { dir, db: join(dir, 'percy.sqlite') };
}

test('submit -> claim -> persist -> complete survives reopen', () => {
  const f = fresh();
  try {
    let store = new PercyStore(f.db);
    const id = store.submit({ kind: 'echo', payload: { x: 1 } });
    const task = store.claim('w1', 1000);
    assert.equal(task.id, id);
    assert.equal(store.complete(id, 'w1', { ok: true }), true);
    store.close();

    store = new PercyStore(f.db);
    assert.equal(store.get(id).status, 'succeeded');
    assert.deepEqual(store.get(id).result, { ok: true });
    assert.deepEqual(store.integrityCheck(), ['ok']);
    store.close();
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('active lease prevents duplicate execution', () => {
  const f = fresh();
  try {
    const store = new PercyStore(f.db);
    store.submit({ id: 't', kind: 'echo' });
    assert.equal(store.claim('w1', 10000).id, 't');
    assert.equal(store.claim('w2', 10000), null);
    store.close();
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('expired lease is recovered by another worker', async () => {
  const f = fresh();
  try {
    const store = new PercyStore(f.db);
    store.submit({ id: 't', kind: 'echo' });
    store.claim('w1', 15);
    await new Promise((resolve) => setTimeout(resolve, 25));
    const recovered = store.claim('w2', 1000);
    assert.equal(recovered.id, 't');
    assert.equal(recovered.owner_id, 'w2');
    assert.equal(recovered.attempts, 2);
    store.close();
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('ownership checks block stale worker completion', async () => {
  const f = fresh();
  try {
    const store = new PercyStore(f.db);
    store.submit({ id: 't', kind: 'echo' });
    store.claim('w1', 10);
    await new Promise((resolve) => setTimeout(resolve, 20));
    store.claim('w2', 1000);
    assert.equal(store.complete('t', 'w1', {}), false);
    assert.equal(store.complete('t', 'w2', { ok: true }), true);
    store.close();
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('bounded retries end in failed state', () => {
  const f = fresh();
  try {
    const store = new PercyStore(f.db);
    store.submit({ id: 't', kind: 'fail', maxAttempts: 2 });
    store.claim('w1', 1000);
    store.fail('t', 'w1', new Error('x'), 0);
    assert.equal(store.get('t').status, 'queued');
    store.claim('w2', 1000);
    store.fail('t', 'w2', new Error('x'), 0);
    assert.equal(store.get('t').status, 'failed');
    assert.equal(store.get('t').attempts, 2);
    store.close();
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

test('pause blocks claims and resume restores them', () => {
  const f = fresh();
  try {
    const store = new PercyStore(f.db);
    store.submit({ id: 't' });
    store.setPaused(true);
    assert.equal(store.claim('w1'), null);
    store.setPaused(false);
    assert.equal(store.claim('w1').id, 't');
    store.close();
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});
