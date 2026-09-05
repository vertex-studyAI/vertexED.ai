import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const panel = readFileSync(new URL('../src/components/notebook/NotebookOutputPanel.tsx', import.meta.url), 'utf8');

test('generated notebook outputs expose a stable accessible region name', () => {
  assert.match(panel, /const generatedRegionLabel = `Generated \$\{outputKindLabel\(output\.kind\)\}`;/);
  assert.equal((panel.match(/aria-label=\{generatedRegionLabel\}/g) ?? []).length, 3);
});

test('generated quiz cards bind each question to its disclosure control and answer', () => {
  assert.match(panel, /const questionId = `notebook-quiz-question-\$\{q\.id\}`;/);
  assert.match(panel, /const answerId = `notebook-quiz-answer-\$\{q\.id\}`;/);
  assert.match(panel, /aria-labelledby=\{questionId\}/);
  assert.match(panel, /aria-expanded=\{show\}/);
  assert.match(panel, /aria-controls=\{answerId\}/);
  assert.match(panel, /<div id=\{answerId\}/);
});

test('suggested-question controls are not exposed as actionable when no ask handler exists', () => {
  assert.match(panel, /const canAskQuestion = typeof onAskQuestion === 'function';/);
  assert.match(panel, /disabled=\{!canAskQuestion\}/);
  assert.match(panel, /\? 'Tap a question to ask Apex with your sources attached\.'/);
  assert.match(panel, /: 'Suggested questions generated from your sources\.'/);
});

test('decorative generated-content icons stay out of the accessibility tree', () => {
  assert.match(panel, /<ChevronDown className="h-3 w-3" aria-hidden \/>/);
  assert.match(panel, /<ChevronRight className="h-3 w-3" aria-hidden \/>/);
  assert.match(panel, /<Layers className="h-3\.5 w-3\.5" aria-hidden \/>/);
});
