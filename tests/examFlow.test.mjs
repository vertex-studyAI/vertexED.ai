import test from 'node:test';
import assert from 'node:assert/strict';

// Mirrors src/lib/examFlow.ts question extraction
function buildQuestions(paper) {
  const questions = [];
  for (const section of paper.sections ?? []) {
    for (const q of section.questions ?? []) {
      const text = (q.question ?? q.text ?? '').trim();
      if (text) questions.push({ question: text, marks: q.marks });
    }
  }
  return questions;
}

test('exam handoff extracts question field from generated papers', () => {
  const paper = {
    title: 'IB Math AA Paper 1',
    sections: [
      {
        title: 'Section A',
        questions: [
          { question: 'Find the derivative of x^2', marks: 4 },
          { text: 'Solve for x: 2x + 3 = 11', marks: 3 },
        ],
      },
    ],
  };

  const questions = buildQuestions(paper);
  assert.equal(questions.length, 2);
  assert.equal(questions[0].question, 'Find the derivative of x^2');
  assert.equal(questions[1].question, 'Solve for x: 2x + 3 = 11');
});

test('exam handoff skips empty question entries', () => {
  const paper = {
    sections: [{ questions: [{ question: '' }, { marks: 5 }] }],
  };
  assert.equal(buildQuestions(paper).length, 0);
});
