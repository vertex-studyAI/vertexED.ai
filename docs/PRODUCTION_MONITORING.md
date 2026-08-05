# VertexED production monitoring

VertexED's public production surface is monitored by
`.github/workflows/production-health.yml` using the same
`scripts/smoke-deploy.mjs` contract used for release smoke verification.

## Schedule and validation

The workflow runs:

- every hour at minute 17 UTC;
- on manual dispatch;
- after the workflow or smoke contract reaches `main`;
- on pull requests that change either file, without opening or closing
  production incident issues.

Each production run permits three bounded attempts. Individual requests use a
20-second timeout, and retry delays remain bounded so the job cannot run
indefinitely.

## What the monitor checks

The canonical public smoke contract verifies:

1. `/api/health` returns HTTP 200, `ok: true`, and the expected Vertex API
   router header.
2. An unknown API route returns HTTP 404 instead of the application shell.
3. The public homepage returns HTTP 200.
4. `/api/waitlist` rejects malformed email input with HTTP 400.
5. `/api/ask` rejects a logged-out request with HTTP 401.
6. `/api/user-content` rejects a logged-out request with HTTP 401.
7. `/api/admin-status` rejects a logged-out request with HTTP 401.
8. The API rejects an untrusted cross-origin request with HTTP 403.

The monitor does not create waitlist entries, authenticate users, call an AI
provider successfully, or alter user-owned data.

## Evidence and incident behavior

- Every run uploads a non-secret `production-health-<run-id>` log retained for
  14 days.
- The job summary records the UTC check time, target, attempt limit, result, and
  coverage boundary.
- A failed scheduled, manual, or default-branch run opens one issue titled
  **Production health monitor failure**, or comments on the existing open issue
  instead of creating duplicates.
- A later successful production run comments on and closes that incident.
- Pull-request validation records evidence and fails normally, but never mutates
  production incident issues.
- The workflow exits unsuccessfully after recording evidence and the incident,
  so GitHub Actions notifications remain meaningful.

The workflow grants its `GITHUB_TOKEN` only `contents: read` and `issues: write`
permissions. It uses no production credentials or user data.

## Manual verification

From GitHub:

1. Open **Actions**.
2. Select **Production Health Monitor**.
3. Choose **Run workflow** on the default branch.
4. Inspect the job summary and retained evidence artifact.

A manual run should be performed immediately after merging the monitor and after
any production DNS, hosting, routing, authentication-boundary, CORS, waitlist,
or health-handler change.

## Coverage boundary

This monitor proves logged-out availability and selected public security
invariants only. It does not prove:

- administrator approval;
- approval-link or team-invite account creation;
- email/password or Google OAuth browser journeys;
- successful AI-provider output;
- semantic correctness of notes, quizzes, papers, reviews, or plans;
- persistence after a fresh session;
- logout and post-logout rejection;
- account cleanup.

Those production journeys remain tracked in issue #13 and require disposable
test identities plus authorized production access.

## Response procedure

Follow `docs/PRODUCTION_INCIDENT_RUNBOOK.md` for named ownership, the first-five-minute response, stabilization order, provider-specific triage, rollback criteria, and evidence-backed closure.

At minimum:

1. Open the linked workflow run and inspect the retained smoke log.
2. Identify the first failed invariant and its exact HTTP result.
3. Correlate the UTC timestamp with Vercel and Supabase logs.
4. Determine whether the failure is DNS/TLS, routing, application availability,
   waitlist validation, authentication enforcement, or CORS enforcement.
5. Roll back only when evidence identifies the latest deployment as the cause.
6. Keep the incident open until a successful production monitor run closes it
   automatically.
