import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';
import { onboardingDraftKey, readOnboardingDraft, writeOnboardingDraft, clearOnboardingDraft } from '../src/lib/onboardingRecovery.mjs';
import { collectAccountStorage, clearAccountStorage } from '../src/lib/deviceAccountData.mjs';

const scope = 'onboarding-owner';
const preference = { board: 'IB_DP', grade: 11, subjects: ['Physics'], examDate: '2027-05-12' };
const draft = { version: 1, username: 'learner', schoolName: 'School', step: 2, curriculum: preference };
const snapshot = { tasks: [], coursework: [], mode: 'Day', updatedAt: '2026-10-16T00:00:00.000Z' };
const encode = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const dependencies = encode(`
  export const loadPlannerSnapshot = async () => globalThis.__onboardingRuntime.load();
  export const savePlannerSnapshot = async (...args) => { globalThis.__onboardingRuntime.saves.push(args); return globalThis.__onboardingRuntime.saveResult; };
  export const createFirstStudyPlan = () => { globalThis.__onboardingRuntime.created++; return { tasks: [{ id: 'starter', source: 'onboarding' }], mode: 'Week', updatedAt: '2026-10-16T01:00:00.000Z' }; };
`);
let code = ts.transpileModule(fs.readFileSync('src/lib/onboardingPlanner.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
code = code.replace(/(['"])\.\/([^'"]+)\1/g, (_, quote, file) => JSON.stringify(
  ['onboardingPlan', 'plannerSync'].includes(file) ? dependencies : pathToFileURL(`${process.cwd()}/src/lib/${file}`).href,
));
const { saveInitialStudyPlan } = await import(encode(code));

function harness(t, loaded = { snapshot, cloudSynced: true }) {
  setUserContentStorageScope(scope);
  const bytes = new Map();
  const storage = {
    get length() { return bytes.size; },
    key: index => [...bytes.keys()][index] ?? null,
    getItem: key => bytes.get(key) ?? null,
    setItem: (key, value) => bytes.set(key, value),
    removeItem: key => bytes.delete(key),
  };
  const runtime = { bytes, storage, saves: [], created: 0, saveResult: { ok: true, cloudSynced: true }, load: async () => loaded };
  globalThis.__onboardingRuntime = runtime;
  t.after(() => { setUserContentStorageScope(null); delete globalThis.__onboardingRuntime; });
  return runtime;
}

test('retry preserves an existing cloud plan and coursework without generating replacements', async t => {
  const existing = { ...snapshot, tasks: [{ id: 'manual-work' }], coursework: [{ id: 'ia-project' }] };
  const runtime = harness(t, { snapshot: existing, cloudSynced: true });
  assert.equal((await saveInitialStudyPlan(preference, scope, 'fixture-token')).ok, true);
  assert.equal(runtime.created, 0);
  assert.equal(runtime.saves.length, 0);
});

test('an acknowledged empty cloud planner creates tasks while retaining coursework', async t => {
  const coursework = [{ id: 'ia-project' }];
  const runtime = harness(t, { snapshot: { ...snapshot, coursework }, cloudSynced: true });
  assert.equal((await saveInitialStudyPlan(preference, scope, 'fixture-token')).ok, true);
  assert.equal(runtime.created, 1);
  assert.deepEqual(runtime.saves[0][0].coursework, coursework);
  assert.deepEqual(runtime.saves[0].slice(1), [scope, 'fixture-token']);
});

for (const loaded of [
  { snapshot, cloudSynced: false, error: 'Network unavailable' },
  { snapshot, cloudSynced: false, error: 'Cloud work changed on another device.' },
  { snapshot, cloudSynced: false, readOnly: true, error: 'Corrupt device data' },
]) {
  test(`unavailable, conflicting or corrupt planner cannot become a fresh empty plan: ${loaded.error}`, async t => {
    const runtime = harness(t, loaded);
    assert.equal((await saveInitialStudyPlan(preference, scope, 'fixture-token')).ok, false);
    assert.equal(runtime.created, 0);
    assert.equal(runtime.saves.length, 0);
  });
}

test('retry syncs the existing unsynced plan without changing its tasks or coursework', async t => {
  const existing = { ...snapshot, tasks: [{ id: 'first-attempt-plan' }], coursework: [{ id: 'ia-project' }] };
  const runtime = harness(t, { snapshot: existing, cloudSynced: false, error: 'Local edits are waiting to sync.' });
  runtime.saveResult = { ok: true, cloudSynced: false, error: 'Saved on this device only' };
  const result = await saveInitialStudyPlan(preference, scope, 'fixture-token');
  assert.equal(result.cloudSynced, false);
  assert.deepEqual(runtime.saves[0][0], existing);
  assert.equal(runtime.created, 0);
});

test('account change during planner loading cancels creation and writes', async t => {
  const runtime = harness(t);
  runtime.load = async () => { setUserContentStorageScope('another-owner'); return { snapshot, cloudSynced: true }; };
  assert.equal((await saveInitialStudyPlan(preference, scope, 'fixture-token')).ok, false);
  assert.equal(runtime.saves.length, 0);
  assert.equal(runtime.created, 0);
});

test('an incomplete setup restores all entered fields and belongs to account export/deletion', t => {
  const { storage } = harness(t);
  const saved = writeOnboardingDraft(storage, scope, draft, null);
  assert.equal(saved.ok, true);
  assert.deepEqual(readOnboardingDraft(storage, scope).draft, draft);
  const exported = collectAccountStorage(storage, scope);
  assert.ok(JSON.stringify(exported).includes('onboarding_draft'));
  clearAccountStorage(storage, scope);
  assert.equal(storage.getItem(onboardingDraftKey(scope)), null);
});

test('an unfinished subject exam date remains recoverable while the learner fills it in', t => {
  const { storage } = harness(t);
  const unfinished = { ...draft, curriculum: { ...preference, examTargets: [{ id: 'draft-target', subject: 'Physics', paper: '', date: '' }] } };
  assert.equal(writeOnboardingDraft(storage, scope, unfinished, null).ok, true);
  assert.deepEqual(readOnboardingDraft(storage, scope).draft, unfinished);
});

test('stale tabs cannot overwrite or delete a newer setup draft', t => {
  const { storage } = harness(t);
  const first = writeOnboardingDraft(storage, scope, draft, null);
  const next = { ...draft, username: 'newer-learner' };
  assert.equal(writeOnboardingDraft(storage, scope, next, first.revision).ok, true);
  assert.equal(writeOnboardingDraft(storage, scope, draft, first.revision).ok, false);
  assert.equal(clearOnboardingDraft(storage, scope, first.revision), false);
  assert.deepEqual(readOnboardingDraft(storage, scope).draft, next);
});

for (const bytes of ['{damaged', 'null', JSON.stringify({ ...draft, curriculum: { ...preference, examDate: '2027-02-30' } })]) {
  test(`malformed setup remains exportable and is never overwritten: ${bytes.slice(0, 12)}`, t => {
    const { storage } = harness(t);
    storage.setItem(onboardingDraftKey(scope), bytes);
    assert.ok(readOnboardingDraft(storage, scope).error);
    assert.equal(writeOnboardingDraft(storage, scope, draft, bytes).ok, false);
    assert.equal(clearOnboardingDraft(storage, scope, bytes), false);
    assert.equal(storage.getItem(onboardingDraftKey(scope)), bytes);
  });
}

test('account switching cannot read, write or clear the former account draft', t => {
  const { storage } = harness(t);
  const saved = writeOnboardingDraft(storage, scope, draft, null);
  setUserContentStorageScope('another-owner');
  assert.equal(readOnboardingDraft(storage, scope).draft, null);
  assert.equal(writeOnboardingDraft(storage, scope, draft, saved.revision).ok, false);
  assert.equal(clearOnboardingDraft(storage, scope, saved.revision), false);
  assert.equal(storage.getItem(onboardingDraftKey(scope)), saved.revision);
});

test('storage quota failure is visible and retains the last saved setup', t => {
  const { storage } = harness(t);
  const saved = writeOnboardingDraft(storage, scope, draft, null);
  storage.setItem = () => { throw new Error('Quota'); };
  const result = writeOnboardingDraft(storage, scope, { ...draft, username: 'new-name' }, saved.revision);
  assert.equal(result.ok, false);
  assert.match(result.error, /could not be saved on this device/);
  assert.deepEqual(readOnboardingDraft(storage, scope).draft, draft);
});
