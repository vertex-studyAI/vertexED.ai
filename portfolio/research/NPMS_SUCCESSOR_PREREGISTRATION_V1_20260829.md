# NPMS successor preregistration v1 — 2026-08-29

State: `PREREGISTERED_SCIENTIFIC_QUESTION / EXECUTION_BLOCKED_PENDING_IDENTITIES`

This protocol is a successor to the controlled NPMS study. It does not alter the frozen `PARAMETER_CONFOUNDED_OR_NON_UNIQUE` verdict and must not reuse the old study as evidence for a stronger mechanism claim.

## Scientific question

Does a predeclared NPMS memory-spectrum representation predict a held-out behavioral or intervention-response target beyond strong coordinate-invariant parameter summaries and strong state-space/spectral controls under matched information and compute budgets?

## Primary null and falsifier

Primary null: after controlling for matched coordinate-invariant parameter summaries and strong state-space/spectral baselines, NPMS provides no material held-out predictive advantage.

Falsifier: if the best matched non-NPMS control is within the predeclared practical-equivalence margin of NPMS, or exceeds NPMS, classify the mechanism claim as `NON_UNIQUE_OR_CONTROL_MATCHED` rather than positive.

No practical-equivalence margin is chosen in this document. It must be fixed numerically before outcome access.

## Required arms

All arms must consume the same frozen train/validation/test examples and target labels.

1. `NPMS`: the successor memory-spectrum feature set.
2. `PARAMETER`: coordinate-invariant parameter summaries that do not use NPMS spectra.
3. `STATE_SPACE`: a strong state-space/system-identification representation matched for access to trajectories.
4. `SPECTRAL_CONTROL`: a conventional spectral representation matched for preprocessing access.
5. `COMBINED_CONTROL`: the strongest admissible non-NPMS combination chosen from training/validation data only.

The exact algorithms, hyperparameter spaces, preprocessing, and dimensionality/budget matching rules must be frozen before execution.

## Split and selection firewall

- exact dataset/version hashes must be recorded;
- train/validation/test identities must be immutable;
- test labels/outcomes are inaccessible during model, feature, threshold, and margin selection;
- all tuning uses training/validation only;
- failed or negative validation outcomes remain retained evidence;
- no seed, example, subgroup, or metric may be removed after outcome access except under a predeclared data-integrity rule.

## Required metrics

Before execution, freeze:

- one primary predictive metric appropriate to the target;
- one calibration or reliability metric when probabilistic predictions are used;
- uncertainty procedure and confidence interval definition;
- practical-equivalence margin;
- missing-data rule;
- aggregation rule across seeds/tasks if multiple are used.

Secondary metrics may be descriptive but cannot rescue a failed primary gate.

## Matched-budget requirement

Before execution, define and hash a budget table covering for every arm:

- input information available;
- trainable parameter count, if applicable;
- feature dimensionality or explicit rationale for mismatch;
- hyperparameter-search budget;
- number of training/evaluation seeds;
- wall-clock/accelerator budget or an equivalent compute accounting unit.

A budget mismatch discovered after execution invalidates the positive gate unless it was explicitly preregistered as an analysis stratum.

## Advancement rule

A positive successor result requires all of the following:

- NPMS exceeds the strongest admissible non-NPMS control on the frozen primary metric;
- the improvement exceeds the frozen practical-equivalence margin;
- the uncertainty procedure excludes the practical-equivalence/null region according to the frozen decision rule;
- no integrity, split, budget, or provenance violation is present;
- the result is not dependent on post-hoc seed/example exclusion.

Otherwise classify as one of:

- `NON_UNIQUE_OR_CONTROL_MATCHED`
- `NO_RELIABLE_ADVANTAGE`
- `BUDGET_INVALID`
- `PROVENANCE_BLOCKED`
- `EXECUTION_INVALID`

Negative classifications are valid scientific endpoints.

## Integrity locks

Forbidden after any held-out outcome access:

- changing the primary metric;
- changing the practical-equivalence margin;
- changing the primary target;
- adding favorable seeds;
- dropping unfavorable seeds/examples/subgroups;
- weakening a baseline;
- changing the NPMS representation to rescue the result;
- promoting a secondary metric to primary;
- treating exploratory ablations as confirmatory evidence.

## Execution authorization gate

Execution remains blocked until one immutable authorization artifact records:

- canonical source commit;
- exact dataset/version hashes and license/access provenance;
- exact split manifest hash;
- exact arm implementations and configurations;
- fixed seed list;
- fixed primary metric and decision thresholds;
- uncertainty procedure;
- matched-budget table;
- environment/container identity;
- compute cap;
- raw-evidence retention paths and hash procedure.

Until that artifact exists, status remains `EXECUTION_BLOCKED_PENDING_IDENTITIES`.
