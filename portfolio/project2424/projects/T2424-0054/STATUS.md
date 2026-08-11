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
- [x] final pre-refresh status head `eb6fd52c74c890183a77c3137678667fe7fbf2d0` passed canonical CI `31457540595`

## Provenance

Legacy head `2e2b602aa75768b4ba1983f30ec27ca36f7419b9` passed canonical CI `31409829495`. The current canonical recovery preserves that deterministic planner implementation.

## Latest-base integration refresh

Repository `main` advanced to `662de36af18b1251e6441391ac3fc06df7a3bf71` via monitoring-only PR #243, which does not touch this package. This status refresh intentionally creates a new head so canonical CI revalidates the latest pull-request merge ref before manual review.

Repository integration validates only deterministic planner mechanics on frozen illustrative inputs. It does not validate the priors, candidate hypotheses, scientific value estimates, or any spending/compute decision. This package is not Certified complete or research-complete.

**DO NOT AUTO-MERGE OR DEPLOY. MANUAL REVIEW REQUIRED.**

## Not claimed

- optimal Bayesian design
- validated candidate priors
- authorization to spend/compute
- scientific correctness oracle
- publication novelty
- research completion
- Certified complete
