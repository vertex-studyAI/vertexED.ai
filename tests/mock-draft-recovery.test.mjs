import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const examMode = fs.readFileSync('src/components/MockExamMode.tsx', 'utf8');
const examFlow = fs.readFileSync('src/lib/examFlow.ts', 'utf8');
const paperMaker = fs.readFileSync('src/pages/PaperMaker.tsx', 'utf8');
const dashboard = fs.readFileSync('src/components/dashboard/LearningCommandCenter.tsx', 'utf8');

test('active timed mocks persist account-scoped answers, position, and deadline through fail-closed storage', () => {
  assert.match(examFlow, /userContentStorageKeys\(\)\.mockExamDraft/);
  assert.match(examFlow, /safeStorageSet\([\s\S]*mockExamDraftStorageKey\(\)/);
  assert.match(examFlow, /safeStorageSet\([\s\S]*queueLearnerStateWrite\('mock_draft'/);
  assert.doesNotMatch(examFlow, /localStorage\.(?:getItem|setItem|removeItem)/);
  assert.match(examMode, /saveMockExamDraft\(\{/);
  assert.match(examMode, /answers,/);
  assert.match(examMode, /currentIndex: index/);
  assert.match(examMode, /deadlineAt: deadlineRef\.current/);
  assert.match(examMode, /if \(!persistDraft\(\)\) return;\s*onClose\(\)/);
});

test('submitted mocks retain a durable review record and unfinished mocks have a real resume route', () => {
  assert.match(examMode, /const handoffStored = saveMockExamAnswersHandoff\(/);
  assert.match(examMode, /if \(!handoffStored\) return false;/);
  assert.doesNotMatch(examMode, /clearMockExamDraft\(/);
  assert.match(examFlow, /status: 'awaiting_review'/);
  assert.match(examMode, /draftSaveError/);
  assert.match(dashboard, /paper-maker\?resumeMock=1/);
  assert.match(paperMaker, /loadMockExamDraft\(\)/);
  assert.match(paperMaker, /setMockExamOpen\(true\)/);
});
