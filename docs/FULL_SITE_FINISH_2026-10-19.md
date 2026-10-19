# VertexED full-status and finish pass — 19 October 2026

Decision: **NO-GO for production publication**. Repository-controlled repairs in this pass are implemented, but the master release contract deliberately includes human, live-service, migration, deployment, longitudinal and operational gates that cannot be truthfully converted into source-code completion.

Source boundary: working tree based on `b398bf921dbef71ba98303b121e04944a2954cff`; current changes are uncommitted and not a release candidate. The supported runtime remains Node `22.22.0` with npm `10.9.4` as pinned by the repository. A local shell using another Node version is not a release receipt.

## Implemented in this pass

| Area | Contribution | Acceptance evidence |
| --- | --- | --- |
| Measurement integrity | Reclassified self-reported teacher/mark-scheme checks as `learner-attested-v1`. They persist for history but cannot update measured mastery or schedule a verified retry. | `tests/weakness-evidence-boundary.test.mjs`, `tests/learning-integrity.test.mjs`, `tests/retry-queue.test.mjs`, authenticated golden-browser journey |
| Exam-result provenance | Relabeled manually entered paper results as learner-attested, including reported teacher results; removed “human-confirmed” UI claims while retaining descriptive, non-predictive local averages. | `src/components/ExamAssessmentSetup.tsx`, typecheck, copy lint and production build |
| Verified revision graph | Added an append-only, owner-scoped, metadata-only event graph for notes, attempts, feedback, confirmations, retries and retractions; same-owner parent validation; hash-bound payloads; stable pagination; protected timeline UI. | `tests/revision-history.test.mjs`, `e2e/authenticated-student-golden.spec.ts`, `supabase/migrations/20261019031851_verified_revision_graph.sql` |
| AI cost/admission policy | Migrated the default text contract to GPT-6 Luna, pinned Standard/no-storage/no-reasoning semantics, added dated-identity support and documented long-context price handling. | `tests/ai-usage-policy.test.mjs`, `tests/ai-usage-api.test.mjs`, `tests/ai-default-text-models.test.mjs`, `tests/chat-provider-contract.test.mjs`, `tests/planner-provider-contract.test.mjs` |
| Feedback-to-eval maintenance | Added a privacy-gated promotion tool. Only explicitly consented, reviewer-deidentified, content-free reports can become hash-pseudonymized regression fixtures, and the fixture records the pre-fix failure plus post-fix test. | `tests/feedback-eval-promotion.test.mjs`, `scripts/promote-feedback-evals.mjs`, `evals/feedback-reviews/learner-attestation-mastery-boundary.review.json` |
| Performance regression control | Added candidate-bound critical-route gzip baselines and per-route delta limits so aggregate bundle reductions cannot conceal a route regression. | `tests/route-bundle-deltas.test.mjs`, `scripts/check-route-bundle-deltas.mjs`, `performance-route-budgets.json` |
| Generated-content safety | Made `--check` read-only and added a regression test preventing build-time mutation. | `tests/generated-content-check-mode.test.mjs` |
| Repository isolation | Removed three unrelated research workflows and one unrelated research test from the product repository, then updated the canonical isolation boundary. | `VERTEXED_REPO_ISOLATION.md`; app CI no longer executes those projects |
| Browser compatibility | Replaced a WebKit-incompatible canvas colour assertion with a computed-style DOM sentinel. | Focused WebKit planner/theme suite at 1440, 1024 and 390 pixels |

## Current measured performance

The optimized local build remained inside every frozen budget: initial JavaScript 273,296 bytes gzip (limit 275,000), CSS 35,612 (45,000), largest JavaScript chunk 129,677 (240,000), and total JavaScript 923,497 (1,000,000). Critical-route changes also passed their individual ceilings; the largest increase was Answer Reviewer at +328 bytes gzip. These are local build measurements, not production real-user performance.

Copy lint scanned 475 files with zero findings. The content audit still found 245 guide files, zero approved and 53 flagged. Therefore build correctness must not be described as curriculum approval.

Final local verification included 1,755 application tests, 25 evaluation tests, 13 ask fixtures, the synthetic grading gate, focused Node 22 policy/integrity tests, and the notebook-to-review journey in Chromium, WebKit and Firefox. The authenticated golden journey passed and visually covered 1440, 1024 and 390 pixels, keyboard focus and reduced motion. Live-model grading remained `NOT_RUN` because no authorized isolated provider evaluation environment was available.

## What was going wrong and the specific repair

1. A learner's own claim that a teacher or mark scheme had checked an AI score was stored as measured mastery. This collapsed learner attestation and independent validation. The new evidence contract preserves the report while excluding it from mastery, retries and verified analytics.
2. Manually entered past-paper results were presented as “human-confirmed” even though the application authenticated neither the teacher nor the paper. They now carry learner-attested provenance and the UI calls their averages learner-recorded rather than verified.
3. The proposed revision history could silently stop after 200 events and the service role held an unnecessary direct delete grant. Stable cursor pagination now recovers the full bounded history, and the table grants only select/insert; account deletion still cascades from the owning auth user.
4. Route-size checks covered totals but could miss one critical lazy route growing. Candidate-bound route deltas now fail CI separately.
5. Generated-content check mode could mutate the tree. It is now a read-only verifier.
6. Product CI contained workflows and a test for unrelated portfolio research. They were removed so passing or failing research jobs cannot be represented as VertexED evidence.
7. Default AI model selection and cost reservations were stale. The model, request shape, price table and expiration boundary are now explicit and fail closed.

## Novel contributions and safe extensions

The revision graph is deliberately not a generic activity feed: it is an evidence-state graph. Retractions append rather than rewrite history, parent links are owner-checked, and private answers/notes never enter the graph payload. This enables future teacher confirmation, collaborative review or audit export without conflating who asserted a result with who independently validated it.

The feedback promotion flow establishes an explicit privacy and epistemic boundary between user feedback and evaluation data. Future extensions can add reviewer signatures, fixture lineage and model-version comparisons without admitting raw learner content.

The next technically coherent extensions are:

- authenticated teacher/tutor roles with immutable confirmation and revocation events built on the revision graph;
- account export and deletion coverage for revision events, with a verified restore/erasure rehearsal;
- durable revision-event outbox and two-device conflict tests;
- source-bound teacher review queues for the 245 held guides and 53 flagged guides;
- live GPT-6 Luna evaluation thresholds frozen before provider execution;
- staging replay of the full migration ledger in a dedicated VertexED Supabase project;
- production route telemetry and real-user Core Web Vitals tied to an exact candidate SHA;
- real-account one-day, two-device and two-hour learner journeys with redacted receipts.

## Irreducible open gates

The repository cannot create subject-review approvals, legal/licensing decisions, learner-study observations, provider credentials, a dedicated database, DNS ownership, deployment authority, production monitoring delivery, backups or restore evidence by writing code. The connected Supabase project is shared with unrelated FinanceMeta tables, so the new migration was intentionally **not** pushed. Its current security advisories also include disabled leaked-password protection and an available Postgres upgrade; those are operator-owned changes, not source-code receipts. Local database replay is unavailable until the broken local Docker/Colima environment is repaired or a disposable remote branch is explicitly authorized.

Consequently the master checklist stays NO-GO. This is not unfinished coding disguised as a plan: it is the remaining evidence/authority boundary. Production publication requires a committed candidate plus the listed live and human receipts for the same source, schema, content and model configuration.
