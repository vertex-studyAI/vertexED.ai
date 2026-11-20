import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';

let harnessId = 0;
async function withConsent(verify) {
  const previous = {
    window: Object.getOwnPropertyDescriptor(globalThis, 'window'),
    localStorage: Object.getOwnPropertyDescriptor(globalThis, 'localStorage'),
  };
  const storage = new Map();
  const timers = new Map();
  let nextTimer = 0;
  const window = new EventTarget();
  window.setTimeout = callback => { const id = ++nextTimer; timers.set(id, callback); return id; };
  window.clearTimeout = id => timers.delete(id);
  Object.defineProperty(globalThis, 'window', { configurable: true, value: window });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  } });
  setUserContentStorageScope('consent-test-account');
  const source = fs.readFileSync(new URL('../src/lib/aiConsent.ts', import.meta.url), 'utf8');
  let code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  code = code.replace(/(['"])@\/lib\/userContentStorageScope\.mjs\1/, JSON.stringify(new URL('../src/lib/userContentStorageScope.mjs', import.meta.url).href));
  code += `\n// isolated consent harness ${++harnessId}`;
  const consent = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  try { await verify({ ...consent, window, timers }); }
  finally {
    setUserContentStorageScope(undefined);
    for (const [name, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

test('abort during synchronous consent dispatch overrides an allowed answer', () => withConsent(async ({ requestAiConsent, AI_CONSENT_EVENT, window }) => {
  const controller = new AbortController();
  window.addEventListener(AI_CONSENT_EVENT, event => {
    controller.abort();
    event.detail.resolve(true);
  });
  assert.equal(await requestAiConsent(controller.signal), false);
}));

test('cancellation after subscribing wins over later approval', () => withConsent(async ({ requestAiConsent, AI_CONSENT_EVENT, window }) => {
  const controller = new AbortController();
  let request;
  window.addEventListener(AI_CONSENT_EVENT, event => { request = event.detail; });
  const result = requestAiConsent(controller.signal);
  controller.abort();
  request.resolve(true);
  assert.equal(await result, false);
}));

test('one cancelled waiter does not reject another request sharing the dialog', () => withConsent(async ({ requestAiConsent, AI_CONSENT_EVENT, window }) => {
  const controller = new AbortController();
  let request; let dialogs = 0;
  window.addEventListener(AI_CONSENT_EVENT, event => { request = event.detail; dialogs++; });
  const cancelled = requestAiConsent(controller.signal);
  const active = requestAiConsent();
  controller.abort();
  request.resolve(true);
  assert.equal(await cancelled, false);
  assert.equal(await active, true);
  assert.equal(dialogs, 1);
}));

test('explicit approval still resolves an active request', () => withConsent(async ({ requestAiConsent, AI_CONSENT_EVENT, window, timers }) => {
  window.addEventListener(AI_CONSENT_EVENT, event => event.detail.resolve(true));
  assert.equal(await requestAiConsent(), true);
  assert.equal(timers.size, 0);
}));

test('already aborted requests cannot reuse stored approval', () => withConsent(async ({ requestAiConsent, setAiConsent }) => {
  setAiConsent(true);
  const controller = new AbortController();
  controller.abort();
  assert.equal(await requestAiConsent(controller.signal), false);
}));

test('approval from an earlier account remains rejected', () => withConsent(async ({ requestAiConsent, AI_CONSENT_EVENT, window }) => {
  window.addEventListener(AI_CONSENT_EVENT, event => {
    setUserContentStorageScope('different-account');
    event.detail.resolve(true);
  });
  assert.equal(await requestAiConsent(), false);
}));
