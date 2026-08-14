# TIER A EXPERIMENT SELECTION — 2026-08-14

**Decision:** select exactly **one** Tier A scientific experiment for the next active slot: **T2424-0027 real multilingual-encoder diagnostic**.

This decision is about the next experiment slot only. It does not promote T2424-0027 to Tier S or claim that its synthetic effect transfers to real models.

## Candidates

| Candidate | Existing evidence | Decisive next question | Information gain | Remaining cost | Closure probability | Negative-result value | Current blocker | Decision |
|---|---|---|---:|---:|---:|---:|---|---|
| **T2424-0027 real encoder** | deterministic synthetic audit passes frozen mechanics gate: normalized excess leakage reduction `0.95833` vs `>=0.90`; negative control retained | does the same intervention reduce language leakage in a real fixed multilingual encoder **without destroying concept/task signal**, relative to simple centering/projection controls? | **5/5** | **2/5** | **4/5** | **5/5** | exact public model/dataset/probe protocol not yet frozen | **SELECT** |
| Darcy / T2424-0050 learned + OOD | very strong bounded 1D synthetic pressure screen | does the reduced representation beat or complement matched learned operators across 2D/OOD/misaligned physical regimes? | 4/5 | 4/5 | 3/5 | 4/5 | requires fair learned-operator implementation/budget + richer physical data/generator | HOLD |
| NPMS / T2424-0019 learned/OOD | recovered compact synthetic evidence with important preserved negatives | does original NPMS survive a clean source rerun and then learned/OOD controls? | 3/5 | 4/5 | 2/5 | 4/5 | **original source/config/checkpoint not migrated or cleanly rerun; external dataset absent** | **DO NOT RUN SCIENCE YET** |

## Why T2424-0027 wins this slot

### 1. It attacks the largest current evidence gap directly

The existing claim is explicitly synthetic. A single preregistered real-encoder diagnostic can determine whether the observed latent-language geometry is merely a constructed linear algebra effect or survives in a real representation space.

### 2. It is cheap enough to run fairly

The intended study should freeze one or a very small number of public pretrained multilingual encoders, a bounded public dataset, fixed probes, fixed projection/intervention rules, multiple random probe seeds where applicable, and strong negative controls. It should not require training a large model from scratch.

### 3. A negative result is highly valuable

If the intervention fails on real representations, damages concept/task information, or is matched by global centering/random subspace controls, the synthetic project can be closed honestly as a mechanics-only diagnostic. That is high closure value.

### 4. It does not require inventing a new mechanism first

Darcy's next fair test requires building/choosing matched learned operators and expanding the physics regime. NPMS must recover its original source before a new scientific experiment is legitimate. T2424-0027 already has a bounded executable mechanism and a precise external-validity question.

## Frozen scientific question for the selected study

> In a fixed pretrained multilingual encoder, can a language-specific latent-direction intervention reduce probe-accessible language identity while preserving task/concept information better than global centering, random matched-dimensional projection, and no intervention?

This question deliberately avoids linguistic-relativity or semantic-universality claims.

## Required dangerous controls

Before execution, the protocol must include:

1. **no intervention**;
2. **global centering**;
3. **random matched-dimensional subspace removal**, repeated under a frozen seed policy;
4. **language-label permutation / probe sanity control** where appropriate;
5. **concept/task-label permutation control** where appropriate;
6. **capacity-matched probe family** across all representations;
7. a simple **supervised language-direction removal** comparator if the selected dataset labels permit one without leakage;
8. frozen original synthetic transform as the method arm.

If a simpler control matches the method, no mechanism novelty is claimed.

## Metrics to freeze before execution

At minimum:

- language-probe accuracy / excess over chance;
- task/concept-probe accuracy;
- normalized leakage reduction relative to no intervention;
- concept/task retention relative to no intervention;
- representation variance/rank diagnostics to detect trivial collapse;
- per-language and aggregate results;
- uncertainty across probe/random-control seeds;
- compute/runtime and exact model/data revisions.

## Falsifier

The real-encoder relevance hypothesis fails if any of the following occurs under the frozen protocol:

- language leakage is not reduced meaningfully relative to no intervention;
- concept/task performance degrades beyond the frozen retention tolerance;
- global centering or random matched-dimensional removal performs equivalently or better;
- the result depends on one probe architecture/seed/language pair;
- representation collapse explains the apparent leakage reduction.

## Execution status

`SELECTED / NOT YET EXECUTION-FROZEN`.

Before any model inference or probe fitting, freeze:

- exact encoder model + revision/hash;
- exact dataset + version/split/hash;
- language subset;
- task/concept target;
- preprocessing/tokenization;
- representation layer/pooling;
- intervention calculation using development data only where fitting is required;
- probe train/dev/test split;
- random/probe seed lists;
- retention tolerance and minimum leakage-reduction effect;
- statistics/aggregation rule;
- failure handling.

Do not run a broad encoder sweep and select the most favorable model. Start with one frozen real encoder. A second encoder is replication only after the first result is recorded.

## Non-selected candidates

### Darcy

Remain `C — CONTINUE EXPERIMENTATION`, but no major compute this slot. Next work is protocol design for a fair learned/OOD comparison, not another 1D synthetic rerun.

### NPMS

Remain `SOURCE_MIGRATION_PENDING / EXTERNAL_UNVALIDATED`. The next legitimate NPMS task is source/config/checkpoint recovery and a clean rerun, **not** a new scientific result.
