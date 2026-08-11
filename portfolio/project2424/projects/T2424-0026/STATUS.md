# T2424-0026 Status

**Project:** Counterfactual Defect Worlds  
**Project 2424 ID:** T2424-0026  
**Queue rank:** 19  
**Track:** C — Existing work → minimum experiment  
**State:** TESTED_TOOL / MANUAL_MERGE_PENDING  
**Claim level:** deterministic causal-intervention simulator + locality tests

## Implemented

- [x] canonical First-100 identity path
- [x] falsifiable claim
- [x] frozen minimum protocol
- [x] elementary cellular automaton transition kernel
- [x] deterministic baseline simulator
- [x] localized flip/set intervention
- [x] paired counterfactual simulation
- [x] Hamming/fraction divergence tracking
- [x] exact differing-index evidence
- [x] causal-cone violation detector
- [x] deterministic seed generator
- [x] runnable Rule-110 minimum experiment
- [x] causal locality regression suite
- [x] explicit GO/STOP verdict in experiment output
- [x] limitations and claim boundary
- [x] latest-main recovery CI passed on head `67b9df0972449a620731c3bd26a9dc445485c439`, run `31457031321`

## Current evidence gate

The immediately preceding recovery head passed canonical GitHub Actions and established repository integration of the deterministic implementation/regression suite. This status-only update creates a newer head, so canonical CI must pass again before the separate manual merge decision.

Green CI does not satisfy the nine-gate `Certified complete` contract because retained raw evidence, independent reproduction, broader ablation/negative-result packaging, and external validity remain incomplete.

## Not claimed

- learned world-model performance
- physical realism
- causal discovery from observational data
- scientific transfer from cellular automata
- publication novelty
- Certified complete

## Next artifact

Retain the exact frozen experiment JSON as an evidence artifact after exact-head execution, add an independent QA path that checks claim ↔ raw-output consistency, then extend only under a separately frozen stochastic/learned-model protocol.
