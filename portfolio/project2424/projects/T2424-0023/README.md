# T2424-0023 — Multilingual Epistemic Blind Spots Benchmark

A bounded evaluation package for measuring **high-confidence errors and cross-language asymmetries in already-aligned multilingual prediction records**.

## Operational question

Given the same concept evaluated in multiple languages, can we distinguish ordinary errors, abstentions, and high-confidence wrong answers, then identify concepts where one language is correct while another language shows a high-confidence error?

This package makes that question reproducible without pretending to provide a multilingual dataset, translation system, or model benchmark result.

## Record contract

Each record supplies:

- `itemId`
- `conceptId`
- `language`
- `expected`
- `predicted`
- `confidence` in `[0, 1]`
- optional `abstained: true`

The evaluator requires one record per `(conceptId, language)` pair and rejects duplicate IDs/alignment keys.

## Metrics

- **coverage** — fraction of records answered rather than abstained;
- **accuracy** — correct answers divided by all records;
- **selective accuracy** — correct answers divided by answered records;
- **high-confidence wrong count** — incorrect, non-abstained answers at or above a frozen confidence threshold;
- **blind-spot rate** — high-confidence wrong answers divided by all records;
- **cross-language blind spot** — a concept with at least one correct language and at least one high-confidence-wrong language;
- **paired language comparison** — matched-concept accuracy gap and directional blind-spot counts.

The default blind-spot threshold is `0.8`.

## Run the deterministic minimum experiment

```bash
node portfolio/project2424/projects/T2424-0023/experiment/run.mjs
```

Reference fixture: three aligned concepts across English, Spanish, and French. It intentionally includes:

- one injected Spanish high-confidence wrong answer on a concept answered correctly in English and French;
- one Spanish low-confidence error that must **not** count as a blind spot;
- one French abstention;
- one concept answered correctly in all three languages.

Reference result:

- 9 records;
- 8 answered;
- 6 correct;
- 1 high-confidence wrong answer;
- 1 cross-language blind-spot concept;
- English–Spanish matched accuracy gap `0.6667`;
- Spanish-only directional blind spots: `1`.

The retained machine-readable output is in `results/reference.json`.

## Test

```bash
node --test tests/project2424MultilingualBlindSpots.test.mjs
```

The focused suite checks threshold semantics, cross-language asymmetry, coverage/selective-accuracy separation, directional pair comparison, claim-boundary retention, duplicate alignment rejection, and malformed confidence handling.

## Claim boundary

This is **evaluation mechanics on supplied aligned records only**.

It does not:

- create or validate translations;
- establish that two prompts are semantically equivalent across languages;
- evaluate a real language model unless real aligned records are supplied separately;
- prove cultural, linguistic, fairness, or epistemic causes for an observed gap;
- establish benchmark representativeness;
- establish publication novelty or research completion.

A high-confidence error is an operational signal under the chosen threshold, not proof of a model's internal epistemic state.

## Next evidence gate

Freeze a real multilingual item set with independently reviewed semantic alignment, evaluate at least one actual model under a versioned inference protocol, add calibration baselines and threshold sensitivity, retain raw outputs, and obtain independent QA before making model or language-level conclusions.
