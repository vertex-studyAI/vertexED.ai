import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/hooks/useIsAdmin.ts', 'utf8');

test('admin decisions are bound to the identity they were resolved for', () => {
  assert.match(
    source,
    /const \[resolvedUserId, setResolvedUserId\] = useState<string \| null \| undefined>\(undefined\)/,
  );
  assert.match(source, /setResolvedUserId\(user\.id\);[\s\S]*?setLoading\(false\);/);
  assert.match(source, /setResolvedUserId\(null\);[\s\S]*?setLoading\(false\);/);
});

test('an old admin decision fails closed synchronously across account transitions', () => {
  assert.match(source, /const currentUserId = user\?\.id \?\? null;/);
  assert.match(
    source,
    /const adminDecisionIsCurrent = !authLoading && resolvedUserId === currentUserId;/,
  );
  assert.match(source, /isAdmin: adminDecisionIsCurrent \? isAdmin : false,/);
  assert.match(source, /loading: authLoading \|\| loading \|\| !adminDecisionIsCurrent,/);

  const currentId = source.indexOf('const currentUserId = user?.id ?? null;');
  const currentDecision = source.indexOf('const adminDecisionIsCurrent = !authLoading && resolvedUserId === currentUserId;', currentId);
  const returnedAdmin = source.indexOf('isAdmin: adminDecisionIsCurrent ? isAdmin : false,', currentDecision);
  assert.ok(currentId >= 0 && currentId < currentDecision, 'current identity must be derived before validating the decision');
  assert.ok(currentDecision < returnedAdmin, 'stale decisions must be rejected before admin access is returned');
});
