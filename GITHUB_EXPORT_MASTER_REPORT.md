# GitHub Export Master Report

> Updated 27 September: this is the retained 25 September checkpoint. Current integration, verification and incomplete release status are recorded in [the checklist execution report](docs/CHECKLIST_EXECUTION_2026-09-27.md) and its evidence index. Historical pending statements below are not the current test result. Production remains NO-GO.

Date: 2026-09-25. Workspace: `/Volumes/PRO-BLADE/GitHub-Every-Repo/VertexED`.
One legitimate project was discovered recursively. Dependency/cache/build
surfaces and unrelated sibling portfolio repositories are outside the project
inventory. No project was split, deleted or manufactured.

| Project | Local Path | GitHub Repo | Final SHA | Build | Tests | Paper | CI | Export | Blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VertexED | `.` | [vertex-studyAI/vertexED.ai](https://github.com/vertex-studyAI/vertexED.ai) | Review branch HEAD (resolve below) | Pending | Pending | N/A | Existing CI; desk coverage added | Pending | Production TLS/readiness, database replay, live journeys and human approval |

The final export SHA is the commit containing this report, resolved with
`git rev-parse HEAD` on `codex/final-release-export-20260925`. A report cannot
embed its own Git object hash. The local post-push receipt and task completion
message record the exact final SHA and compare it with the remote branch.

## Successfully Exported

Pending final gate and remote verification.

## Existing Repositories Updated

VertexED: preserved the WIP checkpoint and merged all 23 fetched upstream
commits onto `codex/final-release-export-20260925`. Main is not overwritten and
no published history is rewritten. Existing public visibility is retained.

## New Repositories Created

None.

## Research Papers Finalized

None. There are no manuscripts to compile in this workspace. VertexED pilot
protocols and fixture evaluations remain unproven as real learner outcomes.

## Security Fixes

Retained upstream image/SSRF, readiness, waitlist and isolation hardening during
the merge. Added environment/cache exclusion patterns and a strict Gitleaks
configuration with two exact non-secret exceptions. `.env.local` remains local.
The production advisory audit passed with no high or critical vulnerabilities.
No remote credential rotation or complete historical-secret certification is
claimed.

## Tests Added/Fixed

Preserved the workspace's additional practice, notebook, planner, saved-work,
account-scope, icon, search and browser regressions. Resolved the integration of
protected health details with injectable build identity, and abortable listing
with direct saved-work lookup. Final results are in `FINAL_RELEASE_REPORT.md`.

## CI Added/Fixed

Existing source-bound build, type, lint, tests, evaluation, database and browser
jobs remain. Added the study-desk keyboard/responsive suite at one worker to the
browser job. Package-manager metadata now matches the pinned Node toolchain.
A remotely queued, failed or skipped job is not recorded as passed.

## Repositories Blocked

Production approval is blocked for VertexED. GitHub source-export status is
recorded separately in the table. See `FINAL_RELEASE_REPORT.md` for exact
observed failures and evidence boundaries.

## Exact Remaining Actions

1. Review this candidate branch through GitHub; do not merge or promote it based
   on local offline evidence alone.
2. Restore the canonical `.app` DNS/TLS route with the domain/Vercel operator;
   rerun `node scripts/probe-production-gates.mjs --json`.
3. Start an isolated Docker/Supabase environment, run `npx supabase start` and
   `npm run db:test`. Review and reconcile the target migration ledger before
   any approved production application.
4. Resolve protected readiness failures, deploy the approved full source SHA,
   and run `EXPECTED_VERTEXED_REVISION=<full-sha> npm run test:smoke` against the
   intended domain with required operator configuration.
5. Complete the real two-account authorization, invite/login/recovery/OAuth,
   save/return/export/delete, provider-quality, monitoring/backup/rollback gates
   in `docs/PRODUCTION_LAUNCH.md`.
6. Obtain human educational/content-rights and project-licence decisions. Do not
   publish unapproved guides or claim verified learning effects.

Local preservation: pre-existing raw session evidence and private preservation
patches remain intact under `ci-evidence/`; ignored build, dependency and cache
files are intentionally excluded. No unique result or learner data was deleted.
