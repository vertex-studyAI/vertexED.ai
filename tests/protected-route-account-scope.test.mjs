import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/ProtectedRoute.tsx', 'utf8');

test('private-beta access decisions are stored with the user they belong to', () => {
  assert.match(source, /const \[accessUserId, setAccessUserId\] = useState<string \| null>\(null\)/);
  assert.match(source, /setAccess\("approved"\);[\s\S]*?setAccessUserId\(user\.id\)/);
  assert.match(source, /setAccess\(data\.status === "approved"[\s\S]*?setAccessUserId\(user\.id\)/);
  assert.match(source, /setAccess\("unavailable"\);[\s\S]*?setAccessUserId\(user\.id\)/);
});

test('an old account cannot reuse a prior approved decision for one render', () => {
  assert.match(source, /const accessDecisionIsCurrent = Boolean\(user && accessUserId === user\.id\);/);
  assert.match(
    source,
    /if \(loading \|\| \(user && \(!accessDecisionIsCurrent \|\| access === "checking"\)\)\) return <PageLoader label="Checking your access" \/>;/,
  );

  const identityCheck = source.indexOf('const accessDecisionIsCurrent = Boolean(user && accessUserId === user.id);');
  const accessGate = source.indexOf('if (loading || (user && (!accessDecisionIsCurrent || access === "checking")))', identityCheck);
  const children = source.lastIndexOf('return children;');
  assert.ok(identityCheck >= 0 && identityCheck < accessGate, 'current identity must be verified before evaluating the route');
  assert.ok(accessGate < children, 'a stale access decision must fail closed before protected children can render');
});
