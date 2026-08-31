# NeuroCAD / T2424-0037 — Preprint Release Audit

Current verdict: **NO-GO / NOT PREPRINT_READY**

Paper scope selected for this branch: **historical system result + matched-validation mechanism falsification**. A new S3 outcome is not required for this bounded paper, but broader OOD/capability claims remain prohibited unless S3 or an equivalent frozen successor is executed.

## Closed gates

- [x] Publication accounting uses the evidence-bearing NeuroCAD lineage once under `T2424-0037`; unresolved `T2424-0007` does not create a second paper/completion count.
- [x] Historical `19/20` typed+validated versus `12/20` original-direct result appears in the manuscript.
- [x] Historical O018 failure remains visible.
- [x] `12/12` retained valid OpenSCAD-to-nonempty-STL result is preserved as historical execution evidence.
- [x] Matched-validation component result appears in main text: M2 `1.00`, B1 `1.00`, B0 `0.60`, `validation_recovery_fraction = 1.00`.
- [x] Typed-parser-specific causality is explicitly falsified on the reused diagnostic.
- [x] Reused component cases are explicitly not called held-out/OOD.
- [x] Exact mechanism source/protocol commit, workflow, artifact ID, digest, and retained environment are included.
- [x] Claim-to-evidence/high-risk wording audit exists.
- [x] Machine-readable table source values exist and contain only retained metrics.
- [x] Failure analysis distinguishes historical implementation failure, invalid-acceptance behavior, mechanism-attribution falsification, and evaluation-scope limitation.
- [x] Primary-source related-work audit exists for DeepCAD, SketchGraphs, Text2CAD, CAD-Recode, Text2CAD-Bench, and ArtisanCAD.
- [x] Related-work audit explicitly forbids unmatched superiority claims.
- [x] Data/code/artifact statement exists and separates current evidence from unmaterialized S3 adapters.
- [x] Limitations section explicitly excludes OOD generalization, manufacturing correctness, external validation, deployment proof, and state-of-the-art claims.
- [x] Product QA is separated from scientific evidence.
- [x] Deterministic release-manifest generation binds the current manuscript, scientific audits, frozen component protocol/result, table data, evidence ledger, and identity-accounting record by byte length and SHA-256.
- [x] Automated release tests fail closed if the frozen `VALIDATION_DOMINANT` result, typed-parser-specific falsification, reused-case boundary, identity accounting, or `NOT_PREPRINT_READY` status drifts.

## Open release gates

- [ ] Resolve repository/code release license for the exact source/artifacts to be cited or distributed with the preprint.
- [ ] Record final authorship and contribution statement.
- [ ] Verify final bibliography metadata/DOIs where available and ensure every manuscript citation maps to a primary source.
- [ ] Decide whether to include a figure. Current table-only presentation is sufficient; any figure must be deterministically generated from `TABLE_DATA_20260829.json` and must not add inferred values.
- [ ] Perform an independent sentence-level claim audit against the final manuscript text.
- [ ] Compile a clean PDF from the exact reviewed manuscript.
- [ ] Visually inspect every PDF page, table, equation, link/citation, and reference.
- [ ] Extract PDF text and rerun the claim audit on the rendered release artifact.
- [ ] Hash/archive the exact final PDF and record its SHA-256.

## Experiment boundary

No additional experiment is required to release the **bounded historical/diagnostic negative-mechanism paper** if the open release gates above are closed. A new experiment is required only for stronger claims.

For broader capability/generalization claims, the next scientific gate remains a separately frozen successor with new prompt families, competent matched contemporary baselines, frozen geometry/topology/dimension/constraint/editability criteria, exact datasets/provider identities, untouched evaluation data, explicit authorization, retained raw outputs, and independent verification.

Do not retune the reused 20-case diagnostic to recover a typed-parser advantage.

## Release decision

**GO:** continue manuscript/release engineering under the historical/diagnostic scope.

**NO-GO:** `PREPRINT_READY`, typed-parser causal claim, OOD/generalization claim, manufacturing claim, external-validation claim, public-deployment claim, or contemporary superiority claim.
