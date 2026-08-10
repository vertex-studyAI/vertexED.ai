# T2424-0037 Status

**Project:** NLP-to-CAD  
**Project 2424 ID:** T2424-0037  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING  
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
- [x] explicit scope and safety boundary

## Evidence gate

Move to `TESTED_DEMO` only when canonical GitHub Actions passes on the exact branch head.

Until then, passing-test status is not claimed.

## Not claimed

- arbitrary-language understanding
- arbitrary CAD generation
- CAD-kernel validation
- manufacturing correctness
- production deployment
- research novelty

## Next artifact

Add a structured multi-part benchmark with exact target geometry and CAD-kernel validation before broadening the language or part-family claims.
