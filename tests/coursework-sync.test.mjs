import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';
import { plannerStorageKeys } from '../src/lib/plannerStorageScope.mjs';
import { collectAccountStorage, clearAccountStorage } from '../src/lib/deviceAccountData.mjs';
import { createMocks } from './helpers/mock-http.mjs';

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const mock = toModule(`export const supabase = null;
 export const getAccessToken = async () => 'fixture';
 export const authFetchWithAccessToken = (...args) => globalThis.__courseworkRequest(...args);
 export const trackPlannerSaved = () => {};
 export const trackPlannerRetrieved = () => {};`);
let code = ts.transpileModule(fs.readFileSync('src/lib/plannerSync.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
code = code.replace(/(['"])@\/lib\/([^'"]+)\1/g, (_, quote, path) => {
  if (['apiAuth', 'supabaseClient', 'plannerPersistenceAnalytics.mjs'].includes(path)) return JSON.stringify(mock);
  return JSON.stringify(pathToFileURL(`${process.cwd()}/src/lib/${path}`).href);
});
const { loadPlannerSnapshot, savePlannerSnapshot } = await import(toModule(code));
const oldTime = '2026-10-16T02:00:00.000Z';
const newTime = '2026-10-16T02:01:00.000Z';
const projects = [{
  id: 'ia-1', title: 'Biology IA', subject: 'Biology', course: 'IB DP HL', deadline: '2026-12-10',
  createdAt: oldTime, updatedAt: oldTime,
  milestones: [{ id: 'draft-1', title: 'Draft', dueDate: '2026-11-10', status: 'in-progress', evidence: 'Notebook page 6', revisions: [{ at: oldTime, note: 'Added controls.' }] }],
}];
const task = { id: 'task-1', 'task name': 'Draft methods', date: '11/01/2026', 'start time': '10:00 AM', 'task duration': 60, 'end time': '11:00 AM' };

function fixture(t, scope) {
  const keys = plannerStorageKeys(scope);
  const map = new Map();
  const storage = {
    get length() { return map.size; },
    key: index => [...map.keys()][index],
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key),
  };
  globalThis.window = { localStorage: storage };
  globalThis.localStorage = storage;
  setUserContentStorageScope(scope);
  t.after(() => {
    setUserContentStorageScope(null);
    delete globalThis.window;
    delete globalThis.localStorage;
    delete globalThis.__courseworkRequest;
  });
  const seed = (coursework = projects) => {
    map.set(keys.tasks, JSON.stringify([task]));
    map.set(keys.coursework, JSON.stringify(coursework));
    map.set(keys.mode, 'Day');
    map.set(keys.updatedAt, oldTime);
    map.set(`${keys.updatedAt}:sync`, JSON.stringify({ revision: oldTime, pending: false, syncedLocalTime: oldTime }));
  };
  return { scope, keys, map, storage, seed };
}

test('coursework evidence and revision notes survive cloud save and a fresh device load', async (t) => {
  const { scope, keys, map } = fixture(t, 'coursework-roundtrip');
  let saved;
  globalThis.__courseworkRequest = async (_url, _token, options) => {
    if (options.method === 'POST') {
      saved = JSON.parse(options.body);
      return Response.json({ item: { updated_at: newTime } }, { status: 201 });
    }
    return Response.json({ items: [{ payload: saved.payload, updated_at: newTime }] });
  };
  const result = await savePlannerSnapshot({ tasks: [task], coursework: projects, mode: 'Day', updatedAt: oldTime }, scope);
  assert.equal(result.cloudSynced, true);
  assert.equal(saved.payload.version, 2, 'coursework writes need a new schema version so older clients cannot erase them');
  assert.deepEqual(saved.payload.coursework, projects);
  map.clear();
  const restored = await loadPlannerSnapshot(scope);
  assert.equal(restored.cloudSynced, true);
  assert.deepEqual(restored.snapshot.coursework, projects);
  assert.deepEqual(JSON.parse(map.get(keys.coursework)), projects);
});

test('task-only callers preserve current coursework instead of replacing it with an empty collection', async (t) => {
  const { scope, keys, map, seed } = fixture(t, 'coursework-task-only');
  seed();
  let saved;
  globalThis.__courseworkRequest = async (_url, _token, options) => {
    saved = JSON.parse(options.body);
    return Response.json({ item: { updated_at: newTime } }, { status: 201 });
  };
  const result = await savePlannerSnapshot({ tasks: [], mode: 'Day', updatedAt: newTime }, scope);
  assert.equal(result.ok, true);
  assert.deepEqual(saved.payload.coursework, projects);
  assert.deepEqual(JSON.parse(map.get(keys.coursework)), projects);
});

test('corrupt coursework blocks autosave and its raw bytes remain in explicit cloud-recovery export', async (t) => {
  const { scope, keys, map, storage, seed } = fixture(t, 'coursework-corruption');
  seed();
  const corrupt = '{broken-coursework';
  map.set(keys.coursework, corrupt);
  let requests = 0;
  globalThis.__courseworkRequest = async () => {
    requests++;
    return Response.json({ items: [{ payload: { tasks: [task], coursework: projects, mode: 'Day', version: 2 }, updated_at: newTime }] });
  };
  assert.equal((await loadPlannerSnapshot(scope)).readOnly, true);
  assert.equal((await savePlannerSnapshot({ tasks: [], coursework: [], mode: 'Day', updatedAt: newTime }, scope)).ok, false);
  assert.equal(requests, 0);
  assert.equal(map.get(keys.coursework), corrupt);
  assert.equal((await loadPlannerSnapshot(scope, true)).cloudSynced, true);
  assert.deepEqual(JSON.parse(map.get(keys.coursework)), projects);
  assert.ok(Object.values(collectAccountStorage(storage, scope)).some(value => JSON.stringify(value).includes('broken-coursework')));
});

test('explicitly invalid cloud coursework and unknown snapshot versions never erase local coursework', async (t) => {
  const { scope, keys, map, seed } = fixture(t, 'coursework-invalid-cloud');
  seed();
  for (const payload of [
    { tasks: [task], coursework: null, mode: 'Day', version: 2 },
    { tasks: [task], coursework: projects, mode: 'Day', version: 999 },
  ]) {
    globalThis.__courseworkRequest = async () => Response.json({ items: [{ payload, updated_at: newTime }] });
    const result = await loadPlannerSnapshot(scope, true);
    assert.equal(result.cloudSynced, false);
    assert.match(result.error, /Invalid cloud snapshot/);
    assert.deepEqual(JSON.parse(map.get(keys.coursework)), projects);
  }
});

test('an explicit invalid coursework value is rejected rather than silently treated as omitted', async (t) => {
  const { scope, keys, map, seed } = fixture(t, 'coursework-invalid-save');
  seed();
  let requests = 0;
  globalThis.__courseworkRequest = async () => { requests++; return Response.json({ item: { updated_at: newTime } }); };
  const result = await savePlannerSnapshot({ tasks: [], coursework: null, mode: 'Day', updatedAt: newTime }, scope);
  assert.equal(result.ok, false);
  assert.equal(requests, 0);
  assert.deepEqual(JSON.parse(map.get(keys.coursework)), projects);
});

test('quota failure on the new coursework key restores the earlier planner keys', async (t) => {
  const { scope, keys, map, storage, seed } = fixture(t, 'coursework-quota');
  seed();
  globalThis.__courseworkRequest = async () => Response.json({ items: [{ payload: { tasks: [task], coursework: projects, mode: 'Day', version: 2 }, updated_at: oldTime }] });
  await loadPlannerSnapshot(scope);
  const before = new Map(map);
  let quotaFailures = 0;
  storage.setItem = (key, value) => {
    if (key === keys.coursework && value === '[]') { quotaFailures++; throw new Error('quota exceeded'); }
    map.set(key, value);
  };
  globalThis.__courseworkRequest = async () => { assert.fail('failed device save must not reach the network'); };
  const result = await savePlannerSnapshot({ tasks: [], coursework: [], mode: 'Week', updatedAt: newTime }, scope);
  assert.equal(result.ok, false);
  assert.equal(quotaFailures, 1, 'the test must reach the failing storage write');
  assert.deepEqual(map, before);
});

test('late account recovery cannot return or write the previous account coursework', async (t) => {
  const { scope, keys, map } = fixture(t, 'coursework-account-a');
  let release;
  const response = new Promise(resolve => { release = resolve; });
  let started;
  const requestStarted = new Promise(resolve => { started = resolve; });
  globalThis.__courseworkRequest = async () => { started(); return response; };
  const pending = loadPlannerSnapshot(scope);
  await requestStarted;
  setUserContentStorageScope('coursework-account-b');
  release(Response.json({ items: [{ payload: { tasks: [task], coursework: projects, mode: 'Day', version: 2 }, updated_at: newTime }] }));
  const result = await pending;
  assert.equal(result.readOnly, true);
  assert.equal(result.snapshot.coursework?.length ?? 0, 0);
  assert.equal(map.has(keys.coursework), false);
  assert.equal(map.has(plannerStorageKeys('coursework-account-b').coursework), false);
});

test('account export and deletion include coursework only for the selected account', (t) => {
  const { scope, keys, map, storage, seed } = fixture(t, 'coursework-export-a');
  seed();
  const otherKey = plannerStorageKeys('coursework-export-ab').coursework;
  map.set(otherKey, JSON.stringify([{ private: 'other account' }]));
  const exported = collectAccountStorage(storage, scope);
  assert.ok(Object.hasOwn(exported, keys.coursework));
  assert.equal(Object.hasOwn(exported, otherKey), false);
  clearAccountStorage(storage, scope);
  assert.equal(map.has(keys.coursework), false);
  assert.equal(map.has(otherKey), true);
});

test('stale-tab coursework saves preserve a newer unsynced device record before replacement', async (t) => {
  const { scope, keys, map, storage, seed } = fixture(t, 'coursework-stale-tab');
  seed([]);
  globalThis.__courseworkRequest = async () => Response.json({ items: [{ payload: { tasks: [task], coursework: [], mode: 'Day', version: 2 }, updated_at: oldTime }] });
  await loadPlannerSnapshot(scope);
  // Another tab has an unsynced coursework edit. The stale tab still holds [].
  map.set(keys.coursework, JSON.stringify(projects));
  map.set(keys.updatedAt, newTime);
  map.set(`${keys.updatedAt}:sync`, JSON.stringify({ revision: oldTime, pending: true, syncedLocalTime: oldTime }));
  let requests = 0;
  globalThis.__courseworkRequest = async () => { requests++; return Response.json({ error: 'Cloud work changed.' }, { status: 409 }); };
  const result = await savePlannerSnapshot({ tasks: [task], coursework: [], mode: 'Day', updatedAt: '2026-10-16T02:02:00.000Z' }, scope);
  assert.equal(result.ok, false);
  assert.equal(result.cloudSynced, false);
  assert.equal(requests, 0, 'the stale replacement must be rejected before the network request');
  assert.deepEqual(JSON.parse(map.get(keys.coursework)), projects);
  const preserved = JSON.stringify(collectAccountStorage(storage, scope));
  assert.ok(preserved.includes('Notebook page 6') && preserved.includes('Added controls.'), 'the overwritten coursework must remain in the active record or an exported raw recovery backup');
});

test('same-timestamp device edits still reject a stale-tab overwrite', async (t) => {
  const { scope, keys, map, seed } = fixture(t, 'coursework-same-timestamp');
  seed([]);
  globalThis.__courseworkRequest = async () => Response.json({ items: [{ payload: { tasks: [task], coursework: [], mode: 'Day', version: 2 }, updated_at: oldTime }] });
  await loadPlannerSnapshot(scope);
  map.set(keys.coursework, JSON.stringify(projects));
  assert.equal(map.get(keys.updatedAt), oldTime);
  globalThis.__courseworkRequest = async () => { assert.fail('stale bytes must not reach cloud replacement'); };
  const result = await savePlannerSnapshot({ tasks: [task], coursework: [], mode: 'Day', updatedAt: oldTime }, scope);
  assert.equal(result.ok, false);
  assert.deepEqual(JSON.parse(map.get(keys.coursework)), projects);
});

test('an earlier cloud acknowledgement does not mark a different same-timestamp edit as synced', async (t) => {
  const { scope } = fixture(t, 'coursework-acknowledgement');
  const releases = [];
  const starts = [];
  globalThis.__courseworkRequest = async () => {
    const response = new Promise(resolve => releases.push(resolve));
    starts.shift()?.();
    return response;
  };
  const waitForRequest = () => new Promise(resolve => starts.push(resolve));
  const firstStarted = waitForRequest();
  const first = savePlannerSnapshot({ tasks: [task], coursework: [], mode: 'Day', updatedAt: oldTime }, scope);
  await firstStarted;
  const secondStarted = waitForRequest();
  const second = savePlannerSnapshot({ tasks: [task], coursework: projects, mode: 'Day', updatedAt: oldTime }, scope);
  // Let the second save persist locally while its cloud write waits its turn.
  await new Promise(resolve => setImmediate(resolve));
  releases[0](Response.json({ item: { updated_at: newTime } }, { status: 201 }));
  assert.equal((await first).cloudSynced, false);
  await secondStarted;
  releases[1](Response.json({ item: { updated_at: '2026-10-16T02:02:00.000Z' } }, { status: 201 }));
  assert.equal((await second).cloudSynced, true);
});

const serverMock = toModule(`
 export const verifyAuthUser = async () => ({id: 'coursework-owner'});
 export const readJsonBody = req => req.body;
 export const rejectOversizedJsonBody = () => false;
 export const getSupabaseAdmin = () => ({});
 export const checkRateLimit = async () => ({allowed: true});
 export const createStudyArtifact = async () => { throw new Error('unexpected create'); };
 export const replaceSingletonArtifact = async (_db, record) => {
   globalThis.__courseworkServerWrites.push(record);
   return {data: {id: 'planner-1', kind: 'planner', title: record.title, updated_at: record.updatedAt}};
 };
`);
const handlerPath = pathToFileURL(`${process.cwd()}/api/_handlers/user-content.js`);
const handlerSource = fs.readFileSync(handlerPath, 'utf8').replace(/from (['"])([^'"]+)\1/g, (_match, _quote, path) => {
  const mocked = ['../_lib/auth.js', '../_lib/supabaseAdmin.js', '../_lib/rateLimit.js', '../_lib/userContentStore.js'].includes(path);
  return `from ${JSON.stringify(mocked ? serverMock : new URL(path, handlerPath).href)}`;
});
const { default: userContentHandler } = await import(toModule(handlerSource));

test('the real API handler rejects legacy planner replacement even with a current cloud revision', async (t) => {
  globalThis.__courseworkServerWrites = [];
  t.after(() => delete globalThis.__courseworkServerWrites);
  for (const version of [undefined, 1, 999]) {
    const { req, res, getStatus, getJson } = createMocks({ body: { kind: 'planner', replace: true, expectedUpdatedAt: newTime, payload: { tasks: [task], mode: 'Day', version } } });
    await userContentHandler(req, res);
    assert.equal(getStatus(), 409);
    assert.match(getJson().error, /Reload.*coursework/);
  }
  assert.deepEqual(globalThis.__courseworkServerWrites, []);
});

test('the real API handler accepts v2 coursework and rejects damaged or missing collections before writes', async (t) => {
  globalThis.__courseworkServerWrites = [];
  t.after(() => delete globalThis.__courseworkServerWrites);
  for (const coursework of [undefined, null, [null]]) {
    const { req, res, getStatus } = createMocks({ body: { kind: 'planner', replace: true, expectedUpdatedAt: oldTime, payload: { tasks: [task], coursework, mode: 'Day', version: 2 } } });
    await userContentHandler(req, res);
    assert.equal(getStatus(), 400);
  }
  assert.deepEqual(globalThis.__courseworkServerWrites, []);
  const { req, res, getStatus } = createMocks({ body: { kind: 'planner', title: 'Planner', replace: true, expectedUpdatedAt: oldTime, payload: { tasks: [task], coursework: projects, mode: 'Day', version: 2 } } });
  await userContentHandler(req, res);
  assert.equal(getStatus(), 201);
  assert.equal(globalThis.__courseworkServerWrites.length, 1);
  assert.equal(globalThis.__courseworkServerWrites[0].userId, 'coursework-owner');
  assert.deepEqual(globalThis.__courseworkServerWrites[0].payload.coursework, projects);
});
