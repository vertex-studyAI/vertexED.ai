import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

let code = ts.transpileModule(fs.readFileSync('src/components/AccessibleModal.tsx', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
for (const name of ['react', 'react/jsx-runtime', 'react-dom']) {
  code = code.replaceAll(`"${name}"`, JSON.stringify(import.meta.resolve(name)));
}
code = code.replace('"@/lib/modalFocus.mjs"', JSON.stringify(pathToFileURL(`${process.cwd()}/src/lib/modalFocus.mjs`).href));
const { default: Modal } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

async function withModal(verify) {
  const dom = new JSDOM('<button id="opener">Open</button><div id="root"></div>', { pretendToBeVisual: true });
  const previous = Object.fromEntries(['window', 'document', 'HTMLElement', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(dom.window.document.getElementById('root'));
  const openerRef = { current: dom.window.document.getElementById('opener') };
  const innerOpenerRef = { current: null };
  const closed = { outer: 0, inner: 0 };
  let setCloseVersion;
  let closeVersion = 0;
  function Example() {
    const [outerOpen, setOuterOpen] = React.useState(true);
    const [innerOpen, setInnerOpen] = React.useState(false);
    const [version, setVersion] = React.useState(0);
    setCloseVersion = setVersion;
    return outerOpen && React.createElement(Modal, {
      titleId: 'outer-title', openerRef,
      onClose: () => { closed.outer += 1; closeVersion = version; setOuterOpen(false); },
    },
    React.createElement('h2', { id: 'outer-title' }, 'Outer'),
    React.createElement('button', { id: 'first' }, 'First'),
    React.createElement('button', { id: 'open-inner', ref: innerOpenerRef, onClick: () => setInnerOpen(true) }, 'Nested dialog'),
    React.createElement('button', { id: 'last' }, 'Last'),
    innerOpen && React.createElement(Modal, {
      titleId: 'inner-title', openerRef: innerOpenerRef,
      onClose: () => { closed.inner += 1; setInnerOpen(false); },
    }, React.createElement('h2', { id: 'inner-title' }, 'Inner'), React.createElement('button', { id: 'inner-button' }, 'Inner action')));
  }
  let mounted = true;
  const unmount = async () => { if (mounted) { await act(async () => root.unmount()); mounted = false; } };
  const press = async (key, options = {}) => {
    const { target = dom.window.document.activeElement, prevented = false, ...init } = options;
    const event = new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    if (prevented) event.preventDefault();
    await act(async () => target.dispatchEvent(event));
    return event;
  };
  const loseFocus = () => { dom.window.document.activeElement.blur(); assert.equal(dom.window.document.activeElement, dom.window.document.body); };
  try {
    openerRef.current.focus();
    await act(async () => root.render(React.createElement(Example)));
    await verify({ document: dom.window.document, closed, opener: openerRef.current, press, loseFocus, unmount,
      setCloseVersion: async version => act(async () => setCloseVersion(version)), getCloseVersion: () => closeVersion });
  } finally {
    await unmount();
    dom.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

test('Escape still closes the real modal after a control loses focus to the document body', () => withModal(async ({ document, closed, opener, press, loseFocus }) => {
  loseFocus();
  const event = await press('Escape');
  assert.equal(closed.outer, 1);
  assert.equal(event.defaultPrevented, true);
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(document.activeElement, opener);
}));

test('a normal Escape inside the dialog invokes close exactly once', () => withModal(async ({ closed, press }) => {
  await press('Escape');
  assert.equal(closed.outer, 1);
}));

test('Tab and Shift+Tab recover the modal sequence when focus falls to body', () => withModal(async ({ document, press, loseFocus }) => {
  loseFocus();
  assert.equal((await press('Tab')).defaultPrevented, true);
  assert.equal(document.activeElement.id, 'first');
  loseFocus();
  assert.equal((await press('Tab', { shiftKey: true })).defaultPrevented, true);
  assert.equal(document.activeElement.id, 'last');
}));

test('a body-level Escape closes only the active nested modal, then its parent on the next press', () => withModal(async ({ document, closed, press, loseFocus }) => {
  await act(async () => document.getElementById('open-inner').click());
  assert.equal(document.querySelectorAll('[role="dialog"]').length, 2);
  loseFocus();
  await press('Escape');
  assert.deepEqual(closed, { outer: 0, inner: 1 });
  assert.equal(document.querySelectorAll('[role="dialog"]').length, 1);
  assert.equal(document.activeElement.id, 'open-inner');
  loseFocus();
  await press('Escape');
  assert.deepEqual(closed, { outer: 1, inner: 1 });
}));

test('the document fallback respects consumed keys and does not intercept another control', () => withModal(async ({ document, closed, press, loseFocus }) => {
  loseFocus();
  await press('Escape', { prevented: true });
  await press('Tab', { prevented: true });
  assert.equal(document.activeElement, document.body);
  await press('Enter');
  await press('Escape', { target: document.getElementById('opener') });
  assert.equal(closed.outer, 0);
  assert.equal(document.querySelectorAll('[role="dialog"]').length, 1);
}));

test('an inactive modal does not react to body-level keys', () => withModal(async ({ document, closed, press, loseFocus }) => {
  const overlay = document.querySelector('[role="dialog"]').parentElement;
  overlay.setAttribute('aria-hidden', 'true');
  loseFocus();
  await press('Escape');
  assert.equal(closed.outer, 0);
  overlay.removeAttribute('aria-hidden');
  overlay.setAttribute('inert', '');
  await press('Escape');
  assert.equal((await press('Tab')).defaultPrevented, false);
  assert.equal(closed.outer, 0);
}));

test('document fallback uses the current close callback and stops responding after unmount', () => withModal(async ({ document, closed, press, loseFocus, unmount, setCloseVersion, getCloseVersion }) => {
  await setCloseVersion(2);
  loseFocus();
  await press('Escape');
  assert.equal(getCloseVersion(), 2);
  assert.equal(closed.outer, 1);
  await unmount();
  assert.equal((await press('Escape', { target: document.body })).defaultPrevented, false);
  assert.equal(closed.outer, 1);
}));
