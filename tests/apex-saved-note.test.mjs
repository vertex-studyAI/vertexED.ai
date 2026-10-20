import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { buildApexSavedNote } from '../src/lib/apexSavedNote.mjs';

const messages = [
  { id: 'learner-1', role: 'user', text: 'How does enzyme inhibition affect rate?' },
  {
    id: 'apex-1',
    role: 'assistant',
    text: 'Competitive inhibitors reduce the apparent affinity, while non-competitive inhibitors reduce maximum rate.',
    sources: [{ id: 'bio-source', title: 'Enzymes', excerpt: 'Compare apparent affinity and maximum rate.' }],
  },
];

test('a finished Apex response becomes an editable, source-linked note', () => {
  const note = buildApexSavedNote(messages, 'apex-1', 'Biology HL');
  assert.equal(note.title, 'AI tutor note: How does enzyme inhibition affect rate?');
  assert.match(note.payload.notes, /## Your question/);
  assert.match(note.payload.notes, /## Explanation/);
  assert.match(note.payload.notes, /## Evidence used/);
  assert.match(note.payload.notes, /AI tutor output/);
  assert.deepEqual(note.payload.apex.sources, [{ id: 'bio-source', title: 'Enzymes', excerpt: 'Compare apparent affinity and maximum rate.' }]);
});

test('Apex save rejects absent or non-assistant output and bounds persisted text', () => {
  assert.equal(buildApexSavedNote(messages, 'missing'), null);
  assert.equal(buildApexSavedNote(messages, 'learner-1'), null);
  const note = buildApexSavedNote([{ id: 'a', role: 'assistant', text: 'x'.repeat(20_000) }], 'a');
  assert.equal(note.payload.apex.question, null);
  assert.equal(note.payload.notes.length < 13_000, true);
});

test('the visible chat action saves an ordinary note through the durable artifact boundary', () => {
  const source = fs.readFileSync('src/components/chat/ApexMessageList.tsx', 'utf8');
  assert.match(source, /buildApexSavedNote\(messages, message\.id, context\.label\)/);
  assert.match(source, /saveStudyArtifact\('note', note\.title, note\.payload/);
  assert.match(source, /createArtifactIdempotencyKey\(\)/);
  assert.match(source, /Save to Notes/);
  assert.match(source, /Open Saved work/);
});
