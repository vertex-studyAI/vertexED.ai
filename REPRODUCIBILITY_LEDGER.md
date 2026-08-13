# REPRODUCIBILITY_LEDGER

**As of:** 2026-08-13 22:00 IST

| Project | Source / protocol | Reproduction evidence | Result agreement | Boundary |
|---|---|---|---|---|
| LAM-JEPA ARC | scientific SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`; seeds 1–5; 20 epochs; batch 32; lr 0.0003; 1117 train / 295 validation | retained attempt-3 artifact `9162165932`, SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`; current LAM main `88f759ef...` adds attempt-4 independent audit | aggregate negative conclusion reproduced; low-order per-example float drift retained | locked ARC test untouched; not broad benchmark significance |
| Project 2424 canonical priority reproduction | source `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7` | workflow `31618609967`; job `94295733785`; artifact `9162627168`; SHA-256 `d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae` | **scientific-value agreement** | do not claim latest byte identity |
| T2424-0025 | frozen robust-readout precursor + current focused regression | current retained suite `10/10`; prior 30-seed + 50-seed screen | numerical/mechanism screen reproduced | synthetic precursor, not learned Transformer proof |
| NGMT v0.1 | frozen equal-budget B0/B1/B2/B3; 6,049 parameters each; 3 paired seeds | first valid run `31661313386` artifact `9166307730`; unchanged replay `31661621771` artifact `9166406618` | scientific metrics, 12 histories and 12 checkpoint hashes replay exactly | negative result; no superiority/significance claim |
| T2424-0027 | deterministic 72-record synthetic audit | current focused suite `8/8` + independent verifier | verifier PASS; retained synthetic metrics agree | injected coordinates; no real multilingual-encoder claim |
| NeuroCAD | frozen controlled benchmark + held-out-template v1 | current focused suite `6/6`; held-out typed 19/20 vs direct 12/20; OpenSCAD 12/12 valid | controlled/held-out gate reproduced | one frozen v1 negative-width failure retained; no arbitrary NLP-to-CAD claim |
| Darcy | frozen 20-seed synthetic pressure-MAE screen | current focused suite `6/6`; prior reproduced numerical table | bounded mechanism result reproduced | not a learned neural operator |
| T2424-1863 | frozen 20-seed local-diffusion screen | exact-head dedicated workflow `31659932936` SUCCESS; canonical CI `31659932951` SUCCESS | negative >75% gate preserved | synthetic one-step diffusion only |
| APEN | checksummed Atlas V4 source; 48 paired base conditions + salience dropout | source-archive rerun retained | mixed tradeoff reproduced | naturalistic/learned baseline missing |
| Eigen-JEPA | Atlas V4 real-market protocol | source-archive rerun retained | mixed/negative baseline comparison reproduced | multi-dataset/external replication missing |
| NPMS | Atlas V4 controlled reservoir + companion learned evidence | source-archive reproduction retained | controlled evidence reproduced | natural-task/OOD transfer missing |
| Research Atlas V4 | archive SHA-256 `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c` | `39/39` tests; 18 base reruns; manuscript rebuilds; package/validator checks | 61/65 selected artifacts byte-exact; four PDF timestamp-only differences | local/package reproduction, not independent external replication |

## Required metadata for every new experiment

Every experiment promoted after this closeout must retain: question, frozen hypothesis, dataset/task and split, baselines, proposed method, ablations, primary metric, seed policy, statistics/effect rule, environment, source commit, exact command, runtime/compute, raw machine-readable metrics, artifact hashes, aggregate table, uncertainty, failure cases, limitations and claim boundary.

Do not silently modify an experiment after observing its result. A protocol change creates a new experiment version.
