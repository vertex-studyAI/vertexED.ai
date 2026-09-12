import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { setUserContentStorageScope, userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

// Transpile the actual hook for Node; only module locations are adapted.
const reactUrl = import.meta.resolve('react');
const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const compile = path => ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText.replaceAll('"react"', JSON.stringify(reactUrl));
const toastUrl = toModule(compile('src/hooks/use-toast.ts'));
const hookCode = compile('src/hooks/useLocalStorage.ts')
  .replace('"./use-toast"', JSON.stringify(toastUrl))
  .replace('"@/lib/userContentStorageScope.mjs"', JSON.stringify(pathToFileURL(`${process.cwd()}/src/lib/userContentStorageScope.mjs`).href));
const { useLocalStorage } = await import(toModule(hookCode));

test('actual storage hook retains imported cards, responds to other tabs, and rejects old-account callbacks', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test' });
  const { window } = dom;
  const { document, StorageEvent } = window;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.StorageEvent = dom.window.StorageEvent;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  setUserContentStorageScope('first');
  const key = userContentStorageKeys().srDeck;
  window.localStorage.setItem(key, JSON.stringify([{ id: 'first' }]));
  let value, update;
  function Harness() { [value, update] = useLocalStorage('vertex_sr_deck', []); return React.createElement('span', null, value.length); }
  const root = createRoot(document.getElementById('root'));
  try {
    await act(async () => root.render(React.createElement(Harness)));
    const originalCallback = update;
    await act(async () => {
      window.localStorage.setItem(key, JSON.stringify([{ id: 'first' }, { id: 'imported' }]));
      update(previous => previous.map(card => card.id === 'first' ? { ...card, repetitions: 1 } : card));
    });
    assert.deepEqual(value, [{ id: 'first', repetitions: 1 }, { id: 'imported' }]);
    await act(async () => {
      window.localStorage.setItem(key, JSON.stringify([{ id: 'other-tab' }]));
      window.dispatchEvent(new StorageEvent('storage', { key }));
    });
    assert.deepEqual(value, [{ id: 'other-tab' }]);
    setUserContentStorageScope('second');
    await act(async () => originalCallback([{ id: 'stale' }]));
    assert.equal(window.localStorage.getItem(userContentStorageKeys().srDeck), null);
    await act(async () => root.render(React.createElement(Harness)));
    assert.deepEqual(value, []);
    assert.deepEqual(JSON.parse(window.localStorage.getItem(key)), [{ id: 'other-tab' }]);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    setUserContentStorageScope(null);
    delete globalThis.window; delete globalThis.document;
    delete globalThis.StorageEvent; delete globalThis.CustomEvent;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});

test('failed writes preserve unsaved in-memory edits until persistence recovers', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test' });
  const { window } = dom;
  const { document, StorageEvent } = window;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.StorageEvent = dom.window.StorageEvent;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  setUserContentStorageScope('first');
  const key = userContentStorageKeys().srDeck;
  window.localStorage.setItem(key, JSON.stringify([{ id: 'first' }]));
  let value, update;
  function Harness() { [value, update] = useLocalStorage('vertex_sr_deck', []); return React.createElement('span', null, value.length); }
  const root = createRoot(document.getElementById('root'));
  const originalSetItem = window.Storage.prototype.setItem;
  try {
    await act(async () => root.render(React.createElement(Harness)));
    window.Storage.prototype.setItem = function (storageKey, storageValue) {
      if (storageKey === key) throw new Error('simulated quota failure');
      return originalSetItem.call(this, storageKey, storageValue);
    };

    await act(async () => update(previous => previous.map(card => ({ ...card, repetitions: 1 }))));
    assert.deepEqual(value, [{ id: 'first', repetitions: 1 }]);

    await act(async () => update(previous => [...previous, { id: 'second' }]));
    assert.deepEqual(value, [{ id: 'first', repetitions: 1 }, { id: 'second' }]);

    // Another tab/storage event must not silently replace recoverable unsaved state.
    originalSetItem.call(window.localStorage, key, JSON.stringify([{ id: 'external' }]));
    await act(async () => window.dispatchEvent(new StorageEvent('storage', { key })));
    assert.deepEqual(value, [{ id: 'first', repetitions: 1 }, { id: 'second' }]);

    // Once storage recovers, the next update persists the whole unsaved chain.
    window.Storage.prototype.setItem = originalSetItem;
    await act(async () => update(previous => [...previous, { id: 'third' }]));
    const expected = [{ id: 'first', repetitions: 1 }, { id: 'second' }, { id: 'third' }];
    assert.deepEqual(value, expected);
    assert.deepEqual(JSON.parse(window.localStorage.getItem(key)), expected);
  } finally {
    window.Storage.prototype.setItem = originalSetItem;
    await act(async () => root.unmount());
    dom.window.close();
    setUserContentStorageScope(null);
    delete globalThis.window; delete globalThis.document;
    delete globalThis.StorageEvent; delete globalThis.CustomEvent;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
