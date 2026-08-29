# T2424-0027 Status

**Project:** Sapir–Whorf Latent Tongue  
**Frozen queue rank:** 20  
**Track:** C — Existing work → minimum experiment  
**State:** `MERGED / TESTED_TOOL / CERTIFICATION_PENDING`  
**Claim level:** deterministic synthetic concept-vs-language latent diagnostic mechanics

## Current integration truth

The canonical recovery PR #281 was merged to `main` on 2026-08-12 with merge commit `03eea7acfff37765f1a3d1ab7856f6ac3e7f6fee`. The earlier `CERTIFICATION_PENDING / MANUAL_MERGE_PENDING` wording was stale and is superseded by this status refresh.

Merged does not mean externally validated or research-complete. The supported result remains the bounded deterministic synthetic mechanics claim only.

## Implemented and retained

- [x] frozen queue identity resolved from `FIRST_100_QUEUE.ndjson`
- [x] strict latent-record validation
- [x] balanced deterministic concept/language latent generator
- [x] held-out nearest-centroid concept and language probes
- [x] language-centroid removal transform fit on training records only
- [x] raw baseline
- [x] global-centering negative control
- [x] frozen falsifiable claim
- [x] frozen protocol and thresholds
- [x] runnable experiment
- [x] retained raw JSON result
- [x] SHA-256-bound evidence manifest
- [x] explicit baseline / negative-control analysis
- [x] explicit GO / STOP verdict
- [x] fail-closed evidence-consistency verifier
- [x] focused regression suite
- [x] independent exact reproduction retained through PR #311
- [x] canonical package merged to current history through PR #281
- [ ] external multilingual-model validation
- [ ] portfolio-wide independent certification

## Frozen deterministic result

- raw concept accuracy: `1.0`
- raw language accuracy: `1.0`
- language-centered concept accuracy: `1.0`
- language-centered language accuracy: `0.3611111111111111`
- language chance accuracy: `0.3333333333333333`
- normalized excess language-leakage reduction: `0.9583333333333334`
- global-centering negative-control language accuracy: `1.0`
- verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`

The centered language probe is slightly above chance, but the predeclared normalized leakage-reduction gate is `>= 0.90` and the retained value is `0.9583333333333334`. No threshold was moved after observation.

Independent reproduction retained for this project records output SHA-256 `0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`.

## Nine-gate state

1. immutable source/evidence identity: **present**
2. falsifiable claim: **present**
3. frozen protocol: **present**
4. clean runnable command: **present**
5. baseline evidence: **present, synthetic raw baseline**
6. raw result artifacts: **present, retained JSON**
7. ablation / negative-result analysis: **present as raw-vs-language-centered transform plus global-centering negative control**
8. explicit go/no-go verdict: **present**
9. independent QA/reproduction: **present for the bounded deterministic package**

The nine project-local gates support a tested, reproducible synthetic tool/result. They do not satisfy the stricter portfolio-wide meaning of `Certified complete` and do not establish external validity.

## Claim boundary

Do not claim this package establishes the Sapir–Whorf hypothesis, linguistic relativity, semantic universals, cultural cognition, real multilingual encoder behavior, translation quality, language-invariant representation learning, publication novelty, external validation, or research completion.

## Promotion rule

Keep `Certified complete = 0` unless the separate portfolio-wide independent-certification rule is satisfied. Any real multilingual-encoder experiment must use a new preregistered protocol and must not inherit the synthetic PASS verdict.

No deployment or production mutation is part of this research package.
