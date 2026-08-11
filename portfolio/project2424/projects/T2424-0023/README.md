# T2424-0023 — Multilingual Epistemic Blind Spots Benchmark

A bounded evaluation package for measuring **high-confidence cross-language answer asymmetries in already-aligned multilingual records**.

This is the canonical reconciliation of two independently green implementations that had claimed the same First-100 ID. It keeps the stronger input/evaluation contract from the earlier aligned-record implementation and the stronger calibration/determinism controls from the later implementation.

## Operational question

Given the same concept evaluated in multiple languages, can we separate:

1. ordinary correctness disagreement;
2. low-confidence errors and abstentions; and
3. the narrower unsafe case where one language is **high-confidence wrong** while another language is **high-confidence correct** on the same concept?

Only the third case is counted as a cross-language epistemic blind spot.

## Record contract

Each input supplies:

- `itemId`;
- `conceptId`;
- `language`;
- expected answer;
- predicted answer;
- confidence in `[0, 1]`;
- optional `abstained: true`.

Correctness is derived from normalized expected/predicted answers rather than accepted as a caller-supplied boolean. The evaluator rejects duplicate IDs, duplicate concept/language pairs, malformed confidence values, and concepts represented in fewer than two languages.

## Metrics

### Overall and per language

- coverage;
- raw accuracy;
- selective accuracy among answered items;
- mean answered confidence;
- answered-item Brier score;
- absolute confidence/selective-accuracy gap;
- high-confidence-wrong count;
- blind-spot response rate.

### Per concept

- correctness mismatch;
- high-confidence correct languages;
- high-confidence wrong languages;
- abstained languages;
- strict cross-language blind-spot flag.

### Pairwise languages

- matched-concept count;
- accuracy gap;
- directional blind spots where A is high-confidence wrong and B high-confidence correct, or vice versa.

## Deterministic fixture

`experiment/sample-records.json` contains three aligned concepts across English, Spanish and French. It includes:

- one injected Spanish high-confidence wrong answer with English/French high-confidence correct references;
- one low-confidence Spanish error that remains a mismatch but not a blind spot;
- one French abstention;
- one concept correct in all three languages.

The fixture tests evaluator mechanics only. It is not evidence about a real model or about any language.

## Run

```bash
node portfolio/project2424/projects/T2424-0023/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424MultilingualBlindSpots.test.mjs
```

The root `npm test` discovers the regression automatically.

## Claim boundary

This package evaluates supplied aligned records. It does not:

- create or validate translations;
- establish semantic equivalence of prompts;
- evaluate a real model unless real records are supplied separately;
- establish causal, fairness or cultural explanations;
- prove benchmark representativeness;
- establish external multilingual robustness;
- establish publication novelty or research completion.

A high-confidence error is an operational signal under a chosen threshold, not proof of a model's internal epistemic state.

## Next evidence gate

Freeze a real multilingual set with independent semantic-alignment review; version the exact model/inference protocol; retain raw outputs; compare direct multilingual inference with translation-to-English and calibration baselines; preregister threshold sensitivity; and obtain independent QA before making model- or language-level conclusions.
