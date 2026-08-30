# Language-Centroid Removal: From a Controlled Synthetic Diagnostic to a Frozen Multilingual Encoder Test

**Authors:** To be finalized before release

## Abstract

Multilingual representations can encode both semantic content and language identity. We evaluate a language-centroid removal diagnostic in two deliberately separated stages. First, a deterministic synthetic latent-space experiment verifies that the evaluator, transform, and negative control behave correctly when concept and language factors are explicitly known. In that construction, raw concept and language accuracy are both 1.000; language-specific centering preserves concept accuracy at 1.000 while reducing language accuracy to 0.3611, yielding 0.9583 normalized excess-language-leakage reduction. Global centering leaves language accuracy at 1.000. Second, under a separately preregistered real-encoder protocol, we test a pinned `paraphrase-multilingual-MiniLM-L12-v2` revision on a mechanically frozen 50-intent subset of MASSIVE across English, Spanish, and French. The real-encoder run completes without infrastructure failure but fails the full preregistered success gate: mean raw locale accuracy is 0.4924, below the frozen 0.75 baseline requirement, and 0/5 seeds pass the complete gate. At the same time, language centering reduces mean locale accuracy from 0.4924 to 0.3590, retains 0.8713 of the parent normalized effect, changes mean intent accuracy from 0.7205 to 0.7230, and achieves a 0.8169 specificity margin over generic controls. None of the retained quantitative falsifiers fires. The correct verdict is therefore `FAIL_PREDECLARED_REAL_ENCODER_GATE`, not a rescued PASS and not a broad mechanistic falsification. These experiments support only a frozen-encoder representation diagnostic; they do not establish linguistic relativity, semantic universals, translation quality, language-invariant representation learning, or model superiority.

## 1. Introduction

Multilingual representation models can support cross-lingual transfer without becoming neutral to language identity. Prior work has shown both cross-lingual generalization in multilingual BERT and persistent language-specific structure in pretrained multilingual representations [1,2]. Per-language centering has also been investigated as a simple intervention for increasing language neutrality [2], while systems such as LaBSE use explicit multilingual training objectives to align sentence representations across languages [3].

A transform that reduces a language-label probe while preserving a task-relevant probe can be tempting to overinterpret. Three distinct questions must instead be separated. First, does the measurement pipeline behave correctly in a geometry where the relevant factors are known? Second, does the same diagnostic produce a preregistered outcome in a fixed real encoder and dataset? Third, do any observed representation changes support broader linguistic, cognitive, translation, or model-quality claims? T2424-0027 addresses only the first two questions, and even there uses narrow frozen claim boundaries.

We therefore use a two-stage design. Stage A is a deterministic synthetic mechanics validation with explicit concept and language coordinates. Stage B is a separately preregistered real-encoder diagnostic using a pinned public dataset and a pinned multilingual sentence encoder. The stages have different evidentiary meanings and different verdicts. The synthetic experiment passes its controlled mechanics gate. The real-encoder experiment fails its complete preregistered success gate because the raw language-predictability baseline is too low, even though the observed language-centering effect is large and specific relative to the frozen controls.

This separation is the main methodological contribution of the package: a positive synthetic validation is not carried forward as evidence for the real model, and a real-model negative is retained without threshold movement or rescue tuning.

## 2. Related Work

### 2.1 Multilingual representation probing

Pires, Schlinger, and Garrette [1] examine multilingual BERT through zero-shot transfer and related analyses, illustrating that useful cross-lingual representations need not erase language-specific structure. Libovický, Rosa, and Fraser [2] study language neutrality more directly and report that pretrained multilingual contextual representations remain only moderately language-neutral by default; their interventions include language-wise centering. Feng et al. [3] introduce LaBSE, a learned multilingual sentence embedding system explicitly optimized for cross-lingual alignment.

The present work is not a replication or model-comparison study. Its synthetic stage exists to verify diagnostic mechanics under known factor geometry. Its real stage is a frozen diagnostic on one encoder revision and one mechanically selected multilingual dataset subset. No claim of novelty for language centering itself is made.

### 2.2 Scope

The internal project name “Sapir–Whorf Latent Tongue” is an identifier, not the hypothesis being tested. Neither stage tests linguistic relativity, cultural cognition, or a causal theory of human language. The measured variables are representation-level probe accuracies and preregistered transformations.

## 3. Stage A: Frozen Synthetic Mechanics Validation

### 3.1 Construction

The synthetic dataset contains four concept labels (`motion`, `energy`, `probability`, `growth`) and three language labels (`en`, `es`, `fr`). Six samples are generated for each concept-language combination, producing 72 records. Each latent vector contains explicit concept coordinates, explicit language coordinates, and a small deterministic nuisance component. Concept signal strength is fixed at 3, language signal strength at 2, and nuisance scale at 0.12. No seed search is used.

For each concept-language cell, the first three examples form the fitting split and the final three form the evaluation split. Nearest-centroid probes are fit on the fitting split and evaluated only on held-out records.

### 3.2 Transform and control

The candidate transform subtracts the training-set centroid associated with each record's language. The negative control subtracts a single global training centroid from all records. This control asks whether a generic mean-removal operation can reproduce the language-specific effect.

### 3.3 Frozen synthetic gates

The synthetic protocol requires:

1. raw concept accuracy at least 0.95;
2. raw language accuracy at least 0.95;
3. language-centered concept accuracy no more than 0.02 below raw concept accuracy;
4. normalized language-leakage reduction at least 0.90;
5. global-centering language accuracy at least 0.95.

Thresholds are frozen before retained outcome access.

## 4. Stage A Results

| Metric | Result |
|---|---:|
| Raw concept accuracy | 1.0000 |
| Raw language accuracy | 1.0000 |
| Language-centered concept accuracy | 1.0000 |
| Language-centered language accuracy | 0.3611 |
| Chance language accuracy | 0.3333 |
| Normalized excess language-leakage reduction | 0.9583 |
| Global-centering language accuracy | 1.0000 |

All five synthetic gates pass. Language-specific centering leaves concept accuracy unchanged while reducing language accuracy near the balanced three-language chance level. Global centering leaves language accuracy at 1.000, demonstrating that generic centering is insufficient in this construction. The frozen verdict is `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`.

The retained synthetic output was independently reproduced with SHA-256:

`0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`

This result validates only the controlled evaluator and transform mechanics. Because the generator explicitly creates removable language coordinates, it does not predict that a learned multilingual encoder will satisfy the same geometry.

## 5. Stage B: Preregistered Real-Encoder Diagnostic

### 5.1 Separation from the synthetic result

The real-model study is scientifically separate from Stage A. Its protocol is `T2424-0027-REAL-ENCODER-GATE-v3`. The execution manifest was authorized only after the preregistration, runner lock, dataset-only feasibility check, and zero-scientific-field-drift checks passed. After outcome access, rescue tuning, seed changes, threshold movement, model or dataset swapping, control deletion, and outcome-dependent intent selection are forbidden.

### 5.2 Frozen data

The dataset is `AmazonScience/massive`, revision `ff6bd8e4b27c3543e4f8fe2108f32bb95a6f8740`, version 1.1. The frozen locales are `en-US`, `es-ES`, and `fr-FR`. The admissible intent universe is defined mechanically before encoder construction: include exactly those intents whose minimum count across every pinned locale and both train/test splits is at least 15. The recomputed universe contains exactly 50 intents, matching the frozen preregistration. Fifteen examples per locale-intent cell are selected deterministically for each pinned split.

### 5.3 Frozen encoder and probes

The encoder is `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, revision `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`, with observed embedding dimension 384. Fine-tuning is forbidden. The five frozen seeds are 2401–2405.

Nearest-centroid Euclidean classifiers are the primary probes. The candidate transform subtracts each locale's fitting-split embedding centroid. Frozen comparators are raw embeddings, global centering, deterministic random-group centering, and deterministic random-subspace removal.

The primary measurements are intent accuracy, locale accuracy, normalized locale-leakage reduction, retention relative to the synthetic parent effect, intent drop, and specificity margin over the best generic control.

### 5.4 Frozen success gate

The aggregate preregistered gate requires all of the following:

- mean raw language accuracy at least 0.75;
- mean effect retention at least 0.70;
- mean intent drop at most 0.02;
- mean specificity margin at least 0.15;
- at least 4 of 5 frozen seeds passing the complete per-seed gate.

Descriptive uncertainty is the sample standard deviation and two-sided 95% Student-t confidence interval across the five frozen seeds. It does not replace or modify the frozen decision rule.

Preregistered falsifiers include a mean effect retention below 0.30, a mean intent drop above 0.05, a non-positive specificity margin, reversal of the parent effect sign, or provenance/feasibility failure.

## 6. Stage B Results

The authorized outcome execution completed successfully as an execution job; the infrastructure-failure path was not used. The dataset-only feasibility gate passed before encoder construction, the pinned model revision materialized, the real encoder ran, and all retained artifacts were finalized with immutable digests.

### 6.1 Aggregate outcome

| Metric | Frozen success condition | Retained mean | 95% Student-t CI | Result |
|---|---:|---:|---:|---|
| Raw language accuracy | >= 0.75 | 0.4924 | [0.4809, 0.5038] | **FAIL** |
| Effect retention | >= 0.70 | 0.8713 | [0.7645, 0.9782] | PASS |
| Intent drop | <= 0.02 | -0.0025 | [-0.0055, 0.0005] | PASS |
| Specificity margin | >= 0.15 | 0.8169 | [0.7181, 0.9157] | PASS |

Additional retained means are:

| Metric | Mean |
|---|---:|
| Raw intent accuracy | 0.7205 |
| Language-centered intent accuracy | 0.7230 |
| Raw language accuracy | 0.4924 |
| Language-centered language accuracy | 0.3590 |
| Normalized language-leakage reduction | 0.8350 |
| Seed passes | 0 / 5 |

The full preregistered verdict is therefore `FAIL_PREDECLARED_REAL_ENCODER_GATE`.

### 6.2 Why the gate failed

The decisive failure is not loss of intent information or lack of transform specificity. The raw language probe begins at only about 0.492, far below the frozen 0.75 baseline requirement. Every frozen seed has raw language accuracy between approximately 0.483 and 0.503, so none can satisfy the complete per-seed success rule. The preregistration requires four seed passes; the retained result has zero.

The remaining aggregate success conditions are satisfied. Language centering lowers the mean locale probe from 0.4924 to 0.3590, close to the balanced three-locale chance level of 0.3333. Mean normalized leakage reduction is 0.8350. Mean effect retention relative to the synthetic parent is 0.8713. Mean intent drop is negative (-0.0025), meaning the retained mean intent accuracy is slightly higher rather than lower after centering. The mean specificity margin is 0.8169, while the generic-control normalized reductions are near zero.

These observations cannot be used to relabel the run as a success because the baseline requirement was frozen in advance. They can, however, be reported descriptively as part of the retained negative result.

### 6.3 Falsifiers

The retained verdict records the three quantitative mechanistic falsifiers as false: effect retention is not below 30% of the parent effect, intent drop is not above 5%, and no generic control matches or beats language centering. The observed centering effect remains positive, the pinned data and model revisions materialized successfully, and the frozen 50-intent feasibility universe matched the preregistration.

Thus the negative success-gate verdict has a narrower interpretation than “language centering does not work.” Under this fixed encoder, dataset subset, probe, and thresholds, the starting representation did not expose enough linearly recoverable locale signal to meet the preregistered baseline condition for a successful language-removal test.

## 7. Reproducibility and Provenance

### 7.1 Synthetic stage

The retained synthetic experiment can be run with:

```bash
node portfolio/project2424/projects/T2424-0027/experiment/run.mjs /tmp/t2424-0027-results.json
```

The implementation-independent verifier is:

```bash
node portfolio/project2424/projects/T2424-0027/reproduction/verify.mjs
```

The focused regression suite is:

```bash
node --test tests/project2424LatentLanguageAudit.test.mjs
```

### 7.2 Real-encoder stage

The v3 outcome is bound to:

- authorized preregistration commit `a3fc8fb13c600ec5a7b5a3bc4379b88c80a11c7a`;
- execution commit `db38d01126835f906f03af8b2147c518d71a7c07`;
- GitHub Actions run `33303431963`;
- retained artifact ID `9729715965`;
- artifact ZIP SHA-256 `3eb1d7352e48ad5803b746766a393baf881a4b9ebba49cad8c55340367b9c79d`.

The paper package also includes `REAL_ENCODER_V3_RESULT.md`, which records the retained aggregate and per-seed outcome without changing any decision gate.

## 8. Discussion

The two-stage result illustrates why controlled validation and external evaluation should not be collapsed into one claim. The synthetic experiment establishes that the diagnostic can recover a deliberately injected, geometrically removable language factor and reject a generic-centering control. That is useful pipeline evidence, but the construction is favorable by design.

The real encoder presents a different geometry. The locale probe has only moderate accuracy before transformation. Language-specific centering still removes most of the measured excess locale predictability while preserving the intent probe and strongly outperforming the frozen generic controls. Yet the preregistered study was designed to demand a high enough starting locale signal that removal would be a stringent test. Because that condition is not met, the correct scientific action is to retain the negative gate result.

A future protocol could ask a different question—for example, whether centering consistently reduces the locale signal that is present even when the raw probe is moderate—but that would be a new hypothesis with new thresholds, not a post-hoc reinterpretation of v3. Any such successor must receive a new protocol ID and be frozen before its outcomes are inspected.

## 9. Limitations and Claim Boundary

The synthetic study is a handcrafted latent geometry. Its labels and signal directions are explicitly injected, and its nearest-centroid diagnostic is matched to that construction.

The real study uses one frozen sentence encoder, one dataset revision, three locales, a mechanically filtered 50-intent universe, nearest-centroid probes, and a specific family of linear centering and control transforms. Results may differ across encoders, layers, token-level representations, languages, datasets, probes, or tasks. The study does not include fine-tuning and does not measure translation quality, generation, cross-lingual retrieval, human cognition, linguistic relativity, cultural effects, or semantic universals.

The real outcome is not evidence of model superiority or a universal language-invariance mechanism. Conversely, failure of the complete preregistered gate is not evidence that the observed language-centering effect is zero; the retained metrics show a substantial representation-level effect under the frozen diagnostic. The exact supported statement is the frozen verdict plus its measured components.

## 10. Conclusion

A deterministic synthetic latent-space experiment passes its frozen mechanics validation: language-specific centering reduces excess language predictability by 95.83% while preserving the injected concept signal, whereas global centering does not reproduce the effect.

A separately preregistered real-encoder successor then produces a retained negative against its complete success gate. Mean raw locale accuracy is 0.4924 rather than the required 0.75, and 0/5 seeds pass. Nevertheless, centering reduces mean locale accuracy to 0.3590, retains 87.13% of the synthetic parent normalized effect, preserves mean intent accuracy, and remains highly specific relative to the frozen generic controls. None of the retained quantitative falsifiers fires.

The resulting evidence is intentionally mixed in the methodological sense: the controlled mechanics are validated, while the stricter real-encoder success claim is not. Preserving that distinction is more informative than moving thresholds after outcome access.

## References

[1] Telmo Pires, Eva Schlinger, and Dan Garrette. “How Multilingual is Multilingual BERT?” *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics*, pages 4996–5001, 2019. DOI: 10.18653/v1/P19-1493. arXiv:1906.01502.

[2] Jindřich Libovický, Rudolf Rosa, and Alexander Fraser. “On the Language Neutrality of Pre-trained Multilingual Representations.” *Findings of the Association for Computational Linguistics: EMNLP 2020*, pages 1663–1674, 2020. DOI: 10.18653/v1/2020.findings-emnlp.150. arXiv:2004.05160.

[3] Fangxiaoyu Feng, Yinfei Yang, Daniel Cer, Naveen Arivazhagan, and Wei Wang. “Language-agnostic BERT Sentence Embedding.” *Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics, Volume 1: Long Papers*, pages 878–891, 2022. DOI: 10.18653/v1/2022.acl-long.62. arXiv:2007.01852.
