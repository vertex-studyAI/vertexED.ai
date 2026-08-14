# T2424-0050 Darcy — Learned-Operator / OOD Protocol v2

**Protocol ID:** `DARCY-FREEZE-001 / darcy-operator-ood-v2`  
**Frozen:** 2026-08-14, before any v2 outcome execution  
**Outcome:** `[EXPERIMENT NOT YET RUN]`  
**Parent result:** the existing 24-cell / 6-block synthetic screen remains immutable.

## Why v2 exists

The parent experiment is a correct mechanism sanity check, but the data generator is block-structured at the same scale as the 6-block harmonic surrogate. Its ~97.88% pressure-MAE improvement over a heterogeneity-blind linear profile is therefore not evidence that the representation is competitive with learned neural operators or robust to harder permeability fields.

This v2 study asks a narrower and more dangerous question before any paper promotion.

## Scientific question

For steady 1D Darcy flow with heterogeneous positive permeability, **when does an explicit resistance-preserving coarse representation retain useful pressure/flux accuracy under misaligned and out-of-distribution permeability fields relative to strong learned operator and reduced-order baselines?**

The objective is characterization, not to assume that the explicit representation wins.

## Hypotheses

### H1 — resistance-preservation mechanism

At equal coarse block count, harmonic/resistance-preserving compression will have lower pressure-profile error and flux error than arithmetic block averaging on misaligned heterogeneous fields.

### H2 — OOD inductive-bias hypothesis

Under frozen distribution shifts in correlation length, interface alignment and permeability contrast, the explicit harmonic surrogate will degrade less severely than generic learned operator baselines trained only on the in-distribution training family.

### H3 — learned-operator ceiling

On in-distribution fields, a competent FNO or DeepONet may outperform the fixed coarse surrogate. This is an expected possibility, not a failure of protocol design. The scientifically interesting quantity is the full ID/OOD error–data–compute tradeoff.

## Falsifiers

- **H1 falsified:** harmonic compression does not reduce the predeclared aggregate pressure error versus arithmetic compression by the practical-effect gate below.
- **H2 falsified:** the harmonic surrogate does not beat the best eligible learned operator on the frozen worst-group OOD criterion, or it only appears favorable because a learned baseline failed trainability/eligibility checks.
- A positive result against the linear baseline alone is insufficient for v2.

If H1/H2 fail, retain the negative result. Do not alter the permeability generator, split, baselines or threshold and rerun v2 as a rescue.

## PDE and reference solution

Domain: `x in [0,1]`.

Boundary pressures:

- `p(0) = 1`
- `p(1) = 0`

Permeability `k(x) > 0`.

Steady 1D Darcy flow has constant flux. On a finite-volume grid with cell width `dx`, cell resistance is `r_i = dx / k_i`. The reference discrete solution is generated from cumulative resistance with no learned approximation.

Reference solver output includes:

- pressure at all cell interfaces/declared evaluation points;
- constant flux;
- boundary residuals;
- permeability field and generator metadata.

The numerical/reference solver is the target generator, **not** a baseline that a surrogate is expected to beat in accuracy.

## Grid and representation budgets

Primary resolution:

- `N = 128` permeability cells;
- evaluate pressure on the corresponding frozen grid;
- harmonic surrogate primary block count `B = 8` (16x compression);
- secondary compression ablation `B in {4, 16, 32}`.

Block boundaries are fixed in physical coordinates and are not adapted to test interfaces.

## Frozen data generation

All randomness is generated from a deterministic counter-based seed stream. The generator implementation and final split manifest must be hashed before training.

Permeability is parameterized by `log k`; every generated field is clipped only by the frozen family-specific support before exponentiation. No test-distribution statistic may be used to tune models or normalization.

### ID family — smooth log-Gaussian random fields

Generate stationary zero-mean Gaussian fields on the 128-cell grid using a squared-exponential covariance, then exponentiate:

- correlation length `ell ~ Uniform(0.08, 0.20)`;
- log-standard-deviation `sigma ~ Uniform(0.5, 1.25)`;
- global log-offset `mu ~ Uniform(-0.25, 0.25)`;
- clip `log k` to `[-4,4]` before exponentiation.

Split sizes:

- train: 4,096 fields, seeds `0..4095`;
- validation: 512 fields, seeds `100000..100511`;
- ID test: 1,024 fields, seeds `200000..201023`.

Training/validation are the only splits usable for architecture/hyperparameter selection.

### OOD-A — short correlation length

- 512 fields;
- seeds `300000..300511`;
- `ell ~ Uniform(0.02, 0.05)`;
- other ranges as ID.

### OOD-B — long correlation length

- 512 fields;
- seeds `310000..310511`;
- `ell ~ Uniform(0.30, 0.50)`;
- other ranges as ID.

### OOD-C — misaligned piecewise interfaces

- 512 fields;
- seeds `320000..320511`;
- choose 3–8 piecewise-constant permeability segments;
- interface positions are sampled continuously then snapped to cell boundaries **subject to not coinciding with the 8 primary coarse-block boundaries**;
- segment `log k ~ Uniform(-3,3)` independently;
- no smoothing.

### OOD-D — high contrast

- 512 fields;
- seeds `330000..330511`;
- smooth GRF with `ell ~ Uniform(0.05,0.20)`;
- `sigma ~ Uniform(1.5,2.0)`;
- clip `log k` to `[-6,6]`.

### OOD-E — mixed sharp + smooth

- 512 fields;
- seeds `340000..340511`;
- multiply an ID-family smooth field by a misaligned 2–5 segment piecewise multiplier with segment log-offsets `Uniform(-2,2)`;
- final `log k` clipped to `[-6,6]`.

No OOD group is available for hyperparameter selection. The five OOD groups are all reported separately and jointly.

## Systems

### M1 — harmonic/resistance-preserving coarse surrogate

Compress each fixed block to harmonic mean permeability, equivalently preserve the exact integrated block resistance. Expand block permeability to the fine grid and solve the same frozen discrete Darcy equation.

No training.

### A1 — arithmetic coarse surrogate

Identical block layout and solver, but each block stores arithmetic mean permeability.

This is the primary mechanism ablation for H1.

### A2 — log-mean coarse surrogate

Each block stores `exp(mean(log k))`, with all other steps identical.

This tests whether any multiplicative/geometric averaging explains the effect rather than resistance preservation specifically.

### B1 — linear heterogeneity-blind profile

Retain the parent linear-pressure baseline as a weak sanity comparator only. It cannot establish v2 superiority.

### B2 — PCA + ridge reduced-order baseline

Fit PCA on training `log k` only, using the smallest component count whose dimensionality does not exceed the primary method's 8 scalar block values. Fit multi-output ridge from those components to pressure; select ridge regularization from a frozen validation grid.

Purpose: a strong simple low-dimensional learned comparator at approximately the same representation dimension.

### B3 — Fourier Neural Operator (FNO-1D)

Use a standard 1D FNO mapping the full permeability field plus coordinate channel to the pressure field. Architecture/hyperparameter grid is frozen before training and selected using validation pressure error only.

Minimum eligibility:

- code path reproduces a trivial identity/operator unit test;
- training loss decreases from initialization by the frozen eligibility amount;
- no NaN/Inf run;
- all declared seeds finish;
- parameter count, FLOPs estimate, train time and inference time retained.

FNO is prior art for parametric PDE solution operators and was evaluated on Darcy flow in the original work (Li et al., arXiv:2010.08895).

### B4 — DeepONet

Use a branch network over the frozen permeability sensor grid and a trunk network over output coordinate `x`, trained to predict pressure. Architecture/hyperparameter grid is frozen before training and selected on the same validation metric/budget rules as FNO.

DeepONet is established operator-learning prior art (Lu et al., Nature Machine Intelligence 2021).

### Optional B5 — small 1D CNN/U-Net surrogate

Include only if implemented and frozen before any test evaluation. It is secondary; absence does not invalidate v2 if FNO and DeepONet are eligible.

## Learned-model budget and tuning freeze

Primary learned training seeds: `{41, 73, 109}` for each eligible learned architecture.

The following must be committed before the first training run:

- exact library versions;
- model implementation/revision;
- parameter-count target/range;
- optimizer;
- learning-rate grid/schedule;
- batch size;
- epoch/step cap;
- early-stopping rule if any;
- normalization computed from training data only;
- validation selection rule;
- random seeds;
- hardware identity;
- compute/time cap.

A model is not rerun with new hyperparameters after any ID-test or OOD output is inspected. Material changes create v3.

## Primary metrics

For each case:

1. relative pressure `L2` error;
2. pressure MAE;
3. maximum absolute pressure error;
4. relative flux error where the method emits/implies flux;
5. left/right boundary absolute error;
6. monotonicity/physical-consistency violations where applicable.

For learned pressure-only methods, flux is independently estimated from predicted pressure and the known permeability using the frozen finite-volume flux diagnostic; report both flux inconsistency and pressure error rather than projecting predictions to satisfy physics.

## Aggregation and uncertainty

For every method and group report:

- median;
- mean;
- 90th percentile;
- bootstrap 95% interval over test cases for the mean;
- failure/invalid-output count.

For learned models, additionally report mean and spread across the three training seeds. Do not pool training-seed variation into fake independent test cases.

## Frozen primary tests

### H1 mechanism gate

On the union of `OOD-C` and `OOD-E`, using primary `B=8` compression:

`harmonic_mean_pressure_MAE <= 0.75 * arithmetic_mean_pressure_MAE`.

That is, harmonic compression must reduce aggregate mean pressure MAE by at least **25%** versus equal-capacity arithmetic compression.

Also require harmonic mean flux relative error to be no worse than arithmetic mean flux relative error.

### H2 learned-OOD gate

Define each learned model's OOD degradation ratio:

`D_g = mean_rel_L2(group g) / mean_rel_L2(ID_test)`.

For each method define `worst_D = max_g D_g` over OOD-A..E.

The explicit harmonic surrogate supports an OOD-robustness claim only if:

1. at least one of FNO/DeepONet is fully eligible;
2. harmonic `worst_D <= 0.85 * min(eligible learned worst_D)`; and
3. harmonic ID-test mean relative L2 error is no more than `2.0x` the best eligible learned ID-test error.

This gate asks for a substantial **relative degradation** advantage while preventing a trivially inaccurate method from winning on stability alone.

### Paper-promotion gate

Darcy is promoted from bounded mechanism study toward a paper only if **H1 passes** and either:

- **H2 passes**, or
- the frozen experiment reveals a different strong, pre-specified negative/boundary result that is reproducible and scientifically informative.

A learned baseline simply winning everywhere is a valid negative result and should close this line rather than trigger post-hoc architecture proliferation.

## Compression/accuracy curve

For M1/A1/A2 report `B in {4,8,16,32}` on all groups. Do not select the paper headline block count after seeing test results; `B=8` remains primary.

Plot/report:

- representation scalars versus pressure error;
- representation scalars versus flux error;
- OOD group versus error;
- worst-group degradation;
- inference latency where measured.

## Train/test leakage controls

- No OOD case used for model selection.
- Dataset normalization from training only.
- PCA basis from training only.
- Validation selects learned hyperparameters.
- All ID/OOD test manifests are generated and hashed before the first eligible learned training run.
- No test-group-specific fine-tuning.
- No threshold change after test inspection.

## Required artifacts

Retain:

- protocol hash;
- generator/source commit and hashes;
- split manifest with case seeds/family parameters;
- raw permeability/pressure arrays or deterministic regeneration metadata;
- exact reference solver command/tests;
- learned training config per seed;
- checkpoints and checkpoint hashes if practical;
- training curves;
- eligibility checks;
- per-case predictions/errors;
- aggregate metrics and bootstrap code/output;
- parameter/FLOP/runtime/memory accounting;
- machine/GPU/CPU/software identity;
- figure/table generation commands;
- exact failed runs as well as successful runs.

## Claim boundary if positive

A positive v2 may support only a bounded statement such as:

> On the frozen 1D Darcy families and training budget, resistance-preserving coarse compression showed the preregistered mechanism effect versus other coarse averages and a lower worst-group OOD degradation than eligible learned operator baselines while staying within the declared in-distribution error factor.

It does **not** establish superiority for 2D/3D Darcy flow, arbitrary PDEs, FNO/DeepONet generally, real porous media, transient/multiphase systems, or production simulation.

## Claim boundary if negative

If learned operators dominate or harmonic compression fails the mechanism/OOD gates, preserve the exact result. The parent 1D aligned-screen result remains a valid sanity check but should not be promoted into a broader neural-operator claim.

## Primary references anchoring the dangerous baselines

- Li et al., *Fourier Neural Operator for Parametric Partial Differential Equations*, arXiv:2010.08895.
- Lu et al., *Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators*, Nature Machine Intelligence 3, 218–229 (2021).
