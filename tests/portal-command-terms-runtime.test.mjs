import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React, { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { JSDOM } from 'jsdom';
import { filterPublishedModule } from '../scripts/content-publication-modules.mjs';

const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const localUrl = path => pathToFileURL(`${process.cwd()}/${path}`).href;
function compile(source, imports = {}) {
  let code = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  for (const [name, url] of Object.entries({
    react: import.meta.resolve('react'), 'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    'react-router': import.meta.resolve('react-router'), 'lucide-react': import.meta.resolve('lucide-react'), ...imports,
  })) code = code.replaceAll(`'${name}'`, JSON.stringify(url)).replaceAll(`"${name}"`, JSON.stringify(url));
  return moduleUrl(code);
}

// Exercise the same held module transform used by the production build, not a
// hand-written empty-bank mock. Other mocks isolate account/widget plumbing.
const catalogueFile = 'src/content/apCatalogue.ts';
const catalogue = compile(await filterPublishedModule(await readFile(catalogueFile, 'utf8'), catalogueFile, { approvals: [], allowedStatic: new Set() }));
const curriculum = compile(await readFile('src/lib/curriculum.ts', 'utf8'), {
  '../content/apCatalogue.ts': catalogue, './examTargets.mjs': localUrl('src/lib/examTargets.mjs'),
});
const termsFile = 'src/lib/commandTerms.ts';
const publishedTerms = compile(await filterPublishedModule(await readFile(termsFile, 'utf8'), termsFile, { approvals: [] }), { '@/lib/curriculum': curriculum });
const { EXAM_BOARDS } = await import(curriculum);
const { COMMAND_TERM_DEFINITIONS, getCommandTermsForBoard } = await import(publishedTerms);
const fixture = moduleUrl(`
  import React from ${JSON.stringify(import.meta.resolve('react'))};
  export const useAuth = () => ({ user: { id: 'fixture-owner' } });
  export const getConfidenceRatings = subjects => subjects.map(subject => ({ subject, rating: globalThis.__commandTermConfidence.get(subject) ?? null }));
  export const setConfidenceRating = (subject, rating) => globalThis.__commandTermConfidence.set(subject, rating);
  export const toast = () => {};
  export const storeApexPrefill = () => true;
  export default function Widget({ children, id }) { return React.createElement('section', { id }, children); }
`);
const { default: PortalEngagementRow } = await import(compile(await readFile('src/components/portal/PortalEngagementRow.tsx', 'utf8'), {
  '@/lib/commandTerms': publishedTerms, '@/lib/portalFeatures': fixture, '@/contexts/AuthContext': fixture,
  '@/components/chat/ApexAvatar': moduleUrl('export default function Avatar() { return null; }'),
  '@/lib/apexPrefillStorage.mjs': fixture, '@/hooks/use-toast': fixture, '@/components/portal/PortalWidget': fixture,
}));
const element = (board, subjects = ['Mathematics']) => React.createElement(MemoryRouter, null,
  React.createElement(PortalEngagementRow, { profile: { curriculum: { board, subjects } } }));

test('dashboard engagement renders for every board when the real publication transform holds all command definitions', () => {
  globalThis.__commandTermConfidence = new Map([['Mathematics', 3]]);
  try {
    assert.deepEqual(COMMAND_TERM_DEFINITIONS, {});
    for (const board of [null, ...EXAM_BOARDS]) {
      assert.deepEqual(getCommandTermsForBoard(board), []);
      const html = renderToStaticMarkup(element(board));
      assert.match(html, /Command term definitions are awaiting subject review/);
      assert.match(html, /Quick Capture/);
      assert.match(html, /Confidence check-in/);
      assert.match(html, /Question for Apex/);
      assert.doesNotMatch(html, /Next term|Show meaning|Review a board command word/);
    }
    assert.deepEqual([...globalThis.__commandTermConfidence], [['Mathematics', 3]], 'rendering a hold does not change saved confidence');
  } finally { delete globalThis.__commandTermConfidence; }
});

test('held command drill keeps confidence controls and an empty-profile settings link usable', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/main' });
  const document = dom.window.document;
  globalThis.window = dom.window; globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.__commandTermConfidence = new Map();
  const root = createRoot(document.getElementById('root'));
  try {
    await act(async () => root.render(element('IB_MYP')));
    const choose = document.querySelector('[aria-label="Mathematics confidence 4 of 5 - Confident"]');
    await act(async () => choose.click());
    assert.equal(choose.getAttribute('aria-checked'), 'true');
    assert.equal(globalThis.__commandTermConfidence.get('Mathematics'), 4);
    assert.equal(document.querySelector('#command-drill button'), null);
    assert.match(document.querySelector('#command-drill').textContent, /awaiting subject review/);
    await act(async () => root.render(element(null, [])));
    assert.equal(document.querySelector('#confidence-checkin a').getAttribute('href'), '/user-settings');
    assert.equal(document.querySelector('#command-drill button'), null);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    delete globalThis.__commandTermConfidence;
  }
});
