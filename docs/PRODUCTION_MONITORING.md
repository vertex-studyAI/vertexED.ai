# Production Monitoring

## Purpose

VertexED's release workflow verifies production after a successful push. The separate `Production Monitor` workflow checks the live public service between releases so a routing, deployment, or authorization regression can be detected without waiting for another commit.

## Cadence

- Runs hourly at minute 17 UTC from the latest commit on the default branch.
- Can be started manually with `workflow_dispatch` for incident verification or post-recovery checks.
- Uses a dedicated concurrency group so an older probe cannot overlap a newer run.

## Monitored contract

The workflow reuses `scripts/smoke-deploy.mjs` and verifies:

- `GET /api/health` returns `200`, `{ ok: true }`, and the `X-Vertex-API` routing marker.
- Unknown API routes return `404`.
- The homepage returns `200`.
- Invalid waitlist input is rejected with `400`.
- Protected user and administrator APIs reject unauthenticated requests with `401`.
- An untrusted cross-origin request is rejected with `403`.

These checks are deliberately public and non-destructive. They do not replace authenticated production certification, live AI-provider verification, Supabase policy inspection, or user-journey monitoring.

## Reliability and evidence

Each run makes up to three attempts with a 30-second pause between failures. The job fails only when all attempts fail. Every run uploads `production-monitor.log` for 14 days and writes a concise result to the GitHub Actions job summary.

The retained log records the target, repository commit, UTC timestamps, each attempt, and the exact smoke-test output. It must not include credentials, cookies, user data, invite codes, or secret environment values.

## Failure response

Treat a failed scheduled run as a production incident signal, not proof of root cause.

1. Open the failed `Production Monitor` run and inspect the uploaded log.
2. Re-run the workflow manually once to distinguish a transient network failure from a persistent regression.
3. Check the two Vercel deployment statuses and recent production changes.
4. If the health route, homepage, or authorization contract remains broken, pause new releases and either roll back to the last certified commit or apply the smallest verified fix.
5. Record the incident, affected interval, evidence, root cause, corrective action, and recovery run.

Repository maintainers should ensure GitHub Actions failure notifications are routed to an actively monitored inbox or team channel. A named incident owner and escalation destination remain operational configuration, not repository code.

## Platform limitation

GitHub runs scheduled workflows from the default branch. Public-repository schedules can be disabled after a long period without repository activity, so the workflow should also be reviewed during the release review and can be run manually at any time.
