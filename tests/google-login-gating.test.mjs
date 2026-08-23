import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const loginSource = fs.readFileSync('src/pages/Login.tsx', 'utf8');
const authSource = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
const connectGoogleSource = fs.readFileSync('src/pages/ConnectGoogle.tsx', 'utf8');
const userSettingsSource = fs.readFileSync('src/pages/UserSettings.tsx', 'utf8');
const callbackSource = fs.readFileSync('src/pages/AuthCallback.tsx', 'utf8');

test('private-beta signup stays invite-gated while Google is presented as linked sign-in', () => {
  assert.match(authSource, /Direct signup is disabled\. Use \/signup with a waitlist approval or team invite code\./);
  assert.match(connectGoogleSource, /supabase\.auth\.linkIdentity\(/);
  assert.match(loginSource, /Sign in with Google/);
  assert.match(loginSource, /beta accounts that have already connected Google/);
  assert.match(loginSource, /waitlist or invite signup/i);
  assert.doesNotMatch(loginSource, /Continue with Google/);
});

test('Google identity linking preserves the initiating account-settings route', () => {
  assert.match(
    userSettingsSource,
    /sessionStorage\.setItem\("vertex_google_link_return", "\/user-settings"\)/,
  );
  assert.match(
    userSettingsSource,
    /catch \(err\) \{[\s\S]*?sessionStorage\.removeItem\("vertex_google_link_return"\)/,
  );
  assert.match(
    callbackSource,
    /sessionStorage\.getItem\("vertex_google_link_return"\)/,
  );
  assert.match(callbackSource, /navigate\(returnAfterGoogleLink, \{ replace: true \}\)/);
});
