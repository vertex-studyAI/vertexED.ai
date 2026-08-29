# IRIS common adaptation harness v1 — REPRODUCE

## Environment

Fresh successful attempt captured:

- Python `3.13.5`
- NumPy `2.3.5`
- SciPy `1.17.0`
- platform `Linux-6.18.35-x86_64-with-glibc2.41`
- CPU-only scalar workload

## Frozen source

- protocol: `PROTOCOL.json`
- protocol SHA-256: `0cdf22c97ddb9459182175e7c17bf51906088f5d3a7ec10131edfa650d2edbdd`
- repaired runner SHA-256: `b9e35eb2ed1fc945e99ce76f935f36a816eb3d61b99b109bd092e99a731a6de3`
- verifier SHA-256: `74a149dfa647d145e788559d043e282bcd76768353272b0b4366ef897da91113`

The repaired source differs from invalid attempt 1 only in JSON-safe boolean casting. See `BUG_ATTEMPT_1.md`.

## Commands

From this directory:

```bash
python run.py
python verify.py
sha256sum PROTOCOL.json run.py verify.py results/raw.csv results/summary.csv results/verdict.json results/independent_verification.json
```

Expected scientific hashes:

```text
0cdf22c97ddb9459182175e7c17bf51906088f5d3a7ec10131edfa650d2edbdd  PROTOCOL.json
5f1bfb8cfc8114583e0e55d491d2776522cc9d1e4451289ef260c502e27c501e  results/raw.csv
62355d6aa7eff081e3a940bae65a6ec71a55f789f9e48f398e1031439dc34c1b  results/summary.csv
105af30f32966b1a29a2a921d2566f4a2a96e5d391f8f67b63cc625d510750f7  results/verdict.json
```

`runtime_seconds` in the verdict/manifest is environment-dependent; raw and summary scientific outputs are the primary deterministic replay targets.

## Seed boundary

Only development seeds `0–9` are permitted. `run.py` fails if any reserved confirmatory seed enters the development runner. Seeds `1000–1029` must remain unused unless a separately frozen successor passes its development gate.

## Expected verdict

```text
NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE
```

Do not alter thresholds, methods, seeds, conditions, or metrics after seeing this result. A scientifically different successor requires a new experiment ID and protocol.
