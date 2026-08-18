# Bu1LD Research Stack — 0.1 Preview

A small, truth-bounded preview of a research workflow that separates planning, implementation, reproduction, benchmarking, audit, provenance and public evidence.

## Components

- **ATHENA**: machine-readable research-plan contract (`research_plan.schema.json`).
- **LEGO-ML**: typed component registry and semantic tensor-interface validation (`lego_ml/`).
- **FORGE**: bounded experiment runner that records command, environment, exit status and artifact hashes (`forge.py`).
- **CRUCIBLE**: benchmark contract (`crucible.py`).
- **ARGUS**: audit schema for claims, counterevidence, confounds and reproduction status (`argus_audit.schema.json`).
- **LATTICE**: evidence/provenance graph seed (`lattice.json`).
- **ATLAS**: public evidence catalogue (`ATLAS.md`).

## LEGO-ML smoke

```bash
python -m unittest discover -s tests -v
python -m lego_ml.cli list
python -m lego_ml.cli validate examples/vision_jepa.json
python -m lego_ml.cli validate examples/time_series_memory.json
python -m lego_ml.cli validate examples/scientific_field.json
```

This preview validates component/interface composition; it is **not** a claim that the example ML models have been scientifically trained or benchmarked.

## Integrity boundaries

- Do not train Darcy T2424-0050 until every pre-outcome gate is closed and training is explicitly authorized.
- Do not access or regenerate protected IRIS trajectories/seeds outside the frozen protocol.
- Do not rescue-tune frozen negative or mixed results (LAM-JEPA, NPMS, Eigen-JEPA, NGMT, NeuroCAD mechanism, T2424-1863).
- A green software test is not a green scientific claim.
