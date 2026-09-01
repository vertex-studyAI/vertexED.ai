# VertexED Stage 10 — observability, revision identity and operational control

**Gate: PARTIAL.** Source health/readiness fails closed in production when immutable
identity is missing, exposes revision in body/header, supports HEAD, and checks required
capabilities. The production smoke requires exact expected revision. Browser operational
events now use `/api/telemetry`, whose fixed schema retains only privacy-safe event class,
outcome, capability, normalized path, bounded duration and error class; prompts, answers,
identity, query text, messages and stacks are excluded. Monitoring and incident/rollback
documents identify the canonical target and gates.

Verification: telemetry tests PASS 4/4; health/revision and smoke-contract tests are in
the 707/707 green suite; production build validates 19 routes. Live checks at
2026-09-01T17:23:30Z returned HTTP 200 for liveness and the readiness query, but both
returned the same legacy body with no `status`, `revision`, capability checks or revision
header. Therefore the live readiness/revision gate is red.

Next action: deploy one immutable candidate through the owning Vercel project, then
require body/header revision, HEAD identity and readiness before any green claim.
