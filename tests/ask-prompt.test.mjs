import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAskMessages } from '../api/_lib/askPrompt.js';
import {
  buildSourceRegistry,
  formatSourcesForPrompt,
  validateSourceCitations,
  validateStructuredSourceIds,
} from '../api/_lib/grounding.js';

test('shared ask prompt keeps context, bounded history, sources, and one current question', () => {
  const messages = buildAskMessages({
    question: '  What is mitosis?  ',
    context: { label: 'Biology' },
    sources: [{ id: 's1', title: 'Course notes', content: 'Mitosis produces two cells.' }],
    history: [
      { role: 'assistant', text: 'Let us work through it.' },
      { role: 'user', text: 'What is mitosis?' },
    ],
  });

  assert.equal(messages.at(-1).content, 'What is mitosis?');
  assert.equal(messages.filter((message) => message.role === 'user').length, 1);
  assert.match(messages[0].content, /Biology/);
  assert.match(messages[0].content, /Course notes/);
  assert.match(messages[0].content, /SOURCE \[s1\]/);
  assert.match(messages[0].content, /\[Source: id\]/);
});

test('source registry creates unique prompt-safe IDs', () => {
  const sources = [
    { id: ' Class Notes ', title: 'Notes\nInjected header', content: 'Alpha' },
    { id: 'Class Notes', title: 'Second', content: 'Beta' },
    { title: 'No ID', content: 'Gamma' },
  ];
  const registry = buildSourceRegistry(sources);

  assert.deepEqual(registry.map(({ id }) => id), ['class-notes', 'class-notes-2', 'source-3']);
  assert.equal(registry[0].title, 'Notes Injected header');
  assert.match(formatSourcesForPrompt(sources), /SOURCE \[class-notes\]/);
});

test('citation decision layer resolves only supplied source IDs', () => {
  const sources = [
    { id: 'bio-1', title: 'Biology notes', content: 'Cells divide.' },
    { id: 'bio-2', title: 'Lab notes', content: 'The sample was observed.' },
  ];

  assert.deepEqual(
    validateSourceCitations('Cells divide [Source: bio-1].', sources),
    {
      status: 'verified',
      citations: [{ id: 'bio-1', title: 'Biology notes', excerpt: 'Cells divide.' }],
      invalidCitations: [],
      sources: [
        { id: 'bio-1', title: 'Biology notes', excerpt: 'Cells divide.' },
        { id: 'bio-2', title: 'Lab notes', excerpt: 'The sample was observed.' },
      ],
    },
  );
  assert.equal(validateSourceCitations('Unsupported [Source: invented].', sources).status, 'invalid');
  assert.equal(validateSourceCitations('No reference.', sources).status, 'missing');
  assert.equal(validateSourceCitations('General answer.', []).status, 'not-grounded');
});

test('structured source IDs use the same allow-list decision layer', () => {
  const sources = [{ id: 'chem-1', title: 'Chemistry notes', content: 'Atoms contain subatomic particles.' }];

  assert.equal(validateStructuredSourceIds(['chem-1'], sources).status, 'verified');
  assert.equal(validateStructuredSourceIds([], sources).status, 'missing');
  assert.deepEqual(
    validateStructuredSourceIds(['chem-1', 'invented'], sources).invalidCitations,
    ['invented'],
  );
  assert.equal(validateStructuredSourceIds(['chem-1'], []).status, 'not-grounded');
});
