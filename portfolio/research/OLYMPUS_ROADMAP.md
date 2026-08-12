# Olympus — evidence-backed maturity roadmap

**Evidence cutoff:** 12 August 2026

## Decision

Olympus is the research-runtime/control-plane line. Hercules owns trainable model-architecture experiments. Percy owns durable task orchestration. The old Hermes / Prometheus / Perseus / Atlas / Kronos parameter-scale sequence remains a roadmap concept unless a specific learned checkpoint, training record and evaluation proves otherwise.

Do not let a shared name collapse software-role evidence into learned-model evidence.

## Architecture ownership

| Capability | Canonical owner | Status rule |
|---|---|---|
| hypothesis generation / task decomposition | Olympus / Prometheus | runtime role |
| adversarial falsification | Olympus / Perseus | runtime role |
| causal/counterfactual control | Olympus / Atlas | runtime role |
| verified tool execution | Olympus / Hermes | runtime role |
| persistent research-program state | Olympus / Kronos | runtime role |
| provenance / policy / evidence gates | Olympus | runtime architecture |
| Transformer / Mesh Convolution / tensor sharing | Hercules | learned-model research |
| quantization / KV cache / local inference | Hercules | learned-model/runtime optimization |
| JEPA-style predictor objectives | Hercules / research modules | learned-model research |
| queues / leases / retries / crash recovery | Percy | orchestration |
| 12B / 128B / 1T / 2T / 8T labels | frozen scale study | concept only absent checkpoints |

## Named model status

Hermes, Prometheus, Perseus, Atlas and Kronos may name implemented software roles in recovered Olympus runtime evidence, but that does **not** mean trained learned models with those names exist. No frontier-scale checkpoint, training-data lineage, compute record, learned-model evaluation or released weight artifact is established by the name alone.

## Maturity ladder

| Gate | Meaning | Current verdict |
|---|---|---|
| O0 | toy / deterministic architecture validation | **PASS for recovered runtime mechanics** |
| O1 | small controlled learned baseline | **NEXT** |
| O2 | mechanism ablation | not reached |
| O3 | medium-scale replication | not reached |
| O4 | optimized local release | not reached |
| O5 | larger-scale training | frozen until evidence justifies it |

## O1 preregistered experiment

**Question:** does explicit hypothesis → falsification → execution decomposition improve reliable task completion over a monolithic agent when the same learned provider and tool budget are used?

Freeze one open/local learned provider and exact version. Use the same task rows and budgets across:

1. monolithic agent;
2. full Olympus: Prometheus → Perseus → Hermes;
3. Olympus without Perseus;
4. Olympus without evidence enforcement.

Use roughly 100 tasks over at least two families and retain every task-level result.

Measure:

- reliable completion;
- schema validity;
- unsupported / incorrect claim rate;
- falsification catch rate;
- tool-execution correctness;
- evidence completeness;
- latency;
- token use;
- peak RAM.

### Frozen promotion gates

- Full Olympus must improve paired reliable completion by **≥5 percentage points** over monolithic and the paired-bootstrap 95% CI lower bound must exceed zero.
- Keep Perseus separate only if it improves falsification catch rate by **≥5 points** without reducing reliable completion.
- Keep evidence enforcement separate only if it reduces unsupported/incorrect claims by **≥30% relative** without reducing task success by more than 5 points.
- Do not promote if median latency or token use exceeds **1.5×** monolithic unless reliable completion improves by at least 10 points.
- If a component misses its ablation gate, merge/remove it instead of scaling it.

## Scale freeze

No larger Olympus training should occur before O1 exists. Any future learned model advances only through retained checkpoints, data/compute provenance, raw evaluations and reproducible commands. Parameter-count names are not maturity evidence.
