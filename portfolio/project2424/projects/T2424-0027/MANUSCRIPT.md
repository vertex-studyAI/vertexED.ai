# Language-Centroid Removal in a Controlled Synthetic Latent Space

**Authors:** To be finalized before release

## Abstract

Multilingual representations can contain information about both semantic content and language identity. Before testing language-removal transforms on a learned multilingual encoder, it is useful to verify that the evaluator, transform, and negative controls behave correctly in a setting where the source of each signal is known. We present a deterministic synthetic latent-space diagnostic with four concept labels and three language labels. Each vector contains explicit concept coordinates, explicit language coordinates, and a small deterministic nuisance component. The preregistered transform subtracts the training-set centroid of each vector's own language. Held-out nearest-centroid probes measure concept and language predictability. Raw vectors achieve 1.000 concept accuracy and 1.000 language accuracy. After language-specific centering, concept accuracy remains 1.000 while language accuracy falls to 0.3611, near the 0.3333 chance level. The normalized reduction in excess language predictability is 0.9583, above the frozen 0.90 success threshold. A global-centering negative control retains 1.000 language accuracy, showing that generic centering is insufficient in the known construction. The package has been independently reproduced with byte-identical output. The result validates the controlled synthetic mechanics only. It does not establish behavior in a real multilingual encoder, linguistic relativity, semantic universals, or language-invariant representation learning. We use the experiment as a bounded precursor and specify real-model validation as a separate preregistered successor.

## 1. Introduction

Multilingual representation models are designed to support information sharing across languages, but a representation can be useful across languages without being neutral to language identity. Pires, Schlinger, and Garrette showed that multilingual BERT supports substantial cross-lingual transfer while still exhibiting systematic differences across language pairs [1]. Libovický, Rosa, and Fraser studied language neutrality more directly and found that contextual multilingual embeddings remained only moderately language-neutral by default; among their interventions, per-language centering increased neutrality [2]. Learned systems such as LaBSE pursue cross-lingual alignment at sentence level through explicit training objectives and large multilingual data [3].

These results motivate measurement, but they do not remove a basic methodological problem. If an evaluator reports that a transform suppresses language-label predictability while preserving semantic information, one first needs confidence that the measurement pipeline can distinguish language-specific removal from a generic operation that changes every representation in roughly the same way.

T2424-0027 addresses that narrower problem. We construct a latent space whose concept and language factors are explicitly known. The experiment asks whether subtracting each language's training centroid suppresses the injected language signal while preserving the injected concept signal. A global-centering negative control is included to test whether arbitrary mean subtraction would produce the same effect.

The frozen experiment passes every predeclared gate. The language-specific transform reduces normalized excess language predictability by 95.83% while concept accuracy remains unchanged. Global centering leaves language accuracy at 100%. Because the construction is synthetic and directly encodes the factors that the evaluator later measures, this result should be interpreted as a mechanics validation. It is a useful precondition for a real-model study, not evidence that such a study would succeed.

## 2. Related Work

### 2.1 Multilingual representation probing

Pires et al. [1] probe multilingual BERT through zero-shot transfer and related analyses. Their results show that multilingual representations can support cross-lingual generalization without behaving identically across languages. This supports the broader methodological premise that language structure inside a multilingual representation should be measured rather than assumed.

Libovický et al. [2] directly investigate language neutrality in pretrained multilingual contextual embeddings. Their work is especially relevant because it evaluates language information and includes unsupervised centering of representations by language as a method for increasing neutrality. The present experiment is not a replication of that paper. Its vectors are synthetic and its purpose is to validate a controlled diagnostic with known latent factors.

Feng et al. [3] develop LaBSE, a learned multilingual sentence-embedding model optimized for cross-lingual alignment. LaBSE illustrates the scale and complexity of a genuine learned multilingual representation system. In contrast, T2424-0027 contains no neural encoder, model training, tokenization, natural-language corpus, or semantic retrieval task.

### 2.2 Scope of the present study

The name “Sapir–Whorf Latent Tongue” is a project identifier, not the scientific claim. The experiment does not test linguistic relativity, cultural cognition, or a cognitive theory of language. It tests whether a simple transformation and its probes recover a deliberately injected factor structure in a deterministic synthetic latent space.

## 3. Frozen Experimental Protocol

### 3.1 Construction

The synthetic dataset contains four concept labels: `motion`, `energy`, `probability`, and `growth`. It contains three language labels: `en`, `es`, and `fr`. Six samples are generated for each concept-language combination, giving 72 records in total.

Each latent vector contains explicit concept coordinates and explicit language coordinates. Concept signal strength is fixed at 3 and language signal strength at 2. A deterministic nuisance term with scale 0.12 is added. The nuisance component is a fixed trigonometric function of concept index, sample index, and dimension and is shared across languages for the same concept/sample combination. No random seed search is used.

For each concept-language cell, the first three samples are assigned to the fitting split and the final three samples are used for evaluation. Centroids and transformations therefore use training records only before held-out evaluation.

### 3.2 Probes

Concept and language predictability are measured with nearest-centroid classifiers. The raw baseline uses the original latent vectors.

The candidate transform subtracts the training-set centroid associated with each record's language. The transformed vector is then evaluated with the same held-out probing procedure.

The negative control subtracts one global training centroid from every record. Because this does not selectively remove the injected language coordinates, language accuracy should remain high if the diagnostic is behaving as intended.

### 3.3 Predeclared gates

The frozen protocol requires all of the following conditions:

1. raw concept accuracy at least 0.95;
2. raw language accuracy at least 0.95;
3. language-centered concept accuracy no more than 0.02 below raw concept accuracy;
4. normalized language-leakage reduction at least 0.90;
5. global-centering language accuracy at least 0.95.

Failure of any condition yields `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATES`. Thresholds were not changed after observing the retained result.

The primary quantity is normalized excess language-leakage reduction. It measures the fraction of language predictability above chance that is removed by the language-specific transform. Chance language accuracy is 1/3 because the construction is balanced across three languages.

## 4. Results

The retained deterministic result is shown below.

| Metric | Result |
|---|---:|
| Raw concept accuracy | 1.0000 |
| Raw language accuracy | 1.0000 |
| Language-centered concept accuracy | 1.0000 |
| Language-centered language accuracy | 0.3611 |
| Chance language accuracy | 0.3333 |
| Normalized excess language-leakage reduction | 0.9583 |
| Global-centering language accuracy | 1.0000 |

All five frozen gates pass. Both raw signals are perfectly detectable before transformation. Language-specific centering leaves concept accuracy unchanged at 1.000 while reducing language accuracy from 1.000 to 0.3611. The centered language probe remains slightly above chance rather than reaching chance exactly, but exact chance was never the preregistered threshold. The normalized reduction of excess language predictability is 0.9583333333, above the required 0.90.

The global-centering control is important for interpreting the transform. Global centering leaves language-label accuracy at 1.000. The drop produced by language-specific centering therefore cannot be attributed merely to subtracting an arbitrary common mean from every vector in this construction.

The frozen verdict is `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`.

## 5. Independent Reproduction

The experiment package retains raw evidence at `evidence/raw/results.json` and binds the result through `evidence/manifest.json`. The runnable experiment command is:

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

Independent retained reproduction records output SHA-256:

`0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`

The verifier checks the retained result hash, recomputes metrics and gates from public implementation APIs, requires verdict consistency, and fails closed when claim and evidence disagree. The canonical project recovery was merged through PR #281 on August 12, 2026 with merge commit `03eea7acfff37765f1a3d1ab7856f6ac3e7f6fee`.

## 6. Discussion

The experiment succeeds at its intended local purpose. In a construction where concept and language factors are known, the language-specific centering transform removes almost all language predictability above chance while preserving the injected concept signal. The global-centering control shows that this is not a generic consequence of subtracting a common centroid.

The result also illustrates why a synthetic PASS should be kept separate from an external scientific claim. The generator explicitly places language information in coordinates that are shared across examples of the same language. A per-language centroid is therefore structurally well matched to the construction. Real multilingual encoders may distribute language information nonlinearly, across layers, across token positions, or through interactions with lexical and semantic features. A successful synthetic evaluator says little about how large those complications will be.

The correct next question is empirical and should be preregistered before outcome access. Given a frozen public multilingual encoder and a dataset with aligned semantic content across languages, does a training-only language-centering transform reduce held-out language predictability while preserving a semantic or task-relevant metric? The real-model experiment also needs controls that distinguish language-specific centering from global centering, random directions, dimensionality changes, or generic normalization.

## 7. Limitations and Claim Boundary

T2424-0027 has no natural-language corpus, tokenizer, pretrained encoder, learned representation, model weights, stochastic training, or external dataset. Its concept labels are synthetic categories whose signal is explicitly constructed. The language labels are likewise injected directly. Nearest-centroid accuracy is a diagnostic chosen to match the controlled geometry, not a universal measure of semantic quality or language invariance.

The experiment does not establish linguistic relativity, the Sapir–Whorf hypothesis, semantic universals, cultural cognition, translation quality, zero-shot transfer, language-agnostic representation learning, or behavior of multilingual BERT, XLM-R, LaBSE, or any other real encoder.

Publication novelty is also not established by the synthetic PASS. Prior work already studies language neutrality and language centering in real multilingual representations [2]. The scientific value of this package is reproducibility, control design, and a fail-closed precursor that can be used to validate a successor pipeline before real embeddings are inspected.

## 8. Conclusion

Language-specific centroid removal passes a frozen deterministic diagnostic in a synthetic latent space with known concept and language factors. Raw concept and language probes both achieve 1.000 accuracy. After language-specific centering, concept accuracy remains 1.000, language accuracy falls to 0.3611, and normalized excess language predictability falls by 95.83%. Global centering leaves language accuracy at 1.000.

These results validate the bounded evaluator and transform mechanics. They do not establish a claim about real multilingual models or human language. The appropriate successor is a separately preregistered real-encoder study with fixed data, layers, controls, metrics, and stopping rules before outcome access.

## References

[1] Telmo Pires, Eva Schlinger, and Dan Garrette. “How Multilingual is Multilingual BERT?” *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics*, pages 4996–5001, 2019. DOI: 10.18653/v1/P19-1493. arXiv:1906.01502.

[2] Jindřich Libovický, Rudolf Rosa, and Alexander Fraser. “On the Language Neutrality of Pre-trained Multilingual Representations.” *Findings of the Association for Computational Linguistics: EMNLP 2020*, pages 1663–1674, 2020. DOI: 10.18653/v1/2020.findings-emnlp.150. arXiv:2004.05160.

[3] Fangxiaoyu Feng, Yinfei Yang, Daniel Cer, Naveen Arivazhagan, and Wei Wang. “Language-agnostic BERT Sentence Embedding.” *Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics, Volume 1: Long Papers*, pages 878–891, 2022. DOI: 10.18653/v1/2022.acl-long.62. arXiv:2007.01852.
