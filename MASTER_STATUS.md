# MASTER_STATUS

As of: 2026-08-12 execution pass
Control repository: `vertex-studyAI/vertexED.ai`
Latest observed `main`: `ceedf60ba84ed8f60842cae120ca54a41a402dba`

This file is evidence-limited. `IMPLEMENTED`, `TESTED`, `MERGED`, `DEPLOYED`, `RELEASED`, and research-maturity claims are intentionally separate.

| System | State | Evidence | Blocker | Next action |
|---|---|---|---|---|
| VertexED | SOURCE INTEGRATION ACTIVE / PROD VERIFY REQUIRED | `main` includes immutable build-revision stamping and account-scoped transient learner handoffs; source gates on inspected heads are green | exact deployed SHA, authenticated production golden journey, owner-controlled Supabase/security proof | verify production identity first, then run disposable-user golden journey |
| Project 2424 | ACTIVE / EVIDENCE-GATED | T2424-0037 NeuroCAD recovery was repaired, exact-head CI went green, and PR #266 merged; T2424-0025 robust-readout ablation rebuilt on current main, exact-head CI #918 green, PR #271 merged; T2424-0050 Darcy identity repair integrated | scientific reproduction/real-backend/mechanism-isolation gates remain per project | reproduce baselines and promote only measured candidates |
| T2424-0037 NeuroCAD | TESTED + MERGED / NOT RELEASED OR RESEARCH-COMPLETE | initial recovery CI exposed one regex syntax failure (348/349 passing); commit `7c79da9a...` repaired it; canonical CI run #914 succeeded; PR #266 merged with merge commit `c0a2e546...` | real OpenSCAD/CAD-kernel backend execution remains unmeasured; broader language coverage and independent reproduction remain open | run backend execution + robustness benchmark before stronger claim |
| Percy | TESTED ARTIFACTS / LIVE QUALIFICATION BLOCKED | current PR #257 head `47810e80...` passed canonical CI #925; branch records durable SQLite/WAL lifecycle, leases/heartbeats, evidence-gated completion, bounded concurrency and recovery tests | actual Mac/live runtime crash-restart, resource contention, provider integration and physical qualification | snapshot real state and prove persisted queue→claim→heartbeat→verify→complete/retry under real workers |
| Olympus | O0 DETERMINISTIC RUNTIME EVIDENCE / O1 NEXT | current PR #257 rationalizes Hermes/Prometheus/Perseus/Atlas/Kronos as deterministic runtime roles vs frozen speculative scale concepts; recovered runtime doctor/architectural benchmark and current head CI are green | no learned-provider O1 comparison; no trained large-model evidence | run preregistered matched-provider ~100-task O1 comparison; do not credit parameter-count names |
| Hercules | TRAINABLE/LOCAL-MODEL ARCHITECTURE OWNER / SCALE EVIDENCE LIMITED | latest rationalization separates trainable architecture work from Olympus runtime naming | matched-budget architecture baselines/ablations and real-hardware evidence before stronger maturity claims | keep trainable experiments under Hercules and compare against controlled baselines |
| Research Atlas | FRESH LOCAL REPRODUCIBILITY + PACKAGING EVIDENCE / EXTERNAL REPLICATION OPEN | PR #262 records 39/39 tests, 18 flagship reruns, extensions, 18 manuscript recompiles, 18-project+512-registry validation and regenerated 769-file release archives; exact-head CI previously observed green | not independent external replication, peer review, submission or 512 completed papers | preserve archive hashes; select only strongest studies for external reproduction/submission |
| FinanceMeta | CONTROL-REPO SECURITY OVERLAY INTEGRATED / TARGET+LIVE VERIFY BLOCKED | latest observed `main` commit `ceedf60ba...` integrates additive authorization + notification-integrity hardening and explicitly leaves immutable target/live Supabase untouched; truth-first content recovery remains on #261 due target 403 | canonical target application and live denial-path verification | apply through authorized target migration/content branches, then verify role escalation denial, notification integrity, persistence and public claims |
| The Bu1LD | RECOVERY READY / TARGET ACCESS BLOCKED | PR #261 contains exact-SHA proof-density/claims/people recovery; target write probes returned 403 | canonical target not writable through current GitHub installation; production hydration/backend proof unavailable | apply once target access exists, then verify deployment/hydration and role journeys |
| LAM-JEPA | RESEARCH-ONLY / NEGATIVE-INCONCLUSIVE | connected repo preserves a fail-closed negative/inconclusive research line in portfolio status | no positive superiority/mechanism claim supported | preserve negative result and separate release/legal gates |

## Architecture map

- **Hercules:** trainable/local-model architecture and learned-model experiments.
- **Olympus:** research runtime / deterministic roles; names such as Hermes, Prometheus, Perseus, Atlas and Kronos are not evidence of trained parameter-scale models.
- **Percy:** durable task orchestration/control infrastructure.

## Truth boundary

- No production deployment was performed by this execution pass.
- No production database mutation was performed by this execution pass.
- No force-push was used.
- A rejected non-fast-forward branch update was preserved rather than overridden.
- PR #266 was observed merged after its corrected head passed CI; the merge itself was not issued by this execution pass.
- Local clone/build execution is blocked in this environment by proxy/DNS resolution; GitHub Actions and already-recorded clean local reruns are kept distinct.
