import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
let harnessId = 0;
async function withProvider(verify) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let resolve, reject, subscriber, value;
  const initial = new Promise((yes, no) => { resolve = yes; reject = no; });
  const writes = [];
  globalThis.__vertexAuthTest = { writes, client: { auth: {
    getSession: () => initial,
    onAuthStateChange: callback => { subscriber = callback; return { data: { subscription: { unsubscribe() {} } } }; },
  }, from() { const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: null, error: null }) }; return query; } } };
  const mock = toModule(`export const supabase = globalThis.__vertexAuthTest.client;
    export const setAuthAccessToken = value => globalThis.__vertexAuthTest.writes.push(['token', value]);
    export const setUserContentStorageScope = value => globalThis.__vertexAuthTest.writes.push(['scope', value]);
    export const setPlannerStorageScope = () => {};
    export const trackLogout = () => {};
    export const buildMissingProfileInsert = () => ({});
    export const buildProfileUpdate = () => ({});
    export const initializeLearnerStateSync = async () => {};
    export const syncLocalStudyArtifacts = async () => {};
    // ${++harnessId}`);
  let code = ts.transpileModule(fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  for (const name of ['react', 'react/jsx-runtime']) code = code.replaceAll(`"${name}"`, JSON.stringify(import.meta.resolve(name)));
  code = code.replace(/(['"])@\/lib\/[^'"]+\1/g, JSON.stringify(mock));
  const { AuthProvider, useAuth } = await import(toModule(code));
  function Consumer() { value = useAuth(); return React.createElement('span', null, value.user?.id || 'signed-out'); }
  const root = createRoot(dom.window.document.getElementById('root'));
  try {
    await act(async () => root.render(React.createElement(AuthProvider, null, React.createElement(Consumer))));
    await verify({ resolve, reject, emit: (...args) => subscriber(...args), value: () => value, writes });
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT; delete globalThis.__vertexAuthTest;
  }
}

test('a delayed initial session cannot undo a newer signout or restore old storage ownership', () => withProvider(async ({ emit, resolve, value, writes }) => {
  await act(async () => emit('SIGNED_OUT', null));
  await act(async () => resolve({ data: { session: { user: { id: 'old-account' }, access_token: 'old-fixture' } }, error: null }));
  assert.equal(value().user, null);
  assert.equal(value().loading, false);
  assert.equal(writes.some(([kind, value]) => kind === 'scope' && value === 'old-account'), false);
  assert.equal(writes.some(([kind, value]) => kind === 'token' && value === 'old-fixture'), false);
}));

test('rejected session restoration is handled and clears auth ownership/loading', () => withProvider(async ({ reject, value, writes }) => {
  await act(async () => reject(new Error('Storage unavailable')));
  assert.equal(value().isAuthenticated, false);
  assert.equal(value().loading, false);
  assert.deepEqual(writes.slice(-2), [['scope', null], ['token', null]]);
}));
