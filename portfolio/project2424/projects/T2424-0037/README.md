# T2424-0037 — NLP-to-CAD

A Project 2424 demo that compiles a **controlled natural-language plate description** into a validated parametric geometry specification, SVG preview, OpenSCAD source, and geometric summary metrics.

The scope is intentionally narrow. This is not a general natural-language CAD model and does not claim to infer arbitrary engineering intent.

## Supported grammar

Current prompts describe rectangular plates, panels, brackets, or rectangles with:

- width × height in millimetres;
- optional thickness (default 3 mm);
- optional 1, 2, or 4 circular holes;
- hole radius or diameter;
- optional edge inset.

Example:

```text
plate 80 by 40 thickness 3 with 4 holes radius 2 inset 6
```

Unsupported geometry fails closed rather than being guessed.

## Run the demo

```bash
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Open `http://localhost:8000/web/`.

## Run tests

```bash
node --test tests/nlpToCad.test.mjs
```

## Safety envelope

The compiler rejects unsupported object classes, missing/non-positive dimensions, plates over 2000 mm in either planar dimension, thickness over 200 mm, unsupported hole counts, oversized holes, and invalid insets. Generated OpenSCAD is assembled only from numeric `cube`, `translate`, `cylinder`, and `difference` geometry; user text is never copied into executable CAD source.

## Limitations

- one parametric part family;
- no free-form sketching;
- no STEP/STL export in this package;
- no geometric constraint solver;
- millimetres only;
- no tolerances, materials, fillets, chamfers, slots, threads, or assemblies;
- no manufacturing certification.

## Provenance

Recovered from legacy exact-head-green implementation `e06c91133dcc16f9e1846dde9b6908a0c64d16bc`, canonical CI run `31410049687`, then moved into the frozen First-100 identity path on current `main` for fresh exact-head verification.

## Next evidence gate

Add several predeclared part families, a structured intermediate representation, ambiguity tests, geometric validity checks through a real CAD kernel, and a prompt benchmark with exact target geometry.
