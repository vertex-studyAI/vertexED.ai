# NPMS source recovery and adverse-control reconciliation — 2026-08-14

**Recovery task:** `NPMS-SOURCE-001`  
**State after recovery:** `SOURCE_RECOVERED / BOUNDED_RESULT_REPRODUCED / REGIME_CLASSIFICATION_PARAMETER_CONFOUNDED_OR_NON_UNIQUE`  
**Scientific boundary:** this recovery does not authorize a new natural/OOD experiment, does not erase known spectral/switching/truncation weaknesses, and does not promote NPMS to externally validated or publication-ready.

## 1. Canonical retained source identity

The fresh invariant-parameter control records its source as:

- Atlas archive SHA-256: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`
- base experiment: `projects/npms/experiment.py`

The exact Library artifact was recovered at:

`/BU1LD Research Atlas/Fresh Runs/2026-08-12/BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`

Observed SHA-256:

`076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`

This exactly matches the invariant-control lineage and the retained Aug-12 reproducibility ledger.

The archive contains the canonical NPMS project under `projects/npms/`, including source, tests, experiment specification, raw reservoir parameters/spectra/results, summary/statistics, figures, limitations, model/dataset cards, manuscript and claim/evidence material.

No external trained-model checkpoint is part of this canonical Atlas NPMS experiment. The absence of such a checkpoint is a boundary on stronger learned-model claims, not evidence that the controlled Atlas source itself is missing.

## 2. Fresh clean replay of the canonical base experiment

The recovered archive was left untouched. A disposable full Atlas copy was run with:

```bash
python3 -m projects.npms.experiment
python3 -m pytest -q projects/npms
```

Result:

- NPMS project tests: `2 passed`;
- regime classification accuracy: `0.9285714285714286`;
- reservoir realizations: `112`;
- within-coordinate spectrum cosine: `0.9959606005706815`;
- between-regime spectrum cosine: `0.9530792787182006`.

The replay reproduced byte-identical key evidence files relative to the retained archive:

- `summary.json` — `2c31fb905367f65a0a1da9abc6867b1abd54a7b30f7a543ac32de81caf942537`;
- `statistical_analysis.json` — `1959046aaf6e38e70ee0ae2435ae19c09eea97e4c8de48d564d46b57dd2f1aba`;
- `reservoir_results.csv` — `dfd6b4ff1948a9d110e4348708f00b7644a995f530acd79971855a17f9d2b025`;
- `raw_reservoir_parameters.csv` — `9f77a5787ba7d77bc306107efe193890d58c585eee672408a020a5eb71a37772`;
- `raw_reservoir_spectra.csv` — `24a5abd11032df182b257493bf81405610dc9423a21fdda2600926d2ae57f3cd`.

This closes the controlled Atlas source-identity and clean-rerun portion of `NPMS-SOURCE-001`.

## 3. Separate historical/derived packages retained

The following archives were recovered but must remain distinct from the canonical Atlas source:

- `npms_repo_bundle.zip` — SHA-256 `67d1eaf21634821b7ec4d87838d48fa13b1fe118b1a0f65d830dd6dd40bd2f6d`; June-4 runnable bundle with a different code path and serialized `npms_model.pkl` checkpoints.
- `npms_repo.zip` — SHA-256 `79af2474dc7d66adc2b306bea9a8ae10e8ba40487f871bfd7309f59c6c509a25`; June-5 compact reservoir/recoverability implementation.
- `npms_prompt5_bundle.zip` — SHA-256 `745afb71e7233f3b8e473ddfabab258ae94d29ec01b758eb0f55b8d3a0378861`; later isolated `MODEL-NPMS` package whose own manifest says its canonical ID is provisional and repository status is `ISOLATED_BUNDLE_NO_PARENT_GIT_REPOSITORY`.

They are useful historical evidence, not substitutes for the source named by the current Atlas control lineage.

## 4. Recovered invariant-parameter adverse control

Library artifact:

`/BU1LD Research Atlas/Fresh Runs/2026-08-13/NPMS_invariant_parameter_control_v1_20260813.zip`

Observed archive SHA-256:

`ad765e342e524c17eb8e93ba1c4098ee07c85f009d94a23151ea263b335e29c2`

Frozen protocol:

`NPMS-INVARIANT-PARAMETER-CONTROL-V1-20260813`

Protocol SHA-256:

`c983e33eb29c5bf0ae7c0fd6e482d5b24bc1e88dd68b3afc417cf2bc42bd1954`

The predeclared decision rule says that if invariant-parameter accuracy is within 5 percentage points of NPMS or higher, the regime-identification evidence is `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.

Retained result:

- NPMS spectrum accuracy: `0.9285714285714286` (`104/112` equivalent);
- invariant parameter summary accuracy: `0.8928571428571429` (`100/112` equivalent);
- difference: `3.57` percentage points in NPMS's favor;
- maximum invariant-feature transform drift: `5.440092820663267e-15`;
- frozen verdict: `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.

## 5. Fresh replay of the adverse control

Using the checksum-matched Atlas V4 root as the importable source, the frozen control's existing `run.py` and `verify.py` were replayed without changing protocol, classifier, features, split, metric or decision rule.

The replay returned the same verdict and stable artifacts:

- `predictions.csv` — `2c2810f6024a2265906071d5ca1661fc4e93b55113181a76afba23ea5cb1d10c`;
- `parameter_features.csv` — `98bae76c483acdab0e6feb2c6a3d8d785db824cede8f3a11fded7d331438a413`;
- `independent_verification.json` — `e81ed09ba23123b36d6d4c173ea83a2899fc1f84c48433f3e930346bbb9cfc63`.

Verifier result: `verified: true`.

Verdict: `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.

## 6. Correct scientific interpretation

Supported within the controlled synthetic reservoir study:

- the NPMS delay-spectrum implementation is reproducible;
- functional spectra are highly stable under the tested coordinate transformations;
- retained controlled results/raw artifacts are recoverable and reproducible.

Not supported by the regime-classification headline:

- that NPMS discovers regime information unavailable from simple coordinate-invariant model parameters.

A compact invariant parameter summary nearly matches the NPMS classifier and falls within the predeclared non-uniqueness threshold. The controlled regime-classification result is therefore parameter-confounded/non-unique.

This adverse control does not automatically invalidate a separate trained RNN/GRU Memory Spectrum Transfer companion experiment; that is a different question and requires its own evidence chain.

## 7. Preserved weaknesses

Do not erase known limitations:

- delay-PCA recovery can be substantially worse than direct/identity recovery;
- multiscale AR spectral recovery remains weak;
- the negative switching regime is poorly recovered;
- matched-eigenvalue scoring can ignore missing/spurious modes;
- mode truncation can mishandle conjugate groups;
- the frequency-response quantity is an autonomous-operator resolvent proxy, not a complete identified input-output transfer function.

## 8. Next gate

`NPMS-SOURCE-001` can close for the canonical controlled Atlas source and base rerun.

Do **not** immediately launch a new natural/OOD experiment.

The next scientific task is only to freeze a separately versioned protocol asking whether a functional memory-spectrum quantity predicts behavior or intervention response beyond strong coordinate-invariant parameter summaries and state-space/spectral controls.

Before any such run, freeze exact source/data/model identities, invariant-parameter baselines, state-space/spectral baselines, missing/spurious-mode-aware metric, conjugate-group intervention rule, seeds, primary metric/uncertainty, compute budget, success criterion, falsifier and no-retuning rule.

Until that exists, preserve NPMS as a reproducible controlled diagnostic with a negative/non-unique classification-mechanism result.
