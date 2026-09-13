import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/NotetakerQuiz.tsx', 'utf8');

test('notetaker async work is account/config/unmount owned', () => {
  assert.match(source, /const noteRequestIdRef = useRef\(0\);/);
  assert.match(source, /const quizRequestIdRef = useRef\(0\);/);
  assert.match(source, /const gradeRequestIdRef = useRef\(0\);/);
  assert.match(source, /const currentAsyncAccountIdRef = useRef<string \| null>\(user\?\.id \?\? null\);/);
  assert.match(source, /useLayoutEffect\(\(\) => \{[\s\S]*currentAsyncAccountIdRef\.current === nextAccountId\) return;[\s\S]*currentAsyncAccountIdRef\.current = nextAccountId;[\s\S]*invalidateNoteRequest\(\);[\s\S]*invalidateQuizRequest\(\);[\s\S]*invalidateGradeRequest\(\);[\s\S]*\}, \[user\?\.id,/);
  assert.match(source, /useEffect\(\(\) => \(\) => \{[\s\S]*noteRequestIdRef\.current \+= 1;[\s\S]*quizRequestIdRef\.current \+= 1;[\s\S]*gradeRequestIdRef\.current \+= 1;/);
  assert.match(source, /previousNoteConfigKeyRef[\s\S]*noteConfigKey[\s\S]*invalidateNoteRequest\(\);/);
  assert.match(source, /previousQuizConfigKeyRef[\s\S]*quizConfigKey[\s\S]*invalidateQuizRequest\(\);/);
  assert.match(source, /previousGradeConfigKeyRef[\s\S]*gradeConfigKey[\s\S]*invalidateGradeRequest\(\);/);
});

test('note generation rejects stale response, persistence, side effects, and loading finalization', () => {
  assert.match(source, /const requestId = noteRequestIdRef\.current \+ 1;[\s\S]*loadingOwnerRef\.current = \{ kind: "note", id: requestId \};/);
  assert.match(source, /await authFetch\("\/api\/note"[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*await res\.json\(\);[\s\S]*if \(!isCurrentRequest\(\)\) return;/);
  assert.match(source, /const saved = await saveStudyArtifact\("note"[\s\S]*if \(!isCurrentRequest\(\)\) \{[\s\S]*currentAsyncAccountIdRef\.current === requestAccountId[\s\S]*await deleteStudyArtifact\(saved\.id\);[\s\S]*return;[\s\S]*\}[\s\S]*recordStudySession\(\);/);
  assert.match(source, /catch \(err\) \{\s*if \(!isCurrentRequest\(\)\) return;[\s\S]*\} finally \{\s*releaseLoadingOwner\("note", requestId\);\s*\}/);
});

test('quiz generation and AI grading reject stale completions independently', () => {
  assert.match(source, /const requestId = quizRequestIdRef\.current \+ 1;[\s\S]*loadingOwnerRef\.current = \{ kind: "quiz", id: requestId \};[\s\S]*await authFetch\("\/api\/quiz"[\s\S]*action: "generate"[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*await res\.json\(\);[\s\S]*if \(!isCurrentRequest\(\)\) return;/);
  assert.match(source, /releaseLoadingOwner\("quiz", requestId\);/);
  assert.match(source, /const requestId = gradeRequestIdRef\.current \+ 1;[\s\S]*loadingOwnerRef\.current = \{ kind: "grade", id: requestId \};[\s\S]*action: "grade"[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*await gradeRes\.json\(\);[\s\S]*if \(!isCurrentRequest\(\)\) return;/);
  assert.match(source, /const saved = await saveStudyArtifact\("review"[\s\S]*if \(!isCurrentRequest\(\)\) \{[\s\S]*currentAsyncAccountIdRef\.current === requestAccountId[\s\S]*await deleteStudyArtifact\(saved\.id\);[\s\S]*return;[\s\S]*\}[\s\S]*recordMeasuredResults\(merged\);[\s\S]*recordStudySession\(\);[\s\S]*recordLoopStep\("practise"\);/);
  assert.match(source, /releaseLoadingOwner\("grade", requestId\);/);
});
