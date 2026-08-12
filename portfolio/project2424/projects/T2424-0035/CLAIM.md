# Claim — T2424-0035 Grokking Agent

## Falsifiable claim

The evaluator can distinguish a frozen deterministic delayed-generalization learning-curve fixture from a matched near-synchronous train/eval control using predeclared persistent train/eval thresholds, causal smoothing, a minimum delay, and an eval-at-memorization ceiling.

## Success conditions

- delayed synthetic fixture returns `DELAYED_GENERALIZATION_DETECTED`;
- matched control returns `NO_DELAYED_GENERALIZATION`;
- a one-row early eval spike does not satisfy the persistent generalization threshold;
- smoothing is causal and does not use future rows;
- malformed metrics and non-increasing steps fail closed.

## Claim boundary

This supports detector mechanics on deterministic synthetic learning curves only. It does not establish grokking in a trained model, a causal mechanism, a theoretical phase transition, external generalization, autonomous training, research completion, or publication novelty.
