# T2424-0027 Real-Encoder Gate — v1 Feasibility Failure

Protocol: `T2424-0027-REAL-ENCODER-GATE-v1`

State: **FAILED BEFORE ENCODER OUTCOME ACCESS**

GitHub Actions run `33258014658`, job `99114992140`, first validated the frozen manifest and passed all 8 preregistration-lock tests. Dataset materialization then failed before the sentence-transformer was loaded because the v1 sampling rule required 20 examples per locale-intent cell and MASSIVE contains only 18 train examples for `('en-US', 'audio_volume_other')` at the pinned dataset revision.

Failure trace:

```text
RuntimeError: Cell ('en-US', 'audio_volume_other') has 18 rows; protocol requires 20.
```

Retained failed-run artifact:

- artifact ID: `9716423869`
- artifact ZIP SHA-256: `77690038ee0366bac7ae81d60d3138387bb2a0f13f91986ac993595bbee3f65f`

The run generated no encoder embeddings, no probe accuracies, no transform comparisons, and no mechanism verdict. Therefore changing only the infeasible sampling cardinality in a separately versioned successor protocol is a feasibility repair, not outcome-driven tuning.

## Versioning decision

v1 remains immutable and is archived as `manifest_v1_failed_feasibility.json`.

v2 changes only the per-locale/intent sampling cardinality from 20 to 15 per split. It keeps unchanged:

- pinned dataset revision;
- pinned encoder revision;
- locales and split roles;
- five seeds;
- no-fine-tuning rule;
- primary nearest-centroid probes;
- all four controls;
- every scientific metric;
- every success threshold;
- every scientific falsifier;
- no-hyperparameter-search rule;
- artifact/provenance requirements.

Any further scientifically material protocol change after v2 outcome access requires a new versioned protocol rather than editing v2.
