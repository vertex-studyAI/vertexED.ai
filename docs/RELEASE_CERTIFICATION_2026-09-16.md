# VertexED — Release Certification Control (2026-09-16)

## Current truth

Canonical main at the latest repository verification point: `7a468fd8c9a45f650963c42bede4d668d3eaa370`.

Repository/application-facing certification on current main is green. The public production path at `www.vertexed.app` is not certified: DNS and TCP/443 succeed, but authenticated TLS/HTTPS reset before application HTTP. This is a provider/domain/certificate/backend-path incident, not evidence for another product-source rollback.

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

## Current review queue

Repository-green PRs remain human-review gated. Do not treat green CI, mechanical mergeability, or transient Draft/Ready metadata as merge authorization while main is unprotected.

Current open engineering/product surfaces include fixes for:

- stale Notetaker/Quiz async work;
- stale onboarding account-owned saves;
- login operation serialization;
- Vercel packaging of every study-guide curriculum;
- exact engineering workflow runtime pins;
- development-dependency audit findings.

Their GitHub Draft/Ready state is operational metadata and may change independently of source. Integrate only through ordinary review, preserve exact-head verification, then run merged-main certification.

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
4. Obtain human review and integrate current green product/security PRs normally.
5. Protect main with stable review/CI gates.
6. Run first measured activation cohort.
7. Build fundraising/demo evidence only from certified production + real traction data.
