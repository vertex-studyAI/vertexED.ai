# Harmonic-Resistance Compression for a Controlled 1D Darcy Screen: Strong Aligned Performance and Mixed Misalignment Robustness

**T2424-0050 Darcy Latent Operator — evidence-bounded manuscript draft**

## Abstract

We evaluate an explicit harmonic-resistance block representation for steady one-dimensional Darcy flow through heterogeneous positive permeability fields. The method compresses 24 permeability cells into six blocks by harmonic averaging and reconstructs pressure using the same Darcy resistance equations as the fine representation. On a frozen 20-seed block-structured synthetic screen, the representation reduces mean pressure-profile MAE from `0.06589139155637647` for a linear-pressure baseline to `0.0011366559231966065`, a mean relative improvement of `97.876632%`, while preserving flux to numerical precision. This large aligned result is deliberately interpreted as a mechanism sanity check because the generator and reduced representation share the same coarse structure. A harder retained audit over 100 fields at each AR(1) log-permeability correlation rho in `{0, 0.5, 0.9}` produces mean improvements of `63.8317%`, `77.1634%`, and `86.1675%`; the rho=0 condition falls below the earlier 65% easy-screen threshold and includes a concrete seed where the harmonic representation is worse than the linear baseline. The evidence therefore supports a reproducible resistance-preserving compression mechanism with mixed robustness, not learned-operator or state-of-the-art superiority claims.

## 1. Scope and question

The question is narrow: can an explicit coarse representation that preserves integrated Darcy resistance retain pressure-profile fidelity better than a no-heterogeneity linear-pressure approximation on controlled 1D heterogeneous fields, and how fragile is that result when heterogeneity is no longer aligned to the coarse blocks?

This is not a neural-operator study. No learned encoder, learned transition, FNO, DeepONet, PINN, or trained surrogate appears in the parent experiment.

## 2. Methods

For positive cell permeability `k_i` on `[0,1]` with fixed pressures `p(0)=1` and `p(1)=0`, steady 1D Darcy flow has constant flux determined by total resistance. In the equal-width discretization, cell resistance is `dx/k_i`. The fine reference pressure is reconstructed from cumulative resistance.

The candidate representation compresses 24 cells into six four-cell blocks. Each block stores harmonic-mean permeability, exactly preserving the sum of `dx/k_i` within the block. The coarse block values are expanded to the fine grid and passed through the same Darcy solver. The primary baseline is a linear pressure profile that ignores heterogeneous resistance structure.

The frozen cheap screen uses 20 deterministic heterogeneous fields. Its preregistered gates require at least 65% mean pressure-MAE improvement over the linear baseline, mean flux relative error <=1%, and exact uniform-permeability behavior to `1e-12`.

The harder retained audit evaluates 100 deterministic fields per condition for AR(1) log-permeability rho in `{0, 0.5, 0.9}`. It compares the linear baseline, harmonic block permeability, and an arithmetic-mean block ablation. This audit is interpreted independently from the easy-screen threshold: it is evidence about robustness, not a retroactive rewrite of the parent protocol.

## 3. Reproducibility

The canonical package was recovered from repository main at `9cb6939711b82ef63c9bdd347863d74b71579d6f`, reproduced on Linux x64 with Node `v22.16.0`, and retained through exact-head `1767fa1916f0385fab22bcd0491e2bee8a9445f2`, merged as `ecd13603c6105b1d69fa2a99e9fe6cbdad7b2875`. Six focused regression tests passed.

Commands:

```bash
node --test tests/project2424DarcyLatentOperator.test.mjs
node portfolio/project2424/projects/T2424-0050/experiment/run.mjs
node portfolio/project2424/projects/T2424-0050/experiment/audit-misaligned.mjs
```

Retained evidence:

- `results/reference.json` — canonical bounded-result summary.
- `results/misaligned-audit.json` — harder correlation/misalignment audit including per-condition worst cases.
- `STATUS.md` — reproduction and claim boundary.

## 4. Results

### 4.1 Frozen aligned screen

| Metric | Result |
|---|---:|
| Seeds | 20 |
| Fine cells / latent blocks | 24 / 6 |
| Compression | 4x |
| Mean linear-baseline pressure MAE | `0.06589139155637647` |
| Mean harmonic pressure MAE | `0.0011366559231966065` |
| Mean relative improvement | `97.876632%` |
| Mean harmonic flux relative error | `1.3693877541812723e-16` |
| Maximum harmonic pressure MAE | `0.0014613491578162696` |
| Uniform-control harmonic MAE | `0` |
| Frozen verdict | `PASS_BOUNDED_DARCY_LATENT_SCREEN` |

The result clears the frozen cheap-screen gates. Because harmonic compression preserves block resistance exactly and the generator is block-structured at the same scale, this should be read as evidence that the implementation and physical compression mechanism behave as intended, not as evidence of broad predictive superiority.

### 4.2 Harder misalignment/correlation audit

| rho | Harmonic mean MAE | Linear mean MAE | Mean improvement | Harmonic > linear | Harmonic > arithmetic |
|---:|---:|---:|---:|---:|---:|
| 0.0 | `0.019115757820636386` | `0.06241664174369735` | `63.8317%` | 99/100 | 100/100 |
| 0.5 | `0.01661550391463666` | `0.08835438577351434` | `77.1634%` | 100/100 | 99/100 |
| 0.9 | `0.009603693529697657` | `0.09573746199715613` | `86.1675%` | 100/100 | 96/100 |

The rho=0 mean improvement is below 65%. More importantly, seed 6 reverses the ordering: linear MAE `0.02691531294179892`, harmonic MAE `0.029619728875993533`, harmonic improvement `-10.0479%`. This failure is retained rather than tuned away.

## 5. Failure analysis

The parent screen is favorable to the representation because both the data generator and the compression use the same block scale. Harmonic averaging also has a direct physical advantage in this 1D setting: resistance adds in series, so preserving harmonic block permeability preserves total resistance. The near-exact flux result is therefore expected from construction.

The misaligned audit tests a materially harder regime. Its rho=0 miss and seed-6 reversal show that preserving block resistance does not guarantee uniformly superior pointwise pressure reconstruction once fine-scale structure is misaligned with the blocks. Higher correlation improves the coarse representation because spatial smoothness makes block summaries more informative.

The arithmetic ablation is generally worse than harmonic aggregation, supporting the importance of the resistance-preserving choice. However, the current evidence does not establish optimality among general reduced-order methods.

## 6. Related work and non-comparison boundary

Neural-operator methods such as Fourier Neural Operator and DeepONet learn mappings between functions and have been evaluated on PDE families, including Darcy-type problems. Reduced-order and permeability-upscaling literature also motivates comparisons such as proper orthogonal decomposition. These are relevant future comparator families, not baselines in the present experiment.

Verified primary sources for final bibliography assembly:

1. Z. Li et al., *Fourier Neural Operator for Parametric Partial Differential Equations*, arXiv:2010.08895 (2020).
2. L. Lu et al., *Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators*, Nature Machine Intelligence 3, 218–229 (2021), DOI `10.1038/s42256-021-00302-5`.
3. A. Onimisi et al., *A constrained proper orthogonal decomposition model for upscaling permeability*, International Journal for Numerical Methods in Fluids (2023), DOI `10.1002/fld.5171`.

No sentence in this manuscript should be read as a matched comparison against these methods.

## 7. Limitations

The evidence is synthetic, one-dimensional, steady, single-phase, and low-dimensional. The parent representation is explicit rather than learned. The easy generator is structurally aligned to the representation. The harder audit remains synthetic and uses the same 24-cell/6-block setting. No public porous-media dataset, 2D/3D solver, resolution transfer, temporal rollout, model-training budget, statistical model-selection protocol, FNO, DeepONet, PINN, or POD comparator was executed. Publication novelty has not been established.

## 8. Data and code statement

The current experiments use deterministic synthetic generators contained in the canonical repository package; no external dataset is required for the parent result. Code, frozen commands, result JSON, and status/provenance are retained under `portfolio/project2424/projects/T2424-0050/`. A release must record the exact public repository commit and license state; this draft does not assert a license that has not been separately verified.

## 9. Conclusion

An explicit harmonic-resistance compression reproduces a strong aligned 1D Darcy mechanism screen and usually outperforms linear and arithmetic coarse approximations in a harder synthetic audit. The harder audit is nevertheless mixed: the uncorrelated condition misses the earlier 65% reference threshold and contains a concrete negative seed. The correct scientific conclusion is therefore bounded robustness of a physically motivated compression mechanism, not learned-operator superiority or broad Darcy-flow generalization.

## Release state

**GO for continued bounded manuscript closure. NO-GO for `PREPRINT_READY`.** Remaining release gates are listed in `RELEASE_AUDIT.md`.