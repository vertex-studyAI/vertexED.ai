# T2424-0037 — NeuroCAD / Controlled NLP-to-CAD

A Project 2424 controlled compiler that converts a **bounded natural-language rectangular-plate description** into a typed parametric geometry specification, SVG preview, OpenSCAD source, and geometric summary metrics.

The scope is intentionally narrow. This is not a general natural-language CAD model and does not claim to infer arbitrary engineering intent.

## Current evidence state

**GREEN — controlled benchmark complete + held-out linguistic-template gate passed + executable CAD backend verified.**

This GREEN status is claim-specific. The project remains **not externally validated, not general part-family OOD, not a learned-model superiority result, and not research-complete**.

### Original controlled benchmark

The frozen 20-case deterministic benchmark passes 20/20 with reported syntax/source generation, geometry validity, dimension accuracy, and constraint satisfaction all equal to 1.0 on that controlled set.

### Held-out template benchmark v1

The method and benchmark were frozen before first execution. Across 20 fixed held-out linguistic-template cases:

| System | Valid exact geometry | Invalid rejection | Overall success |
|---|---:|---:|---:|
| Typed/validated compiler | **1.000** | **0.875** | **0.950** |
| Direct flat extraction | 1.000 | 0.000 | 0.600 |

The +0.350 overall delta exceeds the pre-frozen +0.150 development threshold. One adverse case is retained: `plate -50 by 40 thickness 3` is unexpectedly accepted. It is deliberately **not patched into the v1 result**.

The full frozen protocol and result are in:

- [`OOD_PROTOCOL.md`](./OOD_PROTOCOL.md)
- [`benchmark/OOD_RESULTS.md`](./benchmark/OOD_RESULTS.md)

### Real OpenSCAD execution

All 12 valid held-out cases generated non-empty STL outputs through OpenSCAD 2021.01 in CI: **12/12 passed**.

This establishes executable CAD generation for the tested plate family. It does not establish manufacturing correctness, arbitrary topology handling, or richer CAD editability.

## Supported grammar

Current prompts describe rectangular plates, panels, brackets, or rectangles with:

- width × height in millimetres;
- optional thickness (default 3 mm);
- optional 1, 2, or 4 circular holes;
- hole radius or diameter;
- optional edge inset/margin/edge offset.

Example:

```text
plate 80 by 40 thickness 3 with 4 holes radius 2 inset 6
```

Unsupported geometry fails closed where covered by the current validation rules. The retained negative-width OOD failure shows that this fail-closed behavior is not yet universal.

## Run the demo

```bash
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Open `http://localhost:8000/web/`.

## Run the controlled benchmark

```bash
node portfolio/project2424/projects/T2424-0037/benchmark/run.mjs
node --test tests/nlpToCad.test.mjs tests/nlpToCadBenchmark.test.mjs
```

## Run the frozen held-out-template benchmark

```bash
node portfolio/project2424/projects/T2424-0037/benchmark/ood_evaluate.mjs
node --test tests/nlpToCadOodBenchmark.test.mjs
```

The evaluator reports a scientific `PASS_...` or `FAIL_...` verdict. A negative verdict must be retained rather than tuned away.

## Run real CAD backend verification

With OpenSCAD installed:

```bash
node portfolio/project2424/projects/T2424-0037/benchmark/kernel_verify.mjs /tmp/neurocad-kernel
```

The CI workflow `.github/workflows/neurocad-ood-benchmark.yml` installs OpenSCAD, executes the frozen valid cases, and uploads raw JSON plus SCAD/STL artifacts.

## Safety envelope

The compiler rejects unsupported object classes, missing/non-positive dimensions when correctly parsed, plates over 2000 mm in either planar dimension, thickness over 200 mm, unsupported hole counts, oversized holes, and invalid insets. Generated OpenSCAD is assembled only from numeric `cube`, `translate`, `cylinder`, and `difference` geometry; user text is never copied into executable CAD source.

Known v1 parser defect: a leading negative width can be skipped by the dimension regex in the held-out case `O018`. Preserve that result; fix only in a separately versioned follow-up.

## Evidence provenance

Latest held-out + CAD-kernel evidence:

- GitHub Actions run: `31659488587`;
- artifact: `9165650301`;
- artifact digest: `sha256:753a394de4bdced76fd6e1f21419d12cf13fc872691238655b04341193e6cd6d`;
- Node `v22.23.1`;
- npm `10.9.8`;
- OpenSCAD `2021.01`.

The earlier Project 2424 frozen rerun also independently retained the original T2424-0037 controlled benchmark as 20/20 with focused tests passing.

## Limitations / next evidence gate

- one parametric part family;
- no free-form sketching;
- no model-provider/LLM baseline in this package;
- no STEP/B-rep editability validation;
- no general geometric constraint solver;
- millimetres only;
- no tolerances, materials, fillets, chamfers, slots, threads, or assemblies;
- no manufacturing certification;
- no external benchmark or independent third-party replication.

Next scientific family should be frozen separately and target genuinely new part families, a strong model-based direct-generation baseline, richer CAD-kernel/topology checks, and editability/reopen validation.
