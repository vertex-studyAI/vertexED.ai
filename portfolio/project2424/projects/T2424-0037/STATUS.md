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
- [x] OpenSCAD generation
- [x] SVG preview generation
- [x] geometry summary metrics
- [x] browser demo
- [x] parser/geometry regression suite
- [x] frozen `CLAIM.md`
- [x] frozen `PROTOCOL.md`
- [x] explicit scope and safety boundary
- [x] canonical recovery CI passed on head `3df43264089d2767e86b5e67bdfa41284e1ebd16`, run `31456830498`

## Provenance

Legacy implementation head `e06c91133dcc16f9e1846dde9b6908a0c64d16bc` passed canonical CI run `31410049687`. The canonical recovery then passed run `31456830498` on head `3df43264089d2767e86b5e67bdfa41284e1ebd16`.

This status-only update creates a newer head, so canonical CI must pass again before the separate manual merge decision.

## Promotion gate

Repository integration is demonstrated on the preceding exact head, but this package remains unmerged and is not nine-gate certified. A fresh green run on this status head plus the explicit manual review boundary are required before integration.

## Not claimed

- arbitrary-language understanding
- arbitrary CAD generation
- CAD-kernel validation
- manufacturing correctness
- production deployment
- research novelty
- Certified complete
