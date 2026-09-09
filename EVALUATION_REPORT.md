# VertexED Evaluation Report

**Evaluation date:** 2026-09-06

**Candidate:** current audit worktree based on `19baf858dca033226c7f8aa8942fbdd70d1feffe`

## Result summary

- **VERIFIED_LOCAL:** source contracts, security boundaries, account-scoped persistence, deterministic AI truth rules, unit/repository tests, frozen evaluations, lint, types, dependency audit, production build and bundle budgets. Current desktop/mobile browser spot checks cover public navigation, signup/login, access gating, guide routing, responsive overflow and guide typography.
- **NEGATIVE/HISTORICAL:** the last canonical production check recorded on 2026-09-03 served an older health contract and could not prove revision/readiness. This worktree is not deployed, so that negative result is not represented as a test of the repaired source.
- **NOT_RUN:** executable database migrations/pgTAP, current deployed API contract, real provider quality, email/OAuth/recovery lifecycle, destructive account lifecycle on disposable identities and learner-outcome research.

## Executed evaluation

| Evaluation | Result | Evidence boundary |
|---|---:|---|
| Source/repository tests | 844/844 pass | Includes portfolio/research contract tests; not all are app functionality |
| Frozen evaluation tests | 25/25 pass | Deterministic/synthetic fixtures |
| Ask fixture evaluation | 13/13 pass; 4.38/5 average | Synthetic provider fixtures, not live model behavior |
| Grading integrity evaluation | 6 fixtures; 0 false verified | Synthetic; live model explicitly NOT_RUN |
| TypeScript | Pass | Static application check |
| ESLint | Pass, 0 errors/warnings | Static source quality |
| Production dependency audit | 0 known vulnerabilities | npm advisory database at evaluation time |
| Vercel topology | 1 function, 21 routes | Source/config contract |
| Production build | Pass, 2,769 modules | Local Node 22.22 build |
| Bundle budgets | Pass, 0 violations | Gzip build-artifact metrics |
| Authenticated golden journey | 1/1 pass on prior candidate baseline | Final access changes still need a real disposable-account run |
| Local accessibility matrix | 34 pass, 2 inapplicable skips on prior candidate baseline | Not rerun after final copy/UI pass |
| Current browser spot checks | Pass on desktop and 390px mobile | Landing, mobile nav, signup, login, protected redirect, valid/invalid guides, no overflow/console errors |
| Database migration + pgTAP | NOT_RUN | Container runtime unavailable; static SQL evidence only |
| Canonical deployment | NOT_RUN for this worktree | Requires authorized Vercel/Supabase targets |

## Failure and abuse coverage

Automated local coverage includes malformed, missing and oversized inputs; auth denial; origin rejection; account-scoped storage; idempotency; pagination; retry recovery; provider timeouts; rate-limit failure modes; request-ID normalization; degraded AI behavior; evidence spans; accessibility; account-export bounds; deletion confirmation; binary multipart uploads; workflow action pinning; and sitemap truthfulness.

Not certified: a real database applying all migrations, concurrent production identities, email/OAuth delivery, production RLS denial, access-token expiry after deletion, provider outage at production scale, model distribution shift, marking agreement, calibration, subgroup effects, retention or learning improvement.

## Research integrity

- Model-generated grading is separated from human-confirmed measurement in code and evaluation outputs.
- Current ask/grading results are explicitly synthetic. They do not establish educational efficacy or live-provider quality.
- Historic research directories contain frozen protocols, manifests, results and negative findings. They were not rewritten to manufacture success.
- Several research GitHub workflows install unpinned Python packages (`pip`, `torch`, `pytest` or editable extras), so exact future environment reproduction is not yet guaranteed.
- The public study-guide corpus is not backed by a complete provenance/licensing/factual-review registry; warnings reduce misrepresentation but do not complete editorial verification.

## Environment incidents

- A first source-test attempt using the nearly full system temporary volume failed with `ENOSPC`; the same suite passed completely with `TMPDIR` on the project volume. This was a host storage failure, not a test assertion failure.
- Local Supabase execution could not be recovered safely because the host container runtime was stopped/broken and the system volume was full. The SQL and pgTAP sources were reviewed, but no passing database-runtime claim is made.
- The first preview server start was denied by the local network sandbox. After the narrow local-server permission was approved, the current production build passed in-app browser checks on desktop and a 390 × 844 mobile viewport.

## Evaluation conclusion

The repository is no longer mostly scaffolding: its core private-beta learning loop and failure boundaries are demonstrably executable. The correct classification is **SALVAGEABLE / FIX**, not “production ready.” Database execution, exact deployment proof and real account/provider certification are mandatory release gates; learning-outcome claims require a separate preregistered study.
