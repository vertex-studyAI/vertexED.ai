# T2424-0035 Status

**Project:** Grokking Agent  
**Project 2424 ID:** T2424-0035  
**Queue rank:** 28  
**Track:** C — Existing work → minimum experiment  
**State:** TESTED_TOOL / MANUAL_MERGE_PENDING  
**Claim level:** deterministic delayed-generalization detector mechanics

## Implemented

- [x] strict learning-curve validation
- [x] causal trailing smoothing
- [x] persistent train/eval threshold detection
- [x] memorization/generalization delay classification
- [x] eval-at-memorization guard
- [x] delayed synthetic positive fixture
- [x] matched non-grokking control
- [x] runnable experiment
- [x] focused regression suite
- [x] frozen claim/protocol
- [x] canonical recovery CI passed on head `34a76d8600f7bfcfb7158578b37bdc5c23b2f698`, run `31456990863`

## Provenance

Legacy head `89e55c7e466f34e54bfc5c870a6ad056a5f034b1` passed canonical CI `31409649210`. The canonical recovery passed CI `31456990863` on head `34a76d8600f7bfcfb7158578b37bdc5c23b2f698`.

This status-only update creates a newer head, so canonical CI must pass again before the separate manual merge decision.

## Certification boundary

Repository tests validate detector mechanics on the frozen deterministic fixtures only. The package remains unmerged, non-certified and non-research-complete.

## Not claimed

- grokking in a real trained model
- causal/theoretical mechanism
- autonomous training
- external validation
- publication novelty
- research completion
- Certified complete
