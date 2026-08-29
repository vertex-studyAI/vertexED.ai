# T2424-0027 Primary-Source Related-Work Audit

Status: **BOUNDED PRIMARY-SOURCE AUDIT COMPLETE**

This file records literature that is directly relevant to multilingual representation probing and language-centering operations. The frozen T2424-0027 result is synthetic, so every source below is treated as context rather than as evidence that the synthetic result transfers to a real multilingual encoder.

## Libovický, Rosa, and Fraser (Findings of EMNLP 2020)

**Reference:** Jindřich Libovický, Rudolf Rosa, Alexander Fraser. “On the Language Neutrality of Pre-trained Multilingual Representations.” *Findings of the Association for Computational Linguistics: EMNLP 2020*, pages 1663–1674. DOI: `10.18653/v1/2020.findings-emnlp.150`. arXiv: `2004.05160`.

**Primary-source relevance:** This work directly studies language neutrality in multilingual contextual embeddings and reports per-language centering as one method for increasing language neutrality. It is the closest verified literature anchor for the language-centroid-removal idea used in the T2424-0027 synthetic diagnostic.

**Boundary:** Their experiments use real pretrained multilingual representations and lexical-semantic evaluations. T2424-0027 uses an explicitly constructed synthetic latent space. Similarity in operation does not establish equivalence of behavior, mechanism, or external validity.

## Pires, Schlinger, and Garrette (ACL 2019)

**Reference:** Telmo Pires, Eva Schlinger, Dan Garrette. “How Multilingual is Multilingual BERT?” *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics*, pages 4996–5001, 2019. DOI: `10.18653/v1/P19-1493`. arXiv: `1906.01502`.

**Primary-source relevance:** This paper probes cross-lingual behavior in multilingual BERT and shows that multilingual transfer exists but varies systematically across language relationships. It motivates treating language information in multilingual representations as an empirical property that should be measured rather than assumed away.

**Boundary:** The paper does not validate language-centroid removal in T2424-0027 and does not imply that the synthetic PASS predicts zero-shot transfer or any other real-model behavior.

## Feng et al. (ACL 2022)

**Reference:** Fangxiaoyu Feng, Yinfei Yang, Daniel Cer, Naveen Arivazhagan, Wei Wang. “Language-agnostic BERT Sentence Embedding.” *Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics, Volume 1: Long Papers*, pages 878–891, 2022. DOI: `10.18653/v1/2022.acl-long.62`. Earlier arXiv: `2007.01852`.

**Primary-source relevance:** LaBSE provides an example of learned multilingual sentence representations explicitly optimized for cross-lingual alignment and evaluated across many languages. It is useful as a contrast with a hand-constructed diagnostic because it shows what a genuine learned multilingual representation system looks like.

**Boundary:** T2424-0027 does not train LaBSE, reproduce its retrieval experiments, or establish language-agnostic sentence embeddings.

## Manuscript-safe synthesis

The related-work section may state that multilingual representations can encode both cross-lingual semantic information and language-specific structure, that prior work has directly studied language neutrality, and that per-language centering has precedent in real pretrained representations. It may then position T2424-0027 as a deliberately controlled synthetic diagnostic that verifies evaluator and transform mechanics before any real-model experiment.

The manuscript must also state that the synthetic result is not evidence for linguistic relativity or the Sapir–Whorf hypothesis. No cognitive or cultural claim follows from these sources or from the frozen construction.

## Forbidden citation jumps

Do not use these references to claim that T2424-0027:

- validates multilingual BERT, XLM-R, or LaBSE behavior;
- demonstrates semantic universals;
- establishes language-invariant representation learning;
- demonstrates translation quality or zero-shot transfer;
- establishes the Sapir–Whorf hypothesis or linguistic relativity;
- demonstrates novelty merely because the synthetic transform passes its gates.

## Successor literature gate

A real-model successor should freeze the exact encoder, revision, layers, pooling rule, multilingual dataset, label construction, concept/task metric, language probe, train/test separation, controls, seeds, and stopping rule before embeddings are evaluated. Any additional sources needed to justify those choices should be primary-source verified before outcome access.
