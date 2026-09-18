# VertexED — Release Certification Control (2026-09-16)

## Current truth

Canonical main at the latest repository verification point: `b7e9de703d0917dcdaec47e49103c58bb9ef238b` (18 September 2026).

Repository/application-facing engineering has advanced through merged PRs #896, #898, #899, #902, #903, #904, #906, #907, #908, #909, and #910. The public production path at `www.vertexed.app` is still not certified: the latest retained GitHub evidence continues to place the demonstrated failure after DNS/TCP reachability and before authenticated TLS/application HTTP. This remains a provider/domain/certificate/backend-path incident, not evidence for another product-source rollback.

This document is a release-control snapshot, not an automatic live pointer. Before acting on any readiness or deployment claim, re-read the current `main` head and bind evidence to that exact SHA.

## P0 production recovery

1. Identify the single authoritative provider project owning `www.vertexed.app`.
2. Obtain authoritative domain attachment, certificate state, backend/deployment mapping and required DNS from that provider project.
3. Inspect provider edge/request evidence around resets for both current A-record endpoints.
4. Change DNS only after provider ownership and required configuration are proven.
5. Intentionally deploy one exact intended repository revision through the canonical project.
6. Require unchanged transport diagnostics, production health, browser smoke and immutable-revision checks to pass.
7. Do not weaken TLS/browser/smoke gates or create no-op source commits to chase provider state.

## P0 authenticated release certification

After the public path is healthy, use authorized disposable accounts and record timestamp, expected result, actual result and pass/fail for:

- waitlist join;
- admin authentication;
- approval flow;
- account creation;
- team-invite account creation where supported;
- email/password login;
- Google OAuth;
- onboarding;
- chatbot;
- notes;
- quiz generation;
- paper generation;
- answer review;
- planner generation;
- planner save and fresh-session retrieval;
- logout;
- protected-page/API rejection while logged out;
- disposable-user cleanup.

Bind the complete journey to one immutable deployed SHA.

## Current integration state

The prior product/security review queue has been integrated. On 18 September 2026, PRs #896, #898, #899, #902, #903, #904, and #906 merged, followed by:

- #907 — execution-queue documentation reconciliation;
- #908 — Vercel routing fix keeping `/api/*` off the failing custom-domain redirect path;
- #909 — custom-domain DNS recovery runbook;
- #910 — Node app-test runner TypeScript loading fix.

Do not reopen those completed merge gates as the current P0. Research PR #900 remains a separate Draft/research-gated surface.

The live release blockers are:

1. establish the single authoritative provider project owning `www.vertexed.app`;
2. inspect authoritative domain attachment, certificate state, backend/deployment mapping and DNS requirements;
3. repair provider/domain state without weakening TLS/browser/smoke gates;
4. rerun unchanged Production Health and Transport Diagnostics against an exact current source;
5. require application HTTP and immutable revision convergence before authenticated certification.

Issue #44 is the canonical custom-domain certification tracker. Issue #652 is the rolling Production Health incident.

## Branch governance

Enable repository rules/protection with:

- PR required before merge;
- at least one independent approval where feasible;
- stable repository CI contexts;
- force-push blocked;
- branch deletion blocked;
- production-provider checks excluded from ordinary merge requirements while the external domain incident remains unresolved.

## Traction gate

Do not add a major feature family before the activation funnel is trustworthy.

Track real users only:

- activated users;
- WAU;
- D1 and D7 retention;
- study sessions per active user;
- first-core-action completion;
- successful mock generations;
- successful mark-scheme reviews;
- planner save/retrieval;
- top failure/drop-off reasons.

Activation means onboarding plus at least one meaningful core workflow, not account creation alone.

## Waitlist activation

Once production is stable:

1. invite 25–50 waitlist users;
2. measure invite -> account -> onboarding -> first core action -> second session -> D7 return;
3. interview at least 10 invited users including non-activators;
4. fix the largest measured funnel break;
5. only then expand the next cohort.

Keep historical waitlist/account figures clearly separated from active users.

## Product decision rule

Every product PR should improve one of:

- reliability;
- activation;
- retention;
- security/privacy;
- measured core-workflow quality.

New feature families wait until the largest measured drop-off is understood.

## Immediate order

1. Resolve canonical provider/domain ownership and TLS path.
2. Deploy/certify one immutable current revision.
3. Complete authorized authenticated production journey.
4. Keep merged-main repository CI stable and protect main with review/CI gates.
5. Complete authorized authenticated production certification only after the public path is healthy.
6. Run the first measured activation cohort.
7. Build fundraising/demo evidence only from certified production + real traction data.
