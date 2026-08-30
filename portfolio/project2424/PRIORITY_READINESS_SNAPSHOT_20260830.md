# Project 2424 priority readiness snapshot — 2026-08-30

This is a reviewer-facing snapshot of the currently grounded priority lanes. Scores are **conservative evidence-backed readiness scores**, not scientific quality rankings and not acceptance probabilities. Hard caps from `CONFERENCE_READINESS_SCORING_20260830.md` apply.

| Lane | Score | Band | Scientific state | Why it is capped / blocked | Exact next action |
|---|---:|---|---|---|---|
| T2424-0025 | 89 | PREPRINT_CANDIDATE | reproduced, bounded, mechanism non-unique | authorship/contributions, license, clean PDF/render and final claim audit remain open | close release hygiene only; do not claim a unique heavy-tail/NGMT mechanism |
| T2424-0050 | 88 | PREPRINT_CANDIDATE | HOLD / MIXED_ROBUSTNESS | rho=0 harder-audit miss, seed-6 reversal, release metadata/PDF/novelty gates, no matched learned comparators | finish the bounded mixed-result paper as-is; stronger claims require a separately frozen successor |
| T2424-1863 | 86 | PREPRINT_CANDIDATE | frozen negative | release metadata/PDF/digest/archive gates; bounded standalone novelty | finish rigorous negative-result release hygiene; no rescue tuning |
| T2424-0027 | 79 | PAPER_CANDIDATE | synthetic mechanics pass; real-encoder v3 frozen negative | v3 failed raw-language floor and 0/5 seed gate; v3 outcome not yet fully integrated into manuscript; release hygiene open | integrate the negative v3 result verbatim; any future positive successor requires a new preregistration |
| T2424-0037 | 29 | CONCEPT (identity-capped) | validation-dominant; typed-parser mechanism falsified | authoritative T2424-0007/T2424-0037 crosswalk unresolved; S3 remains separate/unexecuted | resolve identity provenance before scoring beyond the hard cap; then decide bounded paper vs separately authorized S3 |

## How to read this table

- A negative or mixed result can still be a strong preprint candidate when evidence, reproduction, manuscript and claim discipline are strong.
- A high score does **not** erase a negative scientific verdict. T2424-1863 stays negative; T2424-0050 stays HOLD/MIXED; T2424-0027 v3 stays `FAIL_PREDECLARED_REAL_ENCODER_GATE`.
- T2424-0037's low score is primarily a provenance hard-cap, not a statement that its retained diagnostic evidence is weak.
- Scores above 89 are impossible while release metadata/PDF audit gates remain unresolved.
- No row in this snapshot is currently declared conference-submission-ready.

## Scientific-upside queue is different

Readiness and flagship upside should not be conflated. The current scientific-upside order is:

1. NeuroCAD S3 / mechanism-falsification successor, after identity and authorization gates;
2. separately frozen Darcy stronger successor;
3. NGMT v0.1 negative/failure-mode line or separately frozen successor;
4. T2424-0027 v3 negative gate / future new preregistration;
5. T2424-0025 bounded precursor;
6. T2424-1863 bounded negative screen.

NGMT v0.1 is intentionally not inserted as a pseudo-`T2424-*` row in the canonical readiness CSV until an authoritative identity mapping exists. Its learned B0–B3 result remains negative/inconclusive and distinct from T2424-0025.

## Grounding sources

Use `PRIORITY_EVIDENCE_GROUNDING_20260830.md` for exact heads, workflow runs, artifacts, metrics and scientific boundaries. Use `CONFERENCE_READINESS_SCHEMA_20260830.csv` as the machine-readable canonical T-lane table. Use `T2424_0027_V3_POST_OUTCOME_UPDATE_20260830.md` for the post-outcome strategy lock.
