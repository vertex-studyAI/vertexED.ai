# Conference Submission War Room — 2026-08-23

This file records the evidence-bounded submission state after direct repository, paper, CI, and recovery-audit inspection. It intentionally overrides stale readiness impressions when newer canonical evidence is stricter.

## Truth rule

- `SUBMITTED` requires a portal confirmation / submission ID / receipt.
- Historical manuscript claims are not promoted when raw artifacts or canonical source are missing.
- Negative and mixed findings remain first-class evidence.
- A venue deadline does not lower a scientific release gate.

## Active slate

| Package | Venue target | Deadline | Current state | Evidence basis | Exact blocker / action |
|---|---|---:|---|---|---|
| LAM-JEPA negative ARC paper | ICDM 2026 Teen Research Track | 2026-08-30 | `OWNER_ACTION / EXTERNAL_REVIEW` | `vertex-studyAI/LAM-JEPA` PR #101 exact-head CI records all five checks passing; compiled artifact is 3 pages; manuscript preserves negative/inconclusive verdict and locked confirmatory test | Lock truthful author list/order + affiliations; independent human review; final upload/receipt |
| NPMS + Memory Causal Use | NeurIPS EIML3 candidate | workshop-specific | `DEFER_UNLESS_SOURCE_RECOVERED` | `T2424-0019` canonical status is `RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_UNVALIDATED`; original source not migrated; clean canonical rerun and external/trained-model evaluation absent | Recover/migrate original isolated source tree, validate hashes, rerun, then add external/trained-model evaluation and independent QA |
| Counterfactual Representation Surgery | NeurIPS Interpretability for Discovery candidate | workshop-specific | `PREPRINT_CANDIDATE / ARCHIVAL_HOLD` | Aug-12 Research Atlas fresh rerun passed and CRS is #3 in preprint consolidation order; archival decision remains HOLD pending external gates | Naturalistic dataset + official/strong baselines + venue-specific novelty audit + independent QA |
| Event-Sparse Neural Fields | NeurIPS Simbiochem candidate | workshop-specific | `DEFER_CURRENT_CYCLE` | Aug-12 Research Atlas places ESNF below CRS; manuscript audit says actual neural-field identity, real/community datasets, dense neural-field baselines, required ablations, and evidence matrix are incomplete/unavailable | Build real neural field + reaction-diffusion benchmark + dense/FNO/DeepONet-style baselines + required ablations before targeting Simbiochem |
| Predictive State Transitions / Stability Theory | IEEE BigData High School Symposium | 2026-09-20 | `EXTERNAL_BLOCKED / HISTORICAL_REAL_DATA_QUARANTINED` | `T2424-0016` recovery report reproduces only `SYNTHETIC_CONTROLLED` execution. Paul15/Pancreas/Dentate historical metrics are explicitly not reproduced or endorsed; raw logs/dataset versions/checksums/original repo are missing. Controlled simple logistic baseline outperforms PST. | Recover exact accessions/versions/checksums/licenses and historical logs OR re-run a new leakage-safe external-data protocol with strong trajectory/fate baselines; otherwise reframe as a controlled negative study |

## LAM-JEPA release gate

Current technical state from PR #101:

- Head: `f74ac06eb18953d1ec8871b39009b2d08ef87c30`
- PR is open, draft, mergeable.
- Exact-head checks recorded as passing:
  - Research claim boundary
  - ARC Download Transport CI
  - ARC Protocol V2 QA
  - ICDM Teen Paper
  - Reproducibility CI
- Compiled PDF artifact: `icdm2026-teen-negative-arc-draft`
- Artifact ID: `9489820422`
- PDF length: 3 pages (venue limit is 5 pages including references).
- Visual inspection: pages 1–2 clean; page 3 contains only final bibliography item. Cosmetic only; do not hack IEEE margins to eliminate it.
- Current manuscript author line is deliberately an owner-controlled placeholder.

Do not mark `SUBMISSION_READY` until the author/affiliation information is truthful and an independent human review is completed.

## NPMS decision

Canonical `T2424-0019` is not an archival-ready package despite historical manuscript/readiness scores. The connected repository proves recovery-package integrity, not reproduction of the original implementation.

Hard blockers retained from canonical status:

- original source/config/result/evidence/manuscript tree not migrated into canonical Git identity;
- retained hashes not independently revalidated;
- clean canonical rerun pending;
- residual spectral verification and uncertainty quantification missing;
- switching-fit and conjugate-group truncation repairs pending;
- no trained-model checkpoint or external dataset evaluated;
- no independent literature/manuscript audit completed.

Decision: **do not spend deadline week polishing NPMS as if the evidence gate were closed.** Recover source first; otherwise defer.

## CRS vs ESNF decision

**CRS wins the current allocation decision.**

Evidence:

- Research Atlas fresh rerun: 39/39 tests passed across release validation; all 18 flagships rerun and manuscripts recompiled.
- CRS selected fresh result: OOD task accuracy `0.886481`, concept-probe accuracy `0.499259`, erasure `0.984296`.
- Preprint consolidation order places CRS #3 and ESNF #9.
- The same release record explicitly keeps archival conference/journal submission on HOLD until project-specific external gates are met.

ESNF has additional specific audit failures: controlled fields rather than real/community datasets, missing dense neural-field/uniform refinement baselines, incomplete required ablations, incomplete robustness, and uncertain current source/manuscript alignment.

Decision: **CRS remains the only one worth advancing first, but not as a forced Aug-29 archival submission until its external gates close. ESNF is deferred.**

## PST correction

Older conference ledgers described PST as the strongest Sep-20 package and referenced 15 runs over Paul15, Pancreas, and Dentate Gyrus. The canonical recovery report is stricter and takes precedence.

Verified recovered execution is synthetic-controlled:

- 7 tests passed;
- compact seeds 11/29/47;
- 21 runs across main + six variants;
- 24 evidence manifests with retained hash validation in the isolated handoff;
- main calibrated PST: AUROC `0.9744 ± 0.0115`, AUPRC `0.9101 ± 0.0320`;
- calibration is a negative result (raw is stronger on AUROC/AUPRC/ECE/Brier);
- raw-expression logistic baseline mean AUROC `0.9968`, stronger than the PST variant;
- family-A → family-B fixed transfer AUROC `0.6577`, rejecting domain-invariance inference.

Historical Paul15/Pancreas/Dentate values remain quarantined until exact raw logs and dataset provenance are recovered.

Therefore no current paper may truthfully claim the historical real-data results as verified.

## Next execution order

1. LAM-JEPA: owner metadata → independent review → final upload/receipt.
2. CRS: recover exact current source/evidence package and test whether natural-data/baseline gates can close without changing the frozen question.
3. PST: search/recover historical real-data evidence. If unrecoverable, define a new external-data protocol or reframe to a negative controlled study.
4. NPMS: source migration before manuscript polish.
5. ESNF: defer until genuine neural-field + real reaction-diffusion evidence exists.

## Submission evidence

As of this freeze, no package is labelled `SUBMITTED` because no portal receipt / submission ID has been verified in the connected evidence.
