import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { NavigatorLockAcquireTimeoutError } from '@supabase/supabase-js';
import { getBrowserAuthLock } from '../src/lib/authLock.mjs';

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const descriptors = Object.fromEntries(['navigator', 'window', 'setTimeout', 'clearTimeout'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let moduleRevision = 0;
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const nextTurn = () => new Promise(resolve => setImmediate(resolve));
function controlledTimers() {
  const pending = new Map();
  let nextId = 0;
  globalThis.setTimeout = (callback, delay) => { const id = ++nextId; pending.set(id, { callback, delay }); return id; };
  globalThis.clearTimeout = id => pending.delete(id);
  return {
    pending,
    fire() {
      assert.equal(pending.size, 1);
      const [id, task] = [...pending][0];
      pending.delete(id);
      task.callback();
    },
  };
}

// Model native callback observation separately from the request promise. Firefox
// reported these callback rejections even though the SDK caught the outer error.
class LockManager {
  held = new Set();
  queue = [];
  calls = [];
  callbackRejections = [];
  request(name, options, callback) {
    this.calls.push({ name, options });
    return new Promise((resolve, reject) => {
      const entry = { name, options, callback, resolve, reject };
      entry.abort = () => {
        this.queue = this.queue.filter(item => item !== entry);
        options.signal.removeEventListener('abort', entry.abort);
        reject(options.signal.reason);
      };
      if (options.signal?.aborted) return reject(options.signal.reason);
      if (options.ifAvailable && this.held.has(name)) return this.invoke(entry, null);
      if (!this.held.has(name)) return this.grant(entry);
      options.signal?.addEventListener('abort', entry.abort, { once: true });
      this.queue.push(entry);
    });
  }
  grant(entry) {
    entry.options.signal?.removeEventListener('abort', entry.abort);
    this.held.add(entry.name);
    this.invoke(entry, { name: entry.name, mode: 'exclusive' });
  }
  invoke(entry, lock) {
    const finish = () => {
      if (!lock) return;
      this.held.delete(entry.name);
      const index = this.queue.findIndex(item => item.name === entry.name);
      if (index !== -1) this.grant(this.queue.splice(index, 1)[0]);
    };
    Promise.resolve().then(() => entry.callback(lock)).then(value => {
      finish();
      entry.resolve(value);
    }, error => {
      this.callbackRejections.push(error);
      finish();
      entry.reject(error);
    });
  }
}

async function configuredLock(manager = new LockManager(), { browser = true } = {}) {
  if (browser) {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks: manager } });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { search: '?code=synthetic-code' } } });
  } else {
    delete globalThis.navigator;
    delete globalThis.window;
  }
  globalThis.__vertexAuthLockCapture = { env: { VITE_SUPABASE_URL: 'https://synthetic.invalid', VITE_SUPABASE_ANON_KEY: 'synthetic-publishable-key' }, listeners: [] };
  const stub = moduleUrl(`export function createClient(_url, _key, options) {
    globalThis.__vertexAuthLockCapture.options = options;
    return { auth: { onAuthStateChange(callback) { globalThis.__vertexAuthLockCapture.listeners.push(callback); } } };
  }`);
  let code = ts.transpileModule(fs.readFileSync('src/lib/supabaseClient.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  code = code.replaceAll('import.meta.env', 'globalThis.__vertexAuthLockCapture.env')
    .replace(/(['"])@supabase\/supabase-js\1/g, JSON.stringify(stub))
    .replace(/(['"])\.\/([^'"]+)\1/g, (_match, _quote, relative) => JSON.stringify(pathToFileURL(`${process.cwd()}/src/lib/${relative}`).href));
  const module = await import(moduleUrl(`${code}\n// load ${moduleRevision++}`));
  const capture = globalThis.__vertexAuthLockCapture;
  return { lock: getBrowserAuthLock(), manager, capture, module };
}

test.afterEach(() => {
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
  delete globalThis.__vertexAuthLockCapture;
});

test('busy immediate acquisition keeps the native callback fulfilled and returns the SDK typed timeout', async () => {
  const { lock, manager } = await configuredLock();
  manager.held.add('auth');
  let ran = false;
  await assert.rejects(lock('auth', 0, async () => { ran = true; }), error => error instanceof NavigatorLockAcquireTimeoutError && error.isAcquireTimeout === true);
  assert.equal(ran, false);
  assert.deepEqual(manager.calls[0].options, { mode: 'exclusive', ifAvailable: true });
  assert.deepEqual(manager.callbackRejections, [], 'no rejected native LockGrantedCallback');
});

test('operation errors propagate unchanged after releasing the real lock, without rejecting its callback', async () => {
  const { lock, manager } = await configuredLock();
  const failure = new Error('Synthetic operation failure');
  await assert.rejects(lock('auth', -1, async () => { throw failure; }), error => error === failure);
  assert.equal(manager.held.size, 0);
  assert.deepEqual(manager.callbackRejections, []);
  assert.equal(await lock('auth', 0, async () => 'next owner'), 'next owner');
});

test('client uses the SDK lockless coordination path', async () => {
  const { capture } = await configuredLock();
  assert.equal(capture.options.auth.lock, undefined);
});

test('positive acquisition timeout aborts only the queued request and is SDK-recognized', async () => {
  const { lock, manager } = await configuredLock();
  const timers = controlledTimers();
  const hold = deferred();
  const owner = lock('auth', -1, () => hold.promise);
  await nextTurn();
  let ran = false;
  const waiter = lock('auth', 25, async () => { ran = true; });
  const denied = assert.rejects(waiter, error => error instanceof NavigatorLockAcquireTimeoutError && error.isAcquireTimeout);
  await nextTurn();
  assert.equal(manager.queue.length, 1);
  assert.equal([...timers.pending.values()][0].delay, 25);
  timers.fire();
  await denied;
  assert.equal(manager.calls[1].options.signal.aborted, true);
  assert.equal(manager.queue.length, 0);
  assert.equal(manager.held.has('auth'), true);
  assert.equal(ran, false);
  assert.equal(timers.pending.size, 0);
  hold.resolve('owner finished');
  assert.equal(await owner, 'owner finished');
  assert.equal(await lock('auth', 0, async () => 'later owner'), 'later owner');
  assert.deepEqual(manager.callbackRejections, []);
});

test('negative wait retains cross-client exclusivity and an acquired positive deadline cannot release its owner', async () => {
  const { lock, manager } = await configuredLock();
  // Another client instance receives a separate adapter sharing the same native manager.
  const { lock: otherClientLock } = await configuredLock(manager);
  const timers = controlledTimers();
  const hold = deferred();
  const order = [];
  let active = 0;
  const owner = lock('auth', 25, async () => {
    assert.equal(++active, 1);
    order.push('first start');
    await hold.promise;
    order.push('first end');
    active--;
    return 'first';
  });
  await nextTurn();
  assert.equal(timers.pending.size, 0, 'acquisition timer removed while the owner is still running');
  assert.equal(manager.calls[0].options.signal.aborted, false);
  const second = otherClientLock('auth', -1, async () => {
    assert.equal(++active, 1);
    order.push('second');
    active--;
    return 'second';
  });
  await nextTurn();
  assert.deepEqual(manager.calls[1].options, { mode: 'exclusive' });
  assert.equal(timers.pending.size, 0, 'negative waiting has no deadline');
  assert.equal(manager.queue.length, 1);
  assert.deepEqual(order, ['first start']);
  hold.resolve();
  assert.deepEqual(await Promise.all([owner, second]), ['first', 'second']);
  assert.deepEqual(order, ['first start', 'first end', 'second']);
  assert.equal(manager.held.size, 0);
  assert.deepEqual(manager.callbackRejections, []);
});

test('a failed owner releases its queued successor without overlap or rejected native callback', async () => {
  const { lock, manager } = await configuredLock();
  const hold = deferred();
  const failure = new Error('Synthetic delayed failure');
  let active = 0;
  const owner = lock('auth', -1, async () => {
    active++;
    await hold.promise;
    active--;
    throw failure;
  });
  const failed = assert.rejects(owner, error => error === failure);
  await nextTurn();
  const successor = lock('auth', -1, async () => { assert.equal(active, 0); return 'continued'; });
  await nextTurn();
  assert.equal(manager.queue.length, 1);
  hold.resolve();
  await failed;
  assert.equal(await successor, 'continued');
  assert.deepEqual(manager.callbackRejections, []);
});

test('native request failures propagate unchanged and clear the acquisition timer', async () => {
  const failure = new DOMException('Synthetic denied access', 'SecurityError');
  const manager = { request: () => Promise.reject(failure) };
  const { lock } = await configuredLock(manager);
  const timers = controlledTimers();
  await assert.rejects(lock('auth', 25, async () => assert.fail('not acquired')), error => error === failure);
  assert.equal(timers.pending.size, 0);
});

test('a delayed granted callback preserves its own AbortError after the acquisition timer fired', async () => {
  const grant = deferred();
  const failure = new DOMException('Synthetic operation abort after grant', 'AbortError');
  let held = false;
  const callbackRejections = [];
  const manager = { request: async (name, _options, callback) => {
    // Model an already-granted native request whose callback is delayed until
    // after abort. Acquisition cancellation must not change the owner's error.
    held = true;
    await grant.promise;
    try { return await callback({ name, mode: 'exclusive' }); }
    catch (error) { callbackRejections.push(error); throw error; }
    finally { held = false; }
  } };
  const { lock } = await configuredLock(manager);
  const timers = controlledTimers();
  const operation = lock('auth', 25, async () => { throw failure; });
  const rejected = assert.rejects(operation, error => error === failure);
  await nextTurn();
  assert.equal(held, true);
  timers.fire();
  grant.resolve();
  await rejected;
  assert.equal(held, false);
  assert.deepEqual(callbackRejections, []);
  assert.equal(timers.pending.size, 0);
});

test('unexpected null locks fail closed without running an operation or rejecting the native callback', async () => {
  let callbackRejections = 0;
  const manager = { request: async (_name, _options, callback) => {
    try { return await callback(null); } catch (error) { callbackRejections++; throw error; }
  } };
  const { lock } = await configuredLock(manager);
  const timers = controlledTimers();
  await assert.rejects(lock('auth', 25, async () => assert.fail('not acquired')), /did not grant/);
  assert.equal(callbackRejections, 0);
  assert.equal(timers.pending.size, 0);
});

test('synchronous thrown values retain their identity outside the native callback', async () => {
  const { lock, manager } = await configuredLock();
  const value = { kind: 'synthetic non-Error rejection' };
  await assert.rejects(lock('auth', 0, () => { throw value; }), error => error === value);
  assert.deepEqual(manager.callbackRejections, []);
});

test('missing browser globals or Web Locks preserve SDK fallback without creating a no-op lock', async () => {
  const ssr = await configuredLock(undefined, { browser: false });
  assert.equal(ssr.capture.options.auth.lock, undefined);
  assert.equal(ssr.capture.options.auth.detectSessionInUrl, true);
  const unsupported = await configuredLock({});
  assert.equal(unsupported.capture.options.auth.lock, undefined);
});

test('client wiring retains callback-owned code exchange and its synchronous recovery listener', async () => {
  const { capture, module } = await configuredLock();
  assert.equal(capture.options.auth.lock, undefined);
  assert.equal(capture.options.auth.detectSessionInUrl, false);
  assert.equal(capture.listeners.length, 1);
  assert.equal(capture.listeners[0]('PASSWORD_RECOVERY', { user: { id: 'synthetic-account' } }), undefined);
  assert.equal(module.authRecoveryEvent.consume('synthetic-account'), true);
  assert.equal(module.authRecoveryEvent.consume('synthetic-account'), false);
});
