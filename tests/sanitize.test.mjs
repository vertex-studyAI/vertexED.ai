import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const MARKDOWN_ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a'];
const SAFE_CONFIG = {
  ALLOWED_TAGS: MARKDOWN_ALLOWED_TAGS,
  ALLOWED_ATTR: ['href', 'title', 'class'],
  ALLOW_DATA_ATTR: false,
  IN_PLACE: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

function sanitizeMarkdown(input) {
  return purify.sanitize(input, SAFE_CONFIG);
}

test('sanitizeMarkdown strips script tags', () => {
  const dirty = '<p>Hello</p><script>alert("xss")</script>';
  const clean = sanitizeMarkdown(dirty);
  assert.equal(clean.includes('<script'), false);
  assert.match(clean, /Hello/);
});

test('sanitizeMarkdown strips event handlers', () => {
  const dirty = '<p onclick="alert(1)">Click me</p>';
  const clean = sanitizeMarkdown(dirty);
  assert.equal(clean.includes('onclick'), false);
  assert.match(clean, /Click me/);
});

test('sanitizeMarkdown blocks javascript URLs', () => {
  const dirty = '<a href="javascript:alert(1)">Click</a>';
  const clean = sanitizeMarkdown(dirty);
  assert.equal(clean.includes('javascript:'), false);
});

test('sanitizeMarkdown allows safe links', () => {
  const dirty = '<a href="https://example.com" title="Example">Link</a>';
  const clean = sanitizeMarkdown(dirty);
  assert.match(clean, /href="https:\/\/example.com"/);
});

test('sanitizeMarkdown remains detached string sanitation', () => {
  const dirtyRoot = window.document.createElement('div');
  dirtyRoot.innerHTML = '<footer><img src="x" onerror="window.__vertexedXss = 1"></footer><p>safe</p>';

  const clean = sanitizeMarkdown(dirtyRoot.innerHTML);

  assert.equal(typeof clean, 'string');
  assert.equal(clean.includes('onerror'), false);
  assert.equal(clean.includes('<img'), false);
  assert.match(clean, /safe/);
  assert.match(dirtyRoot.innerHTML, /onerror=/, 'sanitizer must not mutate caller-owned dirty DOM in place');
});

test('application sanitizer explicitly forbids the DOMPurify IN_PLACE advisory configuration', () => {
  const source = readFileSync(new URL('../src/lib/sanitize.ts', import.meta.url), 'utf8');

  assert.match(source, /IN_PLACE:\s*false/);
  assert.match(source, /RETURN_DOM:\s*false/);
  assert.match(source, /RETURN_DOM_FRAGMENT:\s*false/);
  assert.doesNotMatch(source, /\.addHook\s*\(/);
  assert.doesNotMatch(source, /IN_PLACE:\s*true/);
});
