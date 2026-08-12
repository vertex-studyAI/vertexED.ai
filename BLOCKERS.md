# BLOCKERS

Only blockers that currently prevent a stronger evidence-backed state belong here.

## P0 — target access / production evidence

### FinanceMeta target write + live authorization verification

**What is blocked:** application of the already-integrated authorization/notification hardening overlay to the canonical FinanceMeta target and credentialed Supabase denial-path testing.

**Evidence:** the control-repo recovery is integrated and historically green; target mutation attempts through the connected GitHub integration returned `403 Resource not accessible by integration`.

**Resolution:** expose/grant the canonical target repository to this GitHub installation, apply the additive migration on an isolated branch/environment, then verify ordinary members cannot write privileged role state or create system-only notifications.

### Bu1LD target write

**What is blocked:** applying the prepared truth-first public-site cleanup to the canonical Bu1LD repository.

**Evidence:** target write attempts through the connected GitHub integration were denied; the repository is not present in the current writable-repository enumeration.

**Resolution:** expose/grant target write access, apply the exact-SHA recovery on an isolated branch, then run target-native build, accessibility, navigation, form and claims checks.

### VertexED authenticated production golden journey

**What is blocked:** claiming full production verification.

**Evidence:** both linked Vercel provider checks are now green and build identity is integrated, but this wave has not executed an authenticated create/mock/review/reload user journey against the served revision.

**Resolution:** compare served health revision with intended main revision, then execute authenticated golden-path and denial/error-path smoke tests.

## P1 — runtime qualification

### Percy actual-Mac qualification

**What is blocked:** production-grade Percy reliability claim.

**Evidence:** bounded durable runtime and fail-closed state doctor are integrated and tested in repository CI; actual-Mac crash/restart, provider failure, long-running leases and multi-worker resource contention are not verified here.

**Resolution:** on the target Mac, queue real bounded tasks, kill/restart the service during queued/claimed/running states, inject provider failures and lease expiry, and retain DB/log/evidence hashes.

### Text-To-Video queue → verified-store integration

**What is blocked:** integration of the new completion contract.

**Evidence:** PR #30 exists on current main base and its CI is still running at this snapshot.

**Resolution:** require current-head CI success, merge explicitly, then rerun the local queue/media smoke on merged main.

## P2 — research promotion

### Olympus / Hercules O1 matched experiment

**What is blocked:** promotion beyond deterministic/toy architecture evidence.

**Evidence:** no same-dataset, same-tokenizer, same-parameter/training-budget Transformer vs proposed vs mechanism-ablation run has been completed in this wave.

**Resolution:** run the matched experiment and retain loss, downstream metrics, memory, throughput, instability, parameter count and wall-clock evidence.

### T2424-0025 stronger mechanism claim

**What is blocked:** claiming a uniquely non-Gaussian-memory advantage.

**Evidence:** robust readouts outperform the mean even in the 0% contamination control.

**Resolution:** either formalize and test a mechanism-specific intervention with matched baselines/ablations or narrow/archive the stronger claim while retaining the generic robustness finding.

### NeuroCAD paper-level generalization

**What is blocked:** paper-level learned-language superiority claim.

**Evidence:** current artifact is a strong controlled-language compiler benchmark, but not an arbitrary-language comparison.

**Resolution:** freeze one learned provider and one prompt set, compare direct generation vs typed-IR generation under the same provider/budget, and retain failures and CAD-kernel results.
