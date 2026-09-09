import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAskMessages } from '../api/_lib/askPrompt.js';

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
});
