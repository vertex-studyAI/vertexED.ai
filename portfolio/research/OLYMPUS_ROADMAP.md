# Olympus — evidence-backed maturity roadmap

**Evidence cutoff:** 12 August 2026  
**Claim boundary:** software-role evidence and learned-model evidence are separate.

## Decision

Olympus should no longer mean a speculative parameter-scale model family. Recovered portfolio artifacts establish a second, concrete meaning: a deterministic typed research runtime whose software roles are **Prometheus -> Perseus -> Atlas -> Hermes -> Kronos**, with supporting provenance/policy/evidence components. The recovered runtime is explicitly not a trained frontier model or AGI system.

The old scale sequence **Hermes / Prometheus / Perseus / Atlas / Kronos** remains only a frozen roadmap concept. No corresponding frontier checkpoints, training logs, data lineage, compute records, learned-model evaluations, or released weights are claimed.

## Clean architecture map

| Capability | Canonical owner | Decision |
|---|---|---|
| hypothesis generation / task decomposition | Olympus / Prometheus | keep |
| adversarial falsification | Olympus / Perseus | keep |
| causal/counterfactual world control | Olympus / Atlas | keep |
| verified tool execution | Olympus / Hermes | keep |
| persistent research-program state | Olympus / Kronos | keep |
| provenance / policy / evidence gates | Olympus runtime | keep |
| transformer architecture | Hercules | move out of Olympus |
| Mesh Convolution / tensor sharing | Hercules | Hercules-only |
| quantization / KV-cache / local inference | Hercules | Hercules-only |
| sparse/selective activation | Hercules | Hercules-only |
| JEPA predictor/model objectives | Hercules / research modules | Hercules-only |
| durable worker queues, leases, retries, crash recovery | Percy | Percy-only |
| 12B/128B/1T/2T/8T Olympus labels | frozen scale study | not model artifacts |

**Resolution:** Olympus owns the research-runtime/control-plane architecture. Hercules owns trainable model architecture. Percy owns durable orchestration.

## Named status

The same names have two different evidence statuses and must not be conflated.

| Name | Scale-model concept | Recovered runtime implementation | Runtime tested | Trained learned model | Learned-model evaluated | Released weights |
|---|---:|---:|---:|---:|---:|---:|
| Hermes | yes | yes | yes | no | no | no |
| Prometheus | yes | yes | yes | no | no | no |
| Perseus | yes | yes | yes | no | no | no |
| Atlas | yes | yes | yes | no | no | no |
| Kronos | yes | yes | yes | no | no | no |

Public wording:

> Olympus is an experimental typed research-runtime architecture. Hermes, Prometheus, Perseus, Atlas and Kronos currently name software roles in that runtime. Previously discussed parameter-scale versions are roadmap concepts only; no corresponding trained frontier checkpoints are being claimed.

## Maturity ladder

| Gate | Meaning | Current verdict |
|---|---|---|
| O0 | toy architecture validation | **PASS for deterministic runtime** |
| O1 | small controlled learned baseline | **NEXT** |
| O2 | architecture ablation | not reached |
| O3 | medium-scale replication | not reached |
| O4 | optimized local release | not reached |
| O5 | larger-scale training | frozen |

### Advancement rules

- **O0 -> O1:** deterministic runtime tests, provenance, persistence and failure handling pass.
- **O1 -> O2:** one small learned-provider experiment produces a reproducible baseline with raw task-level results.
- **O2 -> O3:** at least two task families and multiple seeds show that the claimed Olympus mechanism—not merely the underlying model—causes the effect.
- **O3 -> O4:** clean-machine reproduction, fixed model/provider version, latency/RAM/token accounting, failure taxonomy and documentation.
- **O4 -> O5:** only after scaling curves indicate benefit and the project can document training data, weights, compute budget, checkpoints and evaluation.

## O1 preregistered experiment

**Question:** Does decomposition into explicit hypothesis/falsification/execution roles improve reliable research-task completion compared with a monolithic agent using the same underlying model and tool budget?

Freeze one small local/open learned provider and its exact version. Compare the same tasks and budgets across:

1. **Monolithic:** one agent solves the task.
2. **Full Olympus:** Prometheus -> Perseus -> Hermes.
3. **Olympus - Perseus:** remove adversarial falsification.
4. **Olympus - evidence gate:** remove evidence enforcement.

Use approximately 100 deterministic benchmark tasks spanning at least two task families. Preserve raw task rows.

Measure:

- reliable/task completion;
- schema validity;
- unsupported/incorrect-claim rate;
- falsification catch rate;
- tool-execution correctness;
- evidence completeness;
- latency;
- token use;
- peak RAM.

### Frozen promotion gate

Before real-provider results are generated:

- full Olympus must improve paired reliable-completion rate by **>=5 percentage points** versus monolithic and the 95% paired-bootstrap CI lower bound must be >0;
- Perseus remains separate only if it improves falsification catch rate by **>=5 percentage points** without worsening reliable completion;
- evidence enforcement remains separate only if it reduces unsupported/incorrect claims by **>=30% relative** without reducing task success by >5 percentage points;
- do not promote if median latency or token use exceeds **1.5x** monolithic unless reliable completion improves by >=10 percentage points;
- if a component fails its ablation gate, merge/remove it instead of scaling it.

## Verification performed on recovered runtime

A recovered `olympus.pyz` was exercised in a fresh sandbox on 12 August 2026. `doctor` reported the deterministic Hermes/Prometheus/Perseus/Atlas/Kronos modules healthy, and the built-in architectural smoke benchmark completed successfully. That benchmark self-identifies as synthetic architectural validation and explicitly does **not** establish frontier-model capability.

The O1 harness and 100-task benchmark plumbing also pass with a mock oracle. Mock results are plumbing evidence only. **O1 remains unpassed until the same harness is run with one frozen real learned provider.**

## Scale freeze

No larger Olympus training should occur before O1 exists. Parameter-count names are not maturity evidence. Any future learned model must advance through O0-O5 using checkpoints, data/compute provenance, raw evaluations and reproducible commands rather than naming or aspirational scale.