# T2424-0027 v3 primary frozen-outcome result

Status: **FAIL_PREDECLARED_REAL_ENCODER_GATE**

This directory preserves the first authorized outcome-bearing execution of protocol `T2424-0027-REAL-ENCODER-GATE-v3`. The run was triggered once from source commit `0e9d7c9ad4abd61b8996303fdcd45579b898f327` after the outcome-free authorization lock passed. GitHub Actions run `33307308534`, job `99246007605`, completed successfully as an execution job and uploaded artifact `9730910606` (`t2424-0027-v3-primary-0e9d7c9ad4abd61b8996303fdcd45579b898f327`). The uploaded ZIP digest is `sha256:5bebd21c4e0b763a68c100c58bdea10d1822550d08fcda505ed65c84eb44a757`.

## Frozen gate result

The predeclared gate required all of the following aggregate thresholds plus at least 4 of 5 seed-level passes:

- raw language accuracy >= 0.75
- effect retention >= 0.70
- intent drop <= 0.02
- specificity margin >= 0.15
- seed passes >= 4 / 5

Observed primary-run means:

| Metric | Observed | Frozen threshold | Gate-side result |
| --- | ---: | ---: | --- |
| Raw language accuracy | 0.49236 | >= 0.75 | **FAIL** |
| Effect retention | 0.87133 | >= 0.70 | pass |
| Intent drop | -0.00249 | <= 0.02 | pass |
| Specificity margin | 0.81686 | >= 0.15 | pass |
| Seed passes | 0 / 5 | >= 4 / 5 | **FAIL** |

Every frozen seed had raw language accuracy below 0.75 (`0.48267`, `0.49867`, `0.48267`, `0.49511`, `0.50267`). Because the implementation applies all four frozen metric conditions to each seed, all five `predeclared_seed_pass` values are false. No threshold was moved after outcome access.

## What the negative result does and does not say

The result **does not pass the predeclared real-encoder success gate**. It must not be rewritten as a positive result merely because language centering showed a large normalized leakage reduction or preserved intent accuracy in this run.

At the same time, the predeclared falsifier flags recorded by the runner are all false: mean effect retention did not fall below 30% of the parent effect, mean intent drop did not exceed 5 percentage points, and the generic controls did not match or beat the language-centering effect. The run also completed exact data/model materialization and retained provenance/checksums, and the observed language-centering reduction remained positive rather than reversing sign.

A defensible interpretation is therefore narrower: **the v3 success criterion failed because the frozen encoder's raw locale probe accuracy was far below the preregistered 0.75 floor, despite a strong and specific centering effect under the same diagnostic.** That makes the current protocol unsuitable for claiming success under its own frozen gate. Any future protocol revision must be labeled as a new preregistration and may not retroactively alter this verdict.

## Retained evidence

- `summary.json`: exact primary summary copied from the retained artifact.
- `verdict.json`: exact primary verdict copied from the retained artifact.
- `per_seed_metrics.jsonl`: all five exact primary per-seed rows.
- `SHA256SUMS.txt`: checksum manifest emitted by the one-shot wrapper for the original execution artifact set.
- `descriptive_uncertainty.json`: post-outcome arithmetic mean, sample SD, and two-sided 95% Student-t intervals across the five frozen seeds. This is descriptive reporting required by the preregistered statistics section; it **does not modify the frozen success gate or primary verdict**.

The broader claim boundary remains unchanged: frozen-encoder representation diagnostic only; no linguistic-relativity, cognition, translation-quality, universal-representation, fine-tuned-model, or model-superiority claim.
