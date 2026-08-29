# T2424-0027 Manuscript Claim Audit

Status: **PASS FOR SYNTHETIC CLAIM BOUNDARY / RELEASE METADATA STILL OPEN**

Audited artifact: `MANUSCRIPT.md` on `paper/t2424-0027-evidence-conversion-20260829`.

## High-risk claim classes reviewed

### Sapir–Whorf / linguistic-relativity interpretation

PASS. The manuscript explicitly states that the project name is an identifier rather than the scientific claim and repeatedly excludes linguistic relativity, cultural cognition, and human-language causal conclusions.

### Real multilingual encoder behavior

PASS. The manuscript states that the frozen construction has no natural-language corpus, tokenizer, pretrained encoder, learned representation, or model weights. mBERT and LaBSE appear only as related-work contrasts.

### Language-invariant / semantic-universal claims

PASS. The manuscript restricts its conclusion to the deterministic synthetic factor geometry and does not claim semantic universals, language-invariant learning, translation quality, or zero-shot transfer.

### Centering mechanism attribution

PASS. The global-centering negative control is reported in the main result and used to establish only that generic centering is insufficient in the known synthetic construction. The manuscript does not infer that language-centroid removal will work in a real encoder.

### Threshold integrity

PASS. The manuscript reports the predeclared 0.90 normalized leakage-reduction gate, the retained value `0.9583333333`, and the centered language accuracy `0.361111...` relative to chance `0.333333...`. It explicitly notes that exact chance was never the preregistered threshold.

### Reproducibility scope

PASS. Independent reproduction is tied to the synthetic package and retained SHA-256. It is not equated with external validation or research completion.

### Publication novelty

PASS. The manuscript explicitly notes that prior work has studied language neutrality and per-language centering in real multilingual representations, so novelty is not inferred from the synthetic PASS alone.

## Phrases that remain allowed only in bounded context

- “95.83% normalized excess leakage reduction” refers only to the retained deterministic synthetic construction.
- “preserving concept accuracy” refers only to the injected four-concept synthetic probe.
- “PASS” refers only to `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS` under the frozen five gates.
- “independently reproduced” refers only to reproduction of the retained synthetic output.

## Release blockers outside claim language

This audit does not resolve:

- final authorship and contribution assignment;
- repository/release licensing;
- final code/data release statement;
- clean PDF compilation and visual inspection.

## Verdict

`MANUSCRIPT.md` passes the current sentence-level claim-boundary audit. Any later real-model result must live under the separate successor protocol and must not cause the synthetic manuscript to be retroactively rewritten as external evidence.
