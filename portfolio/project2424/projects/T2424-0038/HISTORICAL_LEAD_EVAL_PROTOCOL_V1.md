# Obscured Records Agent — Historical Lead Evaluation Protocol v1

**Protocol ID:** `OBSCURED-HIST-EVAL-001`  
**State:** pre-outcome freeze; evaluation not authorized  
**Project:** T2424-0038 — Obscured Records Agent

## 1. Question

On a retrospectively selected, label-blinded set of historical editorial leads, does the current deterministic evidence-gated triage rule improve reporting-readiness prioritization over simple transparent baselines without increasing unsafe false promotions, especially for high-risk claims?

This protocol evaluates the existing frozen heuristic. It does not authorize changing weights, blocker thresholds, publisher-independence logic, freshness half-life, or label definitions after outcomes are revealed.

## 2. Claim boundary

A passing evaluation may support only a bounded statement about retrospective triage agreement/prioritization on the frozen historical set. It does not establish factual truth, legal or defamation safety, autonomous journalism, causal newsroom productivity gains, prospective generalization, or replacement of editorial judgment.

## 3. Data ownership and privacy

The evaluation corpus must be assembled from leads the project is authorized to use. Before any repository or evaluator receives the frozen corpus:

- remove private reporter/source contact details, credentials, unpublished personal data, and unnecessary free-text identifiers;
- use opaque `lead_id` values in the evaluation package;
- retain source-level features only when their use is permitted and required by the current algorithm;
- do not commit confidential source material or raw private newsroom records to this repository;
- store the canonical corpus and labels outside the public source tree when required by confidentiality.

A machine-readable manifest may contain hashes and counts without containing protected source content.

## 4. Frozen inclusion rule

A data steward who does not tune the scoring rule selects a consecutive historical time window and records it before labels are exposed to the evaluator.

Eligible leads must:

1. have been created before this protocol was frozen;
2. have enough contemporaneous structured information to reconstruct the fields accepted by `validateLead()` without inventing evidence after the fact;
3. have a retained editor decision or permit independent retrospective labeling from evidence that existed at the decision time;
4. not be synthetic examples or leads created specifically to test this tool;
5. not duplicate the same underlying claim unless the duplicate relationship is explicitly grouped in the manifest.

The data manifest must pin the exact eligible set and any exclusions with reason codes. Exclusions made after labels or tool outputs are inspected invalidate the frozen evaluation.

## 5. Labeling

The primary binary label is:

- `REPORTABLE`: sufficient to move into deeper reporting under the historical/editorial context;
- `HOLD`: requires further verification before that transition.

Labels are not factual-truth labels and do not mean a story should be published.

Preferred labeling procedure:

- two editors independently label each lead while blinded to candidate-tool score, candidate decision, baseline outputs, and rank;
- disagreements are resolved by a third adjudicator or a predeclared consensus procedure;
- the label manifest records agreement statistics and adjudication counts;
- if only one retained historical decision exists, mark the label provenance accordingly and do not describe it as independently blinded consensus.

The evaluator must not receive label values until the corpus manifest, code revision, baseline definitions, metrics, and subgroup definitions are frozen.

## 6. Candidate system

The candidate is the current deterministic implementation at the repository revision frozen in the execution manifest:

- `scoreLead()` / `rankLeads()` from `src/core.mjs`;
- default weights exactly as present at that revision;
- current hard blockers exactly as present at that revision;
- freshness half-life exactly as present at that revision.

No post-label tuning is permitted in protocol v1.

## 7. Baselines

All baselines consume the same frozen structured lead features and must be implemented before labels are revealed.

### B0 — Recency only

Rank by ascending `ageHours`, tie-breaking by opaque `lead_id`. For binary readiness, classify every lead as `REPORTABLE`; this intentionally exposes the safety cost of an unconstrained freshness-only queue.

### B1 — Mean evidence only

Rank by descending contemporaneous mean source `evidence`, then by `lead_id`. Binary readiness uses the already-frozen minimum mean-evidence threshold of `0.45` and ignores publisher independence, primary-source and high-risk corroboration rules.

### B2 — Hard blockers only

Use the candidate's frozen `reportingBlockers()` decision but rank within each decision class by `lead_id`, removing the weighted score. This isolates the contribution of the blocker layer from the weighted prioritization layer.

### Candidate — Full deterministic triage

Use the unmodified current `rankLeads()` decision ordering and score.

No learned baseline is required for this first bounded validation. A learned model would introduce a separate training/validation protocol and must not be quietly fitted on the held-out historical set.

## 8. Primary metrics

The primary safety metric is **false-promotion rate**:

`FP / (FP + TN)` where `REPORTABLE_CANDIDATE` is the positive prediction and editor `HOLD` is the negative label.

Report it overall and for the frozen `risk >= 0.7` subgroup.

The primary usefulness metric is **balanced accuracy** for `REPORTABLE` versus `HOLD`.

The candidate passes the bounded v1 gate only if, relative to B2 hard-blockers-only:

1. high-risk false-promotion rate is no worse by more than an absolute 0.02;
2. overall false-promotion rate is no worse by more than an absolute 0.02; and
3. balanced accuracy improves by at least an absolute 0.03 **or** top-10 precision improves by at least an absolute 0.05.

These gates are intentionally conservative and must not be modified after results are viewed. If the frozen corpus has fewer than 25 high-risk negative-label examples, the high-risk false-promotion comparison is descriptive only and cannot satisfy a strong safety-generalization claim.

## 9. Secondary metrics

Report without using them to rescue a failed primary gate:

- precision, recall and F1 for `REPORTABLE`;
- specificity for `HOLD`;
- top-5 and top-10 precision when sample size permits;
- decision coverage: fraction classified `REPORTABLE_CANDIDATE`;
- false-hold rate;
- subgroup metrics by frozen risk band and source-count band;
- inter-editor agreement and adjudication rate.

Do not convert the heuristic score into a probability or claim calibration unless a separate calibration procedure is preregistered on a disjoint development set.

## 10. Uncertainty

Report raw counts and point estimates. When the corpus is large enough, add a fixed-seed nonparametric bootstrap over grouped lead/claim units for 95% intervals. The bootstrap seed, replicate count, grouping key, and implementation hash must be frozen before label access.

No significance fishing, repeated threshold search, or selective subgroup omission is permitted.

## 11. Error analysis

After the primary table is frozen, manually categorize every candidate false promotion and a deterministic sample of false holds using predeclared categories:

- publisher-independence approximation failure;
- primary-source coverage mismatch;
- supplied evidence-score mismatch;
- freshness effect;
- novelty/impact overweighting;
- risk-penalty insufficiency;
- label ambiguity/editor disagreement;
- missing structured feature;
- other, with written rationale.

Error analysis may motivate a future protocol version but cannot retroactively alter v1 outcomes.

## 12. Required freeze artifacts before evaluation

The following must be non-null and immutable before `evaluation_authorized` can become `true`:

- canonical data-manifest SHA-256;
- blinded label-manifest SHA-256 or sealed-label package identity;
- exact candidate source Git revision/blob identity;
- baseline implementation hashes;
- time-window and selection-rule record;
- editor-blinding/label-provenance record;
- publisher-independence review record;
- exact Node/runtime environment lock;
- evaluation script hash;
- bootstrap specification if intervals will be reported.

## 13. Stop / failure rules

Keep the result negative or inconclusive if:

- candidate safety gates fail;
- labels cannot be reconstructed without post-hoc information leakage;
- publisher independence cannot be defended for the frozen set;
- corpus selection changes after outputs are viewed;
- protected source material would need to be exposed to run the evaluation;
- label provenance is too weak for the intended claim;
- any required pre-outcome hash cannot be established.

Do not retune the existing 0.45 evidence threshold, risk threshold, corroboration counts, weights, or half-life on the same held-out set after a failure.

## 14. Next execution step

Create and hash the de-identified corpus manifest and sealed/blinded label package, implement B0/B1/B2 plus a deterministic evaluator, freeze the runtime and source identities, run the preflight, and only then explicitly authorize one protocol-v1 evaluation.
