import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const examMode = fs.readFileSync('src/components/MockExamMode.tsx', 'utf8');
const examFlow = fs.readFileSync('src/lib/examFlow.ts', 'utf8');
const paperMaker = fs.readFileSync('src/pages/PaperMaker.tsx', 'utf8');
const dashboard = fs.readFileSync('src/components/dashboard/LearningCommandCenter.tsx', 'utf8');

test('active timed mocks persist account-scoped answers, position, and deadline', () => {
  assert.match(examFlow, /userContentStorageKeys\(\)\.mockExamDraft/);
  assert.match(examFlow, /localStorage\.setItem\(mockExamDraftStorageKey\(\)/);
  assert.match(examFlow, /queueLearnerStateWrite\('mock_draft'/);
  assert.match(examMode, /saveMockExamDraft\(\{/);
  assert.match(examMode, /answers,/);
  assert.match(examMode, /currentIndex: index/);
  assert.match(examMode, /deadlineAt: deadlineRef\.current/);
  assert.match(examMode, /persistDraft\(\);[\s\S]*onClose\(\)/);
});

test('submitted mocks clear drafts and unfinished mocks have a real resume route', () => {
  assert.match(examMode, /clearMockExamDraft\(\)/);
  assert.match(dashboard, /paper-maker\?resumeMock=1/);
  assert.match(paperMaker, /loadMockExamDraft\(\)/);
  assert.match(paperMaker, /setMockExamOpen\(true\)/);
});
