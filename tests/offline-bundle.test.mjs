import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import { generateOfflineBundle } from '../scripts/generate-offline-bundle.mjs';

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'vertexed-offline-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, 'assets'));
  await mkdir(join(directory, 'myp5-content'));
  await writeFile(join(directory, 'index.html'), '<html>public shell</html>');
  await writeFile(join(directory, 'assets/app.js'), 'public app');
  await writeFile(join(directory, 'myp5-content/physics.json'), '{"lessons":[]}');
  await writeFile(join(directory, 'private.json'), 'must not cache');
  return directory;
}

async function harness(directory, failInstall = false) {
  const events = new Map();
  const stores = new Map([['unrelated-cache', new Map()], ['vertexed-public-v1-old', new Map()]]);
  const fetches = [];
  let claimed = false;
  const cacheApi = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(requests) {
          if (failInstall) throw new Error('quota');
          for (const request of requests) {
            assert.equal(request.credentials, 'omit');
            assert.equal(request.redirect, 'error');
            assert.match(request.integrity, /^sha256-/);
            store.set(request.url, new Response(request.url.endsWith('index.html') ? 'shell' : 'public'));
          }
        },
        async match(request) { return store.get(new URL(typeof request === 'string' ? request : request.url, 'https://study.test').href)?.clone(); },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
  vm.runInNewContext(await readFile(join(directory, 'sw.js'), 'utf8'), {
    URL, Response, Set,
    Request: class extends Request { constructor(url, options) { super(new URL(url, 'https://study.test'), options); } },
    location: { origin: 'https://study.test' }, caches: cacheApi,
    clients: { async claim() { claimed = true; } },
    addEventListener(type, handler) { events.set(type, handler); },
    async fetch(request) { fetches.push(request.url); throw new Error('offline'); },
  });
  async function lifecycle(type) {
    let pending;
    events.get(type)({ waitUntil(promise) { pending = promise; } });
    await pending;
  }
  function fetch(url, options = {}) {
    let response;
    events.get('fetch')({ request: { url, method: 'GET', mode: 'cors', headers: new Headers(), ...options }, respondWith(promise) { response = promise; } });
    return response;
  }
  async function message(type) {
    let pending, response;
    events.get('message')({ source: { id: 'test-client' }, data: { type }, ports: [{ postMessage(value) { response = value; } }], waitUntil(promise) { pending = promise; } });
    await pending;
    return response;
  }
  return { lifecycle, fetch, message, stores, fetches, claimed: () => claimed };
}

test('offline bundle is deterministic, content-versioned and excludes arbitrary public files', async t => {
  const dir = await fixture(t);
  const first = await generateOfflineBundle(dir);
  assert.equal(first.files, 3);
  assert.equal((await generateOfflineBundle(dir)).version, first.version);
  assert.doesNotMatch(await readFile(join(dir, 'sw.js'), 'utf8'), /private\.json/);
  await writeFile(join(dir, 'myp5-content/physics.json'), '{"lessons":[1]}');
  assert.notEqual((await generateOfflineBundle(dir)).version, first.version);
});

test('offline navigation and lessons work without caching API, credentials or foreign requests', async t => {
  const dir = await fixture(t);
  await generateOfflineBundle(dir);
  const worker = await harness(dir);
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  assert.equal(worker.claimed(), true);
  assert.equal(worker.stores.has('unrelated-cache'), true);
  assert.equal(worker.stores.has('vertexed-public-v1-old'), false);
  assert.equal(await (await worker.fetch('https://study.test/myp/subjects/physics?topic=Motion', { mode: 'navigate' })).text(), 'shell');
  assert.equal(await (await worker.fetch('https://study.test/myp5-content/physics.json')).text(), 'public');
  for (const url of ['https://study.test/api', 'https://study.test/api/learner-state', 'https://private.test/assets/app.js', 'https://study.test/private.json', 'https://study.test/assets/app.js?token=private']) {
    assert.equal(worker.fetch(url), undefined, url);
  }
  assert.equal(worker.fetch('https://study.test/assets/app.js', { headers: new Headers({ Authorization: 'Bearer private' }) }), undefined);
  assert.equal(worker.fetch('https://study.test/assets/app.js', { method: 'POST' }), undefined);
  assert.equal(worker.fetch('https://study.test/robots.txt', { mode: 'navigate' }), undefined);
  assert.equal(worker.fetches.length, 0);
});

test('AP lessons join the integrity-checked public bundle without admitting private files', async t => {
  const dir = await fixture(t);
  await mkdir(join(dir, 'ap-content'));
  await writeFile(join(dir, 'ap-content/calculus-ab.json'), '{"slug":"calculus-ab"}');
  const bundle = await generateOfflineBundle(dir);
  assert.equal(bundle.files, 4);
  const worker = await harness(dir);
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  assert.equal(await (await worker.fetch('https://study.test/ap-content/calculus-ab.json')).text(), 'public');
  assert.equal(worker.fetch('https://study.test/api/learner-state'), undefined);
  assert.equal(worker.fetch('https://study.test/private.json'), undefined);
});

test('failed install removes only the incomplete version and retains the working cache', async t => {
  const dir = await fixture(t);
  const bundle = await generateOfflineBundle(dir);
  const worker = await harness(dir, true);
  await assert.rejects(worker.lifecycle('install'), /quota/);
  assert.equal(worker.stores.has(`vertexed-public-v1-${bundle.version}`), false);
  assert.equal(worker.stores.has('vertexed-public-v1-old'), true);
  assert.equal(worker.stores.has('unrelated-cache'), true);
});

test('status detects eviction and repair restores the public copy; disable bypasses interception', async t => {
  const dir = await fixture(t);
  const bundle = await generateOfflineBundle(dir);
  const worker = await harness(dir);
  await worker.lifecycle('install');
  assert.equal((await worker.message('VERTEXED_OFFLINE_STATUS')).ready, true);
  worker.stores.get(`vertexed-public-v1-${bundle.version}`).delete('https://study.test/assets/app.js');
  assert.equal((await worker.message('VERTEXED_OFFLINE_STATUS')).ready, false);
  assert.equal((await worker.message('VERTEXED_OFFLINE_REPAIR')).ready, true);
  assert.equal((await worker.message('VERTEXED_OFFLINE_STATUS')).ready, true);
  assert.equal((await worker.message('VERTEXED_OFFLINE_DISABLE')).disabled, true);
  assert.equal(worker.fetch('https://study.test/myp', { mode: 'navigate' }), undefined);
  assert.equal(worker.stores.has(`vertexed-public-v1-${bundle.version}`), false);
  assert.equal(worker.stores.has('unrelated-cache'), true);
});
