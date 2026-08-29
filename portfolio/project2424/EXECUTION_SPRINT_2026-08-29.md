# Project 2424 Execution Sprint — 2026-08-29

This file is an execution checkpoint, not a second canonical registry. The canonical project/claim/status sources remain the existing Project 2424 manifests, issue #496, and issue #523.

## Active closure lanes

1. **Identity / provenance**
   - Recover evidence-backed `P2424-*` → `T2424-*` lineage.
   - Never infer identity from numeric suffix alone.
   - First-100 rows may move only to `BUILD`, `MERGE`, `ONE_FINAL_TEST`, `FREEZE_NEGATIVE`, `ARCHIVE`, or `BLOCKED` when supported by exact evidence.
   - Unresolved mappings remain explicitly unresolved and do not increase completion counts.

2. **Reproducibility / experiments**
   - Reproduce frozen studies unchanged where possible.
   - Capture exact source revision, environment, seeds, commands, raw metrics, artifact digests, uncertainty, baselines, ablations, and limitations.
   - Any successor experiment must freeze hypothesis, falsifier, data provenance/splits, comparator family, seeds, metrics/statistics, budget, stop rules, environment, artifact paths, and execution authorization before outcome access.

3. **Preprint conversion**
   - Build claim-to-evidence matrices from retained evidence only.
   - Generate tables/figures only from retained artifacts.
   - Require identity, protocol, artifacts, reproduction, claim audit, and manuscript/PDF gates before `PREPRINT_READY`.

4. **Independent QA**
   - QA must not certify work authored in the same pass.
   - Reject source-only, template-only, proposal-only, or CI-only completion.

## Current high-priority scientific boundaries

- `T2424-1863`: frozen negative. No post-hoc rescue tuning.
- `T2424-0050` Darcy Latent Operator: parent remains `HOLD / MIXED_ROBUSTNESS`; no successor training until a fully frozen protocol and explicit authorization exist.
- NeuroCAD: preserve the typed-parser causal falsification / validation-dominant interpretation. Resolve the `T2424-0007` vs `T2424-0037` lineage before counting a publication twice.
- `T2424-0016` PST: exact source/checkpoint/raw-evidence lineage must be recovered and reproduced or closed with an explicit source blocker.
- `T2424-0019` NPMS: exact canonical source lineage must be recovered or the canonical package must close `SOURCE_BLOCKED`; later derived bundles cannot silently substitute for the missing source.
- `T2424-0025` NGMT: paper framing is robustness/mechanism with mechanism uncertainty, not generic superiority.

## Immediate execution order

1. Close evidence-backed identity/provenance rows in the First-100.
2. Advance the strongest dependency-ready frozen reproduction.
3. Freeze any successor protocol that is genuinely ready, without accessing outcomes first.
4. Convert evidence-backed candidates into claim-audited manuscript sections/tables/figures.
5. Independently QA the strongest claimed closure from another lane.
6. Merge duplicates and archive weak/unsupported candidates instead of increasing nominal project count.

## Non-negotiable completion rule

Proposal count, source-directory presence, generated scaffolds, manuscript templates, green CI, or internal review do **not** constitute completed research. Negative, mixed, falsified, duplicate, archived, or blocked outcomes are valid terminal states when provenance and interpretation are complete.
