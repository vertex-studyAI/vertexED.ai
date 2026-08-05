# VertexED production monitoring

VertexED's public production surface is monitored by `.github/workflows/production-health.yml`.

## When it runs

The workflow runs:

- every hour at minute 17 UTC;
- on manual dispatch;
- immediately after changes to the monitor, deployment smoke contract, or health handler reach `main`.

The scheduled offset reduces top-of-hour scheduler congestion. Scheduled GitHub Actions can still be delayed, so this is a release sentinel and incident trigger rather than a strict uptime SLA.

## What it verifies

The monitor checks `https://www.vertexed.app` without production credentials or test-user data.

### Availability and readiness probes

It records headers, bodies, effective URLs, HTTP status codes, and total request times for:

1. `/` — HTTP 200, non-empty body, and the `VertexED` product marker;
2. `/api/health` — HTTP 200, `ok: true`, `status: alive`, and `X-VertexED-Health: alive`;
3. `/api/health?readiness=1` — HTTP 200, `ok: true`, `status: ready`, `X-VertexED-Health: ready`, and positive non-secret capability evidence for authentication, waitlist account creation, core AI, and planner AI.

Readiness exposes booleans only. It never returns API keys, database credentials, invite codes, or provider configuration values.

### Public security contract

The workflow then runs the repository-owned `scripts/smoke-deploy.mjs` contract. This verifies:

- liveness and dependency readiness;
- API router identity and unknown-route handling;
- homepage availability;
- malformed waitlist input rejection before data creation;
- logged-out rejection for AI, user-content, and administrator APIs;
- rejection of untrusted cross-origin API requests.

Using the same script for release smoke checks and scheduled monitoring prevents the two definitions from drifting.

## Evidence and incident behavior

Every run uploads `production-health-<run-id>` for 14 days. The artifact contains:

- response headers and bodies;
- timing and redirect metrics;
- a Markdown summary;
- the full public security-contract log.

A failure opens one issue titled **Production health monitor failure**, or comments on the existing open issue instead of creating duplicates. A later successful run comments on and closes that incident automatically. The workflow still finishes unsuccessfully after evidence and incident handling so GitHub Actions notifications remain meaningful.

The workflow grants its `GITHUB_TOKEN` only `contents: read` and `issues: write`.

## Manual verification

1. Open **Actions** in the repository.
2. Select **Production Health Monitor**.
3. Choose **Run workflow** on `main`.
4. Confirm the probe, public security contract, and evidence upload all pass.
5. Download the artifact when investigating any warning or release change.

Follow `docs/PRODUCTION_INCIDENT_RUNBOOK.md` for triage, stabilization, rollback, and closure.

## Coverage boundary

This monitor proves public availability, configured production capabilities, and logged-out security behavior. It does not prove authenticated account creation, OAuth, administrator actions, AI response quality, cross-session planner persistence, or account deletion. Those journeys remain tracked in issue #13 and require authorized disposable production identities.
