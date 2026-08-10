import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const loginSource = fs.readFileSync('src/pages/Login.tsx', 'utf8');
const authSource = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
const connectGoogleSource = fs.readFileSync('src/pages/ConnectGoogle.tsx', 'utf8');

test('private-beta signup stays invite-gated while Google is presented as linked sign-in', () => {
  assert.match(authSource, /Direct signup is disabled\. Use \/signup with a waitlist approval or team invite code\./);
  assert.match(connectGoogleSource, /supabase\.auth\.linkIdentity\(/);
  assert.match(loginSource, /Sign in with Google/);
  assert.match(loginSource, /beta accounts that have already connected Google/);
  assert.match(loginSource, /Waitlist or invite signup/);
  assert.doesNotMatch(loginSource, /Continue with Google/);
});
