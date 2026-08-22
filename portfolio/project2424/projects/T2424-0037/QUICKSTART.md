# NeuroCAD Alpha 0.1 — Quickstart

## Browser demo

From the repository root:

```bash
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Open `http://localhost:8000/web/`.

The 3D viewer uses the version-pinned Three.js browser modules declared in `web/index.html`, so that viewport needs network access to the pinned CDN. The CAD core, validation and exporters are local JavaScript modules.

## Focused tests

```bash
node --test \
  tests/nlpToCad.test.mjs \
  tests/neurocadAlpha.test.mjs \
  tests/neurocadWeb.test.mjs
```

## Existing frozen research gates

```bash
node portfolio/project2424/projects/T2424-0037/benchmark/ood_evaluate.mjs
node --test tests/nlpToCadOodBenchmark.test.mjs
```

With OpenSCAD installed:

```bash
node portfolio/project2424/projects/T2424-0037/benchmark/kernel_verify.mjs /tmp/neurocad-kernel
```

These historical research workflows remain distinct from Alpha product QA.
