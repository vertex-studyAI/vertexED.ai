# NGMT Results

**Updated:** 13 August 2026  
**Current state:** `V0.1_LEARNED_B0_B3_EXECUTED / NEGATIVE_OR_INCONCLUSIVE / MECHANISM_ADVANTAGE_UNSUPPORTED`

## Executive result

NGMT now has a real, frozen, learned Transformer-level B0–B3 development experiment. The result is **negative/inconclusive**, not a superiority result.

The proposed Student-t memory B3 was fairly matched and executed without divergence, but it missed both preregistered adverse-condition advantage thresholds:

- paired B3 relative improvement over Gaussian-memory B2: **`+0.4946% ± 1.5472%` sample SD, `n=3`**; required `>= 5%`;
- paired B3 relative improvement over standard kernel-memory B1: **`+0.4393% ± 1.1529%` sample SD, `n=3`**; required `>= 3%`;
- paired clean-Gaussian relative regression of B3 vs B2: **`+0.9600% ± 2.7060%` sample SD, `n=3`**; allowed `<= 2%`.

Fairness and execution controls passed:

- B0/B1/B2/B3 trainable parameters: **6,049 each**;
- B1/B2/B3 online-memory capacity: **18 scalar state values each**;
- B3 failed/divergent seeds: **0/3**;
- frozen invariant tests: **6 passed**;
- first valid scientific run completed on CPU float32.

**Verdict:** `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`.

Do not claim NGMT superiority, a validated Student-t-memory benefit, general long-context improvement, or statistical significance.

---

## v0.1 question and frozen methods

The protocol asks whether an explicitly heavy-tailed non-Gaussian memory improves next-step prediction on heavy-tailed, multimodal, regime-switching, outlier-burst and non-stationary synthetic sequences under equal trainable-network size and equal B1–B3 runtime-memory capacity.

All arms share the same tiny causal Transformer:

- `d_model=24`;
- one Transformer encoder block;
- three attention heads;
- feed-forward width `48`;
- context length `16`;
- identical two-scalar memory projection present in every arm;
- identical predictor head and training budget.

The only arm-specific difference is the online external-memory rule:

- **B0:** no external memory; memory feature fixed to `(0,0)` while retaining the same trainable projection;
- **B1:** standard similarity/kernel memory;
- **B2:** Gaussian-mixture probabilistic memory;
- **B3:** Student-t mixture responsibilities (`nu=3`) plus bounded heavy-tail influence in the write update.

B3 is therefore operationally non-Gaussian; it is not a relabeling of the T2424-0025 weighted-median precursor.

## Protocol provenance

The scientific degrees of freedom were frozen before implementation or result observation in four commits:

1. `60d03821177a179ba0aec4253e3f987103c45f87` — B0–B3 mechanism, tasks, seeds, budget and initial gates;
2. `c077168986ebbf64a5e94eb12eff0afcf220ea56` — write-then-read online-memory ordering;
3. `876e1ca64f1f756d1d426bceea42139b743872fc` — exact prediction anchors, Transformer defaults and batching;
4. `8234b335c046b893fe241d25859f84a475ab907f` — exact paired-seed verdict arithmetic.

Implementation followed at `540c471c329244363e18193b4ae982ffafc00b44`.

## Bug-before / fix-after lineage

The first attempted Actions execution, run `31661146957` at head `475fd26c568a71db8a82be87a1321fc1f06f9afd`, failed **before scientific training** because the pytest dynamic loader did not register its module in `sys.modules`, which Python 3.13 dataclass decoration requires.

That invalid attempt is retained in `NGMT_V01_BUG_LOG.md` with artifact `9166231239`, ZIP SHA-256:

`97b191ac1a8ba3de2776c07caa6e38b28a6cd77330e8af82e69802b82995c42a`.

Only the test-loader plumbing was fixed at `385ea6251561ed2a7b05b6a6f10307666b169b80`. The protocol, scientific implementation, model, data, seeds, metrics and thresholds were unchanged.

The valid scientific run is Actions run `31661313386`, head `385ea6251561ed2a7b05b6a6f10307666b169b80`, artifact `9166307730`, artifact digest:

`sha256:ec7d88d342271ad28b6f9ae485338985a219b7d43d55dd45350a4611c585ce76`.

Raw `results.json` SHA-256:

`f8feeccc6ca864efc6389c9e8b9b952698d349251d332f81735c542913f33b14`.

## Dataset / task

Each sequence has length 80. Exactly four prediction anchors per sequence are used: `[31,47,63,78]`; each prediction receives the trailing 16 observations through `x_t`, post-write online-memory features through `x_t`, and predicts `x_{t+1}`.

Training regimes:

1. Gaussian AR;
2. Student-t AR;
3. two-mode switching;
4. regime-switching AR.

Held-out conditions:

- `gaussian_clean`;
- `student_t`;
- `two_mode`;
- `regime_switch`;
- `outlier_bursts`;
- `nonstationary_mixture`.

Training seeds are exactly `[11,23,37]`; evaluation data use seed rule `10000 + training_seed`. Per seed: 640 training sequences, 160 validation sequences and 120 held-out sequences per condition.

## Aggregate MSE by condition

Mean ± sample SD across the three paired seeds:

| Condition | B0 no memory | B1 standard memory | B2 Gaussian memory | B3 Student-t memory |
|---|---:|---:|---:|---:|
| Gaussian clean | 0.139270 ± 0.014639 | **0.133579 ± 0.006401** | 0.135369 ± 0.006292 | 0.136770 ± 0.009683 |
| Student-t | 0.178662 ± 0.043983 | **0.171299 ± 0.050169** | 0.172032 ± 0.049209 | 0.175590 ± 0.047852 |
| Two-mode | 0.454422 ± 0.092348 | **0.450647 ± 0.080080** | 0.452293 ± 0.088570 | 0.451210 ± 0.087277 |
| Regime switch | 0.124937 ± 0.025668 | **0.117672 ± 0.017520** | 0.121314 ± 0.020073 | 0.120015 ± 0.020236 |
| Outlier bursts | 1.358840 ± 0.321930 | 1.348643 ± 0.303248 | 1.338377 ± 0.286483 | **1.334157 ± 0.313956** |
| Nonstationary mixture | 0.882721 ± 0.051553 | 0.881757 ± 0.043652 | 0.886406 ± 0.056120 | **0.878572 ± 0.050395** |

The adverse-condition aggregate is the unweighted mean MSE across the five non-clean conditions, first computed within each paired seed as preregistered.

Across seeds, mean adverse MSE was approximately:

- B0: `0.599916`;
- B1: `0.594004`;
- B2: `0.594084`;
- B3: `0.591909`.

The small B3 point advantage is far below the frozen advancement thresholds.

## Paired seed effects

| Seed | B3 vs B2 adverse improvement | B3 vs B1 adverse improvement | B3 clean regression vs B2 |
|---:|---:|---:|---:|
| 11 | -0.5507% | -0.6678% | +3.5560% |
| 23 | -0.2375% | +0.3527% | +1.1681% |
| 37 | +2.2719% | +1.6330% | -1.8440% |
| **Mean** | **+0.4946%** | **+0.4393%** | **+0.9600%** |

The effect is inconsistent across only three seeds. No significance claim is appropriate.

## Runtime / compute

Environment retained by Actions:

- Ubuntu 24.04 hosted runner;
- Python `3.13.14`;
- NumPy `2.5.2`;
- PyTorch `2.13.0+cpu`;
- CPU-only float32;
- four reported logical CPUs.

The full 12-model scientific command used about `72.65 s` wall clock and peak RSS about `324,132 KiB` (~316.5 MiB). Per arm/seed training runtimes were about `0.94–0.96 s` after data/memory-feature preparation.

## Advancement criteria

| Frozen criterion | Result |
|---|---|
| B3 mean paired adverse improvement over B2 ≥5% | **FAIL** (`0.4946%`) |
| B3 mean paired adverse improvement over B1 ≥3% | **FAIL** (`0.4393%`) |
| B3 mean clean regression vs B2 ≤2% | PASS (`0.9600%`) |
| No B3 divergence | PASS |
| Identical trainable parameter count | PASS (`6,049` each) |
| Equal B1/B2/B3 runtime memory capacity | PASS (`18` scalars each) |

Because two required scientific-effect gates fail, the v0.1 verdict is negative/inconclusive even though execution and matching are green.

## Relationship to T2424-0025 precursor

The earlier T2424-0025 50-seed synthetic aggregation screen remains relevant as a precursor only. At 18% Cauchy contamination, weighted median strongly beat arithmetic mean, but the median also strongly beat the mean at 0% contamination. That negative control showed that generic robust aggregation was a central alternative explanation.

NGMT v0.1 was therefore deliberately designed as a separate learned sequence experiment with explicit B0–B3 memory mechanisms. Its negative result reinforces the need not to promote the precursor into a Transformer claim.

## Limitations

- synthetic sequence processes only;
- tiny Transformer;
- three paired seeds, not enough for significance claims;
- MSE/MAE prediction task only;
- fixed online-memory hyperparameters;
- no natural-language or long-context benchmark;
- no external dataset;
- no independently implemented replication;
- the preregistered B3 mechanism-isolation ablations are required only after a positive v0.1 gate, so they are not used to rescue this failed result.

## Current defensible claim

> Under the frozen NGMT v0.1 tiny-Transformer development protocol, the explicit Student-t online memory executed fairly and reproducibly but did not deliver the preregistered adverse-condition advantage over standard or Gaussian memory. The mechanism-advantage hypothesis is unsupported by this experiment.

That negative result is first-class research evidence and should remain visible in manuscripts and portfolio status.
