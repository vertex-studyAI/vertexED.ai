# T2424-0037 Status

**Project:** NLP-to-CAD  
**Project 2424 ID:** T2424-0037  
**Queue rank:** 30  
**Track:** C — Existing work → minimum experiment  
**State:** TESTED_DEMO / MANUAL_MERGE_PENDING  
**Claim level:** controlled-language CAD compiler demo

## Implemented

- [x] controlled plate-language parser
- [x] parametric intermediate representation
- [x] 1/2/4-hole layouts
- [x] dimension and geometry validation
- [x] OpenSCAD generation and SVG preview generation
- [x] geometry summary metrics
- [x] browser demo
- [x] parser/geometry regression suite
- [x] frozen `CLAIM.md` and `PROTOCOL.md`
- [x] explicit scope and safety boundary
- [x] final pre-refresh status head `53d2861da4d9dc73259552bfe3c7ec77853db591` passed canonical CI `31457325080`

## Provenance

Legacy implementation head `e06c91133dcc16f9e1846dde9b6908a0c64d16bc` passed canonical CI `31410049687`. The current canonical recovery preserves that controlled compiler implementation.

## Latest-base integration refresh

Repository `main` advanced to `662de36af18b1251e6441391ac3fc06df7a3bf71` via monitoring-only PR #243, which does not touch this package. This status refresh intentionally creates a new head so canonical CI revalidates the latest pull-request merge ref before manual review.

Repository integration validates the controlled-language compiler demo only. This package remains unmerged and is not nine-gate certified.

**DO NOT AUTO-MERGE OR DEPLOY. MANUAL REVIEW REQUIRED.**

## Not claimed

- arbitrary-language understanding
- arbitrary CAD generation
- CAD-kernel validation
- manufacturing correctness
- production deployment
- research novelty
- Certified complete
