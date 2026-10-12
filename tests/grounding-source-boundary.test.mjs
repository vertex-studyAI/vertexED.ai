import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAskMessages } from '../api/_lib/askPrompt.js';
import {
  formatSourcesForPrompt,
  validateSourceCitations,
  validateStructuredSourceIds,
} from '../api/_lib/grounding.js';

const fallbackSource = [{ title: 'Class notes', content: 'Cells divide.' }];

for (const id of ['!!!', '', ' ', 'source 1', 'SOURCE-1']) {
  test(`inline citations cannot alias an emitted source ID: ${JSON.stringify(id)}`, () => {
    assert.equal(validateSourceCitations(`Claim [Source: ${id}]`, fallbackSource).status, 'invalid');
  });

  test(`structured citations cannot alias an emitted source ID: ${JSON.stringify(id)}`, () => {
    assert.equal(validateStructuredSourceIds([id], fallbackSource).status, 'invalid');
  });
}

test('a malformed citation cannot hide beside a valid reference', () => {
  const result = validateSourceCitations('Claim [Source: source-1]. Other claim [Source: ].', fallbackSource);
  assert.equal(result.status, 'invalid');
  assert.deepEqual(result.citations.map(({ id }) => id), ['source-1']);
});

test('structured citations reject invalid values beside a valid reference', () => {
  for (const invalidId of [null, 1, false, {}]) {
    assert.equal(validateStructuredSourceIds(['source-1', invalidId], fallbackSource).status, 'invalid');
  }
});

test('Apex cannot certify a source omitted from the actual prompt', () => {
  const sources = [
    { id: 'included', title: 'Long notes', content: 'a'.repeat(80_000) },
    { id: 'omitted', title: 'Separate notes', content: 'Only this source describes cell division.' },
  ];
  const messages = buildAskMessages({ question: 'Explain cell division.', sources });
  assert.match(messages[0].content, /SOURCE \[included\]/);
  assert.doesNotMatch(messages[0].content, /SOURCE \[omitted\]/);
  const rejected = validateSourceCitations('Cells divide [Source: omitted].', sources);
  assert.equal(rejected.status, 'invalid');
  assert.deepEqual(rejected.sources.map(({ id }) => id), ['included']);
  assert.equal(validateSourceCitations('Supplied passage [Source: included].', sources).status, 'verified');
});

test('notebook quizzes and flashcards cannot cite a source omitted by the prompt budget', () => {
  const sources = [
    { id: 'included', content: 'a'.repeat(80_000) },
    { id: 'omitted', content: 'Unseen passage.' },
  ];
  assert.doesNotMatch(formatSourcesForPrompt(sources), /SOURCE \[omitted\]/);
  const rejected = validateStructuredSourceIds(['omitted'], sources);
  assert.equal(rejected.status, 'invalid');
  assert.deepEqual(rejected.invalidCitations, ['omitted']);
  assert.equal(validateStructuredSourceIds(['included'], sources).status, 'verified');
});

test('study-guide citations respect the smaller 48,000-character prompt budget', () => {
  const sources = [
    { id: 'guide-1', content: 'a'.repeat(48_000) },
    { id: 'guide-2', content: 'Unseen guide passage.' },
  ];
  assert.doesNotMatch(formatSourcesForPrompt(sources, 48_000), /SOURCE \[guide-2\]/);
  assert.equal(validateSourceCitations('Claim [Source: guide-2].', sources, 48_000).status, 'invalid');
  assert.equal(validateSourceCitations('Claim [Source: guide-1].', sources, 48_000).status, 'verified');
});

test('source headers, separators and truncation markers all fit the prompt budget', () => {
  for (const maxChars of [300, 480, 48_000, 80_000]) {
    const prompt = formatSourcesForPrompt([
      { id: 'short', title: 'Short', content: 'First passage.' },
      { id: 'long', title: 'Long', content: 'x'.repeat(100_000) },
    ], maxChars);
    assert.ok(prompt.length <= maxChars, `Prompt used ${prompt.length} characters with a ${maxChars} limit`);
  }
});

test('citation previews contain only text the model received', () => {
  const sources = [{ id: 'notes', content: 'a'.repeat(230) + 'UNSEEN-PRIVATE-TAIL'.repeat(10) }];
  const prompt = formatSourcesForPrompt(sources, 270);
  assert.doesNotMatch(prompt, /UNSEEN-PRIVATE-TAIL/);
  const result = validateSourceCitations('Claim [Source: notes]', sources, 270);
  assert.equal(result.status, 'verified');
  assert.doesNotMatch(result.citations[0].excerpt, /UNSEEN-PRIVATE-TAIL/);
  assert.ok(prompt.includes(result.citations[0].excerpt));
  assert.deepEqual(result.citations, result.sources);
});

test('canonical deduplicated IDs still resolve to their original passages', () => {
  const sources = [
    { id: 'Class Notes', content: 'Alpha' },
    { id: 'Class Notes', content: 'Beta' },
    { content: 'Gamma' },
  ];
  const prompt = formatSourcesForPrompt(sources);
  for (const [id, excerpt] of [['class-notes', 'Alpha'], ['class-notes-2', 'Beta'], ['source-3', 'Gamma']]) {
    assert.ok(prompt.includes(`SOURCE [${id}]`));
    const result = validateSourceCitations(`Claim [Source: ${id}]`, sources);
    assert.equal(result.status, 'verified');
    assert.equal(result.citations[0].excerpt, excerpt);
    assert.equal(validateStructuredSourceIds([id], sources).status, 'verified');
  }
});

test('general chat without usable sources keeps its existing ungrounded behavior', () => {
  assert.equal(validateSourceCitations('General study hint.', []).status, 'not-grounded');
  assert.equal(validateSourceCitations('General study hint.', [null, { content: ' ' }]).status, 'not-grounded');
});
