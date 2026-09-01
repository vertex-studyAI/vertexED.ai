# NeuroCAD Alpha 0.1 — Product QA

Generated mechanically by `tests/neurocadProductQa.test.mjs`. This is **product QA**, not a scientific/OOD benchmark.

- Total cases: **125**
- Passed: **125**
- Failed: **0**
- Result: **PASS**

| Category | Cases | Passed | Failed |
|---|---:|---:|---:|
| plate | 25 | 25 | 0 |
| tube_cylinder | 20 | 20 | 0 |
| flange_component | 20 | 20 | 0 |
| assembly | 20 | 20 | 0 |
| jet_engine | 20 | 20 | 0 |
| malformed_adversarial | 20 | 20 | 0 |

## Measures

Valid cases require schema validation, non-empty finite OpenSCAD generation, and JSON serialization. Adversarial cases pass only when the system rejects them or returns structured FAIL diagnostics.

## Scope

No result here establishes manufacturing validity, propulsion performance, airworthiness, thermodynamic correctness, structural correctness, or scientific superiority.
