// Exact-head verification refresh: account-isolation behavior, 12 September 2026.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

const quickAskSource = fs.readFileSync('src/components/chat/ApexQuickAsk.tsx', 'utf8');
const retrievalPulseSource = fs.readFileSync('src/components/dashboard/RetrievalPulseCard.tsx', 'utf8');
const portalEngagementSource = fs.readFileSync('src/components/portal/PortalEngagementRow.tsx', 'utf8');
const portalCommandSource = fs.readFileSync('src/components/portal/PortalCommandCenter.tsx', 'utf8');
const mockExamModeSource = fs.readFileSync('src/components/MockExamMode.tsx', 'utf8');
const chatbotSource = fs.readFileSync('src/pages/AIChatbot.tsx', 'utf8');
const answerReviewerSource = fs.readFileSync('src/pages/AnswerReviewer.tsx', 'utf8');
const examFlowSource = fs.readFileSync('src/lib/examFlow.ts', 'utf8');
const apexPrefillStorageSource = fs.readFileSync('src/lib/apexPrefillStorage.mjs', 'utf8');
const isolationSource = fs.readFileSync('src/lib/transientSessionIsolation.ts', 'utf8');
const mainSource = fs.readFileSync('src/main.tsx', 'utf8');

test('transient learner handoffs use distinct account-scoped keys', () => {
  const first = userContentStorageKeys('11111111-1111-4111-8111-111111111111');
  const second = userContentStorageKeys('22222222-2222-4222-8222-222222222222');

  for (const key of ['apexPrefill', 'mockReviewHandoff', 'mockExamAnswers', 'mockExamDraft']) {
    assert.notEqual(first[key], second[key]);
    assert.match(first[key], /^vertex_content:/);
    assert.match(second[key], /^vertex_content:/);
  }
});

test('all authenticated Apex prefill entry points use the account-scoped fail-closed handoff', () => {
  for (const source of [quickAskSource, retrievalPulseSource, portalEngagementSource, portalCommandSource]) {
    assert.match(source, /storeApexPrefill\(/);
    assert.match(source, /if \(!storeApexPrefill\(/);
    assert.doesNotMatch(source, /sessionStorage\.(?:getItem|setItem|removeItem)/);
  }

  assert.match(chatbotSource, /consumeApexPrefill\(window, user\?\.id \?\? null\)/);
  assert.doesNotMatch(chatbotSource, /sessionStorage\.(?:getItem|setItem|removeItem)/);

  assert.match(apexPrefillStorageSource, /userContentStorageKeys\(userId \?\? null\)\.apexPrefill/);
  assert.match(apexPrefillStorageSource, /resolveSessionStorage\(owner\)/);
  assert.match(apexPrefillStorageSource, /safeStorageSet\(storage,/);
  assert.match(apexPrefillStorageSource, /safeStorageGet\(storage,/);
  assert.match(apexPrefillStorageSource, /safeStorageRemove\(storage,/);
  assert.doesNotMatch(apexPrefillStorageSource, /sessionStorage\.(?:getItem|setItem|removeItem)/);
});

test('Apex prefill producers stay put and surface a recoverable error when temporary storage is unavailable', () => {
  for (const source of [quickAskSource, retrievalPulseSource, portalEngagementSource, portalCommandSource]) {
    assert.match(source, /if \(!storeApexPrefill\([\s\S]*?\)\) \{[\s\S]*?toast\(\{[\s\S]*?variant: 'destructive'[\s\S]*?return;/);
  }
});

test('mock-review handoff follows the active authenticated content scope through fail-closed storage', () => {
  assert.match(examFlowSource, /userContentStorageKeys\(\)\.mockReviewHandoff/);
  assert.doesNotMatch(examFlowSource, /return ['"]vertex_mock_review_handoff['"]/);
  assert.match(examFlowSource, /resolveSessionStorage\(window\)/);
  assert.match(examFlowSource, /safeStorageSet\([\s\S]*mockReviewStorageKey\(\)/);
  assert.match(examFlowSource, /safeStorageGet\(storage, storageKey\)/);
  assert.doesNotMatch(examFlowSource, /sessionStorage\.(?:getItem|setItem|removeItem)/);
});

test('timed mock answers remain account-scoped and fail closed when temporary storage is blocked', () => {
  assert.match(examFlowSource, /userContentStorageKeys\(\)\.mockExamAnswers/);
  assert.match(examFlowSource, /saveMockExamAnswersHandoff/);
  assert.match(examFlowSource, /safeStorageSet\([\s\S]*mockExamAnswersStorageKey\(\)/);
  assert.match(examFlowSource, /const scopedAnswersKey = mockExamAnswersStorageKey\(\)/);
  assert.match(examFlowSource, /safeStorageGet\(storage, scopedAnswersKey\)/);
  assert.match(examFlowSource, /safeStorageRemove\(storage, scopedAnswersKey\)/);
  assert.doesNotMatch(examFlowSource, /vertex_exam_answers/);
  assert.match(mockExamModeSource, /saveMockExamAnswersHandoff\(/);
  assert.doesNotMatch(mockExamModeSource, /sessionStorage\.(?:getItem|setItem|removeItem)/);
  assert.doesNotMatch(answerReviewerSource, /sessionStorage\.(getItem|setItem)\(['"]vertex_exam_answers['"]/);
});

test('blocked timed-answer handoff preserves the draft and does not claim submission succeeded', () => {
  assert.match(mockExamModeSource, /const handoffStored = saveMockExamAnswersHandoff\(/);
  assert.match(mockExamModeSource, /if \(!handoffStored\) return false;[\s\S]*clearMockExamDraft\(\)/);
  assert.match(mockExamModeSource, /if \(saveExamHandoff\([\s\S]*setSubmitted\(true\)/);
  assert.match(mockExamModeSource, /role="alert"/);
  assert.match(mockExamModeSource, /Your browser blocked temporary exam storage/);
});

test('completed timed mock answers take precedence over the question-only handoff', () => {
  assert.match(examFlowSource, /safeStorageRemove\(storage, mockReviewStorageKey\(\)\)/);
  assert.match(answerReviewerSource, /const examAnswers = consumeMockExamAnswers\(\);[\s\S]*const handoff = consumeMockReviewHandoff\(\)/);
});

test('legacy shared timed mock answers are purge-only and never consumed', () => {
  assert.doesNotMatch(examFlowSource, /vertex_exam_answers/);
  assert.match(isolationSource, /'vertex_exam_answers'/);
  assert.match(isolationSource, /clearLegacySharedSessionHandoffs\(\)/);
});

test('timed mock handoff preserves the selected board for answer review', () => {
  assert.match(mockExamModeSource, /board: board \? boardToApiLabel\(board\) : paper\.metadata\?\.board/);
  assert.match(answerReviewerSource, /boardFromApiLabel\(examAnswers\.board\)/);
  assert.match(answerReviewerSource, /curriculum: importedBoard \? boardToApiLabel\(importedBoard\)/);
});

test('mock draft persistence remains account-scoped and durable sync is not suppressed by local storage failure', () => {
  assert.match(examFlowSource, /resolveLocalStorage\(window\)/);
  assert.match(examFlowSource, /safeStorageSet\([\s\S]*mockExamDraftStorageKey\(\)/);
  assert.match(examFlowSource, /safeStorageRemove\(resolveLocalStorage\(window\), mockExamDraftStorageKey\(\)\)/);
  assert.match(examFlowSource, /safeStorageSet\([\s\S]*queueLearnerStateWrite\('mock_draft'/);
  assert.match(examFlowSource, /safeStorageRemove\([\s\S]*queueLearnerStateWrite\('mock_draft'/);
  assert.doesNotMatch(examFlowSource, /localStorage\.(?:getItem|setItem|removeItem)/);
});

test('legacy shared handoffs are cleared at bootstrap and whenever auth ownership changes', () => {
  assert.match(isolationSource, /'vertex_apex_prefill'/);
  assert.match(isolationSource, /'vertex_mock_review_handoff'/);
  assert.match(isolationSource, /'vertex_exam_answers'/);
  assert.match(isolationSource, /clearLegacySharedSessionHandoffs\(\)/);
  assert.match(isolationSource, /activeUserId !== undefined && activeUserId !== nextUserId/);
  assert.match(isolationSource, /supabase\.auth\.onAuthStateChange/);
  assert.match(mainSource, /initTransientSessionIsolation\(\)/);
});
