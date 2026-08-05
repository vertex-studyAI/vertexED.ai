# VertexED Production Incident Runbook

## Scope

This runbook covers public availability failures detected against `https://www.vertexed.app` and the production API. It does not replace authenticated journey certification, Supabase advisor checks, or provider-specific monitoring.

## Automated monitor

The `Production Health Monitor` GitHub Actions workflow runs hourly and can also be started manually. It verifies the public homepage and `/api/health`, retains non-secret response evidence for 14 days, opens or updates one incident when unhealthy, and records recovery when a later run passes.

Scheduled GitHub Actions can be delayed, so this is a lightweight sentinel rather than a strict uptime SLA.

## Ownership

- **Primary triage:** `@build-the-future-11` and maintainers of `vertex-studyAI/vertexED.ai`.
- **Deployment and rollback:** a maintainer with access to both VertexED Vercel projects.
- **Database and key rotation:** a maintainer with access to the production Supabase project and the affected provider dashboard.
- **User communication:** a VertexED co-founder after impact and recovery are verified.

Never put passwords, API keys, service-role keys, invite codes, raw user content, session tokens, or recovery links in GitHub issues or workflow logs.

## First five minutes

1. Open the failed workflow run linked from the incident and download the retained health artifact.
2. Identify the first failing probe, HTTP status, redirect target, and timestamp.
3. Determine whether the homepage, API health endpoint, or both are affected.
4. Confirm the production commit and deployment identifiers in both Vercel projects. Do not assume they intentionally point to the same release.
5. Review Vercel deployment and function logs for the failing UTC window. Record request IDs and deployment IDs, not secret values or raw user content.
6. Check the production Supabase project status and logs when the API or authenticated journeys indicate a database dependency failure.

## Stabilization order

1. Stop further promotion of the suspect release.
2. Restore availability with the smallest reversible action: retry a failed deployment, restore a known-good environment binding, or roll back to the last certified deployment.
3. Re-run `Production Health Monitor` manually.
4. Run `SMOKE_BASE_URL=https://www.vertexed.app npm run test:smoke` from a trusted checkout.
5. After public recovery, complete any affected authenticated golden-journey checks before declaring the incident fully resolved.

## AI-provider failures

The public monitor may remain green while an AI provider is degraded. For repeated chatbot, notes, quiz, paper, answer-review, or planner failures:

1. Identify the failing feature and provider from sanitized server logs.
2. Verify timeout, quota, authentication, and model-availability errors without printing request content or credentials.
3. Confirm the user receives a safe retry or fallback state rather than a blank screen or repeated chargeable request.
4. Rotate a key only when compromise or invalidation is supported by evidence. Record the rotation owner and timestamp, never the value.
5. Re-run the relevant authenticated journey and retain only non-secret evidence.

## Rollback criteria

Roll back when a new deployment causes sustained public unavailability, blocks authentication, breaks protected-route enforcement, loses saved planner content, or creates a security regression. Prefer the most recent deployment that passed the canonical release gate and public browser certification.

## Closure criteria

An incident can close when:

- the scheduled or manual production monitor passes;
- the public smoke suite passes;
- the production commit and deployment identifiers are recorded;
- any affected authenticated journey is rechecked;
- a follow-up issue exists for unresolved root cause or prevention work.
