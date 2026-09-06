# T2424-0027 v3: Language-centroid removal in a frozen multilingual encoder - a preregistered negative primary result

**Manuscript status:** evidence-bound draft section package. This document reports only the retained T2424-0027 real-encoder v3 result. It does not alter the preregistration, thresholds, seeds, dataset, encoder, controls, or verdict.

## Abstract

We tested whether subtracting language-specific centroids from a fixed multilingual sentence representation reduces locale information while preserving intent information more specifically than generic controls. The experiment was preregistered before outcome access on a fixed subset of MASSIVE using three locales (`en-US`, `es-ES`, `fr-FR`), 50 intents, 15 examples per locale-intent cell in each frozen split, a pinned `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` encoder, and five fixed seeds (`2401`-`2405`). The primary success rule was a conjunction: mean raw locale-probe accuracy had to be at least `0.75`, mean effect retention at least `0.70`, mean intent drop at most `0.02`, mean specificity margin at least `0.15`, and at least four of five seeds had to pass. The retained execution failed that preregistered primary gate. Mean raw locale accuracy was `0.492356` (95% descriptive Student-t interval `0.480883` to `0.503828`), below the required `0.75`, and the seed-level conjunction passed on `0/5` seeds. Language-specific centering nevertheless showed descriptive reductions in locale leakage: mean normalized language-leakage reduction was `0.835020` (95% interval `0.732629` to `0.937411`), mean effect retention was `0.871325` (95% interval `0.764483` to `0.978168`), mean intent drop was `-0.002489` (95% interval `-0.005501` to `0.000524`), and mean specificity margin was `0.816864` (95% interval `0.718054` to `0.915674`). These secondary observations do not rescue the failed primary gate. We therefore report the study as a negative primary result with a narrower descriptive finding: in this frozen representation diagnostic, language-centroid removal reduced measured locale leakage while largely preserving intent structure, but the preregistered prerequisite that locale information be strongly present in the raw representation was not satisfied.

## 1. Research question and scope

The study asks a narrow representation-diagnostic question: when a fixed multilingual encoder contains measurable locale information, does subtracting the fit-split centroid for each locale reduce that information while preserving semantic intent structure more specifically than generic centering or random controls?

The scope is intentionally limited. This is a frozen-encoder diagnostic, not a claim about cognition, translation quality, linguistic relativity, universal language-invariant representations, fine-tuned models, downstream deployment, or model superiority. The experiment examines probe behavior under a fixed data/model pipeline and a preregistered set of controls.

A synthetic predecessor had produced a large locale-leakage-removal effect under its own mechanics test. The real-encoder v3 study was preregistered separately so that a weaker, null, or adverse result would remain reportable without changing the earlier experiment or moving the successor gate after outcome access.

## 2. Preregistered design

### 2.1 Data and selection

The frozen dataset source is `AmazonScience/massive` at revision `ff6bd8e4b27c3543e4f8fe2108f32bb95a6f8740`, dataset version `1.1`, under the repository-recorded CC-BY-4.0 license. The locales are exactly `en-US`, `es-ES`, and `fr-FR`. The fit split is MASSIVE `train`; the evaluation split is MASSIVE `test`.

Before encoder construction, an outcome-free feasibility census identified exactly 50 intents with at least 15 examples in every locale and both frozen splits. For each locale-intent cell, the preregistration selected exactly 15 fit and 15 evaluation examples by a deterministic SHA-256 ranking rule. The admissible intent set, sample count, locales, and split roles were frozen before v3 outcome access.

### 2.2 Encoder and probes

The encoder is `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` at immutable revision `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`, with 384-dimensional embeddings and no fine-tuning. The primary probe family is nearest-centroid Euclidean classification fitted only on the fit split.

Two labels are evaluated: intent and locale. The raw representation is compared with four preregistered transformation/control surfaces:

- **Language centering:** subtract the fit-split embedding centroid for each true locale from fit and evaluation embeddings of that locale.
- **Global centering:** subtract one global fit-split centroid.
- **Random-group centering:** assign records to three deterministic SHA-256 pseudo-groups per seed and subtract fit centroids for those groups.
- **Random-subspace removal:** remove the projection onto two deterministic Gaussian orthonormal directions per seed.

The five seeds are exactly `2401`, `2402`, `2403`, `2404`, and `2405`. Seed substitution, favorable-seed reruns, post-outcome intent selection, encoder swapping, control deletion, threshold movement, and rescue tuning were prohibited.

### 2.3 Metrics and frozen success gate

Locale chance accuracy is `1/3`. The primary derived leakage quantity is

`normalized_language_leakage_reduction = (raw_language_accuracy - transformed_language_accuracy) / (raw_language_accuracy - 1/3)`.

Effect retention compares language-centering leakage reduction with the synthetic predecessor's frozen normalized reduction of `0.9583333333333334`. Intent drop is raw intent accuracy minus language-centered intent accuracy. Specificity margin is the language-centering normalized reduction minus the strongest generic-control normalized reduction.

The preregistered primary gate required all of the following:

1. mean raw locale accuracy `>= 0.75`;
2. mean effect retention `>= 0.70`;
3. mean intent drop `<= 0.02`;
4. mean specificity margin `>= 0.15`;
5. at least `4/5` seed-level conjunction passes.

The protocol did not define a p-value-based success criterion. Post-outcome uncertainty below is descriptive and does not replace the frozen conjunction.

## 3. Results

### 3.1 Primary verdict

The frozen primary verdict is **`FAIL_PREDECLARED_REAL_ENCODER_GATE`**.

| Quantity | Retained mean | Descriptive 95% interval | Frozen primary requirement | Gate status |
|---|---:|---:|---:|---|
| Raw locale accuracy | `0.492356` | `0.480883` to `0.503828` | `>= 0.75` | **FAIL** |
| Effect retention | `0.871325` | `0.764483` to `0.978168` | `>= 0.70` | pass |
| Intent drop | `-0.002489` | `-0.005501` to `0.000524` | `<= 0.02` | pass |
| Specificity margin | `0.816864` | `0.718054` to `0.915674` | `>= 0.15` | pass |
| Seed-level conjunction | `0/5` | n/a | `>= 4/5` | **FAIL** |

The decisive failure is not a small miss on the transformation effect. It is the preregistered prerequisite that the raw representation contain strong locale-probe signal. Mean raw locale accuracy was only `0.492356`, and all five frozen seeds failed the full conjunction. The primary result is therefore negative even though several transformation-specific quantities were favorable.

### 3.2 Descriptive representation changes

Language-centered locale-probe accuracy averaged `0.359022` (95% interval `0.344503` to `0.373541`), close to the three-class chance level relative to the raw locale accuracy of `0.492356`. This corresponds to a mean normalized locale-leakage reduction of `0.835020` (95% interval `0.732629` to `0.937411`).

Intent structure was not degraded in the mean under this diagnostic. Raw intent accuracy averaged `0.720533` (95% interval `0.708624` to `0.732442`), while language-centered intent accuracy averaged `0.723022` (95% interval `0.709312` to `0.736732`). The resulting mean intent drop was `-0.002489`; negative values here indicate that the centered representation was slightly higher on the retained mean rather than lower.

The observed specificity margin was `0.816864`, while random-group centering and random-subspace removal produced mean normalized reductions of only `0.005157` and `0.008990`, respectively. The retained verdict also records that no generic control matched or exceeded the language-centering effect under the frozen definitions.

These are descriptive observations within the fixed probe pipeline. They do not convert the primary failure into a success and do not establish that locale-centroid removal improves downstream multilingual systems.

## 4. Interpretation

The experiment changes the scientific story in a useful way. The successor does not validate the strongest prospective claim because its raw representation did not meet the preregistered locale-predictability floor. A transformation can appear effective at removing a signal even when the starting signal is weaker than required for the intended confirmatory interpretation. The frozen gate was designed to protect against exactly that ambiguity.

At the same time, the retained controls indicate that the observed centering effect was not reproduced by the preregistered global, random-group, or random-subspace controls. The result therefore supports a narrower statement: under this exact frozen encoder, dataset subset, probe family, and transformation, locale-specific centering produced a large descriptive reduction in measured locale probe accuracy while intent probe accuracy was preserved on average.

That narrower finding should motivate a new preregistration only if a scientifically distinct follow-up is warranted. It must not be used to revise v3 thresholds, swap the encoder or dataset under the same protocol ID, or reinterpret `0/5` seed passes as partial primary success.

## 5. Limitations

First, nearest-centroid probe accuracy is only one operationalization of representational information. Probe behavior can depend on the geometry and capacity of the probe, and this study does not establish that all decoders would show the same pattern.

Second, the evaluation covers exactly three MASSIVE locales and 50 feasibility-filtered intents. It does not establish generalization to other languages, scripts, domains, encoders, or multilingual tasks.

Third, the encoder is frozen and not fine-tuned. The study therefore does not measure what happens after task-specific adaptation or end-to-end training.

Fourth, the uncertainty intervals are descriptive Student-t intervals over only five frozen seeds. They were computed after the outcome solely to summarize retained seed variability and are not the primary success test.

Fifth, the language-centering transform uses true locale identity to select the centroid. The experiment is a representation diagnostic, not a deployable language-agnostic transformation.

Finally, the raw locale-probe accuracy failed the preregistered `0.75` prerequisite. This directly limits the strength of any interpretation about removal of strong language/locale information and is the reason the primary verdict remains negative.

## 6. Reproducibility and evidence identity

The retained lineage is bound to protocol `T2424-0027-REAL-ENCODER-GATE-v3`. The preregistration commit is `a3fc8fb13c600ec5a7b5a3bc4379b88c80a11c7a`; the preregistration manifest Git blob is `3adc92ebf9203f20319582e33c98ba570f9d884c`; and the one-shot execution trigger commit is `0e9d7c9ad4abd61b8996303fdcd45579b898f327`.

The primary GitHub Actions execution is run `33307308534`, job `99246007605`, artifact `9730910606`, with retained artifact ZIP SHA-256 `5bebd21c4e0b763a68c100c58bdea10d1822550d08fcda505ed65c84eb44a757`. The retained package includes the per-seed metrics, aggregate summary, verdict, descriptive uncertainty, and checksum ledger. The exact-head authorization and result-integrity workflows subsequently passed on the retained result branch.

The publication rule is fail-closed: the manuscript must preserve the negative primary verdict, the failed raw-locale prerequisite, the `0/5` seed-pass count, and the separation between this real-encoder successor and the earlier synthetic mechanics experiment. Any scientific protocol revision after outcome access requires a new preregistration.

## 7. Conclusion

The preregistered real-encoder v3 study produced a clear negative primary result. Locale-specific centering substantially reduced measured locale leakage and preserved intent probe performance under the frozen diagnostic, but raw locale predictability was too weak to satisfy the preregistered prerequisite and no frozen seed passed the full conjunction. The evidence therefore supports a bounded descriptive representation finding, not the stronger confirmatory claim the study was designed to test. Retaining that failure without rescue tuning is the main scientific conclusion of v3.
