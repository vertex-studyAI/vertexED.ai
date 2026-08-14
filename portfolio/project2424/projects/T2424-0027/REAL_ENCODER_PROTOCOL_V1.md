# T2424-0027 — REAL MULTILINGUAL ENCODER PROTOCOL v1

**Protocol date:** 2026-08-14  
**Status:** `FROZEN DESIGN / EXECUTION NOT YET PERFORMED`  
**Parent synthetic result:** `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`; parent evidence is immutable and does not transfer automatically to this study.

## 1. Scientific question

> In a fixed pretrained multilingual encoder, does subtracting a language-specific training centroid reduce probe-accessible language identity while preserving task information, and is any effect stronger than simple matched controls?

This is a representation-diagnostic question. It does **not** test linguistic relativity, semantic universals, translation quality, fairness, or downstream application quality.

## 2. Hypotheses

### H1 — mechanics transfer

Language-centroid subtraction reduces **excess linear language-probe accuracy above chance** by at least 50% relative to the raw representation while reducing held-out NLI linear-probe accuracy by no more than 2.0 absolute percentage points.

### H2 — nontriviality against simple controls

The candidate's normalized excess language-leakage reduction exceeds global centering and matched random controls by at least 0.15 absolute while satisfying the same NLI-retention rule.

### H3 — uniqueness boundary

A stronger language-subspace removal baseline may equal or beat the candidate. If it does, the result may support the existence of removable language geometry but **not** a unique centroid-subtraction mechanism.

## 3. Frozen encoder

**Model repository:** `FacebookAI/xlm-roberta-base`  
**Immutable model revision:** `f73dcc42e4adc2999323f97b2ddea251c6b9fcea`  
**Architecture:** XLM-RoBERTa base  
**Model use:** frozen feature extraction only; no model fine-tuning.

The selected revision is immutable and predates this experiment. Do not switch to a later revision after seeing results.

### Representation extraction

- tokenizer/model loaded from the same immutable revision;
- encode `(premise, hypothesis)` as a sentence pair using the model tokenizer;
- maximum sequence length: `256` tokens;
- truncation: tokenizer pair truncation, fixed before inference;
- padding: batch-local padding;
- hidden layer: **final encoder hidden layer only**; no layer sweep;
- pooling: arithmetic mean over non-padding token hidden states, including model special tokens as produced by the tokenizer;
- representation dtype for stored features: float32;
- model in evaluation mode; dropout disabled;
- no gradient calculation.

If the immutable revision cannot be loaded with the execution environment, record `BLOCKED_MODEL_REVISION` rather than silently using `main`.

## 4. Frozen dataset

**Dataset repository:** `facebook/xnli`  
**Frozen repository revision for this protocol:** `b8dd5d7` (the existing immutable dataset-repository commit prefix containing the Parquet conversion; execution must resolve and record the full commit SHA before any row use).  
**Configuration:** `all_languages`  
**Task label:** three-way NLI label supplied by XNLI.

### Languages

Use exactly six languages:

`en, de, es, fr, hi, zh`

Rationale is fixed before execution: this set spans multiple language families and includes both Latin and non-Latin scripts while keeping a CPU/Mac-scale study bounded. Do not replace a difficult language after observing results.

### Parallel-example requirement

Use only examples for which the same underlying XNLI item supplies all six selected language translations of both premise and hypothesis. This keeps semantic/task content paired across languages and reduces content-selection confounding in the language probe.

A source example that lacks any selected translation is excluded by this feature-only rule and logged.

## 5. Frozen row selection

Do not choose examples by model output or probe performance.

### Development source

Official XNLI `validation` split.

1. assign each underlying example its original dataset index `i`;
2. compute SHA-256 of UTF-8 string `T2424-0027-real-v1-validation:{i}`;
3. sort eligible underlying examples by the hexadecimal digest ascending;
4. select the first **600 underlying examples**;
5. include all six language translations for each selected example, giving up to 3,600 encoded sentence pairs.

### Confirmatory source

Official XNLI `test` split, **locked until the development gate in Section 12 is evaluated**.

If development passes, select 600 underlying test examples using the same procedure with salt:

`T2424-0027-real-v1-test:{i}`.

Do not inspect test representations/probes before the development verdict is written.

## 6. Development partitions

Partition the 600 selected validation underlying examples by the same group-level rule so translations of one semantic example never cross partitions:

- centroid/probe train: first 360 examples after the frozen hash ordering;
- probe calibration: next 120;
- development evaluation: final 120.

All six translations of an underlying example stay in the same partition.

No hyperparameter is selected on the development-evaluation partition.

## 7. Candidate transform

### M1 — language-centroid subtraction

For each language `l`, using **centroid/probe-train examples only**, compute

`c_l = mean(z_i | language_i = l)`.

For any representation with known dataset language metadata `l`, transform

`z'_i = z_i - c_l`.

The language label is metadata supplied by the benchmark; the method is therefore a diagnostic, not a language-agnostic deployment method.

Do not recompute centroids on calibration, development evaluation, or confirmatory test examples.

## 8. Controls

All controls use only train-partition statistics.

### C0 — raw

No intervention.

### C1 — global centering

Subtract one global train representation centroid from every example.

### C2 — shuffled-language centroid subtraction

Use the same six learned language centroids but apply them under one fixed derangement of the language labels:

`en→de, de→es, es→fr, fr→hi, hi→zh, zh→en`.

This matches the operation/norm family while breaking the correct language assignment.

### C3 — random matched-norm language vectors

For each language, generate one deterministic isotropic random vector using NumPy PCG64 seed `27027 + language_index`, normalize it, scale it to `||c_l||_2`, and subtract it from examples of that language.

This controls for language-dependent translation magnitude without using the empirical centroid direction.

### C4 — between-language centroid-subspace projection

Using the six training centroids, form centered centroid differences

`d_l = c_l - mean_l(c_l)`.

Compute their SVD on training data only and remove the full nonzero between-language centroid subspace, rank at most 5:

`z'_i = z_i - U U^T z_i`.

This is a **dangerous stronger baseline**. It does not require test-language labels after `U` is fitted.

If C4 matches or beats M1 while preserving NLI signal, M1 receives no unique mechanism claim.

### C5 — random matched-rank subspace projection

Generate a deterministic random orthonormal subspace of the same rank as C4 using PCG64 seed `2702701` and project it out identically. This controls for generic dimensionality removal.

## 9. Probe family

Use the exact same linear probe pipeline for every representation arm.

### Language probe

- target: six-way selected language ID;
- input: transformed or raw frozen representation;
- classifier: scikit-learn multinomial-capable `LogisticRegression` with `C=1.0`, L2 penalty, `max_iter=2000`, fixed `random_state=27027` where applicable;
- fit on centroid/probe-train partition;
- calibration partition is used only to verify convergence/data plumbing, **not** tune C/model family;
- primary score: accuracy on development evaluation.

Chance reference: `1/6 = 0.166666...`.

### NLI task probe

Same classifier settings, target = XNLI three-way NLI label.

Because six translated representations of the same semantic example share the same NLI label, report both:

1. micro accuracy over all language-example rows;
2. macro mean of per-language NLI accuracy.

Primary task-retention metric is macro per-language accuracy.

Chance reference (`1/3`) is descriptive only; empirical label balance must also be reported.

## 10. Metrics

For each arm report:

- language-probe accuracy;
- language excess over chance;
- normalized excess language-leakage reduction relative to raw:

`R_lang = (excess_raw - excess_arm) / max(excess_raw, 1e-12)`;

- NLI micro accuracy;
- NLI macro per-language accuracy;
- absolute NLI macro change vs raw;
- per-language NLI accuracy;
- representation mean norm;
- total variance / trace of covariance;
- effective rank using normalized covariance eigenvalues with a fixed numerical tolerance;
- fraction of variance removed by intervention;
- transform rank where applicable.

The geometry diagnostics detect trivial collapse or destructive subspace removal.

## 11. Uncertainty and seed policy

The encoder and row set are deterministic. Probe fitting is nominally deterministic under fixed solver/configuration; preserve any observed nondeterminism rather than rerunning for a preferred result.

For uncertainty over examples:

- use a **group bootstrap over underlying semantic example IDs**, not independent language rows;
- 10,000 bootstrap resamples;
- NumPy PCG64 seed `2702702`;
- recompute evaluation metrics from fixed fitted probes for each resample;
- report percentile 95% intervals for primary accuracy differences and `R_lang`.

This bootstrap measures evaluation-example uncertainty conditional on the fitted encoder/probes; it is not a claim about all languages/models.

No p-value is required for promotion.

## 12. Frozen development gates

### G0 — benchmark validity

Before interpreting mechanism results:

- raw language-probe accuracy must be at least `0.50` (substantially above six-way chance);
- raw NLI macro accuracy must be at least `0.40` (above three-way chance by a practical margin);
- no representation arm may lose more than 50% of raw total variance unless explicitly classified as collapse/destructive.

If G0 fails, verdict is `INVALID_OR_UNINFORMATIVE_REAL_ENCODER_DIAGNOSTIC`; do not open test.

### G1 — mechanics transfer for M1

M1 passes only if all are true on development evaluation:

1. `R_lang >= 0.50`;
2. M1 NLI macro accuracy is no more than `0.020` absolute below raw;
3. the 95% group-bootstrap interval for `R_lang` has lower bound `> 0`;
4. representation-collapse diagnostics do not trigger G0.

### G2 — nontriviality vs simple controls

M1 receives a **candidate-specific** advantage only if:

- `R_lang(M1) - max(R_lang(C1), R_lang(C2), R_lang(C3), R_lang(C5)) >= 0.15`;
- M1 NLI retention is not worse than the best of those controls by more than `0.010` absolute.

### G3 — uniqueness vs stronger centroid-subspace baseline

C4 is treated separately. If C4 matches/exceeds M1 on leakage reduction with equal/better NLI retention, classify:

`REAL_LANGUAGE_GEOMETRY_SUPPORTED / CENTROID_SUBTRACTION_NOT_UNIQUE`.

This does **not** block a useful empirical observation, but it blocks a unique M1 mechanism claim.

## 13. Confirmatory test rule

Open the 600-example official XNLI test subset **only if G0 and G1 pass**.

Before test inference:

- commit the development results and gate verdict;
- do not change languages, model revision, layer, pooling, row-selection algorithm, transforms, probes, thresholds, or bootstrap plan;
- do not refit centroids/probes using test data.

For confirmatory evaluation, fit centroids/probes once using all 600 selected validation examples (same six translations, same fixed method settings), then evaluate on the frozen selected 600 XNLI test underlying examples.

A confirmatory mechanics-transfer claim requires G0/G1 analogues to hold on test. G2/G3 remain contribution-boundary analyses.

If development fails G0 or G1, the test split stays locked for this hypothesis line.

## 14. Falsifiers

The real-encoder relevance hypothesis is defeated if:

- raw representations do not carry enough linearly probe-accessible language signal for the diagnostic to be meaningful;
- M1 reduces less than 50% of excess language leakage;
- M1 loses more than 2 percentage points NLI macro accuracy;
- apparent leakage reduction is explained by representation collapse;
- the result is no stronger than simple matched controls for any claimed candidate-specific mechanism;
- development passes but the frozen confirmatory test result fails the same mechanics-transfer gate.

All negative outcomes are retained.

## 15. Claim taxonomy

### If G0 fails

Claim only: the selected representation/probe setup was uninformative for this diagnostic.

### If G0 passes and G1 fails

Claim: synthetic centroid-removal mechanics did **not** transfer under this frozen real-encoder protocol.

### If G1 passes but G2 fails

Claim: language information was removable while task signal was retained, but the candidate was not better than simple matched controls.

### If G1/G2 pass but C4 is as good or better

Claim: real language-associated geometry is removable under this benchmark, but centroid subtraction is not uniquely supported.

### Only if G1/G2 pass and M1 remains competitive with C4

A bounded candidate-specific empirical contribution may be investigated further. No linguistic-relativity or broad semantic claim follows.

## 16. Compute class

Expected bounded compute:

- one frozen XLM-R base model;
- at most 3,600 development sentence pairs before promotion;
- at most 3,600 confirmatory sentence pairs only after development pass;
- linear probes and low-rank geometry on stored 768-dimensional embeddings.

This is intentionally a **single-model CPU/MPS-scale study**, not an encoder sweep.

## 17. Reproducibility contract

Retain:

- resolved full model commit SHA;
- model-weight file SHA-256 when downloadable metadata exposes it;
- resolved full dataset revision;
- exact Parquet/source shard hashes or downloaded dataset cache fingerprints;
- tokenizer/config hashes;
- selected underlying example indices and their selection digests;
- software versions;
- hardware/device;
- raw embeddings or a checksum-addressed compressed representation artifact if storage permits;
- every probe coefficient/intercept;
- centroids/subspaces/random-control seeds;
- raw per-example predictions;
- processed metrics and bootstrap samples/summary;
- exact command;
- runtime/memory;
- artifact hashes;
- source commit containing this protocol and implementation.

## 18. Execution stop rule

Do not:

- sweep encoder models/layers/language subsets and report the best;
- tune thresholds after viewing development evaluation;
- inspect XNLI test for this line unless G0 and G1 pass;
- select probe hyperparameters from test performance;
- drop a language after observing a weak result;
- call language-probe suppression semantic invariance;
- convert a negative real-encoder result into a new positive hypothesis without a new versioned protocol.

**Current status:** protocol frozen; no result exists yet.
