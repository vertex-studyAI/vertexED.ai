# PORTFOLIO CANONICALIZATION

**Date:** 2026-08-14  
**Goal:** one canonical identity, evidence boundary and status per serious project. Superseded evidence is archived, never deleted.

## Canonical sources of truth

| Project / family | Canonical source of truth | Decision |
|---|---|---|
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` + control-repo claim/status ledgers | **DISTINCT**. Frozen negative result is canonical; no positive rescue branch may replace it. |
| IRIS | Retained IRIS v0.2 evidence package until canonical source is re-mounted | **DISTINCT**. Current successor is a failed lineage. Any new candidate must be `IRIS-successor-vN` with a changed hypothesis and frozen protocol. |
| Project 2424 | Project registry/foundry as umbrella; each scientific item has its own canonical ID | **PARENT/CHILD**. The umbrella is infrastructure/registry, not one scientific claim. |
| NeuroCAD / NLP-to-CAD | NeuroCAD / `T2424-0037` controlled typed/validated pipeline | **MERGE**. Generic NLP-to-CAD variants are children/older names unless they have a distinct mechanism and falsifier. |
| NGMT / T2424-0025 | `T2424-0025` = precursor robust-readout screen; `NGMT v0.1` = learned B0/B1/B2/B3 experiment | **PARENT/CHILD, NOT EQUIVALENT**. Precursor evidence cannot be used as Transformer evidence. |
| APEN / PEN | APEN retains its own controlled evidence. PEN requires distinct executable source and protocol. | **DISTINCT IF SOURCE EXISTS; OTHERWISE ARCHIVE PEN**. APEN evidence may not be inherited. |
| Eigen-JEPA / FI-JEPA | Eigen-JEPA is the canonical spectral/covariance research line. | **MERGE by default**. FI-JEPA remains separate only if a genuinely different question, mechanism and falsifier are documented. |
| Darcy / T2424-0050 | `T2424-0050` Darcy latent/reduced-resistance line | **DISTINCT**. Benchmark-augmentation utilities are auxiliary, not separate research projects. |
| NPMS | Canonical controlled spectral-memory study | **DISTINCT**. Any renamed spectral-memory variant becomes a child unless it tests a new hypothesis. |
| T2424-0027 | Canonical injected-coordinate/leakage audit | **DISTINCT**. Real-encoder extension is a versioned successor experiment, not a new project name. |
| T2424-1863 | Canonical local-diffusion negative screen | **DISTINCT NEGATIVE RESULT**. Real-PDE successor must be versioned separately. |
| Percy | Canonical orchestration/evidence system | **DISTINCT**. Logical-agent registries, workers, verifier agents and paper agents are components, not independent projects. |
| Research Atlas V4 | Reproducibility/package layer supporting research lines | **PARENT/CHILD infrastructure** under Percy/research operations, not an independent scientific claim by default. |
| VertexED | `vertex-studyAI/vertexED.ai` | **DISTINCT PRODUCT**. Source and production states remain separate. |
| FinanceMeta | `build-the-future-11/finance4all-global-reach` when writable access is restored | **DISTINCT PRODUCT**. No duplicate control-repo copy becomes canonical. |
| The Bu1LD | `ryangomez010/bu1ld-landing` plus explicitly approved private platform repos when access is restored | **DISTINCT PRODUCT**. Control-repo patches are recovery artifacts, not canonical production source. |
| Hercules | No canonical benchmarked source recovered in current evidence surface | **ARCHIVE ONE FAMILY**. Do not create multiple Hercules repos/variants. Reactivate only around one bounded experiment. |
| Olympus | O0 roadmap/runtime only | **ARCHIVE ONE FAMILY**. Prometheus/Perseus/Atlas/Kronos scale names are roadmap children, not separate validated projects. |
| Text-to-Video | `vertex-studyAI/Text-To-Video` | **ARCHIVE/UNTRIAGED** until a precise question, evaluation and evidence package exist. |

## Strong-overlap semantic graph

```text
Project 2424 (registry/foundry)
├── T2424-0025 robust readout precursor
│   └── NGMT v0.1 learned successor [negative]
├── T2424-0027 leakage audit
│   └── real-encoder extension [future frozen successor]
├── T2424-0037 NeuroCAD
│   └── generic NLP-to-CAD variants [merge/archive unless distinct falsifier]
├── T2424-0050 Darcy
├── T2424-1863 local diffusion [negative]
├── T2424-0028 residual events
└── T2424-0029 PDE transitions

JEPA / representation family
├── LAM-JEPA [frozen negative]
├── Eigen-JEPA [mixed/negative]
│   └── FI-JEPA [merge by default]
└── future JEPA×time-series program [one question only; not yet promoted]

Memory family
├── IRIS v0.2 [current successor failed gate]
├── APEN [controlled mixed]
├── PEN [source-blocked; may not inherit APEN]
├── NPMS [controlled]
└── NGMT v0.1 [negative]

Research operations
├── Percy
├── Research Atlas V4
└── Project 2424 foundry
```

## Status conflict rules

1. **Newer artifact with stronger provenance wins**, provided it does not rewrite a frozen result.
2. A GitHub/main closeout that cites exact commits, workflow IDs and artifact hashes outranks an older Library status copy.
3. A negative experiment remains negative even if a later roadmap calls the family “flagship.”
4. A source-green product is not production-green.
5. A historical queue snapshot is not current runtime state.
6. Project-count or logical-agent-count records are registry facts, not execution or scientific maturity.
7. Successor experiments must preserve parent failures and use a new version/protocol identifier.

## Canonicalization decisions requiring no further compute

- **MERGE:** NLP-to-CAD → NeuroCAD unless a distinct falsifier exists.
- **MERGE:** FI-JEPA → Eigen-JEPA unless a distinct scientific question exists.
- **PARENT/CHILD:** T2424-0025 precursor → NGMT learned line; evidence remains explicitly non-transferable.
- **PARENT/CHILD:** Project 2424 umbrella → surviving scientific IDs.
- **PARENT/CHILD:** Percy → verifier/dedup/reproducibility/paper-generation components.
- **ARCHIVE:** broad Hercules/Olympus scale variants for the next month.
- **ARCHIVE:** duplicate Project 2424 names or architecture variants without new hypotheses.
- **DISTINCT:** LAM-JEPA, IRIS, NeuroCAD, Darcy, APEN, NPMS, Eigen-JEPA, T2424-0027, VertexED, FinanceMeta, The Bu1LD.

## Provenance preservation

Superseded status files, failed experiments, prior seeds, abandoned branches and negative results must be retained with their original timestamps/commit hashes. Canonicalization changes lookup and priority; it does not erase history.
