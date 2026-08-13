# Reproduce NGMT

## Current scientific line

NGMT v0.1 is now a frozen learned Transformer-level B0–B3 development experiment with a retained negative/inconclusive outcome.

**Frozen verdict:** `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`.

The result must be reproduced under the committed v0.1 protocol. Do not tune the mechanism, tasks, seeds or thresholds to obtain a different verdict.

## Scientific provenance

Protocol/specification freeze commits, all before implementation/result observation:

```text
60d03821177a179ba0aec4253e3f987103c45f87  NGMT_V01_PROTOCOL.md
c077168986ebbf64a5e94eb12eff0afcf220ea56  online ordering clarification
876e1ca64f1f756d1d426bceea42139b743872fc  windowing/Transformer/batching freeze
8234b335c046b893fe241d25859f84a475ab907f  exact verdict arithmetic
```

Scientific implementation commit:

```text
540c471c329244363e18193b4ae982ffafc00b44
```

First invalid pre-science attempt:

```text
Actions run: 31661146957
head: 475fd26c568a71db8a82be87a1321fc1f06f9afd
artifact: 9166231239
artifact SHA-256: 97b191ac1a8ba3de2776c07caa6e38b28a6cd77330e8af82e69802b82995c42a
```

This failed during pytest collection because of test-loader module registration under Python 3.13; B0–B3 training did not execute. See `NGMT_V01_BUG_LOG.md`.

Valid scientific execution head after the loader-only repair:

```text
385ea6251561ed2a7b05b6a6f10307666b169b80
```

Valid Actions run and retained artifact:

```text
run: 31661313386
artifact: 9166307730
artifact digest: sha256:ec7d88d342271ad28b6f9ae485338985a219b7d43d55dd45350a4611c585ce76
raw results.json SHA-256: f8feeccc6ca864efc6389c9e8b9b952698d349251d332f81735c542913f33b14
```

## Environment

The canonical run retained:

```text
Ubuntu 24.04 hosted runner
Python 3.13.14
NumPy 2.5.2
PyTorch 2.13.0+cpu
CPU-only
float32 network tensors
4 reported logical CPUs
```

The complete scientific command used about `72.65 s` wall clock and peak RSS about `324132 KiB`.

## Local reproduction

From repository root, use Python 3.13 and a CPU PyTorch environment:

```bash
python -m pip install numpy pytest
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
pytest -q tests/test_ngmt_v01.py
python portfolio/research/ngmt/v01/run.py --output-dir artifacts/ngmt-v01
```

The invariant test suite should report:

```text
6 passed
```

The final stdout/completion verdict should be:

```text
NEGATIVE_OR_INCONCLUSIVE_NGMT_V01
```

A valid reproduction should retain `results.json`, `completion.json`, all twelve checkpoint files, environment capture, timing/resource data and a SHA-256 manifest.

## Exact protocol controls

Training seeds:

```text
11 23 37
```

Evaluation seed rule:

```text
10000 + training_seed
```

Prediction anchors:

```text
31 47 63 78
```

Per seed:

- 640 training sequences;
- 160 validation sequences;
- 120 evaluation sequences per named condition;
- 2,560 training prediction windows;
- 480 evaluation windows per condition.

Evaluation conditions are exactly:

```text
gaussian_clean
student_t
two_mode
regime_switch
outlier_bursts
nonstationary_mixture
```

Do not remove an adverse condition or substitute a friendlier metric after observing the result.

## B0–B3 matching

All four arms must retain exactly the same trainable model parameter count. The canonical run reports:

```text
B0 6049
B1 6049
B2 6049
B3 6049
```

B1/B2/B3 must each retain exactly 18 scalar online-memory state values per sequence. B0 uses no runtime external-memory state but keeps the same trainable two-feature projection and receives zeros.

## Frozen advancement arithmetic

For each seed, first average MSE across exactly these adverse conditions:

```text
student_t
two_mode
regime_switch
outlier_bursts
nonstationary_mixture
```

Then compute the paired seed-level relative B3 effects exactly as specified in `NGMT_V01_VERDICT_RULE.md` and average across the three paired seeds.

Pass requires all of:

```text
B3 vs B2 adverse relative improvement >= 0.05
B3 vs B1 adverse relative improvement >= 0.03
B3 vs B2 clean Gaussian relative regression <= 0.02
no B3 failed/divergent seed
identical trainable parameter count
B1/B2/B3 equal runtime-memory capacity
```

Canonical result:

```text
B3 vs B2 adverse mean improvement = 0.004945732296129727
B3 vs B1 adverse mean improvement = 0.004392875989642753
B3 clean regression vs B2        = 0.009600300111813348
```

The first two scientific-effect criteria fail. A reproduction should not be declared a positive NGMT result if these values reproduce within ordinary floating-point/environment tolerance.

## Raw evidence contract

The canonical Actions artifact contains:

```text
results.json
completion.json
environment.txt
process-time.txt
tests.log
stdout.log
12 model checkpoints
frozen protocol/specification snapshots
frozen scientific runner and invariant test snapshot
SHA256SUMS.txt
```

Always retain failed/divergent runs. Do not silently replace seeds.

## Relationship to T2424-0025

T2424-0025 remains a separate robust-aggregation precursor. It must not be cited as a Transformer-level NGMT result. Its zero-contamination negative control is one reason v0.1 was required to use explicit learned B0–B3 memory mechanisms.

## Stop / next-research rule

The v0.1 mechanism-advantage hypothesis is unsupported by the frozen result. Do **not** rescue v0.1 by changing thresholds, dropping conditions, swapping the headline metric or running its conditional positive-result ablations.

Any successor NGMT mechanism must receive a new versioned hypothesis/protocol before observing its validation evidence.
