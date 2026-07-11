import { test } from 'node:test';
import assert from 'node:assert/strict';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const MARKDOWN_ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a'];

function sanitizeMarkdown(input) {
  return purify.sanitize(input, {
    ALLOWED_TAGS: MARKDOWN_ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
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
