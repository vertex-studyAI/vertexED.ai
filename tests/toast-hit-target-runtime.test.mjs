import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ts from 'typescript';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

test('actual toast viewport passes empty-area pointers through while active actions and close stay interactive', async () => {
  const source = fs.readFileSync('src/components/ui/toast.tsx', 'utf8');
  const styles = await postcss([tailwindcss({ content: [{ raw: source, extension: 'tsx' }], corePlugins: ['pointerEvents'] })])
    .process('@tailwind utilities;', { from: undefined });
  const dom = new JSDOM('<div id="root"></div><button id="underlying">Footer action</button>', { url: 'https://example.test', pretendToBeVisual: true });
  const globals = ['window','document','HTMLElement','Node','NodeFilter','CustomEvent','Event','MutationObserver','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','IS_REACT_ACT_ENVIRONMENT'];
  const previous = new Map(globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const name of globals.filter(name => name !== 'IS_REACT_ACT_ENVIRONMENT')) {
    const value = name === 'window' ? dom.window : dom.window[name];
    Object.defineProperty(globalThis, name, { configurable: true, writable: true,
      value: ['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(name) ? value.bind(dom.window) : value });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { document } = dom.window;
  const style = document.createElement('style'); style.textContent = styles.css; document.head.append(style);
  const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  let utilities = ts.transpileModule(fs.readFileSync('src/lib/utils.ts','utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText.replace(/from ["']([^"']+)["']/g, (_, name) => `from '${import.meta.resolve(name)}'`);
  utilities = moduleUrl(utilities);
  const code = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText.replace(/from ["']([^"']+)["']/g, (_, name) => `from '${name === '@/lib/utils' ? utilities : import.meta.resolve(name)}'`);
  const { ToastProvider, ToastViewport, Toast, ToastTitle, ToastAction, ToastClose } = await import(moduleUrl(code));
  const root = createRoot(document.querySelector('#root'));
  let actions = 0, closures = 0;
  const render = key => act(async () => root.render(React.createElement(ToastProvider, null,
    key && React.createElement(Toast, { key, defaultOpen: true, duration: Infinity, onOpenChange: open => { if (!open) closures += 1; } },
      React.createElement(ToastTitle, null, 'Saved locally'),
      React.createElement(ToastAction, { altText: 'Retry saving', onClick: () => { actions += 1; } }, 'Retry'),
      React.createElement(ToastClose, { 'aria-label': 'Close notification' })),
    React.createElement(ToastViewport))));
  try {
    await render(null);
    const viewport = document.querySelector('ol');
    assert.equal(dom.window.getComputedStyle(viewport).pointerEvents, 'none');
    assert.equal(viewport.querySelector('li'), null);
    assert.notEqual(dom.window.getComputedStyle(document.querySelector('#underlying')).pointerEvents, 'none');
    await render('action');
    const notification = viewport.querySelector('li');
    assert.ok(notification, 'a real Radix toast is rendered inside the viewport');
    assert.equal(dom.window.getComputedStyle(notification).pointerEvents, 'auto');
    const retry = [...notification.querySelectorAll('button')].find(button => button.textContent === 'Retry');
    assert.equal(dom.window.getComputedStyle(retry).pointerEvents, 'auto');
    await act(async () => retry.click());
    assert.equal(actions, 1);
    assert.equal(closures, 1);
    await render('close');
    const close = viewport.querySelector('[aria-label="Close notification"]');
    assert.equal(dom.window.getComputedStyle(close).pointerEvents, 'auto');
    await act(async () => close.click());
    assert.equal(closures, 2);
    assert.equal(dom.window.getComputedStyle(viewport).pointerEvents, 'none');
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
