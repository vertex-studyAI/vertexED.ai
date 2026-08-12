# LAM-JEPA — REPRODUCE

## Source revision

Use repository `vertex-studyAI/LAM-JEPA` at commit:

```text
2f59b4297e5978d4ce769ebe95adb363e1e75d7a
```

Do not change seeds, thresholds, ARC splits, architecture controls, or comparator definitions after observing results.

## Environment / container smoke

The exact-head container gate executed successfully in GitHub Actions run `31610610381`, job `94178966319`.

Equivalent commands from the repository root:

```bash
docker build --pull --tag lam-jepa-ci:2f59b4297e5978d4ce769ebe95adb363e1e75d7a .
docker run --rm lam-jepa-ci:2f59b4297e5978d4ce769ebe95adb363e1e75d7a lam-jepa --help
docker run --rm lam-jepa-ci:2f59b4297e5978d4ce769ebe95adb363e1e75d7a \
  python -c 'import lam_jepa, torch; print({"package": lam_jepa.__name__, "torch": torch.__version__, "cuda_available": torch.cuda.is_available()})'
```

Fresh-run environment observed on 2026-08-12:

- GitHub runner: Ubuntu 24.04.4, x86_64;
- container Python base: `python:3.11-slim`;
- PyTorch installed by the current package dependency resolver: `2.13.0+cu130`;
- execution device for the smoke import: CPU (`cuda_available=False`).

## Minimal training/evaluation smoke

Repository-documented smoke command:

```bash
python scripts/train/train_single.py \
  --seed 1 \
  --steps 20 \
  --out-dir experiments/smoke/checkpoints \
  --out experiments/smoke/final.pt
```

Evaluation:

```bash
python scripts/eval/eval_all.py \
  --checkpoint experiments/smoke/final.pt \
  --device cpu \
  --batch-size 32 \
  --batches 2 \
  --seed 7 \
  --out outputs/smoke-eval.json
```

## Multi-seed experiment

```bash
python scripts/bench/run_benchmarks.py --steps 120 --seeds 1 2 3 4 5
python scripts/analysis/aggregate_seeds.py \
  --runs-dir experiments \
  --out experiments/aggregate/summary.json
```

Paper-result generator documented by the source repository:

```bash
python scripts/paper/generate_results.py \
  --out-dir papers \
  --seeds 1 2 3 4 5 \
  --steps 80 \
  --batch-size 32 \
  --eval-batches 6 \
  --evaluation-seed 1007 \
  --device cpu \
  --training-task mixed
```

## Evidence to retain

For every scientific rerun retain:

1. source commit SHA;
2. environment/package lock or container digest;
3. exact command;
4. seed list and evaluation seed;
5. task/split manifest;
6. raw per-seed metrics;
7. aggregate mean and sample SD;
8. bootstrap/permutation output if performed;
9. checkpoints and logs;
10. failed runs and protocol deviations.

## Failure policy

If a bug invalidates a run, preserve the failed log and result first. Fix the bug in a separate commit, classify whether it changes only execution plumbing or changes the scientific protocol, then rerun. Never replace the old result silently.