# VertexED mega completion checklist

Updated: 25 October 2026

Current decision: **NO-GO for full public release**.

The canonical Vercel application is operational at `https://vertex-ed-ai.vercel.app`, and the candidate is published for draft review in [PR #1146](https://github.com/vertex-studyAI/vertexED.ai/pull/1146). It has not been deployed to production. Curriculum publication, real-account authentication, live-provider quality, operational recovery and final release evidence remain incomplete. A checked item requires the stated acceptance evidence. Historical passes do not close a gate after the candidate, schema, content or environment changes.

Latest execution: [25 October repair and verification report](COMPLETION_EXECUTION_2026-10-25.md). Checked items below cover the stated local or hosted configuration evidence only; real-provider, independent review and full release gates remain open. The report retains failed attempts, correction runs and held-content skips.

## 0. Freeze the candidate identity

- [x] Confirm the intended release branch is `codex/liquid-glass-polish`.
- [x] Record the starting local HEAD, `fb58d80b906fd6250cf22f45ba480c0ff12eb5d1` for this execution.
- [x] Confirm the remote branch and `main` still point to the expected revision before any push.
- [x] Review the five pre-existing commits ahead of `origin/codex/liquid-glass-polish` and this execution's repairs.
- [x] Inventory the complete candidate delta for accidental, generated or unrelated content; retain the file list and outgoing scan.
- [x] Confirm all unrelated research remains outside the VertexED product boundary.
- [x] Decide whether `docs/evidence/SUPABASE_LIVE_HARDENING_20261021.md` belongs in the candidate.
- [x] Commit the Supabase receipt if it is part of the release evidence, or explicitly document why it remains external.
- [x] Confirm generated files match their checked-in sources and manifests.
- [x] Run `git diff --check` on the final candidate.
- [x] Run an outgoing secret scan on the exact final diff.
- [x] Record a clean or explicitly explained working-tree receipt.

Acceptance evidence: branch name, full candidate SHA, remote base SHA, commit list, diff summary, secret-scan receipt and final `git status`.

## 1. Reconcile source, GitHub and deployment identity

- [x] Push the reviewed candidate branch to GitHub.
- [x] Verify the remote branch tip equals the intended local SHA.
- [x] Open or update a review tied to that exact SHA.
- [ ] Ensure required GitHub checks execute on the candidate rather than an earlier merge or synthetic revision.
- [ ] Record the immutable workflow run URLs.
- [ ] Record the tested head SHA separately from any pull-request merge SHA.
- [ ] Require all release evidence manifests to name the same candidate SHA.
- [x] Confirm no generated revision module remains stamped after local packaging.
- [ ] Decide whether the current production revision `200c0b17f61a53de0dff5ae62e088d274d4b9ac3` should be retained or replaced.
- [ ] Do not claim the local candidate is deployed until live health returns its exact SHA.

Acceptance evidence: remote ref lookup, review URL, successful required checks, candidate-bound evidence manifest and matching GitHub/Vercel revision receipts.

## 2. Complete current-head local CI

- [x] Use Node `>=22.22.0 <23` and the repository package manager.
- [x] Run a clean dependency install from the committed lockfile.
- [x] Run full ESLint.
- [x] Run copy lint and retain all legacy findings.
- [x] Run copy-lint unit tests.
- [x] Run TypeScript type checking.
- [x] Validate the single-function Vercel boundary and all routed endpoints.
- [x] Run the complete content audit in check mode.
- [x] Verify feedback-to-evaluation promotion remains privacy gated.
- [x] Run the production dependency audit with a fresh advisory response.
- [x] Run the full canonical application suite.
- [x] Run evaluation unit tests.
- [x] Run the synthetic ask evaluation.
- [x] Run the synthetic grading evaluation without rewriting evidence.
- [x] Run the production-mode build with immutable revision enforcement.
- [x] Run initial, largest-chunk and total bundle budgets.
- [x] Run critical-route growth budgets.
- [x] Confirm the initial JavaScript bundle remains below its 275,000-byte gzip ceiling.
- [x] Preserve logs and hashes for every required command.
- [x] Repeat affected checks after any subsequent source or lockfile change.

Acceptance evidence: one exact-SHA CI receipt with zero failures, no silently skipped required gate and hashes for retained logs.

## 3. Re-run browser and visual certification

- [ ] Run the current-head Chromium suite.
- [ ] Run the current-head Firefox suite.
- [ ] Run the current-head WebKit suite.
- [x] Exercise 1440px desktop layouts.
- [x] Exercise 1024px tablet layouts.
- [x] Exercise 390px mobile layouts.
- [ ] Inspect landing, authentication, dashboard and all nine principal study destinations.
- [x] Test keyboard-only navigation and visible focus.
- [x] Test dialog focus trap, initial focus and opener restoration.
- [x] Test reduced-motion behavior.
- [x] Test Blue and Midnight themes.
- [x] Test mobile fixed navigation against floating controls and Apex.
- [ ] Test loading, empty, degraded, denied, conflict and recovery states.
- [x] Capture representative final screenshots at all three widths.
- [x] Inspect screenshots rather than treating capture success as visual approval.
- [x] Make a correction pass for every material visual or interaction defect.
- [x] Re-run affected scenarios after corrections.

Acceptance evidence: browser report, screenshot inventory, inspected-width list, accessibility observations, correction log and zero unresolved release-blocking failures.

## 4. Finish the content and curriculum programme

- [x] Preserve the current 91-lesson shared library and all source hashes.
- [x] Preserve the 42 AP-course and 17 MYP-subject source identities.
- [ ] Create versioned topic maps for every supported course.
- [ ] Define explicit course-level denominators before claiming coverage percentages.
- [ ] Complete the remaining Mathematics units beyond Number and A-Level Proof.
- [ ] Complete selected GCSE and A-Level History routes.
- [ ] Complete selected Literature texts, anthologies and unseen components.
- [ ] Complete subject-specific teaching beyond the current priority topic samples.
- [ ] Add checked geographical case studies.
- [ ] Add supervised practical, fieldwork and individual-assessment guidance with honest limits.
- [ ] Add authentic source practice where rights permit.
- [ ] Add whole-paper practice only with appropriate licensing or original material.
- [ ] Keep board, qualification, tier, component and syllabus-year distinctions explicit.
- [ ] Prevent Cambridge Core and Supplement content from leaking across tiers.
- [ ] Prevent AQA, Cambridge, AP, MYP and other programme mappings from being conflated.
- [ ] Independently recompute numerical answers.
- [ ] Independently review prose answers, marking points and misconceptions.
- [ ] Validate diagrams, formula conditions, units and assumptions.
- [x] Confirm generated public assets retain exact source hashes.
- [x] Keep all unapproved teaching bodies out of public delivery, retrieval, offline manifests and sitemaps.
- [x] Retain the 53 legacy review flags until individually resolved.
- [x] Do not count pathway links as completed courses.
- [x] Do not count structurally valid generated content as independent subject review.

Acceptance evidence: versioned source register, complete topic maps, answer-review records, rights records, exact hashes, remaining-gap register and independently reviewed course totals.

## 5. Establish editorial and publication approval

- [ ] Assign a reviewer who is independent of the original content generation.
- [ ] Review each candidate lesson against its named source and syllabus version.
- [ ] Review every answer key and marking point.
- [ ] Review rights, attribution and permitted use.
- [ ] Review safeguarding, privacy and age-appropriate language.
- [ ] Review accessibility of diagrams, tables and mathematical notation.
- [ ] Issue approval only for exact content bytes and exact versions.
- [ ] Record reviewer identity, review date, source, licence and content hash.
- [ ] Keep rejected, superseded and revoked records in the audit trail.
- [ ] Populate `contracts/content-publication-approvals.json` only with completed approvals.
- [ ] Verify one-item approval exposes only that exact item.
- [ ] Verify edited or revoked content immediately returns to held status.
- [ ] Recompute learner manifests and sitemaps from the approval register.
- [ ] Report approved, held, rejected and flagged totals separately.

Acceptance evidence: non-empty exact-hash approval register, independent review receipts, rights records and publication-boundary tests against the final build.

## 6. Correct Supabase Auth configuration

- [ ] Set the Supabase Auth Site URL to `https://vertex-ed-ai.vercel.app`.
- [ ] Retain the exact plain callback `https://vertex-ed-ai.vercel.app/auth/callback`.
- [ ] Add the exact recovery callback variant.
- [ ] Add the exact invitation callback variant.
- [ ] Remove the dead `https://www.vertexed.app/auth/callback` entry.
- [ ] Preserve required trusted local-development callbacks.
- [ ] Do not add wildcard preview domains.
- [ ] Re-run invalid-token redirect probes for plain, recovery, invitation and untrusted callbacks.
- [ ] Confirm recovery and invitation probes no longer fall back to `www.vertexed.app`.
- [ ] Enable leaked-password protection in the Supabase dashboard.
- [ ] Record public Auth settings without exposing secrets.
- [ ] Confirm direct signup, anonymous signup and email confirmation behavior match the private-beta policy.

Acceptance evidence: redacted dashboard/settings receipt and redirect-probe output showing all intended callbacks and rejection of an untrusted origin.

## 7. Certify real authentication journeys

- [ ] Create disposable test identities for the release rehearsal.
- [ ] Exercise approved email signup.
- [ ] Exercise pending, rejected, revoked and unregistered access states.
- [ ] Exercise email confirmation.
- [ ] Exercise Google OAuth.
- [ ] Exercise password reset and recovery.
- [ ] Exercise invitation acceptance.
- [ ] Exercise expired and replayed links.
- [ ] Exercise logout and session revocation.
- [ ] Exercise terminal and transient refresh failures.
- [ ] Confirm a user cannot enter product routes before verified membership.
- [ ] Confirm account switching hides the previous account immediately.
- [ ] Confirm account export contains only the selected account's data.
- [ ] Confirm account deletion removes owned application data and handles active sessions correctly.
- [ ] Remove disposable identities and retain redacted receipts.

Acceptance evidence: redacted end-to-end journey receipts for each access state, provider, recovery path, account switch, export and deletion.

## 8. Reconcile and certify the hosted database

- [x] Preserve the completed RLS and FORCE RLS hardening.
- [x] Re-run the security advisor against the current hosted schema.
- [x] Confirm every exposed public table has RLS and FORCE RLS.
- [x] Confirm service-only tables have no browser grants or client policies.
- [ ] Confirm all owner-scoped policies bind rows to the authenticated identity.
- [ ] Confirm update policies use both `USING` and `WITH CHECK` where required.
- [ ] Confirm privileged functions have explicit search paths and minimal execution grants.
- [ ] Confirm views do not bypass RLS.
- [ ] Reconcile the hosted migration ledger with the canonical release source.
- [x] Do not rename or replay local migrations to manufacture equivalence.
- [x] Replay the canonical migration set in a disposable environment.
- [x] Run all SQL acceptance tests and pgTAP checks.
- [ ] Run real cross-account read, create, update and delete checks.
- [ ] Run concurrent idempotency, revision and rate-limit checks.
- [ ] Verify account deletion cascades and pseudonymous quota protections.
- [ ] Record backup and rollback steps before the managed Postgres patch.
- [ ] Schedule and apply the supported Postgres patch.
- [ ] Re-run readiness and security advisors after the patch.

Acceptance evidence: reconciled migration ledger, disposable replay log, SQL test report, real-account RLS matrix, advisor report and post-upgrade readiness receipt.

## 9. Complete retention and scheduled maintenance

- [x] Recount `waitlist_rate_limits` before any retention change.
- [x] Create the intended attempted-at index through the canonical migration workflow.
- [x] Add the server-only pruning function with minimal execution rights.
- [x] Select an approved scheduler rather than assuming `pg_cron` exists.
- [ ] Define the retention duration and legal/privacy basis.
- [x] Test pruning against disposable rows first.
- [x] Apply the migration through the approved deployment path.
- [x] Verify no unrelated rate-limit rows are removed.
- [x] Record pre/post counts and oldest/newest retained timestamps.
- [ ] Add monitoring for failed scheduled maintenance.
- [ ] Document manual recovery if the scheduler is unavailable.

Acceptance evidence: reviewed migration, scheduler identity, disposable test, production apply receipt, row-count receipt and monitoring check.

## 10. Verify AI providers and quality

- [ ] Confirm production provider keys exist without downloading them.
- [ ] Confirm provider/model identities match the cost policy.
- [ ] Confirm unsupported or unpriced models fail closed.
- [ ] Run a bounded live Apex tutor evaluation.
- [ ] Run a bounded live notes-generation evaluation.
- [ ] Run a bounded live quiz-generation evaluation.
- [ ] Run a bounded live Paper Maker evaluation.
- [ ] Run a bounded live Answer Reviewer evaluation.
- [ ] Test refusal, timeout, malformed, truncated and empty responses.
- [ ] Verify citations resolve only to supplied source identities.
- [ ] Verify provider errors never expose raw upstream text.
- [ ] Verify cancellation and account changes block stale saves.
- [ ] Verify one logical operation cannot create duplicate paid calls.
- [ ] Compare live results against frozen thresholds defined before execution.
- [ ] Keep live model quality distinct from synthetic fixture success.
- [ ] Record latency, cost, failure classes and provisional-grade behavior.

Acceptance evidence: dated provider/model receipt, frozen thresholds, redacted live evaluation outputs, cost/latency report and explicit pass/fail decision.

## 11. Verify email and notification delivery

- [ ] Confirm the production sender and provider configuration exists.
- [ ] Send a test confirmation email.
- [ ] Send a test invitation email.
- [ ] Send a test password-recovery email.
- [ ] Confirm links use the canonical Vercel origin.
- [ ] Confirm no email contains the dead custom domain.
- [ ] Confirm one-time links expire and cannot be replayed.
- [ ] Confirm logs do not expose recipients or invite credentials.
- [ ] Test provider failure and retry behavior.
- [ ] Record delivery, bounce and suppression handling.

Acceptance evidence: redacted provider receipts, delivered-message headers, verified link destinations and failure/retry results.

## 12. Verify transcription and device-dependent features

- [ ] Test supported audio inputs on real devices.
- [ ] Test permission denied, revoked and unavailable microphone states.
- [ ] Test empty, corrupt, oversized and unsupported audio.
- [ ] Confirm transcription never silently reports success on provider failure.
- [ ] Confirm classroom-recording consent language and privacy handling.
- [ ] Test speech synthesis availability and failure states.
- [ ] Test Study Zone timers through refresh, pause, resume and background transitions.
- [ ] Test exported files in common desktop and mobile readers.

Acceptance evidence: device/browser matrix, permission-state screenshots, redacted provider receipt and privacy review.

## 13. Finish security and privacy review

- [x] Re-run production dependency audit against the final lockfile.
- [x] Review moderate development/build dependency findings separately.
- [ ] Review dependency licences.
- [x] Verify all third-party GitHub Actions remain pinned to immutable SHAs.
- [x] Run secret scanning against source, history range and build output.
- [ ] Review CORS against exact production origins.
- [ ] Review CSP and sanitization with DOMPurify 3.4.17.
- [ ] Review Zod 4 migration behavior at every external-data boundary.
- [ ] Confirm service-role credentials never enter client bundles or evidence files.
- [ ] Confirm logs and telemetry exclude answers, notes, emails and raw provider errors.
- [ ] Review export, deletion and retention behavior against the privacy policy.
- [ ] Complete legal review of Terms, Privacy, AI limitations and educational disclaimers.
- [ ] Record data processors and production data flows.

Acceptance evidence: signed security/privacy review, dependency report, secret-scan report, client-bundle inspection and resolved findings register.

## 14. Restore or formally retire the custom domain

- [ ] Decide whether `vertexed.app` is required for launch.
- [ ] Confirm domain ownership and registrar access.
- [ ] Restore authoritative DNS if the domain will be used.
- [ ] Attach the domain to the correct Vercel project.
- [ ] Validate apex and `www` records.
- [ ] Validate TLS issuance and renewal.
- [ ] Choose and document the canonical host and redirect direction.
- [ ] Update application, Auth, email and metadata only after the domain is healthy.
- [ ] Keep the Vercel alias as a verified fallback.
- [ ] If retiring the domain, remove stale aliases and references deliberately.

Acceptance evidence: DNS records, Vercel ownership, TLS certificate, HTTPS probes, redirect matrix and canonical metadata inspection.

## 15. Establish monitoring, backup and recovery

- [ ] Confirm production health and readiness monitors are active.
- [ ] Confirm alert delivery reaches an accountable operator.
- [ ] Monitor liveness, readiness, Auth, database, email and provider failures separately.
- [ ] Monitor latency, error classes, rate limits and deployment revision.
- [ ] Confirm privacy-safe telemetry retention.
- [ ] Record the production database backup policy.
- [ ] Perform a restore rehearsal in a disposable environment.
- [ ] Reconcile restored migration history and application readiness.
- [ ] Test rollback to the previous known deployment.
- [ ] Document incident ownership and escalation.
- [ ] Document how to disable AI calls without taking down non-AI study features.
- [ ] Document how to hold content immediately without deleting source history.

Acceptance evidence: monitor screenshots or API receipts, alert-delivery test, restore report, rollback rehearsal and current runbooks.

## 16. Stage the exact release candidate

- [ ] Create a clean release checkout from the reviewed remote candidate.
- [ ] Install from the committed lockfile under Node 22.
- [ ] Run the complete release gate without reusing earlier output.
- [ ] Build with the exact candidate SHA embedded.
- [ ] Deploy to an isolated staging target.
- [ ] Verify staging health, readiness and revision identity.
- [ ] Run anonymous and authenticated smoke tests.
- [ ] Run two approved accounts and one denied account through the access matrix.
- [ ] Run cross-account persistence and RLS checks.
- [ ] Run bounded live-provider canaries.
- [ ] Verify held curriculum remains unavailable.
- [ ] Verify approved curriculum, if any, is byte-identical to its approval record.
- [ ] Record all staging environment names without exposing values.
- [ ] Produce a signed staging receipt tied to candidate SHA and schema state.

Acceptance evidence: immutable staging URL, exact revision, database ledger identity, smoke report, browser report, provider canaries and signed staging receipt.

## 17. Make and execute the release decision

- [ ] Review every release-blocking gate in `docs/COMPLETION_GATE_REGISTER.json` (the register has no separate P0 field).
- [x] Confirm no failed, blocked or unexecuted gate has been relabelled as passed.
- [ ] Confirm known limitations are reflected in product copy and release notes.
- [ ] Confirm rollback ownership and the previous good deployment.
- [ ] Record the final candidate SHA, migration state, content approval state and model configuration.
- [x] Record an explicit `GO` or retain `NO-GO`.
- [ ] Deploy only the signed candidate if the decision is `GO`.
- [ ] Verify the canonical live alias serves the exact released SHA.
- [ ] Re-run health, readiness, Auth boundary, CORS and public-boundary probes.
- [ ] Run the production browser smoke matrix at 1440px, 1024px and 390px.
- [ ] Run one real approved-account journey and one denied-account journey.
- [ ] Confirm monitoring and alerts are active before closing the release.

Acceptance evidence: signed go/no-go record, deployment receipt, exact live SHA, production smoke report and active-monitoring receipt.

## 18. Post-release validation

- [ ] Monitor the first hour for availability, Auth, API and provider failures.
- [ ] Review the first real-user telemetry without inspecting private learner content.
- [ ] Confirm no held content leaked into delivery or retrieval.
- [ ] Confirm no unexpected dependency, bundle or route regression appeared.
- [ ] Confirm rate-limit and AI budget behavior under real traffic.
- [ ] Confirm email delivery and callback destinations remain correct.
- [ ] Review errors by fixed privacy-safe categories.
- [ ] Triage defects into rollback, hotfix or later work.
- [ ] Bind hotfix verification to its new exact SHA.
- [ ] Publish a factual release status that separates deployment, content approval and learner validation.

Acceptance evidence: first-hour report, issue register, final live revision and explicit statement of remaining limitations.

## Immediate execution order

- [x] 1. Freeze and review the candidate and outgoing diff.
- [x] 2. Resolve the untracked Supabase receipt.
- [ ] 3. Push the reviewed branch and bind CI to its exact SHA.
- [ ] 4. Correct Supabase Auth Site URL and callback variants.
- [ ] 5. Reconcile the hosted migration ledger and run disposable replay.
- [ ] 6. Run current-head cross-browser certification.
- [ ] 7. Execute real-account Auth and RLS journeys.
- [ ] 8. Execute bounded live AI, email and transcription checks.
- [ ] 9. Complete independent editorial, rights and answer review.
- [ ] 10. Produce a clean staging receipt.
- [ ] 11. Restore or formally retire the custom domain.
- [ ] 12. Rehearse monitoring, backup, restore and rollback.
- [ ] 13. Record the final go/no-go decision.
- [ ] 14. Deploy and verify the exact signed revision if and only if the decision is `GO`.

## Completion rule

VertexED is complete for public release only when the exact same source revision, database schema, content approval set, provider configuration and deployment identity pass every required gate. Local tests, generated content, a healthy Vercel alias or a previous deployment cannot substitute for that candidate-bound evidence.
