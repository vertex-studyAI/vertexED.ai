# T2424-0035 — Grokking Agent

A Project 2424 minimum experiment for **detecting delayed generalization in learning curves** from explicit train/evaluation metrics.

The name “agent” refers to an automated evaluator. This package does not contain an LLM, autonomous training system, or claim that grokking has occurred in any real model unless supplied experimental curves satisfy the predeclared detector contract.

## Detector contract

Given monotonically increasing training steps with train/eval accuracy:

1. causally smooth each series with a trailing moving average;
2. find the first persistent train-accuracy threshold crossing (“memorization”);
3. find the first persistent eval-accuracy threshold crossing (“generalization”);
4. require generalization to occur after memorization by at least a minimum step delay;
5. require evaluation accuracy to still be low at the memorization step.

Default thresholds:

- train accuracy: `0.95`;
- eval accuracy: `0.90`;
- persistence: `3` rows;
- minimum delay: `1000` training steps;
- maximum eval accuracy at memorization: `0.80`;
- causal smoothing window: `3` rows.

These are detector defaults, not universal scientific definitions of grokking.

## Run the minimum experiment

```bash
node portfolio/new-projects/grokking-agent/experiment/run.mjs
```

The deterministic experiment compares:

- a synthetic positive control with an early train transition and much later eval transition;
- a matched control where train and eval transition at nearly the same time.

The intended falsification boundary is simple: the delayed curve should classify as delayed generalization; the matched control should not.

## Run tests

```bash
node --test tests/grokkingAgent.test.mjs
```

The root VertexED test suite also includes this file through the existing test glob.

## What the tests certify

- delayed synthetic positive control is detected;
- matched train/eval transition is rejected;
- a one-row eval spike does not satisfy a persistent threshold;
- smoothing is causal and cannot read future rows;
- malformed accuracy ranges and non-monotonic steps fail closed.

## Files

```text
grokking-agent/
├── README.md
├── STATUS.md
├── experiment/
│   └── run.mjs
└── src/
    └── core.mjs
```

Repository integration test:

```text
tests/grokkingAgent.test.mjs
```

## Limitations

- accuracy-only detector; no loss, margin, representation, or weight diagnostics;
- synthetic controls only in this minimum experiment;
- threshold choices are configurable and may materially change classification;
- causal smoothing can shift detected transition times;
- no statistical uncertainty interval around onset estimates;
- does not establish mechanism, phase transition, or theoretical grokking explanation;
- no claim about any LAM-JEPA, VertexED, Hercules, or other model run.

## Next evidence gate

Apply the frozen detector to retained training logs from at least one real modular-arithmetic or algorithmic grokking experiment, report sensitivity to thresholds, and compare against matched non-grokking controls. Freeze evaluation rules before inspecting the final curves.
