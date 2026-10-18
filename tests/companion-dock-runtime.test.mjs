import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ts from 'typescript';
import { observeFooterVisibility, moveCompanionHost } from '../src/lib/companionDock.mjs';

test('the footer observer follows real visibility, ignores unrelated entries and disconnects', () => {
  const footer = { getBoundingClientRect: () => ({ top: 950, bottom: 1100, height: 150 }) };
  const changes = [];
  let callback, observed, disconnected = false;
  const view = { innerHeight: 900, IntersectionObserver: class {
    constructor(handle, options) { callback = handle; assert.deepEqual(options, { threshold: 0 }); }
    observe(target) { observed = target; }
    disconnect() { disconnected = true; }
  } };
  const dispose = observeFooterVisibility(footer, value => changes.push(value), view);
  assert.equal(observed, footer);
  assert.deepEqual(changes, [false]);
  callback([{ target: {}, isIntersecting: true, intersectionRect: { height: 50 } }]);
  callback([{ target: footer, isIntersecting: true, intersectionRect: { height: 0 } }]);
  assert.deepEqual(changes, [false, true], 'edge contact must dock before the footer can be covered');
  callback([{ target: footer, isIntersecting: true, intersectionRect: { height: 1 } }]);
  callback([{ target: footer, isIntersecting: true, intersectionRect: { height: 120 } }]);
  callback([{ target: footer, isIntersecting: false, intersectionRect: { height: 0 } }]);
  assert.deepEqual(changes, [false, true, false]);
  dispose();
  callback([{ target: footer, isIntersecting: true, intersectionRect: { height: 100 } }]);
  assert.equal(disconnected, true);
  assert.deepEqual(changes, [false, true, false]);
});

test('without IntersectionObserver, scroll and resize still protect the footer and listeners clean up', () => {
  const dom = new JSDOM('<footer></footer>');
  const footer = dom.window.document.querySelector('footer');
  let top = 1000;
  footer.getBoundingClientRect = () => ({ top, bottom: top + 100, height: 100 });
  const changes = [];
  const dispose = observeFooterVisibility(footer, value => changes.push(value), dom.window);
  top = 600; dom.window.dispatchEvent(new dom.window.Event('scroll'));
  top = -200; dom.window.dispatchEvent(new dom.window.Event('resize'));
  dispose(); top = 100; dom.window.dispatchEvent(new dom.window.Event('scroll'));
  assert.deepEqual(changes, [false, true, false]);
  dom.window.close();
});

test('moving the host preserves a focused launcher without stealing focus from another control', () => {
  const dom = new JSDOM('<button id="other">Other</button><span id="host"><button>Apex</button></span><footer></footer>');
  const { document } = dom.window;
  const host = document.querySelector('#host'), launcher = host.firstChild, footer = document.querySelector('footer');
  launcher.focus();
  moveCompanionHost(host, footer);
  assert.equal(document.activeElement, launcher);
  assert.equal(host.firstChild, launcher);
  document.querySelector('#other').focus();
  moveCompanionHost(host, document.body);
  assert.equal(document.activeElement.id, 'other');
  assert.equal(host.firstChild, launcher);
  dom.window.close();
});

test('actual Apex portal preserves node, focus and saved floating position across docking', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/study-notebook' });
  const { document } = dom.window;
  const previous = { window: globalThis.window, document: globalThis.document, HTMLElement: globalThis.HTMLElement,
    act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const updates = [];
  globalThis.__companionDockFixture = {
    settings: { studyCompanion: true, simpleMode: false, reducedMotion: true, apexAppearance: 'workbook', apexPosition: { x: .2, y: .4 } },
    update: value => updates.push(value),
  };
  const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  const require = createRequire(import.meta.url);
  const stub = moduleUrl(`export const useAppPreferences = () => globalThis.__companionDockFixture;
    export const Link = () => null; export const ArrowUpRight = () => null; export const X = () => null;
    export const APEX_APPEARANCES = []; export const getApexAppearance = () => ({src:'/fixture.png'});
    export default function Stub() { return null; }`);
  let source = ts.transpileModule(fs.readFileSync('src/components/ApexCompanion.tsx', 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  source = source.replace(/import ['"]@\/styles\/vee\.css['"];?/, '');
  source = source.replace(/from ['"]([^'"]+)['"]/g, (match, name) => {
    if (name === '@/lib/companionDock.mjs') return `from '${new URL('../src/lib/companionDock.mjs', import.meta.url).href}'`;
    return `from '${['react','react-dom','react/jsx-runtime'].includes(name) ? pathToFileURL(require.resolve(name)).href : stub}'`;
  });
  const Component = (await import(moduleUrl(source))).default;
  const root = createRoot(document.querySelector('#root'));
  try {
    const render = docked => act(async () => { root.render(React.createElement('footer', null, React.createElement(Component, { docked, suspended: false }))); });
    await render(false);
    const launcher = document.querySelector('#vee-launcher');
    const host = launcher.parentNode;
    const originalPosition = launcher.getAttribute('style');
    assert.equal(host.parentNode, document.body);
    assert.match(originalPosition, /left:/);
    launcher.focus();
    await render(true);
    assert.equal(document.querySelector('#vee-launcher'), launcher);
    assert.equal(document.activeElement, launcher);
    assert.equal(host.parentNode.className, 'vee-dock-slot');
    assert.equal(launcher.style.cssText, '');
    assert.equal(launcher.classList.contains('vee-docked'), true);
    await render(false);
    assert.equal(document.activeElement, launcher);
    assert.equal(launcher.parentNode, host);
    assert.equal(host.parentNode, document.body);
    assert.equal(launcher.getAttribute('style'), originalPosition);
    assert.deepEqual(updates, [], 'docking must not overwrite the saved drag position');
    await act(async () => root.unmount());
    assert.equal(host.isConnected, false);
  } finally {
    if (document.querySelector('#root')?.childNodes.length) await act(async () => root.unmount());
    delete globalThis.__companionDockFixture;
    globalThis.window = previous.window; globalThis.document = previous.document; globalThis.HTMLElement = previous.HTMLElement;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
    dom.window.close();
  }
});
