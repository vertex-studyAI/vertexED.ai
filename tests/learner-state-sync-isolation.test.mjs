import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const syncSource = fs.readFileSync('src/lib/learnerStateSync.ts', 'utf8');
const authSource = fs.readFileSync('src/lib/apiAuth.ts', 'utf8');

test('background learner sync binds account scope and token for the entire request', () => {
  assert.match(syncSource, /const scope = getUserContentStorageScope\(\)/);
  assert.match(syncSource, /const accessToken = await getAccessToken\(\)/);
  assert.match(syncSource, /authFetchWithAccessToken\('\/api\/learner-state', accessToken/);
  assert.match(syncSource, /removeConfirmedWrites\(\[\.\.\.applied, \.\.\.rejected\], scope\)/);
  assert.match(syncSource, /partitionLearnerStateSyncResults\(batch, data\?\.results\)/);
  assert.match(syncSource, /userContentStorageKeys\(scope\)/);
  assert.match(syncSource, /getUserContentStorageScope\(\) !== scope/);
  assert.match(syncSource, /putDurableOutboxRecord/);
  assert.match(syncSource, /deleteDurableOutboxRecord/);
});

test('learner-state recovery normalizes corrupt local mirrors without silently accepting failed writes', () => {
  assert.match(syncSource, /parseStoredArray\(safeStorageGet\(storage, key\)\)/);
  assert.match(syncSource, /parseStoredObject\(safeStorageGet\(storage, key\)\)/);
  assert.match(syncSource, /function requireStorageWrite\(ok: boolean\)/);
  assert.match(syncSource, /requireStorageWrite\(safeStorageSet\(storage, key/);
  assert.match(syncSource, /requireStorageWrite\(safeStorageRemove\(storage, key\)\)/);
  assert.doesNotMatch(syncSource, /window\.localStorage\.(?:getItem|setItem|removeItem)/);
  assert.match(syncSource, /if \(recoveryFailures\) throw new Error/);
});

test('bound auth requests never refresh into or return responses to a different active account', () => {
  const block = authSource.match(/export async function authFetchWithAccessToken[\s\S]*?\n}\n/)?.[0] ?? '';
  assert.match(block, /const accountScope = getUserContentStorageScope\(\)/);
  assert.match(block, /headers\.set\('Authorization', `Bearer \$\{accessToken\}`\)/);
  assert.match(block, /assertAccountScope\(accountScope\);\s*const response = await fetch/);
  assert.match(block, /const response = await fetch[\s\S]*?assertAccountScope\(accountScope\);[\s\S]*?await response\.clone\(\)\.arrayBuffer\(\);\s*assertAccountScope\(accountScope\);\s*return response;/);
  assert.doesNotMatch(block, /refreshAccessToken/);
});

test('general auth requests reject stale responses after the active account changes', () => {
  const block = authSource.match(/export async function authFetch\(input[\s\S]*?\n}\n/)?.[0] ?? '';

  assert.match(authSource, /class AccountScopeChangedError extends Error/);
  assert.match(authSource, /function assertAccountScope\(accountScope:/);
  assert.match(block, /assertAccountScope\(accountScope\);\n {4}let response = await performRequest\(headers\);\n {4}assertAccountScope\(accountScope\);/);
  assert.match(block, /response = await performRequest\(retryHeaders\);\n {8}assertAccountScope\(accountScope\);/);
  assert.match(block, /if \(shouldTrackAiRequest\) \{[\s\S]*?const resultText = await response\.clone\(\)\.text\(\);[\s\S]*?if \(response\.ok\) \{[\s\S]*?JSON\.parse\(resultText\)[\s\S]*?assertAccountScope\(accountScope\);[\s\S]*?trackAiRequestOutcome/);
  assert.match(block, /finally \{\s*deadline\?\.cleanup\(\);/);
  assert.match(block, /assertAccountScope\(accountScope\);\n {4}return response;/);
});

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const stub = moduleUrl(`
export const getUserContentStorageScope = () => globalThis.__learnerScopeTest.scope;
export const isAccountDeletionRequest = () => false;
export const trackAccountDeletion = () => globalThis.__learnerScopeTest.telemetry.push('deletion');
export const getAiFeatureForRequest = input => input === '/api/ask' ? 'chatbot' : null;
export const trackAiRequestOutcome = () => globalThis.__learnerScopeTest.telemetry.push('outcome');
export const reportAiRun = () => globalThis.__learnerScopeTest.telemetry.push('run');
export const supabase = { auth: {
  getSession: async () => ({ data: { session: { access_token: 'account-a-token' } } }),
  refreshSession: async () => { globalThis.__learnerScopeTest.refreshes++; return { data: { session: { access_token: 'wrong-token' } } }; },
  signOut: async () => {},
} };
`);
let runtimeCode = ts.transpileModule(authSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
runtimeCode = runtimeCode.replace(/(['"])@\/lib\/([^'"]+)\1/g, (_, quote, name) => JSON.stringify(
  name === 'apiRequestRecovery.mjs' ? pathToFileURL(`${process.cwd()}/src/lib/${name}`).href : stub,
));
const authRuntime = await import(moduleUrl(runtimeCode));

for (const [kind, status] of [['general', 200], ['general', 503], ['bound', 200]]) {
  test(`${kind} HTTP ${status} rejects an account switch during actual response-body consumption`, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.__learnerScopeTest = { scope: 'account-a', telemetry: [], refreshes: 0 };
    authRuntime.setAuthAccessToken('account-a-token');
    let finishBody;
    let startedReading;
    const reading = new Promise(resolve => { startedReading = resolve; });
    let authorization;
    globalThis.fetch = async (_input, init) => {
      authorization = new Headers(init.headers).get('Authorization');
      const response = new Response(new ReadableStream({ start(controller) { finishBody = () => { controller.enqueue(new TextEncoder().encode('{}')); controller.close(); }; } }), { status });
      const originalClone = response.clone.bind(response);
      response.clone = () => {
        const clone = originalClone();
        const method = kind === 'bound' ? 'arrayBuffer' : 'text';
        const read = clone[method].bind(clone);
        clone[method] = () => { startedReading(); return read(); };
        return clone;
      };
      return response;
    };
    try {
      const pending = kind === 'bound'
        ? authRuntime.authFetchWithAccessToken('/api/learner-state', 'account-a-token', { method: 'POST', body: '{}' })
        : authRuntime.authFetch('/api/ask', { method: 'POST', body: '{}' });
      const rejected = assert.rejects(pending, error => error.name === 'AccountScopeChangedError');
      await reading;
      globalThis.__learnerScopeTest.scope = 'account-b';
      finishBody();
      await rejected;
      assert.equal(authorization, 'Bearer account-a-token');
      assert.equal(globalThis.__learnerScopeTest.refreshes, 0);
      assert.deepEqual(globalThis.__learnerScopeTest.telemetry, [], 'old-account results must not become success or failure telemetry for the new account');
    } finally {
      globalThis.fetch = originalFetch;
      delete globalThis.__learnerScopeTest;
    }
  });
}

test('account switches are not mislabeled as network or deletion failures', () => {
  const block = authSource.match(/export async function authFetch\(input[\s\S]*?\n}\n/)?.[0] ?? '';

  assert.match(block, /const accountScopeChanged = error instanceof AccountScopeChangedError;/);
  assert.match(block, /if \(shouldTrackAiRequest && !accountScopeChanged\)/);
  assert.match(block, /if \(shouldTrackAccountDeletion && !accountScopeChanged\)/);
});
