# Final Release Report

> Updated 27 September: this is the retained 25 September checkpoint. Current integration, verification and incomplete release status are recorded in [the checklist execution report](docs/CHECKLIST_EXECUTION_2026-09-27.md) and its evidence index. Historical pending statements below are not the current test result. Production remains NO-GO.

## Status

2026-09-25. GitHub export candidate in verification; production release **BLOCKED**.
Scope: one VertexED repository, including its API, database schema, offline
evaluation harness, product documentation and original assets. No independent
research project, manuscript, bibliography, notebook or checkpoint was discovered
inside the workspace. The professor study document is a protocol, not a paper or
an observed result.

## Changes Made

- Preserved the initial 176 dirty/untracked status entries and local binary diff;
  checkpointed legitimate source, tests, docs and assets on a review branch.
- Merged all 23 fetched upstream commits rather than replacing remote history.
  Resolved health-handler injection alongside protected readiness details,
  saved-work ID lookup alongside abort signals, and answer drafts alongside
  safe image handling. Upstream security and reduced-motion fixes are retained.
- Excluded generated caches from lint and Git without deleting local evidence.
- Aligned npm metadata with Node 22.22.0's npm 10.9.4.
- Added strict secret-scan configuration with only two exact, reviewed false
  positives: the public IndexNow command and enzyme lock-and-key prose.
- Added the study-desk keyboard/responsive journey to existing GitHub CI.
- Documented repository structure, frontend/API startup boundaries, limited
  question coverage, content approval, migration prerequisites and licence status.

The substantial study workspace, practice, saved-work, notebook, school-field,
planner, motion and icon changes were already present on arrival. This pass
preserves and verifies them; it does not claim to have newly implemented them.

## Verification Performed

Receipts: `ci-evidence/final-release-20260925/`. Original patches, credentials,
raw logs, scanner findings and browser captures remain local. Exported summaries
contain no learner records or credentials. Checks are tied to the candidate
source; passing local checks cannot certify a deployed revision.

## Tests

Pending completion of fresh merged-candidate verification. Interrupted baseline
checks are not passes. Existing thresholds and meaningful assertions are retained.

## Build

Pending fresh production build and frozen bundle-budget checks.

## Research Verification

Only fixture/offline evaluator and protocol implementation checks apply. No real
pilot dataset or learner-effect result was introduced or generated. Efficacy,
complete syllabus coverage, calibration and external validation remain
**NOT YET ESTABLISHED**. The named external-guidance statements in existing
protocol documentation were not independently authenticated in this export pass.

## Paper Verification

No paper to compile; zero papers checked and zero papers compiled. No citation,
publication acceptance, affiliation or licence grant was invented.

## Known Limitations

- This checkout is marked noncanonical WIP. Export is a review branch, not an
  unattended merge or production certification.
- Local browser fixtures do not prove live authentication or cloud persistence.
- `.env.local` is ignored and retained locally. No remote secret-scope audit or
  credential rotation was performed.
- The current export tree and outgoing commits are secret-scanned. The broad
  historical scan was interrupted; all historical Git refs are not certified.
- Original session evidence directories (approximately 228 MB in total at
  inventory time) remain local, intact and explicitly ignored. Their historic
  green receipts are not substituted for fresh checks.
- Public visibility does not supply a project-wide licence or imported-content
  rights. Those remain owner/editorial decisions.

## Remaining Blockers

1. `www.vertexed.app` and `vertexed.app` fail TLS before HTTP on the current probe.
   Domain/DNS/Vercel ownership must be reconciled by the responsible operator.
2. Both known Vercel fallbacks return readiness HTTP 503 on source
   `2ca208c8ffd10c83005f3afe65057bc847277d5f`, not this candidate. Protected detailed
   readiness requires the configured operator token; public output does not
   identify which dependency failed.
3. Local Docker is unavailable (`~/.colima/default/docker.sock` absent), so clean
   database migration replay, pgTAP and live two-account authorization remain
   unverified. No production migration or destructive database reset was run.
4. Exact-candidate invite/login/recovery/OAuth/save-return/export-delete journeys,
   live provider evaluation, monitoring/alerting, backup restore and rollback
   rehearsal remain required before production approval.
5. Study-guide editorial approval and imported-content/licence review remain
   human gates. No guide approval was fabricated or publication threshold relaxed.

## Reproduction Commands

Use `.nvmrc` (Node 22.22.0) and npm 10.9.4, with writable temporary storage:

```sh
npm ci
npm run ci
npx playwright test --config=playwright.desk.config.ts --project=chromium --workers=1
npm run test:e2e:local-accessibility
npm run test:e2e:authenticated-golden
# After starting an isolated local Docker/Supabase environment:
npx supabase start
npm run db:test
# Read-only production gate probe:
node scripts/probe-production-gates.mjs --json
# Requires locally installed Gitleaks:
gitleaks git . --log-opts="origin/main..HEAD" --redact --config .gitleaks.toml
```

Consult the existing deployment/migration ledger procedure before applying any
remote schema. After operator restoration and approved deployment, run the live
smoke with `EXPECTED_VERTEXED_REVISION` set to the deployed full Git SHA, then
complete the authenticated and provider gates in `docs/PRODUCTION_LAUNCH.md`.

## Release Recommendation

**BLOCKED** for production. A verified GitHub source export and passing offline
checks do not establish launch readiness. Remaining external gates are listed
above with their next actions; no production domain change is claimed.
