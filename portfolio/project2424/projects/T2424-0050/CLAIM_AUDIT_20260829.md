# T2424-0050 Darcy Latent Operator — Claim Audit

Audit state: **PASS FOR BOUNDED TECHNICAL-REPORT FRAMING / NOT A RELEASE PASS**

This audit defines language that is safe given `results/reference.json`, `results/misaligned-audit.json`, and merged reproduction PR #453.

## High-risk wording checks

| Wording class | Allowed? | Required interpretation |
|---|---|---|
| “latent operator” without qualification | **RISKY** | Immediately state that the retained parent representation is explicit harmonic resistance compression, not a learned neural latent/operator model. |
| “97.88% improvement” | **YES, BOUNDED** | Must name the frozen aligned 1D 20-seed screen, linear-pressure baseline, pressure-profile MAE, and 24→6 compression. |
| “generalizes to misaligned fields” | **NO as a blanket claim** | The harder audit is mixed. `rho=0` averages `63.8317%` improvement, below the parent 65% screen threshold, and seed 6 loses to linear. |
| “always outperforms baseline” | **NO** | Falsified by the retained `rho=0`, seed-6 case. |
| “preserves flux exactly” | **ONLY FOR THE TESTED DISCRETIZATION/CONSTRUCTION** | Harmonic block compression preserves integrated block resistance; do not imply exactness for arbitrary multidimensional or learned settings. |
| “neural operator” / “learned operator” result | **NO** | Parent mechanism is non-learned; v2 learned-operator protocol is pre-outcome. |
| FNO / DeepONet / PINN superiority | **NO** | No completed matched learned-operator comparison exists. |
| 2D/3D Darcy performance | **NO** | Not evaluated by the parent/harder retained result. |
| real porous-media validity | **NO** | Current evidence is synthetic 1D. |
| SOTA / state of the art | **NO** | Unsupported. |
| statistical significance / confidence interval claims | **NO unless separately derived and frozen** | Retained summaries are deterministic multi-seed descriptive evidence. |
| “reproduced” | **YES** | Scope to the frozen parent package/reproduction in PR #453. |
| “mixed robustness” | **YES** | This is the required current interpretation because the harder IID/misaligned condition misses the earlier threshold and contains a loss. |

## Required main-text negative evidence

Any manuscript using the parent result must include all of the following outside a hidden appendix:

1. the aligned parent generator is structurally favorable to the 24→6 block representation;
2. `rho=0` harder-audit mean harmonic improvement is `63.8317%`;
3. that value is below the earlier `65%` parent-screen threshold, without retroactively redefining either protocol;
4. `rho=0`, seed `6` gives linear MAE `0.02691531294` and harmonic MAE `0.02961972888`, so harmonic compression loses on that case;
5. arithmetic block averaging is a necessary mechanism comparator and must not be omitted;
6. the parent is not learned and cannot be presented as evidence about FNO/DeepONet/PINN competition.

## Evidence-safe abstract-level wording

A release draft may state that an explicit resistance-preserving 1D Darcy compression is exactly reproducible, strongly reduces pressure error on an aligned synthetic screen, and remains favorable on average across a retained correlated/misaligned audit. It must also state that robustness is mixed: the IID/misaligned condition falls below the earlier screen threshold and includes a case where the simple linear baseline performs better.

## Forbidden title/claim upgrades

Do not title or describe the parent as:

- a neural operator;
- a learned latent operator;
- a foundation model for PDEs;
- a general Darcy surrogate;
- a multidimensional porous-media solver;
- an FNO/DeepONet replacement;
- a state-of-the-art scientific-ML method.

## Successor separation

The v2 learned/OOD protocol is a different experiment lineage. It may cite the parent as motivation or a mechanistic control, but the parent result cannot be carried forward as a v2 outcome. All v2 success/failure decisions must come from the separately frozen successor artifacts after valid authorization and execution.
