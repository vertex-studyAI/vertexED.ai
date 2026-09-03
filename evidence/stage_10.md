# VertexED Stage 10 — observability, revision identity and operational control

**Gate: PARTIAL.** Source health/readiness fails closed in production when immutable
identity is missing, exposes revision in body/header, supports HEAD, and checks required
capabilities. The production smoke requires exact expected revision. Browser operational
events now use `/api/telemetry`, whose fixed schema retains only privacy-safe event class,
outcome, capability, normalized path, bounded duration and error class; prompts, answers,
identity, query text, messages and stacks are excluded. Monitoring and incident/rollback
documents identify the canonical target and gates.

Verification: telemetry tests PASS 4/4; health/revision and smoke-contract tests are in
the 745/745 green suite; production build validates 19 routed endpoints. A live check at
2026-09-02T11:11:33Z returned HTTP 200 for the readiness query, but served the legacy
88-byte liveness envelope with no `status`, `revision`, capability checks,
`X-VertexED-Revision`, or `X-VertexED-Health` header. Therefore the live
readiness/revision gate is red.

Next action: deploy one immutable candidate through the owning Vercel project, then
require body/header revision, HEAD identity and readiness before any green claim.
