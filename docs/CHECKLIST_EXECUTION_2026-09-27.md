# VertexED checklist execution, 27 September 2026

**Overall result: incomplete. Production: NO-GO.** This execution repairs and verifies an isolated integration candidate. It does not close the complete-product brief, certify production, approve educational content or establish learning efficacy.

## Source and preservation

Original checkout: `/Volumes/PRO-BLADE/GitHub-Every-Repo/VertexED`, branch `codex/final-release-export-20260925`, commit `490ea8d873e38b6710555ee03e1efe28d5d9b547`. Its existing uncommitted work and historical evidence were preserved. Initial status and patch are retained in that checkout's `ci-evidence/checklist-exec-20260927/`.

The isolated worktree `.release-work/checklist-20260927` started from fetched `origin/main` at `55ff93defb09b119832c38942b2eea20ab0335bf`. The integration commit `47783141cf97a19bfbdf453c3ea2bfde095789f5` retains both histories. A later upstream update, `caf46f16088cade0376efa1e6850d1182ae47ca2` (profile-recovery concurrency), was also reviewed and merged. The resulting runtime candidate is `df0d8cf0a628b3790f8a64af480b34fd8ab5c642`. The branch is `codex/checklist-completion-20260927`; it is a review candidate, not an unattended main merge. The extensive earlier learning-workspace implementation is preserved work, not all newly authored in this execution.

Integration retained upstream account recovery, onboarding and opportunities changes alongside the study desk, motion controls and learning workspace. Dashboard prioritisation now uses Today when available and retains mock, retry, recent-work and first-session fallbacks. The corresponding test exercises the returned actions instead of matching obsolete source text.

## Verification completed

All raw paths in this report are relative to the isolated worktree's `ci-evidence/checklist-exec-20260927/`. Raw captures, database dumps and initial failures remain local. The published evidence index records hashes and claim boundaries.

| Check | Observed result | Receipt and limit |
| --- | --- | --- |
| Clean install | PASS on Node 22.22.0/npm 10.9.4 | `clean-install.log`; lockfile retained |
| Full local CI | PASS on final runtime candidate: 1,243 application tests, 25 evaluation tests, 13 offline tutor cases, grading contracts, lint, types, build and frozen bundle budgets | `ci-final.log`; earlier integration also passed 1,216 application tests (`ci-committed.log`). Offline cases are not live-provider quality evidence |
| Product copy | Final candidate: 360 files, zero findings | `ci-final.log`; this does not approve educational claims |
| Learner browser matrix | 54 passed across Chromium, Firefox and WebKit | `browser-final.log`; integration contents later committed as `47783141`, with the earlier build stamp; controlled fixtures, not exact-deployment certification or physical phones |
| Disposable database | 29 migrations replayed; SQL lint clean; 59 assertions in five SQL files passed | `database-verified.log`, `db-replay-v3/replay-manifest.json`; no shared database reset |
| Local backup restore | PASS: one labelled synthetic account/profile/note, 29 migration entries, RLS and object ownership retained; 8.04 seconds | `restore-summary.json`, `restore-v2.log`; not a production-shaped snapshot, production recovery objective or application rollback |
| Export and outgoing-commit secret scans | No findings in the scanned export and final outgoing code-history scan (three content-bearing commits) | `secret-final-code.log`, earlier `secret-outgoing.log`, `scan/`; not certification of every historical ref or deployed secret scope |
| Production probe | FAILED: custom-host TLS fails before HTTP; fallback readiness is HTTP 503 | `production-probe.json`; fallback liveness HTTP 200 is insufficient |
| Live AI preflight | BLOCKED: provider key absent | `live-provider-preflight.log`; no fabricated provider result |

Public accessibility passed 25 cases with one intentional desktop-only mobile-menu skip, including current landing captures at 1440, 1024 and 390 pixels. The initial integrated golden/auth/recovery/companion suite passed all 18 cases. The final upstream-adjusted candidate also passed all 18 cases (`golden-final.log`). Two pre-existing ESLint warnings remain visible: the `setupRevision` memo dependency in `ExamBaselinePractice.tsx` and the `postAuthUpsertProfile` effect dependency in `AuthContext.tsx`. No rule was suppressed.

The [machine-readable execution receipt](evidence/checklist-execution-20260927.json) binds source hashes, local log hashes, capture hashes, final revision and claim boundaries. The review branch is not a deployed release.

## Database repair

Added a guarded local runner, documented in [DATABASE_REPLAY.md](DATABASE_REPLAY.md). It requires a prepared, uniquely named `vertexed-test-*` target, verifies migration and SQL-test hashes, rejects linked remote-project metadata, and resets only that explicit local target. Legacy migration filenames are normalised only in disposable copies; original SQL bytes and history are unchanged. The pgTAP runner is pinned by digest and receives test files explicitly, avoiding empty external-drive mounts in the container VM.

Two corrupt cached container images were diagnosed and refreshed at the same tags/digests. An invalid test fixture reused a unique revision ID; it now uses separate IDs and explicitly proves duplicate rejection. Database constraints and assertion thresholds were not weakened. SQL lint runs before installing test-only pgTAP functions. CI cleanup cannot fall back to a default project if preparation fails.

Initial startup, lint, mount, duplicate-fixture and restore-owner failures are retained. A host/runtime interruption also interrupted one browser attempt; only the subsequent complete 54-case run is recorded as passing.

## Interface verification corrections

Theme captures now use the actual theme control and wait for its text colours to settle. Mutating the root class directly had captured a mixed transition state. Public accessibility checks now inspect the current revision example and curriculum section and explicitly open the optional Revision Stack before checking it. Keyboard, reduced-motion and responsive assertions remain in place.

## Unfinished implementation

These are engineering requirements, not credential blockers:

- Durable private conversation history across devices, including search, export, deletion, conflicts and account switching. Existing Apex history is bounded session storage.
- Bounded PDF/worksheet import. Existing import accepts text, Markdown and CSV only. The proposed PDF.js 6.3.289 modules measured 176,323 and 473,507 gzip bytes before app bundling. The integration build uses 909,545 of the frozen 1,000,000-byte JavaScript budget. The dependency was assessed and removed without changing the lockfile; no PDF support is claimed. A worker/server design and full size, cancellation, parser-isolation and malicious-document checks are still needed. The size checker now counts `.mjs` worker assets as well as `.js`, with a regression test; no budget was raised.
- Offline application loading and private, versioned offline material caches.
- Calendar integration and reliable background scheduling while the app is closed.
- Complete curriculum mappings, question coverage and subject workflows; sufficient distinct retry and transfer questions; comprehensive long-session, real-device and two-device acceptance.
- The remaining mandatory acceptance criteria in the master checklist. The new exam drill bank is distinct from the 25-question adaptive bank and does not establish full syllabus coverage.

## External dependencies

1. Connect the Vercel team/project and DNS account that own VertexED. The signed-in account cannot access the domain and lists no VertexED project. Resolve canonical TLS and inspect protected readiness details.
2. Supply scoped staging/production configuration and permitted test accounts through the normal secret-management flow. Verify live authentication, email, Google linking, provider calls, migrations, isolation, save acknowledgements, export/deletion and rollback.
3. Obtain actual curriculum/editorial and rights review: 245 guides, zero approved and 53 flagged remain. Obtain privacy/age/consent review and explicit optional/paid-scope decisions. No approval has been invented.
4. Verify the original brief's complete traceability, assign accountable release/operations owners and complete the end-to-end staging and production gates. Source export is not deployment.

## Next execution order

Continue implementation of the missing capabilities and their failure handling in the isolated candidate. Complete content and permission reviews alongside that work. Once hosting access is available, repair TLS/readiness and validate the deployed migration ledger before any live migration. Run the complete learner journey on an identified staging candidate, then promote and recheck that same production release with recovery evidence. Keep the decision NO-GO until all mandatory master gates are genuinely closed.
