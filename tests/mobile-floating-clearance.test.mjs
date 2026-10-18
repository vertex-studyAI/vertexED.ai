import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const navigationCss = readFileSync(new URL('../src/styles/navigation.css', import.meta.url), 'utf8');
const mobileDockBlock = navigationCss.match(/@media\(max-width:700px\)\{([\s\S]*?)\n\}/)?.[1] ?? '';

test('authenticated mobile launchers clear the fixed learning navigation', () => {
  assert.match(
    mobileDockBlock,
    /body:has\(\.learning-bottom-nav\) :is\(\.feedback-launcher,\.vee-launcher:not\(\[style\]\):not\(\.vee-docked\)\)\{bottom:max\(76px,calc\(env\(safe-area-inset-bottom\) \+ 68px\)\)\}/,
  );
});

test('the clearance is limited to the mobile navigation breakpoint', () => {
  assert.equal(
    navigationCss.match(/body:has\(\.learning-bottom-nav\) :is\(\.feedback-launcher,\.vee-launcher:not\(\[style\]\):not\(\.vee-docked\)\)/g)?.length,
    1,
  );
  assert.match(mobileDockBlock, /\.learning-bottom-nav\{display:grid/);
});

test('the repair keeps both launchers available', () => {
  const clearanceRule = mobileDockBlock.match(/body:has\(\.learning-bottom-nav\)[^}]+}/)?.[0] ?? '';
  assert.doesNotMatch(clearanceRule, /display\s*:\s*none|visibility\s*:\s*hidden/);
  assert.match(clearanceRule, /\.feedback-launcher/);
  assert.match(clearanceRule, /\.vee-launcher:not\(\[style\]\):not\(\.vee-docked\)/);
});

test('the actual clearance selector moves floating launchers without offsetting docked or user-positioned Apex', () => {
  const selector = mobileDockBlock.match(/(body:has\(\.learning-bottom-nav\)[^{]+)\{/)[1];
  const dom = new JSDOM('<body><nav class="learning-bottom-nav"></nav><button id="feedback" class="feedback-launcher"></button><button id="floating" class="vee-launcher"></button><button id="docked" class="vee-launcher vee-docked"></button><button id="moved" class="vee-launcher" style="left: 20px; top: 100px"></button></body>');
  try {
    assert.deepEqual([...dom.window.document.querySelectorAll(selector)].map(element => element.id), ['feedback', 'floating']);
    dom.window.document.querySelector('nav').remove();
    assert.equal(dom.window.document.querySelectorAll(selector).length, 0, 'no bottom-nav clearance without bottom navigation');
  } finally { dom.window.close(); }
});
