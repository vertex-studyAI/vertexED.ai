# VertexED Stage 09 — full browser golden journey

**Gate: PARTIAL only at the live boundary.** Exact candidate
`9cb1c81de9725152ad46c8928c1b0556f1251131` passes 34 applicable
accessibility/responsive checks (two inapplicable tablet/desktop mobile-navigation cases
skipped) and one production-preview authenticated golden journey. The runtime parent also
passed three consecutive production-preview repetitions while the auth-lock repair was
stress-tested.

The asserted journey covers approved invite signup, production waitlist approval, the
Google-link choice, onboarding and starter-plan persistence, note generation, FRQ answer,
verified feedback, remediation, cloud persistence calls, logout, relogin, return-route
restoration and saved-work recovery. The suite fails on browser console/page errors and
uses assertions—not screenshots—as the gate. It exposed and fixed a serialized Supabase
session-lock race by synchronizing an in-memory access token from auth events and avoiding
redundant `getSession()` calls in the learner critical path.

Truth boundary: Supabase, invite, AI and persistence services are deterministic local
mocks. Real Google OAuth, password-recovery delivery, destructive cleanup, analytics
delivery, deployed revision attestation and live two-account denials require an authorized
staging/production surface and disposable identities.
