# T2424-0037 — NLP-to-CAD

A Project 2424 demo that compiles a **controlled natural-language plate description** into:

- a validated parametric geometry specification;
- an SVG preview;
- OpenSCAD source; and
- geometric summary metrics.

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

Alternative form:

```text
panel 100 x 60 thick 4 with 2 holes diameter 8 edge offset 10
```

Unsupported geometry fails closed rather than being guessed.

## Run the demo

```bash
cd portfolio/new-projects/nlp-to-cad
python3 -m http.server 8000
```

Open `http://localhost:8000/web/`.

## Run tests

From the repository root:

```bash
node --test tests/nlpToCad.test.mjs
```

The canonical VertexED suite includes this integration test through the existing root test glob.

## Geometry safety envelope

The compiler currently rejects:

- unsupported object classes;
- missing width/height;
- non-positive dimensions;
- plates larger than 2000 mm in either planar dimension;
- thickness over 200 mm;
- unsupported hole counts;
- holes too large for the plate;
- insets that do not clear the hole radius or fit the plate.

The generated OpenSCAD source contains only numeric `cube`, `translate`, `cylinder`, and `difference` geometry assembled by the compiler. User text is never copied into executable CAD source.

## Files

```text
nlp-to-cad/
├── README.md
├── STATUS.md
├── src/
│   └── core.mjs
└── web/
    ├── index.html
    └── app.mjs
```

Repository integration test:

```text
tests/nlpToCad.test.mjs
```

## Limitations

- one parametric part family only;
- no free-form sketching;
- no STEP/STL export in this package;
- no geometric constraint solver;
- no units besides millimetres;
- no tolerances, materials, fillets, chamfers, slots, threads, or assemblies;
- generated CAD is not certified for manufacturing.

## Next evidence gate

A stronger NLP-to-CAD system should add several predeclared part families, a structured intermediate representation, parser ambiguity tests, geometric validity checks through an actual CAD kernel, and a benchmark of prompts with exact target geometry. Evaluation should score both semantic parse correctness and geometric equivalence—not screenshots alone.
