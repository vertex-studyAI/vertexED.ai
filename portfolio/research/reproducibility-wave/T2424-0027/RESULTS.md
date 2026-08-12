# T2424-0027 — RESULTS

Evidence date: 2026-08-12
Fresh run: GitHub Actions `31616573215`, job `94180746280`
Frozen source base: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`

## Hypothesis

On the frozen synthetic representation with explicitly injected concept and language coordinates, subtracting each language's training-set centroid should suppress language-label predictability while preserving concept predictability. A global-centering negative control should fail to remove the injected language signal.

## Task / data

- 4 concepts;
- 3 language labels;
- 6 samples per concept-language cell;
- 72 deterministic records total;
- first 3 samples per cell fit centroids, last 3 evaluate;
- concept signal strength 3;
- language signal strength 2;
- deterministic nuisance scale 0.12.

## Baselines and method

- baseline: raw latent vectors;
- proposed transform: subtract the training centroid for the record's language;
- negative control: subtract one global training centroid.

## Metrics

Nearest-centroid concept accuracy, language accuracy, and normalized excess language-leakage reduction.

## Fresh result

| Metric | Result |
|---|---:|
| Raw concept accuracy | 1.0000 |
| Raw language accuracy | 1.0000 |
| Language-centered concept accuracy | 1.0000 |
| Language-centered language accuracy | 0.3611111 |
| Chance language accuracy | 0.3333333 |
| Normalized language-leakage reduction | 0.9583333 |
| Global-centering language accuracy | 1.0000 |

Verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`.

All 8 focused tests passed. The independent verifier recomputed the result without importing the core implementation and reported evidence consistency `PASS`. Fresh raw-result SHA-256: `0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`.

## Seed / uncertainty policy

This exact fixture is deterministic; a stochastic seed sweep would create artificial inferential language around a fixed construction. Uncertainty is therefore not estimated from repeated seeds. The appropriate evidence is exact reproduction, negative controls and independent recomputation.

## Limitations

- synthetic injected coordinates;
- not a real multilingual encoder;
- no linguistic-relativity conclusion;
- no semantic-universals conclusion;
- no external validity;
- no novelty or publication-readiness claim.

The centered language probe is close to, but not exactly at, chance; that is preserved rather than rounded into a stronger claim.