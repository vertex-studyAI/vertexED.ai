import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const app = fs.readFileSync('src/app/App.tsx', 'utf8');
const layout = fs.readFileSync('src/components/layout/SiteLayout.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/Main.tsx', 'utf8');
const studyZone = fs.readFileSync('src/pages/study-zone/StudyZonePage.tsx', 'utf8');
const resourceLibrary = fs.readFileSync('src/pages/ResourceLibrary.tsx', 'utf8');
const boardResources = fs.readFileSync('src/lib/boardResources.ts', 'utf8');
const boardHandler = fs.readFileSync('api/_handlers/board-resource.js', 'utf8');

test('exam prep is protected, navigable, and available from the dashboard', () => {
  assert.match(app, /path="exam-prep" element={<ProtectedRoute><ExamPrep \/><\/ProtectedRoute>}/);
  assert.match(layout, /to: "\/exam-prep", label: "Exam prep"/);
  assert.match(dashboard, /to: "\/exam-prep"/);
});

test('advertised daily habits have a real Study Zone widget', () => {
  assert.match(studyZone, /key: "habits"/);
  assert.match(studyZone, /<HabitTracker accent={accent} \/>/);
});

test('generated board guides have a visible and server-side provenance boundary', () => {
  assert.match(resourceLibrary, /AI-generated, unverified draft/);
  assert.match(boardHandler, /AI_GENERATED_UNVERIFIED/);
  assert.match(boardHandler, /not an examiner or an official representative/);
});

test('board guide generation is owned by the latest topic, board, and account scope', () => {
  assert.match(resourceLibrary, /const storageScope = user\?\.id \?\? null;/);
  assert.match(resourceLibrary, /const guideRequestIdRef = useRef\(0\)/);
  assert.match(resourceLibrary, /const storageScopeRef = useRef\(storageScope\)/);
  assert.match(resourceLibrary, /storageScopeRef\.current = storageScope;/);
  assert.match(resourceLibrary, /const requestId = guideRequestIdRef\.current \+ 1;/);
  assert.match(resourceLibrary, /guideRequestIdRef\.current = requestId;/);
  assert.match(resourceLibrary, /const requestBoard = board;/);
  assert.match(resourceLibrary, /const requestStorageScope = storageScopeRef\.current;/);
  assert.match(
    resourceLibrary,
    /getCachedGuide\(requestBoard, topic\.id, pref\.grade, requestStorageScope\)/,
  );
  assert.match(
    resourceLibrary,
    /generateBoardGuide\(requestBoard, topic, pref\.grade, requestStorageScope\)/,
  );
  assert.equal(
    [...resourceLibrary.matchAll(/if \(guideRequestIdRef\.current !== requestId \|\| storageScopeRef\.current !== requestStorageScope\) return;/g)].length,
    2,
  );
  assert.match(
    resourceLibrary,
    /finally \{\s*if \(guideRequestIdRef\.current === requestId && storageScopeRef\.current === requestStorageScope\) \{\s*setLoading\(false\);/,
  );
  assert.match(
    resourceLibrary,
    /storageScopeRef\.current = storageScope;\s*guideRequestIdRef\.current \+= 1;\s*setLoading\(false\);\s*setError\(null\);\s*setActiveTopic\(null\);\s*setGuide\(null\);\s*setBoard\(pref\.board\);\s*}, \[storageScope, pref\.board\]\);/,
  );
  assert.match(
    resourceLibrary,
    /onClick=\{\(\) => \{\s*guideRequestIdRef\.current \+= 1;\s*setLoading\(false\);\s*setError\(null\);\s*setBoard\(b\);/,
  );
});

test('board guide cache reads and writes stay bound to the request account', () => {
  assert.match(boardResources, /function cacheKey\(storageScope\?: string \| null\)/);
  assert.match(boardResources, /userContentStorageKeys\(storageScope\)\.boardGuides/);
  assert.match(boardResources, /function readCache\(storageScope\?: string \| null\)/);
  assert.match(boardResources, /function writeCache\(guides: BoardGuide\[\], storageScope\?: string \| null\)/);
  assert.match(boardResources, /const cached = getCachedGuide\(board, topic\.id, grade, storageScope\);/);
  assert.match(boardResources, /\.\.\.readCache\(storageScope\)\.filter/);
  assert.match(boardResources, /\],\s*storageScope,\s*\);/);
});
