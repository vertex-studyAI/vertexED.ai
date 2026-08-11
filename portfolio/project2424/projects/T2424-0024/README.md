# T2424-0024 — Trust Under Uncertainty

**Canonical Project 2424 identity:** `T2424-0024`  
**Frozen queue rank:** 17  
**Evidence tier:** deterministic synthetic evaluator recovery; exact-head repository CI still required

This package measures whether predictive confidence is aligned with correctness and whether abstention can trade coverage for lower observed error.

## What is implemented

- Brier score for probability-of-correctness confidence;
- explicit calibration bins and expected calibration error (ECE);
- confidence-ranked risk–coverage curves;
- selective risk at requested coverage;
- threshold-based abstention reports;
- paired deterministic confidence controls with identical correctness outcomes;
- a frozen minimum experiment;
- root-level regression tests;
- retained protocol, result, baseline, ablation and verdict records.

This evaluator consumes labeled prediction records. It does **not** generate uncertainty estimates and does not prove any model is trustworthy or deployment-calibrated.

## Run

```bash
node portfolio/project2424/projects/T2424-0024/experiment/run.mjs
node --test tests/trustUnderUncertainty.test.mjs
```

## Frozen minimum experiment

The same 20 correctness outcomes are evaluated under two confidence mappings:

- **moderate control:** `0.8` confidence when correct and `0.2` when incorrect;
- **overconfident baseline:** `0.98` when correct and `0.92` when incorrect.

The predeclared implementation sanity gate is that the moderate policy must have lower Brier score and lower ECE than the overconfident baseline while the outcome sequence is held fixed.

Retained deterministic output records:

- moderate Brier score: `0.04` (floating representation `0.039999999999999994`);
- overconfident Brier score: `0.2542`;
- moderate ECE (5 bins): `0.20`;
- overconfident ECE (5 bins): `0.262`;
- both mappings use the same 70% correctness outcomes.

These values are implementation evidence on a constructed control, not external model-validation evidence.

## Evidence files

- `CLAIM.md` — falsifiable claim and non-claims;
- `PROTOCOL.md` — frozen pre-execution contract;
- `evidence/manifest.json` — provenance and artifact inventory;
- `evidence/results.json` — retained deterministic output summary;
- `analysis/baseline.md` — baseline comparison;
- `analysis/ablation.md` — confidence-policy and ECE-bin sensitivity notes;
- `analysis/verdict.md` — explicit GO/PIVOT/STOP decision;
- `reproduction/README.md` — clean reproduction commands.

## Limitations

- binary correctness only;
- confidence is interpreted as probability of correctness, not a class-probability vector;
- ECE is bin-sensitive and sample-size-sensitive;
- no confidence intervals or bootstrap uncertainty;
- no distribution-shift or subgroup slices;
- no cost model for abstention;
- no real-model predictions or external benchmark are bundled;
- no claim of optimal abstention threshold, safety, reliability, publication novelty, or production readiness.

## Next evidence gate

Freeze predictions from at least one real model on a held-out labeled benchmark; predeclare calibration and selective-prediction metrics; add uncertainty intervals and subgroup/difficulty slices; fit any recalibration method without using final test labels; then perform an independent clean reproduction.
