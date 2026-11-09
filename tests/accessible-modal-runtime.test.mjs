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

async function withScheduledModal(verify) {
  const dom = new JSDOM('<button id="opener">Open dialog</button><button id="other">Another action</button><div id="root"></div>');
  const { document } = dom.window;
  const previous = { window: globalThis.window, document: globalThis.document,
    HTMLElement: globalThis.HTMLElement, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
  // Reflect inert as real browsers do, so nested ownership is observable in
  // both the property and the selectors used by the production focus helper.
  Object.defineProperty(dom.window.HTMLElement.prototype, 'inert', {
    configurable: true,
    get() { return this.hasAttribute('inert'); },
    set(value) { this.toggleAttribute('inert', Boolean(value)); },
  });
  const frames = new Map();
  let nextFrame = 0;
  dom.window.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame; };
  dom.window.cancelAnimationFrame = id => frames.delete(id);
  const flushFrames = () => act(async () => {
    const current = [...frames.values()];
    frames.clear();
    for (const callback of current) callback(0);
  });
  const require = createRequire(import.meta.url);
  let source = ts.transpileModule(fs.readFileSync('src/components/AccessibleModal.tsx', 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  source = source.replace(/from ['"]([^'"]+)['"]/g, (_, name) => `from '${name === '@/lib/modalFocus.mjs'
    ? new URL('../src/lib/modalFocus.mjs', import.meta.url).href
    : pathToFileURL(require.resolve(name)).href}'`);
  const Modal = (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement);
  const opener = document.getElementById('opener');
  const titleRef = React.createRef();
  const render = node => act(async () => root.render(node));
  const basicModal = key => React.createElement(Modal, { key, titleId: `${key}-title`, initialFocusRef: titleRef, onClose() {} },
    React.createElement('h1', { id: `${key}-title`, ref: titleRef, tabIndex: -1 }, 'Dialog'));
  const deferFirstReturn = async () => {
    opener.focus();
    await render(basicModal('first'));
    assert.equal(document.activeElement?.id, 'first-title');
    let attempts = 0;
    const focus = opener.focus.bind(opener);
    opener.focus = () => { if (++attempts > 1) focus(); };
    await render(null);
    assert.equal(attempts, 1, 'the immediate focus attempt was ignored');
    assert.equal(document.activeElement?.tagName, 'BODY');
    assert.equal(frames.size, 1, 'exactly one frame recheck is pending');
    return () => attempts;
  };
  try {
    await verify({ dom, document, Modal, rootElement, opener, render, basicModal, frames, flushFrames, deferFirstReturn });
  } finally {
    await act(async () => root.unmount());
    await flushFrames();
    assert.equal(frames.size, 0, 'no restoration frame survives cleanup');
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.HTMLElement = previous.HTMLElement;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
    dom.window.close();
  }
}

test('a rendered modal retries an ignored focus return once on the next frame', () => withScheduledModal(async ({ document, frames, flushFrames, deferFirstReturn }) => {
  const attempts = await deferFirstReturn();
  await flushFrames();
  assert.equal(document.activeElement?.id, 'opener');
  assert.equal(attempts(), 2);
  assert.equal(frames.size, 0);
  await flushFrames();
  assert.equal(attempts(), 2, 'restoration does not poll');
}));

test('a pending frame does not take focus from another live target', () => withScheduledModal(async ({ document, flushFrames, deferFirstReturn }) => {
  const attempts = await deferFirstReturn();
  const other = document.getElementById('other');
  other.focus();
  await flushFrames();
  assert.equal(document.activeElement?.id, 'other');
  assert.equal(attempts(), 1);
}));

test('a component can choose the fallback after immediate restoration without the next frame undoing it', () => withScheduledModal(async ({ document, Modal, opener, render, frames, flushFrames }) => {
  const other = document.getElementById('other');
  const title = React.createRef();
  opener.focus();
  await render(React.createElement(Modal, {
    titleId: 'choice-title', initialFocusRef: title,
    fallbackFocusRef: { current: other }, onClose() {},
  }, React.createElement('h1', { id: 'choice-title', ref: title, tabIndex: -1 }, 'Dialog')));
  await render(null);
  assert.equal(document.activeElement?.id, 'opener');
  assert.equal(frames.size, 1);
  other.focus();
  await flushFrames();
  assert.equal(document.activeElement?.id, 'other', 'the later focus choice wins even when it is the registered fallback');
}));

for (const type of ['pointerdown', 'keydown']) {
  test(`a ${type} action cancels pending modal restoration even without a new focus target`, () => withScheduledModal(async ({ dom, document, frames, flushFrames, deferFirstReturn }) => {
    const attempts = await deferFirstReturn();
    document.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
    assert.equal(frames.size, 0);
    await flushFrames();
    assert.equal(document.activeElement?.tagName, 'BODY');
    assert.equal(attempts(), 1);
  }));
}

test('a new modal owns focus and cancels the previous modal’s pending return', () => withScheduledModal(async ({ document, render, basicModal, frames, flushFrames, deferFirstReturn }) => {
  const attempts = await deferFirstReturn();
  await render(basicModal('second'));
  assert.equal(document.activeElement?.id, 'second-title');
  assert.equal(frames.size, 0);
  await flushFrames();
  assert.equal(document.activeElement?.id, 'second-title');
  assert.equal(attempts(), 1);
}));

test('simultaneous nested modal teardown releases the background and restores the outside opener', () => withScheduledModal(async ({ document, Modal, rootElement, opener, render, flushFrames }) => {
  const outerTitle = React.createRef();
  const innerTitle = React.createRef();
  const innerOpener = React.createRef();
  const outsideOpener = { current: opener };
  const tree = inner => React.createElement(Modal, {
    titleId: 'outer-title', initialFocusRef: outerTitle, openerRef: outsideOpener, onClose() {},
  }, React.createElement('h1', { id: 'outer-title', ref: outerTitle, tabIndex: -1 }, 'Outer dialog'),
  React.createElement('button', { id: 'inner-opener', ref: innerOpener }, 'Open inner dialog'),
  inner && React.createElement(Modal, {
    titleId: 'inner-title', initialFocusRef: innerTitle, openerRef: innerOpener, onClose() {},
  }, React.createElement('h2', { id: 'inner-title', ref: innerTitle, tabIndex: -1 }, 'Inner dialog')));
  opener.focus();
  await render(tree(false));
  innerOpener.current.focus();
  await render(tree(true));
  assert.equal(document.activeElement?.id, 'inner-title');
  assert.equal(document.querySelectorAll('[role="dialog"]').length, 2);
  assert.equal(rootElement.inert, true);
  await render(null);
  await flushFrames();
  assert.equal(document.querySelectorAll('[role="dialog"]').length, 0);
  for (const element of [rootElement, opener, document.getElementById('other')]) {
    assert.equal(element.inert, false, `${element.id} is interactive again`);
    assert.equal(element.getAttribute('aria-hidden'), null, `${element.id} is exposed again`);
  }
  assert.equal(document.activeElement?.id, 'opener');
}));
