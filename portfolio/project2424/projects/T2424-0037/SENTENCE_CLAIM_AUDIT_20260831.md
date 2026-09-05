# NeuroCAD / T2424-0037 — Independent Sentence-Level Claim Audit

Audit date: 2026-08-31

Audited artifact: `MANUSCRIPT.md`  
Audited manuscript bytes: `12877`  
Audited manuscript SHA-256: `fd2e6c026c0f1ed146ed820b9d890bff743b2c45b3850eeca122c244d93a9ac5`

Decision: **PASS for bounded claim-to-evidence reconciliation; NOT PREPRINT_READY remains unchanged.**

This audit is independent of outcome generation. It changes no experiment, case, threshold, baseline, metric, or manuscript sentence. It audits the retained manuscript against the evidence ledger, machine-readable table data, frozen component protocol/result, bibliography audit, readiness gate, and release boundaries.

## Sentence-level claim ledger

| ID | Manuscript claim class | Evidence checked | Audit result |
|---|---|---|---|
| N01 | Historical typed+validated passed `19/20` (`0.95`) versus original direct `12/20` (`0.60`). | `EVIDENCE.md`; `TABLE_DATA_20260829.json` | PASS — counts, denominators, and rates agree. |
| N02 | Historical valid OpenSCAD cases produced non-empty STL `12/12`; O018 remains a retained failure. | `EVIDENCE.md`; `TABLE_DATA_20260829.json` | PASS — execution evidence is bounded and the failure is not erased. |
| N03 | Reused component diagnostic scores M2 `1.00`, B1 `1.00`, and B0 `0.60`. | Frozen component result; table data | PASS — matched-validation tie and original-direct result agree. |
| N04 | B0 accepted eight invalid cases; M2 and B1 accepted zero. | Frozen component result; manuscript table | PASS — invalid-acceptance counts agree. |
| N05 | `original_gap = 0.40`, `remaining_gap = 0.00`, and `validation_recovery_fraction = 1.00`. | Frozen component result; table data | PASS — derived values and frozen verdict agree. |
| N06 | Protocol and thresholds were frozen at source/protocol commit `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8` before first execution. | Frozen protocol; table data | PASS — exact identity retained. |
| N07 | Workflow `31777954088`, artifact `9210587354`, artifact SHA-256 `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`, Node `v22.23.1`, npm `10.9.8`, kernel `6.17.0-1020-azure`, and contract test `1/1`. | Frozen component result; table data | PASS — reproducibility identities agree. |
| N08 | Historical absolute difference is `0.35`. | `0.95 - 0.60`; table data | PASS — arithmetic recomputed independently. |
| N09 | Typed-parser-specific causality is falsified on the reused diagnostic. | Frozen interpretation rule; M2/B1 tie | PASS — negative mechanism conclusion is explicit. |
| N10 | The correct interpretation is `VALIDATION_DOMINANT`. | Frozen component protocol/result | PASS — no post-outcome reinterpretation found. |
| N11 | The 20 component cases are reused and cannot support held-out, OOD, or new-family generalization. | Protocol; readiness and claim audits | PASS — scope limitation appears in methods, failure analysis, and limitations. |
| N12 | DeepCAD, SketchGraphs, Text2CAD, CAD-Recode, Text2CAD-Bench, and ArtisanCAD are contextual references only. | `BIBLIOGRAPHY_AUDIT_20260831.md`; related-work audit | PASS — none is represented as executed or budget-matched. |
| N13 | Product/browser QA and artifact transport are engineering evidence, not scientific deployment or external validation. | `EVIDENCE.md`; manuscript limitations | PASS — evidence classes remain separated. |
| N14 | S3 is unexecuted and unauthorized for confirmatory outcome access. | `EVIDENCE.md`; manuscript limitations | PASS — no successor result is implied. |
| N15 | The paper is bounded and remains `NOT PREPRINT_READY`. | Readiness gate; release audit; release manifest | PASS — no publication-readiness claim is made. |

## Quantitative recomputation

- Historical typed+validated rate: `19 / 20 = 0.95`.
- Historical original-direct rate: `12 / 20 = 0.60`.
- Historical absolute difference: `0.95 - 0.60 = 0.35`.
- Matched diagnostic original gap: `1.00 - 0.60 = 0.40`.
- Matched diagnostic remaining gap: `1.00 - 1.00 = 0.00`.
- Validation recovery fraction: `(0.40 - 0.00) / 0.40 = 1.00`.
- Historical valid OpenSCAD conversion: `12 / 12 = 1.00`.
- Original-direct invalid acceptances: `8`; matched-validation and typed+validated invalid acceptances: `0`.

## Prohibited-claim scan

The final manuscript was checked for claim inflation. It does **not** claim:

- statistical significance or calibrated population uncertainty;
- contemporary or state-of-the-art superiority;
- a typed-parser causal advantage on the reused diagnostic;
- that reused component cases are held-out, OOD, or new-family evidence;
- manufacturing correctness, CAD-kernel correctness, external engineer validation, or public deployment;
- that S3 was executed or that confirmatory outcome access was authorized;
- repository/code licensing completion, publication novelty, or preprint readiness.

## Frozen scientific boundary

The audit preserves all of the following simultaneously:

- the bounded historical `19/20` versus `12/20` system result;
- the matched-validation `1.00` tie;
- the `VALIDATION_DOMINANT` verdict;
- typed-parser-specific causality falsified on the reused diagnostic;
- O018 retained as a historical failure;
- no rescue tuning of the reused 20 cases;
- no stronger OOD, manufacturing, external-validation, deployment, significance, novelty, or superiority claim.

## Release implication

The sentence-level evidence gate is closed for the current manuscript digest only. Any manuscript change invalidates this audit and requires regeneration and re-review. The package remains **NOT PREPRINT_READY** pending authorized repository/code licensing, final authorship and contribution metadata, and permanent archival release.
