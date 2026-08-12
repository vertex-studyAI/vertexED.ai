# Olympus — evidence-backed maturity roadmap

**Audit date:** 12 August 2026  
**Evidence source:** connected `vertex-studyAI/vertexED.ai` Project 2424 registry, execution records, Percy governance documentation and current GitHub search surface.

## Truth boundary

The names **Hermes, Prometheus, Perseus, Atlas and Kronos do not constitute trained models**. No connected evidence found current model definitions, training configs, checkpoints, benchmark outputs or release artifacts for Prometheus, Perseus, Atlas or Kronos. `Hermes 12B` appears in the Project 2424 First-100 queue as an **Architecture** entry; the `12B` suffix is therefore an aspirational roadmap label, not evidence of a 12-billion-parameter checkpoint.

The connected registry likewise classifies `Hercules Local AGI` as `Concept / Architecture`. Hercules has a separately defined engineering ladder in the portfolio and should own concrete local-model architectural experiments rather than being duplicated inside Olympus.

## Cleaned architecture map

```text
Hercules
  = local-model engineering / architecture research
  = reference baseline → one modification → ablation → combined system only after evidence

Olympus
  = maturity and scale governance ladder
  = no independent architecture until a concrete experiment earns one

Historical/aspirational aliases
  Hermes / Prometheus / Perseus / Atlas / Kronos
  = names only until tied to a reproducible artifact at a defined Olympus stage
```

### Merge/remove decisions

1. **Merge all local-first architecture experimentation into Hercules.** Mesh/convolutional elements, JEPA-inspired prediction, selective predictors and quantization should be evaluated there one modification at a time.
2. **Remove parameter-count names from maturity claims.** `Hermes 12B` may remain as a historical/future alias, but not as a current model status.
3. **Do not maintain Prometheus, Perseus, Atlas and Kronos as separate active development tracks.** They are roadmap aliases until an actual resource plan and model artifact exist.
4. **Do not conflate the `Atlas` model alias with any local workspace/directory named Atlas.** A workspace name is not model evidence.
5. **Olympus becomes the promotion ladder, not a parallel collection of speculative architectures.**

## Olympus maturity ladder

### O0 — toy architecture validation

Purpose: prove one bounded architectural question can run end-to-end.

Required evidence:

- tiny reference Transformer or other explicit reference model;
- exactly one proposed modification;
- model instantiation;
- forward pass;
- backward/gradient pass;
- tiny overfit test;
- checkpoint save/load;
- deterministic seed/config;
- parameter count, peak memory, throughput and loss/task metric;
- code and output paths.

Promotion gate: the experiment reproduces and the modification has a measurable, interpretable effect without breaking the reference path. Improvement is not required at O0; falsification is acceptable.

### O1 — small controlled baseline

Purpose: establish a stable reference before novelty.

Required evidence:

- frozen small dataset/task;
- at least three seeds where feasible;
- reference configuration and environment lock;
- mean + variance for primary metric;
- memory/throughput/latency accounting;
- clean rerun from a fresh checkout.

Promotion gate: baseline is reproducible enough that an ablation can be interpreted.

### O2 — architecture ablation

Purpose: determine whether an Olympus/Hercules modification actually adds value.

Required evidence:

- baseline vs one modification under identical data/training budget;
- predeclared primary metric and failure threshold;
- component-off ablation;
- parameter/compute-matched comparison where practical;
- multiple seeds;
- negative results retained.

Promotion gate: effect is reproducible and worth its quality/compute/memory tradeoff. Otherwise merge, revise or kill the idea.

### O3 — medium-scale replication

Purpose: test whether the effect survives a meaningful increase in model/data scale.

Required evidence:

- same hypothesis at materially larger but affordable scale;
- at least one additional dataset/task or held-out distribution;
- training stability and convergence records;
- compute budget and wall-clock accounting;
- independent clean reproduction.

Promotion gate: the O2 effect survives scale/replication rather than disappearing as a toy artifact.

### O4 — optimized local release

Purpose: ship a real local model artifact.

Required evidence:

- downloadable checkpoint or reproducible build path;
- tokenizer/data/license provenance;
- quantization/inference configuration;
- consumer-hardware memory and latency measurements;
- smoke + regression suite;
- model card, limitations and supported-use boundary;
- release hash/version.

Promotion gate: another person can run the artifact on the stated hardware and reproduce the advertised measurements.

### O5 — larger-scale training only when resources justify it

Purpose: scale a demonstrated result, not a name.

Required before training begins:

- O2/O3 evidence supporting the architectural bet;
- explicit parameter target justified by scaling objective, not branding;
- data availability/licensing plan;
- compute, storage and monetary budget;
- checkpoint/recovery/monitoring plan;
- evaluation suite fixed in advance;
- stop-loss criteria for failed training.

No O5 model exists merely because a parameter count has been proposed.

## Named-model status

| Name | Concept | Implementation | Tested | Trained | Evaluated | Released | Current evidence-backed classification |
|---|---|---|---|---|---|---|---|
| Olympus | yes | no connected model implementation | no | no | no | no | **roadmap / maturity framework** |
| Hermes | yes | no connected model package found | no | no | no | no | **architecture concept / aspirational alias** |
| Prometheus | yes | none found | no | no | no | no | **concept only** |
| Perseus | yes | none found | no | no | no | no | **concept only** |
| Atlas | yes | none found for the model alias | no | no | no | no | **concept only; do not confuse with workspace naming** |
| Kronos | yes | none found | no | no | no | no | **concept only** |

## One executable next milestone

**O0-H1 comparison:** tiny reference Transformer vs exactly one Hercules modification.

Recommended first modification: whichever Hercules component already has the smallest runnable implementation after source inspection. Do **not** combine mesh/convolution, JEPA, selective prediction and quantization in one experiment.

Minimum command contract to create once source is available:

```text
train reference --seed 7 --tiny-config
train modification-A --seed 7 --tiny-config
repeat seeds 19, 41
evaluate both with identical evaluation command
emit JSON containing params, peak_memory_mb, tokens_per_second, train_loss, validation_metric
```

The experiment should be chosen so it can finish on consumer hardware. A small real falsification is the advancement gate; a speculative 12B/128B/1T roadmap is not.

## Advancement evidence rule

A name may move from `concept` to `implementation` only when a canonical code/config path exists. It may move to `tested` only with exact-head test evidence. `trained` requires a checkpoint and training provenance. `evaluated` requires a fixed evaluation artifact. `released` requires an externally runnable versioned artifact. These labels are cumulative and must never be inferred from naming or documentation alone.
