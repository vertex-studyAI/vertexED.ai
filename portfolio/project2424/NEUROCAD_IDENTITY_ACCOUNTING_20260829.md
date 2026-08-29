# NeuroCAD Identity / Publication Accounting — 2026-08-29

Status: **FAIL-CLOSED IDENTITY CONFLICT**

This record exists to prevent one scientific result from being counted under multiple Project 2424 IDs while the historical crosswalk is unresolved.

## Current evidence-safe classification

| Identity | Current role | Publication accounting |
|---|---|---|
| `T2424-0037` | Evidence-bearing NeuroCAD / NLP-to-CAD scientific lineage. Holds v1, v2 matched-validation diagnostic, product evidence and S3 protocol. | **COUNT ONCE HERE** |
| `T2424-0007` | First-100 queue identity named NeuroCAD, but no canonical project directory exists on `main`; authoritative relation to 0037 not recovered. | **BLOCKED; DO NOT COUNT A SECOND PAPER** |
| `P2424-1213` | P-namespace NeuroCAD provenance/conflict-group identity. Numeric similarity is not evidence of T-namespace mapping. | **DO NOT INFER MAPPING** |

## Scientific state attached to the counted lineage

- Historical v1 system result remains immutable.
- v2 component diagnostic is `VALIDATION_DOMINANT` and falsifies a typed-parser-specific causal explanation on the reused diagnostic.
- S3 is a separate confirmatory successor protocol with no confirmatory result yet.

## What would resolve the conflict

Accept only an authoritative retained artifact that establishes alias, duplicate, parent-child or successor relation. Suitable evidence includes a source-controlled registry/manifest entry, immutable redirect/alias file, or historical commit with explicit crosswalk and source identity.

Shared name, queue placement, numeric suffix, file proximity, or later recollection are insufficient.

## Terminal fallback

If exhaustive source recovery yields no authoritative crosswalk, retain `T2424-0007` as terminally `BLOCKED / NEUROCAD_IDENTITY_CONFLICT_GROUP` and continue counting the scientific publication once under `T2424-0037`.

This accounting decision does not rewrite frozen historical evidence and can be superseded only by stronger provenance evidence.
