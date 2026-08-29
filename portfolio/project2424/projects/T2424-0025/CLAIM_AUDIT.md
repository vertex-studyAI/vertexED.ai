# T2424-0025 Manuscript Claim Audit

Status: **PASS FOR EVIDENCE BOUNDARY / RELEASE METADATA STILL OPEN**

Audited artifact: `MANUSCRIPT.md` on `paper/t2424-0025-preprint-closure-20260829`.

## High-risk claim classes reviewed

### Transformer / learned-memory language

PASS. The manuscript explicitly states that the frozen precursor has no learned Transformer or learned-memory controller and does not present the robust-readout result as evidence for those architectures.

### Unique non-Gaussian mechanism attribution

PASS. The manuscript prominently reports the 0% contamination control and states that the roughly 49% median advantage in that condition prevents unique attribution of the overall effect to Cauchy contamination or a specifically non-Gaussian mechanism.

### General superiority language

PASS. The supported conclusion is restricted to the frozen synthetic weighted-aggregation procedure. The manuscript does not claim universal superiority of weighted median, trimmed mean, Huber readout, or robust statistics across datasets or architectures.

### Statistical significance

PASS. The manuscript treats the retained summaries descriptively and explicitly states that the contamination sweep was not a preregistered confirmatory test with a predeclared significance procedure. It does not convert descriptive across-seed values into an unsupported significance claim.

### Real-data / forecasting / sequence-model claims

PASS. Related work involving forecasting, learned aggregation, memory, and robust attention is presented as adjacent context. The manuscript states that T2424-0025 does not perform those evaluations.

### Reproducibility wording

PASS. Reproducibility claims are tied to the frozen precursor, exact source lineage, retained commands, output digests, and environment. Reproduction is not equated with external validation or transferability.

### Negative-result preservation

PASS. The clean-control finding is in the abstract, results, discussion, limitations, and conclusion. It is not hidden or reframed as support for the original narrow mechanism story.

## Phrases that remain allowed only in bounded context

- “95.42% relative reduction” is permitted only for the retained 30-seed heavy-tail screen.
- “49% relative reduction” is permitted only for the retained zero-contamination comparison and is treated as a mechanism confound.
- “robust readouts substantially outperform” is permitted only when immediately scoped to the frozen synthetic procedure.
- “reproduced” is permitted only for the retained precursor outputs and must not be read as independent external validation.

## Release blockers outside claim language

This audit does not resolve:

- final authorship and contribution assignment;
- repository/release licensing;
- final code/data release statements;
- clean PDF compilation and visual inspection.

## Verdict

`MANUSCRIPT.md` passes the current sentence-level scientific claim-boundary audit. Do not broaden the abstract, title, captions, or conclusion during PDF production without re-running this audit.
