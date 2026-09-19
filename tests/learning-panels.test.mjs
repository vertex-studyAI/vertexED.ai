import test from 'node:test';
import assert from 'node:assert/strict';
import { cubicLesson, formatLearningWorkspaceMarkdown, parseLearningPanels, learningPanelPrompt } from '../src/lib/learningPanels.mjs';
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
test('learning workspaces export complete labelled Markdown including learner working', () => {
  const markdown = formatLearningWorkspaceMarkdown(cubicLesson, { 2: 'Group the terms first.' }, false);
  assert.match(markdown, /^# Cubic factorisation:/);
  assert.match(markdown, /AI-generated draft\. Check against course materials\./);
  assert.match(markdown, /### My working\n\nGroup the terms first\./);
  assert.match(markdown, /Hint: Group the first two terms/);
  assert.match(markdown, /Worked answer: x²/);
});
