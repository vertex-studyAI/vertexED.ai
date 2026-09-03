# VertexED Evaluation Report

Evaluation date: 2026-09-03  
Source baseline: `28b590890ad2196d222913efd83e25b8f017dafa`

## Result summary

- **VERIFIED_LOCAL:** adaptive-study integrity fix, focused regressions, canonical source/evaluation gate, build, audit, budgets and local accessibility.
- **NEGATIVE:** canonical production serves an older health contract and cannot prove revision/readiness.
- **NOT_RUN:** live provider quality, email/OAuth/recovery lifecycle, two-account production isolation, production DB certification and learning outcomes.

## Executed evaluation

| Evaluation | Result | Boundary |
|---|---|---|
| Adaptive workflow regression | 5/5 pass | Source/contract; no real user |
| Post-main-merge adaptive + health regression | 12/12 pass | Source/handler |
| Source tests | 752/752 pass | Includes portfolio tests; not all are product evidence |
| Frozen grading/eval tests | 25/25 pass | Synthetic fixtures only |
| TypeScript + scoped lint | Pass | Static/source quality |
| Production dependency audit | 0 vulnerabilities at threshold | Known npm advisories only |
| Production build | Pass, 2,757 modules | Local Node 22 build |
| Bundle budgets | Pass, 0 violations | Gzip artifact metrics |
| Local accessibility | 34 pass, 2 expected skips | Public/auth deterministic preview |
| Live public smoke | Fail | Revision/readiness/HEAD missing; basic page/auth/origin checks pass |

## Most serious observed failures

1. Live `/api/health` has no immutable revision, preventing source-to-production attribution.
2. `/api/health?readiness=1` returns the same legacy `200`, not capability-aware readiness.
3. The scheduled monitor reports no `X-VertexED-Health: alive` HEAD header.
4. Adaptive evidence was contaminated: mock completion manufactured a score and free-form reviewer text was parsed/defaulted into weakness history. `0928312` removes both paths.
5. Synthetic contracts and engagement events do not establish learning gain, marking validity or recommendation safety.

## Stress/failure coverage

Malformed/missing/oversized input, auth denial, account-scoped local state, idempotency conflicts, cancellation/timeouts, provider absence, fallbacks, evidence spans and accessibility have automated local coverage. Production outage, concurrent real accounts, email/OAuth delivery, live RLS denial, distribution shift, marking agreement, calibration, subgroup analysis, retention and learner improvement are not certified.

## Execution incidents

Two clean-install attempts failed with npm registry `ETIMEDOUT` reads. A bounded low-concurrency, prefer-offline retry then installed 672 packages and audited 673 with zero vulnerabilities. The in-app browser webview also failed to attach after its documented retry; the repository's local Chromium/Playwright accessibility suite was run instead and passed. Neither tooling incident is represented as product evidence.

## Verdict

The source candidate is stronger and locally verified, but **NOT READY**. Deploy through the Vercel project owning `vertexed.app`, prove revision/readiness, then run the two-account production matrix.
