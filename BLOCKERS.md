# BLOCKERS — 12 August 2026

Only genuine evidence-backed blockers belong here.

| Priority | System | Blocker | Evidence | Resolution gate |
|---:|---|---|---|---|
| P0 | VertexED PR #268 | Both linked Vercel preview integrations currently report deployment errors even though repository CI is green. | Exact head `48396323d4fc0209676e4d65125a1cb68a2163ca`; canonical CI #915 succeeds; Vercel statuses fail. | Diagnose preview failures from Vercel deployment logs/account state. Do not weaken CI or deploy around the failure. |
| P0 | VertexED production identity | Source now stamps immutable build revision, but public production serving SHA is still not proven. | PR #233 merged source-level build-revision recovery. | Explicitly authorized deployment followed by external `/api/health` exact-SHA verification. |
| P0 | FinanceMeta | Target GitHub write path is unavailable through the connected integration and production Supabase is not connected. | Existing portfolio status records integration-level 403 and missing production Supabase. | Grant target-repo write permission and connect authorized production Supabase; then rerun hardening and golden journey. |
| P0 | The Bu1LD | Production verification needs real DB/Auth/env/email/role access not present in this environment. | Existing portfolio status and current CI only prove source/fail-closed behavior. | Connect authorized Supabase/production environment and disposable role accounts; execute live allow/deny journeys. |
| P0 | Percy | No canonical source/runtime/SQLite queue/heartbeats are exercisable through current connectors. | Portfolio status marks `BLOCKED_SOURCE / BLOCKED_RUNTIME`. | Expose source/runtime; back up and integrity-check state, then prove one persisted task claim→execute→heartbeat→verify→commit/retry progression. |
| P0 | Atlas | Canonical source is not exposed through the current GitHub installation. | Portfolio status marks `BLOCKED_SOURCE`. | Connect canonical repository/source. |
| P1 | Hercules / Olympus | Canonical implementation, weights and result evidence are unavailable. | Portfolio registry records source/results unavailable; Olympus also lacks verified owner/weights. | Connect canonical source and run a compact matched-compute baseline/ablation before any scale or model-maturity claim. |
| P1 | Project 2424 certification | Tested/merged packages are not Certified Complete. | First-100 contract requires nine evidence gates; no observed merge changed the 0/100 certification claim. | For each candidate: immutable identity, falsifiable claim, frozen protocol, runnable command, baseline, raw artifacts, ablation/negative analysis, verdict and independent QA. |
| P1 | Project 2424 truth ledger | 11 August dashboards still say T2424-0050 collision unresolved and 12 merged tested implementations. | PR #253 is now merged; the prior ledger itself states successful integration moves count 12→13. | Refresh First-100 and master dashboards from current `main`, then re-enumerate remaining manual PRs without double-counting. |

## Not blockers

- A named project without source is not a blocker to claiming it exists; it is a blocker to claiming implementation/training/evaluation.
- A green CI badge is not blocked merely because no deployment occurred; deployment is a separate gate.
- Negative scientific results are not failures of execution when the frozen experiment ran correctly.
