# VertexED Production Monitoring

## Scope

The scheduled GitHub Actions workflow at `.github/workflows/production-health.yml` runs the existing public production smoke suite against `https://www.vertexed.app` at minutes 17 and 47 of every hour. It can also be triggered manually from the Actions tab.

The monitor verifies:

- `/api/health` returns HTTP 200, an `ok` response, and the Vertex API marker header
- unknown API routes return HTTP 404
- the homepage returns HTTP 200
- malformed waitlist input is rejected with HTTP 400
- protected AI, user-content, and administrator routes reject logged-out requests with HTTP 401
- untrusted cross-origin API requests are rejected with HTTP 403

The checks use no production credentials, invite codes, user records, or sensitive prompts.

## Evidence

Every run uploads `production-health-evidence`, containing the timestamped smoke log, with 14-day retention. A failing run remains red after incident handling so GitHub Actions notifications and branch status clearly show the outage.

## Incident lifecycle

On failure, the workflow searches for an open issue titled `[incident] VertexED production health check failed`.

- If no matching issue exists, it opens one with the target, UTC timestamp, commit, and workflow-run link.
- If an issue is already open, it adds the latest failed run as a comment rather than creating duplicates.
- When a later run passes, it closes the open incident with a recovery timestamp and verification link.

The workflow grants the built-in `GITHUB_TOKEN` only `contents: read` and `issues: write`.

## Ownership and response

The incident owner should:

1. Open the failed workflow run and download `production-health-evidence`.
2. Check both Vercel production projects for deployment divergence or runtime errors.
3. Confirm Supabase availability and recent authentication or database failures.
4. Promote the last known healthy deployment if the current release is unhealthy.
5. Record the affected route, first known failure, root cause, mitigation, and certified recovery run in the incident issue.

Do not paste secrets, service-role keys, invite codes, user credentials, or sensitive prompts into workflow logs or issues.

## Limitations

This monitor covers public availability and logged-out security contracts. It does not replace issue #13, which requires disposable production identities and secure production access to certify authenticated administration, account creation, OAuth, AI-provider calls, and cross-session persistence.

Scheduled workflows run from the latest commit on the default branch. GitHub may disable scheduled workflows in inactive public repositories, so repository owners should verify the workflow remains enabled during release reviews.
