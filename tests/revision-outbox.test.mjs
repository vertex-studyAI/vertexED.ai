import test from 'node:test';
import assert from 'node:assert/strict';
import { createRevisionOutbox } from '../src/lib/revisionOutbox.mjs';

const event = (id = 'event-1') => ({ id, sourceKey: 'attempt-1', sourceRevision: 'revision-1', eventType: 'attempt', payload: { label: 'Practice' } });
const defer = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
function fixture(overrides = {}) {
  let scope = 'account-a';
  const saved = new Map(); const sent = [];
  const deps = {
    getScope: () => scope, getToken: async () => `token-${scope}`,
    read: async owner => [...saved.values()].filter(item => item.owner === owner).map(item => item.event),
    write: async (owner, item) => { saved.set(item.id, { owner, event: item }); return true; },
    remove: async (_owner, item) => saved.delete(item.id),
    send: async (item, token) => { sent.push({ item, token }); return { ok: true, event: item }; },
    changed: () => {}, ...overrides,
  };
  return { queue: createRevisionOutbox(deps), deps, saved, sent, switch: value => { scope = value; } };
}

for (const status of [401, 429, 503]) test(`${status} keeps revision recoverable across reload`, async () => {
  const f = fixture({ send: async () => ({ ok: false, status }) });
  await f.queue.enqueue(event()); await f.queue.sync();
  assert.equal(f.saved.size, 1);
  assert.equal(f.queue.status('account-a').pending, 1);
  const reloaded = createRevisionOutbox({ ...f.deps, send: async item => ({ ok: true, event: item }) });
  await reloaded.sync();
  assert.equal(f.saved.size, 0);
  assert.equal(reloaded.status('account-a').pending, 0);
});

test('wrong acknowledgement and network failure never discard entries', async () => {
  const f = fixture({ send: async item => ({ ok: true, event: { ...item, sourceRevision: 'wrong' } }) });
  await f.queue.enqueue(event()); await f.queue.sync();
  assert.equal(f.saved.size, 1);
  const retry = createRevisionOutbox({ ...f.deps, send: async () => { throw Error('network'); } });
  await retry.sync(); assert.equal(f.saved.size, 1);
});

test('enqueue snapshots caller data and preserves volatile entries for export', async () => {
  const f = fixture({ write: async () => false, send: async () => ({ ok: false }) });
  const original = event(); const pending = f.queue.enqueue(original); original.payload.label = 'changed';
  await pending; await f.queue.sync();
  assert.equal(f.queue.status('account-a').volatile, 1);
  assert.equal((await f.queue.pending('account-a'))[0].payload.label, 'Practice');
});

test('switch during token lookup never sends the old account event', async () => {
  const token = defer(); const f = fixture({ getToken: () => token.promise });
  await f.queue.enqueue(event());
  f.switch('account-b'); token.resolve('token-account-b'); await f.queue.sync();
  await new Promise(done => setImmediate(done));
  assert.equal(f.sent.length, 0); assert.equal(f.saved.size, 1);
  await assert.rejects(f.queue.pending('account-a'), /Account changed/);
});

test('switch during send retains the old account event and cannot remove it with a new session', async () => {
  const response = defer(); const began = defer();
  const f = fixture({ send: async () => { began.resolve(); return response.promise; } });
  await f.queue.enqueue(event()); await began.promise;
  f.switch('account-b'); response.resolve({ ok: true, event: event() });
  await new Promise(done => setImmediate(done));
  assert.equal(f.saved.size, 1);
});

test('concurrent retries share delivery and wait until durable write finishes', async () => {
  const storage = defer(); const response = defer(); let calls = 0;
  const f = fixture({ write: () => storage.promise, remove: async () => true, send: async item => { calls++; await response.promise; return { ok: true, event: item }; } });
  const queued = f.queue.enqueue(event()); await f.queue.sync(); assert.equal(calls, 0);
  storage.resolve(true); await queued;
  const a = f.queue.sync(); const b = f.queue.sync();
  response.resolve(); await Promise.all([a, b]);
  assert.equal(calls, 1); assert.equal(f.queue.status('account-a').pending, 0);
});

test('deletion during recovery prevents delivery and erases volatile records', async () => {
  const recovery = defer(); const f = fixture({ read: () => recovery.promise });
  await f.queue.enqueue(event()); f.queue.forget('account-a'); recovery.resolve([event()]);
  await f.queue.sync(); assert.equal(f.sent.length, 0);
  await assert.rejects(f.queue.pending('account-a'), /Account changed/);
});

test('cleanup failure is retried with the same immutable event id', async () => {
  let cleaned = false;
  const f = fixture({ remove: async () => cleaned });
  await f.queue.enqueue(event()); await f.queue.sync();
  assert.equal(f.queue.status('account-a').pending, 1);
  cleaned = true; await f.queue.sync();
  assert.ok(f.sent.every(({ item }) => item.id === 'event-1'));
  assert.equal(f.queue.status('account-a').pending, 0);
});

test('recovery sends parents before children even when durable storage returns children first', async () => {
  const parent = event('parent');
  const child = { ...event('child'), parentEventIds: ['parent'] };
  const f = fixture({ read: async () => [child, parent], remove: async () => true });
  await f.queue.sync();
  assert.deepEqual(f.sent.map(({ item }) => item.id), ['parent', 'child']);
});
