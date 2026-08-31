# T2424-0050 independent sentence-level claim audit

Audit date: 2026-08-31

Audited manuscript: `MANUSCRIPT.md`, 9,572 bytes, SHA-256 `f7523041fe13f04cb3f917aac41c5c0f3525a1be7bc89cb0f06d85f603cc4a35`.

Decision: **PASS for bounded claim reconciliation; NO-GO for PREPRINT_READY remains unchanged.**

This audit reviews every sentence or table row that states a quantitative result, protocol fact, comparison, causal/mechanistic interpretation, scope boundary, or release conclusion. It does not alter the manuscript, protocol, seeds, thresholds, baselines, metrics, or outcomes.

## Claim ledger

| ID | Manuscript location and claim | Direct evidence | Audit decision |
|---|---|---|---|
| S01 | Abstract: 24 cells compressed into six four-cell blocks. | `v2-freeze-config.json`; `results/reference.json`. | Supported exactly; 4x compression. |
| S02 | Abstract/results: linear MAE `0.06589139155637647`, harmonic MAE `0.0011366559231966065`, improvement `97.876632%`. | `results/reference.json`; independently recomputed by `tests/t2424-0050-paper-integrity.test.mjs`. | Supported for the frozen 20-seed aligned screen only. |
| S03 | Abstract/results: flux preserved to numerical precision; mean relative error `1.3693877541812723e-16`; uniform-control MAE `0`. | `results/reference.json`. | Supported for the deterministic 1D discretization; not a learned discovery. |
| S04 | Methods: frozen gate requires >=65% pressure-MAE improvement, <=1% flux error, and uniform behavior to `1e-12`. | `v2-freeze-config.json`; `STATUS.md`. | Supported; threshold remains historical and unchanged. |
| S05 | Reproducibility: source/head/merge identities, Linux x64, Node v22.16.0, and six focused tests. | `STATUS.md` and retained repository history. | Supported as recorded reproduction provenance. |
| S06 | Harder audit: rho `0`, `0.5`, `0.9`; 100 deterministic fields per condition. | `results/misaligned-audit.json`. | Supported; this is a retained audit, not a rewritten parent protocol. |
| S07 | Harder audit: improvements `63.8317%`, `77.1634%`, `86.1675%`. | `results/misaligned-audit.json`; independently recomputed test. | Supported to displayed precision. |
| S08 | Harder audit counts: harmonic beats linear `99/100`, `100/100`, `100/100`; beats arithmetic `100/100`, `99/100`, `96/100`. | `results/misaligned-audit.json`. | Supported; no significance claim is made. |
| S09 | Failure: rho=0 misses 65%; seed 6 reverses ordering with linear MAE `0.02691531294179892`, harmonic MAE `0.029619728875993533`, improvement `-10.0479%`. | `results/misaligned-audit.json`. | Supported and required to remain visible. |
| S10 | Mechanism: harmonic block aggregation preserves integrated series resistance and explains near-exact flux behavior. | Darcy equations in manuscript methods; implementation/protocol; exact flux evidence. | Supported mechanistic interpretation in this 1D construction; not broad optimality. |
| S11 | Arithmetic ablation is generally weaker, but current evidence does not establish optimality among reduced-order methods. | Audit counts in S08; no other reduced-order comparator was executed. | Supported and appropriately bounded. |
| S12 | Related work: FNO, DeepONet, and POD are contextual future comparator families, not present baselines. | `BIBLIOGRAPHY_AUDIT.md`; experiment commands and retained results contain no such execution. | Supported; no cross-paper superiority inference allowed. |
| S13 | Limitations: synthetic, 1D, steady, single-phase, explicit, aligned parent generator; no public dataset, 2D/3D, transfer, learned comparator, or novelty evidence. | Frozen config, methods, commands, result schemas, and bibliography audit. | Supported absence/scope statement. |
| S14 | Conclusion: bounded mechanism robustness with mixed misalignment evidence, not learned-operator superiority or broad Darcy generalization. | S02–S13; `STATUS.md`; `CLAIM_EVIDENCE_MATRIX.md`. | Supported synthesis; HOLD/MIXED retained. |
| S15 | Release state: continued bounded closure is allowed; `PREPRINT_READY` is NO-GO. | `RELEASE_AUDIT.md`; release manifest `preprint_ready=false`. | Supported; unresolved human-authority and archival gates remain. |

## Prohibited-claim scan

The audited manuscript contains no claim of:

- statistical significance, confidence intervals, or hypothesis-test success;
- FNO, DeepONet, PINN, POD, finite-volume, learned-operator, or state-of-the-art superiority;
- arbitrary-field >=65% robustness;
- 2D/3D, transient, multiphase, real-data, OOD, resolution-transfer, manufacturing, deployment, or production validation;
- publication novelty, preprint readiness, permanent archival availability, or an inferred repository license.

The words `strong`, `better`, and `outperforms` are accepted only where their sentences name or inherit the frozen aligned screen or retained synthetic audit. They cannot be generalized beyond those scopes.

## Reconciliation result

All audited quantitative values resolve to retained JSON, and all scientific interpretations remain within the scope encoded by `STATUS.md` and `CLAIM_EVIDENCE_MATRIX.md`. No unsupported quantitative, significance, reproduction, superiority, generalization, novelty, or readiness claim was found. This closes the independent sentence-level audit gate only; it does not close authorship, licensing, permanent archiving, or human novelty review.
