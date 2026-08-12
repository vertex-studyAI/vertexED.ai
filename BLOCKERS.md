# BLOCKERS

As of: 2026-08-12 20:12 IST

Only genuine blockers belong here.

## P0 — Canonical repository access

### FinanceMeta target mutation
- **Failure:** current GitHub App installation does not expose the canonical FinanceMeta target repositories for write operations.
- **Evidence:** installation enumeration exposes only the `vertex-studyAI` organization and three repositories.
- **Impact:** merged control-repo authorization recovery cannot yet be applied to the real target; live Supabase denial-path verification cannot be truthfully claimed.
- **Resolution:** install/authorize the GitHub integration on the canonical FinanceMeta repository, then apply the additive recovery on a fresh branch and test the actual backend.

### Bu1LD target mutation
- **Failure:** canonical Bu1LD target is not available to the current GitHub installation.
- **Impact:** truth-first claims/content recovery cannot be applied or built on the real site.
- **Resolution:** authorize target repository access, apply the bounded recovery package, then run target-native build/accessibility/deployment checks.

## P0 — VertexED production proof

- **Failure:** source integration and CI do not establish that the exact latest SHA is what production serves or that authenticated owner-controlled flows succeed end-to-end.
- **Evidence:** build revision stamping and account isolation are integrated; previous PR production smoke was conditionally skipped in some runs.
- **Resolution:** verify served revision, then execute disposable-user signup/login/mock/review/logout/account-switch tests against production with backend authorization checks.

## P0 — Percy real-host qualification

- **Failure:** durable runtime and state doctor are repository-tested but not qualified on the actual long-running Mac/provider stack.
- **Evidence:** CI #929 and #932 cover bounded runtime/state integrity; no actual-Mac crash/restart/soak evidence is currently connected.
- **Resolution:** run queued/in-flight crash recovery, lease expiry, stale-owner, provider timeout, duplicate side-effect and multi-worker resource tests on the real host.

## P1 — Research mechanism isolation

### T2424-0025
- **Failure:** robust estimators also outperform the mean in the 0% contamination control.
- **Impact:** current result supports generic robustness/smoothing, not a uniquely non-Gaussian-memory advantage.
- **Resolution:** add matched robust Gaussian/reference controls and mechanism-specific ablations before paper promotion.

### T2424-0050 Darcy
- **Failure:** current evidence is a bounded synthetic screen, not a learned neural operator or real porous-media benchmark.
- **Resolution:** train matched-budget learned baselines and evaluate on a frozen operator-learning dataset with held-out regimes.

### Olympus/Hercules
- **Failure:** no same-budget Transformer vs proposed architecture vs ablation experiment has crossed O1/O2 evidence gates.
- **Resolution:** freeze dataset/tokenizer/parameter/optimizer/training budget and compare loss, convergence, memory, throughput, downstream score and instability.

## P1 — External research validation

- **Failure:** fresh local Research Atlas reproduction is not independent replication, peer review, submission or acceptance.
- **Resolution:** choose 1–3 strongest studies, regenerate canonical result tables, run independent reproduction and prepare venue-appropriate submissions.

## Capacity note

Earlier Vercel bot output reported the free-plan deployment-per-day limit on one linked project after >100 deployments. This is a deployment-capacity constraint, not a source-code failure; avoid unnecessary preview churn.