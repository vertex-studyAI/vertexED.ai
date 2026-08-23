# T2424-0016 — PST — Predictive Single-Cell Transition Score

This directory is the **canonical Project 2424 evidence-recovery package** for the First-100 entry `T2424-0016`, mapped to the recovered isolated project previously identified as `MODEL-PST`.

It does **not** reconstruct the PST neural implementation from manuscript prose. The recovered handoff records that a complete isolated bundle existed under `projects/MODEL-PST/`, but that bundle had no Git repository mounted and its individual source tree is not currently addressable through the connected GitHub repository. This package therefore migrates the claim/evidence boundary first and prevents unsupported historical results from being promoted while source migration remains open.

## Recovered executed evidence

The recovered handoff/report records:

- `python -m pytest -q` — 7 passed in the isolated bundle;
- smoke run — seed 11, synthetic family A;
- compact suite — seeds 11, 29 and 47, seven variants, 21 total runs;
- family-A → family-B fixed transfer — seed 71;
- family-B in-domain run — seed 71;
- 24 per-experiment evidence manifests passing recorded SHA-256 and size validation;
- all executed scientific results classified `SYNTHETIC_CONTROLLED`.

### Important recovered findings

The recovered compact report records calibrated PST at AUROC `0.9744 ± 0.0115`, AUPRC `0.9101 ± 0.0320`, and Top-K precision `0.8235 ± 0.0519` on the controlled generator.

Those numbers are **not a superiority result**. The recovered raw-expression logistic ablation reports AUROC `0.9968` and AUPRC `0.9882`, exceeding PST on that generator. Validation-only calibration also worsened the recorded held-out metrics, and fixed family-A → family-B transfer fell to AUROC `0.6577` / AUPRC `0.2877` despite strong family-B in-domain retraining.

These negative findings are preserved rather than repaired away.

## Historical claim quarantine

Earlier PST records referenced Paul15, pancreatic differentiation and dentate-gyrus neurogenesis results. The recovered release explicitly states that those historical headline values are **UNVERIFIED** because the original raw logs, exact dataset versions/checksums and executable repository state were not mounted.

This package enforces that boundary programmatically. Any attempt to mark a historical biological-dataset result as recovered measured evidence fails validation.

## Run the recovery gate

```bash
node portfolio/project2424/projects/T2424-0016/experiment/validate_recovery.mjs
```

## Test

```bash
node --test tests/project2424PstEvidenceRecovery.test.mjs
```

The repository root `npm test` discovers the regression file as part of canonical CI.

## What is complete here

- canonical queue ID mapping: `T2424-0016` ↔ recovered `MODEL-PST`;
- machine-readable recovered claim ledger;
- explicit synthetic-vs-external evidence classes;
- historical-result quarantine;
- external-validation fail-closed gate;
- regression tests preventing evidence-tier inflation;
- exact recovery/blocker documentation.

## What remains incomplete

- migration of the original isolated PST source tree, checkpoints and raw evidence files into this Git repository;
- clean rerun from that migrated source under canonical Git identity;
- independent QA of all 24 retained artifact hashes;
- approved external dataset contracts and downloads;
- real biological validation;
- established compatible external transition-scoring baseline execution;
- full Project 2424 nine-part certification gate.

Until those are resolved, this project is **not `Certified complete`** and must not be presented as externally biologically validated.