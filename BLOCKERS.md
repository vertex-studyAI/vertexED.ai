# BLOCKERS

As of: 2026-08-12 execution pass

Only evidence-backed blockers belong here.

## P0 — Production identity and authenticated golden journey (VertexED)

- **Failed / missing:** exact deployed production SHA and a full authenticated disposable-user journey with persisted artifact return and logout denial.
- **Why:** source CI cannot prove what production is serving or whether owner-controlled backend policy behaves correctly.
- **Resolution:** verify serving revision, then execute golden journey against authorized production/staging with backend evidence.

## P0 — Canonical target + live backend proof (FinanceMeta)

- **Advanced:** latest observed control-repo `main` integrates an additive authorization + notification-integrity overlay, including migration sequencing, role-write restrictions, trigger search-path pinning, notification insert hardening and `security_invoker` view behavior. PR #261 separately contains truth-first content recovery pinned to audited target SHAs.
- **Still missing:** application to the immutable canonical FinanceMeta target and live Supabase denial-path/persistence evidence; target branch-creation probes recorded 403.
- **Why:** a generated/validated reverse-applicable patch is not proof that the deployed database or public target enforces/contains it.
- **Resolution:** apply through an authorized target migration/content flow, then prove member role escalation fails, fabricated notification insertion fails, legitimate trigger-owned notifications still work, persisted reads match expectations, and unsupported public claims are absent.

## P0 — Canonical target access (The Bu1LD)

- **Failed / missing:** effective write path to the canonical target repository plus production hydration/backend verification.
- **Why:** target branch-creation probes in PR #261 returned `403 Resource not accessible by integration`.
- **Resolution:** grant/install authorized repo access, create isolated target branch, apply reviewed exact-SHA recovery once, rerun gates, then verify deployment/hydration and role journeys.

## P0 — Percy live runtime evidence

- **Advanced:** current PR #257 head `47810e80...` passed canonical CI #925 and records durable SQLite/WAL lifecycle, bounded active-task cap, leases/heartbeats, stale-owner rejection, evidence-gated completion, migration and recovery tests.
- **Still missing:** actual Mac/live runtime crash-restart, multiworker resource contention, provider integration, end-to-end shutdown/recovery and physical qualification.
- **Why:** isolated regression evidence is not proof that the real long-running worker installation survives interruption and contention.
- **Resolution:** snapshot state first; prove one persisted task through queue→claim→heartbeat→verify→complete/retry on the actual runtime, then exercise kill/restart and multiworker contention.

## P1 — Olympus O1 learned-provider experiment

- **Advanced:** current #257 rationalizes Olympus as a deterministic research runtime, not a family of trained scale models; O0 deterministic runtime evidence is present and exact-current-head CI is green.
- **Still missing:** the preregistered matched-provider ~100-task O1 comparison.
- **Why:** runtime-role implementation and synthetic architectural checks do not prove learned-provider quality or justify any parameter-count/model-scale claims.
- **Resolution:** run the frozen O1 provider comparison with declared success/efficiency/failure metrics and preserve negative outcomes.

## P1 — T2424-0037 real CAD backend / scientific generalization

- **Cleared:** source integration and exact-head CI. The first recovery run failed 1/349 due an unterminated regex; the root cause was repaired and canonical CI run #914 passed; PR #266 was subsequently merged.
- **Still missing:** actual OpenSCAD/CAD-kernel backend execution in the canonical integration evidence, broader language/generalization tests, stronger negative/unsafe cases, and independent reproduction.
- **Why:** deterministic controlled-prompt source generation is narrower than end-to-end CAD validity or general NLP-to-CAD performance.
- **Resolution:** run real backend execution on benchmark outputs, verify generated geometry programmatically, expand prompts before looking at results, then independently reproduce.

## P1 — T2424-0025 mechanism isolation

- **Advanced:** current-main rebuild #271 passed exact-head CI #918 and merged the 50-seed robust-readout ablation.
- **Still missing:** a control/baseline that isolates contamination as the causal condition.
- **Why:** the 0% contamination control also favors robust readouts, so current evidence does not support the intended contamination-specific mechanism claim.
- **Resolution:** redesign/freeze the baseline or normalization before rerunning; do not retune post hoc.

## P1 — Hercules learned-architecture evidence

- **Failed / missing:** matched-budget baseline/proposed/ablated learned-architecture evidence on real hardware with loss, throughput, memory, downstream metric and instability measurements.
- **Why:** Hercules is the trainable/local-model architecture owner, but runtime-role and miniature harness evidence does not establish architectural advantage.
- **Resolution:** run controlled learned-model experiments under the same data/tokenizer/parameter/optimizer/training/evaluation budgets.

## P1 — Local execution surface

- **Failed:** local GitHub clone/build path from this session.
- **Why:** proxy/DNS resolution failure prevented clone; only the uploaded brief is locally mounted.
- **Resolution:** restore network/proxy access or mount canonical working trees; until then, do not claim local test/build/runtime execution from this session.
