# PRODUCT_VALIDATION_PLAN

**As of:** 2026-08-14 IST  
**Rule:** repository completion is not product validation. User, activation, retention, security and production claims require observed external evidence. Do not invent usage or traction.

## VertexED — active validation lane

### User / job
Intended user: a secondary-school student preparing for structured exams. The job is to turn a real upcoming syllabus/exam need into a connected loop: decide what to study, practise in exam shape, understand lost marks, save useful retrieval material, and know the next action.

### MVP
`onboarding -> plan one task -> focus/practise -> review one attempt -> save one retrieval artifact -> return to plan`

No major new feature is required to validate this loop.

### Activation
Primary activation event: a user completes and saves one trustworthy study artifact connected to a plan, such as a reviewed practice attempt or retrieval set.

### Retention hypothesis
Users return because the completed practice/review creates a concrete next retrieval/study action. This remains a hypothesis until measured.

### Two-week metrics — freeze denominator before testing
- activation rate among invited eligible testers;
- median time to first completed loop;
- fraction completing `plan -> practise -> review`;
- D1/D7 return only where the sample supports interpretation;
- critical journey failure count/severity;
- open-text friction and “what would you have done instead?” response.

### Reliability/security gates
- exact served revision identity;
- login/session/account isolation;
- persisted plans/study artifacts;
- truthful save/error states;
- recovery/logout;
- cross-account denial;
- no secrets/private datasets exposed;
- model/reviewer data boundaries preserved.

### Two-week experiment
**Days 1–2:** prove intended SHA equals served SHA through `/api/health` or equivalent immutable revision evidence; run disposable-account authenticated golden journey. If this fails, stop user validation and repair reliability only.  
**Days 3–4:** freeze activation/funnel events, test script, privacy/data-minimization rules and denominator.  
**Days 5–11:** invite a small manageable real tester cohort; each tester completes one real study loop without facilitator rescue except a blocking bug. Log failures and qualitative feedback.  
**Days 12–13:** analyze funnel and failure taxonomy. Only critical reliability/security fixes may occur mid-test, with explicit provenance.  
**Day 14:** choose exactly one: `CONTINUE_CORE_LOOP`, `FIX_RELIABILITY_AND_RETEST`, or `RETHINK_VALUE_PROPOSITION`.

Current state remains **source GREEN / production BLOCKED** until the exact-revision and authenticated-journey gate passes.

---

## FinanceMeta — externally blocked before validation clock starts

### User / job
Intended user: a participant trying to discover and participate in finance/economics programmes, resources or community workflows. Core job: find a relevant opportunity, establish an authorized profile/membership state, complete one participation/application action, and receive the correct persisted status.

### MVP / activation
`login -> authorized profile -> discover relevant programme/resource -> participate/apply -> correct status/notification`

Activation: first successful participation action stored under the correct user identity.

### Reliability/security gates
- RLS/profile-update/notification boundaries;
- no privilege/profile escalation;
- positive and negative authorization paths through the real backend;
- exact deployed revision;
- persistence/status correctness.

### Two-week experiment
Start only after canonical repo + Supabase/backend access exists. Days 1–3: hardening and denial matrix; days 4–5: disposable member/admin golden journeys; days 6–12: small real discovery-to-participation test; days 13–14: choose `VALIDATE_NEXT_WORKFLOW`, `SECURITY_REPAIR`, or `REDESIGN/ARCHIVE_CORE_JOB`.

Until access exists: **F — EXTERNALLY BLOCKED**, not vague in-progress.

---

## The Bu1LD — externally blocked before validation clock starts

### User / job
Intended users: role-bounded programme/project participants, leads/reviewers and admins as defined by the canonical product. Core job: move one contribution/application through the correct role-governed workflow with clear review state and no cross-role leakage.

### MVP / activation
`signup/login -> onboarding -> discover programme/project -> submit/apply -> reviewer/lead action -> persisted decision -> member sees correct outcome`

Activation: first reviewed contribution or programme/project participation step persisted and visible to the correct roles.

### Reliability/security gates
- immutable deployed revision;
- role/RLS authorization;
- OAuth/callback correctness;
- persistence and hydration consistency;
- cross-role denial;
- logout/recovery.

### Two-week experiment
Start only after canonical source/deploy/backend access exists. Days 1–3: exact-release and role matrix audit; days 4–6: disposable multi-role journeys and denial attempts; days 7–12: small real contribution/application + review cycle; days 13–14: choose `CORE_WORKFLOW_VALIDATED`, `ROLE_OR_RELIABILITY_REPAIR`, or `REDESIGN/ARCHIVE`.

## Portfolio guard

At most two major product validation programmes may run simultaneously. VertexED is first because its production surface is reachable. FinanceMeta and The Bu1LD do not consume validation slots until their canonical access requirements exist.