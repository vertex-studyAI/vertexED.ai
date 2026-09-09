import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createRecoveryEventLatch } from '../src/lib/authReturn.mjs';

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const local = path => JSON.stringify(pathToFileURL(`${process.cwd()}/${path}`).href);
const source = fs.readFileSync('src/pages/AuthCallback.tsx', 'utf8');
const session = { user: { id: 'fixture-account', user_metadata: { onboardingCompleted: true } } };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
let harnessId = 0;

async function withCallback(options, verify) {
  const dom = new JSDOM('<div id="root"></div>', { url: `https://example.test/auth/callback${options.suffix ?? ''}` });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const timers = new Map();
  let nextTimer = 0;
  dom.window.setTimeout = fn => { timers.set(++nextTimer, fn); return nextTimer; };
  dom.window.clearTimeout = id => timers.delete(id);
  const calls = { destinations: [], subscribed: 0, unsubscribed: 0, sessions: 0, exchanges: 0, recovery: [] };
  let subscriber;
  const latch = createRecoveryEventLatch();
  if (options.earlyRecovery) latch.observe('PASSWORD_RECOVERY', session);
  const auth = {
    initialize: async () => options.initialization ?? { error: null },
    getSession: async () => { calls.sessions++; return options.result ?? { data: { session }, error: null }; },
    exchangeCodeForSession: async () => { calls.exchanges++; return options.exchange ?? { data: { session }, error: null }; },
    onAuthStateChange(fn) { calls.subscribed++; subscriber = fn; return { data: { subscription: { unsubscribe() { calls.unsubscribed++; } } } }; },
  };
  const navigate = (...args) => calls.destinations.push(args);
  globalThis.__vertexCallbackTest = { auth: options.disabled ? null : { auth }, navigate, latch, mark: id => calls.recovery.push(id) };
  if (options.blockStorage) Object.defineProperty(dom.window, 'sessionStorage', { get() { throw new Error('Storage blocked'); } });
  const mock = toModule(`export const supabase = globalThis.__vertexCallbackTest.auth;
    export const authRecoveryEvent = globalThis.__vertexCallbackTest.latch;
    export const useNavigate = () => globalThis.__vertexCallbackTest.navigate;
    export const markPasswordRecoveryVerified = globalThis.__vertexCallbackTest.mark;
    export const isOnboardingComplete = () => true;
    export const Helmet = ({children}) => children;
    // harness ${++harnessId}`);
  const placeholder = text => toModule(`import React from ${JSON.stringify(import.meta.resolve('react'))}; export default () => React.createElement('div', null, ${JSON.stringify(text)});`);
  let code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  for (const name of ['react', 'react/jsx-runtime']) code = code.replaceAll(`"${name}"`, JSON.stringify(import.meta.resolve(name)));
  for (const name of ['react-router', 'react-helmet-async', '@/lib/supabaseClient', '@/lib/passwordRecovery', '@/lib/onboardingStatus.js']) code = code.replaceAll(`"${name}"`, JSON.stringify(mock));
  code = code.replace('"@/lib/inviteAcceptance.mjs"', local('src/lib/inviteAcceptance.mjs'))
    .replace('"@/lib/authReturn.mjs"', local('src/lib/authReturn.mjs'))
    .replace('"@/pages/ResetPassword"', JSON.stringify(placeholder('Verified reset form')))
    .replace('"@/pages/SetInitialPassword"', JSON.stringify(placeholder('Verified invitation form')));
  const { default: Callback } = await import(toModule(code));
  const root = createRoot(dom.window.document.getElementById('root'));
  try {
    await act(async () => root.render(React.createElement(Callback)));
    await verify({ calls, dom, timers, emit: (event, value = session) => subscriber?.(event, value), text: () => dom.window.document.body.textContent });
  } finally {
    await act(async () => root.unmount());
    assert.equal(timers.size, 0, 'callback must clean up its deadline');
    dom.window.close();
    delete globalThis.window; delete globalThis.document;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT; delete globalThis.__vertexCallbackTest;
  }
}

test('callback scrubs credentials even when deployment configuration is missing', () => withCallback({ disabled: true, suffix: '#access_token=fixture&provider_token=fixture' }, ({ dom, text }) => {
  assert.equal(dom.window.location.hash, '');
  assert.match(text(), /missing its authentication configuration/);
}));

test('provider errors fail before a cached auth event can navigate and never reflect provider details', () => withCallback({ suffix: '?error_code=expired&error_description=private-fixture' }, ({ calls, text, dom }) => {
  assert.equal(calls.subscribed, 0);
  assert.deepEqual(calls.destinations, []);
  assert.match(text(), /Authentication could not be completed/);
  assert.doesNotMatch(text(), /private-fixture/);
  assert.equal(dom.window.location.search, '');
}));

test('SDK initialization errors are not replaced by a cached getSession result', () => withCallback({ initialization: { error: new Error('private fixture') } }, ({ calls, text }) => {
  assert.equal(calls.sessions, 0);
  assert.match(text(), /link could not be verified/);
  assert.deepEqual(calls.destinations, []);
}));

test('stalled initialization times out and a late successful auth event cannot navigate', async () => {
  const pending = deferred();
  await withCallback({ initialization: pending.promise }, async ({ calls, timers, emit, text }) => {
    assert.equal(timers.size, 1);
    await act(async () => { for (const timer of [...timers.values()]) timer(); });
    assert.match(text(), /Sign-in took too long/);
    await act(async () => { pending.resolve({ error: null }); emit('SIGNED_IN'); });
    assert.deepEqual(calls.destinations, []);
    assert.equal(calls.sessions, 0);
    assert.equal(calls.unsubscribed, 1);
  });
});

test('one-time code exchange is bounded and does not navigate after its deadline', async () => {
  const pending = deferred();
  await withCallback({ suffix: '?code=fixture', exchange: pending.promise }, async ({ timers, calls }) => {
    assert.equal(calls.exchanges, 1);
    await act(async () => { for (const timer of [...timers.values()]) timer(); pending.resolve({ data: { session }, error: null }); });
    assert.deepEqual(calls.destinations, []);
  });
});

test('blocked optional storage does not strand an authenticated learner', () => withCallback({ blockStorage: true }, ({ calls }) => {
  assert.deepEqual(calls.destinations, [['/main', { replace: true }]]);
}));

test('a recovery query plus ordinary session cannot authorize the reset form', () => withCallback({ suffix: '?recovery=1' }, async ({ calls, emit, text }) => {
  await act(async () => emit('INITIAL_SESSION'));
  assert.deepEqual(calls.recovery, []);
  assert.deepEqual(calls.destinations, []);
  assert.doesNotMatch(text(), /Verified reset form/);
}));

test('a genuine recovery event emitted before the lazy route mounts is retained', () => withCallback({ suffix: '?recovery=1', earlyRecovery: true }, ({ calls, text }) => {
  assert.deepEqual(calls.recovery, ['fixture-account']);
  assert.match(text(), /Verified reset form/);
  assert.deepEqual(calls.destinations, []);
}));

test('an invitation hint with no invitation provenance fails closed', () => withCallback({ suffix: '?invite=1' }, ({ calls, text }) => {
  assert.match(text(), /not established from a verified account invitation/);
  assert.deepEqual(calls.destinations, []);
}));
