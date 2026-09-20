import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { practiceSubjectMatches } from '../src/lib/examPracticeSubject.mjs';

const code = ts.transpileModule(fs.readFileSync('src/content/examPractice.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const { EXAM_DRILLS } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('original practice pack has unique IDs, worked reasoning, transfer and source references', () => {
  assert.equal(new Set(EXAM_DRILLS.map(item => item.id)).size, EXAM_DRILLS.length);
  assert.equal(EXAM_DRILLS.filter(item => item.programme === 'IB MYP').length, 6);
  for (const item of EXAM_DRILLS) {
    assert.ok(item.prompt.length > 60);
    assert.ok(item.solution.length > 80);
    assert.ok(item.checks.length >= 4);
    assert.ok(item.transfer.length > 20);
    assert.ok(['ibo.org', 'openstax.org'].includes(new URL(item.source).hostname));
  }
  for (const criterion of ['A', 'B', 'C', 'D']) assert.ok(EXAM_DRILLS.some(item => item.subject === 'Chemistry' && item.focus.startsWith(`Criterion ${criterion}`)));
});
test('practice draft is keyed to both account and subject, and cannot write mastery', () => {
  const source = fs.readFileSync('src/pages/ExamPrep.tsx', 'utf8');
  assert.match(source, /ExamPracticeLab key=\{`\$\{authLoading[\s\S]*?user\?\.id[\s\S]*?:\$\{subject\}`\}/);
  const panel = fs.readFileSync('src/components/ExamPracticeLab.tsx', 'utf8');
  assert.doesNotMatch(panel, /recordWeakness|localStorage|fetch\(/);
});
test('practice lab never silently substitutes the first drill for an unsupported subject', () => {
  const panel = fs.readFileSync('src/components/ExamPracticeLab.tsx', 'utf8');
  assert.doesNotMatch(panel, /\|\|\s*drills\[0\]/);
  assert.match(panel, /const drill = selectedDrill \|\| subjectDrill \|\| null;/);
  assert.match(panel, /No subject-matched drill is available yet\./);
  assert.match(panel, /VertexED will not silently substitute another subject\./);
});
test('practice subject matching recognizes supported curriculum aliases without broad cross-subject fallback', () => {
  assert.equal(practiceSubjectMatches('Math AA', 'Mathematics'), true);
  assert.equal(practiceSubjectMatches('Math AI', 'Mathematics'), true);
  assert.equal(practiceSubjectMatches('Math Standard', 'Mathematics'), true);
  assert.equal(practiceSubjectMatches('Calculus AB', 'Mathematics'), true);
  assert.equal(practiceSubjectMatches('Calculus BC', 'Mathematics'), true);
  assert.equal(practiceSubjectMatches('Chemistry', 'Chemistry'), true);
  assert.equal(practiceSubjectMatches('History', 'Mathematics'), false);
  assert.equal(practiceSubjectMatches('Statistics', 'Mathematics'), false);
});
