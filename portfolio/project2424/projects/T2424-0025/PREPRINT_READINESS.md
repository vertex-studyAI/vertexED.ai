# T2424-0025 Current-Main Preprint Readiness

Status: **NO-GO / NOT PREPRINT_READY**

This document closes the current-main claim/evidence/submission bookkeeping for the bounded T2424-0025 precursor. It does not authorize release and does not upgrade the work into a Transformer, learned-memory, real-data, or uniquely non-Gaussian result.

## Canonical evidence anchors

- Current-main paper parent: PR #764, exact head `33f475c300f6514354cc6cd7b6e344c7652cc46d`.
- Current-main base recorded by the paper lane: `f4dbbb4bc9d0942332b03b32d65e3e39f1052382`.
- Frozen historical experiment source: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`.
- Independent reproduction merge: `715aea0b632c70493c226a84473d77ff7ca8cfc6` (PR #311).
- Screen output SHA-256: `7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1`.
- Ablation output SHA-256: `f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e`.
- Current bounded manuscript: `MANUSCRIPT.md`.
- Machine-readable readiness receipt: `PREPRINT_READINESS.json`.
- Sentence-level boundary audit: `CLAIM_AUDIT.md`.
- Release authority gate: `RELEASE_METADATA.md`.
- Current-main reconciliation: `CURRENT_MAIN_RECONCILIATION.json`.
- Retained metrics: `raw_metrics/repro-wave-20260812.json`.
- Deterministic figure data/audit: `figures/FIGURE_DATA.json` and `figures/FIGURE_AUDIT.md`.

## Claim-to-evidence matrix

| Candidate claim | Retained evidence | Verdict |
|---|---|---|
| Robust weighted readouts reduce MAE relative to the arithmetic weighted mean on this frozen synthetic aggregation task. | 30-seed heavy-tail screen: mean MAE `0.3615267855`, weighted-median MAE `0.0165609423`; clean screen: `0.0243549670` vs `0.0125939627`. | **SUPPORTED, BOUNDED** |
| The weighted median remains below the arithmetic mean across the retained contamination sweep. | 50 seeds per contamination condition at `[0, .05, .10, .18, .25, .35]`. | **SUPPORTED, BOUNDED/DESCRIPTIVE** |
| The advantage is uniquely caused by Cauchy/heavy-tail contamination. | At 0% Cauchy contamination, mean MAE is `0.0246469` and weighted-median MAE is `0.0125699`, a `49.00%` relative reduction. | **FALSIFIED / NOT ISOLATED** |
| The precursor establishes a Transformer or learned-memory mechanism. | No learned Transformer or trainable memory controller is tested. | **UNSUPPORTED** |
| The contamination sweep establishes statistical significance. | The sweep was mechanism-oriented and not a preregistered confirmatory test with a predeclared significance procedure. | **UNSUPPORTED** |
| The result is externally validated on another dataset/domain. | Independent reproduction uses the same frozen experiment/evidence lineage. | **UNSUPPORTED** |

## Paper artifact

The current-main paper workflow run `34040484292` is bound to parent head `33f475c300f6514354cc6cd7b6e344c7652cc46d`. It retained artifact `9991520057` with GitHub digest `sha256:7b9f4bd4362a335f103ed8a07f1fa67a66395af492881007da6eb3b170943145`. The exact seven-page PDF SHA-256 is `6cb16ac5662b7fadbf06c50e14174d190693fe22e56023cd8c0d106646b3722c`.

The parent PR records a page-by-page visual inspection with no clipping, overlap, broken glyphs/tables, or missing figures. CI is not permitted to convert that into self-certified human review. The workflow artifact expires on 6 October 2026 and is not a permanent archive.

## Submission/release checklist

- [x] frozen source/evidence identity explicit;
- [x] retained 30-seed screen and 50-seed sweep reconciled to the manuscript;
- [x] central 0% contamination falsifier preserved in the main paper;
- [x] no unsupported significance claim;
- [x] no Transformer or learned-memory upgrade;
- [x] no external-validation or real-data upgrade;
- [x] deterministic retained-data figures verified on the parent head;
- [x] deterministic seven-page PDF built twice with byte equality on the parent head;
- [x] sentence-level scientific claim audit recorded for the current-main manuscript;
- [x] source-bound release metadata receipt added;
- [ ] authorized final authorship/contribution statement;
- [ ] authorized repository/release license;
- [ ] authorized final code/data release statement;
- [ ] authorized permanent archive of the exact digest-bound package.

## Verdict

The research artifact is **paper-artifact complete but release-authority incomplete**. Scientific evidence supports only the bounded synthetic robust-readout result, with the clean-control confound retained as a falsifier of the narrower mechanism story. `PREPRINT_READY=false` and `release_authorized=false` remain fail-closed until all four human-authority gates are genuinely resolved.
