import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';
import { notebookStorageKeys } from '../src/lib/notebookStorageScope.mjs';
import { readSnapshotMetadata } from '../src/lib/snapshotConcurrency.mjs';

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const providerStub = toModule('export const supabase = null; export const reportAiRun = () => {}; export const setNotebookStorageScope = () => {};');
function compile(name, overrides = {}) {
  let code = ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  code = code.replace(/(['"])@\/lib\/([^'"]+)\1/g, (_, quote, path) => JSON.stringify(
    overrides[path] || (['supabaseClient', 'monitoring', 'notebook'].includes(path)
      ? providerStub : pathToFileURL(`${process.cwd()}/src/lib/${path}`).href),
  ));
  return toModule(code);
}
// Keep the real authenticated transport, including its 30 s deadline, account
// assertions and response-body drain. Only the provider and network are fixtures.
const authUrl = compile('apiAuth');
const auth = await import(authUrl);
const sync = await import(compile('notebookSync', { apiAuth: authUrl }));
const originalTime = '2026-10-07T00:00:00.000Z';
const editedTime = '2026-10-07T00:01:00.000Z';
const revision = '2026-10-07T00:02:00.000Z';

function fixture(t) {
  const scope = t.name;
  const keys = notebookStorageKeys(scope);
  const notebook = { id: 'retained', title: 'Retained notes', subject: 'Physics', sources: [], outputs: [], suggestedQuestions: [], createdAt: originalTime, updatedAt: originalTime };
  const snapshot = { notebooks: [notebook], updatedAt: originalTime };
  const map = new Map([[keys.notebooks, JSON.stringify(snapshot.notebooks)], [keys.updatedAt, originalTime]]);
  const storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) };
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    const id = ++timerId;
    timers.set(id, { callback, delay });
    return id;
  });
  t.mock.method(globalThis, 'clearTimeout', id => timers.delete(id));
  let timerId = 0;
  const timers = new Map();
  const listeners = new Map();
  const originalAdd = AbortSignal.prototype.addEventListener;
  const originalRemove = AbortSignal.prototype.removeEventListener;
  t.mock.method(AbortSignal.prototype, 'addEventListener', function (type, callback, options) {
    if (type === 'abort') {
      if (!listeners.has(this)) listeners.set(this, new Set());
      listeners.get(this).add(callback);
    }
    return originalAdd.call(this, type, callback, options);
  });
  t.mock.method(AbortSignal.prototype, 'removeEventListener', function (type, callback, options) {
    if (type === 'abort') listeners.get(this)?.delete(callback);
    return originalRemove.call(this, type, callback, options);
  });
  globalThis.window = {};
  globalThis.localStorage = storage;
  setUserContentStorageScope(scope);
  auth.setAuthAccessToken('synthetic-test-token');
  t.after(() => {
    auth.setAuthAccessToken(null);
    setUserContentStorageScope(null);
    delete globalThis.window;
    delete globalThis.localStorage;
  });
  return {
    scope, keys, map, storage, snapshot,
    edited: { notebooks: [{ ...notebook, title: 'New edit retained', updatedAt: editedTime }], updatedAt: editedTime },
    fireDeadline() {
      assert.deepEqual([...timers.values()].map(timer => timer.delay).sort((a, b) => a - b), [15000, 30000]);
      const [id, timer] = [...timers].find(([, value]) => value.delay === 15000);
      timers.delete(id);
      timer.callback();
    },
    assertClean() {
      assert.equal(timers.size, 0, 'both notebook and authenticated transport timers are released');
      assert.equal([...listeners.values()].reduce((sum, callbacks) => sum + callbacks.size, 0), 0, 'forwarded abort and fixture listeners are removed');
    },
  };
}

function pendingFetch(t, bodyStarted = false) {
  let started;
  const ready = new Promise(resolve => { started = resolve; });
  let signal;
  t.mock.method(globalThis, 'fetch', (_input, init) => {
    signal = init.signal;
    if (bodyStarted) {
      const stream = new ReadableStream({ start(controller) {
        controller.enqueue(new TextEncoder().encode('{"items":['));
        const abort = () => { signal.removeEventListener('abort', abort); controller.error(signal.reason); };
        signal.addEventListener('abort', abort, { once: true });
      } });
      started();
      return Promise.resolve(new Response(stream));
    }
    return new Promise((_resolve, reject) => {
      const abort = () => { signal.removeEventListener('abort', abort); reject(signal.reason); };
      signal.addEventListener('abort', abort, { once: true });
      started();
    });
  });
  return { ready, aborted: () => signal.aborted };
}

async function hydrate(t, f) {
  t.mock.method(globalThis, 'fetch', async () => new Response('{"items":[]}'));
  await sync.loadNotebookSnapshot(f.scope);
  f.assertClean();
}

for (const bodyStarted of [false, true]) {
  test(`notebook load uses its 15 s deadline with actual auth transport and ${bodyStarted ? 'a stalled body' : 'stalled headers'}`, async t => {
    const f = fixture(t);
    const request = pendingFetch(t, bodyStarted);
    const load = sync.loadNotebookSnapshot(f.scope);
    await request.ready;
    f.fireDeadline();
    const result = await load;
    assert.equal(request.aborted(), true);
    assert.equal(result.cloudSynced, false);
    assert.equal(result.readOnly, false);
    assert.match(result.error, /^Cloud sync timed out\./);
    assert.deepEqual(result.snapshot, f.snapshot);
    assert.equal(f.map.get(f.keys.notebooks), JSON.stringify(f.snapshot.notebooks));
    f.assertClean();
  });
}

test('notebook save preserves the new device edit and pending revision after a deadline', async t => {
  const f = fixture(t);
  await hydrate(t, f);
  const request = pendingFetch(t);
  const save = sync.saveNotebookSnapshot(f.edited, f.scope);
  await request.ready;
  f.fireDeadline();
  assert.deepEqual(await save, { ok: true, cloudSynced: false, error: 'Cloud sync timed out. Your notebooks are saved on this device.' });
  assert.equal(request.aborted(), true);
  assert.equal(f.map.get(f.keys.notebooks), JSON.stringify(f.edited.notebooks));
  assert.equal(readSnapshotMetadata(f.storage, f.keys.updatedAt).pending, true);
  f.assertClean();
  // The cancelled request releases the existing serialization queue for retry.
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ item: { updated_at: revision } })));
  assert.deepEqual(await sync.saveNotebookSnapshot(f.edited, f.scope), { ok: true, cloudSynced: true });
  assert.equal(readSnapshotMetadata(f.storage, f.keys.updatedAt).revision, revision);
  f.assertClean();
});

test('successful and failed HTTP responses release notebook and auth deadlines', async t => {
  const f = fixture(t);
  await hydrate(t, f);
  for (const status of [200, 503]) {
    t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(status === 200 ? { item: { updated_at: revision } } : { error: 'Cloud temporarily unavailable' }), { status }));
    const result = await sync.saveNotebookSnapshot(f.edited, f.scope);
    assert.equal(result.ok, true);
    assert.equal(result.cloudSynced, status === 200);
    f.assertClean();
  }
});

test('account change during a timed-out load cannot hydrate or expose the prior account', async t => {
  const f = fixture(t);
  const request = pendingFetch(t);
  const load = sync.loadNotebookSnapshot(f.scope);
  await request.ready;
  setUserContentStorageScope('different-current-account');
  f.fireDeadline();
  const result = await load;
  assert.equal(result.readOnly, true);
  assert.equal(result.error, 'Account changed during recovery.');
  assert.deepEqual(result.snapshot.notebooks, []);
  assert.equal((await sync.saveNotebookSnapshot(f.edited, 'different-current-account')).ok, false);
  assert.equal(f.map.get(f.keys.notebooks), JSON.stringify(f.snapshot.notebooks));
  f.assertClean();
});

test('timed-out explicit recovery retains corrupt device bytes and remains read-only', async t => {
  const f = fixture(t);
  f.map.set(f.keys.notebooks, '{unreadable-original');
  const request = pendingFetch(t);
  const load = sync.loadNotebookSnapshot(f.scope, true);
  await request.ready;
  f.fireDeadline();
  const result = await load;
  assert.equal(result.readOnly, true);
  assert.equal(result.error, 'Cloud sync timed out. Original device data is preserved.');
  assert.equal(f.map.get(f.keys.notebooks), '{unreadable-original');
  assert.equal((await sync.saveNotebookSnapshot(f.edited, f.scope)).ok, false);
  f.assertClean();
});
