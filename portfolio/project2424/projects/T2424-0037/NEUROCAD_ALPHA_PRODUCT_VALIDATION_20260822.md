# NeuroCAD Alpha 0.1 — Product Validation — 2026-08-22

This file records **product QA**, not a new scientific/OOD benchmark. It does not alter the frozen NeuroCAD v1 result or the 2026-08-14 component-ablation verdict.

## Focused JavaScript QA

```bash
node --test \
  tests/nlpToCad.test.mjs \
  tests/neurocadAlpha.test.mjs \
  tests/neurocadWeb.test.mjs
```

Local result during Alpha implementation: **21/21 PASS**.

Coverage includes historical plate behavior, PR #410-equivalent direct-spec hardening, source-injection-shaped geometry rejection, hole bounds/overlap/unit/count checks, conceptual engine stage extrema, shaft/casing and ratio constraints, non-finite rejection, stateful follow-ups, finite SCAD/JSON generation, flanged-tube and legacy-plate adaptation, cyclic-assembly diagnostics, unsupported-prompt fail-closed behavior, and browser no-`eval`/`Function`/raw-HTML regressions.

## Deterministic jet-engine configurations

All seven configurations passed `validateCADDocument()` before export.

| Case | Configuration | Validation | Objects | Assemblies |
|---|---|---:|---:|---:|
| J1 | 5 compressor / 1 turbine | PASS | 18 | 12 |
| J2 | 8 compressor / 2 turbine | PASS | 25 | 16 |
| J3 | 3 compressor / 3 turbine | PASS | 16 | 12 |
| J4 | max stages: 12 compressor / 4 turbine | PASS | 35 | 22 |
| J5 | minimum length/diameter envelope + 3/1 stages | PASS | 14 | 10 |
| J6 | casing hidden | PASS | 21 | 14 |
| J7 | exploded spacing 70 mm | PASS | 21 | 14 |

## Real OpenSCAD execution

Environment available during local verification: `/usr/bin/openscad`.

Each J1–J7 generated `.scad` source was passed through OpenSCAD and produced a non-empty STL file.

| Case | STL bytes | SHA-256 |
|---|---:|---|
| J1 | 1,547,706 | `7f14ac217c52c82f97833d3e9e6c8371ad55320579a8efde34172354f08598da` |
| J2 | 2,329,682 | `42c7afa30415cc873505c6f1813f9f5fc30e900db1e787f86da2258fc139c402` |
| J3 | 1,304,741 | `a76680419eb722242f5a8f97199c19b3f05f7765d0387ff2fcfa0c2400b33800` |
| J4 | 3,453,887 | `cf1c380cacd72ca2ea67151fc02a1aabd6aea26d7806e9fb52df59c7f5d8fd92` |
| J5 | 1,117,078 | `37ca263c4a7e29b2db3efd7befca4484598a2358837b74b5628de2e693646c62` |
| J6 | 1,663,658 | `72e45f8bc03327bdb59b2d576824d1c84eae5f2832def0e0d644f10b6f9a45f7` |
| J7 | 1,919,746 | `711ba513d6fd9d88f06da3a9206f77c7ce83a917af67704d4117c9955448739d` |

### Important retained warning

OpenSCAD emitted:

```text
WARNING: Object may not be a valid 2-manifold and may need repair!
EXPORT-WARNING: Exported object may not be a valid 2-manifold and may need repair
```

Therefore this QA establishes that the generated OpenSCAD is executable and can produce non-empty STL artifacts for these configurations. It **does not** establish manifold/manufacturing-valid STL geometry. Browser Alpha intentionally exposes CADSpec JSON and `.scad`, not an STL button.

## Browser status

The browser source is syntax-checked/static-tested and served by the documented local HTTP path. A full interactive browser smoke (WebGL + pinned Three.js CDN) remains a separate gate until performed in an actual browser environment.

## Research boundary

Still preserved and unchanged:

- frozen held-out v1: typed + validated `0.95` overall vs original direct `0.60`, including preserved O018 negative-width failure;
- later component diagnostic: typed + validated `1.00`, direct + matched validation `1.00`, original direct `0.60`;
- `validation_recovery_fraction = 1.00`;
- frozen interpretation: `VALIDATION_DOMINANT`.
