# Apex Chatbot Evaluation Rubric

This rubric defines the **deterministic** quality criteria for `/api/ask` (Apex, the Socratic study tutor). Every prompt in `golden.jsonl` references one or more of these criteria in its `rubric` block. The runner in `evals/scripts/run-eval.mjs` checks each response against its rubric and emits a score from 1 (broken) to 5 (excellent).

## Design principles

1. **Deterministic first.** All v1 checks are substring, regex, and length bounds. No LLM-as-judge. This keeps the runner CI-friendly, free, and deterministic across runs.
2. **No false precision.** A score is a coarse signal ("is the response in the right shape?"), not a measure of truth. v2 may add LLM-as-judge for finer quality, but only after we have a solid golden set.
3. **Per-prompt rubric.** Each golden prompt carries its own `rubric` block — there is no global scoring. Some prompts allow short answers; others require long ones. The rubric encodes this.
4. **Regression mode.** When `OPENAI_API_KEY` is unset (CI, local without secrets), the runner uses `fixtures/baseline.json` as the response for every prompt and asserts structural validity. This catches template, schema, and prompt-engineering regressions without spending money on tokens.

## Rubric fields

| Field | Type | Required | Meaning |
|---|---|---|---|
| `mustContainAny` | `string[][]` | recommended | At least one entry's group of strings must appear in the response (case-insensitive). Use for the answer to the question. |
| `mustNotContain` | `string[]` | optional | None of these strings may appear. Use for "don't refuse" or "don't hallucinate" assertions. |
| `minLength` | `number` | optional | Minimum character length. Below this the response is considered incomplete. |
| `maxLength` | `number` | optional | Maximum character length. Above this the response is considered bloated. |
| `mustCiteSources` | `boolean` | optional | If true and the request included `sources`, the response must include at least one `[Source: <title>]` citation. |
| `encourages` | `{regex,label}[]` | optional | Bonus signals. Each match adds +0.25 to the score. Used to reward Socratic voice, step-by-step reasoning, etc. |
| `discourages` | `{regex,label}[]` | optional | Penalty signals. Each match subtracts 0.5 from the score. Reserved for "lecturing without engaging", "excessive boilerplate". |

## Score formula

```
base   = 5
if any mustContainAny group is fully missing      -> base -= 2
if any mustNotContain string is present           -> base -= 3 (per string)
if length < minLength                             -> base -= 1
if length > maxLength                             -> base -= 1
if mustCiteSources is true and no citation found  -> base -= 2
base += sum(encourages matches) * 0.25
base += sum(discourages matches) * -0.5
clamp(base, 1, 5)
```

## Pass threshold

A prompt passes when `score >= 3`. The runner emits a non-zero exit code if **more than 10%** of prompts fail. Tune the threshold per-handler in `run-<handler>-eval.mjs`.

## Categories covered in `golden.jsonl`

- `math` — algebra, quadratics, calculus, geometry (4 prompts)
- `science` — biology, chemistry (2 prompts)
- `english` — literary analysis, grammar (2 prompts)
- `computer-science` — complexity (1 prompt)
- `history` — causal analysis (1 prompt)
- `writing` — structure (1 prompt)
- `edge-case` — off-topic refusal (1 prompt)
- `multi-turn` — history awareness (1 prompt)

Total: **13 golden prompts** spanning IB, IGCSE, GCSE, and A-Level curricula — exactly the audience this product serves.

## How to extend

1. Add a JSON line to `golden.jsonl`. Pick a unique `id` prefixed `ask-<category>-<NNN>`.
2. Write the rubric for that prompt — think about what a *correct Socratic response* looks like, not what a *direct answer* looks like.
3. Run `npm run eval:ask -- --dry-run` to validate the JSONL parses and the rubric is well-formed.
4. Submit a PR. CI will reject if any prompt regresses below score 3.

## Limitations and future work

- v1 has no LLM-as-judge. Numerical scores are coarse.
- v1 has no adversarial probing (jailbreak, hallucination pressure). Add under `edge-case` category.
- v1 does not measure latency or cost. Add in v2 alongside LLM-as-judge.
- v1 uses regex for "encourages" — limited for multilingual prompts.