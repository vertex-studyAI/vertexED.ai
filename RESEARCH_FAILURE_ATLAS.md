# RESEARCH_FAILURE_ATLAS

**As of:** 2026-08-13 22:00 IST  
Failures are retained scientific evidence. A repaired implementation never rewrites the original result.

| Project | Frozen hypothesis / gate | Observed failure | Detection | Claim impact | Repair / rerun boundary | Remaining uncertainty |
|---|---|---|---|---|---|---|
| LAM-JEPA | full model should show superiority and mechanism benefit over matched controls | full mean below matched supervised; planner and target effects unsupported; validation variants show prediction-support collapse behavior | five-seed ARC validation, ablations, negative control, independent artifact audit | central superiority/mechanism claim unsupported | historical seed-order software defect repaired separately; multiple reruns preserve negative science | broader tasks/datasets; external review; locked test intentionally unused |
| IRIS v0.2 / successor | abrupt-regime improvement over fixed HTAM `>=10%` and competitive robust baseline performance | ~`5.33–5.36%`; PCRW not cleanly above Huber; coherent burst outliers adverse | development stress seeds and stronger baseline addendum | successor promotion gate fails; broad robust-adaptive advantage unsupported | no confirmatory rescue; candidate must be versioned/frozen before reserved seeds | whether a principled successor can separate outliers from legitimate change |
| NGMT v0.1 | B3 adverse improvement >=5% vs B2 and >=3% vs B1 with <=2% clean regression | B3 vs B2 `+0.4946% ± 1.5472%` FAIL; B3 vs B1 `+0.4393% ± 1.1529%` FAIL; clean gate PASS | frozen equal-budget B0/B1/B2/B3, 3 paired seeds, unchanged replay | proposed v0.1 superiority unsupported | no retuning; any successor is a new version/protocol | task diversity, larger seed count, mechanism alternatives |
| T2424-0025 robust readouts | robust non-Gaussian readout should isolate a unique adverse-corruption benefit | robust estimators also materially improve 0% control | 30-seed screen + 50-seed contamination ablation | supports robust aggregation, not a unique non-Gaussian Transformer mechanism | promoted only as precursor; learned NGMT evaluated separately | how robust readouts interact with learned memory under regime change |
| NeuroCAD v1 | typed/validated pipeline should improve valid execution and invalid rejection | one negative-width invalid case accepted in frozen v1 | held-out-template benchmark | does not erase strong 19/20 vs 12/20 gate; exposes validator hole | post-result safety repair is separate; v1 failure retained | broader language/provider/backend/OOD behavior |
| APEN | adaptive salience mechanism should retain benefit under degraded salience | benefit weakens and reverses under severe salience dropout | source-archive rerun + salience-dropout stress | claim limited to controlled salience-available regimes | no hidden repair; successor/learned comparison required | naturalistic salience reliability and learned-control comparison |
| Eigen-JEPA | eigen/spectral representation should improve primary covariance forecast | raw/log ridge remains stronger on primary covariance-matrix MSE | real-market rerun | no superiority claim | no metric shopping; keep preregistered primary target | whether stronger spectral method helps other data/tasks |
| T2424-1863 local diffusion | proposed operator should exceed predeclared >75% improvement gate | gate fails; zero-diffusion control offers no rescue | 20-seed frozen screen, independent replay, exact-head CI | negative against predeclared scientific gate | exact-head rerun preserved result without coefficient/seed/threshold retuning | real PDE data, learned operator, rollout behavior |
| NPMS | controlled memory mechanism should imply broad sequence benefit | evidence remains controlled; causal/natural-task transfer unestablished | controlled diagnostic + companion learned reproduction | limits external/generalization claim | no failure erased | OOD/generalization and stronger learned baselines |
| Hercules | proposed architecture should beat a matched standard model | no credible matched-budget learned experiment exists | evidence audit | advantage claim untested, not failed | freeze experiment before training | actual learned value |
| Olympus | role decomposition should improve reliable agent performance | O1 matched-provider learned experiment not evidenced | evidence audit | O0 runtime/roadmap only | freeze monolithic/decomposition/ablations before run | whether decomposition improves correctness/evidence per budget |

## Failure-handling law

1. Preserve original protocol, raw result, thresholds and seeds.
2. If a software bug invalidates a result, document the bug, fix it narrowly, rerun, and distinguish old from new.
3. If the scientific hypothesis fails, do not silently retune it. Create a versioned successor with a newly frozen falsifier.
4. Negative results may be GREEN for reproducibility while remaining RED for superiority.
5. Reserved confirmatory/test data must not be opened to rescue a development failure.
