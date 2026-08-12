# T2424-0035 — Grokking Agent

A deterministic learning-curve evaluator for a narrow delayed-generalization pattern. It analyzes train/eval accuracy trajectories using causal smoothing, persistent thresholds, a minimum memorization→generalization delay, and an eval-at-memorization ceiling.

## Run

```bash
node portfolio/project2424/projects/T2424-0035/experiment/run.mjs
```

The bundled experiment compares a delayed synthetic positive fixture with a matched near-synchronous control.

## Test

```bash
node --test tests/grokkingAgent.test.mjs
```

Coverage includes the positive/control verdicts, spike rejection, causal moving-average behavior, and fail-closed learning-curve validation.

## Provenance

Recovered from legacy implementation head `89e55c7e466f34e54bfc5c870a6ad056a5f034b1`, which passed canonical CI run `31409649210`. This canonical path requires fresh exact-head CI before promotion.

## Claim boundary

This is a detector-mechanics package for deterministic synthetic learning curves. It does not establish grokking in a real model, causal mechanism, theoretical phase transition, training automation, external validity, publication novelty, or Certified-complete status.
