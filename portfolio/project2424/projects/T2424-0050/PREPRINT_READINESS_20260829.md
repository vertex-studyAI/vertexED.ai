# T2424-0050 Darcy Latent Operator — Preprint Readiness

Status: **NO-GO / NOT PREPRINT_READY**

Scientific state: **PARENT REPRODUCED / HARDER AUDIT MIXED / SUCCESSOR FROZEN-PREOUTCOME**

This gate supersedes stale source-blocked interpretations of T2424-0050. The canonical parent package is present on `main`, the retained 20-seed screen was exactly reproduced in merged PR #453, and a harder misalignment/correlation audit is retained. The scientific verdict remains `HOLD / MIXED_ROBUSTNESS` because the harder IID/misaligned condition misses the earlier easy-screen threshold and contains a concrete negative seed.

## Canonical evidence anchors

- parent package: `portfolio/project2424/projects/T2424-0050/`;
- retained parent metrics: `results/reference.json`;
- retained harder audit: `results/misaligned-audit.json`;
- frozen parent mechanism code under `src/` and `experiment/`;
- merged reproduction/audit PR: #453;
- reproduction branch head: `1767fa1916f0385fab22bcd0491e2bee8a9445f2`;
- reproduction merge: `ecd13603c6105b1d69fa2a99e9fe6cbdad7b2875`;
- clean reproduction environment: Linux x64, Node `v22.16.0`;
- canonical exact-head CI for #453: run `32585612385`.

## Parent result

The frozen controlled screen solves steady one-dimensional Darcy flow with positive heterogeneous permeability and fixed Dirichlet pressures. Twenty-four fine cells are compressed to six blocks using harmonic-mean permeability. Because harmonic averaging preserves integrated block resistance, the representation is physically explicit rather than learned.

Retained 20-seed summary:

| Metric | Retained value |
|---|---:|
| Fine cells / reduced blocks | `24 / 6` |
| Compression ratio | `4x` |
| Mean linear-baseline pressure MAE | `0.06589139155637647` |
| Mean harmonic-block pressure MAE | `0.0011366559231966065` |
| Mean relative pressure-MAE improvement | `97.876632%` |
| Mean flux relative error | `1.3693877541812723e-16` |
| Max harmonic-block pressure MAE | `0.0014613491578162696` |
| Uniform-control harmonic-block MAE | `0` |
| Parent verdict | `PASS_BOUNDED_DARCY_LATENT_SCREEN` |

The parent generator is aligned with the coarse block structure. The large result is therefore a bounded mechanism sanity check, not a difficult operator-learning benchmark.

## Harder retained audit

The harder audit uses 100 deterministic synthetic permeability fields per condition with AR(1) log-permeability correlation `rho ∈ {0, 0.5, 0.9}`. It compares:

- a linear-pressure baseline that ignores heterogeneous resistance;
- arithmetic-mean block permeability;
- harmonic-mean block permeability.

| `rho` | Mean linear MAE | Mean harmonic MAE | Mean arithmetic MAE | Harmonic improvement vs linear | Harmonic beats linear | Harmonic beats arithmetic |
|---:|---:|---:|---:|---:|---:|---:|
| `0.0` | `0.0624166417` | `0.0191157578` | `0.0469308446` | `63.8317%` | `99/100` | `100/100` |
| `0.5` | `0.0883543858` | `0.0166155039` | `0.0363888542` | `77.1634%` | `100/100` | `99/100` |
| `0.9` | `0.0957374620` | `0.0096036935` | `0.0142341718` | `86.1675%` | `100/100` | `96/100` |

### Required negative evidence

At `rho=0`, the mean harmonic improvement is `63.8317%`, below the parent screen's `65%` improvement gate. That gate was frozen for the easier block-structured screen and must not be retroactively changed or applied as proof of arbitrary-field robustness.

The same `rho=0` audit contains a concrete loss at seed `6`:

- linear MAE `0.02691531294`;
- harmonic MAE `0.02961972888`;
- harmonic improvement `-10.0479%`.

This failure must remain visible in any paper package.

## Claim-to-evidence matrix

| Candidate paper claim | Verdict |
|---|---|
| Harmonic resistance-preserving compression is reproducible and highly accurate on the frozen aligned 1D screen. | **SUPPORTED, BOUNDED** |
| Harmonic compression usually improves pressure error over the linear baseline in the retained misalignment audit. | **SUPPORTED, BOUNDED** |
| The parent >=65% improvement gate generalizes to the IID/misaligned audit. | **NOT SUPPORTED** |
| Harmonic compression always beats the linear baseline. | **FALSIFIED** by `rho=0`, seed `6`. |
| The project demonstrates a learned latent operator or neural operator. | **UNSUPPORTED**; the parent representation is explicit physics-based compression. |
| The project beats FNO, DeepONet, PINN, or contemporary operator-learning baselines. | **UNSUPPORTED**; no completed matched learned-operator result exists. |
| The result establishes 2D/3D Darcy or real porous-media generalization. | **UNSUPPORTED**. |
| The parent source/result is missing. | **FALSE / STALE**; current main contains the package and PR #453 reproduces it. |

## Manuscript-ready sections from retained evidence

### Methods — READY FOR BOUNDED REPORT

Can describe the discrete 1D Darcy resistance formulation, fine-grid solver, 24→6 block compression, harmonic and arithmetic aggregation, linear-pressure comparator, uniform control, parent 20-seed generator, and harder 3×100-field audit.

### Results — READY FOR BOUNDED REPORT

Can report both the strong aligned parent screen and the mixed harder audit. The `rho=0` threshold miss and seed-6 loss are main-result evidence, not appendix-only caveats.

### Failure analysis — READY

The parent effect is partly structurally favored by block alignment and exact resistance preservation. The harder audit shows degradation under misalignment and provides a concrete condition where the candidate loses to the simple baseline.

### Reproducibility — READY

Exact parent result files, current source, reproduction merge, environment, and exact-head CI are recoverable. No guessed reconstruction is needed.

### Related work — OPEN

A release-quality paper still needs a current primary-source audit covering harmonic upscaling/effective permeability, reduced-order Darcy surrogates, neural operators/FNO, DeepONet/operator learning, and uncertainty/OOD evaluation in scientific ML. Do not populate citations from memory alone.

## Successor v2 boundary

`LEARNED_OPERATOR_OOD_PROTOCOL_V2.md` and `v2-freeze-config.json` define a separate pre-outcome successor. Parent evidence must not be used as a substitute for successor outcomes.

Before any successor training/evaluation is authorized, every material freeze field must be closed, including dataset/generator identities and hashes, train/validation/test/OOD splits, harmonic/arithmetic/log-mean/PCA+ridge/FNO/DeepONet comparators, learned seeds, metrics, H1/H2 falsifiers, environment, hardware/model budget, compute accounting, artifact paths, and explicit authorization.

A negative successor result is a valid terminal outcome.

## Release gate

- [x] canonical parent identity/source is recovered;
- [x] parent 20-seed result is retained;
- [x] clean reproduction is retained;
- [x] harder misalignment audit is retained;
- [x] `rho=0` threshold miss is explicit;
- [x] seed-6 negative case is explicit;
- [x] parent/successor evidence lineages are separated;
- [ ] deterministic paper figures/tables are generated from retained machine-readable results;
- [ ] primary-source related-work audit is complete;
- [ ] full bounded manuscript is assembled;
- [ ] sentence-level claim audit passes;
- [ ] authorship/contribution and release-license metadata are approved;
- [ ] clean PDF is compiled and visually audited.

Until every required release gate closes, T2424-0050 remains `NO-GO / NOT PREPRINT_READY` even though the parent experiment is reproduced.
