# T2424-0025 Current-Main Manuscript Claim Audit

Status: **SOURCE/PDF CLAIM AUDIT PASS / RELEASE AUTHORITY OPEN**

Audited scientific artifact: `MANUSCRIPT.md` inherited from parent PR #764 at exact parent head `33f475c300f6514354cc6cd7b6e344c7652cc46d`. This audit adds no experiment, metric, significance procedure, or scientific interpretation.

## High-risk claim classes

- **Transformer / learned memory — PASS.** The manuscript explicitly states that the precursor does not establish a Transformer result or learned-memory advantage.
- **Unique non-Gaussian attribution — PASS.** The 0% contamination control remains central. Weighted-median MAE `0.0125699` versus arithmetic-mean MAE `0.0246469` at 0% Cauchy contamination is retained as a mechanism confound, not hidden as supplemental detail.
- **General superiority — PASS.** Conclusions are restricted to the frozen synthetic weighted-aggregation procedure.
- **Statistical significance — PASS.** The contamination sweep remains descriptive and is identified as a mechanism-oriented follow-up rather than a preregistered confirmatory test. No significance claim is introduced.
- **Real-data / forecasting / sequence-model claims — PASS.** Adjacent learned-system literature is context only; no such evaluation is claimed here.
- **Reproducibility — PASS, BOUNDED.** Reproducibility refers to the frozen precursor outputs and exact evidence lineage, not external dataset/domain validation.
- **Negative-control preservation — PASS.** The clean-control limitation appears in the abstract, results, discussion, limitations, and conclusion.

## Exact paper evidence

The parent current-main paper workflow run `34040484292` retained artifact `9991520057`, bound to source head `33f475c300f6514354cc6cd7b6e344c7652cc46d`. The exact PDF SHA-256 is `6cb16ac5662b7fadbf06c50e14174d190693fe22e56023cd8c0d106646b3722c`. The parent PR records a page-by-page visual inspection of all seven pages with no clipping, overlap, missing glyphs, broken tables, or missing figures.

This file does **not** let CI self-certify human visual review. The machine-readable receipt records that distinction explicitly.

## Allowed bounded phrases

- `95.42% relative reduction` only for the retained 30-seed heavy-tail screen.
- `49.00% relative reduction` only for the retained 50-seed zero-contamination comparison and explicitly as a mechanism confound.
- `reproduced` only for the frozen precursor outputs, never as external validation.
- `robust readouts substantially outperform` only when scoped to this frozen synthetic procedure.

## Release blockers outside scientific wording

This audit does not resolve authorship/contribution assignment, repository/release licensing, the final code/data release statement, or permanent archival release. `release_authorized=false` and `preprint_ready=false` remain mandatory until an authorized human resolves those gates.

Any later change to manuscript scientific wording, result values, title/captions that change interpretation, or evidence lineage requires this audit to be rerun.
