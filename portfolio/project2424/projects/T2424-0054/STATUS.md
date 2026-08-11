# T2424-0054 Status

**Project:** Theory-Manifold Experiment Planner  
**Project 2424 ID:** T2424-0054  
**Queue rank:** 47  
**Track:** C — Existing work → minimum experiment  
**State:** TESTED_TOOL / MANUAL_MERGE_PENDING  
**Claim level:** deterministic heuristic planning-tool mechanics

## Implemented

- [x] validated candidate schema
- [x] transparent cost-normalized acquisition score
- [x] hard dependency blocking
- [x] deterministic ranking/tie-breaks
- [x] hard-budget batch selection
- [x] repeated-family diversity penalty
- [x] evidence update for expected value/uncertainty
- [x] decision ledger + runnable demonstration
- [x] five regression invariants
- [x] frozen claim/protocol
- [x] canonical recovery CI passed on head `0031aef118db4a155b7d278c2c9efbe0542ae58f`, run `31457110484`

## Provenance

Legacy head `2e2b602aa75768b4ba1983f30ec27ca36f7419b9` passed canonical CI `31409829495`. The current-main canonical recovery then passed CI `31457110484` on head `0031aef118db4a155b7d278c2c9efbe0542ae58f`.

This status-only update creates a newer head, so canonical CI must pass again before the separate manual merge decision.

## Certification boundary

Repository integration validates only deterministic planner mechanics on frozen illustrative inputs. It does not validate the priors, candidate hypotheses, scientific value estimates, or any spending/compute decision. This package is not Certified complete or research-complete.

## Not claimed

- optimal Bayesian design
- validated candidate priors
- authorization to spend/compute
- scientific correctness oracle
- publication novelty
- research completion
- Certified complete
