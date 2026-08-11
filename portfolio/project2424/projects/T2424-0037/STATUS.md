# T2424-0037 Status

**Project:** NLP-to-CAD  
**Project 2424 ID:** T2424-0037  
**Queue rank:** 30  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING / CANONICAL_RECOVERY_CI_PENDING  
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

## Provenance

Legacy implementation head `e06c91133dcc16f9e1846dde9b6908a0c64d16bc` passed canonical CI run `31410049687`. That evidence applies to the legacy head only. This canonical recovery requires a fresh exact-head CI run.

## Promotion gate

Move to `TESTED_DEMO` only when canonical GitHub Actions passes on the exact canonical recovery head. This is not nine-gate certification.

## Not claimed

- arbitrary-language understanding
- arbitrary CAD generation
- CAD-kernel validation
- manufacturing correctness
- production deployment
- research novelty
- Certified complete
