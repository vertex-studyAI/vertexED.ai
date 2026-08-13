# Reproduce T2424-0025

## Scientific freeze

Use frozen experiment revision:

```text
0d2a14e559b0caa9b5b1cbeef0995013594ecf15
```

Do not alter the experiment after observing the result. If a defect is found, preserve the failed output, commit the smallest fix separately, rerun unchanged scientific commands, and label the old and new evidence distinctly.

## Verified verifier-bug lineage

A post-run verifier failure occurred in Actions run `31617979117`: it expected an obsolete ablation JSON shape. The scientific commands had already completed and emitted results.

Verifier-only fix revision:

```text
bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7
```

The scientific entry points are byte-identical between the frozen source and this verifier-fix revision:

```text
experiment/run.mjs      e5987fb6021fa0ed550166c8c45c8f4acce6fc1e
experiment/ablation.mjs ed0e5b600425f67ae3e60e9809d8b9c8378bcaae
```

No experiment seed, metric, contamination level, readout, threshold, or claim boundary changed.

## Repository-conformant retained reproduction

Actions run:

```text
31618609967
```

Latest independently audited retained attempt:

```text
run attempt: 3
head: bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7
artifact: 9162627168
artifact digest: sha256:d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae
```

Environment retained in the artifact:

- Node.js `v22.22.0`
- npm `10.9.4`
- Linux `6.17.0-1022-azure`, x86_64
- 4 visible CPUs
- no accelerator or external API required

Attempt-3 wall times:

- screen: `0.12 s`
- ablation: `1.08 s`

## Commands

From repository root, the focused scientific commands are:

```bash
node portfolio/project2424/projects/T2424-0025/experiment/run.mjs > screen.json
node portfolio/project2424/projects/T2424-0025/experiment/ablation.mjs > ablation.json
node --test tests/project2424NonGaussianMemory.test.mjs tests/project2424NonGaussianMemoryAblation.test.mjs
```

For fail-closed evidence capture, use:

```bash
set -euo pipefail
mkdir -p evidence/timing
/usr/bin/time -p -o evidence/timing/screen.time \
  node portfolio/project2424/projects/T2424-0025/experiment/run.mjs \
  | tee evidence/screen.json
/usr/bin/time -p -o evidence/timing/ablation.time \
  node portfolio/project2424/projects/T2424-0025/experiment/ablation.mjs \
  | tee evidence/ablation.json
node --test tests/project2424NonGaussianMemory.test.mjs tests/project2424NonGaussianMemoryAblation.test.mjs \
  | tee evidence/tests.log
sha256sum evidence/screen.json evidence/ablation.json evidence/tests.log
```

The repository's hardened runner is `.github/workflows/research-repro-wave-20260812.yml`. On the isolated `repro-wave/project2424-20260813` branch it additionally enables explicit `pipefail`, timing capture and a SHA-256 manifest; those are evidence-runner changes only.

## Protocol

### Bounded screen

- 24 anchor queries on `[0,1]`
- seven replicas per anchor
- deterministic smooth latent signal
- deterministic RBF attention
- small key noise
- clean condition: Gaussian value noise
- heavy-tail condition: Cauchy-contaminated values
- baseline: weighted arithmetic mean
- proposed bounded readout: weighted median
- deterministic seeds: 30
- metric: MAE, lower is better

### Contamination ablation

- contamination levels: `0, 0.05, 0.10, 0.18, 0.25, 0.35`
- estimators: arithmetic mean, weighted median, 10% weighted trim, Huber (`delta=0.15`)
- deterministic seeds: 50 per condition
- negative control: 0% Cauchy contamination
- report mean, sample SD and sample count; retain raw rows for distribution-aware follow-up

## Sentinels

30-seed screen:

```text
heavy-tail mean MAE   0.36152678546712497
heavy-tail median MAE 0.016560942261867797
clean mean MAE        0.024354967043193555
clean median MAE      0.012593962713833545
```

At 18% contamination (`n=50`):

```text
mean   0.3494393236413256 ± 0.34720341329882964
median 0.017002512132865903 ± 0.004857686860296252
trim   0.04550633252740887 ± 0.01571336013006776
Huber  0.030925536516162495 ± 0.006796244399198665
```

At the 0% negative control:

```text
mean   0.02464691771133496 ± 0.0023115771827692763
median 0.012569888975136025 ± 0.0020830878466683114
```

The 0% result is a scientific limiter: robust readout benefit exists without Cauchy contamination, so do not interpret the screen as unique evidence for non-Gaussian memory.

## Cross-rerun verification

Retained artifacts:

```text
attempt 2: artifact 9162075012
attempt 3: artifact 9162627168
```

They have the same 15-file set. The screen JSON, ablation JSON and canonical T2424-0025 verifier JSON are byte-identical across attempts.

Attempt-3 scientific hashes:

```text
screen.json   sha256:7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1
ablation.json sha256:f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e
verifier.json sha256:ba0e73902ef8cd2dabc66995bffbd20476afad7aa23f8302ce4be7e68f736188
```

Full audit:

```text
portfolio/research/reproducibility-wave-20260813/PROJECT2424_INDEPENDENT_AUDIT.md
portfolio/research/reproducibility-wave-20260813/project2424_independent_audit.json
```

## Claim boundary

A successful rerun supports only the synthetic robust-readout mechanism screen. It does not establish a learned memory architecture, Transformer performance, general non-Gaussian memory advantage, or NGMT.

## NGMT promotion gate

Do not call this experiment NGMT evidence beyond a precursor screen. Freeze an actual learned memory architecture before training:

- B0 no memory
- B1 standard memory
- B2 Gaussian/reference robust memory
- B3 proposed non-Gaussian memory

Match dimensions and parameter count, freeze clean/heavy-tail/regime-shift sequence tasks, use paired seeds, and predeclare a falsification rule. If B3 cannot be formalized or fails those controls, NGMT remains blocked.
