# T2424-0037 — NLP-to-CAD

A Project 2424 demo that compiles a **controlled natural-language rectangular part description** into a validated parametric geometry specification, SVG preview, OpenSCAD source, and geometric summary metrics.

The architecture is deliberately explicit:

```text
natural language
→ controlled parser
→ normalized parametric IR
→ geometry/safety validation
→ OpenSCAD + SVG
→ optional OpenSCAD kernel compilation
```

The scope is narrow on purpose. This is not a general natural-language CAD model and does not claim to infer arbitrary engineering intent.

## Supported grammar

Current prompts describe rectangular plates, panels, brackets, rectangles, or blocks with:

- width × height in millimetres;
- optional labelled thickness (default 3 mm);
- rectangular `width × height × thickness` triads;
- optional 1, 2, or 4 circular holes;
- numeric or `one` / `two` / `four` hole counts;
- hole radius or diameter;
- optional edge inset.

Examples:

```text
Create a 40 mm × 30 mm × 10 mm rectangular block.
plate 80 by 40 thickness 3 with 4 holes radius 2 inset 6
panel 100 x 60 thick 4 with 2 holes diameter 8 edge offset 10
```

Unsupported geometry fails closed rather than being guessed. Code-like prompt fragments are rejected before CAD generation, and user text is never interpolated into executable OpenSCAD source.

## Run the browser demo

```bash
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Open `http://localhost:8000/web/`.

## Run focused tests

```bash
node --test tests/nlpToCad.test.mjs tests/nlpToCadBenchmark.test.mjs
```

## Run the benchmark/evaluator

```bash
node portfolio/project2424/projects/T2424-0037/experiment/evaluate.mjs
```

The evaluator uses the frozen 26-prompt set in `benchmark/cases.mjs` and compares three deterministic architectures:

1. exact-template direct emission;
2. direct regex-to-OpenSCAD emission;
3. validated structured-IR compilation.

It reports accept/reject accuracy, static CAD-source validity, exact constraint adherence and unsafe acceptances. When `openscad` is installed, it additionally attempts STL compilation for every expected-valid structured-IR case.

## Current bounded local evidence

See `RESULTS_20260812.md`.

In the 12 August local run, the structured-IR path cleared all 26 frozen decisions and all 14 expected-valid geometry targets with zero unsafe acceptances. The direct-regex baseline was materially weaker on the same authored benchmark. OpenSCAD 2021.01 compiled 14/14 expected-valid structured-IR outputs to STL in that local environment.

These results are a controlled engineering screen, not an independent or preregistered scientific result. Canonical GitHub Actions must revalidate the changed branch head before repository-level tested status is refreshed.

## Assets

- `assets/reference_plate.scad` — deterministic generated OpenSCAD reference;
- `assets/reference_plate.svg` — deterministic browser-safe geometry preview.

A local STL was also generated successfully during the 12 August execution, but binary output is not used as the source-of-truth evidence artifact here.

## Safety envelope

The compiler rejects unsupported object classes, missing/non-positive dimensions, plates over 2000 mm in either planar dimension, thickness over 200 mm, unsupported hole counts, oversized holes, invalid insets, missing hole sizes, and code-like prompt fragments. Generated OpenSCAD is assembled only from numeric `cube`, `translate`, `cylinder`, and `difference` geometry.

## Failure taxonomy

- unsupported geometry family;
- underspecified prompt;
- invalid constraint;
- safety-envelope/code-like input;
- parser-coverage mismatch;
- accepted geometry that does not satisfy the requested target.

## Limitations

- one rectangular solid/plate family;
- cylinders are deliberately present in the benchmark as unsupported-family cases, not silently approximated;
- no free-form sketching;
- no native STEP export in this package;
- no general geometric constraint solver;
- millimetres only;
- no tolerances, materials, fillets, chamfers, slots, threads, or assemblies;
- no manufacturing certification;
- deterministic baselines only; no language-model baseline yet;
- benchmark and compiler were developed together, so current comparison is not an unbiased external generalization test.

## Research hypothesis

A structured intermediate representation with explicit validation should improve geometric constraint adherence and fail-closed behavior relative to direct code emission under equivalent controlled prompts.

The current authored benchmark is a first mechanism screen for that hypothesis. A paper-level claim requires an independently authored held-out prompt set, stronger direct code-generation baseline, more geometry families, CAD-kernel-derived equivalence checks and clean reproduction.

## Provenance

Recovered from legacy exact-head-green implementation `e06c91133dcc16f9e1846dde9b6908a0c64d16bc`, canonical CI run `31410049687`, then moved into the frozen First-100 identity path. The current branch now contains additional benchmark/evaluator work and therefore requires fresh exact-head CI before its status can be promoted again.
