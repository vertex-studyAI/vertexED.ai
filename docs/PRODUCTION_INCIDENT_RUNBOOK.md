# VertexED production incident runbook

## Scope

This runbook covers public availability, dependency-readiness, and logged-out security-contract failures detected against `https://www.vertexed.app`.

It does not replace authenticated production certification, Supabase security-advisor remediation, provider-specific quality evaluation, or user-support investigation.

## Automated evidence

The **Production Health Monitor** runs hourly, on manual dispatch, and after relevant monitoring changes reach `main`. It retains a 14-day artifact containing:

- homepage, liveness, and readiness response headers and bodies;
- effective URLs, HTTP status codes, and request durations;
- the output of `scripts/smoke-deploy.mjs`;
- the production commit and workflow-run link.

A failure opens or updates one issue titled **Production health monitor failure**. A later successful run records recovery and closes that issue automatically.

## Ownership

- **Primary triage:** repository maintainers.
- **Deployment and rollback:** a maintainer with access to both VertexED Vercel projects.
- **Database and authentication:** a maintainer with access to the production Supabase project.
- **AI providers and key rotation:** a maintainer with access to the affected provider dashboard.
- **User communication:** a VertexED co-founder after impact and recovery are verified.

Never put passwords, API keys, service-role keys, invite codes, session tokens, recovery links, raw prompts, or user content in GitHub issues, workflow logs, screenshots, or shared documents.

## First five minutes

1. Open the failed workflow run linked from the incident.
2. Download the `production-health-<run-id>` artifact.
3. Identify the first failing layer:
   - homepage delivery;
   - liveness;
   - dependency readiness;
   - routing or unknown-route behavior;
   - waitlist validation;
   - protected-route enforcement;
   - same-origin enforcement.
4. Record the UTC failure time, production commit, and both Vercel deployment identifiers.
5. Check whether both Vercel projects intentionally point to the same release.
6. Review Vercel deployment and function logs for the failing time window. Record request and deployment identifiers, not secrets or raw user data.
7. Check Supabase status and sanitized logs when readiness, authentication, waitlist, or persistence is implicated.

## Failure interpretation

### Homepage failure

Start with DNS, TLS, redirects, Vercel deployment delivery, and client bundle errors. Confirm whether the API remains healthy before rolling back the whole release.

### Liveness failure

Treat a failed `/api/health` response as a serverless routing or runtime outage. Confirm the active Vercel function, route configuration, and latest deployment status.

### Readiness failure

A `503`, `status: degraded`, or false capability flag means required production configuration is missing or not visible to the active deployment. Use only the named boolean capability to narrow the owner:

- `authentication` — Supabase URL or anonymous-key configuration;
- `waitlist` — Supabase URL or service-role configuration;
- `coreAi` — OpenAI-compatible provider configuration;
- `plannerAi` — Gemini planner configuration.

Do not print or compare secret values in logs. Verify presence and deployment scope in the provider or hosting dashboard.

### Protected-route or CORS failure

Treat an unexpected non-401 response from protected APIs, or a non-403 response to the untrusted-origin probe, as a security incident. Stop promotion of the release, preserve evidence, and prefer rollback to the last certified deployment while the regression is investigated.

### AI-provider failure with green readiness

Readiness verifies configuration presence, not provider quality or availability. For repeated chatbot, notes, quiz, paper, answer-review, or planner failures:

1. identify the affected feature and provider from sanitized server logs;
2. check timeout, quota, authentication, and model-availability errors;
3. confirm the UI exposes a safe retry or fallback state;
4. rotate a key only when compromise or invalidation is supported by evidence;
5. rerun the affected authenticated journey with a disposable test identity.

## Stabilization order

1. Stop further promotion of the suspect release.
2. Restore availability with the smallest reversible action:
   - retry a failed deployment;
   - restore a known-good environment binding;
   - correct deployment scope;
   - roll back to the latest certified deployment.
3. Run **Production Health Monitor** manually.
4. From a trusted checkout, run:

   ```bash
   SMOKE_BASE_URL=https://www.vertexed.app npm run test:smoke
   ```

5. Recheck any affected authenticated golden journey before declaring full recovery.

## Rollback criteria

Roll back when a new deployment causes sustained public unavailability, failed dependency readiness, blocked authentication, broken protected-route enforcement, lost saved planner content, or another security regression.

Prefer the newest deployment that passed the canonical release gate and live production certification. Do not roll back solely because an unrelated provider is briefly degraded when the application has a verified safe fallback.

## Closure criteria

The incident can close when:

- the production monitor passes;
- the public smoke contract passes;
- the production commit and both deployment identifiers are recorded;
- affected authenticated journeys are rechecked;
- the root cause and mitigation are documented without secrets;
- unresolved prevention work has a separately owned issue and measurable completion condition.
