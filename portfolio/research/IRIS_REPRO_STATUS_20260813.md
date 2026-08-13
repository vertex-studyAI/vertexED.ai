# IRIS v0.2 — Fresh Reproducibility Status — 13 August 2026

**Evidence source:** recovered Library archive `IRIS_v0.2_research_package(1).zip`  
**Archive SHA-256:** `5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`  
**Remote source state:** canonical IRIS Git repository is not available in the connected GitHub installation.  
**Promotion:** `REPRODUCED / NOT EXTERNALLY VALIDATED / NOT SUBMISSION READY`.

## Scientific question

Can a history-conditioned bounded-influence recurrent write improve robustness to isolated heavy-tailed observation corruption relative to a matched Huber write while preserving Huber-level clean accuracy and adaptation to persistent location shifts?

## Methods and controls

The corrected v0.2 package keeps the broad claim deliberately narrow. EXP-004 compares HTAM against EMA, clipped EMA and Huber controls under shared scale dynamics in a 20-seed scalar benchmark. EXP-003 compares capacity-matched learned recurrent write functions—EMA, Huber-2.5, Huber-4, HTAM, a static bounded mixture and PABIM—on a synthetic latent-state tracking task.

Student-t conditions are matched to Gaussian noise by population MAD rather than the invalid variance-matching language from v0.1. PABIM interpolates between bounded influence branches and uses prior persistence evidence; its tested hyperparameters were frozen after development on older seeds.

## Seed policy

- legacy development: seeds `0–4` / `0–19` depending experiment;
- EXP-003 learned held-out block: `100–104`;
- EXP-004 scalar held-out block: `100–119`;
- successor confirmatory seeds: **not run**. The recovered package says allocate a new untouched block only after the successor mechanism, baselines, metrics and analysis are frozen; it suggests `200–219`.

No successor confirmatory block was accessed in this reproduction.

## Fresh reproduction environment

The clean rerun matched the package's captured software environment:

- Python `3.13.5`;
- NumPy `2.3.5`;
- SciPy `1.17.0`;
- PyTorch `2.10.0+cpu`;
- Linux `6.18.35` x86_64;
- CUDA unavailable.

Commands executed:

```bash
sha256sum -c SHA256SUMS.txt
python -m pytest -q
python experiments/run_scalar_v2.py
python experiments/run_sequence_v2.py
python experiments/make_figures_v2.py
```

## Reproduction outcome

- package integrity: **PASS** before rerun;
- tests: **4 passed**;
- scalar run: exit `0`, internal runtime `4.319 s`, measured wall `5.50 s`;
- learned run: exit `0`, internal runtime `21.422 s`, measured wall `23.82 s`;
- figure regeneration: exit `0`, wall `1.77 s`;
- peak RSS: approximately 184 MB scalar and 443 MB learned;
- all raw CSVs, summary CSVs and paired-statistics CSVs: **byte-identical to packaged evidence**;
- all regenerated figures and paper tables: **hash-identical to packaged evidence**;
- only the scalar and learned manifest files changed hashes, because their runtime fields were regenerated.

Machine-readable evidence is retained in `portfolio/research/evidence/iris-v0.2-fresh-reproduction-20260813.json`.

## Results

### Corrected scalar control — EXP-004

Against the common-scale Huber cap-4 comparator across 20 seeds:

| Condition | HTAM relative MSE improvement | Bootstrap 95% CI | Outcome |
|---|---:|---:|---|
| Student-t(2) | `+30.27%` | `[28.71%, 31.80%]` | localized heavy-tail advantage reproduced |
| Student-t(3) | `+19.33%` | `[17.66%, 21.00%]` | positive but narrower |
| Abrupt regime | `-7.27%` | `[-9.18%, -5.24%]` | HTAM worse; universal shift claim falsified |

These scalar effects are real within the frozen synthetic task, but they do not establish a new recurrent architecture or general distribution-shift superiority.

### Learned recurrent transfer — EXP-003

Mean MSE across five held-out learned seeds:

| Condition | Huber-2.5 | Huber-4 | HTAM | Static mix | PABIM |
|---|---:|---:|---:|---:|---:|
| Clean Gaussian | `0.06778` | `0.06652` | `0.09121` | `0.07381` | `0.08324` |
| Student-t(2) | `0.09217` | `0.10259` | `0.09394` | `0.08962` | `0.09075` |
| Regime shift | `0.14427` | `0.12330` | `0.28882` | `0.16720` | `0.17624` |

PABIM improves regime MSE over HTAM by about `39%`, showing the persistence signal moves in the intended direction. But it remains about `25.1%` worse than Huber-4 on clean MSE and about `43.0%` worse than Huber-4 on regime MSE. It also loses to simpler controls on important conditions.

**Verdict:** scalar-to-learned transfer is falsified for the current mechanism family, and PABIM is not promoted.

## Uncertainty and statistics

Seed-level raw rows are retained. EXP-004 uses 20 held-out scalar seeds and reports paired bootstrap intervals and exploratory sign-flip tests. EXP-003 uses only five learned held-out seeds; its paired statistical outputs remain exploratory. No confirmatory significance claim is made for the learned mechanism.

## Reproducibility caveat found during this wave

A separate, older IRIS v0.2 bundle in the Library was also inspected. Its legacy learned rerun was internally byte-deterministic on this machine but showed low-order cross-package/cross-environment drift versus that older retained bundle. The newer recovered package used for this status reruns byte-identically for all result CSVs. This strengthens the case for naming the exact archive hash and not referring generically to “IRIS v0.2” without provenance.

## Remaining scientific blockers

The current mechanism should remain negative until the following are completed under a newly frozen successor protocol:

- faithful Student-t robust filtering comparator;
- robust changepoint / BOCPD-style comparator;
- switching-filter comparator;
- clipped/non-stationary robust online estimator;
- matched GRU/LSTM and compact SSM baselines where appropriate;
- full mechanism ablations and failure taxonomy, including false-open and delayed-open gate behavior;
- at least two chronological external temporal datasets;
- untouched confirmatory seeds chosen only after the successor mechanism and analysis family are frozen;
- parameter, runtime and memory accounting;
- final novelty audit against close robust-filtering and changepoint prior art;
- clean synchronization to a canonical Git repository with a source commit SHA.

## Claim boundary

IRIS can now defensibly claim a reproduced **mixed/negative synthetic research result**: corrected scalar HTAM heavy-tail gains exist, but those gains do not generalize to a broad shift claim or automatically transfer to learned recurrent memory, and the tested PABIM successor does not beat strong robust learned controls.

Do not claim a proven new architecture, external real-world benefit, novelty, or submission readiness.
