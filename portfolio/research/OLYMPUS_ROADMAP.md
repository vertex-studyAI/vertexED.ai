# Olympus — evidence-backed maturity roadmap

**Evidence cutoff:** 12 August 2026  
**Scope:** connected `vertex-studyAI/vertexED.ai` sources only.  
**Current classification:** `BLOCKED_SOURCE / CONCEPT_FAMILY`.

## Evidence boundary

The connected portfolio registry records both **Hercules** and **Olympus** as blocked because their canonical repositories/results are unavailable. Olympus has no connected weights, training logs, benchmark artifacts, or runnable model source. Therefore model names and previously discussed parameter counts are roadmap labels only, not evidence that models exist.

## Clean architecture map

- **Hercules** = local-first engineering/model line. Its job is to establish a runnable compact model, memory/latency measurements, and one-at-a-time architecture ablations under consumer-hardware constraints.
- **Olympus** = research ladder above the shared compact baseline. Olympus should not duplicate Hercules training/inference infrastructure.
- **Hermes / Prometheus / Perseus / Atlas / Kronos** = reserved experiment/release labels inside Olympus. They do not represent trained models until a corresponding evidence package satisfies the gates below.

### Merge/remove decisions

1. **Merge shared stack with Hercules:** tokenizer/data loading, checkpoint format, training loop, inference loop, metrics, memory profiling, quantization utilities, and baseline transformer live once.
2. **Remove parameter-count identity:** a name is not defined by an aspirational parameter count.
3. **Remove duplicate local-release concept:** the first optimized local release belongs to Hercules/O4 infrastructure; Olympus may consume that release as a baseline but should not create a parallel local stack.
4. **Keep Olympus only for falsifiable architectural research:** each Olympus step must introduce one predeclared mechanism or scaling question and compare it against the shared baseline.

## Maturity ladder

| Gate | Meaning | Required evidence |
|---|---|---|
| O0 | toy architecture validation | model instantiation, forward/backward pass, tiny overfit, save/load, deterministic seed, baseline comparison |
| O1 | small controlled baseline | fixed dataset/split, reference transformer, reproducible train/eval command, loss/task metric, parameters, peak memory, latency |
| O2 | architecture ablation | exactly one Olympus modification at a time; matched-compute/parameter baseline; >=3 seeds where stochastic; negative results retained |
| O3 | medium-scale replication | same conclusion survives a larger but still affordable dataset/model; no hyperparameter rescue after seeing test results |
| O4 | optimized local release | quantized/local artifact with documented hardware, memory, throughput, latency, quality regression, checkpoint provenance |
| O5 | larger-scale training | only after O2/O3 effects reproduce and a written compute/resource budget justifies scale |

## Named-model status

The table describes **connected evidence**, not private/local work that is currently inaccessible.

| Name | Concept only | Implementation | Tested | Trained | Evaluated | Released |
|---|---:|---:|---:|---:|---:|---:|
| Olympus program | yes | no verified source | no | no | no | no |
| Hermes | yes | no verified source | no | no | no | no |
| Prometheus | yes | no verified source | no | no | no | no |
| Perseus | yes | no verified source | no | no | no | no |
| Atlas | yes | no verified source | no | no | no | no |
| Kronos | yes | no verified source | no | no | no | no |

## One achievable next milestone

**O0 target:** prove one small architecture delta against a vanilla reference model before any named model is promoted.

Freeze a tiny configuration that can run on the current 16-GB-class local machine. The experiment must:

1. instantiate a vanilla reference transformer and one Olympus variant with only **one** changed mechanism;
2. run forward + backward;
3. overfit a tiny batch;
4. save, reload, and reproduce inference;
5. train both under the same seed/data/optimizer budget;
6. report parameter count, peak memory, training throughput, evaluation loss/task metric, and inference latency;
7. repeat across at least three seeds if the metric is noisy;
8. preserve the result even if the Olympus variant loses.

Until the canonical Olympus source is exposed, the variant mechanism must remain **TBD** rather than being invented from old naming documents.

## Advancement gates

- **O0 -> O1:** all smoke tests pass and raw outputs/configs are retained.
- **O1 -> O2:** vanilla baseline reproduces; dataset and evaluation are frozen.
- **O2 -> O3:** predeclared Olympus effect is positive or scientifically informative across seeds; no hidden parameter/compute advantage.
- **O3 -> O4:** medium-scale replication agrees with O2 and local optimization has an explicit quality-regression budget.
- **O4 -> O5:** release is reproducible, resource budget is real, and a larger run answers a specific unresolved scientific question.

## Public-claim rule

Do not publish statements such as “Prometheus 128B,” “Atlas 2T,” or “Kronos 8T” as existing models unless checkpoints, training provenance, evaluation, and release evidence actually exist. Until then, use language such as **concept**, **planned experiment**, or **reserved roadmap name**.
