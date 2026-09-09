import test from 'node:test';
import assert from 'node:assert/strict';
import { validateNotebookSnapshot, validateNotebooks, validatePlannerSnapshot } from '../src/lib/snapshotValidation.mjs';

const time = '2026-09-09T00:00:00Z';
const notebook = {
  id: 'nb-valid', title: 'Cell transport', subject: 'Biology', createdAt: time, updatedAt: time,
  sources: [{ id: 'source-one', type: 'text', title: 'Notes', content: 'Diffusion', wordCount: 1, enabled: true, createdAt: time }],
  outputs: [{ id: 'output-one', kind: 'quiz', title: 'Recall', content: 'Answer without notes', generatedAt: time,
    quiz: [{ id: 'q-one', type: 'short', question: 'Define diffusion', options: [], answer: 'Net movement', explanation: 'Down a concentration gradient', marks: 1 }] }],
};

test('valid and legacy notebooks keep their contents and optional fields', () => {
  assert.deepEqual(validateNotebooks([notebook]), [notebook]);
  assert.deepEqual(validateNotebookSnapshot({ notebooks: [notebook], updatedAt: time }).notebooks, [notebook]);
});

test('nested notebook records cannot hide broken sources, quiz fields or duplicate identities', () => {
  for (const value of [
    [notebook, notebook],
    [{ ...notebook, sources: [null] }],
    [{ ...notebook, sources: [notebook.sources[0], notebook.sources[0]] }],
    [{ ...notebook, sources: [{ ...notebook.sources[0], enabled: 'yes' }] }],
    [{ ...notebook, suggestedQuestions: [null] }],
    [{ ...notebook, outputs: [{ ...notebook.outputs[0], quiz: [{}] }] }],
    [{ ...notebook, outputs: [{ ...notebook.outputs[0], flashcards: [{ front: null, back: 'Answer' }] }] }],
    [{ ...notebook, updatedAt: 5 }],
  ]) assert.throws(() => validateNotebooks(value), /Original data is preserved/);
});

test('snapshot view and revision fields are validated, not just the top-level arrays', () => {
  assert.throws(() => validatePlannerSnapshot({ tasks: [], mode: 'Unknown', updatedAt: time }));
  assert.throws(() => validatePlannerSnapshot({ tasks: [], mode: 'Day', updatedAt: 'bad' }));
  assert.throws(() => validateNotebookSnapshot({ notebooks: [], updatedAt: [] }));
});
