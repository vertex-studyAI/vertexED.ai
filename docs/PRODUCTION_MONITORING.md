# VertexED production monitoring

VertexED's public production surface is monitored by `.github/workflows/production-health.yml`.

## What the monitor checks

Every hour at minute 17 UTC, and on manual dispatch, the workflow verifies:

1. `https://www.vertexed.app/` returns HTTP 200, a non-empty body, and the `VertexED` product marker.
2. `https://www.vertexed.app/api/health` returns HTTP 200, a non-empty JSON body, and `ok: true`.

Each request uses bounded connection and total timeouts plus two retries for transient network failures. The workflow records response headers, response bodies, redirect destinations, HTTP status codes, and total request times.

## Evidence and incident behavior

- Every run uploads a `production-health-<run-id>` artifact retained for 14 days.
- A failed run opens one issue titled **Production health monitor failure**, or comments on the existing open issue instead of creating duplicates.
- A later successful run comments on and closes that incident automatically.
- The workflow still exits unsuccessfully after recording the evidence and incident, so GitHub Actions notifications remain meaningful.

The workflow grants its `GITHUB_TOKEN` only `contents: read` and `issues: write` permissions.

## Manual verification

From GitHub:

1. Open **Actions**.
2. Select **Production Health Monitor**.
3. Choose **Run workflow** on the default branch.
4. Inspect the job summary and the retained evidence artifact.

A manual run should be performed immediately after merging changes to the monitor and after any production DNS, hosting, routing, or health-handler change.

## Coverage boundary

This monitor covers logged-out availability only. It does not prove that authentication, Supabase policies, AI providers, waitlist approval, planner persistence, or administrator flows work. Those production journeys remain tracked in issue #13 and require disposable test identities and authorized production access.

## Response procedure

Follow `docs/PRODUCTION_INCIDENT_RUNBOOK.md` for named ownership, the first-five-minute response, stabilization order, provider-specific triage, rollback criteria, and evidence-backed closure.

At minimum:

1. Open the linked workflow run and download the evidence artifact.
2. Determine whether the failure is DNS, TLS, redirect, application response, health JSON, or latency related.
3. Check the Vercel deployment and function logs for the exact UTC timestamp.
4. Roll back only when evidence identifies the latest deployment as the cause.
5. Keep the incident open until a successful monitor run closes it automatically.
