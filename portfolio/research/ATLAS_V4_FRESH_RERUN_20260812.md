# BU1LD Research Atlas — Fresh Publication Execution Record

**Execution date:** 2026-08-12  
**Source:** `BU1LD_Research_Atlas_Flagships_v4.zip` from the persistent project library  
**Scope:** 18 executed flagship packages + 512-idea frontier registry  
**Classification:** fresh local rerun and preprint-release preparation; **not independent replication and not conference/journal acceptance**.

## Fresh verification completed

- `pytest -q` on fresh source extraction: **39/39 passed**.
- All **18 base experiment packages** were rerun. Bundled long-stage commands hit the execution time limit partway through; remaining projects were rerun individually rather than treating infrastructure timeout as scientific failure.
- Robustness extensions rerun for **APEN**, **Counterfactual Representation Surgery**, and **Latent Law Compiler**.
- All **18 manuscripts recompiled**.
- `python build_release.py --validate`: **validated 18 projects and the 512-idea registry**.
- `python build_release.py --release`: regenerated research and paper release archives; manifest/checksum generation covered **769 files**.
- Regenerated release archive was extracted again into a second clean directory; **39/39 tests passed** and release validation passed again.

## Fresh release hashes

- Research source/evidence release: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`
- Papers release: `1be70acf821c57dee65b13f80940a9a195bc64ebc8c31464c9fcc87ce33ce5ae`

## Rerun status by flagship

| Project | Fresh base rerun | Fresh artifact produced | Publication classification |
|---|---:|---:|---|
| Adaptive Theory Geometry | PASS | Yes | mechanism/tradeoff preprint candidate |
| Adaptive Predictive Engram Networks | PASS | Yes | mechanism/tradeoff; matched learned baselines still needed |
| Event-Sparse Neural Fields | PASS | Yes | mechanism/tradeoff; real PDE evaluation still needed |
| Neural Predictive Memory Spectroscopy | PASS | Yes | flagship preprint candidate |
| Eigen-JEPA | PASS | Yes | boundary/negative comparison paper |
| Falsification World Models | PASS | Yes | boundary/negative paper |
| Counterfactual Representation Surgery | PASS | Yes | flagship preprint candidate |
| Progressive Possibility Collapse | PASS | Yes | boundary/tradeoff paper |
| Latent Law Compiler | PASS | Yes | flagship; merge with PDC |
| Minimal Counterexample Forge | PASS | Yes | strong mechanism paper; pair with Pareto extension |
| Assumption-Conditioned Prediction | PASS | Yes | flagship; merge with ACR |
| Unknown-Type Decomposition | PASS | Yes | flagship; pair with Mixed Shift Factorizer |
| Theory-Conditioned Memory | PASS | Yes | mechanism/tradeoff paper |
| Pareto Counterexample Forge | PASS | Yes | companion to MCF |
| Assumption Conflict Resolver | PASS | Yes | companion to ACP |
| Mixed Shift Factorizer | PASS | Yes | flagship companion / real-dataset-generated-shift evidence |
| Memory Spectrum Transfer | PASS | Yes | companion to NPMS |
| Probabilistic Dimensional Compiler | PASS | Yes | companion to LLC |

## Selected fresh results

- **Mixed Shift Factorizer:** macro-F1 **0.833546**, micro-F1 **0.827434**, hamming accuracy **0.833854**; structured-linear hamming accuracy **0.814410**.
- **Memory Spectrum Transfer:** delay-regime accuracy from spectrum **0.875** vs parameter-summary baseline **0.666667** across **24** trained models.
- **Probabilistic Dimensional Compiler:** test MSE **0.000469**, exact support **0.777778**, false discoveries **0.238889**; hard-metadata MSE **1.640980**.
- **Counterfactual Representation Surgery:** OOD task accuracy **0.886481**, concept-probe accuracy **0.499259**, erasure **0.984296**.
- **Latent Law Compiler:** test MSE **0.004185**, exact support **0.822222** versus MDL-all MSE **0.009571**, exact support **0.462222**.
- **Assumption-Conditioned Prediction:** test MSE **0.081005**, close to oracle-regime **0.080568**, versus pooled ridge **2.218234**.
- **Unknown-Type Decomposition:** macro-F1 **0.898814** versus structured-linear **0.890873**.
- **NPMS:** regime classification accuracy **0.928571** in the controlled reservoir study.

## Preserved negative/boundary evidence

- **Eigen-JEPA:** fresh rerun does not establish superiority over strong raw/log ridge controls; preserve as boundary evidence.
- **Falsification World Models:** falsification acquisition does not dominate disagreement acquisition on theory identification.
- **Progressive Possibility Collapse:** high true-set retention but broadly competitive with Bayesian thresholding rather than a clean dominance result.
- **APEN:** rare-event gains depend on informative salience and degrade as salience fails.
- **LLC robustness:** deterministic metadata becomes brittle as metadata error rises; this is the motivation for PDC, not evidence to hide.

## Preprint consolidation order

1. **Latent Law Compiler + Probabilistic Dimensional Compiler**
2. **NPMS + Memory Spectrum Transfer**
3. **Counterfactual Representation Surgery**
4. **Assumption-Conditioned Prediction + Assumption Conflict Resolver**
5. **Unknown-Type Decomposition + Mixed Shift Factorizer**
6. **Minimal Counterexample Forge + Pareto Counterexample Forge**
7. Adaptive Theory Geometry
8. APEN
9. Event-Sparse Neural Fields
10. Theory-Conditioned Memory
11. Eigen-JEPA — boundary/negative paper
12. Falsification World Models — boundary/negative paper
13. Progressive Possibility Collapse — boundary/tradeoff paper

## External gates still open

These fresh reruns strengthen reproducibility but do **not** satisfy archival publication requirements by themselves. Still open where relevant:

1. official third-party baseline reproduction;
2. naturalistic/community datasets rather than generated mechanisms alone;
3. matched parameter/tuning/compute learned baselines;
4. genuinely independent clean-room replication by another operator;
5. venue-specific novelty/prior-art review after protocol freeze;
6. authorship, affiliation, ethics, data-license, and code-license decisions;
7. final venue formatting and external submission.

## Current release decision

- **Public technical/preprint iteration:** READY for the 18-project V4 archive, subject to author/license metadata review.
- **Flagship preprint sprint:** READY TO EDIT/PACKAGE, with the first six consolidated families prioritized above.
- **Archival conference/journal submission:** HOLD until the project-specific external gates are met.
- **512 registry:** keep as a frontier registry; do not describe 512 seeds as 512 completed papers.
