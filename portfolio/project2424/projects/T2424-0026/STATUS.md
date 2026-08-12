# T2424-0026 Status

**Project:** Counterfactual Defect Worlds  
**Project 2424 ID:** T2424-0026  
**Queue rank:** 19  
**Track:** C — Existing work → minimum experiment  
**State:** TESTED_TOOL / MANUAL_MERGE_PENDING  
**Claim level:** deterministic causal-intervention simulator + locality tests

## Implemented

- [x] canonical First-100 identity path
- [x] falsifiable claim and frozen minimum protocol
- [x] elementary cellular automaton transition kernel
- [x] deterministic baseline simulator
- [x] localized flip/set intervention and paired counterfactual simulation
- [x] Hamming/fraction divergence tracking and exact differing-index evidence
- [x] causal-cone violation detector
- [x] deterministic seed generator
- [x] runnable Rule-110 minimum experiment
- [x] causal locality regression suite
- [x] explicit GO/STOP verdict and limitations
- [x] final pre-refresh status head `63bb6cf0ab946681323bb752de65ecc4635badb4` passed canonical CI `31457353108`

## Latest-base integration refresh

Repository `main` advanced to `662de36af18b1251e6441391ac3fc06df7a3bf71` via monitoring-only PR #243, which does not touch this package. This status refresh intentionally creates a new head so canonical CI revalidates the pull-request merge ref against the latest base before manual review.

Green CI does not satisfy the nine-gate `Certified complete` contract because retained raw evidence, independent reproduction, broader ablation/negative-result packaging, and external validity remain incomplete.

**DO NOT AUTO-MERGE OR DEPLOY. MANUAL REVIEW REQUIRED.**

## Not claimed

- learned world-model performance
- physical realism
- causal discovery from observational data
- scientific transfer from cellular automata
- publication novelty
- Certified complete

## Next artifact

Retain the exact frozen experiment JSON as an evidence artifact after exact-head execution, add an independent QA path that checks claim ↔ raw-output consistency, then extend only under a separately frozen stochastic/learned-model protocol.
