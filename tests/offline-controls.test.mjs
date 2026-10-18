import test from 'node:test';
import assert from 'node:assert/strict';
import { offlineEnabled, offlineStatus, removeOffline, downloadOffline, OFFLINE_PREFERENCE } from '../src/lib/offlineControls.mjs';

function hostFixture() {
  const storage = new Map(), caches = new Set(['vertexed-public-v1-current', 'other-product']);
  const messages = [];
  let unregistered = false, registered = false;
  const worker = { scriptURL: 'https://study.test/sw.js', postMessage(data, ports) {
    messages.push(data.type);
    ports[0].postMessage(data.type === 'VERTEXED_OFFLINE_DISABLE' ? { disabled: true } : { ready: true, total: 10, cached: 10 });
  } };
  const registration = { active: worker, waiting: null, installing: null, async update() {}, async unregister() { unregistered = true; } };
  const host = {
    MessageChannel, setTimeout, clearTimeout,
    location: { origin: 'https://study.test' },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    navigator: { onLine: true, serviceWorker: { async getRegistration() { return registration; }, async register() { registered = true; return registration; } } },
    caches: { async keys() { return [...caches]; }, async delete(key) { caches.delete(key); } },
  };
  return { host, storage, caches, registration, messages, unregistered: () => unregistered, registered: () => registered };
}

test('offline status is based on worker cache confirmation, not just registration presence', async () => {
  const f = hostFixture();
  assert.equal(offlineEnabled(f.host), true);
  assert.equal((await offlineStatus(f.host)).state, 'ready');
  f.registration.active = null;
  f.registration.installing = { scriptURL: 'https://study.test/sw.js' };
  assert.equal((await offlineStatus(f.host)).state, 'downloading');
  f.storage.set(OFFLINE_PREFERENCE, 'false');
  assert.equal((await offlineStatus(f.host)).state, 'disabled');
});

test('removal opts out, disables the active worker and preserves unrelated caches and private stores', async () => {
  const f = hostFixture();
  f.storage.set('private-account-work', 'keep');
  await removeOffline(f.host);
  assert.equal(f.unregistered(), true);
  assert.deepEqual(f.messages, ['VERTEXED_OFFLINE_DISABLE']);
  assert.deepEqual([...f.caches], ['other-product']);
  assert.equal(f.storage.get('private-account-work'), 'keep');
  assert.equal(offlineEnabled(f.host), false);
});

test('downloads require connectivity and explicitly reverse opt-out', async () => {
  const f = hostFixture();
  f.host.navigator.onLine = false;
  await assert.rejects(downloadOffline(f.host), /Connect/);
  assert.equal(f.registered(), false);
  f.host.navigator.onLine = true;
  f.storage.set(OFFLINE_PREFERENCE, 'false');
  await downloadOffline(f.host);
  assert.equal(f.registered(), true);
  assert.equal(offlineEnabled(f.host), true);
});
