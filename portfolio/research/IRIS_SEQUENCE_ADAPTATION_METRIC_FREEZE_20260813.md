# IRIS v0.2 — Sequence Adaptation Metric Freeze — 13 August 2026

**Status:** development-metric preregistration only. No successor mechanism result is created by this file.

## Why this freeze exists

The retained IRIS v0.2 package identifies a concrete measurement gap: learned-sequence experiments report aggregate MSE/MAE but do not yet freeze sequence-level recovery time or transition-window error, even though persistent-shift adaptation is part of the scientific advancement criterion. The current PGR v0.2 learned holdout already fails promotion, and reserved successor confirmatory seeds `1000–1029` remain quarantined.

This document freezes adaptation metrics **before** any successor configuration is evaluated. It does not change the existing v0.2 result, mechanism, data, seed partition, or baseline evidence.

## Eligible data and seeds

Until a successor configuration is frozen, these metrics may be implemented and debugged only on existing development/stress families:

- development seeds: `0–9`;
- stress seeds: `10–19` where already defined by the retained development package;
- reserved confirmatory seeds: `1000–1029` — **forbidden until the successor mechanism, baseline family, statistic, thresholds, and falsifier are frozen**.

No result from seeds `1000–1029` may be used to choose metric constants or alter this freeze.

## Required trajectory inputs

For each sequence and method retain, at minimum:

- latent target/state `mu_t`;
- observation `x_t`;
- method estimate/memory `m_t`;
- known persistent-change onset `t0` for synthetic regime experiments;
- pre-change target `mu_pre` and post-change target `mu_post`;
- any method gate/persistence state when one exists;
- seed, condition, model/method identity, source hash, and configuration hash.

Synthetic transition metrics are valid only when `t0`, `mu_pre`, and `mu_post` are defined by the generator, not estimated after viewing predictions.

## Frozen primary adaptation metrics

Let the jump magnitude be

`D = max(abs(mu_post - mu_pre), 1e-8)`.

### 1. Transition-window normalized MSE

For the first `W = 25` samples beginning at the known change point,

`TWMSE25 = mean(((m_t - mu_t) / D)^2 for t = t0 .. min(t0+24, T-1))`.

If fewer than 25 post-change samples exist, the sequence is ineligible for this metric and must be reported as such; do not shorten the window after observing results.

Lower is better.

### 2. Recovery time

A method is recovered at the first post-change index `t >= t0` for which

`abs(m_j - mu_post) <= 0.10 * D`

holds for `K = 5` consecutive samples `j = t .. t+4`.

Define

`recovery_steps = t - t0`.

If recovery is never achieved before the final five-sample block, record the value as **right-censored** rather than substituting a favorable finite number. Report both the fraction recovered and the recovery-time distribution among eligible recovered sequences.

Lower is better; a method with a lower conditional recovery time but materially lower recovery fraction must not be declared superior on recovery.

### 3. Persistent post-change MSE

To separate fast opening from stable tracking, define

`POST_MSE50PLUS = mean((m_t - mu_t)^2 for t >= t0 + 50)`

when at least 25 samples remain after `t0 + 50`. Otherwise mark the sequence ineligible for this metric.

Lower is better.

## Frozen false-open diagnostic

For conditions with **no persistent state change** (Gaussian clean, isolated Student-t/heavy-tail corruption, isolated contamination, isolated spikes), a gate-bearing method must report:

`false_open_rate = number of samples classified/opened as persistent-change / number of eligible samples`.

The gate-open definition must come from the method's implementation/configuration and must be frozen before comparison. Do not retroactively redefine an "open" from trajectories to improve this number.

For methods without a gate, report `not_applicable`; do not invent proxy opens.

## Comparison and aggregation policy

For every method and condition report:

- seed count `n`;
- mean and sample standard deviation for `TWMSE25` and `POST_MSE50PLUS`;
- recovery fraction;
- median recovery steps and an uncertainty interval appropriate for censored data when available;
- false-open rate for gate-bearing methods;
- parameter count, training budget, runtime, and memory where learned models are compared.

Use paired seed comparisons whenever methods share identical generated sequences. Retain per-seed raw rows. Do not report statistical significance unless a suitable predeclared analysis is run.

## Baseline requirement

A successor IRIS adaptation claim must be evaluated against, at minimum, the strongest available members of these categories in a common matched harness where feasible:

1. plain Huber/static robust update;
2. confirmed-change Huber or equivalent simple robust change-aware baseline;
3. robust switching/changepoint baseline;
4. current frozen IRIS/PGR mechanism;
5. a matched learned recurrent baseline when compute permits.

The current development evidence already shows that faster switching can be purchased with high false-open rates under isolated corruption. Therefore recovery time alone is insufficient for promotion.

## Promotion boundary

These metrics do **not** create a new positive result. A successor mechanism may advance to untouched confirmatory evaluation only after, on frozen development/stress seeds:

- clean-data non-inferiority is satisfied under its separately frozen gate;
- isolated heavy-tail/corruption behavior is not rescued by unacceptable false-open behavior;
- persistent-shift performance is competitive on both `TWMSE25` and recovery behavior against the strong change-aware baselines;
- the configuration, baseline family, statistics, and falsifier are frozen before confirmatory access.

If these conditions are not met, preserve the negative development result and do not access seeds `1000–1029`.

## Claim boundary

This freeze supports only a more defensible future test of adaptation. It does not establish IRIS/PGR superiority, external validity, novelty, or submission readiness. The existing v0.2 result remains a reproducible negative/mixed development result.