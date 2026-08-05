# VertexED production monitoring

VertexED's public production surface is monitored by `.github/workflows/production-health.yml`.

## When it runs

The workflow runs every hour at minute 17 UTC, on manual dispatch, and immediately after relevant monitor, smoke-contract, or health-handler changes reach `main`.

The scheduled offset reduces top-of-hour congestion. Scheduled GitHub Actions can still be delayed, so this is a release sentinel and incident trigger rather than a strict uptime SLA.

## What the monitor checks

The workflow verifies `https://www.vertexed.app` without production credentials or test-user data.

### Availability and readiness probes

It records response headers, response bodies, redirect destinations, HTTP status codes, and total request times for:

1. `/` — HTTP 200, a non-empty body, and the `VertexED` product marker;
2. `/api/health` — HTTP 200, `ok: true`, `status: alive`, and `X-VertexED-Health: alive`;
3. `/api/health?readiness=1` — HTTP 200, `ok: true`, `status: ready`, `X-VertexED-Health: ready`, and positive non-secret capability evidence for authentication, waitlist account creation, core AI, and planner AI.

Readiness exposes booleans only. It never returns API keys, database credentials, invite codes, or provider configuration values.

### Public security contract

The workflow then runs the repository-owned `scripts/smoke-deploy.mjs` contract. It verifies:

- liveness and dependency readiness;
- API router identity and unknown-route handling;
- homepage availability;
- malformed waitlist input rejection before data creation;
- logged-out rejection for AI, user-content, and administrator APIs;
- rejection of untrusted cross-origin API requests.

Using the same script for release smoke checks and scheduled monitoring prevents the two definitions from drifting.

## Evidence and incident behavior

- Every run uploads a `production-health-<run-id>` artifact retained for 14 days.
- The artifact contains headers, bodies, timing and redirect metrics, a Markdown summary, and the full public security-contract log.
- A failed run opens one issue titled **Production health monitor failure**, or comments on the existing open issue instead of creating duplicates.
- A later successful run comments on and closes that incident automatically.
- The workflow still exits unsuccessfully after recording evidence and incident context, so GitHub Actions notifications remain meaningful.

The workflow grants its `GITHUB_TOKEN` only `contents: read` and `issues: write` permissions.

## Manual verification

From GitHub:

1. Open **Actions**.
2. Select **Production Health Monitor**.
3. Choose **Run workflow** on `main`.
4. Confirm the availability/readiness probe, public security contract, and evidence upload all pass.
5. Download the artifact when investigating any warning or release change.

## Coverage boundary

This monitor proves public availability, required production configuration, and logged-out security behavior. It does not prove authenticated account creation, OAuth, administrator actions, AI response quality, cross-session planner persistence, or account deletion. Those journeys remain tracked in issue #13 and require disposable test identities and authorized production access.

## Response procedure

Follow `docs/PRODUCTION_INCIDENT_RUNBOOK.md` for named ownership, first-response steps, stabilization, provider-specific triage, rollback criteria, and evidence-backed closure.

At minimum:

1. Open the linked workflow run and download the evidence artifact.
2. Identify whether the first failure is homepage delivery, liveness, readiness, routing, validation, protected-route enforcement, or same-origin enforcement.
3. Check Vercel and Supabase logs for the exact UTC timestamp without copying secrets or user content.
4. Roll back only when evidence identifies the current release as the cause.
5. Keep the incident open until a successful monitor run closes it automatically.
