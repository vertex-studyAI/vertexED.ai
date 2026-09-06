# T2424-0027 v3 — Related work and comparison boundary

**Status:** publication-facing context for the frozen negative v3 result. This file adds no experiment, baseline outcome, significance claim, or authorization. The citations below were checked against primary publication records before inclusion.

## Multilingual NLU data and sentence representations

The v3 diagnostic uses a frozen subset of **MASSIVE**, a multilingual NLU resource introduced by FitzGerald et al. MASSIVE contains parallel labeled virtual-assistant utterances across 51 languages, with intent and slot annotations. The present experiment uses only three preregistered locales (`en-US`, `es-ES`, `fr-FR`) and a feasibility-filtered 50-intent subset; it therefore should not inherit MASSIVE's broader multilingual coverage as an experimental claim.

The frozen encoder belongs to the multilingual sentence-embedding family associated with Reimers and Gurevych's multilingual knowledge-distillation approach. That work trains multilingual sentence encoders so translated sentences align with a source-language teacher representation. T2424-0027 does not retrain or fine-tune that encoder: it treats one pinned encoder revision as a fixed representation surface and probes what locale and intent information can be extracted before and after a simple centering intervention.

## Concept erasure and guarded representations

The closest methodological literature is broader **concept-erasure / representation-guarding** work. Ravfogel et al.'s Iterative Null-space Projection (INLP) repeatedly trains linear classifiers for a target attribute and projects representations into their null spaces, with the goal of making the target difficult to linearly recover. Belrose et al.'s LEACE gives a closed-form least-squares concept-erasure transform with a guarantee against linear prediction under its formal assumptions while minimizing representation distortion under a broad class of norms.

The v3 language-centering transform is substantially simpler: it subtracts a fit-split centroid for each known locale. It is **not** INLP or LEACE, and this experiment does not establish the formal guardedness or minimal-distortion guarantees of those methods. Conversely, INLP and LEACE were **not matched experimental baselines in the frozen v3 protocol**. Because v3 outcomes are already known, adding them now as outcome-responsive baselines under the same protocol would violate the preregistration boundary. Any direct comparison with stronger concept-erasure methods must be a separately frozen follow-up.

This missing-baseline distinction matters for the paper's claim language. The retained v3 result can support only a descriptive statement about the exact locale-centroid intervention relative to its preregistered global-centering, random-group, and random-subspace controls. It cannot support a claim that centroid subtraction is state of the art, optimal, generally superior, or a substitute for established linear concept-erasure methods.

## How the negative result fits the literature

The preregistered v3 study failed because raw locale-probe accuracy did not reach the frozen `0.75` prerequisite, even though locale-centroid subtraction showed a large descriptive reduction in the remaining measured locale signal while preserving intent accuracy on average. This is consistent with a central methodological caution in representation-erasure work: reduced probe recoverability after an intervention is not by itself evidence that a representation was strongly encoding the target concept beforehand, nor does it establish complete information removal outside the tested probe family.

Accordingly, the paper should position v3 as a **bounded negative confirmatory result plus a descriptive intervention observation**, not as a new general concept-erasure algorithm. The most defensible follow-up question is comparative and prospective: under a newly preregistered design with adequate raw target predictability, how does locale-centroid subtraction compare with stronger linear-erasure baselines while controlling for semantic distortion?

## Verified references

1. Jack FitzGerald, Christopher Hench, Charith Peris, Scott Mackie, Kay Rottmann, Ana Sanchez, Aaron Nash, Liam Urbach, Vishesh Kakarala, Richa Singh, Swetha Ranganath, Laurie Crist, Misha Britan, Wouter Leeuwis, Gokhan Tur, and Prem Natarajan. **MASSIVE: A 1M-Example Multilingual Natural Language Understanding Dataset with 51 Typologically-Diverse Languages.** Proceedings of ACL 2023 (Long Papers), pp. 4277–4302. DOI: `10.18653/v1/2023.acl-long.235`.

2. Nils Reimers and Iryna Gurevych. **Making Monolingual Sentence Embeddings Multilingual using Knowledge Distillation.** Proceedings of EMNLP 2020, pp. 4512–4525. DOI: `10.18653/v1/2020.emnlp-main.365`.

3. Shauli Ravfogel, Yanai Elazar, Hila Gonen, Michael Twiton, and Yoav Goldberg. **Null It Out: Guarding Protected Attributes by Iterative Nullspace Projection.** Proceedings of ACL 2020, pp. 7237–7256. DOI: `10.18653/v1/2020.acl-main.647`.

4. Nora Belrose, David Schneider-Joseph, Shauli Ravfogel, Ryan Cotterell, Edward Raff, and Stella Biderman. **LEACE: Perfect linear concept erasure in closed form.** Advances in Neural Information Processing Systems 36 (NeurIPS 2023). DOI: `10.52202/075280-2884`.

## Citation/claim audit notes

- MASSIVE's full 51-language scale must not be presented as the v3 evaluation scale; v3 evaluates exactly three frozen locales.
- The multilingual sentence-embedding citation provides encoder-family context, not evidence about this exact frozen checkpoint's v3 outcome.
- INLP and LEACE are related methods, not executed v3 baselines.
- No sentence in this section upgrades the frozen verdict `FAIL_PREDECLARED_REAL_ENCODER_GATE` or the `0/5` seed-pass result.
