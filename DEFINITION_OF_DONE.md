# VertexED Definition of Done

Status date: 2026-09-03. A release is `READY` only when every release-blocking item passes on the same immutable deployed revision. Local success is necessary but insufficient.

## Functional acceptance

| ID | Pass criterion | Current state |
|---|---|---|
| F1 | An approved learner creates an account, confirms ownership, authenticates and completes curriculum onboarding. | PARTIAL |
| F2 | Login, Google linking, recovery, logout and session restoration pass with disposable production identities. | NOT_RUN_PRODUCTION |
| F3 | Only a graded quiz/verified rubric result creates weakness evidence; completion/unstructured AI text never does. | VERIFIED_LOCAL |
| F4 | The weakest measured topic produces an evidence-labeled adaptive note brief with subject, score and attempt count. | VERIFIED_LOCAL |
| F5 | Learner creates notes, generates a quiz, receives bounded grading and repeats the loop. | VERIFIED_LOCAL_DETERMINISTIC |
| F6 | Paper generation, timed mock, answer handoff and rubric review finish without manufactured scores. | VERIFIED_LOCAL |
| F7 | Plans/notes/notebook/attempts/progress persist across logout/login for the same account. | VERIFIED_LOCAL_DETERMINISTIC |
| F8 | A second account cannot read, mutate or inherit the first account's server/browser learning state. | VERIFIED_LOCAL; PRODUCTION_PENDING |
| F9 | Provider/storage failures produce actionable errors or provenance-marked deterministic fallbacks, never fake success. | VERIFIED_LOCAL |
| F10 | Account export/deletion is documented, authorized and verified against production. | PARTIAL |

## Scientific acceptance

Hypothesis: learners assigned to the complete diagnosis → adaptive study → practice → feedback loop improve more on curriculum-aligned held-out items than learners receiving the same content without diagnosis-driven adaptation.

| Requirement | Pass criterion | Current state |
|---|---|---|
| Protocol | Freeze population, intervention, control, metric, exclusions, failure rules and analysis before outcomes. | PARTIAL |
| Baselines | No-adaptation control, fixed plan, strongest feasible tutor and ablated adaptive loop. | NOT_RUN |
| Data | Consented curriculum-labeled cohort; immutable split/provenance; no unapproved student data. | NOT_RUN |
| Primary metric | Pre/post change on held-out rubric-aligned assessment with uncertainty. | NOT_RUN |
| Marking validity | Blind double-mark subset and report agreement; AI-only grades cannot prove efficacy. | NOT_RUN |
| Robustness | Board/subject/grade slices, missingness, attrition, outage, contamination and calibration checks. | NOT_RUN |
| Failure conditions | Fail for no credible gain, poor item validity, excessive hallucination, weak marking agreement, inadequate retention or unsafe recommendations. | DEFINED; THRESHOLDS_PENDING |
| Raw evidence | Retain consent-permitted de-identified I/O, configs, model IDs, hashes, scripts and negative cases. | PARTIAL |
| Claim standard | No efficacy/superiority claim until protocol, results and uncertainty are reviewable. | ENFORCED_AS_POLICY |

## Reliability acceptance

- `npm ci` and `npm run ci` pass on Node 22 from a clean checkout.
- Immutable build identity appears in health body/header; missing production identity fails closed.
- Readiness returns `200` only with required auth/storage/invite/rate-limit/AI configuration, otherwise `503` with non-secret capability state.
- Requests enforce size/time bounds, cancellation, stable retries and write idempotency.
- Missing/corrupt/duplicate/large inputs, provider outage, stale state, retry, partial writes and account transitions are tested.
- Frozen bundle budgets and 375/390/768/1024/1440 px keyboard/overflow/contrast checks pass.
- Production smoke passes three times after deploy and two consecutive scheduled monitors remain green.

## Security and privacy acceptance

- Protected routes derive identity server-side; production admin access never trusts client allowlists.
- Two production accounts prove row/browser-storage isolation for every learner artifact type.
- Live migrations, RLS, foreign keys, indexes and security-definer execute privileges match source.
- No secret enters source, client bundles, logs, analytics or evidence; only presence is recorded.
- Origin, payload, rate-limit, invite/recovery and deletion/export boundaries pass adversarial tests.
- Pilot collection has consent/assent, minimization, retention/deletion schedule, incident owner and processor review.

## Release acceptance

| ID | Pass criterion | Current state |
|---|---|---|
| R1 | Branch is current with `main`; canonical CI is green on the exact candidate SHA. | MERGED_LOCAL; CI_PENDING |
| R2 | Deterministic build and budgets pass from clean dependencies on Node 22. | VERIFIED_LOCAL |
| R3 | Canonical Vercel deploys candidate and health proves exact deploy-relevant SHA. | BLOCKED |
| R4 | Readiness, HEAD, router, public, malformed waitlist, auth and origin smoke checks pass. | NEGATIVE_PRODUCTION |
| R5 | Authenticated lifecycle and two-account production isolation pass with cleanup evidence. | NOT_RUN |
| R6 | Production environment/database certification records presence/state without secrets. | NOT_RUN |
| R7 | Rollback owner identifies last known-good deployment and exercises incident runbook. | PARTIAL |
| R8 | Evidence manifest, raw artifacts, failures and matrix reference the same revision. | PARTIAL |

Current release verdict: **NOT READY** because R1 CI, R3, R4, R5 and R6 are unsatisfied.
