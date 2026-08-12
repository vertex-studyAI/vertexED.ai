# Frozen protocol — T2424-0027

**Frozen implementation commit:** `d3250fe5fc399905c93a517bbbd61d0c5ad8d5d6`  
**Experiment type:** deterministic synthetic mechanism audit  
**External data:** none  
**Network/API:** none

## PROJECT

`T2424-0027` — Sapir–Whorf Latent Tongue

## CLAIM

Language-centroid removal should suppress synthetic language leakage while preserving the synthetic concept signal.

## PRIMARY METRIC

`normalizedLanguageLeakageReduction`, computed from language-label nearest-centroid accuracy above chance.

## BASELINE

Raw synthetic latent vectors.

## DATA

Balanced deterministic construction:

- 4 concept labels: `motion`, `energy`, `probability`, `growth`;
- 3 language labels: `en`, `es`, `fr`;
- 6 samples per concept-language cell;
- 72 records total;
- first 3 samples per cell used for centroid fitting;
- last 3 samples per cell used for evaluation;
- concept signal strength `3`;
- language signal strength `2`;
- deterministic nuisance scale `0.12` shared across languages for the same concept/sample.

## TRANSFORM

Subtract the training-set centroid of the record's own language from each vector.

## SUCCESS THRESHOLD

All must hold:

1. raw concept accuracy >= `0.95`;
2. raw language accuracy >= `0.95`;
3. centered concept accuracy >= raw concept accuracy - `0.02`;
4. normalized language leakage reduction >= `0.90`;
5. global-centering negative-control language accuracy >= `0.95`.

## FAILURE THRESHOLD

Failure of any success condition yields `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATES`.

## NEGATIVE CONTROL

Subtract one global training centroid instead of language-specific centroids. This should **not** remove the injected language coordinates.

## ABLATION

Raw vectors vs language-centered vectors provide the transform ablation. Global centering separates language-specific removal from generic mean subtraction.

## SEEDS

No pseudo-random seed search is used. Nuisance terms are fixed deterministic trigonometric functions of concept index, sample index, and dimension.

## EXPECTED COST

<1 CPU-second, <10 MB memory, no external services.

## Stop rule

Do not change the thresholds or synthetic construction after observing the result in order to force a pass. Any harder/noisier or real-model study must be versioned as a new protocol before evaluation.
