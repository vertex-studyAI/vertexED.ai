import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectCopy, lintSource } from '../scripts/lint-copy.mjs';

test('copy rules detect punctuation, phrases, placeholders and unsupported-looking claims', () => {
  for (const text of ['text\u2014text', 'text &mdash; text', 'text &#x2014; text', 'Unlock your potential', 'Lorem ipsum', 'Jane Doe', '10,000 happy students', '99.9% success', 'Where study meets magic']) {
    assert.ok(inspectCopy(text).length, text);
  }
  assert.deepEqual(inspectCopy('Review your answer against your course notes.'), []);
});
test('copy scan reads JSX and strings, ignores comments, and detects repeated generic headings', () => {
  const findings = lintSource('// unlock\nconst x = <><h2>Get started</h2><h2>Get started</h2><p>Unleash more</p></>');
  assert.equal(findings.length, 2);
  assert.ok(findings.some((item) => item.rule === 'repeated-generic-heading'));
});
