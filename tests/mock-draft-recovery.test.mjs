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
  assert.match(examMode, /persistDraft\(\);[\s\S]*onClose\(\)/);
});

test('submitted mocks clear drafts only after answer handoff persists and unfinished mocks have a real resume route', () => {
  assert.match(examMode, /const handoffStored = saveMockExamAnswersHandoff\(/);
  assert.match(examMode, /if \(!handoffStored\) return false;[\s\S]*clearMockExamDraft\(\)/);
  assert.match(dashboard, /paper-maker\?resumeMock=1/);
  assert.match(paperMaker, /loadMockExamDraft\(\)/);
  assert.match(paperMaker, /setMockExamOpen\(true\)/);
});
