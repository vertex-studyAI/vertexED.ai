# Research Reproducibility Wave — 12 August 2026

**Audited monorepo head:** `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`  
**Research Atlas source archive SHA-256:** `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`  
**Rule:** reproducibility and falsification outrank positive-looking claims.

## Evidence policy

- Do not equate green CI or smoke execution with scientific reproduction.
- Preserve negative and inconclusive outcomes.
- Do not silently change protocols after observing results.
- Treat infrastructure timeout separately from scientific failure.
- Use raw CSV/JSON as primary evidence and figures/PDFs as derived artifacts.
- Report seed/sample count and uncertainty when retained; do not claim significance without a suitable analysis.

## Fresh execution in the wave environment

Environment: Python 3.13.5, Linux x86_64 CPU, NumPy 2.3.5, pandas 2.2.3, SciPy 1.17.0, scikit-learn 1.8.0, PyTorch 2.10.0+cpu and Matplotlib 3.10.8.

- Full Research Atlas source regression: **39/39 tests passed**.
- Selected post-rerun regression suite: **13/13 tests passed**.
- APEN, Eigen-JEPA, NPMS, Mixed Shift Factorizer, Probabilistic Dimensional Compiler and Memory Spectrum Transfer reran successfully without protocol changes.
- APEN salience-dropout robustness extension reran successfully.
- A broad `python run_all.py --stage v4` attempt reached the execution-window limit while entering Pareto Counterexample Forge. This is recorded as an infrastructure interruption, not a failed scientific result.

## Selected experiment results

| Project | Task / baseline | Fresh result | Uncertainty / boundary | Verdict |
|---|---|---|---|---|
| APEN | delayed rare-event sequence prediction; exp-trace/recent/uniform/oracle | rare-event MSE 17.0603 vs 18.8603 / 18.9674 / 18.7146 / 16.6877 | paired n=48; APEN-vs-uniform bootstrap 95% CI for MSE difference [-1.9041,-1.4016]; full salience dropout reverses the advantage | reproducible controlled tradeoff; no universal memory claim |
| Eigen-JEPA | future covariance prediction; raw/log/Cholesky ridge + persistence | MSE 5.8318e-09; raw ridge 5.7734e-09 and log ridge 5.7896e-09 are better | paired n=111; Eigen-minus-raw CI crosses zero | negative/boundary paper evidence; no superiority |
| NPMS | controlled reservoir memory regimes; parameter summaries | regime accuracy 0.928571; within-coordinate spectral cosine 0.995961 | similarity comparison n=84, bootstrap 95% CI for spectrum-minus-parameter [0.87853,0.91312] | strong controlled mechanism result; external/general-model gate open |
| Mixed Shift Factorizer | generated multi-shifts on three sklearn datasets; structured-linear and simpler controls | macro-F1 0.833546, micro-F1 0.827434, hamming 0.833854 vs structured-linear hamming 0.814410 | paired hamming n=1440; delta 0.019444, bootstrap 95% CI [0.011632,0.027083] | reproducible controlled result; natural-shift validation open |
| Probabilistic Dimensional Compiler | sparse monomial laws with metadata corruption; hard metadata / MDL-all / guarded | test MSE 0.000469; exact support 0.777778 vs hard-metadata 0.611111 | 36 seeds × 5 corruption levels; exact-support delta vs hard metadata +0.166667, bootstrap 95% CI [0.111111,0.222222] | reproducible controlled result; real scientific-law gate open |
| Memory Spectrum Transfer | 24 trained RNN/GRU models; six parameter summaries | spectrum delay-regime accuracy 0.875 vs 0.666667 | n=24; no significance claim added by this wave | reproducible controlled transfer result |

## Documentation bug retained and corrected separately

Memory Spectrum Transfer's README contained stale prose claiming `95.8%` versus `75.0%`. The retained pre-rerun machine-readable artifact, the prior canonical Atlas V4 rerun ledger and the fresh unchanged rerun all agree on `87.5%` versus `66.7%`. This is a documentation-only bug: no experiment code, seed policy, split, metric or result artifact changed. Preserve the pre-fix README in provenance and use the corrected values going forward.

## LAM-JEPA

LAM-JEPA remains the highest-priority research line, but its current ARC evidence is **negative/inconclusive**. The frozen five-seed validation gives LAM-JEPA `0.2549152542 ± 0.0129968064` accuracy versus `0.2664406780 ± 0.0154600058` for the capacity-matched supervised baseline. Planner and target ablations do not establish positive mechanism contributions. The locked confirmatory ARC test must not be used to rescue the failed validation hypothesis.

The 12 August exact-head GitHub Actions artifact was verified/downloaded as execution evidence, but its one-step/tiny-budget outputs are plumbing checks only and are not promoted to scientific results.

## T2424-0025 / NGMT

The current defensible result is the bounded 50-seed robust-readout contamination ablation, not a Non-Gaussian Memory Transformer. At 18% Cauchy contamination, weighted-mean MAE is `0.349439`, median `0.017003`, 10% trimmed `0.045506`, Huber `0.030926`; sample SDs are `0.347203`, `0.004858`, `0.015713`, `0.006796`. The 0% control also favors robust estimators, so the result does not isolate a uniquely non-Gaussian mechanism.

Do not promote NGMT to a Transformer claim until state/read/write equations, Gaussian/reference baseline, capacity/compute matching, learned sequence tasks and a falsifier are frozen.

## Strongest Project 2424 ML-adjacent next gate

T2424-0037 NeuroCAD has a deterministic controlled-language compiler benchmark, but it is not yet a learned NLP-to-CAD research result. The next defensible gate is a frozen OOD prompt suite with a same-provider direct-output versus typed-IR learned comparison, repeated stochastic generations where applicable, geometric validity/editability metrics and external reproduction.

## PEN boundary

No separate executable PEN package was found in the mounted Research Atlas V4 source used for this wave. APEN was therefore reproduced; PEN receives no experimental result in this record rather than an inferred or fabricated one.

## Promotion decisions

- **LAM-JEPA:** `ANALYZED / NEGATIVE_OR_INCONCLUSIVE`; no superiority promotion.
- **T2424-0025 robust readouts:** `EXPERIMENTED + ANALYZED`; keep claim bounded to robust synthetic aggregation.
- **APEN:** `LOCAL_REPRODUCIBLE_CONTROLLED`; salience-failure boundary retained.
- **Eigen-JEPA:** `LOCAL_REPRODUCIBLE_NEGATIVE_BOUNDARY`; do not claim strong-control superiority.
- **NPMS / MSF / PDC / Memory Spectrum Transfer:** `LOCAL_REPRODUCIBLE_CONTROLLED`; external/naturalistic/independent replication gates remain open.
- **T2424-0037 NeuroCAD:** `TESTED_CONTROLLED_BENCHMARK`; learned research gate remains open.

None of these local reruns constitutes independent replication, peer review, conference acceptance or general real-world superiority.
