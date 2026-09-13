import test from 'node:test';
import assert from 'node:assert/strict';
import { cubicLesson, parseLearningPanels, learningPanelPrompt } from '../src/lib/learningPanels.mjs';
test('sample lesson passes the same contract as model-generated cards', () => {
  assert.equal(parseLearningPanels(JSON.stringify(cubicLesson)).cards.length, 4);
});
test('learning cards fail closed on malformed or executable structures', () => {
  for (const text of ['not JSON', '{}', JSON.stringify({ title: 'bad', cards: [{ kind: 'script', title: 'run', body: 'code' }] }), JSON.stringify({ title: 'bad', cards: [{ kind: 'practice', title: 'question', body: 'question' }] })]) assert.equal(parseLearningPanels(text), null);
  const parsed = parseLearningPanels(JSON.stringify({ ...cubicLesson, onClick: 'execute', cards: [{ kind: 'concept', title: 'Hello', body: 'Text', action: 'delete-account' }] }));
  assert.equal(parsed.onClick, undefined);
  assert.equal(parsed.cards[0].action, undefined);
});
test('learning prompt requests bounded structure without invented student history', () => {
  assert.match(learningPanelPrompt('cubic factorisation', 'foundations'), /Do not invent performance history/);
});
