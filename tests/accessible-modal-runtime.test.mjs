import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ts from 'typescript';

async function verifyModalFocus(removeOpener) {
  const dom = new JSDOM('<button id="opener">Take timed exam</button><button id="fallback">New Task</button><div id="root"></div>');
  const { document } = dom.window;
  const previous = { window: globalThis.window, document: globalThis.document,
    HTMLElement: globalThis.HTMLElement, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  const require = createRequire(import.meta.url);
  let source = ts.transpileModule(fs.readFileSync('src/components/AccessibleModal.tsx', 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  source = source.replace(/from ['"]([^'"]+)['"]/g, (_, name) => `from '${name === '@/lib/modalFocus.mjs'
    ? new URL('../src/lib/modalFocus.mjs', import.meta.url).href
    : pathToFileURL(require.resolve(name)).href}'`);
  const AccessibleModal = (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement);
  const opener = document.getElementById('opener');
  const titleRef = React.createRef();
  try {
    opener.focus();
    await act(async () => root.render(React.createElement(AccessibleModal, {
      titleId: 'exam-title', initialFocusRef: titleRef,
      fallbackFocusRef: { current: document.getElementById('fallback') },
      onClose: () => root.render(null),
    }, React.createElement('h1', { id: 'exam-title', ref: titleRef, tabIndex: -1 }, 'Practice exam'),
    React.createElement('button', { id: 'first' }, 'Exit exam'),
    React.createElement('textarea', { id: 'answer', 'aria-label': 'Answer' }),
    React.createElement('button', { id: 'last' }, 'Submit exam'))));

    assert.equal(document.activeElement?.id, 'exam-title');
    assert.equal(rootElement.inert, true);
    assert.equal(rootElement.getAttribute('aria-hidden'), 'true');
    const press = (key, shiftKey = false) => act(async () => {
      document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));
    });
    await press('Tab');
    assert.equal(document.activeElement?.id, 'first');
    await press('Tab', true);
    assert.equal(document.activeElement?.id, 'last');
    if (removeOpener) opener.remove();
    await press('Escape');
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.activeElement?.id, removeOpener ? 'fallback' : 'opener');
    assert.equal(rootElement.hasAttribute('aria-hidden'), false);
    assert.equal(Boolean(rootElement.inert), false);
  } finally {
    await act(async () => root.unmount());
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.HTMLElement = previous.HTMLElement;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
    dom.window.close();
  }
}

test('the rendered modal focuses its requested title, traps Tab and prefers its connected opener', () => verifyModalFocus(false));
test('the rendered modal returns to its fallback when the invoking control is removed', () => verifyModalFocus(true));
