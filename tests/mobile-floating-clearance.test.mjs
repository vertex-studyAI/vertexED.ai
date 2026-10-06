import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const navigationCss = readFileSync(new URL('../src/styles/navigation.css', import.meta.url), 'utf8');
const mobileDockBlock = navigationCss.match(/@media\(max-width:700px\)\{([\s\S]*?)\n\}/)?.[1] ?? '';

test('authenticated mobile launchers clear the fixed learning navigation', () => {
  assert.match(
    mobileDockBlock,
    /body:has\(\.learning-bottom-nav\) :is\(\.feedback-launcher,\.vee-launcher:not\(\[style\]\)\)\{bottom:max\(76px,calc\(env\(safe-area-inset-bottom\) \+ 68px\)\)\}/,
  );
});

test('the clearance is limited to the mobile navigation breakpoint', () => {
  assert.equal(
    navigationCss.match(/body:has\(\.learning-bottom-nav\) :is\(\.feedback-launcher,\.vee-launcher:not\(\[style\]\)\)/g)?.length,
    1,
  );
  assert.match(mobileDockBlock, /\.learning-bottom-nav\{display:grid/);
});

test('the repair keeps both launchers available', () => {
  const clearanceRule = mobileDockBlock.match(/body:has\(\.learning-bottom-nav\)[^}]+}/)?.[0] ?? '';
  assert.doesNotMatch(clearanceRule, /display\s*:\s*none|visibility\s*:\s*hidden/);
  assert.match(clearanceRule, /\.feedback-launcher/);
  assert.match(clearanceRule, /\.vee-launcher:not\(\[style\]\)/);
});
