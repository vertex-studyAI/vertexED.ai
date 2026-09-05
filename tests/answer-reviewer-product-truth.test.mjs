import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/AnswerReviewer.tsx', 'utf8');

test('answer reviewer states its provisional evidence boundary', () => {
  assert.match(source, /Not an official grade/);
  assert.match(source, /provisional AI feedback/);
  assert.match(source, /does not update mastery/);
  assert.doesNotMatch(source, /Teacher-style/);
});

test('answer reviewer form controls use persistent labels', () => {
  for (const id of ['review-curriculum', 'review-subject', 'review-grade', 'review-marks', 'review-question', 'review-answer', 'review-context', 'review-strictness']) {
    assert.match(source, new RegExp(`htmlFor="${id}"`));
    assert.match(source, new RegExp(`id="${id}"`));
  }
});

test('answer reviewer bounds attachments before base64 encoding', () => {
  assert.match(source, /5 - questionImages\.length - answerImages\.length/);
  assert.match(source, /file\.size > 4 \* 1024 \* 1024/);
  assert.match(source, /image\\\/\(png\|jpeg\|webp\|gif\)/);
});
