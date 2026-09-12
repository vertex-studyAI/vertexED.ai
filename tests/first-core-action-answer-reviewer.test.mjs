import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SOURCE_PATH = 'src/pages/AnswerReviewer.tsx';

function answerReviewerSource() {
  return fs.readFileSync(SOURCE_PATH, 'utf8');
}

test('Answer Reviewer records first core action only after a usable learner-visible result', () => {
  const source = answerReviewerSource();

  assert.match(source, /recordAttributedFirstCoreActionCompleted/);
  assert.match(source, /const rawOut = toApiSafeString\(data\)\.trim\(\) \|\| text\.trim\(\);/);
  assert.match(source, /const out = rawOut \|\| "No response received\.";/);

  const nonOkIndex = source.indexOf('if (!res.ok)');
  const visibleResultIndex = source.indexOf('setResponse(out);');
  const activationIndex = source.indexOf('recordAttributedFirstCoreActionCompleted({');

  assert.ok(nonOkIndex >= 0, 'non-OK response guard must exist');
  assert.ok(visibleResultIndex > nonOkIndex, 'learner-visible result must be committed only after the non-OK guard');
  assert.ok(activationIndex > visibleResultIndex, 'activation must be attempted only after the learner-visible result is committed');
});

test('Answer Reviewer activation excludes blocked, placeholder, and signed-out results', () => {
  const source = answerReviewerSource();

  assert.match(source, /user\?\.id\s*&&\s*rawOut\s*&&/s);
  assert.match(source, /data\.blocked === true/);
  assert.match(source, /accountId: user\.id/);

  const activationBlock = source.slice(
    source.indexOf('if (\n        user?.id'),
    source.indexOf('\n\n      try {\n        if (typeof out === "string"', source.indexOf('if (\n        user?.id')),
  );

  assert.doesNotMatch(activationBlock, /No response received/);
});

test('Answer Reviewer classifies review kind and degraded completion without learner content', () => {
  const source = answerReviewerSource();

  assert.match(source, /kind: reviewSource === "mock" \? "mock_review" : "answer_review"/);
  assert.match(source, /result: data && typeof data === "object" && data\.degraded === true \? "degraded" : "completed"/);

  const activationCallStart = source.indexOf('recordAttributedFirstCoreActionCompleted({');
  const activationCallEnd = source.indexOf('});', activationCallStart);
  const activationCall = source.slice(activationCallStart, activationCallEnd + 3);

  assert.doesNotMatch(
    activationCall,
    /\b(subject|topic|score|question|answer|prompt|artifact|provider|model)\s*:/i,
  );
});
