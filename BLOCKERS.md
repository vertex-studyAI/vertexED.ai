# BLOCKERS

As of: 2026-08-12 execution pass

Only evidence-backed blockers belong here.

## P0 — Production identity and authenticated golden journey (VertexED)

- **Failed / missing:** exact deployed production SHA and a full authenticated disposable-user journey with persisted artifact return and logout denial.
- **Why:** source CI cannot prove what production is serving or whether owner-controlled backend policy behaves correctly.
- **Resolution:** verify serving revision, then execute golden journey against authorized production/staging with backend evidence.

## P0 — Canonical target + live backend proof (FinanceMeta)

- **Advanced:** latest observed control-repo `main` integrates an additive authorization + notification-integrity overlay, including migration sequencing, role-write restrictions, trigger search-path pinning, notification insert hardening and `security_invoker` view behavior.
- **Still missing:** application to the immutable canonical FinanceMeta target and live Supabase denial-path/persistence evidence.
- **Why:** a generated/validated reverse-applicable patch is not proof that the deployed database enforces it.
- **Resolution:** apply through an authorized target migration flow, then prove member role escalation fails, fabricated notification insertion fails, legitimate trigger-owned notifications still work, and persisted reads match expectations.

## P0 — Canonical target access (The Bu1LD)

- **Failed / missing:** effective write path to the canonical target repository plus production hydration/backend verification.
- **Why:** the connected installation does not expose a writable canonical Bu1LD target.
- **Resolution:** grant/install authorized repo access, create isolated target branch, apply reviewed recovery once, rerun gates, then verify deployment/hydration and role journeys.

## P0 — Percy live runtime evidence

- **Failed / missing:** canonical runtime source, preserved task DB/state, real coordinator/worker process evidence, fresh heartbeat/lease data and physical cross-host qualification.
- **Why:** test harnesses are not proof that a live runtime is healthy.
- **Resolution:** snapshot state first; prove one persisted task through queue→claim→heartbeat→verify→commit/retry on real runtime.

## P1 — T2424-0037 real CAD backend / scientific generalization

- **Cleared:** source integration and exact-head CI. The first recovery run failed 1/349 due an unterminated regex; the root cause was repaired and canonical CI run #914 passed; PR #266 was subsequently merged.
- **Still missing:** actual OpenSCAD/CAD-kernel backend execution, broader language/generalization tests, stronger negative/unsafe cases, and independent reproduction.
- **Why:** deterministic controlled-prompt source generation is narrower than end-to-end CAD validity or general NLP-to-CAD performance.
- **Resolution:** run real backend execution on benchmark outputs, verify generated geometry programmatically, expand prompts before looking at results, then independently reproduce.

## P1 — Olympus O2 evidence

- **Failed / missing:** matched-budget baseline vs proposed vs ablated architecture run on real hardware with loss, throughput, memory, downstream metric and instability evidence.
- **Why:** miniaturized/test harness evidence is not medium-scale architectural validation.
- **Resolution:** run the predeclared O2 ablation without changing thresholds after observation.

## P1 — Local execution surface

- **Failed:** local GitHub clone/build path from this session.
- **Why:** proxy/DNS resolution failure prevented clone; only the uploaded brief is locally mounted.
- **Resolution:** restore network/proxy access or mount canonical working trees; until then, do not claim local test/build/runtime execution.
