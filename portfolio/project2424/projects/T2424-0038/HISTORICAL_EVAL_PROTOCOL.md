# T2424-0038 Historical Evaluation Protocol

**Status:** PRE_OUTCOME_PROTOCOL_ONLY — NOT AUTHORIZED TO RUN  
**Project:** Obscured Records Agent  
**Candidate source revision:** `5aea2d0191a53af8dd78a01ad7ec45973af80ecf`  
**Frozen on:** 2026-09-03  
**Scientific boundary:** This document freezes evaluation logic before outcome-bearing execution. It does not establish tool effectiveness, journalistic quality, newsroom productivity, factual verification, legal safety, production readiness, or external validation.

## 1. Question

On a prospectively frozen set of historical story leads with retrospective editor dispositions, does the current deterministic T2424-0038 triage rule provide useful evidence-gated separation between leads that editors judged ready for deeper reporting and leads that required additional verification, relative to simple transparent baselines?

This is an evaluation of a deterministic triage heuristic. It is not a fact-checking study and must not be interpreted as a test of whether a story claim was true.

## 2. Immutable candidate

The evaluated candidate is the T2424-0038 implementation at source revision `5aea2d0191a53af8dd78a01ad7ec45973af80ecf`.

No code, scoring weights, blocker thresholds, publisher-normalization behavior, input transformations, label mapping, metrics, baselines, or exclusion rules may be changed after outcome labels are opened. Any such change requires a new candidate identity and a new pre-outcome freeze; it is not a continuation of this protocol.

## 3. Required corpus freeze before authorization

Outcome-bearing execution remains blocked until a manifest exists that freezes all of the following before labels are exposed to the evaluator:

- one stable record ID per historical lead;
- provenance for the source material used to reconstruct each lead;
- capture/reconstruction date;
- the exact structured T2424-0038 input fields supplied to the candidate;
- a cryptographic digest for each structured input record;
- a corpus-level digest over the ordered manifest;
- inclusion/exclusion reason for every screened candidate record;
- deduplication rule and duplicate-group identity where applicable;
- a blinded label reference that cannot be inferred from input order or filenames;
- the exact label-file digest, held separately until execution authorization;
- a declaration of whether any record was used during implementation or debugging.

Records seen during implementation/debugging must be identified and excluded from the confirmatory set. They may appear only in a separately labeled development/descriptive appendix.

## 4. Label contract

The confirmatory label is binary and must be assigned retrospectively by an editor or other documented editorial decision record:

- `READY_FOR_DEEPER_REPORTING`: evidence was sufficient to proceed to deeper reporting at the historical decision point;
- `HOLD_FOR_VERIFICATION`: additional corroboration or verification was required before proceeding.

The label is about the historical editorial disposition, not whether the underlying claim later proved true.

If the historical source cannot support one of these two labels without inference, the record is excluded before scoring and the exclusion reason is logged. Ambiguous records must not be resolved by looking at the candidate output.

## 5. Candidate decision mapping

The candidate output is mapped prospectively as follows:

- candidate `HOLD_FOR_VERIFICATION` -> predicted `HOLD_FOR_VERIFICATION`;
- any candidate state explicitly indicating readiness to continue reporting -> predicted `READY_FOR_DEEPER_REPORTING`.

If the immutable candidate emits any other state, the evaluator must fail closed and report a protocol error rather than invent a mapping after outcomes are visible.

## 6. Baselines

All baselines consume exactly the same frozen structured records.

### B0 — All-hold conservative baseline

Predict `HOLD_FOR_VERIFICATION` for every record. This establishes the trivial safety-oriented reference and exposes whether apparent accuracy is driven only by label imbalance.

### B1 — Evidence-only baseline

Use only the mean supplied source-evidence value. Predict `HOLD_FOR_VERIFICATION` when mean source evidence is below `0.45`; otherwise predict `READY_FOR_DEEPER_REPORTING`. No publisher-independence, source-type, primary-source, novelty, impact, risk, or freshness information is used.

### B2 — Score-only ablation

Use the candidate's transparent continuous prioritization score but remove the hard corroboration blockers. The threshold for converting this score to the binary prediction must be frozen from candidate semantics or a development-only set before confirmatory labels are opened. If no non-outcome-derived threshold can be specified, B2 is reported as ranking-only and is not given a binary accuracy result.

B2 must never be tuned on the confirmatory outcomes.

## 7. Primary metric

**Primary:** balanced accuracy for the binary editor-disposition label.

Balanced accuracy is the arithmetic mean of sensitivity for `READY_FOR_DEEPER_REPORTING` and sensitivity for `HOLD_FOR_VERIFICATION`. This prevents a majority-class strategy from receiving a misleadingly strong primary score.

The candidate is compared descriptively against B0 and B1 on the same records. No superiority claim is authorized merely because the point estimate is larger.

## 8. Safety-critical secondary metrics

Report all of the following with exact numerators/denominators:

1. **False-promotion rate:** among editor-labeled `HOLD_FOR_VERIFICATION` records, fraction predicted ready. This is the primary error-of-concern.
2. **False-hold rate:** among editor-labeled ready records, fraction predicted hold.
3. **Raw accuracy.**
4. **Per-class precision, recall and F1.**
5. **Confusion matrix.**
6. **Coverage:** evaluated records / prospectively eligible records after frozen exclusions.
7. **Protocol-error count:** malformed records, unknown output states, or evaluator failures. Protocol errors are never silently dropped.

If a continuous candidate score is available for every record, additionally report ROC-AUC and precision-recall AUC as descriptive ranking metrics. They do not replace the frozen binary decision analysis.

## 9. High-risk slice

Before outcomes are opened, define the high-risk slice as records with input `risk >= 0.7`, matching the candidate's existing corroboration boundary.

For this slice report the same confusion matrix, false-promotion rate, false-hold rate, and balanced accuracy. The slice is secondary and must not be used to rescue an unfavorable overall result.

## 10. Publisher-independence audit

Because the candidate approximates independence through normalized publisher identity, the evaluation must include a blinded manual audit of a prospectively selected subset of records for corporate/organizational dependence that simple publisher normalization may miss.

The subset-selection rule and subset size must be frozen before outcome labels are opened. Audit findings are reported as an assumption stress test; they do not permit retrospective modification of candidate outputs in the confirmatory analysis.

## 11. Uncertainty and reporting

For balanced accuracy, false-promotion rate, false-hold rate, accuracy, precision, recall and F1, report point estimates plus two-sided 95% bootstrap confidence intervals using a fixed seed and record-level resampling.

The exact bootstrap seed and replicate count must be written into the execution manifest before labels are opened. If the final corpus is too small for stable interval estimation, report the intervals anyway with an explicit small-sample limitation rather than changing methods post hoc.

No p-value or statistical-significance claim is required for this gate. This evaluation is primarily a bounded characterization and falsification exercise.

## 12. Falsifiers and interpretation

The tool must not be promoted on this evaluation if any of the following occurs:

- confirmatory inputs or labels were inspected while choosing thresholds, weights, exclusions, baselines or mappings;
- the candidate identity differs from the frozen revision without a new preregistration;
- labels were generated from the candidate output or from rules materially equivalent to it;
- the all-hold baseline cannot be beaten on balanced accuracy in a way that is practically meaningful;
- false promotions remain unacceptably frequent for a tool whose stated design goal is fail-closed triage;
- publisher-independence audit reveals material dependence that invalidates the claimed independent-source counts;
- protocol errors or missing records are selectively removed after outcomes are observed.

An unfavorable, null, mixed, or assumption-breaking result is a valid outcome and must be preserved unchanged.

## 13. Raw evidence requirements

Before execution, the evaluator must freeze paths/destinations for:

- immutable corpus manifest;
- blinded label file;
- candidate raw outputs;
- baseline raw outputs;
- evaluator stdout/stderr;
- machine-readable metric report;
- human-readable error analysis;
- environment/runtime identity;
- exact command line;
- source revision and dependency lock digest.

Raw outputs must be retained even when the result is negative or the evaluation fails.

## 14. Authorization gate

This protocol alone does **not** authorize historical evaluation.

Execution may begin only after a separate manifest records, with cryptographic digests where applicable:

1. frozen corpus identity;
2. frozen blinded-label identity;
3. exact candidate revision;
4. exact baseline implementations and any B2 threshold;
5. bootstrap seed and replicate count;
6. evaluator/runtime identity;
7. raw-output destinations;
8. confirmation that no confirmatory outcome labels have been inspected during protocol construction.

Until all eight are present, state remains `PRE_OUTCOME_PROTOCOL_ONLY / NOT AUTHORIZED TO RUN`.