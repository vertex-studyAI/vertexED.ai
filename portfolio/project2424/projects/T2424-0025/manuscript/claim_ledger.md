# T2424-0025 Manuscript Claim Ledger

| Claim | Evidence | Allowed? | Scope |
|---|---|---|---|
| Weighted median MAE is 0.0165609423 vs 0.3615267855 for weighted mean in the 30-seed heavy-tail screen (95.42% relative reduction). | `RESULTS.md`; frozen revision `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`; `experiment/run.mjs` | YES | Synthetic attention-aggregation screen only. |
| Heavy-tail improvement exceeds clean-control improvement by 47.1292 percentage points. | `RESULTS.md`; `experiment/run.mjs` | YES | Same bounded screen. |
| Median/trimmed/Huber readouts are substantially more stable over the 0–35% Cauchy sweep. | `RESULTS_ABLATION_20260812.md`; `experiment/ablation.mjs`; 50 seeds/condition | YES | Post-hoc synthetic mechanism analysis. |
| The mechanism is uniquely non-Gaussian. | 0% control still strongly favors robust readouts. | NO | Falsified/not isolated by current diagnostic. |
| This is a complete Transformer or NGMT result. | No trained Transformer/memory architecture exists in this experiment. | NO | Unsupported. |
| The tested readouts are novel robust estimators. | Classical robust-statistics literature predates this study. | NO | Unsupported. |
| The result generalizes to language models or real sequence tasks. | No such evidence. | NO | Unsupported. |
