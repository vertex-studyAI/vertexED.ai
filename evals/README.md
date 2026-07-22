# AI Evaluation Harness

> Deterministic, CI-friendly quality checks for every AI handler in VertexED.ai.

This directory implements the **v1** of the eval system. It is intentionally
deterministic (substring/regex/length checks) so it can run in CI without
spending tokens or needing LLM-as-judge. The pattern is designed to be
extended across every AI handler.

## Quick start

```bash
# Run the Apex chatbot eval against the offline fixture (free, no API key)
npm run eval:ask

# Run it against the real OpenAI client (requires OPENAI_API_KEY)
OPENAI_API_KEY=sk-... npm run eval:ask:live

# Run the harness's own unit tests
npm run test:eval

# Validate the JSONL without running anything
node evals/scripts/run-ask-eval.mjs --dry-run
```

## Layout

```
evals/
├── README.md                       (this file)
├── ask/
│   ├── golden.jsonl                13 golden prompts across IB/IGCSE/A-Level subjects
│   ├── rubric.md                   scoring schema + formula
│   └── fixtures/
│       └── baseline.json           reference responses for offline regression mode
├── scripts/
│   ├── score.mjs                   pure scoring engine (no I/O, fully unit-tested)
│   ├── run-eval.mjs                generic runner (importable, CLI-friendly)
│   └── run-ask-eval.mjs            Apex-specific entry point
└── tests/
    ├── scoring.test.mjs            14 unit tests for score.mjs
    └── run-eval.test.mjs           5 integration tests for run-eval.mjs
```

## Two operating modes

### 1. Fixture (regression) mode — default
- No API calls, no money spent.
- Loads `evals/ask/fixtures/baseline.json` for each prompt.
- Catches: prompt-template regressions, schema changes, structural breakages.
- **Always run in CI.**

### 2. Live mode
- Calls the real `/api/ask` handler with the actual OpenAI client.
- Scores the real model output against the rubric.
- Use manually before merging prompt-engineering changes.
- **Never run in CI** (cost + flakiness).

## Scoring formula

See [`ask/rubric.md`](./ask/rubric.md). Short version:

```
base = 5
mustContainAny group missing      -> -2 per group
mustNotContain string present     -> -3 per hit
length out of bounds              -> -1
mustCiteSources unmet             -> -2
each encourage regex match        -> +0.25
each discourage regex match       -> -0.5
clamp(base, 1, 5)
```

A prompt passes if its score is >= 3. The runner emits non-zero exit code if
more than 15% of prompts fail.

## Extending to a new handler

1. Create `evals/<handler>/golden.jsonl` and `evals/<handler>/rubric.md`.
2. Create `evals/<handler>/fixtures/baseline.json` with one reference response per prompt id, plus a `default` response.
3. Create `evals/scripts/run-<handler>-eval.mjs` modeled on `run-ask-eval.mjs`.
4. Add `"eval:<handler>"` to `package.json` scripts.
5. Add it to the `ci` chain (or a weekly cron — your call).

## Roadmap (v2)

- LLM-as-judge scoring (GPT-4o as second opinion) for finer-grained quality
- Adversarial probing (jailbreak, hallucination pressure)
- Latency and token-cost tracking
- A/B comparison runs between two model versions
- Per-prompt tolerance bands (currently hard-coded 15%)