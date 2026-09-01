# AstroShift — NASA Space Apps 2026 Prebuild

Status: challenge-agnostic prebuild, 2026-08-28

NASA Space Apps 2026 is scheduled for November 14–15, 2026. The 2026 theme is **The Next Frontier**. Final product scope must be chosen only after matching an official challenge statement; do not force Space-JEPA into an unrelated challenge.

## Goal before challenge selection

Build reusable infrastructure that reduces hackathon setup time without pre-answering a challenge that has not been selected.

## Reusable modules

### `data/`
- configurable HTTP/API/file ingestion
- immutable raw-data snapshot support
- checksums + retrieval metadata
- schema inspection
- unit/time-coordinate documentation

### `quality/`
- missingness audit
- duplicate audit
- temporal continuity checks
- range/unit sanity checks
- train/test leakage checks where modeling is used

### `baseline/`
- simple heuristic/statistical baseline
- classical ML baseline where appropriate
- output contract shared with any representation model

### `representation/`
- optional Space-JEPA/model adapter
- disabled unless the selected challenge genuinely benefits from representation learning
- model claims require comparison with simpler baselines

### `uncertainty/`
- empirical error summaries
- out-of-range warning
- no calibrated-probability wording unless calibration is evaluated

### `viz/`
- time series
- map/orbit/trajectory view depending on challenge
- comparison view between observation and prediction/estimate
- source/provenance panel

### `app/`
- one-command local launch
- cached demo dataset so judging is not hostage to a flaky external API
- responsive judge-facing flow

### `evaluation/`
- challenge-specific metric adapter
- deterministic seed support
- machine-readable results

## Challenge-selection scorecard

When official challenge statements are available, score each 0–5:
- fit to real existing technical capability
- access to authoritative data
- ability to create a working product in hackathon time
- measurable evaluation
- human benefit / challenge relevance
- visual demo potential
- differentiation from an ordinary dashboard
- dependency risk

Choose the highest total with a hard requirement of at least one measurable evaluation path.

## Candidate technical directions

These are hypotheses, not predetermined entries:
- sparse/noisy observation robustness
- trajectory or event prediction
- anomaly prioritization
- multimodal observation fusion
- decision support from scientific datasets

Reject a direction if the official challenge does not need it.

## 48-hour execution pattern

### Before event
- toolchain tested
- generic ingestion/provenance modules ready
- generic dashboard skeleton ready
- team roles assigned
- README/demo templates ready

### First 2 hours
- read challenge and judging criteria twice
- define one user and one decision/problem
- inspect data
- freeze MVP and metric

### Hours 2–8
- ingestion + simplest baseline
- first end-to-end output
- decide whether advanced ML is justified

### Hours 8–20
- improve method only if baseline/evaluation warrants it
- build visualization/product layer in parallel

### Hours 20–32
- evaluate
- failure analysis
- reliability/offline-demo path
- accessibility and mobile pass

### Hours 32–40
- story, README, sources, architecture diagram, demo script

### Hours 40–46
- full judge rehearsal
- cut features that can fail
- record backup demo

### Final 2 hours
- submission verification
- links open in incognito
- source attribution
- exact challenge requirements checked

## Minor-participant logistics

Current 2026 Space Apps terms require participants under 18 to be registered by a parent/legal guardian and accompanied during the event. Treat that as a human logistics gate well before November.

## Integrity rules

- never imply NASA endorsement
- cite data sources
- distinguish NASA/partner data from project-generated outputs
- no pretrained-model claim without exact model/version
- no performance claim without evaluation
- no forcing an existing research project into a challenge solely to reuse the name
