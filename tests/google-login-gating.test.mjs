import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const loginSource = fs.readFileSync('src/pages/Login.tsx', 'utf8');
const authSource = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
const connectGoogleSource = fs.readFileSync('src/pages/ConnectGoogle.tsx', 'utf8');
const userSettingsSource = fs.readFileSync('src/pages/UserSettings.tsx', 'utf8');
const callbackSource = fs.readFileSync('src/pages/AuthCallback.tsx', 'utf8');
const authReturnSource = fs.readFileSync('src/lib/authReturn.mjs', 'utf8');

test('private-beta signup stays invite-gated while Google is presented as linked sign-in', () => {
  assert.match(authSource, /Direct signup is disabled\. Use \/signup with a waitlist approval or team invite code\./);
  assert.match(connectGoogleSource, /supabase\.auth\.linkIdentity\(/);
  assert.match(loginSource, /Sign in with Google/);
  assert.match(loginSource, /Google account connected to your VertexED beta access/);
  assert.match(loginSource, /Join the beta or use an invite/i);
  assert.doesNotMatch(loginSource, /Continue with Google/);
});

test('only account settings owns the Google-link return marker through the fail-closed storage boundary', () => {
  assert.doesNotMatch(connectGoogleSource, /vertex_google_link_return/);
  assert.match(userSettingsSource, /prepareGoogleLinkReturn\(window\)/);
  assert.match(userSettingsSource, /clearGoogleLinkReturn\(window\)/);
  assert.doesNotMatch(userSettingsSource, /sessionStorage\.(?:getItem|setItem|removeItem)/);

  assert.match(callbackSource, /consumeGoogleLinkReturn\(window\)/);
  assert.doesNotMatch(callbackSource, /window\.sessionStorage/);
  assert.match(callbackSource, /navigate\(returnAfterGoogleLink, \{ replace: true \}\)/);

  assert.match(authReturnSource, /resolveSessionStorage\(owner\)/);
  assert.match(authReturnSource, /safeStorageSet\([\s\S]*GOOGLE_LINK_RETURN_KEY/);
  assert.match(authReturnSource, /safeStorageRemove\([\s\S]*GOOGLE_LINK_RETURN_KEY/);
});