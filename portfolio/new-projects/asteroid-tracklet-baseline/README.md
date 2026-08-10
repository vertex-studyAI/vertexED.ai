# Asteroid Tracklet Baseline

A deliberately small falsifiable baseline for linking moving-object detections across four image frames under approximately constant angular velocity.

## Why this exists

The portfolio already contains many large speculative research lines. This prototype is only justified if a cheap baseline shows enough signal to warrant real-image work. It does **not** claim asteroid discovery, orbit determination, novelty, or publication readiness.

## One-command checks

```bash
python -m pytest -q
PYTHONPATH=src python -m asteroid_tracklet.benchmark --seeds 20
```

## Falsifier

On the synthetic benchmark (24 true tracks + 18 distractors per frame, Gaussian position noise), require at least 0.70 precision and 0.70 recall. Failure means stop and improve/reject the mechanism before adding models or infrastructure.

## Next evidence gate

Replace synthetic detections with a small public moving-object dataset or a reproducible set of difference-image detections. Compare against a nearest-neighbor/no-motion baseline and report precision, recall, runtime, and failure cases. Do not claim astronomical usefulness until that real-data gate passes.

## Limitations

- constant-velocity approximation only;
- no image preprocessing or source extraction;
- no orbit fitting;
- greedy conflict resolution;
- synthetic benchmark can be much easier than real telescope data.
