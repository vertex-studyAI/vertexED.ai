# VertexED Production Incident Runbook

## Scope

This runbook covers public availability, dependency-readiness, and logged-out security-contract failures detected against `https://www.vertexed.app` and the production API. It does not replace authenticated journey certification, Supabase advisor checks, or provider-specific quality monitoring.

## Automated monitor

The `Production Health Monitor` GitHub Actions workflow runs hourly, can be started manually, and runs after relevant monitoring changes reach `main`. It verifies the public homepage, API liveness, dependency readiness, routing, validation, protected-route enforcement, and same-origin enforcement. It retains non-secret response and contract evidence for 14 days, opens or updates one incident when unhealthy, and records recovery when a later run passes.

Scheduled GitHub Actions can be delayed, so this is a release sentinel rather than a strict uptime SLA.

## Ownership

- **Primary triage:** `@build-the-future-11` and maintainers of `vertex-studyAI/vertexED.ai`.
- **Deployment and rollback:** a maintainer with access to both VertexED Vercel projects.
- **Database and authentication:** a maintainer with access to the production Supabase project.
- **AI providers and key rotation:** a maintainer with access to the affected provider dashboard.
- **User communication:** a VertexED co-founder after impact and recovery are verified.

Never put passwords, API keys, service-role keys, invite codes, raw user content, session tokens, or recovery links in GitHub issues or workflow logs.

## First five minutes

1. Open the failed workflow run linked from the incident and download the retained `production-health-<run-id>` artifact.
2. Identify the first failing layer: homepage delivery, liveness, dependency readiness, routing, waitlist validation, protected-route enforcement, or same-origin enforcement.
3. Record the first failing HTTP status, redirect target, request duration, UTC timestamp, and production commit.
4. Confirm the deployment identifiers in both Vercel projects. Do not assume they intentionally point to the same release.
5. Review Vercel deployment and function logs for the failing UTC window. Record request IDs and deployment IDs, not secret values or raw user content.
6. Check the production Supabase project status and sanitized logs when readiness, authentication, waitlist, or persistence is implicated.

## Failure interpretation

### Homepage failure

Start with DNS, TLS, redirects, Vercel delivery, and client bundle errors. Confirm whether API liveness and readiness remain healthy before rolling back the whole release.

### Liveness failure

A failed `/api/health` response indicates a serverless routing or runtime problem. Confirm the active Vercel function, route configuration, and latest deployment status.

### Readiness failure

A `503`, `status: degraded`, or false capability flag means required production configuration is absent from the active deployment. The response exposes booleans only:

- `authentication` — Supabase URL or anonymous-key configuration;
- `waitlist` — Supabase URL or service-role configuration;
- `coreAi` — OpenAI-compatible provider configuration;
- `plannerAi` — Gemini planner configuration.

Verify configuration presence and deployment scope in the relevant dashboard. Do not print, compare, or paste secret values.

### Protected-route or same-origin failure

Treat an unexpected non-401 response from protected APIs, or a non-403 response to the untrusted-origin probe, as a security incident. Stop release promotion, preserve evidence, and prefer rollback to the last certified deployment while the regression is investigated.

## Stabilization order

1. Stop further promotion of the suspect release.
2. Restore service with the smallest reversible action: retry a failed deployment, restore a known-good environment binding, correct deployment scope, or roll back to the last certified deployment.
3. Re-run `Production Health Monitor` manually.
4. Run `SMOKE_BASE_URL=https://www.vertexed.app npm run test:smoke` from a trusted checkout.
5. After public recovery, complete any affected authenticated golden-journey checks before declaring the incident fully resolved.

## AI-provider failures

Readiness verifies configuration presence, not provider quality or availability. The public monitor may remain green while a provider is degraded. For repeated chatbot, notes, quiz, paper, answer-review, or planner failures:

1. Identify the failing feature and provider from sanitized server logs.
2. Verify timeout, quota, authentication, and model-availability errors without printing request content or credentials.
3. Confirm the user receives a safe retry or fallback state rather than a blank screen or repeated chargeable request.
4. Rotate a key only when compromise or invalidation is supported by evidence. Record the rotation owner and timestamp, never the value.
5. Re-run the relevant authenticated journey and retain only non-secret evidence.

## Rollback criteria

Roll back when a new deployment causes sustained public unavailability, failed dependency readiness, blocked authentication, broken protected-route enforcement, lost saved planner content, or another security regression. Prefer the most recent deployment that passed the canonical release gate and public browser certification.

Do not roll back solely because an unrelated provider is briefly degraded when the application has a verified safe fallback.

## Closure criteria

An incident can close when:

- the production monitor passes;
- the public smoke contract passes;
- the production commit and both deployment identifiers are recorded;
- any affected authenticated journey is rechecked;
- the root cause and mitigation are documented without secrets;
- a separately owned issue exists for unresolved prevention work.
