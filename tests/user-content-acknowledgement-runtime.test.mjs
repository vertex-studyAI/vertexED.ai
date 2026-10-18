import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { setUserContentStorageScope, userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

const encode = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const dependencies = encode(`
  export const getAccessToken = async () => 'fixture-token';
  export const authFetchWithAccessToken = (...args) => globalThis.__artifactRuntime.request(...args);
  export const listDurableOutboxRecords = async (channel, scope) =>
    [...globalThis.__artifactRuntime.durable.values()].filter(item => item.channel === channel && item.scope === scope);
  export const putDurableOutboxRecord = async record => {
    if (globalThis.__artifactRuntime.durableWriteBlocked) return false;
    globalThis.__artifactRuntime.durable.set(record.logicalKey, structuredClone(record));
    return true;
  };
  export const deleteDurableOutboxRecord = async (channel, scope, key, revision) => {
    if (globalThis.__artifactRuntime.durableDeleteBlocked) return false;
    const item = globalThis.__artifactRuntime.durable.get(key);
    if (item?.channel === channel && item.scope === scope && (!revision || item.revision === revision)) {
      globalThis.__artifactRuntime.durable.delete(key);
    }
    return true;
  };
`);
let code = ts.transpileModule(fs.readFileSync('src/lib/userContent.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
code = code.replace(/(['"])@\/lib\/([^'"]+)\1/g, (_, quote, file) => JSON.stringify(
  ['apiAuth', 'durableOutbox'].includes(file) ? dependencies : pathToFileURL(`${process.cwd()}/src/lib/${file}`).href,
));
const { saveStudyArtifact, syncLocalStudyArtifacts, updateStudyArtifact, deleteStudyArtifact, listStudyArtifactsDetailed } = await import(encode(code));

const scope = 'artifact-owner';
const createdAt = '2026-10-16T05:00:00.000Z';
const local = {
  id: 'local-original', kind: 'note', title: 'Revision note', payload: { notes: 'Keep this reasoning.' },
  created_at: createdAt, updated_at: createdAt, idempotencyKey: 'artifact:original', localRevision: 'revision:original',
};
const cloudItem = { id: 'cloud-original', kind: local.kind, title: local.title, created_at: createdAt, updated_at: createdAt };
const confirmed = { ok: true, item: cloudItem, replayed: false };

function harness(t, { pending = false, response = confirmed, status = 200 } = {}) {
  setUserContentStorageScope(scope);
  const key = userContentStorageKeys(scope).artifacts;
  const bytes = new Map(pending ? [[key, JSON.stringify([local])]] : []);
  const durable = new Map(pending ? [[local.id, { channel: 'artifact', scope, logicalKey: local.id, revision: local.localRevision, payload: structuredClone(local), updatedAt: createdAt }]] : []);
  const requests = [];
  const runtime = { durable, bytes, key, requests, request: async (_url, _token, options) => {
    requests.push(options);
    return new Response(JSON.stringify(response), { status });
  } };
  globalThis.window = { localStorage: {
    getItem: key => {
      if (runtime.storageReadBlocked) throw new Error('Storage unavailable');
      return bytes.get(key) ?? null;
    },
    setItem: (key, value) => {
      if (runtime.storageWriteBlocked) throw new Error('Storage full');
      bytes.set(key, value);
    },
    removeItem: key => bytes.delete(key),
  } };
  globalThis.__artifactRuntime = runtime;
  t.after(() => {
    setUserContentStorageScope(null);
    delete globalThis.window;
    delete globalThis.__artifactRuntime;
  });
  return runtime;
}

const invalidAcknowledgements = [
  ['empty JSON', {}],
  ['missing item', { ok: true, item: null }],
  ['unsuccessful body', { ...confirmed, ok: false }],
  ['missing persisted identity', { ...confirmed, item: { ...cloudItem, id: '' } }],
  ['wrong artifact kind', { ...confirmed, item: { ...cloudItem, kind: 'paper' } }],
  ['missing revision', { ...confirmed, item: { ...cloudItem, updated_at: undefined } }],
  ['wrong title', { ...confirmed, item: { ...cloudItem, title: 'Different note' } }],
];

for (const [name, response] of invalidAcknowledgements) {
  test(`save preserves a device copy after ${name} acknowledgement`, async t => {
    const runtime = harness(t, { response });
    const result = await saveStudyArtifact(local.kind, local.title, local.payload, { idempotencyKey: local.idempotencyKey });
    assert.equal(result.ok, true);
    assert.equal(result.localOnly, true);
    assert.match(result.error, /acknowledgement|device/i);
    const saved = [...runtime.durable.values()][0];
    assert.deepEqual(saved.payload.payload, local.payload);
    assert.equal(saved.payload.idempotencyKey, local.idempotencyKey);
  });

  test(`replay keeps both recovery copies after ${name} acknowledgement`, async t => {
    const runtime = harness(t, { pending: true, response });
    const original = runtime.bytes.get(runtime.key);
    const result = await syncLocalStudyArtifacts();
    assert.equal(result.synced, 0);
    assert.equal(result.remaining, 1);
    assert.match(result.error, /acknowledgement/i);
    assert.equal(runtime.bytes.get(runtime.key), original);
    assert.equal(runtime.durable.has(local.id), true);
  });
}

test('confirmed write and idempotent replay acknowledge only the persisted artifact', async t => {
  const runtime = harness(t, { pending: true, response: { ...confirmed, replayed: true } });
  const saved = await saveStudyArtifact(local.kind, local.title, local.payload);
  assert.deepEqual(saved, { ok: true, id: cloudItem.id, replayed: true });
  const synced = await syncLocalStudyArtifacts();
  assert.equal(synced.synced, 1);
  assert.equal(synced.remaining, 0);
  assert.equal(runtime.durable.size, 0);
  assert.deepEqual(JSON.parse(runtime.bytes.get(runtime.key)), []);
});

test('a malformed JSON response uses the original idempotency key for recovery', async t => {
  const runtime = harness(t);
  runtime.request = async () => new Response('<html>Unavailable</html>');
  const result = await saveStudyArtifact(local.kind, local.title, local.payload, { idempotencyKey: local.idempotencyKey });
  assert.equal(result.localOnly, true);
  assert.equal([...runtime.durable.values()][0].payload.idempotencyKey, local.idempotencyKey);
});

test('update requires the acknowledgement to identify the requested artifact', async t => {
  harness(t, { response: { ...confirmed, item: { ...cloudItem, id: 'unrelated-artifact' } } });
  const result = await updateStudyArtifact(cloudItem.id, { title: local.title });
  assert.equal(result.ok, false);
  assert.match(result.error, /acknowledgement/i);
});

test('delete requires the explicit API acknowledgement before hiding saved work', async t => {
  harness(t, { response: {} });
  const result = await deleteStudyArtifact(cloudItem.id);
  assert.equal(result.ok, false);
  assert.match(result.error, /acknowledgement/i);
});

test('invalid cloud lists retain recoverable work and report cloud unavailability', async t => {
  harness(t, { pending: true, response: { items: [null] } });
  const result = await listStudyArtifactsDetailed('note');
  assert.equal(result.cloudUnavailable, true);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].id, local.id);
});

test('an account switch while replay is in flight never clears the original recovery copies', async t => {
  const runtime = harness(t, { pending: true });
  runtime.request = async () => {
    setUserContentStorageScope('different-owner');
    return new Response(JSON.stringify(confirmed));
  };
  const result = await syncLocalStudyArtifacts();
  assert.equal(result.synced, 0);
  assert.match(result.error, /Account changed/);
  assert.equal(runtime.durable.has(local.id), true);
  assert.deepEqual(JSON.parse(runtime.bytes.get(runtime.key)), [local]);
});

test('acknowledging an older revision does not remove an edit made during replay', async t => {
  const runtime = harness(t, { pending: true });
  runtime.request = async () => {
    const updated = { ...local, payload: { notes: 'New reasoning.' }, idempotencyKey: 'artifact:new', localRevision: 'revision:new' };
    runtime.bytes.set(runtime.key, JSON.stringify([updated]));
    runtime.durable.set(local.id, { ...runtime.durable.get(local.id), revision: updated.localRevision, payload: updated });
    return new Response(JSON.stringify(confirmed));
  };
  const result = await syncLocalStudyArtifacts();
  assert.equal(result.remaining, 1);
  assert.equal(runtime.durable.get(local.id).revision, 'revision:new');
  assert.equal(JSON.parse(runtime.bytes.get(runtime.key))[0].payload.notes, 'New reasoning.');
});

test('blank titles retain their original normalized value when an uncertain write is replayed', async t => {
  const runtime = harness(t, { response: {} });
  const result = await saveStudyArtifact('note', '   ', local.payload, { idempotencyKey: local.idempotencyKey });
  assert.equal(result.localOnly, true);
  const saved = [...runtime.durable.values()][0].payload;
  assert.equal(saved.title, null);
  runtime.request = async (_url, _token, options) => {
    assert.equal(JSON.parse(options.body).title, null);
    return new Response(JSON.stringify({ ...confirmed, item: { ...cloudItem, title: null } }));
  };
  assert.equal((await syncLocalStudyArtifacts()).remaining, 0);
});

for (const damagedBytes of ['{unfinished-json', '{"unexpected":"object"}', '[null]', JSON.stringify([local, null])]) {
  test(`a new recovery save preserves damaged mirror bytes (${damagedBytes.slice(0, 20)})`, async t => {
    const runtime = harness(t, { response: {} });
    runtime.bytes.set(runtime.key, damagedBytes);
    const result = await saveStudyArtifact(local.kind, local.title, local.payload);
    assert.equal(result.localOnly, true, 'IndexedDB still preserves the newly saved work');
    assert.equal(runtime.durable.size, 1);
    assert.equal(runtime.bytes.get(runtime.key), damagedBytes, 'original bytes remain available to account/device export');
  });
}

test('a blocked mirror read cannot authorize replacing unknown prior work', async t => {
  const runtime = harness(t, { pending: true, response: {} });
  const original = runtime.bytes.get(runtime.key);
  runtime.storageReadBlocked = true;
  await saveStudyArtifact(local.kind, 'New note', { notes: 'New draft' });
  assert.equal(runtime.bytes.get(runtime.key), original);
  assert.equal(runtime.durable.size, 2);
});

test('failed mirror cleanup keeps the durable record and reports remaining recovery work', async t => {
  const runtime = harness(t, { pending: true });
  runtime.storageWriteBlocked = true;
  const result = await syncLocalStudyArtifacts();
  assert.equal(result.remaining, 1);
  assert.match(result.error, /storage|device|recovery/i);
  assert.equal(runtime.durable.has(local.id), true);
});

test('failed local deletion does not report success or delete the other recovery copy', async t => {
  const runtime = harness(t, { pending: true });
  runtime.storageWriteBlocked = true;
  const result = await deleteStudyArtifact(local.id);
  assert.equal(result.ok, false);
  assert.match(result.error, /storage|device|recovery/i);
  assert.equal(runtime.durable.has(local.id), true);
  assert.deepEqual(JSON.parse(runtime.bytes.get(runtime.key)), [local]);
});

test('failed durable deletion remains visible as an unsuccessful delete', async t => {
  const runtime = harness(t, { pending: true });
  runtime.durableDeleteBlocked = true;
  const result = await deleteStudyArtifact(local.id);
  assert.equal(result.ok, false);
  assert.equal(runtime.durable.has(local.id), true);
});

test('a successful local deletion removes both recovery copies', async t => {
  const runtime = harness(t, { pending: true });
  const result = await deleteStudyArtifact(local.id);
  assert.equal(result.ok, true);
  assert.equal(runtime.durable.has(local.id), false);
  assert.deepEqual(JSON.parse(runtime.bytes.get(runtime.key)), []);
});

test('missing cloud-list data is unavailable rather than an empty saved collection', async t => {
  harness(t, { response: {} });
  const result = await listStudyArtifactsDetailed('note');
  assert.equal(result.ok, false);
  assert.equal(result.cloudUnavailable, true);
  assert.match(result.error, /Invalid cloud/);
});

test('new work is recoverable before the first cloud response and acknowledged cleanup keeps unrelated drafts', async t => {
  const runtime = harness(t, { pending: true });
  let releaseResponse;
  let markStarted;
  const started = new Promise(resolve => { markStarted = resolve; });
  runtime.request = async () => {
    markStarted();
    return new Promise(resolve => { releaseResponse = resolve; });
  };
  const saving = saveStudyArtifact(local.kind, local.title, local.payload, { idempotencyKey: 'artifact:new-save' });
  await started;
  const recoveryWhilePending = [...runtime.durable.values()].find(item => item.payload.idempotencyKey === 'artifact:new-save');
  const mirrorWhilePending = JSON.parse(runtime.bytes.get(runtime.key));
  releaseResponse(new Response(JSON.stringify(confirmed)));
  const result = await saving;
  assert.equal(result.ok, true);
  assert.equal(result.localOnly, undefined);
  assert.ok(recoveryWhilePending, 'closing or reloading while the request is pending must leave a recoverable draft');
  assert.deepEqual(recoveryWhilePending.payload.payload, local.payload);
  assert.equal(mirrorWhilePending.some(item => item.idempotencyKey === 'artifact:new-save'), true);
  assert.equal(runtime.durable.size, 1, 'only the acknowledged new revision is removed');
  assert.equal(runtime.durable.has(local.id), true);
});

test('an uncertain save reuses its write-ahead recovery record rather than adding duplicates', async t => {
  const runtime = harness(t, { response: {} });
  const result = await saveStudyArtifact(local.kind, local.title, local.payload, { idempotencyKey: 'artifact:one-save' });
  assert.equal(result.localOnly, true);
  assert.equal(runtime.durable.size, 1);
  assert.equal(JSON.parse(runtime.bytes.get(runtime.key)).length, 1);
});

test('cloud saving remains available when both device recovery stores are blocked', async t => {
  const runtime = harness(t);
  runtime.storageWriteBlocked = true;
  runtime.durableWriteBlocked = true;
  const result = await saveStudyArtifact(local.kind, local.title, local.payload);
  assert.equal(result.ok, true);
  assert.equal(result.id, cloudItem.id);
  assert.equal(result.localOnly, undefined);
});
