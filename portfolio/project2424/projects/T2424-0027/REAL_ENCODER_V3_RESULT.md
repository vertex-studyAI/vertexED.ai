# T2424-0027 v3 Real-Encoder Outcome

Status: **RETAINED NEGATIVE AGAINST THE PREDECLARED SUCCESS GATE**

Protocol: `T2424-0027-REAL-ENCODER-GATE-v3`

## Immutable execution provenance

- authorized preregistration commit: `a3fc8fb13c600ec5a7b5a3bc4379b88c80a11c7a`
- outcome execution commit: `db38d01126835f906f03af8b2147c518d71a7c07`
- GitHub Actions run: `33303431963`
- retained artifact ID: `9729715965`
- retained artifact ZIP SHA-256: `3eb1d7352e48ad5803b746766a393baf881a4b9ebba49cad8c55340367b9c79d`
- execution job conclusion: `success`
- retained scientific verdict: `FAIL_PREDECLARED_REAL_ENCODER_GATE`
- thresholds moved after outcome access: **no**

The workflow passed preregistration validation, runner-lock validation, execution-manifest drift validation, exact frozen dependency installation, the dataset-only feasibility gate, the real encoder execution, finalization, and artifact upload. The infrastructure-failure branch was not used.

## Frozen data and model

- dataset: `AmazonScience/massive`
- dataset revision: `ff6bd8e4b27c3543e4f8fe2108f32bb95a6f8740`
- dataset version: `1.1`
- locales: `en-US`, `es-ES`, `fr-FR`
- frozen intent count: `50`
- examples per locale-intent per split: `15`
- encoder: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- encoder revision: `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`
- observed embedding dimension: `384`
- fine-tuning: **forbidden / not performed**
- frozen seeds: `2401`–`2405`

The dataset-only gate passed before encoder construction. All 50 preregistered intents met the minimum frozen cell count of 15, and the recomputed admissible set matched the frozen universe.

## Aggregate outcome

| Metric | Frozen gate | Retained mean | 95% Student-t CI | Gate result |
|---|---:|---:|---:|---|
| Raw language accuracy | `>= 0.75` | `0.492356` | `[0.480883, 0.503828]` | **FAIL** |
| Effect retention | `>= 0.70` | `0.871325` | `[0.764483, 0.978168]` | PASS |
| Intent drop | `<= 0.02` | `-0.002489` | `[-0.005501, 0.000524]` | PASS |
| Specificity margin | `>= 0.15` | `0.816864` | `[0.718054, 0.915674]` | PASS |

Additional descriptive metrics:

- raw intent accuracy: `0.720533`
- language-centered intent accuracy: `0.723022`
- raw language accuracy: `0.492356`
- language-centered language accuracy: `0.359022`
- normalized language-leakage reduction: `0.835020`
- seed passes: `0 / 5` (required: `4 / 5`)

The gate therefore fails because the fixed encoder's raw locale predictability is far below the preregistered `0.75` baseline requirement, and consequently none of the five frozen seeds passes the full per-seed gate. The retained outcome must not be relabeled as a PASS merely because the transform-specific metrics are strong.

## Per-seed retained metrics

| Seed | Raw intent | Raw language | Centered intent | Centered language | Leakage reduction | Effect retention | Intent drop | Specificity margin | Seed pass |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 2401 | 0.725778 | 0.482667 | 0.727556 | 0.362667 | 0.803571 | 0.838509 | -0.001778 | 0.803571 | no |
| 2402 | 0.728000 | 0.498667 | 0.729333 | 0.348444 | 0.908602 | 0.948107 | -0.001333 | 0.881720 | no |
| 2403 | 0.717778 | 0.482667 | 0.721778 | 0.375111 | 0.720238 | 0.751553 | -0.004000 | 0.693452 | no |
| 2404 | 0.726222 | 0.495111 | 0.732000 | 0.362222 | 0.821429 | 0.857143 | -0.005778 | 0.813187 | no |
| 2405 | 0.704889 | 0.502667 | 0.704444 | 0.346667 | 0.921260 | 0.961315 | 0.000444 | 0.892388 | no |

## Falsifier interpretation

The negative success-gate verdict is **not** equivalent to triggering the preregistered mechanistic falsifiers. The retained verdict records:

- mean effect retention below 30% of parent effect: **false**;
- mean intent drop above 5%: **false**;
- generic control matches or beats language centering: **false**.

The sign of the language-centering effect is positive, dataset/model provenance materialized successfully, and the dataset feasibility set matched the frozen 50-intent universe.

Therefore the supported interpretation is narrow: **this fixed real encoder did not satisfy the complete preregistered v3 success gate because baseline locale predictability was insufficiently high, even though language centering produced a large, specific reduction in the locale leakage that was present while preserving intent accuracy.**

## Claim boundary

This is a frozen-encoder representation diagnostic only. It does not establish linguistic relativity, cognition, translation quality, semantic universals, universal representations, fine-tuned-model behavior, or model superiority. No rescue tuning, seed changes, threshold movement, dataset/model swapping, control deletion, or outcome-dependent intent selection is authorized under this protocol ID.
