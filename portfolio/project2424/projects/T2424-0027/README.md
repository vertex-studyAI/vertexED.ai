# T2424-0027 — Sapir–Whorf Latent Tongue

A dependency-free, deterministic **multilingual latent diagnostic mechanics** package.

The package asks a deliberately bounded question: if a synthetic representation contains both a concept signal and an injected language-specific signal, can a language-centroid removal transform suppress language predictability while preserving concept predictability—and can a negative control show that generic centering is not enough?

It does **not** test the Sapir–Whorf hypothesis or any real multilingual model.

## Frozen construction

- 4 concepts: motion, energy, probability, growth;
- 3 language labels: en, es, fr;
- 6 samples per concept-language cell;
- 72 records total;
- first 3 samples per cell fit centroids; last 3 evaluate them;
- concept signal strength 3;
- language signal strength 2;
- fixed deterministic nuisance scale 0.12;
- no network, model weights, external data, seed search or threshold tuning.

Each raw vector contains explicit concept coordinates plus explicit language coordinates. Nuisance terms depend only on concept/sample/dimension and are shared across languages for the same concept/sample, so the construction has a known causal mechanism.

## Transform and controls

**Candidate transform:** subtract the training centroid for each record's language.

**Raw baseline:** no transform.

**Negative control:** subtract one global training centroid. This retains the injected language coordinates and should therefore keep language-label accuracy high.

Both concept and language leakage are measured with train/test nearest-centroid accuracy.

## Predeclared gates

1. raw concept accuracy >= 95%;
2. raw language accuracy >= 95%;
3. centered concept accuracy within 2 percentage points of raw;
4. normalized excess language-leakage reduction >= 90%;
5. global-centering language accuracy >= 95%.

Thresholds and generator mechanics are frozen in `PROTOCOL.md` and the implementation commit recorded by `evidence/manifest.json`.

## Retained deterministic result

| Metric | Result |
|---|---:|
| Raw concept accuracy | 1.0000 |
| Raw language accuracy | 1.0000 |
| Language-centered concept accuracy | 1.0000 |
| Language-centered language accuracy | 0.3333 |
| Chance language accuracy | 0.3333 |
| Normalized language-leakage reduction | 1.0000 |
| Global-centering language accuracy | 1.0000 |

Verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`.

Raw evidence is retained at `evidence/raw/results.json` and SHA-256-bound by `evidence/manifest.json`.

## Run

```bash
node portfolio/project2424/projects/T2424-0027/experiment/run.mjs /tmp/t2424-0027-results.json
```

## Independent verification

```bash
node portfolio/project2424/projects/T2424-0027/reproduction/verify.mjs
```

The verifier checks the retained raw SHA-256, recomputes every metric/gate from public implementation APIs, requires the retained verdict to match, and fails closed on claim/evidence inconsistency.

## Test

```bash
node --test tests/project2424LatentLanguageAudit.test.mjs
```

## Claim boundary

The result establishes only that the controlled synthetic diagnostic and transform behave as predeclared. It does **not** establish linguistic relativity, the Sapir–Whorf hypothesis, real multilingual representation behavior, semantic universals, translation quality, language-agnostic learning, external validity, novelty or research completion.

## Next evidence gate

Pre-register a public multilingual model/dataset/layer extraction and evaluation protocol, then test whether any language-leakage reduction persists under real embeddings while preserving concept/task information. Treat any such experiment as a new scientific line, not a continuation that inherits this synthetic pass.
