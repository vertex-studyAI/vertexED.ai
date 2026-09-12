import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGeneratedQuiz, validateNotebookOutput } from '../contracts/learningOutputs.js';
import { parseConceptMap } from '../src/lib/conceptMap.mjs';
import { currentStreak, localDayKey } from '../src/lib/studyDates.mjs';

const q = { id: 'q1', type: 'multiple_choice', prompt: 'Pick A', choices: ['A', 'B'], answer: 'A', maxScore: 2 };
test('quiz validation rejects invalid choices, duplicate identities and incorrect counts', () => {
 const counts = { mcq: 1, frq: 0, interactive: 0 };
 assert.equal(validateGeneratedQuiz({ questions: [q] }, counts, 2)?.length, 1);
 for (const question of [{ ...q, answer: 'C' }, { ...q, choices: ['A', 'A'] }, { ...q, maxScore: -1 }, { ...q, type: 'unsupported' }]) {
  assert.equal(validateGeneratedQuiz({ questions: [question] }, counts, 2), null);
 }
 assert.equal(validateGeneratedQuiz({ questions: [q, q] }, { mcq: 2, frq: 0, interactive: 0 }, 2), null);
 assert.equal(validateGeneratedQuiz({ questions: [q] }, { mcq: 2, frq: 0, interactive: 0 }, 2), null);
});
test('notebook outputs reject non-array data and invalid assessment keys', () => {
 assert.equal(validateNotebookOutput('flashcards', { flashcards: {} }).success, false);
 assert.equal(validateNotebookOutput('suggested-questions', { questions: [] }).success, false);
 assert.equal(validateNotebookOutput('quiz', { questions: [{ question: 'Q', type: 'mcq', options: ['A','B'], answer: 'C' }] }).success, false);
 assert.equal(validateNotebookOutput('flashcards', { flashcards: [{ front: 'Q', back: 'A' }] }).success, false);
 assert.equal(validateNotebookOutput('flashcards', { flashcards: [{ front: 'Q', back: 'A', sourceIds: ['source-1'] }] }).success, true);
});
test('bounded concept maps render relationships as text and reject executable directives', () => {
 const graph = parseConceptMap('```mermaid\nflowchart TD\nA["Cell"]\nB["Nucleus"]\nA -->|contains| B\n```');
 assert.equal(graph.nodes.length, 2);
 assert.deepEqual(graph.edges, [{ from: 'A', to: 'B', label: 'contains' }]);
 assert.equal(parseConceptMap('flowchart TD\nclick A "javascript:alert(1)"'), null);
 assert.equal(parseConceptMap('flowchart TD\n'+Array.from({length:21}, (_,i)=>`A${i}["Node"]`).join('\n')), null);
});
test('study day boundaries use local calendar dates and stale streaks expire', () => {
 const now = new Date(2026, 8, 7, 0, 15);
 assert.equal(localDayKey(now), '2026-09-07');
 assert.equal(currentStreak(4, '2026-09-06', now), 4);
 assert.equal(currentStreak(4, '2026-09-05', now), 0);
 assert.equal(currentStreak(NaN, '2026-09-07', now), 0);
});

test('human-confirmed corrections retain zero marks and reject invalid inputs', async () => {
 const { resolveConfirmedCriteria } = await import('../src/lib/confirmedReview.mjs');
 const criteria = [{ id: 'a', score: 3, maxScore: 5 }, { id: 'b', score: 2, maxScore: 5 }];
 assert.deepEqual(resolveConfirmedCriteria(criteria, { a: '0', b: '4' }).map(row => row.score), [0, 4]);
 assert.deepEqual(criteria.map(row => row.score), [3, 2]);
 for (const input of ['', 'bad', '-1', '6', 'Infinity']) assert.equal(resolveConfirmedCriteria(criteria, { a: input }), null);
});

test('grounding skips malformed sources while retaining usable passages', async () => {
 const { formatSourcesForPrompt } = await import('../api/_lib/grounding.js');
 assert.match(formatSourcesForPrompt([null, false, 'invalid', { title: 'Valid', content: 'Cell biology' }]), /Cell biology/);
});
