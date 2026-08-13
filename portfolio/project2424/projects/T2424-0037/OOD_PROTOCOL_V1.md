# T2424-0037 NeuroCAD OOD-v1 Protocol

**Frozen before implementation/execution:** 13 August 2026  
**Purpose:** development benchmark only; no arbitrary-language CAD claim.

## Research question

Can a typed-intermediate-representation CAD compiler preserve exact dimensions and fail-closed safety under compositional prompt shifts better than a direct regex-to-OpenSCAD baseline, while supporting two bounded parametric part families?

## Methods frozen before results

### Proposed method — typed IR v2

1. normalize explicitly stated `mm`, `cm`, and `in`/`inch` scalar units to millimetres;
2. classify into one of exactly two supported families:
   - rectangular plate/panel/rectangle/bracket;
   - cylindrical spacer/washer;
3. parse into a typed numeric IR;
4. validate dimensional and geometric constraints before code generation;
5. generate OpenSCAD only from validated numeric fields;
6. never copy free-form user text into executable CAD source.

### Baseline — direct template compiler

A deterministic direct regex-to-OpenSCAD compiler receives the same prompt and unit normalization but does not construct or validate a typed IR before emitting geometry. It may support the same two output templates. This is a meaningful bounded direct-compilation baseline, not a deliberately random baseline.

No learned provider is used in OOD-v1 because no frozen learned provider is available in the repository execution environment. A later learned comparison must use the same provider for both arms.

## Frozen dataset

`benchmark/ood_v1_cases.json` is the immutable development fixture for this protocol. It contains accepted and rejected cases spanning:

- unit conversion (`cm`, inches, mixed explicit units);
- paraphrase and field-order variation;
- hole radius/diameter and margin synonyms;
- a second part family (cylindrical spacer/washer);
- boundary-valid dimensions;
- unsupported families;
- invalid geometry;
- unsafe/injection-like suffixes and instructions.

The benchmark is synthetic and hand-authored. It is not an external natural-language CAD dataset.

## Metrics

For each arm record:

- classification correctness;
- parse/compile success;
- exact IR constraint adherence for accepted cases;
- correct rejection for rejected cases;
- generated-code safety (no user-controlled `include`, `import`, shell-like, or file path content);
- unsafe acceptance count;
- family-wise exact success;
- unit-shift exact success;
- latency in milliseconds (descriptive only on hosted CI).

For typed IR additionally record geometry validity from analytic constraints.

## Frozen primary gates

OOD-v1 is GREEN only if all are true:

1. typed pipeline overall expected-behavior accuracy >= `0.90`;
2. typed accepted-case exact-constraint accuracy >= `0.90`;
3. typed rejected-case correct-rejection rate = `1.00`;
4. typed unsafe acceptance count = `0`;
5. typed generated-code safety rate = `1.00`;
6. typed second-family exact accuracy >= `0.80`;
7. typed unit-shift exact accuracy >= `0.80`;
8. typed overall expected-behavior accuracy exceeds the direct baseline by at least `0.15` absolute.

If the typed pipeline misses any gate, retain the result as negative/inconclusive. Do not alter thresholds or cases after observing the result to rescue the mechanism.

## Claim boundary

A pass establishes only bounded compiler robustness on this frozen synthetic OOD fixture. It does **not** establish arbitrary natural-language CAD, external validity, manufacturing correctness, learned-language understanding, STEP/STL production readiness, or superiority over modern CAD copilots.

## Next gate after OOD-v1

A stronger successor requires an external or independently authored prompt set, a real CAD-kernel execution/geometry check where available, more part families, ambiguity labeling, and—if a learned provider is frozen—the same provider/tool budget for typed-IR and direct-generation arms.
