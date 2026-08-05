# VertexED Production Monitoring

## Purpose

The `Production Monitor` GitHub Actions workflow provides an external, recurring check of the live VertexED deployment at `https://www.vertexed.app`. It runs independently of Vercel deployments so a later outage or routing regression is visible even when no code has changed.

## Cadence

- Scheduled hourly at minute 17 UTC to avoid the busiest top-of-hour scheduling window.
- Available on demand through `workflow_dispatch`.
- Concurrent runs are collapsed so a delayed run does not create duplicate monitoring work.

GitHub may delay scheduled workflows during periods of high Actions load. This monitor is therefore an hourly release-safety signal, not a real-time uptime service or SLA.

## Checks

The workflow reuses `scripts/smoke-deploy.mjs` and verifies:

1. `/api/health` returns HTTP 200, reports `ok`, and includes the Vertex API router marker.
2. Unknown API routes return HTTP 404.
3. The public homepage returns HTTP 200.
4. Invalid waitlist input is rejected with HTTP 400.
5. Protected AI, user-content, and administrator endpoints reject unauthenticated requests with HTTP 401.
6. The API rejects an untrusted cross-origin request with HTTP 403.

The checks are intentionally read-only and use no production credentials.

## Evidence

Every run records:

- the production target;
- UTC execution time;
- repository commit used for the monitor;
- full smoke-test output;
- the job result in the GitHub Actions summary.

The raw log is retained as a workflow artifact for 30 days, including failed runs.

## Alert ownership

The repository maintainers own failed monitor runs. GitHub Actions notifications should remain enabled for workflow failures. The first responder should:

1. Open the failed `Production Monitor` run and download its log artifact.
2. Determine whether the failure is deployment propagation, Vercel/API routing, Supabase/auth configuration, or a public-page outage.
3. Compare the failure with Vercel and Supabase logs without copying secrets into GitHub.
4. Roll back only when the failure began with a known release and the previous production deployment is verified healthy.
5. Record the incident, affected checks, start and recovery times, root cause, and corrective action in a GitHub issue.

## Boundaries

This monitor does not certify authenticated user journeys, live AI-provider quality, planner persistence, email delivery, or administrator operations. Those remain part of issue #13 and require disposable production identities and secure access to the production environment.

## References

- GitHub Actions workflow syntax and scheduled events: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- Secure workflow permissions: https://docs.github.com/en/actions/reference/security/secure-use
