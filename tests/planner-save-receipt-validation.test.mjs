import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';
import { plannerStorageKeys } from '../src/lib/plannerStorageScope.mjs';
import { readSnapshotMetadata } from '../src/lib/snapshotConcurrency.mjs';

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const mock = toModule(`export const supabase = null;
export const getAccessToken = async () => 'fixture-token';
export const authFetchWithAccessToken = (...args) => globalThis.__plannerRequest(...args);
export const trackPlannerSaved = value => globalThis.__plannerEvents.push(value);
export const trackPlannerRetrieved = () => {};`);
let source = ts.transpileModule(fs.readFileSync('src/lib/plannerSync.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
source = source.replace(/(['"])@\/lib\/([^'"]+)\1/g, (_, quote, path) =>
  JSON.stringify(['apiAuth', 'supabaseClient', 'plannerPersistenceAnalytics.mjs'].includes(path)
    ? mock : pathToFileURL(`${process.cwd()}/src/lib/${path}`).href));
const { savePlannerSnapshot, loadPlannerSnapshot, writeLocalPlannerSnapshot } = await import(toModule(source));

const initialRevision = '2026-10-10T12:00:00.000Z';
const savedRevision = '2026-10-11T12:00:00.000Z';
const localTime = '2026-10-11T12:00:01.000Z';
const itemId = '11111111-1111-4111-8111-111111111111';
const makeSnapshot = () => ({
  tasks: [{ id: 'math', 'task name': 'Complex numbers', date: '10/12/2026',
    'start time': '04:00 PM', 'task duration': 60, 'end time': '05:00 PM' }],
  mode: 'Day', updatedAt: localTime,
});
const acknowledgement = (patch = {}) => ({ ok: true, item: {
  id: itemId, kind: 'planner', title: 'Study Planner',
  created_at: initialRevision, updated_at: savedRevision, ...patch,
} });
const json = (body, status = 201) => new Response(JSON.stringify(body), { status });
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

let fixtureId = 0;
async function withFixture(run) {
  const scope = `planner-confirmation-${++fixtureId}`;
  const keys = plannerStorageKeys(scope);
  const values = new Map();
  const originalGlobals = Object.fromEntries(['window', 'localStorage', '__plannerRequest', '__plannerEvents']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  globalThis.window = {};
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  } });
  globalThis.__plannerEvents = [];
  setUserContentStorageScope(scope);
  writeLocalPlannerSnapshot(makeSnapshot(), scope);
  values.set(`${keys.updatedAt}:sync`, JSON.stringify({ revision: initialRevision, pending: false, syncedLocalTime: localTime }));
  try { await run({ scope, keys, values, metadata: () => readSnapshotMetadata(globalThis.localStorage, keys.updatedAt) }); }
  finally {
    setUserContentStorageScope(null);
    for (const [key, descriptor] of Object.entries(originalGlobals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

const malformed = [
  ['revision alone', { item: { updated_at: savedRevision } }],
  ['explicit failure', { ...acknowledgement(), ok: false }],
  ['missing success flag', { item: acknowledgement().item }],
  ['wrong artifact kind', acknowledgement({ kind: 'notebook' })],
  ['missing artifact identity', acknowledgement({ id: undefined })],
  ['invalid artifact identity', acknowledgement({ id: 'not-an-artifact' })],
  ['unparseable revision', acknowledgement({ updated_at: 'not-a-time' })],
  ['impossible calendar date', acknowledgement({ updated_at: '2026-02-30T12:00:00Z' })],
  ['timezone-free revision', acknowledgement({ updated_at: '2026-10-11T12:00:00' })],
  ['unchanged cloud revision', acknowledgement({ updated_at: initialRevision })],
  ['older cloud revision', acknowledgement({ updated_at: '2026-10-09T12:00:00Z' })],
];
for (const [name, body] of malformed) {
  test(`planner retains pending device work after ${name}`, () => withFixture(async ({ scope, keys, values, metadata }) => {
    let requestBody;
    globalThis.__plannerRequest = async (url, token, init) => {
      assert.equal(url, '/api/user-content');
      assert.equal(token, 'fixture-token');
      requestBody = JSON.parse(init.body);
      return json(body);
    };
    const snapshot = makeSnapshot();
    const result = await savePlannerSnapshot(snapshot, scope);
    assert.equal(result.ok, true, 'device save still succeeds');
    assert.equal(result.cloudSynced, false, 'an invalid receipt cannot clear pending work');
    assert.match(result.error, /acknowledgement|preserved/i);
    assert.equal(metadata().pending, true);
    assert.equal(metadata().revision, initialRevision);
    assert.deepEqual(JSON.parse(values.get(keys.tasks)), snapshot.tasks);
    assert.equal(requestBody.expectedUpdatedAt, initialRevision);
    assert.equal(globalThis.__plannerEvents.some(event => event.cloudSynced), false);
  }));
}

for (const revision of [savedRevision, '2026-10-11T12:00:00.123456+00:00', '2026-10-11T17:30:00+05:30']) {
  test(`planner accepts a complete server receipt using ${revision}`, () => withFixture(async ({ scope, metadata }) => {
    globalThis.__plannerRequest = async () => json(acknowledgement({ updated_at: revision }));
    assert.deepEqual(await savePlannerSnapshot(makeSnapshot(), scope), { ok: true, cloudSynced: true });
    assert.equal(metadata().pending, false);
    assert.equal(metadata().revision, revision);
  }));
}

test('planner preserves different edits sharing one millisecond when a save completes', () => withFixture(async ({ scope, keys, values, metadata }) => {
  const started = deferred();
  const response = deferred();
  const snapshot = makeSnapshot();
  globalThis.__plannerRequest = async () => { started.resolve(); return response.promise; };
  const saving = savePlannerSnapshot(snapshot, scope);
  await started.promise;
  const later = makeSnapshot();
  later.tasks[0]['task name'] = 'Physics forces';
  later.mode = 'Week';
  writeLocalPlannerSnapshot(later, scope);
  response.resolve(json(acknowledgement()));
  assert.equal((await saving).cloudSynced, false);
  assert.equal(metadata().pending, true);
  assert.deepEqual(JSON.parse(values.get(keys.tasks)), later.tasks);
  globalThis.__plannerRequest = async () => json({ items: [{ payload: snapshot, updated_at: savedRevision }] }, 200);
  const recovered = await loadPlannerSnapshot(scope);
  assert.equal(recovered.cloudSynced, false);
  assert.deepEqual(recovered.snapshot.tasks, later.tasks, 'recovery must not replace unconfirmed edits');
  assert.equal(recovered.snapshot.mode, 'Week');
}));

test('a queued planner save retains the values persisted when it was enqueued', () => withFixture(async ({ scope, keys, values, metadata }) => {
  const started = deferred();
  const response = deferred();
  const bodies = [];
  globalThis.__plannerRequest = async (url, token, init) => {
    bodies.push(JSON.parse(init.body));
    if (bodies.length === 1) { started.resolve(); return response.promise; }
    return json(acknowledgement({ updated_at: '2026-10-11T12:00:02Z' }));
  };
  const first = savePlannerSnapshot(makeSnapshot(), scope);
  await started.promise;
  const secondSnapshot = makeSnapshot();
  secondSnapshot.tasks[0]['task name'] = 'Physics forces';
  secondSnapshot.updatedAt = '2026-10-11T12:00:01.001Z';
  const second = savePlannerSnapshot(secondSnapshot, scope);
  await Promise.resolve();
  assert.equal(JSON.parse(values.get(keys.tasks))[0]['task name'], 'Physics forces');
  secondSnapshot.tasks[0]['task name'] = 'Mutated after enqueue';
  secondSnapshot.mode = 'Week';
  response.resolve(json(acknowledgement()));
  await first;
  assert.equal((await second).cloudSynced, true);
  assert.equal(bodies[1].payload.tasks[0]['task name'], 'Physics forces');
  assert.equal(bodies[1].payload.mode, 'Day');
  assert.equal(metadata().pending, false);
}));

test('planner keeps the initiating account receipt separate after an account switch', () => withFixture(async ({ scope, metadata }) => {
  globalThis.__plannerRequest = async () => {
    setUserContentStorageScope('another-account');
    return json(acknowledgement());
  };
  const result = await savePlannerSnapshot(makeSnapshot(), scope);
  assert.equal(result.cloudSynced, false);
  assert.equal(metadata().pending, true);
  assert.equal(metadata().revision, initialRevision);
}));

test('planner retains pending local work after an HTTP conflict', () => withFixture(async ({ scope, metadata }) => {
  globalThis.__plannerRequest = async () => json({ error: 'Cloud work changed.' }, 409);
  const result = await savePlannerSnapshot(makeSnapshot(), scope);
  assert.equal(result.cloudSynced, false);
  assert.equal(metadata().pending, true);
  assert.equal(metadata().revision, initialRevision);
}));
