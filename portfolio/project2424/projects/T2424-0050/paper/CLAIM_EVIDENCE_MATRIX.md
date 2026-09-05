# T2424-0050 Darcy Latent Operator — claim/evidence matrix

Status: **paper closure in progress / NOT PREPRINT_READY**

Scientific parent verdict remains **HOLD / MIXED_ROBUSTNESS**. This document does not change any experiment, seed, threshold, baseline, result, or historical evidence.

## Authoritative evidence

- Canonical status: `../STATUS.md`.
- Frozen bounded result: `../results/reference.json` (blob `7ac88db4d7973841d1529badfca0654a70c88e90`).
- Harder robustness audit: `../results/misaligned-audit.json` (blob `cccc7cb95c1259ad4db969c0ff525f4d67042172`).
- Reproduction lineage: source recovered from main at `9cb6939711b82ef63c9bdd347863d74b71579d6f`; exact-head branch `1767fa1916f0385fab22bcd0491e2bee8a9445f2`; merge `ecd13603c6105b1d69fa2a99e9fe6cbdad7b2875`; Linux x64 / Node v22.16.0; 6/6 focused tests passed.

## Claims allowed

| Claim | Evidence | Decision |
|---|---|---|
| The explicit harmonic-resistance block representation reproduces the frozen 1D block-structured screen. | 20 seeds; baseline MAE `0.06589139155637647`; harmonic MAE `0.0011366559231966065`; relative improvement `0.9787663202281432`. | SUPPORTED, bounded to the frozen screen. |
| The reduced representation preserves total Darcy resistance/flux to numerical precision in the frozen screen. | Mean flux relative error `1.3693877541812723e-16`; uniform latent MAE `0`. | SUPPORTED for this deterministic discretization. |
| Robustness is mixed under misaligned/correlated synthetic fields. | rho=0/0.5/0.9 harmonic mean improvements `63.8317%`, `77.1634%`, `86.1675%`; rho=0 misses the earlier 65% easy-screen threshold; seed 6 loses to linear. | SUPPORTED; negative case must remain visible. |
| Harmonic aggregation is materially better than arithmetic aggregation in most retained audit cases. | Harmonic beats arithmetic `100/100`, `99/100`, `96/100` across rho=0/0.5/0.9. | SUPPORTED for this audit only. |

## Claims prohibited

- No learned-neural-operator claim: the parent representation is explicit and physically constructed.
- No FNO, DeepONet, PINN, finite-volume, POD, or SOTA superiority claim: no matched-budget comparison was executed.
- No arbitrary-field >=65% robustness claim: rho=0 mean improvement is `63.8317%` and seed 6 is negative.
- No 2D/3D, transient, multiphase, real porous-media, OOD-generalization, production, or publication-novelty claim.
- No conversion of HOLD/MIXED into PASS by retrospective threshold changes.

## Failure analysis that must appear in the paper

1. The easy generator is aligned to the same coarse block structure used by the surrogate, so the very large original gain is partly a mechanism sanity check by construction.
2. The harder rho=0 audit misses the old 65% screen threshold and contains a concrete seed-level reversal.
3. Harmonic compression preserves integrated resistance by construction; this explains excellent flux behavior and prevents presenting it as learned discovery.
4. The arithmetic ablation is weaker overall but remains competitive enough in correlated cases that the paper must discuss what is specific to resistance preservation versus generic coarse averaging.

## Related-work boundary

Primary sources verified for context, not as matched experimental baselines:

- Li et al., *Fourier Neural Operator for Parametric Partial Differential Equations*, arXiv:2010.08895 (2020). Includes Darcy-flow experiments.
- Lu et al., *Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators*, Nature Machine Intelligence 3, 218–229 (2021), DOI `10.1038/s42256-021-00302-5`.
- Onimisi et al., *A constrained proper orthogonal decomposition model for upscaling permeability*, International Journal for Numerical Methods in Fluids (2023), DOI `10.1002/fld.5171`.

These references establish relevant comparator families only. They do not imply that T2424-0050 has compared against or outperformed them.

## Release invariant

`PREPRINT_READY` is forbidden until source identity, frozen protocol, retained artifacts, reproduction, sentence-level claim audit, authorship/contribution metadata, code/data/license statements, bibliography verification, and a clean rendered manuscript/PDF audit are all evidenced.