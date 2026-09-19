# VertexED product completion receipt and remaining release gates

Date: 19 September 2026. Status: **implemented locally, not production-certified**.

## Scope and provenance

Work is isolated on `codex/vertexed-product-completion`, based on `7932c14c83cce7eaa3d303386c60b550248c8e53`, in `/private/tmp/vertexed-product-20260919`. The quarantined original checkout and its pre-existing changes were preserved. No production web deployment, DNS change or provider configuration change was made. The fallback deployment reported a different revision, `a1e4311c1097238b6b554179c7b4b083886f6f73`, at 10:32 UTC, so it does not represent this branch.

Ryan's supplied description is included verbatim in About, in a full-width reading section below the four founder cards. No grammar, punctuation, spelling or claims were rewritten.

21st.dev and Inspira were used as design references, not as copied templates or installed dependencies. See `brand/REFERENCES.md`. The implementation preserves the blue/white identity, logo, Apex and revision trace.

## Implemented

- [x] Stable, immediately readable hero; one dominant checker action; no text-obscuring entrance.
- [x] Task-driven landing with an editable, working checker instead of a simulated AI conversation.
- [x] Remove named Lens marketing and fictional testimonial preview from the landing and navigation.
- [x] Shorten the 390px landing from the audit's approximately 15,500px to approximately 7,132px. Mobile section navigation is in document flow.
- [x] Readable text, solid study surfaces, explicit focus outlines, responsive light/dark layouts and reduced motion.
- [x] Local exact-rational polynomial equivalence and linear-equation solution-set verification, with a versioned expression AST.
- [x] First changed step localization, with abstention across unsupported steps.
- [x] SI mass/length/time dimension comparison, explicitly not numerical conversion or model validation.
- [x] Checker entry points in Notebook, Answer Reviewer and Study Zone.
- [x] Explicit account-scoped device saving, separate self-confidence, evidence inspection/reset and a suggested next-day retry. No false measured mastery.
- [x] Nine original MYP/DP-oriented lesson drafts, worked examples, misconceptions, answer feedback and transfer prompts.
- [x] Draft registry with author, rights, concept source, programme, objective, question type and explicit unresolved syllabus/reviewer fields.
- [x] Production lesson route shows release status instead of unreviewed teaching content. Development preview is interactive. No lesson sitemap/search submission.
- [x] Remove unsourced examiner-reward and grade-separation copy in the board catalog and IB Maths guide.
- [x] Exact fallback/deployment CORS origins and hostile-origin regression tests. No wildcard.
- [x] Product-level AI consent before recognized AI requests; cancellable wait; permission control in Settings; provider disclosure including OpenAI, Google and NVIDIA.
- [x] Explicit degraded-response classification in analytics and persistent, dismissible page notice in addition to existing output metadata.
- [x] Include new consent/evidence device keys in existing export/cleanup key inventory.
- [x] Restore the missing production readiness function with the checked-in readiness migration. Verified service-role execution allowed and anon/authenticated execution denied.

## Important verification boundaries

The typed checker is a real deterministic feature, but is deliberately narrow: one variable, degree at most six, constant denominators, linear equations, bounded input. Functions, symbolic denominators, nonlinear solution sets, handwriting and general calculus steps abstain. Zero powers that can involve `0^0` abstain. Adjacent equivalence does not verify the initial transcription or whether the method answers the original question. Dimension equality does not prove physical correctness.

The local property tests and hand-authored examples are development evidence, **not a human-reviewed gold set**. No accuracy percentage, grade improvement or mastery claim is certified. No proprietary Derive technology, source or model was obtained or copied. This is an independent narrow implementation of step checking.

The new learner evidence is device-local, not cloud-synced and not an automatic scheduled reminder. Suggested retry dates do not constitute completed retrieval practice. Existing measured retry queues are not populated with invented marks from equivalence checks.

## AI capability matrix

Every row still requires an authenticated live canary on the final selected deployment. Local mocks and contract tests do not prove provider availability. Model routing may override defaults, so receipts must record the actual provider/model rather than infer it from source defaults.

| Capability | Endpoint / mode | Required live result | Current release evidence |
| --- | --- | --- | --- |
| Apex | POST `/api/ask` | Nonempty answer; source citations valid when supplied; actual provider/model | Not run on this branch deployment |
| Notes | POST `/api/note` | Nonempty editable notes; AI generation metadata; no fallback | Not run; fine-tuned default access needs verification |
| Flashcards | POST `/api/note`, `mode=flashcards`, `source=notes` | Valid nonempty cards; no deterministic fallback | Not run |
| Quiz generation | POST `/api/quiz`, `action=generate` | Contract-valid questions/options/answers; no fallback | Not run |
| Quiz grading | POST `/api/quiz`, `action=grade` | Valid bounded scores, evidence and review status | Not run |
| Answer review | POST `/api/review` | Structured evidence-linked review; no unsupported score claims | Not run |
| Planner | POST `/api/planner`, single and week | Valid editable task or week schema; provider run receipt | Not run |
| Paper generation | POST `/api/paper-generator` | Nonempty valid questions and mark scheme; no fallback | Not run |
| Notebook | POST `/api/notebook` | Every mode valid and source-grounded | Not run |
| Transcription | POST `/api/transcribe` | Known non-sensitive audio transcript and downstream output | Not run; approved audio fixture needed |
| Image review | POST `/api/review`, image fields | Legible synthetic image parsed correctly and review grounded | Not run; approved image fixture needed |
| Study-guide chat | POST `/api/study-guide-chat` | Approved-source retrieval and verified citations | Blocked by approved-source coverage; empty-source response is degraded |
| Board resources | POST `/api/board-resource` | Valid source-aware guide and generation metadata | Not run; output remains AI practice, not approved syllabus content |

Notebook modes to cover individually: study-guide, briefing, faq, audio-script, timeline, flashcards, quiz, glossary, outline, mind-map, compare, suggested-questions, audio-brief, audio-critique, audio-debate, board-deep-dive. Audio-script modes are scripts, not proof of synthesized speech.

For each canary record only: commit, deployment URL, capability/mode, timestamp, HTTP status, provider/model, duration, schema/grounding result, degraded flag, sanitized failure class. Do not retain student prompts, answers, audio, images or credentials. Missing metadata is an incomplete receipt, not a pass. Exercise denied consent, expired auth, timeout, rate limit, unavailable provider, malformed output and cross-account recovery as well as success.

## P0 production blockers and exact actions

- [ ] Connect the Vercel account/team that owns `vertex-ed-ai`. The available CLI team is `build-the-future-11s-projects`; VertexED is absent and `vercel project inspect vertex-ed-ai` returns `project_not_found`.
- [ ] Reconcile concurrent upstream commits with this branch; select a final release SHA, then deploy it to the actual project. Do not describe a preview as a production update.
- [ ] Resolve canonical DNS/TLS and verify apex and www from more than one network. `https://www.vertexed.app` failed TLS before HTTP in the 10:32 UTC probe.
- [ ] Review and explicitly approve `docs/vertexed-runtime-storage-repair.sql` before applying. Automatic approval review rejected this exact broader migration because it creates learner-state/observability tables and changes constraints, functions and privileges. It was **not applied** and must not be retried through another path without approval. Rehearse against a production-equivalent database and retain a backup/rollback plan first.
- [ ] All six storage readiness checks must pass. At 10:39 UTC they were false: atomicRateLimitRpc, examSessionStorage, singletonIntegrity, learnerStateStorage, observabilityStorage, batchLearnerStateSync. Restoring the RPC made these gaps visible; it did not repair the storage schema.
- [ ] Configure `WAITLIST_RATE_LIMIT_SALT` in the correct environment without exposing its value.
- [ ] Inventory Preview and Production provider keys/model access separately. Do not transfer secrets between projects.
- [ ] Run every live canary above, including each Notebook mode, on the intended commit. Then repeat canonical-domain browser flows with real approved test accounts.
- [ ] Resolve platform security advisories: [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) is disabled; [Postgres security patch upgrade](https://supabase.com/docs/guides/platform/upgrading) is available. The informational [RLS-with-no-policy finding](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) on `public.schools` requires ownership review, not automatic exposure.
- [ ] Complete provider retention, minor-specific privacy/authorization and incident/deletion review before public expansion. UI consent is not a legal compliance certification.

## P1 verifier and personalization gates

- [ ] Independent subject experts create and review a frozen, held-out gold set covering correct work, subtle mistakes, ambiguous notation and unsupported domains.
- [ ] Predetermine supported-domain false-error, missed-error and localization limits; report confidence intervals and abstention by category. Suggested pilot gate: zero observed false accusations in at least 300 independently reviewed supported correct traces, at least 95% localization on supported injected errors, and 100% abstention on explicitly unsupported-domain fixtures. These are proposed targets, not achieved results or a statistical guarantee.
- [ ] Expand a shared Maths/Physics misconception taxonomy beyond algebraic-equivalence, equation-balance and unsupported. Do not interpret dimensional mismatch as a full Physics diagnosis.
- [ ] Add bounded model-generated explanations only from a verified result, with consistency checks and the original symbolic evidence retained. Current explanations are deterministic; no model verdict is needed.
- [ ] Add handwriting only after the typed verifier passes its frozen gate, with editable transcription and uncertainty display.
- [ ] Store reviewed curriculum/objective IDs, hint use, recency and linked retry outcomes in approved cloud learner state after the storage repair. Add editable corrections and device/cloud deletion tests.
- [ ] Connect errors to approved micro-lessons and focused retrieval tasks; explain each selection. Retain confidence as self-report, not mastery.
- [ ] Pilot pre-test, intervention, delayed transfer and retention measures. Do not substitute chat volume, visits or generated documents for learning improvement.

## P1 content release gates

- [ ] Subject reviewers approve the nine initial drafts and check all source URLs, reasoning, numerical answers, command terms and target ages.
- [ ] Map each objective to the current official syllabus version, year and DP level/pathway. Programme orientation is not validated curriculum coverage.
- [ ] Add criterion/mark-scheme skill and difficulty coverage; assess accessibility and language load.
- [ ] Publish only objects with explicit reviewer, review date, syllabus mapping and rights status. Keep teaching content, AI practice and official curriculum facts visibly distinct.
- [ ] Freeze an objective coverage report for MYP 5 and selected DP Maths/Sciences before making broader coverage promises.
- [ ] Repeat the same per-board gate before IGCSE, GCSE, A Levels, AP, CBSE or ICSE expansion. No bulk-generated all-boards claim.

## P2 release gate

- [ ] Canonical-domain TLS, health, final revision and browser flows verified externally.
- [ ] Every capability passes live canaries, schema/grounding checks and failure-state tests.
- [ ] Cost limits, durable rate limits, privacy-safe observability and operational incident controls verified in production.
- [ ] Verifier held-out criteria and reviewed-content coverage meet the published scope.
- [ ] Cross-account/export/deletion and minor-safety review complete.
- [ ] Production Core Web Vitals measured from real traces/telemetry; gzip budget success is not a Web Vitals result.
- [ ] Keyboard, responsive, contrast, reduced-motion and light/dark matrix passes on the intended release, including supported non-Chromium browsers.
- [ ] Real-user learning evidence supports any future efficacy promises.

## Local validation

Commands are reproducible from this branch with the repository dependencies installed. No dependency was added.

```sh
npm run lint:ci
npm run typecheck
npm run test:app
npm run build:ci
npm run performance:bundle
CI=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test e2e/local-accessibility.spec.ts e2e/product-completion.spec.ts --project=desktop-1440 --project=mobile-390 --workers=2
CI=1 npx playwright test --config=playwright.golden.config.ts e2e/authenticated-student-golden.spec.ts
```

The browser suite requires a local development server for draft-lesson preview. The golden suite builds an optimized artifact and intercepts external services; it is not a live AI canary. The first restricted browser attempt failed before page launch due to sandbox process permissions; the authorized rerun passed. Build stamping and app tests must run sequentially because revision tests deliberately require the checked-in neutral revision module.

Recorded local results: 1,107 app tests passed; lint and TypeScript passed; copy lint scanned 329 files with zero findings; responsive/accessibility suite passed 41 checks with one desktop mobile-menu skip; both intercepted production-build authenticated journeys passed after correcting consent cancellation logging and completing onboarding in the new fixture. The earlier test assumed the same account would have to repeat consent after sign-in; permission is intentionally account-scoped and retained on that device. A later final rerun includes preservation checks when saving over damaged evidence.

Initial gzip sizes at the measured build were approximately 210 KB JavaScript and 38 KB CSS, below all four frozen bundle budgets. Screenshot evidence is under `/private/tmp/vertexed-product-visual-results`, including 390/1024/1440px in both themes; those are local evidence paths, not production URLs. Fullpage screenshots were inspected and the action controls corrected. No Safari/Firefox or production Web Vitals certification is claimed.

SQL approval artifact SHA-256: `6930faca1d335990b4dd9625a7e3f0f0c1433a2dd42ed0937e1779ba4d308ced`. Remaining unchecked items are not silently waived by passing local tests.
