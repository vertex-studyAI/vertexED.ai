import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

// Exercise the actual route effect, with only its animation-frame clock held.
// This makes the route-commit-to-focus interval deterministic without changing
// the browser journey's strict focus assertions or adding timing sleeps.
const text = fs.readFileSync('src/components/layout/SiteLayout.tsx', 'utf8');
const source = ts.createSourceFile('SiteLayout.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let effect;
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(source) === 'useEffect'
    && node.arguments[0]?.getText(source).includes('previousFocusPath.current')) {
    effect = node.arguments[0];
  }
  ts.forEachChild(node, visit);
}
visit(source);
assert.ok(effect, 'the real pathname-focus effect must be present');
const install = new Function('window', 'document', 'location', 'previousFocusPath', `return (${effect.getText(source)})();`);

function withRoute(verify) {
  const dom = new JSDOM('<a id="origin" href="/ap/calculus-ab">Course</a><button id="theme">Theme</button><input id="answer"><main id="main-content" tabindex="-1"></main>');
  const { window } = dom;
  const { document } = window;
  const frames = new Map();
  let nextFrame = 0;
  window.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame; };
  window.cancelAnimationFrame = id => { frames.delete(id); };
  const previous = { current: '/ap' };
  const origin = document.getElementById('origin');
  const main = document.getElementById('main-content');
  origin.focus();
  let cleanup;
  const route = (pathname = '/ap/calculus-ab', hash = '') => {
    cleanup?.();
    cleanup = install(window, document, { pathname, hash }, previous);
  };
  const flush = () => {
    const queued = [...frames.values()];
    frames.clear();
    for (const callback of queued) callback(16);
  };
  try {
    verify({ document, origin, main, route, flush, pending: () => frames.size, cleanup: () => cleanup?.() });
  } finally {
    cleanup?.();
    window.close();
  }
}

test('ordinary pathname navigation still moves focus from its initiating link to main', () => withRoute(({ document, origin, main, route, flush }) => {
  route();
  assert.equal(document.activeElement, origin);
  flush();
  assert.equal(document.activeElement, main);
}));

for (const id of ['theme', 'answer']) {
  test(`a newer ${id} focus owns the interval before the queued route announcement`, () => withRoute(({ document, route, flush }) => {
    route();
    const target = document.getElementById(id);
    target.focus();
    flush();
    assert.equal(document.activeElement, target, 'route focus must not steal the newer control focus');
  }));
}

test('removing the initiating route link still permits the normal main announcement', () => withRoute(({ document, origin, main, route, flush }) => {
  route();
  origin.remove();
  assert.equal(document.activeElement, document.body);
  flush();
  assert.equal(document.activeElement, main);
}));

test('an explicit focus choice back to the origin still supersedes the queued announcement', () => withRoute(({ document, origin, route, flush }) => {
  route();
  document.getElementById('theme').focus();
  origin.focus();
  flush();
  assert.equal(document.activeElement, origin);
}));

test('route effect cleanup cancels its pending focus move', () => withRoute(({ document, route, flush, pending, cleanup }) => {
  route();
  assert.equal(pending(), 1);
  cleanup();
  const target = document.getElementById('theme');
  target.focus();
  flush();
  assert.equal(pending(), 0);
  assert.equal(document.activeElement, target);
}));

test('initial/query-only and hash navigation retain their existing focus behavior', () => withRoute(({ document, origin, route, flush, pending }) => {
  route('/ap');
  assert.equal(pending(), 0);
  route('/ap/calculus-ab', '#course-details');
  assert.equal(pending(), 0);
  flush();
  assert.equal(document.activeElement, origin);
}));
