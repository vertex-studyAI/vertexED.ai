# VertexED Stage 09 — full browser golden journey

**Gate: PARTIAL only at the live boundary.** The exact candidate passes 19 applicable
desktop/mobile browser accessibility and modal-focus checks (one inapplicable desktop
mobile-navigation case skipped) plus one deterministic authenticated golden journey.
The journey covers approved invite signup, the Google-link choice, onboarding and starter
plan, note generation, FRQ answer, verified feedback, remediation, persistence calls,
logout, relogin, return-route restoration and saved-work recovery. It also exposed and
fixed three product defects: the route guard made `/connect-google` unreachable before
onboarding, best-effort profile recovery could hold successful login navigation, and the
username constraint used a character class invalid under Chromium's HTML `/v` grammar.

Truth boundary: external services in the local golden test are explicit deterministic
mocks. The same journey was not executed against the deployed candidate. Real Google
OAuth, destructive-account cleanup, analytics delivery and two-account live denials still
require an authorized staging deployment, callback allowlist and two disposable identities.

Smallest unblock: provide that isolated surface, then run and clean up the two identities
while retaining redacted Playwright assertions and the attested revision.
