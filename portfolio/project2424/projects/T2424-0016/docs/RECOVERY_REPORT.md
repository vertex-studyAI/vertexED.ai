# T2424-0016 PST Recovery Report

## Identity reconciliation

Project 2424 First-100 identifies `T2424-0016` as PST / Predictive Single-Cell Transition Score. The retained isolated handoff identifies the corresponding project as provisional `MODEL-PST`, titled **Predictive Stability Theory: Calibrated Local Forecast Breakdown for Prioritising Single-Cell State Transitions**.

The provisional ID existed because the original execution did not have the canonical registry mounted. This recovery maps that artifact to `T2424-0016` while preserving the original provenance statement.

## Original isolated workspace state

Recovered handoff records:

- workspace: `/mnt/data/pst_prompt6_bundle`;
- project directory: `projects/MODEL-PST/`;
- Git state: no Git repository mounted;
- package contents recorded as source, tests, configs, dataset/baseline contracts, experiment CLIs, evidence, checkpoints, reports, documentation, manuscript sources, compiled PDF, bibliography and claim-evidence matrix.

The current connected GitHub environment does not expose that isolated directory tree as a source repository. Therefore this recovery does not reconstruct unmounted implementation files from the manuscript.

## Recovered execution record

### Checks

- `python -m pytest -q` — 7 passed.
- placeholder check — passed.
- paper check — 5,569 substantive words, required sections present, no forbidden placeholder language.

### Executions

- smoke: `python experiments/run.py --config configs/smoke.json --suite single`, seed 11, synthetic family A;
- compact: `python experiments/run.py --config configs/compact.json --suite compact`, seeds 11/29/47, 21 runs across main plus six variants;
- transfer: `python experiments/robustness.py --config configs/compact.json --seed 71 --transfer`;
- family-B in-domain: `python experiments/robustness.py --config configs/compact.json --family B --seed 71`.

The recovered handoff records 24 per-experiment evidence manifests passing SHA-256 and size validation, with checkpoint hashes indexed in the isolated bundle.

## Recovered controlled findings

All values below retain the recovered evidence class `SYNTHETIC_CONTROLLED`.

### Main calibrated PST

- AUROC: `0.9744 ± 0.0115`
- AUPRC: `0.9101 ± 0.0320`
- Top-K precision: `0.8235 ± 0.0519`
- ECE: `0.1692 ± 0.0089`
- Brier: `0.0769 ± 0.0095`

### Calibration negative result

Recovered mean raw vs calibrated:

| Metric | Raw | Calibrated | Direction |
|---|---:|---:|---|
| AUROC | 0.9773 | 0.9744 | worse |
| AUPRC | 0.9261 | 0.9101 | worse |
| ECE | 0.0889 | 0.1692 | worse |
| Brier | 0.0566 | 0.0769 | worse |

The recovered report attributes this as a measured negative finding rather than weakening the calibration gate.

### Ablations / baselines

- no biological priors: AUROC `0.9677`, AUPRC `0.9118`;
- raw-expression logistic: AUROC `0.9968`, AUPRC `0.9882`;
- latent dimension 4: AUROC `0.7395`, AUPRC `0.4693`;
- latent dimension 20: AUROC `0.9686`, AUPRC `0.9077`;
- hard negatives: AUROC `0.9752`;
- all features: AUROC `0.9878`, AUPRC `0.9535`;
- strongest simple logistic pair baseline: mean AUROC `0.9968`.

The simple/raw controls outperform the neural PST variant on this controlled generator. That is a central negative result, not a defect to hide.

### Distribution shift

- family-B in-domain retraining: AUROC `0.9903`, AUPRC `0.9635`;
- fixed family-A→family-B transfer: AUROC `0.6577`, AUPRC `0.2877`.

This rejects any inference that high in-domain controlled performance establishes a domain-invariant instability principle.

## Historical external results

Earlier PST manuscript material referenced Paul15, Pancreas and Dentate Gyrus metrics. The recovered release explicitly does **not** reproduce or endorse those values. They remain quarantined because the original raw logs, dataset versions/checksums and executable repository state were not present.

No external dataset was executed in the recovered compact release.

## External validation gate

Before a biological run can be promoted, each dataset requires at least:

- official source/accession;
- exact version;
- licence/access permission;
- checksum;
- feature-matrix and metadata contract;
- leakage-safe biological unit split;
- prespecified transition label/evaluation proxy;
- circularity analysis when pseudotime/velocity overlaps model inputs;
- compatible established transition/fate baseline contract;
- raw logs, predictions, hashes and multi-seed aggregation.

If a dataset cannot support defensible labels or leakage-safe biological splits, it must be declared unsuitable rather than forced into the benchmark.

## Recovery verdict

`RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_BLOCKED`

This is materially stronger than a manuscript-only idea because a retained executed compact package and its negative findings have been recovered. It is still weaker than canonical Project 2424 completion because the original isolated source/evidence files have not been migrated and independently rerun from a Git commit.
