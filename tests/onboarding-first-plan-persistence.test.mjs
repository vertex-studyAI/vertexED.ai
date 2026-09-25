import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const onboardingSource = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');

test('onboarding cannot report completion when the starter plan failed to persist anywhere', () => {
  const saveCall = onboardingSource.indexOf('const planResult = await savePlannerSnapshot(');
  const persistenceGate = onboardingSource.indexOf('if (!planResult.ok) {');
  const profileWrite = onboardingSource.indexOf('const metadata = buildCurriculumMetadata(');
  const completionEvent = onboardingSource.indexOf('trackProductEvent("Onboarding Completed"');
  const welcomeMarker = onboardingSource.indexOf('markFirstSessionWelcome(handoffStorage, initiatingAccountId)');
  const dashboardNavigation = onboardingSource.indexOf('navigate("/main", { replace: true })', completionEvent);

  assert.ok(saveCall >= 0, 'starter planner save must exist');
  assert.ok(persistenceGate > saveCall, 'persistence result must be checked after the planner save');
  assert.ok(profileWrite > persistenceGate, 'profile mutation must not precede the persistence gate');
  assert.ok(completionEvent > persistenceGate, 'completion analytics must not precede the persistence gate');
  assert.ok(welcomeMarker > persistenceGate, 'welcome handoff must not precede the persistence gate');
  assert.ok(dashboardNavigation > persistenceGate, 'dashboard navigation must not precede the persistence gate');
  assert.match(
    onboardingSource,
    /if \(!planResult\.ok\) \{\s*throw new Error\(planResult\.error \|\| "Could not save your starter plan\."\);\s*\}/,
  );
});
