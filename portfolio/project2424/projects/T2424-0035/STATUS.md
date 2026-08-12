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
- [x] delayed synthetic positive fixture and matched non-grokking control
- [x] runnable experiment and focused regression suite
- [x] frozen claim/protocol
- [x] final pre-refresh status head `f3edc0e87f4d9d03bf9bb639a8b2d1c6a6d93737` passed canonical CI `31457341269`

## Provenance

Legacy head `89e55c7e466f34e54bfc5c870a6ad056a5f034b1` passed canonical CI `31409649210`. The current canonical recovery preserves that deterministic detector rather than reconstructing it.

## Latest-base integration refresh

Repository `main` advanced to `662de36af18b1251e6441391ac3fc06df7a3bf71` via monitoring-only PR #243, which does not touch this package. This status refresh intentionally creates a new head so canonical CI revalidates the latest pull-request merge ref before manual review.

Repository tests validate detector mechanics on the frozen deterministic fixtures only. The package remains unmerged, non-certified and non-research-complete.

**DO NOT AUTO-MERGE OR DEPLOY. MANUAL REVIEW REQUIRED.**

## Not claimed

- grokking in a real trained model
- causal/theoretical mechanism
- autonomous training
- external validation
- publication novelty
- research completion
- Certified complete
