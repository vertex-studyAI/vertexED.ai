import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Keep these source contracts on the PR merge ref so account-isolation changes
// are revalidated whenever main advances during the hardening sprint.
import {
  normalizeUserContentStorageScope,
  setUserContentStorageScope,
  userContentStorageKeys,
} from '../src/lib/userContentStorageScope.mjs';

const userContentSource = fs.readFileSync('src/lib/userContent.ts', 'utf8');
const authSource = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
const apexSource = fs.readFileSync('src/hooks/useApexChat.ts', 'utf8');
const sketchSource = fs.readFileSync('src/components/sketch/SketchPad.tsx', 'utf8');
const activitySource = fs.readFileSync('src/pages/study-zone/components/ActivityLog.tsx', 'utf8');
const noteSource = fs.readFileSync('src/pages/study-zone/components/NoteTaker.tsx', 'utf8');
const studyActivitySource = fs.readFileSync('src/lib/studyActivity.ts', 'utf8');
const studyStatsSource = fs.readFileSync('src/lib/studyStats.ts', 'utf8');
const ecosystemSource = fs.readFileSync('src/lib/studyEcosystem.ts', 'utf8');
const localStorageHookSource = fs.readFileSync('src/hooks/useLocalStorage.ts', 'utf8');

test('learner content device storage is isolated by authenticated account', () => {
  const first = userContentStorageKeys('11111111-1111-4111-8111-111111111111');
  const second = userContentStorageKeys('22222222-2222-4222-8222-222222222222');

  for (const key of [
    'artifacts',
    'restore',
    'chatHandoff',
    'sketchPad',
    'activity',
    'quickNotes',
    'lastStudySession',
  ]) {
    assert.notEqual(first[key], second[key]);
    assert.match(first[key], /^vertex_content:/);
    assert.match(second[key], /^vertex_content:/);
  }
});

test('unresolved and signed-out states never reuse an authenticated content key', () => {
  assert.equal(normalizeUserContentStorageScope(undefined), 'unhydrated');
  assert.equal(normalizeUserContentStorageScope(null), 'signed-out');
  assert.equal(normalizeUserContentStorageScope('  '), 'signed-out');

  setUserContentStorageScope(undefined);
  const unresolved = userContentStorageKeys();
  setUserContentStorageScope(null);
  const signedOut = userContentStorageKeys();
  setUserContentStorageScope('11111111-1111-4111-8111-111111111111');
  const authenticated = userContentStorageKeys();

  assert.notEqual(unresolved.artifacts, signedOut.artifacts);
  assert.notEqual(unresolved.artifacts, authenticated.artifacts);
  assert.notEqual(signedOut.artifacts, authenticated.artifacts);
});

test('user-content no longer reads shared legacy study artifact or handoff keys', () => {
  assert.doesNotMatch(userContentSource, /vertex_local_artifacts/);
  assert.doesNotMatch(userContentSource, /vertex_restore_artifact/);
  assert.doesNotMatch(userContentSource, /vertex_chat_handoff/);
  assert.match(userContentSource, /userContentStorageKeys\(\)/);
});

test('auth lifecycle changes sensitive storage ownership before descendants use a new session', () => {
  assert.match(authSource, /function setSensitiveStorageScopes/);
  assert.match(authSource, /setUserContentStorageScope\(scope\)/);
  assert.match(authSource, /setPlannerStorageScope\(scope\)/);
  assert.match(authSource, /setSensitiveStorageScopes\(undefined\)/);
  assert.match(authSource, /setSensitiveStorageScopes\(nextUser\?\.id \?\? null\)/);
  assert.match(authSource, /setSensitiveStorageScopes\(data\.user\?\.id \?\? null\)/);
  assert.match(authSource, /setSensitiveStorageScopes\(null\)/);
});

test('Apex session history is account-scoped and abandons unsafe legacy migration', () => {
  assert.match(apexSource, /const \{ user, loading: authLoading \} = useAuth\(\)/);
  assert.match(apexSource, /apexChatStorageKey\(context\.page, threadKey, accountScope\)/);
  assert.match(apexSource, /vertex_apex:\$\{account\}:/);
  assert.doesNotMatch(apexSource, /vertex_apex_messages_v1/);
  assert.match(apexSource, /if \(!question \|\| loading \|\| authLoading\) return false/);
  assert.match(apexSource, /requestRef\.current \+= 1/);
});

test('sketch pad loads and saves strokes only inside the resolved account key', () => {
  assert.match(sketchSource, /const \{ user, loading: authLoading \} = useAuth\(\)/);
  assert.match(sketchSource, /userContentStorageKeys\(authLoading \? undefined : user\?\.id \?\? null\)\.sketchPad/);
  assert.match(sketchSource, /strokesRef\.current = loadStrokes\(storageKey\)/);
  assert.match(sketchSource, /saveStrokes\(storageKey, strokesRef\.current\)/);
  assert.doesNotMatch(sketchSource, /vertex_sketch_pad_v1/);
});

test('Study Zone free-form activity and notes use account-scoped keys', () => {
  assert.match(activitySource, /userContentStorageKeys\(authLoading \? undefined : user\?\.id \?\? null\)\.activity/);
  assert.match(noteSource, /userContentStorageKeys\(authLoading \? undefined : user\?\.id \?\? null\)\.quickNotes/);
  assert.doesNotMatch(activitySource, /"studyzone_activity"/);
  assert.doesNotMatch(noteSource, /"studyzone_notes"/);
  assert.match(noteSource, /\}, \[notesKey\]\)/);
});

test('shared study helpers read direct learner content from the active account scope', () => {
  assert.match(studyActivitySource, /userContentStorageKeys\(\)/);
  assert.doesNotMatch(studyActivitySource, /studyzone_activity/);
  assert.doesNotMatch(studyActivitySource, /vertex_last_study_session/);
  assert.match(studyStatsSource, /const \{ activity, quickNotes \} = userContentStorageKeys\(\)/);
  assert.doesNotMatch(studyStatsSource, /readJson<unknown\[]>\("studyzone_activity"/);
  assert.doesNotMatch(studyStatsSource, /readJson<unknown\[]>\("studyzone_notes"/);
});

test('dashboard ecosystem reads planner and activity from the same active account scopes', () => {
  assert.match(ecosystemSource, /plannerStorageKeys\(\)\.tasks/);
  assert.match(ecosystemSource, /userContentStorageKeys\(\)/);
  assert.doesNotMatch(ecosystemSource, /'planner_tasks'/);
  assert.doesNotMatch(ecosystemSource, /'studyzone_activity'/);
});

test('scoped localStorage hook renders the safe default during key transitions', () => {
  assert.match(localStorageHookSource, /const keyIsHydrated = hydratedKeyRef\.current === key/);
  assert.match(localStorageHookSource, /if \(hydratedKeyRef\.current !== key\)/);
  assert.match(localStorageHookSource, /setStored\(readLocalValue\(key, initialRef\.current\)\)/);
  assert.match(localStorageHookSource, /if \(hydratedKeyRef\.current !== key\) return/);
  assert.match(localStorageHookSource, /return \[keyIsHydrated \? stored : initialRef\.current, setScopedStored\]/);
});
