# REPRODUCIBILITY_LEDGER

**As of:** 2026-08-13 22:00 IST

## LAM-JEPA
Frozen science SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`; seeds `1 2 3 4 5`; 20 epochs; batch 32; lr 0.0003; model steps 1; 1,117 train and 295 validation rows; CPU; locked test absent. Canonical artifact `9162165932`, SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`. Aggregate conclusions/verifier reproduce; raw-result byte identity is not claimed.

Canonical execution:
```bash
python scripts/benchmark/run_arc_protocol_v3_controls.py \
  --train ci-evidence/arc-data/arc-challenge-train.parquet \
  --validation ci-evidence/arc-data/arc-challenge-validation.parquet \
  --seeds 1 2 3 4 5 --epochs 20 --batch-size 32 \
  --learning-rate 0.0003 --model-steps 1 \
  --train-limit 0 --validation-limit 0 --device cpu \
  --out ci-evidence/arc-protocol-v3-full-controls-validation.json
```
Then run `scripts/ci/verify_arc_protocol_v3_full_controls.py` on the same frozen inputs.

## Project 2424 retained canonical reproduction
Source `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`; workflow `31618609967`; job `94295733785`; artifact `9162627168`; SHA-256 `d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`. Scientific-value agreement only, not latest byte identity. Focused tests: T2424-0025 10/10; T2424-0027 8/8 + verifier; NeuroCAD 6/6; Darcy 6/6.

Later fail-closed exact-head hardening is retained separately; project-specific claim boundaries remain mandatory.

## NGMT v0.1
First valid run `31661313386`, artifact `9166307730`; unchanged-protocol replay `31661621771`, artifact `9166406618`. Scientific condition summaries, paired effects, criteria, all 12 training histories and all 12 checkpoint hashes replayed exactly. Negative verdict frozen.

## IRIS
v0.2 archive SHA-256 `5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`; checksums pass; 4/4 tests; scientific tables/figures regenerated consistently. Successor confirmatory seeds untouched.

## NeuroCAD
Frozen v1 artifact `9165650301`; 19/20 vs direct 12/20; OpenSCAD 12/12. Post-result fix run `31660543924`, artifact `9166026030`, reaches 20/20 engineering replay while preserving frozen v1 failure.

## Stop rule
Bug invalidates run → retain old evidence → document bug → smallest versioned fix → rerun → distinguish lineages. Never select favorable seeds or change a threshold after seeing the result.
