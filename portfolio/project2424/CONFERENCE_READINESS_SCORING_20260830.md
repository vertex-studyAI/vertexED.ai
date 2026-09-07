# Project 2424 Conference Readiness Scoring

Score only from retained evidence. Unknown or blocked fields receive zero, never guessed credit.

| Dimension | Max | Evidence required for credit |
|---|---:|---|
| Identity / provenance | 10 | Canonical identity and lineage are established without suffix inference. |
| Research question | 10 | Explicit falsifiable hypothesis / scientific question. |
| Literature / novelty | 10 | Current primary-source related-work audit and nearest-work pressure test. |
| Protocol | 10 | Material experiment choices frozen before outcome access. |
| Implementation | 10 | Runnable scientific implementation with relevant tests. |
| Baselines | 10 | Relevant/dangerous comparators are implemented or executed as applicable. |
| Experimental evidence | 15 | Retained outputs tied to exact source/protocol. |
| Statistics / reproducibility | 10 | Appropriate seed-level/uncertainty evidence and reproduction provenance where applicable. |
| Manuscript | 10 | Evidence-bounded full manuscript, not placeholder prose. |
| Figures / tables | 3 | Derived from retained machine-readable evidence with provenance. |
| Release hygiene | 2 | Reproduction/release metadata, immutable references and audit trail. |

## Bands

- 0–29: `CONCEPT`
- 30–49: `RESEARCH_SPEC`
- 50–64: `EXPERIMENT_READY`
- 65–79: `PAPER_CANDIDATE`
- 80–89: `PREPRINT_CANDIDATE`
- 90–100: `SUBMISSION_CANDIDATE`

A score is not permission to submit. `CONFERENCE_READY_CANDIDATE` additionally requires the release gate to close: authorship, license/release metadata, clean rendered PDF, visual audit, venue fit/format, and sentence-level claim review.

## Hard caps

These caps prevent polished documentation from outrunning science.

- Identity unresolved: max 29.
- No frozen protocol and no retained experiment: max 49.
- No real retained experimental evidence: max 64.
- No manuscript: max 79.
- Release metadata / PDF audit unresolved: max 89.

Negative, mixed, or falsified results are not automatically penalized. A rigorous negative result may score higher than a weak positive result.