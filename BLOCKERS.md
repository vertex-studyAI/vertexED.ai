# BLOCKERS

As of: 2026-08-12 18:02 IST

Only evidence-backed blockers belong here.

## P0 — Production identity and authenticated golden journey (VertexED)

- **Failed / missing:** exact deployed production SHA and a full authenticated disposable-user journey with persisted artifact return and logout denial.
- **Why:** source CI cannot prove what production is serving or whether owner-controlled backend policy behaves correctly.
- **Evidence:** portfolio status separates source release candidate from production proof; current main adds revision stamping but does not itself prove a deployed SHA.
- **Resolution:** verify serving revision, then execute golden journey against authorized production/staging with backend evidence.

## P0 — Canonical target access (FinanceMeta / The Bu1LD)

- **Failed / missing:** effective write path to canonical target repositories and owner-controlled backend verification.
- **Why:** connected installation does not expose/writable-target these repos; FinanceMeta target write probe returned 403 in the recorded recovery work.
- **Resolution:** grant/install authorized repo access, create isolated target branch, apply reviewed recovery once, rerun gates, then verify role authorization/persistence.

## P0 — Percy live runtime evidence

- **Failed / missing:** canonical runtime source, preserved task DB/state, real coordinator/worker process evidence, fresh heartbeat/lease data and physical cross-host qualification.
- **Why:** test harnesses are not proof that a live runtime is healthy.
- **Resolution:** snapshot state first; prove one persisted task through queue→claim→heartbeat→verify→commit/retry on real runtime.

## P1 — T2424-0037 recovery verification

- **Failed / missing:** canonical CI conclusion for recovery head `48f1cbb9035547ec498a0ea09cd0d57453caa916`.
- **Why:** prior-head tests do not certify a new integration head.
- **Resolution:** require green exact-head CI; if main has advanced, refresh by fast-forward/rebase-equivalent recovery without force-pushing shared work.

## P1 — Olympus O2 evidence

- **Failed / missing:** matched-budget baseline vs proposed vs ablated architecture run on real hardware with loss, throughput, memory, downstream metric and instability evidence.
- **Why:** miniaturized/test harness evidence is not medium-scale architectural validation.
- **Resolution:** run the predeclared O2 ablation without changing thresholds after observation.

## P1 — Local execution surface

- **Failed:** local GitHub clone/build path from this session.
- **Why:** proxy/DNS resolution failure prevented clone; only the uploaded brief is locally mounted.
- **Resolution:** restore network/proxy access or mount the canonical working trees; until then, do not claim local test/build/runtime execution.
