# PRODUCT_VALIDATION_PLAN

**As of:** 2026-08-14 IST  
**Rule:** repository completion is not product success. No user count, retention, activation, deployment or traction number is claimed unless directly observed from canonical production evidence.

## VertexED — active product validation lane

### USER

Intended user: a secondary-school student preparing for structured exams who needs a connected revision workflow. The current public product presents a private-beta study loop spanning planning, focus sessions, paper practice, answer review and retrieval. **Actual current active-user count is not asserted here.**

### JOB

Turn a real upcoming exam/syllabus need into one executable study loop: decide what to do, practise in exam shape, see what marks were lost, and schedule retrieval of weak material.

### CURRENT PAIN TO VALIDATE

- fragmentation across planner, notes, papers, timers and feedback;
- practice that does not match exam/mark-scheme shape;
- notes that do not become retrieval;
- unclear next action after feedback.

These are product hypotheses until validated with behavior/interviews.

### MVP

One reliable authenticated loop:

`onboarding -> plan one study task -> run focus/practice -> complete one paper/review action -> save one retrieval artifact -> return to the plan`

No new major feature is required for this validation.

### ACTIVATION

**Primary activation event:** a user completes and saves one trustworthy study artifact connected to a plan (for example a reviewed practice attempt or retrieval set) in the same session/day.

### RETENTION HYPOTHESIS

A user returns because the prior practice/review produces a concrete next retrieval or study action. Retention is not proven until measured.

### SUCCESS METRICS

For the two-week test, freeze before recruitment/traffic:

- activation rate among invited eligible testers;
- median time to first completed loop;
- percentage completing `plan -> practise -> review`;
- D1/D7 return where sample size supports interpretation;
- number/severity of critical journey failures;
- short post-loop question: “What would you have done without VertexED?” plus one open-ended friction question.

Do not optimize or publish a percentage until denominator and eligibility are fixed.

### RELIABILITY — must never fail silently

- exact served release identity;
- login/session/account isolation;
- save/persistence of plan and study artifact;
- paper/review path data integrity;
- logout/recovery;
- failure messages must not imply work was saved when it was not.

### SECURITY

- cross-account data denial;
- untrusted-origin protection where applicable;
- no secrets/private datasets in client or repository;
- auth recovery cannot bypass account ownership;
- model/reviewer inputs must respect user-data boundaries.

### EXTERNAL VALIDATION REQUIRED

Real disposable-account golden journey plus invited user behavior. Internal CI cannot answer usefulness or retention.

### TWO-WEEK EXPERIMENT

**Days 1–2:** certify exact production SHA via `/api/health` and full disposable-account golden journey. If this fails, stop product experiment and repair reliability only.  
**Days 3–4:** freeze activation event, funnel events and user-test script; verify telemetry privacy/data minimization.  
**Days 5–11:** invite a small, manageable set of real eligible beta testers; ask each to complete one real study loop without facilitator rescue unless a bug blocks them. Record failures and open-text feedback.  
**Days 12–13:** analyze funnel and qualitative failure taxonomy; do not add features mid-test except critical reliability/security fixes, which are logged.  
**Day 14:** decision: `CONTINUE_CORE_LOOP`, `FIX_RELIABILITY_AND_RETEST`, or `RETHINK_VALUE_PROPOSITION`. No “success” label without measured activation and observed value.

---

## FinanceMeta — externally blocked until canonical production access

### USER

Intended user: a member/participant trying to discover and participate in finance/economics programmes, resources or community workflows. **Current active-user/traction numbers are not re-verified here.**

### JOB

Find a relevant opportunity/resource, establish an authorized profile/membership state, and complete one meaningful participation action without security ambiguity.

### CURRENT PAIN TO VALIDATE

- opportunity/resource discovery may be fragmented;
- programme participation state may be unclear;
- account/profile/notification boundaries must not leak or permit privilege escalation.

### MVP

`login -> authorized profile -> discover one relevant programme/resource -> complete one participation/application action -> receive correct status/notification`

### ACTIVATION

First successful programme/resource participation event stored under the correct user identity.

### RETENTION HYPOTHESIS

Users return for status, new relevant resources/programmes and continuing participation. Not proven.

### SUCCESS METRICS

- zero role/profile escalation in denial tests;
- successful golden journey for disposable member account;
- activation rate among invited testers once access exists;
- task completion without maintainer intervention;
- user-reported clarity of next action.

### RELIABILITY / SECURITY

RLS/profile-update/notification boundaries are release-critical. Test positive and negative paths through REST/client/RPC/UI where applicable. A local policy file is not production proof.

### TWO-WEEK EXPERIMENT

The clock starts **only after** canonical repo + Supabase/backend access is available.

Days 1–3: apply/verify exact security hardening in isolated branch; run denial matrix and rollback plan.  
Days 4–5: production/staging golden journey with disposable member/admin identities.  
Days 6–12: limited real participant test of one discovery-to-participation workflow; no speculative feature expansion.  
Days 13–14: decide `VALIDATE_NEXT_WORKFLOW`, `SECURITY_REPAIR`, or `ARCHIVE/REDESIGN_CORE_JOB`.

Until access exists, state remains **F — EXTERNALLY BLOCKED**, not “in progress.”

---

## The Bu1LD — externally blocked until canonical source/deploy access

### USER

Intended users are role-bounded participants in research/startup programmes: member/applicant/contributor, programme/project lead, reviewer and admin roles where the canonical product defines them. **No current usage count is asserted.**

### JOB

Move one contribution/programme/project action through the correct role-governed workflow with clear review/approval state and no cross-role privilege leak.

### CURRENT PAIN TO VALIDATE

- discovery/application/review workflows can fragment across tools;
- users need clear ownership/status;
- role boundaries can fail silently if frontend state and backend policy disagree.

### MVP

One end-to-end role-bounded loop:

`signup/login -> onboarding -> discover programme/project -> submit/apply -> reviewer/lead action -> approved/rejected state -> member sees correct outcome`

### ACTIVATION

First reviewed contribution or completed programme/project participation step that is persisted and visible to the correct roles.

### RETENTION HYPOTHESIS

Users return because their project/programme state, feedback and next action live in the system. Not proven.

### SUCCESS METRICS

- seven-role or canonical-role smoke matrix passes where applicable;
- zero cross-role unauthorized reads/writes;
- successful contribution/application-to-review loop;
- hydration/browser state remains consistent with backend truth;
- real participant can identify status and next action without staff explanation.

### RELIABILITY / SECURITY

Immutable deployed build identity, RLS/role authorization, OAuth callback correctness, persistence, hydration and logout/recovery are release-critical.

### TWO-WEEK EXPERIMENT

Start only after canonical target/deployment access is available.

Days 1–3: exact release identity + role matrix + backend authorization audit.  
Days 4–6: disposable multi-role golden journeys and cross-role denial attempts.  
Days 7–12: small real workflow cohort completes one contribution/application and review cycle; fixes limited to critical reliability/security.  
Days 13–14: decision `CORE_WORKFLOW_VALIDATED`, `ROLE/RELIABILITY_REPAIR`, or `REDESIGN/ARCHIVE`.

## Product portfolio rule

At most **two** validation programmes run concurrently. VertexED is first because its public production surface is reachable. FinanceMeta and The Bu1LD do not consume validation slots until the access required for real production evidence exists.