import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';
import { plannerStorageKeys } from '../src/lib/plannerStorageScope.mjs';
import { notebookStorageKeys } from '../src/lib/notebookStorageScope.mjs';

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const mock = toModule(`export const supabase = null;
 export const setNotebookStorageScope = () => {};
 export const getAccessToken = async () => 'fixture';
 export const authFetchWithAccessToken = (...args) => globalThis.__snapshotRequest(...args);
 export const trackPlannerSaved = () => {};
 export const trackPlannerRetrieved = () => {};`);
async function loadSync(name) {
  const source = fs.readFileSync(`src/lib/${name}Sync.ts`, 'utf8');
  let code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  code = code.replace(/(['"])@\/lib\/([^'"]+)\1/g, (_, quote, path) => {
    if (['apiAuth', 'supabaseClient', 'notebook', 'plannerPersistenceAnalytics.mjs'].includes(path)) return JSON.stringify(mock);
    return JSON.stringify(pathToFileURL(`${process.cwd()}/src/lib/${path}`).href);
  });
  return import(toModule(code));
}

for (const name of ['planner', 'notebook']) {
  const sync = await loadSync(name);
  const load = sync[name === 'planner' ? 'loadPlannerSnapshot' : 'loadNotebookSnapshot'];
  const save = sync[name === 'planner' ? 'savePlannerSnapshot' : 'saveNotebookSnapshot'];
  const keys = (name === 'planner' ? plannerStorageKeys : notebookStorageKeys)(`corrupt-${name}`);
  const dataKey = name === 'planner' ? keys.tasks : keys.notebooks;
  const cloudData = [name === 'planner'
    ? { id: 'recovered', 'task name': 'Recall', date: '09/10/2026', 'start time': '10:00 AM', 'task duration': 60, 'end time': '11:00 AM' }
    : { id: 'recovered', title: 'Biology', subject: 'Biology', sources: [], outputs: [], suggestedQuestions: [], createdAt: '2026-09-08T00:00:00Z', updatedAt: '2026-09-08T00:00:00Z' }];
  const payload = name === 'planner' ? { tasks: cloudData, mode: 'Day' } : { notebooks: cloudData };
  test(`${name}: corrupt device bytes survive load, autosave, failed recovery and explicit cloud recovery`, async () => {
    const bytes = '{broken-device-fixture';
    const map = new Map([[dataKey, bytes]]);
    globalThis.window = {};
    globalThis.localStorage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
    let requests = 0;
    let status = 200;
    globalThis.__snapshotRequest = async () => { requests++; return new Response(JSON.stringify({ items: [{ payload, updated_at: '2026-09-08T00:00:00Z' }] }), { status }); };
    setUserContentStorageScope(`corrupt-${name}`);
    try {
      const first = await load(`corrupt-${name}`);
      assert.equal(first.readOnly, true);
      assert.match(first.error, /preserved/);
      assert.equal(requests, 0);
      assert.equal(map.get(dataKey), bytes);
      const rejected = await save({ ...payload, updatedAt: new Date().toISOString() }, `corrupt-${name}`);
      assert.equal(rejected.ok, false);
      assert.equal(map.get(dataKey), bytes);
      status = 503;
      const failed = await load(`corrupt-${name}`, true);
      assert.equal(failed.readOnly, true);
      assert.equal(map.get(dataKey), bytes);
      status = 200;
      const recovered = await load(`corrupt-${name}`, true);
      assert.equal(recovered.cloudSynced, true);
      assert.deepEqual(JSON.parse(map.get(dataKey)), cloudData);
      const backups = [...map].filter(([key]) => key.includes(':conflict:')).map(([, value]) => JSON.parse(value));
      assert.ok(backups.some(backup => Object.values(backup.raw).includes(bytes)), 'raw recovery bytes are included in account export namespace');
    } finally {
      setUserContentStorageScope(null);
      delete globalThis.window; delete globalThis.localStorage; delete globalThis.__snapshotRequest;
    }
  });
  test(`${name}: structurally invalid records are rejected locally and remotely without writes`, async () => {
    const map = new Map([[dataKey, '[null]']]);
    globalThis.window = {};
    globalThis.localStorage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
    const badPayload = name === 'planner' ? { tasks: [null], mode: 'Day' } : { notebooks: [null] };
    globalThis.__snapshotRequest = async () => new Response(JSON.stringify({ items: [{ payload: badPayload, updated_at: '2026-09-08T00:00:00Z' }] }));
    setUserContentStorageScope(`corrupt-${name}`);
    try {
      assert.equal((await load(`corrupt-${name}`)).readOnly, true);
      assert.equal(map.get(dataKey), '[null]');
      map.set(dataKey, JSON.stringify(cloudData));
      const original = map.get(dataKey);
      const result = await load(`corrupt-${name}`, true);
      assert.match(result.error, /Invalid cloud snapshot/);
      assert.equal(map.get(dataKey), original);
      assert.equal((await save({ ...badPayload, updatedAt: new Date().toISOString() }, `corrupt-${name}`)).ok, false);
      assert.equal(map.get(dataKey), original);
    } finally {
      setUserContentStorageScope(null);
      delete globalThis.window; delete globalThis.localStorage; delete globalThis.__snapshotRequest;
    }
  });
}
