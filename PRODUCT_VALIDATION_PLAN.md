# PRODUCT_VALIDATION_PLAN

**As of:** 2026-08-14 IST  
**Rule:** repository completion is not product success. Do not invent users, activation, retention, traction or deployment evidence.

## VertexED — first product-validation lane

### User / job
Intended user: a secondary-school student preparing for structured exams. Core job: turn an upcoming syllabus/exam need into a connected loop—decide what to study, practise in exam shape, understand lost marks, save retrieval material and know the next action.

### MVP
`onboarding -> plan one task -> focus/practise -> review one attempt -> save one retrieval artifact -> return to plan`

### Activation / retention hypotheses
Activation: first trustworthy saved study artifact connected to a plan. Retention hypothesis: the reviewed practice creates a concrete next retrieval/study action worth returning for. Both require measurement.

### Metrics — freeze denominator first
- activation among invited eligible testers;
- time to first completed loop;
- `plan -> practise -> review` completion;
- D1/D7 return only where sample size supports interpretation;
- critical journey failure count/severity;
- open-text friction and “what would you have done instead?” response.

### Reliability/security gates
Exact served revision; login/session/account isolation; persisted plan/artifact; truthful save/error states; recovery/logout; cross-account denial; no leaked secrets/private data; explicit model/user-data boundaries.

### Two-week experiment
**Days 1–2:** intended SHA must equal served SHA; run disposable-account authenticated golden journey. Failure stops user-value testing and triggers reliability work only.  
**Days 3–4:** freeze funnel/activation events, user-test script, denominator and privacy/data minimization.  
**Days 5–11:** small manageable real tester cohort, one real study loop each, no facilitator rescue except blocking bugs.  
**Days 12–13:** analyze funnel and failure taxonomy; only critical security/reliability changes may occur mid-test and must be logged.  
**Day 14:** choose `CONTINUE_CORE_LOOP`, `FIX_RELIABILITY_AND_RETEST`, or `RETHINK_VALUE_PROPOSITION`.

Current state remains **source GREEN / production BLOCKED** until exact revision and authenticated journey pass.

---

## NeuroCAD — product value separated from falsified parser mechanism

### Evidence boundary
Frozen v1 remains useful controlled software evidence (`19/20` vs original direct `12/20`; `12/12` valid cases produced STL), but the frozen component v2 ablation shows direct generation plus matched fail-closed validation reaches `1.00`, exactly matching the current compiler, with validation recovery fraction `1.00`: **`VALIDATION_DOMINANT`**. Therefore do not market typed-IR/parser-specific causal superiority from these cases.

### User / job
Candidate user: a technically capable learner/builder who wants a natural-language CAD request converted into an executable, inspectable artifact while invalid requests fail safely. This is a **candidate** product user until external use is observed.

### MVP
`plain-language request -> executable preview/artifact -> validation outcome -> inspect/edit parameters -> export or clear failure`

### Activation
A real user produces one geometry artifact they consider correct/useful, or receives a clear safe rejection that prevents invalid geometry from being treated as valid.

### Reliability/safety
- parser/backend must never silently reinterpret unsupported geometry;
- fail-closed validation for unsafe/invalid parameters;
- sandbox/path/process safety;
- deterministic artifact provenance;
- explicit supported subset;
- no claim of manufacturing validity without domain validation.

### Two-week product experiment
Use a **fresh** user-task set, not the old 20 diagnostic cases. Invite a small set of real intended users to bring tasks they genuinely want. Measure task completion, corrections before usable output, time-to-artifact, safe rejection, and whether users prefer/edit/abandon outputs. Compare the full tool against a competent direct+validation workflow because v2 showed validation can explain the old gap.

Decision: `PRODUCTIZE_VALIDATED_WORKFLOW`, `ENGINEERING_REPAIR_AND_RETEST`, or `UTILITY_TOO_LOW/ARCHIVE`. This experiment tests usefulness, not parser novelty.

---

## FinanceMeta — blocked until canonical target access

Intended job: discover a relevant finance/economics programme/resource, establish the correct authorized profile, complete one participation/application action, and receive the correct persisted status.

MVP: `login -> authorized profile -> discover -> participate/apply -> correct status/notification`.

Release-critical: RLS/profile-update/notification boundaries, no privilege escalation, real positive/negative authorization paths, exact deployed revision and persistence correctness.

Two-week clock starts only after canonical repo + Supabase/backend access exists: days 1–3 security/denial matrix; 4–5 disposable member/admin journeys; 6–12 small real discovery-to-participation test; 13–14 decide `VALIDATE_NEXT_WORKFLOW`, `SECURITY_REPAIR`, or `REDESIGN/ARCHIVE`.

Until then: **F — EXTERNALLY BLOCKED**.

---

## The Bu1LD — blocked until canonical target access

Intended job: move one role-governed contribution/application through discovery, submission, review and persisted decision without cross-role leakage.

MVP: `signup/login -> onboarding -> discover -> submit/apply -> reviewer/lead action -> persisted outcome`.

Release-critical: exact deployment identity; RLS/role authorization; OAuth/callback correctness; persistence/hydration; cross-role denial; recovery/logout.

Two-week clock starts only after canonical source/deploy/backend access: days 1–3 release/role audit; 4–6 disposable multi-role journeys; 7–12 small real contribution/application + review cycle; 13–14 decide `CORE_WORKFLOW_VALIDATED`, `ROLE_OR_RELIABILITY_REPAIR`, or `REDESIGN/ARCHIVE`.

Until then: **F — EXTERNALLY BLOCKED**.

## Product concurrency guard

At most two product-validation programmes run concurrently. VertexED is first. NeuroCAD may use the second slot because its software utility is now the more appropriate question after mechanism falsification. FinanceMeta/The Bu1LD consume a slot only after canonical access exists.
