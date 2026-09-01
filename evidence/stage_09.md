# VertexED Stage 09 — full browser golden journey

**Gate: PARTIAL.** Logged-out landing/login/signup/admin-denial, overflow, keyboard focus,
unknown-route recovery, email-verification-first invite behavior, responsive layout and
accessibility assertions pass locally. Source tests cover onboarding, recovery, logout,
account deletion, persistence scoping and cross-account ownership.

Truth boundary: landing → authenticated onboarding → mock → answer → verified feedback
→ remediation → reload → logout → relogin was not executed against an exact deployed
revision. OAuth, destructive-account cleanup, analytics boundaries and two-account live
denials require an authorized staging deployment, callback allowlist and two disposable
identities. Screenshots/traces from an overloaded abandoned parallel run are not treated
as passing evidence.

Smallest unblock: provide that isolated surface, then run and clean up the two identities
while retaining redacted Playwright assertions and the attested revision.
