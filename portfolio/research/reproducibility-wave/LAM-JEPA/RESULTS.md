# LAM-JEPA — RESULTS

Evidence date: 2026-08-12
Source repository: `vertex-studyAI/LAM-JEPA`
Exact-head execution commit: `2f59b4297e5978d4ce769ebe95adb363e1e75d7a`
Fresh execution run: GitHub Actions run `31610610381`, rerun job `94178966319`

## Research question

Does the LAM-JEPA mechanism improve ARC validation performance over a capacity-matched supervised baseline, and do the planner/target components contribute measurable benefit under the frozen protocol?

## Hypothesis

The original superiority hypothesis predicts that LAM-JEPA should outperform the matched supervised model and that removing mechanism components should reduce performance.

## Task and protocol

- ARC train/validation protocol already frozen in the LAM-JEPA repository.
- Eligible ARC train tasks: 1,117 / 1,119.
- Eligible ARC validation tasks: 295 / 299.
- Frozen validation comparison uses five seeds.
- Active parameters: LAM-JEPA 86,372; matched supervised 86,644; ratio 1.0031491687.
- Full-controls configuration: five seeds, 20 epochs, batch size 32, learning rate 0.0003, model steps 1.

## Result

### Capacity-matched validation

| Model | Accuracy mean | Across-seed SD |
|---|---:|---:|
| LAM-JEPA | 0.2549152542 | 0.0129968064 |
| Matched supervised | 0.2664406780 | 0.0154600058 |

Paired LAM-JEPA minus matched-supervised accuracy: `-0.0115254237 ± 0.0140994131` across the five frozen seeds.

**Verdict:** the superiority hypothesis is unsupported on the frozen ARC validation protocol.

### Mechanism controls

| Variant | Accuracy mean | Across-seed SD |
|---|---:|---:|
| Full LAM-JEPA | 0.2549152542 | 0.0129968064 |
| No planner | 0.2501694915 | 0.0129968064 |
| No target | 0.2616949153 | 0.0203954020 |
| Shuffled-label control | 0.2630508475 | 0.0145011862 |

- Full minus no-planner: `+0.0047457627`; bootstrap 95% CI `[0.0, 0.0142372881]`.
- Full minus no-target: `-0.0067796610`; bootstrap 95% CI `[-0.0135593220, 0.0]`.

**Verdict:** the current controls do not support a planner/target mechanism advantage.

### Bounded pretrained comparator

On the bounded development comparison, LAM-JEPA scored `0.15625` versus `0.21875` for the pinned DeBERTa-v3-xsmall comparator, a difference of `-0.0625`.

## Fresh execution reproducibility check

A new exact-head container rerun on 2026-08-12 succeeded:

- Ubuntu 24.04.4 GitHub-hosted runner;
- Docker base `python:3.11-slim` resolved at digest `sha256:90744cff8f32887f075c47d747a173ff333e9e98801667af93c357fa9f5e28ff`;
- package wheel built successfully;
- CLI `lam-jepa --help` succeeded;
- installed package imported successfully;
- PyTorch reported `2.13.0+cu130` with `cuda_available: False`.

This is an execution/container reproducibility check, not a new five-seed scientific rerun. The scientific result remains the frozen negative/inconclusive ARC evidence above.

## Uncertainty and limitations

- `n=5` seeds is sufficient for dispersion reporting but not a license for broad significance claims.
- The paired bootstrap intervals above are retained as estimation, not proof of a universal effect.
- The ARC validation result is negative for the stated superiority hypothesis.
- Mechanism isolation is inconclusive/negative under the current ablations.
- A later repair improved trainability but does not retroactively validate the original hard-VQ mechanism.
- Confirmatory test data must not be used to rescue a failed validation hypothesis.

## Claim boundary

Current classification: **execution reproducible; ARC superiority unsupported; mechanism advantage unsupported/inconclusive.** Negative evidence is retained as a legitimate outcome.