import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { safeMarkdownHref } from '../src/lib/markdownHref.mjs';

test('safeMarkdownHref allows https, mailto, hashes, and same-origin paths', () => {
  assert.equal(safeMarkdownHref('https://example.com/docs'), 'https://example.com/docs');
  assert.equal(safeMarkdownHref('mailto:student@example.com'), 'mailto:student@example.com');
  assert.equal(safeMarkdownHref('#section'), '#section');
  assert.equal(safeMarkdownHref('/planner'), '/planner');
});

test('safeMarkdownHref rejects javascript, data, http, and protocol-relative URLs', () => {
  assert.equal(safeMarkdownHref('javascript:alert(1)'), undefined);
  assert.equal(safeMarkdownHref('JAVASCRIPT:alert(1)'), undefined);
  assert.equal(safeMarkdownHref('data:text/html,<script>alert(1)</script>'), undefined);
  assert.equal(safeMarkdownHref('vbscript:msgbox(1)'), undefined);
  assert.equal(safeMarkdownHref('http://example.com'), undefined);
  assert.equal(safeMarkdownHref('//evil.example/path'), undefined);
  assert.equal(safeMarkdownHref(''), undefined);
  assert.equal(safeMarkdownHref(null), undefined);
});

test('ChatMarkdown, RichMarkdown, NotetakerQuiz, and AnswerReviewer wire MarkdownLink', () => {
  const chat = readFileSync(new URL('../src/components/chat/ChatMarkdown.tsx', import.meta.url), 'utf8');
  const rich = readFileSync(new URL('../src/components/RichMarkdown.tsx', import.meta.url), 'utf8');
  const notes = readFileSync(new URL('../src/pages/NotetakerQuiz.tsx', import.meta.url), 'utf8');
  const review = readFileSync(new URL('../src/pages/AnswerReviewer.tsx', import.meta.url), 'utf8');

  for (const [name, source] of [
    ['ChatMarkdown', chat],
    ['RichMarkdown', rich],
    ['NotetakerQuiz', notes],
    ['AnswerReviewer', review],
  ]) {
    assert.match(source, /MarkdownLink/, `${name} must import MarkdownLink`);
    assert.match(source, /\ba:\s*MarkdownLink\b/, `${name} must render links through MarkdownLink`);
  }
});

test('sanitize config restricts URI schemes beyond default DOMPurify allowlist assumptions', () => {
  const source = readFileSync(new URL('../src/lib/sanitize.ts', import.meta.url), 'utf8');
  assert.match(source, /ALLOWED_URI_REGEXP/);
  assert.match(source, /safeMarkdownHref/);
});
