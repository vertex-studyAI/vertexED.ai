# Standalone Research Run-Ready Handoff — 25 August 2026

**Mode:** pre-outcome preparation, frozen-result reproduction packaging, source recovery, and successor-protocol freeze.

This handoff does not authorize new major scientific outcome runs. It is designed so Percy/LabOS/direct agents can continue useful repo work without contaminating protected evidence or rewriting negative results.

## Global rules

- Preserve every existing negative, mixed, inconclusive, and falsified result.
- Never change a frozen metric, threshold, seed set, condition set, split, or headline after seeing a result.
- IRIS seeds `1000–1029` are forbidden.
- Darcy T2424-0050 remains training-disabled.
- A successful smoke/CI/reproduction is not automatically a positive scientific result.
- PEN and Eigen-Finance remain source-recovery lines until canonical executable identity is proven.

## LAM-JEPA

**State:** `EXTERNAL_VALIDATION / FROZEN_NEGATIVE_OR_INCONCLUSIVE`

Dedicated repository: `vertex-studyAI/LAM-JEPA`.

Use that repository's `RUN_READY_FREEZE_20260825.md` and `experiments/repro_wave_2026_08_12/REPRODUCE.md`. ARC train/validation may be reproduced under the frozen protocol; ARC test must remain absent for the frozen validation line.

**Morning target:** self-contained producer → verifier → retained-artifact path plus outside-review packet. No result rescue.

## IRIS v0.2

**State:** `PREOUTCOME_BLOCKED_ON_EXACT_TRAJECTORY_IDENTITY`

Recovered and verified:

- canonical v0.2 bundle identity;
- stronger-development-baselines addendum;
- common adaptation harness;
- exact common-harness source-lineage archive;
- frozen adaptation metric specification and executable metric provenance.

The only remaining frontier-source gate is exact canonical development-trajectory identity, or an authoritative pre-existing record proving byte-identical deterministic equivalence to a specific generator/source/config hash.

### Allowed recovery work

1. search retained archives/manifests/evidence for the exact observation/state trajectory corpus;
2. if found, hash every trajectory/input and cross-check against recovered lineage;
3. construct an execution manifest only after identity closes;
4. independently verify seeds `1000–1029` remain inaccessible;
5. if identity cannot be proven, retain `PROTOCOL_BLOCKED`.

### Forbidden

- approximate trajectory regeneration;
- frontier outcome execution before the provenance gate closes;
- any use of seeds `1000–1029`;
- reinterpreting the existing mixed/negative result as positive.

**Morning target:** exact trajectory provenance closed, or one precise blocker with every recovered hash recorded.

## NeuroCAD / NLP-to-CAD

**Scientific mechanism state:** `FROZEN_RESULT / VALIDATION_DOMINANT`.

The later matched-validation component diagnostic falsified the claim that the measured historical gap demonstrated a typed-parser causal advantage. Keep that result immutable.

**Product/reliability line:** may continue separately with parse/build/topology/geometry/constraints/editability/perturbation/manufacturability/semantic QA and an external-evaluator protocol.

**Morning target:** product QA and any new broader scientific benchmark are in separate namespaces so engineering progress cannot silently rewrite the frozen mechanism result.

## NGMT v0.1

**State:** `FROZEN_RESULT / NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`.

The existing v0.1 reproduction is already explicit and executable.

### Environment

Canonical retained run used CPU-only Ubuntu 24.04, Python 3.13.14, NumPy 2.5.2 and PyTorch 2.13.0+cpu.

### Local reproduction

```bash
python -m pip install numpy pytest
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
pytest -q tests/test_ngmt_v01.py
python portfolio/research/ngmt/v01/run.py --output-dir artifacts/ngmt-v01
```

Expected invariant test count: `6 passed`.

Expected frozen verdict: `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`.

A valid reproduction retains `results.json`, `completion.json`, all 12 checkpoints, environment capture, timing/resource data and a SHA-256 manifest.

Frozen seeds: `11 23 37`; evaluation seed is `10000 + training_seed`; conditions remain exactly `gaussian_clean`, `student_t`, `two_mode`, `regime_switch`, `outlier_bursts`, `nonstationary_mixture`.

**Morning target:** reproduction path and artifact contract verified; v0.1 remains frozen negative/inconclusive. Any successor gets a new versioned protocol before evidence access.

## APEN

**State:** `CONTROLLED_MIXED / NEW_PROTOCOL_ONLY`.

Existing exact runnable surfaces from the recovered Atlas V4 package:

```bash
python -m pytest -q projects/apen
python -m projects.apen.experiment
python -m projects.apen.extended_experiment
```

The retained result is a localized rare-event benefit when salience is informative, with a strong failure boundary as salience reliability degrades; it does not win overall MSE and does not establish a general adaptive-memory advantage.

**Successor morning target:** machine-readable new protocol with matched learned-memory control, naturalistic salience, and explicit failure-region controls. Do not rerun the old mixed result as a search for a friendlier outcome.

## PEN

**State:** `SOURCE_RECOVERY`.

Independent negative evidence exists, but the canonical executable source tree has not been recovered into the current runtime. Retained evidence indicates PEN slightly beats no-memory but does not beat random-write or attention-only compact baselines; this is not a fresh source-tree reproduction.

**Morning target:** recover the exact `MODEL-PEN` source/archive, hash it, verify any retained manifest, and identify the package's original tests and compact run commands. If source cannot be recovered, remain `SOURCE_RECOVERY`; do not substitute APEN implementation/evidence.

## Eigen-JEPA

**State:** `FROZEN_REAL_DATA_MIXED_NEGATIVE`.

Existing recovered execution surface:

```bash
python -m pytest -q projects/eigen_jepa
python -m projects.eigen_jepa.experiment
```

The retained real-data covariance-forecasting study uses official Fama-French daily factors and remains mixed/negative against strong direct/persistence controls depending on metric. Metric switching after observation is forbidden.

**Morning target:** preserve current package and freeze a separately versioned successor protocol with a multi-dataset hierarchy, stronger spectral/direct baselines, fixed headline metric hierarchy, and no outcome access yet.

## Eigen-Finance

**State:** `SOURCE_RECOVERY`.

The distinct source/contribution has not yet been cleanly recovered from adjacent Eigen/finance work.

**Morning target:** locate canonical source/archive + hash, recover the precise research question, identify what contribution is distinct from Eigen-JEPA and other finance representation lines, and stop if identity remains ambiguous. No novelty claim before this closes.

## NPMS

**State:** `REPRODUCED_CONTROLLED_DIAGNOSTIC / SUCCESSOR_PROTOCOL_ONLY`.

Existing execution surfaces:

```bash
python -m pytest -q projects/npms
python -m projects.npms.experiment
python -m pytest -q projects/memory_spectrum_transfer
python -m projects.memory_spectrum_transfer.experiment
```

The controlled reservoir diagnostic and trained RNN/GRU companion are retained evidence. The current result does not establish causal uniqueness; invariant-parameter/state-space/spectral alternatives remain important controls.

**Morning target:** freeze a new natural/causal intervention protocol that includes invariant-parameter, state-space and spectral controls. Do not launch natural/OOD outcomes under the current global authorization.

## JEPA × time-series

**State:** `PROTOCOL_FREEZE / DESIGN_ONLY`.

**Morning target:** machine-readable cheap synthetic protocol with:

- deterministic generator/source hash;
- chronological split semantics;
- persistence/statistical/objective baselines;
- fixed compute and seed budget;
- predeclared primary metric and uncertainty aggregation;
- explicit falsifier;
- smoke-only path that does not spend the outcome budget.

No outcome run is authorized yet.

## Weather-JEPA

**State:** `SOURCE_RECOVERY`.

Registered name/protocol ideas are not implementation evidence.

**Morning target:** recover canonical source first. Only if source exists, add deterministic weather dataset loader identity, temporal split manifest, persistence/statistical baseline interfaces, smoke path and result schema. If source is absent, final status remains `UNKNOWN/SOURCE_RECOVERY`.

## Space-JEPA

**State:** `SOURCE_RECOVERY`.

**Morning target:** recover canonical source first. Only after source identity closes, prepare mission-data loader/provenance, chronological/anomaly split semantics, persistence/ridge/reconstruction baseline interfaces, smoke path and result schema. Do not call protocol ideas a completed Space-JEPA implementation.

## Audio-Light / Audio-JEPA incubation

**State:** `SOURCE_RECOVERY / UNKNOWN`.

**Morning target:** recover source or explicitly retain UNKNOWN. If recovered, define a cheap representation benchmark and matched baseline protocol without running a major outcome.

## Hercules / Olympus family

**State:** `ARCHIVED_COMPUTE / SOURCE_RECOVERY`.

Aliases currently include Olympus, Hermes, Prometheus, Perseus, Atlas, Kronos, Aion, Themis, Pantheon and Mnemosyne.

**Morning target:** produce a truth map separating actual executable components from names/specs, then freeze one decisive matched-provider/task/tool-budget protocol. Significant training/capability claims remain forbidden until that protocol exists.

## Shared focused reproduction command

Where the recovered Atlas V4 source package is materialized and its integrity boundary has been preserved:

```bash
python -m pytest -q projects/apen projects/eigen_jepa projects/npms
```

The retained fresh execution previously reported seven passing focused tests. This command is a source/reproducibility check, not external validation.

## Morning classification

Every line must end with one of:

- `RUN_READY`
- `EXTERNAL_VALIDATION`
- `FROZEN_RESULT`
- `PREOUTCOME_BLOCKED`
- `PROTOCOL_FREEZE`
- `SOURCE_RECOVERY`
- `UNKNOWN`

No line earns `RUN_READY` merely because a README or test exists; its data/source/protocol/claim boundary must also be explicit.