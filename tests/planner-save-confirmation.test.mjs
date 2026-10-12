import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { plannerStorageKeys } from '../src/lib/plannerStorageScope.mjs';
import { readSnapshotMetadata } from '../src/lib/snapshotConcurrency.mjs';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const fixture = {
  request: async () => { throw new Error('Unexpected request'); },
  token: 'test-access-token',
  saved: [],
};
const fixtureKey = Symbol.for('vertexed.planner-save-confirmation.fixture');
globalThis[fixtureKey] = fixture;
const fixtureModule = `const fixture = globalThis[Symbol.for('vertexed.planner-save-confirmation.fixture')];`;
const authUrl = toModule(`${fixtureModule}
export const getAccessToken = async () => fixture.token;
export const authFetchWithAccessToken = (...args) => fixture.request(...args);
`);
const analyticsUrl = toModule(`${fixtureModule}
export const trackPlannerSaved = value => fixture.saved.push(value);
export const trackPlannerRetrieved = () => {};
`);
const supabaseUrl = toModule('export const supabase = null;');
// Execute the actual TypeScript orchestration. Only transport/session and
// analytics boundaries are fixtures; storage, validation and reconciliation run.
const source = ts.transpileModule(fs.readFileSync('src/lib/plannerSync.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText.replace(/(['"])(@\/lib\/[^'"]+)\1/g, (match, quote, specifier) => {
  if (specifier === '@/lib/apiAuth') return JSON.stringify(authUrl);
  if (specifier === '@/lib/supabaseClient') return JSON.stringify(supabaseUrl);
  if (specifier === '@/lib/plannerPersistenceAnalytics.mjs') return JSON.stringify(analyticsUrl);
  return JSON.stringify(pathToFileURL(`${process.cwd()}/src/${specifier.slice(2)}`).href);
});
const { savePlannerSnapshot, loadPlannerSnapshot } = await import(toModule(source));

const localTime = '2026-10-11T10:00:00.000Z';
const firstRevision = '2026-10-11T10:00:01.000Z';
const secondRevision = '2026-10-11T10:00:02.000Z';
let accountSequence = 0;

function snapshot(overrides = {}) {
  return {
    tasks: [{
      id: 'task-a', 'task name': 'Review complex numbers', date: '10/11/2026',
      'start time': '04:00 PM', 'task duration': 30, 'end time': '04:30 PM',
    }],
    mode: 'Day',
    updatedAt: localTime,
    ...overrides,
  };
}

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function setup(t) {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'window', { value: { localStorage: storage }, configurable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  const account = `planner-confirmation-${++accountSequence}`;
  setUserContentStorageScope(account);
  fixture.saved = [];
  fixture.token = 'test-access-token';
  t.after(() => {
    setUserContentStorageScope(null);
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else delete globalThis.window;
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else delete globalThis.localStorage;
  });
  return { account, storage, keys: plannerStorageKeys(account) };
}

function successfulSave(revision) {
  return new Response(JSON.stringify({ ok: true, item: {
    id: '11111111-1111-4111-8111-111111111111', kind: 'planner', title: 'Study Planner',
    created_at: firstRevision, updated_at: revision,
  } }), { status: 201, headers: { 'content-type': 'application/json' } });
}

const changes = {
  'task text': first => ({ ...first, tasks: [{ ...first.tasks[0], 'task name': 'New unsaved task text' }] }),
  'task completion': first => ({ ...first, tasks: [{ ...first.tasks[0], completed: true, completedAt: localTime }] }),
  'task removal': first => ({ ...first, tasks: [] }),
  'planner mode': first => ({ ...first, mode: 'Week' }),
};

for (const [label, change] of Object.entries(changes)) {
  test(`an earlier acknowledgement preserves same-timestamp ${label} edits through failed save and reload`, { timeout: 5_000 }, async t => {
    const { account, storage, keys } = setup(t);
    const first = snapshot();
    const second = change(first);
    const firstStarted = deferred();
    const firstResponse = deferred();
    const submitted = [];
    fixture.request = async (url, token, options = {}) => {
      assert.equal(token, 'test-access-token');
      if (options.method === 'POST') {
        submitted.push(JSON.parse(options.body));
        if (submitted.length === 1) {
          firstStarted.resolve();
          return firstResponse.promise;
        }
        throw new Error('Synthetic network interruption');
      }
      assert.equal(url, '/api/user-content?kind=planner&limit=1');
      return Response.json({ items: [{ kind: 'planner', payload: submitted[0].payload, updated_at: firstRevision }] });
    };
    const firstSave = savePlannerSnapshot(first, account);
    await firstStarted.promise;
    const secondSave = savePlannerSnapshot(second, account);
    // The local write precedes the serial network queue; await its microtask.
    await Promise.resolve();
    assert.equal(storage.getItem(keys.tasks), JSON.stringify(second.tasks));
    firstResponse.resolve(successfulSave(firstRevision));
    const [firstResult, secondResult] = await Promise.all([firstSave, secondSave]);
    const metadata = readSnapshotMetadata(storage, keys.updatedAt);
    const restored = await loadPlannerSnapshot(account);

    assert.deepEqual(restored.snapshot, second, 'automatic reload must not overwrite recoverable device edits');
    assert.equal(firstResult.cloudSynced, false, 'an earlier snapshot cannot confirm the later local edit');
    assert.equal(secondResult.ok, true, 'the later device copy remains saved');
    assert.equal(secondResult.cloudSynced, false, 'a failed second request cannot confirm cloud storage');
    assert.equal(submitted.length, 2);
    assert.equal(submitted[1].expectedUpdatedAt, firstRevision, 'the valid first revision still advances conditional writes');
    assert.equal(metadata.pending, true, 'unsent changes must remain dirty even when their timestamp matches');
    assert.equal(restored.cloudSynced, false);
    assert.equal(fixture.saved[0].cloudSynced, false, 'analytics must not claim a newer local edit is saved');
  });
}

test('the newest successful same-timestamp save clears pending state for its own content', { timeout: 5_000 }, async t => {
  const { account, storage, keys } = setup(t);
  const first = snapshot();
  const second = changes['task text'](first);
  const firstStarted = deferred();
  const firstResponse = deferred();
  const submitted = [];
  fixture.request = async (url, token, options) => {
    submitted.push(JSON.parse(options.body));
    if (submitted.length === 1) {
      firstStarted.resolve();
      return firstResponse.promise;
    }
    return successfulSave(secondRevision);
  };
  const firstSave = savePlannerSnapshot(first, account);
  await firstStarted.promise;
  const secondSave = savePlannerSnapshot(second, account);
  await Promise.resolve();
  firstResponse.resolve(successfulSave(firstRevision));
  const [firstResult, secondResult] = await Promise.all([firstSave, secondSave]);
  assert.equal(firstResult.cloudSynced, false);
  assert.equal(secondResult.cloudSynced, true);
  assert.equal(readSnapshotMetadata(storage, keys.updatedAt).pending, false);
  assert.equal(readSnapshotMetadata(storage, keys.updatedAt).revision, secondRevision);
  assert.equal(storage.getItem(keys.tasks), JSON.stringify(second.tasks));
});

test('an unchanged normalized planner save still confirms cloud storage', { timeout: 5_000 }, async t => {
  const { account, storage, keys } = setup(t);
  const first = snapshot();
  delete first.tasks[0]['end time'];
  fixture.request = async () => successfulSave(firstRevision);
  const result = await savePlannerSnapshot(first, account);
  assert.deepEqual(result, { ok: true, cloudSynced: true });
  assert.equal(readSnapshotMetadata(storage, keys.updatedAt).pending, false);
  assert.equal(JSON.parse(storage.getItem(keys.tasks))[0]['end time'], '04:30 PM');
});

test('an account switch before acknowledgement cannot update another account metadata', { timeout: 5_000 }, async t => {
  const { account, storage, keys } = setup(t);
  const started = deferred();
  const response = deferred();
  fixture.request = async () => { started.resolve(); return response.promise; };
  const saving = savePlannerSnapshot(snapshot(), account);
  await started.promise;
  setUserContentStorageScope('other-account');
  response.resolve(successfulSave(firstRevision));
  const result = await saving;
  assert.equal(result.cloudSynced, false);
  assert.equal(readSnapshotMetadata(storage, keys.updatedAt).pending, true);
  assert.equal(storage.getItem(`${plannerStorageKeys('other-account').updatedAt}:sync`), null);
});
