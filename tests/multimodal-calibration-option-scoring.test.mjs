import assert from 'node:assert/strict';
import test from 'node:test';

import {
  scoreScienceQaOptions,
  softmaxLogLikelihoods
} from '../research/multimodal-calibration/option-scoring.mjs';
import {
  optionContinuation,
  renderScienceQaPrompt
} from '../research/multimodal-calibration/prompt-template.mjs';

const example = {
  question: 'Which material is the best electrical conductor?',
  hint: 'Consider common metals.',
  choices: ['Rubber', 'Copper', 'Glass', 'Wood']
};

test('prompt rendering is deterministic and freezes the answer boundary', () => {
  const first = renderScienceQaPrompt(example);
  const second = renderScienceQaPrompt({ ...example, question: `  ${example.question}  ` });

  assert.equal(first, second);
  assert.match(first, /\(A\) Rubber\n\(B\) Copper\n\(C\) Glass\n\(D\) Wood/);
  assert.ok(first.endsWith('Answer: '));
  assert.equal(optionContinuation('B', 4), 'B');
});

test('teacher-forced scorer uses an identical prompt prefix for every option', async () => {
  const calls = [];
  const byLabel = { A: -4, B: -0.1, C: -2, D: -3 };
  const result = await scoreScienceQaOptions(example, async (request) => {
    calls.push(request);
    return byLabel[request.label];
  });

  assert.equal(calls.length, 4);
  assert.ok(calls.every((call) => call.prompt === calls[0].prompt));
  assert.deepEqual(calls.map((call) => call.continuation), ['A', 'B', 'C', 'D']);
  assert.equal(result.predicted_label, 'B');
  assert.ok(Math.abs(result.probabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
});

test('scoring fails closed if any option cannot produce a finite log-likelihood', async () => {
  await assert.rejects(
    scoreScienceQaOptions(example, async ({ label }) => label === 'C' ? Number.NaN : -1),
    /option C produced a non-finite log-likelihood/
  );
});

test('softmax remains stable for very negative teacher-forced scores', () => {
  const probabilities = softmaxLogLikelihoods([-10000, -10001, -10002]);
  assert.ok(probabilities.every(Number.isFinite));
  assert.ok(Math.abs(probabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
  assert.ok(probabilities[0] > probabilities[1]);
  assert.ok(probabilities[1] > probabilities[2]);
});

test('prompt construction rejects malformed or underspecified options', () => {
  assert.throws(() => renderScienceQaPrompt({ question: 'Q?', choices: ['only one'] }), /optionCount/);
  assert.throws(() => renderScienceQaPrompt({ question: 'Q?', choices: ['ok', '   '] }), /choices\[1\] must be non-empty/);
});
