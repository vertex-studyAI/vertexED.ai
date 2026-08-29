# T2424-0027-R1 Real Multilingual Encoder Successor Protocol

Status: **DRAFT PREREGISTRATION / DO NOT ACCESS OUTCOMES YET**

This protocol defines a new scientific line. It does not inherit the synthetic T2424-0027 PASS verdict.

## Research question

For a frozen pretrained multilingual encoder, can a language-specific centering transform fit on training representations reduce held-out language-label predictability while preserving cross-lingual semantic alignment better than matched control transforms?

## Candidate encoder

Primary candidate: `FacebookAI/xlm-roberta-base`.

Execution is blocked until the exact immutable model revision, tokenizer files, model file digest, Transformers version, Torch version, and extraction code commit are frozen in this document. Loading `main` without a recorded revision is not allowed for the confirmatory run.

## Candidate data design

Use aligned multilingual sentences where the same content exists in each selected language. The first confirmatory language set should remain `en`, `es`, and `fr` to match the synthetic diagnostic while limiting degrees of freedom.

Execution is blocked until the exact public dataset, dataset revision, license, selected split, sentence IDs, language codes, and exclusion rules are frozen. Dataset selection must occur before any target-model outcome is inspected.

## Representation extraction

Before execution, freeze all of the following:

- model revision;
- tokenizer revision;
- layers evaluated;
- token-to-sentence pooling rule;
- maximum sequence length and truncation rule;
- normalization applied before probing;
- batch size and numerical dtype;
- deterministic runtime settings.

No layer may be selected because it produced a favorable confirmatory outcome. If multiple layers are retained, the primary layer must be predeclared and the rest labelled exploratory.

## Split discipline

Partition by aligned semantic item, not by individual language sentence, so translations of the same semantic item cannot leak across train and test partitions.

A fixed split manifest must be written before probe fitting. Language centroids and any learned probe parameters are fit on training records only. Test labels may be used only for final evaluation after the protocol hash is frozen.

## Conditions

### C0: raw representation

No centering transform.

### C1: language-specific centering

Subtract the training-set centroid of the record's own language.

### C2: global-centering negative control

Subtract one global training centroid from every representation.

### C3: matched random-direction control

Subtract a fixed training-derived direction or offset with norm matched to the language-specific removal operation but not chosen using test labels. The exact construction must be frozen before outcome access.

### C4: optional dimensionality-preserving projection control

If a projection method is introduced, its dimensionality and fitting rule must be matched and frozen. This condition is exploratory unless preregistered fully before the confirmatory run.

## Primary language-leakage metric

Primary metric: held-out language-label accuracy from a predeclared probe, reported relative to chance.

The probe family must be frozen before execution. Recommended confirmatory choice: multinomial logistic regression with fixed regularization and no test-set hyperparameter selection. A nearest-centroid language probe may be retained as a secondary continuity check with the synthetic precursor.

Define normalized excess language-leakage reduction as:

`1 - (A_centered - A_chance) / (A_raw - A_chance)`

when `A_raw > A_chance`. Any edge-case behavior must be specified in code before execution.

## Primary preservation metric

Primary preservation metric: cross-lingual aligned-sentence retrieval Recall@1 on the held-out split using cosine similarity between sentence representations.

The retrieval direction, candidate pool, tie rule, and whether scores are averaged over language pairs must be frozen before execution.

Secondary preservation metrics may include paired-vs-unpaired cosine margin and Recall@5, but they cannot replace the primary metric after outcome access.

## Confirmatory gates

These numbers are placeholders until justified and frozen before any confirmatory target-model result is accessed. The final protocol must replace every `TBD` below with an exact value or mark the study exploratory.

1. raw language probe must exceed chance by at least `TBD` absolute points;
2. C1 normalized excess language-leakage reduction must be at least `TBD`;
3. C1 Recall@1 degradation from C0 must be no worse than `TBD` absolute points;
4. C1 must reduce excess language predictability more than C2 by at least `TBD`;
5. C1 must outperform the matched C3 control on the predeclared joint criterion;
6. all headline comparisons must include uncertainty from a frozen resampling or repeated-split procedure.

Until these values are frozen, this protocol is **not execution-authorized**.

## Falsifiers

The proposed real-model story is weakened or falsified if any of the following occurs:

- raw representations contain too little detectable language information for the test to be informative;
- language-specific centering fails to reduce held-out language leakage beyond global/matched controls;
- language leakage falls only by destroying semantic retrieval;
- a matched nonspecific control produces the same joint leakage/preservation tradeoff;
- the result depends on post-hoc layer selection;
- effects are unstable across the frozen uncertainty procedure.

Negative and mixed outcomes must be retained.

## Compute and stop rule

The confirmatory run should be CPU/GPU bounded in advance. Do not expand the model set, language set, layers, probes, or controls after seeing a failed primary outcome in order to obtain a PASS. Any expansion is a new protocol version.

## Required pre-execution artifacts

- [ ] exact encoder revision and file digests
- [ ] exact dataset revision/license/split IDs
- [ ] extraction environment lock
- [ ] deterministic split manifest
- [ ] primary layer and pooling rule
- [ ] probe implementation and fixed hyperparameters
- [ ] exact confirmatory thresholds replacing all `TBD`s
- [ ] uncertainty procedure
- [ ] controls C0–C3 implemented and unit-tested
- [ ] protocol SHA-256 written before target outcomes
- [ ] explicit execution authorization after all items above are frozen

## Claim boundary

Even a successful R1 study would support only an empirical representation-level result for the frozen encoder/data/probe setup. It would not establish the Sapir–Whorf hypothesis, human cognitive effects, semantic universals, cultural causation, or general language invariance across models.
