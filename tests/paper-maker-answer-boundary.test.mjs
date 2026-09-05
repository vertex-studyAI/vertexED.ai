import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/PaperMaker.tsx', 'utf8');

test('paper preview keeps marking guidance behind an explicit reveal', () => {
  assert.match(source, /showMarkScheme && q\.modelAnswerOutline/);
  assert.match(source, /Reveal mark scheme/);
  assert.doesNotMatch(source, />Rubric: \{q\.modelAnswerOutline\}/);
});

test('question exports omit marking guidance unless explicitly requested', () => {
  assert.match(source, /exportDocx\(includeMarkScheme = false\)/);
  assert.match(source, /onClick=\{\(\) => void exportDocx\(false\)\}/);
  assert.match(source, /onClick=\{\(\) => void exportDocx\(true\)\}/);
  assert.match(source, /includeMarkScheme && q\.modelAnswerOutline/);
});

test('oversized diagram attachments are rejected instead of encoded', () => {
  assert.match(source, /if \(file\.size > maxBytes\)[\s\S]*return null;/);
  assert.match(source, /converted\.filter\(Boolean\)/);
});
