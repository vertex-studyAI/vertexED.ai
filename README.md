# T2424-0025: exact-source recovery and frozen replay

**Isolated research branch. Never merge this tree into VertexED `main`.**

This package recovers the complete 11-file T2424-0025 project subtree from
`vertex-studyAI/vertexED.ai@016e1bdc1f6e38f80d7bbe8b596bcb5349fa0c0a` without
changing any project bytes. Original Git subtree: `f7793ccc3a32c37f1d09490f747b62b44892c516`.

Both experiment scripts and both implementation modules have the same Git blob
identities as the documented frozen source at
`0d2a14e559b0caa9b5b1cbeef0995013594ecf15`. The replay therefore uses the preserved
30-seed screen and 50-seed-per-condition sweep, not a tuned successor. All six
contamination rates and all four estimators remain present.

## Run

Use Node **22.22.0** as documented by the original strict reproduction contract,
and Python 3.10 or newer. There are no npm dependencies, models, paid APIs or GPUs.

```bash
python3 -m unittest discover -s reproduction -p 'test_*.py' -v
python3 reproduction/verify_replay.py source
mkdir -p evidence/replay
(cd projects/T2424-0025 && node experiment/run.mjs) > evidence/replay/run.json
(cd projects/T2424-0025 && node experiment/ablation.mjs) > evidence/replay/ablation.json
python3 reproduction/verify_replay.py results
```

Hosted execution additionally enforces a 60-second timeout on each original
command, a five-minute job limit, read-only repository permissions, and retained
source/result/environment receipts. The checker reads files only. The original
experiment scripts are executed only after the source check succeeds.

## Acceptance, fixed before this replay

The source checker validates all eleven original Git blob identities and rejects
missing, added, changed or symlinked project files. The output checker requires
the two stdout SHA-256 anchors previously retained in PR #567:

- screen: `7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1`
- ablation: `f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e`

It also compares every retained screen metric and the mean and sample standard
deviation for every estimator at every contamination level with the unchanged
`raw_metrics/repro-wave-20260812.json`. Numeric equality is exact, not a widened
tolerance. The clean control is mandatory. Fourteen adversarial checker tests
are separate software fixtures, not evidence from additional scientific seeds.

## Scientific interpretation stays bounded

The historical screen's `PASS_HEAVY_TAIL_MEMORY_SCREEN` is not a general research
promotion. Weighted median already outperforms arithmetic mean at **0% Cauchy
contamination**: the retained 50-seed MAEs are 0.012569888975136025 and
0.02464691771133496, respectively. The appropriate portfolio interpretation
remains `REPRODUCED_MECHANISM_NON_UNIQUE`.

This is a deterministic synthetic aggregation study. It is not a trained
Transformer, a learned NGMT architecture, a real-data comparison, independent
external researcher replication, novelty proof, or publication-ready release.
No authorship or license blockers are resolved here. The original scripts retain
aggregate summaries, not full per-query or per-seed logs; this replay does not
pretend those missing granular historical artifacts have been recovered.

The August baseline registry remains unchanged on the separate
`research/project2424-baseline-integrity-20260926` branch. This package recovers
one actual source subtree, not all 24 historically source-backed packages.
