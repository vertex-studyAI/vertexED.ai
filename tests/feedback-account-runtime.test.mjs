import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import ts from 'typescript';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};
let revision = 0;

async function withFeedback(verify) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/study-planner' });
  const descriptors = Object.fromEntries(['window', 'document', 'HTMLElement', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const runtime = { user: { id: 'account-a' }, inserts: [], toasts: [], analytics: [], insert: async () => ({ error: null }) };
  globalThis.__feedbackRuntime = runtime;
  const dependencies = moduleUrl(`
    export const useAuth = () => ({ user: globalThis.__feedbackRuntime.user });
    export const toast = value => globalThis.__feedbackRuntime.toasts.push(value);
    export const trackProductEvent = (...args) => globalThis.__feedbackRuntime.analytics.push(args);
    export const supabase = { from(table) { return { insert(value) {
      globalThis.__feedbackRuntime.inserts.push({ table, value });
      return globalThis.__feedbackRuntime.insert(value);
    } }; } };
    // fixture ${++revision}
  `);
  const compile = (file, replacements = {}) => {
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
    }).outputText.replace(/from ['"]([^'"]+)['"]/g, (_match, name) => {
      const url = replacements[name] || (name.startsWith('@/')
        ? pathToFileURL(`${process.cwd()}/src/${name.slice(2)}`).href : import.meta.resolve(name));
      return `from ${JSON.stringify(url)}`;
    });
    return moduleUrl(code);
  };
  const modal = compile('src/components/AccessibleModal.tsx');
  const { default: Feedback } = await import(compile('src/components/FeedbackLauncher.tsx', {
    '@/contexts/AuthContext': dependencies,
    '@/hooks/use-toast': dependencies,
    '@/lib/supabaseClient': dependencies,
    '@/lib/productAnalytics.mjs': dependencies,
    '@/components/AccessibleModal': modal,
  }));
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(dom.window.document.getElementById('root'));
  const render = async user => {
    runtime.user = user;
    setUserContentStorageScope(user?.id ?? null);
    await act(async () => root.render(React.createElement(Feedback)));
  };
  const findButton = label => [...dom.window.document.querySelectorAll('button')]
    .find(button => button.getAttribute('aria-label') === label || button.textContent.trim() === label);
  const click = async label => {
    const button = findButton(label);
    assert.ok(button, `button exists: ${label}`);
    await act(async () => button.click());
  };
  const fill = async value => {
    const field = dom.window.document.querySelector('textarea');
    assert.ok(field);
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, 'value').set;
    await act(async () => {
      setter.call(field, value);
      field.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
  };
  try {
    await render(runtime.user);
    await verify({ runtime, dom, render, click, fill, findButton,
      field: () => dom.window.document.querySelector('textarea'),
      dialog: () => dom.window.document.querySelector('[role="dialog"]') });
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
    delete globalThis.__feedbackRuntime;
    setUserContentStorageScope(null);
  }
}

test('a refreshed auth object for the same account retains the open feedback draft', () => withFeedback(async ({ render, click, fill, field, dialog }) => {
  await click('Give VertexED feedback');
  await fill('A draft still being written');
  await click('4');
  await render({ id: 'account-a', refreshed: true });
  assert.ok(dialog());
  assert.equal(field().value, 'A draft still being written');
}));

test('switching directly between accounts discards the old draft and resets all form controls', () => withFeedback(async ({ dom, render, click, fill, field, dialog }) => {
  await click('Give VertexED feedback');
  await fill('Private note from account A');
  await click('4');
  await act(async () => {
    const select = dom.window.document.querySelector('select');
    select.value = 'bug';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });
  await render({ id: 'account-b' });
  assert.ok(!dialog(), 'account A dialog must not remain visible to B');
  await click('Give VertexED feedback');
  assert.equal(field().value, '');
  assert.equal(dom.window.document.querySelector('select').value, 'idea');
  assert.ok(!dom.window.document.querySelector('[aria-pressed="true"]'));
  await fill('New note belonging to B');
  await render({ id: 'account-a' });
  await click('Give VertexED feedback');
  assert.equal(field().value, '');
}));

test('a late success from the previous account cannot close the new draft or announce success', () => withFeedback(async ({ runtime, render, click, fill, field, dialog }) => {
  const pending = deferred();
  runtime.insert = () => pending.promise;
  await click('Give VertexED feedback');
  await fill('Account A submission');
  await click('Send feedback');
  assert.equal(runtime.inserts.length, 1);
  assert.equal(runtime.inserts[0].value.user_id, 'account-a');
  await render({ id: 'account-b' });
  await click('Give VertexED feedback');
  await fill('Unsent account B draft');
  await act(async () => pending.resolve({ error: null }));
  assert.ok(dialog());
  assert.equal(field().value, 'Unsent account B draft');
  assert.deepEqual(runtime.toasts, []);
  assert.deepEqual(runtime.analytics, []);
}));

test('a late failure after sign-out cannot show feedback from the departed account', () => withFeedback(async ({ runtime, render, click, fill, dialog }) => {
  const pending = deferred();
  runtime.insert = () => pending.promise;
  await click('Give VertexED feedback');
  await fill('Account A submission');
  await click('Send feedback');
  await render(null);
  assert.ok(!dialog(), 'the feedback dialog is closed');
  await act(async () => pending.resolve({ error: new Error('Synthetic write failure') }));
  assert.deepEqual(runtime.toasts, []);
  assert.deepEqual(runtime.analytics, []);
}));

test('same-account failure preserves the draft and a successful retry stores and clears it', () => withFeedback(async ({ runtime, click, fill, field, dialog }) => {
  runtime.insert = async () => ({ error: new Error('Synthetic write failure') });
  await click('Give VertexED feedback');
  await fill('Please retain this draft');
  await click('Send feedback');
  assert.ok(dialog());
  assert.equal(field().value, 'Please retain this draft');
  assert.equal(runtime.toasts[0].title, 'Feedback was not saved');
  runtime.insert = async () => ({ error: null });
  await click('Send feedback');
  assert.ok(!dialog(), 'the feedback dialog is closed');
  assert.equal(runtime.inserts.length, 2);
  assert.equal(runtime.inserts[1].value.user_id, 'account-a');
  assert.equal(runtime.inserts[1].value.feedback, 'Please retain this draft');
  assert.equal(runtime.analytics.length, 1);
  await click('Give VertexED feedback');
  assert.equal(field().value, '');
}));

test('an auth-scope transition blocks submission before React renders the replacement account', () => withFeedback(async ({ runtime, click, fill }) => {
  await click('Give VertexED feedback');
  await fill('Private note from A');
  // AuthProvider changes the sensitive scope synchronously before setUser renders.
  setUserContentStorageScope('account-b');
  await click('Send feedback');
  assert.deepEqual(runtime.inserts, []);
  assert.deepEqual(runtime.toasts, []);
}));

test('an auth-scope transition silences completion before React unmounts the old form', () => withFeedback(async ({ runtime, click, fill }) => {
  const pending = deferred();
  runtime.insert = () => pending.promise;
  await click('Give VertexED feedback');
  await fill('Account A submission');
  await click('Send feedback');
  setUserContentStorageScope('account-b');
  await act(async () => pending.resolve({ error: null }));
  assert.deepEqual(runtime.toasts, []);
  assert.deepEqual(runtime.analytics, []);
}));
