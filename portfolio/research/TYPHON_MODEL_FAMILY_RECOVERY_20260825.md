# Typhon MODEL-Family Recovery — 25 August 2026

**Scope:** retained Library handoffs/evidence for historical Typhon Omega / Paper Foundry model packages that are not all present as canonical source trees in the connected Git repository.

**Truth rule:** these records can recover historical package identity, tests, commands, evidence and negative findings. They do not magically create a current canonical Git repository. Where source bytes are not materialized, the line remains source-recovery or evidence-package recovered.

## MODEL-001 — PI-JEPA

**Recovered state:** `BOUNDED_EXPERIMENTAL_RELEASE / REPRODUCIBLE_SYNTHETIC_NEGATIVE_COMPARISON`.

Two retained layers are important and must not be conflated:

1. an early deterministic `pi-jepa-smoke-v2` implementation smoke, explicitly `SYNTHETIC_CONTROLLED` and `scientific_validation=false`;
2. a later bounded PDE release whose clean-checkout reproduction matched its scientific summary and **rejected the primary performance hypothesis**.

Later bounded result:

| Method | mean test MSE |
|---|---:|
| PI-JEPA-inspired configuration | 0.0032590046 |
| supervised MLP | 0.00020150924 |
| ridge | 0.000067075685 |
| persistence | 0.000072380448 |

The retained report records nine passing tests, twelve declared runs, and a passed audit. The frozen conclusion is that the tested configuration underperformed the simple baselines and must not be promoted as a successful method.

A separate catalog entry records PI-JEPA as E4 test-verified with a CPU 1-D heat-equation smoke and negative comparison preserved. The retained artifacts carry more than one revision identifier (`36c028e...` in the catalog and `0560311` in the bounded clean-checkout report), so revision lineage must be resolved rather than silently treated as one commit.

Historical MODEL-001 local package paths include `projects/MODEL-001/PROJECT_MANIFEST.json`, `projects/MODEL-001/src/pi_jepa/core.py`, `projects/MODEL-001/experiments/run.py`, and claim/evidence records. A retained smoke config uses train seed 11, test seed 12 and model seed 7 on a tiny deterministic diffusion system.

**Morning target:** recover/materialize the exact bounded release source corresponding to the frozen negative result; bind the revision/hash lineage; run tests/reproduction only; prepare a new licensed-real-data successor protocol separately. Do not expand a manuscript around the bounded synthetic negative result as if it were positive.

## MODEL-002 — FinanceJEPA

**Recovered state:** `COMPACT_EVIDENCE_COMPLETE / SYNTHETIC_CONTROLLED`.

Historical handoff says a complete self-contained `projects/MODEL-002/` package existed with source, tests, configs, datasets, baselines, experiments, benchmarks, evidence, results, reports, docs and manuscripts.

Protected identity: broad financial-market joint-embedding predictive representation learning, explicitly **not** FI-JEPA's macro/liquidity/volatility/alpha operator split.

Historical checks:

- `make test` → 9 passed
- `make smoke` → 2 controlled runs
- `make experiment-compact` → 15 controlled runs
- `make robustness` → protocol generated
- `make evidence-index` → hashes generated
- `make paper-check` → passed, 5,123 substantive words / 12 claim records
- compileall + forbidden-production-pattern scan passed

Compact configuration:

- seeds: `7, 17, 29`
- dataset: `financejepa-synthetic-v1`, per-seed SHA-256
- variants: proposed, no_horizon, no_ema, no_pretraining, shuffled_time

Retained proposed aggregate:

- return RMSE: `0.05238913 ± 0.02441242`
- volatility RMSE: `0.02764112 ± 0.00864935`
- regime accuracy: `0.74479167 ± 0.05487320`
- persistence return RMSE: `0.06063059 ± 0.03364107`

Important negative/mixed findings:

- no-EMA has the highest mean regime accuracy (`0.79167`);
- no-horizon has the lowest mean volatility RMSE (`0.02729`);
- no-EMA slightly improves return RMSE over proposed;
- random features remain competitive on some probes;
- shuffled-time remains competitive on pointwise metrics;
- transaction-cost Sharpe is high-variance synthetic diagnostic, not market evidence.

**Morning target:** recover actual package bytes/manifest identity, resolve canonical project ID, preserve synthetic-only classification, and prepare a lawful point-in-time real-market dataset adapter contract. The historical handoff itself says the full run must not start until canonical ID and lawful checksum-pinned data replace the synthetic-only full config.

## MODEL-003 — Eigen-JEPA

**Recovered state:** `COMPACT_EVIDENCE_COMPLETE / FROZEN_NEGATIVE_PRIMARY`.

Historical package contained a project-specific NumPy implementation, 10 passing tests, wheel/installed-package verification, smoke + five-seed compact experiment, persistence/spectrum-only/direct-covariance comparators, ablations, synthetic robustness and rank sweep, dataset/baseline/benchmark contracts, evidence, manuscript and a verified PDF.

Compact seeds: `7, 19, 31, 43, 59`.

Frozen primary projector-distance result:

| Method | projector distance |
|---|---:|
| Eigen-JEPA | 0.392696462 |
| persistence | 0.251215684 |

The predeclared primary result is negative. Persistence is also better on trace-normalized spectrum MSE and covariance reconstruction, and rank sweeps 1–4 do not remove the failure. Supported secondary diagnostics include eigengap weighting outperforming uniform weighting within the learned family and projector regression outperforming raw eigenvector-coordinate regression.

**Morning target:** recover/materialize the historical package and run `scripts/final_verify.py` before any successor work. A successor geometry variant must live under a new frozen protocol with true Grassmann log/exp velocity and uncertainty-gated persistence fallback; do not metric-switch or rewrite the five-seed negative result.

## MODEL-APEN — Adaptive Predictive Engram Networks

**Recovered state:** `COMPACT_EVIDENCE_COMPLETE / CONTROLLED_MIXED_NEGATIVE_BOUNDARIES`.

Historical package checks:

- `make test` → 9 passed
- `make smoke` → 10 records
- `make experiment-compact` → 130 records
- `make paper-check` → passed, 4,533 words
- Markdown→LaTeX and JSON validation passed

Compact seeds: `3, 11`; scenarios: abrupt, gradual, recurring, distractor, pressure.

Frozen negative/boundary evidence includes:

- worse than no-memory during distractor bursts;
- disabling the current novelty detector improves aggregate controlled MSE;
- high retrieval interference;
- delayed-adaptation ablation does not support the desired mechanism because aggregate output matches default;
- only two compact seeds; no external dataset.

The historical handoff suggests replacing instantaneous novelty with a persistence-aware detector and rerunning compact. Under the current research-freeze policy, that is a **new successor protocol**, not an in-place rescue of the frozen result.

**Morning target:** recover/materialize package bytes and hash lineage, validate `make test && make paper-check`, then freeze a versioned successor protocol before any new outcome run.

## MODEL-NPMS — Neural Predictive Memory Spectroscopy

**Recovered state:** `COMPACT_EVIDENCE_COMPLETE / SYNTHETIC_CONTROLLED_DIAGNOSTIC`.

Historical package checks:

- `make test` → 17 tests passed
- isolated target installation passed
- smoke → linear dynamical + delayed-copy systems
- compact → seeds `7, 19, 41`, all five required systems, 15 runs and 36 ablation records
- robustness → 45 noise/sparsity records
- paper-check → 5,709 words / 16 claim-evidence rows

Frozen limitations/failures:

- delay-PCA recovery is substantially worse than identity smoke on directly observed linear modes;
- multiscale AR spectral recovery remains weak;
- negative switching regime is poorly recovered;
- matched-eigenvalue metric ignores spurious/missing modes;
- mode truncation ranks individual eigenvalues rather than conjugate groups;
- frequency response is an autonomous-operator resolvent proxy, not full input-output transfer.

**Morning target:** recover/materialize historical package, validate exact test/compact/paper commands, preserve the limitations, and freeze a successor protocol for contiguous regime fitting, conjugate-group truncation, residual spectral verification/bootstrap uncertainty and direct interventions. No external claim until trained-model/real-data evidence exists.

## MODEL-PST — Predictive Stability Theory / single-cell transition scoring

**Recovered state:** `COMPACT_EVIDENCE_COMPLETE / SYNTHETIC_CONTROLLED_NEGATIVE_BOUNDARY`.

Historical package contains source, tests, configs, dataset/baseline contracts, experiment CLIs, evidence/checkpoints/reports, manuscript/PDF, bibliography and claim-evidence matrix.

Protected leakage boundaries:

- replicates split train/validation/test before transition-pair construction;
- adjacent pairs never cross replicate/branch boundaries;
- preprocessing fitted on training cells only;
- calibration fitted on validation diagnostics only;
- historical Paul15/Pancreas/Dentate values remain unverified absent raw logs/versioned datasets/source.

Historical checks: 7 tests passed, placeholder/paper checks passed, all 24 per-experiment evidence manifests passed SHA-256/size validation.

Frozen controlled findings include:

- smoke AUROC `0.6000`;
- raw-expression logistic and linear logistic-pair baselines outperform neural PST on the controlled generator;
- validation-only calibration worsens multiple metrics;
- four-dimensional latent bottleneck is weaker/unstable;
- all genes outperform variance selection in the generator;
- fixed family-A→B transfer AUROC `0.6577` while family-B in-domain retraining reaches `0.9903`.

**Morning target:** preserve this negative boundary; recover exact package identity; keep external biology blocked until approved accession, license, exact version, checksum, label contract and historical evidence are present. Do not use `datasets/download.py paul15` unless those external-data gates are actually satisfied.

## MODEL-PEN — Predictive Engram Networks

See `PEN_RECOVERY_LEDGER_20260824.md`.

Current recovery state: historical 141-file source/evidence identity and hash ledger substantially recovered; actual source bytes not yet materialized. Retained compact evidence is negative/mixed and must remain so.

## Cross-family conclusion

These recovered MODEL packages materially upgrade the stale E1 catalog view, but the status is heterogeneous:

- **PI-JEPA:** reproducible bounded negative release;
- **FinanceJEPA:** complete synthetic compact package, mixed ablations, no lawful real-market full run yet;
- **Eigen-JEPA:** complete compact package with negative predeclared primary result;
- **APEN:** complete compact package with clear mechanism/failure boundaries;
- **NPMS:** complete controlled diagnostic package with known spectral failure modes;
- **PST:** complete synthetic controlled package where simple baselines beat neural PST on key comparisons;
- **PEN:** strong historical source/evidence identity recovered, bytes still missing.

The morning objective for this family is therefore **recovery + hash binding + tests/reproduction + successor-protocol separation**, not generating new favorable outcomes.