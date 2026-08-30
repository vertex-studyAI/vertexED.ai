# T2424-0027 Manuscript Claim Audit

Status: **PASS FOR TWO-STAGE CLAIM BOUNDARY / RELEASE METADATA STILL OPEN**

Audited artifact: `MANUSCRIPT.md` on `paper/t2424-0027-evidence-conversion-20260829` after integration of the frozen v3 real-encoder outcome.

## High-risk claim classes reviewed

### Sapir–Whorf / linguistic-relativity interpretation

PASS. The manuscript explicitly states that the project name is an identifier rather than the scientific claim and excludes linguistic relativity, cultural cognition, and human-language causal conclusions from both stages.

### Synthetic-to-real evidence leakage

PASS. The synthetic verdict remains `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS` and is described only as a controlled mechanics validation. The manuscript does not carry that PASS forward as evidence that a learned multilingual encoder must satisfy the real-model gate.

### Real multilingual encoder behavior

PASS. The manuscript now reports the v3 real-model outcome directly and narrowly: one pinned `paraphrase-multilingual-MiniLM-L12-v2` revision, one pinned MASSIVE revision, three locales, a frozen 50-intent universe, nearest-centroid probes, and frozen controls. It does not generalize the result to multilingual encoders as a class.

### Negative-result integrity

PASS. The manuscript retains `FAIL_PREDECLARED_REAL_ENCODER_GATE`. It does not relabel the v3 result as a PASS despite favorable transform-specific metrics. It identifies the decisive frozen failure: mean raw language accuracy `0.492355...` is below the preregistered `0.75` minimum, and `0/5` seeds pass versus `4/5` required.

### Falsifier interpretation

PASS. The manuscript distinguishes failure of the complete success gate from mechanistic falsification. It reports that the retained quantitative falsifiers for effect retention below 30%, intent drop above 5%, and generic-control equivalence are false, while provenance and the dataset-only feasibility gate passed.

### Centering mechanism attribution

PASS. The synthetic stage uses global centering only to establish that generic centering is insufficient in the known construction. The real stage reports the large specificity margin only for the frozen diagnostic and control family. Neither stage establishes a universal mechanism.

### Threshold integrity

PASS. No threshold is moved after outcome access. Synthetic thresholds and v3 real-model thresholds remain separate and are reported with their original verdicts. Descriptive confidence intervals are not substituted for the frozen decision gates.

### Reproducibility scope

PASS. Synthetic independent reproduction remains tied to the retained synthetic output SHA-256. The v3 real-model outcome is tied to the authorized preregistration commit, execution commit, workflow run, Actions artifact ID, and artifact ZIP SHA-256. Neither is equated with external validation of a broad scientific theory.

### Publication novelty

PASS. The manuscript does not claim novelty for language centering itself and acknowledges prior work on language neutrality and per-language centering in real multilingual representations.

## Phrases allowed only in bounded context

- “95.83% normalized excess leakage reduction” refers only to the deterministic synthetic construction.
- “83.50% mean normalized language-leakage reduction” refers only to the frozen v3 real-encoder diagnostic.
- “87.13% effect retention” means retention relative to the synthetic parent normalization under the frozen v3 definition; it is not a universal effect-size claim.
- “preserved intent” refers to the frozen nearest-centroid intent probe, whose mean accuracy changes from `0.720533` to `0.723022`; it is not a claim about semantic quality generally.
- “FAIL” for v3 refers to `FAIL_PREDECLARED_REAL_ENCODER_GATE`; it does not mean that every preregistered falsifier fired.
- “PASS” for Stage A refers only to `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`.
- “independently reproduced” refers only to the retained synthetic output unless a separately labeled unchanged-protocol v3 reproduction is later performed.

## Release blockers outside claim language

This audit does not resolve:

- durable archival of the complete v3 artifact payload beyond Actions retention;
- a figure/table source generated directly from retained v3 metrics;
- final authorship and contribution assignment;
- repository/release licensing;
- final code/data release statement;
- clean PDF compilation and visual inspection.

## Verdict

`MANUSCRIPT.md` passes the current two-stage sentence-level claim-boundary audit. The synthetic PASS and v3 real-encoder negative are correctly separated. Any successor protocol must use a new protocol identity if it changes the question, threshold, seed gate, model, dataset, probe, transform, or control family after v3 outcome access.
