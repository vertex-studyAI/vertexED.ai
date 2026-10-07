import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { localDayKey } from '../src/lib/studyDates.mjs';
import { setUserContentStorageScope, userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const localModule = path => pathToFileURL(`${process.cwd()}/${path}`).href;
const reactUrl = import.meta.resolve('react');
const emptyComponent = toModule('export default function UnrelatedPanel() { return null; }');
const surface = toModule(`import React from ${JSON.stringify(reactUrl)};
  export default function Surface({ as = 'div', variant, ...props }) {
    return React.createElement(as, props);
  }`);
const chrome = toModule(`import React from ${JSON.stringify(reactUrl)};
  export function Link({ to, ...props }) { return React.createElement('a', { ...props, href: to }); }
  export function Helmet() { return null; }
  export function ArrowRight() { return null; }
  export const Library = ArrowRight, PenLine = ArrowRight, CheckCircle2 = ArrowRight,
    Circle = ArrowRight, ListChecks = ArrowRight;
  export const cn = (...values) => values.filter(Boolean).join(' ');`);
const fixtures = toModule(`
  const fixture = () => globalThis.__vertexTodayPlanFixture;
  export const useAuth = () => ({ user: fixture().user });
  export const buildEcosystemBrief = () => fixture().brief;
  export const getLocalArtifactCount = () => 0;
  export const listStudyArtifactsDetailed = async () => ({ ok: true, items: [] });
  export const syncLocalStudyArtifacts = async () => ({ synced: 0, remaining: 0 });
  export const getPendingMockReview = () => fixture().pendingMock;
  export const getDueRetries = () => [];
  export const getRetryQueue = () => [];
  export const retryTargetRoute = retry => retry.href;
  export const getWeaknessHeatmap = () => [];
  export const getPendingLearnerStateCount = () => 0;
  export const hydrateLearnerState = async () => {};
  export const syncLearnerState = async () => ({ synced: 0, remaining: 0 });`);

// Execute the real dashboard, plan panel and storage implementation. Only
// unrelated panels/services and module locations are substituted; no provider,
// account API, browser authentication or network request is involved.
function compile(path, replacements) {
  const source = fs.readFileSync(path, 'utf8').replace(/^import ['"][^'"]+\.css['"];\s*$/gm, '');
  let code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  code = code.replace(/from (['"])([^'"]+)\1/g, (statement, quote, name) => {
    const target = replacements[name] ?? (name.startsWith('.') || name.startsWith('@/') ? null : import.meta.resolve(name));
    assert.ok(target, `Unmapped runtime import ${name} in ${path}`);
    return `from ${JSON.stringify(target)}`;
  });
  return toModule(code);
}

const todayPlanUrl = compile('src/lib/todayPlan.ts', {
  '@/lib/studyDates.mjs': localModule('src/lib/studyDates.mjs'),
  '@/lib/userContentStorageScope.mjs': localModule('src/lib/userContentStorageScope.mjs'),
  '@/lib/todayPlanCore.mjs': localModule('src/lib/todayPlanCore.mjs'),
});
const panelUrl = compile('src/components/dashboard/TodayPlanPanel.tsx', {
  'react-router': chrome,
  'lucide-react': chrome,
  '@/lib/todayPlan': todayPlanUrl,
  '@/components/LiquidGlass': surface,
  '@/lib/utils': chrome,
});
const mainUrl = compile('src/pages/Main.tsx', {
  'react-router': chrome,
  'react-helmet-async': chrome,
  'lucide-react': chrome,
  '@/components/ContinueSessionBanner': emptyComponent,
  '@/components/LiquidGlass': surface,
  '@/components/SavedWorkList': emptyComponent,
  '@/components/dashboard/StudyToolbox': emptyComponent,
  '@/components/dashboard/LearningToday': emptyComponent,
  '@/components/dashboard/TodayPlanPanel': panelUrl,
  '@/components/dashboard/LearningCommandCenter': emptyComponent,
  '@/contexts/AuthContext': fixtures,
  '@/lib/studyEcosystem': fixtures,
  '@/lib/todayPlan': todayPlanUrl,
  '@/lib/dashboardNextAction.mjs': localModule('src/lib/dashboardNextAction.mjs'),
  '@/lib/userContent': fixtures,
  '@/lib/examFlow': fixtures,
  '@/lib/retryQueue': fixtures,
  '@/lib/weaknessTracker': fixtures,
  '@/lib/learnerStateSync': fixtures,
});
const { default: Main } = await import(mainUrl);

async function withDashboard(verify, initialDone = []) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.__vertexTodayPlanFixture = {
    user: { id: 'learner-a', email: 'fixture@example.test' },
    brief: {
      todayTasks: [{ id: 'first', name: 'First task' }],
      adaptivePlan: { recommendations: [{ id: 'second', title: 'Second task', to: '/practice', priority: 'medium' }] },
    },
    pendingMock: { status: 'in_progress' },
  };
  setUserContentStorageScope('learner-a');
  const key = userContentStorageKeys().todayPlanDone;
  dom.window.localStorage.setItem(key, JSON.stringify({ [localDayKey()]: initialDone }));
  const root = createRoot(dom.window.document.getElementById('root'));
  const primary = () => dom.window.document.querySelector('.learning-actions a');
  const toggle = async (label, complete = true) => {
    const button = [...dom.window.document.querySelectorAll('button')]
      .find(item => item.getAttribute('aria-label') === `Mark "${label}" ${complete ? 'complete' : 'incomplete'}`);
    assert.ok(button, `Plan toggle exists for ${label}`);
    await act(async () => button.click());
  };
  try {
    await act(async () => root.render(React.createElement(Main)));
    await verify({ dom, key, root, primary, toggle });
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    setUserContentStorageScope(null);
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    delete globalThis.__vertexTodayPlanFixture;
  }
}

test('completing and reopening plan items updates the real dashboard next action', () => withDashboard(async ({ primary, toggle, dom }) => {
  assert.equal(primary().getAttribute('href'), '/planner');
  await toggle('First task');
  assert.match(dom.window.document.body.textContent, /1\/2 done/);
  assert.equal(primary().getAttribute('href'), '/practice');
  await toggle('Second task');
  assert.match(dom.window.document.body.textContent, /2\/2 done/);
  assert.equal(primary().getAttribute('href'), '/paper-maker?resumeMock=1');
  assert.equal(primary().textContent, 'Resume your mock');
  await toggle('First task', false);
  assert.equal(primary().getAttribute('href'), '/planner');
}));

test('saved completion is respected on mount and refreshed when the window regains focus', () => withDashboard(async ({ primary, key, dom }) => {
  assert.equal(primary().getAttribute('href'), '/practice');
  dom.window.localStorage.setItem(key, JSON.stringify({ [localDayKey()]: ['planner:first', 'adaptive:second'] }));
  await act(async () => dom.window.dispatchEvent(new dom.window.Event('focus')));
  assert.match(dom.window.document.body.textContent, /2\/2 done/);
  assert.equal(primary().getAttribute('href'), '/paper-maker?resumeMock=1');
}, ['planner:first']));

test('failed completion writes leave both the checklist and the next action unchanged', () => withDashboard(async ({ primary, toggle, dom, key }) => {
  const originalSetItem = dom.window.Storage.prototype.setItem;
  dom.window.Storage.prototype.setItem = function (storageKey, value) {
    if (storageKey === key) throw new Error('simulated quota failure');
    return originalSetItem.call(this, storageKey, value);
  };
  try {
    await toggle('First task');
    assert.match(dom.window.document.body.textContent, /0\/2 done/);
    assert.equal(primary().getAttribute('href'), '/planner');
    assert.deepEqual(JSON.parse(dom.window.localStorage.getItem(key))[localDayKey()], []);
  } finally {
    dom.window.Storage.prototype.setItem = originalSetItem;
  }
}));

test('switching learners uses the next account completion state', () => withDashboard(async ({ primary, root, dom, key }) => {
  assert.equal(primary().getAttribute('href'), '/practice');
  setUserContentStorageScope('learner-b');
  globalThis.__vertexTodayPlanFixture.user = { id: 'learner-b', email: 'second@example.test' };
  await act(async () => root.render(React.createElement(Main)));
  assert.equal(primary().getAttribute('href'), '/planner');
  assert.match(dom.window.document.body.textContent, /0\/2 done/);
  assert.deepEqual(JSON.parse(dom.window.localStorage.getItem(key))[localDayKey()], ['planner:first']);
}, ['planner:first']));
