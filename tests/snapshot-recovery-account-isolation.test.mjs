import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const planner = fs.readFileSync('src/lib/plannerSync.ts', 'utf8');
const notebook = fs.readFileSync('src/lib/notebookSync.ts', 'utf8');

function section(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert.ok(start >= 0, `${startNeedle} must exist`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert.ok(end > start, `${endNeedle} must follow ${startNeedle}`);
  return source.slice(start, end);
}

test('planner recovery validates the active account before reading scoped device data', () => {
  const load = section(planner, 'export async function loadPlannerSnapshot', 'export async function savePlannerSnapshot');
  const resolveIndex = load.indexOf('await resolveStorageScope(storageScope)');
  const scopeIndex = load.indexOf('getUserContentStorageScope() !== resolvedScope', resolveIndex);
  const localReadIndex = load.indexOf('readLocalSnapshot(resolvedScope)', resolveIndex);

  assert.ok(resolveIndex >= 0 && scopeIndex > resolveIndex && localReadIndex > scopeIndex);
  assert.match(load, /return accountChangedPlannerResult\(\);/);
});

test('planner recovery never returns the prior account local snapshot after token or network scope changes', () => {
  const load = section(planner, 'export async function loadPlannerSnapshot', 'export async function savePlannerSnapshot');
  const tokenIndex = load.indexOf('await getAccessToken().catch(() => null)');
  const tokenScopeIndex = load.indexOf('getUserContentStorageScope() !== resolvedScope', tokenIndex);
  const requestIndex = load.indexOf("authFetchWithAccessToken('/api/user-content?kind=planner&limit=1'", tokenScopeIndex);
  const catchIndex = load.indexOf('} catch (err) {', requestIndex);
  const catchScopeIndex = load.indexOf('getUserContentStorageScope() !== resolvedScope', catchIndex);
  const analyticsIndex = load.indexOf('trackPlannerRetrieved', catchIndex);

  assert.ok(tokenIndex >= 0 && tokenScopeIndex > tokenIndex && requestIndex > tokenScopeIndex);
  assert.ok(catchIndex > requestIndex && catchScopeIndex > catchIndex && analyticsIndex > catchScopeIndex);
  assert.match(load, /const data = await res\.json\(\)\.catch\(\(\) => null\);\s*if \(getUserContentStorageScope\(\) !== resolvedScope\) return accountChangedPlannerResult\(\);/);
});

test('notebook recovery validates account scope before returning local data after token acquisition', () => {
  const load = section(notebook, 'export async function loadNotebookSnapshot', 'export async function saveNotebookSnapshot');
  const tokenIndex = load.indexOf('await getAccessToken().catch(() => null)');
  const scopeIndex = load.indexOf('getUserContentStorageScope() !== resolvedScope', tokenIndex);
  const noTokenIndex = load.indexOf('if (!accessToken)', scopeIndex);

  assert.ok(tokenIndex >= 0 && scopeIndex > tokenIndex && noTokenIndex > scopeIndex);
  assert.match(load, /if \(getUserContentStorageScope\(\) !== resolvedScope\) return accountChangedNotebookResult\(\);/);
});

test('notebook finish and catch sanitize stale-account recovery results', () => {
  const load = section(notebook, 'export async function loadNotebookSnapshot', 'export async function saveNotebookSnapshot');
  const finishIndex = load.indexOf('const finish =');
  const finishScopeIndex = load.indexOf('getUserContentStorageScope() !== resolvedScope', finishIndex);
  const requestIndex = load.indexOf("authFetchWithAccessToken('/api/user-content?kind=notebook&limit=1'", finishScopeIndex);
  const responseScopeIndex = load.indexOf('getUserContentStorageScope() !== resolvedScope', requestIndex);
  const catchIndex = load.indexOf('} catch (err) {', requestIndex);
  const catchScopeIndex = load.indexOf('getUserContentStorageScope() !== resolvedScope', catchIndex);

  assert.ok(finishIndex >= 0 && finishScopeIndex > finishIndex);
  assert.ok(requestIndex > finishScopeIndex && responseScopeIndex > requestIndex);
  assert.ok(catchIndex > requestIndex && catchScopeIndex > catchIndex);
  assert.match(load, /return accountChangedNotebookResult\(\);/);
});

test('stale-account recovery results are read-only empty snapshots rather than previous-account content', () => {
  assert.match(planner, /function accountChangedPlannerResult\(\)[\s\S]*snapshot: emptySnapshot\(\),[\s\S]*readOnly: true/);
  assert.match(notebook, /function accountChangedNotebookResult\(\)[\s\S]*snapshot: emptySnapshot\(\),[\s\S]*readOnly: true/);
});
