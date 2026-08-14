# NPMS source recovery and adverse-control reconciliation — 2026-08-14

**Recovery task:** `NPMS-SOURCE-001`  
**State:** `SOURCE_RECOVERED / CONTROLLED_RESULT_REPRODUCED / PARAMETER_CONFOUNDED_OR_NON_UNIQUE`  
**Boundary:** no new natural/OOD experiment is authorized by this recovery.

## Canonical controlled Atlas source

Recovered retained source:

- Library artifact: `/BU1LD Research Atlas/Fresh Runs/2026-08-12/BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`
- archive SHA-256: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`
- canonical project path: `projects/npms/experiment.py`
- retained checksum manifest independently confirms that archive digest.

A disposable clean replay of the controlled Atlas project preserved the source archive and returned:

- project tests: `2 passed`;
- regime classification accuracy: `0.9285714285714286`;
- reservoir realizations: `112`;
- within-coordinate spectrum cosine: `0.9959606005706815`;
- between-regime spectrum cosine: `0.9530792787182006`.

Key base evidence reproduced byte-identically in the recovery lane, including summary/statistics and raw reservoir artifacts.

Historical `npms_repo_bundle.zip`, `npms_repo.zip`, and `npms_prompt5_bundle.zip` remain distinct historical/derived packages. They are not silently substituted for the checksum-matched Atlas source.

## Frozen invariant-parameter adverse control

Retained experiment: `NPMS-INVARIANT-PARAMETER-CONTROL-V1-20260813`  
Protocol SHA-256: `c983e33eb29c5bf0ae7c0fd6e482d5b24bc1e88dd68b3afc417cf2bc42bd1954`

Frozen decision rule: if a coordinate-invariant parameter-summary baseline is within 5 percentage points of NPMS or higher under the same split, classify the regime-identification result as non-unique/parameter-confounded.

Retained and independently replayed result:

- NPMS spectrum accuracy: `0.9285714285714286` (`92.86%`);
- invariant parameter-summary accuracy: `0.8928571428571429` (`89.29%`);
- gap: `3.57142857142857` percentage points;
- evaluations: `112`;
- verdict: `PARAMETER_CONFOUNDED_OR_NON_UNIQUE`.

Stable retained hashes include:

- predictions: `2c2810f6024a2265906071d5ca1661fc4e93b55113181a76afba23ea5cb1d10c`;
- parameter features: `98bae76c483acdab0e6feb2c6a3d8d785db824cede8f3a11fded7d331438a413`;
- independent verification: `e81ed09ba23123b36d6d4c173ea83a2899fc1f84c48433f3e930346bbb9cfc63`.

## Scientific interpretation

Supported within the controlled synthetic reservoir study:

- the NPMS delay-spectrum implementation is reproducible;
- functional spectra are stable under the tested coordinate transformations;
- the controlled source/results are recoverable with retained provenance.

Not supported by the regime-classification headline:

- that NPMS reveals regime information unavailable from simple coordinate-invariant reservoir parameters.

The strong invariant-parameter control nearly matches NPMS and falls inside the predeclared 5-point non-uniqueness boundary. The correct mechanism-level classification is therefore **parameter-confounded/non-unique**, not superiority.

This does not automatically invalidate a separate trained RNN/GRU Memory Spectrum Transfer companion experiment; that is a different claim and requires its own evidence chain.

## Preserved limitations

Keep visible:

- delay-PCA recovery weakness;
- multiscale AR weakness;
- poor negative switching-regime recovery;
- missing/spurious-mode sensitivity;
- conjugate-group truncation concerns;
- resolvent-proxy limitation versus a fully identified input-output transfer function.

## Next gate

`NPMS-SOURCE-001` is closed for the controlled Atlas source.

Do **not** launch a natural/OOD successor immediately. First freeze a separate versioned protocol testing whether a functional memory-spectrum quantity predicts behavior or intervention response beyond strong coordinate-invariant parameter summaries and strong state-space/spectral controls. Freeze source/checkpoint identities, task/splits, baselines, mode-aware metric, seeds, uncertainty, compute budget, success criterion, falsifier and no-retuning rule before execution.
