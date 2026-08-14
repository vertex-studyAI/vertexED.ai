# NPMS source recovery and adverse-control reconciliation — 2026-08-14

**Recovery task:** `NPMS-SOURCE-001`  
**State:** `SOURCE_RECOVERED / BOUNDED_RESULT_REPRODUCED / REGIME_CLASSIFICATION_PARAMETER_CONFOUNDED_OR_NON_UNIQUE`

This record changes no previously frozen NPMS result and authorizes no new natural/OOD experiment.

## Canonical controlled source

Recovered Library artifact:

`/BU1LD Research Atlas/Fresh Runs/2026-08-12/BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`

SHA-256:

`076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`

Canonical base experiment:

`projects/npms/experiment.py`

The archive contains source, project test, experiment specification, raw reservoir parameter/spectrum/result tables, statistics, figures, limitations, manuscript and claim/evidence material.

## Fresh clean replay

The archive was left immutable. A disposable full Atlas copy was run with:

```bash
python3 -m projects.npms.experiment
python3 -m pytest -q projects/npms
```

Result:

- tests: `2 passed`;
- regime classification accuracy: `0.9285714285714286`;
- reservoir realizations: `112`;
- within-coordinate spectrum cosine: `0.9959606005706815`;
- between-regime spectrum cosine: `0.9530792787182006`.

Key retained files reproduced byte-identically:

- `summary.json` — `2c31fb905367f65a0a1da9abc6867b1abd54a7b30f7a543ac32de81caf942537`;
- `statistical_analysis.json` — `1959046aaf6e38e70ee0ae2435ae19c09eea97e4c8de48d564d46b57dd2f1aba`;
- `reservoir_results.csv` — `dfd6b4ff1948a9d110e4348708f00b7644a995f530acd79971855a17f9d2b025`;
- `raw_reservoir_parameters.csv` — `9f77a5787ba7d77bc306107efe193890d58c585eee672408a020a5eb71a37772`;
- `raw_reservoir_spectra.csv` — `24a5abd11032df182b257493bf81405610dc9423a21fdda2600926d2ae57f3cd`.

## Historical/derived packages kept separate

- `npms_repo_bundle.zip` — SHA-256 `67d1eaf21634821b7ec4d87838d48fa13b1fe118b1a0f65d830dd6dd40bd2f6d`;
- `npms_repo.zip` — SHA-256 `79af2474dc7d66adc2b306bea9a8ae10e8ba40487f871bfd7309f59c6c509a25`;
- `npms_prompt5_bundle.zip` — SHA-256 `745afb71e7233f3b8e473ddfabab258ae94d29ec01b758eb0f55b8d3a0378861`.

These are useful historical/derived evidence but are not substituted for the Atlas source named by the current control lineage.

## Frozen invariant-parameter adverse control

Library artifact:

`/BU1LD Research Atlas/Fresh Runs/2026-08-13/NPMS_invariant_parameter_control_v1_20260813.zip`

Archive SHA-256:

`ad765e342e524c17eb8e93ba1c4098ee07c85f009d94a23151ea263b335e29c2`

Protocol:

`NPMS-INVARIANT-PARAMETER-CONTROL-V1-20260813`

Protocol SHA-256:

`c983e33eb29c5bf0ae7c0fd6e482d5b24bc1e88dd68b3afc417cf2bc42bd1954`

Predeclared decision rule: if invariant-parameter accuracy is within 5 percentage points of NPMS or higher, classify the regime-identification evidence as `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.

Retained result:

- NPMS spectrum accuracy: `0.9285714285714286` (`104/112` equivalent);
- invariant-parameter accuracy: `0.8928571428571429` (`100/112` equivalent);
- NPMS advantage: `3.57` percentage points;
- maximum invariant-feature transform drift: `5.440092820663267e-15`;
- verdict: `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.

Fresh replay from the checksum-matched Atlas source returned the same verdict and stable evidence hashes:

- `predictions.csv` — `2c2810f6024a2265906071d5ca1661fc4e93b55113181a76afba23ea5cb1d10c`;
- `parameter_features.csv` — `98bae76c483acdab0e6feb2c6a3d8d785db824cede8f3a11fded7d331438a413`;
- `independent_verification.json` — `e81ed09ba23123b36d6d4c173ea83a2899fc1f84c48433f3e930346bbb9cfc63`;
- verifier: `verified: true`.

## Scientific interpretation

Supported within the controlled synthetic reservoir study:

- the NPMS delay-spectrum implementation is reproducible;
- the tested spectrum is highly stable under the specified coordinate transformations;
- retained raw/processed artifacts are recoverable and replayable.

Not supported by the regime-classification headline:

- that NPMS discovers regime information unavailable from simple coordinate-invariant model parameters.

The parameter summary nearly matches the NPMS classifier and lies inside the predeclared non-uniqueness band. The correct mechanism interpretation is therefore parameter-confounded/non-unique.

Preserve the existing limitations: delay-PCA weakness, multiscale AR weakness, poor switching-regime recovery, missing/spurious-mode scoring issues, conjugate-group/truncation issues, and the autonomous-operator resolvent-proxy boundary.

## Next gate

`NPMS-SOURCE-001` is closed for the controlled Atlas source. No natural/OOD run is authorized.

A successor requires a **new frozen protocol** asking whether a memory-spectrum quantity predicts behavior or intervention response beyond strong coordinate-invariant parameter summaries and strong state-space/spectral controls, with exact source/data/model identities, splits, seeds, metrics, uncertainty, compute cap, success criterion and falsifier fixed before execution.
